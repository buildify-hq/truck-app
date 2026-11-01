import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Dashboard from './src/screens/Dashboard';
import FuelEntry from './src/screens/FuelEntry';
import Kargoship from './src/screens/Kargoship';
import Driver from './src/screens/Driver';
import Alerts from './src/screens/Alerts';
import Expenses from './src/screens/Expenses';

const Tab = createBottomTabNavigator();

const icons = {
  'डॅशबोर्ड': 'grid-outline',
  'डिझेल': 'speedometer-outline',
  'कार्गो': 'cube-outline',
  'ड्रायव्हर': 'person-outline',
  'खर्च': 'wallet-outline',
  'अलर्ट': 'notifications-outline'
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={icons[route.name]} size={size} color={color} />
          ),
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#94A3B8',
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          tabBarStyle: { paddingBottom: 12, paddingTop: 8, height: 75 },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 5 }
        })}
      >
        <Tab.Screen name="डॅशबोर्ड" component={Dashboard} />
        <Tab.Screen name="डिझेल" component={FuelEntry} />
        <Tab.Screen name="कार्गो" component={Kargoship} />
        <Tab.Screen name="ड्रायव्हर" component={Driver} />
        <Tab.Screen name="खर्च" component={Expenses} />
        <Tab.Screen name="अलर्ट" component={Alerts} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
