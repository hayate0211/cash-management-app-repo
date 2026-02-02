const express = require('express');
const Expense = require('../models/Expense');

const router = express.Router();

// 登録
router.post('/', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 一覧
// 一覧取得
router.get('/', async (req, res) => {
  try {
    const { year, month } = req.query;
    let filter = {};

    if (year && month) {
      const y = Number(year);
      const m = Number(month);
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const expenses = await Expense.find(filter).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 月別集計
router.get('/monthly', async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const result = await Expense.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      year,
      month,
      totalAmount: result[0]?.totalAmount || 0,
      count: result[0]?.count || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新
router.put('/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 削除
router.delete('/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
