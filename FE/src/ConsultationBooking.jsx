import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import {
  fetchConsultants,
  fetchAvailableConsultants,
  fetchConsultantSchedule,
  generateTimeSlotsByShift,
  fetchConsultationPrice,
  fetchUserInfo,
  fetchAvailableTimes,
  isTimeSlotPassed,
  getUserIdFromStorage,
  validateBookingData,
  createBookingPayload,
  createBooking,
  createPaymentUrl,
  checkPaymentStatus,
  retryPayment,
  cancelPayment,
  handleFormChange,
  parseUrlParams,
  shouldShowCancelledStatus,
  shouldCheckPaymentStatus,
  labelStyle,
  inputStyle
} from './utils/consultationBookingHelpers';

const ConsultationBooking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    date: '',
    time: '',
    consultantId: '',
    symptoms: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [consultants, setConsultants] = useState([]); // Sử dụng state để lưu danh sách tư vấn viên từ API
  const [availableTimes, setAvailableTimes] = useState([]);
  const [consultantSchedule, setConsultantSchedule] = useState(null); // Thông tin ca làm việc của consultant
  const [error, setError] = useState('');
  const [loadingTimes, setLoadingTimes] = useState(false); // Thêm state loading cho khung giờ
  // New states for payment flow
  const [bookingStep, setBookingStep] = useState('form'); // 'form', 'processing', 'payment', 'success', 'error'
  const [bookingDetails, setBookingDetails] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  // State cho giá dịch vụ tư vấn
  const [consultationPrice, setConsultationPrice] = useState(10000); // default fallback

  useEffect(() => {
    // Gọi API lấy danh sách tư vấn viên
    fetchConsultants(setConsultants);

    // Lấy giá dịch vụ tư vấn (serviceId=1)
    fetchConsultationPrice(setConsultationPrice);

    // Lấy thông tin user từ localStorage
    fetchUserInfo(setFormData);
  }, []);

  // Lấy danh sách consultant có lịch làm việc khi chọn ngày
  useEffect(() => {
    if (formData.date) {
      fetchAvailableConsultants(formData.date, setConsultants);
      // Reset consultant selection khi đổi ngày
      setFormData(prev => ({ ...prev, consultantId: '', time: '' }));
      setConsultantSchedule(null);
    } else {
      // Nếu chưa chọn ngày, hiển thị tất cả consultant
      fetchConsultants(setConsultants);
      setConsultantSchedule(null);
    }
  }, [formData.date]);

  // Lấy thông tin ca làm việc của consultant khi chọn consultant
  useEffect(() => {
    const fetchScheduleInfo = async () => {
      if (formData.consultantId && formData.date) {
        try {
          const scheduleInfo = await fetchConsultantSchedule(formData.consultantId, formData.date);
          setConsultantSchedule(scheduleInfo);
          // Reset time selection khi đổi consultant
          setFormData(prev => ({ ...prev, time: '' }));
        } catch (error) {
          console.error('Error fetching consultant schedule:', error);
          setConsultantSchedule(null);
        }
      } else {
        setConsultantSchedule(null);
      }
    };
    
    fetchScheduleInfo();
  }, [formData.consultantId, formData.date]);

  // Lấy khung giờ rảnh từ backend khi chọn ngày và tư vấn viên
  useEffect(() => {
    fetchAvailableTimes(formData.consultantId, formData.date, setAvailableTimes, setLoadingTimes);
  }, [formData.consultantId, formData.date]);

  const handleChange = (e) => {
    handleFormChange(e, formData, setFormData, setFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBookingStep('processing');

    const userId = getUserIdFromStorage();
    
    // Gộp ngày và giờ thành appointmentDate và startTime
    let appointmentDate = '';
    let startTime = '';
    if (formData.date && formData.time) {
      appointmentDate = formData.date;
      startTime = formData.time.split(' - ')[0];
    }

    // Validate dữ liệu
    const validationError = validateBookingData(userId, formData, availableTimes, appointmentDate, startTime);
    if (validationError) {
      alert(validationError);
      setBookingStep('form');
      return;
    }

    // Chuẩn bị payload
    const payload = createBookingPayload(formData, consultationPrice);

    try {
      // Step 1: Create a booking
      const bookingData = await createBooking(payload);
      setBookingDetails(bookingData);
      
      // Step 2: Create payment URL
      try {
        const paymentUrl = await createPaymentUrl(bookingData, consultationPrice);
        setPaymentUrl(paymentUrl);
        setBookingStep('payment');
      } catch (paymentError) {
        console.error("Lỗi khi tạo URL thanh toán:", paymentError);
        setError(`Lỗi khi tạo liên kết thanh toán: ${paymentError.message || "Vui lòng thử lại sau."}`);
        setBookingStep('error');
      }
    } catch (error) {
      if (error.status === 409) { // Conflict - trùng lịch
        setBookingStep('form'); // Quay lại form, KHÔNG hiển thị lỗi
        return;
      } else {
        setError("Đặt lịch thất bại. Lý do: " + error.message);
      }
      console.error("Lỗi booking:", error);
      setBookingStep('error');
    }
  };

  // Check if the URL contains success or cancel params from PayOS redirect
  useEffect(() => {
    const params = parseUrlParams();

    // Ưu tiên xử lý trạng thái CANCELLED/EXPIRED/cancel=true từ query param nếu có
    if (shouldShowCancelledStatus(params)) {
      setBookingStep('error');
      setError('Bạn đã hủy thanh toán hoặc thanh toán đã hết hạn. Vui lòng thử lại hoặc đặt lại lịch.');
      return;
    }

    // Nếu có orderCode hoặc bookingId và status=success/PROCESSING thì kiểm tra trạng thái thanh toán
    const checkStatus = async (id, isOrderCode = false) => {
      setBookingStep('processing');
      try {
        const data = await checkPaymentStatus(id, isOrderCode);
        setBookingDetails(data);
        setPaymentStatus(data.payment?.status);
        if (data.payment?.status === 'PAID') {
          setBookingStep('success');
          setError('');
        } else if (data.payment?.status === 'CANCELLED' || data.payment?.status === 'EXPIRED') {
          setBookingStep('error');
          setError(data.payment?.statusMessage || 'Thanh toán đã bị hủy hoặc hết hạn. Vui lòng thử lại hoặc đặt lại lịch.');
        } else if (data.payment?.status === 'PROCESSING') {
          setBookingStep('processing');
          setError('');
        } else {
          setBookingStep('payment');
          setError(data.payment?.statusMessage || 'Thanh toán chưa hoàn tất. Vui lòng thử lại.');
        }
      } catch (error) {
        setBookingStep('processing');
        setError('Đang xác nhận thanh toán, vui lòng chờ...');
      }
    };

    if (shouldCheckPaymentStatus(params)) {
      if (params.orderCode) checkStatus(params.orderCode, true);
      else checkStatus(params.bookingId, false);
      return;
    }
  }, []);

  // Function to check payment status after redirect
  const checkPaymentStatusWrapper = async (bookingId) => {
    try {
      setBookingStep('processing');
      const data = await checkPaymentStatus(bookingId);
      setBookingDetails(data);
      setPaymentStatus(data.payment?.status);
      // Sử dụng statusMessage từ backend nếu có
      if (data.payment?.status === 'PAID') {
        setBookingStep('success');
        setError('');
      } else if (data.payment?.status === 'CANCELLED' || data.payment?.status === 'EXPIRED') {
        setBookingStep('error');
        setError(data.payment?.statusMessage || 'Thanh toán đã bị hủy hoặc hết hạn. Vui lòng thử lại hoặc đặt lại lịch.');
      } else if (data.payment?.status === 'PROCESSING') {
        setBookingStep('processing');
        setError('');
      } else {
        setBookingStep('payment');
        setError(data.payment?.statusMessage || 'Thanh toán chưa hoàn tất. Vui lòng thử lại.');
      }
    } catch (error) {
      setBookingStep('error');
      setError('Không thể kiểm tra trạng thái thanh toán. Vui lòng liên hệ hỗ trợ.');
    }
  };

  // Function to retry payment if it failed
  const retryPaymentWrapper = async () => {
    setBookingStep('processing');
    try {
      const paymentUrl = await retryPayment(bookingDetails, consultationPrice);
      setPaymentUrl(paymentUrl);
      setBookingStep('payment');
      
      // Redirect to PayOS payment page
      window.location.href = paymentUrl;
    } catch (error) {
      setError(error.message || "Có lỗi xảy ra khi tạo liên kết thanh toán. Vui lòng thử lại sau.");
      setBookingStep('error');
    }
  };

  // Polling payment status when in 'payment' step
  useEffect(() => {
    let intervalId;
    if (bookingStep === 'payment' && bookingDetails?.bookingId) {
      intervalId = setInterval(async () => {
        try {
          const data = await checkPaymentStatus(bookingDetails.bookingId);
          setPaymentStatus(data.payment?.status);
          setBookingDetails(data);
          // Chỉ clearInterval khi đã PAID, CANCELLED hoặc EXPIRED
          if (data.payment?.status === 'PAID') {
            setBookingStep('success');
            setError('');
            clearInterval(intervalId);
          } else if (data.payment?.status === 'CANCELLED' || data.payment?.status === 'EXPIRED') {
            setBookingStep('error');
            setError(data.payment?.statusMessage || 'Thanh toán đã bị hủy hoặc hết hạn. Vui lòng thử lại hoặc đặt lại lịch.');
            clearInterval(intervalId);
          } else if (data.payment?.status === 'PROCESSING') {
            setBookingStep('processing');
            setError('');
            // KHÔNG clearInterval, tiếp tục polling
          } else {
            setError(data.payment?.statusMessage || 'Thanh toán chưa hoàn tất. Vui lòng thử lại.');
          }
        } catch (err) {
          // Không làm gì, thử lại ở lần sau
        }
      }, 3000);
    }
    return () => intervalId && clearInterval(intervalId);
  }, [bookingStep, bookingDetails]);

  // Render different content based on the booking step
  const renderContent = () => {
    switch(bookingStep) {
      case 'processing':
      case 'payment':
      case 'success':
      case 'error':
        return null; // Đã render trực tiếp ở dưới, không render lại ở đây
      case 'form':
      default:
        return null;
    }
  };

  // Hủy thanh toán PayOS
  const cancelPaymentWrapper = async () => {
    if (!window.confirm("Bạn chắc chắn muốn hủy thanh toán này?")) return;
    setBookingStep('processing');
    try {
      await cancelPayment(bookingDetails);
      setBookingStep('error');
      setError('Bạn đã hủy thanh toán. Đơn đặt lịch sẽ không được xác nhận.');
    } catch (error) {
      setError(error.message || 'Có lỗi khi hủy thanh toán.');
      setBookingStep('payment');
    }
  };

  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100vw" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        position: "relative",
        width: "100%",
        height: "100px",
        display: "flex"
      }}>
        <div style={{ 
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "18px 20px",
          width: "100%"
        }}>
          <Link to="/">
            <img
              src="/Logo.png"
              alt="Logo"
              style={{ height: 70, width: 70, objectFit: "contain" }}
            />
          </Link>
          <UserAvatar userName="Nguyễn Thị A" />
        </div>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%"
        }}>
          <h1
            style={{
              color: "#fff",
              margin: 0,
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: 1
            }}
          >
            Đặt lịch tư vấn
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: "40px",
        width: "100%",
        flex: 1,
        backgroundColor: "#fff",
        boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
        marginTop: "-20px",
        boxSizing: "border-box"
      }}>
        {/* Back link only shown in form mode */}
        {bookingStep === 'form' && (
          <div style={{ marginBottom: "20px" }}>
            <Link 
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
        )}

        {/* Render content by step */}
        {bookingStep === 'form' && (
          <div>
            <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "30px", width: "100%" }}>
              Đặt lịch tư vấn y tế
            </h2>
            
            <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "1600px", margin: "0 auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    placeholder="Nguyễn Văn A"
                    readOnly
                  />
                </div>
                
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    placeholder="0912345678"
                    readOnly
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Ngày tư vấn *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Chọn tư vấn viên *</label>
                  <select
                    name="consultantId"
                    value={formData.consultantId}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  >
                    {!formData.date ? (
                      <option value="">-- Vui lòng chọn ngày trước --</option>
                    ) : consultants.length === 0 ? (
                      <option value="">-- Không có tư vấn viên nào có lịch làm việc trong ngày này --</option>
                    ) : (
                      <>
                        <option value="">-- Chọn tư vấn viên --</option>
                        {consultants.map((consultant, idx) => (
                          <option
                            key={consultant.userID ?? idx}
                            value={consultant.userID ?? ''}
                          >
                            {consultant.fullName || consultant.name} {consultant.specification ? `- ${consultant.specification}` : ""}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {/* Đưa optionbox chọn thời gian vào cùng grid */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Thời gian *</label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    disabled={loadingTimes || !formData.consultantId || !formData.date}
                  >
                    {loadingTimes ? (
                      <option value="">⏳ Đang tải khung giờ...</option>
                    ) : !formData.consultantId || !formData.date ? (
                      <option value="">-- Vui lòng chọn tư vấn viên và ngày trước --</option>
                    ) : availableTimes.length === 0 ? (
                      <option value="">-- Không có khung giờ nào còn trống --</option>
                    ) : (
                      <>
                        <option value="">-- Chọn thời gian --</option>
                        {availableTimes.map(time => (
                          <option key={time} value={time} disabled={isTimeSlotPassed(time, formData.date)}>
                            {time}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Hiển thị thông tin ca làm việc */}
              {consultantSchedule && (
                <div style={{ 
                  marginTop: "20px", 
                  padding: "15px", 
                  backgroundColor: "#f0f9ff", 
                  borderRadius: "8px", 
                  border: "1px solid #0891b2" 
                }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#0891b2" }}>
                    Thông tin ca làm việc
                  </h4>
                  <p style={{ margin: "5px 0", color: "#0891b2" }}>
                    <strong>Ca làm việc:</strong> {
                      consultantSchedule.shift === 'MORNING' 
                        ? 'Ca sáng (8:00 - 12:00)' 
                        : 'Ca chiều (13:30 - 17:30)'
                    }
                  </p>
                  <p style={{ margin: "5px 0", color: "#0891b2", fontSize: "14px" }}>
                    Khung giờ có thể đặt: {
                      consultantSchedule.shift === 'MORNING' 
                        ? '8:00, 9:00, 10:00, 11:00' 
                        : '13:30, 14:30, 15:30, 16:30'
                    }
                  </p>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", marginTop: "25px", width: "100%" }}>
                <label style={labelStyle}>Triệu chứng/Mô tả vấn đề *</label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, height: "120px" }}
                  placeholder="Mô tả chi tiết triệu chứng hoặc vấn đề bạn muốn tư vấn"
                ></textarea>
              </div>

              {error && (
                <div style={{ color: "red", marginBottom: "16px", textAlign: "center" }}>
                  {error}
                </div>
              )}

              <div style={{ marginTop: "35px", textAlign: "center" }}>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "14px 35px",
                    borderRadius: "30px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                >
                  Xác nhận đặt lịch
                </button>
              </div>
            </form>
          </div>
        )}
        {bookingStep === 'processing' && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "24px", marginBottom: "20px", color: "#333" }}>⏳ Đang xử lý thanh toán...</div>
            <div style={{ color: "#666", marginBottom: "20px" }}>
              Yêu cầu của bạn đang được xử lý. Vui lòng kiểm tra lại lịch hẹn sau 5-10 phút.
              Nếu giao dịch chưa được xác nhận, bạn có thể thử lại hoặc liên hệ hỗ trợ.
            </div>
            <Link
              to="/"
              style={{
                display: "inline-block",
                background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                color: "#fff",
                textDecoration: "none",
                padding: "12px 25px",
                borderRadius: "25px",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease"
              }}
            >
              ⏪ Quay lại trang chủ
            </Link>
          </div>
        )}
        {bookingStep === 'payment' && paymentUrl && (
          <iframe
            src={paymentUrl}
            title="PayOS Payment"
            style={{
              position: 'fixed',
              top: 100, // giảm top từ 160 xuống 110 để iframe lên cao hơn
              left: 0,
              width: '100vw',
              height: 'calc(100vh - 110px)', // cập nhật chiều cao tương ứng
              border: 'none',
              borderRadius: 0,
              margin: 0,
              padding: 0,
              zIndex: 1000,
              background: '#fff',
              display: 'block',
              overflow: 'hidden',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
            }}
            allow="payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            scrolling="no"
          />
        )}
        {bookingStep === 'success' && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ background: "rgba(232, 245, 233, 0.9)", borderRadius: "16px", padding: "30px", border: "2px solid rgba(67, 160, 71, 0.2)", boxShadow: "0 8px 16px rgba(67, 160, 71, 0.1)" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px", color: "#43a047" }}>✅</div>
              <h2 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "15px", color: "#43a047" }}>Đặt lịch thành công!</h2>
              
              {/* Hiển thị thông tin đã đặt */}
              <div style={{ 
                backgroundColor: "#f8f9fa", 
                padding: "20px", 
                borderRadius: "10px", 
                marginBottom: "30px",
                textAlign: "left",
                maxWidth: "500px",
                margin: "20px auto"
              }}>
                <h3 style={{ color: "#2c3e50", marginBottom: "15px", textAlign: "center" }}>Thông tin đặt lịch</h3>
                <p><strong>Họ tên:</strong> {formData.fullName}</p>
                <p><strong>Điện thoại:</strong> {formData.phone}</p>
                <p><strong>Tư vấn viên:</strong> {consultants.find(c => c.userID == formData.consultantId)?.fullName || consultants.find(c => c.userID == formData.consultantId)?.name || 'N/A'}</p>
                <p><strong>Chuyên khoa:</strong> {consultants.find(c => c.userID == formData.consultantId)?.specification || 'Tư vấn sức khỏe'}</p>
                <p><strong>Ngày giờ hẹn:</strong> {formData.date} {formData.time}</p>
                <p><strong>Trạng thái:</strong> <span style={{color: "#43a047"}}>Đã thanh toán</span></p>
                {formData.symptoms && <p><strong>Triệu chứng:</strong> {formData.symptoms}</p>}
                
                {/* Nút xem lịch đặt */}
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <Link
                    to="/my-appointments"
                    style={{
                      display: "inline-block",
                      background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                      color: "#fff",
                      textDecoration: "none",
                      padding: "12px 25px",
                      borderRadius: "25px",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.3s ease"
                    }}
                  >
                    📋 Xem lịch hẹn của tôi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        {bookingStep === 'error' && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "24px", marginBottom: "20px", color: "red" }}>❌</div>
            <div style={{ color: "#666", marginBottom: "30px" }}>{error || "Bạn đã hủy thanh toán hoặc giao dịch không thành công. Đơn đặt lịch sẽ không được xác nhận. Nếu cần hỗ trợ, vui lòng liên hệ tổng đài hoặc đặt lại lịch."}</div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Link
                to="/"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "12px 25px",
                  borderRadius: "25px",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease"
                }}
              >
                ⏪ Quay lại trang chủ
              </Link>
            </div>
          </div>
        )}

        {/* Thông tin thêm - only shown in form step */}
        {bookingStep === 'form' && (
          <div style={{ 
            marginTop: "40px", 
            padding: "20px", 
            backgroundColor: "#e0f2fe", 
            borderRadius: "10px",
            border: "1px solid #0891b2",
            width: "100%"
          }}>
          <h3 style={{ color: "#0891b2", marginBottom: "10px" }}>Lưu ý quan trọng:</h3>
          <ul style={{ color: "#0891b2", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}>Khung giờ làm việc: 08:00-12:00 và 13:30-17:30</li>
            <li style={{ marginBottom: "8px" }}>Mỗi buổi tư vấn kéo dài 1 giờ</li>
            <li style={{ marginBottom: "8px" }}>Vui lòng đến trước giờ hẹn 15 phút để hoàn thành thủ tục</li>
            <li style={{ marginBottom: "8px" }}>Mang theo CMND/CCCD và các giấy tờ y tế liên quan</li>
            <li style={{ marginBottom: "8px" }}>Chuẩn bị danh sách các triệu chứng và câu hỏi muốn tư vấn</li>
          </ul>
        </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: "40px",
        padding: "20px",
        backgroundColor: "#e0f2fe",
        textAlign: "center",
        color: "#0891b2",
        width: "100%"
      }}>
        <p>© 2025 Hệ thống Chăm sóc Sức khỏe Giới Tính.</p>
        <p style={{ marginTop: "10px" }}>Hotline: 1900-xxxx | Email: support@healthcare.com</p>
      </footer>
    </div>
  );
};

export default ConsultationBooking;