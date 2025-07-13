// Mock API responses for development when backend is not available

// In-memory storage for demo
let orders = [];

// Generate UUID function
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const mockAPI = {
  createOrder: async (orderData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderId = generateUUID();
        const order = {
          orderId,
          ...orderData,
          status: "pending",
          timestamp: new Date(),
          currentLocation: {
            lat: 28.6139,
            lng: 77.209,
          },
        };
        orders.push(order);
        resolve({
          data: {
            message: "Order created successfully",
            orderId: orderId,
            order: order,
          },
        });
      }, 1000); // Simulate network delay
    });
  },

  trackOrder: async (orderId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = orders.find((o) => o.orderId === orderId);
        if (!order) {
          reject(new Error("Order not found"));
          return;
        }

        // Simulate different statuses
        const statuses = [
          "pending",
          "confirmed",
          "preparing",
          "picked_up",
          "in_transit",
          "delivered",
        ];
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)];

        resolve({
          data: {
            ...order,
            status: randomStatus,
          },
        });
      }, 800);
    });
  },
};
