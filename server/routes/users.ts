import { Router, Request, Response } from 'express';
import { db } from '../db';
import { User } from '../../src/types';

const router = Router();

// GET /api/users - Fetch all users
router.get('/', (_req: Request, res: Response) => {
  try {
    const users = db.getUsers();
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: String(error) });
  }
});

// GET /api/users/:id - Fetch single user profile
router.get('/:id', (req: Request, res: Response) => {
  try {
    const user = db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user', error: String(error) });
  }
});

// POST /api/auth/login-phone - Authenticate or register by phone number
router.post('/login-phone', (req: Request, res: Response) => {
  try {
    const { phone, preferredRole = 'buyer' } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    let user = db.getUserByPhone(phone);
    if (user) {
      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        user,
      });
    }

    // Auto-create new user if phone not found
    const isFarmer = preferredRole === 'farmer';
    user = db.createUser({
      name: isFarmer ? `Farmer ${phone.slice(-4)}` : `Buyer ${phone.slice(-4)}`,
      phone,
      role: isFarmer ? 'farmer' : 'buyer',
      location: isFarmer ? 'Oyo State, Nigeria' : 'Lagos, Nigeria',
      farmName: isFarmer ? 'Greenfield Agro Farm' : undefined,
      verified: true,
      rating: isFarmer ? 5.0 : undefined,
      totalSales: isFarmer ? 0 : undefined,
    });

    res.status(201).json({
      success: true,
      message: `Account created successfully for ${phone}!`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication failed', error: String(error) });
  }
});

// POST /api/auth/register-farmer - Register a farmer profile
router.post('/register-farmer', (req: Request, res: Response) => {
  try {
    const { name, phone, email, password, farmName, location, primaryCrops } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone number are required' });
    }

    const existing = db.getUserByPhoneOrEmail(phone) || (email ? db.getUserByPhoneOrEmail(email) : undefined);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this phone number or email address already exists' });
    }

    const newFarmer = db.createUser({
      name,
      phone,
      email,
      password,
      role: 'farmer',
      farmName: farmName || `${name}'s Farm`,
      location: location || 'Nigeria',
      primaryCrops: primaryCrops || ['Vegetables'],
      verified: true,
      rating: 5.0,
      totalSales: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Farmer profile registered successfully!',
      user: newFarmer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: String(error) });
  }
});

// POST /api/auth/register-buyer - Register a wholesale buyer profile
router.post('/register-buyer', (req: Request, res: Response) => {
  try {
    const { name, phone, email, password, buyerType, location, companyName } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone number are required' });
    }

    const existing = db.getUserByPhoneOrEmail(phone) || (email ? db.getUserByPhoneOrEmail(email) : undefined);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this phone number or email address already exists' });
    }

    const newBuyer = db.createUser({
      name,
      phone,
      email,
      password,
      role: 'buyer',
      buyerType: buyerType || 'Wholesale Merchant',
      location: location || 'Nigeria',
      verified: true,
    });

    res.status(201).json({
      success: true,
      message: 'Buyer profile registered successfully!',
      user: newBuyer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: String(error) });
  }
});

// PUT /api/users/:id/upgrade - Upgrade buyer to farmer profile
router.put('/:id/upgrade', (req: Request, res: Response) => {
  try {
    const { farmName, location, primaryCrops } = req.body;
    const user = db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = db.updateUser(req.params.id, {
      role: 'farmer',
      farmName: farmName || user.farmName || `${user.name}'s Organic Farm`,
      location: location || user.location,
      primaryCrops: primaryCrops || user.primaryCrops || ['Vegetables'],
      verified: true,
      rating: user.rating || 5.0,
      totalSales: user.totalSales || 0,
    });

    res.json({
      success: true,
      message: 'Profile upgraded to Farmer successfully!',
      user: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upgrade profile', error: String(error) });
  }
});

// PUT /api/users/:id - Update user profile
router.put('/:id', (req: Request, res: Response) => {
  try {
    const user = db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = db.updateUser(req.params.id, req.body);
    res.json({
      success: true,
      message: 'User profile updated successfully!',
      user: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user profile', error: String(error) });
  }
});

export default router;
