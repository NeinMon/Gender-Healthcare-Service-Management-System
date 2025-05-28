import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ConsultationBooking = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    consultantId: '',
    symptoms: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const consultants = [
    { id: 1, name: "BS. Nguyễn Thị Minh", specialty: "Sức khỏe phụ nữ", avatar: "👩‍⚕️" },
    { id: 2, name: "BS. Trần Văn Hải", specialty: "Sản phụ khoa", avatar: "👨‍⚕️" },
    { id: 3, name: "BS. Lê Thị Hương", specialty: "Nội tiết", avatar: "👩‍⚕️" },
    { id: 4, name: "BS. Phạm Minh Tuấn", specialty: "Dinh dưỡng", avatar: "👨‍⚕️" }
  ];

  const availableTimes = [
    "08:00", "09:00", "10:00", "11:00", 
    "13:30", "14:30", "15:30", "16:30"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Booking data:", formData);
    // Đây là nơi bạn sẽ gửi dữ liệu đến API
    setIsSubmitted(true);
  };
  return (
    <div style={{ backgroundColor: "#f8fffc", minHeight: "100vh", width: "100vw", margin: 0, padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
        paddingBottom: 0,
        position: "relative",
        width: "100%"
      }}>
        <div style={{
          position: "absolute",
          top: 20,
          right: 25,
          display: "flex",
          gap: 10,
          zIndex: 2
        }}>
          <Link 
            to="/" 
            style={{
              background: "#11998e",
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
          Đặt lịch tư vấn
        </h1>
      </header>      {/* Main Content */}
      <main style={{
        padding: "40px",
        minHeight: "calc(100vh - 180px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#fff",
        boxSizing: "border-box",
        boxShadow: "0 0 20px rgba(0,0,0,0.05)",
        overflow: "auto"
      }}>
        {/* Navigation links */}
        <div style={{ marginBottom: "30px", width: "100%" }}>
          <Link 
            to="/services" 
            style={{
              display: "flex",
              alignItems: "center",
              color: "#11998e",
              textDecoration: "none",
              fontWeight: 500
            }}
          >
            ← Quay lại trang dịch vụ
          </Link>
        </div>

        {isSubmitted ? (
          <div style={{            textAlign: "center", 
            padding: "40px", 
            backgroundColor: "#e8f5e9", 
            borderRadius: "12px",
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto"
          }}>
            <div style={{ fontSize: "72px", marginBottom: "20px" }}>✅</div>
            <h2 style={{ color: "#2e7d32", marginBottom: "20px" }}>Đặt lịch thành công!</h2>
            <p style={{ fontSize: "16px", lineHeight: 1.6, marginBottom: "30px" }}>
              Chúng tôi đã nhận được yêu cầu đặt lịch tư vấn của bạn và sẽ xác nhận lại qua điện thoại.
              Xin cảm ơn đã sử dụng dịch vụ của chúng tôi.
            </p>
            <div>
              <button 
                onClick={() => setIsSubmitted(false)}
                style={{
                  background: "#4ecdc4",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                  marginRight: "15px"
                }}
              >
                Đặt lịch khác
              </button>
              <Link 
                to="/services"
                style={{
                  background: "#11998e",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-block"
                }}
              >
                Về trang dịch vụ
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>              <h2 style={{ fontSize: "32px", color: "#2c3e50", marginBottom: "15px" }}>
                Đặt lịch tư vấn với chuyên gia
              </h2><p style={{ fontSize: "18px", color: "#7f8c8d", maxWidth: "1000px", margin: "0 auto" }}>
                Vui lòng điền đầy đủ thông tin dưới đây để đặt lịch tư vấn với bác sĩ chuyên khoa
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "1000px" }}>
              <div style={{ marginBottom: "30px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#2c3e50" }}>
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "16px"
                  }}
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              <div style={{ marginBottom: "30px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#2c3e50" }}>
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "16px"
                  }}
                  placeholder="Nhập số điện thoại liên hệ"
                />
              </div>

              <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#2c3e50" }}>
                    Ngày hẹn *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "16px"
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#2c3e50" }}>
                    Giờ hẹn *
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "16px",
                      appearance: "none",
                      backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"black\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>')",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 10px center"
                    }}
                  >
                    <option value="">Chọn giờ hẹn</option>
                    {availableTimes.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "30px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#2c3e50" }}>
                  Chọn bác sĩ tư vấn *
                </label>
                <div style={{ 
                  display: "grid",                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
                  gap: "20px" 
                }}>
                  {consultants.map(consultant => (
                    <div 
                      key={consultant.id}
                      style={{
                        border: formData.consultantId === consultant.id.toString() 
                          ? "2px solid #4ecdc4" 
                          : "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "15px",
                        cursor: "pointer",
                        textAlign: "center",
                        backgroundColor: formData.consultantId === consultant.id.toString() 
                          ? "#e8f7f6" 
                          : "#fff"
                      }}
                      onClick={() => setFormData({...formData, consultantId: consultant.id.toString()})}
                    >
                      <div style={{ fontSize: "36px", marginBottom: "10px" }}>
                        {consultant.avatar}
                      </div>
                      <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                        {consultant.name}
                      </div>
                      <div style={{ fontSize: "14px", color: "#7f8c8d" }}>
                        {consultant.specialty}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "30px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#2c3e50" }}>
                  Triệu chứng / Lý do tư vấn
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "16px",
                    minHeight: "120px",
                    resize: "vertical"
                  }}
                  placeholder="Mô tả triệu chứng hoặc lý do bạn muốn được tư vấn"
                />
              </div>

              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
                    color: "white",
                    border: "none",
                    padding: "14px 40px",
                    borderRadius: "30px",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(56, 239, 125, 0.3)"
                  }}
                >
                  Xác nhận đặt lịch
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default ConsultationBooking;
