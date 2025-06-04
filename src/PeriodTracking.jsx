import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const PeriodTracking = () => {
  const [formData, setFormData] = useState({
    startDate: '',
    cycleLength: 28,
    periodLength: 5
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };  const calculateCycle = () => {
    if (!formData.startDate) {
      alert("Vui lòng chọn ngày bắt đầu kinh nguyệt gần nhất!");
      return;
    }

    const start = new Date(formData.startDate);
    const periodEnd = new Date(start);
    periodEnd.setDate(start.getDate() + parseInt(formData.periodLength) - 1);

    const ovulationDay = new Date(start);
    ovulationDay.setDate(start.getDate() + parseInt(formData.cycleLength) - 14);

    const fertileStart = new Date(ovulationDay);
    fertileStart.setDate(ovulationDay.getDate() - 5);

    const fertileEnd = new Date(ovulationDay);
    fertileEnd.setDate(ovulationDay.getDate() + 1);

    const nextPeriod = new Date(start);
    nextPeriod.setDate(start.getDate() + parseInt(formData.cycleLength));

    const calculationResults = {
      periodStart: start.toLocaleDateString('vi-VN'),
      periodEnd: periodEnd.toLocaleDateString('vi-VN'),
      ovulationStart: new Date(ovulationDay.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
      ovulationEnd: new Date(ovulationDay.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
      fertilityStart: fertileStart.toLocaleDateString('vi-VN'),
      fertilityEnd: fertileEnd.toLocaleDateString('vi-VN'),
      nextCycleStart: nextPeriod.toLocaleDateString('vi-VN'),
      cycleLength: formData.cycleLength,
      periodLength: formData.periodLength
    };

    setResults(calculationResults);
    setIsSubmitted(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateCycle();
  };  return (
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
          Theo dõi chu kỳ kinh nguyệt
        </h1>
      </header>

      {/* Main Content */}
      <main style={{
        padding: "40px",
        width: "100%",
        flex: 1,
        backgroundColor: "#fff",
        boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
        marginTop: "-20px",
        boxSizing: "border-box"
      }}>
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

        {!isSubmitted ? (
          <>
            <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "30px", width: "100%" }}>
              Tính toán chu kỳ kinh nguyệt
            </h2>
            
            <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "1600px", margin: "0 auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Ngày bắt đầu kinh nguyệt gần nhất *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>
                
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Độ dài chu kỳ (ngày) *</label>
                  <input
                    type="number"
                    name="cycleLength"
                    value={formData.cycleLength}
                    onChange={handleChange}
                    min="21"
                    max="35"
                    required
                    style={inputStyle}
                    placeholder="28"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Thời gian kinh nguyệt (ngày) *</label>
                  <input
                    type="number"
                    name="periodLength"
                    value={formData.periodLength}
                    onChange={handleChange}
                    min="3"
                    max="10"
                    required
                    style={inputStyle}
                    placeholder="5"
                  />
                </div>
              </div>

              <div style={{ marginTop: "35px", textAlign: "center" }}>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "14px 35px",
                    borderRadius: "30px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                >
                  Tính toán chu kỳ
                </button>
              </div>
            </form>
          </>        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ 
              background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 25px auto",
              boxShadow: "0 8px 25px rgba(16, 185, 129, 0.3)"
            }}>
              <span style={{ fontSize: "36px", color: "white" }}>✓</span>
            </div>
            
            <h2 style={{ 
              color: "#2c3e50", 
              marginBottom: "15px", 
              fontSize: "24px", 
              fontWeight: "700" 
            }}>
              Tính toán chu kỳ thành công!
            </h2>
            
            <p style={{ 
              fontSize: "16px", 
              color: "#7f8c8d", 
              marginBottom: "40px",
              maxWidth: "600px",
              margin: "0 auto 40px auto",
              lineHeight: "1.6"
            }}>
              Dưới đây là kết quả tính toán chu kỳ kinh nguyệt của bạn dựa trên thông tin đã cung cấp. 
              Hãy lưu lại thông tin này để theo dõi sức khỏe sinh sản của bạn.
            </p>
              <div style={{
              background: "rgba(8, 145, 178, 0.05)",
              borderRadius: "20px",
              padding: "40px",
              border: "2px solid rgba(8, 145, 178, 0.1)",
              marginBottom: "35px",
              textAlign: "left",
              maxWidth: "1200px",
              margin: "0 auto 35px auto"
            }}>
              <h3 style={{ 
                color: "#0891b2", 
                textAlign: "center", 
                marginBottom: "30px",
                fontSize: "20px",
                fontWeight: "700"
              }}>
                Kết quả tính toán chu kỳ kinh nguyệt
              </h3>

              {/* Phần chính - thông tin quan trọng */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "25px",
                marginBottom: "30px"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
                  padding: "25px",
                  borderRadius: "15px",
                  color: "white",
                  textAlign: "center",
                  boxShadow: "0 4px 15px rgba(8, 145, 178, 0.3)"
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>🩸</div>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "600" }}>Kỳ kinh nguyệt hiện tại</h4>
                  <p style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
                    {results?.periodStart}
                  </p>
                  <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
                    đến {results?.periodEnd}
                  </p>
                </div>
                
                <div style={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                  padding: "25px",
                  borderRadius: "15px",
                  color: "white",
                  textAlign: "center",
                  boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)"
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>🥚</div>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "600" }}>Thời kỳ rụng trứng</h4>
                  <p style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
                    {results?.ovulationStart}
                  </p>
                  <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
                    đến {results?.ovulationEnd}
                  </p>
                </div>
                
                <div style={{
                  background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                  padding: "25px",
                  borderRadius: "15px",
                  color: "white",
                  textAlign: "center",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>💕</div>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "600" }}>Thời kỳ thụ thai cao</h4>
                  <p style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
                    {results?.fertilityStart}
                  </p>
                  <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
                    đến {results?.fertilityEnd}
                  </p>
                </div>
              </div>

              {/* Phần thông tin bổ sung */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px"
              }}>
                <div style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(8, 145, 178, 0.15)",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "20px", marginBottom: "8px", color: "#0891b2" }}>📅</div>
                  <h4 style={{ color: "#0891b2", marginBottom: "8px", fontSize: "14px" }}>Chu kỳ tiếp theo</h4>
                  <p style={{ color: "#2c3e50", fontWeight: "700", fontSize: "16px", margin: 0 }}>
                    {results?.nextCycleStart}
                  </p>
                </div>
                
                <div style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(8, 145, 178, 0.15)",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "20px", marginBottom: "8px", color: "#0891b2" }}>📊</div>
                  <h4 style={{ color: "#0891b2", marginBottom: "8px", fontSize: "14px" }}>Thông tin chu kỳ</h4>
                  <p style={{ color: "#2c3e50", fontWeight: "600", fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
                    Chu kỳ: {results?.cycleLength} ngày<br/>
                    Kinh nguyệt: {results?.periodLength} ngày
                  </p>
                </div>
              </div>
            </div>
              {/* Thêm thông tin hướng dẫn */}
            <div style={{
              background: "rgba(255, 193, 7, 0.08)",
              borderRadius: "15px",
              padding: "25px",
              border: "1px solid rgba(255, 193, 7, 0.2)",
              marginBottom: "40px",
              textAlign: "left",
              maxWidth: "1000px",
              margin: "0 auto 40px auto"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                marginBottom: "20px" 
              }}>
                <div style={{ fontSize: "24px", marginRight: "10px" }}>⚠️</div>
                <h4 style={{ 
                  color: "#f59e0b", 
                  margin: 0, 
                  fontSize: "18px", 
                  fontWeight: "700" 
                }}>
                  Lưu ý quan trọng
                </h4>
              </div>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px"
              }}>
                <div style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  padding: "15px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ color: "#f59e0b", marginRight: "8px", fontSize: "16px" }}>📋</span>
                    <span style={{ color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
                      Kết quả chỉ mang tính chất tham khảo, không thay thế lời khuyên y tế chuyên nghiệp.
                    </span>
                  </div>
                </div>
                
                <div style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  padding: "15px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ color: "#f59e0b", marginRight: "8px", fontSize: "16px" }}>🔄</span>
                    <span style={{ color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
                      Chu kỳ có thể thay đổi do stress, cân nặng, hoặc các yếu tố khác.
                    </span>
                  </div>
                </div>
                
                <div style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  padding: "15px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ color: "#f59e0b", marginRight: "8px", fontSize: "16px" }}>💡</span>
                    <span style={{ color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
                      Thời kỳ thụ thai: 5 ngày trước và 1 ngày sau ngày rụng trứng dự đoán.
                    </span>
                  </div>
                </div>
                
                <div style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  padding: "15px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 193, 7, 0.2)"
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ color: "#f59e0b", marginRight: "8px", fontSize: "16px" }}>👩‍⚕️</span>
                    <span style={{ color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
                      Nếu có bất thường về chu kỳ, hãy tham khảo ý kiến bác sĩ.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ 
              marginTop: "30px", 
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap"
            }}>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setResults(null);
                  setFormData({
                    startDate: '',
                    cycleLength: 28,
                    periodLength: 5
                  });
                }}
                style={{
                  background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                  color: "#fff",
                  border: "none",
                  padding: "15px 30px",
                  borderRadius: "30px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "16px",
                  boxShadow: "0 4px 15px rgba(8, 145, 178, 0.3)",
                  transition: "all 0.3s ease",
                  minWidth: "160px"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(8, 145, 178, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(8, 145, 178, 0.3)";
                }}
              >
                🔄 Tính toán lại
              </button>
              <Link
                to="/services"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "15px 30px",
                  borderRadius: "30px",
                  fontWeight: "600",
                  fontSize: "16px",
                  boxShadow: "0 4px 15px rgba(107, 114, 128, 0.3)",
                  transition: "all 0.3s ease",
                  minWidth: "160px",
                  textAlign: "center"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(107, 114, 128, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(107, 114, 128, 0.3)";
                }}
              >
                ← Quay lại dịch vụ
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: "40px",
        padding: "20px",
        backgroundColor: "#e0f2fe",
        textAlign: "center",
        color: "#0891b2",
        width: "100%"
      }}>
        <p>© 2025 Hệ thống Chăm sóc Sức khỏe Phụ nữ. Mọi quyền được bảo lưu.</p>
        <p style={{ marginTop: "10px" }}>Hotline: 1900-xxxx | Email: support@healthcare.com</p>
      </footer>
    </div>
  );
};

// Định nghĩa styles
const labelStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#2c3e50",
  marginBottom: "8px"
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e1e1e1",
  fontSize: "14px",
  color: "#2c3e50",
  transition: "all 0.3s ease",
  outline: "none",
  backgroundColor: "#f9f9f9"
};

export default PeriodTracking;
