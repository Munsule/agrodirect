import React, { useState } from 'react';
import { Listing } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { generateWhatsAppOrderUrl, formatPhoneNumberDisplay } from '../utils/orderHelper';
import { formatUploadTimeAgo } from '../utils/timeAgo';
import { ProduceMap } from './ProduceMap';
import { CheckoutModal } from './CheckoutModal';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Star, 
  Truck, 
  Calendar, 
  Layers, 
  Check, 
  Copy, 
  ExternalLink,
  Share2,
  Bookmark,
  Sparkles,
  ShoppingBag,
  Clock,
  Zap,
  CreditCard,
  Lock
} from 'lucide-react';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ listing, onClose }) => {
  const { 
    currency, 
    currentUser, 
    savedListingIds, 
    toggleBookmark, 
    placeOrder,
    setActiveTab,
    showToast 
  } = useMarketplace();

  if (!listing) return null;

  const [orderQuantity, setOrderQuantity] = useState('2 ' + (listing.unit.split(' ')[0] || 'units'));
  const [customNote, setCustomNote] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const uploadTime = formatUploadTimeAgo(listing.createdAt);
  const isSaved = savedListingIds.includes(listing.id);
  const isSoldOut = listing.status === 'sold';

  // WhatsApp template calculation
  const { url: whatsappUrl, text: whatsappMessageText } = generateWhatsAppOrderUrl({
    farmerPhone: listing.farmerPhone,
    farmerName: listing.farmerName,
    produceTitle: listing.title,
    price: listing.price,
    unit: listing.unit,
    currency,
    quantityToOrder: orderQuantity,
    buyerName: currentUser.name,
    buyerLocation: currentUser.location,
    customNote: customNote.trim() || undefined,
  });

  const handleLaunchWhatsApp = () => {
    if (isSoldOut) {
      showToast('This batch is sold out.');
      return;
    }

    placeOrder({
      listingId: listing.id,
      listingTitle: listing.title,
      listingImageUrl: listing.imageUrl,
      listingCategory: listing.category,
      farmerId: listing.farmerId,
      farmerName: listing.farmerName,
      farmerPhone: listing.farmerPhone,
      farmerLocation: listing.farmerLocation,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerPhone: currentUser.phone,
      buyerLocation: currentUser.location,
      quantityOrdered: orderQuantity,
      unitPrice: listing.price,
      totalAmount: listing.price * (parseFloat(orderQuantity.replace(/[^0-9.]/g, '')) || 1),
      notes: customNote.trim() || undefined,
    });

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCall = () => {
    if (isSoldOut) {
      showToast('This batch is sold out.');
      return;
    }
    window.location.href = `tel:${listing.farmerPhone}`;
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessageText);
    setCopiedMessage(true);
    showToast('WhatsApp order message copied to clipboard!');
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${listing.title} on Produce Marketplace`,
        text: `Check out ${listing.title} at ${currency}${listing.price}/${listing.unit} from ${listing.farmerName}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast('Listing URL copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2D3A30]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div 
        id="listing-detail-modal-card"
        onClick={e => e.stopPropagation()}
        className="bg-[#F8F9F5] text-[#2D3A30] w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden border border-[#E0E5DD] my-4 max-h-[92vh] flex flex-col"
      >
        
        {/* Modal Header */}
        <div className="bg-[#4A5D4E] text-white px-6 py-4 flex items-center justify-between border-b border-[#E0E5DD] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-white/15 text-[#E8F0E8] text-xs font-bold px-3 py-1 rounded-full border border-white/20">
              {listing.category}
            </span>
            <span className="text-xs text-[#D4E2D4] hidden sm:inline font-mono">
              #{listing.id.slice(-6)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toggleBookmark(listing.id);
                showToast(isSaved ? 'Removed from saved items' : 'Saved to favorites');
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-2xs ${
                isSaved ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isSaved ? 'Remove Bookmark' : 'Save Crop'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shadow-2xs"
              title="Share Listing"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#E5B25D]" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              id="close-detail-modal-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shadow-2xs"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          
          {/* Top Section: Media & Quick Specs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Image Preview */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#E8F0E8] border border-[#E0E5DD] shadow-inner">
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {isSoldOut && (
                  <div className="absolute inset-0 bg-[#2D3A30]/70 backdrop-blur-xs flex items-center justify-center">
                    <span className="bg-rose-600 text-white font-extrabold text-xs uppercase tracking-widest px-5 py-2 rounded-full shadow-xl">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Badges / Specs Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white p-3 rounded-2xl border border-[#E0E5DD]">
                  <div className="text-[11px] text-[#86A38B] font-bold">Time Uploaded</div>
                  <div className="text-xs font-extrabold text-[#2D3A30] flex items-center gap-1.5 mt-0.5" title={uploadTime.fullDate}>
                    <Clock className="w-4 h-4 text-[#E5B25D]" />
                    <span className="truncate">{uploadTime.relativeTime}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-[#E0E5DD]">
                  <div className="text-[11px] text-[#86A38B] font-bold">Available Stock</div>
                  <div className="text-sm font-extrabold text-[#2D3A30] flex items-center gap-1.5 mt-0.5">
                    <Layers className="w-4 h-4 text-[#4A5D4E]" />
                    <span>{listing.quantity}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-[#E0E5DD]">
                  <div className="text-[11px] text-[#86A38B] font-bold">Minimum Order</div>
                  <div className="text-sm font-extrabold text-[#2D3A30] flex items-center gap-1.5 mt-0.5">
                    <ShoppingBag className="w-4 h-4 text-[#E5B25D]" />
                    <span>{listing.minOrder || '1 ' + listing.unit}</span>
                  </div>
                </div>

                {listing.harvestDate ? (
                  <div className="bg-white p-3 rounded-2xl border border-[#E0E5DD]">
                    <div className="text-[11px] text-[#86A38B] font-bold">Freshness</div>
                    <div className="text-xs font-bold text-[#2D3A30] flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-4 h-4 text-[#4A5D4E]" />
                      <span>{listing.harvestDate}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded-2xl border border-[#E0E5DD]">
                    <div className="text-[11px] text-[#86A38B] font-bold">Farming Method</div>
                    <div className="text-xs font-bold text-[#4A5D4E] flex items-center gap-1.5 mt-0.5">
                      <Sparkles className="w-4 h-4 text-[#4A5D4E]" />
                      <span>{listing.farmingMethod || 'Standard'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Urgency Prompt for Fast Buying */}
              <div className="bg-[#FAF5ED] border border-[#E5B25D]/40 p-3.5 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E5B25D]/20 text-[#2D3A30] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 text-[#D97706]" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#2D3A30] flex items-center gap-1.5">
                    <span>Uploaded: {uploadTime.relativeTime}</span>
                    <span className="text-[10px] text-[#86A38B] font-normal">({uploadTime.fullDate})</span>
                  </div>
                  <p className="text-[11px] text-[#4A5D4E] mt-0.5 leading-relaxed">
                    Harvest stock is live on the marketplace. Buyers can contact this producer immediately on WhatsApp to negotiate direct farm-gate pricing and secure stock.
                  </p>
                </div>
              </div>
            </div>

            {/* Produce Information & Farmer Overview */}
            <div className="md:col-span-6 space-y-4">
              <div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#2D3A30] tracking-tight">
                    {currency}{(Math.round(listing.price * 1.05)).toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-[#86A38B]">
                    / {listing.unit}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3A30] leading-snug">
                  {listing.title}
                </h1>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#86A38B] font-semibold">
                  <MapPin className="w-4 h-4 text-[#4A5D4E] flex-shrink-0" />
                  <span>{listing.location}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-4 rounded-2xl border border-[#E0E5DD]">
                <h4 className="text-xs font-bold text-[#4A5D4E] uppercase tracking-wider mb-1.5">
                  About this Harvest
                </h4>
                <p className="text-xs sm:text-sm text-[#2D3A30] leading-relaxed">
                  {listing.description || 'Freshly picked harvest ready for immediate wholesale dispatch or market pickup.'}
                </p>
                {listing.deliveryAvailable && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-[#E5B25D]/20 text-[#2D3A30] border border-[#E5B25D]/40 px-3 py-1 rounded-full text-xs font-bold">
                    <Truck className="w-3.5 h-3.5 text-[#2D3A30]" />
                    <span>Delivery service can be arranged with farmer</span>
                  </div>
                )}
              </div>

              {/* Farmer Profile Card */}
              <div className="bg-[#4A5D4E] text-white p-4 rounded-2xl border border-[#E0E5DD]">
                <div className="text-[10px] text-[#D4E2D4] font-bold uppercase tracking-wider mb-2">
                  Verified Producer
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {listing.farmerAvatar ? (
                      <img
                        src={listing.farmerAvatar}
                        alt={listing.farmerName}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#86A38B]"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#2D3A30] flex items-center justify-center font-bold text-base">
                        {listing.farmerName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{listing.farmerName}</span>
                        <ShieldCheck className="w-4 h-4 text-[#E5B25D]" />
                      </div>
                      {listing.farmName && (
                        <p className="text-xs text-[#D4E2D4]">{listing.farmName}</p>
                      )}
                      <p className="text-[11px] text-white/80 font-mono mt-0.5">{listing.farmerPhone}</p>
                    </div>
                  </div>

                  {listing.farmerRating && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-bold text-[#D97706] bg-[#FDF1E6] px-2 py-1 rounded-full border border-[#FDE68A]">
                        <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                        <span>{listing.farmerRating}</span>
                      </div>
                      <span className="text-[10px] text-[#D4E2D4] block mt-1">Verified Seller</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Geographic Farm Hub Location Map */}
              {listing.coordinates && (
                <div className="bg-white p-3 rounded-2xl border border-[#E0E5DD] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#4A5D4E] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#4A5D4E]" />
                      <span>Farm Hub Coordinates</span>
                    </span>
                    <span className="text-[11px] text-[#86A38B] font-mono">
                      {listing.coordinates.lat.toFixed(4)}, {listing.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                  <ProduceMap 
                    listings={[listing]} 
                    onSelectListing={() => {}} 
                    className="h-44 w-full rounded-xl"
                    center={listing.coordinates}
                    defaultZoom={9}
                  />
                </div>
              )}

            </div>

          </div>

          {/* Bottom Section: Interactive Direct WhatsApp Order Builder */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#2D3A30]">
                    Direct WhatsApp Order Builder
                  </h3>
                  <p className="text-xs text-[#86A38B] font-semibold">
                    Configure your order inquiry to generate an instant WhatsApp message to {listing.farmerName}.
                  </p>
                </div>
              </div>
            </div>

            {/* Customizer Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1">
                  Desired Quantity:
                </label>
                <input
                  id="order-quantity-input"
                  type="text"
                  value={orderQuantity}
                  onChange={e => setOrderQuantity(e.target.value)}
                  placeholder="e.g. 5 crates, 10 bags..."
                  className="w-full bg-[#F8F9F5] text-xs font-bold text-[#2D3A30] px-3.5 py-2.5 rounded-2xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1">
                  Optional Note to Farmer:
                </label>
                <input
                  id="order-note-input"
                  type="text"
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  placeholder="e.g. Need delivered by Thursday morning"
                  className="w-full bg-[#F8F9F5] text-xs text-[#2D3A30] px-3.5 py-2.5 rounded-2xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            {/* WhatsApp Live Preview Box */}
            <div className="bg-[#2D3A30] text-[#D4E2D4] p-4 rounded-2xl text-xs font-mono relative border border-[#E0E5DD]">
              <div className="flex items-center justify-between text-[11px] text-[#D4E2D4] mb-2 font-sans">
                <span className="font-bold text-[#E5B25D]">WhatsApp Message Live Preview:</span>
                <button
                  onClick={handleCopyMessage}
                  className="text-white hover:text-white/80 flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-sans font-bold"
                >
                  {copiedMessage ? <Check className="w-3 h-3 text-[#E5B25D]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedMessage ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-white text-xs leading-relaxed bg-[#232d25] p-3 rounded-xl border border-white/10">
                {whatsappMessageText}
              </pre>
            </div>

            {/* Action CTA Buttons */}
            <div className="space-y-3 pt-2">
              
              {/* Primary Action: Buy & Pay Now via Paystack (In-App Escrow) */}
              <button
                id="modal-in-app-checkout-btn"
                onClick={() => setIsCheckoutOpen(true)}
                disabled={isSoldOut}
                className={`w-full py-4 px-6 rounded-full font-black text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-98 ${
                  isSoldOut
                    ? 'bg-[#E0E5DD] text-[#86A38B] cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Buy & Pay Now via Paystack (In-App Escrow)</span>
                <Lock className="w-4 h-4 ml-1 text-emerald-200" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp Inquiry Button */}
                <button
                  id="modal-launch-whatsapp-btn"
                  onClick={handleLaunchWhatsApp}
                  disabled={isSoldOut}
                  className={`w-full py-3 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                    isSoldOut
                      ? 'bg-[#E0E5DD] text-[#86A38B] cursor-not-allowed'
                      : 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xs'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enquire / Inspection on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
                </button>

                {/* Direct Phone Call Button */}
                <button
                  id="modal-direct-call-btn"
                  onClick={handleCall}
                  disabled={isSoldOut}
                  className="w-full py-3 px-4 rounded-full font-bold text-xs bg-white hover:bg-[#F8F9F5] text-[#2D3A30] border border-[#E0E5DD] flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#4A5D4E]" />
                  <span>Call {listing.farmerPhone}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Render In-App Paystack Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          listing={listing}
          initialQuantity={orderQuantity}
          initialNotes={customNote}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            onClose();
            setActiveTab('buyer-dashboard');
          }}
        />
      )}
    </div>
  );
};
