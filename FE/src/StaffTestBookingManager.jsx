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
  "Đã check-out",
  "Đã kết thúc"
];

const StaffTestBookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState({ fullName: "Nhân viên" });
  const [showAccount, setShowAccount] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [pendingCheckoutId, setPendingCheckoutId] = useState(null);
  const [selectedResult, setSelectedResult] = useState("");
  const [resultNote, setResultNote] = useState("");
  const [showViewResultModal, setShowViewResultModal] = useState(false);
  const [viewResultData, setViewResultData] = useState(null);
  const [showEditResultModal, setShowEditResultModal] = useState(false);
  const [editResultData, setEditResultData] = useState(null);
  const [editingResult, setEditingResult] = useState("");
  const [editingResultNote, setEditingResultNote] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [testTypeFilter, setTestTypeFilter] = useState("");
  const [serviceNames, setServiceNames] = useState({});
  const [serviceNamesLoaded, setServiceNamesLoaded] = useState(false);
  const navigate = useNavigate();

  // Hàm helper cho màu sắc trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ bắt đầu':
        return { bg: '#fde68a', color: '#b45309' };
      case 'Đã check-in':
        return { bg: '#22d3ee', color: '#fff' };
      case 'Đã check-out':
        return { bg: '#86efac', color: '#166534' };
      case 'Đã kết thúc':
        return { bg: '#c084fc', color: '#fff' };
      default:
        return { bg: '#e5e7eb', color: '#374151' };
    }
  };

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

  // Lấy thông tin các dịch vụ từ API
  const fetchServiceNames = async (serviceIds) => {
    if (!serviceIds || serviceIds.length === 0) {
      return {};
    }
    try {
      const servicesResponse = await fetch('http://localhost:8080/api/services');
      if (servicesResponse.ok) {
        const allServices = await servicesResponse.json();
        const namesObj = {};
        allServices.forEach(service => {
          const id = typeof service.serviceId === 'string' 
            ? parseInt(service.serviceId, 10) 
            : service.serviceId;
          namesObj[id] = service.serviceName;
        });
        setServiceNames(prevNames => ({...prevNames, ...namesObj}));
        return namesObj;
      }
    } catch (err) {}
    return {};
  };

  // Lấy serviceId từ booking (chỉ lấy trực tiếp từ serviceId, backend đã chuẩn hóa)
  const getServiceId = (booking) => {
    if (booking.serviceId !== undefined && booking.serviceId !== null) {
      return typeof booking.serviceId === 'string' ? parseInt(booking.serviceId, 10) : booking.serviceId;
    }
    return null;
  };

  // Lấy tên dịch vụ xét nghiệm từ booking
  const getServiceName = (booking) => {
    if (booking.serviceName) {
      return booking.serviceName;
    }
    const serviceId = getServiceId(booking);
    if (serviceId !== null && serviceNames[serviceId]) {
      return serviceNames[serviceId];
    }
    return "Xét nghiệm chưa xác định";
  };

  // Lấy danh sách test booking từ API detail
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter 
        ? `http://localhost:8080/api/test-bookings/status/${encodeURIComponent(statusFilter)}/detail`
        : `http://localhost:8080/api/test-bookings/all/detail`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        let serviceIds = [];
        if (data.length > 0) {
          serviceIds = [...new Set(data.map(getServiceId).filter(Boolean))];
        }
        await fetchServiceNames(serviceIds);
        setBookings(data
          .filter(b => (b.payment?.status || '').toUpperCase() === 'PAID')
          .map(b => {
            const serviceId = getServiceId(b);
            const displayServiceName = getServiceName(b);
            return {
              id: b.id,
              bookingId: b.bookingId,
              fullName: b.fullName || "N/A",
              phone: b.phone || "N/A",
              serviceId: serviceId,
              serviceName: displayServiceName,
              content: b.bookingContent || "",
              appointmentDate: b.appointmentDate ? (typeof b.appointmentDate === 'string' ? b.appointmentDate.split('T')[0] : (b.appointmentDate?.toString?.().split('T')[0] || "")) : "",
              startTime: b.appointmentTime || "",
              notes: b.bookingContent || "N/A",
              testStatus: b.testStatus || "",
              paymentStatus: b.payment?.status || '',
              amount: b.payment?.amount || '',
              paymentId: b.payment?.paymentLinkId || '',
              orderCode: b.payment?.orderCode || '',
            };
          })
        );
      } else {
        setBookings([]);
      }
    } catch {
      setBookings([]);
    }
    setLoading(false);
  };

  // Khởi tạo serviceNames từ API ngay khi component mount
  useEffect(() => {
    // Fetch danh sách dịch vụ từ API ngay khi component mount
    fetch('http://localhost:8080/api/services')
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Failed to fetch services');
      })
      .then(services => {
        const servicesMap = {};
        services.forEach(service => {
          const id = typeof service.serviceId === 'string' 
            ? parseInt(service.serviceId, 10) 
            : service.serviceId;
          servicesMap[id] = service.serviceName;
        });
        setServiceNames(servicesMap);
        setServiceNamesLoaded(true);
      })
      .catch(() => {
        setServiceNames({});
        setServiceNamesLoaded(true);
      });
  }, []);

  // Chỉ fetch bookings khi serviceNames đã sẵn sàng hoặc khi đổi trạng thái
  useEffect(() => {
    if (serviceNamesLoaded) {
      fetchBookings();
    }
    // eslint-disable-next-line
  }, [statusFilter, serviceNamesLoaded]);

  // Hàm đổi trạng thái booking (test booking)
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

  // Hàm mở popup để gửi kết quả
  const openResultPopup = (id) => {
    setPendingCheckoutId(id);
    setShowResultPopup(true);
  };

  // Xác nhận và gửi kết quả xét nghiệm (chuyển từ "Đã check-out" thành "Đã kết thúc")
  const handleConfirmResult = async () => {
    if (!selectedResult) {
      alert("Vui lòng chọn kết quả xét nghiệm!");
      return;
    }
    
    try {
      // Chuyển trạng thái thành "Đã kết thúc" với kết quả
      const completeParams = new URLSearchParams({
        status: "Đã kết thúc",
        testResult: selectedResult,
        resultNote: resultNote || "",
        staffName: staff.fullName || ""
      }).toString();
      
      const completeRes = await fetch(
        `http://localhost:8080/api/test-bookings/${pendingCheckoutId}/status?${completeParams}`,
        { method: "PUT" }
      );
      
      if (!completeRes.ok) {
        throw new Error(`Không thể hoàn thành xét nghiệm. Mã lỗi: ${completeRes.status}`);
      }
      
      setShowResultPopup(false);
      setPendingCheckoutId(null);
      setSelectedResult("");
      setResultNote("");
      fetchBookings();
      alert("Đã gửi kết quả xét nghiệm thành công!");
    } catch (error) {
      console.error("Error in handleConfirmResult:", error);
      alert("Gửi kết quả thất bại: " + error.message);
    }
  };

  // Hàm xem kết quả xét nghiệm đã hoàn thành
  const handleViewResult = async (booking) => {
    try {
      // Lấy thông tin chi tiết từ API
      const response = await fetch(`http://localhost:8080/api/test-bookings/${booking.id}/detail`);
      if (!response.ok) {
        throw new Error('Không thể lấy thông tin chi tiết');
      }
      const detail = await response.json();
      
      setViewResultData({
        customerName: booking.fullName,
        phone: booking.phone,
        serviceName: booking.serviceName,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.startTime,
        testResult: detail.testResults || 'Chưa có kết quả',
        resultNote: detail.resultNote || '',
        bookingContent: booking.notes
      });
      setShowViewResultModal(true);
    } catch (error) {
      alert("Không thể tải thông tin kết quả: " + error.message);
    }
  };

  // Hàm mở modal chỉnh sửa kết quả
  const handleEditResult = async (booking) => {
    try {
      // Lấy thông tin chi tiết từ API
      const response = await fetch(`http://localhost:8080/api/test-bookings/${booking.id}/detail`);
      if (!response.ok) {
        throw new Error('Không thể lấy thông tin chi tiết');
      }
      const detail = await response.json();
      
      setEditResultData({
        id: booking.id,
        customerName: booking.fullName,
        phone: booking.phone,
        serviceName: booking.serviceName,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.startTime,
        currentResult: detail.testResults || '',
        currentResultNote: detail.resultNote || '',
        bookingContent: booking.notes
      });
      setEditingResult(detail.testResults || '');
      setEditingResultNote(detail.resultNote || '');
      setShowEditResultModal(true);
    } catch (error) {
      alert("Không thể tải thông tin kết quả: " + error.message);
    }
  };

  // Hàm cập nhật kết quả xét nghiệm
  const handleUpdateResult = async () => {
    if (!editingResult) {
      alert("Vui lòng chọn kết quả xét nghiệm!");
      return;
    }
    
    try {
      const updateParams = new URLSearchParams({
        testResult: editingResult,
        resultNote: editingResultNote || ""
      }).toString();
      
      const response = await fetch(
        `http://localhost:8080/api/test-bookings/${editResultData.id}/update-result?${updateParams}`,
        { method: "PUT" }
      );
      
      if (!response.ok) {
        throw new Error(`Không thể cập nhật kết quả. Mã lỗi: ${response.status}`);
      }
      
      setShowEditResultModal(false);
      setEditResultData(null);
      setEditingResult("");
      setEditingResultNote("");
      fetchBookings();
      alert("Đã cập nhật kết quả xét nghiệm thành công!");
    } catch (error) {
      console.error("Error in handleUpdateResult:", error);
      alert("Cập nhật kết quả thất bại: " + error.message);
    }
  };

  return (
    <div style={{ 
      backgroundColor: "#f0f9ff", 
      minHeight: "100vh",
      width: "100%",
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: "flex",
      flexDirection: "column"
    }}>
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        position: "relative",
        height: "160px"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          maxWidth: "1600px",
          margin: "0 auto",
          width: "100%",
          padding: "0 24px",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          pointerEvents: "none"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            pointerEvents: "auto" 
          }}>
            <img
              src="/Logo.png"
              alt="Logo"
              style={{ height: 85, width: 85, objectFit: "contain" }}
            />
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            pointerEvents: "auto" 
          }}>
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
          </div>
        </div>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}>
          <h1 style={{
            color: "#fff",
            margin: 0,
            fontSize: "48px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            Quản lý xét nghiệm
          </h1>
        </div>
      </header>
      
      <main style={{
        padding: "32px 24px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f0f9ff"
      }}>
        <div style={{
          maxWidth: "1600px",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}>


          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: "#fff",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center", 
              gap: "12px",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontWeight: 600, color: '#0891b2' }}>Trạng thái:</label>
                <select 
                  value={statusFilter} 
                  onChange={e => {
                    console.log("Selected status:", e.target.value);
                    setStatusFilter(e.target.value);
                  }}
                  style={{ 
                    padding: "10px 16px", 
                    borderRadius: "8px", 
                    border: '1px solid #22d3ee', 
                    outline: 'none', 
                    fontWeight: 500, 
                    color: '#0891b2', 
                    background: '#fff',
                    cursor: "pointer" 
                  }}
                >
                  <option value="">Tất cả</option>
                  {STATUS_OPTIONS.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontWeight: 600, color: '#0891b2' }}>Ngày:</label>
                <input 
                  type="date" 
                  value={dateFilter} 
                  onChange={e => setDateFilter(e.target.value)}
                  style={{ 
                    padding: "10px 16px", 
                    borderRadius: "8px", 
                    border: '1px solid #22d3ee', 
                    outline: 'none', 
                    fontWeight: 500, 
                    color: '#0891b2', 
                    background: '#fff',
                    cursor: "pointer" 
                  }}
                />
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontWeight: 600, color: '#0891b2' }}>Loại XN:</label>
                <input 
                  type="text" 
                  value={testTypeFilter} 
                  onChange={e => setTestTypeFilter(e.target.value)}
                  placeholder="Tìm theo loại xét nghiệm"
                  style={{ 
                    padding: "10px 16px", 
                    borderRadius: "8px", 
                    border: '1px solid #22d3ee', 
                    outline: 'none', 
                    fontWeight: 500, 
                    color: '#0891b2', 
                    background: '#fff'
                  }}
                />
              </div>
            </div>
            
            <button 
              onClick={fetchBookings}
              style={{ 
                background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: "8px",
                padding: '10px 20px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: "15px",
                boxShadow: "0 2px 8px rgba(34,211,238,0.25)"
              }}
            >
              Làm mới dữ liệu
            </button>
          </div>
          
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: "60px 0",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
              <div style={{ 
                display: "inline-block", 
                border: "3px solid #22d3ee",
                borderTop: "3px solid transparent",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                animation: "spin 1s linear infinite",
                marginBottom: "15px"
              }}></div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <p style={{ color: '#0891b2', fontWeight: 600, fontSize: 16, margin: 0 }}>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              backgroundColor: "#fff",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
              <div style={{ overflowX: 'auto', width: "100%" }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                  <thead>
                    <tr style={{ 
                      background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                      textAlign: "center"
                    }}>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "120px" }}>Họ tên</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "110px" }}>SĐT</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "200px" }}>Loại xét nghiệm</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "100px" }}>Ngày</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "80px" }}>Giờ</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "150px" }}>Ghi chú</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "110px" }}>Trạng thái</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "160px" }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: "30px 0", color: "#0891b2", fontWeight: 500 }}>Không có lịch xét nghiệm nào</td>
                      </tr>
                    ) : (
                      bookings
                        .filter(b => {
                          // Lọc theo ngày nếu có
                          if (dateFilter && b.appointmentDate !== dateFilter) {
                            return false;
                          }
                          // Lọc theo loại xét nghiệm (dịch vụ) nếu có
                          if (testTypeFilter) {
                            // Sử dụng cùng logic hiển thị để tìm kiếm
                            // Sử dụng trực tiếp serviceName đã resolved lúc fetch
                            const serviceName = b.serviceName || "Không xác định";
                            
                            if (!serviceName.toLowerCase().includes(testTypeFilter.toLowerCase())) {
                              return false;
                            }
                          }
                          return true;
                        })
                        .map(b => (
                          <tr 
                            key={b.id}
                            style={{ 
                              borderBottom: '1px solid #e0f2fe', 
                              transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f9ff"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>{b.fullName}</td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>{b.phone}</td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 10,
                              justifyContent: "center",
                              flexWrap: 'wrap'
                            }}>
                              <div style={{ 
                                width: "30px", 
                                height: "30px", 
                                borderRadius: "50%", 
                                backgroundColor: "#0891b2", 
                                color: "white", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                fontWeight: "bold",
                                fontSize: "16px",
                                flexShrink: 0
                              }}>
                                🧪
                              </div>
                              <span style={{ 
                                fontWeight: 600, 
                                color: '#0891b2',
                                textAlign: 'center',
                                wordWrap: 'break-word'
                              }}>
                                {/* Hiển thị serviceName đã được resolved từ mapping */}
                                {b.serviceName || "Xét nghiệm chưa xác định"}
                              </span>
                            </div>
                          </td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>{b.appointmentDate || "N/A"}</td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>{b.startTime || "N/A"}</td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>
                              <div style={{ 
                                maxWidth: '250px',
                                wordWrap: 'break-word',
                                whiteSpace: 'normal',
                                lineHeight: '1.4'
                              }} title={b.notes || "N/A"}>
                                {b.notes || "N/A"}
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>
                              <div style={{ display: "flex", justifyContent: "center" }}>
                                <span style={{
                                  display: "inline-block",
                                  padding: "6px 12px",
                                  borderRadius: "20px",
                                  fontWeight: 600,
                                  fontSize: "13px",
                                  backgroundColor: getStatusColor(b.testStatus).bg,
                                  color: getStatusColor(b.testStatus).color
                                }}>
                                  {b.testStatus}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>
                              {b.testStatus === "Chờ bắt đầu" && (
                                <button 
                                  onClick={() => updateStatus(b.id, "Đã check-in")}
                                  style={{
                                    background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                >
                                  Check-in
                                </button>
                              )}
                              {b.testStatus === "Đã check-in" && (
                                <button 
                                  onClick={() => updateStatus(b.id, "Đã check-out")}
                                  style={{
                                    background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                >
                                  Check-out
                                </button>
                              )}
                              {b.testStatus === "Đã check-out" && (
                                <button 
                                  onClick={() => openResultPopup(b.id)}
                                  style={{
                                    background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                >
                                  Gửi kết quả
                                </button>
                              )}
                              {b.testStatus === "Đã kết thúc" && (
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button 
                                    onClick={() => handleViewResult(b)}
                                    style={{
                                      background: 'linear-gradient(90deg, #9c27b0 0%, #ba68c8 100%)',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: '12px'
                                    }}
                                  >
                                    Xem kết quả
                                  </button>
                                  <button 
                                    onClick={() => handleEditResult(b)}
                                    style={{
                                      background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: '12px'
                                    }}
                                  >
                                    Sửa kết quả
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Modal xem kết quả xét nghiệm */}
      {showViewResultModal && viewResultData && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ 
            background: "#fff", 
            padding: 32, 
            borderRadius: 12, 
            minWidth: 500,
            maxWidth: '90vw',
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowViewResultModal(false)}
              style={{
                position: 'absolute',
                top: 12, right: 16,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: '#0891b2',
                cursor: 'pointer',
                fontWeight: 700
              }}
              title="Đóng"
            >×</button>
            
            <h2 style={{ color: '#0891b2', marginBottom: 18, fontWeight: 700, fontSize: 24 }}>Kết quả xét nghiệm</h2>
            
            <div style={{ marginBottom: 16, lineHeight: 1.6 }}>
              <div style={{ marginBottom: 12 }}><strong>Khách hàng:</strong> {viewResultData.customerName}</div>
              <div style={{ marginBottom: 12 }}><strong>Số điện thoại:</strong> {viewResultData.phone}</div>
              <div style={{ marginBottom: 12 }}><strong>Loại xét nghiệm:</strong> {viewResultData.serviceName}</div>
              <div style={{ marginBottom: 12 }}><strong>Ngày khám:</strong> {viewResultData.appointmentDate}</div>
              <div style={{ marginBottom: 12 }}><strong>Giờ khám:</strong> {viewResultData.appointmentTime || 'N/A'}</div>
              <div style={{ marginBottom: 12 }}><strong>Kết quả:</strong> 
                <span style={{ 
                  fontWeight: 600, 
                  color: viewResultData.testResult === 'Dương tính' ? '#dc2626' : viewResultData.testResult === 'Âm tính' ? '#059669' : '#6b7280',
                  backgroundColor: viewResultData.testResult === 'Dương tính' ? '#fef2f2' : viewResultData.testResult === 'Âm tính' ? '#f0fdf4' : '#f9fafb',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${viewResultData.testResult === 'Dương tính' ? '#fecaca' : viewResultData.testResult === 'Âm tính' ? '#bbf7d0' : '#e5e7eb'}`
                }}>
                  {viewResultData.testResult}
                </span>
              </div>
              
              {viewResultData.resultNote && (
                <div style={{ marginBottom: 12, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #e0f2fe' }}>
                  <strong style={{ color: '#0891b2' }}>Ghi chú kết quả:</strong>
                  <div style={{ marginTop: 6, color: '#374151' }}>{viewResultData.resultNote}</div>
                </div>
              )}
              
              {viewResultData.bookingContent && (
                <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
                  <strong>Ghi chú booking:</strong> {viewResultData.bookingContent}
                </div>
              )}
            </div>
            
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button 
                onClick={() => setShowViewResultModal(false)}
                style={{
                  background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 32,
                  padding: '12px 32px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 16,
                  boxShadow: '0 4px 24px rgba(34,211,238,0.18)'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa kết quả xét nghiệm */}
      {showEditResultModal && editResultData && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ 
            background: "#fff", 
            padding: 32, 
            borderRadius: 12, 
            minWidth: 500,
            maxWidth: '90vw',
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowEditResultModal(false)}
              style={{
                position: 'absolute',
                top: 12, right: 16,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: '#0891b2',
                cursor: 'pointer',
                fontWeight: 700
              }}
              title="Đóng"
            >×</button>
            
            <h2 style={{ color: '#0891b2', marginBottom: 18, fontWeight: 700, fontSize: 24 }}>Chỉnh sửa kết quả xét nghiệm</h2>
            
            {/* Thông tin khách hàng */}
            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
              <div style={{ marginBottom: 8 }}><strong>Khách hàng:</strong> {editResultData.customerName}</div>
              <div style={{ marginBottom: 8 }}><strong>Số điện thoại:</strong> {editResultData.phone}</div>
              <div style={{ marginBottom: 8 }}><strong>Loại xét nghiệm:</strong> {editResultData.serviceName}</div>
              <div style={{ marginBottom: 8 }}><strong>Ngày khám:</strong> {editResultData.appointmentDate}</div>
              <div><strong>Giờ khám:</strong> {editResultData.appointmentTime || 'N/A'}</div>
            </div>
            
            {/* Form chỉnh sửa */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Kết quả xét nghiệm:</label>
              <select 
                value={editingResult} 
                onChange={e => setEditingResult(e.target.value)} 
                style={{ 
                  width: "100%", 
                  padding: "10px 12px", 
                  borderRadius: 8, 
                  border: '1px solid #cbd5e1',
                  fontSize: '16px'
                }}
              >
                <option value="">-- Chọn kết quả --</option>
                <option value="Âm tính">Âm tính</option>
                <option value="Dương tính">Dương tính</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Ghi chú kết quả (tùy chọn):</label>
              <textarea 
                value={editingResultNote} 
                onChange={e => setEditingResultNote(e.target.value)} 
                placeholder="Nhập ghi chú thêm về kết quả xét nghiệm..."
                style={{ 
                  width: "100%", 
                  padding: "10px 12px", 
                  borderRadius: 8, 
                  border: '1px solid #cbd5e1',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <button 
                onClick={() => { 
                  setShowEditResultModal(false); 
                  setEditResultData(null); 
                  setEditingResult(""); 
                  setEditingResultNote("");
                }}
                style={{
                  background: '#e0f2fe',
                  color: '#0891b2',
                  border: '1px solid #22d3ee',
                  borderRadius: 32,
                  padding: '12px 24px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button 
                onClick={handleUpdateResult} 
                style={{
                  background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 32,
                  padding: '12px 32px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 16,
                  boxShadow: '0 4px 24px rgba(16,185,129,0.18)'
                }}
              >
                Cập nhật kết quả
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup nhập kết quả xét nghiệm khi check-out */}
      {showResultPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ 
            background: "#fff", 
            padding: 32, 
            borderRadius: 12, 
            minWidth: 450,
            maxWidth: '90vw',
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            position: 'relative'
          }}>
            <h2 style={{ color: '#0891b2', marginBottom: 18, fontWeight: 700, fontSize: 24 }}>Gửi kết quả xét nghiệm</h2>
            
            {/* Thông tin khách hàng và loại xét nghiệm */}
            {pendingCheckoutId && bookings.find(b => b.id === pendingCheckoutId) && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 10 }}><b>Khách hàng:</b> {bookings.find(b => b.id === pendingCheckoutId)?.fullName}</div>
                <div style={{ marginBottom: 10 }}>
                  <b>Loại xét nghiệm:</b> {bookings.find(b => b.id === pendingCheckoutId)?.serviceName || "N/A"}
                </div>
                <div style={{ marginBottom: 10 }}><b>Ngày khám:</b> {bookings.find(b => b.id === pendingCheckoutId)?.appointmentDate}</div>
              </div>
            )}
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Kết quả xét nghiệm:</label>
              <select 
                value={selectedResult} 
                onChange={e => setSelectedResult(e.target.value)} 
                style={{ 
                  width: "100%", 
                  padding: "10px 12px", 
                  borderRadius: 8, 
                  border: '1px solid #cbd5e1',
                  fontSize: '16px'
                }}
              >
                <option value="">-- Chọn kết quả --</option>
                <option value="Âm tính">Âm tính</option>
                <option value="Dương tính">Dương tính</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Ghi chú kết quả (tùy chọn):</label>
              <textarea 
                value={resultNote} 
                onChange={e => setResultNote(e.target.value)} 
                placeholder="Nhập ghi chú thêm về kết quả xét nghiệm..."
                style={{ 
                  width: "100%", 
                  padding: "10px 12px", 
                  borderRadius: 8, 
                  border: '1px solid #cbd5e1',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <button 
                onClick={() => { 
                  setShowResultPopup(false); 
                  setPendingCheckoutId(null); 
                  setSelectedResult(""); 
                  setResultNote("");
                }}
                style={{
                  background: '#e0f2fe',
                  color: '#0891b2',
                  border: '1px solid #22d3ee',
                  borderRadius: 32,
                  padding: '12px 24px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmResult} 
                style={{
                  background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 32,
                  padding: '12px 32px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 16,
                  boxShadow: '0 4px 24px rgba(34,211,238,0.18)'
                }}
              >
                Gửi kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTestBookingManager;
