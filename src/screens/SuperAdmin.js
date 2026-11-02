import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, TouchableOpacity, Alert, Platform, Modal, TextInput, ActivityIndicator } from 'react-native';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function SuperAdmin() {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerPin, setOwnerPin] = useState('');
  const [truckId, setTruckId] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === 'owner') usersList.push({ id: doc.id, ...data, isActive: data.isActive !== false });
      });
      setUsers(usersList);
    });
    return () => unsubscribe();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try { await updateDoc(doc(db, "users", id), { isActive: !currentStatus }); } catch (e) { Alert.alert('Error', e.message); }
  };

  const deleteUser = async (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm("हा ओनर डिलीट करायचा का?")) { try { await deleteDoc(doc(db, "users", id)); } catch (e) { window.alert(e.message); } }
    } else {
      Alert.alert("ओनर डिलीट करायचा?", "हा ओनर कायमचा डिलीट होईल.", [
        { text: "रद्द करा", style: "cancel" },
        { text: "हो, डिलीट करा", style: "destructive", onPress: async () => { try { await deleteDoc(doc(db, "users", id)); } catch (e) { Alert.alert('Error', e.message); } } }
      ]);
    }
  };

  const addNewOwner = async () => {
    if (!ownerName || !ownerPhone || !ownerPin || !truckId) return Alert.alert('Error', 'सगळी माहिती भरा');
    if (ownerPin.length !== 4) return Alert.alert('Error', '४-अंकी पिन टाका');
    setLoading(true);
    try {
      const cleanName = ownerName.toLowerCase().replace(/\s+/g, '');
      const email = `${cleanName}@truckapp.com`;
      const password = `${ownerPin}123`; 
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: ownerName, phone: ownerPhone, role: "owner", truckId: truckId.toUpperCase(),
        isActive: true, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date()
      });
      Alert.alert('✅ झालं', 'नवीन ओनर तयार झाला!');
      setModalVisible(false); setOwnerName(''); setOwnerPhone(''); setOwnerPin(''); setTruckId('');
    } catch (e) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  };

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={s.avatar}><Text style={s.avatarTxt}>{item.name?.charAt(0).toUpperCase()}</Text></View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={s.userName}>{item.name}</Text>
        <Text style={s.roleTxt}>{item.phone} | 🚚 {item.truckId}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Switch value={item.isActive} onValueChange={() => toggleStatus(item.id, item.isActive)} trackColor={{ false: "#FCA5A5", true: "#6EE7B7" }} thumbColor={item.isActive ? "#10B981" : "#EF4444"} />
        <TouchableOpacity onPress={() => deleteUser(item.id)} style={{ marginTop: 10 }}><Ionicons name="trash-outline" size={20} color="#EF4444" /></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View><Text style={s.title}>सुपर ॲडमिन</Text><Text style={s.subtitle}>सगळ्या ओनर्सचं कंट्रोल</Text></View>
        <TouchableOpacity onPress={() => auth.signOut()} style={s.logoutBtn}><Ionicons name="log-out-outline" size={22} color="#fff" /></TouchableOpacity>
      </View>
      <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Ionicons name="add-circle" size={24} color="#fff" /><Text style={s.addBtnTxt}>नवीन ओनर ॲड करा</Text>
      </TouchableOpacity>
      <FlatList data={users} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30, color: '#94A3B8' }}>कोणतेही ओनर सापडले नाहीत.</Text>} />
      
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={s.modalBg}><View style={s.modalBox}>
          <Text style={s.modalTitle}>नवीन ओनर तयार करा</Text>
          <Text style={s.label}>ओनरचं नाव (ID)</Text>
          <TextInput style={s.input} value={ownerName} onChangeText={setOwnerName} placeholder="उदा. sagar" placeholderTextColor="#94A3B8" autoCapitalize="none" />
          <Text style={s.label}>मोबाईल नंबर</Text>
          <TextInput style={s.input} value={ownerPhone} onChangeText={setOwnerPhone} keyboardType="numeric" maxLength={10} placeholder="उदा. 9876543210" placeholderTextColor="#94A3B8" />
          <Text style={s.label}>४-अंकी पिन</Text>
          <TextInput style={s.input} value={ownerPin} onChangeText={setOwnerPin} secureTextEntry keyboardType="numeric" maxLength={4} placeholder="उदा. 1234" placeholderTextColor="#94A3B8" />
          <Text style={s.label}>ट्रक नंबर</Text>
          <TextInput style={s.input} value={truckId} onChangeText={setTruckId} autoCapitalize="characters" placeholder="उदा. MH-12-AB-1234" placeholderTextColor="#94A3B8" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 }}>
            <TouchableOpacity style={s.modalBtnCancel} onPress={() => setModalVisible(false)}><Text style={{ color: '#64748b', fontWeight: 'bold' }}>रद्द करा</Text></TouchableOpacity>
            <TouchableOpacity style={s.modalBtnSave} onPress={addNewOwner} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>तयार करा</Text>}</TouchableOpacity>
          </View>
        </View></View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: '#1E293B', padding: 20, borderRadius: 20 },
  title: { fontSize: 22, fontWeight: '900', color: '#fff' }, 
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  logoutBtn: { backgroundColor: '#EF4444', padding: 10, borderRadius: 12 },
  addBtn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  addBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center' },
  avatar: { width: 50, height: 50, backgroundColor: '#DBEAFE', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 20, fontWeight: 'bold', color: '#2563EB' },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#1E293B', textTransform: 'capitalize' },
  roleTxt: { fontSize: 13, color: '#64748b', marginTop: 4 },
  modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#fff', padding: 24, borderRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 15, color: '#1E293B' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, fontSize: 16, backgroundColor: '#F8FAFC', color: '#000' },
  modalBtnCancel: { padding: 15, flex: 1, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, marginRight: 10 },
  modalBtnSave: { padding: 15, flex: 1, alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 12 }
});
