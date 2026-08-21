import React, { useState } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Navbar } from './components/Navbar';
import { MarketplaceView } from './components/MarketplaceView';
import { CreateListingView } from './components/CreateListingView';
import { FarmerDashboard } from './components/FarmerDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { CompanyAdminDashboard } from './components/CompanyAdminDashboard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { AuthModal } from './components/AuthModal';
import { UpgradeFarmerModal } from './components/UpgradeFarmerModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { EditProfileModal } from './components/EditProfileModal';
import { Listing } from './types';
import { 
  Sprout, 
  Heart, 
  MessageCircle, 
  HelpCircle, 
  Layers, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const MarketplaceApp: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedListing, 
    setSelectedListing,
    toastMessage,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalInitialTab,
    openAuthModal,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen
  } = useMarketplace();

  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9F5] text-[#2D3A30] font-sans antialiased selection:bg-[#E8F0E8] selection:text-[#4A5D4E]">
      
      {/* Top Navigation */}
      <Navbar 
        onOpenAuth={(tab) => openAuthModal(tab || 'switch')}
        onOpenHowItWorks={() => setHowItWorksOpen(true)}
      />

      {/* Main Views */}
      <main className="flex-1">
        {activeTab === 'marketplace' && (
          <MarketplaceView onOpenDetail={(listing: Listing) => setSelectedListing(listing)} />
        )}

        {activeTab === 'create' && (
          <CreateListingView />
        )}

        {activeTab === 'my-listings' && (
          <FarmerDashboard onOpenDetail={(listing: Listing) => setSelectedListing(listing)} />
        )}

        {activeTab === 'buyer-dashboard' && (
          <BuyerDashboard onOpenDetail={(listing: Listing) => setSelectedListing(listing)} />
        )}

        {activeTab === 'admin-portal' && (
          <CompanyAdminDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#4A5D4E] text-white border-t border-[#E0E5DD] py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/20">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white">Produce Marketplace</span>
                <span className="text-[10px] bg-white/15 text-[#E8F0E8] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                  MVP Architecture
                </span>
              </div>
              <p className="text-xs text-[#D4E2D4] mt-0.5">
                Direct Farm-to-Buyer trade with instant click-to-WhatsApp and call orders.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#D4E2D4]">
            <button 
              onClick={() => setActiveTab('marketplace')} 
              className="hover:text-white transition"
            >
              Browse Crops
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('create')} 
              className="hover:text-white transition"
            >
              Post Produce (&lt;1 min)
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('my-listings')} 
              className="hover:text-white transition"
            >
              Farmer Dashboard
            </button>
            <span>•</span>
            <button 
              onClick={() => setHowItWorksOpen(true)} 
              className="hover:text-white text-[#E5B25D] font-extrabold transition flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>MVP Architecture Guide</span>
            </button>
          </div>

        </div>
      </footer>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className="bg-[#2D3A30] text-white text-xs font-bold px-4 py-3 rounded-full shadow-2xl border border-[#E0E5DD] flex items-center gap-2.5 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-[#E5B25D] flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalInitialTab}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <UpgradeFarmerModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      <HowItWorksModal
        isOpen={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
      />

      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceApp />
    </MarketplaceProvider>
  );
}
