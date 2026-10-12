const express = require('express');
const router = express.Router();
const { getBudgets, getBudgetByMonth, createOrUpdateBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getBudgets).post(createOrUpdateBudget);
router.get('/:year/:month', getBudgetByMonth);
router.delete('/:id', deleteBudget);

module.exports = router;
