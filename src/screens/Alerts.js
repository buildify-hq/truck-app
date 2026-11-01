import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, addEntry, deleteEntry, getActiveTruck } from '../storage';

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
    if (!name || !date) return Alert.alert('टीप', 'नाव आणि तारीख (YYYY-MM-DD) भरा');
    await addEntry('ALERTS', { name, date });
    setName(''); setDate('');
    load();
  };

  const daysLeft = (d) => Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View style={s.headerBox}>
          <Text style={s.headerTxt}>सध्याचा ट्रक: {activeTruck}</Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>कागदपत्राचं नाव (उदा. इन्शुरन्स / PUC)</Text>
          <TextInput style={s.input} placeholder="उदा. गाडीचा इन्शुरन्स" placeholderTextColor="#94a3b8" value={name} onChangeText={setName} />
          <Text style={s.label}>संपण्याची तारीख (YYYY-MM-DD)</Text>
          <TextInput style={s.input} placeholder="उदा. 2026-12-31" placeholderTextColor="#94a3b8" value={date} onChangeText={setDate} />
          <TouchableOpacity style={s.btn} onPress={save}><Text style={s.btnTxt}>रिमाइंडर सेट करा</Text></TouchableOpacity>
        </View>

        <FlatList data={list} keyExtractor={(i) => i.id} scrollEnabled={false}
          renderItem={({ item }) => {
            const d = daysLeft(item.date);
            const color = d < 0 ? '#e74c3c' : d <= 15 ? '#f39c12' : '#27ae60';
            const msg = d < 0 ? '❌ संपली!' : d <= 15 ? `⚠️ फक्त ${d} दिवस!` : `✅ ${d} दिवस बाकी`;
            return (
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowT}>{item.name}</Text>
                  <Text style={s.rowD}>{item.date}</Text>
                  <Text style={{ color, fontWeight: 'bold', marginTop: 4, fontSize: 13 }}>{msg}</Text>
                </View>
                <TouchableOpacity onPress={async () => { await deleteEntry('ALERTS', item.id); load(); }}><Text style={s.del}>काढा</Text></TouchableOpacity>
              </View>
            );
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  headerBox: { backgroundColor: '#e2e8f0', padding: 10, borderRadius: 8, marginBottom: 10 },
  headerTxt: { fontWeight: 'bold', color: '#334155', textAlign: 'center' },
  form: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 16, color: '#000', backgroundColor: '#f8fafc' },
  btn: { backgroundColor: '#8e44ad', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  row: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  rowT: { fontWeight: 'bold', fontSize: 15, color: '#1e293b' },
  rowD: { fontSize: 13, color: '#64748b', marginTop: 2 },
  del: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
});
