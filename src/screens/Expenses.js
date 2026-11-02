import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, addEntry, deleteEntry, getActiveTruck } from '../storage';
import { Ionicons } from '@expo/vector-icons';

export default function Expenses() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [list, setList] = useState([]);
  const [activeTruck, setActiveTruck] = useState('');

  const load = async () => {
    const truck = await getActiveTruck();
    setActiveTruck(truck);
    const data = await loadData('EXPENSES');
    const filtered = data.filter(item => item.truckId === truck || !item.truckId);
    setList(filtered);
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  const save = async () => {
    if (!name || !amount) return Alert.alert('Error', 'Please enter expense name and amount');
    await addEntry('EXPENSES', { name, amount, date: new Date().toLocaleDateString() });
    setName(''); setAmount('');
    load();
    Alert.alert('Success', 'Expense added!');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View style={s.headerBox}>
          <Ionicons name="wallet" size={24} color="#60A5FA" />
          <Text style={s.headerTxt}>Current Truck: <Text style={{color:'#F8FAFC', fontWeight:'bold'}}>{activeTruck}</Text></Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>Expense Name (e.g. Tyre, Toll, Repair)</Text>
          <TextInput style={s.input} placeholder="e.g. Tyre Puncture" placeholderTextColor="#64748B" value={name} onChangeText={setName} />
          
          <Text style={s.label}>Amount (₹)</Text>
          <TextInput style={s.input} placeholder="e.g. 500" placeholderTextColor="#64748B" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          
          <TouchableOpacity style={s.btn} onPress={save} activeOpacity={0.8}>
            <Text style={s.btnTxt}>Save Expense</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>Expense History</Text>
        <FlatList 
          data={list} 
          keyExtractor={(i) => i.id} 
          scrollEnabled={false}
          ListEmptyComponent={<Text style={{ color: '#64748B', textAlign: 'center', marginTop: 10 }}>No expenses added yet.</Text>}
          renderItem={({ item }) => (
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowT}>{item.name}</Text>
                <Text style={s.rowD}>{item.date}</Text>
              </View>
              <Text style={s.rowAmt}>₹{item.amount}</Text>
              <TouchableOpacity onPress={async () => { await deleteEntry('EXPENSES', item.id); load(); }}>
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
  btn: { backgroundColor: '#EF4444', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 10 },
  row: { backgroundColor: '#1E293B', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  rowT: { fontWeight: 'bold', fontSize: 16, color: '#F8FAFC', textTransform: 'capitalize' },
  rowD: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  rowAmt: { fontWeight: 'bold', fontSize: 16, color: '#F87171', marginRight: 15 },
});
