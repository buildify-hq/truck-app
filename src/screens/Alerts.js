
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, addEntry, deleteEntry } from '../storage';

export default function Alerts() {
  const [name, setName] = useState('');
    const [date, setDate] = useState('');
      const [list, setList] = useState([]);

        const load = async () => setList(await loadData('ALERTS'));
          useFocusEffect(useCallback(() => { load(); }, []));

            const save = async () => {
                if (!name || !date) return Alert.alert('टीप', 'नाव आणि तारीख (YYYY-MM-DD) भरा');
                    await addEntry('ALERTS', { name, date });
                        setName(''); setDate('');
                            load();
                              };

                                const daysLeft = (d) => Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));

                                  return (
                                      <View style={s.c}>
                                            <View style={s.form}>
                                                    <TextInput style={s.input} placeholder="उदा. इन्शुरन्स / PUC / फिटनेस" value={name} onChangeText={setName} />
                                                            <TextInput style={s.input} placeholder="तारीख (2026-12-31)" value={date} onChangeText={setDate} />
                                                                    <TouchableOpacity style={s.btn} onPress={save}>
                                                                              <Text style={s.btnTxt}>रिमाइंडर सेट करा</Text>
                                                                                      </TouchableOpacity>
                                                                                            </View>
                                                                                                  <FlatList
                                                                                                          data={list} keyExtractor={(i) => i.id}
                                                                                                                  renderItem={({ item }) => {
                                                                                                                            const d = daysLeft(item.date);
                                                                                                                                      const color = d < 0 ? '#e74c3c' : d <= 15 ? '#f39c12' : '#27ae60';
                                                                                                                                                const msg = d < 0 ? '❌ संपली!' : d <= 15 ? `⚠️ फक्त ${d} दिवस!` : `✅ ${d} दिवस बाकी`;
                                                                                                                                                          return (
                                                                                                                                                                      <View style={s.row}>
                                                                                                                                                                                    <View style={{ flex: 1 }}>
                                                                                                                                                                                                    <Text style={s.rowT}>{item.name}</Text>
                                                                                                                                                                                                                    <Text style={s.rowD}>{item.date}</Text>
                                                                                                                                                                                                                                    <Text style={{ color, fontWeight: 'bold', marginTop: 4 }}>{msg}</Text>
                                                                                                                                                                                                                                                  </View>
                                                                                                                                                                                                                                                                <TouchableOpacity onPress={async () => setList(await deleteEntry('ALERTS', item.id))}>
                                                                                                                                                                                                                                                                                <Text style={s.del}>काढा</Text>
                                                                                                                                                                                                                                                                                              </TouchableOpacity>
                                                                                                                                                                                                                                                                                                          </View>
                                                                                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                                                                                            }}
                                                                                                                                                                                                                                                                                                                                  />
                                                                                                                                                                                                                                                                                                                                      </View>
                                                                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                                                        const s = StyleSheet.create({
                                                                                                                                                                                                                                                                                                                                          c: { flex: 1, backgroundColor: '#ecf0f1', padding: 12 },
                                                                                                                                                                                                                                                                                                                                            form: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
                                                                                                                                                                                                                                                                                                                                              input: { borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 8, padding: 10, marginBottom: 8 },
                                                                                                                                                                                                                                                                                                                                                btn: { backgroundColor: '#8e44ad', padding: 12, borderRadius: 8, alignItems: 'center' },
                                                                                                                                                                                                                                                                                                                                                  btnTxt: { color: '#fff', fontWeight: 'bold' },
                                                                                                                                                                                                                                                                                                                                                    row: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 6, flexDirection: 'row' },
                                                                                                                                                                                                                                                                                                                                                      rowT: { fontWeight: '600', fontSize: 15 },
                                                                                                                                                                                                                                                                                                                                                        rowD: { fontSize: 12, color: '#7f8c8d' },
                                                                                                                                                                                                                                                                                                                                                          del: { color: '#e74c3c', fontWeight: 'bold', fontSize: 13 },
                                                                                                                                                                                                                                                                                                                                                          });import