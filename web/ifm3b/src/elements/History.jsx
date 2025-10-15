import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { useNavigate } from 'react-router-dom';

const History = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statMasg, setStatMsg] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5289/api/Bookings');
      //console.log("All bookings from API:", res.data);
      //selecting bookings with status pending
      const pendingBookings = res.data.filter(b => b.status === 'Pending');
      
      console.log("Filtered pending bookings:", pendingBookings);
      setBookings(pendingBookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        setStatMsg('No bookings found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

   //Adding stock on booking
  const handleAddStock = (booking) => {
    //router.push({ pathname: '/(book)/addStock', params: { id: booking.id } });
    navigate(`/clerkaddStock/${booking.id}`);
};

  //Status reset to available
  const handleStatus = async (booking, newStatus) => {
  
    if (!newStatus || newStatus.trim() ==='') 
    {
      setStatMsg('Please select a status.')
      return;
    }
        
    setStatMsg('');
    console.log('Handle Update. New status:', newStatus);

    try {
      await axios.put(`http://localhost:5289/api/Bookings/status/${booking.id}`, 
      {
        Status: newStatus, 
      });
            
     //alert('Success', 'Status updated successfully.');
      fetchBookings(); // Refresh booking info
    } catch (err) {
      console.error('Error updating status:', err);
      //alert('Error', 'Failed to update status.');
      setStatMsg('Failed to update status.');
    }
  };

  return (
    <div>
      {!isLoggedIn && (
        <h1 className="alert alert-warning">"You are not logged in."</h1>
      )}

      {isLoggedIn && (
        <div className="container mt-4">
          <h2>Pending Bookings</h2>
              {statMasg && (
                <div className="text-danger">{statMasg}</div>
              )}

            {loading ? (
              <p>Loading...</p>
            ) : bookings.length === 0 ? (
              <p>No pending bookings found.</p>
            ) : (
              <table className="table table-bordered">
                <thead className="thead-light">
                  <tr>
                      <th>ID</th>
                      <th>Room ID</th>
                      <th>Booked By</th>
                      <th>Session Start</th>
                      <th>Status</th>
                      <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.roomId}</td>
                      <td>{booking.employee_Number.toString()}</td>
                      <td>{new Date(booking.sesion_Start).toLocaleString()}</td>
                      <td>{booking.status}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleStatus(booking, 'Closed')}
                        >
                          View Details
                        </button>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() =>  handleAddStock(booking)}
                        >
                          Add Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          )}
        </div>
      )}
    </div>
  )
}

export default History;