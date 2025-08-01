// Helper functions for AskQuestion component

// Utility functions
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Gender mapping function
export const mapGenderValue = (genderFromDB) => {
  if (!genderFromDB) return '';
  
  const gender = genderFromDB.toLowerCase().trim();
  console.log('Original gender from DB:', genderFromDB, 'Normalized:', gender); // Debug log
  
  // Mapping các giá trị có thể có
  if (gender === 'female' || gender === 'nữ' || gender === 'nu' || gender === 'f' || gender === 'woman') {
    return 'female';
  } else if (gender === 'male' || gender === 'nam' || gender === 'm' || gender === 'man') {
    return 'male';
  } else {
    return 'other';
  }
};

// API functions
export const fetchUserData = async (setFormData, setError, setLoading, calculateAge, mapGenderValue) => {
  try {
    setLoading(true);
    
    // Lấy userId từ localStorage, sessionStorage, hoặc từ props/context
    const userId = localStorage.getItem('userId') || 
                  sessionStorage.getItem('userId') || 
                  '1'; // Default userId cho test
    
    const response = await fetch(`http://localhost:8080/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error('Không thể lấy thông tin người dùng');
    }
    
    const userData = await response.json();
    console.log('User data received:', userData); // Debug log để xem dữ liệu
    
    // Cập nhật form với thông tin user
    setFormData(prevData => ({
      ...prevData,
      fullName: userData.fullName || '',
      age: userData.dob ? calculateAge(userData.dob).toString() : '',
      gender: mapGenderValue(userData.gender),
      phone: userData.phone || '',
      email: userData.email || ''
    }));
    
    setError('');
  } catch (err) {
    setError('Không thể lấy thông tin người dùng: ' + err.message);
    console.error('Error fetching user data:', err);
  } finally {
    setLoading(false);
  }
};

// Form validation functions
export const validateQuestionForm = (formData, questionCategories) => {
  // Validation client-side trước khi gửi
  if (!formData.question || formData.question.trim().length < 10) {
    throw new Error('Câu hỏi phải có ít nhất 10 ký tự');
  }
  
  if (!formData.fullName || formData.fullName.trim().length === 0) {
    throw new Error('Vui lòng nhập họ và tên');
  }
  
  if (!formData.questionCategory) {
    throw new Error('Vui lòng chọn chủ đề câu hỏi');
  }
  
  // Kiểm tra userId hợp lệ
  const userId = localStorage.getItem('userId') || 
                sessionStorage.getItem('userId') || 
                '1';
  const userIdNumber = parseInt(userId);
  if (isNaN(userIdNumber) || userIdNumber <= 0) {
    throw new Error('Thông tin người dùng không hợp lệ');
  }

  // Tạo title từ category - chỉ sử dụng tên category để đáp ứng backend validation
  const categoryName = questionCategories.find(cat => cat.id == formData.questionCategory)?.name;
  
  // Kiểm tra nếu không tìm thấy category, sử dụng default
  if (!categoryName) {
    throw new Error('Vui lòng chọn chủ đề câu hỏi hợp lệ');
  }
  
  return { userIdNumber, categoryName };
};

// Form submission function
export const submitQuestion = async (formData, questionCategories, setSubmitting, setError, setIsSubmitted) => {
  try {
    setSubmitting(true);
    setError(''); // Clear any previous errors
    
    const { userIdNumber, categoryName } = validateQuestionForm(formData, questionCategories);
    
    // Backend chỉ chấp nhận exact match với các category names đã định nghĩa
    const title = categoryName;
    
    console.log('Generated title:', title, 'Length:', title.length);
    console.log('Available categories:', questionCategories);
    console.log('Selected category ID:', formData.questionCategory);
    console.log('Found category name:', categoryName);
    
    // Chỉ lấy nội dung câu hỏi, không bao gồm thông tin cá nhân
    const finalContent = formData.question.trim();
    
    // Chuẩn bị dữ liệu gửi API với format chính xác
    const questionData = {
      userID: userIdNumber, // Đảm bảo là số nguyên
      title: title.trim(), // Chỉ là tên category
      content: finalContent.trim() // Loại bỏ khoảng trắng thừa
    };
    
    // Validation cuối cùng trước khi gửi
    if (!questionData.title || questionData.title.length < 5) {
      throw new Error('Tiêu đề không hợp lệ');
    }
    
    if (questionData.content.length < 10 || questionData.content.length > 5000) {
      throw new Error('Nội dung phải từ 10-5000 ký tự');
    }
    
    console.log('Sending question data:', questionData);
    console.log('Title:', questionData.title);
    console.log('Content length:', questionData.content.length);
    console.log('UserID type:', typeof questionData.userID, 'Value:', questionData.userID);
    
    // Gửi request tới API
    const response = await fetch('http://localhost:8080/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData)
    });
    
    // Log response để debug
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);
    
    if (!response.ok) {
      let errorMessage = 'Không thể gửi câu hỏi. Vui lòng thử lại.';
      
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error data:', errorData);
        
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          // Xử lý validation errors từ Spring Boot
          errorMessage = errorData.errors.join(', ');
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch (parseError) {
        console.log('Error parsing response:', parseError);
        if (responseText) {
          errorMessage = responseText;
        }
      }
      
      // Thêm thông tin debug cho các lỗi phổ biến
      if (response.status === 400) {
        errorMessage = `Dữ liệu không hợp lệ: ${errorMessage}`;
      } else if (response.status === 500) {
        errorMessage = `Lỗi máy chủ: ${errorMessage}`;
      }
      
      throw new Error(errorMessage);
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      result = responseText;
    }
    
    console.log('Question created successfully:', result);
    
    // Hiển thị thông báo thành công
    setIsSubmitted(true);
    
  } catch (error) {
    console.error('Error submitting question:', error);
    setError('Lỗi gửi câu hỏi: ' + error.message);
  } finally {
    setSubmitting(false);
  }
};

// Form change handler
export const handleFormChange = (e, formData, setFormData) => {
  const { name, value, type, checked } = e.target;
  setFormData({
    ...formData,
    [name]: type === 'checkbox' ? checked : value
  });
};

// Data constants
export const questionCategories = [
  { id: 1, name: "Sức khỏe sinh sản" },
  { id: 2, name: "Thai sản và phụ khoa" },
  { id: 3, name: "Kế hoạch hóa gia đình" },
  { id: 4, name: "Kinh nguyệt và mãn kinh" },
  { id: 5, name: "Sức khỏe tình dục" },
  { id: 6, name: "Dinh dưỡng và lối sống" }
];

// Style constants
export const labelStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#2c3e50",
  marginBottom: "10px"
};

export const inputStyle = {
  padding: "14px",
  borderRadius: "8px",
  border: "1px solid #e1e1e1",
  fontSize: "16px",
  color: "#2c3e50",
  transition: "all 0.3s ease",
  outline: "none",
  backgroundColor: "#f9f9f9"
};
