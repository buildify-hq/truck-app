import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import Dashboard from './src/screens/Dashboard';
import FuelEntry from './src/screens/FuelEntry';
import Kargoship from './src/screens/Kargoship';
import Driver from './src/screens/Driver';
import Alerts from './src/screens/Alerts';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ size }) => {
            const icons = { डशतबोर्ड:'🏠', डिजेल:'⚽', कार्गो:'📦', ड्रायव्हर:'👨‍✈️', अलर्ट:'🔊' };
            return <Text style={{ fontSize: size }}>{icons[route.name]}</Text>;
          },
          tabBarActiveTintColor: '#e67e22',
          headerStyle: { backgroundColor: '#2c3e50' },
          headerTintColor: '#fff',
          tabBarLabelStyle: { fontSize: 10 },
        })}
      >
        <Tab.Screen name="डाऴ्शभ्ड़" component={Dashboard} />
        <Tab.Screen name="ऑिजेल" component={FuelEntry} />
        <Tab.Screen name="कार्गो" component={Kargoship} />
        <Tab.Screen name="ड्रायव्हर" component={Driver} />
        <Tab.Screen name="अलर्ट" component={Alerts} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
