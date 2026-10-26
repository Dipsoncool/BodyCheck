"""
Evaluator for Clinical Colorimetric ML & Delta Reticle Extraction.
Tests all 8 real POC image pairs in public/images/body-check/ using CIE-Lab and Hemodynamic Signatures.
"""

import os
import glob
import numpy as np
from PIL import Image

def rgb_to_lab(rgb_arr):
    """Accurate sRGB to CIE-L*a*b* conversion."""
    # rgb_arr in [0, 1]
    r, g, b = rgb_arr[..., 0], rgb_arr[..., 1], rgb_arr[..., 2]

    # Gamma inversion
    r = np.where(r > 0.04045, ((r + 0.055) / 1.055) ** 2.4, r / 12.92)
    g = np.where(g > 0.04045, ((g + 0.055) / 1.055) ** 2.4, g / 12.92)
    b = np.where(b > 0.04045, ((b + 0.055) / 1.055) ** 2.4, b / 12.92)

    # sRGB to XYZ (D65)
    X = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047
    Y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.00000
    Z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883

    def f(t):
        return np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16.0 / 116.0)

    fx, fy, fz = f(X), f(Y), f(Z)
    L = np.maximum(0, 116.0 * fy - 16.0)
    a = 500.0 * (fx - fy)
    b_val = 200.0 * (fy - fz)

    return np.stack([L, a, b_val], axis=-1)

def evaluate_image_pair(ref_path, rev_path):
    img_ref = Image.open(ref_path).convert('RGB').resize((256, 256), Image.Resampling.BILINEAR)
    img_rev = Image.open(rev_path).convert('RGB').resize((256, 256), Image.Resampling.BILINEAR)

    arr_ref = np.array(img_ref, dtype=np.float32) / 255.0
    arr_rev = np.array(img_rev, dtype=np.float32) / 255.0

    # Mask background (white/gray)
    skin_mask_ref = ~((arr_ref[..., 0] > 0.94) & (arr_ref[..., 1] > 0.94) & (arr_ref[..., 2] > 0.94))
    skin_mask_rev = ~((arr_rev[..., 0] > 0.94) & (arr_rev[..., 1] > 0.94) & (arr_rev[..., 2] > 0.94))
    valid_skin = skin_mask_ref & skin_mask_rev

    # Illumination Gain Adaptation
    mean_ref = arr_ref[valid_skin].mean(axis=0) if valid_skin.sum() > 100 else np.array([0.5, 0.5, 0.5])
    mean_rev = arr_rev[valid_skin].mean(axis=0) if valid_skin.sum() > 100 else np.array([0.5, 0.5, 0.5])
    gain = np.clip(mean_ref / np.maximum(mean_rev, 1e-3), 0.88, 1.14)

    arr_rev_adapted = np.clip(arr_rev * gain, 0.0, 1.0)

    lab_ref = rgb_to_lab(arr_ref)
    lab_rev = rgb_to_lab(arr_rev_adapted)

    dL = lab_rev[..., 0] - lab_ref[..., 0]
    da = lab_rev[..., 1] - lab_ref[..., 1]
    db = lab_rev[..., 2] - lab_ref[..., 2]

    delta_E = np.sqrt(dL**2 + da**2 + db**2)
    delta_E[~valid_skin] = 0

    # Margins
    delta_E[:12, :] = 0
    delta_E[-12:, :] = 0
    delta_E[:, :12] = 0
    delta_E[:, -12:] = 0

    max_delta_E = delta_E.max()

    # Lesion mask
    threshold = 9.0
    lesion_mask = (delta_E > threshold) & valid_skin
    lesion_count = lesion_mask.sum()

    is_detected = (lesion_count >= 18) and (max_delta_E > 11.0)

    if not is_detected:
        return {
            "detected": False,
            "condition": "No significant visible change",
            "confidence": 0.96,
            "max_delta_E": float(max_delta_E),
            "lesion_pixels": int(lesion_count)
        }

    # Determine condition
    dL_lesion = dL[lesion_mask]
    da_lesion = da[lesion_mask]
    db_lesion = db[lesion_mask]

    # Bruise: darkness drop + red/purple chromaticity
    bruise_mass = np.maximum(0, -dL_lesion * 0.6) + np.maximum(0, da_lesion * 0.8)
    erythema_mass = np.maximum(0, da_lesion * 1.2) * (dL_lesion > -7.0)
    resolving_mass = np.maximum(0, db_lesion * 1.2) * (np.abs(dL_lesion) < 10.0)

    b_score = bruise_mass.sum()
    e_score = erythema_mass.sum() * 1.3
    r_score = resolving_mass.sum() * 1.4

    # Spatial coordinates
    y_indices, x_indices = np.where(lesion_mask)
    weights = delta_E[lesion_mask] - threshold
    cx = float(np.sum(x_indices * weights) / np.sum(weights)) / 256.0
    cy = float(np.sum(y_indices * weights) / np.sum(weights)) / 256.0

    p10_x = float(np.percentile(x_indices, 10)) / 256.0
    p90_x = float(np.percentile(x_indices, 90)) / 256.0
    p10_y = float(np.percentile(y_indices, 10)) / 256.0
    p90_y = float(np.percentile(y_indices, 90)) / 256.0

    w = max(0.10, min(0.35, (p90_x - p10_x) * 1.2))
    h = max(0.10, min(0.35, (p90_y - p10_y) * 1.2))

    if e_score > b_score and e_score > r_score:
        condition = "Localized erythema / skin appearance change"
        conf = 0.88
    elif r_score > b_score:
        condition = "Localized skin-color variation (resolving)"
        conf = 0.82
    elif b_score > 0:
        condition = "Visible color change / contusion-like discoloration"
        conf = 0.89
    else:
        condition = "Superficial skin-surface change"
        conf = 0.84

    return {
        "detected": True,
        "condition": condition,
        "confidence": conf,
        "max_delta_E": float(max_delta_E),
        "lesion_pixels": int(lesion_count),
        "cx": round(cx, 3),
        "cy": round(cy, 3),
        "w": round(w, 3),
        "h": round(h, 3)
    }

def main():
    cases = [
        ("IF456", "Left Shoulder", "public/images/body-check/IF456/reference.webp", "public/images/body-check/IF456/review.webp", "Bruise"),
        ("IF455", "Right Forearm", "public/images/body-check/IF455/reference.webp", "public/images/body-check/IF455/review.webp", "Abrasion/Bruise"),
        ("IF452", "Back (Negative Control)", "public/images/body-check/IF452/reference.webp", "public/images/body-check/IF452/review.webp", "Normal"),
        ("IF439", "Right Lower Leg", "public/images/body-check/IF439/reference.webp", "public/images/body-check/IF439/review.webp", "Bruise"),
        ("IF460", "Foot (Erythema)", "public/images/body-check/IF460/reference.webp", "public/images/body-check/IF460/review.webp", "Erythema"),
        ("IF461", "Foot Soles (Negative Control)", "public/images/body-check/IF461/reference.webp", "public/images/body-check/IF461/review.webp", "Normal"),
        ("IF462", "Upper Arm", "public/images/body-check/IF462/reference.webp", "public/images/body-check/IF462/review.webp", "Linear Scratch"),
        ("IF463", "Lower Leg", "public/images/body-check/IF463/reference.webp", "public/images/body-check/IF463/review.webp", "Resolving Bruise"),
    ]

    print("=================================================================")
    print("Evaluating Clinical Colorimetric ML Engine Across All 8 Scenarios")
    print("=================================================================")

    for record_id, region, ref, rev, expected in cases:
        res = evaluate_image_pair(ref, rev)
        print(f"\nRecord: {record_id} ({region})")
        print(f"  Expected:  {expected}")
        print(f"  Detected:  {res['detected']}")
        print(f"  Condition: {res['condition']} (Conf: {res['confidence'] * 100:.0f}%, Max DeltaE: {res['max_delta_E']:.1f}, Pixels: {res['lesion_pixels']})")
        if res['detected']:
            print(f"  Reticle:   cx={res['cx']*100:.1f}%, cy={res['cy']*100:.1f}%, w={res['w']*100:.1f}%, h={res['h']*100:.1f}%")

if __name__ == "__main__":
    main()
