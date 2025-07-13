import React from "react";
import { Box, CircularProgress, Typography, Paper, Fade } from "@mui/material";
import { LocalShipping } from "@mui/icons-material";

const LoadingSpinner = ({
  message = "Loading...",
  size = 40,
  fullScreen = false,
  overlay = false,
}) => {
  const LoadingContent = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
      sx={{
        minHeight: fullScreen ? "100vh" : "200px",
        background: overlay ? "rgba(255, 255, 255, 0.9)" : "transparent",
        position: overlay ? "absolute" : "relative",
        top: overlay ? 0 : "auto",
        left: overlay ? 0 : "auto",
        right: overlay ? 0 : "auto",
        bottom: overlay ? 0 : "auto",
        zIndex: overlay ? 1000 : "auto",
        backdropFilter: overlay ? "blur(2px)" : "none",
      }}
    >
      <Box position="relative" display="inline-flex" mb={2}>
        <CircularProgress
          size={size}
          thickness={4}
          sx={{
            color: "primary.main",
            animationDuration: "1.5s",
          }}
        />
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: "translate(-50%, -50%)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          <LocalShipping
            sx={{
              fontSize: size * 0.4,
              color: "primary.main",
            }}
          />
        </Box>
      </Box>

      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        sx={{
          fontWeight: 500,
          animation: "fadeInOut 2s ease-in-out infinite",
        }}
      >
        {message}
      </Typography>
    </Box>
  );

  if (fullScreen) {
    return (
      <Fade in timeout={300}>
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="background.default"
          zIndex={9999}
        >
          <Paper
            elevation={3}
            sx={{
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <LoadingContent />
          </Paper>
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in timeout={300}>
      <Box>
        <LoadingContent />
      </Box>
    </Fade>
  );
};

export default LoadingSpinner;
