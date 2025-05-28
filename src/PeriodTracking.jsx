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
      }}>
        <div style={{
          position: "absolute",
          top: 20,
          right: 25,
          display: "flex",
          gap: 10,
          zIndex: 2
        }}>
          <Link 
            to="/services" 
            style={{
              background: "#fff",
              color: "#0891b2",
              textDecoration: "none",
              padding: "8px 20px",
              borderRadius: 6,
              fontWeight: 600
            }}
          >
            Quay lại
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
          📅 Theo dõi chu kỳ kinh nguyệt
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
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(8, 145, 178, 0.1)",
          padding: "40px",
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          border: "1px solid rgba(8, 145, 178, 0.1)"
        }}>
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
              🌸 Tính toán chu kỳ kinh nguyệt
            </h2>
            <p style={{
              fontSize: "16px",
              color: "#666",
              margin: 0
            }}>
              Nhập thông tin để theo dõi chu kỳ kinh nguyệt của bạn
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "30px"
          }}>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#0891b2",
                fontSize: "15px"
              }}>
                📅 Ngày bắt đầu kinh nguyệt gần nhất:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
                🔄 Độ dài chu kỳ (ngày):
              </label>
              <input
                type="number"
                value={cycleLength}
                onChange={(e) => setCycleLength(e.target.value)}
                min="21"
                max="35"
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
                🩸 Độ dài kinh nguyệt (ngày):
              </label>
              <input
                type="number"
                value={periodLength}
                onChange={(e) => setPeriodLength(e.target.value)}
                min="3"
                max="10"
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
          </div>

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <button
              onClick={calculateCycle}
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
              🔮 Tính toán chu kỳ
            </button>
          </div>

          {results && (
            <div style={{
              background: "rgba(8, 145, 178, 0.05)",
              borderRadius: "16px",
              padding: "30px",
              border: "2px solid rgba(8, 145, 178, 0.1)",
              marginBottom: "30px"
            }}>
              <h3 style={{
                color: "#0891b2",
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "20px",
                textAlign: "center"
              }}>
                📊 Kết quả tính toán
              </h3>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px"
              }}>
                <div style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid rgba(8, 145, 178, 0.1)"
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>🩸</div>
                  <h4 style={{ color: "#0891b2", marginBottom: "5px", fontSize: "14px" }}>Bắt đầu kinh nguyệt</h4>
                  <p style={{ margin: 0, fontWeight: "600", color: "#333" }}>{results.startDate}</p>
                </div>

                <div style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid rgba(8, 145, 178, 0.1)"
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>✅</div>
                  <h4 style={{ color: "#0891b2", marginBottom: "5px", fontSize: "14px" }}>Kết thúc kinh nguyệt</h4>
                  <p style={{ margin: 0, fontWeight: "600", color: "#333" }}>{results.periodEnd}</p>
                </div>

                <div style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid rgba(8, 145, 178, 0.1)"
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>🌼</div>
                  <h4 style={{ color: "#0891b2", marginBottom: "5px", fontSize: "14px" }}>Ngày rụng trứng</h4>
                  <p style={{ margin: 0, fontWeight: "600", color: "#333" }}>{results.ovulationDate}</p>
                </div>

                <div style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid rgba(8, 145, 178, 0.1)"
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>💕</div>
                  <h4 style={{ color: "#0891b2", marginBottom: "5px", fontSize: "14px" }}>Giai đoạn dễ thụ thai</h4>
                  <p style={{ margin: 0, fontWeight: "600", color: "#333", fontSize: "12px" }}>{results.fertileWindow}</p>
                </div>

                <div style={{
                  background: "rgba(255, 255, 255, 0.8)",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid rgba(8, 145, 178, 0.1)"
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔔</div>
                  <h4 style={{ color: "#0891b2", marginBottom: "5px", fontSize: "14px" }}>Kinh nguyệt tiếp theo</h4>
                  <p style={{ margin: 0, fontWeight: "600", color: "#333" }}>{results.nextPeriod}</p>
                </div>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div style={{
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid rgba(8, 145, 178, 0.1)"
            }}>
              <h3 style={{
                color: "#0891b2",
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "15px",
                textAlign: "center"
              }}>
                📈 Lịch sử theo dõi
              </h3>
              
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {history.map((record, index) => (
                  <div
                    key={record.id}
                    style={{
                      background: "rgba(8, 145, 178, 0.05)",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      border: "1px solid rgba(8, 145, 178, 0.1)"
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px"
                    }}>
                      <span style={{ fontWeight: "600", color: "#0891b2" }}>
                        Lần {index + 1}: {record.startDate}
                      </span>
                      <span style={{ color: "#666", fontSize: "14px" }}>
                        Chu kỳ: {record.cycleLength} ngày
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

export default PeriodTracking;
