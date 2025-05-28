import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PeriodTracking = () => {
  const [startDate, setStartDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);

  const calculateCycle = () => {
    if (!startDate) {
      alert("Vui lòng chọn ngày bắt đầu kinh nguyệt gần nhất!");
      return;
    }

    const start = new Date(startDate);
    const periodEnd = new Date(start);
    periodEnd.setDate(start.getDate() + parseInt(periodLength) - 1);

    const ovulationDay = new Date(start);
    ovulationDay.setDate(start.getDate() + parseInt(cycleLength) - 14);

    const fertileStart = new Date(ovulationDay);
    fertileStart.setDate(ovulationDay.getDate() - 5);

    const fertileEnd = new Date(ovulationDay);
    fertileEnd.setDate(ovulationDay.getDate() + 1);

    const nextPeriod = new Date(start);
    nextPeriod.setDate(start.getDate() + parseInt(cycleLength));

    const newResult = {
      id: Date.now(),
      startDate: start.toLocaleDateString('vi-VN'),
      periodEnd: periodEnd.toLocaleDateString('vi-VN'),
      ovulationDate: ovulationDay.toLocaleDateString('vi-VN'),
      fertileWindow: `${fertileStart.toLocaleDateString('vi-VN')} - ${fertileEnd.toLocaleDateString('vi-VN')}`,
      nextPeriod: nextPeriod.toLocaleDateString('vi-VN'),
      cycleLength: cycleLength,
      periodLength: periodLength
    };

    setResults(newResult);
    setHistory(prev => [newResult, ...prev.slice(0, 4)]); // Keep only last 5 records
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };  return (
    <div style={{ backgroundColor: "#f8fffc", minHeight: "100vh", width: "100vw", margin: 0, padding: 0, overflow: "hidden" }}>
      {/* Header */}      <header style={{
        background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
        paddingBottom: 0,
        position: "relative",
        width: "100%"      }}>
        <div style={{
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
              background: "#11998e",
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
          <img
            src="/Logo.png"
            alt="Logo"
            style={{ height: 100, width: 100, objectFit: "contain" }}
          />
        </div>

        <h1 style={{
          color: "#fff",
          margin: 0,
          padding: "24px 0 16px 0",
          textAlign: "center",
          fontWeight: 700,
          letterSpacing: 1
        }}>
          Theo dõi Chu kỳ Kinh nguyệt 📅
        </h1>
      </header>      <main style={{
        padding: "40px",
        minHeight: "calc(100vh - 180px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#fff",
        boxSizing: "border-box",
        boxShadow: "0 0 20px rgba(0,0,0,0.05)",
        overflow: "auto"
      }}>
        {/* Navigation links */}
        <div style={{ marginBottom: "30px", width: "100%" }}>
          <Link 
            to="/services" 
            style={{
              display: "flex",
              alignItems: "center",
              color: "#11998e",
              textDecoration: "none",
              fontWeight: 500
            }}
          >
            ← Quay lại trang dịch vụ
          </Link>
        </div>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "32px", color: "#2c3e50", marginBottom: "15px" }}>
            Theo dõi chu kỳ kinh nguyệt
          </h2>
          <p style={{ fontSize: "18px", color: "#7f8c8d", maxWidth: "1000px", margin: "0 auto" }}>
            Công cụ tính toán chu kỳ kinh nguyệt giúp bạn theo dõi và dự đoán chu kỳ một cách chính xác
          </p>
        </div>        <section id="period-tracking-section" style={{
          maxWidth: "1000px",
          width: "100%"
        }}>
          {/* Calculator Section */}
          <div style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(17,153,142,0.07)",
            padding: 40,
            marginBottom: 30,
            width: "100%",
            boxSizing: "border-box"
          }}>
            <h2 style={{
              fontSize: "24px",
              color: "#2c3e50",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              🧮 Công cụ Tính toán Chu kỳ
            </h2>            <form onSubmit={(e) => { e.preventDefault(); calculateCycle(); }} style={{ width: "100%", maxWidth: "1000px" }}>
              <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "300px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#2c3e50" }}>
                    Ngày bắt đầu kinh nguyệt gần nhất *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "16px"
                    }}
                  />
                </div>
                
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#2c3e50" }}>
                    Chu kỳ (ngày) *
                  </label>
                  <input
                    type="number"
                    min="21"
                    max="35"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "16px"
                    }}
                  />
                </div>
                
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#2c3e50" }}>
                    Số ngày kinh nguyệt *
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="8"
                    value={periodLength}
                    onChange={(e) => setPeriodLength(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "16px"
                    }}
                  />
                </div>
              </div>
              
              <div style={{ textAlign: "center" }}>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
                    color: "white",
                    border: "none",
                    padding: "14px 40px",
                    borderRadius: "30px",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(56, 239, 125, 0.3)"
                  }}
                >
                  📊 Tính toán chu kỳ
                </button>
              </div>
            </form>{/* Results Table */}
            {results && (
              <div style={{
                background: "#fff",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 2px 12px rgba(17,153,142,0.07)",
                marginTop: 24
              }}>                <h3 style={{ color: "#11998e", marginBottom: 16 }}>📋 Kết quả Tính toán</h3>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                  marginBottom: "16px"
                }}>
                  <div style={{ 
                    background: "#fff2f2", 
                    padding: "16px", 
                    borderRadius: "8px",
                    border: "2px solid #ff6b6b",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>🩸</div>
                    <strong style={{ color: "#d63031" }}>Kinh nguyệt</strong>
                    <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                      {results.startDate} đến {results.periodEnd}
                    </p>
                  </div>
                  
                  <div style={{ 
                    background: "#fff9e6", 
                    padding: "16px", 
                    borderRadius: "8px",
                    border: "2px solid #fbc02d",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>🌼</div>
                    <strong style={{ color: "#d68910" }}>Rụng trứng</strong>
                    <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                      {results.ovulationDate}
                    </p>
                  </div>
                  
                  <div style={{ 
                    background: "#f0f9ff", 
                    padding: "16px", 
                    borderRadius: "8px",
                    border: "2px solid #4ecdc4",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>💕</div>
                    <strong style={{ color: "#00b894" }}>Thời kỳ sinh sản</strong>
                    <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                      {results.fertileWindow}
                    </p>
                  </div>
                  
                  <div style={{ 
                    background: "#e8f4fd", 
                    padding: "16px", 
                    borderRadius: "8px",
                    border: "2px solid #1976d2",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔔</div>
                    <strong style={{ color: "#1976d2" }}>Kinh nguyệt tiếp theo</strong>
                    <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                      {results.nextPeriod}
                    </p>
                  </div>
                </div>
                
                <div style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "#f8f9fa",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#6c757d",
                  textAlign: "center"
                }}>
                  ℹ️ <strong>Lưu ý:</strong> Kết quả này chỉ mang tính chất tham khảo.
                </div>
              </div>
            )}

            {/* History Table */}
            {history.length > 0 && (              <div style={{
                background: "#fff",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 2px 12px rgba(17,153,142,0.07)",
                marginTop: 24,
                width: "100%",
                boxSizing: "border-box"
              }}>
                <h3 style={{ color: "#11998e", marginBottom: 16 }}>📚 Lịch sử Theo dõi</h3>
                <div style={{ overflowX: "auto", width: "100%" }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                    minWidth: "600px"
                  }}>                    <thead>
                      <tr style={{ background: "#f8f9fa" }}>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", minWidth: "100px" }}>Bắt đầu</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", minWidth: "100px" }}>Kết thúc KN</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", minWidth: "100px" }}>Rụng trứng</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6", minWidth: "120px" }}>KN tiếp theo</th>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #dee2e6", minWidth: "80px" }}>Chu kỳ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((record, index) => (
                        <tr key={record.id} style={{ 
                          background: index % 2 === 0 ? "#fff" : "#f8f9fa",
                          borderBottom: "1px solid #dee2e6"
                        }}>
                          <td style={{ padding: "12px" }}>{record.startDate}</td>
                          <td style={{ padding: "12px" }}>{record.periodEnd}</td>
                          <td style={{ padding: "12px" }}>{record.ovulationDate}</td>
                          <td style={{ padding: "12px" }}>{record.nextPeriod}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{record.cycleLength} ngày</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tips Section */}            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 2px 12px rgba(17,153,142,0.07)",
              marginTop: 24,
              width: "100%",
              boxSizing: "border-box"
            }}>
              <h3 style={{ color: "#11998e", marginBottom: 16 }}>💡 Mẹo Theo dõi Chu kỳ</h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px"
              }}>
                <div style={{
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef"
                }}>
                  <h4 style={{ color: "#11998e", marginBottom: "8px", fontSize: "16px" }}>📝 Ghi chép thường xuyên</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>
                    Ghi lại ngày bắt đầu và kết thúc kinh nguyệt mỗi tháng để có dữ liệu chính xác nhất.
                  </p>
                </div>

                <div style={{
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef"
                }}>
                  <h4 style={{ color: "#11998e", marginBottom: "8px", fontSize: "16px" }}>🌡️ Theo dõi nhiệt độ cơ thể</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>
                    Nhiệt độ cơ thể tăng nhẹ sau khi rụng trứng, giúp xác định thời điểm rụng trứng chính xác hơn.
                  </p>
                </div>

                <div style={{
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef"
                }}>
                  <h4 style={{ color: "#11998e", marginBottom: "8px", fontSize: "16px" }}>💪 Chăm sóc sức khỏe</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>
                    Duy trì chế độ ăn uống lành mạnh và tập thể dục đều đặn để chu kỳ ổn định hơn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PeriodTracking;
