import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';

const router = Router();

router.get('/', ProductController.listProducts);
router.get('/:id', ProductController.getProductById);

export default router;
