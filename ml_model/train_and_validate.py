"""
Training and Validation Script for BodyCheck ML Model.
Trains on reference skin baseline photographs with synthetic and real clinical lesion pairs.
Evaluates accuracy on both Bruise/Injury detection and Non-bruise (Normal) controls.
"""

import os
import glob
import numpy as np
import tensorflow as tf
from tensorflow import keras
from PIL import Image

from model import create_bodycheck_ml_model
from dataset import CLASSES, load_and_preprocess_image, generate_training_batch

def load_reference_dataset(base_dir="public/images/body-check"):
    """Loads all reference images from body_check_demo_60_images and the local repository."""
    ref_paths = []
    
    # 1. 60 Demonstration Photographic Dataset
    demo_60_paths = glob.glob(os.path.join("body_check_demo_60_images", "*", "*Reference.png"))
    if not demo_60_paths:
        demo_60_paths = glob.glob(os.path.join("public", "images", "demo_60", "*", "*Reference.png"))
    ref_paths.extend(demo_60_paths)

    # 2. Additional clinical body check images
    poc_paths = glob.glob(os.path.join(base_dir, "*", "reference.webp"))
    if not poc_paths:
        poc_paths = glob.glob(os.path.join(base_dir, "*", "reference.png"))
    ref_paths.extend(poc_paths)

    images = []
    print(f"Loading reference baseline images from {len(ref_paths)} total files...")
    for p in ref_paths:
        try:
            img = load_and_preprocess_image(p, target_size=(128, 128))
            images.append(img)
            print(f"  Loaded: {p} ({img.shape})")
        except Exception as e:
            print(f"  Error loading {p}: {e}")
    
    if len(images) == 0:
        print("Warning: No images found, creating synthetic skin base patches...")
        for _ in range(8):
            base = np.ones((128, 128, 3), dtype=np.float32)
            base[..., 0] = np.random.uniform(0.70, 0.90) # skin R
            base[..., 1] = np.random.uniform(0.55, 0.75) # skin G
            base[..., 2] = np.random.uniform(0.45, 0.65) # skin B
            images.append(base)
            
    return images

def main():
    os.makedirs("ml_model/weights", exist_ok=True)
    ref_images = load_reference_dataset()
    print(f"Total reference base skins loaded: {len(ref_images)}")

    # 1. Build model
    model = create_bodycheck_ml_model(input_shape=(128, 128, 3), num_classes=len(CLASSES))
    model.summary()

    # 2. Compile model with multi-task loss
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss={
            "condition_output": keras.losses.SparseCategoricalCrossentropy(),
            "bbox_output": keras.losses.MeanSquaredError()
        },
        loss_weights={
            "condition_output": 1.0,
            "bbox_output": 2.5
        },
        metrics={
            "condition_output": ["accuracy"],
            "bbox_output": ["mae"]
        }
    )

    # 3. Generate training data
    print("\nGenerating training & validation datasets...")
    train_refs, train_revs, train_classes, train_bboxes = generate_training_batch(
        ref_images, batch_size=640, target_size=(128, 128)
    )
    val_refs, val_revs, val_classes, val_bboxes = generate_training_batch(
        ref_images, batch_size=160, target_size=(128, 128)
    )

    print(f"Train samples: {len(train_classes)}, Val samples: {len(val_classes)}")
    print(f"Class distribution in validation: {np.bincount(val_classes, minlength=5)}")

    # 4. Train the model
    print("\nStarting training BodyCheck DiffNet...")
    history = model.fit(
        x={"reference_image": train_refs, "review_image": train_revs},
        y={"condition_output": train_classes, "bbox_output": train_bboxes},
        validation_data=(
            {"reference_image": val_refs, "review_image": val_revs},
            {"condition_output": val_classes, "bbox_output": val_bboxes}
        ),
        epochs=12,
        batch_size=32,
        verbose=1
    )

    # 5. Evaluate on validation set
    val_loss = model.evaluate(
        x={"reference_image": val_refs, "review_image": val_revs},
        y={"condition_output": val_classes, "bbox_output": val_bboxes},
        verbose=0
    )
    print("\n--- Final Validation Metrics ---")
    print(f"Total Loss: {val_loss[0]:.4f}")
    print(f"Condition Accuracy: {val_loss[3] * 100:.2f}%")
    print(f"Bounding Box MAE: {val_loss[4]:.4f}")

    # 6. Save model weights
    save_path = "ml_model/weights/bodycheck_diffnet.keras"
    model.save(save_path)
    print(f"\nModel saved successfully to: {save_path}")

    # 7. Evaluate on Real POC scenarios from repository
    test_poc_scenarios(model)

def test_poc_scenarios(model):
    print("\n=======================================================")
    print("Testing ML Model on Real Repository Clinical Scenarios:")
    print("=======================================================")

    scenarios = [
        ("IF456 (Left Shoulder Contusion)", "public/images/body-check/IF456/reference.webp", "public/images/body-check/IF456/review.webp", "Bruise"),
        ("IF455 (Right Forearm Abrasion)", "public/images/body-check/IF455/reference.webp", "public/images/body-check/IF455/review.webp", "Abrasion"),
        ("IF452 (Back - Negative Control)", "public/images/body-check/IF452/reference.webp", "public/images/body-check/IF452/review.webp", "Normal"),
        ("IF460 (Foot - Erythema)", "public/images/body-check/IF460/reference.webp", "public/images/body-check/IF460/review.webp", "Erythema"),
        ("IF461 (Foot Soles - Negative Control)", "public/images/body-check/IF461/reference.webp", "public/images/body-check/IF461/review.webp", "Normal"),
    ]

    for title, ref_p, rev_p, expected in scenarios:
        if not os.path.exists(ref_p) or not os.path.exists(rev_p):
            continue
        ref_arr = np.expand_dims(load_and_preprocess_image(ref_p), axis=0)
        rev_arr = np.expand_dims(load_and_preprocess_image(rev_p), axis=0)

        preds = model.predict({"reference_image": ref_arr, "review_image": rev_arr}, verbose=0)
        cond_probs = preds[0][0]
        bbox = preds[1][0]

        top_class_idx = int(np.argmax(cond_probs))
        top_prob = float(cond_probs[top_class_idx])
        pred_label = CLASSES[top_class_idx]

        print(f"\nCase: {title}")
        print(f"  Expected Type: {expected}")
        print(f"  ML Predicted: {pred_label} (Confidence: {top_prob*100:.1f}%)")
        print(f"  Class Probs: Normal={cond_probs[0]*100:.1f}%, Bruise={cond_probs[1]*100:.1f}%, Erythema={cond_probs[2]*100:.1f}%, Abrasion={cond_probs[3]*100:.1f}%, Resolving={cond_probs[4]*100:.1f}%")
        print(f"  Predicted Delta Box: [cx={bbox[0]:.3f}, cy={bbox[1]:.3f}, w={bbox[2]:.3f}, h={bbox[3]:.3f}]")

if __name__ == "__main__":
    main()
