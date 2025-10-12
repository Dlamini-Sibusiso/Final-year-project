import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Profile = () => {
    const { isLoggedIn, userId } = useAuth();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5289/api/Register/${userId}`);
      setUser(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load profile");
    }
  };

  if (!user) return <div className="text-center mt-5">Loading profile...</div>;

  return (
    <div>
      {!isLoggedIn && (
            <h1 className="alert alert-warning">"You are not logged in."</h1>
        )}

        {isLoggedIn && (
          <div className="container mt-5">
            <div className="card shadow p-4">
              <h2 className="mb-4">My Profile</h2>
              <div className="mb-3"><strong>Name:</strong> {user.username} {user.LastName}</div>
              <div className="mb-3"><strong>Email:</strong> {user.email}</div>
              <div className="mb-3"><strong>Phone:</strong> {user.phone_Number}</div>
              <div className="mb-3"><strong>Department:</strong> {user.department}</div>

              <button
                className="btn btn-primary"
                onClick={() => navigate(`/profileupdate/${user.Id}`)}
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
export default Profile;