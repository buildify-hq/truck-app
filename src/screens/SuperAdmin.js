import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, Linking } from 'react-native';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function SuperAdmin() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerPin, setOwnerPin] = useState('');
  const [truckId, setTruckId] = useState('');

  const [editingUserId, setEditingUserId] = useState(null);
  const [editPhone, setEditPhone] = useState('');
  const [editTruckId, setEditTruckId] = useState('');

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
    Alert.alert("Delete Owner?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { 
        try { await deleteDoc(doc(db, "users", id)); } catch (e) { Alert.alert('Error', e.message); } 
      }}
    ]);
  };

  const renewOwner = async (id, currentExpiry) => {
    try {
      let baseDate = new Date();
      if (currentExpiry && new Date(currentExpiry) > baseDate) {
        baseDate = new Date(currentExpiry);
      }
      const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await updateDoc(doc(db, "users", id), { expiryDate: newExpiry });
      Alert.alert('Success', 'Validity extended by 30 days!');
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const addNewOwner = async () => {
    if (!ownerName || !ownerPhone || !ownerPin || !truckId) return Alert.alert('Error', 'Please fill all details.');
    if (ownerPin.length !== 4) return Alert.alert('Error', 'PIN must be 4 digits.');
    
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
      
      Alert.alert('Success', 'New Owner created!');
      setAddModalVisible(false); setOwnerName(''); setOwnerPhone(''); setOwnerPin(''); setTruckId('');
    } catch (e) { 
      let msg = e.message;
      if (msg.includes('auth/email-already-in-use')) msg = "This name is already taken. Try another.";
      Alert.alert('Error', msg);
    } finally { setLoading(false); }
  };

  const openEditModal = (user) => {
    setEditingUserId(user.id);
    setEditPhone(user.phone);
    setEditTruckId(user.truckId);
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", editingUserId), {
        phone: editPhone,
        truckId: editTruckId.toUpperCase()
      });
      Alert.alert('Success', 'Details updated successfully!');
      setEditModalVisible(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const makeCall = (phone) => { if(phone) Linking.openURL(`tel:${phone}`); };
  const openWhatsApp = (phone) => { if(phone) Linking.openURL(`whatsapp://send?phone=91${phone}`); };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (u.truckId && u.truckId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderItem = ({ item }) => {
    const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
    return (
      <View style={s.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <View style={s.avatar}><Text style={s.avatarTxt}>{item.name?.charAt(0).toUpperCase()}</Text></View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.userName}>{item.name}</Text>
            <Text style={s.roleTxt}>🚚 {item.truckId} • 📞 {item.phone}</Text>
            <Text style={[s.expiryTxt, { color: isExpired ? '#EF4444' : '#10B981' }]}>
              {isExpired ? 'Expired: ' : 'Valid till: '} 
              {new Date(item.expiryDate).toLocaleDateString()}
            </Text>
          </View>
          <Switch value={item.isActive} onValueChange={() => toggleStatus(item.id, item.isActive)} trackColor={{ false: "#7F1D1D", true: "#065F46" }} thumbColor={item.isActive ? "#10B981" : "#EF4444"} style={{ transform: [{ scaleX: .7 }, { scaleY: .7 }] }}/>
        </View>

        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => makeCall(item.phone)}><Ionicons name="call" size={16} color="#60A5FA" /><Text style={s.actionTxt}>Call</Text></TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => openWhatsApp(item.phone)}><Ionicons name="logo-whatsapp" size={16} color="#25D366" /><Text style={s.actionTxt}>WhatsApp</Text></TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => renewOwner(item.id, item.expiryDate)}><Ionicons name="time" size={16} color="#F59E0B" /><Text style={s.actionTxt}>+30 Days</Text></TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => openEditModal(item)}><Ionicons name="pencil" size={16} color="#A78BFA" /><Text style={s.actionTxt}>Edit</Text></TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, {borderRightWidth: 0}]} onPress={() => deleteUser(item.id)}><Ionicons name="trash" size={16} color="#EF4444" /><Text style={[s.actionTxt, {color:'#EF4444'}]}>Delete</Text></TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Super Admin</Text>
          <Text style={s.subtitle}>Total Owners: {users.length} | Active: {users.filter(u => u.isActive).length}</Text>
        </View>
        <TouchableOpacity onPress={() => auth.signOut()} style={s.logoutBtn}><Ionicons name="log-out-outline" size={20} color="#fff" /></TouchableOpacity>
      </View>
      
      <View style={s.searchBox}>
        <Ionicons name="search" size={20} color="#64748B" style={{marginLeft: 10}} />
        <TextInput style={s.searchInput} placeholder="Search by Name or Truck No..." placeholderTextColor="#64748B" value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <TouchableOpacity style={s.addBtn} onPress={() => setAddModalVisible(true)} activeOpacity={0.8}>
        <Ionicons name="add-circle" size={20} color="#fff" /><Text style={s.addBtnTxt}>Add New Owner</Text>
      </TouchableOpacity>

      <FlatList data={filteredUsers} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false} ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#64748B' }}>No owners found.</Text>} />
      
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={s.modalBg}><View style={s.modalBox}>
          <Text style={s.modalTitle}>Create New Owner</Text>
          <Text style={s.label}>Owner Name (ID)</Text>
          <TextInput style={s.input} value={ownerName} onChangeText={setOwnerName} placeholder="e.g. sagar" placeholderTextColor="#64748B" autoCapitalize="none" />
          <Text style={s.label}>Mobile Number</Text>
          <TextInput style={s.input} value={ownerPhone} onChangeText={setOwnerPhone} keyboardType="numeric" maxLength={10} placeholder="e.g. 9876543210" placeholderTextColor="#64748B" />
          <Text style={s.label}>4-Digit PIN</Text>
          <TextInput style={s.input} value={ownerPin} onChangeText={setOwnerPin} secureTextEntry keyboardType="numeric" maxLength={4} placeholder="e.g. 1234" placeholderTextColor="#64748B" />
          <Text style={s.label}>Truck Number</Text>
          <TextInput style={s.input} value={truckId} onChangeText={setTruckId} autoCapitalize="characters" placeholder="e.g. MH-12-AB-1234" placeholderTextColor="#64748B" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity style={s.modalBtnCancel} onPress={() => setAddModalVisible(false)}><Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={s.modalBtnSave} onPress={addNewOwner} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create</Text>}</TouchableOpacity>
          </View>
        </View></View>
      </Modal>

      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={s.modalBg}><View style={s.modalBox}>
          <Text style={s.modalTitle}>Edit Owner Details</Text>
          <Text style={s.label}>Mobile Number</Text>
          <TextInput style={s.input} value={editPhone} onChangeText={setEditPhone} keyboardType="numeric" maxLength={10} placeholderTextColor="#64748B" />
          <Text style={s.label}>Truck Number</Text>
          <TextInput style={s.input} value={editTruckId} onChangeText={setEditTruckId} autoCapitalize="characters" placeholderTextColor="#64748B" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity style={s.modalBtnCancel} onPress={() => setEditModalVisible(false)}><Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[s.modalBtnSave, {backgroundColor: '#10B981'}]} onPress={saveEdit} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>}</TouchableOpacity>
          </View>
        </View></View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, backgroundColor: '#1E293B', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  title: { fontSize: 20, fontWeight: '900', color: '#F8FAFC' }, 
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#EF4444', padding: 8, borderRadius: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, marginBottom: 15, height: 45, borderWidth: 1, borderColor: '#334155' },
  searchInput: { flex: 1, color: '#F8FAFC', paddingHorizontal: 10, fontSize: 15 },
  addBtn: { backgroundColor: '#2563EB', padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  addBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 5 },
  card: { backgroundColor: '#1E293B', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  avatar: { width: 40, height: 40, backgroundColor: '#1E3A8A', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 18, fontWeight: 'bold', color: '#60A5FA' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', textTransform: 'capitalize' },
  roleTxt: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  expiryTxt: { fontSize: 11, marginTop: 4, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10, marginTop: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#334155' },
  actionTxt: { color: '#CBD5E1', fontSize: 10, marginLeft: 4, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#F8FAFC' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#CBD5E1', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#0F172A', color: '#F8FAFC' },
  modalBtnCancel: { padding: 12, flex: 1, alignItems: 'center', backgroundColor: '#334155', borderRadius: 10, marginRight: 10 },
  modalBtnSave: { padding: 12, flex: 1, alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 10 }
});
