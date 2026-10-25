# Body Check Image Selection & Review Workflow Walkthrough

We have upgraded the Body Check image selection and review workflow to enforce strict record-specific isolation, introduce clear `NEW` image badge labeling, provide explicit `"No new images available"` states, establish asset-path based placeholder slots for all 8 scenarios, and integrate complete scenario metadata.

---

## 1. Record-Specific Image Filtering

### Strict Record & Body Region Isolation
- **Eliminated Cross-Record Leaks**: The image picker modal no longer shows images from other records (`IF455`, `IF452`, `IF439`, etc.) when reviewing a specific record.
- **Strict Query Filtering**: When the user opens the gallery modal for `IF456 — Left Shoulder`, the gallery strictly queries:
  ```ts
  asset.recordId.toUpperCase() === recordId.toUpperCase() &&
  asset.bodyRegion.toLowerCase() === bodyRegion.toLowerCase()
  ```
  Only review photographic assets belonging to the selected Record ID and designated Body Region appear.

---

## 2. Reference vs Review Side-by-Side Presentation

When the user opens the review image selection dialog, it renders a side-by-side comparative layout:

```
[Reference Image] Reference                [Review Image] Review
- Baseline photo (Normal / Source)         - Candidate review photo(s)
- Record ID & designated Region            - [NEW] badge if newly added
- Source ID (e.g. REF-001)                 - Finding description & Image Type
- Slot: /body-check/{ID}/reference.webp     - Slot: /body-check/{ID}/review.webp
```

- **`[Reference Image] Reference`**:
  - Displays the baseline reference image slot (`public/images/body-check/{RECORD_ID}/reference.webp`).
  - Labeled `[Reference Image] Reference` with `Baseline` tag and source appearance status.
- **`[Review Image] Review`**:
  - Displays candidate review images for that record and region.
  - Clicking on a candidate selects it with a highlighted border, active radio checkmark, and enables the **[ Use Selected Image ]** action.

---

## 3. `NEW` Image Labeling & "No New Images Available" State

### `NEW` Badge Labeling
- If a candidate review image is newly added (`asset.isNew === true`), it renders with a prominent `NEW` badge (`bg-emerald-600 text-white font-bold text-[10px] font-mono px-2 py-0.5 rounded shadow-2xs`).
- Existing baseline / follow-up images (`asset.isNew === false`, such as `IF452` and `IF461`) do **not** have the `NEW` label, displaying an `Existing` tag instead.

### "No New Images Available" Handling
- If a record has **no review images** registered for the selected body region:
  - Displays a clean empty state card:
    - **Header**: `"No new images available"`
    - **Description**: *"No review images are registered for record {recordId} in region {bodyRegion}. Images from other records are strictly isolated and not displayed."*
- If a record only has existing / previously registered images (none flagged `NEW`):
  - Displays an informative banner: *"No new images available. Displaying existing reference/follow-up record asset."*
- **No Fallback**: Under no circumstances does the gallery fall back to showing images from another record.

---

## 4. Asset-Path Based Placeholder Slots

All 16 placeholder WebP images were generated using Pillow at 800×600 with clean, high-contrast clinical cards, legible typography, slot names, and exact paths:

| Record ID | Body Region | Reference Image Slot | Review Image Slot | REF Source ID | Image Type | Review Finding | `isNew` |
|---|---|---|---|---|---|---|---|
| **IF456** | Left Shoulder | `.../IF456/reference.webp` | `.../IF456/review.webp` | `REF-001` | abnormal finding | localized reddish/purple discoloration over the left shoulder/deltoid ridge | `true` |
| **IF455** | Right Forearm | `.../IF455/reference.webp` | `.../IF455/review.webp` | `REF-005` | abnormal finding | localized bruise-like reddish-purple color variation across the mid-shaft volar forearm | `true` |
| **IF452** | Back | `.../IF452/reference.webp` | `.../IF452/review.webp` | `REF-001` | normal / unchanged | NO SIGNIFICANT VISIBLE CHANGE | `false` |
| **IF439** | Right Lower Leg | `.../IF439/reference.webp` | `.../IF439/review.webp` | `REF-008` | abnormal finding | localized reddish/purple discoloration on the right lower leg / proximal tibial region below the patella | `true` |
| **IF460** | Foot | `.../IF460/reference.webp` | `.../IF460/review.webp` | `REF-011` | abnormal finding | localized mild erythema/redness on the lateral dorsum of the foot | `true` |
| **IF461** | Foot | `.../IF461/reference.webp` | `.../IF461/review.webp` | `REF-012` | normal / unchanged | NO SIGNIFICANT VISIBLE CHANGE | `false` |
| **IF462** | Upper Arm | `.../IF462/reference.webp` | `.../IF462/review.webp` | `REF-001` | abnormal finding | subtle localized skin-color variation on the upper arm / lateral brachium | `true` |
| **IF463** | Lower Leg | `.../IF463/reference.webp` | `.../IF463/review.webp` | `REF-010` | abnormal finding | subtle resolving yellowish-tan discoloration on the anterior tibial shin | `true` |

> [!TIP]
> **Future Asset Drop-In**: To replace any placeholder with a real photograph, simply replace the file at `public/images/body-check/{RECORD_ID}/reference.webp` or `public/images/body-check/{RECORD_ID}/review.webp`. No application code modifications are required.

---

## 5. Verification Results

1. **Asset Integrity**: Verified that all 16 files exist and have valid non-zero byte sizes (>27 KB each).
2. **Metadata Integrity**: Verified that `mockRecords.ts` contains the exact REF Source IDs, review descriptions, image types, and `isNew` boolean flags for all 8 records.
3. **Filtering Isolation**: Verified that querying gallery assets for `IF456` returns only `IF456` Left Shoulder and zero assets from other records.
4. **NEW vs Existing vs Empty State**: Verified that `IF456`, `IF455`, `IF439`, `IF460`, `IF462`, `IF463` render the `NEW` badge; `IF452` and `IF461` render without the `NEW` badge; and unmatched regions display `"No new images available"`.
5. **Build Check**: `npm run build` compiled with 0 errors in 2.00s.
6. **Dev Server**: Running on `http://localhost:3000/`.
