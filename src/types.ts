export type UserRole = 'farmer' | 'buyer' | 'admin';

export type ProduceCategory =
  | 'Vegetables'
  | 'Tubers & Roots'
  | 'Grains & Cereals'
  | 'Fruits'
  | 'Legumes & Pulses'
  | 'Herbs & Spices'
  | 'Other';

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode?: string;
  updatedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  farmerName?: string;
  farmerPhone?: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  completedAt?: string;
  reviewedAt?: string;
  bankDetails: BankDetails;
  reference: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'payout_approval' | 'payout_rejection' | 'order' | 'system';
  createdAt: string;
  read: boolean;
  meta?: Record<string, any>;
}

export interface StorageSubscription {
  storageTierGB: number;        // e.g. 1, 2, 5 GB
  storageUsedMB: number;        // e.g. 145 MB occupied
  monthlyFee: number;           // ₦500 per GB
  annualFee: number;            // ₦6,000 per GB
  billingCycle: 'monthly' | 'annual';
  status: 'active' | 'past_due' | 'cancelled';
  nextBillingDate: string;
  autoDeductFromWallet: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: UserRole;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  avatarUrl?: string;
  farmName?: string;
  primaryCrops?: string[];
  buyerType?: 'Wholesale Merchant' | 'Retail Supermarket' | 'Restaurant & Catering' | 'Individual Household' | 'Food Processor';
  verified?: boolean;
  rating?: number;
  totalSales?: number;
  createdAt?: string;

  // Farmer Bank & Wallet & Subscription properties
  bankDetails?: BankDetails;
  walletBalance?: number;        // Available cashout balance (₦)
  pendingBalance?: number;       // Pending 24-hour escrow balance (₦)
  withdrawals?: WithdrawalRequest[];
  subscription?: StorageSubscription;
  notifications?: Notification[];
}

export interface Listing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  farmerAvatar?: string;
  farmerRating?: number;
  farmName?: string;
  title: string;
  category: ProduceCategory;
  price: number;                 // Farmer base price (₦)
  unit: string;                  // e.g., 'kg', '50kg bag', 'crate', 'ton', 'basket'
  quantity: string;              // e.g., '40 bags', '500 kg', '20 crates'
  availableUnitsCount?: number;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  imageUrl: string;
  harvestDate?: string;
  farmingMethod?: 'Organic' | 'Conventional' | 'Greenhouse' | 'Hydroponic';
  deliveryAvailable?: boolean;
  minOrder?: string;
  status: 'active' | 'sold' | 'reserved';
  createdAt: string;
  syncStatus?: 'synced' | 'pending_sync';
}

export interface FilterState {
  searchQuery: string;
  category: string;
  location: string;
  sortBy: 'newest' | 'price_low' | 'price_high' | 'popular';
  maxPrice?: number;
  farmingMethod?: string;
  deliveryOnly?: boolean;
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImageUrl: string;
  listingCategory: ProduceCategory;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerLocation: string;
  quantityOrdered: string;
  unitPrice: number;             // Farmer base price per unit
  platformFee: number;           // 5% platform service fee per unit
  finalPrice: number;            // Unit price + 5% platform fee
  totalAmount: number;           // Total paid by buyer (finalPrice * qty)
  farmerPayoutAmount: number;    // Total received by farmer (unitPrice * qty)
  paymentStatus: 'unpaid' | 'paid_escrow' | 'released_to_farmer';
  paymentMethod?: 'paystack_card' | 'paystack_bank_transfer' | 'paystack_ussd' | 'company_bank_transfer';
  paymentReference?: string;
  paidAt?: string;
  availableForCashoutAt?: string; // 24 hours after payment
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}
