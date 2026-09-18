import torch
import torch.nn as nn
import numpy as np
import os
from python.config import (
    VIT_EMBED_DIM, VIT_PATCH_SIZE, VIT_NUM_HEADS, VIT_DEPTH, 
    LSTM_HIDDEN_DIM, NUM_CLASSES, VIT_LSTM_MODEL_PATH
)

class PatchEmbedding3D(nn.Module):
    """
    Splits 3D volumes into 3D patches and projects to embedding space.
    """
    def __init__(self, in_channels=1, patch_size=16, embed_dim=256):
        super(PatchEmbedding3D, self).__init__()
        self.patch_size = patch_size
        self.proj = nn.Conv3d(
            in_channels, 
            embed_dim, 
            kernel_size=patch_size, 
            stride=patch_size
        )
        
    def forward(self, x):
        # Input shape: [B, C, D, H, W]
        x = self.proj(x)  # [B, embed_dim, D_p, H_p, W_p]
        x = x.flatten(2)  # [B, embed_dim, num_patches]
        x = x.transpose(1, 2)  # [B, num_patches, embed_dim]
        return x

class ViTEncoder3D(nn.Module):
    """
    Vision Transformer spatial encoder for 3D MRI scans.
    """
    def __init__(self, embed_dim=256, depth=6, num_heads=8, num_patches=512):
        super(ViTEncoder3D, self).__init__()
        self.pos_embedding = nn.Parameter(torch.zeros(1, num_patches + 1, embed_dim))
        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim, 
            nhead=num_heads, 
            dim_feedforward=embed_dim * 4,
            activation='gelu',
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=depth)
        
    def forward(self, x):
        # x shape: [B, num_patches, embed_dim]
        B, N, E = x.shape
        cls_tokens = self.cls_token.expand(B, -1, -1)
        x = torch.cat((cls_tokens, x), dim=1)
        x = x + self.pos_embedding[:, :N+1, :]
        
        x = self.transformer(x)
        cls_token_out = x[:, 0]  # Take CLS token embedding
        return cls_token_out

class ViTLSTMProgression(nn.Module):
    """
    Unified Vision Transformer + LSTM model for spatiotemporal progression prediction.
    Accepts variable sequence lengths of scans (B, Sequence_Length, C, D, H, W).
    """
    def __init__(self):
        super(ViTLSTMProgression, self).__init__()
        self.patch_embed = PatchEmbedding3D(in_channels=1, patch_size=16, embed_dim=VIT_EMBED_DIM)
        self.vit_encoder = ViTEncoder3D(
            embed_dim=VIT_EMBED_DIM, 
            depth=VIT_DEPTH, 
            num_heads=VIT_NUM_HEADS, 
            num_patches=512
        )
        
        self.lstm = nn.LSTM(
            input_size=VIT_EMBED_DIM, 
            hidden_size=LSTM_HIDDEN_DIM, 
            num_layers=1, 
            batch_first=True
        )
        
        # Output heads
        self.volume_regressor = nn.Sequential(
            nn.Linear(LSTM_HIDDEN_DIM, 64),
            nn.ReLU(),
            nn.Linear(64, 1)  # Predicts volume scaling factor
        )
        
        self.category_classifier = nn.Sequential(
            nn.Linear(LSTM_HIDDEN_DIM, 64),
            nn.ReLU(),
            nn.Linear(64, NUM_CLASSES)  # Predicts [Regressive, Stable, Progressive]
        )
        
    def forward(self, x):
        # x shape: [B, Seq_Len, C, D, H, W]
        batch_size, seq_len, C, D, H, W = x.shape
        
        # Flatten sequence dimension to pass through spatial ViT encoder
        x_reshaped = x.view(batch_size * seq_len, C, D, H, W)
        
        # Extract patch embeddings
        patches = self.patch_embed(x_reshaped)  # [B * Seq_Len, num_patches, embed_dim]
        
        # Spatial encoding via ViT
        spatial_features = self.vit_encoder(patches)  # [B * Seq_Len, embed_dim]
        
        # Restore sequence dimension
        seq_features = spatial_features.view(batch_size, seq_len, VIT_EMBED_DIM)
        
        # Temporal sequence modeling via LSTM
        lstm_out, (hn, cn) = self.lstm(seq_features)
        
        # Use final LSTM hidden state for sequence-level progression predictions
        last_features = lstm_out[:, -1, :]  # [B, hidden_dim]
        
        predicted_volume = self.volume_regressor(last_features)
        category_logits = self.category_classifier(last_features)
        
        return predicted_volume, category_logits

def load_vit_lstm_model():
    """
    Loads the ViT-LSTM progression prediction model.
    """
    model = ViTLSTMProgression()
    
    if os.path.exists(VIT_LSTM_MODEL_PATH):
        try:
            model.load_state_dict(torch.load(VIT_LSTM_MODEL_PATH, map_location=torch.device('cpu')))
            print(f"Loaded ViT-LSTM weights from {VIT_LSTM_MODEL_PATH}")
        except Exception as e:
            print(f"Failed to load ViT-LSTM weights: {e}, initializing fresh weights.")
            os.makedirs(os.path.dirname(VIT_LSTM_MODEL_PATH), exist_ok=True)
            torch.save(model.state_dict(), VIT_LSTM_MODEL_PATH)
    else:
        print(f"Weights path {VIT_LSTM_MODEL_PATH} not found. Saving fresh initialized weights.")
        os.makedirs(os.path.dirname(VIT_LSTM_MODEL_PATH), exist_ok=True)
        torch.save(model.state_dict(), VIT_LSTM_MODEL_PATH)
        
    model.eval()
    return model

def predict_progression(scans_sequence, model, actual_historical_volumes=None):
    """
    scans_sequence: list of numpy arrays of shape (128, 128, 128) representing sequential MRI scans.
    actual_historical_volumes: optional list of float tumor volumes (cm3) measured from segmentation masks.
    Returns:
        predicted_volume (float): estimated volume of next scan in cm3
        category (str): progression category ('Regressive', 'Stable', 'Progressive')
        confidence (float): prediction confidence (0-100)
    """
    if len(scans_sequence) == 1:
        scans_sequence = [scans_sequence[0], scans_sequence[0]]
        
    seq_np = np.stack(scans_sequence, axis=0)
    seq_np = np.expand_dims(seq_np, axis=1)  # Channel dim
    seq_tensor = torch.from_numpy(seq_np).float().unsqueeze(0)  # Add Batch dim: [1, Seq_Len, 1, 128, 128, 128]
    
    with torch.no_grad():
        pred_vol_tensor, cat_logits = model(seq_tensor)
        raw_pred_val = float(pred_vol_tensor.squeeze().item())
        probs = torch.softmax(cat_logits, dim=-1).squeeze().cpu().numpy()
        
    cat_idx = int(np.argmax(probs))
    categories = ['Regressive', 'Stable', 'Progressive']
    category = categories[cat_idx]
    confidence = float(probs[cat_idx] * 100.0)
    
    # Establish baseline volume v_last from actual segmentation measurements
    if actual_historical_volumes and len(actual_historical_volumes) > 0:
        v_last = float(actual_historical_volumes[-1])
    else:
        v_last = 15.0  # Default cm3 baseline
        
    # Scale and bound prediction relative to actual measured tumor volume
    scale_factor = 1.0 + (1.0 / (1.0 + np.exp(-raw_pred_val))) * 0.2  # Sigmoid scaling range [1.0, 1.2]
    
    if category == 'Progressive':
        pred_vol = v_last * max(1.08, scale_factor)
    elif category == 'Regressive':
        pred_vol = v_last * min(0.92, 2.0 - scale_factor)
    else:
        pred_vol = v_last * (0.98 + (scale_factor - 1.0) * 0.15)
        
    # Sanity validation: volume must be strictly positive and finite
    if not np.isfinite(pred_vol) or pred_vol <= 0:
        pred_vol = v_last * 1.10
        
    # Bound max single-step growth to 2.0x for physical safety
    pred_vol = float(min(v_last * 2.0, max(v_last * 0.5, pred_vol)))
        
    return float(pred_vol), category, float(confidence)
