import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios'; 
import useAuth from "../hooks/useAuth";

const DEFAULT_IMAGE = '/default-room.png';

const EditRoom = () => {
    const { isLoggedIn } = useAuth();//check if user is logged in or not
    const { id } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [capErr, setCapErr] = useState(null);
    const [allAmenities, setAllAmenities] = useState([]);
    const [newImage, setNewImage] = useState(null);

    // eslint-disable-nextline react-hooks/exhaustive-deps
    useEffect(() => {
        axios.get(`http://localhost:5289/api/Rooms/${id}`)
            .then(response => {
            
                const roomInfo = response.data;
                const amenityArray = roomInfo.amenities 
                    ? roomInfo.amenities.split(',').map(a => a.trim()).filter(Boolean) : [];

                setRoom({...roomInfo, amenities: amenityArray});
            })
            .catch(err => console.error(err));
        
        axios.get('http://localhost:5289/api/Amenities')
            .then(res => setAllAmenities(res.data))
            .catch(err => console.error('Error fetching amenities', err));  
    }, [id]);

  const handleAmenSelect = (e) => {
        const selected = e.target.value;

        if (selected && !room.amenities.includes(selected))
        {
            setRoom(prev => ({
                ...prev, amenities: [...prev.amenities, selected]
            }));
        }
        e.target.value ='';
    };

    const handleAmenRemove = (amenRemove) => {
       
        setRoom(prev => ({
            ...prev, amenities: prev.amenities.filter(a => a !== amenRemove)
        }));
    };

    const handleBack = () => {
        navigate('/rooms')
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoom(prev => ({...prev, [name]: value }));
    };

    const handleImagechange = (e) => {
        setNewImage(e.target.files[0]);
    };

    const handleEdit = async () =>{
        setCapErr(null);

        if (!room.description)
        {
            setCapErr({message: ['Please fill room Description.'] });
            return;   
        }
        if (!Array.isArray(room.amenities) || room.amenities.length < 1)
        {
            setCapErr({message: ['Please select atleast one amenities.'] });
            return; 
        }

        if (room.status !== "Available" && room.status !== "Unavailable")
        {
            setCapErr({message: ['Status must be either Available or unailable.'] });
            return;   
        }
        if (room.capacity <= 0){
            setCapErr({message: ['Capacity must be a positive number.'] });
            return;
        }

        const formData = new FormData();
        formData.append("RoomId", room.roomId);
        formData.append("Description", room.description);
        formData.append("Capacity", room.capacity);
        
        const uniqueAmenity = Array.from(new Set(room.amenities)).join(', ');
        formData.append("Amenities", uniqueAmenity);

        formData.append("Status", room.status);
        formData.append("Reason", room.reason || '');

        if (newImage) 
        {
            formData.append("Image", newImage);
        }

        try {
            await axios.put(`http://localhost:5289/api/Rooms/${id}`, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data' 
                    }
                });
                alert("Room successfully updated");
                navigate('/rooms');
        } catch (err) {
            console.error("Failed to edit room", err);
        }
    };

    if (!room)
    {
        return <p>No room found</p>
    }

  return (
    <div>
        {!isLoggedIn && (
            <h1 className="alert alert-warning">"You are not logged in."</h1>
        )}

        {isLoggedIn && (
            <div className="container mt-4">
                <button className="mb-4 top-button loginForm" onClick={handleBack}>Back to Rooms</button>
            
            <div className="card p-3 mb-4">
                    <h2 className="d-flex justify-content-center align-items-center mb-4">Edit Room</h2>

                    {capErr && capErr.message?.map ((msg, i) => (
                        <div key={i} className="alert alert-warning alert-dismissible fade show mt-3" role="alert">
                            {msg}
                        </div>
                    ))}

                    <div className="row">
                        <div className="col-md-4">
                            
                            <img
                                src={room.imageUrl ? `http://localhost:5289${room.imageUrl}` : DEFAULT_IMAGE}
                                className="card-img-top mb-2"
                                alt="room.roomId"
                                style={{ height: '200px', objectFit: 'cover'}}
                            />
                            
                            <input type="file" onChange={handleImagechange} className="form-control mb-2" />
                            
                            <label><strong>Room Name:</strong></label>
                            <input className="form-control rounded-0 mb-3" value={room.roomId} readOnly/>
                        </div>
                                    
                        <div className="col-md-3">
                            <label><strong>Description:</strong></label>
                            <textarea type="text" name="description" className="form-control rounded-0 mb-2" onChange={handleChange} value={room.description} required />
                            
                            <label><strong>Capacity:</strong></label>
                            <input type="number" name="capacity" className="form-control rounded-0 mb-2" onChange={handleChange} value={room.capacity} required />
                        </div>

                        <div className="col-md-3">
                            <label><strong>Amenities:</strong></label>
                            <div className="mb-2">
                                {room.amenities.map((ammenn, i) => (
                                    <span key={i} className="badge bg-primary me-1" onClick={() => handleAmenRemove(ammenn)} style={{ cursor: 'pointer' }}>
                                        {ammenn} x
                                    </span>
                                ))}
                            </div>    
                            
                            <select className="form-control" onChange={handleAmenSelect}>
                                <option value="">-Select Amenity-</option>
                                {allAmenities.map((ament, i) => (
                                    <option key={i} value={ament}>{ament}</option>
                                ))}
                            </select>
                        </div> 
                                        
                            <div className="col-md-2">
                                <label><strong>Status:</strong></label>
                                <select name="status" className="form-control rounded-0 mb-2" onChange={handleChange} value={room.status} required>  
                                    <option value="">-- Select Status --</option>
                                    <option value="Available">Available</option>
                                    <option value="Unavailable">Unavailable</option>
                                </select>

                                <label><strong>Reason:</strong></label>
                                <input type="text" name="reason" className="form-control rounded-0 mb-2" onChange={handleChange} value={room.reason || ''}/>
                            </div>       
                    </div>
                    <button className="btn btn-success mt-3" onClick={handleEdit}>Submit</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default EditRoom;