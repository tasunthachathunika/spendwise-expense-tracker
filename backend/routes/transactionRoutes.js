const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  exportTransactions,
  bulkDeleteTransactions,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// All routes protected
router.use(protect);

router.get('/categories', getCategories);
router.get('/export', exportTransactions);
router.delete('/bulk', bulkDeleteTransactions);

router.route('/').get(getTransactions).post(createTransaction);
router.route('/:id').get(getTransaction).put(updateTransaction).delete(deleteTransaction);

module.exports = router;
