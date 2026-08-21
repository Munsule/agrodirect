import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { WithdrawalRequest } from '../types';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wallet, 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  Search, 
  ArrowUpRight, 
  MessageCircle, 
  DollarSign,
  TrendingUp,
  X,
  Send,
  Sparkles
} from 'lucide-react';

export const CompanyAdminDashboard: React.FC = () => {
  const { users, currency, approveWithdrawal, rejectWithdrawal, showToast } = useMarketplace();

  const [filter, setFilter] = useState<'pending' | 'completed' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection Modal State
  const [rejectingRequest, setRejectingRequest] = useState<WithdrawalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Approval Handshake Modal State
  const [approvingRequest, setApprovingRequest] = useState<WithdrawalRequest | null>(null);

  // Aggregate all withdrawal requests across all farmers in the system
  const allWithdrawals: WithdrawalRequest[] = users.reduce((acc: WithdrawalRequest[], u) => {
    if (u.withdrawals && u.withdrawals.length > 0) {
      return [...acc, ...u.withdrawals];
    }
    return acc;
  }, []);

  const pendingRequests = allWithdrawals.filter(w => w.status === 'pending');
  const completedRequests = allWithdrawals.filter(w => w.status === 'completed');
  const rejectedRequests = allWithdrawals.filter(w => w.status === 'rejected');

  const totalPendingValue = pendingRequests.reduce((sum, w) => sum + w.amount, 0);
  const totalCompletedValue = completedRequests.reduce((sum, w) => sum + w.amount, 0);

  const displayedRequests = allWithdrawals
    .filter(w => w.status === filter)
    .filter(w => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        w.farmerName?.toLowerCase().includes(q) ||
        w.bankDetails.accountName.toLowerCase().includes(q) ||
        w.bankDetails.accountNumber.includes(q) ||
        w.bankDetails.bankName.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q)
      );
    });

  const handleConfirmApproval = async () => {
    if (!approvingRequest) return;
    await approveWithdrawal(approvingRequest.id);
    setApprovingRequest(null);
  };

  const handleConfirmRejection = async () => {
    if (!rejectingRequest || !rejectionReason.trim()) {
      showToast('Please provide a specific reason for rejection');
      return;
    }
    await rejectWithdrawal(rejectingRequest.id, rejectionReason.trim());
    setRejectingRequest(null);
    setRejectionReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#2D3A30]">
      
      {/* Header Banner */}
      <div className="bg-[#2D3A30] text-white rounded-[32px] p-6 sm:p-8 border border-[#E0E5DD] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E5B25D] text-[#2D3A30] flex items-center justify-center font-black text-2xl shadow-xs">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">Company Admin Payout Portal</h1>
                <span className="text-xs bg-emerald-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Company Escrow Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#D4E2D4] mt-1 font-medium">
                Official AgroDirect Logistics & Escrow Management • Approve or Reject Farmer Cashouts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#86A38B]">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Payout Orders</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingRequests.length} Requests</p>
          <p className="text-[11px] text-[#86A38B]">Awaiting company approval</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#86A38B]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pending Value</span>
            <DollarSign className="w-5 h-5 text-[#E5B25D]" />
          </div>
          <p className="text-2xl font-black text-[#2D3A30]">{currency} {totalPendingValue.toLocaleString()}</p>
          <p className="text-[11px] text-[#86A38B]">Escrow funds ready for review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#86A38B]">
            <span className="text-xs font-bold uppercase tracking-wider">Approved & Dispatched</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{currency} {totalCompletedValue.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-bold">{completedRequests.length} completed payouts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#86A38B]">
            <span className="text-xs font-bold uppercase tracking-wider">Declined & Refunded</span>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">{rejectedRequests.length} Requests</p>
          <p className="text-[11px] text-rose-600 font-bold">Refunded to farmer wallets</p>
        </div>
      </div>

      {/* Main Approval Table Container */}
      <div className="bg-white rounded-3xl border border-[#E0E5DD] p-6 shadow-xs space-y-6">
        
        {/* Navigation & Search Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E5DD] pb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer relative ${
                filter === 'pending'
                  ? 'bg-[#2D3A30] text-white shadow-xs'
                  : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
              }`}
            >
              <span>Pending Review ({pendingRequests.length})</span>
              {pendingRequests.length > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-[10px] px-2 py-0.2 rounded-full">
                  Action Needed
                </span>
              )}
            </button>

            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer ${
                filter === 'completed'
                  ? 'bg-[#2D3A30] text-white shadow-xs'
                  : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
              }`}
            >
              Approved Payouts ({completedRequests.length})
            </button>

            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer ${
                filter === 'rejected'
                  ? 'bg-[#2D3A30] text-white shadow-xs'
                  : 'bg-[#F8F9F5] text-[#86A38B] hover:text-[#2D3A30]'
              }`}
            >
              Declined Requests ({rejectedRequests.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#86A38B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farmer or bank..."
              className="w-full bg-[#F8F9F5] pl-9 pr-3 py-2 rounded-full border border-[#E0E5DD] text-xs font-semibold text-[#2D3A30] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>
        </div>

        {/* Requests List */}
        {displayedRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-[#F8F9F5] text-[#86A38B] rounded-full flex items-center justify-center mx-auto border border-[#E0E5DD]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-[#2D3A30]">No cashout requests found</h4>
            <p className="text-xs text-[#86A38B] max-w-sm mx-auto">
              There are currently no farmer cashout requests under the "{filter}" category.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedRequests.map((req) => (
              <div 
                key={req.id}
                className="bg-[#F8F9F5] rounded-2xl border border-[#E0E5DD] p-5 shadow-2xs hover:border-[#86A38B] transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0E5DD] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-[#2D3A30]">{currency} {req.amount.toLocaleString()}</span>
                      <span className="text-xs font-mono text-[#86A38B] bg-white px-2 py-0.5 rounded-md border border-[#E0E5DD]">
                        Ref: {req.reference}
                      </span>
                    </div>
                    <p className="text-xs text-[#86A38B] mt-0.5">
                      Requested on: <strong>{new Date(req.createdAt).toLocaleString()}</strong>
                    </p>
                  </div>

                  <div>
                    {req.status === 'pending' && (
                      <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        <span>Awaiting Company Payout Approval</span>
                      </span>
                    )}
                    {req.status === 'completed' && (
                      <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Approved & Dispatched ({new Date(req.completedAt || Date.now()).toLocaleDateString()})</span>
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="bg-rose-100 text-rose-900 text-xs font-extrabold px-3 py-1 rounded-full border border-rose-300 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Declined & Refunded to Farmer</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Farmer & Bank Details Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-[#E0E5DD] space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#86A38B] tracking-wider block">Farmer Account</span>
                    <p className="font-extrabold text-sm text-[#2D3A30] flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#4A5D4E]" />
                      <span>{req.farmerName || 'Farmer Producer'}</span>
                    </p>
                    <p className="text-[#86A38B]">Phone: <strong className="text-[#2D3A30]">{req.farmerPhone || 'Registered Farmer'}</strong></p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#E0E5DD] space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#86A38B] tracking-wider block">Destination Bank Payout Account</span>
                    <p className="font-extrabold text-sm text-[#2D3A30]">{req.bankDetails.accountName}</p>
                    <p className="text-[#86A38B]">
                      {req.bankDetails.bankName} • Acc No: <strong className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{req.bankDetails.accountNumber}</strong>
                    </p>
                  </div>
                </div>

                {req.rejectionReason && (
                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs text-rose-900 font-medium">
                    ⚠️ <strong>Rejection Reason Communicated to Farmer:</strong> "{req.rejectionReason}"
                  </div>
                )}

                {/* Action Buttons for Pending Requests */}
                {req.status === 'pending' && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setRejectingRequest(req)}
                      className="bg-white hover:bg-rose-50 text-rose-700 font-bold px-4 py-2.5 rounded-xl border border-rose-200 text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject & Refund to Farmer</span>
                    </button>

                    <button
                      onClick={() => setApprovingRequest(req)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-xs text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Trigger Payout</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Approval Handshake Modal */}
      {approvingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 space-y-6 border border-[#E0E5DD] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E0E5DD] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ✅
                </div>
                <h3 className="font-black text-base text-[#2D3A30]">Confirm Payout Approval</h3>
              </div>
              <button onClick={() => setApprovingRequest(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8F9F5] p-4 rounded-2xl border border-[#E0E5DD] space-y-2 text-xs">
              <p className="text-[#86A38B]">Farmer: <strong className="text-[#2D3A30]">{approvingRequest.farmerName}</strong></p>
              <p className="text-[#86A38B]">Bank: <strong className="text-[#2D3A30]">{approvingRequest.bankDetails.bankName} ({approvingRequest.bankDetails.accountNumber})</strong></p>
              <div className="border-t border-[#E0E5DD] pt-2 flex justify-between items-baseline font-black text-base text-[#2D3A30]">
                <span>Payout Amount:</span>
                <span className="text-emerald-700 text-lg">{currency} {approvingRequest.amount.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-[#86A38B]">
              Upon approval, the farmer will receive an instant notification and funds will be marked dispatched to their bank account.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setApprovingRequest(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 text-xs font-bold rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-full shadow-md cursor-pointer"
              >
                Approve Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal with Reason Input */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 space-y-6 border border-[#E0E5DD] shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E0E5DD] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  ⚠️
                </div>
                <h3 className="font-black text-base text-[#2D3A30]">Decline Payout Request</h3>
              </div>
              <button onClick={() => setRejectingRequest(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-1.5 text-xs text-rose-900 font-medium">
              <p>Requested: <strong>{currency} {rejectingRequest.amount.toLocaleString()}</strong> by {rejectingRequest.farmerName}</p>
              <p className="text-[11px] text-rose-700">Declining will automatically refund ₦{rejectingRequest.amount.toLocaleString()} back to the farmer's wallet and send them your reason.</p>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#2D3A30] mb-1">
                Reason for Rejection (Communicated to Farmer): <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Account name does not match farmer profile. Please correct your bank details."
                className="w-full bg-[#F8F9F5] p-3 rounded-xl border border-[#E0E5DD] text-xs text-[#2D3A30] focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRejectingRequest(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 text-xs font-bold rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-full shadow-md cursor-pointer"
              >
                Confirm Decline & Refund
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
