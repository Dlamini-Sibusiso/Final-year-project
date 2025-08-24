import React from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const handleClick = (clickedOption) => {//passing props(sharing info to registerstart file)
        navigate('/registerstart', {state: {name: clickedOption}});
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
            <div className="p-3 rounded w-25 border loginForm">
                <h1 style={{textAlign:'center'}}>Login</h1>
                <form >
                    <label htmlFor="username">Userame:</label>
                    <input type="text" placeholder="Enter username" className="form-control rounded-0 mb-3"/>
                    
                    <label htmlFor="password">Password:</label>
                    <input type="text" placeholder="Enter password" className="form-control rounded-0 mb-3"/>
                    
                    <button className="btn btn-success w-100 rounded-0 mb-2" type="submit">Submit</button>
                    <p>Don't have an account?<span className="linkStyle" onClick={() => handleClick('signingup')}> Sign Up</span> Or<br/> <span className="linkStyle" onClick={() => handleClick('forgotpass')}> Forgot password</span></p>
                </form>
            </div>
        </div>
    )
}

export default Login