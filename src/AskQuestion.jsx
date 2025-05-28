import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AskQuestion = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    questionCategory: '',
    question: '',
    privacy: false
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const questionCategories = [
    { id: 1, name: "Sức khỏe sinh sản" },
    { id: 2, name: "Thai sản và phụ khoa" },
    { id: 3, name: "Kế hoạch hóa gia đình" },
    { id: 4, name: "Kinh nguyệt và mãn kinh" },
    { id: 5, name: "Sức khỏe tình dục" },
    { id: 6, name: "Dinh dưỡng và lối sống" }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
          Đặt câu hỏi cho tư vấn viên
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
          <>
            <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "30px", width: "100%" }}>
              Gửi câu hỏi của bạn cho chuyên gia tư vấn
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
                  <label style={labelStyle}>Chủ đề câu hỏi *</label>
                  <select
                    name="questionCategory"
                    value={formData.questionCategory}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  >
                    <option value="">-- Chọn chủ đề --</option>
                    {questionCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", marginTop: "25px", width: "100%" }}>
                <label style={labelStyle}>Câu hỏi của bạn *</label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, height: "180px" }}
                  placeholder="Nhập câu hỏi của bạn ở đây. Hãy cung cấp càng nhiều thông tin càng tốt để chuyên gia có thể tư vấn chính xác nhất."
                ></textarea>
              </div>

              <div style={{ marginTop: "20px", display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  name="privacy"
                  checked={formData.privacy}
                  onChange={handleChange}
                  required
                  id="privacy-checkbox"
                  style={{ marginRight: "10px", width: "20px", height: "20px" }}
                />
                <label htmlFor="privacy-checkbox" style={{ fontSize: "16px", color: "#2c3e50" }}>
                  Tôi đồng ý cho phép lưu trữ thông tin và gửi phản hồi qua email/điện thoại *
                </label>
              </div>

              <div style={{ marginTop: "35px", textAlign: "center" }}>                <button
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
                  Gửi câu hỏi
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", width: "100%" }}>            <div style={{ 
              fontSize: "80px", 
              marginBottom: "30px",
              color: "#0891b2"
            }}>
              ✅
            </div>
            <h2 style={{ color: "#2c3e50", marginBottom: "20px", fontSize: "28px" }}>Gửi câu hỏi thành công!</h2>
            <p style={{ fontSize: "18px", color: "#7f8c8d", marginBottom: "30px", maxWidth: "800px", margin: "0 auto 30px" }}>
              Cảm ơn bạn đã gửi câu hỏi. Chuyên gia tư vấn của chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất.
              Phản hồi sẽ được gửi qua email hoặc số điện thoại bạn đã cung cấp.
            </p>
            <div style={{ marginTop: "40px" }}>              <Link
                to="/services"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "14px 35px",
                  borderRadius: "30px",
                  fontWeight: "600",
                  fontSize: "16px"
                }}
              >
                Quay lại trang chủ
              </Link>
            </div>
          </div>
        )}

        {/* Thông tin thêm */}
        <div style={{ 
          marginTop: "50px", 
          padding: "25px", 
          backgroundColor: "#fff8e1", 
          borderRadius: "10px",
          border: "1px solid #ffe082",
          width: "100%",
          boxSizing: "border-box",
          maxWidth: "1600px",
          margin: "50px auto 0"
        }}>
          <h3 style={{ color: "#f57c00", marginBottom: "15px", fontSize: "20px" }}>Thông tin hữu ích:</h3>
          <ul style={{ color: "#e65100", paddingLeft: "25px", fontSize: "16px" }}>
            <li style={{ marginBottom: "10px" }}>Câu hỏi của bạn sẽ được trả lời trong vòng 24-48 giờ làm việc.</li>
            <li style={{ marginBottom: "10px" }}>Thông tin cá nhân của bạn sẽ được bảo mật và chỉ được sử dụng cho mục đích tư vấn.</li>
            <li style={{ marginBottom: "10px" }}>Vui lòng cung cấp đầy đủ thông tin liên quan đến câu hỏi để chuyên gia có thể tư vấn tốt nhất.</li>
            <li style={{ marginBottom: "10px" }}>Nếu có vấn đề khẩn cấp, vui lòng liên hệ trực tiếp với chúng tôi qua số hotline: 1900-xxxx.</li>
          </ul>
        </div>
      </main>

      {/* Footer */}      <footer style={{
        padding: "25px",
        backgroundColor: "#e0f2fe",
        textAlign: "center",
        color: "#0891b2",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <p style={{ fontSize: "16px" }}>© 2025 Hệ thống Chăm sóc Sức khỏe Phụ nữ. Mọi quyền được bảo lưu.</p>
        <p style={{ marginTop: "10px", fontSize: "16px" }}>Hotline: 1900-xxxx | Email: support@healthcare.com</p>
      </footer>
    </div>
  );
};

// Định nghĩa styles
const labelStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#2c3e50",
  marginBottom: "10px"
};

const inputStyle = {
  padding: "14px",
  borderRadius: "8px",
  border: "1px solid #e1e1e1",
  fontSize: "16px",
  color: "#2c3e50",
  transition: "all 0.3s ease",
  outline: "none",
  backgroundColor: "#f9f9f9"
};

export default AskQuestion;
