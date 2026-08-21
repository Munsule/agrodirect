import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { User, UserRole } from '../types';
import { 
  X, 
  User as UserIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Sprout, 
  Camera, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Save
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile, showToast } = useMarketplace();

  if (!isOpen) return null;

  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [farmName, setFarmName] = useState(currentUser.farmName || '');
  const [primaryCrops, setPrimaryCrops] = useState<string[]>(currentUser.primaryCrops || ['Vegetables', 'Tubers']);
  const [buyerType, setBuyerType] = useState<User['buyerType']>(currentUser.buyerType || 'Wholesale Merchant');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(currentUser.name || '');
    setPhone(currentUser.phone || '');
    setEmail(currentUser.email || '');
    setLocation(currentUser.location || '');
    setFarmName(currentUser.farmName || '');
    setPrimaryCrops(currentUser.primaryCrops || ['Vegetables', 'Tubers']);
    setBuyerType(currentUser.buyerType || 'Wholesale Merchant');
    setAvatarUrl(currentUser.avatarUrl || '');
  }, [currentUser]);

  const handleCropToggle = (crop: string) => {
    setPrimaryCrops(prev => 
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        showToast('Profile photo selected');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !location.trim()) {
      showToast('Please fill in required fields (Name, Phone, Location)');
      return;
    }

    setIsSaving(true);
    try {
      const updates: Partial<User> = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        location: location.trim(),
        avatarUrl: avatarUrl || undefined,
      };

      if (currentUser.role === 'farmer') {
        updates.farmName = farmName.trim() || `${name.trim()}'s Farm Gate`;
        updates.primaryCrops = primaryCrops;
      } else if (currentUser.role === 'buyer') {
        updates.buyerType = buyerType;
        updates.farmName = farmName.trim() || undefined;
      }

      await updateUserProfile(updates);
      setIsSaving(false);
      onClose();
    } catch (error) {
      setIsSaving(false);
      showToast('Failed to save profile changes');
    }
  };

  const cropOptions = ['Vegetables', 'Tubers & Roots', 'Grains & Cereals', 'Fruits', 'Legumes & Pulses', 'Herbs & Spices'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] max-w-xl w-full border border-[#E0E5DD] shadow-2xl overflow-hidden relative text-[#2D3A30] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#4A5D4E] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5B25D] text-[#2D3A30] flex items-center justify-center font-extrabold shadow-xs">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black">Edit Account Profile</h2>
                <span className="text-[10px] bg-white/20 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-[#D4E2D4] font-medium">Update your account identity & location</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Avatar & Photo Picker */}
          <div className="flex items-center gap-4 bg-[#F8F9F5] p-4 rounded-2xl border border-[#E0E5DD]">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#86A38B] shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#2D3A30] text-white text-2xl font-black flex items-center justify-center border-2 border-[#86A38B]">
                  {name.charAt(0) || 'U'}
                </div>
              )}
              <label 
                htmlFor="avatar-photo-input"
                className="absolute inset-0 bg-black/40 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                <Camera className="w-5 h-5" />
              </label>
              <input
                id="avatar-photo-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-xs font-extrabold text-[#2D3A30]">Profile Photo URL or Upload:</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-white px-3 py-2 rounded-xl border border-[#E0E5DD] text-xs text-[#2D3A30] mt-1 font-mono focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-[#86A38B] tracking-wider">Personal Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8F9F5] px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] text-xs font-bold text-[#2D3A30] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1">
                  Phone Number (WhatsApp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F8F9F5] px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] text-xs font-mono font-bold text-[#2D3A30] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. farmer@gmail.com"
                  className="w-full bg-[#F8F9F5] px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] text-xs text-[#2D3A30] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1">
                  State & Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ibadan, Oyo State"
                  className="w-full bg-[#F8F9F5] px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] text-xs font-bold text-[#2D3A30] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>
            </div>
          </div>

          {/* Role Specific Fields */}
          {currentUser.role === 'farmer' ? (
            <div className="space-y-4 pt-2 border-t border-[#E0E5DD]">
              <h3 className="text-xs font-black uppercase text-[#86A38B] tracking-wider">Farmer & Farm Gate Specs</h3>
              
              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1">Farm / Cooperative Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. SunHarvest Organic Hub"
                  className="w-full bg-[#F8F9F5] px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] text-xs font-bold text-[#2D3A30] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1.5">Primary Crop Categories Grown:</label>
                <div className="flex flex-wrap gap-2">
                  {cropOptions.map((crop) => {
                    const isSelected = primaryCrops.includes(crop);
                    return (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => handleCropToggle(crop)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          isSelected 
                            ? 'bg-[#4A5D4E] text-white shadow-2xs' 
                            : 'bg-[#F8F9F5] text-[#86A38B] border border-[#E0E5DD] hover:text-[#2D3A30]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#E5B25D]" />}
                        <span>{crop}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-[#E0E5DD]">
              <h3 className="text-xs font-black uppercase text-[#86A38B] tracking-wider">Buyer Procurement Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D3A30] mb-1">Buyer Category</label>
                  <select
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value as any)}
                    className="w-full bg-[#F8F9F5] px-3 py-2.5 rounded-xl border border-[#E0E5DD] text-xs font-bold text-[#2D3A30]"
                  >
                    <option value="Wholesale Merchant">Wholesale Merchant</option>
                    <option value="Retail Supermarket">Retail Supermarket</option>
                    <option value="Restaurant & Catering">Restaurant & Catering</option>
                    <option value="Individual Household">Individual Household</option>
                    <option value="Food Processor">Food Processor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3A30] mb-1">Company / Store Name</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Mile 12 Depot Ltd"
                    className="w-full bg-[#F8F9F5] px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] text-xs font-bold text-[#2D3A30]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#E0E5DD] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-full text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-7 py-3 rounded-full text-xs font-black bg-[#4A5D4E] hover:bg-[#3d4d40] text-white shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <span>Saving Changes...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#E5B25D]" />
                  <span>Save Profile Updates</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
