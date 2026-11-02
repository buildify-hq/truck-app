import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, addEntry, deleteEntry, getActiveTruck } from '../storage';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function Driver() {
  const [type, setType] = useState('पगार');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [list, setList] = useState([]);
  const [activeTruck, setActiveTruck] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [driverId, setDriverId] = useState('');
  const [driverPin, setDriverPin] = useState('');

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
    if (!driverId || !driverPin) return Alert.alert('Error', 'ID आणि PIN भरा');
    try {
      // 🔥 इथे ड्रायव्हरच्या ID ला आपोआप @truckapp.com जोडलं जाईल
      const dummyEmail = `${driverId.toLowerCase().trim()}@truckapp.com`;
      
      const userCred = await createUserWithEmailAndPassword(auth, dummyEmail, driverPin);
      await setDoc(doc(db, "users", userCred.user.uid), {
        userId: driverId.toLowerCase().trim(),
        role: "driver",
        linkedTruck: activeTruck,
        isActive: true
      });

      Alert.alert('✅ झालं', `ड्रायव्हर तयार झाला! ID: ${driverId}, PIN: ${driverPin}`);
      setModalVisible(false);
      setDriverId(''); setDriverPin('');
      
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View style={s.headerBox}><Text style={s.headerTxt}>सध्याचा ट्रक: {activeTruck}</Text></View>

        <TouchableOpacity style={s.addDriverBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="person-add" size={20} color="#fff" />
          <Text style={s.addDriverTxt}>नवीन ड्रायव्हर ॲड करा</Text>
        </TouchableOpacity>

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
          <TextInput style={s.input} placeholder="उदा. पगार" placeholderTextColor="#94a3b8" value={note} onChangeText={setNote} />
          <TouchableOpacity style={s.btn} onPress={save}><Text style={s.btnTxt}>सेव्ह करा</Text></TouchableOpacity>
        </View>

        <FlatList data={list} keyExtractor={(i) => i.id} scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowT}>{item.type} · ₹{item.amount}</Text>
                <Text style={s.rowD}>{item.date} {item.note ? '· ' + item.note : ''}</Text>
              </View>
              <TouchableOpacity onPress={async () => { await deleteEntry('DRIVER', item.id); load(); }}><Text style={s.del}>काढा</Text></TouchableOpacity>
            </View>
          )}
        />

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={s.modalBg}>
            <View style={s.modalBox}>
              <Text style={s.modalTitle}>ड्रायव्हर तयार करा</Text>
              
              <Text style={s.label}>ड्रायव्हरचा ID (उदा. 101 किंवा raju)</Text>
              <TextInput style={s.input} placeholder="उदा. 101" value={driverId} onChangeText={setDriverId} autoCapitalize="none" />
              
              <Text style={s.label}>PIN (उदा. 1234)</Text>
              <TextInput style={s.input} placeholder="****" value={driverPin} onChangeText={setDriverPin} secureTextEntry />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                <TouchableOpacity style={s.modalBtnCancel} onPress={() => setModalVisible(false)}><Text style={{ color: '#64748b', fontWeight: 'bold' }}>रद्द करा</Text></TouchableOpacity>
                <TouchableOpacity style={s.modalBtnSave} onPress={createDriverAccount}><Text style={{ color: '#fff', fontWeight: 'bold' }}>तयार करा</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  headerBox: { backgroundColor: '#e2e8f0', padding: 10, borderRadius: 8, marginBottom: 10 },
  headerTxt: { fontWeight: 'bold', color: '#334155', textAlign: 'center' },
  addDriverBtn: { backgroundColor: '#16a085', padding: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  addDriverTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
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
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1E293B' },
  modalBtnCancel: { padding: 12, flex: 1, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, marginRight: 10 },
  modalBtnSave: { padding: 12, flex: 1, alignItems: 'center', backgroundColor: '#3B82F6', borderRadius: 8 }
});
