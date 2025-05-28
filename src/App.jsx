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
  const [cycleLength, setCycleLength] = useState(28);  const [periodLength, setPeriodLength] = useState(5);
  const [tableData, setTableData] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);
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
  const [isLoading, setIsLoading] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    customers: 0,
    tests: 0,
    satisfaction: 0,
    experience: 0
  });  const [showParticles, setShowParticles] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [isContentLoading, setIsContentLoading] = useState(true);

  // Animated counter for statistics
  const animateCounter = (target, current, setter, increment) => {
    if (current < target) {
      setTimeout(() => {
        setter(Math.min(current + increment, target));
      }, 50);
    }
  };
  // Initialize animated counters
  React.useEffect(() => {
    animateCounter(10000, animatedStats.customers, (val) => 
      setAnimatedStats(prev => ({ ...prev, customers: val })), 200);
    animateCounter(50000, animatedStats.tests, (val) => 
      setAnimatedStats(prev => ({ ...prev, tests: val })), 1000);
    animateCounter(98, animatedStats.satisfaction, (val) => 
      setAnimatedStats(prev => ({ ...prev, satisfaction: val })), 2);
    animateCounter(5, animatedStats.experience, (val) => 
      setAnimatedStats(prev => ({ ...prev, experience: val })), 1);
  }, []);

  // Initialize content loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsContentLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  // Intersection Observer for fade-in animations
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id || entry.target.getAttribute('data-section-id') || 'statistics';
            setVisibleSections(prev => new Set([...prev, id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    // Observe all sections with fade-in animation
    const sections = document.querySelectorAll('[data-animate="fade-in"]');
    sections.forEach((section, index) => {
      // Add data-section-id for sections without id
      if (!section.id) {
        section.setAttribute('data-section-id', `section-${index}`);
      }
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Image carousel data
  const carouselImages = [
    { src: "/healthcare-banner.jpg", alt: "Dịch vụ chăm sóc sức khỏe" },
    { src: "/medical-team.jpg", alt: "Đội ngũ y bác sĩ" },
    { src: "/lab-testing.jpg", alt: "Xét nghiệm chuyên nghiệp" },
    { src: "/medical-equipment.jpg", alt: "Thiết bị y tế hiện đại" }
  ];

  // Auto-rotate carousel
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

    setIsLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
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
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          .pulse-hover:hover {
            animation: pulse 1s ease-in-out;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .slide-in {
            animation: slideIn 0.7s ease-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .fade-in {
            animation: fadeIn 0.8s ease-out;
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .bounce {
            animation: bounce 1s ease infinite;
          }

          @keyframes float {
            0%,
            100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }

          .float {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes textGlow {
            0%,
            100% { text-shadow: 0 0 5px rgba(255,255,255,0.8); }
            50% { text-shadow: 0 0 20px rgba(255,255,255,1); }
          }

          .text-glow {
            animation: textGlow 1.5s ease-in-out infinite;
          }

          @keyframes particleAnim {
            0% {
              transform: translate(0, 0);
              opacity: 1;
            }
            100% {
              transform: translate(100px, -100px);
              opacity: 0;
            }
          }          .particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            animation: particleAnim 3s linear infinite;
          }

          @keyframes progressFill {
            from { width: 0%; }
            to { width: var(--target-width); }
          }

          .progress-bar {
            animation: progressFill 2s ease-out forwards;
          }

          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: 200px 0; }
          }          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            background-size: 200px 100%;
            animation: shimmer 2s infinite;
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes particleFloat {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(180deg);
            }
          }

          .fade-in-section {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s ease-out;
          }

          .fade-in-section.visible {
            opacity: 1;
            transform: translateY(0);
          }

          .slide-in-left {
            animation: slideInLeft 0.8s ease-out;
          }

          .slide-in-right {
            animation: slideInRight 0.8s ease-out;
          }

          .scale-in {
            animation: scaleIn 0.6s ease-out;
          }

          .content-loading {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
        `}
      </style>
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
        </h1>        <nav
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            margin: "0 0 8px 0",
            padding: "0 40px"
          }}
        >          <a 
            href="#gioi-thieu" 
            style={{ 
              color: "#fff", 
              fontWeight: 600, 
              fontSize: 16,
              textDecoration: "none",
              background: "rgba(255,255,255,0.4)",
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.6)",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.5)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.4)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            Giới thiệu
          </a>          <a 
            href="#dich-vu" 
            style={{ 
              color: "#fff", 
              fontWeight: 600, 
              fontSize: 16,
              textDecoration: "none",
              background: "rgba(255,255,255,0.4)",
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.6)",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.5)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.4)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            Dịch vụ
          </a>          <a 
            href="#nhan-vien" 
            style={{ 
              color: "#fff", 
              fontWeight: 600, 
              fontSize: 16,
              textDecoration: "none",
              background: "rgba(255,255,255,0.4)",
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.6)",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.5)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.4)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            Nhân viên
          </a>          <a 
            href="#tu-van-vien" 
            style={{ 
              color: "#fff", 
              fontWeight: 600, 
              fontSize: 16,
              textDecoration: "none",
              background: "rgba(255,255,255,0.4)",
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.6)",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.5)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.4)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            Tư vấn viên
          </a>          <a 
            href="#blog" 
            style={{ 
              color: "#fff", 
              fontWeight: 600, 
              fontSize: 16,
              textDecoration: "none",
              background: "rgba(255,255,255,0.4)",
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.6)",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.5)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.4)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            Blog
          </a>
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
        </div>      )}

      {/* Hero Banner Section */}
      <section style={{
        background: "linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)",
        padding: "60px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Floating Particles */}
        {showParticles && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 1 }}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + i * 10}%`,
                  width: `${8 + i * 2}px`,
                  height: `${8 + i * 2}px`,
                  background: `rgba(17,153,142,${0.3 + i * 0.1})`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i}s`
                }}
              />
            ))}
          </div>
        )}
        
        {/* Background Pattern */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(17,153,142,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(56,239,125,0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(17,153,142,0.05) 0%, transparent 50%)",
          zIndex: 0
        }}></div>
        
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto" }}>
          {/* Image Carousel */}
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: 600,
            height: 300,
            margin: "0 auto 30px auto",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 12px 32px rgba(17,153,142,0.2)"
          }}>
            <div style={{
              display: "flex",
              transition: "transform 0.5s ease-in-out",
              transform: `translateX(-${currentImageIndex * 100}%)`
            }}>
              {carouselImages.map((image, index) => (
                <div
                  key={index}
                  style={{
                    minWidth: "100%",
                    height: 300,
                    background: `linear-gradient(45deg, #11998e, #38ef7d)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: 600,
                    position: "relative"
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>
                        {index === 0 ? "🏥" : index === 1 ? "👨‍⚕️" : index === 2 ? "🧪" : "🔬"}
                      </div>
                      <div>{image.alt}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel Indicators */}
            <div style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 8
            }}>
              {carouselImages.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: currentImageIndex === index ? "#fff" : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                />
              ))}
            </div>
          </div>
          
          <h1 className="text-glow" style={{
            fontSize: 42,
            color: "#11998e",
            marginBottom: 20,
            fontWeight: 700,
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            🌟 Chăm Sóc Sức Khỏe Giới Tính Toàn Diện
          </h1>
          <p style={{
            fontSize: 20,
            color: "#555",
            marginBottom: 40,
            maxWidth: 800,
            margin: "0 auto 40px auto",
            lineHeight: 1.6
          }}>
            Dịch vụ y tế chuyên nghiệp • Bảo mật tuyệt đối • Tư vấn 24/7 • Đội ngũ chuyên gia hàng đầu
          </p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            <div style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 8px 24px rgba(17,153,142,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 200
            }}>
              <div style={{ fontSize: 32 }}>🏥</div>
              <div>
                <div style={{ fontWeight: 600, color: "#11998e" }}>Chuyên nghiệp</div>
                <div style={{ fontSize: 14, color: "#666" }}>Đội ngũ y bác sĩ</div>
              </div>
            </div>
            <div style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 8px 24px rgba(17,153,142,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 200
            }}>
              <div style={{ fontSize: 32 }}>🔒</div>
              <div>
                <div style={{ fontWeight: 600, color: "#11998e" }}>Bảo mật</div>
                <div style={{ fontSize: 14, color: "#666" }}>Thông tin an toàn</div>
              </div>
            </div>
            <div style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 8px 24px rgba(17,153,142,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 200
            }}>
              <div style={{ fontSize: 32 }}>💬</div>
              <div>
                <div style={{ fontWeight: 600, color: "#11998e" }}>Tư vấn 24/7</div>
                <div style={{ fontSize: 14, color: "#666" }}>Hỗ trợ liên tục</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main style={{ padding: "40px 20px" }}>
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
                </label>                <button type="submit" disabled={isLoading} style={{
                  background: isLoading ? "#81c784" : "#11998e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.3s ease"
                }}>
                  {isLoading ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: "2px solid transparent",
                        borderTop: "2px solid #fff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                      }}></div>
                      Đang tính...
                    </>
                  ) : (
                    <>📊 Tính toán</>
                  )}
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
        </section>        <section id="gioi-thieu" data-animate="fade-in" className={`fade-in-section ${visibleSections.has('gioi-thieu') ? 'visible' : ''}`} style={{
          background: "#e6fff4",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 24,
          margin: "32px 0"
        }}>
          <h2 style={{ color: "#11998e", marginTop: 0, display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            <span role="img" aria-label="health">🏥</span> Giới Thiệu Dịch Vụ
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ 
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              alignItems: "center"
            }}>
              <img
                src="/Doctor.png"
                alt="Chăm sóc sức khỏe chuyên nghiệp"
                style={{
                  width: 240,
                  height: 240,
                  objectFit: "cover",
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(17,153,142,0.15)"
                }}
              />
              <div style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center"
              }}>
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 12,
                  boxShadow: "0 2px 6px rgba(17,153,142,0.1)",
                  textAlign: "center",
                  minWidth: 100
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🩺</div>
                  <div style={{ fontSize: 12, color: "#11998e", fontWeight: 600 }}>Khám tổng quát</div>
                </div>
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 12,
                  boxShadow: "0 2px 6px rgba(17,153,142,0.1)",
                  textAlign: "center",
                  minWidth: 100
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🧪</div>
                  <div style={{ fontSize: 12, color: "#11998e", fontWeight: 600 }}>Xét nghiệm</div>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 300 }}>
              <p style={{ fontSize: 17, marginBottom: 16 }}>
                Chúng tôi cung cấp dịch vụ chăm sóc sức khỏe giới tính toàn diện, chuyên nghiệp và bảo mật cho mọi đối tượng.
              </p>
              <ul style={{ fontSize: 16, color: "#11998e", margin: 0, paddingLeft: 24 }}>
                <li>🔸 Theo dõi chu kỳ kinh nguyệt thông minh</li>
                <li>🔸 Xét nghiệm STIs chính xác và nhanh chóng</li>
                <li>🔸 Tư vấn sức khỏe sinh sản chuyên sâu</li>
                <li>🔸 Đội ngũ y bác sĩ giàu kinh nghiệm</li>
                <li>🔸 Bảo mật thông tin tuyệt đối</li>
              </ul>
            </div>
          </div>
        </section>        {/* Statistics Section */}
        <section id="statistics" data-animate="fade-in" className={`fade-in-section ${visibleSections.has('statistics') ? 'visible' : ''}`} style={{
          background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
          borderRadius: 12,
          padding: 40,
          margin: "32px 0",
          color: "#fff",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Additional floating particles for statistics section */}
          {showParticles && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 1 }}>
              {[...Array(4)].map((_, i) => (
                <div
                  key={`stat-particle-${i}`}
                  style={{
                    position: "absolute",
                    left: `${15 + i * 20}%`,
                    top: `${30 + i * 15}%`,
                    width: `${6 + i * 2}px`,
                    height: `${6 + i * 2}px`,
                    background: `rgba(255,255,255,${0.2 + i * 0.1})`,
                    borderRadius: "50%",
                    animation: `particleFloat ${4 + i}s ease-in-out infinite`,
                    animationDelay: `${i * 0.8}s`
                  }}
                />
              ))}
            </div>
          )}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grid\" width=\"10\" height=\"10\" patternUnits=\"userSpaceOnUse\"><path d=\"M 10 0 L 0 0 0 10\" fill=\"none\" stroke=\"rgba(255,255,255,0.1)\" stroke-width=\"1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grid)\"/></svg>')",
            opacity: 0.3
          }}></div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ 
              textAlign: "center", 
              marginBottom: 40, 
              fontSize: 28,
              fontWeight: 700,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}>
              📊 Thành Tích Đáng Tự Hào
            </h2>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
              gap: 30,
              textAlign: "center"
            }}>              <div style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: 24,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                position: "relative"
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{animatedStats.customers}+</div>
                <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 12 }}>Khách hàng tin tưởng</div>
                <div style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  height: 8,
                  overflow: "hidden"
                }}>
                  <div
                    className="progress-bar"
                    style={{
                      background: "linear-gradient(90deg, #fff, #38ef7d)",
                      height: "100%",
                      borderRadius: 10,
                      "--target-width": `${(animatedStats.customers / 10000) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: 24,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                position: "relative"
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🧪</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{animatedStats.tests}+</div>
                <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 12 }}>Xét nghiệm thực hiện</div>
                <div style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  height: 8,
                  overflow: "hidden"
                }}>
                  <div
                    className="progress-bar"
                    style={{
                      background: "linear-gradient(90deg, #fff, #1976d2)",
                      height: "100%",
                      borderRadius: 10,
                      "--target-width": `${(animatedStats.tests / 50000) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: 24,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                position: "relative"
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{animatedStats.satisfaction}%</div>
                <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 12 }}>Độ hài lòng khách hàng</div>
                <div style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  height: 8,
                  overflow: "hidden"
                }}>
                  <div
                    className="progress-bar"
                    style={{
                      background: "linear-gradient(90deg, #fff, #fbc02d)",
                      height: "100%",
                      borderRadius: 10,
                      "--target-width": `${animatedStats.satisfaction}%`
                    }}
                  />
                </div>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: 24,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                position: "relative"
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{animatedStats.experience}+</div>
                <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 12 }}>Năm kinh nghiệm</div>
                <div style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  height: 8,
                  overflow: "hidden"
                }}>
                  <div
                    className="progress-bar"
                    style={{
                      background: "linear-gradient(90deg, #fff, #e91e63)",
                      height: "100%",
                      borderRadius: 10,
                      "--target-width": `${(animatedStats.experience / 5) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>        <section id="dich-vu" data-animate="fade-in" className={`fade-in-section ${visibleSections.has('dich-vu') ? 'visible' : ''}`} style={{
          background: "#e6fff4",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 24,
          margin: "32px 0"
        }}>
          <h2 style={{ color: "#11998e", marginTop: 0, display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            <span role="img" aria-label="stethoscope">🩺</span> Dịch Vụ Cung Cấp
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 20 }}>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 2px 8px rgba(17,153,142,0.1)",
              border: "1px solid rgba(17,153,142,0.1)"
            }}>
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>📅</div>
              <h3 style={{ color: "#11998e", textAlign: "center", marginBottom: 12 }}>Theo dõi chu kỳ sinh sản</h3>
              <ul style={{ fontSize: 14, color: "#11998e", margin: 0, paddingLeft: 20 }}>
                <li>Khai báo chu kỳ kinh nguyệt dễ dàng</li>
                <li>Nhắc nhở thời điểm rụng trứng, khả năng mang thai cao/thấp</li>
                <li>Nhắc uống thuốc tránh thai đúng giờ</li>
                <li>Phân tích biểu đồ sức khỏe sinh sản</li>
              </ul>
            </div>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 2px 8px rgba(17,153,142,0.1)",
              border: "1px solid rgba(17,153,142,0.1)"
            }}>
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>💬</div>
              <h3 style={{ color: "#11998e", textAlign: "center", marginBottom: 12 }}>Tư vấn giới tính &amp; sức khỏe sinh sản</h3>
              <ul style={{ fontSize: 14, color: "#11998e", margin: 0, paddingLeft: 20 }}>
                <li>Đặt lịch tư vấn trực tuyến với chuyên gia</li>
                <li>Được tư vấn riêng tư, bảo mật</li>
                <li>Gửi câu hỏi, thắc mắc về giới tính, tâm sinh lý, mối quan hệ,...</li>
              </ul>
            </div>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 2px 8px rgba(17,153,142,0.1)",
              border: "1px solid rgba(17,153,142,0.1)"
            }}>
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>🧪</div>
              <h3 style={{ color: "#11998e", textAlign: "center", marginBottom: 12 }}>Xét nghiệm các bệnh STIs</h3>
              <ul style={{ fontSize: 14, color: "#11998e", margin: 0, paddingLeft: 20 }}>
                <li>Danh sách dịch vụ xét nghiệm đa dạng: HIV, HPV, Lậu, Giang mai, Chlamydia,...</li>
                <li>Đặt lịch và theo dõi quá trình xét nghiệm</li>
                <li>Trả kết quả online an toàn và nhanh chóng</li>
                <li>Hỗ trợ sau xét nghiệm và hướng điều trị</li>
              </ul>
            </div>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 2px 8px rgba(17,153,142,0.1)",
              border: "1px solid rgba(17,153,142,0.1)"
            }}>
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>💰</div>
              <h3 style={{ color: "#11998e", textAlign: "center", marginBottom: 12 }}>Thông tin dịch vụ rõ ràng</h3>
              <ul style={{ fontSize: 14, color: "#11998e", margin: 0, paddingLeft: 20 }}>
                <li>Bảng giá xét nghiệm minh bạch, cập nhật liên tục</li>
                <li>Gói dịch vụ phù hợp cho từng đối tượng (nam, nữ, cặp đôi,...)</li>
              </ul>
            </div>
          </div>
        </section>        {/* Testimonials Section */}
        <section id="testimonials" data-animate="fade-in" className={`fade-in-section ${visibleSections.has('testimonials') ? 'visible' : ''}`} style={{
          background: "#f8fffe",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 32,
          margin: "32px 0",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Additional floating particles for testimonials section */}
          {showParticles && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 1 }}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={`testimonial-particle-${i}`}
                  style={{
                    position: "absolute",
                    right: `${10 + i * 25}%`,
                    top: `${20 + i * 20}%`,
                    width: `${5 + i * 3}px`,
                    height: `${5 + i * 3}px`,
                    background: `rgba(17,153,142,${0.15 + i * 0.1})`,
                    borderRadius: "50%",
                    animation: `particleFloat ${3.5 + i}s ease-in-out infinite`,
                    animationDelay: `${i * 1.2}s`
                  }}
                />
              ))}
            </div>
          )}
          <h2 style={{ 
            color: "#11998e", 
            marginTop: 0, 
            display: "flex", 
            alignItems: "center", 
            gap: 8, 
            justifyContent: "center", 
            marginBottom: 32 
          }}>
            <span role="img" aria-label="testimonial">💬</span> Khách Hàng Nói Gì Về Chúng Tôi
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
            gap: 24 
          }}>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 4px 12px rgba(17,153,142,0.08)",
              border: "1px solid rgba(17,153,142,0.1)",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: -10,
                left: 20,
                background: "#11998e",
                color: "#fff",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20
              }}>💭</div>
              <div style={{ marginTop: 20 }}>
                <p style={{ 
                  fontSize: 15, 
                  fontStyle: "italic", 
                  color: "#555", 
                  marginBottom: 16,
                  lineHeight: 1.6
                }}>
                  "Dịch vụ tuyệt vời! Đội ngũ tư vấn rất chuyên nghiệp và thân thiện. Tôi cảm thấy an toàn và được bảo mật hoàn toàn khi sử dụng dịch vụ."
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    background: "linear-gradient(135deg, #11998e, #38ef7d)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 600
                  }}>L</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#11998e" }}>Linh Nguyen</div>
                    <div style={{ fontSize: 14, color: "#666" }}>Khách hàng thân thiết</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 4px 12px rgba(17,153,142,0.08)",
              border: "1px solid rgba(17,153,142,0.1)",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: -10,
                left: 20,
                background: "#38ef7d",
                color: "#fff",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20
              }}>⭐</div>
              <div style={{ marginTop: 20 }}>
                <p style={{ 
                  fontSize: 15, 
                  fontStyle: "italic", 
                  color: "#555", 
                  marginBottom: 16,
                  lineHeight: 1.6
                }}>
                  "Xét nghiệm nhanh chóng, kết quả chính xác. Đặc biệt là ứng dụng theo dõi chu kỳ rất hữu ích và dễ sử dụng."
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    background: "linear-gradient(135deg, #38ef7d, #11998e)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 600
                  }}>M</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#11998e" }}>Mai Tran</div>
                    <div style={{ fontSize: 14, color: "#666" }}>Đã sử dụng 2 năm</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 4px 12px rgba(17,153,142,0.08)",
              border: "1px solid rgba(17,153,142,0.1)",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: -10,
                left: 20,
                background: "#fbc02d",
                color: "#fff",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20
              }}>👍</div>
              <div style={{ marginTop: 20 }}>
                <p style={{ 
                  fontSize: 15, 
                  fontStyle: "italic", 
                  color: "#555", 
                  marginBottom: 16,
                  lineHeight: 1.6
                }}>
                  "Bác sĩ tư vấn rất tận tâm và giải đáp mọi thắc mắc một cách chi tiết. Cảm ơn đội ngũ đã hỗ trợ tôi rất nhiều."
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    background: "linear-gradient(135deg, #fbc02d, #11998e)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 600
                  }}>H</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#11998e" }}>Huy Le</div>
                    <div style={{ fontSize: 14, color: "#666" }}>Tư vấn trực tuyến</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>        <section id="nhan-vien" data-animate="fade-in" className={`fade-in-section ${visibleSections.has('nhan-vien') ? 'visible' : ''}`} style={{
          background: "#e6fff4",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 24,
          margin: "32px 0"
        }}>
          <h2 style={{ color: "#11998e", marginTop: 0, display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            <span role="img" aria-label="doctor">👨‍⚕️</span> Đội Ngũ Nhân Viên Y Tế
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ 
              flexShrink: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <img
                src="/Doctor.png"
                alt="Đội ngũ bác sĩ chuyên khoa"
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: "50%",
                  boxShadow: "0 4px 12px rgba(17,153,142,0.15)",
                  border: "4px solid #11998e"
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 300 }}>
              <p style={{ fontSize: 17, marginBottom: 16 }}>
                Đội ngũ nhân viên y tế chuyên nghiệp với kinh nghiệm nhiều năm trong lĩnh vực chăm sóc sức khỏe sinh sản và giới tính:
              </p>
              <ul style={{ fontSize: 16, color: "#11998e", margin: 0, paddingLeft: 24 }}>
                <li>🔸 Bác sĩ chuyên khoa Sản phụ khoa với hơn 10 năm kinh nghiệm</li>
                <li>🔸 Bác sĩ chuyên khoa Nam học và Andrologia</li>
                <li>🔸 Điều dưỡng viên được đào tạo chuyên sâu về chăm sóc sinh sản</li>
                <li>🔸 Kỹ thuật viên xét nghiệm chuyên nghiệp</li>
                <li>🔸 Nhân viên hỗ trợ khách hàng 24/7</li>
              </ul>
            </div>
          </div>
        </section>        <section id="tu-van-vien" data-animate="fade-in" className={`fade-in-section ${visibleSections.has('tu-van-vien') ? 'visible' : ''}`} style={{
          background: "#e6fff4",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 24,
          margin: "32px 0"
        }}>
          <h2 style={{ color: "#11998e", marginTop: 0, display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            <span role="img" aria-label="counselor">🧑‍💼</span> Tư Vấn Viên Chuyên Nghiệp
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap-reverse" }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <p style={{ fontSize: 17, marginBottom: 16 }}>
                Đội ngũ tư vấn viên giàu kinh nghiệm, được đào tạo chuyên sâu về tâm lý học và giáo dục giới tính:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: "0 2px 6px rgba(17,153,142,0.08)"
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🧠</div>
                  <h4 style={{ color: "#11998e", margin: "0 0 8px 0" }}>Tư vấn Tâm lý</h4>
                  <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Chuyên về sức khỏe tình dục và tâm lý</p>
                </div>
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: "0 2px 6px rgba(17,153,142,0.08)"
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎓</div>
                  <h4 style={{ color: "#11998e", margin: "0 0 8px 0" }}>Giáo dục Giới tính</h4>
                  <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Chứng chỉ quốc tế về giáo dục giới tính</p>
                </div>
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: "0 2px 6px rgba(17,153,142,0.08)"
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>❤️</div>
                  <h4 style={{ color: "#11998e", margin: "0 0 8px 0" }}>Mối quan hệ</h4>
                  <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Hỗ trợ các vấn đề về mối quan hệ</p>
                </div>
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: "0 2px 6px rgba(17,153,142,0.08)"
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👶</div>
                  <h4 style={{ color: "#11998e", margin: "0 0 8px 0" }}>Kế hoạch hóa gia đình</h4>
                  <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Tư vấn chuyên nghiệp về kế hoạch sinh đẻ</p>
                </div>
              </div>
            </div>
            <div style={{ 
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16
            }}>
              <div style={{
                width: 180,
                height: 180,
                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(17,153,142,0.3)"
              }}>
                <span style={{ fontSize: 72, color: "#fff" }}>🧑‍💼</span>
              </div>
              <div style={{
                background: "#fff",
                borderRadius: 8,
                padding: 12,
                boxShadow: "0 2px 8px rgba(17,153,142,0.1)",
                textAlign: "center"
              }}>
                <p style={{ fontSize: 14, color: "#11998e", margin: 0, fontWeight: 600 }}>
                  🔒 Bảo mật tuyệt đối<br/>
                  💻 Tư vấn online & offline
                </p>
              </div>
            </div>
          </div>
        </section>        <section id="blog" data-animate="fade-in" className={`fade-in-section ${visibleSections.has('blog') ? 'visible' : ''}`} style={{
          background: "#e6fff4",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 24,
          margin: "32px 0"
        }}>
          <h2 style={{ color: "#11998e", marginTop: 0, display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            <span role="img" aria-label="book">📚</span> Chuyên mục Blog: Kiến Thức Sức Khỏe Giới Tính
          </h2>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <p style={{ fontSize: 17, marginBottom: 16 }}>
                Chúng tôi chia sẻ những bài viết thiết thực, cập nhật, khoa học về:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: "0 2px 6px rgba(17,153,142,0.08)",
                  borderLeft: "4px solid #11998e"
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🛡️</div>
                  <h4 style={{ color: "#11998e", margin: "0 0 8px 0" }}>Giáo dục giới tính an toàn</h4>
                  <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Cho mọi lứa tuổi</p>
                </div>
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: "0 2px 6px rgba(17,153,142,0.08)",
                  borderLeft: "4px solid #38ef7d"
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⚕️</div>
                  <h4 style={{ color: "#11998e", margin: "0 0 8px 0" }}>Sức khỏe sinh sản</h4>
                  <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Điều cần biết cho nữ giới & nam giới</p>
                </div>
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: "0 2px 6px rgba(17,153,142,0.08)",
                  borderLeft: "4px solid #fbc02d"
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🦠</div>
                  <h4 style={{ color: "#11998e", margin: "0 0 8px 0" }}>Phòng tránh STIs</h4>
                  <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Cách phòng tránh và nhận biết bệnh lây truyền</p>
                </div>
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: "0 2px 6px rgba(17,153,142,0.08)",
                  borderLeft: "4px solid #1976d2"
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📅</div>
                  <h4 style={{ color: "#11998e", margin: "0 0 8px 0" }}>Chu kỳ kinh nguyệt</h4>
                  <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Hiểu rõ chu kỳ và dấu hiệu rụng trứng</p>
                </div>
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: "0 2px 6px rgba(17,153,142,0.08)",
                  borderLeft: "4px solid #e91e63"
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>💝</div>
                  <h4 style={{ color: "#11998e", margin: "0 0 8px 0" }}>Tư vấn tâm lý</h4>
                  <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Tình dục học, quan hệ lành mạnh</p>
                </div>
              </div>
            </div>
            <div style={{ 
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16
            }}>
              <div style={{
                width: 150,
                height: 150,
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(25,118,210,0.3)"
              }}>
                <span style={{ fontSize: 56, color: "#fff" }}>📖</span>
              </div>
              <div style={{
                background: "#fff",
                borderRadius: 8,
                padding: 12,
                boxShadow: "0 2px 8px rgba(17,153,142,0.1)",
                textAlign: "center"
              }}>
                <p style={{ fontSize: 14, color: "#11998e", margin: 0, fontWeight: 600 }}>
                  📝 Bài viết khoa học<br/>
                  🔄 Cập nhật liên tục
                </p>
              </div>
            </div>
          </div>
        </section>      </main>

      {/* Call to Action Section */}
      <section style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "50px 20px",
        textAlign: "center",
        color: "#fff",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          zIndex: 0
        }}></div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ 
            fontSize: 32, 
            marginBottom: 16, 
            fontWeight: 700,
            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
          }}>
            🚀 Bắt Đầu Chăm Sóc Sức Khỏe Ngay Hôm Nay!
          </h2>
          <p style={{ 
            fontSize: 18, 
            marginBottom: 30, 
            opacity: 0.9,
            lineHeight: 1.6
          }}>
            Đừng chờ đợi! Đăng ký ngay để nhận tư vấn miễn phí và bảo vệ sức khỏe của bạn
          </p>
          <div style={{ 
            display: "flex", 
            gap: 20, 
            justifyContent: "center", 
            flexWrap: "wrap" 
          }}>
            <button style={{
              background: "#fff",
              color: "#667eea",
              border: "none",
              borderRadius: 25,
              padding: "15px 30px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
            }}>
              🩺 Đặt Lịch Tư Vấn
            </button>
            <button style={{
              background: "transparent",
              color: "#fff",
              border: "2px solid #fff",
              borderRadius: 25,
              padding: "15px 30px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#fff";
              e.target.style.color = "#667eea";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#fff";
            }}>
              📞 Hotline: 1900-1234
            </button>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div style={{
        position: "fixed",
        bottom: 30,
        right: 30,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        zIndex: 1000
      }}>
        <div style={{
          background: "#25d366",
          color: "#fff",
          borderRadius: "50%",
          width: 60,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(37,211,102,0.4)",
          fontSize: 24,
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 6px 16px rgba(37,211,102,0.6)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 12px rgba(37,211,102,0.4)";
        }}>
          💬
        </div>
        <div style={{
          background: "#11998e",
          color: "#fff",
          borderRadius: "50%",
          width: 60,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(17,153,142,0.4)",
          fontSize: 24,
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 6px 16px rgba(17,153,142,0.6)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 12px rgba(17,153,142,0.4)";
        }}
        onClick={() => setShowCalculator(true)}>
          📅
        </div>
        <div style={{
          background: "#e91e63",
          color: "#fff",
          borderRadius: "50%",
          width: 60,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(233,30,99,0.4)",
          fontSize: 24,
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 6px 16px rgba(233,30,99,0.6)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 12px rgba(233,30,99,0.4)";
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          ⬆️
        </div>
      </div>      <footer style={{ background: "#e6fff4", color: "#11998e", padding: "20px", textAlign: "center" }}>
        &copy; {new Date().getFullYear()} Sức khỏe giới tính - Một sản phẩm của cơ sở y tế Việt Nam
      </footer>
    </div>
  );
};

export default App;