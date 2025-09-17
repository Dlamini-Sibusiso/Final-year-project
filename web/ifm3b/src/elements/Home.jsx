import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
    const [name, setName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    useEffect(() => {
        const fetchName = async () => {
            const token = localStorage.getItem("token");
            
            if (!token) 
            {
                setErrorMsg("You are not logged in.");
                return;
            }

            try {
                const result = await axios.get("http://localhost:5289/api/Register/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                //Username
                setName(result.data.message);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setErrorMsg("Kindly logout and login again.");
                alert("Could not get your profile, your sesion ended. Kindly login again.")
            }
        };
        fetchName();
    }, []);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 home">
            {name && (
                <h1 style={{color:"white"}}>{name} to Conference Room Booking</h1>
            )}

            {errorMsg && (
                <h1 className="alert alert-warning">{errorMsg}</h1>   
            )}
        </div>
    )
}

export default Home;