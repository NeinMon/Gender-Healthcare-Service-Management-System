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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
    
    if (!formData.notes.trim()) {
      alert('Vui lòng nhập ghi chú hoặc mô tả lý do khám!');
      return;
    }
    
    if (formData.notes.length > 500) {
      alert('Ghi chú quá dài. Vui lòng rút gọn (tối đa 500 ký tự)!');
      return;
    }
    
    setIsSubmitting(true); // Bắt đầu loading
    
    // Chuẩn bị dữ liệu để gửi về backend
    const serviceId = parseInt(formData.testType);
    const selectedService = getServiceById(serviceId);
    
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
      content: formData.notes || `Đặt lịch xét nghiệm: ${selectedService?.serviceName || ''}`, // Sử dụng ghi chú làm content
      appointmentDate: `${formData.preferredDate} ${formData.preferredTime}:00`, // Combine date and time
      status: "Đang chờ duyệt" // Default status
    };
    
    console.log('Booking data to be sent to backend:', bookingData);
    
    try {
      // Gửi dữ liệu về backend - sử dụng endpoint mặc định với consultantId
      const response = await fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Booking created successfully:', result);
        setIsSubmitted(true);
      } else {
        const errorText = await response.text();
        console.error('Failed to submit booking:', errorText);
        
        // Try to parse error message
        try {
          const errorObj = JSON.parse(errorText);
          const errorMessage = errorObj.message || 'Có lỗi xảy ra khi đặt lịch';
          alert(`Lỗi: ${errorMessage}`);
        } catch (e) {
          alert('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!');
        }
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Có lỗi xảy ra khi đặt lịch. Vui lòng kiểm tra kết nối mạng!');
    } finally {
      setIsSubmitting(false); // Kết thúc loading
    }
  };  return (
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

        {!isSubmitted ? (
          <>            <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "30px", width: "100%" }}>
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
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Tuổi *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    placeholder="25"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Giới tính *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    style={inputStyle}
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
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    placeholder="0912345678"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="example@gmail.com"
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
                    <option value="08:00">08:00 - 09:00</option>
                    <option value="09:00">09:00 - 10:00</option>
                    <option value="10:00">10:00 - 11:00</option>
                    <option value="13:00">13:00 - 14:00</option>
                    <option value="14:00">14:00 - 15:00</option>
                    <option value="15:00">15:00 - 16:00</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", marginTop: "25px", width: "100%" }}>
                <label style={labelStyle}>Ghi chú / Mô tả lý do khám *</label>                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, height: "120px" }}
                  placeholder="Nhập lý do khám, triệu chứng hoặc mô tả tình trạng sức khỏe (bắt buộc, tối đa 500 ký tự)"
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
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ 
              fontSize: "64px", 
              marginBottom: "20px",
              color: "#0891b2"
            }}>
              ✅
            </div>
            <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>Đặt lịch xét nghiệm thành công!</h2>
            <p style={{ fontSize: "16px", color: "#7f8c8d", marginBottom: "30px" }}>
              Cảm ơn bạn đã đặt lịch. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận lịch hẹn.
            </p>
            
            {/* Hiển thị thông tin đã đặt */}
            <div style={{ 
              backgroundColor: "#f8f9fa", 
              padding: "20px", 
              borderRadius: "10px", 
              marginTop: "20px",
              textAlign: "left",
              maxWidth: "500px",
              margin: "20px auto 0"
            }}>
              <h3 style={{ color: "#2c3e50", marginBottom: "15px", textAlign: "center" }}>Thông tin đặt lịch</h3>
              <p><strong>Họ tên:</strong> {formData.fullName}</p>
              <p><strong>Điện thoại:</strong> {formData.phone}</p>
              <p><strong>Email:</strong> {formData.email || 'Không có'}</p>
              <p><strong>Loại xét nghiệm:</strong> {getServiceById(formData.testType)?.serviceName || 'N/A'}</p>
              <p><strong>Giá tiền:</strong> {getServiceById(formData.testType)?.price || 'N/A'}</p>
              <p><strong>Ngày giờ hẹn:</strong> {formData.preferredDate} {formData.preferredTime}:00</p>
              <p><strong>Trạng thái:</strong> <span style={{color: "#f39c12"}}>Đang chờ duyệt</span></p>
              {formData.notes && <p><strong>Ghi chú:</strong> {formData.notes}</p>}
            </div>
          </div>
        )}        {/* Thông tin thêm */}        <div style={{ 
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
