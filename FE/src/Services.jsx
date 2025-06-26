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
      // description: "Ghi nhận và theo dõi chu kỳ kinh nguyệt hàng tháng",
      icon: "📅",
      color: "#ff6b6b",
      path: "/period-tracking"
    },
    {
      id: 2,
      title: "Đặt lịch tư vấn",
      // description: "Đặt lịch hẹn tư vấn với các chuyên gia y tế",
      icon: "👩‍⚕️",
      color: "#4ecdc4",
      path: "/consultation-booking"
    },
    {
      id: 3,
      title: "Đặt lịch xét nghiệm",
      // description: "Đặt lịch thực hiện các xét nghiệm y tế cần thiết",
      icon: "🩺",
      color: "#45b7d1",
      path: "/test-booking"
    },
    {
      id: 4,
      title: "Đặt câu hỏi cho tư vấn viên",
      // description: "Gửi câu hỏi và nhận lời tư vấn từ chuyên gia",
      icon: "💬",
      color: "#f9ca24",
      path: "/ask-question"
    }
  ];

  // Check if screen is mobile
  const isMobile = window.innerWidth <= 768;

  // --- Service Card Menu as horizontal menu ---
  const serviceCardMenu = (
    <div style={{
      display: "flex",
      flexDirection: "row",
      gap: "12px",
      margin: "20px auto 12px auto",
      maxWidth: "700px",
      padding: isMobile ? "0 4px" : "0",
      overflowX: isMobile ? "auto" : "visible",
      justifyContent: isMobile ? "flex-start" : "center",
      alignItems: "stretch",
      width: "100%"
    }}>
      {features.map((feature) => (
        <Link
          key={feature.id}
          to={feature.path}
          style={{
            textDecoration: "none",
            color: "inherit",
            minWidth: isMobile ? 140 : 0,
            flex: isMobile ? "0 0 140px" : "1 1 0%"
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "16px",
              padding: "14px 6px",
              textAlign: "center",
              boxShadow: "0 6px 18px rgba(8, 145, 178, 0.08)",
              border: "1px solid rgba(8, 145, 178, 0.08)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              height: "120px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minWidth: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(8, 145, 178, 0.13)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(8, 145, 178, 0.08)";
            }}
          >
            <div style={{
              fontSize: "28px",
              marginBottom: "6px"
            }}>
              {feature.icon}
            </div>
            <h3 style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#0891b2",
              marginBottom: "4px",
              margin: 0
            }}>
              {feature.title}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );

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
    }}>
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        position: "relative",
        height: "auto",
        minHeight: 0,
        overflow: "hidden",
        paddingBottom: 24
      }}>
        {/* Logo góc trái */}
        <div style={{ position: "absolute", top: 10, left: 20 }}>
          <img
            src="/Logo.png"
            alt="Logo"
            style={{ height: 60, width: 60, objectFit: "contain" }}
          />
        </div>
        {/* Avatar góc phải */}
        <div style={{ position: "absolute", top: 10, right: 20 }}>
          <UserAvatar userName="Nguyễn Thị A" style={{ width: 60, height: 60, fontSize: 28 }} />
        </div>
        {/* Tiêu đề căn giữa tuyệt đối */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none"
        }}>
          <h1
            style={{
              color: "#fff",
              margin: 0,
              padding: 0,
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: "40px",
              lineHeight: 1.2,
              width: "100%"
            }}
          >
            Dịch Vụ Chăm Sóc Sức Khỏe Giới Tính
          </h1>
        </div>
        {/* Service Card Menu directly below the title, inside header */}
        <div style={{ marginTop: 90 }}>{serviceCardMenu}</div>
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
          {/* <div style={{
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
              Chúng tôi cung cấp các dịch vụ chăm sóc sức khỏe toàn diện
            </p>
          </div>          Removed consultant section as we now restrict access to customer role only */}

          <section id="dich-vu-cung-cap"
  style={{
    width: "100vw",
    position: "relative",
    left: "50%",
    right: "50%",
    marginLeft: "-50vw",
    marginRight: "-50vw",
    background: "#e0f2fe",
    borderRadius: 0,
    boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
    padding: "40px 0 32px 0",
    marginTop: "-32px",
    marginBottom: "32px",
    zIndex: 1
  }}
>
  <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
    <h2 style={{ color: "#0891b2", marginTop: 0, display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 24 }}>
      <span role="img" aria-label="stethoscope">🩺</span> Dịch Vụ Cung Cấp
    </h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 20 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(17,153,142,0.1)", border: "1px solid rgba(17,153,142,0.1)" }}>
        <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>📅</div>
        <h3 style={{ color: "#0891b2", textAlign: "center", marginBottom: 12 }}>Theo dõi chu kỳ sinh sản</h3>
        <ul style={{ fontSize: 14, color: "#0891b2", margin: 0, paddingLeft: 20 }}>
          <li>Khai báo chu kỳ kinh nguyệt dễ dàng</li>
          <li>Nhắc nhở thời điểm rụng trứng, khả năng mang thai cao/thấp</li>
          <li>Nhắc uống thuốc tránh thai đúng giờ</li>
          <li>Phân tích biểu đồ sức khỏe sinh sản</li>
        </ul>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(17,153,142,0.1)", border: "1px solid rgba(17,153,142,0.1)" }}>
        <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>💬</div>
        <h3 style={{ color: "#0891b2", textAlign: "center", marginBottom: 12 }}>Tư vấn giới tính & sức khỏe sinh sản</h3>
        <ul style={{ fontSize: 14, color: "#0891b2", margin: 0, paddingLeft: 20 }}>
          <li>Đặt lịch tư vấn trực tuyến với chuyên gia</li>
          <li>Được tư vấn riêng tư, bảo mật</li>
          <li>Gửi câu hỏi, thắc mắc về giới tính, tâm sinh lý, mối quan hệ,...</li>
        </ul>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(17,153,142,0.1)", border: "1px solid rgba(17,153,142,0.1)" }}>
        <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>🧪</div>
        <h3 style={{ color: "#0891b2", textAlign: "center", marginBottom: 12 }}>Xét nghiệm các bệnh STIs</h3>
        <ul style={{ fontSize: 14, color: "#0891b2", margin: 0, paddingLeft: 20 }}>
          <li>Danh sách dịch vụ xét nghiệm đa dạng: HIV, HPV, Lậu, Giang mai, Chlamydia,...</li>
          <li>Đặt lịch và theo dõi quá trình xét nghiệm</li>
          <li>Trả kết quả online an toàn và nhanh chóng</li>
          <li>Hỗ trợ sau xét nghiệm và hướng điều trị</li>
        </ul>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(17,153,142,0.1)", border: "1px solid rgba(17,153,142,0.1)" }}>
        <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>💰</div>
        <h3 style={{ color: "#0891b2", textAlign: "center", marginBottom: 12 }}>Thông tin dịch vụ rõ ràng</h3>
        <ul style={{ fontSize: 14, color: "#0891b2", margin: 0, paddingLeft: 20 }}>
          <li>Bảng giá xét nghiệm minh bạch, cập nhật liên tục</li>
          <li>Gói dịch vụ phù hợp cho từng đối tượng (nam, nữ, cặp đôi,...)</li>
        </ul>
      </div>
    </div>
  </div>
</section>


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
          {/* <div style={{
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
          </div> */}

          {/* Dịch Vụ Cung Cấp - moved from App.jsx */}
          
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
