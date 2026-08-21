import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { 
  X, 
  Sprout, 
  Search, 
  MessageCircle, 
  ArrowRight, 
  Database, 
  CheckCircle2, 
  ShieldCheck,
  Wifi,
  WifiOff,
  Zap,
  Phone
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  const { setActiveTab, openAuthModal } = useMarketplace();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2D3A30]/75 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-[#F8F9F5] text-[#2D3A30] w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-[#E0E5DD]"
      >
        
        {/* Modal Header */}
        <div className="bg-[#4A5D4E] text-white p-6 border-b border-[#E0E5DD] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#D4E2D4] uppercase tracking-wider">
              Produce Marketplace Architecture & Offline Engine
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              Direct Farm Gate to Buyer Workflow
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full text-white bg-white/10 hover:bg-white/20 flex items-center justify-center transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[80vh]">
          
          {/* 3-Step Flow */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-[#4A5D4E] uppercase tracking-wider">
              The 3-Step Agro Flow:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Step 1 */}
              <div className="bg-white p-4 rounded-2xl border border-[#E0E5DD] flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="w-8 h-8 rounded-full bg-[#4A5D4E] text-white font-extrabold flex items-center justify-center text-xs mb-3 shadow-2xs">
                    1
                  </div>
                  <h5 className="font-extrabold text-[#2D3A30] text-sm">
                    Farmer Fast Listing
                  </h5>
                  <p className="text-xs text-[#86A38B] mt-1 leading-relaxed font-medium">
                    List crops with Title, Category, Price in Naira (₦), and Quantity in &lt;30s. Works even with 0 network bars!
                  </p>
                </div>
                <div className="mt-3 text-[11px] font-bold text-[#4A5D4E]">
                  ⚡ Offline outbox enabled
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-4 rounded-2xl border border-[#E0E5DD] flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="w-8 h-8 rounded-full bg-[#86A38B] text-white font-extrabold flex items-center justify-center text-xs mb-3 shadow-2xs">
                    2
                  </div>
                  <h5 className="font-extrabold text-[#2D3A30] text-sm">
                    Buyer Radar & Filters
                  </h5>
                  <p className="text-xs text-[#86A38B] mt-1 leading-relaxed font-medium">
                    Filter by harvest state, price range, and truck delivery availability.
                  </p>
                </div>
                <div className="mt-3 text-[11px] font-bold text-[#4A5D4E]">
                  🔍 GPS Agro Radar
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-4 rounded-2xl border border-[#E0E5DD] flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs mb-3 shadow-2xs">
                    3
                  </div>
                  <h5 className="font-extrabold text-[#2D3A30] text-sm">
                    In-App Paystack Payment & Escrow
                  </h5>
                  <p className="text-xs text-[#86A38B] mt-1 leading-relaxed font-medium">
                    Order and pay directly in-app using Paystack with 24h escrow safety. Use WhatsApp for direct crop inquiries.
                  </p>
                </div>
                <div className="mt-3 text-[11px] font-bold text-emerald-700">
                  💳 Paystack & 24h Escrow Protection
                </div>
              </div>

            </div>
          </div>

          {/* Offline Sync Architecture Highlight */}
          <div className="bg-[#E8F0E8] p-5 rounded-2xl border border-[#D4E2D4] space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#4A5D4E] uppercase tracking-wider">
              <Zap className="w-4 h-4 text-[#E5B25D]" />
              <span>Offline-First Resilience in Remote Farms</span>
            </div>
            <p className="text-xs text-[#2D3A30] leading-relaxed">
              When farmers are in remote fields with unstable or zero connectivity, new crop listings and status changes are stored immediately in local memory. As soon as connectivity is detected, the built-in background engine automatically flushes the queue directly into Cloud Firestore without any manual intervention.
            </p>
          </div>

          {/* Lightweight Auth Engine */}
          <div className="bg-white p-5 rounded-2xl border border-[#E0E5DD] space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#4A5D4E] uppercase tracking-wider">
              <Phone className="w-4 h-4 text-[#4A5D4E]" />
              <span>Lightweight Farmer & Buyer Accounts</span>
            </div>
            <p className="text-xs text-[#86A38B] leading-relaxed text-xs">
              No complicated passwords. Farmers and Buyers register with their WhatsApp phone number, farm/company name, and location in under 5 seconds. Profiles are synced to Firestore <code className="text-[#2D3A30] font-bold">users</code> collection.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                openAuthModal('farmer');
              }}
              className="flex-1 py-3 px-5 rounded-full bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-2xs transition"
            >
              <Sprout className="w-4 h-4" />
              <span>Farmer Login / Register</span>
            </button>

            <button
              onClick={() => {
                onClose();
                openAuthModal('buyer');
              }}
              className="flex-1 py-3 px-5 rounded-full bg-white hover:bg-[#F8F9F5] text-[#2D3A30] border border-[#E0E5DD] font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-2xs"
            >
              <Search className="w-4 h-4" />
              <span>Buyer Login / Register</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
