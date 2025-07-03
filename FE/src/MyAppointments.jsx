import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import VideoCall from './components/VideoCall';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Đúng mapping status backend: 'Chờ bắt đầu', 'Đang diễn ra', 'Đã kết thúc'
  const [filterStatus, setFilterStatus] = useState('all');
  const [consultantNames, setConsultantNames] = useState({});
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoChannel, setVideoChannel] = useState(null);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  
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
      
      // Lấy danh sách booking của user - sử dụng endpoint consultations
      const response = await fetch(`http://localhost:8080/api/bookings/user/${userId}/consultations`);
      if (!response.ok) {
        throw new Error('Lỗi khi lấy danh sách lịch hẹn');
      }
      
      const data = await response.json();
      console.log(`🔄 [MyAppointments] Làm mới dữ liệu: ${data.length} lịch hẹn`);
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
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filterStatus === 'all') return true;
    // So sánh đúng với status backend
    return app.status === filterStatus;
  });
  // Chức năng hủy lịch hẹn đã được gỡ bỏ
  // Chức năng kiểm tra điều kiện hủy lịch hẹn đã được gỡ bỏ
  // Đã xóa hàm kiểm tra điều kiện tham gia
  
  const formatStatus = (status) => {
    switch (status) {
      case 'Chờ bắt đầu':
        return 'Chờ bắt đầu';
      case 'Đang diễn ra':
        return 'Đang diễn ra';
      case 'Đã kết thúc':
        return 'Đã kết thúc';
      default:
        return status || 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ bắt đầu':
        return '#fde68a'; // vàng nhạt
      case 'Đang diễn ra':
        return '#22d3ee'; // xanh cyan
      case 'Đã kết thúc':
        return '#cbd5e1'; // xám nhạt
      default:
        return '#757575';
    }
  };

  // Đúng mapping status backend
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Chờ bắt đầu', label: 'Chờ bắt đầu' },
    { value: 'Đang diễn ra', label: 'Đang diễn ra' },
    { value: 'Đã kết thúc', label: 'Đã kết thúc' }
  ];

  return (
    <div style={{ 
      backgroundColor: "#f0f9ff", 
      minHeight: "100vh",
      width: "100%",
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: "flex",
      flexDirection: "column"
    }}>
      {showVideoCall && (
        <VideoCall 
          channelName={videoChannel} 
          onLeave={(endCall = false) => {
            console.log(`🔄 [MyAppointments] Cuộc gọi kết thúc`);
            setShowVideoCall(false);
            setVideoChannel(null);
            
            // Xóa ID lịch hẹn đang hoạt động
            if (activeBookingId) {
              setActiveBookingId(null);
            }
          }} 
          userRole="audience"
        />
      )}
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
          maxWidth: "1400px",
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
          <Link to="/" style={{ 
            display: "flex", 
            alignItems: "center", 
            pointerEvents: "auto" 
          }}>
            <img
              src="/Logo.png"
              alt="Logo"
              style={{ height: 85, width: 85, objectFit: "contain" }}
            />
          </Link>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            pointerEvents: "auto" 
          }}>
            <UserAvatar userName="Khách hàng" />
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
            Lịch hẹn của tôi
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
          maxWidth: "1200px",
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
              gap: "12px"
            }}>
              <label style={{ 
                fontWeight: 600, 
                color: '#0891b2' 
              }}>Lọc theo trạng thái: </label>
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)} 
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
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <Link 
              to="/" 
              style={{ 
                textDecoration: 'none', 
                color: '#0891b2', 
                fontWeight: 600, 
                fontSize: "15px", 
                border: '1px solid #22d3ee', 
                borderRadius: "8px", 
                padding: '10px 20px', 
                background: '#fff', 
                transition: 'all 0.2s', 
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f9ff"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fff"}
            >
              <span style={{ fontSize: "18px" }}>←</span> Quay lại trang chủ
            </Link>
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
          ) : error ? (
            <div style={{ 
              color: '#f44336', 
              textAlign: 'center', 
              padding: "40px 20px",
              fontWeight: 600,
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>⚠️</div>
              <div>{error}</div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: "60px 20px",
              color: '#0891b2', 
              fontWeight: 600,
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
              <div style={{ fontSize: "40px", marginBottom: "15px" }}>📅</div>
              <div>Không có lịch hẹn nào.</div>
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
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ 
                      background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                      textAlign: "center"
                    }}>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Tư vấn viên</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Nội dung</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Ngày đặt lịch</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Trạng thái</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((app, idx) => {
                      const consultantId = app.consultantId;
                      return (
                        <tr 
                          key={app.bookingId || idx} 
                          style={{ 
                            borderBottom: '1px solid #e0f2fe', 
                            transition: "all 0.2s"
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f9ff"}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <td style={{ padding: '16px 24px', textAlign: "center" }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 10,
                              justifyContent: "center"
                            }}>
                              <div style={{ 
                                width: "36px", 
                                height: "36px", 
                                borderRadius: "50%", 
                                backgroundColor: "#0891b2", 
                                color: "white", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                fontWeight: "bold",
                                fontSize: "16px"
                              }}>
                                {(consultantNames[consultantId] || '?').charAt(0).toUpperCase()}
                              </div>
                              <span style={{ 
                                fontWeight: 600, 
                                color: '#0891b2' 
                              }}>
                                {consultantNames[consultantId] || 'Đang tải...'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: 500, maxWidth: "300px", textAlign: "center" }}>
                            <div style={{ 
                              overflow: "hidden", 
                              textOverflow: "ellipsis", 
                              whiteSpace: "nowrap", 
                              maxWidth: "100%"
                            }}>
                              {app.content || 'Không có nội dung'}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: 500, textAlign: "center" }}>
                            {app.appointmentDate || 'N/A'}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <span style={{
                                display: "inline-block",
                                padding: "6px 12px",
                                borderRadius: "20px",
                                fontWeight: 600,
                                fontSize: "13px",
                                color: app.status === 'Đang diễn ra' ? '#fff' : (app.status === 'Chờ bắt đầu' ? '#b45309' : '#64748b'),
                                backgroundColor: getStatusColor(app.status)
                              }}>
                                {formatStatus(app.status)}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: "center" }}>
                            {app.status === 'Đang diễn ra' && (
                              <button
                                style={{
                                  background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: "8px",
                                  padding: '10px 16px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontSize: "15px",
                                  boxShadow: "0 2px 8px rgba(34,211,238,0.25)",
                                  outline: 'none',
                                  opacity: 1,
                                  filter: 'none',
                                  transition: "all 0.2s"
                                }}
                                onMouseOver={e => {
                                  e.currentTarget.style.background = 'linear-gradient(90deg, #0891b2 0%, #06b6d4 100%)';
                                  e.currentTarget.style.transform = "scale(1.04)";
                                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(34,211,238,0.35)";
                                }}
                                onMouseOut={e => {
                                  e.currentTarget.style.background = 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)';
                                  e.currentTarget.style.transform = "scale(1)";
                                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(34,211,238,0.25)";
                                }}
                                onClick={() => { 
                                  const bookingId = app.bookingId;
                                  const channelName = bookingId ? `booking_${bookingId}` : null;
                                  if (!channelName) {
                                    alert("Không thể tham gia cuộc gọi do thiếu thông tin đặt lịch!");
                                    return;
                                  }
                                  setActiveBookingId(bookingId);
                                  setVideoChannel(channelName);
                                  setShowVideoCall(true);
                                }}
                              >
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ fontSize: "16px" }}>🎥</span> Tham gia tư vấn
                                </span>
                              </button>
                            )}
                            {app.status === 'Chờ bắt đầu' && (
                              <span style={{ color: "#b45309", fontSize: "14px", fontWeight: "500" }}>
                                Chưa đến giờ hẹn
                              </span>
                            )}
                            {app.status === 'Đã kết thúc' && (
                              <>
                                <button
                                  style={{
                                    background: '#e0f2fe',
                                    color: '#0891b2',
                                    border: '1px solid #22d3ee',
                                    borderRadius: "8px",
                                    padding: '8px 14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: "14px",
                                    marginLeft: 4,
                                    transition: "all 0.2s"
                                  }}
                                  onClick={() => {
                                    setDetailData({
                                      consultant: consultantNames[app.consultantId] || 'N/A',
                                      content: app.content || 'Không có',
                                      date: app.appointmentDate || 'N/A',
                                      startTime: app.startTime || 'N/A',
                                      endTime: app.endTime || 'N/A',
                                      status: app.status
                                    });
                                    setShowDetailModal(true);
                                  }}
                                >
                                  Xem chi tiết cuộc gọi
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Modal chi tiết đã được ẩn */}
          {/* Modal hủy lịch hẹn đã được ẩn */}
        </div>
      </main>
      
      <footer style={{ 
        backgroundColor: "#e0f2fe",
        color: "#0891b2", 
        padding: "20px",
        textAlign: "center",
        borderTop: "1px solid rgba(8,145,178,0.1)"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          <div style={{ fontWeight: 600, fontSize: "16px" }}>
            &copy; {new Date().getFullYear()} Sức khỏe giới tính
          </div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            Một sản phẩm của cơ sở y tế Việt Nam
          </div>
        </div>
      </footer>
      {showDetailModal && detailData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 32,
            minWidth: 340,
            maxWidth: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            position: 'relative'
          }}>
            <h2 style={{ color: '#0891b2', marginBottom: 18 }}>Chi tiết cuộc gọi</h2>
            <div style={{ marginBottom: 10 }}><b>Tư vấn viên:</b> {detailData.consultant}</div>
            <div style={{ marginBottom: 10 }}>
              <div><b>Nội dung</b></div> 
              <div style={{ 
                wordWrap: 'break-word', 
                wordBreak: 'break-word',
                maxWidth: '400px',
                marginLeft: '8px',
                marginTop: '4px',
                lineHeight: '1.5'
              }}>
                {detailData.content}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}><b>Ngày:</b> {detailData.date}</div>
            <div style={{ marginBottom: 10 }}><b>Bắt đầu:</b> {detailData.startTime}</div>
            <div style={{ marginBottom: 10 }}><b>Kết thúc:</b> {detailData.endTime}</div>
            <div style={{ marginBottom: 18 }}><b>Trạng thái:</b> {detailData.status}</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <button
                style={{
                  background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 32,
                  padding: '14px 48px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 18,
                  boxShadow: '0 4px 24px rgba(34,211,238,0.18)',
                  letterSpacing: 1,
                  transition: 'all 0.2s',
                  outline: 'none',
                  margin: 0
                }}
                onClick={() => setShowDetailModal(false)}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)';
                  e.currentTarget.style.transform = 'scale(1.06)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,211,238,0.28)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(34,211,238,0.18)';
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;