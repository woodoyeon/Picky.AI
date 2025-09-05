import express from 'express';
import { getApprovedProductDetails } from '../controllers/productController.js';

const router = express.Router();

// POST /api/products/mine
router.post('/mine', getApprovedProductDetails);

export default router;
