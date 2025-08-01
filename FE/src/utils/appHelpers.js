// Các hàm hỗ trợ cho component App chính

// Các hàm liên quan đến xác thực và quản lý người dùng
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
    console.error('Lỗi khi kiểm tra giới tính người dùng:', err);
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
  
  // Nếu chưa có thông tin giới tính, kiểm tra lại từ server
  if (!gender && userId) {
    gender = await checkUserGender(userId);
  }
  
  if (gender === 'Nữ' || gender === 'nữ' || gender === 'NỮ') {
    navigate('/period-tracking');
  } else {
    alert('Tính năng theo dõi chu kỳ kinh nguyệt chỉ dành cho người dùng nữ.');
  }
};

// Các hàm xử lý form đăng ký và đăng nhập
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
  
  // Mô phỏng đăng nhập thành công và cập nhật trạng thái
  const userData = {
    userID: 1,
    fullName: "Người dùng",
    email: loginData.email,
    role: "USER"
  };
  
  // Lưu thông tin người dùng vào localStorage
  localStorage.setItem('loggedInUser', JSON.stringify(userData));
  localStorage.setItem('userId', userData.userID);
  localStorage.setItem('email', userData.email);
  localStorage.setItem('fullName', userData.fullName);
  localStorage.setItem('role', userData.role);
  
  // Cập nhật trạng thái ứng dụng
  setCurrentUser(userData);
  setIsLoggedIn(true);
  
  // Kiểm tra giới tính người dùng sau khi đăng nhập thành công
  checkUserGender(userData.userID);
  
  alert("Đăng nhập thành công!");
  setShowLogin(false);
  setLoginData({ email: "", password: "" });
};

// Các hàm tạo hiệu ứng animation cho số liệu thống kê
export const animateCounter = (target, current, setter, increment) => {
  if (current < target) {
    setTimeout(() => {
      setter(Math.min(current + increment, target));
    }, 50);
  }
};

export const initializeAnimatedCounters = (animatedStats, setAnimatedStats) => {
  // Khởi tạo animation cho số lượng khách hàng
  animateCounter(10000, animatedStats.customers, (val) => 
    setAnimatedStats(prev => ({ ...prev, customers: val })), 200);
  // Khởi tạo animation cho số lượng xét nghiệm
  animateCounter(50000, animatedStats.tests, (val) => 
    setAnimatedStats(prev => ({ ...prev, tests: val })), 1000);
  // Khởi tạo animation cho tỷ lệ hài lòng
  animateCounter(98, animatedStats.satisfaction, (val) => 
    setAnimatedStats(prev => ({ ...prev, satisfaction: val })), 2);
  // Khởi tạo animation cho số năm kinh nghiệm
  animateCounter(5, animatedStats.experience, (val) => 
    setAnimatedStats(prev => ({ ...prev, experience: val })), 1);
};

// Các hàm xử lý sự kiện người dùng
export const handleClickOutside = (event, showConsultationDropdown, showTestBookingDropdown, showQuestionDropdown, setShowConsultationDropdown, setShowTestBookingDropdown, setShowQuestionDropdown) => {
  // Đóng dropdown tư vấn nếu click bên ngoài
  if (showConsultationDropdown && !event.target.closest('.consultation-dropdown')) {
    setShowConsultationDropdown(false);
  }
  // Đóng dropdown đặt xét nghiệm nếu click bên ngoài
  if (showTestBookingDropdown && !event.target.closest('.test-booking-dropdown')) {
    setShowTestBookingDropdown(false);
  }
  // Đóng dropdown câu hỏi nếu click bên ngoài
  if (showQuestionDropdown && !event.target.closest('.question-dropdown')) {
    setShowQuestionDropdown(false);
  }
};

// Thiết lập Intersection Observer để theo dõi các phần tử hiển thị trên màn hình
export const setupIntersectionObserver = (setVisibleSections) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Lấy ID của phần tử hoặc tạo ID mặc định
          const id = entry.target.id || entry.target.getAttribute('data-section-id') || 'statistics';
          setVisibleSections(prev => new Set([...prev, id]));
        }
      });
    },
    { threshold: 0.1, rootMargin: '50px' }
  );

  // Theo dõi tất cả các phần tử có hiệu ứng fade-in
  const sections = document.querySelectorAll('[data-animate="fade-in"]');
  sections.forEach((section, index) => {
    // Thêm data-section-id cho các phần tử không có id
    if (!section.id) {
      section.setAttribute('data-section-id', `section-${index}`);
    }
    observer.observe(section);
  });

  // Trả về hàm cleanup để ngắt kết nối observer
  return () => observer.disconnect();
};

// Dữ liệu hình ảnh cho carousel trên trang chủ
export const carouselImages = [
  { src: "/dichvuchamsoc.jpg", alt: "Dịch vụ chăm sóc sức khỏe" },
  { src: "/Doctor2.jpg", alt: "Đội ngũ y bác sĩ" },
  { src: "/ongnghiem.jpg", alt: "Xét nghiệm chuyên nghiệp" },
  { src: "/thietbi.jpg", alt: "Thiết bị y tế hiện đại" }
];
