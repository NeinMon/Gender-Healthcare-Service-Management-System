import React from "react";

const Services = () => {
  return (
    <div style={{ maxWidth: "100%", overflowX: "hidden", width: "100vw" }}>
      <header style={{
        background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
        paddingBottom: 0,
        position: "relative",
        width: "100%"
      }}>
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
          Dịch Vụ Chăm Sóc Sức Khỏe Giới Tính
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
          <a href="#theo-doi-chu-ky" style={{ color: "#fff", fontWeight: 500 }}>Theo dõi chu kỳ</a>
          <span style={{ color: "#fff" }}>|</span>
          <a href="#tu-van" style={{ color: "#fff", fontWeight: 500 }}>Tư vấn</a>
          <span style={{ color: "#fff" }}>|</span>
          <a href="#xet-nghiem" style={{ color: "#fff", fontWeight: 500 }}>Xét nghiệm</a>
          <span style={{ color: "#fff" }}>|</span>
          <a href="#thong-tin" style={{ color: "#fff", fontWeight: 500 }}>Thông tin</a>
          <span style={{ color: "#fff" }}>|</span>
          <a href="/" style={{ color: "#fff", fontWeight: 500 }}>Đăng xuất</a>
        </nav>      </header>

      <main style={{ padding: "0 16px", maxWidth: "100%" }}>
        <section id="theo-doi-chu-ky" style={{
          background: "#e6fff4",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 24,
          margin: "32px 0",
          width: "100%"
        }}>
          <h2 style={{ color: "#11998e", marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span role="img" aria-label="calendar">📅</span> Theo Dõi Chu Kỳ Sinh Sản
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ 
              background: "#f4fff8", 
              padding: 16, 
              borderRadius: 8, 
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)" 
            }}>
              <h3 style={{ color: "#11998e", marginTop: 0 }}>Khai báo chu kỳ kinh nguyệt</h3>
              <form style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#11998e", fontWeight: 500 }}>Ngày bắt đầu:</label>
                  <input 
                    type="date" 
                    style={{ 
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid #11998e"
                    }} 
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#11998e", fontWeight: 500 }}>Cường độ:</label>
                  <select style={{ 
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #11998e",
                    minWidth: 120
                  }}>
                    <option value="light">Nhẹ</option>
                    <option value="medium">Trung bình</option>
                    <option value="heavy">Nặng</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#11998e", fontWeight: 500 }}>Triệu chứng:</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="checkbox" />
                      Đau bụng
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="checkbox" />
                      Đau đầu
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="checkbox" />
                      Mệt mỏi
                    </label>
                  </div>
                </div>
                <button style={{
                  background: "#11998e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}>
                  Lưu
                </button>
              </form>
            </div>
            
            <div style={{ 
              background: "#f4fff8", 
              padding: 16, 
              borderRadius: 8,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)" 
            }}>
              <h3 style={{ color: "#11998e", marginTop: 0 }}>Nhắc nhở</h3>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ 
                  flex: 1, 
                  minWidth: 200, 
                  background: "#e0f2f1", 
                  padding: 16, 
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8 
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span role="img" aria-label="alert" style={{ fontSize: 24 }}>🔔</span>
                    <h4 style={{ margin: 0, color: "#11998e" }}>Rụng trứng</h4>
                  </div>
                  <p style={{ margin: 0 }}>Dự kiến: <strong>28/05/2025</strong></p>
                  <p style={{ margin: 0 }}>Khả năng mang thai cao trong 3 ngày tới</p>
                </div>
                
                <div style={{ 
                  flex: 1, 
                  minWidth: 200, 
                  background: "#e0f2f1", 
                  padding: 16, 
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span role="img" aria-label="calendar" style={{ fontSize: 24 }}>📅</span>
                    <h4 style={{ margin: 0, color: "#11998e" }}>Kinh nguyệt tiếp theo</h4>
                  </div>
                  <p style={{ margin: 0 }}>Dự kiến: <strong>12/06/2025</strong></p>
                  <p style={{ margin: 0 }}>Chuẩn bị băng vệ sinh và thuốc giảm đau</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tu-van" style={{
          background: "#e6fff4",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 24,
          margin: "32px 0"
        }}>
          <h2 style={{ color: "#11998e", marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span role="img" aria-label="chat">💬</span> Tư Vấn Giới Tính & Sức Khỏe Sinh Sản
          </h2>
          <div style={{ 
            background: "#f4fff8", 
            padding: 16, 
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            marginBottom: 20
          }}>
            <h3 style={{ color: "#11998e", marginTop: 0 }}>Đặt lịch tư vấn trực tuyến</h3>
            <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <label style={{ display: "block", marginBottom: 4, color: "#11998e", fontWeight: 500 }}>
                    Chọn chuyên gia:
                  </label>
                  <select style={{ 
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #11998e"
                  }}>
                    <option value="">-- Chọn chuyên gia --</option>
                    <option value="bs-nguyen">BS. Nguyễn Thị An - Sản phụ khoa</option>
                    <option value="bs-tran">BS. Trần Văn Bình - Nam khoa</option>
                    <option value="bs-le">BS. Lê Minh Chi - Tâm lý giới tính</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <label style={{ display: "block", marginBottom: 4, color: "#11998e", fontWeight: 500 }}>
                    Ngày hẹn:
                  </label>
                  <input 
                    type="date" 
                    style={{ 
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid #11998e"
                    }} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <label style={{ display: "block", marginBottom: 4, color: "#11998e", fontWeight: 500 }}>
                    Giờ hẹn:
                  </label>
                  <select style={{ 
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #11998e"
                  }}>
                    <option value="">-- Chọn giờ --</option>
                    <option value="8">08:00 - 09:00</option>
                    <option value="9">09:00 - 10:00</option>
                    <option value="10">10:00 - 11:00</option>
                    <option value="14">14:00 - 15:00</option>
                    <option value="15">15:00 - 16:00</option>
                    <option value="16">16:00 - 17:00</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, color: "#11998e", fontWeight: 500 }}>
                  Vấn đề cần tư vấn:
                </label>
                <textarea 
                  rows="4" 
                  style={{ 
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #11998e",
                    resize: "vertical"
                  }}
                  placeholder="Mô tả vấn đề của bạn..."
                ></textarea>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={{
                  background: "#11998e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}>
                  Đặt lịch
                </button>
              </div>
            </form>
          </div>
          
          <div style={{ 
            background: "#f4fff8", 
            padding: 16, 
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)" 
          }}>
            <h3 style={{ color: "#11998e", marginTop: 0 }}>Lịch sử tư vấn</h3>
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
                    }}>Chuyên gia</th>
                    <th style={{
                      padding: 12,
                      background: "#b2dfdb",
                      color: "#11998e",
                      border: "none"
                    }}>Vấn đề</th>
                    <th style={{
                      padding: 12,
                      background: "#b2dfdb",
                      color: "#11998e",
                      border: "none",
                      borderTopRightRadius: 12
                    }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{
                      padding: 12,
                      textAlign: "center",
                      borderBottom: "1px solid #b2dfdb"
                    }}>10/05/2025</td>
                    <td style={{
                      padding: 12,
                      textAlign: "center",
                      borderBottom: "1px solid #b2dfdb"
                    }}>BS. Trần Văn Bình</td>
                    <td style={{
                      padding: 12,
                      textAlign: "left",
                      borderBottom: "1px solid #b2dfdb"
                    }}>Tư vấn về biện pháp tránh thai</td>
                    <td style={{
                      padding: 12,
                      textAlign: "center",
                      borderBottom: "1px solid #b2dfdb"
                    }}>
                      <button style={{
                        background: "#11998e",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "4px 12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: 14
                      }}>Xem chi tiết</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="xet-nghiem" style={{
          background: "#e6fff4",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 24,
          margin: "32px 0"
        }}>
          <h2 style={{ color: "#11998e", marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span role="img" aria-label="test">🧪</span> Xét Nghiệm Các Bệnh STIs
          </h2>
          <div style={{ 
            background: "#f4fff8", 
            padding: 16, 
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            marginBottom: 20
          }}>
            <h3 style={{ color: "#11998e", marginTop: 0 }}>Đặt lịch xét nghiệm</h3>
            <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <label style={{ display: "block", marginBottom: 4, color: "#11998e", fontWeight: 500 }}>
                    Chọn gói xét nghiệm:
                  </label>
                  <select style={{ 
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #11998e"
                  }}>
                    <option value="">-- Chọn gói xét nghiệm --</option>
                    <option value="basic">Gói cơ bản (HIV, Viêm gan B)</option>
                    <option value="medium">Gói trung cấp (HIV, Viêm gan B, C, Giang mai)</option>
                    <option value="full">Gói đầy đủ (7 bệnh STIs phổ biến)</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <label style={{ display: "block", marginBottom: 4, color: "#11998e", fontWeight: 500 }}>
                    Ngày xét nghiệm:
                  </label>
                  <input 
                    type="date" 
                    style={{ 
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid #11998e"
                    }} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <label style={{ display: "block", marginBottom: 4, color: "#11998e", fontWeight: 500 }}>
                    Giờ hẹn:
                  </label>
                  <select style={{ 
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #11998e"
                  }}>
                    <option value="">-- Chọn giờ --</option>
                    <option value="8">08:00 - 09:00</option>
                    <option value="9">09:00 - 10:00</option>
                    <option value="10">10:00 - 11:00</option>
                    <option value="14">14:00 - 15:00</option>
                    <option value="15">15:00 - 16:00</option>
                    <option value="16">16:00 - 17:00</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={{
                  background: "#11998e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}>
                  Đặt lịch
                </button>
              </div>
            </form>
          </div>
          
          <div style={{ 
            background: "#f4fff8", 
            padding: 16, 
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)" 
          }}>
            <h3 style={{ color: "#11998e", marginTop: 0 }}>Kết quả xét nghiệm</h3>
            <p>Bạn chưa có kết quả xét nghiệm nào.</p>
          </div>
        </section>

        <section id="thong-tin" style={{
          background: "#e6fff4",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 24,
          margin: "32px 0"
        }}>
          <h2 style={{ color: "#11998e", marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span role="img" aria-label="info">ℹ️</span> Thông Tin Dịch Vụ
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <div style={{ 
              flex: 1, 
              minWidth: 300, 
              background: "#f4fff8", 
              padding: 16, 
              borderRadius: 8,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)" 
            }}>
              <h3 style={{ color: "#11998e", marginTop: 0 }}>Bảng giá dịch vụ</h3>
              <ul style={{ paddingLeft: 20 }}>
                <li>Gói xét nghiệm cơ bản: 500.000 VNĐ</li>
                <li>Gói xét nghiệm trung cấp: 1.200.000 VNĐ</li>
                <li>Gói xét nghiệm đầy đủ: 2.500.000 VNĐ</li>
                <li>Tư vấn trực tuyến: 300.000 VNĐ/giờ</li>
                <li>Tư vấn trực tiếp: 500.000 VNĐ/giờ</li>
              </ul>
            </div>
            
            <div style={{ 
              flex: 1, 
              minWidth: 300, 
              background: "#f4fff8", 
              padding: 16, 
              borderRadius: 8,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)" 
            }}>
              <h3 style={{ color: "#11998e", marginTop: 0 }}>Liên hệ & Địa chỉ</h3>
              <ul style={{ paddingLeft: 20 }}>
                <li><strong>Hotline:</strong> 1900 1234</li>
                <li><strong>Email:</strong> info@suckhoegioitinh.vn</li>
                <li><strong>Địa chỉ:</strong> 123 Đường ABC, Quận 1, TP. HCM</li>
                <li><strong>Giờ làm việc:</strong> 8:00 - 17:00 (Thứ 2 - Thứ 7)</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: "#e6fff4", color: "#11998e", padding: 16, textAlign: "center" }}>
        &copy; {new Date().getFullYear()} Sức khỏe giới tính - Một sản phẩm của cơ sở y tế Việt Nam
      </footer>
    </div>
  );
};

export default Services;
