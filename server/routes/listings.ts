import { Router, Request, Response } from 'express';
import { db } from '../db';
import { Listing } from '../../src/types';

const router = Router();

// GET /api/listings - Get all produce listings with optional filtering & sorting
router.get('/', (req: Request, res: Response) => {
  try {
    let listings = db.getListings();

    const { searchQuery, category, location, farmingMethod, deliveryOnly, sortBy } = req.query;

    if (searchQuery && typeof searchQuery === 'string') {
      const query = searchQuery.toLowerCase().trim();
      listings = listings.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.category.toLowerCase().includes(query) ||
          l.location.toLowerCase().includes(query) ||
          l.farmerName.toLowerCase().includes(query) ||
          (l.description && l.description.toLowerCase().includes(query))
      );
    }

    if (category && typeof category === 'string' && category !== 'All Categories') {
      listings = listings.filter((l) => l.category.toLowerCase() === category.toLowerCase());
    }

    if (location && typeof location === 'string') {
      listings = listings.filter((l) => l.location.toLowerCase().includes((location as string).toLowerCase()));
    }

    if (farmingMethod && typeof farmingMethod === 'string' && farmingMethod !== 'All Methods') {
      listings = listings.filter((l) => l.farmingMethod?.toLowerCase() === (farmingMethod as string).toLowerCase());
    }

    if (deliveryOnly === 'true') {
      listings = listings.filter((l) => l.deliveryAvailable === true);
    }

    // Sort listings
    if (sortBy === 'price_low') {
      listings.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      listings.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
      listings.sort((a, b) => (b.farmerRating || 0) - (a.farmerRating || 0));
    } else {
      // Default: newest first
      listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch listings', error: String(error) });
  }
});

// GET /api/listings/:id - Fetch single listing by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const listing = db.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch listing', error: String(error) });
  }
});

// POST /api/listings - Create new produce listing
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, category, price, unit, quantity, location, farmerId, farmerName, farmerPhone, imageUrl } = req.body;

    if (!title || !category || price === undefined || !unit || !quantity || !location || !farmerId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, category, price, unit, quantity, location, farmerId',
      });
    }

    const newListing = db.createListing(req.body);
    res.status(201).json({
      success: true,
      message: 'Produce listing published successfully',
      data: newListing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create listing', error: String(error) });
  }
});

// PUT /api/listings/:id - Update existing listing
router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateListing(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update listing', error: String(error) });
  }
});

// DELETE /api/listings/:id - Delete listing
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = db.deleteListing(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete listing', error: String(error) });
  }
});

// POST /api/listings/seed - Reseed sample listings and users
router.post('/seed', (req: Request, res: Response) => {
  try {
    const freshData = db.seedDatabase(true);
    res.json({
      success: true,
      message: 'Database reseeded successfully with sample produce listings & users',
      data: freshData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to seed database', error: String(error) });
  }
});

export default router;
