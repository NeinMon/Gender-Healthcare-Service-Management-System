import React, { useState } from "react";

// Color scheme for reproductive health status indicators - using medical color palette
const STATUS_COLOR = {
  "Bắt đầu kinh nguyệt": "#d32f2f", // Medical red
  "Kết thúc kinh nguyệt": "#1e88e5", // Medical blue
  "Rụng trứng": "#fb8c00", // Medical orange
  "Dự kiến kinh nguyệt tiếp theo": "#7b1fa2" // Medical purple
};

// Health status icons with medical focus
const STATUS_ICON = {
  "Bắt đầu kinh nguyệt": "🩸",
  "Kết thúc kinh nguyệt": "✓",
  "Rụng trứng": "⭐",
  "Dự kiến kinh nguyệt tiếp theo": "📅"
};

const App = () => {
  const [startDate, setStartDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [tableData, setTableData] = useState([]);
  const [showCalculator, setShowCalculator] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
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
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (
      !registerData.name ||
      !registerData.username ||
      !registerData.gender ||
      !registerData.dob ||
      !registerData.email ||
      !registerData.phone ||
      !registerData.address ||
      !registerData.password ||
      registerData.password !== registerData.confirmPassword
    ) {
      alert("Vui lòng nhập đầy đủ thông tin và xác nhận mật khẩu trùng khớp!");
      return;
    }
    alert("Đăng ký thành công!");
    setShowRegister(false);
    setRegisterData({
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
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
      return;
    }
    alert("Đăng nhập thành công!");
    setShowLogin(false);
    setLoginData({ email: "", password: "" });
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!startDate || cycleLength < 20 || periodLength < 2) return;

    const start = new Date(startDate);
    const ovulation = new Date(start);
    ovulation.setDate(start.getDate() + cycleLength - 14);

    const nextPeriod = new Date(start);
    nextPeriod.setDate(start.getDate() + cycleLength);

    setTableData([
      {
        date: start.toLocaleDateString("vi-VN"),
        status: "Bắt đầu kinh nguyệt",
        note: "Ngày đầu chu kỳ"
      },
      {
        date: new Date(start.getTime() + (periodLength - 1) * 86400000).toLocaleDateString("vi-VN"),
        status: "Kết thúc kinh nguyệt",
        note: "Ngày cuối kinh"
      },
      {
        date: ovulation.toLocaleDateString("vi-VN"),
        status: "Rụng trứng",
        note: "Khả năng thụ thai cao"
      },
      {
        date: nextPeriod.toLocaleDateString("vi-VN"),
        status: "Dự kiến kinh nguyệt tiếp theo",
        note: "Chu kỳ mới"
      }
    ]);
  };

  return (
    <div>      <header style={{
        background: "linear-gradient(90deg, #005b9f 0%, #0277bd 100%)", // Medical blue gradient
        paddingBottom: 0,
        position: "relative",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
      }}>
        <div style={{
          position: "absolute",
          top: 170,
          right: 25,
          display: "flex",
          gap: 10,
          zIndex: 2
        }}>
          <button
            style={{
              background: "#fff",
              color: "#0277bd",
              border: "none",
              borderRadius: 4,
              padding: "8px 20px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
            }}
            onClick={() => setShowRegister(true)}
          >
            Đăng ký
          </button>
          <button
            style={{
              background: "#e91e63", // Clinical accent
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "8px 20px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
            }}
            onClick={() => setShowLogin(true)}
          >
            Đăng nhập
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: 18 }}>
          <img
            src="/Logo.png"
            alt="Logo"
            style={{ 
              height: 100, 
              width: 100, 
              objectFit: "contain",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            }}
          />
        </div>
        <h1
          style={{
            color: "#fff",
            margin: 0,
            padding: "24px 0 16px 0",
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: 1,
            textShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          Chăm sóc sức khỏe giới tính
        </h1>
        <nav
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
            margin: "0 0 12px 0",
            background: "rgba(255,255,255,0.1)",
            padding: "8px 16px",
            borderRadius: "0 0 8px 8px"
          }}
        >
          <a href="#gioi-thieu" style={{ color: "#fff", fontWeight: 500 }}>Giới thiệu</a>
          <span style={{ color: "#fff" }}>|</span>
          <a href="#dich-vu" style={{ color: "#fff", fontWeight: 500 }}>Dịch vụ</a>
          <span style={{ color: "#fff" }}>|</span>
          <a href="#blog" style={{ color: "#fff", fontWeight: 500 }}>Blog</a>
        </nav>
      </header>      {showRegister && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,45,85,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <form
            onSubmit={handleRegisterSubmit}
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 32,
              minWidth: 350,
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}
          >
            <h2 style={{ color: "#0277bd", margin: 0, textAlign: "center", borderBottom: "2px solid #e0e0e0", paddingBottom: 12 }}>Đăng ký tài khoản</h2>
            <label>
              Họ và tên:
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #90caf9", marginTop: 4 }}
              />
            </label>
            <label>
              Tên đăng nhập:
              <input
                type="text"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #90caf9", marginTop: 4 }}
              />
            </label>
            <label>
              Giới tính:
              <select
                name="gender"
                value={registerData.gender}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #90caf9", marginTop: 4 }}
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </label>
            <label>
              Ngày sinh:
              <input
                type="date"
                name="dob"
                value={registerData.dob}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #90caf9", marginTop: 4 }}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #90caf9", marginTop: 4 }}
              />
            </label>
            <label>
              Số điện thoại:
              <input
                type="tel"
                name="phone"
                value={registerData.phone}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #90caf9", marginTop: 4 }}
              />
            </label>
            <label>
              Địa chỉ:
              <input
                type="text"
                name="address"
                value={registerData.address}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #90caf9", marginTop: 4 }}
              />
            </label>
            <label>
              Mật khẩu:
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #90caf9", marginTop: 4 }}
              />
            </label>
            <label>
              Xác nhận lại mật khẩu:
              <input
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #90caf9", marginTop: 4 }}
              />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                style={{
                  background: "#eceff1",
                  color: "#546e7a",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                style={{
                  background: "#0277bd",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Đăng ký
              </button>
            </div>
          </form>
        </div>
      )}      {showLogin && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,45,85,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <form
            onSubmit={handleLoginSubmit}
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 32,
              minWidth: 320,
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}
          >
            <h2 style={{ color: "#0277bd", margin: 0, textAlign: "center", borderBottom: "2px solid #e0e0e0", paddingBottom: 12 }}>Đăng nhập</h2>
            <label>
              Tài khoản (Email):
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #90caf9", marginTop: 4 }}
              />
            </label>
            <label>
              Mật khẩu:
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #90caf9", marginTop: 4 }}
              />
            </label>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <a href="#" style={{ color: "#0277bd", textDecoration: "none", fontSize: 14 }}>Quên mật khẩu?</a>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                style={{
                  background: "#eceff1",
                  color: "#546e7a",
                  border: "none",
                  borderRadius: 4,
                  padding: "10px 20px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                style={{
                  background: "#0277bd",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "10px 20px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Đăng nhập
              </button>
            </div>
          </form>
        </div>
      )}

      <main>        <section id="demo-chu-ky">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", marginBottom: 8 }}>
            <button
              onClick={() => setShowCalculator(v => !v)}
              style={{
                background: "#0277bd",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "8px 18px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              {showCalculator ? (
                <>
                  <span style={{ fontSize: 18 }}>−</span> Ẩn bảng tính chu kỳ
                </>
              ) : (
                <>
                  <span style={{ fontSize: 18 }}>+</span> Hiện bảng tính chu kỳ
                </>
              )}
            </button>
          </div>
          {showCalculator && (
            <div style={{
              background: "#f5f5f5",
              borderRadius: 8,
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
              padding: 24,
              marginTop: 18,
              border: "1px solid #e0e0e0"
            }}>
              <h3 style={{ color: "#0277bd", marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="#0277bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 2V6" stroke="#0277bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 2V6" stroke="#0277bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 10H21" stroke="#0277bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Công cụ tính chu kỳ kinh nguyệt
              </h3>
              <form onSubmit={handleCalculate} style={{
                marginBottom: 24,
                display: "flex",
                flexWrap: "wrap",
                gap: 18,
                alignItems: "center",
                background: "#fff",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Ngày bắt đầu:
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                    style={{
                      marginLeft: 4,
                      border: "1px solid #bbdefb",
                      borderRadius: 4,
                      padding: "6px 10px"
                    }}
                  />
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Chu kỳ (ngày):
                  <input
                    type="number"
                    min={20}
                    max={40}
                    value={cycleLength}
                    onChange={e => setCycleLength(Number(e.target.value))}
                    required
                    style={{
                      width: 60,
                      marginLeft: 4,
                      border: "1px solid #bbdefb",
                      borderRadius: 4,
                      padding: "6px 10px"
                    }}
                  />
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Số ngày kinh:
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={periodLength}
                    onChange={e => setPeriodLength(Number(e.target.value))}
                    required
                    style={{
                      width: 50,
                      marginLeft: 4,
                      border: "1px solid #bbdefb",
                      borderRadius: 4,
                      padding: "6px 10px"
                    }}
                  />
                </label>
                <button type="submit" style={{
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 8L15 12H18C18 15.3137 15.3137 18 12 18C10.3431 18 8.84311 17.3284 7.75732 16.2426" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 16L9 12H6C6 8.68629 8.68629 6 12 6C13.6569 6 15.1569 6.67157 16.2427 7.75736" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Tính toán
                </button>
              </form>              {tableData.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    marginBottom: 0,
                    fontSize: 16,
                    border: "1px solid #e0e0e0"
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          padding: 12,
                          background: "#0277bd",
                          color: "#fff",
                          border: "none",
                          borderTopLeftRadius: 8,
                          fontWeight: 500
                        }}>Ngày</th>
                        <th style={{
                          padding: 12,
                          background: "#0277bd",
                          color: "#fff",
                          border: "none",
                          fontWeight: 500
                        }}>Trạng thái</th>
                        <th style={{
                          padding: 12,
                          background: "#0277bd",
                          color: "#fff",
                          border: "none",
                          borderTopRightRadius: 8,
                          fontWeight: 500
                        }}>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, idx) => (
                        <tr key={idx} style={{
                          background: idx % 2 === 0 ? "#f5f5f5" : "#fff"
                        }}>
                          <td style={{
                            padding: 12,
                            textAlign: "center",
                            borderBottom: "1px solid #e0e0e0"
                          }}>{row.date}</td>
                          <td style={{
                            padding: 12,
                            textAlign: "center",
                            borderBottom: "1px solid #e0e0e0",
                            color: STATUS_COLOR[row.status] || "#0277bd",
                            fontWeight: 600
                          }}>
                            <span style={{ fontSize: 20, marginRight: 6 }}>{STATUS_ICON[row.status]}</span>
                            {row.status}
                          </td>
                          <td style={{
                            padding: 12,
                            textAlign: "center",
                            borderBottom: "1px solid #e0e0e0"
                          }}>{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>        <section id="gioi-thieu" style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: 24,
          margin: "32px 0",
          border: "1px solid #e0e0e0"
        }}>
          <h2 style={{ 
            color: "#0277bd", 
            marginTop: 0, 
            borderBottom: "2px solid #bbdefb",
            paddingBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0277bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V12" stroke="#0277bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="#0277bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Giới thiệu về chúng tôi
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 16, color: "#424242" }}>
            Trung Tâm Sức Khỏe Sinh Sản &amp; Giới Tính An Toàn là cơ sở y tế uy tín chuyên cung cấp các dịch vụ chăm sóc sức khỏe sinh sản, tư vấn giáo dục giới tính, và xét nghiệm các bệnh lây truyền qua đường tình dục (STIs). Với đội ngũ chuyên gia giàu kinh nghiệm, chúng tôi luôn đồng hành cùng bạn trong hành trình bảo vệ sức khỏe cá nhân và xây dựng lối sống tình dục an toàn, lành mạnh.
          </p>
          <ul style={{ fontSize: 16, color: "#424242", margin: 0, paddingLeft: 24, lineHeight: 1.8 }}>
            <li><span style={{ color: "#0277bd", fontWeight: 600 }}>✓</span> Đội ngũ tư vấn viên &amp; bác sĩ chuyên môn cao</li>
            <li><span style={{ color: "#0277bd", fontWeight: 600 }}>✓</span> Dịch vụ bảo mật – thông tin cá nhân được giữ kín tuyệt đối</li>
            <li><span style={{ color: "#0277bd", fontWeight: 600 }}>✓</span> Quy trình đặt lịch – xét nghiệm – trả kết quả nhanh chóng, minh bạch</li>
            <li><span style={{ color: "#0277bd", fontWeight: 600 }}>✓</span> Cam kết y tế – thiết bị hiện đại, kết quả chính xác, hỗ trợ chuyên sâu</li>
          </ul>
        </section>
        <section id="dich-vu" style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: 24,
          margin: "32px 0",
          border: "1px solid #e0e0e0"
        }}>
          <h2 style={{ 
            color: "#0277bd", 
            marginTop: 0, 
            borderBottom: "2px solid #bbdefb",
            paddingBottom: 10,
            display: "flex", 
            alignItems: "center", 
            gap: 8 
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#0277bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Dịch Vụ Y Tế
          </h2>
          <ol style={{ fontSize: 16, color: "#424242", margin: 0, paddingLeft: 24, lineHeight: 1.6 }}>
            <li style={{ marginBottom: 16 }}>
              <h3 style={{ color: "#0277bd", margin: "10px 0", fontSize: 18 }}>Theo dõi chu kỳ sinh sản</h3>
              <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 20 }}>
                <li>Khai báo chu kỳ kinh nguyệt dễ dàng</li>
                <li>Nhắc nhở thời điểm rụng trứng, khả năng mang thai cao/thấp</li>
                <li>Nhắc uống thuốc tránh thai đúng giờ</li>
                <li>Phân tích biểu đồ sức khỏe sinh sản</li>
              </ul>
            </li>
            <li style={{ marginBottom: 16 }}>
              <h3 style={{ color: "#0277bd", margin: "10px 0", fontSize: 18 }}>Tư vấn giới tính &amp; sức khỏe sinh sản</h3>
              <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 20 }}>
                <li>Đặt lịch tư vấn trực tuyến với chuyên gia</li>
                <li>Được tư vấn riêng tư, bảo mật</li>
                <li>Gửi câu hỏi, thắc mắc về giới tính, tâm sinh lý, mối quan hệ,...</li>
              </ul>
            </li>
            <li style={{ marginBottom: 16 }}>
              <h3 style={{ color: "#0277bd", margin: "10px 0", fontSize: 18 }}>Xét nghiệm các bệnh STIs</h3>
              <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 20 }}>
                <li>Danh sách dịch vụ xét nghiệm đa dạng: HIV, HPV, Lậu, Giang mai, Chlamydia,...</li>
                <li>Đặt lịch và theo dõi quá trình xét nghiệm</li>
                <li>Trả kết quả online an toàn và nhanh chóng</li>
                <li>Hỗ trợ sau xét nghiệm và hướng điều trị</li>
              </ul>
            </li>
            <li>
              <h3 style={{ color: "#0277bd", margin: "10px 0", fontSize: 18 }}>Thông tin dịch vụ minh bạch</h3>
              <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 20 }}>
                <li>Bảng giá xét nghiệm minh bạch, cập nhật liên tục</li>
                <li>Gói dịch vụ phù hợp cho từng đối tượng (nam, nữ, cặp đôi,...)</li>
              </ul>
            </li>
          </ol>
        </section>
        <section id="blog" style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: 24,
          margin: "32px 0",
          border: "1px solid #e0e0e0"
        }}>
          <h2 style={{ 
            color: "#0277bd", 
            marginTop: 0, 
            borderBottom: "2px solid #bbdefb",
            paddingBottom: 10,
            display: "flex", 
            alignItems: "center", 
            gap: 8 
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="#0277bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="#0277bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Chuyên mục Y tế: Kiến Thức Sức Khỏe Giới Tính
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 16, color: "#424242" }}>
            Chúng tôi chia sẻ những bài viết thiết thực, cập nhật, khoa học về:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <div style={{ 
              flex: "1 1 300px", 
              background: "#f5f5f5", 
              padding: 16, 
              borderRadius: 8,
              borderLeft: "4px solid #0277bd"
            }}>
              <h4 style={{ color: "#0277bd", marginTop: 0 }}>Giáo dục giới tính</h4>
              <p style={{ margin: 0, fontSize: 14, color: "#616161" }}>
                Thông tin an toàn cho mọi lứa tuổi và hướng dẫn trò chuyện về sức khỏe tình dục
              </p>
            </div>
            <div style={{ 
              flex: "1 1 300px", 
              background: "#f5f5f5", 
              padding: 16, 
              borderRadius: 8,
              borderLeft: "4px solid #0277bd"
            }}>
              <h4 style={{ color: "#0277bd", marginTop: 0 }}>Sức khỏe sinh sản</h4>
              <p style={{ margin: 0, fontSize: 14, color: "#616161" }}>
                Kiến thức cần thiết dành cho cả nam giới và nữ giới ở các giai đoạn khác nhau
              </p>
            </div>
            <div style={{ 
              flex: "1 1 300px", 
              background: "#f5f5f5", 
              padding: 16, 
              borderRadius: 8,
              borderLeft: "4px solid #0277bd"
            }}>
              <h4 style={{ color: "#0277bd", marginTop: 0 }}>Phòng ngừa STIs</h4>
              <p style={{ margin: 0, fontSize: 14, color: "#616161" }}>
                Các phương pháp nhận biết, phòng tránh và điều trị các bệnh lây truyền qua đường tình dục
              </p>
            </div>
          </div>
        </section>      </main>
      <footer style={{ 
        background: "#0277bd", 
        color: "#fff", 
        padding: "20px 0",
        marginTop: 40,
        textAlign: "center" 
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20, gap: 20 }}>
            <div style={{ flex: "1 1 300px", textAlign: "left" }}>
              <h3 style={{ marginTop: 0, borderBottom: "1px solid #64b5f6", paddingBottom: 8 }}>Liên hệ</h3>
              <p style={{ margin: "8px 0", fontSize: 14 }}>Điện thoại: 1800-xxxx-xxx</p>
              <p style={{ margin: "8px 0", fontSize: 14 }}>Email: info@healthcare.vn</p>
              <p style={{ margin: "8px 0", fontSize: 14 }}>Địa chỉ: 123 Đường Y tế, Quận 1, TP. HCM</p>
            </div>
            <div style={{ flex: "1 1 300px", textAlign: "left" }}>
              <h3 style={{ marginTop: 0, borderBottom: "1px solid #64b5f6", paddingBottom: 8 }}>Giờ làm việc</h3>
              <p style={{ margin: "8px 0", fontSize: 14 }}>Thứ Hai - Thứ Sáu: 8:00 - 17:00</p>
              <p style={{ margin: "8px 0", fontSize: 14 }}>Thứ Bảy: 8:00 - 12:00</p>
              <p style={{ margin: "8px 0", fontSize: 14 }}>Chủ Nhật: Nghỉ</p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #64b5f6", paddingTop: 15, fontSize: 14 }}>
            &copy; {new Date().getFullYear()} Trung tâm Y tế Sức khỏe Giới tính - Bộ Y tế Việt Nam
            <div style={{ marginTop: 8, fontSize: 12, color: "#e1f5fe" }}>
              Tất cả thông tin trên trang web này chỉ dành cho mục đích giáo dục và không thay thế cho tư vấn y tế chuyên nghiệp
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;