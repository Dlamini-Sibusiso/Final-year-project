import React , { useEffect, useState } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Amenities = () => {
    const { isLoggedIn } = useAuth();//check if user is logged in or not
    const navigate = useNavigate();
    const [amenities, setAmenities] = useState([]);
    const [newAmen, setNewAmen] = useState('');
    const [errorMsg, setErrors] = useState({});
    
    useEffect(() => {
        fetchAmenities();
    }, []);
    
    const fetchAmenities = async () => {
        try {
            const res = await axios.get("http://localhost:5289/api/Amenities");
            setAmenities(res.data);
        } catch (err) {
            console.error(err);
        }
    };
    
    const handleBack = () => {
        navigate('/stockamenities');
    };

    const AddAmenity = async () => {
        setErrors({});

        if (!newAmen.trim()) 
        {
            setErrors({message : ["Amenity ID required"]})
            return;
        }
        
        try {
            await axios.post("http://localhost:5289/api/Amenities", 
                { 
                    amenitiesId: newAmen 
                });
            
            setNewAmen('');
            fetchAmenities();
        } catch (err) {
            console.error(err);
            const errStatus = err.response.status;
            if (errStatus === 409)
            {
                setErrors({message : [err.response.data]})
            } else {
                setErrors({message : ["Adding failed"]})
            }
        }
    };
    
    const DeleteAmenity = async (id) => {
        setErrors({});

        if (!window.confirm(`You are about to delete ${id}.`))
        {
            return;
        }

        try {
            await axios.delete(`http://localhost:5289/api/Amenities/${id}`);
            
            setAmenities(prev => prev.filter(a => String(a.amenitiesId) !== String(id)));
            fetchAmenities();
        } catch (err) {
            console.error(err);
            setErrors({message : ["Delete failed"]});
        }
    };

    return (
        <div>
            {!isLoggedIn && (
                <h1 className="alert alert-warning">"You are not logged in."</h1>
            )}

            {isLoggedIn && (
                <div className='container mt-4'>
                    <button className="mb-4 top-button loginForm" onClick={handleBack}>Back to Stock</button>

                    <div style={{ maxWidth: 800, margin: 'auto' }}>

                        <h2 className="d-flex justify-content-center align-items-center">Add Amenities</h2>
                        <div className="input-group mb-3">
                            <input className="form-control" value={newAmen} onChange={(e) => setNewAmen(e.target.value)} placeholder="New Amenity ID"/>
                        
                            <button className="btn btn-outline-primary" onClick={AddAmenity}>Add Amenity</button>
                        </div>

                        {errorMsg.message && (
                            <div className="alert alert-warning">{errorMsg.message}</div>
                        )}

                        <h2 className="d-flex justify-content-center align-items-center mb-3">Delete Amenities</h2>
                        <ul className="list-group">
                            {amenities.map ((amen, a) => (
                                <li key={a} className="list-group-item d-flex justify-content-between align-items-center">
                                    {amen} <button className="btn btn-sm btn-danger" onClick={() => DeleteAmenity(amen)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Amenities;