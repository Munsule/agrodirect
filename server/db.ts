import fs from 'fs';
import path from 'path';
import { Listing, User, Order, OrderStatus, BankDetails, WithdrawalRequest } from '../src/types';
import { INITIAL_LISTINGS, INITIAL_USERS } from '../src/data/mockData';

const DB_DIR = path.resolve(process.cwd(), 'server/data');
const DB_FILE = path.join(DB_DIR, 'db.json');

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    listingId: 'list-1',
    listingTitle: 'Fresh Vine-Ripened Roma Tomatoes (Jos Hybrid)',
    listingImageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    listingCategory: 'Vegetables',
    farmerId: 'farmer-1',
    farmerName: 'Amara Okafor',
    farmerPhone: '+2348031234567',
    farmerLocation: 'Ibadan, Oyo State',
    buyerId: 'buyer-1',
    buyerName: 'Babajide Adeleke',
    buyerPhone: '+2348054433221',
    buyerLocation: 'Mile 12 Produce Market, Lagos',
    quantityOrdered: '10 crates',
    unitPrice: 25000,
    platformFee: 1250,
    finalPrice: 26250,
    totalAmount: 262500,
    farmerPayoutAmount: 250000,
    paymentStatus: 'paid_escrow',
    paymentMethod: 'paystack_card',
    paymentReference: 'pstk_ref_1019281',
    paidAt: new Date(Date.now() - 3600000 * 25).toISOString(),
    availableForCashoutAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'in_transit',
    createdAt: new Date(Date.now() - 3600000 * 25).toISOString(),
    notes: 'Please ensure crates are well-ventilated for transport to Lagos.',
  },
  {
    id: 'ord-102',
    listingId: 'list-2',
    listingTitle: 'Giant Benue White Yam Tubers (Pona Variety)',
    listingImageUrl: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=600&auto=format&fit=crop&q=80',
    listingCategory: 'Tubers & Roots',
    farmerId: 'farmer-3',
    farmerName: 'Terna Akor',
    farmerPhone: '+2348135557890',
    farmerLocation: 'Gboko, Benue State',
    buyerId: 'buyer-1',
    buyerName: 'Babajide Adeleke',
    buyerPhone: '+2348054433221',
    buyerLocation: 'Mile 12 Produce Market, Lagos',
    quantityOrdered: '100 tubers',
    unitPrice: 45000,
    platformFee: 2250,
    finalPrice: 47250,
    totalAmount: 472500,
    farmerPayoutAmount: 450000,
    paymentStatus: 'paid_escrow',
    paymentMethod: 'paystack_bank_transfer',
    paymentReference: 'pstk_ref_882190',
    paidAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    availableForCashoutAt: new Date(Date.now() + 3600000 * 12).toISOString(),
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    notes: 'Scheduled for logistics truck dispatch tomorrow morning.',
  },
];

export interface DatabaseSchema {
  listings: Listing[];
  users: User[];
  orders: Order[];
  withdrawals: WithdrawalRequest[];
  meta: {
    version: string;
    lastUpdated: string;
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
    this.processEscrowPayouts();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.listings) && Array.isArray(parsed.users)) {
          return {
            listings: parsed.listings,
            users: parsed.users,
            orders: Array.isArray(parsed.orders) ? parsed.orders : INITIAL_ORDERS,
            withdrawals: Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [],
            meta: parsed.meta || { version: '1.0.0', lastUpdated: new Date().toISOString() },
          };
        }
      }
    } catch (err) {
      console.warn('Error reading db.json, initializing default database:', err);
    }

    // Default database
    const initialData: DatabaseSchema = {
      listings: INITIAL_LISTINGS,
      users: INITIAL_USERS,
      orders: INITIAL_ORDERS,
      withdrawals: [],
      meta: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
      },
    };
    this.saveData(initialData);
    return initialData;
  }

  private saveData(newData?: DatabaseSchema) {
    if (newData) {
      this.data = newData;
    }
    this.data.meta.lastUpdated = new Date().toISOString();
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json to disk:', err);
    }
  }

  // 24-Hour Escrow Maturation Engine
  public processEscrowPayouts() {
    const now = Date.now();
    let updated = false;

    if (this.data.orders) {
      for (const order of this.data.orders) {
        if (order.paymentStatus === 'paid_escrow' && order.availableForCashoutAt) {
          const maturesAt = Date.parse(order.availableForCashoutAt);
          if (now >= maturesAt) {
            // Shift payout from farmer's pending balance to available wallet balance
            const farmer = this.getUserById(order.farmerId);
            if (farmer) {
              const payout = order.farmerPayoutAmount || (order.unitPrice * (parseInt(order.quantityOrdered) || 1));
              const currentPending = farmer.pendingBalance || 0;
              const currentWallet = farmer.walletBalance || 0;

              farmer.pendingBalance = Math.max(0, currentPending - payout);
              farmer.walletBalance = currentWallet + payout;
              order.paymentStatus = 'released_to_farmer';
              updated = true;
            }
          }
        }
      }
    }

    if (updated) {
      this.saveData();
    }
  }

  // Listing Operations
  public getListings(): Listing[] {
    return this.data.listings;
  }

  public getListingById(id: string): Listing | undefined {
    return this.data.listings.find((l) => l.id === id);
  }

  public createListing(listingData: Omit<Listing, 'id' | 'createdAt' | 'status'> & { id?: string; status?: Listing['status'] }): Listing {
    const newListing: Listing = {
      ...listingData,
      id: listingData.id || `list-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: listingData.status || 'active',
      createdAt: new Date().toISOString(),
      syncStatus: 'synced',
    };
    this.data.listings.unshift(newListing);
    this.saveData();
    return newListing;
  }

  public updateListing(id: string, updates: Partial<Listing>): Listing | null {
    const index = this.data.listings.findIndex((l) => l.id === id);
    if (index === -1) return null;

    this.data.listings[index] = {
      ...this.data.listings[index],
      ...updates,
      syncStatus: 'synced',
    };
    this.saveData();
    return this.data.listings[index];
  }

  public deleteListing(id: string): boolean {
    const initialLength = this.data.listings.length;
    this.data.listings = this.data.listings.filter((l) => l.id !== id);
    if (this.data.listings.length !== initialLength) {
      this.saveData();
      return true;
    }
    return false;
  }

  // User Operations
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByPhoneOrEmail(input: string): User | undefined {
    const clean = input.trim().toLowerCase();
    const cleanPhone = clean.replace(/\s+/g, '').replace(/^(\+234|0)/, '');
    return this.data.users.find((u) => {
      const uNorm = u.phone.replace(/\s+/g, '').replace(/^(\+234|0)/, '');
      const phoneMatches = uNorm === cleanPhone || u.phone.trim().toLowerCase() === clean;
      const emailMatches = Boolean(u.email && u.email.trim().toLowerCase() === clean);
      return phoneMatches || emailMatches;
    });
  }

  public getUserByPhone(phone: string): User | undefined {
    return this.getUserByPhoneOrEmail(phone);
  }

  public seedDatabase(force = false): DatabaseSchema {
    if (force) {
      this.data.listings = [];
      this.data.users = [...INITIAL_USERS];
      this.data.orders = [...INITIAL_ORDERS];
      this.saveData();
    }
    return this.data;
  }

  public createUser(userData: Omit<User, 'id'> & { id?: string }): User {
    const newUser: User = {
      ...userData,
      id: userData.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      walletBalance: userData.walletBalance || 0,
      pendingBalance: userData.pendingBalance || 0,
      subscription: userData.subscription || {
        storageTierGB: 1,
        storageUsedMB: 120,
        monthlyFee: 500,
        annualFee: 6000,
        billingCycle: 'monthly',
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        autoDeductFromWallet: true,
      },
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
    };
    this.saveData();
    return this.data.users[index];
  }

  // Order Operations with 5% Fee & Escrow Credit
  public getOrders(): Order[] {
    this.processEscrowPayouts();
    return this.data.orders || [];
  }

  public getOrderById(id: string): Order | undefined {
    return (this.data.orders || []).find((o) => o.id === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'createdAt'> & { id?: string }): Order {
    const qty = parseInt(orderData.quantityOrdered) || 1;
    const basePrice = orderData.unitPrice;
    const platformFee = Math.round(basePrice * 0.05); // 5% markup
    const finalPrice = basePrice + platformFee;
    const farmerPayoutAmount = basePrice * qty;
    const totalAmount = finalPrice * qty;

    const createdAt = new Date().toISOString();
    const availableForCashoutAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // 24 hours later

    const newOrder: Order = {
      ...orderData,
      id: orderData.id || `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      unitPrice: basePrice,
      platformFee,
      finalPrice,
      totalAmount,
      farmerPayoutAmount,
      paymentStatus: orderData.paymentStatus || 'paid_escrow',
      paidAt: createdAt,
      availableForCashoutAt,
      createdAt,
    };

    if (!this.data.orders) this.data.orders = [];
    this.data.orders.unshift(newOrder);

    // Credit farmer's pending balance
    const farmer = this.getUserById(orderData.farmerId);
    if (farmer) {
      farmer.pendingBalance = (farmer.pendingBalance || 0) + farmerPayoutAmount;
    }

    this.saveData();
    return newOrder;
  }

  public updateOrderStatus(id: string, status: OrderStatus): Order | null {
    if (!this.data.orders) return null;
    const index = this.data.orders.findIndex((o) => o.id === id);
    if (index === -1) return null;

    this.data.orders[index].status = status;

    // If delivered, accelerate escrow maturation to available wallet balance immediately!
    if (status === 'delivered' && this.data.orders[index].paymentStatus === 'paid_escrow') {
      const order = this.data.orders[index];
      const farmer = this.getUserById(order.farmerId);
      if (farmer) {
        const payout = order.farmerPayoutAmount;
        farmer.pendingBalance = Math.max(0, (farmer.pendingBalance || 0) - payout);
        farmer.walletBalance = (farmer.walletBalance || 0) + payout;
        order.paymentStatus = 'released_to_farmer';
      }
    }

    this.saveData();
    return this.data.orders[index];
  }

  // Explicit Manual Withdrawal Cashout Request (Initial Status: Pending Company Approval)
  public createWithdrawal(userId: string, amount: number, bankDetails: BankDetails): WithdrawalRequest {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const currentWallet = user.walletBalance || 0;
    if (amount > currentWallet) throw new Error('Insufficient wallet balance');

    user.walletBalance = currentWallet - amount;

    const withdrawal: WithdrawalRequest = {
      id: `wth-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      farmerName: user.name,
      farmerPhone: user.phone,
      amount,
      status: 'pending', // Pending Company Admin approval
      createdAt: new Date().toISOString(),
      bankDetails,
      reference: `agry_wth_${Date.now()}`,
    };

    if (!user.withdrawals) user.withdrawals = [];
    user.withdrawals.unshift(withdrawal);

    if (!this.data.withdrawals) this.data.withdrawals = [];
    this.data.withdrawals.unshift(withdrawal);

    // Notify farmer of submission
    this.addNotification(userId, {
      title: 'Cashout Request Submitted',
      message: `Your cashout request of ₦${amount.toLocaleString()} was submitted to Company Admin for payout review.`,
      type: 'system',
    });

    this.saveData();
    return withdrawal;
  }

  // Company Admin Approval of Payout
  public approveWithdrawal(withdrawalId: string): WithdrawalRequest | null {
    if (!this.data.withdrawals) return null;
    const index = this.data.withdrawals.findIndex((w) => w.id === withdrawalId);
    if (index === -1) return null;

    const withdrawal = this.data.withdrawals[index];
    withdrawal.status = 'completed';
    withdrawal.completedAt = new Date().toISOString();
    withdrawal.reviewedAt = new Date().toISOString();

    // Update user's withdrawal array record
    const user = this.getUserById(withdrawal.userId);
    if (user && user.withdrawals) {
      const uIdx = user.withdrawals.findIndex((w) => w.id === withdrawalId);
      if (uIdx !== -1) {
        user.withdrawals[uIdx] = { ...withdrawal };
      }
      this.addNotification(user.id, {
        title: '💸 Payout Approved & Processed!',
        message: `Your withdrawal request of ₦${withdrawal.amount.toLocaleString()} was approved by AgroDirect Company Admin and processed to ${withdrawal.bankDetails.bankName} (${withdrawal.bankDetails.accountNumber}).`,
        type: 'payout_approval',
      });
    }

    this.saveData();
    return withdrawal;
  }

  // Company Admin Rejection of Payout (Refunds funds back to farmer)
  public rejectWithdrawal(withdrawalId: string, reason: string): WithdrawalRequest | null {
    if (!this.data.withdrawals) return null;
    const index = this.data.withdrawals.findIndex((w) => w.id === withdrawalId);
    if (index === -1) return null;

    const withdrawal = this.data.withdrawals[index];
    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = reason;
    withdrawal.reviewedAt = new Date().toISOString();

    // Refund funds back to farmer's Available Wallet Balance
    const user = this.getUserById(withdrawal.userId);
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + withdrawal.amount;
      if (user.withdrawals) {
        const uIdx = user.withdrawals.findIndex((w) => w.id === withdrawalId);
        if (uIdx !== -1) {
          user.withdrawals[uIdx] = { ...withdrawal };
        }
      }

      this.addNotification(user.id, {
        title: '⚠️ Payout Request Declined',
        message: `Your cashout request of ₦${withdrawal.amount.toLocaleString()} was declined. Reason: "${reason}". ₦${withdrawal.amount.toLocaleString()} has been refunded back to your Available Wallet Balance.`,
        type: 'payout_rejection',
      });
    }

    this.saveData();
    return withdrawal;
  }

  public getPendingWithdrawals(): WithdrawalRequest[] {
    return (this.data.withdrawals || []).filter((w) => w.status === 'pending');
  }

  public addNotification(userId: string, notif: { title: string; message: string; type: any }): void {
    const user = this.getUserById(userId);
    if (!user) return;

    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      createdAt: new Date().toISOString(),
      read: false,
    };

    if (!user.notifications) user.notifications = [];
    user.notifications.unshift(newNotif);
  }
}

export const db = new DatabaseManager();
