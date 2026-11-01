import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, Share, Platform, Modal, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, orderBy, limit, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { loadData, getActiveTruck, setActiveTruck, getTrucks, addTruck, deleteTruck } from '../storage';

export default function Dashboard() {
  const [stats, setStats] = useState({ income: 0, expense: 0, profit: 0, pending: 0 });
  const [fuelAlerts, setFuelAlerts] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [activeTruck, setActiveTruckState] = useState('MH-12-AB-1234');
  const [trucksList, setTrucksList] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTruckId, setNewTruckId] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // रिअल-टाइम अलर्ट
  useEffect(() => {
    const q = query(collection(db, "fuelAlerts"), orderBy("timestamp", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alerts = [];
      snapshot.forEach((doc) => alerts.push({ id: doc.id, ...doc.data() }));
      if (alerts.length > 0) setFuelAlerts(alerts);
    });
    return () => unsubscribe();
  }, []);

  // अलर्ट पुसण्याचं फंक्शन (Firebase मधून डिलीट करण्यासाठी)
  const clearAlerts = async () => {
    try {
      const q = query(collection(db, "fuelAlerts"));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (document) => {
        await deleteDoc(doc(db, "fuelAlerts", document.id));
      });
      setFuelAlerts([]);
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const calc = async () => {
    setRefresh(true);
    const currentTruck = await getActiveTruck();
    setActiveTruckState(currentTruck);
    setTrucksList(await getTrucks());

    const filterByTruck = (data) => data.filter(item => item.truckId === currentTruck || !item.truckId);
    const kargo = filterByTruck(await loadData('KARGO'));
    const fuel = filterByTruck(await loadData('FUEL'));
    const driver = filterByTruck(await loadData('DRIVER'));
    const exp = filterByTruck(await loadData('EXPENSES'));

    const income = kargo.reduce((s, k) => s + Number(k.amount || 0), 0);
    const comm = kargo.reduce((s, k) => s + Number(k.commission || 0), 0);
    const pend = kargo.reduce((s, k) => s + Number(k.pending || 0), 0);
    const fuelCost = fuel.reduce((s, f) => s + Number(f.amount || 0), 0);
    const drvCost = driver.reduce((s, d) => s + Number(d.amount || 0), 0);
    const otherCost = exp.reduce((s, e) => s + Number(e.amount || 0), 0);

    const totalExpense = fuelCost + drvCost + comm + otherCost;
    setStats({ income, expense: totalExpense, profit: income - totalExpense, pending: pend });
    setRefresh(false);
  };

  useFocusEffect(useCallback(() => { calc(); }, []));

  const handleAddTruck = async () => {
    if (!newTruckId) return;
    await addTruck(newTruckId.toUpperCase());
    await setActiveTruck(newTruckId.toUpperCase());
    setNewTruckId('');
    setAddModalVisible(false);
    calc();
  };

  const confirmDelete = async () => {
    if (trucksList.length <= 1) {
      setDeleteModalVisible(false);
      return Alert.alert('Error', 'कमीत कमी एक ट्रक असणं गरजेचं आहे.');
    }
    await deleteTruck(activeTruck);
    const updated = trucksList.filter(t => t !== activeTruck);
    setTrucksList(updated);
    if (updated.length > 0) {
      setActiveTruckState(updated[0]);
      await setActiveTruck(updated[0]);
    }
    setDeleteModalVisible(false);
    setTimeout(() => calc(), 500);
  };

  return (
    <ScrollView style={s.c} refreshControl={<RefreshControl refreshing={refresh} onRefresh={calc} />}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>मालक डॅशबोर्ड</Text>
        <TouchableOpacity onPress={() => signOut(auth)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8 }}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" /><Text style={{ color: '#EF4444', fontWeight: 'bold', marginLeft: 5 }}>लॉगआउट</Text>
        </TouchableOpacity>
      </View>

      <View style={s.truckHeader}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={s.truckLabel}>सध्याचा ट्रक:</Text>
            <TouchableOpacity onPress={() => setDeleteModalVisible(true)}><Ionicons name="trash-outline" size={22} color="#ef4444" /></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 5 }}>
            {trucksList.map(truck => (
              <TouchableOpacity key={truck} style={[s.truckBtn, activeTruck === truck && s.truckBtnActive]} onPress={() => { setActiveTruck(truck); calc(); }}>
                <Text style={[s.truckBtnTxt, activeTruck === truck && { color: '#fff' }]}>{truck}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.addTruckBtn} onPress={() => setAddModalVisible(true)}>
              <Ionicons name="add" size={18} color="#3B82F6" /><Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>नवीन</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {fuelAlerts.length > 0 && (
        <View style={s.alertBox}>
          <Ionicons name="warning" size={24} color="#D97706" />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={s.alertTitle}>🚨 डिझेल अलर्ट्स (Realtime)</Text>
            {fuelAlerts.map((a) => <Text key={a.id} style={s.alertTxt}>{a.time}</Text>)}
          </View>
          <TouchableOpacity onPress={clearAlerts} style={{ padding: 5 }}>
            <Ionicons name="close-circle" size={26} color="#D97706" />
          </TouchableOpacity>
        </View>
      )}

      <View style={s.grid}>
        <Card title="एकूण कमाई" value={stats.income} color="#10B981" icon="cash-outline" bg="#ECFDF5" />
        <Card title="एकूण खर्च" value={stats.expense} color="#EF4444" icon="trending-down-outline" bg="#FEF2F2" />
        <Card title="निव्वळ नफा" value={stats.profit} color="#3B82F6" icon="trending-up-outline" bg="#EFF6FF" />
        <Card title="येणं बाकी" value={stats.pending} color="#F59E0B" icon="time-outline" bg="#FFFBEB" />
      </View>

      <TouchableOpacity style={s.shareBtn} onPress={() => Share.share({ message: `🚚 *${activeTruck} हिशोब*\nकमाई: ₹${stats.income}\nखर्च: ₹${stats.expense}\nनफा: ₹${stats.profit}` })}>
        <Ionicons name="logo-whatsapp" size={22} color="#fff" /><Text style={s.shareBtnTxt}>हिशोब WhatsApp वर शेअर करा</Text>
      </TouchableOpacity>

      {/* Add Truck Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={s.modalBg}><View style={s.modalBox}><Text style={s.modalTitle}>नवीन ट्रकचा नंबर टाका</Text>
          <TextInput style={s.modalInput} placeholder="उदा. MH-14-XY-9876" value={newTruckId} onChangeText={setNewTruckId} autoCapitalize="characters" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
            <TouchableOpacity style={s.modalBtnCancel} onPress={() => setAddModalVisible(false)}><Text style={{ color: '#64748b', fontWeight: 'bold' }}>रद्द करा</Text></TouchableOpacity>
            <TouchableOpacity style={s.modalBtnSave} onPress={handleAddTruck}><Text style={{ color: '#fff', fontWeight: 'bold' }}>जोडा</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>

      {/* Delete Truck Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={s.modalBg}><View style={s.modalBox}><Text style={s.modalTitle}>ट्रक डिलीट करायचा का?</Text>
          <Text style={{ color: '#64748b', marginBottom: 15 }}>तुम्ही {activeTruck} डिलीट करत आहात. या ट्रकचा सगळा हिशोब पुसला जाईल!</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
            <TouchableOpacity style={s.modalBtnCancel} onPress={() => setDeleteModalVisible(false)}><Text style={{ color: '#64748b', fontWeight: 'bold' }}>रद्द करा</Text></TouchableOpacity>
            <TouchableOpacity style={[s.modalBtnSave, { backgroundColor: '#ef4444' }]} onPress={confirmDelete}><Text style={{ color: '#fff', fontWeight: 'bold' }}>हो, डिलीट करा</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>
    </ScrollView>
  );
}

function Card({ title, value, color, icon, bg }) {
  return (
    <View style={[s.card, { backgroundColor: bg }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons name={icon} size={20} color={color} /><Text style={[s.cardTitle, { color }]}>{title}</Text>
      </View>
      <Text style={[s.cardVal, { color }]}>₹ {value.toLocaleString('en-IN')}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  truckHeader: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 15, elevation: 2 },
  truckLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  truckBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  truckBtnActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  truckBtnTxt: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
  addTruckBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
  cardVal: { fontSize: 22, fontWeight: 'bold' },
  shareBtn: { backgroundColor: '#25D366', padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 4 },
  shareBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  alertBox: { backgroundColor: '#FEF3C7', padding: 16, borderRadius: 12, flexDirection: 'row', marginBottom: 20, borderWidth: 1, borderColor: '#FDE68A', alignItems: 'center' },
  alertTitle: { fontWeight: 'bold', color: '#B45309', fontSize: 15 },
  alertTxt: { color: '#92400E', fontSize: 12, marginTop: 2 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1E293B' },
  modalInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F8FAFC' },
  modalBtnCancel: { padding: 12, flex: 1, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, marginRight: 10 },
  modalBtnSave: { padding: 12, flex: 1, alignItems: 'center', backgroundColor: '#3B82F6', borderRadius: 8 }
});
