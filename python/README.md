# NeuroVision AI Platform - Machine Learning Engine (Phase-2)

This directory contains the Python-based spatiotemporal machine learning engine and deep learning models for Brain Tumor Progression Prediction and 3D Reconstruction using a ViT-LSTM framework.

## 🚀 Getting Started

### 1. Requirements

Ensure Python 3.8+ is installed on your system. 

```bash
# In the root folder of the project, run:
pip install -r python/requirements.txt
```

### 2. Running the ML Engine (FastAPI)

To run the FastAPI server to serve the React application via the Express backend:

```bash
# Set PYTHONPATH to the root directory
# On Windows PowerShell:
$env:PYTHONPATH="C:\path\to\MAJORPROJECT"
python python/api.py

# On Linux / macOS:
export PYTHONPATH="/path/to/MAJORPROJECT"
python python/api.py
```

The server will run on `http://localhost:8000` and load the pre-trained weights for the U-Net and ViT-LSTM models automatically.

### 3. Verifying the Models

You can run the mathematical validation pipeline to test the neural network configurations, data dimensions, and Marching Cubes extractors:

```bash
python python/verify_pipeline.py
```

---

## 🛠️ Modular Architecture

*   `config.py`: Hyperparameters (patch embedding size, LSTM hidden state size, targets, spacing, paths).
*   `preprocessing.py`: standard MRI loading (`nibabel`), skull-stripping (Otsu morphological opening), and voxel resampling.
*   `models/segmentation.py`: PyTorch `UNet3D` (U-Net segmentation framework).
*   `models/vit_lstm.py`: Spatiotemporal prediction network. A Vision Transformer (ViT) acts as the spatial feature encoder, and an LSTM recurrent neural network models the temporal progression across variable-length longitudinal sequences.
*   `models/explainability.py`: Grad-CAM calculation for U-Net layers and self-attention mapping for ViT layers.
*   `utilities/volume_mesh.py`: Voxel count volume calculator and Marching Cubes mesh surface extractor (coordinates).
*   `api.py`: FastAPI server exposing endpoints `/health`, `/preprocess`, `/segment`, `/predict-progression`, and `/explain`.
