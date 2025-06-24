import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const Services = () => {
  const [isConsultant, setIsConsultant] = React.useState(false);
  const [isCustomer, setIsCustomer] = React.useState(true); // Mặc định giả định là customer
  const [loading, setLoading] = React.useState(true);
  const [redirectTo, setRedirectTo] = React.useState(null);

  // Check if user is a consultant - for demo purposes
  React.useEffect(() => {
    const checkUserRole = async () => {
      try {
        setLoading(true);
        // Get userId from local storage (this may vary based on your app's auth implementation)
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || '2';
        
        const response = await fetch(`http://localhost:8080/api/users/${userId}`);
        
        if (response.ok) {
          const userData = await response.json();
          // Check user role
          if (userData.role) {
            if (userData.role === 'CONSULTANT' || userData.role === 'ADMIN') {
              setIsConsultant(true);
              setIsCustomer(false); // Không phải là customer
              setRedirectTo('/consultant-interface'); // Chuyển hướng đến trang consultant
            } else if (userData.role === 'CUSTOMER') {
              setIsCustomer(true); 
            } else {
              setIsCustomer(false);
              setRedirectTo('/'); // Chuyển hướng đến trang chính nếu không có role phù hợp
            }
          }
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserRole();
  }, []);

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

  // Check if screen is mobile
  const isMobile = window.innerWidth <= 768;

  // Chuyển hướng nếu không phải customer và không đang loading
  if (!loading && !isCustomer && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // Hiển thị trạng thái loading khi đang kiểm tra quyền
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh",
        backgroundColor: "#f0f9ff"
      }}>
        <img
          src="/Logo.png"
          alt="Logo"
          style={{ height: 120, width: 120, objectFit: "contain", marginBottom: 20 }}
        />
        <h2 style={{ color: "#0891b2", marginBottom: 20 }}>Đang tải thông tin...</h2>
        <div style={{ 
          width: 50, 
          height: 50, 
          borderRadius: "50%",
          border: "5px solid #e0f2fe",
          borderTopColor: "#0891b2",
          animation: "spin 1s linear infinite"
        }}></div>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: "#f0f9ff !important", 
      background: "#f0f9ff !important",
      colorScheme: "light",
      minHeight: "100vh",
      width: "100vw",
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 0,
        position: "relative"
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
          Dịch vụ Chăm sóc Sức khỏe Phụ nữ
        </h1>
      </header>

      <main style={{
        padding: "40px 20px",
        minHeight: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        background: "#f0f9ff !important",
        backgroundColor: "#f0f9ff !important",
        colorScheme: "light"
      }}>
        <div style={{
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto"
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: "40px"
          }}>
            <h2 style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#0891b2",
              marginBottom: "16px"
            }}>
              🌟 Dịch vụ của chúng tôi
            </h2>
            <p style={{
              fontSize: "18px",
              color: "#666",
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              Chúng tôi cung cấp các dịch vụ chăm sóc sức khỏe toàn diện cho phụ nữ
            </p>
          </div>          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: "30px",
            marginBottom: "40px",
            maxWidth: "900px",
            margin: "0 auto 40px auto",
            padding: isMobile ? "0 10px" : "0"
          }}>
            {features.map((feature) => (
              <Link
                key={feature.id}
                to={feature.path}
                style={{
                  textDecoration: "none",
                  color: "inherit"
                }}
              >                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "20px",
                    padding: "30px",
                    textAlign: "center",
                    boxShadow: "0 10px 30px rgba(8, 145, 178, 0.1)",
                    border: "1px solid rgba(8, 145, 178, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    height: "220px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minWidth: "0"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-10px)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(8, 145, 178, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(8, 145, 178, 0.1)";
                  }}
                >
                  <div style={{
                    fontSize: "48px",
                    marginBottom: "15px"
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#0891b2",
                    marginBottom: "10px",
                    margin: 0
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: "14px",
                    color: "#666",
                    lineHeight: "1.5",
                    margin: "10px 0 0 0"
                  }}>
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
            {/* Removed consultant section as we now restrict access to customer role only */}

          <div style={{
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 10px 30px rgba(8, 145, 178, 0.1)",
            border: "1px solid rgba(8, 145, 178, 0.1)"
          }}>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#0891b2",
              marginBottom: "20px"
            }}>
              🏥 Cam kết của chúng tôi
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginTop: "30px"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>🔒</div>
                <h4 style={{ color: "#0891b2", marginBottom: "8px" }}>Bảo mật tuyệt đối</h4>
                <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                  Thông tin cá nhân được bảo vệ an toàn
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>⚡</div>
                <h4 style={{ color: "#0891b2", marginBottom: "8px" }}>Phản hồi nhanh</h4>
                <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                  Hỗ trợ và tư vấn 24/7
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>👩‍⚕️</div>
                <h4 style={{ color: "#0891b2", marginBottom: "8px" }}>Chuyên gia giàu kinh nghiệm</h4>
                <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                  Đội ngũ bác sĩ chuyên khoa
                </p>
              </div>
            </div>
          </div>          {/* Removed secondary consultant section as well */}
          
          {/* Thêm phần thông tin khách hàng */}
          <div style={{
            textAlign: "center",
            marginTop: "40px",
            padding: "20px",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(8, 145, 178, 0.1)",
            border: "1px solid rgba(8, 145, 178, 0.1)"
          }}>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#0891b2",
              marginBottom: "16px"
            }}>
              � Thông tin cá nhân
            </h3>
            <p style={{
              color: "#666",
              fontSize: "16px",
              marginBottom: "20px"
            }}>
              Xem và cập nhật thông tin cá nhân của bạn, lịch sử khám và hỏi đáp
            </p>
            <Link
              to="/user-account"
              style={{
                backgroundColor: "#0891b2",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "500",
                transition: "background 0.3s ease",
                display: "inline-block"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#067a9e";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#0891b2";
              }}
            >
              Xem thông tin cá nhân
            </Link>
          </div>
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

export default Services;
