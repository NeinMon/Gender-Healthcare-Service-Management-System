import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

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
    const fetchTestTypes = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/services');
        if (res.ok) {
          const data = await res.json();
          // Lọc bỏ serviceId = 1 và chỉ lấy các service có thể xét nghiệm
          const filteredTests = data.filter(service => service.serviceId !== 1).map(service => {
            let formattedPrice = service.price || '';
            
            // Đảm bảo giá tiền luôn có "VNĐ" ở cuối
            if (formattedPrice) {
              // Convert to string nếu là number
              formattedPrice = formattedPrice.toString();
              
              // Loại bỏ tất cả các biến thể của VNĐ/VND có thể có
              formattedPrice = formattedPrice.replace(/\s*(VN[ĐD]|vn[đd]|Vn[đd]|vN[đd])\s*/gi, '').trim();
              
              // Thêm VNĐ vào cuối
              formattedPrice = `${formattedPrice} VNĐ`;
            } else {
              formattedPrice = 'Liên hệ VNĐ';
            }
            
            return {
              ...service,
              price: formattedPrice
            };
          });
          setTestTypes(filteredTests);
        } else {
          console.error('Không thể lấy danh sách dịch vụ');
          // Fallback data nếu API lỗi
          setTestTypes([
            { serviceId: 2, serviceName: "Siêu âm tử cung", price: "400.000 VNĐ" },
            { serviceId: 3, serviceName: "Kiểm tra HPV", price: "850.000 VNĐ" },
            { serviceId: 4, serviceName: "Xét nghiệm nội tiết tố", price: "750.000 VNĐ" },
            { serviceId: 5, serviceName: "Sàng lọc ung thư cổ tử cung", price: "650.000 VNĐ" }
          ]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách dịch vụ:', error);
        // Fallback data nếu có lỗi network
        setTestTypes([
          { serviceId: 2, serviceName: "Siêu âm tử cung", price: "400.000 VNĐ" },
          { serviceId: 3, serviceName: "Kiểm tra HPV", price: "850.000 VNĐ" },
          { serviceId: 4, serviceName: "Xét nghiệm nội tiết tố", price: "750.000 VNĐ" },
          { serviceId: 5, serviceName: "Sàng lọc ung thư cổ tử cung", price: "650.000 VNĐ" }
        ]);
      }
    };

    fetchTestTypes();

    // Lấy thông tin user từ localStorage dựa vào loggedInUser
    let userId = 1; // Giá trị mặc định
    const userJson = localStorage.getItem('loggedInUser');
    
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user && user.userID) {
          userId = user.userID;
        }
      } catch (error) {
        console.error("Lỗi khi đọc thông tin người dùng:", error);
      }
    }
    
    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            fullName: data.fullName || data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            // Tính tuổi từ ngày sinh nếu có
            age: data.dob ? calculateAge(data.dob) : '',
            gender: mapGender(data.gender) || ''
          }));
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };
    fetchUserInfo();
  }, []);

  // Hàm tính tuổi từ ngày sinh
  const calculateAge = (dobString) => {
    try {
      const dob = new Date(dobString);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age.toString();
    } catch (error) {
      return '';
    }
  };

  // Hàm map giới tính từ backend sang frontend
  const mapGender = (gender) => {
    if (!gender) return '';
    const genderLower = gender.toLowerCase();
    if (genderLower === 'nữ' || genderLower === 'female') return 'female';
    if (genderLower === 'nam' || genderLower === 'male') return 'male';
    return 'other';
  };

  // Hàm helper để lấy thông tin service từ serviceId
  const getServiceById = (serviceId) => {
    return testTypes.find(service => service.serviceId === parseInt(serviceId));
  };

  // Kiểm tra xem thời gian đã qua chưa để disable option
  const isTimeSlotPassed = (timeSlot) => {
    if (!formData.preferredDate) return false;
    const today = new Date();
    const selectedDate = new Date(formData.preferredDate);
    if (selectedDate.toDateString() !== today.toDateString()) return false;
    // Lấy giờ bắt đầu và kết thúc từ slot ("08:00 - 09:00")
    const [slotStartTime, slotEndTime] = timeSlot.split(' - ');
    const [startHour, startMinute] = slotStartTime.split(':').map(Number);
    const [endHour, endMinute] = slotEndTime.split(':').map(Number);
    // Tạo đối tượng Date cho endTime của slot
    const slotEnd = new Date(selectedDate);
    slotEnd.setHours(endHour, endMinute, 0, 0);
    // Nếu thời gian hiện tại đã sau endTime của slot thì disable
    return today > slotEnd;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Reset thời gian đã chọn nếu thay đổi ngày và thời gian đó đã qua
    if (name === 'preferredDate' && formData.preferredTime && isTimeSlotPassed(`${formData.preferredTime}:00 - ${(parseInt(formData.preferredTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`)) {
      setFormData(prev => ({
        ...prev,
        preferredTime: ''
      }));
    }
  };

  // Hàm lấy giá tiền từ serviceId
  const fetchServicePrice = async (serviceId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/services/${serviceId}`);
      if (!res.ok) throw new Error('Không lấy được giá dịch vụ');
      const data = await res.json();
      setServicePrice(data.price);
      setServiceName(data.serviceName || '');
      return data.price;
    } catch (err) {
      alert('Không lấy được giá dịch vụ');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.testType || !parseInt(formData.testType)) {
      alert('Vui lòng chọn loại xét nghiệm!');
      return;
    }
    
    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập họ tên!');
      return;
    }
    
    if (!formData.phone.trim()) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }
    
    if (!formData.preferredDate) {
      alert('Vui lòng chọn ngày hẹn!');
      return;
    }
    
    if (!formData.preferredTime) {
      alert('Vui lòng chọn thời gian!');
      return;
    }
    
    // Ghi chú không bắt buộc, nhưng nếu có thì phải <= 500 ký tự
    if (formData.notes && formData.notes.length > 500) {
      alert('Ghi chú quá dài. Vui lòng rút gọn (tối đa 500 ký tự)!');
      return;
    }
    
    // Validate date and time format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    
    if (!dateRegex.test(formData.preferredDate)) {
      alert('Định dạng ngày không hợp lệ! (YYYY-MM-DD)');
      return;
    }
    
    if (!timeRegex.test(formData.preferredTime)) {
      alert('Định dạng giờ không hợp lệ! (HH:mm)');
      return;
    }
    
    // Validate future date
    const selectedDate = new Date(formData.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert('Không thể đặt lịch cho ngày đã qua!');
      return;
    }
    
    // Kiểm tra thời gian đã qua chưa
    const timeSlot = `${formData.preferredTime}:00 - ${(parseInt(formData.preferredTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;
    if (isTimeSlotPassed(timeSlot)) {
      alert("Khung giờ đã chọn đã qua! Vui lòng chọn khung giờ khác.");
      return;
    }
    
    setIsSubmitting(true); // Bắt đầu loading
    setBookingStep('processing');
    
    // Chuẩn bị dữ liệu để gửi về backend
    const serviceId = parseInt(formData.testType);
    const selectedService = getServiceById(serviceId);
    
    if (!serviceId || serviceId <= 0) {
      alert('Vui lòng chọn loại dịch vụ hợp lệ!');
      setIsSubmitting(false);
      setBookingStep('form');
      return;
    }
    
    // Lấy userId từ localStorage
    let userId = 1; // Giá trị mặc định
    const userJson = localStorage.getItem('loggedInUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user && user.userID) {
          userId = user.userID;
        }
      } catch (error) {
        console.error("Lỗi khi đọc thông tin người dùng:", error);
      }
    }
    
    const bookingData = {
      userId: userId, // Backend expect userId, not userID
      serviceId: serviceId, // Backend expect serviceId, not serviceID
      content: formData.notes && formData.notes.trim() 
        ? formData.notes.trim() 
        : `Đặt lịch xét nghiệm: ${selectedService?.serviceName || 'Dịch vụ xét nghiệm'}`, // Sử dụng ghi chú nếu có, không thì dùng tên dịch vụ
      appointmentDate: formData.preferredDate, // Chỉ gửi ngày (YYYY-MM-DD)
      startTime: formData.preferredTime, // Giờ riêng biệt (HH:mm)
      // Không set consultantId cho test booking, chỉ có consultation mới cần
      // Không set status, backend sẽ tự động set dựa vào thời gian
    };
    
    console.log('Booking data to be sent to backend:', bookingData);
    
    try {
      // Gửi dữ liệu về backend - sử dụng endpoint with-service để bắt buộc serviceId
      const response = await fetch('http://localhost:8080/api/bookings/with-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });
      if (response.ok) {
        const bookingDataRes = await response.json();
        setCurrentBooking(bookingDataRes);
        // Lấy giá tiền từ serviceId (đảm bảo là số, không phải string có VNĐ)
        let price = null;
        let serviceData = null;
        try {
          const serviceRes = await fetch(`http://localhost:8080/api/services/${serviceId}`);
          if (serviceRes.ok) {
            serviceData = await serviceRes.json();
            price = Number(serviceData.price);
            setServicePrice(price);
            setServiceName(serviceData.serviceName || '');
          }
        } catch (err) {
          console.error('Lỗi lấy service:', err);
        }
        if (!price || isNaN(price)) {
          alert('Không lấy được giá dịch vụ hợp lệ!');
          setIsSubmitting(false);
          setBookingStep('form');
          return;
        }
        // Tạo payment PayOS
        const baseUrl = window.location.origin;
        const returnUrl = `${baseUrl}/test-booking?bookingId=${bookingDataRes.bookingId}&status=success`;
        const cancelUrl = `${baseUrl}/test-booking?bookingId=${bookingDataRes.bookingId}&status=cancel`;
        const paymentPayload = {
          bookingId: bookingDataRes.bookingId,
          amount: price,
          description: `Thanh toán dịch vụ xét nghiệm #${bookingDataRes.bookingId} - ${serviceData?.serviceName || ''}`,
          returnUrl,
          cancelUrl
        };
        console.log('PayOS payload:', paymentPayload);
        const paymentRes = await fetch('http://localhost:8080/api/payment/payos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentPayload)
        });
        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          setPaymentUrl(paymentData.payUrl);
          setBookingStep('payment');
        } else {
          const errorText = await paymentRes.text();
          alert('Không thể tạo liên kết thanh toán: ' + errorText);
          setBookingStep('form');
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to submit booking:', response.status, errorText);
        
        // Handle different error types based on status code
        if (response.status === 400) {
          // Bad Request - validation errors
          try {
            const errorObj = JSON.parse(errorText);
            const errorMessage = errorObj.message || errorText || 'Dữ liệu không hợp lệ';
            alert(`Lỗi validation: ${errorMessage}`);
          } catch (e) {
            alert(`Dữ liệu gửi lên không hợp lệ: ${errorText}`);
          }
        } else if (response.status === 404) {
          alert('Không tìm thấy dịch vụ hoặc API endpoint. Vui lòng liên hệ quản trị viên!');
        } else if (response.status === 500) {
          alert('Lỗi server nội bộ. Vui lòng thử lại sau hoặc liên hệ quản trị viên!');
        } else {
          alert(`Có lỗi xảy ra khi đặt lịch (${response.status}). Vui lòng thử lại!`);
        }
        setBookingStep('form');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Có lỗi xảy ra khi đặt lịch. Vui lòng kiểm tra kết nối mạng!');
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
        try {
          const res = await fetch(`http://localhost:8080/api/payment/status/${currentBooking.bookingId}`);
          if (res.ok) {
            const data = await res.json();
            setPaymentStatus(data.paymentStatus || data.payment?.status);
            if ((data.paymentStatus || data.payment?.status) === 'PAID') {
              setBookingStep('success');
              clearInterval(intervalId);
            } else if ((data.paymentStatus || data.payment?.status) === 'CANCELLED') {
              setBookingStep('error');
              clearInterval(intervalId);
            }
          } else {
            // Nếu backend lỗi, chuyển sang trạng thái processing và báo đang xác nhận
            setBookingStep('processing');
            setPaymentStatus('');
          }
        } catch {
          // Nếu fetch lỗi, cũng chuyển sang trạng thái processing
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
    const checkStatus = async (id, isOrderCode = false) => {
      setBookingStep('processing');
      try {
        let res;
        if (isOrderCode) {
          res = await fetch(`http://localhost:8080/api/payment/status/order/${id}`);
        } else {
          res = await fetch(`http://localhost:8080/api/payment/status/${id}`);
        }
        if (res.ok) {
          const data = await res.json();
          setPaymentStatus(data.paymentStatus);
          if (data.paymentStatus === 'PAID') setBookingStep('success');
          else setBookingStep('error');
        } else {
          // Nếu backend lỗi, chuyển sang trạng thái processing (không hiện lỗi đỏ)
          setBookingStep('processing');
        }
      } catch {
        setBookingStep('processing');
      }
    };
    if ((orderCodeParam || bookingIdParam) && statusParam === 'success') {
      if (orderCodeParam) checkStatus(orderCodeParam, true);
      else checkStatus(bookingIdParam, false);
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
                    <option value="08:00" disabled={isTimeSlotPassed("08:00 - 09:00")}>08:00 - 09:00</option>
                    <option value="09:00" disabled={isTimeSlotPassed("09:00 - 10:00")}>09:00 - 10:00</option>
                    <option value="10:00" disabled={isTimeSlotPassed("10:00 - 11:00")}>10:00 - 11:00</option>
                    <option value="13:00" disabled={isTimeSlotPassed("13:00 - 14:00")}>13:00 - 14:00</option>
                    <option value="14:00" disabled={isTimeSlotPassed("14:00 - 15:00")}>14:00 - 15:00</option>
                    <option value="15:00" disabled={isTimeSlotPassed("15:00 - 16:00")}>15:00 - 16:00</option>
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
