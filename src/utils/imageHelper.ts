/**
 * Utility for compressing and converting user uploaded image files to optimized Base64 Data URLs
 * for direct storage in Firestore documents.
 */

export async function processImageFile(file: File, maxWidth = 900, maxHeight = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Draw image onto canvas with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as webp if supported, otherwise jpeg
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          if (dataUrl.startsWith('data:image/webp')) {
            resolve(dataUrl);
            return;
          }
        } catch {
          // fallback to jpeg
        }

        const fallbackUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(fallbackUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image file'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Creates SVG/Canvas placeholder graphic if needed
 */
export function createProducePlaceholder(title: string, category: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 600, 450);
  gradient.addColorStop(0, '#4A5D4E');
  gradient.addColorStop(1, '#2D3A30');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 450);

  // Category Icon / Emoji
  ctx.font = '72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let emoji = '🌱';
  if (category.includes('Veg')) emoji = '🍅';
  if (category.includes('Tub') || category.includes('Root')) emoji = '🥔';
  if (category.includes('Grain') || category.includes('Cereal')) emoji = '🌾';
  if (category.includes('Fruit')) emoji = '🍌';
  if (category.includes('Legum')) emoji = '🫘';
  ctx.fillText(emoji, 300, 180);

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(title.slice(0, 26), 300, 270);

  ctx.fillStyle = '#E5B25D';
  ctx.font = '18px sans-serif';
  ctx.fillText('Fresh Produce Batch • Direct Farm Gate', 300, 310);

  return canvas.toDataURL('image/jpeg', 0.85);
}
