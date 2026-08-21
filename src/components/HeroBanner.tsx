import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CATEGORY_PRESETS } from '../data/mockData';
import { Search, MapPin, SlidersHorizontal, Sparkles, X, Check, Truck, ArrowUpDown } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { filters, setFilters, listings } = useMarketplace();

  // Unique locations from current listings
  const availableLocations = Array.from(new Set(listings.map(l => l.location.split(',')[0].trim()))).filter(Boolean);

  const activeFilterCount = [
    filters.category,
    filters.location,
    filters.deliveryOnly,
    filters.farmingMethod,
    filters.sortBy !== 'newest',
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setFilters(prev => ({
      ...prev,
      searchQuery: '',
      category: '',
      location: '',
      farmingMethod: '',
      deliveryOnly: false,
      sortBy: 'newest',
    }));
  };

  return (
    <div className="pt-6 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Search & Location Filter Bento Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-[28px] border border-[#E0E5DD] shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3">
            
            {/* Search Input Pill */}
            <div className="md:col-span-6 relative flex items-center bg-[#F8F9F5] rounded-full px-4 py-3 border border-[#E0E5DD] focus-within:border-[#4A5D4E] focus-within:ring-2 focus-within:ring-[#4A5D4E]/10 transition-all">
              <Search className="w-4 h-4 text-[#86A38B] mr-3 flex-shrink-0" />
              <input
                id="search-produce-input"
                type="text"
                value={filters.searchQuery}
                onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search produce (e.g. Tomatoes, Cassava, Maize, Onions)..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#2D3A30] placeholder:text-[#86A38B] focus:outline-none font-medium"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  className="text-[#86A38B] hover:text-[#2D3A30] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Location Selector Pill */}
            <div className="md:col-span-3 relative flex items-center bg-[#F8F9F5] rounded-full px-4 py-3 border border-[#E0E5DD] focus-within:border-[#4A5D4E] focus-within:ring-2 focus-within:ring-[#4A5D4E]/10 transition-all">
              <MapPin className="w-4 h-4 text-[#4A5D4E] mr-2.5 flex-shrink-0" />
              <select
                id="location-filter-select"
                value={filters.location}
                onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full bg-transparent text-xs sm:text-sm text-[#2D3A30] focus:outline-none font-medium cursor-pointer"
              >
                <option value="">All Regions & Towns</option>
                {availableLocations.map(loc => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter Pill */}
            <div className="md:col-span-3 flex items-center">
              <select
                id="sort-by-select"
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full bg-[#E8F0E8] text-[#2D3A30] font-bold text-xs py-3 px-4 rounded-full border border-[#D4E2D4] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/20 cursor-pointer"
              >
                <option value="newest">⚡ Newest Harvests</option>
                <option value="price_low">💰 Price: Low to High</option>
                <option value="price_high">💎 Price: High to Low</option>
              </select>
            </div>

          </div>
        </div>

        {/* Category Pills & Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORY_PRESETS.map(cat => {
            const isSelected = filters.category === cat.value;
            return (
              <button
                key={cat.name}
                id={`cat-filter-${cat.value || 'all'}`}
                onClick={() => setFilters(prev => ({ ...prev, category: cat.value }))}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#4A5D4E] text-white shadow-sm scale-102'
                    : 'bg-white text-[#2D3A30] hover:bg-[#E8F0E8] border border-[#E0E5DD]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}

          {/* Delivery Filter Toggle */}
          <button
            id="filter-delivery-toggle"
            onClick={() => setFilters(prev => ({ ...prev, deliveryOnly: !prev.deliveryOnly }))}
            className={`ml-auto px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filters.deliveryOnly
                ? 'bg-[#E5B25D] text-[#2D3A30] shadow-sm'
                : 'bg-white text-[#2D3A30] hover:bg-[#E8F0E8] border border-[#E0E5DD]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery Available</span>
            {filters.deliveryOnly && <Check className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button
              id="clear-all-filters-btn"
              onClick={handleClearFilters}
              className="text-xs text-[#86A38B] hover:text-[#2D3A30] font-bold px-2 py-1 flex items-center gap-1 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset ({activeFilterCount})</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
