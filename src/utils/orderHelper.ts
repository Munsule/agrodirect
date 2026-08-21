export function cleanPhoneNumber(phone: string): string {
  // Remove spaces, parentheses, hyphens
  let cleaned = phone.replace(/[\s\-()]/g, '');
  // If no plus and starts with country code or local
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

export function formatPhoneNumberDisplay(phone: string): string {
  return phone;
}

export function generateWhatsAppOrderUrl({
  farmerPhone,
  farmerName,
  produceTitle,
  price,
  unit,
  currency,
  quantityToOrder,
  buyerName,
  buyerLocation,
  customNote,
}: {
  farmerPhone: string;
  farmerName: string;
  produceTitle: string;
  price: number;
  unit: string;
  currency: string;
  quantityToOrder?: string;
  buyerName?: string;
  buyerLocation?: string;
  customNote?: string;
}): { url: string; text: string } {
  const cleanPhone = cleanPhoneNumber(farmerPhone);

  const greeting = `Hello ${farmerName || 'Farmer'},`;
  const intent = `I saw your listing on Produce Marketplace for *${produceTitle}* (${currency}${price} per ${unit}).`;
  const quantityPart = quantityToOrder ? `\n\n📦 *Order Quantity Request:* ${quantityToOrder}` : '';
  const buyerPart = buyerName ? `\n👤 *Buyer Name:* ${buyerName}` : '';
  const locationPart = buyerLocation ? `\n📍 *Delivery/Pickup Location:* ${buyerLocation}` : '';
  const notePart = customNote ? `\n💬 *Note:* ${customNote}` : '';
  const closing = `\n\nIs this produce still available? I would like to arrange pickup or delivery. Thank you!`;

  const fullMessage = `${greeting}\n\n${intent}${quantityPart}${buyerPart}${locationPart}${notePart}${closing}`;
  const encodedMessage = encodeURIComponent(fullMessage);
  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  return {
    url,
    text: fullMessage,
  };
}
