import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image, ScrollView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { loadData, addEntry, deleteEntry, getActiveTruck } from '../storage';
import { Ionicons } from '@expo/vector-icons';

export default function Files() {
  const [docName, setDocName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [list, setList] = useState([]);
  const [activeTruck, setActiveTruck] = useState('');

  const load = async () => {
    const truck = await getActiveTruck();
    setActiveTruck(truck);
    const data = await loadData('FILES');
    const filtered = data.filter(item => item.truckId === truck || !item.truckId);
    setList(filtered);
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  const pickFromCamera = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ quality: 0.5 });
      if (!res.canceled) setPhoto(res.assets[0].uri);
    } catch (e) { Alert.alert('Error', 'Could not open camera'); }
  };

  const pickFromGallery = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5, mediaTypes: ImagePicker.MediaTypeOptions.Images });
      if (!res.canceled) setPhoto(res.assets[0].uri);
    } catch (e) { Alert.alert('Error', 'Could not open gallery'); }
  };

  const saveDoc = async () => {
    if (!docName || !photo) return Alert.alert('Error', 'Please enter document name and select a photo');
    await addEntry('FILES', { name: docName, uri: photo, date: new Date().toLocaleString() });
    setDocName(''); setPhoto(null);
    load();
    Alert.alert('Success', 'Document uploaded successfully!');
  };

  const shareDoc = async (uri) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Error', 'Sharing is not available on this device');
    }
  };

  return (
    <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      
      <View style={s.headerBox}>
        <Ionicons name="folder" size={24} color="#60A5FA" />
        <Text style={s.headerTxt}>Current Truck: <Text style={{color:'#F8FAFC', fontWeight:'bold'}}>{activeTruck}</Text></Text>
      </View>

      <View style={s.form}>
        <Text style={s.label}>Document Name (e.g. RC Book, Insurance)</Text>
        <TextInput style={s.input} placeholder="e.g. Insurance 2026" placeholderTextColor="#64748B" value={docName} onChangeText={setDocName} />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
          <TouchableOpacity style={[s.photoBtn, {flex: 1, marginRight: 5}]} onPress={pickFromCamera}>
            <Ionicons name="camera-outline" size={20} color="#60A5FA" />
            <Text style={s.photoTxt}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.photoBtn, {flex: 1, marginLeft: 5}]} onPress={pickFromGallery}>
            <Ionicons name="image-outline" size={20} color="#60A5FA" />
            <Text style={s.photoTxt}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {photo && <Image source={{ uri: photo }} style={s.img} />}

        <TouchableOpacity style={s.btn} onPress={saveDoc} activeOpacity={0.8}>
          <Text style={s.btnTxt}>Upload Document</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionTitle}>My Documents</Text>
      <FlatList 
        data={list} 
        keyExtractor={(i) => i.id} 
        scrollEnabled={false}
        ListEmptyComponent={<Text style={{ color: '#64748B', textAlign: 'center', marginTop: 10 }}>No documents uploaded yet.</Text>}
        renderItem={({ item }) => (
          <View style={s.row}>
            {item.uri && <Image source={{ uri: item.uri }} style={s.thumb} />}
            <View style={{ flex: 1, marginLeft: item.uri ? 12 : 0 }}>
              <Text style={s.rowT}>{item.name || 'Document'}</Text>
              <Text style={s.rowD}>{item.date}</Text>
            </View>
            <TouchableOpacity onPress={() => shareDoc(item.uri)} style={s.iconBtn}>
              <Ionicons name="share-social" size={20} color="#60A5FA" />
            </TouchableOpacity>
            <TouchableOpacity onPress={async () => { await deleteEntry('FILES', item.id); load(); }} style={s.iconBtn}>
              <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
  headerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  headerTxt: { marginLeft: 10, fontSize: 15, color: '#94A3B8', fontWeight: '500' },
  
  form: { backgroundColor: '#1E293B', padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#CBD5E1', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 15, fontSize: 16, color: '#F8FAFC', backgroundColor: '#0F172A' },
  
  photoBtn: { borderWidth: 1, borderColor: '#3B82F6', borderStyle: 'dashed', padding: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#1E3A8A', flexDirection: 'row', justifyContent: 'center' },
  photoTxt: { color: '#60A5FA', fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
  img: { width: '100%', height: 150, borderRadius: 12, marginTop: 12 },
  
  btn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 10 },
  row: { backgroundColor: '#1E293B', padding: 12, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  thumb: { width: 45, height: 45, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  rowT: { fontWeight: 'bold', fontSize: 15, color: '#F8FAFC', textTransform: 'capitalize' },
  rowD: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  iconBtn: { padding: 8, marginLeft: 5, backgroundColor: '#0F172A', borderRadius: 8 }
});
