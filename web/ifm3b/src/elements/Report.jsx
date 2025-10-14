import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00c49f"];

const Report = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get("http://localhost:5289/api/Reports/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError("Failed to fetch report data");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const events = data.upcomingBookings.map(b => ({
    id: b.id,
    title: b.title,
    start: b.start,
    end: b.end,
  }));

  return (
    <div style={{ padding: 16 }}>
      <h2>Conference Room Dashboard</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard
          title="Total Rooms"
          value={data.totalRooms}
          onClick={() => navigate("/rooms")}
        />
        <StatCard
          title="Active Rooms"
          value={data.activeRooms}
          onClick={() => navigate("/rooms")}
        />
        <StatCard
          title="Rooms Under Maintenance"
          value={data.maintenanceRooms}
          onClick={() => navigate("/rooms")}
        />
        <StatCard title="Today's Bookings" value={data.todaysBookingsCount} />
        <StatCard title="New Bookings" value={data.newBookingsCount} />
      </div>

      {/*Most Used Conf Rooms*/}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h4>Most Used Conf Rooms</h4>
          <ul>
            {data.mostUsedRooms.map(r => (
              <li key={r.roomId}>
                ({r.roomId}) — bookings: {r.usageCount} — capacity: {r.capacity}
              </li>
            ))}
          </ul>
          {/*Conference Room Usage Bar Chart*/}
          {Array.isArray(data.mostUsedRooms) && 
            data.mostUsedRooms.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.mostUsedRooms}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="roomId" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="usageCount" fill="#8884d8" name="Number of Bookings" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No room usage data available</p>
          )}
        </div>

        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h4>Booking Schedule</h4>
          <FullCalendar
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            events={events}
            eventClick={(info) => {
              // optionally navigate to booking detail
              // navigate(`/bookings/${info.event.id}`);
              alert(`Clicked booking ${info.event.title}`);
            }}
            height="auto"
          />
        </div>

        {/* Most Requested Capacities */}
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h4>Most Requested Capacities</h4>
          <ul>
            {Array.isArray(data.mostRequestedCapacities) &&
              data.mostRequestedCapacities.map((item, index) => (
                <li key={index}>
                  Capacity {item.capacity}: {item.count} requests
                </li>
            ))}
          </ul>
          {/* Requested Capacities Pie Chart */}
          {Array.isArray(data.mostRequestedCapacities) &&
            data.mostRequestedCapacities.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.mostRequestedCapacities}
                    dataKey="count"
                    nameKey="capacity"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {data.mostRequestedCapacities.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} requests`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No capacity data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Small StatCard component
function StatCard({ title, value, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        minWidth: 160,
        padding: 12,
        borderRadius: 8,
        background: "#fff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: "600" }}>{value}</div>
      <div style={{ color: "#6b7280" }}>{title}</div>
    </div>
  );
}
export default Report;