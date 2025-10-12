import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const Report = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get("http://localhost:5289/api/Reports/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

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
          onClick={() => navigate("/activemainroom")}
        />
        <StatCard
          title="Rooms Under Maintenance"
          value={data.maintenanceRooms}
          onClick={() => navigate("/activemainroom")}
        />
        <StatCard title="Today's Bookings" value={data.todaysBookingsCount} />
        <StatCard title="New Bookings" value={data.newBookingsCount} />
      </div>

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