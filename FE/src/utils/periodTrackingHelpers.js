// Utility functions for PeriodTracking component

// Authentication and user management
export const getUserIdFromStorage = () => {
  return localStorage.getItem('userId');
};

// Cycle abnormalities analysis
export const analyzeCycleAbnormalities = (cycleLength, periodLength) => {
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

// API calls
export const checkUserGender = async (userid, setUserGender, setGenderCheckComplete) => {
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

export const checkExistingCycle = async (userid, setError) => {
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
};

export const fetchLatestCycle = async (
  userid, 
  setLoading, 
  setError, 
  setResults, 
  setIsSubmitted, 
  setCycleAbnormalities, 
  setFormData
) => {
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
        const periodLength = parseInt(data.periodLength);
        
        // Calculate dates with proper logic
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
      }
    } else if (res.status === 404) {
      console.log('No menstrual cycle data found for user');
      // User has no menstrual cycle data yet
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

// Form handling
export const handleFormChange = (e, formData, setFormData) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value
  });
};

export const validateFormData = (formData, userid, setError, setLoading) => {
  // Validation
  if (!formData.startDate) {
    setError('Vui lòng chọn ngày bắt đầu kinh nguyệt gần nhất!');
    setLoading(false);
    return false;
  }

  if (!userid) {
    setError('Vui lòng đăng nhập để sử dụng tính năng này!');
    setLoading(false);
    return false;
  }

  // Validate cycle and period length first
  const cycleLength = parseInt(formData.cycleLength);
  const periodLength = parseInt(formData.periodLength);
  
  // Validate date is not in the future
  const selectedDate = new Date(formData.startDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of today
  
  if (selectedDate > today) {
    setError('Ngày bắt đầu không được trong tương lai!');
    setLoading(false);
    return false;
  }
  
  // Validate that the period end date is not too far in the future
  const periodEndDate = new Date(selectedDate);
  periodEndDate.setDate(selectedDate.getDate() + periodLength - 1);
  
  if (periodEndDate > today) {
    setError('Thời gian kinh nguyệt kết thúc không được trong tương lai! Vui lòng chọn ngày bắt đầu sớm hơn hoặc giảm thời gian kinh nguyệt.');
    setLoading(false);
    return false;
  }

  if (cycleLength < 21 || cycleLength > 35) {
    setError('Độ dài chu kỳ phải từ 21-35 ngày!');
    setLoading(false);
    return false;
  }
  
  // Cho phép nhập từ 1-10, nhưng cảnh báo nếu ngoài 3-10
  let warning = '';
  if (periodLength < 3 || periodLength > 10) {
    warning = 'Lưu ý: Thời gian kinh nguyệt bình thường là từ 3-10 ngày. Nếu bạn nhập ngoài khoảng này, hãy kiểm tra lại với bác sĩ.';
  }
  
  if (periodLength >= cycleLength) {
    setError('Thời gian kinh nguyệt phải nhỏ hơn độ dài chu kỳ!');
    setLoading(false);
    return false;
  }
  
  if (warning) {
    setError(warning);
    // Không return false, chỉ hiển thị cảnh báo, vẫn cho phép lưu
  }
  
  return true;
};

export const handleFormSubmit = async (
  e,
  formData,
  userid,
  setError,
  setLoading,
  setHasExistingCycle,
  setCycleAbnormalities,
  fetchLatestCycle
) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  // Validate form
  if (!validateFormData(formData, userid, setError, setLoading)) {
    return;
  }

  const cycleLength = parseInt(formData.cycleLength);
  const periodLength = parseInt(formData.periodLength);

  try {
    // Kiểm tra xem người dùng đã có dữ liệu chu kỳ hay chưa
    const exists = await checkExistingCycle(userid, setError);
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
  }
};

// UI helpers
export const handleUpdateButtonClick = (
  setIsSubmitted,
  setResults,
  setError,
  setCycleAbnormalities
) => {
  // Hiển thị form nhập liệu để người dùng có thể cập nhật thông tin
  setIsSubmitted(false);
  setResults(null);
  setError('');
  setCycleAbnormalities([]); // Reset abnormalities khi cập nhật
  // Giữ nguyên dữ liệu hiện tại trong form để người dùng có thể chỉnh sửa
  // Không reset form về giá trị mặc định
};

export const checkGenderAccess = (userGender) => {
  return userGender && userGender !== 'Nữ' && userGender !== 'nữ' && userGender !== 'NỮ';
};

// Initialization
export const initializeData = async (
  userid,
  checkUserGender,
  setUserGender,
  setGenderCheckComplete,
  checkExistingCycle,
  setError,
  setHasExistingCycle,
  fetchLatestCycle,
  setIsSubmitted,
  setResults,
  setLoading
) => {
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
    const gender = await checkUserGender(userid, setUserGender, setGenderCheckComplete);
    console.log('User gender:', gender);
    
    // Nếu giới tính không phải là "Nữ", dừng lại
    if (gender !== 'Nữ' && gender !== 'nữ' && gender !== 'NỮ') {
      console.log('User is not female, access denied');
      setLoading(false);
      return;
    }
    
    const hasCycle = await checkExistingCycle(userid, setError);
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

// Style constants
export const labelStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#2c3e50",
  marginBottom: "8px"
};

export const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e1e1e1",
  fontSize: "14px",
  color: "#2c3e50",
  transition: "all 0.3s ease",
  outline: "none",
  backgroundColor: "#f9f9f9"
};
