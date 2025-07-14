// Simple mock API for development
export const createOrder = async (orderData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 'success', orderId: Math.floor(Math.random() * 10000) });
    }, 500);
  });
};

export const trackOrder = async (orderId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 'in_transit', orderId, location: { lat: 0, lng: 0 } });
    }, 500);
  });
}; 