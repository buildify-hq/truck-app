import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, addEntry, deleteEntry } from '../storage';

export default function Driver() {
  const [type, setType] = useState('पगार');
    const [amount, setAmount] = useState('');
      const [note, setNote] = useState('');
        const [list, setList] = useState([]);

          const load = async () => setList(await loadData('DRIVER'));
            useFocusEffect(useCallback(() => { load(); }, []));

              const save = async () => {
                  if (!amount) return Alert.alert('टीप', 'रक्कम भरा');
                      await addEntry('DRIVER', { type, amount, note, date: new Date().toLocaleDateString() });
                          setAmount(''); setNote('');
                              load();
                                };

                                  return (
                                      <View style={s.c}>
                                            <View style={s.form}>
                                                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                                                              {['पगार', 'उचल'].map((t) => (
                                                                          <TouchableOpacity key={t} onPress={() => setType(t)} style={[s.chip, type === t && s.chipA]}>
                                                                                        <Text style={{ color: type === t ? '#fff' : '#2c3e50' }}>{t}</Text>
                                                                                                    </TouchableOpacity>
                                                                                                              ))}
                                                                                                                      </View>
                                                                                                                              <TextInput style={s.input} placeholder="रक्कम (₹)" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                                                                                                                                      <TextInput style={s.input} placeholder="नोंद (optional)" value={note} onChangeText={setNote} />
                                                                                                                                              <TouchableOpacity style={s.btn} onPress={save}>
                                                                                                                                                        <Text style={s.btnTxt}>सेव्ह करा</Text>
                                                                                                                                                                </TouchableOpacity>
                                                                                                                                                                      </View>
                                                                                                                                                                            <FlatList
                                                                                                                                                                                    data={list} keyExtractor={(i) => i.id}
                                                                                                                                                                                            renderItem={({ item }) => (
                                                                                                                                                                                                      <View style={s.row}>
                                                                                                                                                                                                                  <View style={{ flex: 1 }}>
                                                                                                                                                                                                                                <Text style={s.rowT}>{item.type} · ₹{item.amount}</Text>
                                                                                                                                                                                                                                              <Text style={s.rowD}>{item.date} {item.note ? '· ' + item.note : ''}</Text>
                                                                                                                                                                                                                                                          </View>
                                                                                                                                                                                                                                                                      <TouchableOpacity onPress={async () => setList(await deleteEntry('DRIVER', item.id))}>
                                                                                                                                                                                                                                                                                    <Text style={s.del}>काढा</Text>
                                                                                                                                                                                                                                                                                                </TouchableOpacity>
                                                                                                                                                                                                                                                                                                          </View>
                                                                                                                                                                                                                                                                                                                  )}
                                                                                                                                                                                                                                                                                                                        />
                                                                                                                                                                                                                                                                                                                            </View>
                                                                                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                                                              const s = StyleSheet.create({
                                                                                                                                                                                                                                                                                                                                c: { flex: 1, backgroundColor: '#ecf0f1', padding: 12 },
                                                                                                                                                                                                                                                                                                                                  form: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
                                                                                                                                                                                                                                                                                                                                    input: { borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 8, padding: 10, marginBottom: 8 },
                                                                                                                                                                                                                                                                                                                                      btn: { backgroundColor: '#16a085', padding: 12, borderRadius: 8, alignItems: 'center' },
                                                                                                                                                                                                                                                                                                                                        btnTxt: { color: '#fff', fontWeight: 'bold' },
                                                                                                                                                                                                                                                                                                                                          chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2c3e50', marginRight: 8 },
                                                                                                                                                                                                                                                                                                                                            chipA: { backgroundColor: '#2c3e50' },
                                                                                                                                                                                                                                                                                                                                              row: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 6, flexDirection: 'row' },
                                                                                                                                                                                                                                                                                                                                                rowT: { fontWeight: '600', fontSize: 14 },
                                                                                                                                                                                                                                                                                                                                                  rowD: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
                                                                                                                                                                                                                                                                                                                                                    del: { color: '#e74c3c', fontWeight: 'bold', fontSize: 13 },
                                                                                                                                                                                                                                                                                                                                                    });