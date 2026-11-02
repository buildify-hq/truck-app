import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const showAlert = (title, msg) => {
    if (Platform.OS === 'web') window.alert(`${title}: ${msg}`); else Alert.alert(title, msg);
  };

  const handleLogin = async () => {
    if (!name || !pin) return showAlert('Error', 'कृपया नाव आणि पिन भरा');
    if (pin.length !== 4) return showAlert('Error', 'कृपया ४-अंकी पिन टाका');
    
    setLoading(true);
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const dummyEmail = `${cleanName}@truckapp.com`;
    const password = `${pin}123`;

    try {
      await signInWithEmailAndPassword(auth, dummyEmail, password);
    } catch (error) {
      let msg = error.message;
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found')) {
        msg = 'चुकीचं नाव किंवा पिन! कृपया पुन्हा प्रयत्न करा.';
      }
      showAlert('Error', msg); 
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* App Logo & Title */}
        <View style={s.logoBox}>
          <View style={s.logoCircle}>
            <Ionicons name="bus" size={50} color="#fff" />
          </View>
          <Text style={s.title}>ट्रक हिशोब</Text>
          <Text style={s.subtitle}>तुमचा व्यवसाय, आमची जबाबदारी</Text>
        </View>

        {/* Login Form Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>लॉगिन करा</Text>
          
          <Text style={s.label}>तुमचं नाव (ID)</Text>
          <View style={s.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#64748b" style={s.icon} />
            <TextInput 
              style={s.input} 
              placeholder="उदा. sagar किंवा admin" 
              placeholderTextColor="#94a3b8" 
              value={name} 
              onChangeText={setName} 
              autoCapitalize="none" 
            />
          </View>
          
          <Text style={s.label}>४-अंकी पिन</Text>
          <View style={s.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={s.icon} />
            <TextInput 
              style={s.input} 
              placeholder="उदा. 1234" 
              placeholderTextColor="#94a3b8" 
              value={pin} 
              onChangeText={setPin} 
              secureTextEntry 
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          
          <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>लॉगिन करा</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' }, // डार्क ब्लू बॅकग्राउंड
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoBox: { alignItems: 'center', marginBottom: 30 },
  logoCircle: { width: 90, height: 90, backgroundColor: '#2563EB', borderRadius: 45, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10, marginBottom: 15 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 5, fontWeight: '500' },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginTop: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, height: 55 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  btn: { backgroundColor: '#2563EB', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 25, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnTxt: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 }
});
