import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

/**
 * PeriodTracking Component
 * This component allows users to track and visualize their menstrual cycle.
 * It integrates with the Menstrual Cycle API endpoints.
 */
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
  const [hasExistingCycle, setHasExistingCycle] = useState(false);
  const [userGender, setUserGender] = useState(null);
  const [genderCheckComplete, setGenderCheckComplete] = useState(false);
  const [cycleAbnormalities, setCycleAbnormalities] = useState([]);

  // Lấy userid từ localStorage
  const userid = localStorage.getItem('userId');
  
  // Hàm phân tích bất thường chu kỳ kinh nguyệt
  const analyzeCycleAbnormalities = (cycleLength, periodLength) => {
    const abnormalities = [];
    
    // 1. Chu kỳ quá ngắn hoặc quá dài
    if (cycleLength < 21 || cycleLength > 35) {
      abnormalities.push({
        type: 'cycle_length',
        title: 'Chu kỳ kinh nguyệt bất thường',
        description: `Chu kỳ ${cycleLength} ngày ${cycleLength < 21 ? 'quá ngắn' : 'quá dài'} so với bình thường (21-35 ngày). Điều này có thể ảnh hưởng đến khả năng sinh sản và sức khỏe tổng thể.`,
        recommendations: [
          'Xét nghiệm nội tiết tố (FSH, LH, Estradiol, Progesterone, Prolactin, TSH, AMH)',
          'Siêu âm tử cung và buồng trứng (Đánh giá cấu trúc, phát hiện u xơ, polyp, nang, dị dạng)',
          'Xét nghiệm công thức máu đầy đủ (Hồng cầu, Hemoglobin, Hematocrit, Bạch cầu, Tiểu cầu)'
        ],
        severity: 'high',
        advice: 'Chu kỳ bất thường có thể là dấu hiệu của rối loạn nội tiết tố hoặc các vấn đề về sức khỏe sinh sản khác.'
      });
    }
    
    // 2. Kinh nguyệt kéo dài bất thường
    if (periodLength > 7 || periodLength < 2) {
      abnormalities.push({
        type: 'period_length',
        title: 'Thời gian kinh nguyệt bất thường',
        description: `Thời gian kinh nguyệt ${periodLength} ngày ${periodLength > 7 ? 'kéo dài quá mức' : 'quá ngắn'} so với bình thường (2-7 ngày). ${periodLength > 7 ? 'Kinh nguyệt kéo dài có thể gây thiếu máu và mệt mỏi.' : 'Kinh nguyệt quá ngắn có thể ảnh hưởng đến quá trình thải độc tự nhiên của cơ thể.'}`,
        recommendations: [
          'Xét nghiệm công thức máu đầy đủ (Hồng cầu, Hemoglobin, Hematocrit, Bạch cầu, Tiểu cầu)',
          'Xét nghiệm nội tiết tố (FSH, LH, Estradiol, Progesterone, Prolactin, TSH, AMH)',
          'Siêu âm tử cung và buồng trứng (Đánh giá cấu trúc, phát hiện u xơ, polyp, nang, dị dạng)'
        ],
        severity: periodLength > 7 ? 'high' : 'medium',
        advice: periodLength > 7 
          ? 'Kinh nguyệt kéo dài có thể là dấu hiệu của u xơ tử cung, polyp, hoặc rối loạn đông máu.'
          : 'Kinh nguyệt quá ngắn có thể liên quan đến thiếu hụt hormone hoặc vấn đề về lót tử cung.'
      });
    }
    
    // 3. Chu kỳ gần biên giới (cảnh báo nhẹ)
    if ((cycleLength >= 21 && cycleLength <= 24) || (cycleLength >= 32 && cycleLength <= 35)) {
      abnormalities.push({
        type: 'cycle_borderline',
        title: 'Chu kỳ gần biên giới bình thường',
        description: `Chu kỳ ${cycleLength} ngày nằm ở biên giới của phạm vi bình thường. Cần theo dõi để phát hiện sớm những thay đổi bất thường.`,
        recommendations: [
          'Theo dõi chu kỳ thường xuyên trong 3-6 tháng',
          'Xét nghiệm nội tiết tố (FSH, LH, Estradiol, Progesterone, Prolactin, TSH, AMH)',
          'Tham khảo ý kiến bác sĩ nếu chu kỳ tiếp tục thay đổi'
        ],
        severity: 'low',
        advice: 'Hãy ghi chép chu kỳ hàng tháng để theo dõi xu hướng thay đổi.'
      });
    }
    
    // 4. Kinh nguyệt gần biên giới
    if (periodLength === 2 || periodLength === 7) {
      abnormalities.push({
        type: 'period_borderline',
        title: 'Thời gian kinh nguyệt cần theo dõi',
        description: `Thời gian kinh nguyệt ${periodLength} ngày nằm ở biên giới của phạm vi bình thường. Cần quan sát để đảm bảo không có xu hướng xấu đi.`,
        recommendations: [
          'Theo dõi thời gian kinh nguyệt hàng tháng',
          'Xét nghiệm nội tiết tố (FSH, LH, Estradiol, Progesterone, Prolactin, TSH, AMH)',
          'Tham khảo bác sĩ nếu có triệu chứng bất thường khác'
        ],
        severity: 'low',
        advice: periodLength === 2 
          ? 'Kinh nguyệt ngắn cần theo dõi để đảm bảo đủ quá trình thải độc tự nhiên.'
          : 'Kinh nguyệt 7 ngày vẫn bình thường nhưng cần chú ý nếu kéo dài hơn.'
      });
    }
    
    return abnormalities;
  };
  
  // Hàm kiểm tra giới tính của người dùng
  const checkUserGender = async () => {
    if (!userid) {
      console.log('No userid available for checking gender');
      setGenderCheckComplete(true);
      return null;
    }
    
    try {
      console.log(`Checking gender for user ${userid}`);
      const response = await fetch(`http://localhost:8080/api/users/${encodeURIComponent(userid)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Gender check response status:', response.status);
      if (response.ok) {
        const userData = await response.json();
        console.log('User data:', userData);
        const gender = userData.gender;
        setUserGender(gender);
        setGenderCheckComplete(true);
        return gender;
      } else {
        console.error('Error checking user gender:', response.status);
        setGenderCheckComplete(true);
        return null;
      }
    } catch (err) {
      console.error('Network error checking user gender:', err);
      setGenderCheckComplete(true);
      return null;
    }
  };
  
  // Hàm kiểm tra xem user đã có chu kỳ hay chưa
  const checkExistingCycle = async () => {
    if (!userid) {
      console.log('No userid available for checking existing cycle');
      return false;
    }
    
    try {
      console.log(`Checking if user ${userid} has existing cycle data`);
      const response = await fetch(`http://localhost:8080/api/menstrual-cycles/user/${encodeURIComponent(userid)}/exists`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Exists check response status:', response.status);
        if (response.ok) {
        const data = await response.json();
        console.log(`Existing cycle check response:`, data);
        return data.exists === true; // API returns {exists: boolean}
      } else if (response.status === 404) {
        console.log('User not found or no cycle data exists');
        return false;
      } else {
        const errorText = await response.text();
        console.error('Error checking existing cycle:', response.status, errorText);
        return false;
      }
    } catch (err) {
      console.error('Network error checking existing cycle:', err);
      setError(`Không thể kết nối đến server: ${err.message}. Vui lòng kiểm tra kết nối mạng và đảm bảo server đang chạy.`);
      return false;
    }
  };// Hàm lấy dữ liệu chu kỳ mới nhất từ API
  const fetchLatestCycle = async () => {
    setLoading(true);
    setError('');
    try {
      if (!userid) {
        console.log('No userid found, cannot fetch cycle data');
        setLoading(false);
        return;
      }
      
      console.log('Fetching latest cycle data for user:', userid);
      const res = await fetch(`http://localhost:8080/api/menstrual-cycles/user/${encodeURIComponent(userid)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Fetch response status:', res.status);
        if (res.ok) {
        const data = await res.json();
        console.log('Fetched cycle data:', data);
        
        if (data) {
          // Validate data structure
          if (!data.startDate || !data.cycleLength || !data.periodLength) {
            console.error('Invalid data structure received:', data);
            setError('Dữ liệu chu kỳ không hợp lệ');
            setLoading(false);
            return;
          }
          
          // Convert startDate string to Date object for calculations
          const startDate = new Date(data.startDate);
          
          // Validate date
          if (isNaN(startDate.getTime())) {
            console.error('Invalid start date:', data.startDate);
            setError('Ngày bắt đầu không hợp lệ');
            setLoading(false);
            return;
          }
          
          const cycleLength = parseInt(data.cycleLength);
          const periodLength = parseInt(data.periodLength);          // Calculate dates with proper logic
          // Backend endDate represents the end of menstrual period, not the entire cycle
          const periodEndDate = data.endDate ? new Date(data.endDate) : new Date(startDate.getTime() + (periodLength - 1) * 24 * 60 * 60 * 1000);
          const ovulationDate = new Date(startDate.getTime() + (cycleLength - 14) * 24 * 60 * 60 * 1000);
          const ovulationEndDate = new Date(ovulationDate.getTime() + 24 * 60 * 60 * 1000);
          const fertilityStartDate = new Date(ovulationDate.getTime() - 5 * 24 * 60 * 60 * 1000);
          const fertilityEndDate = new Date(ovulationDate.getTime() + 24 * 60 * 60 * 1000);
          const nextCycleDate = new Date(startDate.getTime() + cycleLength * 24 * 60 * 60 * 1000);
          // Calculate cycle end date (chu kỳ kết thúc trước khi chu kỳ mới bắt đầu)
          const cycleEndDate = new Date(nextCycleDate.getTime() - 24 * 60 * 60 * 1000);
          
          setResults({
            periodStart: startDate.toLocaleDateString('vi-VN'),
            periodEnd: periodEndDate.toLocaleDateString('vi-VN'),
            ovulationStart: ovulationDate.toLocaleDateString('vi-VN'),
            ovulationEnd: ovulationEndDate.toLocaleDateString('vi-VN'),
            fertilityStart: fertilityStartDate.toLocaleDateString('vi-VN'),
            fertilityEnd: fertilityEndDate.toLocaleDateString('vi-VN'),
            nextCycleStart: nextCycleDate.toLocaleDateString('vi-VN'),
            cycleEndDate: cycleEndDate.toLocaleDateString('vi-VN'),
            cycleLength: cycleLength,
            periodLength: periodLength
          });
          setIsSubmitted(true);
          
          // Phân tích bất thường chu kỳ
          const abnormalities = analyzeCycleAbnormalities(cycleLength, periodLength);
          setCycleAbnormalities(abnormalities);
          
          // Update form data with fetched values
          setFormData({
            startDate: data.startDate,
            cycleLength: cycleLength,
            periodLength: periodLength
          });
        } else {
          console.log('No cycle data found');
          setIsSubmitted(false);
          setResults(null);
        }} else if (res.status === 404) {
        console.log('No menstrual cycle data found for user');
        // User has no menstrual cycle data yet
        setHasExistingCycle(false);
        setIsSubmitted(false);
        setResults(null);
      } else {
        const errorText = await res.text();
        console.error('API Error:', res.status, errorText);
        throw new Error(`Server error: ${res.status}`);
      }
    } catch (err) {
      console.error('Error fetching menstrual cycle:', err);
      setError(`Không thể lấy dữ liệu chu kỳ: ${err.message}`);
    }
    setLoading(false);
  };
  useEffect(() => {
    const initializeData = async () => {
      console.log('Initializing component for user:', userid);
      
      if (!userid) {
        console.log('No userid found, showing login message');
        setLoading(false);
        setIsSubmitted(false);
        setResults(null);
        setGenderCheckComplete(true);
        return;
      }

      try {
        // Kiểm tra giới tính trước
        const gender = await checkUserGender();
        console.log('User gender:', gender);
        
        // Nếu giới tính không phải là "Nữ", dừng lại
        if (gender !== 'Nữ' && gender !== 'nữ' && gender !== 'NỮ') {
          console.log('User is not female, access denied');
          setLoading(false);
          return;
        }
        
        const hasCycle = await checkExistingCycle();
        console.log(`User ${userid} has existing cycle: ${hasCycle}`);
        setHasExistingCycle(hasCycle);
        
        if (hasCycle) {
          console.log('User has existing cycle, fetching data...');
          await fetchLatestCycle();
        } else {
          console.log('User has no existing cycle, showing input form');
          // Nếu người dùng chưa có chu kỳ, hiển thị form nhập
          setIsSubmitted(false);
          setResults(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        setError('Có lỗi xảy ra khi khởi tạo dữ liệu. Vui lòng thử lại.');
        setLoading(false);
      }
    };

    initializeData();
    // eslint-disable-next-line
  }, [userid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };  // Hàm lưu dữ liệu chu kỳ mới vào API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validation
    if (!formData.startDate) {
      setError('Vui lòng chọn ngày bắt đầu kinh nguyệt gần nhất!');
      setLoading(false);
      return;
    }

    if (!userid) {
      setError('Vui lòng đăng nhập để sử dụng tính năng này!');
      setLoading(false);
      return;
    }    // Validate cycle and period length first
    const cycleLength = parseInt(formData.cycleLength);
    const periodLength = parseInt(formData.periodLength);
    
    // Validate date is not in the future
    const selectedDate = new Date(formData.startDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    if (selectedDate > today) {
      setError('Ngày bắt đầu không được trong tương lai!');
      setLoading(false);
      return;
    }
    
    // Validate that the period end date is not too far in the future
    const periodEndDate = new Date(selectedDate);
    periodEndDate.setDate(selectedDate.getDate() + periodLength - 1);
    
    if (periodEndDate > today) {
      setError('Thời gian kinh nguyệt kết thúc không được trong tương lai! Vui lòng chọn ngày bắt đầu sớm hơn hoặc giảm thời gian kinh nguyệt.');
      setLoading(false);
      return;
    }    if (cycleLength < 21 || cycleLength > 35) {
      setError('Độ dài chu kỳ phải từ 21-35 ngày!');
      setLoading(false);
      return;
    }
    
    // Cho phép nhập từ 1-10, nhưng cảnh báo nếu ngoài 3-10
    let warning = '';
    if (periodLength < 3 || periodLength > 10) {
      warning = 'Lưu ý: Thời gian kinh nguyệt bình thường là từ 3-10 ngày. Nếu bạn nhập ngoài khoảng này, hãy kiểm tra lại với bác sĩ.';
    }
    
    if (periodLength >= cycleLength) {
      setError('Thời gian kinh nguyệt phải nhỏ hơn độ dài chu kỳ!');
      setLoading(false);
      return;
    }
    if (warning) {
      setError(warning);
      // Không return, chỉ hiển thị cảnh báo, vẫn cho phép lưu
    }
    try {
      // Kiểm tra xem người dùng đã có dữ liệu chu kỳ hay chưa
      const exists = await checkExistingCycle();
      console.log(`Before saving: User has existing cycle = ${exists}`);
      
      // Tính toán end date dựa trên start date và period length (thời gian kinh nguyệt)
      // endDate là ngày kết thúc kỳ kinh nguyệt, không phải kết thúc toàn bộ chu kỳ
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + periodLength - 1); // Trừ 1 vì bao gồm cả ngày bắt đầu
      
      // Format end date to YYYY-MM-DD
      const endDateString = endDate.toISOString().split('T')[0];
      
      console.log(`Calculated period end date: ${endDateString} (${periodLength} days from ${formData.startDate})`);
        // Format payload for backend
      const payload = {
        userId: parseInt(userid), // Backend expects userId as Long
        startDate: formData.startDate, // YYYY-MM-DD format
        endDate: endDateString, // End date of menstrual period (not entire cycle)
        cycleLength: cycleLength,
        periodLength: periodLength
      };
      
      console.log('Payload for API:', payload);
      console.log(`Period dates: ${formData.startDate} to ${endDateString}`);
      console.log(`Full cycle: ${cycleLength} days, Period: ${periodLength} days`);
      
      // Sử dụng HTTP method phù hợp: POST cho chu kỳ mới, PUT cho cập nhật
      const method = exists ? 'PUT' : 'POST';
      const endpoint = exists 
        ? `http://localhost:8080/api/menstrual-cycles/user/${encodeURIComponent(userid)}`
        : 'http://localhost:8080/api/menstrual-cycles';
      
      console.log(`${method} request to ${endpoint}`);
      
      const res = await fetch(endpoint, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log('Save response status:', res.status);
      
      if (!res.ok) {
        let errorMessage = `Server error: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          try {
            const errorText = await res.text();
            errorMessage = errorText || errorMessage;
          } catch {
            // Use default error message
          }
        }
        throw new Error(errorMessage);
      }
      
      console.log('Menstrual cycle data saved successfully');
      
      // Phân tích bất thường chu kỳ trước khi cập nhật state
      const abnormalities = analyzeCycleAbnormalities(cycleLength, periodLength);
      setCycleAbnormalities(abnormalities);
      
      // Cập nhật state để phản ánh rằng người dùng giờ đã có chu kỳ
      setHasExistingCycle(true);
      
      // Sau khi lưu thành công, lấy lại dữ liệu mới nhất từ backend
      await fetchLatestCycle();
    } catch (err) {
      console.error('Error saving menstrual cycle:', err);
      if (err.message.includes('fetch') || err.message.includes('NetworkError')) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo server đang chạy.');
      } else {
        setError(err.message || 'Có lỗi xảy ra khi lưu thông tin!');
      }
      setLoading(false);
    }  };

  // Giữ nguyên phần render, chỉ thay đổi logic hiển thị form/kết quả
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
      }}>
        {/* Logo positioned to the left */}
        <div style={{
          position: "absolute",
          left: 24,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2
        }}>
          <Link to="/">
            <img
              src="/Logo.png"
              alt="Logo"
              style={{ 
                height: 80, 
                width: 80, 
                objectFit: "contain", 
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              }}
            />
          </Link>
        </div>
        
        {/* Title centered both horizontally and vertically */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}>
          <h1
            style={{
              color: "#fff",
              margin: 0,
              fontWeight: 800,
              letterSpacing: 0.5,
              fontSize: 42, /* Increased from 38 to 42 */
              lineHeight: 1.1,
              fontFamily: 'Montserrat, Arial, sans-serif',
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              textAlign: "center",
              padding: "0 80px" /* Added padding to ensure text doesn't overlap with logo/avatar */
            }}
          >
            Theo dõi chu kỳ
          </h1>
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
        {!userid ? (
          <div style={{ textAlign: "center", padding: "50px", fontSize: "18px", color: "#dc2626" }}>
            Vui lòng đăng nhập để sử dụng tính năng theo dõi chu kỳ.
          </div>
        ) : !genderCheckComplete ? (
          <div style={{ textAlign: "center", padding: "50px", fontSize: "18px", color: "#666" }}>
            Đang kiểm tra thông tin tài khoản...
          </div>
        ) : userGender && userGender !== 'Nữ' && userGender !== 'nữ' && userGender !== 'NỮ' ? (
          <div style={{ 
            textAlign: "center", 
            padding: "50px",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            <div style={{
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "15px",
              padding: "30px",
              border: "2px solid rgba(239, 68, 68, 0.2)",
              marginBottom: "20px"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>🚫</div>
              <h3 style={{ 
                color: "#dc2626", 
                marginBottom: "15px", 
                fontSize: "20px",
                fontWeight: "600"
              }}>
                Tính năng không khả dụng
              </h3>
              <p style={{ 
                fontSize: "16px", 
                color: "#6b7280",
                lineHeight: "1.6",
                marginBottom: "20px"
              }}>
                Tính năng theo dõi chu kỳ kinh nguyệt chỉ dành cho người dùng có giới tính là <strong>Nữ</strong>.
                <br/>
                Giới tính hiện tại của tài khoản: <strong>{userGender || 'Không xác định'}</strong>
              </p>
              <div style={{
                background: "rgba(59, 130, 246, 0.1)",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "20px"
              }}>
                <p style={{ 
                  fontSize: "14px", 
                  color: "#1e40af",
                  margin: 0,
                  lineHeight: "1.5"
                }}>
                  💡 <strong>Gợi ý:</strong> Bạn có thể cập nhật thông tin giới tính trong phần 
                  <Link to="/user-account" style={{ color: "#1e40af", textDecoration: "underline" }}> Tài khoản của tôi</Link>
                </p>
              </div>
              <Link
                to="/"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "12px 25px",
                  borderRadius: "25px",
                  fontWeight: "600",
                  fontSize: "14px",
                  boxShadow: "0 4px 15px rgba(107, 114, 128, 0.3)",
                  transition: "all 0.3s ease"
                }}
              >
                ← Quay về trang chủ
              </Link>
            </div>
          </div>
        ) : loading ? (
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
              </div>              {/* Phần thông tin bổ sung */}
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
                  <div style={{ fontSize: "20px", marginBottom: "8px", color: "#0891b2" }}>🔚</div>
                  <h4 style={{ color: "#0891b2", marginBottom: "8px", fontSize: "14px" }}>Kết thúc chu kỳ hiện tại</h4>
                  <p style={{ color: "#2c3e50", fontWeight: "700", fontSize: "16px", margin: 0 }}>
                    {results?.cycleEndDate}
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
            
            {/* Hiển thị cảnh báo bất thường chu kỳ */}
            {cycleAbnormalities.length > 0 && (() => {
              // Xác định mức độ nghiêm trọng cao nhất
              const maxSeverity = cycleAbnormalities.reduce((max, current) => {
                const severityLevels = { low: 1, medium: 2, high: 3 };
                return severityLevels[current.severity] > severityLevels[max] ? current.severity : max;
              }, 'low');
              
              // Thiết lập màu sắc dựa trên mức độ nghiêm trọng
              const severityColors = {
                low: {
                  bg: "rgba(251, 191, 36, 0.05)",
                  border: "rgba(251, 191, 36, 0.3)",
                  text: "#92400e",
                  icon: "⚠️"
                },
                medium: {
                  bg: "rgba(249, 115, 22, 0.05)",
                  border: "rgba(249, 115, 22, 0.3)",
                  text: "#c2410c",
                  icon: "🔶"
                },
                high: {
                  bg: "rgba(220, 38, 38, 0.05)",
                  border: "rgba(220, 38, 38, 0.3)",
                  text: "#dc2626",
                  icon: "🚨"
                }
              };
              
              const colors = severityColors[maxSeverity];
              
              return (
                <div style={{
                  background: colors.bg,
                  borderRadius: "15px",
                  padding: "25px",
                  border: `2px solid ${colors.border}`,
                  marginBottom: "30px",
                  textAlign: "left",
                  maxWidth: "1000px",
                  margin: "0 auto 30px auto"
                }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    marginBottom: "20px" 
                  }}>
                    <div style={{ fontSize: "24px", marginRight: "10px" }}>{colors.icon}</div>
                    <h4 style={{ 
                      color: colors.text, 
                      margin: 0, 
                      fontSize: "18px", 
                      fontWeight: "700" 
                    }}>
                      {maxSeverity === 'high' 
                        ? 'Phát hiện bất thường chu kỳ kinh nguyệt nghiêm trọng'
                        : maxSeverity === 'medium'
                        ? 'Phát hiện bất thường chu kỳ kinh nguyệt cần theo dõi'
                        : 'Chu kỳ kinh nguyệt cần quan sát thêm'
                      }
                    </h4>
                  </div>
                
                <div style={{
                  background: "rgba(254, 226, 226, 0.8)",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "20px"
                }}>
                  <p style={{ 
                    fontSize: "15px", 
                    color: "#7f1d1d",
                    margin: "0 0 15px 0",
                    lineHeight: "1.6",
                    fontWeight: "500"
                  }}>
                    🔍 <strong>Kết quả phân tích:</strong> Chu kỳ kinh nguyệt của bạn có những dấu hiệu bất thường cần được quan tâm và theo dõi.
                  </p>
                  
                  {cycleAbnormalities.map((abnormality, index) => (
                    <div key={index} style={{
                      background: "#fff",
                      borderRadius: "8px",
                      padding: "15px",
                      marginBottom: index < cycleAbnormalities.length - 1 ? "15px" : "0",
                      border: "1px solid rgba(220, 38, 38, 0.2)"
                    }}>
                      <h5 style={{ 
                        color: "#dc2626", 
                        margin: "0 0 8px 0", 
                        fontSize: "16px",
                        fontWeight: "600"
                      }}>
                        🚨 {abnormality.title}
                      </h5>
                      <p style={{ 
                        color: "#374151", 
                        margin: "0 0 12px 0", 
                        fontSize: "14px",
                        lineHeight: "1.5"
                      }}>
                        {abnormality.description}
                      </p>
                      
                      {abnormality.advice && (
                        <div style={{ 
                          background: "rgba(251, 191, 36, 0.1)",
                          borderRadius: "6px",
                          padding: "10px",
                          marginBottom: "12px",
                          border: "1px solid rgba(251, 191, 36, 0.3)"
                        }}>
                          <p style={{ 
                            color: "#92400e", 
                            margin: 0, 
                            fontSize: "13px",
                            lineHeight: "1.4",
                            fontStyle: "italic"
                          }}>
                            💡 <strong>Lời khuyên:</strong> {abnormality.advice}
                          </p>
                        </div>
                      )}
                      
                      <div style={{ 
                        background: "rgba(59, 130, 246, 0.05)",
                        borderRadius: "6px",
                        padding: "12px",
                        border: "1px solid rgba(59, 130, 246, 0.2)"
                      }}>
                        <p style={{ 
                          color: "#1e40af", 
                          margin: "0 0 8px 0", 
                          fontSize: "14px",
                          fontWeight: "600"
                        }}>
                          🩺 Xét nghiệm được đề xuất:
                        </p>
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: "20px",
                          color: "#374151",
                          fontSize: "13px",
                          lineHeight: "1.4"
                        }}>
                          {abnormality.recommendations.map((recommendation, idx) => (
                            <li key={idx} style={{ marginBottom: "4px" }}>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{
                  background: "linear-gradient(90deg, #dc2626 0%, #ef4444 100%)",
                  borderRadius: "10px",
                  padding: "20px",
                  textAlign: "center"
                }}>
                  <h5 style={{ 
                    color: "#fff", 
                    margin: "0 0 12px 0", 
                    fontSize: "16px",
                    fontWeight: "600"
                  }}>
                    🏥 Khuyến nghị của chúng tôi
                  </h5>
                  <p style={{ 
                    color: "#fef2f2", 
                    margin: "0 0 15px 0", 
                    fontSize: "14px",
                    lineHeight: "1.5"
                  }}>
                    Để đảm bảo sức khỏe sinh sản, bạn nên thực hiện các xét nghiệm được đề xuất và tham khảo ý kiến bác sĩ chuyên khoa.
                  </p>
                  <Link
                    to="/test-booking"
                    style={{
                      display: "inline-block",
                      background: "#fff",
                      color: "#dc2626",
                      textDecoration: "none",
                      padding: "12px 25px",
                      borderRadius: "25px",
                      fontWeight: "600",
                      fontSize: "14px",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                      transition: "all 0.3s ease",
                      marginRight: "15px"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                    }}
                  >
                    🧪 Đặt lịch xét nghiệm ngay
                  </Link>
                  <Link
                    to="/consultation-booking"
                    style={{
                      display: "inline-block",
                      background: "#fff",
                      color: "#dc2626",
                      textDecoration: "none",
                      padding: "12px 25px",
                      borderRadius: "25px",
                      fontWeight: "600",
                      fontSize: "14px",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                      transition: "all 0.3s ease",
                      marginRight: "0"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                    }}
                  >
                    💬 Đặt lịch tư vấn với bác sĩ
                  </Link>
                </div>
              </div>
              );
            })()}
              
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
            }}>              <button
                onClick={() => {
                  // Hiển thị form nhập liệu để người dùng có thể cập nhật thông tin
                  setIsSubmitted(false);
                  setResults(null);
                  setError('');
                  setCycleAbnormalities([]); // Reset abnormalities khi cập nhật
                  // Giữ nguyên dữ liệu hiện tại trong form để người dùng có thể chỉnh sửa
                  // Không reset form về giá trị mặc định
                }}
                type="button"
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
                }}              >
                � Cập nhật thông tin
              </button>
              <Link
                to="/"
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
                ← Quay về trang chủ
              </Link>
            </div>
          </div>        ) : (
          <>
            {hasExistingCycle === false && (
              <div style={{ 
                background: "rgba(8, 145, 178, 0.05)", 
                borderRadius: "10px", 
                padding: "15px",
                marginBottom: "20px",
                textAlign: "center"
              }}>
                <p style={{ margin: 0, color: "#0891b2", fontWeight: "500" }}>
                  Bạn chưa có dữ liệu chu kỳ. Vui lòng nhập thông tin chu kỳ kinh nguyệt của bạn.
                </p>
              </div>
            )}
            
            {hasExistingCycle === true && (
              <div style={{ 
                background: "rgba(34, 197, 94, 0.05)", 
                borderRadius: "10px", 
                padding: "15px",
                marginBottom: "20px",
                textAlign: "center"
              }}>
                <p style={{ margin: 0, color: "#059669", fontWeight: "500" }}>
                  Cập nhật thông tin chu kỳ kinh nguyệt của bạn
                </p>
              </div>
            )}
            
            <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "30px", width: "100%" }}>
              {hasExistingCycle ? "Cập nhật chu kỳ kinh nguyệt" : "Tính toán chu kỳ kinh nguyệt"}
            </h2>
              {error && (
              <div style={{ 
                background: "rgba(220, 38, 38, 0.1)", 
                color: "#dc2626", 
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                textAlign: "center",
                maxWidth: "600px",
                margin: "0 auto 20px auto"
              }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}>{error}</p>
              </div>
            )}
            
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
                    min="1"
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
                  }}                  onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                >
                  {hasExistingCycle ? "Cập nhật chu kỳ" : "Tính toán chu kỳ"}
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
        <p>© 2025 Hệ thống Chăm Sóc Sức Khỏe Giới TÍnh.</p>
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
