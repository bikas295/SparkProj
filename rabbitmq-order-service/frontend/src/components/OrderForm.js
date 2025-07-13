import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Person,
  ShoppingCart,
  AttachMoney,
  Add,
  Remove,
  Send,
  CheckCircle,
  LocationOn,
  Phone,
  Email,
} from "@mui/icons-material";
import axios from "axios";
import { mockAPI } from "../api-mock";

const OrderForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    items: [{ name: "", quantity: 1, price: "" }],
    totalAmount: 0,
    deliveryNotes: "",
  });

  const steps = ["Customer Info", "Order Details", "Review & Submit"];

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!formData.customerName.trim())
          newErrors.customerName = "Customer name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
          newErrors.email = "Email is invalid";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        break;
      case 1:
        if (formData.items.length === 0)
          newErrors.items = "At least one item is required";
        formData.items.forEach((item, index) => {
          if (!item.name.trim())
            newErrors[`item_${index}_name`] = "Item name is required";
          if (!item.price || item.price <= 0)
            newErrors[`item_${index}_price`] = "Valid price is required";
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: newItems }));
    calculateTotal(newItems);

    // Clear errors for this item
    if (errors[`item_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`item_${index}_${field}`]: "" }));
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: "" }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, items: newItems }));
      calculateTotal(newItems);
    }
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0) * (item.quantity || 1);
    }, 0);
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const submitOrder = async () => {
    if (!validateStep(1)) return;

    setLoading(true);
    try {
      const payload = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        items: formData.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
        })),
        totalAmount: formData.totalAmount,
        deliveryNotes: formData.deliveryNotes,
      };

      let response;
      try {
        // Try real API first
        response = await axios.post("/api/orders", payload);
      } catch (networkError) {
        // Fallback to mock API if backend is not available
        console.log("Backend not available, using mock API");
        response = await mockAPI.createOrder(payload);
      }

      setOrderResult(response.data);
      setShowSuccess(true);

      // Reset form after successful submission
      setTimeout(() => {
        setCurrentStep(0);
        setFormData({
          customerName: "",
          email: "",
          phone: "",
          address: "",
          items: [{ name: "", quantity: 1, price: "" }],
          totalAmount: 0,
          deliveryNotes: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Order submission failed:", error);
      setErrors({ submit: "Failed to submit order. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={formData.customerName}
                  onChange={(e) =>
                    handleInputChange("customerName", e.target.value)
                  }
                  error={!!errors.customerName}
                  helperText={errors.customerName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Delivery Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  error={!!errors.address}
                  helperText={errors.address}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", mb: 3 }}
              >
                <ShoppingCart sx={{ mr: 1 }} />
                Order Items
              </Typography>

              {formData.items.map((item, index) => (
                <Card
                  key={index}
                  sx={{ mb: 2, border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Item Name"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(index, "name", e.target.value)
                          }
                          error={!!errors[`item_${index}_name`]}
                          helperText={errors[`item_${index}_name`]}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          inputProps={{ min: 1 }}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <TextField
                          fullWidth
                          label="Price ($)"
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(index, "price", e.target.value)
                          }
                          error={!!errors[`item_${index}_price`]}
                          helperText={errors[`item_${index}_price`]}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          }}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" color="text.secondary">
                            $
                            {(
                              (parseFloat(item.price) || 0) * item.quantity
                            ).toFixed(2)}
                          </Typography>
                          {formData.items.length > 1 && (
                            <IconButton
                              color="error"
                              onClick={() => removeItem(index)}
                              size="small"
                            >
                              <Remove />
                            </IconButton>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              <Button
                startIcon={<Add />}
                onClick={addItem}
                variant="outlined"
                sx={{ mb: 3 }}
              >
                Add Item
              </Button>

              <Divider sx={{ my: 3 }} />

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">Total Amount:</Typography>
                <Chip
                  label={`$${formData.totalAmount.toFixed(2)}`}
                  color="primary"
                  size="large"
                  sx={{ fontSize: "1.1rem", fontWeight: "bold" }}
                />
              </Box>

              <TextField
                fullWidth
                label="Delivery Notes (Optional)"
                multiline
                rows={3}
                value={formData.deliveryNotes}
                onChange={(e) =>
                  handleInputChange("deliveryNotes", e.target.value)
                }
                variant="outlined"
                sx={{ mt: 3 }}
              />
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Order Review
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: "fit-content" }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                    >
                      Customer Information
                    </Typography>
                    <Typography>
                      <strong>Name:</strong> {formData.customerName}
                    </Typography>
                    <Typography>
                      <strong>Email:</strong> {formData.email}
                    </Typography>
                    <Typography>
                      <strong>Phone:</strong> {formData.phone}
                    </Typography>
                    <Typography>
                      <strong>Address:</strong> {formData.address}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                    >
                      Order Summary
                    </Typography>
                    {formData.items.map((item, index) => (
                      <Box
                        key={index}
                        display="flex"
                        justifyContent="space-between"
                        sx={{ mb: 1 }}
                      >
                        <Typography>
                          {item.name} × {item.quantity}
                        </Typography>
                        <Typography fontWeight="bold">
                          $
                          {(
                            (parseFloat(item.price) || 0) * item.quantity
                          ).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6">Total:</Typography>
                      <Typography
                        variant="h6"
                        color="primary"
                        fontWeight="bold"
                      >
                        ${formData.totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                    {formData.deliveryNotes && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Delivery Notes:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formData.deliveryNotes}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
      {/* Stepper */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 4, background: "rgba(25, 118, 210, 0.04)" }}
      >
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Form Content */}
      <Paper elevation={1} sx={{ p: { xs: 3, md: 4 }, minHeight: 400 }}>
        {renderStepContent(currentStep)}

        {errors.submit && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {errors.submit}
          </Alert>
        )}

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={handleBack}
            disabled={currentStep === 0 || loading}
            variant="outlined"
          >
            Back
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={submitOrder}
              disabled={loading}
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              sx={{ minWidth: 140 }}
            >
              {loading ? "Submitting..." : "Submit Order"}
            </Button>
          ) : (
            <Button onClick={handleNext} variant="contained" size="large">
              Next
            </Button>
          )}
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          variant="filled"
          icon={<CheckCircle />}
        >
          <Box>
            <Typography fontWeight="bold">
              Order Submitted Successfully!
            </Typography>
            {orderResult && (
              <Typography variant="body2">
                Order ID: {orderResult.orderId || orderResult._id}
              </Typography>
            )}
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderForm;
