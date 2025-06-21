import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

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

  // Hàm tính tuổi từ ngày sinh
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  // Lấy thông tin user từ API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Lấy userId từ localStorage, sessionStorage, hoặc từ props/context
        // Bạn có thể thay đổi cách lấy userId tùy theo cách bạn quản lý authentication
        const userId = localStorage.getItem('userId') || 
                      sessionStorage.getItem('userId') || 
                      '1'; // Default userId cho test
        
        const response = await fetch(`http://localhost:8080/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Không thể lấy thông tin người dùng');
        }
          const userData = await response.json();
        console.log('User data received:', userData); // Debug log để xem dữ liệu
        
        // Hàm mapping giá trị gender từ database sang option trong select
        const mapGenderValue = (genderFromDB) => {
          if (!genderFromDB) return '';
          
          const gender = genderFromDB.toLowerCase().trim();
          console.log('Original gender from DB:', genderFromDB, 'Normalized:', gender); // Debug log
          
          // Mapping các giá trị có thể có
          if (gender === 'female' || gender === 'nữ' || gender === 'nu' || gender === 'f' || gender === 'woman') {
            return 'female';
          } else if (gender === 'male' || gender === 'nam' || gender === 'm' || gender === 'man') {
            return 'male';
          } else {
            return 'other';
          }
        };
        
        // Cập nhật form với thông tin user
        setFormData(prevData => ({
          ...prevData,
          fullName: userData.fullName || '',
          age: userData.dob ? calculateAge(userData.dob).toString() : '',
          gender: mapGenderValue(userData.gender),
          phone: userData.phone || '',
          email: userData.email || ''
        }));
        
        setError('');
      } catch (err) {
        setError('Không thể lấy thông tin người dùng: ' + err.message);
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(''); // Clear any previous errors
        // Lấy userId từ localStorage hoặc sessionStorage
      const userId = localStorage.getItem('userId') || 
                    sessionStorage.getItem('userId') || 
                    '1'; // Default userId cho test
      
      // Validation client-side trước khi gửi
      if (!formData.question || formData.question.trim().length < 10) {
        throw new Error('Câu hỏi phải có ít nhất 10 ký tự');
      }
      
      if (!formData.fullName || formData.fullName.trim().length === 0) {
        throw new Error('Vui lòng nhập họ và tên');
      }
      
      if (!formData.questionCategory) {
        throw new Error('Vui lòng chọn chủ đề câu hỏi');
      }
      
      // Kiểm tra userId hợp lệ
      const userIdNumber = parseInt(userId);
      if (isNaN(userIdNumber) || userIdNumber <= 0) {
        throw new Error('Thông tin người dùng không hợp lệ');      }// Tạo title từ category - chỉ sử dụng tên category để đáp ứng backend validation
      const categoryName = questionCategories.find(cat => cat.id == formData.questionCategory)?.name;
      
      // Kiểm tra nếu không tìm thấy category, sử dụng default
      if (!categoryName) {
        throw new Error('Vui lòng chọn chủ đề câu hỏi hợp lệ');
      }
      
      // Backend chỉ chấp nhận exact match với các category names đã định nghĩa
      const title = categoryName;
      
      console.log('Generated title:', title, 'Length:', title.length);
      console.log('Available categories:', questionCategories);
      console.log('Selected category ID:', formData.questionCategory);
      console.log('Found category name:', categoryName);
        // Chỉ lấy nội dung câu hỏi, không bao gồm thông tin cá nhân
      const finalContent = formData.question.trim();
        // Chuẩn bị dữ liệu gửi API với format chính xác
      const questionData = {
        userID: userIdNumber, // Đảm bảo là số nguyên
        title: title.trim(), // Chỉ là tên category
        content: finalContent.trim() // Loại bỏ khoảng trắng thừa
      };
      
      // Validation cuối cùng trước khi gửi
      if (!questionData.title || questionData.title.length < 5) {
        throw new Error('Tiêu đề không hợp lệ');
      }
      
      if (questionData.content.length < 10 || questionData.content.length > 5000) {
        throw new Error('Nội dung phải từ 10-5000 ký tự');
      }
      
      console.log('Sending question data:', questionData);
      console.log('Title:', questionData.title);
      console.log('Content length:', questionData.content.length);
      console.log('UserID type:', typeof questionData.userID, 'Value:', questionData.userID);
      
      // Gửi request tới API
      const response = await fetch('http://localhost:8080/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData)
      });
      
      // Log response để debug
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);
        if (!response.ok) {
        let errorMessage = 'Không thể gửi câu hỏi. Vui lòng thử lại.';
        
        try {
          const errorData = JSON.parse(responseText);
          console.log('Error data:', errorData);
          
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.errors && Array.isArray(errorData.errors)) {
            // Xử lý validation errors từ Spring Boot
            errorMessage = errorData.errors.join(', ');
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch (parseError) {
          console.log('Error parsing response:', parseError);
          if (responseText) {
            errorMessage = responseText;
          }
        }
        
        // Thêm thông tin debug cho các lỗi phổ biến
        if (response.status === 400) {
          errorMessage = `Dữ liệu không hợp lệ: ${errorMessage}`;
        } else if (response.status === 500) {
          errorMessage = `Lỗi máy chủ: ${errorMessage}`;
        }
        
        throw new Error(errorMessage);
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        result = responseText;
      }
      
      console.log('Question created successfully:', result);
      
      // Hiển thị thông báo thành công
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting question:', error);
      setError('Lỗi gửi câu hỏi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
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
          <img
            src="/Logo.png"
            alt="Logo"
            style={{ height: 100, width: 100, objectFit: "contain" }}
          />
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
                    onChange={handleChange}
                    required
                    style={{...inputStyle, backgroundColor: loading ? "#f5f5f5" : "#f9f9f9"}}
                    placeholder="Nguyễn Văn A"
                    disabled={loading}
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
                    style={{...inputStyle, backgroundColor: loading ? "#f5f5f5" : "#f9f9f9"}}
                    placeholder="25"
                    disabled={loading}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Giới tính *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    style={{...inputStyle, backgroundColor: loading ? "#f5f5f5" : "#f9f9f9"}}
                    disabled={loading}
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
                    style={{...inputStyle, backgroundColor: loading ? "#f5f5f5" : "#f9f9f9"}}
                    placeholder="0912345678"
                    disabled={loading}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{...inputStyle, backgroundColor: loading ? "#f5f5f5" : "#f9f9f9"}}
                    placeholder="example@gmail.com"
                    disabled={loading}
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
              </div>              <div style={{ marginTop: "35px", textAlign: "center" }}>
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
