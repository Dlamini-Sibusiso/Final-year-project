import React from "react";
//import axios from "axios";
import { Link, useLocation } from "react-router-dom"
import { useState } from "react";

const Register = () => {
    const location = useLocation();
    const number = location.state?.number;
    const role = location.state?.role;

    const [formData, setFormData] = useState({
        pass:"",
        usern:"",
        depart:"",
        phonenum:"",
        email:"",
        employnum: number || "",
        role: role || "" 
    });

    const handleChange = (e) => {
        setFormData((prev) => ({...prev, [e.target.name]: e.target.value}))
    };

    const handleClick = (e) =>{
        e.preventDefault();
        console.log(formData);
    }

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
            <div className="p-3 rounded w-25 border loginForm">
                <h1 style={{textAlign:'center'}}>Register/ Sign Up</h1>
                <form onSubmit={handleClick}>
                    <label htmlFor="password">Password:</label>
                    <input type="text" placeholder="Enter password" className="form-control rounded-0 mb-3" onChange={handleChange} name="pass"/>
                    
                    <label htmlFor="username">Username:</label>
                    <input type="text" placeholder="Enter username" className="form-control rounded-0 mb-3" onChange={handleChange} name="usern"/>
                    
                    <label htmlFor="department">Department:</label>
                    <input type="text" placeholder="Enter department" className="form-control rounded-0 mb-3" onChange={handleChange} name="depart"/>
                
                    <label htmlFor="Phone number">Phone Number:</label>
                    <input type="number" placeholder="Enter phone number" className="form-control rounded-0 mb-3" onChange={handleChange} name="phonenum"/>
                    
                    <label htmlFor="Email">Email:</label>
                    <input type="text" placeholder="Enter email" className="form-control rounded-0 mb-3" onChange={handleChange} name="email"/>
                    
                    <label htmlFor="Employee Number">Employee Number:</label>
                    <input type="number" className="form-control rounded-0 mb-3" name="employnum" value={formData.employnum} readOnly/>
                    
                    <label htmlFor="Role">Role:</label>
                    <input type="text" className="form-control rounded-0 mb-3" name="role" value={formData.role} readOnly/>

                    <button className="btn btn-success w-100 rounded-0 mb-2" type="submit">Submit</button>
                    <p>Have an account? <Link to="/"> Sign in</Link></p>
                </form>
            </div>
        </div>
    )
}

export default Register