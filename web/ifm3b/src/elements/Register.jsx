import React from "react";
//import axios from "axios";
import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react";
import axios from "axios";

const Register = () => {
    const location = useLocation();
    const number = location.state?.number;
    const role = location.state?.role;

    const [formData, setFormData] = useState({
        Password:"",
        Username:"",
        Department:"",
        Phone_Number:"",
        Email:"",
        Id: number || "",
        Role: role || "" 
    });
    const [errors, setErrors] = useState({});
    const [okmsg, setOkmsg] = useState({});
    const [allDepartments, setAllDepartments] = useState([]);

    useEffect(() => {
            axios.get('http://localhost:5289/api/Department')
            .then(res => {
                console.log("Fetched departments:", res.data);
                setAllDepartments(res.data)
            })
            .catch(err => console.error('Error fetching departments', err));
        },[]);

    const handleChange = (e) => {
        setFormData((prev) => ({...prev, [e.target.name]: e.target.value}))
    };

    const handleClick = async (e) => {
        e.preventDefault();
        setErrors({});
        setOkmsg({});

        const validErrors = validationForm();//phone number and email validation
        if(Object.keys(validErrors).length > 0)
        {
            setErrors(validErrors);
            return;
        }

        console.log('Submitting data:', formData);

        try{
            const res = await axios.post("http://localhost:5289/api/Register/register", formData) 
            setOkmsg({message: [res.data.message]})

        }catch(err){
            console.error(err.message);
            console.error('Error data ', err.response?.data);
            if (err.response?.status === 400 || err.response?.status === 409)
            {
                const errorData = err.response.data;

                if (Array.isArray(errorData.message))
                {
                    setErrors({message: errorData.message})
                }else if (typeof errorData.message === "string"){
                    setErrors({message: [errorData.message] });
                }else if (errorData.errors) {
                   // setErrors({modMsg: errorData.errors});//Modelstate errors    
                const flattenedErrors = Object.values(errorData.errors).flat();
      setErrors({ modMsg: flattenedErrors });
                }

            } else {
                setErrors({unexpectedErr: ['Make sure you have correctly filled the form']})
            }
        }
    }

    //validating phone number and email if entered correct
    const validationForm = () => {
        const validationErrors = {};

        //phone number must be exactly 10 digits
        if(!/^\d{10}$/.test(formData.Phone_Number))
        {
            validationErrors.Phone_Number = ['Phone number must be exactly 10 digits'];
        }
        //email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email))
        {
            validationErrors.Email = ['Invalid email format']
        }
        //Employee number and Role validation
        if (formData.Role === "" || formData.Id === "")
        {
            validationErrors.Role = ['Employee number and Role cannot be empty, go to login page and follow the procesure to sign up']
        }

        return validationErrors;
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
            {errors.unexpectedErr && errors.unexpectedErr.map((sms, i) => (
                <div key={i} className="alert alert-warning">{sms}</div> 
            ))}
            {errors.modMsg && errors.modMsg.map((sms, i) => (
                <div key={i} className="alert alert-warning">{sms}</div> 
            ))}

            <div className="p-3 rounded w-25 border loginForm">
                <h1 style={{textAlign:'center'}}>Register/ Sign Up</h1>
                <form onSubmit={handleClick}>
                    <label htmlFor="password">Password:</label>
                    <input type="password" autoComplete="off" placeholder="Enter password" className="form-control rounded-0 mb-3" onChange={handleChange} name="Password" required/>
                    
                    <label htmlFor="username">Username:</label>
                    <input type="text" autoComplete="off" placeholder="Enter username" className="form-control rounded-0 mb-3" onChange={handleChange} name="Username" required/>
                    {/*
                    <label htmlFor="department">Department:</label>
                    <input type="text" autoComplete="off" placeholder="Enter department" className="form-control rounded-0 mb-3" onChange={handleChange} name="Department" required/>
*/}
                    <label htmlFor="department">Department:</label>
                    <select
                    className="form-control rounded-0 mb-3"
                    name="Department"
                    onChange={handleChange}
                    required
                    >
                    <option value="">-- Select Department --</option>
                    {allDepartments.map((dept, index) => (
                        <option key={index} value={dept}>
                        {dept}
                        </option>
                    ))}
                    </select>


                    <label htmlFor="Phone number">Phone Number:</label>
                    <input type="number" autoComplete="off" placeholder="Enter phone number" className="form-control rounded-0 mb-3" onChange={handleChange} name="Phone_Number" required/>
                    {errors.Phone_Number && errors.Phone_Number.map((sms, i) => (
                        <div key={i} className="alert alert-warning">{sms}</div>
                    ))}

                    <label htmlFor="Email">Email:</label>
                    <input type="text" autoComplete="off" placeholder="Enter email" className="form-control rounded-0 mb-3" onChange={handleChange} name="Email" required/>
                    {errors.Email && errors.Email.map((sms, i) => (
                        <div key={i} className="alert alert-warning">{sms}</div>
                    ))}

                    <label htmlFor="Employee Number">Employee Number:</label>
                    <input type="number" autoComplete="off" className="form-control rounded-0 mb-3" name="Id" value={formData.Id} readOnly required/>

                    <label htmlFor="Role">Role:</label>
                    <input type="text" autoComplete="off" className="form-control rounded-0 mb-3" name="Role" value={formData.Role} readOnly required/>
                    
                    <button className="btn btn-success w-100 rounded-0 mb-2 btnColor" type="submit">Submit</button>
                    <p>Have an account? <Link to="/" style={{color:'orange'}}> Sign in</Link></p>
                </form>
            </div>
            
            {/*Employee number and Role error message if empty*/}
            {errors.Role && errors.Role.map((sms, i) => (
                <div key={i} className="alert alert-warning">{sms}</div>
            ))}

            {errors.message && errors.message.map((sms, i) => (
                <div key={i} className="alert alert-warning">{sms}</div> 
            ))}
            {okmsg.message && okmsg.message.map((sms, i) => (
                <div key={i} className="alert alert-success">{sms}</div> 
            ))}
        </div>
    )
}

export default Register