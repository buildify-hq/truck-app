import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { loadData, addEntry, deleteEntry, getActiveTruck } from '../storage';
import { Ionicons } from '@expo/vector-icons';

export default function FuelEntry() {
  const [amount, setAmount] = useState('');
  const [liters, setLiters] = useState('');
  const [km, setKm] = useState('');
  const [photo, setPhoto] = useState(null);
  const [list, setList] = useState([]);
  const [activeTruck, setActiveTruck] = useState('');

  const load = async () => {
    const truck = await getActiveTruck();
    setActiveTruck(truck);
    const data = await loadData('FUEL');
    const filtered = data.filter(item => item.truckId === truck || !item.truckId);
    setList(filtered);
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  // 🚨 फ्युएल लो अलर्ट पाठवण्याचं फंक्शन
  const sendFuelLowAlert = async () => {
    try {
      await addDoc(collection(db, "fuelAlerts"), {
        truckId: activeTruck,
        time: new Date().toLocaleString(),
        timestamp: new Date()
      });
      if (Platform.OS === 'web') {
        window.alert('✅ अलर्ट पाठवला! मालकाच्या ॲपवर नोटिफिकेशन गेलंय.');
      } else {
        Alert.alert('✅ अलर्ट पाठवला', 'मालकाच्या ॲपवर नोटिफिकेशन गेलंय!');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const save = async () => {
    if (!amount || !liters) return Alert.alert('टीप', 'रक्कम आणि लिटर भरा');
    await addEntry('FUEL', { amount, liters, km, photo, date: new Date().toLocaleDateString() });
    setAmount(''); setLiters(''); setKm(''); setPhoto(null);
    load();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View style={s.headerBox}><Text style={s.headerTxt}>सध्याचा ट्रक: {activeTruck}</Text></View>

        {/* 🚨 ड्रायव्हरसाठी इमर्जन्सी बटन */}
        <TouchableOpacity style={s.alertBtn} onPress={sendFuelLowAlert}>
          <Ionicons name="warning" size={24} color="#fff" />
          <Text style={s.alertBtnTxt}>🚨 डिझेल संपत आलंय! (मालकाला कळवा)</Text>
        </TouchableOpacity>

        <View style={s.form}>
          <Text style={s.label}>डिझेलची रक्कम (₹)</Text>
          <TextInput style={s.input} placeholder="उदा. 5000" placeholderTextColor="#94a3b8" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          
          <Text style={s.label}>किती लिटर डिझेल भरलं?</Text>
          <TextInput style={s.input} placeholder="उदा. 50" placeholderTextColor="#94a3b8" keyboardType="numeric" value={liters} onChangeText={setLiters} />
          
          <Text style={s.label}>गाडीचं मीटर (KM)</Text>
          <TextInput style={s.input} placeholder="उदा. 150000" placeholderTextColor="#94a3b8" keyboardType="numeric" value={km} onChangeText={setKm} />

          <TouchableOpacity style={s.btn} onPress={save}><Text style={s.btnTxt}>सेव्ह करा</Text></TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  headerBox: { backgroundColor: '#e2e8f0', padding: 10, borderRadius: 8, marginBottom: 10 },
  headerTxt: { fontWeight: 'bold', color: '#334155', textAlign: 'center' },
  alertBtn: { backgroundColor: '#EF4444', padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 4, shadowColor: '#EF4444', shadowOpacity: 0.3, shadowRadius: 8 },
  alertBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  form: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 16, color: '#000', backgroundColor: '#f8fafc' },
  btn: { backgroundColor: '#e67e22', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
