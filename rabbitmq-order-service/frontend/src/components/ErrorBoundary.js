import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
} from "@mui/material";
import { ErrorOutline, Refresh } from "@mui/icons-material";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
          p={4}
        >
          <Paper
            elevation={2}
            sx={{
              p: 4,
              maxWidth: 500,
              textAlign: "center",
              borderRadius: 2,
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 64,
                color: "error.main",
                mb: 2,
              }}
            />

            <Typography variant="h5" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We encountered an unexpected error. Please try refreshing the page
              or contact support if the problem persists.
            </Typography>

            <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
              <AlertTitle>Error Details</AlertTitle>
              {this.state.error?.message || "Unknown error occurred"}
            </Alert>

            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={this.handleRetry}
              size="large"
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
