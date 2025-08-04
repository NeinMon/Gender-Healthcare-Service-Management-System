import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import {
  fetchTestTypes,
  fetchUserInfo,
  fetchServicePrice,
  createBooking,
  createPayment,
  checkPaymentStatus,
  checkPaymentStatusByOrderCode,
  calculateAge,
  mapGender,
  getServiceById,
  isTimeSlotPassed,
  getUserIdFromStorage,
  validateBookingForm,
  prepareBookingData,
  preparePaymentData
} from './utils/testBookingHelpers';

const TestBooking = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    testType: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm loading state
  const [testTypes, setTestTypes] = useState([]); // Chuyển từ static thành state

  // State cho quy trình thanh toán
  const [bookingStep, setBookingStep] = useState('form'); // 'form', 'processing', 'payment', 'success', 'error'
  const [paymentUrl, setPaymentUrl] = useState('');
  const [currentBooking, setCurrentBooking] = useState(null);
  const [servicePrice, setServicePrice] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    // Lấy danh sách các loại test từ API
    const loadTestTypes = async () => {
      const types = await fetchTestTypes();
      setTestTypes(types);
    };

    loadTestTypes();

    // Lấy thông tin user từ localStorage dựa vào loggedInUser
    const userId = getUserIdFromStorage();
    
    const loadUserInfo = async () => {
      const userInfo = await fetchUserInfo(userId);
      if (userInfo) {
        setFormData(prev => ({
          ...prev,
          ...userInfo
        }));
      }
    };
    loadUserInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Reset thời gian đã chọn nếu thay đổi ngày và thời gian đó đã qua
    if (name === 'preferredDate' && formData.preferredTime && isTimeSlotPassed(`${formData.preferredTime}:00 - ${(parseInt(formData.preferredTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`, value)) {
      setFormData(prev => ({
        ...prev,
        preferredTime: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validation
      validateBookingForm(formData);
      
      setIsSubmitting(true); // Bắt đầu loading
      setBookingStep('processing');
      
      // Chuẩn bị dữ liệu để gửi về backend
      const bookingData = prepareBookingData(formData, testTypes);
      
      // Tạo booking
      const bookingResult = await createBooking(bookingData);
      setCurrentBooking(bookingResult);
      
      // Lấy giá dịch vụ
      const serviceInfo = await fetchServicePrice(bookingData.serviceId);
      if (!serviceInfo || !serviceInfo.price || isNaN(Number(serviceInfo.price))) {
        throw new Error('Không lấy được giá dịch vụ hợp lệ!');
      }
      
      setServicePrice(serviceInfo.price);
      setServiceName(serviceInfo.serviceName);
      
      // Tạo payment
      const paymentPayload = preparePaymentData(bookingResult, Number(serviceInfo.price), serviceInfo.serviceName);
      const paymentData = await createPayment(paymentPayload);
      
      setPaymentUrl(paymentData.payUrl);
      setBookingStep('payment');
      
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert(error.message);
      setBookingStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };  

  // Theo dõi trạng thái thanh toán khi ở bước payment
  useEffect(() => {
    let intervalId;
    if (bookingStep === 'payment' && currentBooking?.bookingId) {
      intervalId = setInterval(async () => {
        const result = await checkPaymentStatus(currentBooking.bookingId);
        if (result) {
          setPaymentStatus(result.paymentStatus);
          if (result.paymentStatus === 'PAID') {
            setBookingStep('success');
            clearInterval(intervalId);
          } else if (result.paymentStatus === 'CANCELLED') {
            setBookingStep('error');
            clearInterval(intervalId);
          }
        } else {
          // Nếu backend lỗi, chuyển sang trạng thái processing và báo đang xác nhận
          setBookingStep('processing');
          setPaymentStatus('');
        }
      }, 3000);
    }
    return () => intervalId && clearInterval(intervalId);
  }, [bookingStep, currentBooking]);

  // Xử lý redirect từ PayOS
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingIdParam = urlParams.get('bookingId');
    const orderCodeParam = urlParams.get('orderCode');
    const statusParam = urlParams.get('status');
    
    // Ưu tiên kiểm tra orderCode nếu có (PayOS trả về UUID)
    const handleStatusCheck = async (id, isOrderCode = false) => {
      setBookingStep('processing');
      
      const result = isOrderCode 
        ? await checkPaymentStatusByOrderCode(id)
        : await checkPaymentStatus(id);
        
      if (result) {
        setPaymentStatus(result.paymentStatus);
        if (result.paymentStatus === 'PAID') setBookingStep('success');
        else setBookingStep('error');
      } else {
        setBookingStep('processing');
      }
    };
    
    if ((orderCodeParam || bookingIdParam) && statusParam === 'success') {
      if (orderCodeParam) handleStatusCheck(orderCodeParam, true);
      else handleStatusCheck(bookingIdParam, false);
    } else if ((orderCodeParam || bookingIdParam) && statusParam === 'cancel') {
      setBookingStep('error');
    }
  }, []);

  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100vw" }}>{/* Header */}      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 0,
        position: "relative",
        width: "100%"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "15px 20px"
        }}>
          <img
            src="/Logo.png"
            alt="Logo"
            style={{ height: 60, width: 60, objectFit: "contain" }}
          />
          <h1
            style={{
              color: "#fff",
              margin: 0,
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: "2rem"
            }}
          >
            Đặt lịch Xét nghiệm
          </h1>
          <UserAvatar userName="Nguyễn Thị A" />
        </div>
      </header>      {/* Main Content */}
      <main style={{
        padding: "40px",
        width: "100%",
        flex: 1,
        backgroundColor: "#fff",
        boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
        marginTop: "-20px",
        boxSizing: "border-box"
      }}>
        <div style={{ marginBottom: "20px" }}>          <Link 
            to="/" 
            style={{
              display: "flex",
              alignItems: "center",
              color: "#0891b2",
              textDecoration: "none",
              fontWeight: 500
            }}
          >
            ← Quay lại trang chủ
          </Link>
        </div>

        {/* Các bước UI mới */}
        {bookingStep === 'processing' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>⏳ Đang xử lý thanh toán...</div>
            <div style={{ color: '#666', marginBottom: '20px' }}>
              Yêu cầu của bạn đang được xử lý. Vui lòng chờ hoặc kiểm tra lại sau ít phút.
            </div>
          </div>
        )}
        {bookingStep === 'payment' && paymentUrl && (
          <iframe
            src={paymentUrl}
            title="PayOS Payment"
            style={{
              position: 'fixed',
              top: 110,
              left: 0,
              width: '100vw',
              height: 'calc(100vh - 110px)',
              border: 'none',
              borderRadius: 0,
              margin: 0,
              padding: 0,
              zIndex: 1000,
              background: '#fff',
              display: 'block',
              overflow: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            allow="payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            scrolling="no"
          />
        )}
        {bookingStep === 'success' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ background: 'rgba(232, 245, 233, 0.9)', borderRadius: '16px', padding: '30px', border: '2px solid rgba(67, 160, 71, 0.2)', boxShadow: '0 8px 16px rgba(67, 160, 71, 0.1)' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px', color: '#43a047' }}>✅</div>
              <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '15px', color: '#43a047' }}>Đặt lịch xét nghiệm thành công!</h2>
              <p><strong>Dịch vụ:</strong> {serviceName}</p>
              <p><strong>Giá tiền:</strong> {currentBooking?.payment?.amount?.toLocaleString() || servicePrice?.toLocaleString()} VND</p>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link
                  to="/my-test-bookings"
                  style={{
                    display: 'inline-block',
                    background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '12px 25px',
                    borderRadius: '25px',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📋 Xem lịch xét nghiệm của tôi
                </Link>
              </div>
            </div>
          </div>
        )}
        {bookingStep === 'error' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '20px', color: 'red' }}>❌</div>
            <div style={{ color: '#666', marginBottom: '30px' }}>Thanh toán thất bại hoặc đã bị hủy. Vui lòng thử lại hoặc liên hệ hỗ trợ.</div>
            <button onClick={() => setBookingStep('form')} style={{marginTop: 20, padding: '10px 30px', borderRadius: 20, background: '#0891b2', color: '#fff', border: 'none', fontWeight: 600}}>Quay lại</button>
          </div>
        )}

        {/* Ẩn form khi không ở bước 'form' */}
        {bookingStep === 'form' && !isSubmitted && (
          <>
            <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "30px", width: "100%" }}>
              Đặt lịch xét nghiệm y tế
            </h2>
            <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "1600px", margin: "0 auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    required
                    style={{
                      ...inputStyle,
                      backgroundColor: "#f5f5f5",
                      color: "#666",
                      cursor: "not-allowed",
                      border: "1px solid #ddd"
                    }}
                    placeholder="Nguyễn Văn A"
                    readOnly
                    disabled
                    tabIndex="-1"
                  />
                </div>
                
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Tuổi *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    required
                    style={{
                      ...inputStyle,
                      backgroundColor: "#f5f5f5",
                      color: "#666",
                      cursor: "not-allowed",
                      border: "1px solid #ddd"
                    }}
                    placeholder="25"
                    readOnly
                    disabled
                    tabIndex="-1"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Giới tính *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    required
                    style={{
                      ...inputStyle,
                      backgroundColor: "#f5f5f5",
                      color: "#666",
                      cursor: "not-allowed",
                      border: "1px solid #ddd"
                    }}
                    disabled
                    tabIndex="-1"
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="female">Nữ</option>
                    <option value="male">Nam</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    required
                    style={{
                      ...inputStyle,
                      backgroundColor: "#f5f5f5",
                      color: "#666",
                      cursor: "not-allowed",
                      border: "1px solid #ddd"
                    }}
                    placeholder="0912345678"
                    readOnly
                    disabled
                    tabIndex="-1"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    style={{
                      ...inputStyle,
                      backgroundColor: "#f5f5f5",
                      color: "#666",
                      cursor: "not-allowed",
                      border: "1px solid #ddd"
                    }}
                    placeholder="example@gmail.com"
                    readOnly
                    disabled
                    tabIndex="-1"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Loại xét nghiệm *</label>
                  <select
                    name="testType"
                    value={formData.testType}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  >
                    <option value="">-- Chọn loại xét nghiệm --</option>
                    {testTypes.map(test => (
                      <option key={test.serviceId} value={test.serviceId}>
                        {test.serviceName} - {test.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Ngày muốn xét nghiệm *</label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Thời gian *</label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  >
                    <option value="">-- Chọn thời gian --</option>
                    <option value="08:00" disabled={isTimeSlotPassed("08:00 - 09:00", formData.preferredDate)}>08:00 - 09:00</option>
                    <option value="09:00" disabled={isTimeSlotPassed("09:00 - 10:00", formData.preferredDate)}>09:00 - 10:00</option>
                    <option value="10:00" disabled={isTimeSlotPassed("10:00 - 11:00", formData.preferredDate)}>10:00 - 11:00</option>
                    <option value="13:00" disabled={isTimeSlotPassed("13:00 - 14:00", formData.preferredDate)}>13:00 - 14:00</option>
                    <option value="14:00" disabled={isTimeSlotPassed("14:00 - 15:00", formData.preferredDate)}>14:00 - 15:00</option>
                    <option value="15:00" disabled={isTimeSlotPassed("15:00 - 16:00", formData.preferredDate)}>15:00 - 16:00</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", marginTop: "25px", width: "100%" }}>
                <label style={labelStyle}>Ghi chú / Mô tả lý do khám</label>                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  style={{ ...inputStyle, height: "120px" }}
                  placeholder="Nhập lý do khám, triệu chứng hoặc mô tả tình trạng sức khỏe (tùy chọn, tối đa 500 ký tự)"
                ></textarea>
              </div>              <div style={{ marginTop: "35px", textAlign: "center" }}>                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: isSubmitting 
                      ? "#ccc" 
                      : "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "14px 35px",
                    borderRadius: "30px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseOut={(e) => {
                    if (!isSubmitting) e.target.style.transform = "scale(1)";
                  }}
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                </button>
              </div>
            </form>
          </>
        )}
        {/* Thông tin thêm */}        <div style={{ 
          marginTop: "40px", 
          padding: "20px", 
          backgroundColor: "#e0f2fe", 
          borderRadius: "10px",
          border: "1px solid #0891b2",
          width: "100%"
        }}>
          <h3 style={{ color: "#0891b2", marginBottom: "10px" }}>Lưu ý quan trọng:</h3>
          <ul style={{ color: "#0891b2", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}>Vui lòng đến trước giờ hẹn 15 phút để hoàn thành thủ tục.</li>
            <li style={{ marginBottom: "8px" }}>Mang theo CMND/CCCD và thẻ BHYT (nếu có).</li>
            <li style={{ marginBottom: "8px" }}>Đối với một số xét nghiệm, bạn có thể cần nhịn ăn trước khi xét nghiệm. Chúng tôi sẽ thông báo chi tiết khi xác nhận lịch hẹn.</li>
            <li style={{ marginBottom: "8px" }}>Kết quả xét nghiệm sẽ được thông báo qua số điện thoại hoặc email đã đăng ký.</li>
          </ul>
        </div>
      </main>      {/* Footer */}      <footer style={{
        marginTop: "40px",
        padding: "20px",
        backgroundColor: "#e0f2fe",
        textAlign: "center",
        color: "#0891b2",
        width: "100%"
      }}>
        <p>© 2025 Hệ thống Chăm sóc Sức khỏe Phụ nữ. Mọi quyền được bảo lưu.</p>
        <p style={{ marginTop: "10px" }}>Hotline: 1900-xxxx | Email: support@healthcare.com</p>
      </footer>
    </div>
  );
};

// Định nghĩa styles
const labelStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#2c3e50",
  marginBottom: "8px"
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e1e1e1",
  fontSize: "14px",
  color: "#2c3e50",
  transition: "all 0.3s ease",
  outline: "none",
  backgroundColor: "#f9f9f9"
};

export default TestBooking;
