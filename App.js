import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'; 
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
import Files from './src/screens/Files';

const Tab = createBottomTabNavigator();

// 🚀 टॅब्सची नावे इंग्लिशमध्ये
const icons = { 
  'Dashboard': 'grid-outline', 'Diesel': 'speedometer-outline', 'Cargo': 'cube-outline', 
  'Drivers': 'person-outline', 'Expenses': 'wallet-outline', 'Servicing': 'construct-outline', 
  'Files': 'folder-outline', 'Alerts': 'notifications-outline' 
};

// 🚀 लॉगआउट फंक्शन
const handleLogout = () => {
  Alert.alert("Logout", "Are you sure you want to logout?", [
    { text: "Cancel", style: "cancel" },
    { text: "Logout", style: "destructive", onPress: () => signOut(auth) }
  ]);
};

function OwnerTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
        tabBarActiveTintColor: '#60A5FA', tabBarInactiveTintColor: '#64748B', 
        headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#fff',
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color="#F87171" />
          </TouchableOpacity>
        ),
        tabBarStyle: { backgroundColor: '#0F172A', borderTopWidth: 0, paddingBottom: insets.bottom > 0 ? insets.bottom + 5 : 12, paddingTop: 8, height: 65 + (insets.bottom > 0 ? insets.bottom : 12) },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '600', marginBottom: 5 }
      })}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Diesel" component={FuelEntry} />
      <Tab.Screen name="Cargo" component={Kargoship} />
      <Tab.Screen name="Drivers" component={Driver} />
      <Tab.Screen name="Expenses" component={Expenses} />
      <Tab.Screen name="Servicing" component={Maintenance} />
      <Tab.Screen name="Files" component={Files} />
      <Tab.Screen name="Alerts" component={Alerts} />
    </Tab.Navigator>
  );
}

function DriverTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={{
        tabBarActiveTintColor: '#F59E0B', tabBarInactiveTintColor: '#64748B', 
        headerStyle: { backgroundColor: '#0F172A' }, headerTintColor: '#fff',
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color="#F87171" />
          </TouchableOpacity>
        ),
        tabBarStyle: { backgroundColor: '#0F172A', borderTopWidth: 0, paddingBottom: insets.bottom > 0 ? insets.bottom + 5 : 12, paddingTop: 8, height: 65 + (insets.bottom > 0 ? insets.bottom : 12) },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 5 }
      }}>
      <Tab.Screen name="Diesel" component={FuelEntry} options={{ tabBarIcon: ({color, size}) => <Ionicons name="speedometer-outline" size={size} color={color} /> }} />
      {/* 🚀 कार्गो इथून काढून टाकलाय */}
      <Tab.Screen name="Files" component={Files} options={{ tabBarIcon: ({color, size}) => <Ionicons name="folder-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Servicing" component={Maintenance} options={{ tabBarIcon: ({color, size}) => <Ionicons name="construct-outline" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

function BlockedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', padding: 20 }}>
      <Ionicons name="lock-closed" size={80} color="#EF4444" />
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#F87171', marginTop: 20, textAlign: 'center' }}>Your Account is Blocked!</Text>
      <TouchableOpacity onPress={() => signOut(auth)} style={{ marginTop: 30, backgroundColor: '#EF4444', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
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
          if (docSnap.exists()) setUserData(docSnap.data()); else setUserData({ role: 'owner', isActive: true });
          setLoading(false);
        });
      } else { setUserData(null); setLoading(false); }
    });
    return () => { unsubscribeAuth(); if (unsubscribeDoc) unsubscribeDoc(); };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#94A3B8' }}>Loading...</Text>
      </View>
    );
  }

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
