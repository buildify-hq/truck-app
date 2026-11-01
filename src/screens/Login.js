import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const showAlert = (title, msg) => {
    if (Platform.OS === 'web') window.alert(`${title}: ${msg}`);
    else Alert.alert(title, msg);
  };

  const handleAuth = async () => {
    if (!userId || !password) return showAlert('Error', 'कृपया ID आणि पासवर्ड भरा');
    
    setLoading(true);
    const dummyEmail = `${userId.toLowerCase().trim()}@truckapp.com`;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, dummyEmail, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, dummyEmail, password);
        const assignedRole = userId.toLowerCase() === 'admin' ? 'superadmin' : 'owner';
        
        await setDoc(doc(db, "users", userCredential.user.uid), {
          userId: userId.toLowerCase().trim(),
          role: assignedRole,
          isActive: true,
          createdAt: new Date()
        });
      }
    } catch (error) {
      let msg = error.message;
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found')) msg = 'चुकीचा ID किंवा पासवर्ड! किंवा तुम्ही साइन अप केलेलं नाहीये.';
      if (msg.includes('auth/email-already-in-use')) msg = 'हा ID आधीच वापरात आहे, कृपया दुसरा ID टाका किंवा लॉगिन करा.';
      if (msg.includes('auth/weak-password')) msg = 'पासवर्ड कमीत कमी ६ अक्षरांचा असावा.';
      showAlert('Error', msg);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        
        <View style={s.logoBox}>
          <Ionicons name="bus" size={80} color="#2563EB" />
          <Text style={s.title}>ट्रक हिशोब</Text>
          <Text style={s.subtitle}>तुमचा व्यवसाय, आमचं ॲप</Text>
        </View>

        <View style={s.form}>
          {/* 'sagar' चं उदाहरण काढून टाकलंय */}
          <Text style={s.label}>तुमचा ID</Text>
          <TextInput 
            style={s.input} 
            placeholder="उदा. admin / 101" 
            placeholderTextColor="#94a3b8" 
            value={userId} 
            onChangeText={setUserId} 
            autoCapitalize="none" 
            color="#000" // ⚫ काळा रंग 
          />

          <Text style={s.label}>पासवर्ड (Password / PIN)</Text>
          <TextInput 
            style={s.input} 
            placeholder="तुमचा पासवर्ड टाका" 
            placeholderTextColor="#94a3b8" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            color="#000" // ⚫ काळा रंग 
          />

          <TouchableOpacity style={s.btn} onPress={handleAuth} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnTxt}>{isLogin ? 'लॉगिन करा' : 'नवीन खातं तयार करा'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setUserId(''); setPassword(''); }} style={s.toggleBtn}>
            <Text style={s.toggleTxt}>{isLogin ? "नवीन आहात? इथे साइन अप करा" : "आधीच खातं आहे? लॉगिन करा"}</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', padding: 20 },
  logoBox: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1E293B', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 5 },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 8, marginTop: 15 },
  input: { 
    borderWidth: 1, 
    borderColor: '#cbd5e1', 
    borderRadius: 10, 
    padding: 15, 
    fontSize: 16, 
    backgroundColor: '#F8FAFC',
    color: '#000000', // ⚫ पांढऱ्या रंगाचा प्रॉब्लेम फिक्स करण्यासाठी
  },
  btn: { backgroundColor: '#2563EB', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  btnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  toggleBtn: { marginTop: 20, alignItems: 'center', paddingBottom: 20 },
  toggleTxt: { color: '#2563EB', fontWeight: 'bold', fontSize: 14 }
});
