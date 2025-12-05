import React, { useState, useEffect } from "react";

const AttendanceShift = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  const fetchShiftData = async () => {
    try {
      setLoading(true);
      // Replace with your actual API call
      const response = await fetch("your-api-endpoint/shifts");
      const data = await response.json();

      // Transform data to only include what we need
      const formattedShifts = data.map((shift) => ({
        id: shift.id,
        name: shift.name,
        present:
          shift.employees?.filter((e) => e.status === "present").length || 0,
        absent:
          shift.employees?.filter((e) => e.status === "absent").length || 0,
      }));

      setShifts(formattedShifts);
    } catch (error) {
      console.error("Error fetching shift data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftData();
  }, []);

  // Function to handle adding a new shift (connect to your form)
  const handleAddShift = (newShift) => {
    setShifts((prev) => [
      ...prev,
      {
        id: Date.now(), // temporary ID
        name: newShift.name,
        present: 0, // starts with 0
        absent: 0, // starts with 0
      },
    ]);
  };

  // Function to update attendance (connect to your attendance system)
  const updateAttendance = (shiftId, status) => {
    setShifts((prev) =>
      prev.map((shift) => {
        if (shift.id === shiftId) {
          return {
            ...shift,
            present: status === "present" ? shift.present + 1 : shift.present,
            absent: status === "absent" ? shift.absent + 1 : shift.absent,
          };
        }
        return shift;
      })
    );
  };

  if (loading) return <div>Loading shift data...</div>;

  return (
    <div className="content">
      <div className="container-fluid">
        <div className="card rounded-4 border-0">
          <div className="p-3">
            <div className="table-responsive mt-3">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Shift Name</th>
                    <th>Present</th>
                    <th>Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.length > 0 ? (
                    shifts.map((shift) => (
                      <tr key={shift.id}>
                        <td>{shift.name}</td>
                        <td className="text-success">{shift.present}</td>
                        <td className="text-danger">{shift.absent}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center">
                        No data found
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

export default AttendanceShift;
