import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, addEntry, deleteEntry, getActiveTruck } from '../storage';
import { auth, db } from '../firebase';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, collection, query, where, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function Driver() {
  const [type, setType] = useState('Salary'); // Salary किंवा Advance
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [list, setList] = useState([]);
  const [activeTruck, setActiveTruck] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverPin, setDriverPin] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [myDrivers, setMyDrivers] = useState([]); // ओनरने तयार केलेले ड्रायव्हर्स

  // १. लोकल स्टोरेज मधून पगार/उचल लोड करणे
  const load = async () => {
    const truck = await getActiveTruck();
    setActiveTruck(truck);
    const data = await loadData('DRIVER');
    const filtered = data.filter(item => item.truckId === truck || !item.truckId);
    setList(filtered);
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  // २. फायरबेस मधून ओनरचे ड्रायव्हर्स लोड करणे
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "users"), where("ownerId", "==", auth.currentUser.uid), where("role", "==", "driver"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const driverList = [];
      snapshot.forEach((doc) => driverList.push({ id: doc.id, ...doc.data() }));
      setMyDrivers(driverList);
    });
    return () => unsubscribe();
  }, []);

  const save = async () => {
    if (!amount) return Alert.alert('Error', 'Please enter amount');
    await addEntry('DRIVER', { type, amount, note, date: new Date().toLocaleDateString() });
    setAmount(''); setNote('');
    load();
  };

  const createDriverAccount = async () => {
    if (!driverName || !driverPhone || !driverPin) return Alert.alert('Error', 'Please fill all details');
    if (driverPin.length !== 4) return Alert.alert('Error', 'PIN must be 4 digits');
    
    setLoading(true);
    try {
      const secondaryApp = initializeApp(auth.app.options, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);
      
      const cleanName = driverName.toLowerCase().replace(/\s+/g, '');
      const email = `${cleanName}@truckapp.com`;
      const password = `${driverPin}123`;
      
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: driverName, 
        phone: driverPhone, 
        pin: driverPin, // रेफरन्ससाठी पिन सेव्ह करत आहोत
        role: "driver", 
        ownerId: auth.currentUser?.uid, 
        linkedTruck: activeTruck, 
        isActive: true, 
        createdAt: new Date()
      });
      
      await signOut(secondaryAuth);
      Alert.alert('Success', `Driver created!\nName: ${driverName}\nPIN: ${driverPin}`);
      setModalVisible(false); setDriverName(''); setDriverPhone(''); setDriverPin('');
    } catch (error) { 
      let msg = error.message;
      if (msg.includes('auth/email-already-in-use')) msg = "This driver name is already taken. Try another.";
      Alert.alert('Error', msg); 
    } finally { 
      setLoading(false); 
    }
  };

  const deleteDriver = (id) => {
    Alert.alert("Delete Driver?", "This driver will not be able to login anymore.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try { await deleteDoc(doc(db, "users", id)); } catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  };

  const resetPin = (id, currentPin) => {
    Alert.alert("Reset PIN", `Current PIN is: ${currentPin}\n\nIf the driver forgot the PIN, please delete this driver and create a new one with a new PIN.`);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <ScrollView style={s.c} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View style={s.headerBox}>
          <Ionicons name="bus" size={24} color="#60A5FA" />
          <Text style={s.headerTxt}>Current Truck: <Text style={{color:'#F8FAFC', fontWeight:'bold'}}>{activeTruck}</Text></Text>
        </View>

        <TouchableOpacity style={s.addDriverBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="person-add" size={20} color="#fff" />
          <Text style={s.addDriverTxt}>Add New Driver</Text>
        </TouchableOpacity>

        {/* 🚀 My Drivers List (नवीन सेक्शन) */}
        {myDrivers.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={s.sectionTitle}>My Drivers</Text>
            {myDrivers.map((driver) => (
              <View key={driver.id} style={s.driverCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.driverName}>{driver.name}</Text>
                  <Text style={s.driverPhone}>📞 {driver.phone} | PIN: {driver.pin}</Text>
                </View>
                <TouchableOpacity onPress={() => resetPin(driver.id, driver.pin)} style={s.actionIconBtn}>
                  <Ionicons name="key" size={20} color="#F59E0B" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteDriver(driver.id)} style={s.actionIconBtn}>
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Salary/Advance Form */}
        <Text style={s.sectionTitle}>Salary / Advance Entry</Text>
        <View style={s.form}>
          <View style={{ flexDirection: 'row', marginBottom: 15, backgroundColor: '#0F172A', borderRadius: 12, padding: 5 }}>
            {['Salary', 'Advance'].map((t) => (
              <TouchableOpacity key={t} onPress={() => setType(t)} style={[s.chip, type === t && s.chipA]} activeOpacity={0.8}>
                <Text style={{ color: type === t ? '#fff' : '#64748b', fontWeight: 'bold', fontSize: 15 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={s.label}>Amount (₹)</Text>
          <TextInput style={s.input} placeholder="e.g. 5000" placeholderTextColor="#64748B" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          
          <Text style={s.label}>Note (Optional)</Text>
          <TextInput style={s.input} placeholder="e.g. Monthly Salary" placeholderTextColor="#64748B" value={note} onChangeText={setNote} />
          
          <TouchableOpacity style={s.btn} onPress={save} activeOpacity={0.8}><Text style={s.btnTxt}>Save Entry</Text></TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>History</Text>
        <FlatList data={list} keyExtractor={(i) => i.id} scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={s.row}>
              <View style={[s.typeIndicator, { backgroundColor: item.type === 'Salary' ? '#EF4444' : '#10B981' }]} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.rowT}>{item.type} · ₹{item.amount}</Text>
                <Text style={s.rowD}>{item.date} {item.note ? '· ' + item.note : ''}</Text>
              </View>
              <TouchableOpacity onPress={async () => { await deleteEntry('DRIVER', item.id); load(); }}><Ionicons name="trash-outline" size={20} color="#64748B" /></TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#64748B', textAlign: 'center', marginTop: 10 }}>No history found.</Text>}
        />

        {/* Create Driver Modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={s.modalBg}><View style={s.modalBox}>
            <Text style={s.modalTitle}>Create New Driver</Text>
            
            <Text style={s.label}>Driver Name (ID)</Text>
            <TextInput style={s.input} placeholder="e.g. Ramesh" placeholderTextColor="#64748B" value={driverName} onChangeText={setDriverName} autoCapitalize="none" />
            
            <Text style={s.label}>Mobile Number</Text>
            <TextInput style={s.input} placeholder="e.g. 9876543210" placeholderTextColor="#64748B" value={driverPhone} onChangeText={setDriverPhone} keyboardType="numeric" maxLength={10} />
            
            <Text style={s.label}>4-Digit PIN</Text>
            <TextInput style={s.input} placeholder="e.g. 1234" placeholderTextColor="#64748B" value={driverPin} onChangeText={setDriverPin} secureTextEntry keyboardType="numeric" maxLength={4} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 }}>
              <TouchableOpacity style={s.modalBtnCancel} onPress={() => setModalVisible(false)}><Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={s.modalBtnSave} onPress={createDriverAccount} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create</Text>}</TouchableOpacity>
            </View>
          </View></View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, padding: 16 },
  headerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  headerTxt: { marginLeft: 10, fontSize: 15, color: '#94A3B8', fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 10, marginTop: 5 },
  
  addDriverBtn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  addDriverTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  
  driverCard: { flexDirection: 'row', backgroundColor: '#1E293B', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  driverName: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize' },
  driverPhone: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  actionIconBtn: { padding: 8, marginLeft: 5, backgroundColor: '#0F172A', borderRadius: 8 },

  form: { backgroundColor: '#1E293B', padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#CBD5E1', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 15, fontSize: 16, color: '#F8FAFC', backgroundColor: '#0F172A' },
  btn: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  chip: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  chipA: { backgroundColor: '#2563EB' },
  
  row: { backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  typeIndicator: { width: 5, height: 40, borderRadius: 5 },
  rowT: { fontWeight: 'bold', fontSize: 16, color: '#F8FAFC' },
  rowD: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#1E293B', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 15, color: '#F8FAFC' },
  modalBtnCancel: { padding: 15, flex: 1, alignItems: 'center', backgroundColor: '#334155', borderRadius: 12, marginRight: 10 },
  modalBtnSave: { padding: 15, flex: 1, alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 12 }
});
