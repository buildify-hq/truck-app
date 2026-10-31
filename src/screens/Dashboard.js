import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
                            const alerts = await loadData('FUEL_LOW');

                                const income = kargo.reduce((s, k) => s + Number(k.amount || 0), 0);
                                    const comm = kargo.reduce((s, k) => s + Number(k.commission || 0), 0);
                                        const pend = kargo.reduce((s, k) => s + Number(k.pending || 0), 0);
                                            const fuelCost = fuel.reduce((s, f) => s + Number(f.amount || 0), 0);
                                                const drvCost = driver.reduce((s, d) => s + Number(d.amount || 0), 0);

                                                    setStats({ income, expense: fuelCost + drvCost + comm, profit: income - fuelCost - drvCost - comm, pending: pend });
                                                        setFuelAlerts(alerts.slice(0, 3));
                                                            setRefresh(false);
                                                              };

                                                                useFocusEffect(useCallback(() => { calc(); }, []));

                                                                  const sendLow = async () => {
                                                                      await addEntry('FUEL_LOW', { time: new Date().toLocaleString() });
                                                                          Alert.alert('✅ अलर्ट पाठवला', 'मालकाला कळवलं (Firebase नंतर जोडू — सध्या ॲपमध्ये सेव्ह)');
                                                                              calc();
                                                                                };

                                                                                  return (
                                                                                      <ScrollView style={s.c} refreshControl={<RefreshControl refreshing={refresh} onRefresh={calc} />}>
                                                                                            {fuelAlerts.length > 0 && (
                                                                                                    <View style={s.alertBox}>
                                                                                                              <Text style={s.alertTitle}>⚠️ डिझेल अलर्ट्स</Text>
                                                                                                                        {fuelAlerts.map((a) => <Text key={a.id} style={s.alertTxt}>{a.time}</Text>)}
                                                                                                                                </View>
                                                                                                                                      )}

                                                                                                                                            <Card title="एकूण कमाई" value={stats.income} color="#27ae60" icon="💰" />
                                                                                                                                                  <Card title="एकूण खर्च" value={stats.expense} color="#e74c3c" icon="💸" />
                                                                                                                                                        <Card title="निव्वळ नफा" value={stats.profit} color="#2980b9" icon="📈" />
                                                                                                                                                              <Card title="येणं बाकी" value={stats.pending} color="#f39c12" icon="⏳" />

                                                                                                                                                                    <TouchableOpacity style={s.lowBtn} onPress={sendLow}>
                                                                                                                                                                            <Text style={s.lowBtnTxt}>🚨 Fuel Low — मालकाला कळवा</Text>
                                                                                                                                                                                  </TouchableOpacity>
                                                                                                                                                                                      </ScrollView>
                                                                                                                                                                                        );
                                                                                                                                                                                        }

                                                                                                                                                                                        function Card({ title, value, color, icon }) {
                                                                                                                                                                                          return (
                                                                                                                                                                                              <View style={[s.card, { borderLeftColor: color }]}>
                                                                                                                                                                                                    <Text style={{ fontSize: 32, marginRight: 15 }}>{icon}</Text>
                                                                                                                                                                                                          <View style={{ flex: 1 }}>
                                                                                                                                                                                                                  <Text style={s.cardTitle}>{title}</Text>
                                                                                                                                                                                                                          <Text style={[s.cardVal, { color }]}>₹ {value.toLocaleString('en-IN')}</Text>
                                                                                                                                                                                                                                </View>
                                                                                                                                                                                                                                    </View>
                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                      const s = StyleSheet.create({
                                                                                                                                                                                                                                        c: { flex: 1, backgroundColor: '#ecf0f1', padding: 12 },
                                                                                                                                                                                                                                          card: { backgroundColor: '#fff', padding: 18, marginVertical: 8, borderRadius: 10, borderLeftWidth: 6, flexDirection: 'row', alignItems: 'center', elevation: 3 },
                                                                                                                                                                                                                                            cardTitle: { fontSize: 15, color: '#7f8c8d', marginBottom: 4 },
                                                                                                                                                                                                                                              cardVal: { fontSize: 24, fontWeight: 'bold' },
                                                                                                                                                                                                                                                lowBtn: { backgroundColor: '#e74c3c', padding: 16, borderRadius: 10, marginTop: 15, alignItems: 'center' },
                                                                                                                                                                                                                                                  lowBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
                                                                                                                                                                                                                                                    alertBox: { backgroundColor: '#fef3e2', borderLeftWidth: 5, borderLeftColor: '#f39c12', padding: 12, borderRadius: 8, marginBottom: 10 },
                                                                                                                                                                                                                                                      alertTitle: { fontWeight: 'bold', color: '#d35400', marginBottom: 5 },
                                                                                                                                                                                                                                                        alertTxt: { color: '#7f8c8d', fontSize: 13 },
                                                                                                                                                                                                                                                        });