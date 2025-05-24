import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [registerData, setRegisterData] = useState({
    name: "",
    username: "",
    gender: "",
    dob: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (
      !registerData.name ||
      !registerData.username ||
      !registerData.gender ||
      !registerData.dob ||
      !registerData.email ||
      !registerData.phone ||
      !registerData.address ||
      !registerData.password
    ) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không trùng khớp!");
      return;
    }

    // Here you would typically call an API to register the user
    setSuccess(true);
    setError("");
    
    // Clear form after successful registration
    setTimeout(() => {
      window.location.href = "/";
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
          Đăng Ký Tài Khoản
        </h1>
      </header>      <main style={{ 
        width: "100%", 
        margin: "40px auto", 
        padding: "0 40px" 
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 24px rgba(17,153,142,0.15)",
          padding: 32,
          maxWidth: "1200px",
          margin: "0 auto",
        }}>
          {success ? (
            <div style={{
              textAlign: "center",
              color: "#43a047",
              padding: "20px",
              backgroundColor: "#e8f5e9",
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <h3>Đăng ký thành công!</h3>
              <p>Đang chuyển hướng về trang chủ...</p>
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
              <form onSubmit={handleRegisterSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#11998e" }}>
                      Họ và tên:
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "8px", 
                        border: "1px solid #b2dfdb", 
                        fontSize: "16px",
                        marginBottom: "15px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#11998e" }}>
                      Tên đăng nhập:
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "8px", 
                        border: "1px solid #b2dfdb", 
                        fontSize: "16px",
                        marginBottom: "15px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#11998e" }}>
                      Giới tính:
                    </label>
                    <select
                      name="gender"
                      value={registerData.gender}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "8px", 
                        border: "1px solid #b2dfdb", 
                        fontSize: "16px",
                        marginBottom: "15px"
                      }}
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#11998e" }}>
                      Ngày sinh:
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={registerData.dob}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "8px", 
                        border: "1px solid #b2dfdb", 
                        fontSize: "16px",
                        marginBottom: "15px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#11998e" }}>
                      Email:
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "8px", 
                        border: "1px solid #b2dfdb", 
                        fontSize: "16px",
                        marginBottom: "15px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#11998e" }}>
                      Số điện thoại:
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "8px", 
                        border: "1px solid #b2dfdb", 
                        fontSize: "16px",
                        marginBottom: "15px"
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / span 2" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#11998e" }}>
                      Địa chỉ:
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={registerData.address}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "8px", 
                        border: "1px solid #b2dfdb", 
                        fontSize: "16px",
                        marginBottom: "15px"
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
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "8px", 
                        border: "1px solid #b2dfdb", 
                        fontSize: "16px",
                        marginBottom: "15px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#11998e" }}>
                      Xác nhận mật khẩu:
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "8px", 
                        border: "1px solid #b2dfdb", 
                        fontSize: "16px",
                        marginBottom: "15px" 
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
                    <Link to="/">
                      <button
                        type="button"
                        style={{
                          background: "#b2dfdb",
                          color: "#11998e",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px 30px",
                          fontWeight: "600",
                          cursor: "pointer",
                          fontSize: "16px"
                        }}
                      >
                        Trở về
                      </button>
                    </Link>
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
                        fontSize: "16px"
                      }}
                    >
                      Đăng ký
                    </button>
                  </div>
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <p>
                      Đã có tài khoản?{" "}
                      <Link to="/login" style={{ color: "#11998e", textDecoration: "none", fontWeight: "600" }}>
                        Đăng nhập ngay
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

export default Register;