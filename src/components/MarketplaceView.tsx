import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Listing } from '../types';
import { HeroBanner } from './HeroBanner';
import { ListingCard } from './ListingCard';
import { ProduceMap } from './ProduceMap';
import { generateWhatsAppOrderUrl } from '../utils/orderHelper';
import { 
  Store, 
  Sparkles, 
  Bookmark, 
  Layers, 
  Search, 
  X, 
  ArrowUpDown, 
  RefreshCw, 
  MapPin,
  CheckCircle2,
  MessageCircle,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  ShieldCheck,
  Truck,
  LayoutGrid,
  Map as MapIcon,
  Columns
} from 'lucide-react';

interface MarketplaceViewProps {
  onOpenDetail: (listing: Listing) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onOpenDetail }) => {
  const { 
    listings, 
    filters, 
    setFilters, 
    savedListingIds, 
    currentUser,
    currency,
    setActiveTab 
  } = useMarketplace();

  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'split'>('grid');

  // Apply filters
  const filteredListings = listings.filter(item => {
    // Saved filter
    if (showSavedOnly && !savedListingIds.includes(item.id)) {
      return false;
    }

    // Search keyword query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchLocation = item.location.toLowerCase().includes(q);
      const matchFarmer = item.farmerName.toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCategory && !matchLocation && !matchFarmer && !matchDesc) {
        return false;
      }
    }

    // Category filter
    if (filters.category && item.category !== filters.category) {
      return false;
    }

    // Location filter
    if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Delivery only filter
    if (filters.deliveryOnly && !item.deliveryAvailable) {
      return false;
    }

    return true;
  });

  // Apply sorting
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (filters.sortBy === 'price_low') {
      return a.price - b.price;
    }
    if (filters.sortBy === 'price_high') {
      return b.price - a.price;
    }
    // Newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Featured listing for Hero Bento (pick first available active crop)
  const featuredListing = listings.find(l => l.status === 'active') || listings[0];

  const { url: featuredWhatsAppUrl } = featuredListing ? generateWhatsAppOrderUrl({
    farmerPhone: featuredListing.farmerPhone,
    farmerName: featuredListing.farmerName,
    produceTitle: featuredListing.title,
    price: featuredListing.price,
    unit: featuredListing.unit,
    currency,
    buyerName: currentUser.name,
    buyerLocation: currentUser.location,
  }) : { url: '' };

  const recentListings = listings.slice(0, 3);
  const activeFarmersCount = new Set(listings.map(l => l.farmerId)).size;

  return (
    <div className="min-h-screen bg-[#F8F9F5] pb-24 text-[#2D3A30]">
      
      {/* Top Filter Bar */}
      <HeroBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        
        {/* Bento Grid Showcase (Shown when browsing all crops or no search active) */}
        {!filters.searchQuery && !filters.category && !filters.location && !showSavedOnly && featuredListing && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Main Featured Listing (Bento 2x2 on Desktop) */}
            <div 
              onClick={() => onOpenDetail(featuredListing)}
              className="lg:col-span-2 lg:row-span-2 bg-white rounded-[32px] p-6 sm:p-8 border border-[#E0E5DD] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative cursor-pointer group"
            >
              <div className="absolute top-6 right-6 z-10">
                <span className="bg-[#FDF1E6] text-[#D97706] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-2xs">
                  Fresh Harvest
                </span>
              </div>

              <div>
                <div className="h-52 w-full rounded-2xl mb-6 overflow-hidden bg-[#E8F0E8] relative">
                  <img
                    src={featuredListing.imageUrl}
                    alt={featuredListing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 bg-[#2D3A30]/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E5B25D]" />
                    <span>Featured Nigerian Producer Batch</span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-[#2D3A30] group-hover:text-[#4A5D4E] transition">
                  {featuredListing.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-2 text-[#86A38B] text-xs sm:text-sm font-semibold mb-4">
                  <div className="flex items-center gap-1 text-[#2D3A30]">
                    <MapPin className="w-4 h-4 text-[#4A5D4E]" />
                    <span>{featuredListing.location}</span>
                  </div>
                  <span>•</span>
                  <span>{featuredListing.farmerName}</span>
                  <span>•</span>
                  <span className="text-[#4A5D4E] bg-[#E8F0E8] px-2 py-0.5 rounded-full text-xs">
                    {featuredListing.quantity}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-[#E0E5DD]">
                <div>
                  <p className="text-xs text-[#86A38B] font-bold uppercase tracking-wider">Direct Farm Price (Naira)</p>
                  <p className="text-3xl font-extrabold text-[#2D3A30]">
                    {currency}{featuredListing.price.toLocaleString()} <span className="text-base font-medium text-[#86A38B]">/ {featuredListing.unit}</span>
                  </p>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(featuredWhatsAppUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="bg-[#25D366] text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-98 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order via WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Statistics (Bento 1x1) */}
            <div className="col-span-1 bg-[#4A5D4E] rounded-[32px] p-6 text-white flex flex-col justify-between shadow-sm min-h-[220px]">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Live Market
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-80">Active Harvests</h3>
                <p className="text-4xl font-extrabold tracking-tight mt-1">{listings.length}</p>
                <p className="text-xs mt-1 text-[#D4E2D4]">
                  Across {activeFarmersCount} verified Nigerian agro-hubs
                </p>
              </div>
            </div>

            {/* Categories Bento Tile (1x1) */}
            <div className="col-span-1 bg-white rounded-[32px] p-6 border border-[#E0E5DD] shadow-sm flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-base text-[#2D3A30]">Categories</h3>
                  <span className="text-[11px] text-[#86A38B] font-bold">Fast filter</span>
                </div>
                <div className="space-y-1.5">
                  <div 
                    onClick={() => setFilters(prev => ({ ...prev, category: 'Grains & Cereals' }))}
                    className="flex items-center justify-between p-2 hover:bg-[#F8F9F5] rounded-xl cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center text-xs">🌾</span>
                      <span className="text-xs font-bold text-[#2D3A30]">Grains & Maize</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#86A38B]" />
                  </div>

                  <div 
                    onClick={() => setFilters(prev => ({ ...prev, category: 'Tubers & Roots' }))}
                    className="flex items-center justify-between p-2 hover:bg-[#F8F9F5] rounded-xl cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 bg-orange-100 text-orange-800 rounded-lg flex items-center justify-center text-xs">🥔</span>
                      <span className="text-xs font-bold text-[#2D3A30]">Yams & Tubers</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#86A38B]" />
                  </div>

                  <div 
                    onClick={() => setFilters(prev => ({ ...prev, category: 'Vegetables' }))}
                    className="flex items-center justify-between p-2 hover:bg-[#F8F9F5] rounded-xl cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 bg-green-100 text-green-800 rounded-lg flex items-center justify-center text-xs">🍅</span>
                      <span className="text-xs font-bold text-[#2D3A30]">Fresh Vegetables</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#86A38B]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Interactive Produce Radar (Bento 2x1) */}
            <div className="lg:col-span-2 bg-white rounded-[32px] p-4 border border-[#E0E5DD] shadow-sm flex flex-col justify-between overflow-hidden">
              <ProduceMap 
                listings={listings} 
                onSelectListing={onOpenDetail} 
                className="h-64 w-full rounded-2xl" 
              />
            </div>

            {/* Quick Listings Feed (Bento 1x1) */}
            <div className="col-span-1 bg-white rounded-[32px] p-6 border border-[#E0E5DD] shadow-sm flex flex-col justify-between min-h-[200px]">
              <div>
                <h3 className="font-extrabold text-sm text-[#2D3A30] mb-3">Recent Posts</h3>
                <div className="space-y-3">
                  {recentListings.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => onOpenDetail(item)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-xl object-cover border border-[#E0E5DD]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#2D3A30] group-hover:text-[#4A5D4E] truncate">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-[#86A38B] truncate">
                          {item.location.split(',')[0]} • {currency}{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => setFilters(prev => ({ ...prev, sortBy: 'newest' }))}
                className="w-full text-center text-xs font-bold text-[#4A5D4E] mt-3 pt-3 border-t border-dashed border-[#E0E5DD] hover:underline"
              >
                View All Recent
              </button>
            </div>

            {/* Seller CTA (Bento 1x1) */}
            <div className="col-span-1 bg-[#E5B25D] rounded-[32px] p-6 text-[#2D3A30] flex flex-col justify-between shadow-sm min-h-[200px]">
              <div>
                <h3 className="text-2xl font-black leading-tight tracking-tight">START<br/>SELLING.</h3>
                <p className="text-xs font-semibold mt-1 opacity-90">List your harvest in under 60 seconds.</p>
              </div>
              <button 
                onClick={() => setActiveTab('create')}
                className="w-full bg-[#2D3A30] hover:bg-black text-white py-3 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post a Produce Batch</span>
              </button>
            </div>

          </section>
        )}

        {/* Results Metadata & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-2 border-b border-[#E0E5DD]">
          
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2D3A30] flex items-center gap-2">
              <span>All Produce Listings</span>
              <span className="text-xs font-bold text-[#4A5D4E] bg-[#E8F0E8] px-3 py-1 rounded-full border border-[#D4E2D4]">
                {sortedListings.length} Available
              </span>
            </h2>

            {filters.location && (
              <span className="text-xs font-bold text-[#4A5D4E] flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-[#E0E5DD] shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>{filters.location}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle: Grid / Map / Split */}
            <div className="bg-white p-1 rounded-full border border-[#E0E5DD] flex items-center shadow-2xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition ${
                  viewMode === 'grid' 
                    ? 'bg-[#4A5D4E] text-white shadow-xs' 
                    : 'text-[#86A38B] hover:text-[#2D3A30]'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition ${
                  viewMode === 'split' 
                    ? 'bg-[#4A5D4E] text-white shadow-xs' 
                    : 'text-[#86A38B] hover:text-[#2D3A30]'
                }`}
                title="Split Map & Grid View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Split</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition ${
                  viewMode === 'map' 
                    ? 'bg-[#4A5D4E] text-white shadow-xs' 
                    : 'text-[#86A38B] hover:text-[#2D3A30]'
                }`}
                title="Interactive Google Map View"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Map</span>
              </button>
            </div>

            {/* Toggle Saved Bookmarks Button */}
            <button
              id="toggle-favorites-filter-btn"
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition shadow-2xs ${
                showSavedOnly
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white text-[#2D3A30] hover:bg-[#E8F0E8] border border-[#E0E5DD]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-current' : ''}`} />
              <span>Saved ({savedListingIds.length})</span>
            </button>
          </div>

        </div>

        {/* View Mode Layouts */}
        {sortedListings.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center border border-[#E0E5DD] shadow-sm max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F0E8] text-[#4A5D4E] flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
              🌾
            </div>
            <h3 className="text-lg font-bold text-[#2D3A30]">
              No produce matching your criteria
            </h3>
            <p className="text-xs sm:text-sm text-[#86A38B] mt-1 mb-6">
              Try adjusting your search terms, changing the location, or resetting the category filter.
            </p>
            <button
              onClick={() => {
                setFilters({
                  searchQuery: '',
                  category: '',
                  location: '',
                  sortBy: 'newest',
                  farmingMethod: '',
                  deliveryOnly: false,
                });
                setShowSavedOnly(false);
              }}
              className="px-6 py-3 rounded-full bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-bold text-xs shadow-sm transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'map' ? (
          /* Full Google Maps Exploration View */
          <div className="bg-white rounded-[32px] p-4 border border-[#E0E5DD] shadow-sm">
            <ProduceMap 
              listings={sortedListings} 
              onSelectListing={onOpenDetail} 
              className="h-[600px] w-full rounded-2xl" 
            />
          </div>
        ) : viewMode === 'split' ? (
          /* Split View: Google Map + Cards Side by Side */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 sticky top-24">
              <ProduceMap 
                listings={sortedListings} 
                onSelectListing={onOpenDetail} 
                className="h-[580px] w-full rounded-2xl shadow-sm" 
              />
            </div>
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-1">
              {sortedListings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Standard Responsive Bento Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

