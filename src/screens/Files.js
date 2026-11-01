import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Image, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { loadData, addEntry, deleteEntry, getActiveTruck } from '../storage';
import { Ionicons } from '@expo/vector-icons';

export default function Files() {
  const [list, setList] = useState([]);
  const [activeTruck, setActiveTruck] = useState('');

  const load = async () => {
    const truck = await getActiveTruck();
    setActiveTruck(truck);
    const data = await loadData('FILES');
    const filtered = data.filter(item => item.truckId === truck || !item.truckId);
    setList(filtered);
  };

  React.useEffect(() => { load(); }, []);

  const pickDoc = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
      if (!res.canceled) {
        await addEntry('FILES', { uri: res.assets[0].uri, date: new Date().toLocaleString() });
        load();
        Alert.alert('✅ झालं', 'फाईल अपलोड झाली! (ड्रायव्हर आणि ओनरला दिसेल)');
      }
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const shareDoc = async (uri) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Error', 'शेअर करता येत नाहीये');
    }
  };

  return (
    <ScrollView style={s.c}>
      <View style={s.headerBox}><Text style={s.headerTxt}>सध्याचा ट्रक: {activeTruck}</Text></View>

      <TouchableOpacity style={s.uploadBtn} onPress={pickDoc}>
        <Ionicons name="cloud-upload" size={24} color="#fff" />
        <Text style={s.uploadTxt}>नवीन फाईल / फोटो अपलोड करा</Text>
      </TouchableOpacity>

      <FlatList data={list} keyExtractor={(i) => i.id} scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.rowT}>फाईल अपलोड झाली</Text>
              <Text style={s.rowD}>{item.date}</Text>
            </View>
            <TouchableOpacity onPress={() => shareDoc(item.uri)} style={s.shareBtn}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={async () => { await deleteEntry('FILES', item.id); load(); }} style={{ marginLeft: 10 }}>
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  headerBox: { backgroundColor: '#e2e8f0', padding: 10, borderRadius: 8, marginBottom: 10 },
  headerTxt: { fontWeight: 'bold', color: '#334155', textAlign: 'center' },
  uploadBtn: { backgroundColor: '#8e44ad', padding: 16, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  uploadTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  row: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  rowT: { fontWeight: 'bold', fontSize: 15, color: '#1e293b' },
  rowD: { fontSize: 13, color: '#64748b', marginTop: 2 },
  shareBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 5 }
});
