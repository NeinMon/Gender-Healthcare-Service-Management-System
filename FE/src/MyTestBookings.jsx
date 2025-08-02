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
    // Luôn chỉ hiển thị các booking đã thanh toán thành công (PAID), không hiển thị PENDING
    const paymentStatus = (booking.payment?.status || '').toUpperCase();
    if (paymentStatus !== 'PAID') return false;
    const testStatus = booking.testStatus || booking.status;
    if (filterStatus === 'all') return true;
    return testStatus === filterStatus;
  });

  const formatStatus = (status) => {
    switch (status) {
      case 'Chờ bắt đầu':
        return 'Chờ bắt đầu';
      case 'Đã check-in':
        return 'Đã check-in';
      case 'Đã check-out':
        return 'Đã check-out';
      case 'Đã kết thúc':
        return 'Đã kết thúc';
      default:
        return status || 'Không xác định';
    }
  };

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

  // Hàm helper cho màu sắc kết quả xét nghiệm
  const getResultColor = (result) => {
    switch (result) {
      case 'Dương tính':
        return { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' };
      case 'Âm tính':
        return { bg: '#dcfce7', color: '#16a34a', border: '#86efac' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
    }
  };

  // Hàm mở modal và lấy kết quả xét nghiệm từ API
  const handleShowResult = async (booking) => {
    setShowResultModal(true);
    setResultLoading(true);
    setResultError('');
    setResultData(null);
    
    try {
      console.log("Fetching test results for booking ID:", booking.id);
      
      // Lấy thông tin chi tiết booking từ API
      const bookingDetailResponse = await fetch(`http://localhost:8080/api/test-bookings/${booking.id}/detail`);
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
      
      // Lấy kết quả xét nghiệm chi tiết từ API
      let testResults = [];
      let parameterNames = {}; // Để map ID tham số với tên tham số
      try {
        console.log("Fetching detailed test results for booking ID:", booking.id);
        const testResultsResponse = await fetch(`http://localhost:8080/api/test-results/test-booking/${booking.id}`);
        console.log("Test results response status:", testResultsResponse.status);
        
        if (testResultsResponse.ok) {
          testResults = await testResultsResponse.json();
          console.log("Test results:", testResults);
          
          // Lấy thông tin tên tham số từ API service-test-parameters
          if (testResults.length > 0) {
            try {
              const serviceId = booking.serviceId || bookingDetail.serviceId;
              if (serviceId) {
                console.log("Fetching parameter names for service:", serviceId);
                const parametersResponse = await fetch(`http://localhost:8080/api/service-test-parameters/service/${serviceId}`);
                if (parametersResponse.ok) {
                  const parameters = await parametersResponse.json();
                  console.log("Service parameters:", parameters);
                  
                  // Tạo map từ parameterId sang parameterName
                  parameters.forEach(param => {
                    parameterNames[param.parameterId] = param.parameterName;
                  });
                }
              }
            } catch (paramError) {
              console.log("Error fetching parameter names:", paramError);
            }
          }
        } else if (testResultsResponse.status === 404) {
          console.log("No detailed test results found for this booking");
          testResults = [];
        }
      } catch (testResultError) {
        console.log("Error fetching detailed test results:", testResultError);
      }
      
      // Lấy kết quả tổng quát (summary) từ API
      let summaryData = null;
      try {
        console.log("Fetching summary for booking ID:", booking.id);
        const summaryResponse = await fetch(`http://localhost:8080/api/test-result-summary/test-booking/${booking.id}`);
        console.log("Summary response status:", summaryResponse.status);
        
        if (summaryResponse.ok) {
          summaryData = await summaryResponse.json();
          console.log("Summary data:", summaryData);
        } else if (summaryResponse.status === 404) {
          console.log("No summary found for this booking");
        }
      } catch (summaryError) {
        console.log("Error fetching summary:", summaryError);
      }
      
      // Cập nhật dữ liệu modal với thông tin từ API
      setResultData({
        customerName: userName,
        phoneNumber: userPhone,
        testType: serviceType || bookingDetail.serviceType || booking.serviceName || 'Không có dữ liệu',
        price: servicePrice || bookingDetail.price || booking.payment?.amount || booking.price,
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
        // Kết quả xét nghiệm chi tiết và tổng quát
        testResults: testResults,
        parameterNames: parameterNames, // Thêm map tên tham số
        summary: summaryData,
        // Fallback cho compatibility
        testResult: summaryData?.overallResult || bookingDetail.testResults || booking.testResults || 'Chưa có kết quả',
        resultNote: summaryData?.note || bookingDetail.resultNote || booking.resultNote || '',
        notes: bookingDetail.notes || booking.notes,
        lastUpdated: summaryData?.updatedAt || bookingDetail.updatedAt || bookingDetail.createdAt || 'Không có thông tin'
      });
      
      setResultLoading(false);
    } catch (err) {
      console.error("Error in handleShowResult:", err);
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
            maxWidth: 600,
            maxHeight: '85vh',
            padding: 32,
            boxShadow: '0 4px 24px rgba(8,145,178,0.15)',
            position: 'relative',
            textAlign: 'left',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <button onClick={() => setShowResultModal(false)} style={{
              position: 'absolute',
              top: 12, right: 16,
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: '#0891b2',
              cursor: 'pointer',
              fontWeight: 700,
              zIndex: 10
            }} title="Đóng">×</button>
            <h2 style={{ color: '#0891b2', marginTop: 0, marginBottom: 18, fontWeight: 700, fontSize: 22, flexShrink: 0 }}>Kết quả xét nghiệm</h2>
            <div style={{
              flex: 1,
              overflow: 'auto',
              paddingRight: '8px',
              marginRight: '-8px'
            }}>
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
                
                {/* Hiển thị kết quả tổng quát nếu có */}
                {resultData.summary && (
                  <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f0f9ff', borderRadius: 8, border: '1px solid #22d3ee' }}>
                    <strong style={{ display: 'block', marginBottom: 12, color: '#0891b2', fontSize: 16 }}>Kết quả tổng quát:</strong>
                    
                    {resultData.summary.overallResult && (
                      <div style={{ marginBottom: 10 }}>
                        <strong>Kết luận:</strong> 
                        <div style={{ marginTop: 4, color: '#374151', fontStyle: 'italic' }}>
                          {resultData.summary.overallResult}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ marginBottom: 10 }}>
                      <strong>Trạng thái tổng quát:</strong> 
                      <span style={{ 
                        fontWeight: 600, 
                        color: resultData.summary.overallStatus === 'NORMAL' ? '#059669' : '#dc2626',
                        backgroundColor: resultData.summary.overallStatus === 'NORMAL' ? '#f0fdf4' : '#fef2f2',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        marginLeft: '8px',
                        border: `1px solid ${resultData.summary.overallStatus === 'NORMAL' ? '#bbf7d0' : '#fecaca'}`
                      }}>
                        {resultData.summary.overallStatus === 'NORMAL' ? 'Bình thường' : 'Bất thường'}
                      </span>
                    </div>
                    
                    {resultData.summary.note && (
                      <div style={{ marginTop: 10 }}>
                        <strong>Ghi chú tổng quát:</strong>
                        <div style={{ marginTop: 4, color: '#374151' }}>{resultData.summary.note}</div>
                      </div>
                    )}
                    
                    <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280' }}>
                      <strong>Cập nhật lần cuối:</strong> {new Date(resultData.summary.updatedAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                )}

                {/* Hiển thị kết quả chi tiết theo tham số nếu có */}
                <div style={{ marginBottom: 16 }}>
                  <strong style={{ display: 'block', marginBottom: 8, color: '#0891b2' }}>Kết quả chi tiết theo tham số:</strong>
                  {resultData.testResults && resultData.testResults.length > 0 ? (
                    <div style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: 12, 
                      borderRadius: 6,
                      border: '1px solid #e5e7eb'
                    }}>
                      {resultData.testResults.map((tr, index) => (
                        <div key={index} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: index < resultData.testResults.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                          <div><strong>Tham số:</strong> {resultData.parameterNames[tr.parameterId] || tr.parameterId}</div>
                          <div><strong>Kết quả:</strong> {tr.resultValue} {tr.unit || ''}</div>
                          <div><strong>Trạng thái:</strong> <span style={{
                            color: tr.status === 'NORMAL' ? '#059669' : '#dc2626',
                            fontWeight: 600
                          }}>{tr.status === 'NORMAL' ? 'Bình thường' : tr.status}</span></div>
                          {tr.note && <div><strong>Ghi chú:</strong> {tr.note}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#6b7280', fontStyle: 'italic' }}>Chưa có kết quả chi tiết</div>
                  )}
                </div>
                
                {/* Fallback hiển thị kết quả cũ nếu không có summary và testResults */}
                {!resultData.summary && (!resultData.testResults || resultData.testResults.length === 0) && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Kết quả xét nghiệm:</strong> 
                    {resultData.testResult ? (
                      <span style={{
                        display: "inline-block",
                        marginLeft: "8px",
                        padding: "6px 12px",
                        borderRadius: "16px",
                        fontWeight: 600,
                        fontSize: "13px",
                        backgroundColor: getResultColor(resultData.testResult).bg,
                        color: getResultColor(resultData.testResult).color,
                        border: `2px solid ${getResultColor(resultData.testResult).border}`
                      }}>
                        {resultData.testResult}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontStyle: 'italic', marginLeft: "8px" }}>Chưa có kết quả</span>
                    )}
                  </div>
                )}
                
                {resultData.resultNote && !resultData.summary && (
                  <div style={{ marginBottom: 12, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #e0f2fe' }}>
                    <strong style={{ color: '#0891b2' }}>Ghi chú kết quả:</strong>
                    <div style={{ marginTop: 6, color: '#374151' }}>{resultData.resultNote}</div>
                  </div>
                )}
                
                {resultData.notes && (
                  <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
                    <strong>Ghi chú booking:</strong> {resultData.notes}
                  </div>
                )}
                
                {resultData.lastUpdated && (
                  <div style={{ marginTop: 16, fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                    <strong>Cập nhật lần cuối:</strong> {new Date(resultData.lastUpdated).toLocaleString('vi-VN') || resultData.lastUpdated}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#757575' }}>Không có dữ liệu kết quả.</div>
            )}
            </div>
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
                <option value="Đã kết thúc">Đã kết thúc</option>
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
                              backgroundColor: getStatusColor(booking.testStatus).bg,
                              color: getStatusColor(booking.testStatus).color
                            }}>
                              {formatStatus(booking.testStatus)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: "center" }}>
                          {booking.testStatus === 'Đã kết thúc' && (
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
                          {booking.testStatus !== 'Đã kết thúc' && (
                            <span style={{ color: '#757575', fontSize: '14px' }}>
                              {booking.testStatus === 'Đã check-in' ? 'Đang thực hiện' : 
                               booking.testStatus === 'Đã check-out' ? 'Chờ kết quả' : 'Chưa thực hiện'}
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
