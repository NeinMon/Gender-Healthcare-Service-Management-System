import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const MyTestBookings = () => {
  const navigate = useNavigate();
  const [testBookings, setTestBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [serviceNames, setServiceNames] = useState({});
    
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
      
      // Lấy danh sách booking xét nghiệm của user - sử dụng endpoint other-services
      const response = await fetch(`http://localhost:8080/api/bookings/user/${userId}/other-services`);
      if (!response.ok) {
        throw new Error('Lỗi khi lấy danh sách lịch xét nghiệm');
      }
      
      const testBookingsData = await response.json();
      
      console.log(`🔄 [MyTestBookings] Làm mới dữ liệu: ${testBookingsData.length} lịch xét nghiệm`);
      setTestBookings(testBookingsData);
      
      // Lấy danh sách serviceId duy nhất và lấy thông tin service
      const serviceIds = [...new Set(testBookingsData.map(item => item.serviceId).filter(Boolean))];
      
      // Gọi API lấy tất cả services một lần
      try {
        const servicesResponse = await fetch('http://localhost:8080/api/services');
        if (servicesResponse.ok) {
          const allServices = await servicesResponse.json();
          const namesObj = {};
          allServices.forEach(service => {
            if (serviceIds.includes(service.serviceId)) {
              namesObj[service.serviceId] = service.serviceName;
            }
          });
          // Thêm fallback cho các service không tìm thấy
          serviceIds.forEach(id => {
            if (!namesObj[id]) {
              namesObj[id] = `Xét nghiệm #${id}`;
            }
          });
          setServiceNames(namesObj);
        } else {
          // Fallback nếu không lấy được danh sách services
          const namesObj = {};
          serviceIds.forEach(id => {
            namesObj[id] = `Xét nghiệm #${id}`;
          });
          setServiceNames(namesObj);
        }
      } catch (err) {
        console.warn('Không thể lấy thông tin services:', err);
        // Fallback nếu có lỗi
        const namesObj = {};
        serviceIds.forEach(id => {
          namesObj[id] = `Xét nghiệm #${id}`;
        });
        setServiceNames(namesObj);
      }
      setLoading(false);
    } catch (err) {
      setError('Không thể tải danh sách lịch xét nghiệm. Vui lòng thử lại sau: ' + err.message);
      setLoading(false);
    }
  };

  const filteredTestBookings = testBookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });
  
  const formatStatus = (status) => {
    switch (status) {
      case 'Đã xác nhận':
      case 'Đã duyệt':
        return 'Đã duyệt';
      case 'Chờ xác nhận':
      case 'Đang chờ duyệt':
        return 'Đang chờ duyệt';
      case 'Đã xong':
      case 'Đã kết thúc':
        return 'Đã kết thúc';
      case 'Không được duyệt':
        return 'Không được duyệt';
      default:
        return status || 'Không xác định';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã xác nhận':
      case 'Đã duyệt':
        return '#4caf50';
      case 'Chờ xác nhận':
      case 'Đang chờ duyệt':
        return '#ff9800';
      case 'Đã xong':
      case 'Đã kết thúc':
        return '#2196f3';
      case 'Không được duyệt':
        return '#f44336';
      default:
        return '#757575';
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
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Đang chờ duyệt">Đang chờ duyệt</option>
                <option value="Đã kết thúc">Đã kết thúc</option>
                <option value="Không được duyệt">Không được duyệt</option>
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
                    {filteredTestBookings.map((booking, idx) => {
                      const serviceId = booking.serviceId;
                      return (
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
                                {serviceNames[serviceId] || 'Đang tải...'}
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
                              {booking.content || 'Không có ghi chú'}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: 500, textAlign: "center" }}>
                            {booking.appointmentDate || 'N/A'}
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
                                backgroundColor: getStatusColor(booking.status)
                              }}>
                                {formatStatus(booking.status)}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: "center" }}>
                            {(booking.status === 'Đã xác nhận' || booking.status === 'Đã duyệt') && (
                              <span style={{ 
                                color: "#4caf50", 
                                fontSize: "14px", 
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px"
                              }}>
                                <span style={{ fontSize: "16px" }}>✅</span> Sẵn sàng làm xét nghiệm
                              </span>
                            )}
                            {(booking.status === 'Chờ xác nhận' || booking.status === 'Đang chờ duyệt') && (
                              <span style={{ color: "#ff9800", fontSize: "14px" }}>
                                Đang chờ xác nhận...
                              </span>
                            )}
                            {(booking.status === 'Đã xong' || booking.status === 'Đã kết thúc') && (
                              <span style={{ 
                                color: "#2196f3", 
                                fontSize: "14px", 
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px"
                              }}>
                                <span style={{ fontSize: "16px" }}>🏁</span> Đã hoàn thành
                              </span>
                            )}
                            {booking.status === 'Không được duyệt' && (
                              <span style={{ color: "#f44336", fontSize: "14px" }}>
                                Bị từ chối
                              </span>
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
