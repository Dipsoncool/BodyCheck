"""
Dataset loader and synthetic clinical injury augmentation pipeline for BodyCheck ML model.
Generates realistic lesion pairs (Reference vs Review) with:
- Bruises / Contusions (ecchymosis)
- Erythema / Redness
- Scratches / Abrasions
- Resolving bruises
- Negative controls (Normal skin with lighting/camera shifts)
"""

import os
import glob
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

CLASSES = [
    "Normal / No Significant Visible Change",
    "Visible color change / contusion-like discoloration",
    "Localized erythema / skin appearance change",
    "Superficial skin-surface change",
    "Localized skin-color variation"
]

CLASS_TO_IDX = {name: i for i, name in enumerate(CLASSES)}

def load_and_preprocess_image(path, target_size=(128, 128)):
    """Loads and resizes an image to target size, returns float32 normalized [0, 1]."""
    img = Image.open(path).convert('RGB')
    img = img.resize(target_size, Image.Resampling.BILINEAR)
    arr = np.array(img, dtype=np.float32) / 255.0
    return arr

def rgb_to_lab_approx(rgb):
    """
    Fast differentiable RGB to approximate normalized CIE-L*a*b*.
    rgb in [0, 1].
    """
    # Simple linear approximation for normalized Lab representation
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    L = 0.299 * r + 0.587 * g + 0.114 * b
    a = (r - g) * 0.5 + 0.5   # green-red axis
    b_axis = (r + g - 2 * b) * 0.25 + 0.5 # blue-yellow axis
    return np.stack([L, a, b_axis], axis=-1)

def synthesize_injury_patch(base_img, injury_type='bruise', seed=None):
    """
    Synthesizes a realistic injury onto a normal baseline image.
    Returns (modified_image, bbox_coords [x, y, w, h], class_idx).
    """
    rng = np.random.RandomState(seed)
    h, w, c = base_img.shape
    out_img = base_img.copy()

    if injury_type == 'normal':
        # Apply illumination shift / noise / slight camera angle shift
        # No lesion
        gain = rng.uniform(0.92, 1.08, size=(1, 1, 3))
        out_img = np.clip(out_img * gain + rng.normal(0, 0.015, out_img.shape), 0, 1)
        return out_img, np.array([0.0, 0.0, 0.0, 0.0], dtype=np.float32), 0

    # Choose random lesion center and size within skin bounds
    cx = rng.uniform(0.3, 0.7)
    cy = rng.uniform(0.3, 0.7)
    lw = rng.uniform(0.12, 0.25)
    lh = rng.uniform(0.12, 0.25)

    # Coordinate grids
    y_idx, x_idx = np.mgrid[0:h, 0:w]
    norm_x = x_idx / float(w)
    norm_y = y_idx / float(h)

    # Elliptical gaussian mask
    dist_sq = ((norm_x - cx) / (lw * 0.5)) ** 2 + ((norm_y - cy) / (lh * 0.5)) ** 2
    mask = np.exp(-dist_sq * 2.0)
    mask = np.clip(mask, 0, 1)[..., np.newaxis]

    if injury_type == 'bruise':
        # Acute contusion: purple/red center, dark pooling, slight bluish undertone
        # Lower brightness (L), increase red/purple (higher a*, lower b*)
        bruise_color = np.array([0.45, 0.15, 0.35], dtype=np.float32)
        out_img = out_img * (1.0 - mask * 0.45) + bruise_color * (mask * 0.45)
        class_idx = 1

    elif injury_type == 'erythema':
        # Erythema / rash: localized redness, higher R, slightly lower G, minimal darkness
        erythema_color = np.array([0.85, 0.20, 0.25], dtype=np.float32)
        out_img = out_img * (1.0 - mask * 0.35) + erythema_color * (mask * 0.35)
        class_idx = 2

    elif injury_type == 'abrasion':
        # Superficial scratch / linear abrasion: thin line, irregular edge
        angle = rng.uniform(0, np.pi)
        dx = (norm_x - cx) * np.cos(angle) + (norm_y - cy) * np.sin(angle)
        dy = -(norm_x - cx) * np.sin(angle) + (norm_y - cy) * np.cos(angle)
        scratch_mask = np.exp(-((dx / (lw * 0.7)) ** 2 + (dy / 0.015) ** 2))
        scratch_mask = scratch_mask[..., np.newaxis]
        scratch_color = np.array([0.65, 0.18, 0.15], dtype=np.float32)
        out_img = out_img * (1.0 - scratch_mask * 0.5) + scratch_color * (scratch_mask * 0.5)
        mask = scratch_mask
        class_idx = 3

    elif injury_type == 'resolving':
        # Resolving bruise: yellowish-tan / hemosiderin deposition (higher G and B, yellowish)
        yellow_color = np.array([0.65, 0.58, 0.20], dtype=np.float32)
        out_img = out_img * (1.0 - mask * 0.40) + yellow_color * (mask * 0.40)
        class_idx = 4
    else:
        class_idx = 0

    # Add realistic sensor noise
    out_img = np.clip(out_img + rng.normal(0, 0.01, out_img.shape), 0, 1)
    bbox = np.array([cx, cy, lw, lh], dtype=np.float32)
    return out_img, bbox, class_idx


def generate_training_batch(reference_images, batch_size=32, target_size=(128, 128)):
    """
    Generates a batch of (ref_img, rev_img, class_label, bbox) pairs.
    """
    ref_batch = []
    rev_batch = []
    class_batch = []
    bbox_batch = []

    injury_types = ['normal', 'bruise', 'erythema', 'abrasion', 'resolving']

    for i in range(batch_size):
        # Pick random reference image
        ref_idx = np.random.randint(0, len(reference_images))
        ref_img = reference_images[ref_idx]

        # Random horizontal flip
        if np.random.rand() > 0.5:
            ref_img = np.fliplr(ref_img)

        # Pick condition (balanced)
        inj_type = np.random.choice(injury_types)

        rev_img, bbox, class_idx = synthesize_injury_patch(ref_img, injury_type=inj_type)

        ref_batch.append(ref_img)
        rev_batch.append(rev_img)
        class_batch.append(class_idx)
        bbox_batch.append(bbox)

    return (
        np.array(ref_batch, dtype=np.float32),
        np.array(rev_batch, dtype=np.float32),
        np.array(class_batch, dtype=np.int32),
        np.array(bbox_batch, dtype=np.float32)
    )
