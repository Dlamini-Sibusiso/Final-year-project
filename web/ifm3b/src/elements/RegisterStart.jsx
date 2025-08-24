/*edited in git hub*/
import React from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const RegisterSart = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const name = location.state?.name;

    const [formData, setFormData] = useState({
        employnum:"",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({...prev, [e.target.name]: e.target.value}))
    };

    const handleClick = (e) =>{
        e.preventDefault();
        console.log(formData);
        //check if user forgot password or user want to register/sign in
        if (name === "forgotpass"){
            alert("forgot password, must send new password on email if user was found with the given employee number")
        }else
            {
                alert("signing in, must send employee number and role")
                navigate('/register', {state: {number: formData.employnum, role:'employee'}})
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
            <div className="p-3 rounded w-25 border loginForm">
                {name === "forgotpass" && (//if 
                <h1 style={{textAlign:'center'}}>Recover password</h1> )}  
                {name === "signingup" && (//else if
                <h1 style={{textAlign:'center'}}>Register/ Sign Up</h1>)}

                <form onSubmit={handleClick}>
                    <label htmlFor="Employee Number">Employee Number:</label>
                    <input type="number" placeholder="Enter employee number" className="form-control rounded-0 mb-3" onChange={handleChange} name="employnum"/>
                    
                    <button className="btn btn-success w-100 rounded-0 mb-2" type="submit">Submit</button>
                </form>
            </div>
        </div>
    )
}

export default RegisterSart
