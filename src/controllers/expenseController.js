const { Op } = require("sequelize");
const { User, Expense } = require("../models");

exports.createExpense = async (req, res, next) => {
  try {
    const { userId, title, amount, category, description } = req.body;

    if (!userId || !title || amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "userId, title, amount and category are required"
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const expense = await Expense.create({
      userId,
      title,
      amount,
      category,
      description
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    if (!Number.isInteger(page) || page < 1 ||
        !Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination"
      });
    }

    const { userId, category, fromDate, toDate } = req.query;
    const where = {};

    if (userId) {
      if (!Number.isInteger(Number(userId)) || Number(userId) < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId"
        });
      }
      where.userId = Number(userId);
    }

    if (category) where.category = category;

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        const d = new Date(fromDate);
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid fromDate"
          });
        }
        where.createdAt[Op.gte] = d;
      }

      if (toDate) {
        const d = new Date(toDate);
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid toDate"
          });
        }
        d.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = d;
      }
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({
        success: false,
        message: "fromDate cannot be after toDate"
      });
    }

    const offset = (page - 1) * limit;

    const result = await Expense.findAndCountAll({
      where,
      include: [{ model: User, attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: result.count,
        totalPages: Math.ceil(result.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpenseById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID"
      });
    }

    const expense = await Expense.findByPk(id, {
      include: [{ model: User, attributes: ["id", "name", "email"] }]
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID"
      });
    }

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    const { title, amount, category, description } = req.body;

    if (amount !== undefined &&
        (!Number.isFinite(Number(amount)) || Number(amount) <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    await expense.update({
      ...(title !== undefined && { title }),
      ...(amount !== undefined && { amount }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description })
    });

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID"
      });
    }

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    await expense.destroy();

    res.json({
      success: true,
      message: "Expense deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    const { userId, fromDate, toDate } = req.query;
    const where = {};

    if (userId) where.userId = Number(userId);

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
      if (toDate) {
        const d = new Date(toDate);
        d.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = d;
      }
    }

    const expenses = await Expense.findAll({ where });

    const totalAmount = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    const byCategory = {};
    expenses.forEach((expense) => {
      byCategory[expense.category] =
        (byCategory[expense.category] || 0) + Number(expense.amount);
    });

    res.json({
      success: true,
      data: {
        totalExpenses: expenses.length,
        totalAmount: Number(totalAmount.toFixed(2)),
        byCategory
      }
    });
  } catch (error) {
    next(error);
  }
};