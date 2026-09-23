const router = require("express").Router();
const controller = require("../controllers/expenseController");

router.post("/", controller.createExpense);
router.get("/", controller.getExpenses);
router.get("/summary", controller.getSummary);
router.get("/:id", controller.getExpenseById);
router.put("/:id", controller.updateExpense);
router.delete("/:id", controller.deleteExpense);

module.exports = router;