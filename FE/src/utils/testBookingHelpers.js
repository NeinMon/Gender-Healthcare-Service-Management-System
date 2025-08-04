// testBookingHelpers.js - Helper functions for TestBooking component

// API functions
export const fetchTestTypes = async () => {
  try {
    const res = await fetch('http://localhost:8080/api/services');
    if (res.ok) {
      const data = await res.json();
      // Lọc bỏ serviceId = 1 và chỉ lấy các service có thể xét nghiệm
      const filteredTests = data.filter(service => service.serviceId !== 1).map(service => {
        let formattedPrice = service.price || '';
        
        // Đảm bảo giá tiền luôn có "VNĐ" ở cuối
        if (formattedPrice) {
          // Convert to string nếu là number
          formattedPrice = formattedPrice.toString();
          
          // Loại bỏ tất cả các biến thể của VNĐ/VND có thể có
          formattedPrice = formattedPrice.replace(/\s*(VN[ĐD]|vn[đd]|Vn[đd]|vN[đd])\s*/gi, '').trim();
          
          // Thêm VNĐ vào cuối
          formattedPrice = `${formattedPrice} VNĐ`;
        } else {
          formattedPrice = 'Liên hệ VNĐ';
        }
        
        return {
          ...service,
          price: formattedPrice
        };
      });
      return filteredTests;
    } else {
      console.error('Không thể lấy danh sách dịch vụ');
      // Fallback data nếu API lỗi
      return [
        { serviceId: 2, serviceName: "Siêu âm tử cung", price: "400.000 VNĐ" },
        { serviceId: 3, serviceName: "Kiểm tra HPV", price: "850.000 VNĐ" },
        { serviceId: 4, serviceName: "Xét nghiệm nội tiết tố", price: "750.000 VNĐ" },
        { serviceId: 5, serviceName: "Sàng lọc ung thư cổ tử cung", price: "650.000 VNĐ" }
      ];
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dịch vụ:', error);
    // Fallback data nếu có lỗi network
    return [
      { serviceId: 2, serviceName: "Siêu âm tử cung", price: "400.000 VNĐ" },
      { serviceId: 3, serviceName: "Kiểm tra HPV", price: "850.000 VNĐ" },
      { serviceId: 4, serviceName: "Xét nghiệm nội tiết tố", price: "750.000 VNĐ" },
      { serviceId: 5, serviceName: "Sàng lọc ung thư cổ tử cung", price: "650.000 VNĐ" }
    ];
  }
};

export const fetchUserInfo = async (userId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/users/${userId}`);
    if (res.ok) {
      const data = await res.json();
      return {
        fullName: data.fullName || data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        // Tính tuổi từ ngày sinh nếu có
        age: data.dob ? calculateAge(data.dob) : '',
        gender: mapGender(data.gender) || ''
      };
    }
    return null;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return null;
  }
};

export const fetchServicePrice = async (serviceId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/services/${serviceId}`);
    if (!res.ok) throw new Error('Không lấy được giá dịch vụ');
    const data = await res.json();
    return {
      price: data.price,
      serviceName: data.serviceName || ''
    };
  } catch (err) {
    console.error('Lỗi lấy service:', err);
    return null;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await fetch('http://localhost:8080/api/bookings/with-service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      const errorText = await response.text();
      console.error('Failed to submit booking:', response.status, errorText);
      
      // Handle different error types based on status code
      if (response.status === 400) {
        // Bad Request - validation errors
        try {
          const errorObj = JSON.parse(errorText);
          const errorMessage = errorObj.message || errorText || 'Dữ liệu không hợp lệ';
          throw new Error(`Lỗi validation: ${errorMessage}`);
        } catch (e) {
          throw new Error(`Dữ liệu gửi lên không hợp lệ: ${errorText}`);
        }
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy dịch vụ hoặc API endpoint. Vui lòng liên hệ quản trị viên!');
      } else if (response.status === 500) {
        throw new Error('Lỗi server nội bộ. Vui lòng thử lại sau hoặc liên hệ quản trị viên!');
      } else {
        throw new Error(`Có lỗi xảy ra khi đặt lịch (${response.status}). Vui lòng thử lại!`);
      }
    }
  } catch (error) {
    if (error.message.includes('fetch')) {
      throw new Error('Có lỗi xảy ra khi đặt lịch. Vui lòng kiểm tra kết nối mạng!');
    }
    throw error;
  }
};

export const createPayment = async (paymentPayload) => {
  try {
    const paymentRes = await fetch('http://localhost:8080/api/payment/payos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentPayload)
    });
    
    if (paymentRes.ok) {
      return await paymentRes.json();
    } else {
      const errorText = await paymentRes.text();
      throw new Error('Không thể tạo liên kết thanh toán: ' + errorText);
    }
  } catch (error) {
    throw error;
  }
};

export const checkPaymentStatus = async (bookingId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/payment/status/${bookingId}`);
    if (res.ok) {
      const data = await res.json();
      return {
        paymentStatus: data.paymentStatus || data.payment?.status,
        data
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const checkPaymentStatusByOrderCode = async (orderCode) => {
  try {
    const res = await fetch(`http://localhost:8080/api/payment/status/order/${orderCode}`);
    if (res.ok) {
      const data = await res.json();
      return {
        paymentStatus: data.paymentStatus,
        data
      };
    }
    return null;
  } catch {
    return null;
  }
};

// Utility functions
export const calculateAge = (dobString) => {
  try {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age.toString();
  } catch (error) {
    return '';
  }
};

export const mapGender = (gender) => {
  if (!gender) return '';
  const genderLower = gender.toLowerCase();
  if (genderLower === 'nữ' || genderLower === 'female') return 'female';
  if (genderLower === 'nam' || genderLower === 'male') return 'male';
  return 'other';
};

export const getServiceById = (testTypes, serviceId) => {
  return testTypes.find(service => service.serviceId === parseInt(serviceId));
};

export const isTimeSlotPassed = (timeSlot, selectedDate) => {
  if (!selectedDate) return false;
  const today = new Date();
  const selectedDateObj = new Date(selectedDate);
  if (selectedDateObj.toDateString() !== today.toDateString()) return false;
  
  // Lấy giờ bắt đầu và kết thúc từ slot ("08:00 - 09:00")
  const [slotStartTime, slotEndTime] = timeSlot.split(' - ');
  const [startHour, startMinute] = slotStartTime.split(':').map(Number);
  const [endHour, endMinute] = slotEndTime.split(':').map(Number);
  
  // Tạo đối tượng Date cho endTime của slot
  const slotEnd = new Date(selectedDateObj);
  slotEnd.setHours(endHour, endMinute, 0, 0);
  
  // Nếu thời gian hiện tại đã sau endTime của slot thì disable
  return today > slotEnd;
};

export const getUserIdFromStorage = () => {
  let userId = 1; // Giá trị mặc định
  const userJson = localStorage.getItem('loggedInUser');
  
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user && user.userID) {
        userId = user.userID;
      }
    } catch (error) {
      console.error("Lỗi khi đọc thông tin người dùng:", error);
    }
  }
  
  return userId;
};

export const validateBookingForm = (formData) => {
  // Validation
  if (!formData.testType || !parseInt(formData.testType)) {
    throw new Error('Vui lòng chọn loại xét nghiệm!');
  }
  
  if (!formData.fullName.trim()) {
    throw new Error('Vui lòng nhập họ tên!');
  }
  
  if (!formData.phone.trim()) {
    throw new Error('Vui lòng nhập số điện thoại!');
  }
  
  if (!formData.preferredDate) {
    throw new Error('Vui lòng chọn ngày hẹn!');
  }
  
  if (!formData.preferredTime) {
    throw new Error('Vui lòng chọn thời gian!');
  }
  
  // Ghi chú không bắt buộc, nhưng nếu có thì phải <= 500 ký tự
  if (formData.notes && formData.notes.length > 500) {
    throw new Error('Ghi chú quá dài. Vui lòng rút gọn (tối đa 500 ký tự)!');
  }
  
  // Validate date and time format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const timeRegex = /^\d{2}:\d{2}$/;
  
  if (!dateRegex.test(formData.preferredDate)) {
    throw new Error('Định dạng ngày không hợp lệ! (YYYY-MM-DD)');
  }
  
  if (!timeRegex.test(formData.preferredTime)) {
    throw new Error('Định dạng giờ không hợp lệ! (HH:mm)');
  }
  
  // Validate future date
  const selectedDate = new Date(formData.preferredDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    throw new Error('Không thể đặt lịch cho ngày đã qua!');
  }
  
  // Kiểm tra thời gian đã qua chưa
  const timeSlot = `${formData.preferredTime}:00 - ${(parseInt(formData.preferredTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;
  if (isTimeSlotPassed(timeSlot, formData.preferredDate)) {
    throw new Error("Khung giờ đã chọn đã qua! Vui lòng chọn khung giờ khác.");
  }
};

export const prepareBookingData = (formData, testTypes) => {
  const serviceId = parseInt(formData.testType);
  const selectedService = getServiceById(testTypes, serviceId);
  
  if (!serviceId || serviceId <= 0) {
    throw new Error('Vui lòng chọn loại dịch vụ hợp lệ!');
  }
  
  const userId = getUserIdFromStorage();
  
  const bookingData = {
    userId: userId, // Backend expect userId, not userID
    serviceId: serviceId, // Backend expect serviceId, not serviceID
    content: formData.notes && formData.notes.trim() 
      ? formData.notes.trim() 
      : `Đặt lịch xét nghiệm: ${selectedService?.serviceName || 'Dịch vụ xét nghiệm'}`, // Sử dụng ghi chú nếu có, không thì dùng tên dịch vụ
    appointmentDate: formData.preferredDate, // Chỉ gửi ngày (YYYY-MM-DD)
    startTime: formData.preferredTime, // Giờ riêng biệt (HH:mm)
    // Không set consultantId cho test booking, chỉ có consultation mới cần
    // Không set status, backend sẽ tự động set dựa vào thời gian
  };
  
  console.log('Booking data to be sent to backend:', bookingData);
  return bookingData;
};

export const preparePaymentData = (bookingData, price, serviceName) => {
  const baseUrl = window.location.origin;
  const returnUrl = `${baseUrl}/test-booking?bookingId=${bookingData.bookingId}&status=success`;
  const cancelUrl = `${baseUrl}/test-booking?bookingId=${bookingData.bookingId}&status=cancel`;
  
  const paymentPayload = {
    bookingId: bookingData.bookingId,
    amount: price,
    description: `Thanh toán dịch vụ xét nghiệm #${bookingData.bookingId} - ${serviceName || ''}`,
    returnUrl,
    cancelUrl
  };
  
  console.log('PayOS payload:', paymentPayload);
  return paymentPayload;
};
