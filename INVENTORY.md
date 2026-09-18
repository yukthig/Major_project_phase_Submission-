# Project Source Code Inventory

**Project Title**: Brain Tumor Progression Prediction and 3D Reconstruction using ViT-LSTM  
**Target Package**: `Brain_Tumor_ViT_LSTM_Project`

---

## 📂 Included Directories

1. `client/` - React + Vite + TypeScript Web Frontend
2. `client/src/pages/` - UI Application Views (Dashboard, Upload, Segmentation, Reconstruction, Progression, Results, Reports)
3. `client/src/store/` - Zustand Global Scan Store (`scanStore.ts`)
4. `client/src/utils/` - Dataset Prefix Classification Mapping (`classification.ts`)
5. `client/src/services/` - Axios API Endpoint Bridge (`api.ts`)
6. `server/` - Node.js Express REST API Backend
7. `server/src/controllers/` - Backend Route Controllers (`scanController.js`, `reportController.js`, `authController.js`)
8. `server/src/models/` - Mongoose MongoDB Schemas (`Scan.js`, `Report.js`, `User.js`)
9. `server/src/routes/` - Express API Route Definitions
10. `python/` - PyTorch ML Engine & FastAPI Microservice
11. `python/models/` - PyTorch AI Architectures (`segmentation.py`, `vit_lstm.py`, `explainability.py`)
12. `python/utilities/` - 3D Marching Cubes Mesh Utilities (`volume_mesh.py`)
13. `python/weights/` - Trained AI Weights (`unet_3d_brats.pth`, `vit_lstm_progression.pth`)

---

## 📄 Key Model & Checkpoint Files Included

| File Path | Description | Included |
| :--- | :--- | :--- |
| `python/weights/unet_3d_brats.pth` | Trained 3D U-Net PyTorch Weights | ✅ YES |
| `python/weights/vit_lstm_progression.pth` | Trained ViT-Base + LSTM PyTorch Weights | ✅ YES |
| `python/models/segmentation.py` | 3D U-Net Model Architecture Source | ✅ YES |
| `python/models/vit_lstm.py` | ViT-LSTM Model Architecture Source | ✅ YES |
| `python/models/explainability.py` | Grad-CAM & ViT Self-Attention Source | ✅ YES |
| `python/utilities/volume_mesh.py` | Marching Cubes 3D Mesh Generator Source | ✅ YES |

---

## 🚫 Intentionally Excluded Files & Rationale

| Excluded Directory/Pattern | Rationale for Exclusion |
| :--- | :--- |
| `node_modules/` | Temporary installed npm dependencies (restored via `npm install`). |
| `__pycache__/` | Auto-generated Python bytecode files. |
| `.git/` | Local Git repository metadata & commit history. |
| `.venv/` | Environment binaries (restored via `pip install -r requirements.txt`). |
| `Brain_Tumor_ViT_LSTM_Project/` | Backup destination directory itself (prevents recursive copying). |
| `Brain_Tumor_ViT_LSTM_Project.zip` | Backup ZIP destination file. |
