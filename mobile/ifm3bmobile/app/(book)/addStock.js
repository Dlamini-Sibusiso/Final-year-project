import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, FlatList, Alert, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddStock() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const bookingId = id;

  const [stocks, setStocks] = useState([]);
  const [staging, setStaging] = useState([]);
  const [selectedStockId, setSelectedStockId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!bookingId) 
    {
      return;
    }

    fetchStocks();
    fetchStaging();
  }, [bookingId]);

  const fetchStocks = async () => {
    try {
      const res = await axios.get("http://10.0.2.2:5289/api/Stocks");
      setStocks(res.data);
    } catch (err) {
      console.error("Failed to fetch stocks", err);
    }
  };

  const fetchStaging = async () => {
    try {
      const res = await axios.get(`http://10.0.2.2:5289/api/Stocks/tempStock/${bookingId}`);
      setStaging(res.data);
    } catch (err) {
      if (err.response?.status === 404) 
      {
        setStaging([]); // Treat 404 as "no selection yet"
      } else {
        console.error("Failed to fetch staging", err);
      }
    }
  };

  const handleAdd = async () => {
    if (!selectedStockId || !selectedQuantity) 
    {
      Alert.alert("Select stock and quantity");
      return;
    }

    const qty = parseInt(selectedQuantity);
    if (isNaN(qty) || qty <= 0) 
    {
      Alert.alert("Quantity must be a positive number");
      return;
    }

    try {
      await axios.post(`http://10.0.2.2:5289/api/Stocks/staging/${bookingId}`, 
        {
          stockId: selectedStockId,
          quantity: qty,
          userId: "someUser"
        });

      setSelectedQuantity('');
      fetchStocks();
      fetchStaging();
    } catch (err) {
      const data = err.response?.data;
      if (data?.available !== undefined) 
      {
        const { available, requested } = data;
        Alert.alert("Insufficient stock", `Only ${available} out of ${requested} available`,
        [{ text: `Add ${available}`, onPress: () => handleAddPartial(available) },
          { text: `Add unfulfilled (${requested - available}) to NewStock`,
            onPress: () => {  if (available > 0)
                              {
                                handleAddPartial(available); 
                              }}
          },
          { text: "Cancel", style: "cancel" }
        ]);
      } else {
        console.error("Error adding", err);
        Alert.alert("Error adding stock", err.toString());
      }
    }
  };

  const handleAddPartial = async (qty) => {
    try {
      await axios.post(`http://10.0.2.2:5289/api/Stocks/staging/${bookingId}`, 
        {
          stockId: selectedStockId,
          quantity: qty,
          userId: "someUser"
        });
        
      fetchStocks();
      fetchStaging();
    } catch (err) {
      console.error("Partial add error", err);
    }
  };

  const handleRemove = async (stagingId) => {
    try {
      await axios.delete(`http://10.0.2.2:5289/api/Stocks/staging/${stagingId}`);
      
      fetchStocks();
      fetchStaging();
    } catch (err) {
      console.error("Error removing staging", err);
    }
  };

  const handleSubmitAll = async () => {
    try {
      await axios.post(`http://10.0.2.2:5289/api/Stocks/submit/${bookingId}`);
      Alert.alert("Success", "Stocks submitted");
      router.back();
    } catch (err) {
      console.error("Submit error", err);
      Alert.alert("Submission error", err.response?.data ?? err.toString());
    }
  };

  const handleCancelAll = async () => {
    try {
      await axios.delete(`http://10.0.2.2:5289/api/Stocks/cancel/${bookingId}`);
      Alert.alert("Cancelled", "Stock selections have been rolled back.");
      router.back();
    } catch (err) {
      console.error("Cancel error", err);
      Alert.alert("Cancel failed", err.response?.data || err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Add Stock to Booking</Text>
      
      <Text style={styles.label}>Select Stock:</Text>
      <TouchableOpacity onPress={() => setShowDropdown(true)} style={styles.dropdownButton}>
        <Text style={styles.dropdownButtonText}>
          {selectedStockId ? selectedStockId : 'Select Stock'}
        </Text>
      </TouchableOpacity>

      <Modal visible={showDropdown} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <ScrollView>
              {stocks.map((stock) => (
                <Pressable key={stock.stockId} onPress={() => {setSelectedStockId(stock.stockId); setShowDropdown(false);}} style={styles.dropdownOption}>
                  <Text>
                    {stock.stockId} (Available: {stock.stockAvailable})
                  </Text>
                </Pressable>
                )
              )}
            </ScrollView>
            <Button title="Close" onPress={() => setShowDropdown(false)} />

          </View>
        </View>
      </Modal>

      <TextInput placeholder="Enter quantity" keyboardType="numeric" value={selectedQuantity} onChangeText={setSelectedQuantity} style={styles.input}/>

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add to Selection</Text>
      </TouchableOpacity>

     {/**Beta  <Text style={styles.subHeader}>Current Selections:</Text> Beta**/}
      <FlatList
        data={staging}
        keyExtractor={(item) => item.stagingId.toString() ?? `${item.stockId}-${item.quantity}`}
        renderItem={({ item }) => (
          <View style={styles.stagingItem}>
            <Text>{item.stockId} — Qty: {item.quantity}</Text>
            <Button title="Remove" onPress={() => handleRemove(item.stagingId)} />
          </View>
          )
        }
       ListEmptyComponent={<Text style={styles.emptyText}>  </Text>} 
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitAll}>
          <Text style={styles.footerBtnText}>Submit All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelAll}>
          <Text style={styles.footerBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7f9fc' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10,
    fontSize: 16, borderRadius: 6, backgroundColor: '#fff', marginVertical: 10
  },
  dropdownButton: {
    borderWidth: 1, borderColor: '#ccc', padding: 12,
    borderRadius: 6, backgroundColor: '#fff', marginBottom: 10
  },
  dropdownButtonText: { fontSize: 16, color: '#333' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center'
  },
  dropdownModal: {
    backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 8, maxHeight: 400
  },
  dropdownOption: {
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  addButton: {
    backgroundColor: '#007BFF', padding: 14,
    borderRadius: 6, alignItems: 'center', marginTop: 10
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  stagingItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomColor: '#ccc', borderBottomWidth: 1
  },
  emptyText: { color: '#888', marginTop: 10, textAlign: 'center' },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 30
  },
  submitBtn: {
    backgroundColor: 'green', padding: 14,
    borderRadius: 6, flex: 1, marginRight: 10, alignItems: 'center'
  },
  cancelBtn: {
    backgroundColor: 'red', padding: 14,
    borderRadius: 6, flex: 1, marginLeft: 10, alignItems: 'center'
  },
  footerBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});