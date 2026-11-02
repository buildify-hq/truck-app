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
    if (!name || !pin) return showAlert('Error', 'Please enter Name and PIN');
    if (pin.length !== 4) return showAlert('Error', 'PIN must be exactly 4 digits');
    
    setLoading(true);
    // नावातील स्पेस काढून ईमेल तयार करणे (उदा. "Sagar Patil" => "sagarpatil@truckapp.com")
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const dummyEmail = `${cleanName}@truckapp.com`;
    // Firebase साठी ६ अक्षरांचा पासवर्ड लागतो, म्हणून पिनसोबत 123 जोडत आहोत
    const password = `${pin}123`;

    try {
      await signInWithEmailAndPassword(auth, dummyEmail, password);
    } catch (error) {
      showAlert('Login Failed', 'Invalid Name or PIN. Please try again.'); 
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContainer} keyboardShouldPersistTaps="handled">
        
        <View style={s.logoBox}>
          <View style={s.logoCircle}><Ionicons name="bus" size={50} color="#fff" /></View>
          <Text style={s.title}>Truck App</Text>
          <Text style={s.subtitle}>Manage your business easily</Text>
        </View>
        
        <View style={s.card}>
          <Text style={s.cardTitle}>Login</Text>
          
          <Text style={s.label}>Name (ID)</Text>
          <View style={s.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#64748b" style={s.icon} />
            <TextInput 
              style={s.input} 
              placeholder="e.g. sagar or admin" 
              placeholderTextColor="#64748b" 
              value={name} 
              onChangeText={setName} 
              autoCapitalize="none" 
            />
          </View>
          
          <Text style={s.label}>4-Digit PIN</Text>
          <View style={s.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={s.icon} />
            <TextInput 
              style={s.input} 
              placeholder="e.g. 1234" 
              placeholderTextColor="#64748b" 
              value={pin} 
              onChangeText={setPin} 
              secureTextEntry 
              keyboardType="numeric" 
              maxLength={4} 
            />
          </View>
          
          <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Login</Text>}
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' }, // डार्क बॅकग्राउंड
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoBox: { alignItems: 'center', marginBottom: 30 },
  logoCircle: { width: 90, height: 90, backgroundColor: '#2563EB', borderRadius: 45, justifyContent: 'center', alignItems: 'center', elevation: 10, marginBottom: 15 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 5, fontWeight: '500' },
  card: { backgroundColor: '#1E293B', padding: 25, borderRadius: 24, elevation: 5, borderWidth: 1, borderColor: '#334155' }, // डार्क कार्ड
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#CBD5E1', marginBottom: 8, marginTop: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 15, height: 55 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#F8FAFC', fontWeight: '500' },
  btn: { backgroundColor: '#3B82F6', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 25 },
  btnTxt: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 }
});
