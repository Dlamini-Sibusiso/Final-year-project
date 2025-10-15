import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";

const ClerkAddStock = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [stocks, setStocks] = useState([]);
    const [staging, setStaging] = useState([]);
    const [selectedStockId, setSelectedStockId] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState('');

    useEffect(() => {
        if (!id) 
        {
            return;
        }

        fetchStocks();
        fetchStaging();
    }, [id]);

    const fetchStocks = async () => {
        try {
            const res = await axios.get("http://localhost:5289/api/Stocks");
            setStocks(res.data);
        } catch (err) {
            console.error("Failed to fetch stocks", err);
        }
    };

    const fetchStaging = async () => {
        try {
            const res = await axios.get(`http://localhost:5289/api/Stocks/tempStock/${id}`);
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
      //Alert.alert("Select stock and quantity");
      return;
    }

    const qty = parseInt(selectedQuantity);
    if (isNaN(qty) || qty <= 0) 
    {
      //Alert.alert("Quantity must be a positive number");
      return;
    }

    try {
      await axios.post(`http://localhost:5289/api/Stocks/staging/${id}`, 
        {
          stockId: selectedStockId,
          quantity: qty
        });

      setSelectedQuantity('');
      fetchStocks();
      fetchStaging();
    } catch (err) {
      const data = err.response?.data;
      if (data?.available !== undefined) 
      {
        const { available, requested } = data;
        alert("Insufficient stock", `Only ${available} out of ${requested} available`,
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
        //Alert.alert("Error adding stock", err.toString());
      }
    }
  };

  const handleAddPartial = async (qty) => {
    try {
      await axios.post(`http://localhost:5289/api/Stocks/staging/${id}`, 
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
        await axios.delete(`http://localhost:5289/api/Stocks/staging/${stagingId}`);
        
        fetchStocks();
        fetchStaging();
        } catch (err) {
        console.error("Error removing staging", err);
        }
    };

  const handleSubmitAll = async () => {
    try {
      await axios.post(`http://localhost:5289/api/Stocks/submit/${id}`);
      //Alert.alert("Success", "Stocks submitted");
      //router.back();
    } catch (err) {
      console.error("Submit error", err);
      //Alert.alert("Submission error", err.response?.data ?? err.toString());
    }
  };

  const handleCancelAll = async () => {
    try {
      await axios.delete(`http://localhost:5289/api/Stocks/cancel/${id}`);
      //Alert.alert("Cancelled", "Stock selections have been rolled back.");
      //router.back();
    } catch (err) {
      console.error("Cancel error", err);
      //Alert.alert("Cancel failed", err.response?.data || err.message);
    }
  };

    return(
        <div>
            {!isLoggedIn && (
                <h1 className="alert alert-warning">"You are not logged in."</h1>
            )}

            {isLoggedIn && (
                <div className="container mt-4">
                    <h2>Clerk Add stork</h2>
                </div>
            )}
        </div>
    )
}
export default ClerkAddStock;