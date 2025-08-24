import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Nav = () => {
    let rolename = "Manager";//for testing
    const [dropdownOpen, setDropdownOpen] = useState(null);

    const toggleDropdown = (navname) => {
    setDropdownOpen(navname);
    };

    const closeDropdown = () => {
        setDropdownOpen(null)
    }

    return (
        <nav>  
            <Link to="/home">Home</Link>
            
            {/*Only managers can see this */}
            {rolename === "Manager" && ( <div className="dropdown" onMouseEnter={() => toggleDropdown("Admin")} onMouseLeave={closeDropdown}>
                                            <span className="nav-link">Admin</span>
                                            {dropdownOpen === "Admin" && (<div className="dropdown-content">
                                                    <Link to="report">Report</Link>
                                                    <Link to="rooms">Rooms</Link>
                                                    <Link to="hr">HR files</Link>
                                                    <Link to="stockamenities">Other</Link>
                                                </div>)}
                                            </div>)}
            
            <div className="dropdown" onMouseEnter={() => toggleDropdown("history")} onMouseLeave={closeDropdown}>
                <span className="nav-link">Bookings</span> {/*if manager or clerk */}
                        {dropdownOpen === "history" && ( <> {(rolename === "Manager" || rolename ==="Clerk") && (<div className="dropdown-content">
                                    <Link to="history">History</Link>
                                    <Link to="statusupdate">Status Update</Link>
                                </div>)}
                                    {/*else if employee*/}
                                    {rolename ==="Employee" && (<div className="dropdown-content">
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
            <Link to="/">Logout</Link>
        </nav>
    )
}

export default Nav;