import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image } from 'react-native';
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
    <View style={s.c}>
      <View style={s.form}>
        <TextInput style={s.input} placeholder="रक्कम (₹)" keyboardType="numeric" value={amount} onChangeText={setAmount} />
        <TextInput style={s.input} placeholder="लिटर" keyboardType="numeric" value={liters} onChangeText={setLiters} />
        <TextInput style={s.input} placeholder="मीटर (KM)" keyboardType="numeric" value={km} onChangeText={setKm} />
        <TouchableOpacity style={s.photoBtn} onPress={pickImage}>
          <Text style={s.photoTxt}>{photo ? '📷 फोटो बदला' : '📷 बिलाचा फोटो काढा'}</Text>
        </TouchableOpacity>
        {photo && <Image source={{ uri: photo }} style={s.img} />}
        <TouchableOpacity style={s.btn} onPress={save}>
          <Text style={s.btnTxt}>सेव्ह करा</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={list} keyExtractor={(i) => i.id}
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
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#F8FAFC', padding: 12 },
  form: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginBottom: 8 },
  photoBtn: { borderWidth: 1, borderColor: '#e67e22', borderStyle: 'dashed', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  photoTxt: { color: '#e67e22', fontWeight: '600' },
  img: { width: '100%', height: 150, borderRadius: 8, marginBottom: 8 },
  btn: { backgroundColor: '#e67e22', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: 'bold' },
  row: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 6, flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 45, height: 45, borderRadius: 6, marginRight: 10 },
  rowT: { fontWeight: '600', fontSize: 14 },
  rowD: { fontSize: 12, color: '#64748b' },
  del: { color: '#ef4444', fontWeight: 'bold', fontSize: 13 },
});
