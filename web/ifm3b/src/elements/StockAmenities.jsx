import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StockForm from "./StockForm";
import useAuth from "../hooks/useAuth";

const StockAmenities = () => {
    const { isLoggedIn } = useAuth();//check if user is logged in or not
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [editStock, setEditStock] = useState(null);
    
    useEffect(() => {
        fetchStocks();
    }, []);
    
    const fetchStocks = async () => {
        try {
            const res = await axios.get('http://localhost:5289/api/Stocks');
            setStocks(res.data);
        } catch (err) {
            if (err.response && err.response.data)
            {
                console.error('Error while fetching stock: ', err.response.data.error);
            } else {
                console.error(err);
                alert('Error occured')
            }
        }
    };

    const handleAddAmenities = () => {
        navigate('/amenities');
    };

    const deleteStock = async (id) => {
        if (!window.confirm('Delete this stock?'))
        {
            return;
        }

        try {
            await axios.delete(`http://localhost:5289/api/Stocks/${id}`);
            setStocks(stocks.filter(s => s.stockId !== id));
        } catch (err) {
            console.error(err);
            alert('Delete failed');
        }
    };
    
    const handleEdit = (stock) => {
        setEditStock(stock);
    };
    
    const handleSaved = () => {
        setEditStock(null);
        fetchStocks();
    };
    
    return (
        <div>
            {!isLoggedIn && (
                <h1 className="alert alert-warning">"You are not logged in."</h1>
            )}

            {isLoggedIn && (
                <div className='container mt-4'>

                <button className="top-button mb-4 loginForm" onClick={handleAddAmenities}>Add Amenities</button>

                <StockForm stock={editStock} onSaved={handleSaved} onCancel={() => setEditStock(null)} />
                    <table className="table-light table table-bordered mt-4">
                        <thead>
                            <tr>
                                <th>Stock Name</th>
                                <th>Available</th>
                                <th>Stock When Full</th>
                                <th>Report</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {stocks.map(stk => (
                                <tr key={stk.stockId}>
                                    <td>{stk.stockId}</td>
                                    <td>{stk.stockAvailable}</td>
                                    <td>{stk.estimatedFull}</td>
                                    <td>{stk.stockReport}</td>
                                    <td>
                                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(stk)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => deleteStock(stk.stockId)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default StockAmenities;