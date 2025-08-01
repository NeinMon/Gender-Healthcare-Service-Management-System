// Các hàm hỗ trợ cho component AskQuestion

// Các hàm tiện ích tính toán
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

// Hàm chuyển đổi giá trị giới tính
export const mapGenderValue = (genderFromDB) => {
  if (!genderFromDB) return '';
  
  const gender = genderFromDB.toLowerCase().trim();
  console.log('Giới tính gốc từ DB:', genderFromDB, 'Đã chuẩn hóa:', gender); // Log debug
  
  // Ánh xạ các giá trị có thể có từ cơ sở dữ liệu
  if (gender === 'female' || gender === 'nữ' || gender === 'nu' || gender === 'f' || gender === 'woman') {
    return 'female';
  } else if (gender === 'male' || gender === 'nam' || gender === 'm' || gender === 'man') {
    return 'male';
  } else {
    return 'other';
  }
};

// Các hàm gọi API
export const fetchUserData = async (setFormData, setError, setLoading, calculateAge, mapGenderValue) => {
  try {
    setLoading(true);
    
    // Lấy userId từ localStorage, sessionStorage, hoặc giá trị mặc định
    const userId = localStorage.getItem('userId') || 
                  sessionStorage.getItem('userId') || 
                  '1'; // ID mặc định cho test
    
    const response = await fetch(`http://localhost:8080/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error('Không thể lấy thông tin người dùng');
    }
    
    const userData = await response.json();
    console.log('Dữ liệu người dùng nhận được:', userData); // Log debug để xem dữ liệu
    
    // Cập nhật form với thông tin người dùng từ API
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
    console.error('Lỗi khi lấy dữ liệu người dùng:', err);
  } finally {
    setLoading(false);
  }
};

// Các hàm xác thực form
export const validateQuestionForm = (formData, questionCategories) => {
  // Xác thực dữ liệu phía client trước khi gửi
  if (!formData.question || formData.question.trim().length < 10) {
    throw new Error('Câu hỏi phải có ít nhất 10 ký tự');
  }
  
  if (!formData.fullName || formData.fullName.trim().length === 0) {
    throw new Error('Vui lòng nhập họ và tên');
  }
  
  if (!formData.questionCategory) {
    throw new Error('Vui lòng chọn chủ đề câu hỏi');
  }
  
  // Kiểm tra userId có hợp lệ không
  const userId = localStorage.getItem('userId') || 
                sessionStorage.getItem('userId') || 
                '1';
  const userIdNumber = parseInt(userId);
  if (isNaN(userIdNumber) || userIdNumber <= 0) {
    throw new Error('Thông tin người dùng không hợp lệ');
  }

  // Tạo tiêu đề từ category - chỉ sử dụng tên category để đáp ứng yêu cầu backend
  const categoryName = questionCategories.find(cat => cat.id == formData.questionCategory)?.name;
  
  // Kiểm tra nếu không tìm thấy category, sử dụng giá trị mặc định
  if (!categoryName) {
    throw new Error('Vui lòng chọn chủ đề câu hỏi hợp lệ');
  }
  
  return { userIdNumber, categoryName };
};

// Hàm gửi câu hỏi
export const submitQuestion = async (formData, questionCategories, setSubmitting, setError, setIsSubmitted) => {
  try {
    setSubmitting(true);
    setError(''); // Xóa các lỗi trước đó
    
    const { userIdNumber, categoryName } = validateQuestionForm(formData, questionCategories);
    
    // Backend chỉ chấp nhận tên category chính xác như đã định nghĩa
    const title = categoryName;
    
    console.log('Tiêu đề được tạo:', title, 'Độ dài:', title.length);
    console.log('Các category có sẵn:', questionCategories);
    console.log('ID category đã chọn:', formData.questionCategory);
    console.log('Tên category tìm thấy:', categoryName);
    
    // Chỉ lấy nội dung câu hỏi, không bao gồm thông tin cá nhân
    const finalContent = formData.question.trim();
    
    // Chuẩn bị dữ liệu gửi API với định dạng chính xác
    const questionData = {
      userID: userIdNumber, // Đảm bảo là số nguyên
      title: title.trim(), // Chỉ là tên category
      content: finalContent.trim() // Loại bỏ khoảng trắng thừa
    };
    
    // Xác thực cuối cùng trước khi gửi
    if (!questionData.title || questionData.title.length < 5) {
      throw new Error('Tiêu đề không hợp lệ');
    }
    
    if (questionData.content.length < 10 || questionData.content.length > 5000) {
      throw new Error('Nội dung phải từ 10-5000 ký tự');
    }
    
    console.log('Gửi dữ liệu câu hỏi:', questionData);
    console.log('Tiêu đề:', questionData.title);
    console.log('Độ dài nội dung:', questionData.content.length);
    console.log('Kiểu dữ liệu UserID:', typeof questionData.userID, 'Giá trị:', questionData.userID);
    
    // Gửi yêu cầu tới API
    const response = await fetch('http://localhost:8080/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionData)
    });
    
    // Log phản hồi để debug
    const responseText = await response.text();
    console.log('Trạng thái phản hồi:', response.status);
    console.log('Nội dung phản hồi:', responseText);
    
    if (!response.ok) {
      let errorMessage = 'Không thể gửi câu hỏi. Vui lòng thử lại.';
      
      try {
        const errorData = JSON.parse(responseText);
        console.log('Dữ liệu lỗi:', errorData);
        
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          // Xử lý lỗi xác thực từ Spring Boot
          errorMessage = errorData.errors.join(', ');
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch (parseError) {
        console.log('Lỗi khi phân tích phản hồi:', parseError);
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
    
    console.log('Câu hỏi được tạo thành công:', result);
    
    // Hiển thị thông báo thành công
    setIsSubmitted(true);
    
  } catch (error) {
    console.error('Lỗi khi gửi câu hỏi:', error);
    setError('Lỗi gửi câu hỏi: ' + error.message);
  } finally {
    setSubmitting(false);
  }
};

// Hàm xử lý thay đổi form
export const handleFormChange = (e, formData, setFormData) => {
  const { name, value, type, checked } = e.target;
  setFormData({
    ...formData,
    [name]: type === 'checkbox' ? checked : value
  });
};

// Dữ liệu các danh mục câu hỏi
export const questionCategories = [
  { id: 1, name: "Sức khỏe sinh sản" },
  { id: 2, name: "Thai sản và phụ khoa" },
  { id: 3, name: "Kế hoạch hóa gia đình" },
  { id: 4, name: "Kinh nguyệt và mãn kinh" },
  { id: 5, name: "Sức khỏe tình dục" },
  { id: 6, name: "Dinh dưỡng và lối sống" }
];

// Các hằng số style cho giao diện
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
