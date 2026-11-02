import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, addEntry, deleteEntry, getActiveTruck } from '../storage';
import { Ionicons } from '@expo/vector-icons';

export default function Maintenance() {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('');
  const [list, setList] = useState([]);
  const [activeTruck, setActiveTruck] = useState('');

  const load = async () => {
    const truck = await getActiveTruck();
    setActiveTruck(truck);
    const data = await loadData('MAINTENANCE');
    const filtered = data.filter(item => item.truckId === truck || !item.truckId);
    setList(filtered);
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  const save = async () => {
    if (!name || !date) return Alert.alert('Error', 'Please enter work details and next due date');
    await addEntry('MAINTENANCE', { name, cost, date, entryDate: new Date().toLocaleDateString() });
    setName(''); setCost(''); setDate('');
    load();
    Alert.alert('Success', 'Maintenance record saved!');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View style={s.headerBox}>
          <Ionicons name="construct" size={24} color="#60A5FA" />
          <Text style={s.headerTxt}>Current Truck: <Text style={{color:'#F8FAFC', fontWeight:'bold'}}>{activeTruck}</Text></Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>Work Details (e.g. Oil Change, Tyre)</Text>
          <TextInput style={s.input} placeholder="e.g. Engine Oil Changed" placeholderTextColor="#64748B" value={name} onChangeText={setName} />
          
          <Text style={s.label}>Cost (₹) - Optional</Text>
          <TextInput style={s.input} placeholder="e.g. 2500" placeholderTextColor="#64748B" keyboardType="numeric" value={cost} onChangeText={setCost} />
          
          <Text style={s.label}>Next Due Date (YYYY-MM-DD)</Text>
          <TextInput style={s.input} placeholder="e.g. 2027-01-01" placeholderTextColor="#64748B" value={date} onChangeText={setDate} />
          
          <TouchableOpacity style={s.btn} onPress={save} activeOpacity={0.8}>
            <Text style={s.btnTxt}>Save Record</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>Maintenance History</Text>
        <FlatList 
          data={list} 
          keyExtractor={(i) => i.id} 
          scrollEnabled={false}
          ListEmptyComponent={<Text style={{ color: '#64748B', textAlign: 'center', marginTop: 10 }}>No maintenance records found.</Text>}
          renderItem={({ item }) => (
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowT}>{item.name}</Text>
                <Text style={s.rowD}>Next Due: {item.date} {item.cost ? `· Cost: ₹${item.cost}` : ''}</Text>
                <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Added on: {item.entryDate}</Text>
              </View>
              <TouchableOpacity onPress={async () => { await deleteEntry('MAINTENANCE', item.id); load(); }}>
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
  btn: { backgroundColor: '#0891B2', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 10 },
  row: { backgroundColor: '#1E293B', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  rowT: { fontWeight: 'bold', fontSize: 16, color: '#F8FAFC', textTransform: 'capitalize' },
  rowD: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
});
