import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, addEntry, deleteEntry } from '../storage';

export default function Expenses() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [list, setList] = useState([]);

  const load = async () => setList(await loadData('EXPENSES'));
  useFocusEffect(useCallback(() => { load(); }, []));

  const save = async () => {
    if (!name || !amount) return Alert.alert('टीप', 'खर्चाचं नाव आणि रक्कम भरा');
    await addEntry('EXPENSES', { name, amount, date: new Date().toLocaleDateString() });
    setName(''); setAmount('');
    load();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.form}>
          <Text style={s.label}>खर्चाचं नाव (उदा. टायर, टोल, सर्व्हिसिंग)</Text>
          <TextInput style={s.input} placeholder="उदा. टायर पंक्चर" placeholderTextColor="#94a3b8" value={name} onChangeText={setName} />
          <Text style={s.label}>खर्चाची रक्कम (₹)</Text>
          <TextInput style={s.input} placeholder="उदा. 500" placeholderTextColor="#94a3b8" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          <TouchableOpacity style={s.btn} onPress={save}><Text style={s.btnTxt}>सेव्ह करा</Text></TouchableOpacity>
        </View>
        
        <FlatList data={list} keyExtractor={(i) => i.id} scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowT}>{item.name}</Text>
                <Text style={s.rowD}>{item.date}</Text>
              </View>
              <Text style={s.rowAmt}>₹{item.amount}</Text>
              <TouchableOpacity onPress={async () => setList(await deleteEntry('EXPENSES', item.id))}>
                <Text style={s.del}>काढा</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  form: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 16, color: '#000', backgroundColor: '#f8fafc' },
  btn: { backgroundColor: '#9333EA', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  row: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  rowT: { fontWeight: 'bold', fontSize: 15, color: '#1e293b' },
  rowD: { fontSize: 13, color: '#64748b', marginTop: 2 },
  rowAmt: { fontWeight: 'bold', fontSize: 15, color: '#9333EA', marginRight: 15 },
  del: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
});
