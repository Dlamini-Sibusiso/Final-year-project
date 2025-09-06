import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const DEFAULT_IMAGE = '/default-room.png';

const Rooms = () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();//check if user is logged in or not
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const result = await axios.get("http://localhost:5289/api/Rooms");
                console.log(result)
                setRooms(result.data)
            }catch (err) {
                console.error('Failed to fetch rooms:', err);
            }
        }
        fetchRooms();
    },[]);

    const handleAdd = (e) => {
        e.preventDefault();
        navigate('/addRoom')
    }

    const handleView = (roomId) => {
        alert(`View room: ${roomId}`);
    };

    const handleEdit = (roomId) => {
        alert(`Edit room: ${roomId}`);
    };

    const handleDelete = async (roomId) => {
        if (!Window.confirm(`Are you sure you want to delete room ${roomId}?`)) 
        {
            return;
        }

        try {

        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete room.');
        }
    };

    return (
        <div>
           {!isLoggedIn && (
                <h1 className="alert alert-warning">"You are not logged in."</h1>
            )}

            {isLoggedIn && (
                <div className="container mt-4">
                    <button className="mb-4 top-button loginForm" onClick={handleAdd}>Add Room</button>
                    <div className="row">
                        {rooms.map((room) => (
                            <div key={room.roomId} className="col-md-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                
                                <img
                                    src={room.imageUrl ? `http://localhost:5289${room.imageUrl}` : DEFAULT_IMAGE}
                                    className="card-img-top"
                                    alt="room.roomId"
                                    style={{ height: '200px', objectFit: 'cover'}}
                                />

                                <div className="card-body text-center">
                                    <h5 className="card-title">{room.roomId}</h5>
                                    <p className={`badge ${room.status.toLowerCase() === 'available' ? 'bg-success' : 'bg-secondary'}`}>
                                        {room.status}
                                    </p>
                                </div>

                                <div className="card-footer d-flex justify-content-around">
                                    <button className="btn btn-sm btn-primary" onClick={() => handleView(room.roomId)}>View</button>
                                    <button className="btn btn-sm btn-warning" onClick={() => handleEdit(room.roomId)}>Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(room.roomId)}>Delete</button>
                                </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rooms;