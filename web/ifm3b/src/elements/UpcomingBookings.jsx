import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const UpcomingBookings = () => {
    const { isLoggedIn, userId } = useAuth();
    const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://localhost:5289/api/bookings"); 
      const filtered = response.data.filter(
        (b) => (b.status === "Pending" || b.status === "Disapprove") && b.employee_Number === Number(userId)
      );
      setBookings(filtered);
    } catch (error) {
      console.error("Error fetching upcoming bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateBooking = (bookingId) => {
        navigate(`/empUpdateBooking/${bookingId}`);
    };

  return (
    <div className="container mt-4">
      <h2>Upcoming Bookings (Pending / Disapprove)</h2>

      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p>No upcoming bookings found.</p>
      ) : (
        <table className="table table-bordered">
          <thead className="thead-light">
            <tr>
              <th>ID</th>
              <th>Room ID</th>
              <th>Session Start</th>
              <th>Session End</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.roomId}</td>
                <td>{new Date(booking.sesion_Start).toLocaleString()}</td>
                <td>{new Date(booking.sesion_End).toLocaleString()}</td>
                <td>{booking.status}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleUpdateBooking (booking.id)}
                  >
                    Update booking
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UpcomingBookings;
