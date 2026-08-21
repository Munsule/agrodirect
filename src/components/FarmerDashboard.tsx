import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Listing, Order, OrderStatus } from '../types';
import { generateWhatsAppOrderUrl } from '../utils/orderHelper';
import { formatUploadTimeAgo } from '../utils/timeAgo';
import { 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Layers, 
  DollarSign, 
  TrendingUp, 
  MessageCircle, 
  Edit3, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
  Check,
  Clock,
  Sprout,
  ShoppingBag,
  Truck,
  PackageCheck,
  PhoneCall,
  UserCheck,
  Wallet,
  Building2,
  HardDrive,
  ArrowUpRight,
  Receipt,
  CreditCard,
  Lock,
  X
} from 'lucide-react';

interface FarmerDashboardProps {
  onOpenDetail: (listing: Listing) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ onOpenDetail }) => {
  const { 
    currentUser, 
    listings, 
    orders,
    deleteListing, 
    toggleListingStatus, 
    updateListing, 
    updateOrderStatus,
    updateBankDetails,
    requestWithdrawal,
    renewSubscription,
    setActiveTab, 
    currency, 
    showToast,
    openUpgradeModal,
    openAuthModal,
    openProfileModal
  } = useMarketplace();

  // Top-level Dashboard View Tab: 'products' | 'orders' | 'wallet'
  const [dashboardTab, setDashboardTab] = useState<'products' | 'orders' | 'wallet'>('products');
  
  // Product filter tab
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'sold'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editQuantity, setEditQuantity] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Order filter status
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');

  // Wallet & Bank Form State
  const [bankName, setBankName] = useState(currentUser.bankDetails?.bankName || 'Access Bank');
  const [accountNumber, setAccountNumber] = useState(currentUser.bankDetails?.accountNumber || '');
  const [accountName, setAccountName] = useState(currentUser.bankDetails?.accountName || '');
  const [isEditingBank, setIsEditingBank] = useState(!currentUser.bankDetails?.accountNumber);

  // Explicit Cashout Modal State
  const [isCashoutOpen, setIsCashoutOpen] = useState(false);
  const [cashoutAmount, setCashoutAmount] = useState<string>('');

  // Storage Subscription State
  const [storageTier, setStorageTier] = useState<number>(currentUser.subscription?.storageTierGB || 1);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Filter listings belonging to the active farmer
  const myListings = listings.filter(l => l.farmerId === currentUser.id);
  const activeListings = myListings.filter(l => l.status === 'active');
  const soldListings = myListings.filter(l => l.status === 'sold');

  const displayedListings = myListings.filter(l => {
    if (filterTab === 'active') return l.status === 'active';
    if (filterTab === 'sold') return l.status === 'sold';
    return true;
  });

  // Filter orders for this farmer's products
  const myFarmerOrders = orders.filter(o => o.farmerId === currentUser.id || myListings.some(l => l.id === o.listingId));
  
  const displayedOrders = myFarmerOrders.filter(o => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  // Calculate stats
  const totalActiveValue = activeListings.reduce((sum, item) => {
    const num = parseFloat(item.quantity.replace(/[^0-9.]/g, '')) || 10;
    return sum + (item.price * num);
  }, 0);

  const totalFulfilledRevenue = myFarmerOrders
    .filter(o => o.status === 'delivered' || o.status === 'confirmed')
    .reduce((sum, o) => sum + (o.farmerPayoutAmount || (o.unitPrice * (parseInt(o.quantityOrdered) || 1))), 0);

  // Storage usage calculation (approx 35 MB per active batch with image data)
  const storageUsedMB = Math.max(120, myListings.length * 45);
  const currentTierGB = currentUser.subscription?.storageTierGB || 1;
  const storageQuotaMB = currentTierGB * 1000;
  const storageUsagePercent = Math.min(100, Math.round((storageUsedMB / storageQuotaMB) * 100));

  const handleStartEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setEditPrice(listing.price.toString());
    setEditQuantity(listing.quantity);
  };

  const handleSaveEdit = (id: string) => {
    const numericPrice = parseFloat(editPrice) || 10;
    updateListing(id, {
      price: numericPrice,
      quantity: editQuantity.trim(),
    });
    setEditingId(null);
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !accountName) {
      showToast('Please fill out all bank account fields');
      return;
    }
    updateBankDetails({ bankName, accountNumber, accountName });
    setIsEditingBank(false);
  };

  const handleConfirmCashout = () => {
    const amt = parseFloat(cashoutAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid cashout amount');
      return;
    }
    requestWithdrawal(amt);
    setIsCashoutOpen(false);
    setCashoutAmount('');
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Confirmation</span>;
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmed & Preparing</span>;
      case 'in_transit':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-300 flex items-center gap-1"><Truck className="w-3 h-3" /> In Transit</span>;
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1"><PackageCheck className="w-3 h-3" /> Delivered & Completed</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-300 flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>;
    }
  };

  if (currentUser.role === 'buyer') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-[#2D3A30]">
        <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-[#E0E5DD] shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#E8F0E8] text-[#4A5D4E] flex items-center justify-center mx-auto shadow-xs border border-[#D4E2D4]">
            <Sprout className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider bg-[#FAF5ED] text-[#D97706] px-3 py-1 rounded-full border border-[#E5B25D]/50">
              🛒 Buyer Account Active
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D3A30]">
              Ready to Sell Your Farm Produce?
            </h2>
            <p className="text-sm text-[#86A38B] leading-relaxed">
              You are currently logged in as a produce buyer ({currentUser.name}). Upgrade your account to a <strong>Farmer Account</strong> to unlock the Farmer Management Hub, post fresh crop harvests with photos, and track direct buyer orders.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="upgrade-to-farmer-cta-btn"
              onClick={openUpgradeModal}
              className="w-full sm:w-auto bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-black px-7 py-3.5 rounded-full shadow-md transition flex items-center justify-center gap-2 cursor-pointer group text-sm"
            >
              <Sprout className="w-4 h-4 text-[#E5B25D]" />
              <span>Upgrade to Farmer Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => openAuthModal('farmer')}
              className="w-full sm:w-auto bg-[#F8F9F5] hover:bg-[#E8F0E8] text-[#4A5D4E] font-bold px-6 py-3.5 rounded-full border border-[#E0E5DD] transition text-sm"
            >
              Register Separate Farmer Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#2D3A30]">
      
      {/* Top Profile Header */}
      <div className="bg-[#4A5D4E] text-white rounded-[32px] p-6 sm:p-8 border border-[#E0E5DD] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#86A38B] shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#2D3A30] flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {currentUser.name.charAt(0)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.name}</h1>
                <span className="text-xs bg-[#E5B25D] text-[#2D3A30] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Farmer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#D4E2D4] mt-1 flex items-center gap-2 font-medium">
                <span>🌾 {currentUser.farmName || 'Farm Gate Hub'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {currentUser.location}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openProfileModal}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-full border border-white/20 transition flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[#E5B25D]" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className="bg-[#E5B25D] hover:bg-[#d99f43] text-[#2D3A30] font-black px-5 py-3 rounded-full shadow-md hover:shadow-lg transition flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Crop Batch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#86A38B]">
            <span className="text-xs font-bold uppercase tracking-wider">Available Wallet Balance</span>
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{currency} {(currentUser.walletBalance || 0).toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-bold">Ready for explicit cashout</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#86A38B]">
            <span className="text-xs font-bold uppercase tracking-wider">Pending 24h Escrow</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-[#2D3A30]">{currency} {(currentUser.pendingBalance || 0).toLocaleString()}</p>
          <p className="text-[11px] text-amber-600 font-bold">Maturing in 24 hours</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#86A38B]">
            <span className="text-xs font-bold uppercase tracking-wider">Storage Space Occupied</span>
            <HardDrive className="w-5 h-5 text-[#4A5D4E]" />
          </div>
          <p className="text-2xl font-black text-[#2D3A30]">{storageUsedMB} MB / {currentTierGB} GB</p>
          <p className="text-[11px] text-[#86A38B]">₦500/GB monthly space tier</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#86A38B]">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Revenue</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{currency} {totalFulfilledRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-medium">Delivered & confirmed sales</p>
        </div>
      </div>

      {/* Primary Navigation Sub-Tabs: Products, Orders, & Wallet */}
      <div className="flex border-b border-[#E0E5DD] bg-white rounded-2xl p-2 shadow-2xs gap-2">
        <button
          onClick={() => setDashboardTab('products')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            dashboardTab === 'products'
              ? 'bg-[#4A5D4E] text-white shadow-xs'
              : 'text-[#86A38B] hover:text-[#2D3A30] hover:bg-[#F8F9F5]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Produce Products ({myListings.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('orders')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer relative ${
            dashboardTab === 'orders'
              ? 'bg-[#4A5D4E] text-white shadow-xs'
              : 'text-[#86A38B] hover:text-[#2D3A30] hover:bg-[#F8F9F5]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buyer Orders Received ({myFarmerOrders.length})</span>
          {myFarmerOrders.filter(o => o.status === 'pending').length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
              {myFarmerOrders.filter(o => o.status === 'pending').length} NEW
            </span>
          )}
        </button>

        <button
          onClick={() => setDashboardTab('wallet')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            dashboardTab === 'wallet'
              ? 'bg-[#4A5D4E] text-white shadow-xs'
              : 'text-[#86A38B] hover:text-[#2D3A30] hover:bg-[#F8F9F5]'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Wallet, Payouts & Storage</span>
        </button>
      </div>

      {/* ======================= TAB 1: PRODUCTS MANAGEMENT ======================= */}
      {dashboardTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E0E5DD]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  filterTab === 'all' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                All Crops ({myListings.length})
              </button>
              <button
                onClick={() => setFilterTab('active')}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  filterTab === 'active' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                Active ({activeListings.length})
              </button>
              <button
                onClick={() => setFilterTab('sold')}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  filterTab === 'sold' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                Sold Out ({soldListings.length})
              </button>
            </div>
          </div>

          {displayedListings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E0E5DD] space-y-4">
              <div className="w-16 h-16 bg-[#F8F9F5] text-[#86A38B] rounded-full flex items-center justify-center mx-auto border border-[#E0E5DD]">
                <Sprout className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-[#2D3A30]">No produce listings found</h3>
              <p className="text-xs text-[#86A38B] max-w-md mx-auto">
                You haven't listed any farm crops under this filter yet. Post your harvest to connect directly with wholesale buyers.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-extrabold px-6 py-3 rounded-full text-xs transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Your First Produce Batch</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedListings.map((listing) => (
                <div 
                  key={listing.id}
                  className="bg-white rounded-2xl border border-[#E0E5DD] overflow-hidden shadow-2xs flex flex-col hover:shadow-md transition"
                >
                  <div className="relative h-48 bg-[#F8F9F5]">
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        listing.status === 'active' 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-amber-500 text-white'
                      }`}>
                        {listing.status === 'active' ? 'Active' : 'Sold Out'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => onOpenDetail(listing)}
                        className="p-2 bg-white/90 hover:bg-white text-[#2D3A30] rounded-full shadow-xs backdrop-blur-xs transition"
                        title="View detail modal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#86A38B] uppercase tracking-wider">
                        {listing.category}
                      </span>
                      <h3 className="font-extrabold text-base text-[#2D3A30] line-clamp-2 leading-snug">
                        {listing.title}
                      </h3>

                      {editingId === listing.id ? (
                        <div className="bg-[#F8F9F5] p-3 rounded-xl border border-[#E0E5DD] space-y-2.5 my-2">
                          <div>
                            <label className="text-[10px] font-bold text-[#86A38B]">Base Price ({currency})</label>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-[#E0E5DD] text-xs font-bold text-[#2D3A30]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#86A38B]">Quantity Available</label>
                            <input
                              type="text"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-[#E0E5DD] text-xs text-[#2D3A30]"
                            />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleSaveEdit(listing.id)}
                              className="flex-1 bg-[#4A5D4E] text-white text-xs font-bold py-1.5 rounded-lg transition"
                            >
                              Save Updates
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-baseline justify-between pt-1">
                          <div>
                            <span className="text-xs text-[#86A38B]">Base: </span>
                            <span className="font-extrabold text-lg text-[#4A5D4E]">
                              {currency} {listing.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-[#86A38B]"> / {listing.unit}</span>
                          </div>
                          <span className="text-xs font-semibold text-[#86A38B]">
                            Qty: {listing.quantity}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E0E5DD] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(listing)}
                          className="p-2 text-[#86A38B] hover:text-[#4A5D4E] hover:bg-[#F8F9F5] rounded-lg transition"
                          title="Quick edit price & quantity"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleListingStatus(listing.id)}
                          className={`p-2 rounded-lg transition text-xs font-bold ${
                            listing.status === 'active'
                              ? 'text-amber-700 hover:bg-amber-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title="Toggle active / sold out status"
                        >
                          {listing.status === 'active' ? 'Mark Sold' : 'Mark Active'}
                        </button>
                      </div>

                      {deleteConfirmId === listing.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { deleteListing(listing.id); setDeleteConfirmId(null); }}
                            className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1.5 rounded-md"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1.5 rounded-md"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(listing.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: INCOMING BUYER ORDERS ======================= */}
      {dashboardTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E0E5DD]">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setOrderStatusFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  orderStatusFilter === 'all' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                All Orders ({myFarmerOrders.length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  orderStatusFilter === 'pending' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                Pending ({myFarmerOrders.filter(o => o.status === 'pending').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('confirmed')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  orderStatusFilter === 'confirmed' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                Confirmed ({myFarmerOrders.filter(o => o.status === 'confirmed').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('in_transit')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  orderStatusFilter === 'in_transit' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                In Transit ({myFarmerOrders.filter(o => o.status === 'in_transit').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('delivered')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  orderStatusFilter === 'delivered' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                Delivered ({myFarmerOrders.filter(o => o.status === 'delivered').length})
              </button>
            </div>
          </div>

          {displayedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E0E5DD] space-y-4">
              <div className="w-16 h-16 bg-[#F8F9F5] text-[#86A38B] rounded-full flex items-center justify-center mx-auto border border-[#E0E5DD]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-[#2D3A30]">No incoming orders matching filter</h3>
              <p className="text-xs text-[#86A38B] max-w-md mx-auto">
                When buyers place orders for your crop batches, they will appear here for you to confirm, dispatch, and track.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedOrders.map((order) => {
                const { url: whatsappUrl } = generateWhatsAppOrderUrl({
                  farmerPhone: order.buyerPhone,
                  farmerName: order.buyerName,
                  produceTitle: order.listingTitle,
                  price: order.unitPrice,
                  unit: 'unit',
                  currency,
                  quantityToOrder: order.quantityOrdered,
                  buyerName: order.farmerName,
                  buyerLocation: order.buyerLocation,
                });

                return (
                  <div 
                    key={order.id}
                    className="bg-white rounded-2xl border border-[#E0E5DD] p-5 shadow-2xs space-y-4 hover:border-[#86A38B] transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0E5DD] pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.listingImageUrl}
                          alt={order.listingTitle}
                          className="w-12 h-12 rounded-xl object-cover border border-[#E0E5DD]"
                        />
                        <div>
                          <h4 className="font-extrabold text-base text-[#2D3A30] line-clamp-1">{order.listingTitle}</h4>
                          <p className="text-xs text-[#86A38B]">Order ID: <span className="font-mono font-bold text-[#2D3A30]">{order.id}</span> • {formatUploadTimeAgo(order.createdAt)}</p>
                        </div>
                      </div>

                      <div>{getOrderStatusBadge(order.status)}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-[#F8F9F5] p-3 rounded-xl border border-[#E0E5DD]">
                        <span className="text-[10px] font-black uppercase text-[#86A38B] tracking-wider block mb-1">Wholesale Buyer</span>
                        <p className="font-bold text-[#2D3A30] flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                          <span>{order.buyerName}</span>
                        </p>
                        <p className="text-[#86A38B] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {order.buyerLocation}
                        </p>
                      </div>

                      <div className="bg-[#F8F9F5] p-3 rounded-xl border border-[#E0E5DD]">
                        <span className="text-[10px] font-black uppercase text-[#86A38B] tracking-wider block mb-1">Order Batch Quantity</span>
                        <p className="font-extrabold text-[#2D3A30] text-sm">{order.quantityOrdered}</p>
                        <p className="text-[#86A38B] mt-0.5">Base Unit Price: {currency} {order.unitPrice.toLocaleString()}</p>
                      </div>

                      <div className="bg-[#FAF5ED] p-3 rounded-xl border border-[#E5B25D]/50">
                        <span className="text-[10px] font-black uppercase text-[#D97706] tracking-wider block mb-1">Farmer Payout Share</span>
                        <p className="font-black text-lg text-[#2D3A30]">{currency} {(order.farmerPayoutAmount || (order.unitPrice * (parseInt(order.quantityOrdered) || 1))).toLocaleString()}</p>
                        <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                          {order.paymentStatus === 'released_to_farmer' ? '✅ Released to Wallet' : '⏳ 24h Escrow Pending'}
                        </span>
                      </div>
                    </div>

                    {order.notes && (
                      <p className="text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 font-medium">
                        💬 <strong>Buyer Notes:</strong> "{order.notes}"
                      </p>
                    )}

                    {/* Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat / Enquire on WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${order.buyerPhone}`}
                          className="bg-[#F8F9F5] hover:bg-[#E8F0E8] text-[#4A5D4E] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-[#E0E5DD] transition"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call Buyer</span>
                        </a>
                      </div>

                      {/* Status Update Quick Buttons */}
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer"
                          >
                            Confirm Order
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'in_transit')}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer"
                          >
                            Dispatch Truck (In Transit)
                          </button>
                        )}
                        {order.status === 'in_transit' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="text-rose-600 hover:bg-rose-50 font-bold px-3 py-2 rounded-xl text-xs border border-rose-200 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 3: WALLET, BANK & STORAGE SUBSCRIPTION ======================= */}
      {dashboardTab === 'wallet' && (
        <div className="space-y-8">
          
          {/* Top Wallet & Cashout Action Banner */}
          <div className="bg-white rounded-3xl border border-[#E0E5DD] p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E0E5DD]">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#86A38B] uppercase tracking-wider">Available Wallet Balance</span>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl sm:text-4xl font-black text-emerald-700">{currency} {(currentUser.walletBalance || 0).toLocaleString()}</h2>
                  <span className="text-xs text-[#86A38B] font-bold">Available for Cashout</span>
                </div>
                <p className="text-xs text-[#86A38B]">
                  Pending 24-Hour Escrow: <strong className="text-[#2D3A30]">{currency} {(currentUser.pendingBalance || 0).toLocaleString()}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCashoutOpen(true)}
                  disabled={(currentUser.walletBalance || 0) <= 0}
                  className={`px-6 py-3.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer ${
                    (currentUser.walletBalance || 0) > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Withdraw Funds to Bank</span>
                </button>
              </div>
            </div>

            {/* Bank Payout Details Setup Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#4A5D4E]" />
                  <h3 className="font-extrabold text-base text-[#2D3A30]">Bank Payout Account</h3>
                </div>
                {currentUser.bankDetails?.accountNumber && !isEditingBank && (
                  <button
                    onClick={() => setIsEditingBank(true)}
                    className="text-xs text-[#4A5D4E] font-bold hover:underline"
                  >
                    Edit Bank Details
                  </button>
                )}
              </div>

              {!isEditingBank && currentUser.bankDetails?.accountNumber ? (
                <div className="bg-[#F8F9F5] p-4 rounded-2xl border border-[#E0E5DD] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#86A38B] uppercase">{currentUser.bankDetails.bankName}</span>
                    <p className="font-extrabold text-sm text-[#2D3A30]">{currentUser.bankDetails.accountName}</p>
                    <p className="font-mono text-[#4A5D4E] mt-0.5">Acc No: {currentUser.bankDetails.accountNumber}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-300">
                    Verified Payout Account
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSaveBankDetails} className="bg-[#F8F9F5] p-5 rounded-2xl border border-[#E0E5DD] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold text-[#2D3A30] mb-1">Select Bank:</label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-[#E0E5DD] text-xs font-bold text-[#2D3A30]"
                      >
                        <option value="Access Bank">Access Bank</option>
                        <option value="GTBank">GTBank</option>
                        <option value="First Bank">First Bank</option>
                        <option value="Zenith Bank">Zenith Bank</option>
                        <option value="UBA">UBA</option>
                        <option value="Kuda Bank">Kuda Bank</option>
                        <option value="OPay">OPay Digital</option>
                        <option value="Palmpay">Palmpay</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-[#2D3A30] mb-1">Account Number (10 digits):</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="e.g. 0123456789"
                        maxLength={10}
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-[#E0E5DD] text-xs font-mono font-bold text-[#2D3A30]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-[#2D3A30] mb-1">Account Name:</label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="e.g. Amara Okafor"
                        className="w-full bg-white px-3 py-2.5 rounded-xl border border-[#E0E5DD] text-xs font-bold text-[#2D3A30]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    {currentUser.bankDetails?.accountNumber && (
                      <button
                        type="button"
                        onClick={() => setIsEditingBank(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#4A5D4E] text-white text-xs font-extrabold rounded-xl shadow-2xs"
                    >
                      Save Bank Payout Account
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Market Space Storage & Visibility Subscription (₦500 / 1 GB Monthly) */}
          <div className="bg-white rounded-3xl border border-[#E0E5DD] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-[#4A5D4E]" />
                  <h3 className="font-extrabold text-base text-[#2D3A30]">Market Space Storage & Visibility Plan</h3>
                </div>
                <p className="text-xs text-[#86A38B]">
                  Farmers rent market space storage and visibility on the platform at <strong>₦500 / 1 GB monthly</strong> (or <strong>₦6,000 / 1 GB annually</strong>).
                </p>
              </div>

              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300 self-start sm:self-auto">
                Status: ACTIVE (1 GB Plan)
              </span>
            </div>

            {/* Storage Usage Meter Bar */}
            <div className="bg-[#F8F9F5] p-5 rounded-2xl border border-[#E0E5DD] space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-[#2D3A30]">Storage Space Occupied ({storageUsedMB} MB used):</span>
                <span className="text-[#4A5D4E] font-mono">{storageUsagePercent}% of {currentTierGB} GB Tier</span>
              </div>

              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${storageUsagePercent}%` }}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#86A38B] pt-1">
                <span>Renews on: <strong>{new Date(Date.now() + 25 * 24 * 3600 * 1000).toLocaleDateString()}</strong></span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => renewSubscription(1, 'monthly', 'paystack')}
                    className="px-3 py-1.5 bg-[#4A5D4E] text-white text-[11px] font-bold rounded-xl transition"
                  >
                    Renew 1 GB (₦500/mo)
                  </button>
                  <button
                    onClick={() => renewSubscription(2, 'annual', 'wallet')}
                    className="px-3 py-1.5 bg-[#E5B25D] text-[#2D3A30] text-[11px] font-black rounded-xl transition"
                  >
                    Upgrade 2 GB (₦12,000/yr)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cashout / Withdrawal History */}
          <div className="bg-white rounded-3xl border border-[#E0E5DD] p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#2D3A30]">Withdrawal & Cashout History</h3>
            
            {!currentUser.withdrawals || currentUser.withdrawals.length === 0 ? (
              <p className="text-xs text-[#86A38B] py-4 text-center">No cashout transactions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {currentUser.withdrawals.map((wth) => (
                  <div key={wth.id} className="bg-[#F8F9F5] p-4 rounded-2xl border border-[#E0E5DD] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-[#2D3A30] text-sm">{currency} {wth.amount.toLocaleString()}</p>
                        <p className="text-[11px] text-[#86A38B]">
                          Ref: <span className="font-mono text-[#2D3A30]">{wth.reference}</span> • {new Date(wth.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {wth.status === 'pending' && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                            ⏳ Pending Company Approval
                          </span>
                        )}
                        {wth.status === 'completed' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                            ✅ Payout Completed
                          </span>
                        )}
                        {wth.status === 'rejected' && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-300">
                            ❌ Declined & Refunded
                          </span>
                        )}
                        <span className="text-[10px] text-[#86A38B] block mt-0.5">{wth.bankDetails.bankName} ({wth.bankDetails.accountNumber})</span>
                      </div>
                    </div>

                    {wth.status === 'rejected' && wth.rejectionReason && (
                      <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-rose-900 text-[11px] font-medium">
                        ⚠️ <strong>Company Admin Note:</strong> "{wth.rejectionReason}". (₦{wth.amount.toLocaleString()} was refunded back to your wallet).
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Explicit Manual Cashout Modal */}
      {isCashoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full border border-[#E0E5DD] shadow-2xl p-6 space-y-6 relative text-[#2D3A30] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E0E5DD] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  💸
                </div>
                <div>
                  <h3 className="font-black text-base text-[#2D3A30]">Explicit Wallet Cashout</h3>
                  <p className="text-xs text-[#86A38B]">Withdraw funds to your bank account</p>
                </div>
              </div>
              <button onClick={() => setIsCashoutOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAF5ED] p-3.5 rounded-2xl border border-[#E5B25D]/60 text-xs">
                <span className="text-[#86A38B]">Available for Cashout:</span>
                <p className="text-xl font-black text-emerald-700">{currency} {(currentUser.walletBalance || 0).toLocaleString()}</p>
                <p className="text-[11px] text-[#86A38B] mt-0.5">Destination: <strong>{currentUser.bankDetails?.bankName} ({currentUser.bankDetails?.accountNumber})</strong></p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-extrabold text-[#2D3A30]">Enter Cashout Amount ({currency}):</label>
                  <button
                    type="button"
                    onClick={() => setCashoutAmount((currentUser.walletBalance || 0).toString())}
                    className="text-xs text-[#4A5D4E] font-bold hover:underline"
                  >
                    Withdraw All
                  </button>
                </div>
                <input
                  type="number"
                  value={cashoutAmount}
                  onChange={(e) => setCashoutAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-[#F8F9F5] px-3.5 py-3 rounded-xl border border-[#E0E5DD] font-extrabold text-base text-[#2D3A30] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCashoutOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 text-xs font-bold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCashout}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-full shadow-md cursor-pointer"
                >
                  Confirm Cashout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
