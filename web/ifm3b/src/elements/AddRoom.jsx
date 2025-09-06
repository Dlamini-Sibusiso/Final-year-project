import React, { useState } from "react";
import useAuth from "../hooks/useAuth";
import axios from "axios";

const AddRoom = () => {
    const { isLoggedIn } = useAuth();

    const [roomInfo, setRoomInfo] = useState({
        roomId: '',
        description: '',
        capacity: '',
        amenities: '',
        status: '',
        reason: '',
    });

    const [imageData, setImageData] = useState(null);

    const handleChange = (e) => {
        setRoomInfo((prev) => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleImage = (e) => {
        setImageData(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                amenities: '',
                status: '',
                reason: '',
            });
            setImageData(null);
            
        } catch (err) {
            console.error('Error adding room', err);
            alert('Failed to add room');
        }

    };

    return (
        <div className='container mt-4'>
            {!isLoggedIn && (
                <h1 className="alert alert-warning">"You are not logged in."</h1>
            )}

            {isLoggedIn && (
                <div className="p-4 border rounded shadow-sm" style={{ maxWidth: '500px', margin: '0 auto'}}>
                <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ maxWidth: 500, margin: 'auto' }}>
                    <h1 className="d-flex justify-content-center align-items-center">Add Room</h1>
                        <label>Room Name:</label>
                        <input type="text" name="roomId" placeholder="Enter room name" className="form-control rounded-0 mb-2" value={roomInfo.roomId} onChange={handleChange} required />
                    
                        <label>Description:</label>
                        <textarea name="description" placeholder="Enter description" className="form-control rounded-0 mb-2" value={roomInfo.description} onChange={handleChange}></textarea>
                    
                        <label>Capacity:</label>
                        <input type="number" name="capacity" placeholder="Enter capacity" className="form-control rounded-0 mb-2" value={roomInfo.capacity} onChange={handleChange} required />
                    
                        <label>Amenities:</label>
                        <input type="text" name="amenities" placeholder="Enter amenities" className="form-control rounded-0 mb-2" value={roomInfo.amenities} onChange={handleChange} required />
                    
                        <label>Status:</label>
                        <input type="text" name="status" placeholder="Enter Status" className="form-control rounded-0 mb-2" value={roomInfo.status} onChange={handleChange} required />
                    
                        <label>Reason:</label>
                        <input type="text" name="reason" placeholder="Enter reason" className="form-control rounded-0 mb-2" value={roomInfo.reason} onChange={handleChange}/>
                    
                        <label>Room Image:</label>
                        <input type="file" name="image" className="form-control rounded-0 mb-2" accept="image/*" onChange={handleImage}/>

                    <button type="submit" className="bt btn-primary w-100 rounded btnColor">submit</button>
                </form>
                </div>
            )}
            
        </div>
    )
}

export default AddRoom;
