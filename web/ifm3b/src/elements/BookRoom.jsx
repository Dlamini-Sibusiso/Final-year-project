import React, { useState, useEffect} from "react";
import useAuth from "../hooks/useAuth";
import axios from "axios";

const DEFAULT_IMAGE = '/default-room.png';

const BookRoom = () => {
    const { isLoggedIn, userId } = useAuth();

    const [searchInfo, setSearchInfo] = useState({
        sesionStart: '',
        sesionEnd:'',
        capacity:null,
        amenities:[]
    });

    const [errors, setErrors] = useState({});
    const [errorsBook, setErrorsBook] = useState({});
    const [bookingId, setBookingId] = useState(null);
    const [bookTemps, setBookTemps] = useState([]);
    const [availRooms, setAvailRooms] = useState([]);
    const [selectedAmen, setSelectedAmen] = useState([]);
    const [allAmenities, setAllAmenities] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5289/api/Amenities')
        .then(res => setAllAmenities(res.data))
        .catch(err => console.error('Error fetching amenities', err));
    },[]);

    const handleAmenSelect = (e) => {
        const selected = e.target.value;
        if (selected && !selectedAmen.includes(selected))
        {
            setSelectedAmen([...selectedAmen, selected]);
        }
        e.target.value ='';
    };

    const handleAmenRemove = (amenRemove) => {
        setSelectedAmen(selectedAmen.filter(a => a !== amenRemove));
    };
  
    const toLocalIOString = (strDate) => {
        const localDate = new Date(strDate);
        const tzOffset = localDate.getTimezoneOffset() * 60000;
        return new Date(localDate.getTime() - tzOffset).toISOString();
    };

    //clearing uncompleted bookings in temp
    const previousSelected = () => {
        if (bookingId === null)
        {
            axios.delete(`http://localhost:5289/api/Bookings/uncompletedTempbookings/${userId}`)
                .then(err => console.log('successfully deleted'))
                .catch(err => console.error('error deleting range temp bookings', err));    
        }else{
            console.log('Booking id is not null');
        }
    };

    const handleSearch = () => {
        setErrors({});
        setErrorsBook({});

        previousSelected() 
        
        console.log("info sent ", searchInfo)

        if (!searchInfo.sesionStart || !searchInfo.sesionEnd || !searchInfo.capacity || selectedAmen.length === 0)
        {
            setErrors({message: ['Please fill all fields and select atleast one amenities'] });
            return;
        } else if (searchInfo.capacity <= 0){
            setErrors({message: ['Capacity must be a positive number.'] });
            return;
        }
        if (new Date(searchInfo.sesionEnd) <= new Date(searchInfo.sesionStart))
        {
            setErrors({message: ["End time must be after start time."] });
            return;
        }

        const start = searchInfo.sesionStart;
        const end = searchInfo.sesionEnd;

        const roomSpec = {
            sesionStart: toLocalIOString(start),
            sesionEnd: toLocalIOString(end),
            capacity: parseInt(searchInfo.capacity),
            amenities: selectedAmen
        };

        console.log("Sending search payload:", roomSpec);

        axios.post('http://localhost:5289/api/Bookings/searchavailable', roomSpec)
            .then(res => {
                console.log("Available rooms", res.data)
                setAvailRooms(res.data);
                if (res.data.length === 0)
                {
                    setErrors({message: ["No available rooms based on your search."] });
                }
            })
            .catch(err => {
                console.error("search failed:" + (err.response?.data || "Internal server error"));
                alert("search failed:" + (err.response?.data || "Internal server error"));
                const errorData = err.response.data;
                setErrors({message: [errorData.message] });
                 
            });
    };

    const handleDeleteBooking = (idTemp) => {
        setErrorsBook({});
        setErrors({});
        console.log("deleting id: ", idTemp);

        axios.delete(`http://localhost:5289/api/Bookings/TempbyId/${idTemp}`)
            .then(res => {
                console.log('successfully deleted')

                axios.get(`http://localhost:5289/api/Bookings/Temp/${userId}`)
                    .then(res => setBookTemps(res.data))
                    .catch(err => console.error('error loading temp bookings', err));
            })
            .catch(err => console.error('error deleting temp bookings', err));    
    };

    const handleAddBooking = (room) => {
        setErrorsBook({});
        setErrors({});
        console.log("Employee number:", userId)

        let newId = bookingId;

        if (!bookingId)
        {     
            newId = "BK" + crypto.randomUUID();
            setBookingId(newId);
        }

        console.log("Booking Id sent: ", bookingId);

        const start = searchInfo.sesionStart;
        const end = searchInfo.sesionEnd;

        const roomSpec = {
            bookingId: newId,
            employee_Number: parseInt(userId),
            roomId: room.roomId,
            sesion_Start: toLocalIOString(start),
            sesion_End: toLocalIOString(end),
            capacity: parseInt(searchInfo.capacity),
            amenities: selectedAmen.join(','),
            stock: "N/A",//room.stock,
            newStock: "N/A",//room.newStock,
            status: "Pending",
            statusInfo:null
        };

        console.log("Sending roomSpec payload: ", roomSpec);

        axios.post('http://localhost:5289/api/Bookings/AddTemp', roomSpec)
        .then(res => {
           // alert("Booking added to temporary list.");
            console.log("Booking Id received: ", bookingId);
            if (!bookingId)
            {
                setBookingId(res.data.bookingId);
            }
            fetchBookTemps();
        })  
        .catch(err => {
            console.error("Error adding booking:", err.response?.data || err.message);
            
            if (err.response?.data?.errors)
            {
                console.table(err.response.data.errors);
            }
            
            const errorData = err.response.data;
            setErrorsBook({message: [errorData.message] });
        });
    };

    const fetchBookTemps = () => {
        axios.get(`http://localhost:5289/api/Bookings/Temp/${userId}`)
            .then(res => setBookTemps(res.data))
            .catch(err => console.error('error loading temp bookings', err));
    };

    const handleBookConfirm = () => {
        setErrorsBook({});
        setErrors({});

        if (!bookingId)
        {
            return;
        }

        axios.post('http://localhost:5289/api/Bookings/ConfirmBooking', { bookingId })
            .then(() => {
                alert("Booking confirmed successfully");
                setBookingId(null);
                setBookTemps([]);
            })
            .catch(err => {
                alert(err.response?.data || "Error confirming booking");
            });
    };

    return (
        <div>
            {!isLoggedIn && (
                <h1 className="alert alert-warning">"You are not logged in."</h1>
            )}

            {isLoggedIn && (
                <div className="container mt-4">
                    <h1>Booking Room</h1>

                    <div className="card p-3 mb-4">
                        <h5>Search Available Rooms</h5>
                        {errors.message && errors.message.map((sms, i) => (
                            <div key={i} className="alert alert-warning">{sms}</div> 
                        ))}
                        <div className="row">
                            <div className="col-md-3">
                                <label>Start Time</label>
                                <input className="form-control" type="datetime-local" min={new Date().toISOString().slice(0,16)} onChange={(e) => setSearchInfo({ ...searchInfo, sesionStart: e.target.value})} value={searchInfo.sesionStart}/>
                            </div>
                            <div className="col-md-3">
                                <label>End Time</label>
                                <input className="form-control" type="datetime-local" min={searchInfo.sesionStart} onChange={(e) => setSearchInfo({ ...searchInfo, sesionEnd: e.target.value})} value={searchInfo.sesionEnd}/>
                            </div>
                            <div className="col-md-2">
                                <label>Capacity</label>
                                <input className="form-control" type="number" onChange={(e) => setSearchInfo({...searchInfo, capacity: e.target.value})} value={searchInfo.capacity}/>
                            </div>
                            <div className="col-md-4">
                                <label>Amenities</label>
                                <select className="form-control" onChange={handleAmenSelect}>
                                    <option value="">-Select Amenity-</option>
                                    {allAmenities.map((ament, i) => (
                                        <option key={i} value={ament}>{ament}</option>
                                    ))}
                                </select>
                                <div className="mt-1">
                                    {selectedAmen.map((ament, i) => (
                                        <span key={i} className="badge bg-primary me-1" onClick={() => handleAmenRemove(ament)}>
                                            {ament} x
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-success mt-3" onClick={handleSearch}>Search</button>
                    </div>
                    
                    {bookTemps.length > 0 && (
                        <div className="card p-3 mb-4">
                            <h5>Temporary Bookings</h5>
                            <ul className="list-group">
                                {bookTemps.map((bkTemp, i) => (
                                    <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                                        Room: {bkTemp.roomId}, From: {bkTemp.sesion_Start}, To: {bkTemp.sesion_End}
                                        <button className="btn btn-sm btn-primary " onClick={() => handleDeleteBooking(bkTemp.id)}>Delete Booking</button>
                                    </li>
                                ))}
                            </ul>
                            <button className="btn btn-success mt-3" onClick={handleBookConfirm}>Confirm All Bookings</button>
                        </div>        
                    )}

                    {availRooms.length > 0 && (
                        <div className="card p-3 mb-4">
                            <h5>Available Rooms</h5>
                            {errorsBook.message && errorsBook.message.map((sms, i) => (
                                <div key={i} className="alert alert-warning">{sms}</div> 
                            ))}

                            <div className="row">
                                {availRooms.map((rm, i) => (
                                    <div key={i} className="col-md-4 mb-4">
                                        <div className="card h-100 shadow-sm">
                                        
                                        <img
                                            src={rm.imageUrl ? `http://localhost:2030${rm.imageUrl}` : DEFAULT_IMAGE}
                                            className="card-img-top"
                                            alt="rm.roomId"
                                            style={{ height: '200px', objectFit: 'cover'}}
                                        />

                                        <div className="card-body text-center">
                                            {rm.name || rm.roomId} (Capacity: {rm.capacity})
                                            <button className="btn btn-sm btn-primary" onClick={() => handleAddBooking(rm)}>Add Booking</button>
                                        </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        
        </div>
    )
}

export default BookRoom;