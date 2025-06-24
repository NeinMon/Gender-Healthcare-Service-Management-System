import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const ConsultationBooking = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    date: '',
    time: '',
    consultantId: '',
    symptoms: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const consultants = [
    { id: 1, name: "BS. Nguyễn Thị Minh", specialty: "Sức khỏe phụ nữ" },
    { id: 2, name: "BS. Trần Văn Hải", specialty: "Sản phụ khoa" },
    { id: 3, name: "BS. Lê Thị Hương", specialty: "Nội tiết" },
    { id: 4, name: "BS. Phạm Minh Tuấn", specialty: "Dinh dưỡng" }
  ];

  const availableTimes = [
    "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
    "13:30 - 14:30", "14:30 - 15:30", "15:30 - 16:30", "16:30 - 17:30"
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
  };

  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100vw" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 0,
        position: "relative",
        width: "100%"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          paddingTop: 18,
          paddingLeft: 20,
          paddingRight: 20
        }}>
          <Link to="/">
            <img
              src="/Logo.png"
              alt="Logo"
              style={{ height: 100, width: 100, objectFit: "contain" }}
            />
          </Link>
          <UserAvatar userName="Nguyễn Thị A" />
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
          Đặt lịch tư vấn
        </h1>
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
        <div style={{ marginBottom: "20px" }}>
          <Link 
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
          <>
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
                  <label style={labelStyle}>Thời gian *</label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  >
                    <option value="">-- Chọn thời gian --</option>
                    {availableTimes.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
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
                    <option value="">-- Chọn tư vấn viên --</option>
                    {consultants.map(consultant => (
                      <option key={consultant.id} value={consultant.id}>
                        {consultant.name} - {consultant.specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", marginTop: "25px", width: "100%" }}>
                <label style={labelStyle}>Triệu chứng/Mô tả vấn đề</label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  style={{ ...inputStyle, height: "120px" }}
                  placeholder="Mô tả chi tiết triệu chứng hoặc vấn đề bạn muốn tư vấn (nếu có)"
                ></textarea>
              </div>

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
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ 
              background: "rgba(232, 245, 233, 0.9)",
              borderRadius: "16px",
              padding: "30px",
              border: "2px solid rgba(67, 160, 71, 0.2)",
              boxShadow: "0 8px 16px rgba(67, 160, 71, 0.1)"
            }}>
              <div style={{ 
                fontSize: "64px", 
                marginBottom: "20px",
                color: "#43a047"
              }}>
                ✅
              </div>
              <h2 style={{ 
                fontSize: "28px", 
                fontWeight: "600", 
                marginBottom: "15px",
                color: "#43a047"
              }}>
                Đặt lịch thành công!
              </h2>
              <p style={{ 
                fontSize: "16px", 
                color: "#666", 
                marginBottom: "20px",
                lineHeight: "1.6"
              }}>
                Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận lịch hẹn.
                <br />
                Vui lòng kiểm tra điện thoại và email thường xuyên.
              </p>
            </div>
          </div>
        )}

        {/* Thông tin thêm */}
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
            <li style={{ marginBottom: "8px" }}>Vui lòng đến trước giờ hẹn 15 phút để hoàn thành thủ tục.</li>
            <li style={{ marginBottom: "8px" }}>Mang theo CMND/CCCD và các giấy tờ y tế liên quan (nếu có).</li>
            <li style={{ marginBottom: "8px" }}>Chuẩn bị danh sách các triệu chứng và câu hỏi muốn tư vấn.</li>
            {/* <li style={{ marginBottom: "8px" }}>Chúng tôi sẽ xác nhận lịch hẹn qua điện thoại trong vòng 24 giờ.</li> */}
          </ul>
        </div>
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

export default ConsultationBooking;
