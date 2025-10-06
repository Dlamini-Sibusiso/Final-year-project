import React, { useEffect, useState } from "react";
import axios from "axios";

const StockForm = ({stock, onSaved, onCancel}) => {

    const [formData, setFormData] = useState({
        stockId: '',
        stockAvailable: 0,
        estimatedFull: 0,
        stockReport: ''
    });
    
    const [errorMsg, setErrors] = useState({});
    
    useEffect(() => {
        if (stock) {
            setFormData({ ...stock });
        } else {
            setFormData({
                stockId: '',
                stockAvailable: 0,
                estimatedFull: 0,
                stockReport: ''
            });
        }
    }, [stock]);
    
    const validate = () => {
        
        const errs = {};
        if (!formData.stockId.trim())
        {
            errs.msgId = 'Stock ID is required';
        }    
            
        if (formData.stockAvailable < 0)
        {
            errs.msgAvailable = 'Cannot be negative';
        }

        if (formData.estimatedFull < 0)
        {
            errs.msgEstimated = 'Cannot be negative';
        }

        return errs;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const errs = validate();
        if (Object.keys(errs).length)
        {
            setErrors(errs);
            return;
        }
        
        try {
            if (stock) {
                //update
                await axios.put(`http://localhost:2030/api/Stocks/${formData.stockId}`, formData);
                alert('Updated successfully');
            } else {
                //add
                await axios.post("http://localhost:2030/api/Stocks", formData);
                alert('Add successfully');
            }
            
            onSaved();
        } catch (err) {
            console.error(err);
            const errStatus = err.response.status;
            if (errStatus === 409)
            {
                setErrors({message : [err.response.data]})
            }
            alert('Save failed');
        }
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'stockAvailable' || name === 'estimatedFull' ? parseInt(value) : value}));
    };
    
    return (
        <form className="card card-body mb-4" style={{ maxWidth: 800, margin: 'auto' }} onSubmit={handleSubmit}>
            <h2 className="d-flex justify-content-center align-items-center mb-1">Stocks</h2>
            <div className="mb-3">
                <label className="form-label">Stock ID:</label> 
                <input className="form-control" name="stockId" value={formData.stockId} onChange={handleChange} disabled={!!stock}/>
                
                {errorMsg.msgId && (
                    <div className="text-danger">{errorMsg.msgId}</div>
                )}
            </div>
            
            <div className="mb-3">
                <label className="form-label">Stock Available:</label>
                <input type="number" className="form-control" name="stockAvailable" value={formData.stockAvailable} onChange={handleChange} min="0" required/>
                
                {errorMsg.msgAvailable && (
                    <div className="text-danger">{errorMsg.msgAvailable}</div>
                )}
            </div>
            
            <div className="mb-3">
                <label className="form-label">Estimated Full:</label>
                <input type="number" className="form-control" name="estimatedFull" value={formData.estimatedFull} onChange={handleChange} min="0" required/>
                
                {errorMsg.msgEstimated && (
                    <div className="text-danger">{errorMsg.msgEstimated}</div>
                )}
            </div>
            
            <div className="mb-3">
                <label className="form-label">Stock Report:</label>
                <textarea className="form-control" name="stockReport" value={formData.stockReport} onChange={handleChange} />
            </div>
            
            {errorMsg.message && (
                <div className="alert alert-warning">{errorMsg.message}</div>
            )}

            <button className="btn btn-success" type="submit">{stock ? 'Update' : 'Add'} Stock</button>
            
            {stock && (
                <button className="btn btn-secondary mt-2" type="button" onClick={onCancel}>Cancel</button>
            )}
        </form>

    )
}

export default StockForm;