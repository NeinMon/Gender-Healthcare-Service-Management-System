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
  };

  return (
    <div style={{ backgroundColor: "#f8fffc", minHeight: "100vh" }}>
      <header style={{
        background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
        padding: "20px 0"
      }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Link to="/">
            <img
              src="/Logo.png"
              alt="Logo"
              style={{ height: 80, width: 80, objectFit: "contain" }}
            />
          </Link>
        </div>
        <h1
          style={{
            color: "#fff",
            margin: 0,
            padding: "16px 0",
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: 1
          }}
        >
          Đăng Nhập
        </h1>
      </header>

      <main
        style={{
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 0,
          background: "#fff", // Nền trắng full màn hình
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 0, // Không bo góc để full màn hình
            boxShadow: "none", // Không đổ bóng để đồng nhất
            padding: 0, // Không padding ngoài
            width: "100vw", // Chiếm toàn bộ chiều ngang
            minHeight: "100vh", // Chiếm toàn bộ chiều cao
            margin: 0,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {success ? (            <div style={{
              textAlign: "center",
              color: "#43a047",
              padding: "20px",
              backgroundColor: "#e8f5e9",
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <h3>Đăng nhập thành công!</h3>
              <p>Đang chuyển hướng đến trang dịch vụ...</p>
            </div>
          ) : (
            <>
              {error && (
                <div style={{
                  color: "#d32f2f",
                  padding: "10px 15px",
                  backgroundColor: "#ffebee",
                  borderRadius: "6px",
                  marginBottom: "20px"
                }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleLoginSubmit} style={{ maxWidth: 500, width: "100%", margin: "0 auto" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#11998e" }}>
                    Email:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    style={{ 
                      width: "100%", 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #b2dfdb", 
                      fontSize: "16px",
                      marginBottom: "20px"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#11998e" }}>
                    Mật khẩu:
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    style={{ 
                      width: "100%", 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #b2dfdb", 
                      fontSize: "16px",
                      marginBottom: "15px"
                    }}
                  />
                  <div style={{ textAlign: "right", marginBottom: "25px" }}>
                    <a href="#" style={{ color: "#11998e", textDecoration: "none", fontSize: "14px" }}>
                      Quên mật khẩu?
                    </a>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    style={{
                      background: "#11998e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 30px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "16px",
                      width: "100%",
                      marginBottom: "20px"
                    }}
                  >
                    Đăng nhập
                  </button>
                  
                  <div style={{ textAlign: "center" }}>
                    <p>
                      Chưa có tài khoản?{" "}
                      <Link to="/register" style={{ color: "#11998e", textDecoration: "none", fontWeight: "600" }}>
                        Đăng ký ngay
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      <footer style={{ 
        background: "#e6fff4", 
        color: "#11998e",
        padding: "20px 0",
        textAlign: "center",
        marginTop: "40px"
      }}>
        &copy; {new Date().getFullYear()} Sức khỏe giới tính - Một sản phẩm của cơ sở y tế Việt Nam
      </footer>
    </div>
  );
};

export default Login;