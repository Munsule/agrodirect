import { Router, Request, Response } from 'express';
import { db } from '../db';
import { BankDetails } from '../../src/types';

const router = Router();

// GET /api/wallet/:userId - Get wallet & subscription status for user
router.get('/:userId', (req: Request, res: Response) => {
  try {
    const user = db.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        userId: user.id,
        walletBalance: user.walletBalance || 0,
        pendingBalance: user.pendingBalance || 0,
        bankDetails: user.bankDetails || null,
        subscription: user.subscription || {
          storageTierGB: 1,
          storageUsedMB: 120,
          monthlyFee: 500,
          annualFee: 6000,
          billingCycle: 'monthly',
          status: 'active',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          autoDeductFromWallet: true,
        },
        withdrawals: user.withdrawals || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallet info', error: String(error) });
  }
});

// POST /api/wallet/bank-details - Save/Update Farmer Payout Bank Details
router.post('/bank-details', (req: Request, res: Response) => {
  try {
    const { userId, bankName, accountNumber, accountName } = req.body;
    if (!userId || !bankName || !accountNumber || !accountName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, bankName, accountNumber, accountName',
      });
    }

    const bankDetails: BankDetails = {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      updatedAt: new Date().toISOString(),
    };

    const updatedUser = db.updateUser(userId, { bankDetails });
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Bank payout account updated successfully!',
      data: updatedUser.bankDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update bank details', error: String(error) });
  }
});

// POST /api/wallet/withdraw - Explicit manual cashout request by farmer
router.post('/withdraw', (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;
    const withdrawAmount = parseFloat(amount);

    if (!userId || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
    }

    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.bankDetails || !user.bankDetails.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please setup your Bank Payout Account before requesting a cashout.',
      });
    }

    const available = user.walletBalance || 0;
    if (withdrawAmount > available) {
      return res.status(400).json({
        success: false,
        message: `Insufficient available balance. You have ₦${available.toLocaleString()} available.`,
      });
    }

    // Process explicit manual withdrawal
    const withdrawal = db.createWithdrawal(userId, withdrawAmount, user.bankDetails);
    res.status(200).json({
      success: true,
      message: `Cashout request of ₦${withdrawAmount.toLocaleString()} submitted to ${user.bankDetails.bankName} (${user.bankDetails.accountNumber})!`,
      data: withdrawal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process cashout', error: String(error) });
  }
});

// POST /api/wallet/subscription - Renew or Upgrade Farmer Storage Space (₦500/GB monthly)
router.post('/subscription', (req: Request, res: Response) => {
  try {
    const { userId, storageTierGB, billingCycle, paymentMethod } = req.body;
    const tier = parseInt(storageTierGB) || 1;
    const cycle: 'monthly' | 'annual' = billingCycle === 'annual' ? 'annual' : 'monthly';
    const monthlyFee = tier * 500;
    const annualFee = tier * 6000;
    const amountDue = cycle === 'annual' ? annualFee : monthlyFee;

    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If payment method is wallet deduction
    if (paymentMethod === 'wallet') {
      const currentAvail = user.walletBalance || 0;
      if (currentAvail < amountDue) {
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance (₦${currentAvail.toLocaleString()}). Required: ₦${amountDue.toLocaleString()}`,
        });
      }
      db.updateUser(userId, { walletBalance: currentAvail - amountDue });
    }

    const newSub = {
      storageTierGB: tier,
      storageUsedMB: (user.subscription?.storageUsedMB || 120),
      monthlyFee,
      annualFee,
      billingCycle: cycle,
      status: 'active' as const,
      nextBillingDate: new Date(Date.now() + (cycle === 'annual' ? 365 : 30) * 24 * 3600 * 1000).toISOString(),
      autoDeductFromWallet: true,
    };

    const updated = db.updateUser(userId, { subscription: newSub });

    res.json({
      success: true,
      message: `Successfully renewed ${tier} GB market storage space (${cycle})!`,
      data: updated?.subscription,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update storage subscription', error: String(error) });
  }
});
// GET /api/wallet/admin/pending-withdrawals - List all pending farmer payout requests for Company Admin
router.get('/admin/pending-withdrawals', (_req: Request, res: Response) => {
  try {
    const pending = db.getPendingWithdrawals();
    res.json({
      success: true,
      data: pending,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending withdrawals', error: String(error) });
  }
});

// POST /api/wallet/approve-withdrawal - Company Admin Approves Farmer Cashout
router.post('/approve-withdrawal', (req: Request, res: Response) => {
  try {
    const { withdrawalId } = req.body;
    if (!withdrawalId) {
      return res.status(400).json({ success: false, message: 'Missing withdrawalId' });
    }

    const approved = db.approveWithdrawal(withdrawalId);
    if (!approved) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }

    res.json({
      success: true,
      message: `Payout request ${withdrawalId} approved and marked completed!`,
      data: approved,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve withdrawal', error: String(error) });
  }
});

// POST /api/wallet/reject-withdrawal - Company Admin Rejects Farmer Cashout with Reason
router.post('/reject-withdrawal', (req: Request, res: Response) => {
  try {
    const { withdrawalId, reason } = req.body;
    if (!withdrawalId || !reason) {
      return res.status(400).json({ success: false, message: 'Missing withdrawalId or reason' });
    }

    const rejected = db.rejectWithdrawal(withdrawalId, reason.trim());
    if (!rejected) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }

    res.json({
      success: true,
      message: `Payout request ${withdrawalId} declined with reason: "${reason}". Funds refunded to farmer.`,
      data: rejected,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject withdrawal', error: String(error) });
  }
});

export default router;
