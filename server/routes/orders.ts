import { Router, Request, Response } from 'express';
import { db } from '../db';
import { OrderStatus } from '../../src/types';

const router = Router();

// GET /api/orders - Get orders (supports filter by farmerId, buyerId, status)
router.get('/', (req: Request, res: Response) => {
  try {
    let orders = db.getOrders();
    const { farmerId, buyerId, status } = req.query;

    if (farmerId && typeof farmerId === 'string') {
      orders = orders.filter((o) => o.farmerId === farmerId);
    }

    if (buyerId && typeof buyerId === 'string') {
      orders = orders.filter((o) => o.buyerId === buyerId);
    }

    if (status && typeof status === 'string') {
      orders = orders.filter((o) => o.status === status);
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: String(error) });
  }
});

// GET /api/orders/:id - Get single order details
router.get('/:id', (req: Request, res: Response) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: String(error) });
  }
});

// POST /api/orders - Place a new order
router.post('/', (req: Request, res: Response) => {
  try {
    const { listingId, listingTitle, farmerId, buyerId, quantityOrdered, unitPrice, totalAmount } = req.body;
    if (!listingId || !farmerId || !buyerId || !quantityOrdered) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: listingId, farmerId, buyerId, quantityOrdered',
      });
    }

    const newOrder = db.createOrder(req.body);
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create order', error: String(error) });
  }
});

// PUT /api/orders/:id/status - Update order status (pending, confirmed, in_transit, delivered, cancelled)
router.put('/:id/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: OrderStatus };
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status field is required' });
    }

    const updated = db.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status', error: String(error) });
  }
});

export default router;
