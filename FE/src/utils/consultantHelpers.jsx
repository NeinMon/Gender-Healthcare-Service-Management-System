// Helper functions for ConsultantInterface component

import React from 'react';

// Utility functions
export const formatDate = (dateString) => {
  if (!dateString) return 'Không có ngày';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

export const getStatusBadge = (status, id) => {
  let badgeStyle = {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'inline-block'
  };

  // Map status values to show only two states: Đã trả lời and Chờ trả lời
  switch(status?.toLowerCase()) {
    case 'resolved':
      return <span key={`status-${id || 'resolved'}`} style={{...badgeStyle, backgroundColor: '#d0f7ea', color: '#0f766e'}}>Đã trả lời</span>;
    case 'pending':
    default:
      return <span key={`status-${id || 'pending'}`} style={{...badgeStyle, backgroundColor: '#fef9c3', color: '#ca8a04'}}>Chờ trả lời</span>;
  }
};

// API functions
export const fetchConsultantInfo = async (setConsultant) => {
  try {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    
    if (!userId) {
      console.error('Không tìm thấy userId trong storage');
      return;
    }
    
    const response = await fetch(`http://localhost:8080/api/users/${userId}`);
    if (response.ok) {
      const data = await response.json();
      setConsultant(data);
    } else {
      console.error('Không thể lấy thông tin tư vấn viên');
    }
  } catch (err) {
    console.error('Lỗi khi lấy thông tin tư vấn viên:', err);
  }
};

export const fetchQuestions = async (setQuestions, setLoading, setError) => {
  try {
    setLoading(true);
    const response = await fetch('http://localhost:8080/api/questions');

    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }

    const data = await response.json();
    setQuestions(data);
  } catch (err) {
    setError('Error fetching questions: ' + err.message);
    console.error('Error fetching data:', err);
  } finally {
    setLoading(false);
  }
};

export const fetchExistingAnswer = async (questionId, setLoadingAnswer, setExistingAnswer, setAnswers, setAnswerText) => {
  try {
    setLoadingAnswer(true);
    const response = await fetch(`http://localhost:8080/api/answers/${questionId}`);
    
    if (response.ok) {
      const data = await response.json();
      setExistingAnswer(data);
      
      // Store the answer in the answers cache
      setAnswers(prev => ({
        ...prev,
        [questionId]: data
      }));
      
      // Không điền sẵn vào ô trả lời để tránh hiển thị câu trả lời hai lần
      // Chỉ hiển thị câu trả lời đã có trong phần existingAnswer
      setAnswerText('');
    } else {
      // No answer exists or other error
      setExistingAnswer(null);
      setAnswerText('');
    }
  } catch (error) {
    console.error('Error fetching answer:', error);
    setExistingAnswer(null);
  } finally {
    setLoadingAnswer(false);
  }
};

export const fetchBookings = async (setLoadingBookings, setBookings, setBookingUserDetails) => {
  console.log('🔄 fetchBookings called');
  setLoadingBookings(true);
  const consultantId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  console.log('👤 Consultant ID:', consultantId);
  
  if (!consultantId) {
    console.log('❌ No consultant ID found');
    setBookings([]);
    setLoadingBookings(false);
    return;
  }
  
  try {
    console.log('📡 Fetching bookings from API...');
    const res = await fetch(`http://localhost:8080/api/bookings/consultant/${consultantId}`);
    console.log('📡 API Response status:', res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log('📋 Bookings data:', data);
      setBookings(data);
      
      // Fetch user info for each booking
      const uniqueUserIds = [...new Set(data.map(b => b.userId))];
      console.log('👥 Unique user IDs:', uniqueUserIds);
      
      const userMap = {};
      await Promise.all(uniqueUserIds.map(async (userId) => {
        try {
          const userRes = await fetch(`http://localhost:8080/api/users/${userId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            userMap[userId] = userData;
          } else {
            userMap[userId] = { fullName: 'Không rõ' };
          }
        } catch {
          userMap[userId] = { fullName: 'Không rõ' };
        }
      }));
      console.log('👥 User map:', userMap);
      setBookingUserDetails(userMap);
    } else {
      console.log('❌ API error:', res.status);
      setBookings([]);
    }
  } catch (error) {
    console.error('❌ Fetch error:', error);
    setBookings([]);
  }
  console.log('✅ fetchBookings completed, setting loading to false');
  setLoadingBookings(false);
};

// Event handlers
export const handleQuestionClick = (question, selectedQuestion, setSelectedQuestion, setAnswerText, setExistingAnswer, fetchExistingAnswer) => {
  // Xác định ID câu hỏi (hỗ trợ cả questionID và id)
  const questionId = question.questionID || question.id;
  const selectedId = selectedQuestion ? (selectedQuestion.questionID || selectedQuestion.id) : null;
  
  const isSameQuestion = selectedQuestion && selectedId === questionId;
  
  if (!isSameQuestion) {
    setSelectedQuestion(question);
    setAnswerText('');
    
    // Nếu câu hỏi đã có câu trả lời (resolved) thì hiển thị câu trả lời đó
    if (question.status?.toLowerCase() === 'resolved') {
      // Sử dụng ID chính xác để truy vấn câu trả lời
      fetchExistingAnswer(questionId);
    } else {
      // Không phải câu hỏi đã trả lời, không hiển thị phần câu trả lời cũ
      setExistingAnswer(null);
    }
  } else {
    // Clicking the same question again closes it
    setSelectedQuestion(null);
    setAnswerText('');
    setExistingAnswer(null);
  }
};

export const handleAnswerChange = (e, setAnswerText) => {
  setAnswerText(e.target.value);
};

export const handleFilterChange = (e, setFilterStatus) => {
  setFilterStatus(e.target.value);
};

// Answer submission function
export const submitAnswer = async (selectedQuestion, answerText, setSubmitting, setQuestions, setSelectedQuestion, setAnswerText) => {
  if (!answerText.trim()) {
    alert('Vui lòng nhập câu trả lời');
    return;
  }

  if (!selectedQuestion) {
    alert('Không tìm thấy câu hỏi. Vui lòng chọn câu hỏi khác.');
    console.error('selectedQuestion không tồn tại', selectedQuestion);
    return;
  }
  
  // Kiểm tra xem ID câu hỏi nằm ở field nào (id hoặc questionID)
  const questionId = selectedQuestion.questionID || selectedQuestion.id;
  if (!questionId) {
    alert('Không tìm thấy ID câu hỏi. Vui lòng chọn câu hỏi khác.');
    console.error('Không tìm thấy ID trong câu hỏi', selectedQuestion);
    return;
  }

  try {
    setSubmitting(true);
    // Lấy ID của consultant từ localStorage hoặc sessionStorage
    const consultantIdStr = localStorage.getItem('userId') || 
                        sessionStorage.getItem('userId') || 
                        '1073741824'; // Sử dụng ID đã được chỉ định từ yêu cầu API
    
    // Đảm bảo ID được chuyển sang số nguyên
    const consultantId = parseInt(consultantIdStr, 10);
      // Đối với questionId, sử dụng questionID (viết hoa) hoặc id (viết thường) tùy thuộc vào API
    const rawQuestionId = selectedQuestion.questionID || selectedQuestion.id;
    const questionIdNum = parseInt(rawQuestionId, 10);
    
    // Kiểm tra và ghi log để debug
    console.log('Selected question:', selectedQuestion);
    console.log('Question ID field availability:', { 
      'id': selectedQuestion.id !== undefined ? 'exists' : 'missing',
      'questionID': selectedQuestion.questionID !== undefined ? 'exists' : 'missing'
    });
    console.log('Question ID (raw):', rawQuestionId);
    console.log('Question ID (used):', questionIdNum);
    console.log('Consultant ID (used):', consultantId);
    
    // Chuẩn bị dữ liệu theo đúng định dạng API yêu cầu
    const answerData = {
      questionId: questionIdNum, // Đã chuyển sang số nguyên
      consultantId: consultantId, // Đã chuyển sang số nguyên
      content: answerText.trim() // Nội dung câu trả lời (đã loại bỏ khoảng trắng thừa)
    };

    console.log('Gửi câu trả lời với dữ liệu:', answerData);
    
    // Kiểm tra một lần nữa trước khi gọi API
    console.log('Request body (stringified):', JSON.stringify(answerData));
    
    // Gọi API để gửi câu trả lời
    const response = await fetch('http://localhost:8080/api/answers/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(answerData)
    });

    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);
    
    // Log headers
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Response headers:', headers);
    
    let responseData;
    try {
      const text = await response.text();
      console.log('Raw response text:', text);
      
      // Nếu text không rỗng, thử parse thành JSON
      if (text && text.trim()) {
        try {
          responseData = JSON.parse(text);
          console.log('Parsed response data:', responseData);
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError);
          responseData = { message: 'Invalid JSON response' };
        }
      } else {
        responseData = { message: 'Empty response from server' };
      }
    } catch (e) {
      console.error('Failed to read response text:', e);
      responseData = { message: 'Không thể đọc phản hồi từ server' };
    }

    // Kiểm tra phản hồi dựa trên status code
    if (!response.ok) {
      let errorMessage = 'Unknown error occurred';
      
      // Xử lý các mã lỗi phổ biến
      if (response.status === 400) {
        errorMessage = `Bad Request: ${responseData.message || 'Invalid question or consultant ID format'}`;
      } else if (response.status === 404) {
        errorMessage = 'Not Found: Question or consultant not found';
      } else if (response.status === 500) {
        errorMessage = 'Server Error: Please try again later';
      } else if (responseData && responseData.message) {
        errorMessage = responseData.message;
      }
      
      throw new Error(`Failed to submit answer: ${errorMessage}`);
    }
    
    console.log('Câu trả lời đã được gửi thành công:', responseData);
      // Cập nhật trạng thái câu hỏi trong UI - sử dụng ID phù hợp (questionID hoặc id)
    const updateId = selectedQuestion.questionID || selectedQuestion.id;
    setQuestions(questions => questions.map(q => {
      // Kiểm tra cả hai trường id có thể có
      const qId = q.questionID || q.id;
      return qId === parseInt(updateId, 10) ? { ...q, status: 'resolved' } : q;
    }));

    // Đóng phần trả lời
    setSelectedQuestion(null);
    setAnswerText('');
    
    alert('Câu trả lời đã được gửi thành công!');
  } catch (err) {
    console.error('Error submitting answer:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      selectedQuestionId: selectedQuestion?.id,
      answerTextLength: answerText.length,
      consultantId: parseInt(localStorage.getItem('userId') || sessionStorage.getItem('userId') || '1073741824', 10)
    });
    
    // Hiện thông báo lỗi chi tiết hơn
    let errorMsg = err.message;
    if (errorMsg.includes('400')) {
      errorMsg = 'Lỗi dữ liệu: ID câu hỏi hoặc ID tư vấn viên không hợp lệ. Vui lòng kiểm tra lại.';
    } else if (errorMsg.includes('server')) {
      errorMsg = 'Lỗi kết nối với máy chủ. Vui lòng thử lại sau.';
    }
    
    alert('Lỗi khi gửi câu trả lời: ' + errorMsg);
  } finally {
    setSubmitting(false);
  }
};

// Booking status update functions
export const updateBookingStatus = async (bookingId, newStatus, endTime = null, setBookings, showVideoCall) => {
  try {
    let apiUrl = `http://localhost:8080/api/bookings/${bookingId}/status?status=${encodeURIComponent(newStatus)}`;
    if (newStatus === 'Đã kết thúc') {
      // Truyền endTime dạng HH:mm nếu có
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const endTimeStr = endTime || `${hh}:${mm}`;
      apiUrl += `&endTime=${encodeURIComponent(endTimeStr)}`;
    }
    console.log(`API URL: ${apiUrl}`);
    const res = await fetch(apiUrl, { 
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (res.ok) {
      console.log(`✅ API cập nhật trạng thái thành công cho booking ID ${bookingId}`);
      
      // Cập nhật lại UI
      setBookings(prev => prev.map(b => 
        b.bookingId === bookingId || b.bookingId === parseInt(bookingId) 
          ? { ...b, status: newStatus } 
          : b
      ));
      
      // Hiện thông báo nếu cần (không hiện cho "Đã kết thúc" khi đang trong VideoCall)
      const isFromVideoCall = newStatus === 'Đã kết thúc' && showVideoCall;
      
      if (!isFromVideoCall) {
        if (newStatus === 'Đã duyệt') {
          alert('Đã xác nhận lịch hẹn!');
        } else if (newStatus === 'Không được duyệt') {
          alert('Đã từ chối lịch hẹn!');
        } else if (newStatus === 'Đã kết thúc') {
          alert('Đã kết thúc lịch hẹn!');
        }
      }
      
      return true;
    } else {
      const errorText = await res.text();
      console.error(`❌ Lỗi từ API (HTTP ${res.status}): ${errorText}`);
      
      // Chỉ hiển thị alert nếu không phải từ VideoCall để tránh gián đoạn UX
      if (!showVideoCall) {
        alert(`Lỗi cập nhật trạng thái lịch hẹn (HTTP ${res.status}): ${newStatus}`);
      }
      return false;
    }
  } catch (error) {
    console.error(`❌ Lỗi khi cập nhật trạng thái: ${error.message}`, error);
    
    // Chỉ hiển thị alert nếu không phải từ VideoCall để tránh gián đoạn UX
    if (!showVideoCall) {
      alert(`Lỗi kết nối máy chủ: ${error.message}`);
    }
    return false;
  }
};

// Wrapper functions for specific status updates
export const confirmBooking = async (bookingId, setBookings, showVideoCall) => {
  await updateBookingStatus(bookingId, 'Đã duyệt', null, setBookings, showVideoCall);
};

export const rejectBooking = async (bookingId, setBookings, showVideoCall) => {
  await updateBookingStatus(bookingId, 'Không được duyệt', null, setBookings, showVideoCall);
};

export const endBooking = async (bookingId, setBookings, showVideoCall) => {
  await updateBookingStatus(bookingId, 'Đã kết thúc', null, setBookings, showVideoCall);
};

// Filter functions
export const getFilteredQuestions = (questions, filterStatus) => {
  // Kiểm tra nếu questions không phải là array hoặc chưa được load
  if (!Array.isArray(questions)) {
    return [];
  }
  
  return questions.filter(question => {
    if (filterStatus === 'all') return true;
    
    // Filter based on the two states: 'resolved' (Đã trả lời) and 'pending' (Chờ trả lời)
    if (filterStatus === 'pending' && (!question.status || question.status.toLowerCase() === 'pending')) {
      return true;
    }
    if (filterStatus === 'resolved' && question.status?.toLowerCase() === 'resolved') {
      return true;
    }
    
    return false;
  });
};

export const getFilteredBookings = (bookings, filterStatus) => {
  // Kiểm tra nếu bookings không phải là array hoặc chưa được load
  if (!Array.isArray(bookings)) {
    return [];
  }
  
  const filtered = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);
  
  // Tạm thời bỏ filter PAID để test - hiển thị tất cả bookings
  return filtered;
  // Lọc booking chỉ hiển thị các lịch đã PAID
  // return filtered.filter(b => b.payment?.status === 'PAID');
};

// Data constants
export const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ trả lời' },
  { value: 'resolved', label: 'Đã trả lời' }
];

// Video call handler
export const handleVideoCallLeave = async (endCall, videoChannel, setBookings, updateBookingStatus, setShowVideoCall, setVideoChannel) => {
  // Xử lý cập nhật trạng thái TRƯỚC khi ẩn UI cuộc gọi
  console.log(`🔄 [ConsultantInterface] Cuộc gọi kết thúc với endCall=${endCall}`);
  console.log(`🔄 [ConsultantInterface] Channel: ${videoChannel}`);
  
  if (endCall && videoChannel) {
    try {
      // Extract bookingId from the channelName
      const bookingId = videoChannel.includes('_') 
        ? videoChannel.split('_')[1] 
        : videoChannel;
      
      console.log(`📝 [ConsultantInterface] Lịch hẹn ID: ${bookingId} - Đang cập nhật trạng thái thành "Đã kết thúc"`);
      
      // Update booking status to "Đã kết thúc"
      if (bookingId) {
        setBookings(prev => prev.map(b => 
          b.bookingId === parseInt(bookingId) ? { ...b, status: 'Đã kết thúc' } : b
        ));
        // Gửi endTime thực tế lên backend
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const endTimeStr = `${hh}:${mm}`;
        await updateBookingStatus(bookingId, 'Đã kết thúc', endTimeStr, setBookings, true);
      }
    } catch (err) {
      console.error('❌ [ConsultantInterface] Lỗi khi cập nhật trạng thái:', err);
      alert('Đã có lỗi khi cập nhật trạng thái. Vui lòng kiểm tra và thử lại.');
    }
  }
  
  // Sau khi xử lý xong, mới ẩn UI cuộc gọi
  setShowVideoCall(false);
  setVideoChannel('');
};

// Video call functions
export const startVideoCall = (bookingId) => {
  // Implementation for starting video call
  console.log('Starting video call for booking:', bookingId);
  // Add your video call logic here
};
