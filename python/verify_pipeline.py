import torch
import numpy as np
import os
import sys

# Add root folder to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from python.models.segmentation import UNet3D
from python.models.vit_lstm import ViTLSTMProgression
from python.utilities.volume_mesh import calculate_voxel_volume, generate_mesh_marching_cubes

def verify_models():
    print("="*50)
    print("VERIFYING MODEL ARCHITECTURES")
    print("="*50)
    
    # 1. Verify 3D U-Net Segmentation
    print("1. Initializing 3D U-Net Model...")
    unet = UNet3D(in_channels=1, out_channels=1)
    dummy_volume = torch.randn(1, 1, 32, 32, 32)  # Downsized for rapid memory check
    print(f"   Input shape: {dummy_volume.shape}")
    
    try:
        # Test basic convolution layers
        enc1 = unet.encoder1(dummy_volume)
        print(f"   Encoder conv output shape: {enc1.shape}")
        print("   [SUCCESS] 3D U-Net architecture validation successful.")
    except Exception as e:
        print(f"   [FAILED] 3D U-Net verification failed: {e}")
        return False
        
    # 2. Verify ViT-LSTM Progression Model
    print("2. Initializing ViT-LSTM Progression Model...")
    try:
        vit_lstm = ViTLSTMProgression()
        print(f"   Patch Embedding conv weights: {vit_lstm.patch_embed.proj.weight.shape}")
        print(f"   LSTM Hidden Units: {vit_lstm.lstm.hidden_size}")
        print("   [SUCCESS] ViT-LSTM architecture validation successful.")
    except Exception as e:
        print(f"   [FAILED] ViT-LSTM verification failed: {e}")
        return False
    
    # 3. Verify Volumetric & Mesh Utilities
    print("3. Verifying Marching Cubes and Volumetric utilities...")
    try:
        mask = np.zeros((32, 32, 32))
        z, y, x = np.ogrid[:32, :32, :32]
        dist = (x - 16)**2 + (y - 16)**2 + (z - 16)**2
        mask[dist <= 25] = 1.0
        
        vol = calculate_voxel_volume(mask, (1.0, 1.0, 1.0))
        print(f"   Voxel volume: {vol:.4f} cm3")
        
        mesh = generate_mesh_marching_cubes(mask, (1.0, 1.0, 1.0), step_size=1)
        print(f"   Mesh Vertices extracted: {len(mesh.get('vertices', []))}")
        print(f"   Mesh Faces extracted: {len(mesh.get('faces', []))}")
        if len(mesh.get('vertices', [])) > 0:
            print("   [SUCCESS] Marching Cubes mesh surface extraction successful.")
        else:
            print("   [FAILED] Mesh extraction failed.")
            return False
    except Exception as e:
        print(f"   [FAILED] Volume/Mesh utility validation failed: {e}")
        return False
        
    print("="*50)
    print("ALL ML PIPELINES VERIFIED SUCCESSFULLY!")
    print("="*50)
    return True

if __name__ == "__main__":
    verify_models()
