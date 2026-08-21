import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Check, 
  Sprout, 
  ShoppingCart, 
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Building,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Leaf,
  Truck
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'farmer' | 'buyer' | 'switch';
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

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'farmer' }) => {
  const { 
    currentUser, 
    registerFarmer, 
    registerBuyer, 
    loginWithCredentials, 
    openUpgradeModal,
    showToast 
  } = useMarketplace();

  // Mode: 'register' (Single Registration Form) | 'login' (Sign In)
  const [activeMode, setActiveMode] = useState<'register' | 'login'>('register');

  // Registration Form State
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialTab === 'buyer' ? 'buyer' : 'farmer');
  
  // Section 1: Basic Account Info (Both roles)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Section 2: Farmer-specific Info (Conditional: only when selectedRole === 'farmer')
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('Ibadan / Oyo Agricultural Corridor');
  const [customLocation, setCustomLocation] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Roma Tomatoes', 'Benue Yams']);
  const [customCropInput, setCustomCropInput] = useState('');
  const [canDeliver, setCanDeliver] = useState(true);

  // Login Form State
  const [loginCredential, setLoginCredential] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form Validation & Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset or initialize on modal open
  useEffect(() => {
    if (isOpen) {
      if (initialTab === 'switch') {
        setActiveMode('login');
      } else {
        setActiveMode('register');
        setSelectedRole(initialTab === 'buyer' ? 'buyer' : 'farmer');
      }
      setLoginError(null);
    }
  }, [isOpen, initialTab]);

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

  // Unified Registration Handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!fullName.trim()) {
      showToast('Please enter your full name');
      return;
    }
    if (!phone.trim()) {
      showToast('Please enter your WhatsApp phone number');
      return;
    }
    if (!password.trim()) {
      showToast('Please set a password for your account');
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedRole === 'farmer') {
        const finalLoc = customLocation.trim() || farmLocation;
        registerFarmer({
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          password: password.trim(),
          farmName: farmName.trim() || `${fullName.trim()}'s Farm Gate`,
          location: finalLoc.trim(),
          primaryCrops: selectedCrops.length > 0 ? selectedCrops : ['Vegetables', 'Tubers'],
        });
      } else {
        registerBuyer({
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          password: password.trim(),
          location: 'Mile 12 Commercial Depot, Lagos',
          buyerType: 'Wholesale Merchant',
        });
      }

      onClose();
    } catch (err) {
      console.error(err);
      showToast('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginCredential.trim()) {
      setLoginError('Please enter your WhatsApp phone number or email');
      return;
    }

    const result = await loginWithCredentials(loginCredential, loginPassword.trim() || undefined);
    if (result.success) {
      setLoginCredential('');
      setLoginPassword('');
      onClose();
    } else {
      setLoginError(result.message);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2D3A30]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div 
        id="auth-modal-card"
        onClick={e => e.stopPropagation()}
        className="bg-[#F8F9F5] text-[#2D3A30] w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-[#E0E5DD] max-h-[92vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="bg-[#4A5D4E] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#3D4D40] flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 text-[#E5B25D] flex items-center justify-center border border-white/20 shadow-2xs">
              {activeMode === 'register' ? (
                selectedRole === 'farmer' ? <Sprout className="w-6 h-6" /> : <ShoppingCart className="w-6 h-6" />
              ) : (
                <KeyRound className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-black text-lg text-white leading-tight">
                {activeMode === 'register'
                  ? 'Create Your Account'
                  : 'Sign In to AgroDirect'}
              </h3>
              <p className="text-xs text-[#D4E2D4] font-medium mt-0.5">
                {activeMode === 'register'
                  ? selectedRole === 'farmer'
                    ? 'Register your farm gate to list fresh harvests'
                    : 'Instant registration to buy wholesale produce direct'
                  : 'Enter your WhatsApp phone number or email to access your account'}
              </p>
            </div>
          </div>

          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full text-white bg-white/10 hover:bg-white/20 flex items-center justify-center transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Mode Tabs */}
        <div className="flex border-b border-[#E0E5DD] bg-white px-4 sm:px-6 pt-3 gap-3 flex-shrink-0">
          <button
            id="tab-mode-register"
            onClick={() => { setActiveMode('register'); setLoginError(null); }}
            className={`pb-3 px-3 font-extrabold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition ${
              activeMode === 'register'
                ? 'border-[#4A5D4E] text-[#4A5D4E]'
                : 'border-transparent text-[#86A38B] hover:text-[#2D3A30]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Register Account</span>
          </button>

          <button
            id="tab-mode-login"
            onClick={() => { setActiveMode('login'); setLoginError(null); }}
            className={`pb-3 px-3 font-extrabold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition ${
              activeMode === 'login'
                ? 'border-[#4A5D4E] text-[#4A5D4E]'
                : 'border-transparent text-[#86A38B] hover:text-[#2D3A30]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* ===================== MODE 1: REGISTRATION ===================== */}
          {activeMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              
              {/* Role / User Type Selector */}
              <div className="bg-white p-4 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="user-role-select" className="text-xs font-black text-[#2D3A30] uppercase tracking-wider flex items-center gap-1.5">
                    <span>I Want To:</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#86A38B] font-semibold">
                    {selectedRole === 'farmer' ? '🌾 Sell Farm Harvests' : '🛒 Buy Wholesale Produce'}
                  </span>
                </div>

                <select
                  id="user-role-select"
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-[#F8F9F5] text-[#2D3A30] text-sm font-bold px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition cursor-pointer"
                >
                  <option value="buyer">🛒 Buy Fresh Farm Produce (Wholesale Merchant, Retailer, Caterer)</option>
                  <option value="farmer">🌾 Sell Farm Harvests (Farmer / Agro Producer)</option>
                </select>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2 ${
                      selectedRole === 'buyer'
                        ? 'border-[#4A5D4E] bg-[#E8F0E8]/70 text-[#2D3A30] ring-2 ring-[#4A5D4E]/20'
                        : 'border-[#E0E5DD] bg-[#F8F9F5] text-[#86A38B] hover:bg-[#E8F0E8]/40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${selectedRole === 'buyer' ? 'bg-[#4A5D4E] text-white' : 'bg-white text-[#86A38B]'}`}>
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-[#2D3A30]">Produce Buyer</div>
                      <div className="text-[10px] text-[#86A38B] mt-0.5">Quick order access</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('farmer')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2 ${
                      selectedRole === 'farmer'
                        ? 'border-[#4A5D4E] bg-[#E8F0E8]/70 text-[#2D3A30] ring-2 ring-[#4A5D4E]/20'
                        : 'border-[#E0E5DD] bg-[#F8F9F5] text-[#86A38B] hover:bg-[#E8F0E8]/40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${selectedRole === 'farmer' ? 'bg-[#4A5D4E] text-white' : 'bg-white text-[#86A38B]'}`}>
                      <Sprout className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-[#2D3A30]">Farmer / Producer</div>
                      <div className="text-[10px] text-[#86A38B] mt-0.5">Post harvest batches</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Section 1: User Account Details */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-4">
                <div className="text-xs font-black text-[#4A5D4E] uppercase tracking-wider flex items-center justify-between border-b border-[#E0E5DD] pb-2">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Personal & Contact Information</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D3A30]">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Alaba Balogun, Chinedu Okoro"
                    className="w-full text-xs sm:text-sm bg-[#F8F9F5] text-[#2D3A30] px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D3A30]">
                    WhatsApp Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#86A38B] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+234 803 123 4567"
                      className="w-full text-xs sm:text-sm bg-[#F8F9F5] text-[#2D3A30] pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D3A30]">
                    Email Address <span className="text-[#86A38B] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#86A38B] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full text-xs sm:text-sm bg-[#F8F9F5] text-[#2D3A30] pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D3A30]">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#86A38B] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs sm:text-sm bg-[#F8F9F5] text-[#2D3A30] pl-10 pr-10 py-2.5 rounded-xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#86A38B] hover:text-[#2D3A30]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Farmer-specific Fields (Conditional) */}
              {selectedRole === 'farmer' && (
                <div className="bg-[#FAF5ED] p-4 sm:p-5 rounded-2xl border border-[#E5B25D]/50 shadow-2xs space-y-4">
                  <div className="text-xs font-black text-[#4A5D4E] uppercase tracking-wider flex items-center justify-between border-b border-[#E5B25D]/30 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-[#4A5D4E]" />
                      <span>Farm Gate & Crop Details</span>
                    </span>
                    <span className="text-[10px] bg-[#E5B25D] text-[#2D3A30] font-black px-2 py-0.5 rounded-full">
                      Farmer Only
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#2D3A30]">
                      Farm / Enterprise Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={farmName}
                      onChange={e => setFarmName(e.target.value)}
                      placeholder="e.g. GreenGold Agro Farms, SunHarvest Hub"
                      className="w-full text-xs sm:text-sm bg-white text-[#2D3A30] px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#2D3A30]">
                      Farm Location / Agri-Belt <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={farmLocation}
                      onChange={e => setFarmLocation(e.target.value)}
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
                      placeholder="Or specify village / LGA (Optional)"
                      className="w-full text-xs bg-white text-[#2D3A30] px-3.5 py-2 rounded-xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:outline-none transition mt-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#2D3A30] flex items-center justify-between">
                      <span>Primary Harvest Crops:</span>
                      <span className="text-[10px] text-[#86A38B] font-semibold">{selectedCrops.length} selected</span>
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

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={customCropInput}
                        onChange={e => setCustomCropInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCrop(); }}}
                        placeholder="Add other crop (e.g. Soya Beans)"
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

                  <div className="pt-2 border-t border-[#E5B25D]/30">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#2D3A30] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canDeliver}
                        onChange={e => setCanDeliver(e.target.checked)}
                        className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E] w-4 h-4"
                      />
                      <span>Direct truck dispatch & haulage available for wholesale orders</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-black text-sm rounded-full shadow-md transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                {selectedRole === 'farmer' ? <Sprout className="w-4 h-4 text-[#E5B25D]" /> : <ShoppingCart className="w-4 h-4" />}
                <span>
                  {selectedRole === 'farmer' ? 'Complete Farmer Registration' : 'Complete Buyer Registration'}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-xs text-[#86A38B]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveMode('login'); setLoginError(null); }}
                  className="text-[#4A5D4E] font-bold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}

          {/* ===================== MODE 2: SIGN IN ===================== */}
          {activeMode === 'login' && (
            <div className="space-y-5">
              <form onSubmit={handleLogin} className="space-y-4 bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs">
                
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D3A30]">
                    WhatsApp Phone Number or Email
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#86A38B] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={loginCredential}
                      onChange={e => setLoginCredential(e.target.value)}
                      placeholder="+234 803 123 4567 or user@example.com"
                      className="w-full text-xs sm:text-sm bg-[#F8F9F5] text-[#2D3A30] pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2D3A30]">
                    Password <span className="text-[#86A38B] font-normal">(Optional if not set)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#86A38B] absolute left-3.5 top-3" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs sm:text-sm bg-[#F8F9F5] text-[#2D3A30] pl-10 pr-10 py-2.5 rounded-xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 text-[#86A38B] hover:text-[#2D3A30]"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-black text-sm rounded-full shadow-md transition flex items-center justify-center gap-2 group cursor-pointer mt-2"
                >
                  <KeyRound className="w-4 h-4 text-[#E5B25D]" />
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* If user is logged in as a buyer, offer Upgrade */}
              {currentUser.role === 'buyer' && (
                <div className="p-4 bg-[#FAF5ED] border border-[#E5B25D]/50 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-[#2D3A30]">Have farm produce to sell?</div>
                    <div className="text-[#86A38B]">Upgrade your buyer account to a farmer account.</div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      openUpgradeModal();
                    }}
                    className="bg-[#E5B25D] hover:bg-[#d9a349] text-[#2D3A30] font-black px-3.5 py-1.5 rounded-full flex-shrink-0 transition shadow-2xs"
                  >
                    🌾 Upgrade to Farmer
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-[#86A38B]">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveMode('register'); setLoginError(null); }}
                  className="text-[#4A5D4E] font-bold hover:underline"
                >
                  Register new account
                </button>
              </p>
            </div>
          )}

        </div>

        {/* Footer Security Badge */}
        <div className="p-4 bg-white border-t border-[#E0E5DD] flex items-center justify-between text-[11px] text-[#86A38B] flex-shrink-0 font-medium">
          <div className="flex items-center gap-1.5 text-[#4A5D4E] font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Direct Farm Gate Verification • Cloud & Offline Synced</span>
          </div>
          <span className="text-[10px] text-[#86A38B]">
            AgroDirect NG
          </span>
        </div>

      </div>
    </div>
  );
};
