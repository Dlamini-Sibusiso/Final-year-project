import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";

const ProfileUpdate = () => {
 // const { id } = useParams();
 const { isLoggedIn, userId } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
  Department: "",
  Phone_Number: "",
  Email: "",
});

  const [error, setError] = useState("");

  //useEffect(() => {
  //  fetchProfile();
  //}, []);
useEffect(() => {
  const fetchProfile = async () => {
   console.log('Id ', userId)
    try {
      const res = await axios.get(`http://localhost:5289/api/Register/${userId}`);
      const data = res.data;
      setFormData({
        Department: data.department || "",
        Phone_Number: data.phone_Number || "",
        Email: data.email || "",
      }); 

    } catch (err) {
      console.error(err);
      
      alert("Failed to load user profile.");
    }
  };
fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic frontend validation
    if (!/^\d{10}$/.test(formData.Phone_Number)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    //Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      setError("Invalid email address format.");
      return;
    }

    try {
      await axios.put(`http://localhost:5289/api/Register/updateprofile/${userId}`, 
        {
            department: formData.Department,
        phone_Number: formData.Phone_Number,
        email: formData.Email
        });
    
      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  return (
    <div>
      {!isLoggedIn && (
            <h1 className="alert alert-warning">"You are not logged in."</h1>
        )}

        {isLoggedIn && (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="mb-4">Edit Profile</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-control"
              name="Department"
              value={formData.Department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-control"
              name="Phone_Number"
              value={formData.Phone_Number}
              onChange={handleChange}
              required
              maxLength="10"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="d-flex gap-3">
            <button type="submit" className="btn btn-success">
              Save Changes
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
        )}
    </div>
  );
}
export default ProfileUpdate;