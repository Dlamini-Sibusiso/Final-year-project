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

    const [statMasg, setStatMsg] = useState('');

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
            console.log("Fetched staging:", res.data); 
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
    setStatMsg('');

    if (!selectedStockId || !selectedQuantity) 
    {
      setStatMsg("Select stock and quantity first");
      return;
    }

    const qty = parseInt(selectedQuantity);
    if (isNaN(qty) || qty <= 0) 
    {
      setStatMsg("Quantity must be a positive number");
      return;
    }

    try {
      await axios.post(`http://localhost:5289/api/Stocks/staging/${id}`, 
        {
          stockId: selectedStockId,
          quantity: qty
        });

      setSelectedQuantity('');
      setSelectedStockId('');
      fetchStocks();
      fetchStaging();
    } catch (err) {
      const data = err.response?.data;
      if (data?.available !== undefined) 
      {
        const { available, requested } = data;
        alert(`Insufficient stock. Only ${available} out of ${requested} available.`);
      } else {
        console.error("Error adding", err);
        setStatMsg("Error adding stock");
      }
    }
  };

 /* const handleAddPartial = async (qty) => {
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
      setStatMsg('Partial add error');
    }
  };
*/
    const handleRemove = async (stagingId) => {
      setStatMsg('');
      
      try {
        await axios.delete(`http://localhost:5289/api/Stocks/staging/${stagingId}`);
        
        fetchStocks();
        fetchStaging();
      } catch (err) {
        console.error("Error removing staging", err);
      }
    };

  const handleSubmitAll = async (e) => {
     e.preventDefault();

    try {
      await axios.post(`http://localhost:5289/api/Stocks/submit/${id}`);
      
      navigate('/history');
    } catch (err) {
      console.error("Submit error", err);
      setStatMsg('Stock not submitted');
    }
  };

  const handleCancelAll = async () => {
    
    try {
      await axios.delete(`http://localhost:5289/api/Stocks/cancel/${id}`);
      
      navigate('/history');
    } catch (err) {
      console.error("Cancel error", err);
      setStatMsg('Cancel error');
    }
  };

    return(
        <div>
            {!isLoggedIn && (
                <h1 className="alert alert-warning">"You are not logged in."</h1>
            )}

            {isLoggedIn && (
              <div className="container mt-5">
                <div className="card shadow p-4">
                    
                    {statMasg && (
                      <div className="text-danger mb-3">{statMasg}</div>
                    )}

                  <form onSubmit={handleSubmitAll}>
                    <h2 className="mb-4">Add Stork</h2>
                    <div className="mb-3">

                      <label className="form-label">Select Stock:</label>
                      <select
                        className="form-control rounded-0 mb-3"
                        value={selectedStockId}
                        onChange={(e) => setSelectedStockId(e.target.value)}
                        >
                        <option value="">-- Select Stock --</option>
                        {stocks.map((stock) => (
                            <option key={stock.stockId} value={stock.stockId}>
                              {stock.stockId} (Available: {stock.stockAvailable})
                            </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Enter Quantity:</label>
                      <input
                        type="number"
                        className="form-control"
                        value={selectedQuantity} 
                        onChange={(e) => setSelectedQuantity(e.target.value)}
                      />
                    </div>

                    <div className="d-flex gap-3">
                      <button type="button" className="btn btn-success" onClick={handleAdd}>
                        Add to Selection
                      </button>
                        
                      <button type="submit" className="btn btn-primary">
                        Submit All
                      </button>

                       <button type="button" className="btn btn-secondary" onClick={handleCancelAll}>
                          Cancel
                        </button>
                    </div>
                  </form>

                  {/*Display current staging list */}
                  {staging.length > 0 && (
                    <div className="mt-4">
                      <h5>Current Selection:</h5>
                      <ul className="list-group">
                        {staging.map((item) => (
                          <li key={item.stagingId} className="list-group-item d-flex justify-content-between">
                            <span>
                              {item.stockId} — Qty: {item.quantity}
                            </span>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemove(item.stagingId)}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
            </div>
            )}
        </div>
    )
}
export default ClerkAddStock;