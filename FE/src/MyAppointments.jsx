import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import VideoCall from './components/VideoCall';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [consultantNames, setConsultantNames] = useState({});
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoChannel, setVideoChannel] = useState(null);
  
  useEffect(() => {
    // Kiểm tra login
    const userJson = localStorage.getItem('loggedInUser');
    if (!userJson) {
      navigate('/login', { state: { from: '/my-appointments' } });
      return;
    }
    
    try {
      // Xác nhận là user object hợp lệ
      const user = JSON.parse(userJson);
      if (!user.userID) { // Sửa từ user.id thành user.userID theo Users entity
        navigate('/login', { state: { from: '/my-appointments' } });
        return;
      }
    } catch (err) {
      navigate('/login', { state: { from: '/my-appointments' } });
      return;
    }
    
    // Tải danh sách lịch hẹn
    fetchAppointments();
  }, [navigate]);
  
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const userJson = localStorage.getItem('loggedInUser');
      const user = JSON.parse(userJson);
      // Kiểm tra ID dựa trên entity Users.java sử dụng userID
      const userId = user?.userID;
      
      if (!userId) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      // Lấy danh sách booking của user
      const response = await fetch(`http://localhost:8080/api/bookings/user/${userId}`);
      if (!response.ok) {
        throw new Error('Lỗi khi lấy danh sách lịch hẹn');
      }
      
      const data = await response.json();
      setAppointments(data);
      
      // Lấy danh sách consultantId duy nhất
      const consultantIds = [...new Set(data.map(item => item.consultantId).filter(Boolean))];
      
      // Gọi API lấy thông tin tư vấn viên cho từng consultantId
      const namesObj = {};
      await Promise.all(
        consultantIds.map(async (id) => {
          try {
            const res = await fetch(`http://localhost:8080/api/users/${id}`);
            if (res.ok) {
              const consultantData = await res.json();
              // Sử dụng fullName từ entity Users
              namesObj[id] = consultantData.fullName || `Tư vấn viên #${id}`;
            } else {
              namesObj[id] = `Tư vấn viên #${id}`;
            }
          } catch {
            namesObj[id] = `Tư vấn viên #${id}`;
          }
        })
      );
        setConsultantNames(namesObj);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau: ' + err.message);
      setLoading(false);    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filterStatus === 'all') return true;
    
    // Xử lý trạng thái theo đúng entity Booking trong backend
    // So sánh trực tiếp với giá trị status từ backend: "Chờ xác nhận", "Đã xác nhận", "Đã xong"
    return app.status === filterStatus;
  });
  // Chức năng hủy lịch hẹn đã được gỡ bỏ
  // Chức năng kiểm tra điều kiện hủy lịch hẹn đã được gỡ bỏ
  // Đã xóa hàm kiểm tra điều kiện tham gia
  
  const formatStatus = (status) => {
    switch (status) {
      case 'Đã xác nhận':
        return 'Đã xác nhận';
      case 'Chờ xác nhận':
        return 'Chờ xác nhận';
      case 'Đã xong':
        return 'Đã hoàn thành';
      default:
        return status || 'Không xác định';
    }
  };
  // Đã xóa hàm formatMethod vì không cần thiết
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã xác nhận':
        return '#4caf50';
      case 'Chờ xác nhận':
        return '#ff9800';
      case 'Đã xong':
        return '#2196f3';
      default:
        return '#757575';
    }
  };
  // Đã xóa các hàm xử lý hành động

  return (
    <div style={{ 
      backgroundColor: "#f0f9ff !important", 
      background: "#f0f9ff !important",
      colorScheme: "light",
      minHeight: "100vh",
      width: "100vw",
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {showVideoCall && (
        <VideoCall 
          channelName={videoChannel} 
          onLeave={() => { setShowVideoCall(false); setVideoChannel(null); }} 
          userRole="audience"
        />
      )}
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 0,
        position: "relative"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          paddingTop: 18,
          paddingLeft: 20,
          paddingRight: 20
        }}>
          <img
            src="/Logo.png"
            alt="Logo"
            style={{ height: 100, width: 100, objectFit: "contain" }}
          />
          <UserAvatar userName="Khách hàng" />
        </div>
        <h1
          style={{
            color: "#fff",
            margin: 0,
            padding: "24px 0 16px 0",
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: 1
          }}
        >
          Lịch hẹn của tôi
        </h1>
      </header>
      <main style={{
        padding: "40px 20px",
        minHeight: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        background: "#f0f9ff !important",
        backgroundColor: "#f0f9ff !important",
        colorScheme: "light"
      }}>
        <div style={{
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto"
        }}>
          <div style={{ margin: '32px 0 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px' }}>
            <div>
              <label style={{ fontWeight: 600, color: '#0891b2' }}>Lọc theo trạng thái: </label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #22d3ee', outline: 'none', fontWeight: 600, color: '#0891b2', background: '#fff' }}>
                <option value="all">Tất cả</option>
                <option value="Đã xác nhận">Đã xác nhận</option>
                <option value="Chờ xác nhận">Chờ xác nhận</option>
                <option value="Đã xong">Đã hoàn thành</option>
              </select>
            </div>
            <Link to="/services" style={{ textDecoration: 'none', color: '#22d3ee', fontWeight: 600, fontSize: 16, border: '1px solid #22d3ee', borderRadius: 8, padding: '8px 20px', background: '#fff', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(34,211,238,0.08)' }}>← Quay lại trang dịch vụ</Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: 60 }}>
              <span style={{ color: '#0891b2', fontWeight: 600, fontSize: 18 }}>Đang tải dữ liệu...</span>
            </div>
          ) : error ? (
            <div style={{ color: '#f44336', textAlign: 'center', marginTop: 60, fontWeight: 600 }}>{error}</div>          ) : filteredAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 60, color: '#0891b2', fontWeight: 600 }}>Không có lịch hẹn nào.</div>
          ) : (
            <div style={{ width: '100%', overflowX: 'auto', padding: '0 32px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead style={{ background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)' }}>
                  <tr>
                    <th style={{ padding: 14, color: '#fff', fontWeight: 700 }}>Tư vấn viên</th>
                    <th style={{ color: '#fff', fontWeight: 700 }}>Nội dung</th>
                    <th style={{ color: '#fff', fontWeight: 700 }}>Ngày đặt lịch</th>
                    <th style={{ color: '#fff', fontWeight: 700 }}>Trạng thái</th>
                    <th style={{ color: '#fff', fontWeight: 700 }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((app, idx) => {
                    const consultantId = app.consultantId;
                    return (
                      <tr key={app.bookingId || idx} style={{ borderBottom: '1px solid #e0f2fe', transition: 'background 0.2s' }}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
                          <span style={{ fontWeight: 600, color: '#0891b2' }}>{consultantNames[consultantId] || '...'}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{app.content || 'Không có nội dung'}</td>
                        <td style={{ fontWeight: 500 }}>{app.appointmentDate || 'N/A'}</td>
                        <td style={{ color: getStatusColor(app.status), fontWeight: 700 }}>{formatStatus(app.status)}</td>
                        <td>
                          {app.status === 'Đã xác nhận' && (
                            <button
                              style={{
                                background: '#22d3ee', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 14
                              }}
                              onClick={() => { 
                                // QUAN TRỌNG: Sử dụng bookingId làm tên kênh để đảm bảo nhất quán
                                // Đảm bảo cách tạo kênh GIỐNG CHÍNH XÁC với ConsultantInterface.jsx
                                const bookingId = app.bookingId;
                                // Luôn sử dụng "booking_" + bookingId làm tên kênh
                                const channelName = bookingId ? `booking_${bookingId}` : null;
                                
                                if (!channelName) {
                                  alert("Không thể tham gia cuộc gọi do thiếu thông tin đặt lịch!");
                                  return;
                                }
                                
                                console.log(`[CLIENT] Bắt đầu cuộc gọi trên kênh: ${channelName}`);
                                setVideoChannel(channelName);
                                setShowVideoCall(true);
                              }}
                            >
                              Tham gia tư vấn
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* Modal chi tiết đã được ẩn */}
          {/* Modal hủy lịch hẹn đã được ẩn */}
        </div>
      </main>
      <footer style={{ 
        background: "#e0f2fe !important", 
        backgroundColor: "#e0f2fe !important",
        colorScheme: "light",
        color: "#0891b2", 
        padding: "20px", 
        textAlign: "center" 
      }}>
        &copy; {new Date().getFullYear()} Sức khỏe giới tính - Một sản phẩm của cơ sở y tế Việt Nam
      </footer>
    </div>
  );
};

export default MyAppointments;