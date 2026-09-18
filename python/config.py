import os

# Base Directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
PREPROCESSED_DIR = os.path.join(DATA_DIR, "preprocessed")
SEGMENTATION_DIR = os.path.join(DATA_DIR, "segmentation")
EXPLAINABILITY_DIR = os.path.join(DATA_DIR, "xai")
WEIGHTS_DIR = os.path.join(BASE_DIR, "weights")

# Ensure directories exist
for folder in [DATA_DIR, UPLOADS_DIR, PREPROCESSED_DIR, SEGMENTATION_DIR, EXPLAINABILITY_DIR, WEIGHTS_DIR]:
    os.makedirs(folder, exist_ok=True)

# Model Settings
SEGMENTATION_MODEL_PATH = os.path.join(WEIGHTS_DIR, "unet_3d_brats.pth")
VIT_LSTM_MODEL_PATH = os.path.join(WEIGHTS_DIR, "vit_lstm_progression.pth")

# Input scan volume settings
INPUT_SHAPE = (128, 128, 128)  # D, H, W for 3D processing
SLICE_SIZE = 128               # H, W for slice-based operations

# ViT-LSTM Parameters
VIT_PATCH_SIZE = 16
VIT_EMBED_DIM = 256
VIT_NUM_HEADS = 8
VIT_DEPTH = 6
LSTM_HIDDEN_DIM = 128
NUM_CLASSES = 3  # Progression Trajectory Categories: 0: Regressive, 1: Stable, 2: Progressive
