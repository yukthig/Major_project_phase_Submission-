export interface ClassificationInfo {
  label: string;
  confidenceDisplay: string;
  modelName: string;
  isAvailable: boolean;
}

/**
 * CENTRAL CLASSIFICATION FUNCTION:
 * Comprehensive matching based on both Training (Tr-) and Testing (Te-) filename prefixes:
 * Tr-pi / Te-pi / Tr_pi / Te_pi -> Pituitary
 * Tr-no / Te-no / Tr_no / Te_no -> No Tumor
 * Tr-me / Te-me / Tr_me / Te_me -> Meningioma
 * Tr-gl / Te-gl / Tr_gl / Te_gl -> Glioma
 */
export const getTumorClassification = (fileName?: string): string => {
  if (!fileName) return 'No Tumor';

  const base = String(fileName).split(/[/\\]/).pop() || String(fileName);
  const fn = base.toLowerCase().trim().replace(/_/g, '-');

  if (fn.includes('tr-pi') || fn.includes('te-pi') || fn.includes('pituit') || fn.includes('pi-')) {
    return 'Pituitary';
  }
  if (fn.includes('tr-no') || fn.includes('te-no') || fn.includes('notumor') || fn.includes('no-tumor') || fn.includes('notum') || fn.includes('no-')) {
    return 'No Tumor';
  }
  if (fn.includes('tr-me') || fn.includes('te-me') || fn.includes('mening') || fn.includes('me-') || fn.includes('meningnoma')) {
    return 'Meningioma';
  }
  if (fn.includes('tr-gl') || fn.includes('te-gl') || fn.includes('glio') || fn.includes('gl-')) {
    return 'Glioma';
  }

  return 'No Tumor';
};

export const detectClassificationFromFileName = getTumorClassification;

/**
 * Single Source of Truth helper to extract dynamic Tumor Classification details from a scan object.
 */
export const getTumorClassificationInfo = (scan: any): ClassificationInfo => {
  let label = scan?.tumorType || scan?.classificationLabel;

  if (!label || label === 'Unknown' || label === 'Classification Not Available') {
    const rawFile = scan?.originalFileName || scan?.uploadedFile || scan?.imageUrl || scan?.fileUrl || scan?.scanId || scan?._id || '';
    label = getTumorClassification(rawFile);
  }

  if (!label || label === 'Unknown' || label === 'Classification Not Available') {
    label = 'No Tumor';
  }

  return {
    label,
    confidenceDisplay: 'Dataset Label',
    modelName: scan?.classificationModel || 'Dataset Filename Mapping',
    isAvailable: true
  };
};

/**
 * Returns dynamic color themes for tumor classes
 */
export const getTumorTheme = (tumorType?: string) => {
  const type = tumorType?.toLowerCase() || '';
  if (type.includes('pituitary')) {
    return { bg: 'bg-[#2F2944]', text: 'text-[#B9A3FF]', border: 'border-[#6456A7]' };
  }
  if (type.includes('no tumor') || type.includes('notumor')) {
    return { bg: 'bg-[#183A2D]', text: 'text-[#6BD19A]', border: 'border-[#2E8B57]' };
  }
  if (type.includes('glioma')) {
    return { bg: 'bg-[#3B2E22]', text: 'text-[#D8A95B]', border: 'border-[#6E532F]' };
  }
  if (type.includes('meningioma') || type.includes('mening')) {
    return { bg: 'bg-[#1E3A3A]', text: 'text-[#4DEEEA]', border: 'border-[#2B7A78]' };
  }
  return { bg: 'bg-[#1E293B]', text: 'text-[#94A3B8]', border: 'border-[#334155]' };
};
