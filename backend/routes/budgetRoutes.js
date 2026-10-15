const express = require('express');
const router = express.Router();
const {
  getBudgets,
  getCurrentBudget,
  getBudgetByMonth,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/current', getCurrentBudget);
router.route('/').get(getBudgets).post(createOrUpdateBudget);
router.route('/:id').put(updateBudget).delete(deleteBudget);
router.get('/:year/:month', getBudgetByMonth);

module.exports = router;
