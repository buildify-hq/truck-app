import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './src/firebase';

import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import FuelEntry from './src/screens/FuelEntry';
import Kargoship from './src/screens/Kargoship';
import Driver from './src/screens/Driver';
import Expenses from './src/screens/Expenses';
import Maintenance from './src/screens/Maintenance';
import Alerts from './src/screens/Alerts';
import SuperAdmin from './src/screens/SuperAdmin';

const Tab = createBottomTabNavigator();

const icons = {
  'डॅशबोर्ड': 'grid-outline', 'डिझेल': 'speedometer-outline', 'कार्गो': 'cube-outline',
  'ड्रायव्हर': 'person-outline', 'खर्च': 'wallet-outline', 'सर्व्हिसिंग': 'construct-outline', 'अलर्ट': 'notifications-outline'
};

function OwnerTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
        tabBarActiveTintColor: '#2563EB', tabBarInactiveTintColor: '#94A3B8',
        headerStyle: { backgroundColor: '#1E293B' }, headerTintColor: '#fff',
        tabBarStyle: { paddingBottom: insets.bottom > 0 ? insets.bottom + 5 : 12, paddingTop: 8, height: 65 + (insets.bottom > 0 ? insets.bottom : 12) },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '600', marginBottom: 5 }
      })}>
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

function DriverTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={{
        tabBarActiveTintColor: '#e67e22', tabBarInactiveTintColor: '#94A3B8',
        headerStyle: { backgroundColor: '#1E293B' }, headerTintColor: '#fff',
        tabBarStyle: { paddingBottom: insets.bottom > 0 ? insets.bottom + 5 : 12, paddingTop: 8, height: 65 + (insets.bottom > 0 ? insets.bottom : 12) },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 5 }
      }}>
      <Tab.Screen name="डिझेल एंट्री" component={FuelEntry} options={{ tabBarIcon: ({color, size}) => <Ionicons name="speedometer-outline" size={size} color={color} /> }} />
      <Tab.Screen name="कार्गो स्लिप" component={Kargoship} options={{ tabBarIcon: ({color, size}) => <Ionicons name="cube-outline" size={size} color={color} /> }} />
      <Tab.Screen name="सर्व्हिसिंग" component={Maintenance} options={{ tabBarIcon: ({color, size}) => <Ionicons name="construct-outline" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

function BlockedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 20 }}>
      <Ionicons name="lock-closed" size={80} color="#EF4444" />
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#991B1B', marginTop: 20, textAlign: 'center' }}>तुमचं खातं ब्लॉक झालं आहे!</Text>
      <Text style={{ color: '#7F1D1D', marginTop: 10, textAlign: 'center' }}>कृपया सुपर अॅडमिनशी संपर्क साधा.</Text>
      <TouchableOpacity onPress={() => signOut(auth)} style={{ marginTop: 30, backgroundColor: '#EF4444', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>लॉगआउट करा</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc;
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        unsubscribeDoc = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) setUserData(docSnap.data());
          else setUserData({ role: 'owner', isActive: true });
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });
    return () => { unsubscribeAuth(); if (unsubscribeDoc) unsubscribeDoc(); };
  }, []);

  if (loading) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? (
          userData?.role === 'superadmin' ? <SuperAdmin /> :
          userData?.isActive === false ? <BlockedScreen /> :
          userData?.role === 'driver' ? <DriverTabs /> : <OwnerTabs />
        ) : ( <Login /> )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
