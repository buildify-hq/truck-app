import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveData = async (key, data) => {
  try { await AsyncStorage.setItem(key, JSON.stringify(data)); }
    catch (e) { console.log(e); }
    };

    export const loadData = async (key) => {
      try {
          const v = await AsyncStorage.getItem(key);
              return v ? JSON.parse(v) : [];
                } catch (e) { return []; }
                };

                export const addEntry = async (key, entry) => {
                  const list = await loadData(key);
                    const updated = [{ id: Date.now().toString(), ...entry }, ...list];
                      await saveData(key, updated);
                        return updated;
                        };

                        export const deleteEntry = async (key, id) => {
                          const list = await loadData(key);
                            const updated = list.filter((e) => e.id !== id);
                              await saveData(key, updated);
                                return updated;
                                };