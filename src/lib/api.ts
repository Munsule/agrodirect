import { Listing, User, FilterState, Order, OrderStatus, BankDetails, WithdrawalRequest, StorageSubscription } from '../types';

const API_BASE_URL = '/api';

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

export async function fetchListingsFromApi(filters?: FilterState): Promise<Listing[] | null> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.farmingMethod) params.append('farmingMethod', filters.farmingMethod);
      if (filters.deliveryOnly) params.append('deliveryOnly', 'true');
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
    }

    const res = await fetch(`${API_BASE_URL}/listings?${params.toString()}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.warn('Node.js API fetch error:', error);
    return null;
  }
}

export async function createListingApi(listing: Omit<Listing, 'id' | 'createdAt' | 'status'> & { id?: string }): Promise<Listing | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.warn('Node.js API createListing error:', error);
    return null;
  }
}

export async function updateListingApi(id: string, updates: Partial<Listing>): Promise<Listing | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.warn('Node.js API updateListing error:', error);
    return null;
  }
}

export async function deleteListingApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json.success;
  } catch (error) {
    console.warn('Node.js API deleteListing error:', error);
    return false;
  }
}

export async function loginByPhoneApi(phone: string, preferredRole: 'farmer' | 'buyer' = 'buyer'): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, preferredRole }),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { success: false, message: 'Could not connect to Node.js backend server' };
  }
}

export async function registerFarmerApi(data: {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  farmName?: string;
  location?: string;
  primaryCrops?: string[];
}): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register-farmer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { success: false, message: 'Failed to connect to Node.js backend server' };
  }
}

export async function registerBuyerApi(data: {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  buyerType?: User['buyerType'];
  location?: string;
  companyName?: string;
}): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register-buyer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { success: false, message: 'Failed to connect to Node.js backend server' };
  }
}

export async function upgradeToFarmerApi(userId: string, data: { farmName: string; location: string; primaryCrops: string[] }): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/upgrade`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { success: false, message: 'Failed to connect to Node.js backend server' };
  }
}

export async function fetchUsersFromApi(): Promise<User[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/users`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.warn('Node.js API fetchUsers error:', error);
    return null;
  }
}

export async function updateUserApi(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { success: false, message: 'Failed to connect to Node.js backend server' };
  }
}

export async function fetchOrdersFromApi(params?: { farmerId?: string; buyerId?: string; status?: string }): Promise<Order[] | null> {
  try {
    const search = new URLSearchParams();
    if (params?.farmerId) search.append('farmerId', params.farmerId);
    if (params?.buyerId) search.append('buyerId', params.buyerId);
    if (params?.status) search.append('status', params.status);

    const res = await fetch(`${API_BASE_URL}/orders?${search.toString()}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.warn('Node.js API fetchOrders error:', error);
    return null;
  }
}

export async function createOrderApi(orderData: Omit<Order, 'id' | 'createdAt'> & { id?: string }): Promise<Order | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.warn('Node.js API createOrder error:', error);
    return null;
  }
}

export async function updateOrderStatusApi(orderId: string, status: OrderStatus): Promise<Order | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.warn('Node.js API updateOrderStatus error:', error);
    return null;
  }
}

export async function updateBankDetailsApi(userId: string, bankName: string, accountNumber: string, accountName: string): Promise<{ success: boolean; data?: BankDetails; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/bank-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, bankName, accountNumber, accountName }),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { success: false, message: 'Failed to connect to backend server' };
  }
}

export async function requestWithdrawalApi(userId: string, amount: number): Promise<{ success: boolean; data?: WithdrawalRequest; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { success: false, message: 'Failed to connect to backend server' };
  }
}

export async function renewSubscriptionApi(userId: string, storageTierGB: number, billingCycle: 'monthly' | 'annual', paymentMethod: 'paystack' | 'wallet'): Promise<{ success: boolean; data?: StorageSubscription; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, storageTierGB, billingCycle, paymentMethod }),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { success: false, message: 'Failed to connect to backend server' };
  }
}

export async function fetchWalletApi(userId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/${userId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.warn('Node.js API fetchWallet error:', error);
    return null;
  }
}

export async function approveWithdrawalApi(withdrawalId: string): Promise<{ success: boolean; message: string; data?: WithdrawalRequest }> {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/approve-withdrawal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId }),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { success: false, message: 'Failed to connect to backend server' };
  }
}

export async function rejectWithdrawalApi(withdrawalId: string, reason: string): Promise<{ success: boolean; message: string; data?: WithdrawalRequest }> {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/reject-withdrawal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId, reason }),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { success: false, message: 'Failed to connect to backend server' };
  }
}

export async function fetchPendingWithdrawalsApi(): Promise<WithdrawalRequest[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/admin/pending-withdrawals`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.warn('Node.js API fetchPendingWithdrawals error:', error);
    return [];
  }
}
