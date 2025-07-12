import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  CircularProgress,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Search,
  Refresh,
  CheckCircle,
  LocalShipping,
  Schedule,
  Cancel,
  Person,
  LocationOn,
  Phone,
  Email,
  Receipt,
  TwoWheeler,
  Home,
  Restaurant,
} from "@mui/icons-material";
import axios from "axios";
import MapboxMap from "./MapboxMap";

const OrderTracker = () => {
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Mock real-time updates for demo
  useEffect(() => {
    let interval;
    if (autoRefresh && orderData) {
      interval = setInterval(() => {
        fetchOrder(false); // Silent refresh
      }, 30000); // Refresh every 30 seconds
    }
    return () => interval && clearInterval(interval);
  }, [autoRefresh, orderData, orderId]);

  const fetchOrder = async (showLoading = true) => {
    if (!orderId.trim()) {
      setError("Please enter an Order ID");
      return;
    }

    if (showLoading) {
      setLoading(true);
      setError("");
      setOrderData(null);
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/orders/${orderId}/track`,
      );
      setOrderData(res.data);
      setAutoRefresh(true);
      setError("");
    } catch (err) {
      setError("Order not found or error fetching order details.");
      setOrderData(null);
      setAutoRefresh(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "preparing":
        return "info";
      case "picked_up":
        return "primary";
      case "in_transit":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status, index, isActive) => {
    const iconProps = {
      sx: {
        fontSize: 20,
        color: isActive ? "white" : "action.disabled",
      },
    };

    switch (status?.toLowerCase()) {
      case "pending":
        return <Schedule {...iconProps} />;
      case "confirmed":
        return <CheckCircle {...iconProps} />;
      case "preparing":
        return <Restaurant {...iconProps} />;
      case "picked_up":
        return <TwoWheeler {...iconProps} />;
      case "in_transit":
        return <LocalShipping {...iconProps} />;
      case "delivered":
        return <Home {...iconProps} />;
      case "cancelled":
        return <Cancel {...iconProps} />;
      default:
        return <Schedule {...iconProps} />;
    }
  };

  const getProgressPercentage = (status) => {
    const statusOrder = [
      "pending",
      "confirmed",
      "preparing",
      "picked_up",
      "in_transit",
      "delivered",
    ];
    const currentIndex = statusOrder.indexOf(status?.toLowerCase());
    return currentIndex >= 0
      ? ((currentIndex + 1) / statusOrder.length) * 100
      : 0;
  };

  const orderStatuses = [
    {
      key: "pending",
      label: "Order Pending",
      description: "Order received and being processed",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      description: "Order confirmed by restaurant",
    },
    {
      key: "preparing",
      label: "Preparing",
      description: "Your order is being prepared",
    },
    {
      key: "picked_up",
      label: "Picked Up",
      description: "Driver has picked up your order",
    },
    {
      key: "in_transit",
      label: "In Transit",
      description: "Order is on the way to you",
    },
    {
      key: "delivered",
      label: "Delivered",
      description: "Order has been delivered",
    },
  ];

  const getCurrentStatusIndex = (status) => {
    return orderStatuses.findIndex((s) => s.key === status?.toLowerCase());
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      {/* Search Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", mb: 3 }}
        >
          <Search sx={{ mr: 1, color: "primary.main" }} />
          Track Your Order
        </Typography>

        <Box display="flex" gap={2} alignItems="start">
          <TextField
            fullWidth
            label="Enter Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchOrder()}
            placeholder="e.g., ORD-12345678"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Receipt color="primary" />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
          <Button
            onClick={() => fetchOrder()}
            disabled={loading}
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <Search />}
            sx={{ minWidth: 140, height: 56 }}
          >
            {loading ? "Searching..." : "Track"}
          </Button>
        </Box>

        {error && (
          <Fade in>
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          </Fade>
        )}
      </Paper>

      {/* Order Details */}
      {orderData && (
        <Fade in timeout={800}>
          <Box>
            {/* Status Header */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Order Status</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Chip
                    label={orderData.status || "Unknown"}
                    color={getStatusColor(orderData.status)}
                    variant="filled"
                    size="large"
                    sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                  />
                  <Tooltip title="Auto-refresh enabled">
                    <IconButton
                      onClick={() => fetchOrder()}
                      color="primary"
                      disabled={loading}
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Progress Bar */}
              <Box sx={{ mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={getProgressPercentage(orderData.status)}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: "rgba(0,0,0,0.1)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>

              {/* Status Timeline */}
              <Timeline sx={{ p: 0 }}>
                {orderStatuses.map((status, index) => {
                  const currentIndex = getCurrentStatusIndex(orderData.status);
                  const isActive = index <= currentIndex;
                  const isCurrent = index === currentIndex;

                  return (
                    <TimelineItem key={status.key}>
                      <TimelineSeparator>
                        <TimelineDot
                          color={
                            isActive ? getStatusColor(orderData.status) : "grey"
                          }
                          variant={
                            isCurrent
                              ? "filled"
                              : isActive
                                ? "filled"
                                : "outlined"
                          }
                          sx={{
                            p: 1,
                            transform: isCurrent ? "scale(1.2)" : "scale(1)",
                            transition: "transform 0.3s",
                          }}
                        >
                          {getStatusIcon(status.key, index, isActive)}
                        </TimelineDot>
                        {index < orderStatuses.length - 1 && (
                          <TimelineConnector
                            sx={{
                              backgroundColor: isActive
                                ? "primary.main"
                                : "grey.300",
                              width: 2,
                            }}
                          />
                        )}
                      </TimelineSeparator>
                      <TimelineContent sx={{ py: "12px", px: 2 }}>
                        <Typography
                          variant="h6"
                          component="span"
                          sx={{
                            fontWeight: isCurrent ? "bold" : "normal",
                            color: isActive ? "text.primary" : "text.secondary",
                          }}
                        >
                          {status.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ opacity: isActive ? 1 : 0.6 }}
                        >
                          {status.description}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  );
                })}
              </Timeline>
            </Paper>

            {/* Order Information Grid */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Customer Info */}
              <Grid item xs={12} md={6}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Person sx={{ mr: 1, color: "primary.main" }} />
                      Customer Information
                    </Typography>
                    <Box sx={{ pl: 4 }}>
                      <Typography sx={{ mb: 1 }}>
                        <strong>Name:</strong> {orderData.customerName || "N/A"}
                      </Typography>
                      {orderData.email && (
                        <Typography
                          sx={{ mb: 1, display: "flex", alignItems: "center" }}
                        >
                          <Email sx={{ mr: 1, fontSize: 18 }} />
                          {orderData.email}
                        </Typography>
                      )}
                      {orderData.phone && (
                        <Typography
                          sx={{ mb: 1, display: "flex", alignItems: "center" }}
                        >
                          <Phone sx={{ mr: 1, fontSize: 18 }} />
                          {orderData.phone}
                        </Typography>
                      )}
                      {orderData.address && (
                        <Typography
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <LocationOn sx={{ mr: 1, fontSize: 18 }} />
                          {orderData.address}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Order Summary */}
              <Grid item xs={12} md={6}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Receipt sx={{ mr: 1, color: "primary.main" }} />
                      Order Summary
                    </Typography>
                    <Box sx={{ pl: 4 }}>
                      {orderData.items && orderData.items.length > 0 ? (
                        orderData.items.map((item, index) => (
                          <Box
                            key={index}
                            display="flex"
                            justifyContent="space-between"
                            sx={{ mb: 1 }}
                          >
                            <Typography>
                              {typeof item === "string" ? item : item.name}
                              {item.quantity && ` × ${item.quantity}`}
                            </Typography>
                            {item.price && (
                              <Typography fontWeight="bold">
                                $
                                {(item.price * (item.quantity || 1)).toFixed(2)}
                              </Typography>
                            )}
                          </Box>
                        ))
                      ) : (
                        <Typography color="text.secondary">
                          No items found
                        </Typography>
                      )}
                      <Divider sx={{ my: 2 }} />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6">Total:</Typography>
                        <Typography
                          variant="h6"
                          color="primary"
                          fontWeight="bold"
                        >
                          ${orderData.totalAmount?.toFixed(2) || "0.00"}
                        </Typography>
                      </Box>
                      {orderData.deliveryNotes && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Delivery Notes:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {orderData.deliveryNotes}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Map Section */}
            {orderData.currentLocation && (
              <Zoom in timeout={1000}>
                <Paper
                  elevation={1}
                  sx={{ overflow: "hidden", borderRadius: 2 }}
                >
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "primary.main",
                      color: "white",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <LocationOn sx={{ mr: 1 }} />
                      Live Tracking
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Real-time location of your delivery
                    </Typography>
                  </Box>
                  <MapboxMap
                    lat={orderData.currentLocation.lat}
                    lng={orderData.currentLocation.lng}
                  />
                </Paper>
              </Zoom>
            )}
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default OrderTracker;
