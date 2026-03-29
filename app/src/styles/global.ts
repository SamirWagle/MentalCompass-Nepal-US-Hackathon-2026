// Global styles
import { theme } from '@utils/theme';

// Create CSS for global styles
export const GlobalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --bg-deep: ${theme.colors.bg.deep};
    --bg-primary: ${theme.colors.bg.primary};
    --bg-surface: ${theme.colors.bg.surface};
    --bg-card: ${theme.colors.bg.card};
    --bg-glass: ${theme.colors.bg.glass};
    --border-glass: ${theme.colors.border.glass};
    --border-glow: ${theme.colors.border.glow};
    --accent: ${theme.colors.accent.primary};
    --accent-dim: ${theme.colors.accent.dim};
    --accent-glow: ${theme.colors.accent.glow};
    --success: ${theme.colors.feedback.success};
    --success-dim: ${theme.colors.feedback.successDim};
    --warning: ${theme.colors.feedback.warning};
    --warning-dim: ${theme.colors.feedback.warningDim};
    --danger: ${theme.colors.feedback.danger};
    --danger-dim: ${theme.colors.feedback.dangerDim};
    --text-primary: ${theme.colors.text.primary};
    --text-secondary: ${theme.colors.text.secondary};
    --text-muted: ${theme.colors.text.muted};
    --radius-sm: ${theme.radius.sm};
    --radius-md: ${theme.radius.md};
    --radius-lg: ${theme.radius.lg};
    --radius-xl: ${theme.radius.xl};
    --shadow-card: ${theme.shadow.card};
    --shadow-glow: ${theme.shadow.glow};
    --transition: ${theme.transition.standard};
    --spring: ${theme.transition.spring};
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    background: var(--bg-deep);
    color: var(--text-primary);
    line-height: ${theme.typography.lineHeight};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(56, 189, 248, 0.15);
    border-radius: 999px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(56, 189, 248, 0.3);
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
    font: inherit;
  }

  input,
  textarea,
  select {
    font: inherit;
    color: inherit;
  }
`;
