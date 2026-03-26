export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  elevatedCard: string;
  text: string;
  subtext: string;
  border: string;
  danger: string;
  success: string;
  warning: string;
  white: string;
  black: string;
  shadow: string;
  inputBackground: string;
  primaryGlow: string;
  tabBarBackground: string;
  tabBarInactive: string;
}

export const lightTheme: ThemeColors = {
  primary: '#6C63FF',
  background: '#F8F9FA',
  card: '#FFFFFF',
  elevatedCard: '#FFFFFF',
  text: '#1A1A2E',
  subtext: '#666680',
  border: '#E5E7EB',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(0,0,0,0.08)',
  inputBackground: '#FFFFFF',
  primaryGlow: 'rgba(108, 99, 255, 0.1)',
  tabBarBackground: '#FFFFFF',
  tabBarInactive: '#6B7280',
};

export const darkTheme: ThemeColors = {
  primary: '#6C63FF',
  background: '#0D0D0D',
  card: '#161616',
  elevatedCard: '#1E1E1E',
  text: '#F0F0F0',
  subtext: '#888899',
  border: '#2A2A2A',
  danger: '#FF4D6A',
  success: '#00C896',
  warning: '#F5A623',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(0,0,0,0.5)',
  inputBackground: '#1A1A1A',
  primaryGlow: 'rgba(108, 99, 255, 0.15)',
  tabBarBackground: '#111111',
  tabBarInactive: '#555566',
};

// Static — not theme-dependent
export const CategoryColors: Record<string, string> = {
  Study: '#4A90D9',
  Sports: '#F5A623',
  Social: '#7ED321',
  Food: '#D0021B',
  Gym: '#9013FE',
  Other: '#8B9197',
  Gaming: '#FF6B6B',
};

export const PodBannerColors = [
  '#6C63FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
];
