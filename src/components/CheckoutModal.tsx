import React, { useState } from 'react';
import { Listing, Order, OrderStatus } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ArrowRight,
  Sprout,
  Receipt,
  AlertCircle
} from 'lucide-react';

interface CheckoutModalProps {
  listing: Listing | null;
  initialQuantity?: string;
  initialNotes?: string;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  listing, 
  initialQuantity = '1 unit', 
  initialNotes = '', 
  onClose, 
  onSuccess 
}) => {
  const { currency, currentUser, placeOrder, showToast } = useMarketplace();

  if (!listing) return null;

  const [quantityStr, setQuantityStr] = useState(initialQuantity);
  const [notes, setNotes] = useState(initialNotes);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd' | 'company_transfer'>('card');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Paystack mock form state
  const [cardNumber, setCardNumber] = useState('4084 0000 0000 1234');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('884');
  const [selectedBank, setSelectedBank] = useState('GTBank');

  // Math Calculations for 5% Platform Markup Fee
  const qtyNumber = parseFloat(quantityStr.replace(/[^0-9.]/g, '')) || 1;
  const basePricePerUnit = listing.price;
  const platformFeePerUnit = Math.round(basePricePerUnit * 0.05); // 5% fee
  const finalPricePerUnit = basePricePerUnit + platformFeePerUnit;

  const baseSubtotal = basePricePerUnit * qtyNumber;
  const platformFeeTotal = platformFeePerUnit * qtyNumber;
  const totalAmountPayable = baseSubtotal + platformFeeTotal;

  const handlePaystackCheckout = () => {
    setIsProcessing(true);

    // Simulate Paystack secure gateway handshake (1.2s delay)
    setTimeout(() => {
      const orderRef = `pstk_ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const availableCashoutAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // 24 hours later

      const orderData: Omit<Order, 'id' | 'createdAt'> = {
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
        quantityOrdered: quantityStr,
        unitPrice: basePricePerUnit,
        platformFee: platformFeePerUnit,
        finalPrice: finalPricePerUnit,
        totalAmount: totalAmountPayable,
        farmerPayoutAmount: baseSubtotal,
        paymentStatus: 'paid_escrow',
        paymentMethod: paymentMethod === 'company_transfer' 
          ? 'company_bank_transfer' 
          : paymentMethod === 'card' 
          ? 'paystack_card' 
          : paymentMethod === 'transfer' 
          ? 'paystack_bank_transfer' 
          : 'paystack_ussd',
        paymentReference: orderRef,
        paidAt: new Date().toISOString(),
        availableForCashoutAt: availableCashoutAt,
        status: 'pending' as OrderStatus,
        notes: notes.trim() || undefined,
      };

      const newOrder = placeOrder(orderData);
      setCreatedOrder(newOrder);
      setIsProcessing(false);
      setPaymentCompleted(true);
      showToast(`🎉 Payment of ${currency}${totalAmountPayable.toLocaleString()} successful via Paystack!`);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] max-w-xl w-full border border-[#E0E5DD] shadow-2xl overflow-hidden relative text-[#2D3A30] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#4A5D4E] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5B25D] text-[#2D3A30] flex items-center justify-center font-extrabold shadow-xs">
              💳
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <span>In-App Escrow Checkout</span>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Paystack Secured
                </span>
              </h2>
              <p className="text-xs text-[#D4E2D4] font-medium">Direct Escrow Protection • 24-Hour Maturation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!paymentCompleted ? (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

            {/* Crop Info Tile */}
            <div className="flex items-center gap-4 bg-[#F8F9F5] p-4 rounded-2xl border border-[#E0E5DD]">
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-16 h-16 rounded-2xl object-cover border border-[#E0E5DD]"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#86A38B] uppercase tracking-wider">{listing.category}</span>
                <h3 className="font-extrabold text-sm text-[#2D3A30] truncate">{listing.title}</h3>
                <p className="text-xs text-[#86A38B] mt-0.5">Farmer: <span className="font-bold text-[#2D3A30]">{listing.farmerName}</span> • {listing.location}</p>
              </div>
            </div>

            {/* Order Quantity Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#2D3A30] mb-1">Quantity Requested:</label>
                <input
                  type="text"
                  value={quantityStr}
                  onChange={(e) => setQuantityStr(e.target.value)}
                  className="w-full bg-[#F8F9F5] px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] text-xs font-bold text-[#2D3A30] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2D3A30] mb-1">Delivery / Order Note:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please send by morning truck"
                  className="w-full bg-[#F8F9F5] px-3.5 py-2.5 rounded-xl border border-[#E0E5DD] text-xs text-[#2D3A30] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>
            </div>

            {/* Direct Total Pricing Breakdown (Inclusive of 5% Fee) */}
            <div className="bg-[#FAF5ED] p-4 rounded-2xl border border-[#E5B25D]/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#86A38B]">
                <span>Unit Price (Inclusive of Platform Fee):</span>
                <span className="font-bold text-[#2D3A30]">{currency} {finalPricePerUnit.toLocaleString()} / {listing.unit}</span>
              </div>
              <div className="flex items-center justify-between text-[#86A38B]">
                <span>Quantity Selected:</span>
                <span className="font-bold text-[#2D3A30]">{quantityStr}</span>
              </div>
              <div className="border-t border-[#E5B25D]/40 pt-2 flex items-center justify-between font-black text-sm text-[#2D3A30]">
                <span>Total Amount Due (Paystack):</span>
                <span className="text-base text-[#4A5D4E]">{currency} {totalAmountPayable.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-[#86A38B] font-medium pt-0.5">
                ✓ Price includes platform service & Paystack payment processing. No extra fees added at checkout.
              </p>
            </div>

            {/* Payment Channel Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold text-[#2D3A30]">Select Preferred Payment Gateway Option:</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-2xs'
                      : 'bg-[#F8F9F5] text-[#86A38B] border-[#E0E5DD] hover:text-[#2D3A30]'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Paystack Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('company_transfer')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    paymentMethod === 'company_transfer'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                      : 'bg-[#FAF5ED] text-[#D97706] border-[#E5B25D]/60 hover:text-[#2D3A30]'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>Company Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    paymentMethod === 'transfer'
                      ? 'bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-2xs'
                      : 'bg-[#F8F9F5] text-[#86A38B] border-[#E0E5DD] hover:text-[#2D3A30]'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>Paystack Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('ussd')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    paymentMethod === 'ussd'
                      ? 'bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-2xs'
                      : 'bg-[#F8F9F5] text-[#86A38B] border-[#E0E5DD] hover:text-[#2D3A30]'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span>Paystack USSD</span>
                </button>
              </div>

              {/* Direct Company Bank Transfer Box */}
              {paymentMethod === 'company_transfer' && (
                <div className="bg-[#FAF5ED] p-4 rounded-2xl border border-[#E5B25D]/80 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#D97706] bg-[#E5B25D]/20 px-2 py-0.5 rounded-md">
                      Official Company Escrow Account
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('1029384756');
                        setCopiedAccount(true);
                        setTimeout(() => setCopiedAccount(false), 2000);
                      }}
                      className="text-[11px] font-bold text-[#4A5D4E] hover:underline"
                    >
                      {copiedAccount ? 'Copied Account!' : 'Copy Account No'}
                    </button>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#86A38B]">Account Name: <strong className="text-[#2D3A30]">AgroDirect Logistics & Escrow Ltd</strong></p>
                    <p className="text-[11px] text-[#86A38B]">Bank: <strong className="text-[#2D3A30]">Zenith Bank Plc</strong></p>
                    <p className="font-extrabold text-base text-[#2D3A30] mt-1">
                      Account No: <span className="font-mono text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-[#E5B25D]">1029384756</span>
                    </p>
                  </div>
                  <p className="text-[11px] text-[#4A5D4E] leading-relaxed">
                    Transfer exactly <strong>{currency}{totalAmountPayable.toLocaleString()}</strong> to the Company Account above. Funds are held safely in company escrow until farmer payout approval.
                  </p>
                </div>
              )}

              {/* Paystack Channel Form View */}
              {paymentMethod === 'card' && (
                <div className="bg-[#F8F9F5] p-4 rounded-2xl border border-[#E0E5DD] space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#86A38B] mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white px-3 py-2 rounded-xl border border-[#E0E5DD] font-mono font-bold text-[#2D3A30]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#86A38B] mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white px-3 py-2 rounded-xl border border-[#E0E5DD] font-mono font-bold text-[#2D3A30]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#86A38B] mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-white px-3 py-2 rounded-xl border border-[#E0E5DD] font-mono font-bold text-[#2D3A30]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div className="bg-[#F8F9F5] p-4 rounded-2xl border border-[#E0E5DD] text-xs space-y-1.5">
                  <span className="text-[10px] font-bold text-[#86A38B] uppercase">Paystack Dedicated Account</span>
                  <p className="font-extrabold text-sm text-[#2D3A30]">Paystack / Wema Bank: <span className="font-mono text-emerald-700">9918230911</span></p>
                  <p className="text-[#86A38B] text-[11px]">Transfer exactly {currency}{totalAmountPayable.toLocaleString()} to complete instant order validation.</p>
                </div>
              )}

              {paymentMethod === 'ussd' && (
                <div className="bg-[#F8F9F5] p-4 rounded-2xl border border-[#E0E5DD] text-xs space-y-2">
                  <label className="block text-[10px] font-bold text-[#86A38B] uppercase">Select Bank for USSD Code</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-[#E0E5DD] font-bold text-[#2D3A30]"
                  >
                    <option value="GTBank">GTBank (*737*000*9918#)</option>
                    <option value="Access">Access Bank (*901*000*9918#)</option>
                    <option value="Zenith">Zenith Bank (*966*000*9918#)</option>
                    <option value="FirstBank">First Bank (*894*000*9918#)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Escrow Guarantee Note */}
            <div className="flex items-center gap-2 text-xs text-[#86A38B] bg-[#E8F0E8] p-3 rounded-2xl border border-[#D4E2D4]">
              <ShieldCheck className="w-5 h-5 text-[#4A5D4E] flex-shrink-0" />
              <span>
                <strong>24-Hour Escrow Protection:</strong> Your payment is safely held by the platform and only available for farmer cashout after 24 hours or upon delivery.
              </span>
            </div>

            {/* Paystack Primary Button */}
            <button
              id="paystack-submit-payment-btn"
              onClick={handlePaystackCheckout}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black py-4 px-6 rounded-full shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Paystack Gateway...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay {currency}{totalAmountPayable.toLocaleString()} via Paystack</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Payment Success & Receipt Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs border border-emerald-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Received & Escrow Locked
              </span>
              <h3 className="text-2xl font-black text-[#2D3A30]">Order Confirmed!</h3>
              <p className="text-xs text-[#86A38B] max-w-md mx-auto">
                Your payment of <strong>{currency}{totalAmountPayable.toLocaleString()}</strong> for "{listing.title}" has been successfully processed by Paystack.
              </p>
            </div>

            <div className="bg-[#F8F9F5] p-4 rounded-2xl border border-[#E0E5DD] text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-[#86A38B]">Order ID:</span>
                <span className="font-bold text-[#2D3A30]">{createdOrder?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86A38B]">Paystack Reference:</span>
                <span className="font-bold text-emerald-700">{createdOrder?.paymentReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86A38B]">Farmer Share (Base):</span>
                <span className="font-bold text-[#2D3A30]">{currency}{baseSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86A38B]">5% Platform Fee:</span>
                <span className="font-bold text-[#D97706]">{currency}{platformFeeTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#E0E5DD] pt-1">
                <span className="text-[#86A38B]">24h Escrow Release:</span>
                <span className="font-bold text-[#4A5D4E]">Maturing in 24 hours</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onSuccess(createdOrder!);
                  onClose();
                }}
                className="bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-extrabold px-7 py-3.5 rounded-full text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-[#E5B25D]" />
                <span>Track Order in Buyer Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
