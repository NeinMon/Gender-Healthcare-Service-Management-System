// Helper functions for App component

// Auth related functions
export const checkUserGender = async (userId, setUserGender) => {
  if (!userId) return null;
  
  try {
    const response = await fetch(`http://localhost:8080/api/users/${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const userData = await response.json();
      const gender = userData.gender;
      setUserGender(gender);
      return gender;
    }
  } catch (err) {
    console.error('Error checking user gender:', err);
  }
  return null;
};

export const handleLogout = (setCurrentUser, setIsLoggedIn, setUserGender) => {
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('userId');
  localStorage.removeItem('email');
  localStorage.removeItem('fullName');
  localStorage.removeItem('role');
  setCurrentUser(null);
  setIsLoggedIn(false);
  setUserGender(null);
};

export const handlePeriodTrackingClick = async (e, isLoggedIn, userGender, checkUserGender, navigate) => {
  e.preventDefault();
  
  if (!isLoggedIn) {
    navigate('/login');
    return;
  }
  
  const userId = localStorage.getItem('userId');
  let gender = userGender;
  
  // Nếu chưa có thông tin giới tính, kiểm tra lại
  if (!gender && userId) {
    gender = await checkUserGender(userId);
  }
  
  if (gender === 'Nữ' || gender === 'nữ' || gender === 'NỮ') {
    navigate('/period-tracking');
  } else {
    alert('Tính năng theo dõi chu kỳ kinh nguyệt chỉ dành cho người dùng nữ.');
  }
};

// Form handling functions
export const handleRegisterChange = (e, registerData, setRegisterData) => {
  setRegisterData({ ...registerData, [e.target.name]: e.target.value });
};

export const handleRegisterSubmit = (e, registerData, setShowRegister, setRegisterData) => {
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

export const handleLoginChange = (e, loginData, setLoginData) => {
  setLoginData({ ...loginData, [e.target.name]: e.target.value });
};

export const handleLoginSubmit = (e, loginData, setCurrentUser, setIsLoggedIn, checkUserGender, setShowLogin, setLoginData) => {
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
  
  // Kiểm tra giới tính sau khi đăng nhập
  checkUserGender(userData.userID);
  
  alert("Đăng nhập thành công!");
  setShowLogin(false);
  setLoginData({ email: "", password: "" });
};

// Animation functions
export const animateCounter = (target, current, setter, increment) => {
  if (current < target) {
    setTimeout(() => {
      setter(Math.min(current + increment, target));
    }, 50);
  }
};

export const initializeAnimatedCounters = (animatedStats, setAnimatedStats) => {
  animateCounter(10000, animatedStats.customers, (val) => 
    setAnimatedStats(prev => ({ ...prev, customers: val })), 200);
  animateCounter(50000, animatedStats.tests, (val) => 
    setAnimatedStats(prev => ({ ...prev, tests: val })), 1000);
  animateCounter(98, animatedStats.satisfaction, (val) => 
    setAnimatedStats(prev => ({ ...prev, satisfaction: val })), 2);
  animateCounter(5, animatedStats.experience, (val) => 
    setAnimatedStats(prev => ({ ...prev, experience: val })), 1);
};

// Event handlers
export const handleClickOutside = (event, showConsultationDropdown, showTestBookingDropdown, showQuestionDropdown, setShowConsultationDropdown, setShowTestBookingDropdown, setShowQuestionDropdown) => {
  if (showConsultationDropdown && !event.target.closest('.consultation-dropdown')) {
    setShowConsultationDropdown(false);
  }
  if (showTestBookingDropdown && !event.target.closest('.test-booking-dropdown')) {
    setShowTestBookingDropdown(false);
  }
  if (showQuestionDropdown && !event.target.closest('.question-dropdown')) {
    setShowQuestionDropdown(false);
  }
};

// Intersection Observer setup
export const setupIntersectionObserver = (setVisibleSections) => {
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
};

// Data constants
export const carouselImages = [
  { src: "/dichvuchamsoc.jpg", alt: "Dịch vụ chăm sóc sức khỏe" },
  { src: "/Doctor2.jpg", alt: "Đội ngũ y bác sĩ" },
  { src: "/ongnghiem.jpg", alt: "Xét nghiệm chuyên nghiệp" },
  { src: "/thietbi.jpg", alt: "Thiết bị y tế hiện đại" }
];
