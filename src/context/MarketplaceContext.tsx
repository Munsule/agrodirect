import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Listing, User, FilterState, Order, OrderStatus } from '../types';
import { INITIAL_LISTINGS, INITIAL_USERS } from '../data/mockData';
import { 
  saveListingToFirestore, 
  deleteListingFromFirestore, 
  updateListingInFirestore, 
  saveUserToFirestore,
  seedFirestoreDatabase,
  subscribeToListings,
  subscribeToUsers,
  initFirebase
} from '../lib/firebase';
import {
  checkApiHealth,
  fetchListingsFromApi,
  createListingApi,
  updateListingApi,
  deleteListingApi,
  loginByPhoneApi,
  registerFarmerApi,
  registerBuyerApi,
  upgradeToFarmerApi,
  fetchUsersFromApi,
  updateUserApi,
  fetchOrdersFromApi,
  createOrderApi,
  updateOrderStatusApi,
  updateBankDetailsApi,
  requestWithdrawalApi,
  renewSubscriptionApi,
  approveWithdrawalApi,
  rejectWithdrawalApi
} from '../lib/api';

interface OfflineQueueItem {
  type: 'create_listing' | 'update_listing' | 'delete_listing';
  listing?: Listing;
  listingId?: string;
  updates?: Partial<Listing>;
  timestamp: number;
}

interface MarketplaceContextType {
  listings: Listing[];
  users: User[];
  orders: Order[];
  currentUser: User;
  currency: string;
  setCurrency: (c: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  savedListingIds: string[];
  activeTab: 'marketplace' | 'create' | 'my-listings' | 'buyer-dashboard' | 'how-it-works' | 'admin-portal';
  setActiveTab: (tab: 'marketplace' | 'create' | 'my-listings' | 'buyer-dashboard' | 'how-it-works' | 'admin-portal') => void;
  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing | null) => void;
  
  // Listings actions
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'status'>) => Listing;
  deleteListing: (id: string) => void;
  toggleListingStatus: (id: string) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  toggleBookmark: (id: string) => void;

  // Orders actions
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'> & { status?: OrderStatus }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Wallet & Storage Subscription actions
  updateBankDetails: (data: { bankName: string; accountNumber: string; accountName: string }) => Promise<void>;
  requestWithdrawal: (amount: number) => Promise<void>;
  approveWithdrawal: (withdrawalId: string) => Promise<void>;
  rejectWithdrawal: (withdrawalId: string, reason: string) => Promise<void>;
  renewSubscription: (storageTierGB: number, billingCycle: 'monthly' | 'annual', paymentMethod: 'paystack' | 'wallet') => Promise<void>;
  
  // Auth actions
  switchUser: (user: User) => void;
  registerUser: (userData: Omit<User, 'id'>) => User;
  registerFarmer: (data: { 
    name: string; 
    phone: string; 
    email?: string; 
    password?: string; 
    farmName?: string; 
    location?: string; 
    primaryCrops?: string[]; 
  }) => User;
  registerBuyer: (data: { 
    name: string; 
    phone: string; 
    email?: string; 
    password?: string; 
    buyerType?: User['buyerType']; 
    location?: string; 
    companyName?: string; 
  }) => User;
  loginByPhone: (phone: string, preferredRole?: 'farmer' | 'buyer') => Promise<{ success: boolean; user?: User; message: string }>;
  loginWithCredentials: (credential: string, password?: string) => Promise<{ success: boolean; user?: User; message: string }>;
  upgradeToFarmer: (data: { farmName: string; location: string; primaryCrops: string[]; canDeliver?: boolean }) => Promise<User>;
  updateUserProfile: (updates: Partial<User>) => Promise<User>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalInitialTab: 'farmer' | 'buyer' | 'switch';
  openAuthModal: (tab?: 'farmer' | 'buyer' | 'switch') => void;
  isUpgradeModalOpen: boolean;
  setIsUpgradeModalOpen: (open: boolean) => void;
  openUpgradeModal: () => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  openProfileModal: () => void;
  
  // Offline & Sync states
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  pendingOfflineCount: number;
  isSyncing: boolean;
  triggerManualSync: () => Promise<void>;
  
  resetToDemoData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  isFirestoreLive: boolean;
  isNodeBackendLive: boolean;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const LISTINGS_STORAGE_KEY = 'produce_marketplace_listings_v3_firestore';
const USERS_STORAGE_KEY = 'produce_marketplace_users_v3_firestore';
const CURRENT_USER_KEY = 'produce_marketplace_current_user_v3_firestore';
const ACTIVE_USER_ID_KEY = 'produce_marketplace_active_user_id_v4';
const SAVED_KEY = 'produce_marketplace_saved_v3_firestore';
const CURRENCY_KEY = 'produce_marketplace_currency_v3_firestore';
const OFFLINE_QUEUE_KEY = 'produce_marketplace_offline_queue_v1';
const ORDERS_STORAGE_KEY = 'produce_marketplace_orders_v1';
const ACTIVE_TAB_KEY = 'produce_marketplace_active_tab_v1';

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem(LISTINGS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
    } catch {
      return INITIAL_LISTINGS;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [currency, setCurrency] = useState<string>(() => {
    try {
      return localStorage.getItem(CURRENCY_KEY) || '₦';
    } catch {
      return '₦';
    }
  });

  const [savedListingIds, setSavedListingIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Network & Sync State
  const [isSystemOnline, setIsSystemOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Computed effective online status
  const isOnline = isSystemOnline && !isSimulatedOffline;

  const [activeTab, setActiveTab] = useState<'marketplace' | 'create' | 'my-listings' | 'buyer-dashboard' | 'how-it-works'>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_TAB_KEY);
      if (saved && ['marketplace', 'create', 'my-listings', 'buyer-dashboard', 'how-it-works'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'marketplace';
  });
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFirestoreLive, setIsFirestoreLive] = useState(false);
  const [isNodeBackendLive, setIsNodeBackendLive] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      const isLive = await checkApiHealth();
      setIsNodeBackendLive(isLive);
      if (isLive) {
        console.log('🚀 Dedicated Node.js Express Backend is live!');
        const [apiListings, apiUsers, apiOrders] = await Promise.all([
          fetchListingsFromApi(),
          fetchUsersFromApi(),
          fetchOrdersFromApi(),
        ]);
        if (apiListings !== null) {
          setListings(apiListings);
        }
        if (apiUsers && apiUsers.length > 0) {
          setUsers(apiUsers);
          const activeId = localStorage.getItem(ACTIVE_USER_ID_KEY) || currentUser?.id;
          if (activeId) {
            const matchedServerUser = apiUsers.find(u => u.id === activeId);
            if (matchedServerUser) {
              setCurrentUser(matchedServerUser);
              try {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(matchedServerUser));
              } catch {}
            }
          }
        }
        if (apiOrders && apiOrders.length > 0) {
          setOrders(apiOrders);
        }
      }
    };
    checkBackend();
  }, []);

  // Auth & Profile modal management
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'farmer' | 'buyer' | 'switch'>('switch');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openAuthModal = (tab: 'farmer' | 'buyer' | 'switch' = 'switch') => {
    setAuthModalInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const openUpgradeModal = () => {
    setIsUpgradeModalOpen(true);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: '',
    location: '',
    sortBy: 'newest',
    farmingMethod: '',
    deliveryOnly: false,
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Save offline queue whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
    } catch (e) {
      console.error(e);
    }
  }, [offlineQueue]);

  // Sync Engine: executes pending offline operations in sequence
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0 || !isOnline) return;

    setIsSyncing(true);
    const queueCopy = [...offlineQueue];
    let syncedCount = 0;

    try {
      for (const item of queueCopy) {
        if (item.type === 'create_listing' && item.listing) {
          await saveListingToFirestore({
            ...item.listing,
            syncStatus: 'synced',
          });
          syncedCount++;
        } else if (item.type === 'update_listing' && item.listingId && item.updates) {
          await updateListingInFirestore(item.listingId, item.updates);
          syncedCount++;
        } else if (item.type === 'delete_listing' && item.listingId) {
          await deleteListingFromFirestore(item.listingId);
          syncedCount++;
        }
      }

      // Mark local listings as synced
      setListings(prev =>
        prev.map(l => (l.syncStatus === 'pending_sync' ? { ...l, syncStatus: 'synced' } : l))
      );

      // Clear the queue
      setOfflineQueue([]);
      localStorage.removeItem(OFFLINE_QUEUE_KEY);

      if (syncedCount > 0) {
        showToast(`⚡ Network connected: ${syncedCount} offline produce item${syncedCount > 1 ? 's' : ''} auto-synced to Firestore!`);
      }
    } catch (error) {
      console.warn('Error processing offline sync queue:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [offlineQueue, isOnline, showToast]);

  // Network online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsSystemOnline(true);
      showToast('📶 Internet connection restored. Triggering automatic cloud sync...');
    };

    const handleOffline = () => {
      setIsSystemOnline(false);
      showToast('📡 Device is offline or in low-network area. Offline outbox mode activated.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Trigger automatic sync whenever connection returns or queue grows while online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0 && !isSyncing) {
      processOfflineQueue();
    }
  }, [isOnline, offlineQueue.length, isSyncing, processOfflineQueue]);

  // Initialize and Seed Firestore on start
  useEffect(() => {
    const initDb = async () => {
      try {
        const db = initFirebase();
        if (db) {
          setIsFirestoreLive(true);
          await seedFirestoreDatabase(INITIAL_LISTINGS, INITIAL_USERS);
        }
      } catch (err) {
        console.warn('Firestore initialization notice:', err);
      }
    };

    initDb();

    // Subscribe to real-time updates from Firestore
    const unsubListings = subscribeToListings((liveListings) => {
      if (liveListings && liveListings.length > 0) {
        setListings(prev => {
          // Keep locally pending offline items in state so they aren't wiped before sync
          const pendingLocals = prev.filter(l => l.syncStatus === 'pending_sync');
          const liveIds = new Set(liveListings.map(l => l.id));
          const unsyncedNotYetInCloud = pendingLocals.filter(p => !liveIds.has(p.id));
          return [...unsyncedNotYetInCloud, ...liveListings];
        });
        setIsFirestoreLive(true);
      }
    });

    const unsubUsers = subscribeToUsers((liveUsers) => {
      if (liveUsers && liveUsers.length > 0) {
        setUsers(liveUsers);
      }
    });

    return () => {
      if (unsubListings) unsubListings();
      if (unsubUsers) unsubUsers();
    };
  }, []);

  // Save to LocalStorage as secondary local cache
  useEffect(() => {
    try {
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(listings));
    } catch (e) {
      console.error(e);
    }
  }, [listings]);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      if (currentUser?.id) {
        localStorage.setItem(ACTIVE_USER_ID_KEY, currentUser.id);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(savedListingIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedListingIds]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_TAB_KEY, activeTab);
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);

  // Action: Place Direct Order
  const placeOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'> & { status?: OrderStatus }): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: orderData.status || 'pending',
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);

    if (isOnline) {
      createOrderApi(newOrder);
    }
    showToast(`🛒 Order placed for "${newOrder.listingTitle}"! Track progress in your Buyer Dashboard.`);
    return newOrder;
  };

  // Action: Update Order Status
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    if (isOnline) {
      updateOrderStatusApi(orderId, newStatus);
    }
    showToast(`Order status updated to "${newStatus.replace('_', ' ').toUpperCase()}"`);
  };

  // Action: Save Farmer Bank Payout Account
  const updateBankDetails = async (data: { bankName: string; accountNumber: string; accountName: string }) => {
    const updatedDetails = {
      bankName: data.bankName.trim(),
      accountNumber: data.accountNumber.trim(),
      accountName: data.accountName.trim(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentUser(prev => ({ ...prev, bankDetails: updatedDetails }));
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, bankDetails: updatedDetails } : u));

    if (isOnline) {
      await updateBankDetailsApi(currentUser.id, data.bankName, data.accountNumber, data.accountName);
    }
    showToast('🏦 Bank payout details saved successfully!');
  };

  // Action: Explicit Manual Farmer Cashout Request (Pending Company Approval)
  const requestWithdrawal = async (amount: number) => {
    const currentAvail = currentUser.walletBalance || 0;
    if (amount > currentAvail) {
      showToast(`Insufficient available balance. Available: ₦${currentAvail.toLocaleString()}`);
      return;
    }

    const newBalance = currentAvail - amount;
    const newWithdrawal = {
      id: `wth-${Date.now()}`,
      userId: currentUser.id,
      farmerName: currentUser.name,
      farmerPhone: currentUser.phone,
      amount,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      bankDetails: currentUser.bankDetails!,
      reference: `agry_wth_${Date.now()}`,
    };

    const updatedUser = {
      ...currentUser,
      walletBalance: newBalance,
      withdrawals: [newWithdrawal, ...(currentUser.withdrawals || [])],
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    if (isOnline) {
      await requestWithdrawalApi(currentUser.id, amount);
    }
    showToast(`💸 Cashout request of ₦${amount.toLocaleString()} submitted to AgroDirect Company Admin for payout review!`);
  };

  // Action: Company Admin Approves Payout
  const approveWithdrawal = async (withdrawalId: string) => {
    if (isOnline) {
      await approveWithdrawalApi(withdrawalId);
    }
    
    // Update state locally
    setUsers(prev => prev.map(u => {
      if (u.withdrawals && u.withdrawals.some(w => w.id === withdrawalId)) {
        return {
          ...u,
          withdrawals: u.withdrawals.map(w => w.id === withdrawalId ? { ...w, status: 'completed', completedAt: new Date().toISOString() } : w)
        };
      }
      return u;
    }));

    showToast('✅ Payout request approved and processed to farmer bank account!');
  };

  // Action: Company Admin Rejects Payout (Refunds farmer's wallet)
  const rejectWithdrawal = async (withdrawalId: string, reason: string) => {
    if (isOnline) {
      await rejectWithdrawalApi(withdrawalId, reason);
    }

    setUsers(prev => prev.map(u => {
      const targetWth = u.withdrawals?.find(w => w.id === withdrawalId);
      if (targetWth) {
        return {
          ...u,
          walletBalance: (u.walletBalance || 0) + targetWth.amount, // Refund
          withdrawals: u.withdrawals!.map(w => w.id === withdrawalId ? { ...w, status: 'rejected', rejectionReason: reason } : w)
        };
      }
      return u;
    }));

    showToast(`❌ Payout request declined with reason: "${reason}". Funds refunded to farmer.`);
  };

  // Action: Renew or Upgrade Storage Space Subscription
  const renewSubscription = async (storageTierGB: number, billingCycle: 'monthly' | 'annual', paymentMethod: 'paystack' | 'wallet') => {
    const monthlyFee = storageTierGB * 500;
    const annualFee = storageTierGB * 6000;
    const amountDue = billingCycle === 'annual' ? annualFee : monthlyFee;

    if (paymentMethod === 'wallet') {
      const currentAvail = currentUser.walletBalance || 0;
      if (currentAvail < amountDue) {
        showToast(`Insufficient wallet balance. Required: ₦${amountDue.toLocaleString()}`);
        return;
      }
    }

    const newSub = {
      storageTierGB,
      storageUsedMB: currentUser.subscription?.storageUsedMB || 120,
      monthlyFee,
      annualFee,
      billingCycle,
      status: 'active' as const,
      nextBillingDate: new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 3600 * 1000).toISOString(),
      autoDeductFromWallet: true,
    };

    const updatedUser = {
      ...currentUser,
      walletBalance: paymentMethod === 'wallet' ? (currentUser.walletBalance || 0) - amountDue : currentUser.walletBalance,
      subscription: newSub,
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    if (isOnline) {
      await renewSubscriptionApi(currentUser.id, storageTierGB, billingCycle, paymentMethod);
    }
    showToast(`📦 Storage space renewed: ${storageTierGB} GB (${billingCycle})!`);
  };

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_KEY, currency);
    } catch (e) {
      console.error(e);
    }
  }, [currency]);

  // Action: Add Listing (Online or Offline)
  const addListing = (listingData: Omit<Listing, 'id' | 'createdAt' | 'status'>): Listing => {
    const isCurrentlyOnline = isOnline;
    const newListing: Listing = {
      ...listingData,
      id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      syncStatus: isCurrentlyOnline ? 'synced' : 'pending_sync',
    };

    setListings(prev => [newListing, ...prev]);

    if (isCurrentlyOnline) {
      saveListingToFirestore(newListing);
      createListingApi(newListing);
      showToast(`🌾 "${newListing.title}" published & synced to cloud & Node.js backend!`);
    } else {
      // Add to offline queue
      setOfflineQueue(prev => [
        ...prev,
        { type: 'create_listing', listing: newListing, timestamp: Date.now() },
      ]);
      showToast(`📡 "${newListing.title}" saved offline to device! Will auto-sync when network connects.`);
    }

    return newListing;
  };

  const deleteListing = (id: string) => {
    setListings(prev => prev.filter(item => item.id !== id));

    if (isOnline) {
      deleteListingFromFirestore(id);
      deleteListingApi(id);
      showToast('Listing removed from marketplace');
    } else {
      setOfflineQueue(prev => [
        ...prev,
        { type: 'delete_listing', listingId: id, timestamp: Date.now() },
      ]);
      showToast('Listing deleted locally. Removal will sync when network connects.');
    }

    if (selectedListing?.id === id) {
      setSelectedListing(null);
    }
  };

  const toggleListingStatus = (id: string) => {
    const targetItem = listings.find(l => l.id === id);
    if (!targetItem) return;

    const newStatus: 'active' | 'sold' = targetItem.status === 'active' ? 'sold' : 'active';

    setListings(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );

    if (isOnline) {
      updateListingInFirestore(id, { status: newStatus });
      updateListingApi(id, { status: newStatus });
      showToast(`Listing marked as ${newStatus === 'sold' ? 'Sold Out' : 'Active'}`);
    } else {
      setOfflineQueue(prev => [
        ...prev,
        { type: 'update_listing', listingId: id, updates: { status: newStatus }, timestamp: Date.now() },
      ]);
      showToast(`Status updated locally (${newStatus}). Will sync online.`);
    }
  };

  const updateListing = (id: string, updates: Partial<Listing>) => {
    setListings(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );

    if (isOnline) {
      updateListingInFirestore(id, updates);
      updateListingApi(id, updates);
      showToast('Listing updated successfully');
    } else {
      setOfflineQueue(prev => [
        ...prev,
        { type: 'update_listing', listingId: id, updates, timestamp: Date.now() },
      ]);
      showToast('Listing updated locally. Will auto-sync to Firestore when online.');
    }
  };

  const toggleBookmark = (id: string) => {
    setSavedListingIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    if (isOnline) {
      saveUserToFirestore(user);
    }
    showToast(`Active profile: ${user.name} (${user.role.toUpperCase()})`);
  };

  // General Register User
  const registerUser = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      verified: true,
      rating: 5.0,
      totalSales: 0,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    if (isOnline) {
      saveUserToFirestore(newUser);
    }
    showToast(`Welcome ${newUser.name}! Profile created and stored in Firestore.`);
    return newUser;
  };

  // Farmer Specific Lightweight Registration
  const registerFarmer = (data: { 
    name: string; 
    phone: string; 
    email?: string; 
    password?: string; 
    farmName?: string; 
    location?: string; 
    primaryCrops?: string[]; 
  }): User => {
    const newFarmer: User = {
      id: `farmer-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      password: data.password || undefined,
      role: 'farmer',
      farmName: data.farmName?.trim() || `${data.name.trim()}'s Farm Gate`,
      location: data.location?.trim() || 'Ibadan / Oyo Agricultural Corridor',
      primaryCrops: data.primaryCrops && data.primaryCrops.length > 0 ? data.primaryCrops : ['Vegetables', 'Tubers'],
      verified: true,
      rating: 5.0,
      totalSales: 0,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [newFarmer, ...prev]);
    setCurrentUser(newFarmer);
    if (isOnline) {
      saveUserToFirestore(newFarmer);
      registerFarmerApi({
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
        farmName: data.farmName,
        location: data.location,
        primaryCrops: data.primaryCrops,
      });
    }
    showToast(`🌾 Farmer profile created for ${newFarmer.name}! Direct farm gate sales active.`);
    return newFarmer;
  };

  // Buyer Specific Lightweight Registration
  const registerBuyer = (data: { 
    name: string; 
    phone: string; 
    email?: string; 
    password?: string; 
    buyerType?: User['buyerType']; 
    location?: string; 
    companyName?: string; 
  }): User => {
    const newBuyer: User = {
      id: `buyer-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      password: data.password || undefined,
      role: 'buyer',
      buyerType: data.buyerType || 'Wholesale Merchant',
      farmName: data.companyName?.trim() || undefined,
      location: data.location?.trim() || 'Mile 12 Commercial Depot, Lagos',
      verified: true,
      rating: 5.0,
      totalSales: 0,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [newBuyer, ...prev]);
    setCurrentUser(newBuyer);
    if (isOnline) {
      saveUserToFirestore(newBuyer);
      registerBuyerApi({
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
        buyerType: data.buyerType,
        location: data.location,
        companyName: data.companyName,
      });
    }
    showToast(`🛒 Buyer account created for ${newBuyer.name}! Start ordering directly from farmers.`);
    return newBuyer;
  };

  // Phone / Email / Credential Based Fast Login with Backend Fallback
  const loginWithCredentials = async (credentialInput: string, passwordInput?: string): Promise<{ success: boolean; user?: User; message: string }> => {
    const cleanCred = credentialInput.trim();
    if (!cleanCred) {
      return { success: false, message: 'Please enter your phone number or email address' };
    }

    const cleanPhone = cleanCred.replace(/\s+/g, '');
    const normalized = cleanPhone.replace(/^(\+234|0)/, '');
    const lowerEmail = cleanCred.toLowerCase();

    // 1. Check local in-memory users state first
    let matched = users.find(u => {
      const uNorm = u.phone.replace(/\s+/g, '').replace(/^(\+234|0)/, '');
      const matchesPhone = uNorm === normalized || u.phone === cleanPhone;
      const matchesEmail = u.email && u.email.toLowerCase() === lowerEmail;
      return matchesPhone || matchesEmail;
    });

    // 2. If not found locally, query Express backend API
    if (!matched && isOnline) {
      const apiResult = await loginByPhoneApi(cleanCred);
      if (apiResult.success && apiResult.user) {
        matched = apiResult.user;
        setUsers(prev => {
          const exists = prev.some(u => u.id === matched!.id);
          return exists ? prev : [matched!, ...prev];
        });
      } else {
        const allRemoteUsers = await fetchUsersFromApi();
        if (allRemoteUsers) {
          matched = allRemoteUsers.find(u => {
            const uNorm = u.phone.replace(/\s+/g, '').replace(/^(\+234|0)/, '');
            const matchesPhone = uNorm === normalized || u.phone === cleanPhone;
            const matchesEmail = u.email && u.email.toLowerCase() === lowerEmail;
            return matchesPhone || matchesEmail;
          });
          if (matched) {
            setUsers(allRemoteUsers);
          }
        }
      }
    }

    if (matched) {
      if (passwordInput && matched.password && matched.password !== passwordInput) {
        return { success: false, message: 'Incorrect password. Please try again.' };
      }
      setCurrentUser(matched);
      if (matched.role === 'farmer') {
        setActiveTab('my-listings');
      } else if (matched.role === 'buyer') {
        setActiveTab('buyer-dashboard');
      }
      showToast(`Welcome back, ${matched.name}! Signed in as ${matched.role.toUpperCase()}.`);
      return { success: true, user: matched, message: 'Login successful' };
    }

    return { 
      success: false, 
      message: `No account found for "${cleanCred}". Please register a new account.` 
    };
  };

  // Upgrade Buyer to Farmer Account
  const upgradeToFarmer = async (data: { farmName: string; location: string; primaryCrops: string[]; canDeliver?: boolean }): Promise<User> => {
    const updatedUser: User = {
      ...currentUser,
      role: 'farmer',
      farmName: data.farmName.trim(),
      location: data.location.trim(),
      primaryCrops: data.primaryCrops,
      verified: true,
      rating: currentUser.rating || 5.0,
      totalSales: currentUser.totalSales || 0,
      walletBalance: currentUser.walletBalance || 0,
      pendingBalance: currentUser.pendingBalance || 0,
      subscription: currentUser.subscription || {
        storageTierGB: 1,
        storageUsedMB: 120,
        monthlyFee: 500,
        annualFee: 6000,
        billingCycle: 'monthly',
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        autoDeductFromWallet: true,
      },
    };

    setCurrentUser(updatedUser);
    setUsers(prev => {
      const exists = prev.some(u => u.id === updatedUser.id);
      if (exists) {
        return prev.map(u => u.id === updatedUser.id ? updatedUser : u);
      }
      return [updatedUser, ...prev];
    });

    if (isOnline) {
      await saveUserToFirestore(updatedUser);
      await upgradeToFarmerApi(updatedUser.id, {
        farmName: data.farmName,
        location: data.location,
        primaryCrops: data.primaryCrops
      });
    }

    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      localStorage.setItem(ACTIVE_USER_ID_KEY, updatedUser.id);
    } catch (e) {
      console.error(e);
    }

    setActiveTab('my-listings');
    showToast(`🌾 Account upgraded! Welcome Farmer ${updatedUser.name}. You can now list your produce.`);
    return updatedUser;
  };

  // Action: General User Profile Update
  const updateUserProfile = async (updates: Partial<User>): Promise<User> => {
    const updatedUser: User = {
      ...currentUser,
      ...updates,
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    if (isOnline) {
      await saveUserToFirestore(updatedUser);
      await updateUserApi(updatedUser.id, updates);
    }

    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      localStorage.setItem(ACTIVE_USER_ID_KEY, updatedUser.id);
    } catch (e) {
      console.error(e);
    }

    showToast('👤 Profile information updated successfully!');
    return updatedUser;
  };

  // Logout / Clean Session
  const logout = () => {
    // Reset to a guest buyer profile
    const guestUser: User = {
      id: `buyer-guest-${Date.now()}`,
      name: 'Guest Buyer',
      phone: '+2348000000000',
      role: 'buyer',
      location: 'Mile 12 Market, Lagos',
      buyerType: 'Wholesale Merchant',
      verified: false,
    };
    setCurrentUser(guestUser);
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(ACTIVE_USER_ID_KEY);
    } catch (e) {
      console.error(e);
    }
    setActiveTab('marketplace');
    showToast('Signed out. You are now browsing as a Guest Buyer.');
  };

  // Phone / WhatsApp Based Fast Login
  const loginByPhone = async (phoneInput: string, preferredRole?: 'farmer' | 'buyer'): Promise<{ success: boolean; user?: User; message: string }> => {
    return await loginWithCredentials(phoneInput);
  };

  // Toggle Low Network / Offline Simulator
  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline(prev => {
      const next = !prev;
      if (next) {
        showToast('📡 Low Network / Offline simulation activated. Test farm listing in remote mode!');
      } else {
        showToast('📶 Online mode restored. Triggering automatic cloud sync...');
      }
      return next;
    });
  };

  // Manual Trigger Sync
  const triggerManualSync = async () => {
    if (!isOnline) {
      showToast('⚠️ Cannot sync while offline. Please connect to internet or turn off offline simulation.');
      return;
    }
    showToast('🔄 Syncing offline queue with Firestore...');
    await processOfflineQueue();
  };

  const resetToDemoData = () => {
    setListings(INITIAL_LISTINGS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCurrency('₦');
    setSavedListingIds([]);
    setOfflineQueue([]);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    setFilters({
      searchQuery: '',
      category: '',
      location: '',
      sortBy: 'newest',
      farmingMethod: '',
      deliveryOnly: false,
    });
    // Reseed Firestore
    seedFirestoreDatabase(INITIAL_LISTINGS, INITIAL_USERS);
    showToast('Re-seeded Firestore with fresh mock produce batches in Naira (₦)');
  };

  return (
    <MarketplaceContext.Provider
      value={{
        listings,
        users,
        orders,
        currentUser,
        currency,
        setCurrency,
        filters,
        setFilters,
        savedListingIds,
        activeTab,
        setActiveTab,
        selectedListing,
        setSelectedListing,
        addListing,
        deleteListing,
        toggleListingStatus,
        updateListing,
        toggleBookmark,
        placeOrder,
        updateOrderStatus,
        updateBankDetails,
        requestWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        renewSubscription,
        switchUser,
        registerUser,
        registerFarmer,
        registerBuyer,
        loginByPhone,
        loginWithCredentials,
        upgradeToFarmer,
        updateUserProfile,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalInitialTab,
        openAuthModal,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
        openUpgradeModal,
        isProfileModalOpen,
        setIsProfileModalOpen,
        openProfileModal,
        isOnline,
        isSimulatedOffline,
        toggleSimulatedOffline,
        pendingOfflineCount: offlineQueue.length,
        isSyncing,
        triggerManualSync,
        resetToDemoData,
        toastMessage,
        showToast,
        isFirestoreLive,
        isNodeBackendLive
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
