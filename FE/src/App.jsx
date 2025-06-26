import React, { useState } from "react";
import { Link } from "react-router-dom";

const App = () => {
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
  const [animatedStats, setAnimatedStats] = useState({
    customers: 0,
    tests: 0,
    satisfaction: 0,
    experience: 0
  });  const [showParticles, setShowParticles] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [isContentLoading, setIsContentLoading] = useState(true);

  // Thêm state để theo dõi trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showConsultationDropdown, setShowConsultationDropdown] = useState(false);
  const [showQuestionDropdown, setShowQuestionDropdown] = useState(false);

  // Kiểm tra trạng thái đăng nhập khi component mount
  React.useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        setCurrentUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('loggedInUser');
      }
    }
  }, []);

  // Hàm đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('fullName');
    localStorage.removeItem('role');
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

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

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showConsultationDropdown && !event.target.closest('.consultation-dropdown')) {
        setShowConsultationDropdown(false);
      }
      if (showQuestionDropdown && !event.target.closest('.question-dropdown')) {
        setShowQuestionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConsultationDropdown, showQuestionDropdown]);
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
    { src: "/dichvuchamsoc.jpg", alt: "Dịch vụ chăm sóc sức khỏe" },
    { src: "/Doctor2.jpg", alt: "Đội ngũ y bác sĩ" },
    { src: "/ongnghiem.jpg", alt: "Xét nghiệm chuyên nghiệp" },
    { src: "/thietbi.jpg", alt: "Thiết bị y tế hiện đại" }
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
    
    // Simulate login success và cập nhật state
    const userData = {
      userID: 1,
      fullName: "Người dùng",
      email: loginData.email,
      role: "USER"
    };
    
    // Lưu vào localStorage
    localStorage.setItem('loggedInUser', JSON.stringify(userData));
    localStorage.setItem('userId', userData.userID);
    localStorage.setItem('email', userData.email);
    localStorage.setItem('fullName', userData.fullName);
    localStorage.setItem('role', userData.role);
    
    // Cập nhật state
    setCurrentUser(userData);
    setIsLoggedIn(true);
    
    alert("Đăng nhập thành công!");
    setShowLogin(false);
    setLoginData({ email: "", password: "" });
  };

  return (
    <div style={{
      backgroundColor: "#f0f9ff !important",
      background: "#f0f9ff !important",
      minHeight: "100vh",
      colorScheme: "light",
      width: "100vw",
      margin: 0,
      padding: 0
    }}>
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
      </style>      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 0,
        position: "relative"
      }}>        <div style={{
          position: "absolute",
          top: 15, // moved to top corner
          right: 25, // keep right position
          display: "flex",
          gap: 10,
          zIndex: 2
        }}>
          {isLoggedIn ? (
            // Hiển thị avatar khi đã đăng nhập
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0891b2, #22d3ee)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "3px solid #fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease"
              }}
              onClick={() => window.location.href = "/user-account"}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.1)";
                e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
              }}
              title={`Tài khoản của ${currentUser?.fullName}`}
            >
              <span style={{ color: "#fff", fontSize: 20, fontWeight: 600 }}>
                {currentUser?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          ) : (
            // Hiển thị khi chưa đăng nhập
            <>
              <button
                style={{
                  background: "#fff",
                  color: "#0891b2",
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
                  background: "#0891b2",
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
            </>
          )}
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
          Dịch Vụ Chăm Sóc Sức Khỏe Giới Tính
        </h1>        <nav
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            margin: "0 0 8px 0",
            padding: "0 40px"
          }}
        >
          <a 
            href="#gioi-thieu" 
            style={{ 
              color: "#fff", 
              fontWeight: 600, 
              fontSize: 16,
              textDecoration: "none",
              background: "rgba(255,255,255,0.4)",
              padding: "12px 32px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.6)",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              minWidth: "140px",
              textAlign: "center"
            }}
            onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.5)"; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)"; }}
            onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.4)"; e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)"; }}
          >
            Giới thiệu
          </a>
          <a
            href={isLoggedIn ? "/period-tracking" : "/login"}
            style={{ color: "#fff", fontWeight: 600, fontSize: 16, textDecoration: "none", background: "rgba(255,255,255,0.4)", padding: "12px 32px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.6)", transition: "all 0.3s ease", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", minWidth: "140px", textAlign: "center" }}
            onClick={e => { e.preventDefault(); window.location.href = isLoggedIn ? '/period-tracking' : '/login'; }}
            onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.5)"; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)"; }}
            onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.4)"; e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)"; }}
          >
            Theo dõi chu kỳ kinh nguyệt
          </a>
          <div 
            className="consultation-dropdown"
            style={{ 
              position: "relative",
              display: "inline-block"
            }}
          >
            <a
              href="#"
              style={{ 
                color: "#fff", 
                fontWeight: 600, 
                fontSize: 16, 
                textDecoration: "none", 
                background: "rgba(255,255,255,0.4)", 
                padding: "12px 32px", 
                borderRadius: 8, 
                border: "1px solid rgba(255,255,255,0.6)", 
                transition: "all 0.3s ease", 
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)", 
                minWidth: "140px", 
                textAlign: "center",
                display: "block"
              }}
              onClick={(e) => { 
                e.preventDefault(); 
                if (!isLoggedIn) {
                  window.location.href = '/login';
                } else {
                  setShowConsultationDropdown(!showConsultationDropdown);
                }
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
              Đặt lịch tư vấn {isLoggedIn ? "▼" : ""}
            </a>
            
            {/* Dropdown menu */}
            {isLoggedIn && showConsultationDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: "1px solid rgba(0,0,0,0.1)",
                minWidth: "200px",
                zIndex: 1000,
                marginTop: 4
              }}>
                <a
                  href="/consultation-booking"
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    color: "#0891b2",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    borderBottom: "1px solid rgba(0,0,0,0.1)",
                    transition: "background 0.2s ease"
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowConsultationDropdown(false);
                    window.location.href = "/consultation-booking";
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f0f9ff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  📅 Đặt lịch tư vấn mới
                </a>
                <a
                  href="/my-appointments"
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    color: "#0891b2",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    transition: "background 0.2s ease"
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowConsultationDropdown(false);
                    window.location.href = "/my-appointments";
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f0f9ff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  📖 Xem lịch của tôi
                </a>
              </div>
            )}
          </div>
          <a
            href={isLoggedIn ? "/test-booking" : "/login"}
            style={{ color: "#fff", fontWeight: 600, fontSize: 16, textDecoration: "none", background: "rgba(255,255,255,0.4)", padding: "12px 32px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.6)", transition: "all 0.3s ease", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", minWidth: "140px", textAlign: "center" }}
            onClick={e => { e.preventDefault(); window.location.href = isLoggedIn ? '/test-booking' : '/login'; }}
            onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.5)"; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)"; }}
            onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.4)"; e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)"; }}
          >
            Đặt lịch xét nghiệm
          </a>
          <div 
            className="question-dropdown"
            style={{ 
              position: "relative",
              display: "inline-block"
            }}
          >
            <a
              href="#"
              style={{ 
                color: "#fff", 
                fontWeight: 600, 
                fontSize: 16, 
                textDecoration: "none", 
                background: "rgba(255,255,255,0.4)", 
                padding: "12px 32px", 
                borderRadius: 8, 
                border: "1px solid rgba(255,255,255,0.6)", 
                transition: "all 0.3s ease", 
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)", 
                minWidth: "140px", 
                textAlign: "center",
                display: "block"
              }}
              onClick={(e) => { 
                e.preventDefault(); 
                if (!isLoggedIn) {
                  window.location.href = '/login';
                } else {
                  setShowQuestionDropdown(!showQuestionDropdown);
                }
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
              Đặt câu hỏi cho tư vấn viên {isLoggedIn ? "▼" : ""}
            </a>
            
            {/* Dropdown menu */}
            {isLoggedIn && showQuestionDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: "1px solid rgba(0,0,0,0.1)",
                minWidth: "220px",
                zIndex: 1000,
                marginTop: 4
              }}>
                <a
                  href="/ask-question"
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    color: "#0891b2",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    borderBottom: "1px solid rgba(0,0,0,0.1)",
                    transition: "background 0.2s ease"
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowQuestionDropdown(false);
                    window.location.href = "/ask-question";
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f0f9ff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  ❓ Đặt câu hỏi mới
                </a>
                <a
                  href="/user-questions"
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    color: "#0891b2",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    transition: "background 0.2s ease"
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowQuestionDropdown(false);
                    window.location.href = "/user-questions";
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f0f9ff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  📋 Xem câu hỏi của tôi
                </a>
              </div>
            )}
          </div>
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
            <h2 style={{ color: "#0891b2", margin: 0, textAlign: "center" }}>Đăng ký tài khoản</h2>
            <label>
              Họ và tên:
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #0891b2", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #0891b2", marginTop: 4 }}
              />
            </label>
            <label>
              Giới tính:
              <select
                name="gender"
                value={registerData.gender}
                onChange={handleRegisterChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #0891b2", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #0891b2", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #0891b2", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #0891b2", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #0891b2", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #0891b2", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #0891b2", marginTop: 4 }}
              />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                style={{
                  background: "#b2dfdb",
                  color: "#0891b2",
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
                  background: "#0891b2",
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
            <h2 style={{ color: "#0891b2", margin: 0, textAlign: "center" }}>Đăng nhập</h2>
            <label>
              Tài khoản (Email):
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #0891b2", marginTop: 4 }}
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
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #0891b2", marginTop: 4 }}
              />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                style={{
                  background: "#b2dfdb",
                  color: "#0891b2",
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
                  background: "#0891b2",
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
        padding: "15px 20px",
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
            maxWidth: 500,
            height: 200,
            margin: "0 auto 15px auto",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 12px 32px rgba(17,153,142,0.2)"
          }}>
            <div style={{
              display: "flex",
              transition: "transform 0.5s ease-in-out",
              transform: `translateX(-${currentImageIndex * 100}%)`
            }}>              {carouselImages.map((image, index) => (
                <div
                  key={index}
                  style={{
                    minWidth: "100%",
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: 600,
                    position: "relative"
                  }}
                >
                  <img 
                    src={image.src}
                    alt={image.alt}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      top: 0,
                      left: 0
                    }}
                  />
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
                        {index === 0 ? "" : index === 1 ? "" : index === 2 ? "" :"" }
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
            fontSize: 32,
            color: "#0891b2",
            marginBottom: 10,
            fontWeight: 700,
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            🌟 Chăm Sóc Sức Khỏe Giới Tính Toàn Diện
          </h1>
          <p style={{
            fontSize: 16,
            color: "#555",
            marginBottom: 40,
            maxWidth: 800,
            margin: "0 auto 15px auto",
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
                <div style={{ fontWeight: 600, color: "#0891b2" }}>Chuyên nghiệp</div>
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
                <div style={{ fontWeight: 600, color: "#0891b2" }}>Bảo mật</div>
                <div style={{ fontSize: 14, color: "#666" }}>Thông tin an toàn</div>
              </div>
            </div>            <div style={{
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
                <div style={{ fontWeight: 600, color: "#0891b2" }}>Tư vấn 24/7</div>
                <div style={{ fontSize: 14, color: "#666" }}>Hỗ trợ liên tục</div>
              </div>
            </div>
          </div>        </div>
        
      </section>

      <main style={{ padding: "10px 20px" }}>
        <section id="dich-vu"data-animate="fade-in" className={`fade-in-section ${visibleSections.has('dich-vu') ? 'visible' : ''}`} style={{
          background: "#e0f2fe",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(17,153,142,0.07)",
          padding: 15,
          margin: "10px 0"
        }}>
          <h2 style={{ color: "#0891b2", marginTop: 0, display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 16 }}>
            <span role="img" aria-label="stethoscope">🩺</span> Dịch Vụ Cung Cấp
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 15, marginBottom: 15 }}>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 15,
              boxShadow: "0 2px 8px rgba(17,153,142,0.1)",
              border: "1px solid rgba(17,153,142,0.1)"
            }}>
              <div style={{ fontSize: 40, textAlign: "center", marginBottom: 10 }}>📅</div>
              <h3 style={{ color: "#0891b2", textAlign: "center", marginBottom: 10 }}>Theo dõi chu kỳ sinh sản</h3>
              <ul style={{ fontSize: 14, color: "#0891b2", margin: 0, paddingLeft: 20 }}>
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
              <div style={{ fontSize: 40, textAlign: "center", marginBottom: 10 }}>💬</div>
              <h3 style={{ color: "#0891b2", textAlign: "center", marginBottom: 10 }}>Tư vấn giới tính &amp; sức khỏe sinh sản</h3>
              <ul style={{ fontSize: 14, color: "#0891b2", margin: 0, paddingLeft: 20 }}>
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
              <div style={{ fontSize: 40, textAlign: "center", marginBottom: 10 }}>🧪</div>
              <h3 style={{ color: "#0891b2", textAlign: "center", marginBottom: 10 }}>Xét nghiệm các bệnh STIs</h3>
              <ul style={{ fontSize: 14, color: "#0891b2", margin: 0, paddingLeft: 20 }}>
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
              <div style={{ fontSize: 40, textAlign: "center", marginBottom: 10 }}>💰</div>
              <h3 style={{ color: "#0891b2", textAlign: "center", marginBottom: 10 }}>Thông tin dịch vụ rõ ràng</h3>              <ul style={{ fontSize: 14, color: "#0891b2", margin: 0, paddingLeft: 20 }}>
                <li>Bảng giá xét nghiệm minh bạch, cập nhật liên tục</li>
                <li>Gói dịch vụ phù hợp cho từng đối tượng (nam, nữ, cặp đôi,...)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Giới Thiệu Dịch Vụ Section */}
        <section id="gioi-thieu" data-animate="fade-in" className={`fade-in-section ${visibleSections.has('gioi-thieu') ? 'visible' : ''}`} style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(17,153,142,0.1)",
          padding: 20,
          margin: "10px 0",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 200,
            height: 200,
            background: "linear-gradient(135deg, rgba(17,153,142,0.1) 0%, rgba(56,239,125,0.05) 100%)",
            borderRadius: "50%",
            transform: "translate(50%, -50%)",
            zIndex: 0
          }}></div>
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ 
              color: "#0891b2", 
              marginTop: 0, 
              display: "flex", 
              alignItems: "center", 
              gap: 12, 
              justifyContent: "center", 
              marginBottom: 15,
              fontSize: 24,
              fontWeight: 700
            }}>
              <span role="img" aria-label="medical">🏥</span> Giới Thiệu Dịch Vụ
            </h2>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
              gap: 15, 
              marginBottom: 15 
            }}>
              <div className="slide-in-left" style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                borderRadius: 12,
                padding: 18,
                border: "2px solid rgba(17,153,142,0.1)",
                transition: "all 0.3s ease"
              }}>
                <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>🔬</div>
                <h3 style={{ color: "#0891b2", textAlign: "center", marginBottom: 16, fontSize: 20 }}>
                  Xét Nghiệm Chuyên Sâu
                </h3>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, textAlign: "center" }}>
                  Cung cấp các dịch vụ xét nghiệm toàn diện về sức khỏe sinh sản và giới tính. 
                  Từ xét nghiệm STI cơ bản đến các gói xét nghiệm chuyên sâu với công nghệ hiện đại.
                </p>
                <div style={{ 
                  marginTop: 16, 
                  padding: 16, 
                  background: "rgba(17,153,142,0.05)", 
                  borderRadius: 8,
                  fontSize: 14,
                  color: "#0891b2"
                }}>
                  ✓ Kết quả chính xác 99.9%<br/>
                  ✓ Bảo mật thông tin tuyệt đối<br/>
                  ✓ Trả kết quả nhanh trong 24-48h
                </div>
              </div>

              <div className="slide-in-right" style={{
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                borderRadius: 12,
                padding: 18,
                border: "2px solid rgba(17,153,142,0.1)",
                transition: "all 0.3s ease"
              }}>
                <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>👩‍⚕️</div>
                <h3 style={{ color: "#0891b2", textAlign: "center", marginBottom: 16, fontSize: 20 }}>
                  Tư Vấn Chuyên Nghiệp
                </h3>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, textAlign: "center" }}>
                  Đội ngũ chuyên gia y tế có kinh nghiệm nhiều năm trong lĩnh vực sức khỏe sinh sản. 
                  Tư vấn riêng tư, tận tâm và chu đáo cho từng khách hàng.
                </p>
                <div style={{ 
                  marginTop: 16, 
                  padding: 16, 
                  background: "rgba(17,153,142,0.05)", 
                  borderRadius: 8,
                  fontSize: 14,
                  color: "#0891b2"
                }}>
                  ✓ Tư vấn trực tuyến 24/7<br/>
                  ✓ Đội ngũ bác sĩ chuyên khoa<br/>
                  ✓ Hỗ trợ tâm lý chuyên nghiệp
                </div>
              </div>

              <div className="scale-in" style={{
                background: "linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)",
                borderRadius: 12,
                padding: 18,
                border: "2px solid rgba(17,153,142,0.1)",
                transition: "all 0.3s ease",
                gridColumn: "span 2"
              }}>
                <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>🛡️</div>
                <h3 style={{ color: "#0891b2", textAlign: "center", marginBottom: 16, fontSize: 20 }}>
                  Cam Kết Chất Lượng & Bảo Mật
                </h3>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                  gap: 20,
                  marginTop: 20
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                    <div style={{ fontWeight: 600, color: "#0891b2", marginBottom: 4 }}>Chứng Nhận ISO</div>
                    <div style={{ fontSize: 14, color: "#475569" }}>Đạt chuẩn quốc tế về chất lượng dịch vụ y tế</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
                    <div style={{ fontWeight: 600, color: "#0891b2", marginBottom: 4 }}>Bảo Mật Tuyệt Đối</div>
                    <div style={{ fontSize: 14, color: "#475569" }}>Mã hóa dữ liệu theo chuẩn quốc tế</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
                    <div style={{ fontWeight: 600, color: "#0891b2", marginBottom: 4 }}>Nhanh Chóng</div>
                    <div style={{ fontSize: 14, color: "#475569" }}>Phục vụ 24/7, kết quả trong ngày</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>💝</div>
                    <div style={{ fontWeight: 600, color: "#0891b2", marginBottom: 4 }}>Tận Tâm</div>
                    <div style={{ fontSize: 14, color: "#475569" }}>Đặt sức khỏe khách hàng lên hàng đầu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Call to Action Section */}      <section style={{
        background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
        padding: "20px 20px",
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
            marginBottom: 20, 
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
          }}>            <Link 
              to={isLoggedIn ? "/consultation-booking" : "/login"} 
              style={{
                background: "#fff",
                color: "#0891b2",
                border: "none",
                borderRadius: 25,
                padding: "15px 30px",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
                textDecoration: "none",
                display: "inline-block"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
              }}
            >
              🩺 Đặt Lịch Tư Vấn
            </Link>
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
              e.target.style.color = "#0891b2";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#fff";
            }}>
              📞 Hotline: 1900-1234
            </button>
          </div>
        </div>      </section>

      {/* Scroll to Top Button */}
      <div style={{
        position: "fixed",
        bottom:  30,
        right: 30,
        zIndex: 1000
      }}>
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
      </div>

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

export default App;
