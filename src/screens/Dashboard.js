import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, Share, Platform, Modal, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, orderBy, limit, doc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { loadData, getActiveTruck, setActiveTruck, getTrucks, addTruck, deleteTruck, clearAllHistory } from '../storage';

export default function Dashboard() {
  const [stats, setStats] = useState({ income: 0, expense: 0, profit: 0, pending: 0 });
  const [fuelAlerts, setFuelAlerts] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [activeTruck, setActiveTruckState] = useState('MH-12-AB-1234');
  const [trucksList, setTrucksList] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTruckId, setNewTruckId] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [clearModalVisible, setClearModalVisible] = useState(false);

  // 🚀 अलर्ट्स फक्त सध्याच्या ट्रकसाठी लोड होतील
  useEffect(() => {
    if (!activeTruck) return;
    const q = query(
      collection(db, "fuelAlerts"), 
      where("truckId", "==", activeTruck),
      orderBy("timestamp", "desc"), 
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alerts = [];
      snapshot.forEach((doc) => alerts.push({ id: doc.id, ...doc.data() }));
      setFuelAlerts(alerts);
    });
    return () => unsubscribe();
  }, [activeTruck]);

  // 🚀 फक्त सध्याच्या ट्रकचे अलर्ट क्लिअर होतील
  const clearAlerts = async () => {
    try {
      const q = query(collection(db, "fuelAlerts"), where("truckId", "==", activeTruck));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (document) => await deleteDoc(doc(db, "fuelAlerts", document.id)));
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
    if (trucksList.length <= 1) return Alert.alert('Error', 'You must have at least one truck.');
    await deleteTruck(activeTruck);
    setDeleteModalVisible(false);
    setTimeout(() => calc(), 500);
  };

  const handleClearHistory = async () => {
    await clearAllHistory();
    setClearModalVisible(false);
    Alert.alert('Success', 'All old data has been cleared!');
    calc();
  };

  return (
    <ScrollView style={s.c} refreshControl={<RefreshControl refreshing={refresh} onRefresh={calc} tintColor="#60A5FA" />}>
      
      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F8FAFC' }}>Owner Dashboard</Text>
      </View>

      <View style={s.truckHeader}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={s.truckLabel}>Current Truck:</Text>
            <TouchableOpacity onPress={() => setDeleteModalVisible(true)}><Ionicons name="trash-outline" size={20} color="#EF4444" /></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {trucksList.map(truck => (
              <TouchableOpacity key={truck} style={[s.truckBtn, activeTruck === truck && s.truckBtnActive]} onPress={() => { setActiveTruck(truck); calc(); }}>
                <Text style={[s.truckBtnTxt, activeTruck === truck && { color: '#fff' }]}>{truck}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.addTruckBtn} onPress={() => setAddModalVisible(true)}>
              <Ionicons name="add" size={18} color="#60A5FA" /><Text style={{ color: '#60A5FA', fontWeight: 'bold' }}>New</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {fuelAlerts.length > 0 && (
        <View style={s.alertBox}>
          <Ionicons name="warning" size={24} color="#F59E0B" />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={s.alertTitle}>🚨 Fuel Alerts (Realtime)</Text>
            {fuelAlerts.map((a) => <Text key={a.id} style={s.alertTxt}>{a.time}</Text>)}
          </View>
          <TouchableOpacity onPress={clearAlerts} style={{ padding: 5 }}><Ionicons name="close-circle" size={26} color="#F59E0B" /></TouchableOpacity>
        </View>
      )}

      <View style={s.grid}>
        <Card title="Total Income" value={stats.income} color="#10B981" icon="cash-outline" bg="#064E3B" />
        <Card title="Total Expense" value={stats.expense} color="#EF4444" icon="trending-down-outline" bg="#7F1D1D" />
        <Card title="Net Profit" value={stats.profit} color="#60A5FA" icon="trending-up-outline" bg="#1E3A8A" />
        <Card title="Pending" value={stats.pending} color="#F59E0B" icon="time-outline" bg="#78350F" />
      </View>

      <TouchableOpacity style={s.shareBtn} onPress={() => Share.share({ message: `🚚 *${activeTruck} Summary*\nIncome: ₹${stats.income}\nExpense: ₹${stats.expense}\nProfit: ₹${stats.profit}\nPending: ₹${stats.pending}` })}>
        <Ionicons name="logo-whatsapp" size={22} color="#fff" /><Text style={s.shareBtnTxt}>Share Summary on WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.clearBtn} onPress={() => setClearModalVisible(true)}>
        <Ionicons name="trash" size={20} color="#EF4444" /><Text style={s.clearBtnTxt}>Clear All History</Text>
      </TouchableOpacity>

      {/* Add Truck Modal */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={s.modalBg}><View style={s.modalBox}><Text style={s.modalTitle}>Add New Truck</Text>
          <TextInput style={s.modalInput} placeholder="e.g. MH-14-XY-9876" placeholderTextColor="#64748B" value={newTruckId} onChangeText={setNewTruckId} autoCapitalize="characters" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity style={s.modalBtnCancel} onPress={() => setAddModalVisible(false)}><Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={s.modalBtnSave} onPress={handleAddTruck}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>

      {/* Delete Truck Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={s.modalBg}><View style={s.modalBox}><Text style={s.modalTitle}>Delete Truck?</Text>
          <Text style={{ color: '#94A3B8', marginBottom: 15 }}>You are deleting {activeTruck}. All data related to this truck will be lost.</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity style={s.modalBtnCancel} onPress={() => setDeleteModalVisible(false)}><Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[s.modalBtnSave, { backgroundColor: '#EF4444' }]} onPress={confirmDelete}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Yes, Delete</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>

      {/* Clear History Modal */}
      <Modal visible={clearModalVisible} transparent animationType="fade">
        <View style={s.modalBg}><View style={s.modalBox}><Text style={s.modalTitle}>Clear Data?</Text>
          <Text style={{ color: '#94A3B8', marginBottom: 15 }}>All your history will be permanently deleted!</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity style={s.modalBtnCancel} onPress={() => setClearModalVisible(false)}><Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[s.modalBtnSave, { backgroundColor: '#EF4444' }]} onPress={handleClearHistory}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Yes, Clear</Text></TouchableOpacity>
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
  c: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
  truckHeader: { backgroundColor: '#1E293B', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  truckLabel: { fontSize: 13, fontWeight: 'bold', color: '#94A3B8' },
  truckBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0F172A', marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  truckBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  truckBtnTxt: { fontSize: 13, fontWeight: 'bold', color: '#94A3B8' },
  addTruckBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E3A8A', borderWidth: 1, borderColor: '#3B82F6' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardTitle: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
  cardVal: { fontSize: 22, fontWeight: 'bold' },
  shareBtn: { backgroundColor: '#25D366', padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  shareBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  clearBtn: { marginTop: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: '#7F1D1D', borderRadius: 12 },
  clearBtnTxt: { color: '#EF4444', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  alertBox: { backgroundColor: '#78350F', padding: 16, borderRadius: 12, flexDirection: 'row', marginBottom: 20, borderWidth: 1, borderColor: '#B45309', alignItems: 'center' },
  alertTitle: { fontWeight: 'bold', color: '#FDE68A', fontSize: 15 },
  alertTxt: { color: '#FCD34D', fontSize: 12, marginTop: 2 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#F8FAFC' },
  modalInput: { borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#0F172A', color: '#F8FAFC' },
  modalBtnCancel: { padding: 12, flex: 1, alignItems: 'center', backgroundColor: '#334155', borderRadius: 10, marginRight: 10 },
  modalBtnSave: { padding: 12, flex: 1, alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 10 }
});
