import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { loadData, addEntry, deleteEntry, getActiveTruck } from '../storage';
import { Ionicons } from '@expo/vector-icons';

export default function Kargoship() {
  const [slip, setSlip] = useState('');
  const [amount, setAmount] = useState('');
  const [commission, setCommission] = useState('');
  const [pending, setPending] = useState('');
  const [photo, setPhoto] = useState(null);
  const [list, setList] = useState([]);
  const [activeTruck, setActiveTruck] = useState('');

  const load = async () => {
    const truck = await getActiveTruck();
    setActiveTruck(truck);
    const data = await loadData('KARGO');
    const filtered = data.filter(item => item.truckId === truck || !item.truckId);
    setList(filtered);
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  const pickFromCamera = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ quality: 0.5 });
      if (!res.canceled) setPhoto(res.assets[0].uri);
    } catch (e) { Alert.alert('Error', 'Could not open camera'); }
  };

  const pickFromGallery = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5, mediaTypes: ImagePicker.MediaTypeOptions.Images });
      if (!res.canceled) setPhoto(res.assets[0].uri);
    } catch (e) { Alert.alert('Error', 'Could not open gallery'); }
  };

  const save = async () => {
    if (!slip || !amount) return Alert.alert('Error', 'Please enter Slip No. and Amount');
    await addEntry('KARGO', { slip, amount, commission, pending, photo, date: new Date().toLocaleDateString() });
    setSlip(''); setAmount(''); setCommission(''); setPending(''); setPhoto(null);
    load();
    Alert.alert('Success', 'Cargo entry saved!');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View style={s.headerBox}>
          <Ionicons name="cube" size={24} color="#60A5FA" />
          <Text style={s.headerTxt}>Current Truck: <Text style={{color:'#F8FAFC', fontWeight:'bold'}}>{activeTruck}</Text></Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>Slip Number</Text>
          <TextInput style={s.input} placeholder="e.g. 1024" placeholderTextColor="#64748B" value={slip} onChangeText={setSlip} keyboardType="numeric" />
          
          <Text style={s.label}>Total Cargo Amount (₹)</Text>
          <TextInput style={s.input} placeholder="e.g. 15000" placeholderTextColor="#64748B" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          
          <Text style={s.label}>Commission Cut (₹)</Text>
          <TextInput style={s.input} placeholder="e.g. 500" placeholderTextColor="#64748B" keyboardType="numeric" value={commission} onChangeText={setCommission} />
          
          <Text style={s.label}>Pending Amount (₹)</Text>
          <TextInput style={s.input} placeholder="e.g. 2000" placeholderTextColor="#64748B" keyboardType="numeric" value={pending} onChangeText={setPending} />
          
          {/* 🚀 फोटोसाठी दोन पर्याय */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
            <TouchableOpacity style={[s.photoBtn, {flex: 1, marginRight: 5}]} onPress={pickFromCamera}>
              <Ionicons name="camera-outline" size={20} color="#60A5FA" />
              <Text style={s.photoTxt}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.photoBtn, {flex: 1, marginLeft: 5}]} onPress={pickFromGallery}>
              <Ionicons name="image-outline" size={20} color="#60A5FA" />
              <Text style={s.photoTxt}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {photo && <Image source={{ uri: photo }} style={s.img} />}

          <TouchableOpacity style={s.btn} onPress={save} activeOpacity={0.8}>
            <Text style={s.btnTxt}>Save Entry</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>Cargo History</Text>
        <FlatList 
          data={list} 
          keyExtractor={(i) => i.id} 
          scrollEnabled={false}
          ListEmptyComponent={<Text style={{ color: '#64748B', textAlign: 'center', marginTop: 10 }}>No cargo entries yet.</Text>}
          renderItem={({ item }) => (
            <View style={s.row}>
              {item.photo && <Image source={{ uri: item.photo }} style={s.thumb} />}
              <View style={{ flex: 1, marginLeft: item.photo ? 10 : 0 }}>
                <Text style={s.rowT}>Slip #{item.slip} · ₹{item.amount}</Text>
                <Text style={s.rowD}>Comm ₹{item.commission || 0} · Pend ₹{item.pending || 0}</Text>
                <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{item.date}</Text>
              </View>
              <TouchableOpacity onPress={async () => { await deleteEntry('KARGO', item.id); load(); }}>
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
  form: { backgroundColor: '#1E293B', padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#CBD5E1', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 15, fontSize: 16, color: '#F8FAFC', backgroundColor: '#0F172A' },
  
  photoBtn: { borderWidth: 1, borderColor: '#3B82F6', borderStyle: 'dashed', padding: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#1E3A8A', flexDirection: 'row', justifyContent: 'center' },
  photoTxt: { color: '#60A5FA', fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
  img: { width: '100%', height: 150, borderRadius: 12, marginTop: 12 },
  
  btn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 10 },
  row: { backgroundColor: '#1E293B', padding: 12, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  thumb: { width: 50, height: 50, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  rowT: { fontWeight: 'bold', fontSize: 15, color: '#F8FAFC' },
  rowD: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
});
