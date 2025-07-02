import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "./UserAvatar";
import UserAccount from "./UserAccount";

// Component chuyển hướng từ /staff sang /staff-test-bookings
export const RedirectToStaffTestBookings = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/staff-test-bookings", { replace: true });
  }, [navigate]);
  return null;
};

const STATUS_OPTIONS = [
  "Chờ bắt đầu",
  "Đã check-in",
  "Đã check-out"
];

const StaffTestBookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Chờ bắt đầu");
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState({ fullName: "Nhân viên" });
  const [showAccount, setShowAccount] = useState(false);
  const navigate = useNavigate();

  // Lấy thông tin staff từ localStorage/sessionStorage
  useEffect(() => {
    const userJson = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
    if (!userJson) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(userJson);
      if (user.role !== "STAFF") {
        navigate("/");
        return;
      }
      setStaff(user);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Lấy danh sách booking theo trạng thái (dùng API detail để có đủ thông tin user)
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/test-bookings/status/${encodeURIComponent(statusFilter)}/detail`
      );
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch {
      setBookings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [statusFilter]);

  // Đổi trạng thái booking (test booking)
  const updateStatus = async (id, newStatus) => {
    const res = await fetch(
      `http://localhost:8080/api/test-bookings/${id}/status?status=${encodeURIComponent(newStatus)}`,
      { method: "PUT" }
    );
    if (res.ok) {
      fetchBookings();
    } else {
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  return (
    <div style={{ padding: 32, background: "#f0f9ff", minHeight: "100vh" }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        padding: "20px 40px 20px 40px",
        borderRadius: 12,
        marginBottom: 32,
        minHeight: 120,
        position: "relative"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src="/Logo.png" alt="Logo" style={{ height: 72, width: 72, objectFit: "contain", background: "#fff", borderRadius: "50%", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }} />
          <div>
            <h1 style={{ color: "#fff", margin: 0, fontSize: 28, fontWeight: 700 }}>Xin chào, {staff.fullName || "Nhân viên"}!</h1>
            <h2 style={{ color: "#e0f2fe", margin: 0, fontWeight: 400, fontSize: 20 }}>Quản lý lịch xét nghiệm</h2>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ cursor: "pointer" }} onClick={() => setShowAccount((v) => !v)}>
            <UserAvatar userName={staff.fullName || "Nhân viên"} />
          </div>
          {showAccount && (
            <div style={{ position: "absolute", top: 56, right: 0, zIndex: 10 }}>
              <UserAccount onClose={() => setShowAccount(false)} />
            </div>
          )}
        </div>
      </header>
      <div style={{ margin: "24px 0", display: "flex", gap: 16, alignItems: "center" }}>
        <label style={{ fontWeight: 600 }}>Lọc theo trạng thái:</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
        <button onClick={fetchBookings} style={{ marginLeft: 16 }}>Làm mới</button>
      </div>
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <table style={{ width: "100%", background: "#fff", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#e0f2fe" }}>
              <th>Họ tên</th>
              <th>SĐT</th>
              <th>Loại xét nghiệm</th>
              <th>Ngày</th>
              <th>Giờ</th>
              <th>Ghi chú</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "#0891b2" }}>Không có lịch nào</td>
              </tr>
            ) : (
              bookings.map(b => (
                <tr key={b.bookingId}>
                  <td>{b.fullName || "N/A"}</td>
                  <td>{b.phone || "N/A"}</td>
                  <td>{b.content || "N/A"}</td>
                  <td>{b.appointmentDate ? b.appointmentDate.split('T')[0] : "N/A"}</td>
                  <td>{b.startTime || "N/A"}</td>
                  <td>{b.notes || "N/A"}</td>
                  <td>{b.testStatus}</td>
                  <td>
                    {b.testStatus === "Chờ bắt đầu" && (
                      <button onClick={() => updateStatus(b.id, "Đã check-in")}>Check-in</button>
                    )}
                    {b.testStatus === "Đã check-in" && (
                      <button onClick={() => updateStatus(b.id, "Đã check-out")}>Check-out</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StaffTestBookingManager;