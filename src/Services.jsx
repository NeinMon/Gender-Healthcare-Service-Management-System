import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  const features = [
    {
      id: 1,
      title: "Theo dõi chu kỳ kinh nguyệt",
      description: "Ghi nhận và theo dõi chu kỳ kinh nguyệt hàng tháng",
      icon: "📅",
      color: "#ff6b6b",
      path: "/period-tracking"
    },
    {
      id: 2,
      title: "Đặt lịch tư vấn",
      description: "Đặt lịch hẹn tư vấn với các chuyên gia y tế",
      icon: "👩‍⚕️",
      color: "#4ecdc4",
      path: "/consultation-booking"
    },
    {
      id: 3,
      title: "Đặt lịch xét nghiệm",
      description: "Đặt lịch thực hiện các xét nghiệm y tế cần thiết",
      icon: "🩺",
      color: "#45b7d1",
      path: "/test-booking"
    },
    {
      id: 4,
      title: "Đặt câu hỏi cho tư vấn viên",
      description: "Gửi câu hỏi và nhận lời tư vấn từ chuyên gia",
      icon: "💬",
      color: "#f9ca24",
      path: "/ask-question"
    }
  ];

  return (    <div style={{ backgroundColor: "#f8fffc", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
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
        <h1
          style={{
            color: "#fff",
            margin: 0,
            padding: "24px 0 16px 0",
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: 1
          }}        >
          Dịch vụ Chăm sóc Sức khỏe Phụ nữ
        </h1>
      </header>      {/* Main Content */}
      <main style={{
        padding: "40px",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        background: "#fff",
        boxSizing: "border-box"
      }}>        <div style={{
          textAlign: "center",
          marginBottom: "40px",
          width: "100%"
        }}>
          <h2 style={{
            fontSize: "32px",
            color: "#2c3e50",
            marginBottom: "10px",
            fontWeight: "600"
          }}>
            Chào mừng bạn đến với hệ thống chăm sóc sức khỏe
          </h2>          <p style={{
            fontSize: "18px",
            color: "#7f8c8d",
            width: "100%",
            margin: "0 auto"
          }}>
            Chọn một trong các dịch vụ dưới đây để bắt đầu chăm sóc sức khỏe của bạn
          </p>
        </div>        {/* Feature Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "40px",
          marginTop: "40px",
          width: "100%",
          maxWidth: "1200px"
        }}>
          {features.map((feature) => (
            <Link
              key={feature.id}
              to={feature.path}
              style={{
                textDecoration: "none",
                color: "inherit"
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "30px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  border: "1px solid #e9ecef",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-8px)";
                  e.target.style.boxShadow = "0 16px 48px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    marginBottom: "20px",
                    padding: "15px",
                    borderRadius: "50%",
                    backgroundColor: feature.color + "20",
                    border: `3px solid ${feature.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "80px",
                    height: "80px"
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#2c3e50",
                    marginBottom: "12px",
                    lineHeight: "1.3"
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#7f8c8d",
                    lineHeight: "1.5",
                    margin: 0,
                    flexGrow: 1
                  }}
                >
                  {feature.description}
                </p>
                <div
                  style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    backgroundColor: feature.color,
                    color: "#fff",
                    borderRadius: "25px",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Truy cập ngay
                </div>
              </div>
            </Link>
          ))}
        </div>        {/* Additional Info Section */}
        <div style={{
          marginTop: "60px",
          padding: "30px",
          backgroundColor: "#f8fffc",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          textAlign: "center",
          width: "100%",
          maxWidth: "1200px"
        }}>
          <h3 style={{
            fontSize: "24px",
            color: "#2c3e50",
            marginBottom: "15px"
          }}>
            Hỗ trợ 24/7
          </h3>
          <p style={{
            fontSize: "16px",
            color: "#7f8c8d",
            marginBottom: "20px"
          }}>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn trong việc chăm sóc sức khỏe. 
            Liên hệ với chúng tôi bất cứ khi nào bạn cần.
          </p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap"
          }}>
            <div style={{
              padding: "10px 20px",
              backgroundColor: "#e8f5e9",
              borderRadius: "20px",
              color: "#2e7d32"
            }}>
              📞 Hotline: 1900-xxxx
            </div>
            <div style={{
              padding: "10px 20px",
              backgroundColor: "#e3f2fd",
              borderRadius: "20px",
              color: "#1565c0"
            }}>
              📧 Email: support@healthcare.com
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Services;
