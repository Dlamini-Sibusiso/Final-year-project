import React from "react";
import useAuth from "../hooks/useAuth";

const BookRoom = () => {
    const { isLoggedIn, role, username } = useAuth();

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            {!isLoggedIn && (
                <h1 className="alert alert-warning">"You are not logged in."</h1>
            )}

            {isLoggedIn && (
                <h1>Book Room</h1>
            )}
            
        </div>
    )
}

export default BookRoom;