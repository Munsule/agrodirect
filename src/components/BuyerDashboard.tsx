import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Listing, Order, OrderStatus } from '../types';
import { generateWhatsAppOrderUrl } from '../utils/orderHelper';
import { formatUploadTimeAgo } from '../utils/timeAgo';
import { 
  ShoppingBag, 
  Bookmark, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  PackageCheck, 
  PhoneCall, 
  MessageCircle, 
  ArrowRight, 
  MapPin, 
  Sprout, 
  ExternalLink,
  DollarSign,
  Heart,
  ShoppingBasket
} from 'lucide-react';

interface BuyerDashboardProps {
  onOpenDetail: (listing: Listing) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onOpenDetail }) => {
  const { 
    currentUser, 
    orders, 
    listings, 
    savedListingIds, 
    toggleBookmark, 
    placeOrder, 
    setActiveTab, 
    currency,
    showToast
  } = useMarketplace();

  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'bookmarks' | 'overview'>('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');

  // Filter orders placed by this buyer (by buyerId or phone)
  const myOrders = orders.filter(o => 
    o.buyerId === currentUser.id || 
    (currentUser.phone && o.buyerPhone.includes(currentUser.phone.slice(-7)))
  );

  const displayedOrders = myOrders.filter(o => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  // Saved / Bookmarked listings
  const savedListings = listings.filter(l => savedListingIds.includes(l.id));

  // Analytics stats
  const totalSpent = myOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || (o.unitPrice * (parseInt(o.quantityOrdered) || 1))), 0);

  const deliveredCount = myOrders.filter(o => o.status === 'delivered').length;
  const activeOrdersCount = myOrders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'in_transit').length;

  const handleReorder = (order: Order) => {
    placeOrder({
      listingId: order.listingId,
      listingTitle: order.listingTitle,
      listingImageUrl: order.listingImageUrl,
      listingCategory: order.listingCategory,
      farmerId: order.farmerId,
      farmerName: order.farmerName,
      farmerPhone: order.farmerPhone,
      farmerLocation: order.farmerLocation,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerPhone: currentUser.phone,
      buyerLocation: currentUser.location,
      quantityOrdered: order.quantityOrdered,
      unitPrice: order.unitPrice,
      totalAmount: order.totalAmount,
      notes: `Re-order based on previous order #${order.id}`,
    });
    showToast(`🛒 Re-order placed for "${order.listingTitle}"!`);
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Farmer Confirmation</span>;
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Order Confirmed</span>;
      case 'in_transit':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-300 flex items-center gap-1"><Truck className="w-3 h-3" /> In Transit / Freight</span>;
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1"><PackageCheck className="w-3 h-3" /> Delivered & Completed</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-300 flex items-center gap-1"><XCircle className="w-3 h-3" /> Order Cancelled</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#2D3A30]">
      
      {/* Top Buyer Hero Banner */}
      <div className="bg-[#4A5D4E] text-white rounded-[32px] p-6 sm:p-8 border border-[#E0E5DD] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-[#E5B25D] flex items-center justify-center border border-white/20 shadow-xs flex-shrink-0 text-2xl font-black">
              🛒
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.name}</h1>
                <span className="text-xs bg-[#E5B25D] text-[#2D3A30] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {currentUser.buyerType || 'Wholesale Buyer'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#D4E2D4] mt-1 font-medium flex items-center gap-2">
                <span>📱 {currentUser.phone}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {currentUser.location}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('marketplace')}
            className="bg-[#E5B25D] hover:bg-[#d99f43] text-[#2D3A30] font-black px-5 py-3 rounded-full shadow-md transition flex items-center gap-2 text-xs sm:text-sm cursor-pointer self-start sm:self-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Fresh Crops</span>
          </button>
        </div>
      </div>

      {/* Analytics Bento Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#86A38B]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Purchases</span>
            <ShoppingBag className="w-5 h-5 text-[#4A5D4E]" />
          </div>
          <p className="text-2xl font-black text-[#2D3A30]">{myOrders.length} Orders</p>
          <p className="text-[11px] text-[#86A38B]">Direct farm gate purchases</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#86A38B]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Amount Spent</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{currency} {totalSpent.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-medium">Cumulative order value</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#86A38B]">
            <span className="text-xs font-bold uppercase tracking-wider">Active Shipments</span>
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-[#2D3A30]">{activeOrdersCount} In Progress</p>
          <p className="text-[11px] text-blue-600 font-bold">Pending or in transit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#86A38B]">
            <span className="text-xs font-bold uppercase tracking-wider">Saved Produce</span>
            <Bookmark className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-[#2D3A30]">{savedListings.length} Items</p>
          <p className="text-[11px] text-[#86A38B]">Bookmarked crops</p>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex border-b border-[#E0E5DD] bg-white rounded-2xl p-2 shadow-2xs gap-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            activeSubTab === 'orders'
              ? 'bg-[#4A5D4E] text-white shadow-xs'
              : 'text-[#86A38B] hover:text-[#2D3A30] hover:bg-[#F8F9F5]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Orders & History ({myOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bookmarks')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            activeSubTab === 'bookmarks'
              ? 'bg-[#4A5D4E] text-white shadow-xs'
              : 'text-[#86A38B] hover:text-[#2D3A30] hover:bg-[#F8F9F5]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Crops ({savedListings.length})</span>
        </button>
      </div>

      {/* ======================= TAB 1: MY ORDERS & SHOPPING HISTORY ======================= */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E0E5DD]">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setOrderStatusFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  orderStatusFilter === 'all' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                All Orders ({myOrders.length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  orderStatusFilter === 'pending' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                Pending ({myOrders.filter(o => o.status === 'pending').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('confirmed')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  orderStatusFilter === 'confirmed' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                Confirmed ({myOrders.filter(o => o.status === 'confirmed').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('in_transit')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  orderStatusFilter === 'in_transit' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                In Transit ({myOrders.filter(o => o.status === 'in_transit').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('delivered')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  orderStatusFilter === 'delivered' ? 'bg-[#2D3A30] text-white' : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
                }`}
              >
                Delivered ({myOrders.filter(o => o.status === 'delivered').length})
              </button>
            </div>
          </div>

          {displayedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E0E5DD] space-y-4">
              <div className="w-16 h-16 bg-[#F8F9F5] text-[#86A38B] rounded-full flex items-center justify-center mx-auto border border-[#E0E5DD]">
                <ShoppingBasket className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-[#2D3A30]">No orders found</h3>
              <p className="text-xs text-[#86A38B] max-w-md mx-auto">
                You haven't placed any direct produce orders matching this filter. Browse fresh crop listings from verified farmers to place your first direct farm gate purchase.
              </p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-extrabold px-6 py-3 rounded-full text-xs transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#E5B25D]" />
                <span>Explore Marketplace Crops</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedOrders.map((order) => {
                const { url: whatsappUrl } = generateWhatsAppOrderUrl({
                  farmerPhone: order.farmerPhone,
                  farmerName: order.farmerName,
                  produceTitle: order.listingTitle,
                  price: order.unitPrice,
                  unit: 'unit',
                  currency,
                  quantityToOrder: order.quantityOrdered,
                  buyerName: order.buyerName,
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
                          className="w-14 h-14 rounded-xl object-cover border border-[#E0E5DD]"
                        />
                        <div>
                          <h4 className="font-extrabold text-base text-[#2D3A30] line-clamp-1">{order.listingTitle}</h4>
                          <p className="text-xs text-[#86A38B]">Order ID: <span className="font-mono font-bold text-[#2D3A30]">{order.id}</span> • Placed {formatUploadTimeAgo(order.createdAt)}</p>
                        </div>
                      </div>

                      <div>{getOrderStatusBadge(order.status)}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="bg-[#F8F9F5] p-3 rounded-xl border border-[#E0E5DD]">
                        <span className="text-[10px] font-black uppercase text-[#86A38B] tracking-wider block mb-1">Farmer / Origin Farm</span>
                        <p className="font-bold text-[#2D3A30] flex items-center gap-1.5">
                          <Sprout className="w-3.5 h-3.5 text-[#4A5D4E]" />
                          <span>{order.farmerName}</span>
                        </p>
                        <p className="text-[#86A38B] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {order.farmerLocation}
                        </p>
                      </div>

                      <div className="bg-[#F8F9F5] p-3 rounded-xl border border-[#E0E5DD]">
                        <span className="text-[10px] font-black uppercase text-[#86A38B] tracking-wider block mb-1">Quantity & Unit Price</span>
                        <p className="font-extrabold text-[#2D3A30] text-sm">{order.quantityOrdered}</p>
                        <p className="text-[#86A38B] mt-0.5">Unit Price: {currency} {order.unitPrice.toLocaleString()}</p>
                      </div>

                      <div className="bg-[#FAF5ED] p-3 rounded-xl border border-[#E5B25D]/50">
                        <span className="text-[10px] font-black uppercase text-[#D97706] tracking-wider block mb-1">Total Order Value</span>
                        <p className="font-black text-lg text-[#2D3A30]">{currency} {(order.totalAmount || (order.unitPrice * (parseInt(order.quantityOrdered) || 1))).toLocaleString()}</p>
                      </div>
                    </div>

                    {order.notes && (
                      <p className="text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 font-medium">
                        💬 <strong>Order Notes:</strong> "{order.notes}"
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
                          <span>Contact Farmer on WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${order.farmerPhone}`}
                          className="bg-[#F8F9F5] hover:bg-[#E8F0E8] text-[#4A5D4E] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-[#E0E5DD] transition"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call Farmer</span>
                        </a>
                      </div>

                      <button
                        onClick={() => handleReorder(order)}
                        className="bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#E5B25D]" />
                        <span>Order Again</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: SAVED / BOOKMARKED CROPS ======================= */}
      {activeSubTab === 'bookmarks' && (
        <div className="space-y-6">
          {savedListings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E0E5DD] space-y-4">
              <div className="w-16 h-16 bg-[#F8F9F5] text-[#86A38B] rounded-full flex items-center justify-center mx-auto border border-[#E0E5DD]">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-[#2D3A30]">No bookmarked produce items</h3>
              <p className="text-xs text-[#86A38B] max-w-md mx-auto">
                Bookmark produce listings while browsing the marketplace to save them here for quick comparison and direct ordering.
              </p>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-extrabold px-6 py-3 rounded-full text-xs transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#E5B25D]" />
                <span>Browse Marketplace</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedListings.map((listing) => (
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
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => toggleBookmark(listing.id)}
                        className="p-2 bg-white text-rose-500 rounded-full shadow-xs backdrop-blur-xs transition"
                        title="Remove bookmark"
                      >
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#86A38B] uppercase tracking-wider">{listing.category}</span>
                      <h3 className="font-extrabold text-base text-[#2D3A30] line-clamp-1">{listing.title}</h3>
                      <p className="text-xs text-[#86A38B] flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.location}</p>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-[#E0E5DD]">
                      <div>
                        <span className="font-black text-lg text-[#4A5D4E]">{currency} {listing.price.toLocaleString()}</span>
                        <span className="text-xs text-[#86A38B]"> / {listing.unit}</span>
                      </div>
                      <button
                        onClick={() => onOpenDetail(listing)}
                        className="bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
