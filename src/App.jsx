import React, { useState } from "react";

const STATUS_COLOR = {
  "Bắt đầu kinh nguyệt": "#43a047",
  "Kết thúc kinh nguyệt": "#1de9b6",
  "Rụng trứng": "#fbc02d",
  "Dự kiến kinh nguyệt tiếp theo": "#1976d2"
};

const STATUS_ICON = {
  "Bắt đầu kinh nguyệt": "🩸",
  "Kết thúc kinh nguyệt": "✅",
  "Rụng trứng": "🌼",
  "Dự kiến kinh nguyệt tiếp theo": "🔔"
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
    <div>
      <header style={{
        background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
        paddingBottom: 0,
        position: "relative"
      }}>
        <div style={{
          position: "absolute",
          top: 170, // tăng top để xuống dưới
          right: 25, // sang phải
          display: "flex",
          gap: 10,
          zIndex: 2
        }}>
          <button
            style={{
              background: "#fff",
              color: "#11998e",
              border: "none",
              borderRadius: 6,
              padding: "8px 20px",
              fontWeight: 600,
              cursor: "pointer"
            }}
            onClick={() => window.location.href = "/register"}
          >
            Đăng ký
          </button>
          <button
            style={{
              background: "#11998e",
              color: "#fff",
              border: "2px solid #fff",
              borderRadius: 6,
              padding: "8px 20px",
              fontWeight: 600,
              cursor: "pointer"
            }}
            onClick={() => window.location.href = "/login"}
          >
            Đăng nhập
          </button>
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
          Chăm sóc sức khỏe giới tính
        </h1>
        <nav
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
            margin: "0 0 8px 0"
          }}
        >
          <a href="#gioi-thieu" style={{ color: "#fff", fontWeight: 500 }}>Giới thiệu</a>
          <span style={{ color: "#fff" }}>|</span>
          <a href="#dich-vu" style={{ color: "#fff", fontWeight: 500 }}>Dịch vụ</a>
          <span style={{ color: "#fff" }}>|</span>
          <a href="#blog" style={{ color: "#fff", fontWeight: 500 }}>Blog</a>
        </nav>
      </header>

      {showRegister && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <form
            onSubmit={handleRegisterSubmit}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 320,
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}
          >
            <h2 style={{ color: "#11998e", margin: 0, textAlign: "center" }}>Đăng ký tài khoản</h2>
            <label>
              Họ và tên:
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #11998e", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #11998e", marginTop: 4 }}
              />
            </label>
            <label>
              Giới tính:
              <select
                name="gender"
                value={registerData.gender}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #11998e", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #11998e", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #11998e", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #11998e", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #11998e", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #11998e", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #11998e", marginTop: 4 }}
              />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                style={{
                  background: "#b2dfdb",
                  color: "#11998e",
                  border: "none",
                  borderRadius: 6,
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
                  background: "#11998e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
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
      )}

      {showLogin && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <form
            onSubmit={handleLoginSubmit}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 320,
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}
          >
            <h2 style={{ color: "#11998e", margin: 0, textAlign: "center" }}>Đăng nhập</h2>
            <label>
              Tài khoản (Email):
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #11998e", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #11998e", marginTop: 4 }}
              />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                style={{
                  background: "#b2dfdb",
                  color: "#11998e",
                  border: "none",
                  borderRadius: 6,
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
                  background: "#11998e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
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

      <main>
        <section id="demo-chu-ky">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", marginBottom: 8 }}>
            <button
              onClick={() => setShowCalculator(v => !v)}
              style={{
                background: "#11998e",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {showCalculator ? "Ẩn bảng tính chu kỳ" : "Hiện bảng tính chu kỳ"}
            </button>
          </div>
          {showCalculator && (
            <div style={{
              background: "#f4fff8",
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(17,153,142,0.07)",
              padding: 24,
              marginTop: 18
            }}>
              <form onSubmit={handleCalculate} style={{
                marginBottom: 24,
                display: "flex",
                flexWrap: "wrap",
                gap: 18,
                alignItems: "center"
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
                      border: "1px solid #11998e",
                      borderRadius: 6,
                      padding: "4px 8px"
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
                      width: 50,
                      marginLeft: 4,
                      border: "1px solid #11998e",
                      borderRadius: 6,
                      padding: "4px 8px"
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
                      width: 40,
                      marginLeft: 4,
                      border: "1px solid #11998e",
                      borderRadius: 6,
                      padding: "4px 8px"
                    }}
                  />
                </label>
                <button type="submit" style={{
                  background: "#11998e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}>
                  Tính toán
                </button>
              </form>
              {tableData.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    background: "#e0f2f1",
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(17,153,142,0.06)",
                    marginBottom: 0,
                    fontSize: 16
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          padding: 12,
                          background: "#b2dfdb",
                          color: "#11998e",
                          border: "none",
                          borderTopLeftRadius: 12
                        }}>Ngày</th>
                        <th style={{
                          padding: 12,
                          background: "#b2dfdb",
                          color: "#11998e",
                          border: "none"
                        }}>Trạng thái</th>
                        <th style={{
                          padding: 12,
                          background: "#b2dfdb",
                          color: "#11998e",
                          border: "none",
                          borderTopRightRadius: 12
                        }}>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, idx) => (
                        <tr key={idx} style={{
                          background: idx % 2 === 0 ? "#e0f2f1" : "#f4fff8"
                        }}>
                          <td style={{
                            padding: 12,
                            textAlign: "center",
                            borderBottom: "1px solid #b2dfdb"
                          }}>{row.date}</td>
                          <td style={{
                            padding: 12,
                            textAlign: "center",
                            borderBottom: "1px solid #b2dfdb",
                            color: STATUS_COLOR[row.status] || "#11998e",
                            fontWeight: 600
                          }}>
                            <span style={{ fontSize: 20, marginRight: 6 }}>{STATUS_ICON[row.status]}</span>
                            {row.status}
                          </td>
                          <td style={{
                            padding: 12,
                            textAlign: "center",
                            borderBottom: "1px solid #b2dfdb"
                          }}>{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
        <section id="gioi-thieu" style={{
          background: "#e6fff4",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 24,
          margin: "32px 0"
        }}>
          <h2 style={{ color: "#11998e", marginTop: 0 }}>Giới thiệu về chúng tôi</h2>
          <p style={{ fontSize: 17, marginBottom: 16 }}>
            Trung Tâm Sức Khỏe Sinh Sản &amp; Giới Tính An Toàn là cơ sở y tế uy tín chuyên cung cấp các dịch vụ chăm sóc sức khỏe sinh sản, tư vấn giáo dục giới tính, và xét nghiệm các bệnh lây truyền qua đường tình dục (STIs). Với đội ngũ chuyên gia giàu kinh nghiệm, chúng tôi luôn đồng hành cùng bạn trong hành trình bảo vệ sức khỏe cá nhân và xây dựng lối sống tình dục an toàn, lành mạnh.
          </p>
          <ul style={{ fontSize: 16, color: "#11998e", margin: 0, paddingLeft: 24 }}>
            <li>🔸 Đội ngũ tư vấn viên &amp; bác sĩ chuyên môn cao</li>
            <li>🔸 Dịch vụ bảo mật – thông tin cá nhân được giữ kín tuyệt đối</li>
            <li>🔸 Quy trình đặt lịch – xét nghiệm – trả kết quả nhanh chóng, minh bạch</li>
            <li>🔸 Cam kết y tế – thiết bị hiện đại, kết quả chính xác, hỗ trợ chuyên sâu</li>
          </ul>
        </section>
        <section id="dich-vu" style={{
          background: "#e6fff4",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 24,
          margin: "32px 0"
        }}>
          <h2 style={{ color: "#11998e", marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span role="img" aria-label="stethoscope">🩺</span> Dịch Vụ Cung Cấp
          </h2>
          <ol style={{ fontSize: 16, color: "#11998e", margin: 0, paddingLeft: 24 }}>
            <li style={{ marginBottom: 14 }}>
              <b>Theo dõi chu kỳ sinh sản</b>
              <ul style={{ marginTop: 6, marginBottom: 0 }}>
                <li>Khai báo chu kỳ kinh nguyệt dễ dàng</li>
                <li>Nhắc nhở thời điểm rụng trứng, khả năng mang thai cao/thấp</li>
                <li>Nhắc uống thuốc tránh thai đúng giờ</li>
                <li>Phân tích biểu đồ sức khỏe sinh sản</li>
              </ul>
            </li>
            <li style={{ marginBottom: 14 }}>
              <b>Tư vấn giới tính &amp; sức khỏe sinh sản</b>
              <ul style={{ marginTop: 6, marginBottom: 0 }}>
                <li>Đặt lịch tư vấn trực tuyến với chuyên gia</li>
                <li>Được tư vấn riêng tư, bảo mật</li>
                <li>Gửi câu hỏi, thắc mắc về giới tính, tâm sinh lý, mối quan hệ,...</li>
              </ul>
            </li>
            <li style={{ marginBottom: 14 }}>
              <b>Xét nghiệm các bệnh STIs</b>
              <ul style={{ marginTop: 6, marginBottom: 0 }}>
                <li>Danh sách dịch vụ xét nghiệm đa dạng: HIV, HPV, Lậu, Giang mai, Chlamydia,...</li>
                <li>Đặt lịch và theo dõi quá trình xét nghiệm</li>
                <li>Trả kết quả online an toàn và nhanh chóng</li>
                <li>Hỗ trợ sau xét nghiệm và hướng điều trị</li>
              </ul>
            </li>
            <li>
              <b>Thông tin dịch vụ rõ ràng</b>
              <ul style={{ marginTop: 6, marginBottom: 0 }}>
                <li>Bảng giá xét nghiệm minh bạch, cập nhật liên tục</li>
                <li>Gói dịch vụ phù hợp cho từng đối tượng (nam, nữ, cặp đôi,...)</li>
              </ul>
            </li>
          </ol>
        </section>
        <section id="blog" style={{
          background: "#e6fff4",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 24,
          margin: "32px 0"
        }}>
          <h2 style={{ color: "#11998e", marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span role="img" aria-label="book">📚</span> Chuyên mục Blog: Kiến Thức Sức Khỏe Giới Tính
          </h2>
          <p style={{ fontSize: 17, marginBottom: 16 }}>
            Chúng tôi chia sẻ những bài viết thiết thực, cập nhật, khoa học về:
          </p>
          <ul style={{ fontSize: 16, color: "#11998e", margin: 0, paddingLeft: 24 }}>
            <li>Giáo dục giới tính an toàn cho mọi lứa tuổi</li>
            <li>Sức khỏe sinh sản: điều cần biết cho nữ giới &amp; nam giới</li>
            <li>Cách phòng tránh và nhận biết bệnh lây truyền qua đường tình dục (STIs)</li>
            <li>Hiểu rõ chu kỳ kinh nguyệt và dấu hiệu rụng trứng</li>
            <li>Tư vấn tâm lý, tình dục học, quan hệ lành mạnh</li>
          </ul>
        </section>
      </main>
      <footer style={{ background: "#e6fff4", color: "#11998e" }}>
        &copy; {new Date().getFullYear()} Sức khỏe giới tính - Một sản phẩm của cơ sở y tế Việt Nam
      </footer>
    </div>
  );
};

export default App;