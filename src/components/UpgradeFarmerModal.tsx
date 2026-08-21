import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { 
  X, 
  Sprout, 
  MapPin, 
  Building, 
  Check, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Truck,
  Leaf
} from 'lucide-react';

interface UpgradeFarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_NIGERIAN_AGRO_LOCATIONS = [
  'Ibadan / Oyo Agricultural Corridor',
  'Gboko / Benue Food Basket',
  'Dawanau Grain Market, Kano',
  'Jos Highlands, Plateau State',
  'Mile 12 Market / Lagos Hub',
  'Sagamu / Ogun Agri-Belt',
  'Zaria / Kaduna Grain Depot',
  'Abuja / FCT Agro Corridor',
  'Onitsha / Anambra Commercial Depot',
];

const POPULAR_CROPS_LIST = [
  'Roma Tomatoes',
  'Benue Yams',
  'Dry Yellow Maize',
  'Sombo / Ata Rodo',
  'Oloyin Honey Beans',
  'Green Plantains',
  'Cassava Roots',
  'Highland Potatoes',
  'Fresh Habanero Peppers',
  'Palm Oil (Jerrycans)',
  'Onions (Red)',
  'Rice (Paddy/Milled)',
];

export const UpgradeFarmerModal: React.FC<UpgradeFarmerModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, upgradeToFarmer, showToast, setActiveTab } = useMarketplace();

  const [farmName, setFarmName] = useState(currentUser.farmName || `${currentUser.name}'s Farm Gate`);
  const [location, setLocation] = useState(currentUser.location || 'Ibadan / Oyo Agricultural Corridor');
  const [customLocation, setCustomLocation] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(
    currentUser.primaryCrops && currentUser.primaryCrops.length > 0
      ? currentUser.primaryCrops
      : ['Roma Tomatoes', 'Benue Yams']
  );
  const [customCropInput, setCustomCropInput] = useState('');
  const [canDeliver, setCanDeliver] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  const handleAddCustomCrop = () => {
    if (!customCropInput.trim()) return;
    const cleanCrop = customCropInput.trim();
    if (!selectedCrops.includes(cleanCrop)) {
      setSelectedCrops(prev => [...prev, cleanCrop]);
    }
    setCustomCropInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) {
      showToast('Please enter your farm or enterprise name');
      return;
    }

    const finalLocation = customLocation.trim() || location;

    setIsSubmitting(true);
    try {
      await upgradeToFarmer({
        farmName: farmName.trim(),
        location: finalLocation.trim(),
        primaryCrops: selectedCrops.length > 0 ? selectedCrops : ['Vegetables', 'Tubers'],
        canDeliver,
      });

      onClose();
      // Navigate to create listing immediately so they can post right away
      setActiveTab('create');
    } catch (err) {
      console.error('Upgrade error:', err);
      showToast('Upgrade failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2D3A30]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div 
        id="upgrade-farmer-modal"
        onClick={e => e.stopPropagation()}
        className="bg-[#F8F9F5] text-[#2D3A30] w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-[#E0E5DD] max-h-[92vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="bg-[#4A5D4E] text-white p-6 sm:p-7 flex items-center justify-between border-b border-[#3D4D40] flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#E5B25D] flex items-center justify-center border border-white/20 shadow-2xs">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl text-white leading-tight">
                  Upgrade to Farmer Account
                </h3>
                <span className="bg-[#E5B25D] text-[#2D3A30] text-[10px] font-black px-2 py-0.5 rounded-full">
                  Free
                </span>
              </div>
              <p className="text-xs text-[#D4E2D4] font-medium mt-0.5">
                Enable harvest listings, manage orders, and connect with wholesale buyers.
              </p>
            </div>
          </div>

          <button
            id="close-upgrade-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full text-white bg-white/10 hover:bg-white/20 flex items-center justify-center transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Account Summary Card */}
        <div className="bg-white px-6 py-3.5 border-b border-[#E0E5DD] flex items-center justify-between text-xs text-[#2D3A30]">
          <div>
            <span className="text-[#86A38B] font-medium">Upgrading profile for: </span>
            <span className="font-extrabold text-[#2D3A30]">{currentUser.name}</span>
          </div>
          <div className="font-mono text-[#4A5D4E] font-bold">
            {currentUser.phone}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          
          <div className="bg-[#FAF5ED] p-4 rounded-2xl border border-[#E5B25D]/40 text-xs text-[#4A5D4E] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#E5B25D] flex-shrink-0 mt-0.5" />
            <span>
              Your personal details and phone number will remain linked to your account. Fill in your farm details below to start listing harvests immediately.
            </span>
          </div>

          {/* Farm / Enterprise Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2D3A30] flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>Farm Gate or Agro Hub Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={farmName}
              onChange={e => setFarmName(e.target.value)}
              placeholder="e.g. Greenfield Organic Farm Gate, Bello Agro Hub"
              className="w-full text-xs sm:text-sm bg-white text-[#2D3A30] px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:outline-none transition"
            />
          </div>

          {/* Farm Location / Agricultural Belt */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#2D3A30] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>Farm Location / Agricultural Belt</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white text-[#2D3A30] px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:outline-none transition cursor-pointer"
            >
              {COMMON_NIGERIAN_AGRO_LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <input
              type="text"
              value={customLocation}
              onChange={e => setCustomLocation(e.target.value)}
              placeholder="Or type specific village / town / LGA (Optional)"
              className="w-full text-xs bg-white text-[#2D3A30] px-3.5 py-2 rounded-xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:outline-none transition mt-1"
            />
          </div>

          {/* Primary Crops Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#2D3A30] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>Primary Crops / Produce Harvested:</span>
              </span>
              <span className="text-[10px] text-[#86A38B] font-semibold">
                {selectedCrops.length} selected
              </span>
            </label>

            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CROPS_LIST.map(crop => {
                const isSelected = selectedCrops.includes(crop);
                return (
                  <button
                    type="button"
                    key={crop}
                    onClick={() => toggleCrop(crop)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#4A5D4E] text-white border-[#4A5D4E]'
                        : 'bg-white text-[#2D3A30] border-[#E0E5DD] hover:bg-[#E8F0E8]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{crop}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Crop Adder */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customCropInput}
                onChange={e => setCustomCropInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCrop(); }}}
                placeholder="Add other crop (e.g. Soya Beans, Cashews)"
                className="flex-1 text-xs bg-white text-[#2D3A30] px-3 py-1.5 rounded-lg border border-[#E0E5DD] focus:border-[#4A5D4E] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomCrop}
                className="bg-[#4A5D4E] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#3d4d40] transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Delivery / Bulk Transportation Checkbox */}
          <div className="pt-2 border-t border-[#E0E5DD]">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-[#2D3A30] cursor-pointer">
              <input
                type="checkbox"
                checked={canDeliver}
                onChange={e => setCanDeliver(e.target.checked)}
                className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E] w-4 h-4"
              />
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>I can arrange truck loading / haulage for wholesale buyer orders</span>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-black text-sm rounded-full shadow-md transition flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Sprout className="w-5 h-5 text-[#E5B25D]" />
            <span>Confirm Upgrade & Start Listing Produce</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-[#E0E5DD] flex items-center justify-between text-[11px] text-[#86A38B] font-medium flex-shrink-0">
          <div className="flex items-center gap-1 text-[#4A5D4E] font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Instant Role Activation • Direct WhatsApp Buyers</span>
          </div>
          <span>AgroDirect NG</span>
        </div>

      </div>
    </div>
  );
};
