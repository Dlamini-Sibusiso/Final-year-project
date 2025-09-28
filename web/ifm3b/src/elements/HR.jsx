import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch } from 'react-icons/fa';

const HR = () => {
    const [staffs, setStaffs] = useState([]); //list
    const [role, setRole] = useState('Employee'); 
    const [newEmployeeNum, setNewEmployeeNum] = useState('');
    const [errorMsg, setErrorMsg] = useState(null); 
    const [showSubmit, setShowSubmit] = useState(false);

    const [editStaff, setEditStaff] = useState(null);
    const [newRole, setNewRole] = useState('');

    const [reg, setReg] = useState(null);
    const [regNum, setRegNum] = useState('');
    const [errReg, setErrReg] = useState('');
    const [successReg, setSuccessReg] = useState('');

    //fetch all staff on component mount
    useEffect (() => {
        fetchStaffs();

    },[]);

    const fetchStaffs = async () => {
        try
        {
            const resp = await axios.get("http://localhost:5289/api/Staffs");
            setStaffs(resp.data);
        } 
        catch (err) 
        {
            console.error(err);
            setErrorMsg('Error fetching staffs');
        }
    };

    //searching user on registration table
    const handleRegSearch = async () => {
        setShowSubmit(false);//hidding the submit button when editing
        setSuccessReg('');
        setErrReg('');
        setReg(null);

        if (!regNum || isNaN(regNum)) 
        {
            setErrReg('Please enter a valid employee number')
            return;
        }

        try {//getting users with employee number
            const response = await axios.get(`http://localhost:5289/api/Register/${regNum}`);
            setReg(response.data);
        } catch (err) {
            console.error(err);
            
            if (err.response && err.response.status === 404)
            {
                const errMessage = err.response.data.message;
                setErrReg([errMessage])
            } else {
                setErrReg('Error while searching for user');
            }
        }
    };

    //delete user by id
    const handleRegDel = async () => {
        setShowSubmit(false);//hidding the submit button when editing
        setSuccessReg('');
        setErrReg('');
        //check for employee number
        if(!regNum)
        {
            setErrReg('Enter employee number');
            return;
        }

        try
        {
            await axios.delete(`http://localhost:5289/api/Register/${regNum}`);
        
            setRegNum('');
            setReg(null);
            setErrReg('');   
            setSuccessReg('User deleted successfully');
        } catch (err) {
            console.error(err);
            setErrReg('Error deleting user');
        }
    };

    //adding user on staff table
    const handleAdd = async () => {
        setErrorMsg(null);
        setErrReg('');
        setRegNum('');
        setReg(null);

        if(!(role === 'Manager' || role === 'Employee' || role === 'Clerk'))
        {
            setErrorMsg('Role must be either Manager 0r Employee or Clerk');
            return;
        }

        const en = parseInt(newEmployeeNum, 10);
        if (isNaN(en) || newEmployeeNum.length !== 5)
        {
            setErrorMsg('Employee number must be a 5-digit number');
            return;
        }

        try
        {
            const res = await axios.post("http://localhost:5289/api/Staffs", {
            employee_Number: en,
            role: role
            });
            
            setStaffs([...staffs, res.data]);
            setNewEmployeeNum('');
        } catch (err) {
            console.error(err);
            
            if (err.response && err.response.status === 409)
            {
                const errMessage = err.response.data.message;
                setErrorMsg([errMessage])
            } else {
                setErrorMsg('Error adding staff');
            }
        };
    };

    const handleCancel = () => {
        setShowSubmit(false);//hidding the submit button when editing
        setErrorMsg(null);
        setErrReg('');
        setEditStaff(null);
        setRegNum('');
        setReg(null);
    };

    const handleEdit = (Enumber) => {
        setShowSubmit(true);//showing the submit and cancel button when editing
        setErrorMsg(null);
        const staff = staffs.find((s) => s.employee_Number === Enumber);
        setEditStaff(staff);
        setNewRole(staff.role);
    };
        
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setShowSubmit(false);//hide the submit and cancel button when editing
        setErrorMsg(null);
        setErrReg('');
        setRegNum('');
        setReg(null);

        if (!editStaff)
        {
            return;
        }

        if(!(role === 'Manager' || role === 'Employee' || role === 'Clerk'))
        {
            setErrorMsg('Role must be either Manager 0r Employee or Clerk');
            return;
        }

        try
        {
            await axios.put(`http://localhost:5289/api/Staffs/${editStaff.employee_Number}`,
                {
                    role: newRole,
                }
            );
            
            //update staff list locally after success
            setStaffs((prevStaff) =>  prevStaff.map((s) => s.employee_Number === editStaff.employee_Number ? {...s, role: newRole} : s));
            setEditStaff(null);
        } catch (err) {
            console.error(err);
            setErrorMsg('Error updating staff details');
        }
    };

    //Delete existing staff on staff and register table
    const handleDelete = async (Enumber) => {
        setShowSubmit(false);//hidding the submit button when editing
        setErrorMsg(null);
        setErrReg('');

        try
        {
            await axios.delete(`http://localhost:5289/api/Staffs/${Enumber}`);
            setStaffs(staffs.filter(s => s.employee_Number !== Enumber));   
        } catch (err) {
            console.error(err);
            setErrorMsg('Error deletng staff');
        }
    };

    return (
        <div>
            <div className="container mt-4">
                <div className="row">

                    <div className="col-md-6">
                        <div className="card card-body mt-4">
                            {errorMsg && (
                                <p className="alert alert-warning">{errorMsg}</p>
                            )}

                            {/*Adding new staff*/}
                            {!showSubmit && (<>
                            <h2 className="d-flex justify-content-center align-items-center">Add Staff</h2>
                            
                            <div className="d-flex justify-content-center align-items-center gap-2 my-3 mb-3">
                                <label className="form-label">
                                    Employee Number (5 digits):
                                </label>
                                <input className="form-control" type="text" value={newEmployeeNum} onChange={e => setNewEmployeeNum(e.target.value)}/>
                            </div>

                            <div className="d-flex justify-content-center align-items-center gap-2 my-3 mb-3">
                                <label className="form-label">
                                    Select Employee Role:
                                </label>
                        
                                <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                                    <option value="Manager">Manager</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Clerk">Clerk</option>
                                </select>
                            </div>

                                <button className="btn btn-success w-50 mb-4" onClick={handleAdd}>Add Staff</button>
                            </>)}

                            {/*Editing staff role*/}
                            {showSubmit && editStaff && ( <>
                                <div>
                                    <label className="form-label">Employee Number:</label> 
                                    <input className="form-control" value={editStaff.employee_Number} readOnly/>
                                </div>
                                
                                <div className="d-flex justify-content-center align-items-center gap-2 my-3 mb-3">
                                    <label className="form-label">
                                        Select Employee Role:
                                    </label>
                            
                                    <select className="form-control" value={newRole} onChange={(e) => setNewRole(e.target.value)} required>
                                        <option value="Manager">Manager</option>
                                        <option value="Employee">Employee</option>
                                        <option value="Clerk">Clerk</option>
                                    </select>
                                </div>

                                <button className="btn btn-success w-50 mb-4" onClick={handleEditSubmit}>Sumbit Change</button>
                                <button className="btn btn-secondary w-50" onClick={handleCancel}>Cancel</button>
                            </>)}

                        </div>
                    </div>

                    <div className="col-md-6">   
                        <div className="card card-body mt-4">
                            {errReg && (
                                <div className="alert alert-danger">{errReg}</div>
                            )}
                            <h2 className="d-flex justify-content-center align-items-center">Delete on Register</h2>
                            
                            {/*Search User to be deleted*/}
                            <div className="d-flex justify-content-center align-items-center gap-2 my-3">
                                <label className="form-label">Employee Number: </label>
                                <input className="form-control" type="number" placeholder="Enter Employee Number" value={regNum} onChange={(e) => setRegNum(e.target.value)}/>
                                <button className="btn btn-outline-secondary" onClick={handleRegSearch}><FaSearch/></button>
                            </div>
                            
                            {/*User information to Delete on Register Table*/}
                            {reg && ( <> 
                                <div className="d-flex justify-content-center align-items-center gap-2 my-3 mb-3">
                                    <label className="form-label">Username: </label>
                                    <input className="form-control" type="text" value={reg.username} readOnly/>
                                </div>

                                <div className="d-flex justify-content-center align-items-center gap-2 my-3 mb-3">
                                    <label className="form-label">Email: </label>
                                    <input className="form-control" type="text" value={reg.email} readOnly/>
                                </div>
                                <button className="btn btn-danger" onClick={handleRegDel}>Delete</button>
                            </>)}

                            {successReg && (
                                <div className="alert alert-success">{successReg}</div>
                            )}
                        </div> 
                    </div>
                </div>
                
                {/*Displaying existing staff list*/}
                <div className="card card-body mb-4" >
                    <h2>Existing Staffs</h2>

                    <table className="table-light table table-bordered mt-4">
                        <thead>
                            <tr>
                                <th>Employee Number</th>
                                <th>Employee Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {staffs.map(s => (
                                <tr key={s.employee_Number}>
                                    <td>{s.employee_Number}</td>
                                    <td>{s.role}</td>
                                    <td>
                                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(s.employee_Number)}>Update Role</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.employee_Number)}>Delete</button> 
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default HR