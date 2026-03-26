import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from '../types';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import ActivityDetailScreen from '../screens/discover/ActivityDetailScreen';
import CreateActivityScreen from '../screens/discover/CreateActivityScreen';
import JoinRequestsScreen from '../screens/host/JoinRequestsScreen';
import PodDiscoveryScreen from '../screens/pods/PodDiscoveryScreen';
import PodDetailScreen from '../screens/pods/PodDetailScreen';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverFeed" component={DiscoverScreen} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
      <Stack.Screen name="CreateActivity" component={CreateActivityScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="JoinRequests" component={JoinRequestsScreen} />
      <Stack.Screen name="PodDiscovery" component={PodDiscoveryScreen} />
      <Stack.Screen name="PodDetail" component={PodDetailScreen} />
    </Stack.Navigator>
  );
}
