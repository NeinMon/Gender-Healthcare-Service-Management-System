// serviceManagerHelpers.js - Helper functions for ServiceManager component

// API URLs
const API_BASE = 'http://localhost:8080/api';

// Utility functions
export const getUserIdFromStorage = () => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser') || '{}');
  const currentUserId = localStorage.getItem('userId') || loggedInUser.userID || loggedInUser.id;
  
  if (currentUserId) {
    return Number(currentUserId);
  } else {
    console.warn('Không tìm thấy userId, sử dụng giá trị mặc định');
    return 1;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatPrice = (price) => {
  if (price == null || price === '') return 'N/A';
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  } catch (error) {
    return `${price} VNĐ`;
  }
};

// Services API functions
export const fetchServices = async () => {
  try {
    const response = await fetch(`${API_BASE}/services`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to fetch services');
    }
  } catch (error) {
    console.error('Error fetching services:', error);
    throw new Error('Lỗi kết nối khi tải danh sách dịch vụ');
  }
};

export const searchServices = async (searchTerm) => {
  try {
    const response = await fetch(`${API_BASE}/services/search?name=${encodeURIComponent(searchTerm)}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to search services');
    }
  } catch (error) {
    console.error('Error searching services:', error);
    throw new Error('Lỗi kết nối khi tìm kiếm dịch vụ');
  }
};

export const addService = async (serviceData) => {
  try {
    const response = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData)
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Không thể thêm dịch vụ');
    }
  } catch (error) {
    console.error('Error adding service:', error);
    if (error.message.includes('fetch')) {
      throw new Error('Lỗi kết nối khi thêm dịch vụ');
    }
    throw error;
  }
};

export const updateService = async (serviceId, serviceData) => {
  try {
    const response = await fetch(`${API_BASE}/services/${serviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData)
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Không thể cập nhật dịch vụ');
    }
  } catch (error) {
    console.error('Error updating service:', error);
    if (error.message.includes('fetch')) {
      throw new Error('Lỗi kết nối khi cập nhật dịch vụ');
    }
    throw error;
  }
};

export const deleteService = async (serviceId) => {
  try {
    const response = await fetch(`${API_BASE}/services/${serviceId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      return true;
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Không thể xóa dịch vụ');
    }
  } catch (error) {
    console.error('Error deleting service:', error);
    if (error.message.includes('fetch')) {
      throw new Error('Lỗi kết nối khi xóa dịch vụ');
    }
    throw error;
  }
};

// Users API functions
export const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE}/users`);
    if (response.ok) {
      const data = await response.json();
      // Lấy tất cả các role: consultant, staff và customer
      return data.filter(user => 
        user.role === 'CONSULTANT' || user.role === 'STAFF' || user.role === 'CUSTOMER'
      );
    } else {
      throw new Error('Failed to fetch users');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Lỗi kết nối khi tải danh sách tài khoản');
  }
};

export const searchUsers = async (searchTerm) => {
  try {
    const response = await fetch(`${API_BASE}/users`);
    if (response.ok) {
      const data = await response.json();
      const filteredUsers = data.filter(user => 
        (user.role === 'CONSULTANT' || user.role === 'STAFF' || user.role === 'CUSTOMER') &&
        (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.phone?.includes(searchTerm))
      );
      return filteredUsers;
    } else {
      throw new Error('Failed to search users');
    }
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error('Lỗi kết nối khi tìm kiếm tài khoản');
  }
};

export const addUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Không thể thêm tài khoản');
    }
  } catch (error) {
    console.error('Error adding user:', error);
    if (error.message.includes('fetch')) {
      throw new Error('Lỗi kết nối khi thêm tài khoản');
    }
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Không thể cập nhật tài khoản');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.message.includes('fetch')) {
      throw new Error('Lỗi kết nối khi cập nhật tài khoản');
    }
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      return true;
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Không thể xóa tài khoản');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.message.includes('fetch')) {
      throw new Error('Lỗi kết nối khi xóa tài khoản');
    }
    throw error;
  }
};

// Schedules API functions
export const fetchSchedules = async () => {
  try {
    const response = await fetch(`${API_BASE}/consultant-schedules/all`);
    if (response.ok) {
      const data = await response.json();
      // Sort schedules by workDate (oldest first) and then by shift
      return data.sort((a, b) => {
        // First sort by date (oldest first)
        const dateComparison = new Date(a.workDate) - new Date(b.workDate);
        if (dateComparison !== 0) {
          return dateComparison;
        }
        // If dates are equal, sort by shift (MORNING first, then AFTERNOON)
        if (a.shift === 'MORNING' && b.shift === 'AFTERNOON') {
          return -1;
        } else if (a.shift === 'AFTERNOON' && b.shift === 'MORNING') {
          return 1;
        }
        return 0;
      });
    } else {
      throw new Error('Failed to fetch schedules');
    }
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw new Error('Lỗi kết nối khi tải danh sách lịch làm việc');
  }
};

export const searchSchedules = async (searchTerm) => {
  try {
    const response = await fetch(`${API_BASE}/consultant-schedules/all`);
    if (response.ok) {
      const data = await response.json();
      const filteredSchedules = data.filter(schedule => 
        schedule.workDate?.includes(searchTerm) ||
        schedule.shift?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // Sort filtered schedules by workDate and shift
      return filteredSchedules.sort((a, b) => {
        // First sort by date (oldest first)
        const dateComparison = new Date(a.workDate) - new Date(b.workDate);
        if (dateComparison !== 0) {
          return dateComparison;
        }
        // If dates are equal, sort by shift (MORNING first, then AFTERNOON)
        if (a.shift === 'MORNING' && b.shift === 'AFTERNOON') {
          return -1;
        } else if (a.shift === 'AFTERNOON' && b.shift === 'MORNING') {
          return 1;
        }
        return 0;
      });
    } else {
      throw new Error('Failed to search schedules');
    }
  } catch (error) {
    console.error('Error searching schedules:', error);
    throw new Error('Lỗi kết nối khi tìm kiếm lịch làm việc');
  }
};

export const addSchedule = async (scheduleData) => {
  try {
    const response = await fetch(`${API_BASE}/consultant-schedules/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData)
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorText = await response.text();
      
      // Xử lý lỗi cụ thể
      let errorMessage = 'Không thể thêm lịch làm việc';
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.includes('quá khứ')) {
          errorMessage = 'Không thể tạo lịch cho ngày trong quá khứ';
        } else if (errorData.error && errorData.error.includes('đã tồn tại')) {
          errorMessage = 'Lịch làm việc cho tư vấn viên này trong khung giờ đã tồn tại';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // Nếu không parse được JSON, sử dụng text thô
        if (errorText.includes('quá khứ')) {
          errorMessage = 'Không thể tạo lịch cho ngày trong quá khứ';
        } else if (errorText.includes('đã tồn tại')) {
          errorMessage = 'Lịch làm việc cho tư vấn viên này trong khung giờ đã tồn tại';
        } else {
          errorMessage = errorText || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error adding schedule:', error);
    if (error.message.includes('fetch')) {
      throw new Error('Lỗi kết nối khi thêm lịch làm việc');
    }
    throw error;
  }
};

export const updateSchedule = async (scheduleId, scheduleData) => {
  try {
    const response = await fetch(`${API_BASE}/consultant-schedules/update/${scheduleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData)
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorText = await response.text();
      
      // Xử lý lỗi cụ thể
      let errorMessage = 'Không thể cập nhật lịch làm việc';
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.includes('quá khứ')) {
          errorMessage = 'Không thể cập nhật lịch cho ngày trong quá khứ';
        } else if (errorData.error && errorData.error.includes('đã tồn tại')) {
          errorMessage = 'Lịch làm việc cho tư vấn viên này trong khung giờ đã tồn tại';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // Nếu không parse được JSON, sử dụng text thô
        if (errorText.includes('quá khứ')) {
          errorMessage = 'Không thể cập nhật lịch cho ngày trong quá khứ';
        } else if (errorText.includes('đã tồn tại')) {
          errorMessage = 'Lịch làm việc cho tư vấn viên này trong khung giờ đã tồn tại';
        } else {
          errorMessage = errorText || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error updating schedule:', error);
    if (error.message.includes('fetch')) {
      throw new Error('Lỗi kết nối khi cập nhật lịch làm việc');
    }
    throw error;
  }
};

export const deleteSchedule = async (scheduleId) => {
  try {
    const response = await fetch(`${API_BASE}/consultant-schedules/delete/${scheduleId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      return true;
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Không thể xóa lịch làm việc');
    }
  } catch (error) {
    console.error('Error deleting schedule:', error);
    if (error.message.includes('fetch')) {
      throw new Error('Lỗi kết nối khi xóa lịch làm việc');
    }
    throw error;
  }
};

// Leave Requests API functions
export const fetchLeaveRequests = async () => {
  try {
    const response = await fetch(`${API_BASE}/leave-requests/all`);
    if (response.ok) {
      const data = await response.json();
      // Sort by created date (newest first)
      return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      throw new Error('Failed to fetch leave requests');
    }
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    throw new Error('Lỗi kết nối khi tải danh sách đơn xin nghỉ');
  }
};

export const approveLeaveRequest = async (requestId, managerId) => {
  try {
    const response = await fetch(`${API_BASE}/leave-requests/${requestId}/approve?managerId=${managerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      return true;
    } else {
      const errorText = await response.text();
      throw new Error(errorText);
    }
  } catch (error) {
    console.error('Error approving leave request:', error);
    throw new Error('Lỗi khi duyệt đơn xin nghỉ: ' + error.message);
  }
};

export const rejectLeaveRequest = async (requestId, managerId) => {
  try {
    const response = await fetch(`${API_BASE}/leave-requests/${requestId}/reject?managerId=${managerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      return true;
    } else {
      const errorText = await response.text();
      throw new Error(errorText);
    }
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    throw new Error('Lỗi khi từ chối đơn xin nghỉ: ' + error.message);
  }
};

// Validation functions
export const validateServiceData = (formData, userId) => {
  if (!formData.serviceName.trim()) {
    throw new Error('Vui lòng nhập tên dịch vụ');
  }
  
  if (!formData.price || parseFloat(formData.price) < 1000) {
    throw new Error('Giá dịch vụ phải từ 1,000 VNĐ trở lên');
  }

  if (!userId) {
    throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
  }

  return {
    serviceName: formData.serviceName.trim(),
    description: formData.description.trim() || null,
    price: parseFloat(formData.price),
    managerId: userId
  };
};

export const validateUserData = (userFormData) => {
  if (!userFormData.fullName.trim()) {
    throw new Error('Vui lòng nhập họ tên');
  }
  
  if (!userFormData.email.trim()) {
    throw new Error('Vui lòng nhập email');
  }
  
  if (!userFormData.password || userFormData.password.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  }

  if (!userFormData.phone.trim()) {
    throw new Error('Vui lòng nhập số điện thoại');
  }

  return {
    fullName: userFormData.fullName.trim(),
    email: userFormData.email.trim(),
    password: userFormData.password,
    gender: userFormData.gender,
    dob: userFormData.dob || null,
    phone: userFormData.phone.trim(),
    address: userFormData.address.trim() || null,
    role: userFormData.role,
    specification: userFormData.specification.trim() || null
  };
};

export const validateScheduleData = (scheduleFormData) => {
  if (!scheduleFormData.consultantID) {
    throw new Error('Vui lòng chọn tư vấn viên');
  }
  
  if (!scheduleFormData.workDate) {
    throw new Error('Vui lòng chọn ngày làm việc');
  }

  return {
    consultantID: parseInt(scheduleFormData.consultantID),
    workDate: scheduleFormData.workDate,
    shift: scheduleFormData.shift,
    status: scheduleFormData.status,
    notes: scheduleFormData.notes.trim() || ""
  };
};
