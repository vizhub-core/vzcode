// Modern color palette for VZCode interface improvements
// Based on popular modern code editors like VS Code, Cursor, etc.

// Base colors - sophisticated dark theme
export const modernColors = {
  // Background colors
  bg: {
    primary: '#1e1e1e', // Main background
    secondary: '#252526', // Secondary panels
    tertiary: '#2d2d30', // Elevated surfaces
    elevated: '#383838', // Hover states
    overlay: '#3c3c3c', // Modals, dropdowns
  },

  // Text colors
  text: {
    primary: '#cccccc', // Main text
    secondary: '#9d9d9d', // Secondary text
    muted: '#6a6a6a', // Muted text
    accent: '#569cd6', // Accent text
    success: '#4ec9b0', // Success states
    warning: '#dcdcaa', // Warning states
    error: '#f44747', // Error states
  },

  // Border colors
  border: {
    primary: '#3e3e42', // Main borders
    secondary: '#464647', // Secondary borders
    focus: '#007acc', // Focus states
    hover: '#505050', // Hover borders
  },

  // Interactive colors
  interactive: {
    primary: '#0e639c', // Primary buttons
    primaryHover: '#1177bb', // Primary button hover
    secondary: '#3c3c3c', // Secondary buttons
    secondaryHover: '#464647', // Secondary button hover
    accent: '#007acc', // Accent elements
    accentHover: '#1e8ad6', // Accent hover
  },

  // Status colors
  status: {
    connected: '#4ec9b0', // Connected state
    pending: '#dcdcaa', // Pending/loading state
    disconnected: '#f44747', // Disconnected state
    saved: '#4ec9b0', // Saved state
  },

  // Syntax highlighting colors (enhanced)
  syntax: {
    keyword: '#569cd6', // Keywords
    string: '#ce9178', // Strings
    number: '#b5cea8', // Numbers
    comment: '#6a9955', // Comments
    function: '#dcdcaa', // Functions
    variable: '#9cdcfe', // Variables
    type: '#4ec9b0', // Types
    operator: '#d4d4d4', // Operators
    bracket: '#ffd700', // Brackets
  },

  // File tree colors
  fileTree: {
    file: '#cccccc', // File names
    folder: '#cccccc', // Folder names
    active: '#007acc', // Active file
    hover: 'rgba(255, 255, 255, 0.1)', // Hover state
    modified: '#e2c08d', // Modified files
    new: '#73c991', // New files
  },

  // Tab colors
  tab: {
    active: '#1e1e1e', // Active tab
    inactive: '#2d2d30', // Inactive tabs
    hover: '#383838', // Tab hover
    border: '#3e3e42', // Tab borders
    close: '#cccccc', // Close button
    closeHover: '#f44747', // Close button hover
  },

  // Sidebar colors
  sidebar: {
    background: '#252526', // Sidebar background
    iconBar: '#333333', // Icon bar background
    icon: '#cccccc', // Icons
    iconActive: '#007acc', // Active icons
    iconHover: '#ffffff', // Icon hover
    separator: '#3e3e42', // Separators
  },
};

// CSS custom properties for the modern theme
export const modernCSSVariables = {
  // Background
  '--vz-bg-primary': modernColors.bg.primary,
  '--vz-bg-secondary': modernColors.bg.secondary,
  '--vz-bg-tertiary': modernColors.bg.tertiary,
  '--vz-bg-elevated': modernColors.bg.elevated,
  '--vz-bg-overlay': modernColors.bg.overlay,

  // Text
  '--vz-text-primary': modernColors.text.primary,
  '--vz-text-secondary': modernColors.text.secondary,
  '--vz-text-muted': modernColors.text.muted,
  '--vz-text-accent': modernColors.text.accent,
  '--vz-text-success': modernColors.text.success,
  '--vz-text-warning': modernColors.text.warning,
  '--vz-text-error': modernColors.text.error,

  // Border
  '--vz-border-primary': modernColors.border.primary,
  '--vz-border-secondary': modernColors.border.secondary,
  '--vz-border-focus': modernColors.border.focus,
  '--vz-border-hover': modernColors.border.hover,

  // Interactive
  '--vz-interactive-primary':
    modernColors.interactive.primary,
  '--vz-interactive-primary-hover':
    modernColors.interactive.primaryHover,
  '--vz-interactive-secondary':
    modernColors.interactive.secondary,
  '--vz-interactive-secondary-hover':
    modernColors.interactive.secondaryHover,
  '--vz-interactive-accent':
    modernColors.interactive.accent,
  '--vz-interactive-accent-hover':
    modernColors.interactive.accentHover,

  // Status
  '--vz-status-connected': modernColors.status.connected,
  '--vz-status-pending': modernColors.status.pending,
  '--vz-status-disconnected':
    modernColors.status.disconnected,
  '--vz-status-saved': modernColors.status.saved,

  // File tree
  '--vz-filetree-file': modernColors.fileTree.file,
  '--vz-filetree-folder': modernColors.fileTree.folder,
  '--vz-filetree-active': modernColors.fileTree.active,
  '--vz-filetree-hover': modernColors.fileTree.hover,
  '--vz-filetree-modified': modernColors.fileTree.modified,
  '--vz-filetree-new': modernColors.fileTree.new,

  // Tab
  '--vz-tab-active': modernColors.tab.active,
  '--vz-tab-inactive': modernColors.tab.inactive,
  '--vz-tab-hover': modernColors.tab.hover,
  '--vz-tab-border': modernColors.tab.border,
  '--vz-tab-close': modernColors.tab.close,
  '--vz-tab-close-hover': modernColors.tab.closeHover,

  // Sidebar
  '--vz-sidebar-bg': modernColors.sidebar.background,
  '--vz-sidebar-iconbar': modernColors.sidebar.iconBar,
  '--vz-sidebar-icon': modernColors.sidebar.icon,
  '--vz-sidebar-icon-active':
    modernColors.sidebar.iconActive,
  '--vz-sidebar-icon-hover': modernColors.sidebar.iconHover,
  '--vz-sidebar-separator': modernColors.sidebar.separator,

  // Typography
  '--vz-font-family-mono':
    '"JetBrains Mono", "Fira Code", "Source Code Pro", Consolas, monospace',
  '--vz-font-family-ui':
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  '--vz-font-size-xs': '11px',
  '--vz-font-size-sm': '12px',
  '--vz-font-size-base': '13px',
  '--vz-font-size-md': '14px',
  '--vz-font-size-lg': '16px',

  // Spacing
  '--vz-spacing-xs': '4px',
  '--vz-spacing-sm': '8px',
  '--vz-spacing-md': '12px',
  '--vz-spacing-lg': '16px',
  '--vz-spacing-xl': '24px',
  '--vz-spacing-2xl': '32px',

  // Border radius
  '--vz-radius-sm': '3px',
  '--vz-radius-md': '6px',
  '--vz-radius-lg': '8px',
  '--vz-radius-xl': '12px',

  // Shadows
  '--vz-shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
  '--vz-shadow-md': '0 2px 4px rgba(0, 0, 0, 0.4)',
  '--vz-shadow-lg': '0 4px 8px rgba(0, 0, 0, 0.5)',

  // Transitions
  '--vz-transition-fast': '0.15s ease',
  '--vz-transition-base': '0.2s ease',
  '--vz-transition-slow': '0.3s ease',
};
