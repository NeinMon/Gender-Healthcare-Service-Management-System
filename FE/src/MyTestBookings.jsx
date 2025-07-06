import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const MyTestBookings = () => {
  const navigate = useNavigate();
  const [testBookings, setTestBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState('');
    
  useEffect(() => {
    // Kiểm tra login
    const userJson = localStorage.getItem('loggedInUser');
    if (!userJson) {
      navigate('/login', { state: { from: '/my-test-bookings' } });
      return;
    }
    try {
      // Xác nhận là user object hợp lệ
      const user = JSON.parse(userJson);
      if (!user.userID) {
        navigate('/login', { state: { from: '/my-test-bookings' } });
        return;
      }
    } catch (err) {
      navigate('/login', { state: { from: '/my-test-bookings' } });
      return;
    }
    // Tải danh sách lịch xét nghiệm
    fetchTestBookings();
  }, [navigate]);
  
  const fetchTestBookings = async () => {
    try {
      setLoading(true);
      const userJson = localStorage.getItem('loggedInUser');
      const user = JSON.parse(userJson);
      const userId = user?.userID;
      if (!userId) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      // Lấy danh sách test booking detail của user
      const response = await fetch(`http://localhost:8080/api/test-bookings/user/${userId}/detail`);
      if (!response.ok) {
        throw new Error('Lỗi khi lấy danh sách lịch xét nghiệm');
      }
      const testBookingsData = await response.json();
      setTestBookings(testBookingsData);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải danh sách lịch xét nghiệm. Vui lòng thử lại sau: ' + err.message);
      setLoading(false);
    }
  };

  const filteredTestBookings = testBookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.testStatus === filterStatus;
  });

  const formatStatus = (status) => {
    switch (status) {
      case 'Chờ bắt đầu':
        return 'Chờ bắt đầu';
      case 'Đã check-in':
        return 'Đã check-in';
      case 'Đã check-out':
        return 'Đã check-out';
      default:
        return status || 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ bắt đầu':
        return '#ff9800';
      case 'Đã check-in':
        return '#4caf50';
      case 'Đã check-out':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  // Hàm mở modal và lấy kết quả xét nghiệm từ API
  const handleShowResult = async (booking) => {
    setShowResultModal(true);
    setResultLoading(true);
    setResultError('');
    setResultData(null);
    
    try {
      // Lấy thông tin chi tiết booking từ API
      const bookingDetailResponse = await fetch(`http://localhost:8080/api/test-bookings/${booking.bookingId}/detail`);
      if (!bookingDetailResponse.ok) {
        throw new Error('Không thể lấy thông tin chi tiết booking');
      }
      const bookingDetail = await bookingDetailResponse.json();
      
      // Lấy thông tin user để có họ tên và số điện thoại
      const userResponse = await fetch(`http://localhost:8080/api/users/${booking.userId || bookingDetail.userId}`);
      let userName = 'Không có dữ liệu';
      let userPhone = 'Không có dữ liệu';
      if (userResponse.ok) {
        const userData = await userResponse.json();
        userName = userData.fullName || userData.name || 'Không có dữ liệu';
        userPhone = userData.phoneNumber || userData.phone || 'Không có dữ liệu';
      }
      
      // Lấy thông tin service để có giá tiền
      const serviceResponse = await fetch(`http://localhost:8080/api/services/${booking.serviceId || bookingDetail.serviceId}`);
      let servicePrice = 'Không có dữ liệu';
      let serviceType = 'Không có dữ liệu';
      if (serviceResponse.ok) {
        const serviceData = await serviceResponse.json();
        servicePrice = serviceData.price;
        serviceType = serviceData.serviceName || serviceData.name;
      }
      
      // Cập nhật dữ liệu modal với thông tin từ API
      setResultData({
        customerName: userName,
        phoneNumber: userPhone,
        testType: serviceType || bookingDetail.serviceType || booking.serviceType || booking.serviceName || 'Không có dữ liệu',
        price: servicePrice || bookingDetail.price || booking.price,
        appointmentDateTime: (() => {
          // Gộp ngày và giờ hẹn từ backend
          let dateTimeString = 'Không có dữ liệu';
          
          if (bookingDetail.appointmentDate) {
            const appointmentDate = new Date(bookingDetail.appointmentDate);
            const formattedDate = appointmentDate.toLocaleDateString('vi-VN');
            
            if (bookingDetail.appointmentTime) {
              dateTimeString = `${formattedDate} lúc ${bookingDetail.appointmentTime}`;
            } else {
              dateTimeString = formattedDate;
            }
          } else if (booking.appointmentDate) {
            const appointmentDate = new Date(booking.appointmentDate);
            dateTimeString = appointmentDate.toLocaleDateString('vi-VN');
            
            if (booking.appointmentTime) {
              dateTimeString += ` lúc ${booking.appointmentTime}`;
            }
          }
          
          return dateTimeString;
        })(),
        testResult: bookingDetail.testResults || booking.testResults || 'Chưa có kết quả',
        notes: bookingDetail.notes || booking.notes
      });
      
      setResultLoading(false);
    } catch (err) {
      setResultError('Không thể tải thông tin chi tiết: ' + err.message);
      setResultLoading(false);
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
      {/* Modal hiển thị kết quả xét nghiệm */}
      {showResultModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            minWidth: 350,
            maxWidth: 500,
            padding: 32,
            boxShadow: '0 4px 24px rgba(8,145,178,0.15)',
            position: 'relative',
            textAlign: 'left',
          }}>
            <button onClick={() => setShowResultModal(false)} style={{
              position: 'absolute',
              top: 12, right: 16,
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: '#0891b2',
              cursor: 'pointer',
              fontWeight: 700
            }} title="Đóng">×</button>
            <h2 style={{ color: '#0891b2', marginTop: 0, marginBottom: 18, fontWeight: 700, fontSize: 22 }}>Kết quả xét nghiệm</h2>
            {resultLoading ? (
              <div style={{ color: '#0891b2', fontWeight: 600 }}>Đang tải kết quả...</div>
            ) : resultError ? (
              <div style={{ color: '#f44336', fontWeight: 600 }}>{resultError}</div>
            ) : resultData ? (
              <div>
                <div style={{ marginBottom: 12 }}><strong>Họ tên:</strong> {resultData.customerName || 'Không có dữ liệu'}</div>
                <div style={{ marginBottom: 12 }}><strong>Số điện thoại:</strong> {resultData.phoneNumber || 'Không có dữ liệu'}</div>
                <div style={{ marginBottom: 12 }}><strong>Loại xét nghiệm:</strong> {resultData.testType || 'Không có dữ liệu'}</div>
                <div style={{ marginBottom: 12 }}><strong>Giá tiền:</strong> {resultData.price ? resultData.price.toLocaleString() + ' VNĐ' : 'Không có dữ liệu'}</div>
                <div style={{ marginBottom: 12 }}><strong>Ngày giờ hẹn:</strong> {resultData.appointmentDateTime || 'Không có dữ liệu'}</div>
                <div style={{ marginBottom: 12 }}><strong>Kết quả xét nghiệm:</strong> {resultData.testResult || 'Chưa có kết quả'}</div>
                {resultData.notes && (
                  <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
                    <strong>Ghi chú:</strong> {resultData.notes}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#757575' }}>Không có dữ liệu kết quả.</div>
            )}
          </div>
        </div>
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
            Lịch xét nghiệm của tôi
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
                <option value="all">Tất cả</option>
                <option value="Chờ bắt đầu">Chờ bắt đầu</option>
                <option value="Đã check-in">Đã check-in</option>
                <option value="Đã check-out">Đã check-out</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Link 
                to="/test-booking" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#fff', 
                  fontWeight: 600, 
                  fontSize: "15px", 
                  background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)', 
                  borderRadius: "8px", 
                  padding: '10px 20px', 
                  transition: 'all 0.2s', 
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(34,211,238,0.3)"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(34,211,238,0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(34,211,238,0.3)";
                }}
              >
                <span style={{ fontSize: "18px" }}>+</span> Đặt lịch xét nghiệm mới
              </Link>
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
          ) : filteredTestBookings.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: "60px 20px",
              color: '#0891b2', 
              fontWeight: 600,
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
              <div style={{ fontSize: "40px", marginBottom: "15px" }}>🧪</div>
              <div>Không có lịch xét nghiệm nào.</div>
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
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Loại xét nghiệm</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Ghi chú</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Ngày đặt lịch</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Trạng thái</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTestBookings.map((booking, idx) => (
                      <tr 
                        key={booking.bookingId || idx} 
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
                              🧪
                            </div>
                            <span style={{ 
                              fontWeight: 600, 
                              color: '#0891b2' 
                            }}>
                              {booking.serviceName || 'Không xác định'}
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
                            {booking.bookingContent || 'Không có ghi chú'}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 500, textAlign: "center" }}>
                          {booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: "center" }}>
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <span style={{ 
                              display: "inline-block",
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontWeight: 600,
                              fontSize: "13px",
                              color: "#fff",
                              backgroundColor: getStatusColor(booking.testStatus)
                            }}>
                              {formatStatus(booking.testStatus)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: "center" }}>
                          {booking.testStatus === 'Đã check-out' && (
                            <button
                              onClick={() => handleShowResult(booking)}
                              style={{
                                backgroundColor: "#0891b2",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                padding: "8px 16px",
                                fontWeight: 600,
                                fontSize: "14px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                margin: "0 auto",
                                transition: "all 0.2s"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = "#22d3ee";
                                e.currentTarget.style.transform = "translateY(-2px)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "#0891b2";
                                e.currentTarget.style.transform = "translateY(0)";
                              }}
                            >
                              <span style={{ fontSize: "16px" }}>📋</span> Xem kết quả
                            </button>
                          )}
                          {booking.testStatus !== 'Đã check-out' && (
                            <span style={{ color: '#757575', fontSize: '14px' }}>
                              {booking.testStatus === 'Đã check-in' ? 'Đang thực hiện' : 'Chưa thực hiện'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
    </div>
  );
};

export default MyTestBookings;
