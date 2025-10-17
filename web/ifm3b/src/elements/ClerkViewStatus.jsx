import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";

const ClerkViewStatus = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

   const [bookingInfo, setBooking] = useState(null);//single booking
    const [loading, setLoading] = useState(true);

    const [selectedStatus, setSelectedStatus] = useState("");
    const [statusInfo, setStatusInfo] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statMsg, setStatMsg] = useState("");

     useEffect(() => {
        fetchBooking();
    }, []);


    const fetchBooking = async () => {
         try {
            const res = await axios.get(`http://localhost:5289/api/Bookings/${id}`);
            console.log("booking from API:", res.data);
            
            setBooking(res.data);
            setSelectedStatus(res.data.status || '');
            setStatusInfo(res.data.statusInfor || '');
        } catch (err) {
            console.error('Error fetching bookings:', err);
            //Alert.alert('Error', 'Failed to fetch bookings.');
        } finally {
            setLoading(false);
        }
    };


  const handleUpdateStatus = async () => {
        setStatMsg('');
        console.log('Handle Update. Current status: ', selectedStatus)
        if (!selectedStatus || selectedStatus.trim() ==='') 
        {
            setStatMsg('Please select a status.')
            //Alert.alert('Validation', 'Please select a status.');
            return;
        }

        if (selectedStatus === 'Disapprove' && !statusInfo.trim()) 
        {
            setStatMsg('Please provide a reason for disapproval.')
            //Alert.alert('Validation', 'Please provide a reason for disapproval.');
            return;
        }
    
        try {
            setIsSubmitting(true);
            await axios.put(`http://localhost:5289/api/Bookings/status/${id}`, 
                {
                    Status: selectedStatus, 
                    StatusInfo: selectedStatus === 'Disapprove' ? statusInfo : '',
                });
            
            //Alert.alert('Success', 'Status updated successfully.');
            fetchBooking(); // Refresh booking info
            setStatMsg("Status updated successfully!");
        } catch (err) {
            console.error('Error updating status:', err);
            //Alert.alert('Error', 'Failed to update status.');
            setStatMsg("Failed to update status.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!bookingInfo) return <div className="text-danger">Booking not found</div>;


    return(
        <div>
      {!isLoggedIn && (
        <h1 className="alert alert-warning">"You are not logged in."</h1>
      )}

        {isLoggedIn && (
        
            <div className="container mt-4">
                <button className="mb-4 top-button loginForm" onClick={() => navigate("/history")}> Back To History </button>
            <h3 className="mb-4 text-primary">Booking Details</h3> 

            <div className="card p-3 shadow-sm">
                <div className="row mb-2">
                    <div className="col-md-6"><strong>Room Name:</strong> {bookingInfo.roomId}</div>
                    <div className="col-md-6"><strong>Booked By:</strong> {bookingInfo.employee_Number}</div>
                </div>

                <div className="row mb-2">
                <div className="col-md-6"><strong>Session Start:</strong> {bookingInfo.sesion_Start}</div>
                <div className="col-md-6"><strong>Session End:</strong> {bookingInfo.sesion_End}</div>
                </div>

                <div className="row mb-2">
                <div className="col-md-6"><strong>Capacity:</strong> {bookingInfo.capacity}</div>
                <div className="col-md-6"><strong>Amenities:</strong> {bookingInfo.amenities}</div>
                </div>

                <div className="row mb-2">
                <div className="col-md-6"><strong>Stock:</strong> {bookingInfo.stock}</div>
                <div className="col-md-6"><strong>New Stock:</strong> {bookingInfo.newStock}</div>
                </div>

                <div className="mb-3">
                <strong>Current Status:</strong>{" "}
                <span
                    className={`badge ${
                    bookingInfo.status === "Approve"
                        ? "bg-success"
                        : bookingInfo.status === "Disapprove"
                        ? "bg-danger"
                        : "bg-secondary"
                    }`}
                >
                    {bookingInfo.status}
                </span>
                </div>
            </div>

            <div className="card mt-4 p-3 shadow-sm">
                <h5 className="mb-3">Update Status</h5>

                {statMsg && <div className="alert alert-info">{statMsg}</div>}

                <div className="d-flex gap-3 mb-3">
                <button
                    className={`btn ${
                    selectedStatus === "Approve" ? "btn-success" : "btn-outline-success"
                    }`}
                    onClick={() => setSelectedStatus("Approve")}
                >
                    Approve
                </button>

                <button
                    className={`btn ${
                    selectedStatus === "Disapprove" ? "btn-danger" : "btn-outline-danger"
                    }`}
                    onClick={() => setSelectedStatus("Disapprove")}
                >
                    Disapprove
                </button>
                </div>

                {selectedStatus === "Disapprove" && (
                <div className="mb-3">
                    <label className="form-label">Reason for Disapproval</label>
                    <textarea
                    className="form-control"
                    rows="4"
                    value={statusInfo}
                    onChange={(e) => setStatusInfo(e.target.value)}
                    placeholder="Explain why the booking was disapproved..."
                    ></textarea>
                </div>
                )}

                <button
                className="btn btn-primary"
                onClick={handleUpdateStatus}
                disabled={isSubmitting}
                >
                {isSubmitting ? "Submitting..." : "Submit Changes"}
                </button>
            </div>
        </div>
  
      )}
    </div>
    )
}
export default ClerkViewStatus;