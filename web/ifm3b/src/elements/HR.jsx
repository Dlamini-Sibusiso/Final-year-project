import React, { useState, useEffect } from "react";
import axios from "axios";

const HR = () => {
    const [staffs, setStaffs] = useState([]); //list
    const [role, setRole] = useState('Employee'); 
    const [newEmployeeNum, setNewEmployeeNum] = useState('');
    const [errorMsg, setErrorMsg] = useState(null); 

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

    const handleAdd = async () => {
        setErrorMsg(null);

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
            if (err.reponse && err.reponse.status ===409)
            {
                setErrorMsg('Employee number already exist');
            } else {
                setErrorMsg('Error adding staff');
            }
        };
    };

        const handleEdit = async (Enumber) => {
            setErrorMsg(null);
            if(!(role === 'Manager' || role === 'Employee' || role === 'Clerk'))
            {
                setErrorMsg('Role must be either Manager 0r Employee or Clerk');
                return;
            }

            try
            {
                await axios.put(`http://localhost:5289/api/Staffs/${Enumber}`,
                    {
                        role: role
                    }
                );
                setStaffs(staffs.map(s => s.employee_Number === Enumber ? {...s, role: role} : s))
            } catch (err) {
                console.error(err);
                setErrorMsg('Error updating staff details');
            }
        };

        const handleDelete = async (Enumber) => {
            setErrorMsg(null);

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
            {errorMsg && (
                <p style={{ color: 'red'}}>{errorMsg}</p>
            )}
        <div className="card card-body mt-4" style={{ maxWidth: 600, margin: 'auto' }}>
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
        </div>

            <div className="card card-body mb-4" style={{ maxWidth: 800, margin: 'auto' }}>
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
    );
}

export default HR