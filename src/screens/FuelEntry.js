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

  // 🚀 फोटो काढण्याचं फंक्शन
  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ quality: 0.5 });
      if (!res.canceled) setPhoto(res.assets[0].uri);
    } catch (e) { Alert.alert('Error', 'Could not open camera'); }
  };

  // 🚨 फ्युएल लो अलर्ट पाठवण्याचं फंक्शन
  const sendFuelLowAlert = async () => {
    try {
      await addDoc(collection(db, "fuelAlerts"), {
        truckId: activeTruck,
        time: new Date().toLocaleString(),
        timestamp: new Date()
      });
      Alert.alert('✅ Alert Sent', 'Owner has been notified on the dashboard!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const save = async () => {
    if (!amount || !liters) return Alert.alert('Error', 'Please enter amount and liters');
    await addEntry('FUEL', { amount, liters, km, photo, date: new Date().toLocaleDateString() });
    setAmount(''); setLiters(''); setKm(''); setPhoto(null);
    load();
    Alert.alert('Success', 'Fuel entry saved!');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View style={s.headerBox}>
          <Ionicons name="bus" size={24} color="#60A5FA" />
          <Text style={s.headerTxt}>Current Truck: <Text style={{color:'#F8FAFC', fontWeight:'bold'}}>{activeTruck}</Text></Text>
        </View>

        {/* 🚨 इमर्जन्सी बटन */}
        <TouchableOpacity style={s.alertBtn} onPress={sendFuelLowAlert} activeOpacity={0.8}>
          <Ionicons name="warning" size={24} color="#fff" />
          <Text style={s.alertBtnTxt}>🚨 Diesel is Low! (Alert Owner)</Text>
        </TouchableOpacity>

        <View style={s.form}>
          <Text style={s.label}>Fuel Amount (₹)</Text>
          <TextInput style={s.input} placeholder="e.g. 5000" placeholderTextColor="#64748B" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          
          <Text style={s.label}>Liters Filled</Text>
          <TextInput style={s.input} placeholder="e.g. 50" placeholderTextColor="#64748B" keyboardType="numeric" value={liters} onChangeText={setLiters} />
          
          <Text style={s.label}>Vehicle Meter (KM)</Text>
          <TextInput style={s.input} placeholder="e.g. 150000" placeholderTextColor="#64748B" keyboardType="numeric" value={km} onChangeText={setKm} />

          {/* 🚀 फोटो काढण्याचं बटन */}
          <TouchableOpacity style={s.photoBtn} onPress={pickImage} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={20} color="#60A5FA" />
            <Text style={s.photoTxt}>{photo ? 'Change Receipt Photo' : 'Capture Receipt Photo'}</Text>
          </TouchableOpacity>
          {photo && <Image source={{ uri: photo }} style={s.img} />}

          <TouchableOpacity style={s.btn} onPress={save} activeOpacity={0.8}>
            <Text style={s.btnTxt}>Save Entry</Text>
          </TouchableOpacity>
        </View>

        {/* 🚀 जुन्या एंट्रीजची यादी */}
        <Text style={s.sectionTitle}>Fuel History</Text>
        <FlatList 
          data={list} 
          keyExtractor={(i) => i.id} 
          scrollEnabled={false}
          ListEmptyComponent={<Text style={{ color: '#64748B', textAlign: 'center', marginTop: 10 }}>No fuel entries yet.</Text>}
          renderItem={({ item }) => (
            <View style={s.row}>
              {item.photo && <Image source={{ uri: item.photo }} style={s.thumb} />}
              <View style={{ flex: 1, marginLeft: item.photo ? 10 : 0 }}>
                <Text style={s.rowT}>₹{item.amount} · {item.liters}L</Text>
                <Text style={s.rowD}>{item.date} {item.km ? `· ${item.km} KM` : ''}</Text>
              </View>
              <TouchableOpacity onPress={async () => { await deleteEntry('FUEL', item.id); load(); }}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, padding: 16 },
  headerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  headerTxt: { marginLeft: 10, fontSize: 15, color: '#94A3B8', fontWeight: '500' },
  
  alertBtn: { backgroundColor: '#EF4444', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 4 },
  alertBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  
  form: { backgroundColor: '#1E293B', padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#CBD5E1', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 15, fontSize: 16, color: '#F8FAFC', backgroundColor: '#0F172A' },
  
  photoBtn: { borderWidth: 1, borderColor: '#3B82F6', borderStyle: 'dashed', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 15, backgroundColor: '#1E3A8A', flexDirection: 'row', justifyContent: 'center' },
  photoTxt: { color: '#60A5FA', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  img: { width: '100%', height: 120, borderRadius: 12, marginTop: 10 },
  
  btn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 10 },
  row: { backgroundColor: '#1E293B', padding: 12, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  thumb: { width: 45, height: 45, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  rowT: { fontWeight: 'bold', fontSize: 15, color: '#F8FAFC' },
  rowD: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
});
