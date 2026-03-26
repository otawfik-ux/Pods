import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PodsStackParamList } from '../types';
import MyPodsScreen from '../screens/pods/MyPodsScreen';
import PodDiscoveryScreen from '../screens/pods/PodDiscoveryScreen';
import CreatePodScreen from '../screens/pods/CreatePodScreen';
import PodDetailScreen from '../screens/pods/PodDetailScreen';
import CreateActivityScreen from '../screens/discover/CreateActivityScreen';
import ActivityDetailScreen from '../screens/discover/ActivityDetailScreen';
import JoinRequestsScreen from '../screens/host/JoinRequestsScreen';

const Stack = createNativeStackNavigator<PodsStackParamList>();

export default function PodsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyPods" component={MyPodsScreen} />
      <Stack.Screen name="PodDiscovery" component={PodDiscoveryScreen} />
      <Stack.Screen name="CreatePod" component={CreatePodScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="PodDetail" component={PodDetailScreen} />
      <Stack.Screen name="CreateActivity" component={CreateActivityScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
      <Stack.Screen name="JoinRequests" component={JoinRequestsScreen} />
    </Stack.Navigator>
  );
}
