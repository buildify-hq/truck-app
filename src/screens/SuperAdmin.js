import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, TouchableOpacity, Alert, Platform, Modal, TextInput } from 'react-native';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function SuperAdmin() {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // फक्त ओनरसाठी माहिती
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerPin, setOwnerPin] = useState('');
  const [truckId, setTruckId] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // फक्त ओनर दाखवण्यासाठी
        if (data.role === 'owner') {
          usersList.push({ id: doc.id, ...data, isActive: data.isActive !== false });
        }
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
    if (!ownerName || !ownerPhone || !ownerPin || !truckId) {
      return Alert.alert('Error', 'कृपया सगळी माहिती भरा (नाव, नंबर, ४-अंकी पिन, ट्रक नंबर)');
    }
    if (ownerPin.length !== 4) {
      return Alert.alert('Error', 'कृपया ४ अंकी पिन टाका');
    }

    try {
      // नावातील स्पेस काढून ईमेल तयार करणे (उदा. "Sagar Patil" => "sagarpatil@truckapp.com")
      const cleanName = ownerName.toLowerCase().replace(/\s+/g, '');
      const email = `${cleanName}@truckapp.com`;
      const password = `${ownerPin}123`; // Firebase साठी ६ अक्षरांचा पासवर्ड लागतो

      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: ownerName,          // हेच नाव लॉगिनसाठी वापरलं जाईल
        phone: ownerPhone,        
        role: "owner",            
        truckId: truckId.toUpperCase(),
        isActive: true, 
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date()
      });
      
      Alert.alert('✅ झालं', 'नवीन ओनर तयार झाला!');
      setModalVisible(false); 
      setOwnerName(''); setOwnerPhone(''); setOwnerPin(''); setTruckId('');
    } catch (e) { 
      Alert.alert('Error', e.message); 
    }
  };

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={{ flex: 1 }}>
        <Text style={s.userName}>{item.name || 'Unknown'}</Text>
        <Text style={s.roleTxt}>मो: {item.phone}</Text>
        <Text style={s.roleTxt}>ट्रक: {item.truckId}</Text>
        {item.expiryDate && <Text style={s.expiryTxt}>एक्सपायरी: {new Date(item.expiryDate).toLocaleDateString()}</Text>}
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ alignItems: 'center', marginRight: 15 }}>
          <Switch value={item.isActive} onValueChange={() => toggleStatus(item.id, item.isActive)} trackColor={{ false: "#ef4444", true: "#10B981" }} thumbColor={"#fff"} />
          <Text style={{ fontSize: 10, color: item.isActive ? '#10B981' : '#ef4444', fontWeight: 'bold' }}>{item.isActive ? 'Active' : 'Blocked'}</Text>
        </View>
        <TouchableOpacity onPress={() => deleteUser(item.id)}><Ionicons name="trash-outline" size={24} color="#ef4444" /></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View><Text style={s.title}>सुपर अॅडमिन</Text><Text style={s.subtitle}>सगळ्या ओनर्सचं कंट्रोल</Text></View>
        <TouchableOpacity onPress={() => auth.signOut()} style={s.logoutBtn}><Ionicons name="log-out-outline" size={20} color="#fff" /></TouchableOpacity>
      </View>
      
      <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)}>
        <Ionicons name="person-add" size={20} color="#fff" /><Text style={s.addBtnTxt}>नवीन ओनर ॲड करा</Text>
      </TouchableOpacity>

      <FlatList data={users} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#64748b' }}>कोणतेही ओनर सापडले नाहीत.</Text>} />
      
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalBg}><View style={s.modalBox}>
          <Text style={s.modalTitle}>नवीन ओनर तयार करा</Text>
          
          <Text style={s.label}>ओनरचं नाव (लॉगिनसाठी)</Text>
          <TextInput style={s.input} value={ownerName} onChangeText={setOwnerName} placeholder="उदा. सागर" placeholderTextColor="#94A3B8" />
          
          <Text style={s.label}>मोबाईल नंबर</Text>
          <TextInput style={s.input} value={ownerPhone} onChangeText={setOwnerPhone} keyboardType="numeric" maxLength={10} placeholder="उदा. 9876543210" placeholderTextColor="#94A3B8" />
          
          <Text style={s.label}>४-अंकी पिन</Text>
          {/* ⚡️ इथे secureTextEntry आणि color मुळे डॉट्स व्यवस्थित दिसतील */}
          <TextInput style={s.input} value={ownerPin} onChangeText={setOwnerPin} secureTextEntry={true} keyboardType="numeric" maxLength={4} placeholder="उदा. 1234" placeholderTextColor="#94A3B8" />
          
          <Text style={s.label}>ट्रक नंबर</Text>
          <TextInput style={s.input} value={truckId} onChangeText={setTruckId} autoCapitalize="characters" placeholder="उदा. MH-12-AB-1234" placeholderTextColor="#94A3B8" />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity style={s.modalBtnCancel} onPress={() => setModalVisible(false)}><Text style={{ color: '#64748b', fontWeight: 'bold' }}>रद्द करा</Text></TouchableOpacity>
            <TouchableOpacity style={s.modalBtnSave} onPress={addNewOwner}><Text style={{ color: '#fff', fontWeight: 'bold' }}>तयार करा</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, backgroundColor: '#1E293B', padding: 16, borderRadius: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' }, subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  logoutBtn: { backgroundColor: '#EF4444', padding: 10, borderRadius: 8 },
  addBtn: { backgroundColor: '#2563EB', padding: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  addBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', textTransform: 'capitalize' },
  roleTxt: { fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: '600' },
  expiryTxt: { fontSize: 12, color: '#ef4444', marginTop: 4, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#fff', padding: 20, borderRadius: 12 }, modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1E293B' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 5, marginTop: 10 },
  // ⚡️ खाली input मध्ये color: '#000' टाकलाय, जेणेकरून मजकूर काळा दिसेल आणि पांढरा नाही
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F8FAFC', color: '#000' }, 
  modalBtnCancel: { padding: 12, flex: 1, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, marginRight: 10 },
  modalBtnSave: { padding: 12, flex: 1, alignItems: 'center', backgroundColor: '#3B82F6', borderRadius: 8 }
});
