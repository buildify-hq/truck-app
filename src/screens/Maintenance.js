import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, addEntry, deleteEntry } from '../storage';

export default function Maintenance() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [list, setList] = useState([]);

  const load = async () => setList(await loadData('MAINTENANCE'));
  useFocusEffect(useCallback(() => { load(); }, []));

  const save = async () => {
    if (!name || !date) return Alert.alert('टीप', 'काम आणि तारीख भरा');
    await addEntry('MAINTENANCE', { name, date });
    setName(''); setDate('');
    load();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.form}>
          <Text style={s.label}>काय काम केलं? (उदा. ऑइल बदललं, टायर)</Text>
          <TextInput style={s.input} placeholder="उदा. इंजिन ऑइल बदलला" placeholderTextColor="#94a3b8" value={name} onChangeText={setName} />
          
          <Text style={s.label}>पुढे कधी करायचंय? (YYYY-MM-DD)</Text>
          <TextInput style={s.input} placeholder="उदा. 2027-01-01" placeholderTextColor="#94a3b8" value={date} onChangeText={setDate} />
          
          <TouchableOpacity style={s.btn} onPress={save}><Text style={s.btnTxt}>नोंद ठेवा</Text></TouchableOpacity>
        </View>
        
        <FlatList data={list} keyExtractor={(i) => i.id} scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowT}>{item.name}</Text>
                <Text style={s.rowD}>पुढील तारीख: {item.date}</Text>
              </View>
              <TouchableOpacity onPress={async () => setList(await deleteEntry('MAINTENANCE', item.id))}>
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
  btn: { backgroundColor: '#0891B2', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  row: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  rowT: { fontWeight: 'bold', fontSize: 15, color: '#1e293b' },
  rowD: { fontSize: 13, color: '#64748b', marginTop: 2 },
  del: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
});
