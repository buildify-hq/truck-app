import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, addEntry, deleteEntry, getActiveTruck } from '../storage';
import { auth, db } from '../firebase';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function Driver() {
  const [type, setType] = useState('पगार');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [list, setList] = useState([]);
  const [activeTruck, setActiveTruck] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverPin, setDriverPin] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const truck = await getActiveTruck();
    setActiveTruck(truck);
    const data = await loadData('DRIVER');
    const filtered = data.filter(item => item.truckId === truck || !item.truckId);
    setList(filtered);
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  const save = async () => {
    if (!amount) return Alert.alert('टीप', 'रक्कम भरा');
    await addEntry('DRIVER', { type, amount, note, date: new Date().toLocaleDateString() });
    setAmount(''); setNote('');
    load();
  };

  const createDriverAccount = async () => {
    if (!driverName || !driverPhone || !driverPin) return Alert.alert('Error', 'कृपया सगळी माहिती भरा');
    if (driverPin.length !== 4) return Alert.alert('Error', 'कृपया ४-अंकी पिन टाका');
    setLoading(true);
    try {
      const secondaryApp = initializeApp(auth.app.options, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);
      const cleanName = driverName.toLowerCase().replace(/\s+/g, '');
      const email = `${cleanName}@truckapp.com`;
      const password = `${driverPin}123`;
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: driverName, phone: driverPhone, role: "driver", ownerId: auth.currentUser?.uid, linkedTruck: activeTruck, isActive: true, createdAt: new Date()
      });
      await signOut(secondaryAuth);
      Alert.alert('✅ झालं', `ड्रायव्हर तयार झाला!\nनाव: ${driverName}\nपिन: ${driverPin}`);
      setModalVisible(false); setDriverName(''); setDriverPhone(''); setDriverPin('');
    } catch (error) { Alert.alert('Error', error.message); } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={s.headerBox}>
          <Ionicons name="bus" size={24} color="#2563EB" />
          <Text style={s.headerTxt}>सध्याचा ट्रक: <Text style={{color:'#1E293B', fontWeight:'bold'}}>{activeTruck}</Text></Text>
        </View>
        <TouchableOpacity style={s.addDriverBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="person-add" size={20} color="#fff" /><Text style={s.addDriverTxt}>नवीन ड्रायव्हर ॲड करा</Text>
        </TouchableOpacity>
        <View style={s.form}>
          <View style={{ flexDirection: 'row', marginBottom: 15, backgroundColor: '#F1F5F9', borderRadius: 12, padding: 5 }}>
            {['पगार', 'उचल'].map((t) => (
              <TouchableOpacity key={t} onPress={() => setType(t)} style={[s.chip, type === t && s.chipA]} activeOpacity={0.8}>
                <Text style={{ color: type === t ? '#fff' : '#64748b', fontWeight: 'bold', fontSize: 15 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.label}>रक्कम (₹)</Text>
          <TextInput style={s.input} placeholder="उदा. 5000" placeholderTextColor="#94a3b8" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          <Text style={s.label}>नोंद (Optional)</Text>
          <TextInput style={s.input} placeholder="उदा. महिन्याचा पगार" placeholderTextColor="#94a3b8" value={note} onChangeText={setNote} />
          <TouchableOpacity style={s.btn} onPress={save} activeOpacity={0.8}><Text style={s.btnTxt}>सेव्ह करा</Text></TouchableOpacity>
        </View>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 10, marginTop: 10 }}>हिशोबाची यादी</Text>
        <FlatList data={list} keyExtractor={(i) => i.id} scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={s.row}>
              <View style={[s.typeIndicator, { backgroundColor: item.type === 'पगार' ? '#EF4444' : '#10B981' }]} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.rowT}>{item.type} · ₹{item.amount}</Text>
                <Text style={s.rowD}>{item.date} {item.note ? '· ' + item.note : ''}</Text>
              </View>
              <TouchableOpacity onPress={async () => { await deleteEntry('DRIVER', item.id); load(); }}><Ionicons name="trash-outline" size={20} color="#cbd5e1" /></TouchableOpacity>
            </View>
          )}
        />
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={s.modalBg}><View style={s.modalBox}>
            <Text style={s.modalTitle}>नवीन ड्रायव्हर तयार करा</Text>
            <Text style={s.label}>ड्रायव्हरचं नाव (ID)</Text>
            <TextInput style={s.input} placeholder="उदा. रमेश" value={driverName} onChangeText={setDriverName} autoCapitalize="none" />
            <Text style={s.label}>मोबाईल नंबर</Text>
            <TextInput style={s.input} placeholder="उदा. 9876543210" value={driverPhone} onChangeText={setDriverPhone} keyboardType="numeric" maxLength={10} />
            <Text style={s.label}>४-अंकी पिन</Text>
            <TextInput style={s.input} placeholder="उदा. 1234" value={driverPin} onChangeText={setDriverPin} secureTextEntry keyboardType="numeric" maxLength={4} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 }}>
              <TouchableOpacity style={s.modalBtnCancel} onPress={() => setModalVisible(false)}><Text style={{ color: '#64748b', fontWeight: 'bold' }}>रद्द करा</Text></TouchableOpacity>
              <TouchableOpacity style={s.modalBtnSave} onPress={createDriverAccount} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>तयार करा</Text>}</TouchableOpacity>
            </View>
          </View></View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, padding: 16 },
  headerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', padding: 16, borderRadius: 16, marginBottom: 15 },
  headerTxt: { marginLeft: 10, fontSize: 15, color: '#1E40AF', fontWeight: '500' },
  addDriverBtn: { backgroundColor: '#0F172A', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  addDriverTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, fontSize: 16, color: '#000', backgroundColor: '#F8FAFC' },
  btn: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  chip: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  chipA: { backgroundColor: '#2563EB' },
  row: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  typeIndicator: { width: 5, height: 40, borderRadius: 5 },
  rowT: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  rowD: { fontSize: 13, color: '#64748b', marginTop: 4 },
  modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#fff', padding: 24, borderRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 15, color: '#1E293B' },
  modalBtnCancel: { padding: 15, flex: 1, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, marginRight: 10 },
  modalBtnSave: { padding: 15, flex: 1, alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 12 }
});
