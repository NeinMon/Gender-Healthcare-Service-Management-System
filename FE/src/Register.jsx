import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {  const [registerData, setRegisterData] = useState({
    fullName: "",
    address: "",
    dob: "",
    email: "",
    gender: "",
    password: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");    // Validate form
    if (
      !registerData.fullName ||
      !registerData.dob ||
      !registerData.email ||
      !registerData.gender ||
      !registerData.password ||
      !registerData.phone
    ) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(registerData.email)) {
      setError("Email không đúng định dạng!");
      return;
    }
    
    // Validate password length
    if (registerData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    
    // Validate phone format
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(registerData.phone)) {
      setError("Số điện thoại không hợp lệ (phải bắt đầu bằng 0 hoặc +84, và có 10 số)");
      return;
    }    try {
      // Format date for the backend
      const formattedData = {
        ...registerData,
        // Convert date string to datetime format required by backend
        dob: registerData.dob ? new Date(registerData.dob).toISOString() : null
      };
      
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Đăng ký thất bại!');
        setSuccess(false);
        return;
      }
        setSuccess(true);
      setError("");
    } catch (err) {
      setError("Không thể kết nối tới máy chủ. Vui lòng thử lại!");
      setSuccess(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: "#f0f9ff !important", 
      background: "#f0f9ff !important",
      colorScheme: "light",
      minHeight: "100vh",
      width: "100vw",
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}><header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 0,
        position: "relative"
      }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: 18 }}>
          <Link to="/">
            <img
              src="/Logo.png"
              alt="Logo"
              style={{ height: 100, width: 100, objectFit: "contain" }}
            />
          </Link>
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
          Đăng Ký Hệ Thống Y Tế
        </h1>
      </header>        <main
        style={{
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
          background: "#f0f9ff !important",
          backgroundColor: "#f0f9ff !important",
          colorScheme: "light",
          position: "relative"
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95) !important",
            backgroundColor: "rgba(255, 255, 255, 0.95) !important",
            colorScheme: "light",
            borderRadius: "24px",
            boxShadow: "0 20px 40px rgba(8, 145, 178, 0.1), 0 1px 3px rgba(0,0,0,0.1)",
            padding: "40px",
            width: "100%",
            maxWidth: "600px",
            margin: "0 auto",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            position: "relative",
            zIndex: 10
          }}
        >          {success ? (
            <div style={{
              textAlign: "center",
              color: "#43a047",
              padding: "30px",
              backgroundColor: "rgba(232, 245, 233, 0.9) !important",
              background: "rgba(232, 245, 233, 0.9) !important",
              colorScheme: "light",
              borderRadius: "16px",
              marginBottom: "20px",
              border: "2px solid rgba(67, 160, 71, 0.2)",
              boxShadow: "0 8px 16px rgba(67, 160, 71, 0.1)"
            }}>              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "20px", fontWeight: 600 }}>Đăng ký thành công!</h3>
              <p style={{ margin: 0, color: "#666", fontSize: "14px", marginBottom: "20px" }}>
                Cảm ơn bạn đã đăng ký tài khoản.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <Link to="/" style={{
                  padding: "8px 16px",
                  backgroundColor: "#0891b2",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "500",
                  fontSize: "14px"
                }}>
                  Trang chủ
                </Link>
                <Link to="/login" style={{
                  padding: "8px 16px",
                  backgroundColor: "#0891b2",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "500",
                  fontSize: "14px"
                }}>
                  Đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div style={{
                  color: "#d32f2f",
                  padding: "16px 20px",
                  backgroundColor: "rgba(255, 235, 238, 0.9) !important",
                  background: "rgba(255, 235, 238, 0.9) !important",
                  colorScheme: "light",
                  borderRadius: "12px",
                  marginBottom: "24px",
                  border: "2px solid rgba(211, 47, 47, 0.2)",
                  boxShadow: "0 4px 8px rgba(211, 47, 47, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <span style={{ fontSize: "20px" }}>⚠️</span>
                  <span style={{ fontWeight: 500 }}>{error}</span>
                </div>
              )}
              <form onSubmit={handleRegisterSubmit} style={{ width: "100%" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div style={{ gridColumn: "1 / span 2" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#0891b2",
                      fontSize: "15px"
                    }}>
                      👤 Họ và tên:
                    </label>                    <input
                      type="text"
                      name="fullName"
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "16px 20px", 
                        borderRadius: "12px", 
                        border: "2px solid rgba(8, 145, 178, 0.1)", 
                        fontSize: "16px",
                        background: "rgba(255, 255, 255, 0.8)",
                        transition: "all 0.3s ease",
                        outline: "none",
                        boxSizing: "border-box",
                        marginBottom: "15px"
                      }}
                      onFocus={(e) => e.target.style.border = "2px solid #0891b2"}
                      onBlur={(e) => e.target.style.border = "2px solid rgba(8, 145, 178, 0.1)"}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#0891b2",
                      fontSize: "15px"
                    }}>
                      🏠 Địa chỉ:
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={registerData.address}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "16px 20px", 
                        borderRadius: "12px", 
                        border: "2px solid rgba(8, 145, 178, 0.1)", 
                        fontSize: "16px",
                        background: "rgba(255, 255, 255, 0.8)",
                        transition: "all 0.3s ease",
                        outline: "none",
                        boxSizing: "border-box",
                        marginBottom: "15px"
                      }}
                      onFocus={(e) => e.target.style.border = "2px solid #0891b2"}
                      onBlur={(e) => e.target.style.border = "2px solid rgba(8, 145, 178, 0.1)"}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#0891b2",
                      fontSize: "15px"
                    }}>
                      📅 Ngày sinh:
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={registerData.dob}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "16px 20px", 
                        borderRadius: "12px", 
                        border: "2px solid rgba(8, 145, 178, 0.1)", 
                        fontSize: "16px",
                        background: "rgba(255, 255, 255, 0.8)",
                        transition: "all 0.3s ease",
                        outline: "none",
                        boxSizing: "border-box",
                        marginBottom: "15px"
                      }}
                      onFocus={(e) => e.target.style.border = "2px solid #0891b2"}
                      onBlur={(e) => e.target.style.border = "2px solid rgba(8, 145, 178, 0.1)"}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#0891b2",
                      fontSize: "15px"
                    }}>
                      📧 Email:
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "16px 20px", 
                        borderRadius: "12px", 
                        border: "2px solid rgba(8, 145, 178, 0.1)", 
                        fontSize: "16px",
                        background: "rgba(255, 255, 255, 0.8)",
                        transition: "all 0.3s ease",
                        outline: "none",
                        boxSizing: "border-box",
                        marginBottom: "15px"
                      }}
                      onFocus={(e) => e.target.style.border = "2px solid #0891b2"}
                      onBlur={(e) => e.target.style.border = "2px solid rgba(8, 145, 178, 0.1)"}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#0891b2",
                      fontSize: "15px"
                    }}>
                      ⚧️ Giới tính:
                    </label>
                    <select
                      name="gender"
                      value={registerData.gender}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "16px 20px", 
                        borderRadius: "12px", 
                        border: "2px solid rgba(8, 145, 178, 0.1)", 
                        fontSize: "16px",
                        background: "rgba(255, 255, 255, 0.8)",
                        transition: "all 0.3s ease",
                        outline: "none",
                        boxSizing: "border-box",
                        marginBottom: "15px"
                      }}
                      onFocus={(e) => e.target.style.border = "2px solid #0891b2"}
                      onBlur={(e) => e.target.style.border = "2px solid rgba(8, 145, 178, 0.1)"}
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#0891b2",
                      fontSize: "15px"
                    }}>
                      🔒 Mật khẩu:
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "16px 20px", 
                        borderRadius: "12px", 
                        border: "2px solid rgba(8, 145, 178, 0.1)", 
                        fontSize: "16px",
                        background: "rgba(255, 255, 255, 0.8)",
                        transition: "all 0.3s ease",
                        outline: "none",
                        boxSizing: "border-box",
                        marginBottom: "15px"
                      }}
                      onFocus={(e) => e.target.style.border = "2px solid #0891b2"}
                      onBlur={(e) => e.target.style.border = "2px solid rgba(8, 145, 178, 0.1)"}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600", 
                      color: "#0891b2",
                      fontSize: "15px"
                    }}>
                      📱 Số điện thoại:
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "16px 20px", 
                        borderRadius: "12px", 
                        border: "2px solid rgba(8, 145, 178, 0.1)", 
                        fontSize: "16px",
                        background: "rgba(255, 255, 255, 0.8)",
                        transition: "all 0.3s ease",
                        outline: "none",
                        boxSizing: "border-box",
                        marginBottom: "15px"
                      }}
                      onFocus={(e) => e.target.style.border = "2px solid #0891b2"}
                      onBlur={(e) => e.target.style.border = "2px solid rgba(8, 145, 178, 0.1)"}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "30px" }}>
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "16px 30px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "16px",
                      width: "100%",
                      marginBottom: "24px",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(8, 145, 178, 0.3)"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 16px rgba(8, 145, 178, 0.4)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 12px rgba(8, 145, 178, 0.3)";
                    }}
                  >
                    🚀 Đăng ký
                  </button>
                  
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#666", fontSize: "15px", margin: 0 }}>
                      Đã có tài khoản?{" "}
                      <Link to="/login" style={{ 
                        color: "#0891b2", 
                        textDecoration: "none", 
                        fontWeight: "600",
                        transition: "color 0.3s ease"
                      }}>
                        🏥 Đăng nhập ngay
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </main>      <footer style={{ 
        background: "#e0f2fe !important", 
        backgroundColor: "#e0f2fe !important",
        colorScheme: "light",
        color: "#0891b2", 
        padding: "20px", 
        textAlign: "center" 
      }}>
        &copy; {new Date().getFullYear()} Sức khỏe giới tính - Một sản phẩm của cơ sở y tế Việt Nam
      </footer>
    </div>
  );
};

export default Register;
