import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { loadData, addEntry, deleteEntry } from '../storage';

export default function FuelEntry() {
  const [amount, setAmount] = useState('');
  const [liters, setLiters] = useState('');
  const [km, setKm] = useState('');
  const [photo, setPhoto] = useState(null);
  const [list, setList] = useState([]);

  const load = async () => setList(await loadData('FUEL'));
  useFocusEffect(useCallback(() => { load(); }, []));

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ quality: 0.5 });
      if (!res.canceled) setPhoto(res.assets[0].uri);
    } catch (e) {
      Alert.alert('Error', 'कॅमेरा उघडत नाहीये');
    }
  };

  const save = async () => {
    if (!amount || !liters) return Alert.alert('टीप', 'रक्कम आणि लिटर भरा');
    await addEntry('FUEL', { amount, liters, km, photo, date: new Date().toLocaleDateString() });
    setAmount(''); setLiters(''); setKm(''); setPhoto(null);
    load();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={s.c}>
        <View style={s.form}>
          
          <Text style={s.label}>डिझेलची रक्कम (₹)</Text>
          <TextInput style={s.input} placeholder="उदा. 5000" placeholderTextColor="#94a3b8" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          
          <Text style={s.label}>किती लिटर डिझेल भरलं?</Text>
          <TextInput style={s.input} placeholder="उदा. 50" placeholderTextColor="#94a3b8" keyboardType="numeric" value={liters} onChangeText={setLiters} />
          
          <Text style={s.label}>गाडीचं मीटर (KM)</Text>
          <TextInput style={s.input} placeholder="उदा. 150000" placeholderTextColor="#94a3b8" keyboardType="numeric" value={km} onChangeText={setKm} />

          <TouchableOpacity style={s.photoBtn} onPress={pickImage}>
            <Text style={s.photoTxt}>{photo ? '📷 फोटो बदला' : '📷 बिलाचा फोटो काढा'}</Text>
          </TouchableOpacity>
          {photo && <Image source={{ uri: photo }} style={s.img} />}
          
          <TouchableOpacity style={s.btn} onPress={save}>
            <Text style={s.btnTxt}>सेव्ह करा</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={list} keyExtractor={(i) => i.id} scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={s.row}>
              {item.photo && <Image source={{ uri: item.photo }} style={s.thumb} />}
              <View style={{ flex: 1 }}>
                <Text style={s.rowT}>₹{item.amount} · {item.liters}L · {item.km || '-'} KM</Text>
                <Text style={s.rowD}>{item.date}</Text>
              </View>
              <TouchableOpacity onPress={async () => setList(await deleteEntry('FUEL', item.id))}>
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
  photoBtn: { borderWidth: 1, borderColor: '#e67e22', borderStyle: 'dashed', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16, backgroundColor: '#fff7ed' },
  photoTxt: { color: '#e67e22', fontWeight: 'bold', fontSize: 15 },
  img: { width: '100%', height: 150, borderRadius: 8, marginTop: 10 },
  btn: { backgroundColor: '#e67e22', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  row: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  rowT: { fontWeight: 'bold', fontSize: 15, color: '#1e293b' },
  rowD: { fontSize: 13, color: '#64748b', marginTop: 2 },
  del: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
});
