import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
    const navigate = useNavigate();

    const [errorMsg, setErrorMsg] = useState('');
    const [formData, setFormData] = useState({
        Username:"",
        Password:"",
    });

    //Hidding and showwing password
    const [showPass, setShowPass] = useState(false);
    const togglePass = () => setShowPass((prev) => !prev);

    const handleChange = (e) => {
        setFormData((prev) => ({...prev, [e.target.name]: e.target.value}))
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        try{
            const res = await axios.post("http://localhost:5289/api/Register/login",
                { Username: formData.Username, Password: formData.Password},
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            
            //storing token after login
            localStorage.setItem("token", res.data.token);
            navigate('/home');

        } catch (err) {
            console.error(err);
            const errData = err.response?.data?.message || "Login failed";
            setErrorMsg({message: [errData]});
        }
    };

    const handleClick = (clickedOption) => {//passing props(sharing info to registerstart file)
        navigate('/registerstart', {state: {name: clickedOption}});
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
            <div className="p-3 rounded w-25 border loginForm">
                <h1 style={{textAlign:'center'}}>Login</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="username">Userame:</label>
                    <input type="text" autoComplete="off" placeholder="Enter username" className="form-control rounded-0 mb-3" onChange={handleChange} name="Username" required/>
                    
                    <label htmlFor="password">Password:</label>
                    <div style={{ position: 'relative'}}>
                        <input type={showPass ? 'text' : 'password'} autoComplete="off" placeholder="Enter password" className="form-control rounded-0 mb-3" onChange={handleChange} name="Password" style={{paddingRight: '2.5rem'}} required/>
                        <span onClick={togglePass} 
                                style={{
                                    position: 'absolute',
                                    top:'50%',
                                    right:'10px',
                                    transform:'translateY(-50%)',
                                    cursor: "pointer",
                                    color:'#888',
                                    fontSize: '18px',
                                    zIndex: 10,
                                }}
                        >
                            {showPass ? <FaEyeSlash /> : <FaEye/>}
                        </span>
                    </div> 

                    <button className="btn btn-success w-100 rounded-0 mb-2 btnColor" type="submit">Sign in</button>
                    <p>Don't have an account?<span className="linkStyle" onClick={() => handleClick('signingup')}> Sign Up</span> Or<br/> <span className="linkStyle" onClick={() => handleClick('forgotpass')}> Forgot password</span></p>

                    {errorMsg.message && errorMsg.message.map((sms, i) => (
                        <div key={i} className="alert alert-warning">{sms}</div>
                    ))}
                </form>
            </div>
        </div>
    )
}

export default Login