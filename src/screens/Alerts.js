import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, addEntry, deleteEntry, getActiveTruck } from '../storage';
import { Ionicons } from '@expo/vector-icons';

export default function Alerts() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [list, setList] = useState([]);
  const [activeTruck, setActiveTruck] = useState('');

  const load = async () => {
    const truck = await getActiveTruck();
    setActiveTruck(truck);
    const data = await loadData('ALERTS');
    const filtered = data.filter(item => item.truckId === truck || !item.truckId);
    setList(filtered);
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  const save = async () => {
    if (!name || !date) return Alert.alert('Error', 'Please enter document name and expiry date');
    await addEntry('ALERTS', { name, date, entryDate: new Date().toLocaleDateString() });
    setName(''); setDate('');
    load();
    Alert.alert('Success', 'Reminder set successfully!');
  };

  const daysLeft = (d) => Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View style={s.headerBox}>
          <Ionicons name="notifications" size={24} color="#60A5FA" />
          <Text style={s.headerTxt}>Current Truck: <Text style={{color:'#F8FAFC', fontWeight:'bold'}}>{activeTruck}</Text></Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>Document Name (e.g. Insurance, PUC)</Text>
          <TextInput style={s.input} placeholder="e.g. Truck Insurance" placeholderTextColor="#64748B" value={name} onChangeText={setName} />
          
          <Text style={s.label}>Expiry Date (YYYY-MM-DD)</Text>
          <TextInput style={s.input} placeholder="e.g. 2026-12-31" placeholderTextColor="#64748B" value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" />
          
          <TouchableOpacity style={s.btn} onPress={save} activeOpacity={0.8}>
            <Text style={s.btnTxt}>Set Reminder</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>Reminders</Text>
        <FlatList 
          data={list} 
          keyExtractor={(i) => i.id} 
          scrollEnabled={false}
          ListEmptyComponent={<Text style={{ color: '#64748B', textAlign: 'center', marginTop: 10 }}>No reminders set yet.</Text>}
          renderItem={({ item }) => {
            const d = daysLeft(item.date);
            const color = d < 0 ? '#EF4444' : d <= 15 ? '#F59E0B' : '#10B981';
            const msg = d < 0 ? '❌ Expired!' : d <= 15 ? `⚠️ Expiring in ${d} days!` : `✅ ${d} days left`;
            
            return (
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowT}>{item.name}</Text>
                  <Text style={s.rowD}>Expiry: {item.date}</Text>
                  <View style={{ backgroundColor: color + '20', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6 }}>
                    <Text style={{ color, fontWeight: 'bold', fontSize: 12 }}>{msg}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={async () => { await deleteEntry('ALERTS', item.id); load(); }} style={{ padding: 5 }}>
                  <Ionicons name="trash-outline" size={22} color="#EF4444" />
                </TouchableOpacity>
              </View>
            );
          }}
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
  btn: { backgroundColor: '#8E44AD', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 10 },
  row: { backgroundColor: '#1E293B', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  rowT: { fontWeight: 'bold', fontSize: 16, color: '#F8FAFC', textTransform: 'capitalize' },
  rowD: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
});
