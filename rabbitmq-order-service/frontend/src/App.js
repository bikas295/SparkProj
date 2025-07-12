import React, { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Badge,
  useMediaQuery,
} from "@mui/material";
import {
  LocalShipping,
  Assignment,
  TrackChanges,
  Menu as MenuIcon,
  Notifications,
} from "@mui/icons-material";
import OrderForm from "./components/OrderForm";
import OrderTracker from "./components/OrderTracker";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#ff6f00",
      light: "#ffb74d",
      dark: "#f57c00",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 1px 3px rgba(0, 0, 0, 0.12)",
    "0px 1px 5px rgba(0, 0, 0, 0.12)",
    "0px 1px 8px rgba(0, 0, 0, 0.12)",
    "0px 1px 10px rgba(0, 0, 0, 0.12)",
    "0px 1px 14px rgba(0, 0, 0, 0.12)",
    "0px 1px 18px rgba(0, 0, 0, 0.12)",
    "0px 2px 16px rgba(0, 0, 0, 0.12)",
    "0px 3px 14px rgba(0, 0, 0, 0.12)",
    "0px 3px 16px rgba(0, 0, 0, 0.12)",
    "0px 4px 18px rgba(0, 0, 0, 0.12)",
    "0px 4px 20px rgba(0, 0, 0, 0.12)",
    "0px 5px 22px rgba(0, 0, 0, 0.12)",
    "0px 5px 24px rgba(0, 0, 0, 0.12)",
    "0px 5px 26px rgba(0, 0, 0, 0.12)",
    "0px 6px 28px rgba(0, 0, 0, 0.12)",
    "0px 6px 30px rgba(0, 0, 0, 0.12)",
    "0px 6px 32px rgba(0, 0, 0, 0.12)",
    "0px 7px 34px rgba(0, 0, 0, 0.12)",
    "0px 7px 36px rgba(0, 0, 0, 0.12)",
    "0px 8px 38px rgba(0, 0, 0, 0.12)",
    "0px 8px 40px rgba(0, 0, 0, 0.12)",
    "0px 8px 42px rgba(0, 0, 0, 0.12)",
    "0px 9px 44px rgba(0, 0, 0, 0.12)",
    "0px 9px 46px rgba(0, 0, 0, 0.12)",
  ],
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`delivery-tabpanel-${index}`}
      aria-labelledby={`delivery-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: "100vh" }}>
        {/* Modern App Bar */}
        <AppBar
          position="static"
          elevation={1}
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
            <LocalShipping sx={{ mr: 2, fontSize: 28 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              }}
            >
              RapidDelivery Pro
            </Typography>
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={3} color="secondary">
                <Notifications />
              </Badge>
            </IconButton>
            {isMobile && (
              <IconButton color="inherit">
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
          {/* Hero Section */}
          <Paper
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%)",
              p: { xs: 3, md: 4 },
              mb: 3,
              borderRadius: 3,
              border: "1px solid rgba(25, 118, 210, 0.12)",
            }}
          >
            <Box textAlign="center">
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  color: "primary.main",
                  fontSize: { xs: "1.75rem", md: "2.125rem" },
                }}
              >
                Professional Delivery Management
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto" }}
              >
                Create orders, track deliveries in real-time, and manage your
                logistics with our advanced mapping and notification system.
              </Typography>
            </Box>
          </Paper>

          {/* Navigation Tabs */}
          <Paper
            elevation={1}
            sx={{
              mb: 0,
              borderRadius: "16px 16px 0 0",
              overflow: "hidden",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? "fullWidth" : "standard"}
              indicatorColor="primary"
              textColor="primary"
              sx={{
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                "& .MuiTab-root": {
                  minHeight: 64,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                },
              }}
            >
              <Tab
                icon={<Assignment />}
                label="Create Order"
                iconPosition="start"
                sx={{ px: { xs: 2, md: 4 } }}
              />
              <Tab
                icon={<TrackChanges />}
                label="Track Delivery"
                iconPosition="start"
                sx={{ px: { xs: 2, md: 4 } }}
              />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <Paper
            elevation={1}
            sx={{
              borderRadius: "0 0 16px 16px",
              minHeight: "calc(100vh - 280px)",
              overflow: "hidden",
            }}
          >
            <TabPanel value={activeTab} index={0}>
              <OrderForm />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <OrderTracker />
            </TabPanel>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
