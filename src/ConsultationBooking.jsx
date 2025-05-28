import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ConsultationBooking = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    consultantId: '',
    symptoms: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const consultants = [
    { id: 1, name: "BS. Nguyễn Thị Minh", specialty: "Sức khỏe phụ nữ", avatar: "👩‍⚕️" },
    { id: 2, name: "BS. Trần Văn Hải", specialty: "Sản phụ khoa", avatar: "👨‍⚕️" },
    { id: 3, name: "BS. Lê Thị Hương", specialty: "Nội tiết", avatar: "👩‍⚕️" },
    { id: 4, name: "BS. Phạm Minh Tuấn", specialty: "Dinh dưỡng", avatar: "👨‍⚕️" }
  ];

  const availableTimes = [
    "08:00", "09:00", "10:00", "11:00", 
    "13:30", "14:30", "15:30", "16:30"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Booking data:", formData);
    // Đây là nơi bạn sẽ gửi dữ liệu đến API
    setIsSubmitted(true);
  };  return (
    <div style={{
      backgroundColor: "#f0f9ff !important",
      background: "#f0f9ff !important",
      colorScheme: "light",
      minHeight: "100vh",
      width: "100vw",
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 0,
        position: "relative"
      }}>        <div style={{
          position: "absolute",
          top: 20,
          right: 25,
          display: "flex",
          gap: 10,
          zIndex: 2
        }}>
          <Link 
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
          👩‍⚕️ Đặt lịch tư vấn
        </h1>
      </header>

      <main style={{
        padding: "40px 20px",
        minHeight: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#f0f9ff !important",
        backgroundColor: "#f0f9ff !important",
        colorScheme: "light"
      }}>        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(8, 145, 178, 0.1)",
          padding: "40px",
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          border: "1px solid rgba(8, 145, 178, 0.1)"
        }}>
          {/* Back to Services Link */}
          <div style={{ marginBottom: "20px" }}>
            <Link 
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
          {isSubmitted ? (
            <div style={{
              textAlign: "center",
              color: "#43a047",
              padding: "40px"
            }}>
              <div style={{
                background: "rgba(232, 245, 233, 0.9)",
                borderRadius: "16px",
                padding: "30px",
                border: "2px solid rgba(67, 160, 71, 0.2)",
                boxShadow: "0 8px 16px rgba(67, 160, 71, 0.1)"
              }}>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>✅</div>
                <h2 style={{ 
                  fontSize: "28px", 
                  fontWeight: "600", 
                  marginBottom: "15px",
                  color: "#43a047"
                }}>
                  Đặt lịch thành công!
                </h2>
                <p style={{ 
                  fontSize: "16px", 
                  color: "#666", 
                  marginBottom: "20px",
                  lineHeight: "1.6"
                }}>
                  Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận lịch hẹn.
                  <br />
                  Vui lòng kiểm tra điện thoại và email thường xuyên.
                </p>
                <Link
                  to="/services"
                  style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "12px 30px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    transition: "all 0.3s ease"
                  }}
                >
                  🏠 Về trang dịch vụ
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div style={{
                textAlign: "center",
                marginBottom: "30px"
              }}>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#0891b2",
                  marginBottom: "10px"
                }}>
                  📋 Thông tin đặt lịch tư vấn
                </h2>
                <p style={{
                  fontSize: "16px",
                  color: "#666",
                  margin: 0
                }}>
                  Vui lòng điền đầy đủ thông tin để chúng tôi phục vụ bạn tốt nhất
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                  marginBottom: "25px"
                }}>
                  <div>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "#0891b2",
                      fontSize: "15px"
                    }}>
                      👤 Họ và tên:
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
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
                      value={formData.phone}
                      onChange={handleChange}
                      required
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

                  <div>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "#0891b2",
                      fontSize: "15px"
                    }}>
                      📅 Ngày tư vấn:
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
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

                  <div>
                    <label style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: "#0891b2",
                      fontSize: "15px"
                    }}>
                      ⏰ Giờ tư vấn:
                    </label>
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
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
                    >
                      <option value="">-- Chọn giờ --</option>
                      {availableTimes.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "25px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "#0891b2",
                    fontSize: "15px"
                  }}>
                    👩‍⚕️ Chọn tư vấn viên:
                  </label>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "15px"
                  }}>
                    {consultants.map(consultant => (
                      <div
                        key={consultant.id}
                        onClick={() => setFormData(prev => ({ ...prev, consultantId: consultant.id }))}
                        style={{
                          background: formData.consultantId === consultant.id 
                            ? "rgba(8, 145, 178, 0.1)" 
                            : "rgba(255, 255, 255, 0.8)",
                          border: formData.consultantId === consultant.id 
                            ? "2px solid #0891b2" 
                            : "2px solid rgba(8, 145, 178, 0.1)",
                          borderRadius: "12px",
                          padding: "15px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                      >
                        <div style={{ fontSize: "24px", marginBottom: "8px" }}>{consultant.avatar}</div>
                        <h4 style={{ 
                          margin: "0 0 5px 0", 
                          color: "#0891b2",
                          fontSize: "14px",
                          fontWeight: "600"
                        }}>
                          {consultant.name}
                        </h4>
                        <p style={{ 
                          margin: 0, 
                          color: "#666", 
                          fontSize: "12px"
                        }}>
                          {consultant.specialty}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "30px" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "#0891b2",
                    fontSize: "15px"
                  }}>
                    📝 Triệu chứng/Mô tả vấn đề:
                  </label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    placeholder="Mô tả chi tiết triệu chứng hoặc vấn đề bạn muốn tư vấn..."
                    rows="4"
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
                      resize: "vertical",
                      fontFamily: "inherit"
                    }}
                    onFocus={(e) => e.target.style.border = "2px solid #0891b2"}
                    onBlur={(e) => e.target.style.border = "2px solid rgba(8, 145, 178, 0.1)"}
                  />
                </div>

                <div style={{ textAlign: "center" }}>
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "16px 40px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "16px",
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
                    📅 Đặt lịch tư vấn
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      <footer style={{ 
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

export default ConsultationBooking;
