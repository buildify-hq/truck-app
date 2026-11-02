import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveData = async (key, data) => {
  try { await AsyncStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.log(e); }
};

export const loadData = async (key) => {
  try { const v = await AsyncStorage.getItem(key); return v ? JSON.parse(v) : []; } catch (e) { return []; }
};

export const addEntry = async (key, entry) => {
  const list = await loadData(key);
  const activeTruck = await getActiveTruck(); 
  const updated = [{ id: Date.now().toString(), truckId: activeTruck, ...entry }, ...list];
  await saveData(key, updated);
  return updated;
};

export const deleteEntry = async (key, id) => {
  const list = await loadData(key);
  const updated = list.filter((e) => e.id !== id);
  await saveData(key, updated);
  return updated;
};

export const getActiveTruck = async () => (await AsyncStorage.getItem('ACTIVE_TRUCK')) || 'MH-12-AB-1234';

export const setActiveTruck = async (id) => await AsyncStorage.setItem('ACTIVE_TRUCK', id);

export const getTrucks = async () => {
  const data = await AsyncStorage.getItem('TRUCKS');
  return data ? JSON.parse(data) : ['MH-12-AB-1234'];
};

export const addTruck = async (id) => {
  const trucks = await getTrucks();
  if (!trucks.includes(id)) { trucks.push(id); await AsyncStorage.setItem('TRUCKS', JSON.stringify(trucks)); }
};

export const deleteTruck = async (id) => {
  let trucks = await getTrucks();
  trucks = trucks.filter(t => t !== id);
  await AsyncStorage.setItem('TRUCKS', JSON.stringify(trucks));
  
  // 🚀 'MAINTENANCE' इथे ॲड केलं आहे
  const keys = ['FUEL', 'KARGO', 'DRIVER', 'EXPENSES', 'ALERTS', 'FILES', 'MAINTENANCE'];
  for (let key of keys) {
    let data = await loadData(key);
    await saveData(key, data.filter(item => item.truckId !== id));
  }
  if (await getActiveTruck() === id) await setActiveTruck(trucks[0] || 'MH-12-AB-1234');
};

export const clearAllHistory = async () => {
  // 🚀 'MAINTENANCE' इथे ॲड केलं आहे
  const keys = ['FUEL', 'KARGO', 'DRIVER', 'EXPENSES', 'ALERTS', 'FILES', 'MAINTENANCE'];
  for (let key of keys) await AsyncStorage.removeItem(key);
};
