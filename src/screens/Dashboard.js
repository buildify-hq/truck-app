import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { loadData, addEntry } from '../storage';

export default function Dashboard() {
  const [stats, setStats] = useState({ income: 0, expense: 0, profit: 0, pending: 0 });
  const [fuelAlerts, setFuelAlerts] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const calc = async () => {
    setRefresh(true);
    const kargo = await loadData('KARGO');
    const fuel = await loadData('FUEL');
    const driver = await loadData('DRIVER');
    const exp = await loadData('EXPENSES');
    const alerts = await loadData('FUEL_LOW');

    const income = kargo.reduce((s, k) => s + Number(k.amount || 0), 0);
    const comm = kargo.reduce((s, k) => s + Number(k.commission || 0), 0);
    const pend = kargo.reduce((s, k) => s + Number(k.pending || 0), 0);
    const fuelCost = fuel.reduce((s, f) => s + Number(f.amount || 0), 0);
    const drvCost = driver.reduce((s, d) => s + Number(d.amount || 0), 0);
    const otherCost = exp.reduce((s, e) => s + Number(e.amount || 0), 0);

    const totalExpense = fuelCost + drvCost + comm + otherCost;

    setStats({ income, expense: totalExpense, profit: income - totalExpense, pending: pend });
    setFuelAlerts(alerts.slice(0, 3));
    setRefresh(false);
  };

  useFocusEffect(useCallback(() => { calc(); }, []));

  const sendLow = async () => {
    await addEntry('FUEL_LOW', { time: new Date().toLocaleString() });
    Alert.alert('✅ अलर्ट पाठवला', 'मालकाला कळवलं');
    calc();
  };

  const shareReport = async () => {
    try {
      const message = `🚚 *ट्रक हिशोब रिपोर्ट*\n\n💰 एकूण कमाई: ₹${stats.income}\n💸 एकूण खर्च: ₹${stats.expense}\n📈 निव्वळ नफा: ₹${stats.profit}\n⏳ येणं बाकी: ₹${stats.pending}\n\n(ट्रक ॲप द्वारे पाठवलेला रिपोर्ट)`;
      
      await Share.share({
        message: message,
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={s.c} refreshControl={<RefreshControl refreshing={refresh} onRefresh={calc} />}>
      {fuelAlerts.length > 0 && (
        <View style={s.alertBox}>
          <Ionicons name="warning" size={24} color="#D97706" />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={s.alertTitle}>डिझेल अलर्ट्स</Text>
            {fuelAlerts.map((a) => <Text key={a.id} style={s.alertTxt}>{a.time}</Text>)}
          </View>
        </View>
      )}

      <View style={s.grid}>
        <Card title="एकूण कमाई" value={stats.income} color="#10B981" icon="cash-outline" bg="#ECFDF5" />
        <Card title="एकूण खर्च" value={stats.expense} color="#EF4444" icon="trending-down-outline" bg="#FEF2F2" />
        <Card title="निव्वळ नफा" value={stats.profit} color="#3B82F6" icon="trending-up-outline" bg="#EFF6FF" />
        <Card title="येणं बाकी" value={stats.pending} color="#F59E0B" icon="time-outline" bg="#FFFBEB" />
      </View>

      <TouchableOpacity style={s.shareBtn} onPress={shareReport}>
        <Ionicons name="logo-whatsapp" size={22} color="#fff" />
        <Text style={s.shareBtnTxt}>हिशोब WhatsApp वर शेअर करा</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.lowBtn} onPress={sendLow}>
        <Ionicons name="warning-outline" size={22} color="#fff" />
        <Text style={s.lowBtnTxt}>Fuel Low — मालकाला कळवा</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Card({ title, value, color, icon, bg }) {
  return (
    <View style={[s.card, { backgroundColor: bg }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[s.cardTitle, { color }]}>{title}</Text>
      </View>
      <Text style={[s.cardVal, { color }]}>₹ {value.toLocaleString('en-IN')}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
  cardVal: { fontSize: 22, fontWeight: 'bold' },
  shareBtn: { backgroundColor: '#25D366', padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#25D366', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  shareBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  lowBtn: { backgroundColor: '#EF4444', padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, shadowColor: '#EF4444', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  lowBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  alertBox: { backgroundColor: '#FEF3C7', padding: 16, borderRadius: 12, flexDirection: 'row', marginBottom: 20, borderWidth: 1, borderColor: '#FDE68A' },
  alertTitle: { fontWeight: 'bold', color: '#B45309', fontSize: 15 },
  alertTxt: { color: '#92400E', fontSize: 12, marginTop: 2 }
});
