import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { loadData, addEntry, deleteEntry } from '../storage';

export default function Kargoship() {
  const [slip, setSlip] = useState('');
  const [amount, setAmount] = useState('');
  const [commission, setCommission] = useState('');
  const [pending, setPending] = useState('');
  const [photo, setPhoto] = useState(null);
  const [list, setList] = useState([]);

  const load = async () => setList(await loadData('KARGO'));
  useFocusEffect(useCallback(() => { load(); }, []));

  const pick = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ quality: 0.5 });
      if (!res.canceled) setPhoto(res.assets[0].uri);
    } catch (e) { Alert.alert('Error', 'कॅमेरा उघडत नाहीये'); }
  };

  const save = async () => {
    if (!slip || !amount) return Alert.alert('टीप', 'स्लिप नंबर आणि रक्कम भरा');
    await addEntry('KARGO', { slip, amount, commission, pending, photo, date: new Date().toLocaleDateString() });
    setSlip(''); setAmount(''); setCommission(''); setPending(''); setPhoto(null);
    load();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.form}>
          <Text style={s.label}>स्लिप नंबर</Text>
          <TextInput style={s.input} placeholder="उदा. 1024" placeholderTextColor="#94a3b8" value={slip} onChangeText={setSlip} />
          <Text style={s.label}>एकूण कार्गो रक्कम (₹)</Text>
          <TextInput style={s.input} placeholder="उदा. 15000" placeholderTextColor="#94a3b8" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          <Text style={s.label}>कमिशन कापलं (₹)</Text>
          <TextInput style={s.input} placeholder="उदा. 500" placeholderTextColor="#94a3b8" keyboardType="numeric" value={commission} onChangeText={setCommission} />
          <Text style={s.label}>किती पैसे यायचे बाकी आहेत? (₹)</Text>
          <TextInput style={s.input} placeholder="उदा. 2000" placeholderTextColor="#94a3b8" keyboardType="numeric" value={pending} onChangeText={setPending} />
          <TouchableOpacity style={s.photoBtn} onPress={pick}>
            <Text style={s.photoTxt}>{photo ? '📷 फोटो बदला' : '📷 स्लिपचा फोटो काढा'}</Text>
          </TouchableOpacity>
          {photo && <Image source={{ uri: photo }} style={s.img} />}
          <TouchableOpacity style={s.btn} onPress={save}><Text style={s.btnTxt}>सेव्ह करा</Text></TouchableOpacity>
        </View>
        <FlatList data={list} keyExtractor={(i) => i.id} scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={s.row}>
              {item.photo && <Image source={{ uri: item.photo }} style={s.thumb} />}
              <View style={{ flex: 1 }}>
                <Text style={s.rowT}>स्लिप #{item.slip} · ₹{item.amount}</Text>
                <Text style={s.rowD}>कमिशन ₹{item.commission || 0} · बाकी ₹{item.pending || 0}</Text>
              </View>
              <TouchableOpacity onPress={async () => setList(await deleteEntry('KARGO', item.id))}><Text style={s.del}>काढा</Text></TouchableOpacity>
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
  photoBtn: { borderWidth: 1, borderColor: '#3b82f6', borderStyle: 'dashed', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16, backgroundColor: '#eff6ff' },
  photoTxt: { color: '#3b82f6', fontWeight: 'bold', fontSize: 15 },
  img: { width: '100%', height: 150, borderRadius: 8, marginTop: 10 },
  btn: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  row: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  rowT: { fontWeight: 'bold', fontSize: 15, color: '#1e293b' },
  rowD: { fontSize: 13, color: '#64748b', marginTop: 2 },
  del: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
});
