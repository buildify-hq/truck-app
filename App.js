import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import Dashboard from './src/screens/Dashboard';

const Tab = createBottomTabNavigator();

function DummyScreen({ name }) {
  return (
    <Text style={{ textAlign: 'center', marginTop: 50, fontSize: 20 }}>{name} चालू आहे!</Text>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: true }}>
        <Tab.Screen name="डॅशबोर्ड" component={Dashboard} />
        <Tab.Screen name="डिझेल">{() => <DummyScreen name="डिझेल" />}</Tab.Screen>
        <Tab.Screen name="कार्गो">{() => <DummyScreen name="कार्गो" />}</Tab.Screen>
        <Tab.Screen name="ड्रायव्हर">{() => <DummyScreen name="ड्रायव्हर" />}</Tab.Screen>
        <Tab.Screen name="अलर्ट">{() => <DummyScreen name="अलर्ट" />}</Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
