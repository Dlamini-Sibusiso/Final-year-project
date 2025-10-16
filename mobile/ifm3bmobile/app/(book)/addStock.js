import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, FlatList, Alert, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import axios from 'axios';
import styles from '../../assets/style/styles';
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

  //Adding stock and quantity to list
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
          quantity: qty
        });

      setSelectedStockId('');
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
        setSelectedStockId('');
      setSelectedQuantity('');
      fetchStocks();
      fetchStaging();
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
          quantity: qty
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
      //Alert.alert("Cancelled", "Stock selections have been rolled back.");
      router.back();
    } catch (err) {
      console.error("Cancel error", err);
      Alert.alert("Cancel failed", err.response?.data || err.message);
    }
  };

  return (
    <SafeAreaView style={styles.containerS}>
      <Text style={styles.headerS}>Add Stock to Booking</Text>
      
      <Text style={styles.labelS}>Select Stock:</Text>
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

      <TextInput placeholder="Enter quantity" keyboardType="numeric" value={selectedQuantity} onChangeText={setSelectedQuantity} style={styles.inputS}/>

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.buttonTextS}>Add to Selection</Text>
      </TouchableOpacity>

      <Text style={styles.subHeader}>Current Selections:</Text>
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

