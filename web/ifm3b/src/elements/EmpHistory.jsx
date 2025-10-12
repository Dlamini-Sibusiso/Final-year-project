import React, { useState, useEffect} from "react";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EmpHistory = () => {
  const { isLoggedIn, userId } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://localhost:5289/api/bookings"); 
      //getting only the current user past bookings
      const filtered = response.data.filter((b) => b.employee_Number === Number(userId));
      setBookings(filtered);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!isLoggedIn && (
        <h1 className="alert alert-warning">"You are not logged in."</h1>
      )}

      {isLoggedIn && (
        <div className="container mt-4">
          <h2>All Bookings</h2>
        <button className="btn btn-primary mb-3" onClick={() => navigate("/upcomingbookings")}>View Upcoming Bookings</button>

        {loading ? (
          <p>Loading...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <table className="table table-bordered">
            <thead className="thead-light">
              <tr>
                <th>ID</th>
                <th>Room ID</th>
                <th>Session Start</th>
                <th>Session End</th>
                <th>Status</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}
    </div>
  );
};

export default EmpHistory;