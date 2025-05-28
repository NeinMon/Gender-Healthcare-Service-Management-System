import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!loginData.email || !loginData.password) {
      setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
      return;
    }    // Here you would call an API to validate login
    setSuccess(true);
    
    // Redirect after successful login
    setTimeout(() => {
      window.location.href = "/services";
    }, 2000);
  };  return (
    <div style={{ 
      backgroundColor: "#f0f9ff !important", 
      background: "#f0f9ff !important",
      colorScheme: "light",
      minHeight: "100vh",
      width: "100vw",
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>      <header style={{
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
          Đăng Nhập Hệ Thống Y Tế
        </h1>
      </header>      <main
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
            maxWidth: "480px",
            margin: "0 auto",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            position: "relative",
            zIndex: 10
          }}
        >{success ? (
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
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "20px", fontWeight: 600 }}>Đăng nhập thành công!</h3>
              <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Đang chuyển hướng đến trang dịch vụ...</p>
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
              <form onSubmit={handleLoginSubmit} style={{ width: "100%" }}>
                <div style={{ marginBottom: "24px" }}>                  <label style={{ 
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
                    value={loginData.email}
                    onChange={handleLoginChange}
                    style={{ 
                      width: "100%", 
                      padding: "16px 20px", 
                      borderRadius: "12px", 
                      border: "2px solid rgba(8, 145, 178, 0.1)", 
                      fontSize: "16px",
                      background: "rgba(255, 255, 255, 0.8)",
                      transition: "all 0.3s ease",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    onFocus={(e) => e.target.style.border = "2px solid #0891b2"}
                    onBlur={(e) => e.target.style.border = "2px solid rgba(8, 145, 178, 0.1)"}
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>                  <label style={{ 
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
                    value={loginData.password}
                    onChange={handleLoginChange}
                    style={{ 
                      width: "100%", 
                      padding: "16px 20px", 
                      borderRadius: "12px", 
                      border: "2px solid rgba(8, 145, 178, 0.1)", 
                      fontSize: "16px",
                      background: "rgba(255, 255, 255, 0.8)",
                      transition: "all 0.3s ease",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    onFocus={(e) => e.target.style.border = "2px solid #0891b2"}
                    onBlur={(e) => e.target.style.border = "2px solid rgba(8, 145, 178, 0.1)"}
                  />
                  <div style={{ textAlign: "right", marginTop: "12px", marginBottom: "28px" }}>
                    <a href="#" style={{ 
                      color: "#0891b2", 
                      textDecoration: "none", 
                      fontSize: "14px",
                      fontWeight: 500,
                      transition: "color 0.3s ease"
                    }}>
                      🔑 Quên mật khẩu?
                    </a>
                  </div>
                </div>

                <div>                  <button
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
                    🚀 Đăng nhập
                  </button>
                  
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#666", fontSize: "15px", margin: 0 }}>
                      Chưa có tài khoản?{" "}
                      <Link to="/register" style={{ 
                        color: "#0891b2", 
                        textDecoration: "none", 
                        fontWeight: "600",
                        transition: "color 0.3s ease"
                      }}>
                        🏥 Đăng ký ngay
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </>
          )}        </div>
      </main>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>      <footer style={{ 
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

export default Login;
