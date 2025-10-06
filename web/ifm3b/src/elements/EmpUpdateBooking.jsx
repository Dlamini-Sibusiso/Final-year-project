import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateBooking = () => {
  const { id } = useParams(); // booking ID from route
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({
    sesion_Start: "",
    sesion_End: "",
    capacity: "",
    amenities: [],
  });

const [allAmenities, setAllAmenities] = useState([]);
const [capacityErr, setCapacityErr] = useState("");
  const [validationError, setValidationError] = useState("");

// Load amenities
  useEffect(() => {
    const fetchAmenities = async () => {
      
        try{
        const response = await axios.get(`http://localhost:5289/api/Bookings/roomAmenities/${booking.roomId}`);
      setAllAmenities(response.data);
      
      } catch (error) {
        console.error("Error loading amenities:", error);
      }
    };
    fetchAmenities();
  }, [booking?.roomId]);

  //loading booking
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`http://localhost:5289/api/Bookings`);
        const found = response.data.find((b) => b.id === id);
        if (found) {
          setBooking(found);
          setForm({
            sesion_Start: found.sesion_Start,
            sesion_End: found.sesion_End,
            capacity: found.capacity,
            amenities: found.amenities.split(",").map((a) => a.trim())//found.amenities,
          });
        } else {
          alert("Booking not found");
        }
      } catch (error) {
        console.error("Error loading booking:", error);
      }
    };

    fetchBooking();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toLocalIOString = (strDate) => {
        const localDate = new Date(strDate);
        const tzOffset = localDate.getTimezoneOffset() * 60000;
        return new Date(localDate.getTime() - tzOffset).toISOString();
    };

  const validateBeforeUpdate = async () => {
    console.log("BookingGuidToExclude being sent:", id);
    const start = form.sesion_Start;
        const end = form.sesion_End;

    try {
      const res = await axios.post("http://localhost:5289/api/Bookings/Updatesearchavailable", {
        SesionStart: toLocalIOString(start),
        SesionEnd: toLocalIOString(end),
        Capacity: parseInt(form.capacity),
        Amenities: form.amenities,
        BookingGuidToExclude: id,
      });
      console.log('Updating validation', res.data)
      return res.data.length > 0;
    } catch (err) {
      if (err.response?.data?.message) {
        setValidationError(err.response.data.message);
      } else {
        setValidationError("Error validating booking.");
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log("Submitting form:", form); 
    setCapacityErr("");

    const isValid = await validateBeforeUpdate();
    if (!isValid)
    {
        return;
    }

    try {
      await axios.put(`http://localhost:5289/api/Bookings/empUdateBooking/${id}`, 
        {
              SesionStart: form.sesion_Start,
              SesionEnd: form.sesion_End,
        capacity: parseInt(form.capacity),
        amenities: form.amenities, 
      });

      alert("Booking updated successfully");
      navigate("/upcomingbookings"); // Redirect back
    } catch (err) {
      console.error("Update failed:", err);
      //alert("Update failed");
      setCapacityErr(err?.response?.data?.message ?? "Unknown error occurred.");
    }
  };

  if (!booking) return <div className="container mt-4">Loading booking...</div>;

  return (
    <div className="container mt-4">
      <h2>Update Booking</h2>
        {validationError && <div className="alert alert-danger">{validationError}</div>}
        {capacityErr && <div className="alert alert-danger">{capacityErr}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Session Start</label>
          <input
            min={new Date().toISOString().slice(0,16)}
            type="datetime-local"
            name="sesion_Start"
            className="form-control"
            value={form.sesion_Start}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Session End</label>
          <input
            min={form.sesion_Start}
            type="datetime-local"
            name="sesion_End"
            className="form-control"
            value={form.sesion_End}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Capacity</label>
          <input
            type="number"
            name="capacity"
            className="form-control"
            value={form.capacity}
            onChange={handleChange}
          />
        </div>

       <div className="mb-3">
  <label className="form-label">Select Amenities</label>
  <div className="form-check">
    {allAmenities.map((amenity, index) => (
      <div key={index} className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id={`amenity-${index}`}
          value={amenity}
          checked={form.amenities.includes(amenity)}
          onChange={(e) => {
            const selected = form.amenities.includes(amenity)
              ? form.amenities.filter((a) => a !== amenity) // remove if unchecked
              : [...form.amenities, amenity]; // add if checked
            setForm((prev) => ({ ...prev, amenities: selected }));
          }}
        />
        <label className="form-check-label" htmlFor={`amenity-${index}`}>
          {amenity}
        </label>
      </div>
    ))}
  </div>
</div>


        <button type="submit" className="btn btn-success">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default UpdateBooking;
