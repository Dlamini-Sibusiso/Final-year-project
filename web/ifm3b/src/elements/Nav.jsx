import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FaHome, FaSignInAlt, FaSignOutAlt, FaUser, FaCalendarAlt, FaUserShield} from 'react-icons/fa';

const Nav = () => {
    const { isLoggedIn, role } = useAuth();

    const navigate = useNavigate();
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
            {!isLoggedIn && (<Link to="/"><FaSignInAlt/>Login</Link>)}

            {isLoggedIn && ( <>
                <Link to="/home"><FaHome/>Home</Link>
                
                {/*Only managers can see this */}
                {role === "Manager" && ( <div className="dropdown" onMouseEnter={() => toggleDropdown("Admin")} onMouseLeave={closeDropdown}>
                                                <span className="nav-link"><FaUserShield/>Admin</span>
                                                {dropdownOpen === "Admin" && (<div className="dropdown-content">
                                                        <Link to="report">Report</Link>
                                                        {/**Beta <Link to="rooms">Rooms</Link> Beta**/}
                                                        <Link to="hr">Staff</Link>
                                                        <Link to="stockamenities">Stock & Amenities</Link>
                                                    </div>)}
                                                </div>)}
                
                {(role === "Manager"|| role ==="Employee") && (
                <div className="dropdown" onMouseEnter={() => toggleDropdown("history")} onMouseLeave={closeDropdown}>
                    <span className="nav-link"><FaCalendarAlt/>Bookings</span> {/*if manager or clerk */}
                            {dropdownOpen === "history" && ( <> {(role === "Manager") && (<div className="dropdown-content">
                                            <Link to="rooms">Rooms</Link>
                                            </div>)}
                            {/**Beta || role ==="Clerk") && (<div className="dropdown-content">
                                        <Link to="history">History</Link>
                                        <Link to="statusupdate">Status Update</Link>
                                    </div>)} Beta**/}
                                        {/*else if employee*/}
                                        {role ==="Employee" && (<div className="dropdown-content">
                                            <Link to="emphistory">History</Link>
                                            <Link to="bookroom">Book Room</Link>
                                        </div>)}
                                    </>
                                )}
                            </div>
                )}

               <div className="dropdown" onMouseEnter={() => toggleDropdown("profile")} onMouseLeave={closeDropdown}>
                    <span className="nav-link"><FaUser/>Profile</span>
                            {dropdownOpen === "profile" && (<div className="dropdown-content">
                                    <Link to="profile">View</Link>
                                     {/**Beta<Link to="profileupdate">Update</Link>beta*/ }
                                </div>)}
                            </div>    
                <Link to="/" onClick={handleLogout}><FaSignOutAlt/>Logout</Link>
                </>
            )}
        </nav>
    )
}

export default Nav;