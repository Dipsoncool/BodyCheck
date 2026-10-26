"""
Lightweight Siamese Differential CNN Model for BodyCheck.
Detects bruises, erythema, scratches, and normal conditions from Reference vs Review images.
Total parameters: < 350K (~1.4MB), ultra-fast inference (< 15ms).
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

def create_bodycheck_ml_model(input_shape=(128, 128, 3), num_classes=5):
    """
    Constructs a dual-input differential convolutional neural network.
    Inputs:
        ref_input: (128, 128, 3) float32 in [0, 1]
        rev_input: (128, 128, 3) float32 in [0, 1]
    Outputs:
        condition_probs: (5,) softmax class probabilities
        bbox_coords: (4,) normalized [cx, cy, width, height] in [0, 1]
    """
    ref_input = layers.Input(shape=input_shape, name="reference_image")
    rev_input = layers.Input(shape=input_shape, name="review_image")

    # Compute differential channels
    diff = layers.Lambda(lambda x: tf.abs(x[0] - x[1]), name="abs_diff")([rev_input, ref_input])
    signed_diff = layers.Lambda(lambda x: (x[0] - x[1]) * 0.5 + 0.5, name="signed_diff")([rev_input, ref_input])

    # Concatenate Review, Reference, Absolute Difference, and Signed Difference
    # Total channels: 3 + 3 + 3 + 3 = 12 channels
    combined = layers.Concatenate(axis=-1, name="combined_features")([
        rev_input,
        ref_input,
        diff,
        signed_diff
    ])

    # Feature Extractor Block 1 (128 -> 64)
    x = layers.Conv2D(32, (3, 3), padding="same", activation="relu")(combined)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)

    # Feature Extractor Block 2 (64 -> 32)
    x = layers.Conv2D(64, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)

    # Feature Extractor Block 3 (32 -> 16)
    x = layers.Conv2D(96, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)

    # Feature Extractor Block 4 (16 -> 8)
    spatial_features = layers.Conv2D(128, (3, 3), padding="same", activation="relu", name="spatial_features")(x)
    x = layers.BatchNormalization()(spatial_features)
    x = layers.MaxPooling2D((2, 2))(x)

    # Global representation
    gap = layers.GlobalAveragePooling2D(name="global_pool")(x)
    gmp = layers.GlobalMaxPooling2D(name="global_max_pool")(x)
    pooled = layers.Concatenate()([gap, gmp])

    # 1. Condition Classification Head
    c = layers.Dense(96, activation="relu")(pooled)
    c = layers.Dropout(0.25)(c)
    c = layers.Dense(48, activation="relu")(c)
    condition_output = layers.Dense(num_classes, activation="softmax", name="condition_output")(c)

    # 2. Lesion Bounding Box / Reticle Localization Head
    b = layers.Dense(64, activation="relu")(pooled)
    b = layers.Dropout(0.2)(b)
    b = layers.Dense(32, activation="relu")(b)
    bbox_output = layers.Dense(4, activation="sigmoid", name="bbox_output")(b)

    model = keras.Model(
        inputs=[ref_input, rev_input],
        outputs=[condition_output, bbox_output],
        name="BodyCheck_DiffNet"
    )

    return model
