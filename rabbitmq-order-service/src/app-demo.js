const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for demo purposes
let orders = [];

// Create order endpoint
app.post("/api/orders", (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      address,
      items,
      totalAmount,
      deliveryNotes,
    } = req.body;

    if (!customerName || !items || !totalAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const orderId = uuidv4();
    const order = {
      orderId,
      customerName,
      email,
      phone,
      address,
      items,
      totalAmount,
      deliveryNotes,
      status: "pending",
      timestamp: new Date(),
      currentLocation: {
        lat: 28.6139, // Default Delhi location
        lng: 77.209,
      },
    };

    orders.push(order);
    console.log(`Order created: ${orderId}`);

    res.status(201).json({
      message: "Order created successfully",
      orderId: orderId,
      order: order,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Track order endpoint
app.get("/api/orders/:id/track", (req, res) => {
  try {
    const { id } = req.params;
    const order = orders.find((o) => o.orderId === id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Simulate different statuses for demo
    const statuses = [
      "pending",
      "confirmed",
      "preparing",
      "picked_up",
      "in_transit",
      "delivered",
    ];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    res.json({
      orderId: order.orderId,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryNotes: order.deliveryNotes,
      status: randomStatus,
      currentLocation: order.currentLocation,
      timestamp: order.timestamp,
    });
  } catch (err) {
    console.error("Order tracking error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all orders (for admin)
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date(), orders: orders.length });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Demo server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
