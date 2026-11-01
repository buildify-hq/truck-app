import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { Ionicons } from '@expo/vector-icons';

export default function SuperAdmin() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role !== 'superadmin') {
          usersList.push({ id: doc.id, ...data, isActive: data.isActive !== false });
        }
      });
      setUsers(usersList);
    });
    return () => unsubscribe();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try { 
      await updateDoc(doc(db, "users", id), { isActive: !currentStatus }); 
    } catch (e) { 
      if (Platform.OS === 'web') window.alert(e.message); else Alert.alert('Error', e.message); 
    }
  };

  // 🔥 डिलीट फंक्शन ब्राउझरवर पण चालण्यासाठी फिक्स केलंय
  const deleteUser = async (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm("हा युझर कायमचा डिलीट करायचा का?")) {
        try { await deleteDoc(doc(db, "users", id)); } 
        catch (e) { window.alert(e.message); }
      }
    } else {
      Alert.alert("युझर डिलीट करायचा?", "हा युझर कायमचा डिलीट होईल.", [
        { text: "रद्द करा", style: "cancel" },
        { text: "हो, डिलीट करा", style: "destructive", onPress: async () => {
            try { await deleteDoc(doc(db, "users", id)); } 
            catch (e) { Alert.alert('Error', e.message); }
        }}
      ]);
    }
  };

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={{ flex: 1 }}>
        <Text style={s.userName}>{item.userId || item.email || 'Unknown ID'}</Text>
        <Text style={s.roleTxt}>रोल: {item.role === 'owner' ? 'ट्रक मालक' : 'ड्रायव्हर'}</Text>
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ alignItems: 'center', marginRight: 15 }}>
          <Switch value={item.isActive} onValueChange={() => toggleStatus(item.id, item.isActive)} trackColor={{ false: "#ef4444", true: "#10B981" }} thumbColor={"#fff"} />
          <Text style={{ fontSize: 10, color: item.isActive ? '#10B981' : '#ef4444', marginTop: 5, fontWeight: 'bold' }}>{item.isActive ? 'Active' : 'Blocked'}</Text>
        </View>
        
        <TouchableOpacity onPress={() => deleteUser(item.id)} style={{ padding: 5 }}>
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>सुपर अॅडमिन</Text>
          <Text style={s.subtitle}>सगळ्या ग्राहकांचं कंट्रोल</Text>
        </View>
        <TouchableOpacity onPress={() => signOut(auth)} style={s.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList 
        data={users} 
        keyExtractor={(item) => item.id} 
        renderItem={renderItem} 
        contentContainerStyle={{ paddingBottom: 20 }} 
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#64748b' }}>कोणतेही ग्राहक सापडले नाहीत.</Text>} 
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: '#1E293B', padding: 16, borderRadius: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  logoutBtn: { backgroundColor: '#EF4444', padding: 10, borderRadius: 8 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', textTransform: 'capitalize' },
  roleTxt: { fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: '600' }
});
