import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Nav = () => {
    const { isLoggedIn, role } = useAuth();

    const navigate = useNavigate();
    //let rolename = "Manager";//for testing
    const [dropdownOpen, setDropdownOpen] = useState(null);

    const toggleDropdown = (navname) => {
    setDropdownOpen(navname);
    };

    const closeDropdown = () => {
        setDropdownOpen(null)
    };

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');//removing session token
        navigate('/');
    };

    return (
        <nav>
            {!isLoggedIn && (<Link to="/">Login</Link>)}

            {isLoggedIn && ( <>
                <Link to="/home">Home</Link>
                
                {/*Only managers can see this */}
                {role === "Manager" && ( <div className="dropdown" onMouseEnter={() => toggleDropdown("Admin")} onMouseLeave={closeDropdown}>
                                                <span className="nav-link">Admin</span>
                                                {dropdownOpen === "Admin" && (<div className="dropdown-content">
                                                        <Link to="report">Report</Link>
                                                        <Link to="rooms">Rooms</Link>
                                                        <Link to="hr">HR files</Link>
                                                        <Link to="stockamenities">Stock & Amenities</Link>
                                                    </div>)}
                                                </div>)}
                
                <div className="dropdown" onMouseEnter={() => toggleDropdown("history")} onMouseLeave={closeDropdown}>
                    <span className="nav-link">Bookings</span> {/*if manager or clerk */}
                            {dropdownOpen === "history" && ( <> {(role === "Manager" || role ==="Clerk") && (<div className="dropdown-content">
                                        <Link to="history">History</Link>
                                        <Link to="statusupdate">Status Update</Link>
                                    </div>)}
                                        {/*else if employee*/}
                                        {role ==="Employee" && (<div className="dropdown-content">
                                            <Link to="emphistory">History</Link>
                                            <Link to="bookroom">Book Room</Link>
                                        </div>)}
                                    </>
                                )}
                            </div>

                <div className="dropdown" onMouseEnter={() => toggleDropdown("profile")} onMouseLeave={closeDropdown}>
                    <span className="nav-link">Profile</span>
                            {dropdownOpen === "profile" && (<div className="dropdown-content">
                                    <Link to="profile">View</Link>
                                    <Link to="profileupdate">Update</Link>
                                </div>)}
                            </div>
                <Link to="/" onClick={handleLogout}>Logout</Link>
                </>
            )}
        </nav>
    )
}

export default Nav;