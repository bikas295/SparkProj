import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  LinearProgress,
  Fade,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  LocationOn,
  MyLocation,
  Directions,
  TwoWheeler,
  LocalShipping,
  Home,
  Settings,
  Info,
  Refresh,
} from "@mui/icons-material";

const FallbackMap = ({ lat = 28.6139, lng = 77.209 }) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [deliveryProgress, setDeliveryProgress] = useState(0);

  // Simulate delivery progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryProgress((prev) => {
        const newProgress = prev >= 100 ? 0 : prev + 2;
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Simulate route animation steps
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const mockLocations = [
    { name: "Restaurant", icon: <LocalShipping />, color: "#1976d2" },
    { name: "Pickup Point", icon: <TwoWheeler />, color: "#ff9800" },
    { name: "En Route", icon: <Directions />, color: "#4caf50" },
    { name: "Your Location", icon: <Home />, color: "#f44336" },
  ];

  return (
    <Paper
      elevation={2}
      sx={{
        position: "relative",
        width: "100%",
        height: "400px",
        background:
          "linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 50%, #fce4ec 100%)",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      {/* Progress Bar Header */}
      <Box sx={{ p: 2, background: "rgba(25, 118, 210, 0.1)" }}>
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", mb: 1 }}
        >
          <LocationOn sx={{ mr: 1, color: "primary.main" }} />
          Live Tracking Simulation
        </Typography>
        <LinearProgress
          variant="determinate"
          value={deliveryProgress}
          sx={{
            height: 8,
            borderRadius: 4,
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg, #1976d2, #4caf50)",
            },
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Delivery Progress: {Math.round(deliveryProgress)}%
        </Typography>
      </Box>

      {/* Mock Map Area */}
      <Box
        sx={{
          position: "relative",
          height: "calc(100% - 120px)",
          background: `
            radial-gradient(circle at 30% 40%, rgba(25, 118, 210, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, rgba(255, 193, 7, 0.05) 0%, rgba(233, 30, 99, 0.05) 100%)
          `,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Animated Route Path */}
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <linearGradient
              id="routeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#1976d2" />
              <stop offset="50%" stopColor="#ff9800" />
              <stop offset="100%" stopColor="#4caf50" />
            </linearGradient>
          </defs>
          <path
            d="M 50 80 Q 150 120 250 60 Q 350 40 400 80"
            stroke="url(#routeGradient)"
            strokeWidth="4"
            fill="none"
            strokeDasharray="10,5"
            strokeLinecap="round"
            style={{
              animation: "dashFlow 3s linear infinite",
            }}
          />
        </svg>

        {/* Location Points */}
        {mockLocations.map((location, index) => (
          <Fade key={location.name} in timeout={500 + index * 200}>
            <Box
              sx={{
                position: "absolute",
                left: `${20 + index * 20}%`,
                top: `${30 + (index % 2) * 20}%`,
                transform: animationStep === index ? "scale(1.2)" : "scale(1)",
                transition: "transform 0.3s ease",
              }}
            >
              <Card
                elevation={animationStep === index ? 8 : 3}
                sx={{
                  minWidth: 120,
                  background:
                    animationStep === index
                      ? "rgba(255,255,255,0.95)"
                      : "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton
                      size="small"
                      sx={{
                        color: location.color,
                        animation:
                          animationStep === index
                            ? "pulse 1s infinite"
                            : "none",
                      }}
                    >
                      {location.icon}
                    </IconButton>
                    <Typography variant="body2" fontWeight="medium">
                      {location.name}
                    </Typography>
                  </Box>
                  {animationStep === index && (
                    <Chip
                      label="Current"
                      size="small"
                      color="primary"
                      sx={{ mt: 0.5, fontSize: "0.7rem" }}
                    />
                  )}
                </CardContent>
              </Card>
            </Box>
          </Fade>
        ))}

        {/* Center Information */}
        <Card
          elevation={4}
          sx={{
            maxWidth: 300,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            textAlign: "center",
          }}
        >
          <CardContent>
            <MyLocation sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Demo Map Mode
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
            </Typography>

            <Alert severity="info" sx={{ mb: 2, textAlign: "left" }}>
              <AlertTitle>Mapbox Token Missing</AlertTitle>
              To enable live maps, add your Mapbox API token to the environment
              variables.
            </Alert>

            <Button
              variant="outlined"
              size="small"
              startIcon={<Settings />}
              href="https://docs.mapbox.com/api/overview/#access-tokens-and-token-scopes"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Mapbox Token
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Animated Styles */}
      <style jsx>{`
        @keyframes dashFlow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -30;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </Paper>
  );
};

export default FallbackMap;
