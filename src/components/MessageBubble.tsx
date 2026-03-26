import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import { useTheme } from '../context/ThemeContext';
import AvatarInitials from './AvatarInitials';

interface Props {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: Props) {
  const { colors } = useTheme();
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.container, isOwn && styles.containerOwn]}>
      {!isOwn && <AvatarInitials name={message.senderName} size={30} />}
      <View style={styles.bubbleWrapper}>
        {!isOwn && <Text style={[styles.senderName, { color: colors.subtext }]}>{message.senderName}</Text>}
        <View style={[
          styles.bubble,
          isOwn
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.elevatedCard, borderWidth: 1, borderColor: colors.border },
        ]}>
          <Text style={[styles.messageText, { color: isOwn ? '#FFFFFF' : colors.text }]}>
            {message.message}
          </Text>
        </View>
        <Text style={[styles.time, { color: colors.subtext }, isOwn && styles.timeOwn]}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginVertical: 4, marginHorizontal: 16, alignItems: 'flex-end' },
  containerOwn: { flexDirection: 'row-reverse' },
  bubbleWrapper: { maxWidth: '75%', marginHorizontal: 8 },
  senderName: { fontSize: 11, marginBottom: 3, marginLeft: 4 },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  messageText: { fontSize: 15, lineHeight: 20 },
  time: { fontSize: 10, marginTop: 3, marginLeft: 4 },
  timeOwn: { textAlign: 'right', marginRight: 4 },
});
