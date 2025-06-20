import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy email từ localStorage
  const email = localStorage.getItem('email');

  // Hàm lấy dữ liệu chu kỳ mới nhất từ API
  useEffect(() => {
    async function fetchLatestCycle() {
      setLoading(true);
      setError('');
      try {
        if (!email) {
          setLoading(false);
          return;
        }
        const res = await fetch(`http://localhost:8080/api/menstrualcycles?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.startDate) {
            // Hiện kết quả luôn nếu đã có dữ liệu
            setResults({
              periodStart: new Date(data.startDate).toLocaleDateString('vi-VN'),
              periodEnd: new Date(new Date(data.startDate).getTime() + (data.periodLength - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
              ovulationStart: new Date(new Date(data.startDate).getTime() + (data.cycleLength - 15) * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
              ovulationEnd: new Date(new Date(data.startDate).getTime() + (data.cycleLength - 13) * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
              fertilityStart: new Date(new Date(data.startDate).getTime() + (data.cycleLength - 19) * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
              fertilityEnd: new Date(new Date(data.startDate).getTime() + (data.cycleLength - 13) * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
              nextCycleStart: new Date(new Date(data.startDate).getTime() + data.cycleLength * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
              cycleLength: data.cycleLength,
              periodLength: data.periodLength
            });
            setIsSubmitted(true);
          }
        }
      } catch (err) {
        setError('Không thể lấy dữ liệu chu kỳ.');
      }
      setLoading(false);
    }
    fetchLatestCycle();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Hàm lưu dữ liệu chu kỳ mới vào API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.startDate) {
      setError('Vui lòng chọn ngày bắt đầu kinh nguyệt gần nhất!');
      return;
    }
    try {
      const payload = {
        ...formData,
        email: email || ''
      };
      const res = await fetch('http://localhost:8080/api/menstrualcycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Lưu thông tin chu kỳ thất bại!');
      // Tính toán lại kết quả và hiện ra
      calculateCycle();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu thông tin!');
    }
  };

  const calculateCycle = () => {
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
  };  // Giữ nguyên phần render, chỉ thay đổi logic hiển thị form/kết quả
  return (
    <div style={{ 
      backgroundColor: "#f0f9ff", 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      width: "100vw",
      margin: 0,
      padding: 0,
      overflow: "hidden"
    }}>
      {/* Header */}      <header style={{
        background: "#19bdd4",
        width: "100%",
        padding: "22px 0",
        margin: 0,
        border: "none",
        position: "relative",
        minHeight: 90,
        boxShadow: "0 4px 20px rgba(8,145,178,0.15)",
        overflow: "hidden"
      }}><div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          margin: 0,
          padding: 0,
          position: "relative"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            zIndex: 1
          }}>            <img
              src="/Logo.png"
              alt="Logo"
              style={{ 
                height: 48, 
                width: 48, 
                objectFit: "contain", 
                marginRight: 15,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              }}
            />
            <h1
              style={{
                color: "#fff",
                margin: 0,
                fontWeight: 800,
                letterSpacing: 0.5,
                fontSize: 30,
                lineHeight: 1.1,
                fontFamily: 'Montserrat, Arial, sans-serif',
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              Theo dõi chu kỳ
            </h1>
          </div>
        </div>        <div style={{ 
          position: "absolute", 
          top: 20, 
          right: 24,
          zIndex: 10
        }}>
          <UserAvatar userName="Nguyễn Thị A" />
        </div>
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

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", fontSize: "18px", color: "#666" }}>
            Đang tải dữ liệu chu kỳ mới nhất...
          </div>
        ) : isSubmitted && results ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            {/* Bỏ phần thông báo thành công, chỉ hiển thị kết quả */}
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
        ) : (
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
          </>        )}
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
