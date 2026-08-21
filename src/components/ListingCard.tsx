import React from 'react';
import { Listing } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { generateWhatsAppOrderUrl } from '../utils/orderHelper';
import { formatUploadTimeAgo } from '../utils/timeAgo';
import { 
  MapPin, 
  MessageCircle, 
  Phone, 
  ShieldCheck, 
  Star, 
  Bookmark, 
  Truck, 
  Calendar,
  Layers,
  Clock,
  Zap,
  ArrowUpRight
} from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onOpenDetail: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onOpenDetail }) => {
  const { 
    currency, 
    currentUser, 
    savedListingIds, 
    toggleBookmark,
    showToast 
  } = useMarketplace();

  const isSaved = savedListingIds.includes(listing.id);
  const isSoldOut = listing.status === 'sold';
  const uploadTime = formatUploadTimeAgo(listing.createdAt);

  // Generate WhatsApp Quick Order URL
  const { url: whatsappUrl } = generateWhatsAppOrderUrl({
    farmerPhone: listing.farmerPhone,
    farmerName: listing.farmerName,
    produceTitle: listing.title,
    price: listing.price,
    unit: listing.unit,
    currency,
    buyerName: currentUser.name,
    buyerLocation: currentUser.location,
  });

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) {
      showToast('This produce batch is currently sold out.');
      return;
    }
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) {
      showToast('This produce batch is currently sold out.');
      return;
    }
    window.location.href = `tel:${listing.farmerPhone}`;
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(listing.id);
    showToast(isSaved ? 'Removed from saved items' : 'Saved to your favorites');
  };

  return (
    <div
      id={`listing-card-${listing.id}`}
      onClick={() => onOpenDetail(listing)}
      className={`group bg-white rounded-[28px] border border-[#E0E5DD] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 overflow-hidden cursor-pointer relative ${
        isSoldOut ? 'opacity-70 grayscale-[20%]' : ''
      }`}
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#E8F0E8] mb-4">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Category Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="bg-[#2D3A30]/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
              {listing.category}
            </span>
            {/* Upload Urgency Pill */}
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-md ${uploadTime.badgeColorClass}`}>
              {uploadTime.isFresh ? <Zap className="w-3 h-3 text-[#E5B25D] fill-current" /> : <Clock className="w-3 h-3" />}
              <span>{uploadTime.badgeLabel}</span>
            </span>
          </div>

          {/* Bookmark & Delivery Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            {listing.deliveryAvailable && (
              <span 
                className="bg-[#E5B25D] text-[#2D3A30] text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1"
                title="Farmer offers delivery"
              >
                <Truck className="w-3 h-3" />
                <span>Delivery</span>
              </span>
            )}

            <button
              id={`bookmark-btn-${listing.id}`}
              onClick={handleBookmarkClick}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xs ${
                isSaved
                  ? 'bg-rose-500 text-white'
                  : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
              title={isSaved ? 'Remove Bookmark' : 'Save Crop'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-[#2D3A30]/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-rose-600 text-white font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-white/20">
                Sold Out
              </span>
            </div>
          )}

          {/* Harvest Date & Timing Strip */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span className="bg-[#2D3A30]/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#E5B25D]" />
              <span>{listing.harvestDate || 'Fresh Harvest'}</span>
            </span>
            <span className="bg-[#2D3A30]/80 backdrop-blur-sm text-[#D4E2D4] text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#E5B25D]" />
              <span>{uploadTime.relativeTime}</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div>
          
          {/* Price & Unit (with 5% platform markup included) */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-extrabold text-[#2D3A30] tracking-tight">
                {currency}{(Math.round(listing.price * 1.05)).toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-[#86A38B]">
                / {listing.unit}
              </span>
            </div>

            {/* Quantity Stock Badge */}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A5D4E] bg-[#E8F0E8] px-2.5 py-0.5 rounded-full border border-[#D4E2D4]">
              <Layers className="w-3 h-3 text-[#4A5D4E]" />
              {listing.quantity}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-[#2D3A30] text-base leading-snug group-hover:text-[#4A5D4E] transition line-clamp-2">
            {listing.title}
          </h3>

          {/* Location & Upload Time Meta */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-[#86A38B] font-semibold">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#4A5D4E] flex-shrink-0" />
              <span className="truncate">{listing.location}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#4A5D4E] font-bold bg-[#F8F9F5] px-2 py-0.5 rounded-md border border-[#E0E5DD]" title={`Uploaded: ${uploadTime.fullDate}`}>
              <Clock className="w-3 h-3 text-[#E5B25D]" />
              <span>{uploadTime.relativeTime}</span>
            </div>
          </div>

          {/* Farmer Snippet */}
          <div className="mt-3.5 pt-3 border-t border-[#E0E5DD] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {listing.farmerAvatar ? (
                <img
                  src={listing.farmerAvatar}
                  alt={listing.farmerName}
                  className="w-6 h-6 rounded-full object-cover border border-[#86A38B] flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#E8F0E8] text-[#4A5D4E] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {listing.farmerName.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#2D3A30] truncate">
                    {listing.farmerName}
                  </span>
                  <ShieldCheck className="w-3 h-3 text-[#4A5D4E] flex-shrink-0" />
                </div>
                {listing.farmName && (
                  <p className="text-[10px] text-[#86A38B] truncate">{listing.farmName}</p>
                )}
              </div>
            </div>

            {listing.farmerRating && (
              <div className="flex items-center gap-1 text-xs font-bold text-[#D97706] bg-[#FDF1E6] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                <Star className="w-3 h-3 fill-[#D97706] text-[#D97706]" />
                <span>{listing.farmerRating}</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Action Button Bar */}
      <div className="mt-4 pt-3 border-t border-[#E0E5DD] grid grid-cols-1 sm:grid-cols-2 gap-2">
        
        {/* Quick WhatsApp Inquiry Button */}
        <button
          id={`quick-whatsapp-btn-${listing.id}`}
          onClick={handleWhatsAppClick}
          disabled={isSoldOut}
          className={`w-full py-2.5 px-3 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs ${
            isSoldOut
              ? 'bg-[#E0E5DD] text-[#86A38B] cursor-not-allowed'
              : 'bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white'
          }`}
          title="Launch WhatsApp to chat or enquire with farmer"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Chat / Enquire</span>
        </button>

        {/* Quick Call Button */}
        <button
          id={`quick-call-btn-${listing.id}`}
          onClick={handleCallClick}
          disabled={isSoldOut}
          className="w-full py-2.5 px-3 rounded-full font-bold text-xs border border-[#E0E5DD] text-[#2D3A30] hover:bg-[#E8F0E8] active:bg-[#D4E2D4] flex items-center justify-center gap-1.5 transition"
          title="Call Farmer Directly"
        >
          <Phone className="w-3.5 h-3.5 text-[#4A5D4E]" />
          <span>Call Farmer</span>
        </button>

      </div>
    </div>
  );
};
