const express = require("express");
const router = express.Router();
const { createOrder, cancelOrder, trackOrder } = require("../controllers/order.controller");
// add order routes here

// POST /api/orders
router.post("/", createOrder);
// POST /api/orders/:id/cancel
router.post("/:id/cancel", cancelOrder);
// GET /api/orders/:id/track
router.get('/:id/track', trackOrder);

module.exports = router;
