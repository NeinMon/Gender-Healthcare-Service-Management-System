// API endpoints
const API_BASE_URL = 'http://localhost:8080/api';

// Constants
export const STATUS_OPTIONS = [
  "Chờ bắt đầu",
  "Đã check-in", 
  "Đã check-out",
  "Đã kết thúc"
];

/**
 * Helper để lấy thông tin các dịch vụ từ API
 */
export const fetchServiceNames = async (serviceIds) => {
  if (!serviceIds || serviceIds.length === 0) {
    return {};
  }
  try {
    const servicesResponse = await fetch(`${API_BASE_URL}/services`);
    if (servicesResponse.ok) {
      const allServices = await servicesResponse.json();
      const namesObj = {};
      allServices.forEach(service => {
        const id = typeof service.serviceId === 'string' 
          ? parseInt(service.serviceId, 10) 
          : service.serviceId;
        namesObj[id] = service.serviceName;
      });
      return namesObj;
    }
  } catch (err) {
    console.error('Error fetching service names:', err);
  }
  return {};
};

/**
 * Lấy serviceId từ booking
 */
export const getServiceId = (booking) => {
  if (booking.serviceId !== undefined && booking.serviceId !== null) {
    return typeof booking.serviceId === 'string' ? parseInt(booking.serviceId, 10) : booking.serviceId;
  }
  return null;
};

/**
 * Lấy tên dịch vụ xét nghiệm từ booking
 */
export const getServiceName = (booking, serviceNames) => {
  if (booking.serviceName) {
    return booking.serviceName;
  }
  const serviceId = getServiceId(booking);
  if (serviceId !== null && serviceNames[serviceId]) {
    return serviceNames[serviceId];
  }
  return "Xét nghiệm chưa xác định";
};

/**
 * Helper để lấy màu sắc trạng thái
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'Chờ bắt đầu':
      return { bg: '#fde68a', color: '#b45309' };
    case 'Đã check-in':
      return { bg: '#22d3ee', color: '#fff' };
    case 'Đã check-out':
      return { bg: '#86efac', color: '#166534' };
    case 'Đã kết thúc':
      return { bg: '#c084fc', color: '#fff' };
    default:
      return { bg: '#e5e7eb', color: '#374151' };
  }
};

/**
 * Format trạng thái xét nghiệm chi tiết tiếng Việt
 */
export const formatTestStatus = (status) => {
  if (!status) return 'Không xác định';
  
  const statusUpper = status.toString().toUpperCase();
  switch (statusUpper) {
    case 'NORMAL':
    case 'Normal':
      return 'Bình thường';
    case 'HIGH':
    case 'High':
      return 'Cao hơn bình thường';
    case 'LOW':
    case 'Low':
      return 'Thấp hơn bình thường';
    case 'ABNORMAL':
    case 'Abnormal':
      return 'Bất thường';
    case 'CRITICAL':
    case 'Critical':
      return 'Nguy hiểm';
    case 'BORDERLINE':
    case 'Borderline':
      return 'Biên giới';
    case 'ELEVATED':
    case 'Elevated':
      return 'Tăng cao';
    case 'DECREASED':
    case 'Decreased':
      return 'Giảm thấp';
    default:
      return status;
  }
};

/**
 * Lấy màu sắc cho trạng thái xét nghiệm
 */
export const getTestStatusColor = (status) => {
  if (!status) return { bg: '#f3f4f6', color: '#6b7280' };
  
  const statusUpper = status.toString().toUpperCase();
  switch (statusUpper) {
    case 'NORMAL':
    case 'Normal':
      return { bg: '#f0fdf4', color: '#16a34a' };
    case 'HIGH':
    case 'High':
    case 'ELEVATED':
    case 'Elevated':
      return { bg: '#fef3c7', color: '#d97706' };
    case 'LOW':
    case 'Low':
    case 'DECREASED':
    case 'Decreased':
      return { bg: '#dbeafe', color: '#2563eb' };
    case 'ABNORMAL':
    case 'Abnormal':
    case 'CRITICAL':
    case 'Critical':
      return { bg: '#fef2f2', color: '#dc2626' };
    case 'BORDERLINE':
    case 'Borderline':
      return { bg: '#fdf4ff', color: '#a855f7' };
    default:
      return { bg: '#f3f4f6', color: '#6b7280' };
  }
};

/**
 * Lấy danh sách test booking từ API
 */
export const fetchBookings = async (statusFilter) => {
  try {
    const endpoint = statusFilter 
      ? `${API_BASE_URL}/test-bookings/status/${encodeURIComponent(statusFilter)}/detail`
      : `${API_BASE_URL}/test-bookings/all/detail`;
    
    const res = await fetch(endpoint);
    if (res.ok) {
      const data = await res.json();
      return data.filter(b => (b.payment?.status || '').toUpperCase() === 'PAID');
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
};

/**
 * Cập nhật trạng thái booking
 */
export const updateBookingStatus = async (id, newStatus) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/test-bookings/${id}/status?status=${encodeURIComponent(newStatus)}`,
      { method: "PUT" }
    );
    return res.ok;
  } catch (error) {
    console.error('Error updating booking status:', error);
    return false;
  }
};

/**
 * Lấy test parameters cho service
 */
export const fetchTestParameters = async (serviceId) => {
  try {
    const parametersUrl = `${API_BASE_URL}/service-test-parameters/service/${serviceId}`;
    const parametersResponse = await fetch(parametersUrl);
    
    if (parametersResponse.ok) {
      const parameters = await parametersResponse.json();
      if (parameters && parameters.length > 0) {
        return parameters;
      }
    }
    
    // Fallback parameters
    return [
      { parameterId: 'fallback1', parameterName: 'Kết quả xét nghiệm', unit: '', normalRange: 'Âm tính/Dương tính' },
      { parameterId: 'fallback2', parameterName: 'Ghi chú bổ sung', unit: '', normalRange: 'Tùy chọn' }
    ];
  } catch (error) {
    console.error('Error fetching test parameters:', error);
    // Emergency fallback
    return [
      { parameterId: 'emergency1', parameterName: 'Kết quả', unit: '', normalRange: 'Nhập kết quả' }
    ];
  }
};

/**
 * Khởi tạo selectedParameters với giá trị rỗng
 */
export const initializeSelectedParameters = (parameters) => {
  const initialParams = {};
  parameters.forEach(param => {
    initialParams[param.parameterId] = '';
  });
  return initialParams;
};

/**
 * Khởi tạo editingParameters với giá trị hiện tại
 */
export const initializeEditingParameters = (parameters, testResults) => {
  const currentParams = {};
  parameters.forEach(param => {
    const existingResult = testResults.find(tr => 
      tr.parameterId.toString() === param.parameterId.toString()
    );
    currentParams[param.parameterId] = existingResult ? existingResult.resultValue : '';
  });
  return currentParams;
};

/**
 * Validation cho tham số bắt buộc
 */
export const validateRequiredParameters = (testParameters, selectedParameters) => {
  const missingParameters = [];
  testParameters.forEach(param => {
    const value = selectedParameters[param.parameterId];
    if (!value || value.trim() === '') {
      missingParameters.push(param.parameterName);
    }
  });
  return missingParameters;
};

/**
 * Validation cho kết quả tổng quát và trạng thái
 */
export const validateOverallResult = (overallResult, overallStatus) => {
  if (!overallResult || overallResult.trim() === '') {
    return "Vui lòng nhập kết quả tổng quát!";
  }
  if (!overallStatus) {
    return "Vui lòng chọn trạng thái kết quả!";
  }
  return null;
};

/**
 * Kiểm tra có ít nhất một tham số được nhập
 */
export const hasParameterValues = (selectedParameters) => {
  return Object.values(selectedParameters).some(value => value && value.trim() !== '');
};

/**
 * Gửi kết quả xét nghiệm với endpoint with-summary
 */
export const sendTestResultWithSummary = async (testResultObj) => {
  try {
    const res = await fetch(`${API_BASE_URL}/test-results/with-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testResultObj)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }
    return true;
  } catch (error) {
    console.error('Error sending test result with summary:', error);
    throw error;
  }
};

/**
 * Gửi chỉ kết quả tổng quát (summary)
 */
export const sendTestResultSummary = async (summaryObj) => {
  try {
    const summaryRes = await fetch(`${API_BASE_URL}/test-result-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(summaryObj)
    });
    
    if (!summaryRes.ok) {
      const errorText = await summaryRes.text();
      throw new Error(errorText);
    }
    return true;
  } catch (error) {
    console.error('Error sending test result summary:', error);
    throw error;
  }
};

/**
 * Hoàn thành xét nghiệm (chuyển trạng thái)
 */
export const completeTestBooking = async (bookingId) => {
  try {
    const completeRes = await fetch(
      `${API_BASE_URL}/test-bookings/${bookingId}/status?status=${encodeURIComponent("Đã kết thúc")}`,
      { method: "PUT" }
    );
    
    if (!completeRes.ok) {
      throw new Error(`Không thể hoàn thành xét nghiệm. Mã lỗi: ${completeRes.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error completing test booking:', error);
    throw error;
  }
};

/**
 * Lấy test results cho booking
 */
export const fetchTestResults = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-results/test-booking/${bookingId}`);
    
    if (response.ok) {
      return await response.json();
    } else if (response.status === 404) {
      console.log("No test results found for booking ID:", bookingId);
      return [];
    } else {
      throw new Error(`Lỗi lấy kết quả xét nghiệm: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching test results:', error);
    throw error;
  }
};

/**
 * Lấy test result summary
 */
export const fetchTestResultSummary = async (bookingId) => {
  try {
    const summaryResponse = await fetch(`${API_BASE_URL}/test-result-summary/test-booking/${bookingId}`);
    
    if (summaryResponse.ok) {
      return await summaryResponse.json();
    } else {
      console.log("No summary found for booking ID:", bookingId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching test result summary:', error);
    return null;
  }
};

/**
 * Lấy parameter names từ API
 */
export const fetchParameterNames = async (serviceId, testResults) => {
  try {
    const parameterIds = [...new Set(testResults.map(tr => tr.parameterId))];
    const parametersResponse = await fetch(`${API_BASE_URL}/service-test-parameters/service/${serviceId}`);
    
    if (parametersResponse.ok) {
      const parameters = await parametersResponse.json();
      const parameterNames = {};
      parameters.forEach(param => {
        parameterNames[param.parameterId] = param.parameterName;
      });
      return parameterNames;
    }
    return {};
  } catch (error) {
    console.error('Error fetching parameter names:', error);
    return {};
  }
};

/**
 * Cập nhật test result hiện có
 */
export const updateTestResult = async (resultId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-results/${resultId}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return true;
  } catch (error) {
    console.error('Error updating test result:', error);
    throw error;
  }
};

/**
 * Tạo test result mới
 */
export const createTestResult = async (createData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-results`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return true;
  } catch (error) {
    console.error('Error creating test result:', error);
    throw error;
  }
};

/**
 * Cập nhật test result summary
 */
export const updateTestResultSummary = async (summaryId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-result-summary/${summaryId}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return true;
  } catch (error) {
    console.error('Error updating test result summary:', error);
    throw error;
  }
};

/**
 * Tạo test result summary mới
 */
export const createTestResultSummary = async (createData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-result-summary`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return true;
  } catch (error) {
    console.error('Error creating test result summary:', error);
    throw error;
  }
};

/**
 * Transform booking data để hiển thị
 */
export const transformBookingData = (bookings, serviceNames) => {
  return bookings.map(b => {
    const serviceId = getServiceId(b);
    const displayServiceName = getServiceName(b, serviceNames);
    return {
      id: b.id,
      bookingId: b.bookingId,
      fullName: b.fullName || "N/A",
      phone: b.phone || "N/A",
      serviceId: serviceId,
      serviceName: displayServiceName,
      content: b.bookingContent || "",
      appointmentDate: b.appointmentDate ? (typeof b.appointmentDate === 'string' ? b.appointmentDate.split('T')[0] : (b.appointmentDate?.toString?.().split('T')[0] || "")) : "",
      startTime: b.appointmentTime || "",
      notes: b.bookingContent || "N/A",
      testStatus: b.testStatus || "",
      paymentStatus: b.payment?.status || '',
      amount: b.payment?.amount || '',
      paymentId: b.payment?.paymentLinkId || '',
      orderCode: b.payment?.orderCode || '',
    };
  });
};
