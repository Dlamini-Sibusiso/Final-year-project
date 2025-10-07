import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddRoom = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const [errMsg, setErrMsg] = useState(null);
    const [capErr, setCapErr] = useState(null);
    const [roomInfo, setRoomInfo] = useState({
        roomId: '',
        description: '',
        capacity: '',
        amenities: [],
        status: '',
        reason: '',
    });

    const [amenList, setAmenList] = useState([]);

    const [imageData, setImageData] = useState(null);

    useEffect (() => {
        axios.get('http://localhost:5289/api/Amenities')
            .then(res => { 
                console.log("Fetched amenities:", res.data);
                setAmenList(res.data);
            })
            .catch(err => {
                console.error("Error fetching amenities:", err);
            });
    },[]);

    //adding amenity if not already selected
    const handleAmenSelect = (e) => {
        const selected = e.target.value;
        if (selected && (!roomInfo.amenities || !roomInfo.amenities.includes(selected)))
        {
            setRoomInfo(prev => ({ ...prev,
                amenities: [...(prev.amenities || []), selected] }));
        }
        //reset dropdown after selection
        e.target.value='';
    };

    //remove amenity
    const handleAmenRemove = (amenityRemove) => {
        setRoomInfo((prev) => { 
            const currentAmenities = Array.isArray(prev.amenities) ? prev.amenities : [];

            return {
                ...prev,
                amenities: currentAmenities.filter(a => a !== amenityRemove)
            };
        });
    };

    //handle othere inputs
    const handleChange = (e) => {
        setRoomInfo((prev) => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleImage = (e) => {
        setImageData(e.target.files[0]);
    };

    const handleBack = () => {
        navigate('/rooms');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrMsg(null);
        setCapErr(null);

        console.log("capacity", roomInfo.capacity)
        if (roomInfo.capacity <= 0){
            setCapErr({message: ['Capacity must be a positive number.'] });
            return;
        }

        const formData = new FormData();

        //Append all room fields
        for(const key in roomInfo){
            formData.append(key, roomInfo[key]);
        }

        //Append image if exist
        if (imageData) 
        {   
            //must match property name in your UploadRoomDto
            formData.append('Image', imageData);
        }

        try {
            const result = await axios.post('http://localhost:5289/api/Rooms/create',
                formData,
                {
                    headers: {
                      'Content-Type': 'multipart/form-data'  
                    },
                }
            );

            alert('Room added successfully!');
            console.log(result.data);

            //reset form
            setRoomInfo({
                roomId: '',
                description: '',
                capacity: '',
                amenities: [],
                status: '',
                reason: '',
            });
            setImageData(null);
            
        } catch (err) {
            console.error('Error adding room', err);

            if (err.response)
            {
                const errStatus = err.response.status; 
                let message = '';

                switch (errStatus) {

                    case 400:
                        message = 'Bad request: Room name already exist, change room name'
                        break;

                    case 409:
                        message = 'Room name already exist, change room name'
                        break;

                    case 500:
                        message = 'Internal server problem: Please try again later and change room name.'
                        break;

                    default:
                        message = `Unexpected error: ${errStatus}`;
                }

                setErrMsg(message);
            } else {

                setErrMsg('Network error or server not reachable.');
            }
        }
    };

    return (
        <div>
            
            {!isLoggedIn && (
                <h1 className="alert alert-warning">"You are not logged in."</h1>
            )}

            {isLoggedIn && (
                <div className='container mt-4'>
                    <button className="mb-4 top-button loginForm" onClick={handleBack}>Back to Rooms</button>
                <div className="p-4 border rounded shadow-sm" style={{ maxWidth: '500px', margin: '0 auto'}}>
                <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ maxWidth: 800, margin: 'auto' }}>
                    <h1 className="d-flex justify-content-center align-items-center">Add Room</h1>
                        {errMsg && (
                            <div className="alert alert-warning alert-dismissible fade show mt-3" role="alert">
                                {errMsg}
                            </div>
                        )}

                        {capErr && capErr.message?.map ((msg, i) => (
                            <div key={i} className="alert alert-warning alert-dismissible fade show mt-3" role="alert">
                                {msg}
                            </div>
                        ))}

                        <label>Room Name:</label>
                        <input type="text" name="roomId" placeholder="Enter room name" className="form-control rounded-0 mb-2" value={roomInfo.roomId} onChange={handleChange} required />

                        <label>Description:</label>
                        <textarea name="description" placeholder="Enter description" className="form-control rounded-0 mb-2" value={roomInfo.description} onChange={handleChange} required></textarea>
                    
                        <label>Capacity:</label>
                        <input type="number" name="capacity" placeholder="Enter capacity" className="form-control rounded-0 mb-2" value={roomInfo.capacity} onChange={handleChange} required />
                    
                        <label>Amenities:</label>
                        {/*Amenity Dropdown*/}
                        <select className="form-control rounded-0 mb-2" onChange={handleAmenSelect}>
                            <option value="">Select amenity</option>                                                
                            {amenList.map((amenId, i) => (
                                <option key={i} value={amenId}>
                                    {amenId}
                                </option>
                            ))}
                        </select>                     
                        
                        {/*Selected amenities remove*/}
                        <div className="mb-2">
                            {roomInfo.amenities.map((a, i) => (
                                <span 
                                    className="badge bg-primary text-white me-1" 
                                    style={{ cursor: 'pointer' }}
                                    key={i}
                                    onClick={() => handleAmenRemove(a)}
                                    title="Click to remove"
                                    >
                                        {a} x
                                    </span>
                            ))}
                        </div>

                        {/*Separate amenities with commas*/}
                        <label>Selected Amenities</label>
                        <input type="text" className="form-control rounded-0 mb-2" value={roomInfo.amenities.join(', ')} required/>

                        <label>Status:</label>
                        <select name="status" className="form-control rounded-0 mb-2" value={roomInfo.status} onChange={handleChange} required>
                            <option value="">Select Status</option>
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                        </select>
                        
                        <label>Reason:</label>
                        <input type="text" name="reason" placeholder="Enter reason" className="form-control rounded-0 mb-2" value={roomInfo.reason} onChange={handleChange}/>
                    
                        <label>Room Image:</label>
                        <input type="file" name="image" className="form-control rounded-0 mb-2" accept="image/*" onChange={handleImage}/>

                    <button type="submit" className="btn btn-success w-100 me-2">submit</button>
                </form>
                </div>
                </div>
            )}
            
        </div>
    )
}

export default AddRoom;
