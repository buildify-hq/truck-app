import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, addEntry, deleteEntry } from '../storage';

export default function Driver() {
  const [type, setType] = useState('पगार');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [list, setList] = useState([]);

  const load = async () => setList(await loadData('DRIVER'));
  useFocusEffect(useCallback(() => { load(); }, []));

  const save = async () => {
    if (!amount) return Alert.alert('टीप', 'रक्कम भरा');
    await addEntry('DRIVER', { type, amount, note, date: new Date().toLocaleDateString() });
    setAmount(''); setNote('');
    load();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.form}>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            {['पगार', 'उचल'].map((t) => (
              <TouchableOpacity key={t} onPress={() => setType(t)} style={[s.chip, type === t && s.chipA]}>
                <Text style={{ color: type === t ? '#fff' : '#2c3e50', fontWeight: 'bold' }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.label}>रक्कम (₹)</Text>
          <TextInput style={s.input} placeholder="उदा. 5000" placeholderTextColor="#94a3b8" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          <Text style={s.label}>नोंद (Optional)</Text>
          <TextInput style={s.input} placeholder="उदा. ऑक्टोबर महिन्याचा पगार" placeholderTextColor="#94a3b8" value={note} onChangeText={setNote} />
          <TouchableOpacity style={s.btn} onPress={save}><Text style={s.btnTxt}>सेव्ह करा</Text></TouchableOpacity>
        </View>
        <FlatList data={list} keyExtractor={(i) => i.id} scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowT}>{item.type} · ₹{item.amount}</Text>
                <Text style={s.rowD}>{item.date} {item.note ? '· ' + item.note : ''}</Text>
              </View>
              <TouchableOpacity onPress={async () => setList(await deleteEntry('DRIVER', item.id))}><Text style={s.del}>काढा</Text></TouchableOpacity>
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
  btn: { backgroundColor: '#16a085', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#2c3e50', marginRight: 10 },
  chipA: { backgroundColor: '#2c3e50' },
  row: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  rowT: { fontWeight: 'bold', fontSize: 15, color: '#1e293b' },
  rowD: { fontSize: 13, color: '#64748b', marginTop: 2 },
  del: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
});
