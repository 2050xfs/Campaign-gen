
import JSZip from 'jszip';
import { AssetState } from '../types';

async function getAssetBlob(asset: AssetState): Promise<{ blob: Blob; filename: string }> {
  let url: string;
  let fileExtension: string;

  if (asset.videoUrl) {
    url = asset.videoUrl;
    // Assuming mp4 for now, VEO returns mp4
    fileExtension = 'mp4';
  } else {
    url = asset.imageUrl;
    fileExtension = asset.mimeType.split('/')[1] || 'png';
  }
  
  const response = await fetch(url);
  const blob = await response.blob();
  const filename = `${asset.idea.section.replace(/\s+/g, '_').toLowerCase()}.${fileExtension}`;
  
  return { blob, filename };
}

export const downloadSingleAsset = async (asset: AssetState) => {
    const { blob, filename } = await getAssetBlob(asset);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

export const downloadZip = async (assets: AssetState[]) => {
  const zip = new JSZip();
  
  const assetPromises = assets.map(asset => getAssetBlob(asset));
  const assetData = await Promise.all(assetPromises);

  assetData.forEach(({ blob, filename }) => {
    zip.file(filename, blob);
  });
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = 'ui-assets.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
