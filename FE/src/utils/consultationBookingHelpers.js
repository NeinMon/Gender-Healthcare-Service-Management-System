// Utility functions for ConsultationBooking component

// API calls
export const fetchConsultants = async (setConsultants) => {
  try {
    const res = await fetch('http://localhost:8080/api/users/consultants');
    if (res.ok) {
      const data = await res.json();
      setConsultants(data);
    } else {
      setConsultants([]);
    }
  } catch (error) {
    setConsultants([]);
  }
};

// Fetch consultants available on a specific date
export const fetchAvailableConsultants = async (date, setConsultants) => {
  try {
    if (!date) {
      // Nếu không có ngày, load tất cả consultant
      return fetchConsultants(setConsultants);
    }
    
    const res = await fetch(`http://localhost:8080/api/users/consultants/available?date=${date}`);
    if (res.ok) {
      const data = await res.json();
      setConsultants(data);
    } else {
      // Nếu API lỗi, fallback về tất cả consultant
      console.warn('Failed to fetch available consultants, falling back to all consultants');
      return fetchConsultants(setConsultants);
    }
  } catch (error) {
    console.error('Error fetching available consultants:', error);
    // Nếu có lỗi, fallback về tất cả consultant
    return fetchConsultants(setConsultants);
  }
};

// Fetch consultant work shifts for a specific date
export const fetchConsultantSchedule = async (consultantId, date) => {
  try {
    if (!consultantId || !date) {
      return null;
    }
    
    const res = await fetch(`http://localhost:8080/api/consultant-schedules/consultant/${consultantId}`);
    if (res.ok) {
      const schedules = await res.json();
      // Tìm lịch làm việc của consultant trong ngày cụ thể
      const daySchedule = schedules.find(schedule => 
        schedule.workDate === date && schedule.status === 'AVAILABLE'
      );
      return daySchedule;
    }
    return null;
  } catch (error) {
    console.error('Error fetching consultant schedule:', error);
    return null;
  }
};

// Generate time slots based on work shift
export const generateTimeSlotsByShift = (shift) => {
  const slots = [];
  
  if (shift === 'MORNING') {
    // Ca sáng: 8:00-12:00
    for (let hour = 8; hour < 12; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`);
    }
  } else if (shift === 'AFTERNOON') {
    // Ca chiều: 13:30-17:30
    slots.push('13:30 - 14:30');
    slots.push('14:30 - 15:30');
    slots.push('15:30 - 16:30');
    slots.push('16:30 - 17:30');
  }
  
  return slots;
};

export const fetchConsultationPrice = async (setConsultationPrice) => {
  try {
    const res = await fetch('http://localhost:8080/api/services/1');
    if (res.ok) {
      const data = await res.json();
      if (data && data.price) setConsultationPrice(data.price);
    }
  } catch (error) {
    // Keep default price
  }
};

export const fetchUserInfo = async (setFormData) => {
  // Lấy thông tin user từ localStorage dựa vào loggedInUser
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
  
  try {
    const res = await fetch(`http://localhost:8080/api/users/${userId}`);
    if (res.ok) {
      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        fullName: data.fullName || data.name || '',
        phone: data.phone || ''
      }));
    }
  } catch (error) {
    // Keep default values
  }
};

export const fetchAvailableTimes = async (consultantId, date, setAvailableTimes, setLoadingTimes) => {
  if (consultantId && date) {
    setLoadingTimes(true);
    try {
      // Bước 1: Lấy thông tin ca làm việc của consultant
      const scheduleInfo = await fetchConsultantSchedule(consultantId, date);
      
      if (!scheduleInfo) {
        // Nếu consultant không có lịch làm việc trong ngày này
        setAvailableTimes([]);
        setLoadingTimes(false);
        return;
      }
      
      // Bước 2: Tạo danh sách khung giờ theo ca làm việc
      const allTimeSlots = generateTimeSlotsByShift(scheduleInfo.shift);
      
      // Bước 3: Lấy khung giờ đã được đặt từ backend
      const res = await fetch(`http://localhost:8080/api/bookings/available-times?consultantId=${consultantId}&date=${date}`);
      if (res.ok) {
        const availableSlots = await res.json();
        // Lọc chỉ những slot thuộc ca làm việc và còn trống
        const filteredSlots = allTimeSlots.filter(slot => availableSlots.includes(slot));
        setAvailableTimes(filteredSlots);
      } else {
        // Nếu API lỗi, hiển thị tất cả slot theo ca làm việc
        setAvailableTimes(allTimeSlots);
      }
      
      setLoadingTimes(false);
    } catch (error) {
      console.error('Error fetching available times:', error);
      setAvailableTimes([]);
      setLoadingTimes(false);
    }
  } else {
    setAvailableTimes([]);
    setLoadingTimes(false);
  }
};

// Utility functions
export const isTimeSlotPassed = (timeSlot, date) => {
  if (!date) return false;
  const today = new Date();
  const selectedDate = new Date(date);
  if (selectedDate.toDateString() !== today.toDateString()) return false;
  
  // Lấy giờ bắt đầu và kết thúc từ slot ("08:00 - 09:00")
  const [slotStartTime, slotEndTime] = timeSlot.split(' - ');
  const [startHour, startMinute] = slotStartTime.split(':').map(Number);
  const [endHour, endMinute] = slotEndTime.split(':').map(Number);
  
  // Tạo đối tượng Date cho endTime của slot
  const slotEnd = new Date(selectedDate);
  slotEnd.setHours(endHour, endMinute, 0, 0);
  
  // Nếu thời gian hiện tại đã sau endTime của slot thì disable
  return today > slotEnd;
};

export const getUserIdFromStorage = () => {
  const userJson = localStorage.getItem('loggedInUser');
  let userId = 1; // Giá trị mặc định nếu không tìm thấy
  
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

export const validateBookingData = (userId, formData, availableTimes, appointmentDate, startTime) => {
  if (!userId || !formData.consultantId || !formData.symptoms.trim() || !appointmentDate || !startTime) {
    return "Vui lòng điền đầy đủ thông tin hợp lệ!";
  }

  // Kiểm tra thời gian đã qua chưa
  if (isTimeSlotPassed(formData.time, formData.date)) {
    return "Khung giờ đã chọn đã qua! Vui lòng chọn khung giờ khác.";
  }

  // Kiểm tra khung giờ có trong danh sách available không
  if (!availableTimes.includes(formData.time)) {
    return "Khung giờ đã chọn không còn trống! Vui lòng chọn lại.";
  }

  return null; // No error
};

export const createBookingPayload = (formData, consultationPrice) => {
  const userId = getUserIdFromStorage();
  
  // Gộp ngày và giờ thành appointmentDate (yyyy-MM-dd) và startTime (HH:mm)
  let appointmentDate = '';
  let startTime = '';
  if (formData.date && formData.time) {
    appointmentDate = formData.date; // yyyy-MM-dd
    const timePart = formData.time.split(' - ')[0]; // "08:00"
    startTime = timePart;
  }

  return {
    userId: Number(userId),
    consultantId: Number(formData.consultantId),
    content: formData.symptoms,
    appointmentDate: appointmentDate, // yyyy-MM-dd
    startTime: startTime, // HH:mm
    // Default service ID for consultation is 1
    serviceId: 1,
    // Lấy giá từ backend
    amount: consultationPrice
  };
};

export const createBooking = async (payload) => {
  console.log("Payload gửi booking:", payload);
  
  const bookingResponse = await fetch("http://localhost:8080/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (bookingResponse.ok) {
    return await bookingResponse.json();
  } else {
    const errorText = await bookingResponse.text();
    throw new Error({ status: bookingResponse.status, message: errorText });
  }
};

export const createPaymentUrl = async (bookingData, consultationPrice) => {
  const baseUrl = window.location.origin;
  const returnUrl = `${baseUrl}/ConsultationBooking?bookingId=${bookingData.bookingId}&status=success`;
  const cancelUrl = `${baseUrl}/ConsultationBooking?bookingId=${bookingData.bookingId}&status=cancel`;
  
  const paymentPayload = {
    bookingId: bookingData.bookingId,
    amount: consultationPrice,
    description: `Thanh toán dịch vụ tư vấn #${bookingData.bookingId}`,
    returnUrl: returnUrl,
    cancelUrl: cancelUrl
  };
  
  console.log("Gửi yêu cầu thanh toán:", paymentPayload);
  
  const paymentResponse = await fetch("http://localhost:8080/api/payment/payos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentPayload),
  });
  
  console.log("Kết quả trả về từ payment API:", paymentResponse.status);
  
  if (paymentResponse.ok) {
    const paymentData = await paymentResponse.json();
    console.log("Payment data:", paymentData);
    
    if (paymentData && paymentData.payUrl) {
      return paymentData.payUrl;
    } else {
      throw new Error("PayOS không trả về URL thanh toán hợp lệ");
    }
  } else {
    let errorText = "";
    try {
      // Cố gắng lấy phản hồi dạng JSON
      const errorJson = await paymentResponse.json();
      errorText = errorJson.message || JSON.stringify(errorJson);
    } catch (e) {
      // Nếu không phải JSON, lấy dạng text
      errorText = await paymentResponse.text();
    }
    
    console.error("Lỗi từ API thanh toán:", errorText);
    throw new Error(`Không thể tạo liên kết thanh toán: ${errorText}`);
  }
};

export const checkPaymentStatus = async (id, isOrderCode = false) => {
  let res;
  if (isOrderCode) {
    res = await fetch(`http://localhost:8080/api/payment/status/order/${id}`);
  } else {
    res = await fetch(`http://localhost:8080/api/payment/status/${id}`);
  }
  
  if (res.ok) {
    return await res.json();
  } else {
    throw new Error('Failed to check payment status');
  }
};

export const retryPayment = async (bookingDetails, consultationPrice) => {
  if (!bookingDetails?.bookingId) {
    throw new Error("Không tìm thấy thông tin đặt lịch.");
  }

  const baseUrl = window.location.origin;
  const returnUrl = `${baseUrl}/ConsultationBooking?bookingId=${bookingDetails.bookingId}&status=success`;
  const cancelUrl = `${baseUrl}/ConsultationBooking?bookingId=${bookingDetails.bookingId}&status=cancel`;
  
  const paymentPayload = {
    bookingId: bookingDetails.bookingId,
    amount: consultationPrice,
    description: `Thanh toán dịch vụ tư vấn #${bookingDetails.bookingId}`,
    returnUrl: returnUrl,
    cancelUrl: cancelUrl
  };
  
  const paymentResponse = await fetch("http://localhost:8080/api/payment/payos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentPayload),
  });
  
  if (paymentResponse.ok) {
    const paymentData = await paymentResponse.json();
    return paymentData.payUrl;
  } else {
    const errorText = await paymentResponse.text();
    throw new Error(`Không thể tạo liên kết thanh toán: ${errorText}`);
  }
};

export const cancelPayment = async (bookingDetails) => {
  if (!bookingDetails?.bookingId) {
    throw new Error("Không tìm thấy thông tin đặt lịch để hủy thanh toán.");
  }
  
  const response = await fetch(`http://localhost:8080/api/payment/cancel/${bookingDetails.bookingId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cancellationReason: "Khách hàng chủ động hủy thanh toán" })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Không thể hủy thanh toán: ' + errorText);
  }
  
  return true;
};

// Form handlers
export const handleFormChange = (e, formData, setFormData, setFormData2) => {
  const { name, value } = e.target;
  const newFormData = {
    ...formData,
    [name]: value
  };
  setFormData(newFormData);
  
  // Reset thời gian đã chọn nếu thay đổi ngày và thời gian đó đã qua
  if (name === 'date' && formData.time && isTimeSlotPassed(formData.time, value)) {
    setFormData2(prev => ({
      ...prev,
      time: ''
    }));
  }
};

// URL parameter handling
export const parseUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    bookingId: urlParams.get('bookingId'),
    orderCode: urlParams.get('orderCode'),
    status: urlParams.get('status'),
    cancel: urlParams.get('cancel')
  };
};

export const shouldShowCancelledStatus = (params) => {
  return (
    (params.status && (params.status.toUpperCase() === 'CANCELLED' || params.status.toUpperCase() === 'EXPIRED' || params.status.toLowerCase() === 'cancel')) ||
    (params.cancel && params.cancel === 'true')
  );
};

export const shouldCheckPaymentStatus = (params) => {
  return (params.orderCode || params.bookingId) && 
         (params.status === 'success' || params.status?.toUpperCase() === 'PROCESSING' || !params.status);
};

// Styles
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
