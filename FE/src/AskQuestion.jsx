import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import {
  calculateAge,
  mapGenderValue,
  fetchUserData,
  submitQuestion,
  handleFormChange,
  questionCategories,
  labelStyle,
  inputStyle
} from './utils/askQuestionHelpers';

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Lấy thông tin user từ API sử dụng helper
  useEffect(() => {
    fetchUserData(setFormData, setError, setLoading, calculateAge, mapGenderValue);
  }, []);

  // Form change handler sử dụng helper
  const handleChange = (e) => {
    handleFormChange(e, formData, setFormData);
  };

  // Form submission handler sử dụng helper
  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitQuestion(formData, questionCategories, setSubmitting, setError, setIsSubmitted);
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
            Đặt câu hỏi cho tư vấn viên
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
        </div>        {!isSubmitted ? (
          <>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", width: "100%" }}>
                <div style={{ 
                  fontSize: "18px", 
                  color: "#0891b2",
                  marginBottom: "20px"
                }}>
                  Đang tải thông tin người dùng...
                </div>
              </div>
            ) : error ? (
              <div style={{ 
                textAlign: "center", 
                padding: "40px", 
                width: "100%",
                backgroundColor: "#fee",
                borderRadius: "10px",
                border: "1px solid #fcc",
                marginBottom: "20px"
              }}>
                <div style={{ 
                  fontSize: "18px", 
                  color: "#c53030",
                  marginBottom: "10px"
                }}>
                  ⚠️ {error}
                </div>
                <p style={{ color: "#718096" }}>
                  Vui lòng thử lại sau hoặc nhập thông tin thủ công.
                </p>
              </div>
            ) : null}
            
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
                </div>                <div style={{ display: "flex", flexDirection: "column" }}>
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
                  {!formData.questionCategory && (
                    <small style={{ color: "#e53e3e", marginTop: "5px" }}>
                      Vui lòng chọn chủ đề câu hỏi
                    </small>
                  )}
                </div>
              </div>              <div style={{ display: "flex", flexDirection: "column", marginTop: "25px", width: "100%" }}>
                <label style={labelStyle}>Câu hỏi của bạn *</label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, height: "180px" }}
                  placeholder="Nhập câu hỏi của bạn ở đây. Hãy cung cấp càng nhiều thông tin càng tốt để chuyên gia có thể tư vấn chính xác nhất."
                ></textarea>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                  <small style={{ color: formData.question.length < 10 ? "#e53e3e" : "#718096" }}>
                    Tối thiểu 10 ký tự
                  </small>
                  <small style={{ color: formData.question.length > 5000 ? "#e53e3e" : "#718096" }}>
                    {formData.question.length}/5000 ký tự
                  </small>
                </div>
              </div>

              <div style={{ marginTop: "35px", textAlign: "center" }}>
                <button
                  type="submit"
                  disabled={submitting || !formData.question || formData.question.length < 10 || !formData.questionCategory || !formData.fullName}
                  style={{
                    background: (submitting || !formData.question || formData.question.length < 10 || !formData.questionCategory || !formData.fullName) 
                      ? "#ccc" 
                      : "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "14px 35px",
                    borderRadius: "30px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: (submitting || !formData.question || formData.question.length < 10 || !formData.questionCategory || !formData.fullName) 
                      ? "not-allowed" 
                      : "pointer",
                    transition: "all 0.3s ease",
                    opacity: (submitting || !formData.question || formData.question.length < 10 || !formData.questionCategory || !formData.fullName) 
                      ? 0.7 
                      : 1
                  }}
                  onMouseOver={(e) => {
                    if (!submitting && formData.question && formData.question.length >= 10 && formData.questionCategory && formData.fullName) {
                      e.target.style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!submitting && formData.question && formData.question.length >= 10 && formData.questionCategory && formData.fullName) {
                      e.target.style.transform = "scale(1)";
                    }
                  }}
                >                  {submitting ? "Đang gửi..." : "Gửi câu hỏi"}
                </button>
              </div>
              
              {/* Hiển thị lỗi nếu có */}
              {error && (
                <div style={{ 
                  marginTop: "20px", 
                  padding: "15px", 
                  backgroundColor: "#fee", 
                  borderRadius: "8px",
                  border: "1px solid #fcc",
                  textAlign: "center"
                }}>
                  <div style={{ color: "#c53030", fontWeight: "500" }}>
                    {error}
                  </div>
                </div>
              )}
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
            <li style={{ marginBottom: "10px" }}>
              <span>Chi phí dịch vụ: <strong>Miễn phí</strong></span>
            </li>
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

export default AskQuestion;
