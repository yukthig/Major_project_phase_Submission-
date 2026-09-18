# Brain Tumor Progression Prediction and 3D Reconstruction using ViT-LSTM

## 📌 Project Overview
**NeuroVision AI Platform** is a deep-learning clinical decision support system for brain MRI analytics. It integrates:
1. **3D U-Net Convolutional Neural Network**: Volumetric MRI slice-by-slice tumor segmentation and voxel metric calculations ($\text{cm}^3$).
2. **Vision Transformer (ViT) + LSTM Spatiotemporal Network**: Longitudinal multi-visit MRI progression analysis, growth velocity forecasting, and risk classification.
3. **WebGL 3D Surface Reconstruction (Marching Cubes)**: Interactive 3D surface mesh visualization of volumetric tumor masses.
4. **Explainable AI (Grad-CAM & ViT Self-Attention)**: Dynamic gradient heatmap visualizer for visual diagnostic verification.

---

## 📁 Repository & Folder Structure

```
Brain_Tumor_ViT_LSTM_Project/
├── client/                     # React + Vite + Tailwind CSS + Three.js WebGL Frontend
│   ├── src/
│   │   ├── pages/              # Navigation pages (Dashboard, Upload, Segmentation, Reconstruction, Progression, Results, Reports)
│   │   ├── store/              # Zustand scanStore (Single Source of Truth state management)
│   │   ├── utils/              # Dataset classification mapping & helpers
│   │   └── services/           # Axios REST API bridge
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Node.js + Express Backend API
│   ├── src/
│   │   ├── controllers/        # Scan & Report Controllers
│   │   ├── models/             # MongoDB Mongoose Schemas (Scan, Report, User)
│   │   ├── routes/             # Express API Endpoints
│   │   └── utils/              # Python Process Interop Helpers
│   └── package.json
├── python/                     # PyTorch Machine Learning Engine
│   ├── models/
│   │   ├── segmentation.py     # 3D U-Net Model Architecture
│   │   ├── vit_lstm.py         # ViT-Base-16 + LSTM Progression Model
│   │   └── explainability.py   # Grad-CAM & ViT Attention Generator
│   ├── utilities/
│   │   └── volume_mesh.py      # Marching Cubes 3D Mesh Utility
│   ├── weights/
│   │   ├── unet_3d_brats.pth           # Trained 3D U-Net Weights
│   │   └── vit_lstm_progression.pth    # Trained ViT-LSTM Weights
│   ├── api.py                  # FastAPI Machine Learning Engine Endpoints
│   └── requirements.txt        # Python Dependencies
├── README.md                   # Complete Documentation & Run Instructions
└── INVENTORY.md                # Full Source Code Inventory
```

---

## 🛠️ Technologies Used

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Three.js (@react-three/fiber), Lucide Icons, Recharts.
- **Backend API**: Node.js (v18+), Express, Mongoose / MongoDB, Axios.
- **Machine Learning Engine**: Python (3.9+ / 3.10+), PyTorch, FastAPI, Uvicorn, NumPy, OpenCV, Scikit-Image, SimpleITK, torchvision, timm.

---

## ⚙️ Environment Setup & System Requirements

### Prerequisites
1. **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
2. **Python**: v3.9 or v3.10 ([Download Python](https://www.python.org/))
3. **MongoDB**: (Optional) Local MongoDB server at `mongodb://localhost:27017/neurovision` or cloud MongoDB URI. The system also supports an in-memory database mode if MongoDB is offline.

---

## 🚀 Step-by-Step Run Instructions

### 1. Start PyTorch FastAPI Machine Learning Engine
Open Terminal 1:
```bash
cd python
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn api:app --host 0.0.0.0 --port 8000
```
*Verification*: PyTorch ML Engine active at `http://localhost:8000`

---

### 2. Start Node.js Express Backend API Server
Open Terminal 2:
```bash
cd server
npm install
npm start
```
*Verification*: Express API active at `http://localhost:5000`

---

### 3. Start Vite React Web Frontend Application
Open Terminal 3:
```bash
cd client
npm install
npm run dev
```
*Verification*: Web UI active at `http://localhost:5173`

---

## 🏷️ MRI Dataset Filename Prefix Classification Rules

The application parses original uploaded filenames to determine dataset class labels:
- **`Tr-pi` / `Te-pi`** $\rightarrow$ **Pituitary Tumor**
- **`Tr-no` / `Te-no`** $\rightarrow$ **No Tumor** ($0.00\text{ cm}^3$ volume, $0\text{ voxels}$)
- **`Tr-me` / `Te-me`** $\rightarrow$ **Meningioma**
- **`Tr-gl` / `Te-gl`** $\rightarrow$ **Glioma**
