import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AttendanceDate = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);

  const [startDate, endDate] = dateRange;

  // Fetch data from API
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      // Replace with your actual API call
      const response = await fetch("your-api-endpoint/attendance-by-date");
      const data = await response.json();

      setAttendanceData(data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Filter data by date range
  const filteredData = attendanceData.filter((item) => {
    if (!startDate || !endDate) return true;

    // Convert item.date to Date object if it's in string format
    const itemDate = new Date(item.date);

    // Compare the dates within the selected range
    return itemDate >= startDate && itemDate <= endDate;
  });

  if (loading)
    return <div className="text-center py-5">Loading attendance data...</div>;

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="card rounded-4 border-0">
          <div className="p-3">
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="input-group">
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                      setDateRange(update);
                    }}
                    placeholderText="Select a date range"
                    className="form-control"
                    id="attendance_by_date_filter"
                    dateFormat="dd/MM/yyyy" // Ensure consistent date format
                  />
                  <span className="input-group-text">
                    <i className="fas fa-calendar"></i>
                  </span>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Present</th>
                    <th>Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr key={index}>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                        <td className="text-success">{item.present}</td>
                        <td className="text-danger">{item.absent}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDate;
