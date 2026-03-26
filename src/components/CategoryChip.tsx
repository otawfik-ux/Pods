import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CategoryColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
}

export default function CategoryChip({ label, selected = false, onPress, small = false }: Props) {
  const { colors, isDark } = useTheme();
  const categoryColor = CategoryColors[label] ?? colors.primary;
  const bgColor = selected ? categoryColor : (isDark ? 'rgba(108,99,255,0.12)' : '#F0EFFF');
  const textColor = selected ? '#FFFFFF' : categoryColor;

  return (
    <TouchableOpacity
      style={[styles.chip, { backgroundColor: bgColor }, small && styles.small]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.text, { color: textColor }, small && styles.smallText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  small: { paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  text: { fontWeight: '600', fontSize: 13 },
  smallText: { fontSize: 11 },
});
