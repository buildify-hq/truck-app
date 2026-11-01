import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

function DummyScreen({ name }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{name} स्क्रीन चालू आहे!</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ size }) => {
            const icons = { डॅशबोर्ड:'🏠', डिझेल:'⛽', कार्गो:'📦', ड्रायव्हर:'👨‍✈️', अलर्ट:'🔔' };
            return <Text style={{ fontSize: size }}>{icons[route.name]}</Text>;
          },
        })}
      >
        <Tab.Screen name="डॅशबोर्ड">{() => <DummyScreen name="डॅशबोर्ड" />}</Tab.Screen>
        <Tab.Screen name="डिझेल">{() => <DummyScreen name="डिझेल" />}</Tab.Screen>
        <Tab.Screen name="कार्गो">{() => <DummyScreen name="कार्गो" />}</Tab.Screen>
        <Tab.Screen name="ड्रायव्हर">{() => <DummyScreen name="ड्रायव्हर" />}</Tab.Screen>
        <Tab.Screen name="अलर्ट">{() => <DummyScreen name="अलर्ट" />}</Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 20, fontWeight: 'bold' }
});
