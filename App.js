import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import Dashboard from './src/screens/Dashboard';
import FuelEntry from './src/screens/FuelEntry';
import Kargoship from './src/screens/Kargoship';
import Driver from './src/screens/Driver';
import Expenses from './src/screens/Expenses';
import Maintenance from './src/screens/Maintenance';
import Alerts from './src/screens/Alerts';

const Tab = createBottomTabNavigator();

const icons = {
  'डॅशबोर्ड': 'grid-outline',
  'डिझेल': 'speedometer-outline',
  'कार्गो': 'cube-outline',
  'ड्रायव्हर': 'person-outline',
  'खर्च': 'wallet-outline',
  'सर्व्हिसिंग': 'construct-outline',
  'अलर्ट': 'notifications-outline'
};

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
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
        tabBarStyle: { 
          paddingBottom: insets.bottom > 0 ? insets.bottom + 5 : 12, 
          paddingTop: 8,
          height: 65 + (insets.bottom > 0 ? insets.bottom : 12) 
        },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '600', marginBottom: 5 }
      })}
    >
      <Tab.Screen name="डॅशबोर्ड" component={Dashboard} />
      <Tab.Screen name="डिझेल" component={FuelEntry} />
      <Tab.Screen name="कार्गो" component={Kargoship} />
      <Tab.Screen name="ड्रायव्हर" component={Driver} />
      <Tab.Screen name="खर्च" component={Expenses} />
      <Tab.Screen name="सर्व्हिसिंग" component={Maintenance} />
      <Tab.Screen name="अलर्ट" component={Alerts} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
