# BodyCheck ML Condition & Bruise Identification Model

This directory contains the machine learning model architecture, training pipeline, evaluation suite, and FastAPI microservice for identifying bruises, injuries, and skin conditions from Reference vs Review images.

---

## 1. Core Architecture Overview

Clinical visual review requires detecting **localized physiological changes** on skin (e.g. contusions, hematomas, abrasions, erythema) relative to an intact baseline photo, while remaining invariant to ambient room lighting, exposure, and skin tone.

### Multi-Channel Differential Engine
The model evaluates pairs $(I_{\text{ref}}, I_{\text{rev}})$:
1. **Skin & Chromaticity Adaptation (von Kries transform)**:
   Extracts baseline skin chromaticity $r = \frac{R}{R+G+B}, g = \frac{G}{R+G+B}$ to normalize color constancy across camera shifts, preventing room lighting changes from causing false bruise detections.
2. **CIE-$L^*a^*b^*$ Perceptual Color Space**:
   - $\Delta L^*$: Luminance extinction (contusions and hematomas pool deoxygenated hemoglobin subcutaneously, causing dark absorption).
   - $\Delta a^*$: Green-to-Red opponent axis (critical for acute erythema and contusion redness).
   - $\Delta b^*$: Blue-to-Yellow opponent axis (critical for bluish/violaceous pooling in acute bruises, and yellowish bilirubin/biliverdin in resolving contusions).
3. **Spatial Gradient / Edge Tensor**:
   Separates diffused subcutaneous contusions from high-gradient epidermal disruptions (scratches/abrasions).
4. **Dual Output Heads**:
   - **Condition Classifier**: Softmax distribution across 5 classes:
     - `Normal / No Significant Visible Change` (Negative control)
     - `Visible color change / contusion-like discoloration` (Bruise / Contusion)
     - `Localized erythema / skin appearance change` (Redness / Rash)
     - `Superficial skin-surface change` (Abrasion / Scratch)
     - `Localized skin-color variation` (Resolving yellowish bruise)
   - **Lesion Localization Head**: Computes normalized coordinates $[c_x, c_y, w, h]$ and radius for the **Assistive Focus Reticle**.

---

## 2. In-App Interactive Validation Lab

The React frontend includes an interactive **ML Model Lab** accessible via the **🧠 ML Model Lab** button in the top navigation bar:

- **Instant Side-by-Side Review**: Compare reference baseline with candidate review photos.
- **Client Image Upload**: Drag-and-drop or upload custom reference & review images.
- **Preset Test Suite**: Pre-loaded with verified clinical scenarios (positive contusions, erythema, resolving bruises, and negative controls).
- **Probability Breakdown**: Real-time softmax probability bars for all 5 condition classes.
- **Dynamic Reticle**: Highlights the detected lesion coordinates with a red focus ring.

---

## 3. Python ML Pipeline & Files

| File | Description |
|---|---|
| `ml_model/model.py` | PyTorch / Keras Siamese Differential CNN architecture (< 240K parameters, ~928 KB). |
| `ml_model/dataset.py` | Dataset loader and synthetic clinical injury augmentation pipeline. |
| `ml_model/train_and_validate.py` | Training script with multi-task loss (classification + bbox regression). |
| `ml_model/evaluate_clinical_cv.py` | Standalone evaluator testing all 8 real clinical photographic scenarios in the repository. |
| `ml_model/server.py` | FastAPI REST microservice exposing `POST /api/predict`. |

---

## 4. Running the Python Pipeline

### Train the Model
```bash
python ml_model/train_and_validate.py
```

### Evaluate on Real Photographic Scenarios
```bash
python ml_model/evaluate_clinical_cv.py
```

### Start the FastAPI Microservice
```bash
python ml_model/server.py
# or
uvicorn ml_model.server:app --host 0.0.0.0 --port 8000 --reload
```

---

## 5. REST API Usage

### Endpoint: `POST /api/predict`
Request payload:
```json
{
  "reference_image": "data:image/webp;base64,...",
  "review_image": "data:image/webp;base64,...",
  "body_region": "Left Shoulder"
}
```

Response:
```json
{
  "detected": true,
  "predictedChangeType": "Visible color change / contusion-like discoloration",
  "finding": "Localized reddish/purple bruise-like discoloration / contusion",
  "confidence": "Moderate",
  "confidenceScore": 0.89,
  "classProbabilities": {
    "normal": 0.04,
    "bruise": 0.89,
    "erythema": 0.04,
    "abrasion": 0.02,
    "resolving": 0.01
  },
  "deltaRegion": {
    "x": 0.504,
    "y": 0.416,
    "width": 0.35,
    "height": 0.35
  },
  "changeCoordinates": {
    "xPercent": 50.4,
    "yPercent": 41.6,
    "radiusPercent": 17.5
  }
}
```
