import numpy as np
from skimage import measure

def calculate_voxel_volume(mask, spacing=(1.0, 1.0, 1.0)):
    """
    Computes the volume of the tumor in cubic centimeters (cm3).
    Formula: voxel_count * dx * dy * dz / 1000.0
    """
    voxel_count = np.sum(mask > 0.5)
    voxel_volume_mm3 = voxel_count * spacing[0] * spacing[1] * spacing[2]
    voxel_volume_cm3 = voxel_volume_mm3 / 1000.0
    return float(voxel_volume_cm3)

def generate_mesh_marching_cubes(mask, spacing=(1.0, 1.0, 1.0), step_size=2):
    """
    Applies the Marching Cubes algorithm to generate a 3D mesh (vertices, faces, normals)
    from the binary tumor mask.
    """
    if np.sum(mask > 0.5) < 10:
        return {"vertices": [], "faces": [], "normals": []}
        
    try:
        verts, faces, normals, values = measure.marching_cubes(
            mask, 
            level=0.5, 
            spacing=spacing, 
            step_size=step_size
        )
        
        center = np.mean(verts, axis=0)
        verts_centered = verts - center
        
        return {
            "vertices": verts_centered.tolist(),
            "faces": faces.tolist(),
            "normals": normals.tolist(),
            "center": center.tolist()
        }
    except Exception as e:
        print(f"Marching Cubes error: {e}")
        return {"vertices": [], "faces": [], "normals": []}

def calculate_growth_metrics(historical_volumes, time_deltas):
    """
    Calculates growth percentage and growth rate between sequential scans.
    historical_volumes: list of volumes in cm3 (e.g. [V_0, V_1, ...])
    time_deltas: list of time gaps in months (e.g. [t_1, t_2, ...])
    """
    if len(historical_volumes) < 2:
        return {
            "growth_percentage": 0.0,
            "growth_rate_cm3_month": 0.0,
            "growth_rate_text": "N/A — Insufficient scans",
            "trends": []
        }
        
    trends = []
    for i in range(1, len(historical_volumes)):
        v_prev = historical_volumes[i-1]
        v_curr = historical_volumes[i]
        dt = time_deltas[i-1] if i-1 < len(time_deltas) else 3.0
        
        pct_change = ((v_curr - v_prev) / v_prev * 100.0) if v_prev > 0 else 0.0
        rate = (v_curr - v_prev) / dt if dt > 0 else 0.0
        
        trends.append({
            "from_index": i-1,
            "to_index": i,
            "growth_percentage": float(pct_change),
            "growth_rate": float(rate),
            "time_delta_months": float(dt)
        })
        
    v_first = historical_volumes[0]
    v_last = historical_volumes[-1]
    total_time = sum(time_deltas) if time_deltas else 0.0
    
    total_pct_change = ((v_last - v_first) / v_first * 100.0) if v_first > 0 else 0.0
    
    if abs(v_last - v_first) < 1e-6:
        overall_rate = 0.0
        rate_text = "0.000 cm³/month (Stable)"
    elif total_time <= 0.0:
        overall_rate = 0.0
        rate_text = "N/A — Same-day scans"
    else:
        overall_rate = (v_last - v_first) / total_time
        rate_text = f"{'+' if overall_rate > 0 else ''}{overall_rate:.3f} cm³/month"
    
    return {
        "growth_percentage": float(total_pct_change),
        "growth_rate_cm3_month": float(overall_rate),
        "growth_rate_text": rate_text,
        "trends": trends
    }
