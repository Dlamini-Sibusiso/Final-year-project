import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios'; 

const DEFAULT_IMAGE = '/default-room.png';

const RoomById = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5289/api/Rooms/${id}`)
      .then(response => setRoom(response.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!room) return <p>Loading...</p>;

  const handleBack = (e) => {
        e.preventDefault();
        navigate('/rooms')
    }

  return (
    <div className="container mt-5">
        <button className="mb-4 top-button loginForm" onClick={handleBack}>Back</button>
       
       <div className="d-flex justify-content-center align-items-center">
            <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm">
                
                <h4 className="d-flex justify-content-center align-items-center">Room Details</h4>
                    <img
                        src={room.imageUrl ? `http://localhost:5289${room.imageUrl}` : DEFAULT_IMAGE}
                        className="card-img-top"
                        alt="room.roomId"
                        style={{ height: '200px', objectFit: 'cover'}}
                    />

                    <div className="card-body">
                        <ul className="list-group">
                            <li className="list-group-item"><strong>Room Name:</strong> {room.roomId}</li>
                            <li className="list-group-item"><strong>Description:</strong> {room.description}</li>
                            <li className="list-group-item"><strong>Capacity:</strong> {room.capacity}</li>
                            <li className="list-group-item"><strong>Amanities:</strong> {room.amenities}</li>
                            <li className="list-group-item"><strong>Status:</strong> {room.status}</li>
                            <li className="list-group-item"><strong>Reason:</strong> {room.reason === "string" ? "" : room.reason }</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default RoomById;