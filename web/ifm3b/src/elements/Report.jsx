import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";

export default function Report() {
  const [mostUsedRooms, setMostUsedRooms] = useState([]);
  const [usageTrends, setUsageTrends] = useState([]);
  const [availability, setAvailability] = useState({ available: 0, unavailable: 0 });

  useEffect(() => {
    fetchMostUsedRooms();
    fetchUsageTrends();
    fetchAvailability();
  }, []);

  const fetchMostUsedRooms = async () => {
    const res = await axios.get("http://localhost:5289/api/Reports/MostUsedRooms");
    setMostUsedRooms(res.data);
  };

  const fetchUsageTrends = async () => {
    const res = await axios.get("http://localhost:5289/api/Reports/RoomUsageByDepartment");
    setUsageTrends(res.data);
  };

  const fetchAvailability = async () => {
    const res = await axios.get("http://localhost:5289/api/Reports/RoomAvailability");
    setAvailability(res.data);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="p-6 grid gap-8 md:grid-cols-2">
      {/* Most Used Rooms */}
      <div className="shadow-lg p-4 rounded-xl bg-white">
        <h2 className="text-xl font-semibold mb-4">Most Used Rooms</h2>
        <BarChart width={500} height={300} data={mostUsedRooms}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="roomId" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="usageCount" fill="#8884d8" />
        </BarChart>
      </div>

      {/* Room Availability */}
      <div className="shadow-lg p-4 rounded-xl bg-white">
        <h2 className="text-xl font-semibold mb-4">Room Availability</h2>
        <PieChart width={400} height={300}>
          <Pie
            dataKey="value"
            data={[
              { name: "Available", value: availability.available },
              { name: "Unavailable", value: availability.unavailable },
            ]}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {COLORS.map((color, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      {/* Usage Trends by Department */}
      <div className="col-span-2 shadow-lg p-4 rounded-xl bg-white">
        <h2 className="text-xl font-semibold mb-4">Usage Trends by Department</h2>
        <BarChart width={900} height={400} data={usageTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="roomId" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="usageCount" fill="#82ca9d" />
        </BarChart>
      </div>
    </div>
  );
}
