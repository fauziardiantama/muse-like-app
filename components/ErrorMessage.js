import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { COLORS, FONTS } from '../theme';

/**
 * Reusable ErrorMessage component for displaying form and API errors consistently
 * across all screens (TokenScreen, QuickstartScreen, SettingsScreen).
 */
export default function ErrorMessage({ message, style, align }) {
  if (!message) return null;

  const isMultiline = typeof message === 'string' && message.includes('\n');
  const textAlign = align || (isMultiline ? 'left' : 'center');

  return (
    <Text
      style={[
        styles.errorText,
        { textAlign },
        isMultiline && styles.multiline,
        style,
      ]}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  multiline: {
    lineHeight: 20,
    paddingHorizontal: 24,
  },
});
