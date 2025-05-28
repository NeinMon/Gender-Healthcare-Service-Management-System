import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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

  const testTypes = [
    { id: 1, name: "Xét nghiệm máu cơ bản", price: "350.000 VNĐ" },
    { id: 2, name: "Siêu âm tử cung", price: "400.000 VNĐ" },
    { id: 3, name: "Kiểm tra HPV", price: "850.000 VNĐ" },
    { id: 4, name: "Xét nghiệm nội tiết tố", price: "750.000 VNĐ" },
    { id: 5, name: "Sàng lọc ung thư cổ tử cung", price: "650.000 VNĐ" },
    { id: 6, name: "Kiểm tra sức khỏe sinh sản tổng quát", price: "1.200.000 VNĐ" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data submitted:', formData);
    setIsSubmitted(true);
  };  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100vw" }}>{/* Header */}      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 0,
        position: "relative",
        width: "100%"
      }}><div style={{
          position: "absolute",
          top: 20,
          right: 25,
          display: "flex",
          gap: 10,
          zIndex: 2
        }}>          <Link 
            to="/" 
            style={{
              background: "#0891b2",
              color: "#fff",
              textDecoration: "none",
              padding: "8px 20px",
              borderRadius: 6,
              border: "2px solid #fff",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Đăng xuất
          </Link>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: 18 }}>
          <img
            src="/Logo.png"
            alt="Logo"
            style={{ height: 100, width: 100, objectFit: "contain" }}
          />
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
          Đặt lịch Xét nghiệm
        </h1>
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
            to="/services" 
            style={{
              display: "flex",
              alignItems: "center",
              color: "#0891b2",
              textDecoration: "none",
              fontWeight: 500
            }}
          >
            ← Quay lại trang dịch vụ
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
                      <option key={test.id} value={test.id}>
                        {test.name} - {test.price}
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
                <label style={labelStyle}>Ghi chú</label>                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  style={{ ...inputStyle, height: "120px" }}
                  placeholder="Nhập ghi chú hoặc thông tin bổ sung (nếu có)"
                ></textarea>
              </div>              <div style={{ marginTop: "35px", textAlign: "center" }}>                <button
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
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>            <div style={{ 
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
            <div style={{ marginTop: "30px" }}>              <Link
                to="/services"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "12px 30px",
                  borderRadius: "30px",
                  fontWeight: "600",
                }}
              >
                Quay lại trang chủ
              </Link>
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
