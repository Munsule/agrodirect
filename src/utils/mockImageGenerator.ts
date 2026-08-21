/**
 * Generates crisp, realistic produce illustrations as base64 Data URLs 
 * so all seeded mock items have 100% self-contained image data stored in Firestore.
 */

export function generateProduceBase64Image(title: string, category: string, primaryEmoji: string, bgHue: number): string {
  if (typeof document === 'undefined') {
    return 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect fill="%234A5D4E" width="800" height="600"/><text fill="%23FFFFFF" font-size="48" x="50%" y="50%" text-anchor="middle">Produce</text></svg>';
  }

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Organic Agro Gradient Background
  const gradient = ctx.createLinearGradient(0, 0, 800, 600);
  gradient.addColorStop(0, `hsl(${bgHue}, 25%, 28%)`);
  gradient.addColorStop(0.5, `hsl(${bgHue}, 20%, 18%)`);
  gradient.addColorStop(1, '#1A221C');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 600);

  // 2. Subtle Radial Sunlight glow
  const sunGlow = ctx.createRadialGradient(400, 260, 20, 400, 260, 320);
  sunGlow.addColorStop(0, 'rgba(229, 178, 93, 0.25)');
  sunGlow.addColorStop(0.6, 'rgba(134, 163, 139, 0.1)');
  sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, 800, 600);

  // 3. Central Crop Card Pedestal
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.ellipse(400, 430, 240, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. Produce Icon / Emoji
  ctx.font = '160px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(primaryEmoji, 400, 250);

  // 5. Category Pill
  ctx.fillStyle = '#E5B25D';
  ctx.beginPath();
  ctx.roundRect(280, 405, 240, 34, 17);
  ctx.fill();

  ctx.fillStyle = '#2D3A30';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(category.toUpperCase(), 400, 422);

  // 6. Produce Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title.slice(0, 34), 400, 480);

  // 7. Quality Stamp
  ctx.fillStyle = '#86A38B';
  ctx.font = '600 16px sans-serif';
  ctx.fillText('DIRECT FARM GATE • VERIFIED HARVEST', 400, 520);

  return canvas.toDataURL('image/jpeg', 0.88);
}
