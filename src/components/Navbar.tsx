import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { 
  Sprout, 
  PlusCircle, 
  Store, 
  LayoutDashboard, 
  HelpCircle, 
  User as UserIcon, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Search, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShoppingCart, 
  ShieldCheck, 
  LogOut,
  KeyRound,
  ArrowRight,
  Building2,
  Zap
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (tab?: 'farmer' | 'buyer' | 'switch') => void;
  onOpenHowItWorks: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenHowItWorks }) => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    currency, 
    setCurrency, 
    listings,
    filters,
    setFilters,
    logout,
    openUpgradeModal,
    openProfileModal,
    isFirestoreLive,
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    pendingOfflineCount,
    isSyncing,
    triggerManualSync,
    openAuthModal
  } = useMarketplace();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);

  const farmerListingsCount = listings.filter(
    l => l.farmerId === currentUser.id && l.status === 'active'
  ).length;

  const currencyOptions = [
    { symbol: '₦', label: 'NGN (₦) - Nigerian Naira' },
    { symbol: '$', label: 'USD ($)' },
    { symbol: '€', label: 'EUR (€)' },
    { symbol: '£', label: 'GBP (£)' },
    { symbol: 'KSh', label: 'KES (KSh)' },
    { symbol: 'GH₵', label: 'GHS (GH₵)' },
    { symbol: 'R', label: 'ZAR (R)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F8F9F5]/95 backdrop-blur-md text-[#2D3A30] border-b border-[#E0E5DD] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-6">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#4A5D4E] text-[#E5B25D] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-[#2D3A30]">AgroDirect</span>
                <span className="text-[10px] uppercase font-black bg-[#E8F0E8] text-[#4A5D4E] px-2 py-0.5 rounded-md tracking-wider border border-[#D4E2D4]">
                  NG
                </span>
              </div>
              <p className="text-xs text-[#86A38B] font-semibold hidden sm:block">
                Farm Gate Wholesale Marketplace
              </p>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="hidden lg:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <input
                id="navbar-search-input"
                type="text"
                value={filters.searchQuery}
                onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search fresh tomatoes, yams, maize, peppers..."
                className="w-full bg-white text-[#2D3A30] pl-10 pr-4 py-2.5 rounded-full border border-[#E0E5DD] focus:border-[#4A5D4E] focus:outline-none text-xs placeholder:text-[#86A38B] shadow-2xs transition"
              />
              <Search className="w-4 h-4 text-[#86A38B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 sm:gap-2">
            <button
              id="nav-marketplace-btn"
              onClick={() => setActiveTab('marketplace')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'marketplace'
                  ? 'bg-[#4A5D4E] text-white shadow-sm'
                  : 'text-[#4A5D4E] hover:bg-[#E8F0E8]'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Produce Market</span>
            </button>

            <button
              id="nav-post-produce-btn"
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-[#E5B25D] text-[#2D3A30] shadow-sm font-bold'
                  : 'text-[#4A5D4E] hover:bg-[#E8F0E8]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Harvest</span>
            </button>

            {currentUser.role === 'buyer' ? (
              <button
                id="nav-buyer-dashboard-btn"
                onClick={() => setActiveTab('buyer-dashboard')}
                className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                  activeTab === 'buyer-dashboard'
                    ? 'bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-sm'
                    : 'border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#4A5D4E] hover:text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>My Orders</span>
              </button>
            ) : (
              <button
                id="nav-dashboard-btn"
                onClick={() => setActiveTab('my-listings')}
                className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                  activeTab === 'my-listings'
                    ? 'bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-sm'
                    : 'border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#4A5D4E] hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Farmer Hub</span>
                {farmerListingsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-[#86A38B] text-white text-[10px] rounded-full font-bold">
                    {farmerListingsCount}
                  </span>
                )}
              </button>
            )}

            <button
              id="nav-company-admin-btn"
              onClick={() => setActiveTab('admin-portal')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-full border transition-all flex items-center gap-1.5 ${
                activeTab === 'admin-portal'
                  ? 'bg-[#2D3A30] text-white border-[#2D3A30] shadow-sm'
                  : 'border-amber-600 text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
              title="Company Payout Approval Portal"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Company Admin</span>
            </button>

            <button
              id="nav-how-it-works-btn"
              onClick={onOpenHowItWorks}
              className="p-2 text-[#86A38B] hover:text-[#4A5D4E] hover:bg-[#E8F0E8] rounded-full transition"
              title="Architecture & Offline Guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </nav>

          {/* Right Action Bar: Upgrade Pill, Offline/Online Pill, Currency, User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">

            {/* Buyer Upgrade to Farmer Quick Action */}
            {currentUser.role === 'buyer' && (
              <button
                id="nav-upgrade-farmer-btn"
                onClick={openUpgradeModal}
                className="hidden sm:flex items-center gap-1.5 bg-[#FAF5ED] hover:bg-[#F3E8D3] text-[#2D3A30] text-xs font-black px-3.5 py-1.5 rounded-full border border-[#E5B25D]/60 shadow-2xs transition active:scale-95 cursor-pointer"
                title="Upgrade account to list and sell farm produce"
              >
                <Sprout className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>Upgrade to Farmer</span>
              </button>
            )}
            
            {/* Network & Sync Status Pill */}
            <div className="relative">
              <button
                id="network-status-btn"
                onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
                className={`flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-full border shadow-2xs transition select-none ${
                  !isOnline
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : pendingOfflineCount > 0
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-[#4A5D4E] border-[#E0E5DD] hover:bg-[#F8F9F5]'
                }`}
                title="Click to view network sync status or simulate remote farm network"
              >
                {!isOnline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                    <span className="font-bold">Offline Outbox</span>
                  </>
                ) : isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : pendingOfflineCount > 0 ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>{pendingOfflineCount} Queued</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-[#2D3A30]">Online</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 text-[#86A38B]" />
              </button>

              {/* Network / Offline Dropdown Menu */}
              {networkDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white border border-[#E0E5DD] rounded-2xl shadow-xl p-3 z-50 text-xs text-[#2D3A30]"
                  onMouseLeave={() => setNetworkDropdownOpen(false)}
                >
                  <div className="flex items-center justify-between border-b border-[#E0E5DD] pb-2 mb-2">
                    <div className="font-bold flex items-center gap-1.5 text-[#2D3A30]">
                      {isOnline ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-amber-600" />}
                      <span>Network & Offline Sync</span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isOnline ? 'Active' : 'Offline'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#86A38B] leading-relaxed mb-3">
                    {isOnline 
                      ? 'Connected to Firestore Cloud. All new listings and updates synchronize in real time.' 
                      : 'You are currently in Offline Mode. Listings you create now will be stored safely in local memory and will automatically sync the instant network reconnects.'}
                  </p>

                  {/* Queued Outbox info */}
                  {pendingOfflineCount > 0 && (
                    <div className="bg-[#FFFBEB] p-2.5 rounded-xl border border-[#FDE68A] mb-3 flex items-center justify-between">
                      <div className="text-[11px] text-amber-900 font-bold">
                        <span>{pendingOfflineCount} produce item{pendingOfflineCount > 1 ? 's' : ''} queued offline</span>
                      </div>
                      {isOnline && (
                        <button
                          onClick={() => { triggerManualSync(); setNetworkDropdownOpen(false); }}
                          disabled={isSyncing}
                          className="bg-[#4A5D4E] hover:bg-[#3d4d40] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                          <span>Sync Now</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Offline Simulation Toggle */}
                  <div className="pt-2 border-t border-[#E0E5DD]">
                    <button
                      onClick={() => { toggleSimulatedOffline(); setNetworkDropdownOpen(false); }}
                      className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-between transition ${
                        isSimulatedOffline 
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' 
                          : 'bg-[#F8F9F5] hover:bg-[#E8F0E8] text-[#4A5D4E]'
                      }`}
                    >
                      <span>{isSimulatedOffline ? '📶 Restore Online Connection' : '📡 Simulate Remote Farm Offline'}</span>
                      <span className="text-[10px] uppercase font-bold text-[#86A38B]">
                        {isSimulatedOffline ? 'Active' : 'Test'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Currency Selector Pill */}
            <div className="relative hidden sm:block">
              <button
                id="currency-selector-btn"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 bg-white hover:bg-[#E8F0E8] text-[#2D3A30] text-xs font-bold px-3 py-2 rounded-full border border-[#E0E5DD] shadow-2xs transition"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-[#86A38B]" />
              </button>

              {currencyDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-36 bg-white border border-[#E0E5DD] rounded-2xl shadow-xl py-2 z-50 text-xs"
                  onMouseLeave={() => setCurrencyDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] text-[#86A38B] font-bold uppercase tracking-wider border-b border-[#E0E5DD]">
                    Currency
                  </div>
                  {currencyOptions.map(c => (
                    <button
                      key={c.symbol}
                      onClick={() => {
                        setCurrency(c.symbol);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#F8F9F5] transition ${
                        currency === c.symbol ? 'text-[#4A5D4E] font-bold bg-[#E8F0E8]/50' : 'text-[#2D3A30]'
                      }`}
                    >
                      <span>{c.label}</span>
                      {currency === c.symbol && <Check className="w-3.5 h-3.5 text-[#4A5D4E]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account Switcher Dropdown & Registration Portal Triggers */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 bg-white hover:bg-[#E8F0E8] text-[#2D3A30] px-2.5 py-1.5 rounded-full border border-[#E0E5DD] shadow-2xs transition"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#86A38B]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold leading-tight truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#86A38B] font-semibold flex items-center gap-1">
                    <span>{currentUser.role === 'farmer' ? '🌾 Farmer' : '🛒 Buyer'}</span>
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-[#86A38B]" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white border border-[#E0E5DD] rounded-[24px] shadow-2xl p-3 z-50 text-sm text-[#2D3A30]"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  {/* Current Active User Banner */}
                  <div className="px-3.5 py-3 bg-[#F8F9F5] rounded-2xl mb-2.5 border border-[#E0E5DD]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#86A38B] uppercase tracking-wider font-extrabold">
                        Signed In Account
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        currentUser.role === 'farmer' ? 'bg-[#E8F0E8] text-[#4A5D4E]' : 'bg-[#FAF5ED] text-[#D97706]'
                      }`}>
                        {currentUser.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="font-extrabold text-[#2D3A30] text-sm mt-1">{currentUser.name}</div>
                    <div className="text-xs text-[#4A5D4E] font-medium truncate mt-0.5">
                      {currentUser.farmName || currentUser.buyerType || currentUser.location}
                    </div>
                    <div className="text-[11px] text-[#86A38B] font-mono mt-0.5">
                      {currentUser.phone}
                    </div>
                  </div>

                  {/* Buyer Upgrade to Farmer Banner */}
                  {currentUser.role === 'buyer' && (
                    <button
                      onClick={() => {
                        openUpgradeModal();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full mb-2.5 p-2.5 bg-[#FAF5ED] hover:bg-[#F3E8D3] border border-[#E5B25D]/60 rounded-xl text-left transition group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-black text-[#2D3A30]">
                          <Sprout className="w-4 h-4 text-[#4A5D4E]" />
                          <span>Upgrade to Farmer</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#4A5D4E] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-[10px] text-[#86A38B] mt-0.5">
                        List your harvests & manage produce orders
                      </div>
                    </button>
                  )}

                  {/* Navigation Links */}
                  <div className="space-y-1 py-1 border-t border-[#E0E5DD]">
                    <button
                      onClick={() => {
                        openProfileModal();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#2D3A30] hover:bg-[#E8F0E8] rounded-xl flex items-center gap-2 transition"
                    >
                      <UserIcon className="w-4 h-4 text-[#4A5D4E]" />
                      <span>Edit Profile Information</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('buyer-dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#2D3A30] hover:bg-[#E8F0E8] rounded-xl flex items-center gap-2 transition"
                    >
                      <ShoppingCart className="w-4 h-4 text-amber-600" />
                      <span>Buyer Dashboard & Orders</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('my-listings');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#2D3A30] hover:bg-[#E8F0E8] rounded-xl flex items-center gap-2 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      <span>Farmer Management Hub</span>
                    </button>
                  </div>

                  {/* Real Auth Actions */}
                  <div className="space-y-1 pt-1 border-t border-[#E0E5DD]">
                    <button
                      onClick={() => {
                        openAuthModal('farmer');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#2D3A30] hover:bg-[#E8F0E8] rounded-xl flex items-center gap-2 transition"
                    >
                      <Sprout className="w-4 h-4 text-[#4A5D4E]" />
                      <span>Register as Farmer</span>
                    </button>

                    <button
                      onClick={() => {
                        openAuthModal('buyer');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#2D3A30] hover:bg-[#E8F0E8] rounded-xl flex items-center gap-2 transition"
                    >
                      <ShoppingCart className="w-4 h-4 text-[#4A5D4E]" />
                      <span>Register as Buyer</span>
                    </button>

                    <button
                      onClick={() => {
                        openAuthModal('switch');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#4A5D4E] hover:bg-[#E8F0E8] rounded-xl flex items-center gap-2 transition"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Sign In with Existing Account</span>
                    </button>

                    <div className="pt-1 border-t border-[#E0E5DD]">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-bold transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Tab Bar below header */}
      <div className="md:hidden border-t border-[#E0E5DD] bg-white/95 px-3 py-2 flex items-center justify-around text-xs">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full font-bold text-xs ${
            activeTab === 'marketplace' ? 'bg-[#4A5D4E] text-white shadow-xs' : 'text-[#86A38B]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Market</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full font-bold text-xs ${
            activeTab === 'create' ? 'bg-[#E5B25D] text-[#2D3A30]' : 'text-[#86A38B]'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Harvest</span>
        </button>

        <button
          onClick={() => setActiveTab('my-listings')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full font-bold text-xs ${
            activeTab === 'my-listings' ? 'bg-[#4A5D4E] text-white shadow-xs' : 'text-[#86A38B]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Farmer Hub</span>
        </button>

        <button
          onClick={() => openAuthModal('switch')}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full font-bold text-xs text-[#4A5D4E] bg-[#E8F0E8]"
        >
          <UserIcon className="w-4 h-4" />
          <span>Account</span>
        </button>
      </div>
    </header>
  );
};
