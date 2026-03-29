// Centralized design system / theme
export const theme = {
  // Colors
  colors: {
    bg: {
      deep: "#f3f5f9",
      primary: "#f8f9fc",
      surface: "#ffffff",
      card: "rgba(255, 255, 255, 0.86)",
      glass: "rgba(255, 255, 255, 0.74)",
    },
    border: {
      glass: "rgba(17, 24, 39, 0.08)",
      glow: "rgba(10, 132, 255, 0.2)",
    },
    accent: {
      primary: "#0a84ff",
      dim: "rgba(10, 132, 255, 0.1)",
      glow: "rgba(10, 132, 255, 0.22)",
    },
    feedback: {
      success: "#30d158",
      successDim: "rgba(48, 209, 88, 0.12)",
      warning: "#ff9f0a",
      warningDim: "rgba(255, 159, 10, 0.12)",
      danger: "#ff453a",
      dangerDim: "rgba(255, 69, 58, 0.12)",
    },
    text: {
      primary: "#1c1c1e",
      secondary: "#3a3a3c",
      muted: "#6e6e73",
    }
  },
  
  // Radius
  radius: {
    sm: "12px",
    md: "18px",
    lg: "24px",
    xl: "32px",
  },
  
  // Shadows
  shadow: {
    card: "0 14px 40px rgba(17, 24, 39, 0.1), 0 3px 10px rgba(17, 24, 39, 0.06)",
    glow: "0 10px 24px rgba(10,132,255,0.08)",
  },
  
  // Transitions
  transition: {
    standard: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  
  // Typography
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
    lineHeight: 1.6,
  }
};
