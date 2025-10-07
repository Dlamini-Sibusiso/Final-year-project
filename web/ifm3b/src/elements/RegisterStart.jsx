import axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const RegisterSart = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const name = location.state?.name;

    const [formData, setFormData] = useState({
        Employee_Number:''
    });
    const [staffInfo, setStaffInfo] = useState('');
    const [errormsg, setError] = useState('');

    const [passMsg, setPassMsg] = useState('');

    const handleChange = (e) => {
        setFormData((prev) => ({...prev, [e.target.name]: e.target.value}))
    };
    
    const handleClick = async (e) =>{
        e.preventDefault();
        setError('');
        setStaffInfo('');

        setPassMsg('');

        if (!formData.Employee_Number || isNaN(formData.Employee_Number))
        {
            setError({ message: ["Please enter employee number."] });
            return;
        }

        //check if user forgot password or user want to register/sign in
        if (name === "forgotpass")
        {   
            try{
            const res = await axios.post("http://localhost:5289/api/Register/forgotpassword",
                { employeeNumber: parseInt(formData.Employee_Number)},
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            ); 
                setPassMsg({message: [res.data.message]})
            }catch(err) {
                console.error(err)
                const errorMsg = err.response?.data?.message || 'An error occurred';
                setError({message: [errorMsg] });
            }
        }else {
            try {
                const result = await axios.get(`http://localhost:5289/api/Staffs/GetStaffById/${formData.Employee_Number}`);        
                setStaffInfo(result.data);
            
                console.log('fetched staff:', staffInfo);
                navigate('/register', {state: {number: result.data.employee_Number, role: result.data.role}})
                
            } catch (err) {
                console.error(err.message)

                if (err.response)
                {      
                    if (err.response.status === 404)
                    {   
                        const errorData = err.response.data;
                        setError({message: [errorData.message] });
                    }else{
                        const errorData = err.response?.data?.message || 'An error occurred';
                        setError({message: [errorData] });
                    }
                }else {
                    setError({errnet: ["Network error or server did not respond"]})
                }
            }
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
                    <input type="number" placeholder="Enter employee number" className="form-control rounded-0 mb-3" onChange={handleChange} name="Employee_Number"/>
                    
                    <button className="btn btn-success w-100 rounded-0 mb-2 btnColor" type="submit">Submit</button>
                    
                    {errormsg.message && errormsg.message.map((sms, i) => (
                        <div key={i} className="alert alert-warning">{sms}</div> 
                    ))}

                    {errormsg.errnet && errormsg.errnet.map((sms, i) => (
                        <div key={i} className="alert alert-warning">{sms}</div> 
                    ))}
                    
                    {passMsg.message && passMsg.message.map((sms, i) => (
                        <div key={i} className="alert alert-success">{sms}</div> 
                    ))}
                </form>
                <Link to="/">
                    <button className="btn btn-success w-100 rounded-0 mb-2 btnColor" type="submit">Cancel</button>
                </Link>   
            </div>
        </div>
    )
}

export default RegisterSart
