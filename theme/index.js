// Shared Design Tokens and Theme constants
export const COLORS = {
  background: '#000000',
  surface: '#121212',
  card: '#1c1c1e',
  elevated: '#262626',
  border: '#333333',
  borderLight: '#444444',
  text: '#ffffff',
  textMuted: '#8e8e93',
  textDim: '#666666',
  error: '#ff4d4f',
  errorBackground: 'rgba(255, 77, 79, 0.1)',
  success: '#10b981',
  primary: '#ffffff',
  accent: '#f9a8d4',
};

export const FONTS = {
  regular: 'OptimisticApp',
  bold: 'OptimisticApp-Bold',
};

export const COMMON_STYLES = {
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginVertical: 8,
  },
};
