import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import VideoCall from './components/VideoCall';

const ConsultantInterface = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Đúng mapping status backend: 'Chờ bắt đầu', 'Đang diễn ra', 'Đã kết thúc'
  const [filterStatus, setFilterStatus] = useState('all');
  const [existingAnswer, setExistingAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [activeSection, setActiveSection] = useState('questions'); // Add state for active section
  const [consultant, setConsultant] = useState({ fullName: 'Tư vấn viên' }); // Thêm state cho thông tin tư vấn viên
  // Booking states for online consult
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingUserDetails, setBookingUserDetails] = useState({});
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoChannel, setVideoChannel] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    // Fetch thông tin tư vấn viên
    const fetchConsultantInfo = async () => {
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

    fetchConsultantInfo();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/questions');

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        setQuestions(data);
        
        // Fetch user details for each question
        const uniqueUserIds = [...new Set(data.map(question => question.userID))];
        const userDetailsMap = {};
        
        await Promise.all(uniqueUserIds.map(async (userId) => {
          try {
            const userResponse = await fetch(`http://localhost:8080/api/users/${userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              userDetailsMap[userId] = userData;
            } else {
              userDetailsMap[userId] = { fullName: 'Unknown User' };
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            userDetailsMap[userId] = { fullName: 'Unknown User' };
          }
        }));
        
        setUserDetails(userDetailsMap);
      } catch (err) {
        setError('Error fetching questions: ' + err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);
  const formatDate = (dateString) => {
    if (!dateString) return 'Không có ngày';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };  const getStatusBadge = (status, id) => {
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

  // Fetch the existing answer when selecting a question
  const fetchExistingAnswer = async (questionId) => {
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
  const handleQuestionClick = (question) => {
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

  const handleAnswerChange = (e) => {
    setAnswerText(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };
  // Status options with only 'Đã trả lời' and 'Chờ trả lời'
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ trả lời' },
    { value: 'resolved', label: 'Đã trả lời' }
  ];

  const filteredQuestions = questions.filter(question => {
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
  // Lọc booking theo trạng thái
  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  // Lọc booking chỉ hiển thị các lịch đã PAID
  const paidBookings = bookings.filter(b => b.paymentStatus === 'PAID');

  // Hàm submitAnswer không cần nhận tham số vì đã có selectedQuestion
  const submitAnswer = async () => {
    if (!answerText.trim()) {
      alert('Vui lòng nhập câu trả lời');
      return;
    }    if (!selectedQuestion) {
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
    }try {
      setSubmitting(true);
      // Lấy ID của consultant từ localStorage hoặc sessionStorage
      const consultantIdStr = localStorage.getItem('userId') || 
                          sessionStorage.getItem('userId') || 
                          '1073741824'; // Sử dụng ID đã được chỉ định từ yêu cầu API
      
      // Đảm bảo ID được chuyển sang số nguyên
      const consultantId = parseInt(consultantIdStr, 10);
        // Đối với questionId, sử dụng questionID (viết hoa) hoặc id (viết thường) tùy thuộc vào API
      const rawQuestionId = selectedQuestion.questionID || selectedQuestion.id;
      const questionId = parseInt(rawQuestionId, 10);
      
      // Kiểm tra và ghi log để debug
      console.log('Selected question:', selectedQuestion);
      console.log('Question ID field availability:', { 
        'id': selectedQuestion.id !== undefined ? 'exists' : 'missing',
        'questionID': selectedQuestion.questionID !== undefined ? 'exists' : 'missing'
      });
      console.log('Question ID (raw):', rawQuestionId);
      console.log('Question ID (used):', questionId);
      console.log('Consultant ID (used):', consultantId);
      
      // Chuẩn bị dữ liệu theo đúng định dạng API yêu cầu
      const answerData = {
        questionId: questionId, // Đã chuyển sang số nguyên
        consultantId: consultantId, // Đã chuyển sang số nguyên
        content: answerText.trim() // Nội dung câu trả lời (đã loại bỏ khoảng trắng thừa)
      };      console.log('Gửi câu trả lời với dữ liệu:', answerData);
      
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
      }      // Kiểm tra phản hồi dựa trên status code
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
      setQuestions(questions.map(q => {
        // Kiểm tra cả hai trường id có thể có
        const qId = q.questionID || q.id;
        return qId === parseInt(updateId, 10) ? { ...q, status: 'resolved' } : q;
      }));

      // Đóng phần trả lời
      setSelectedQuestion(null);
      setAnswerText('');
      
      alert('Câu trả lời đã được gửi thành công!');    } catch (err) {
      console.error('Error submitting answer:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        selectedQuestionId: selectedQuestion?.id,
        answerTextLength: answerText.length,
        consultantId: consultantId
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

  // Fetch bookings for consultant when switching to 'online' tab
  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      const consultantId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
      if (!consultantId) {
        setBookings([]);
        setLoadingBookings(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:8080/api/bookings/consultant/${consultantId}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
          // Fetch user info for each booking
          const uniqueUserIds = [...new Set(data.map(b => b.userId))];
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
          setBookingUserDetails(userMap);
        } else {
          setBookings([]);
        }
      } catch {
        setBookings([]);
      }
      setLoadingBookings(false);
    };
    if (activeSection === 'online') fetchBookings();
  }, [activeSection]);

  // Confirm booking status
  const updateBookingStatus = async (bookingId, newStatus, endTime = null) => {
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
  const confirmBooking = async (bookingId) => {
    await updateBookingStatus(bookingId, 'Đã duyệt');
  };
  
  const rejectBooking = async (bookingId) => {
    await updateBookingStatus(bookingId, 'Không được duyệt');
  };
  
  const endBooking = async (bookingId) => {
    await updateBookingStatus(bookingId, 'Đã kết thúc');
  };

  return (
    <div style={{ 
      backgroundColor: "#f0f9ff", 
      minHeight: "100vh", 
      width: "100%",
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: "flex",
      flexDirection: "column"
    }}>
      {showVideoCall && (
        <VideoCall 
          channelName={videoChannel} 
          onLeave={async (endCall = false) => { 
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
                  await updateBookingStatus(bookingId, 'Đã kết thúc', endTimeStr);
                }
              } catch (err) {
                console.error('❌ [ConsultantInterface] Lỗi khi cập nhật trạng thái:', err);
                alert('Đã có lỗi khi cập nhật trạng thái. Vui lòng kiểm tra và thử lại.');
              }
            }
            
            // Sau khi xử lý xong, mới ẩn UI cuộc gọi
            setShowVideoCall(false);
            setVideoChannel(''); 
          }} 
          userRole="host"
        />
      )}      
      {/* Header */}
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 0,
        position: "relative"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          paddingTop: 12,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 12,
        }}>
          <img
            src="/Logo.png"
            alt="Logo"
            style={{ height: 70, width: 70, objectFit: "contain" }}
          />
          
          <h1
            style={{
              color: "#fff",
              margin: 0,
              padding: 0,
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: 1,
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              width: "auto",
              fontSize: "3rem"
            }}
          >
            Giao diện tư vấn viên
          </h1>
          
          <div style={{ 
            width: 36, 
            height: 36, 
            borderRadius: "50%", 
            backgroundColor: "#e0f2fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0891b2",
            fontWeight: "bold",
            fontSize: "16px",
            border: "2px solid rgba(255,255,255,0.5)"
          }}>
            {consultant?.fullName ? consultant.fullName.charAt(0) : "T"}
          </div>
        </div>
      </header>

      <main style={{
        padding: "32px 24px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f0f9ff"
      }}>
        <div style={{
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: "#fff",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center", 
              gap: "12px"
            }}>
              <button 
                onClick={() => setActiveSection('questions')}
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: activeSection === 'questions' ? "#0891b2" : "#e0f2fe",
                  color: activeSection === 'questions' ? "#fff" : "#0891b2",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease"
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Câu hỏi
              </button>
              <button 
                onClick={() => setActiveSection('online')}
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: activeSection === 'online' ? "#0891b2" : "#e0f2fe",
                  color: activeSection === 'online' ? "#fff" : "#0891b2",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease"
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Tư vấn online
              </button>
            </div>
          </div>

          {activeSection === 'questions' ? (
            <>
              <div style={{ 
                marginBottom: "24px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                backgroundColor: "#fff",
                padding: "16px 24px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center", 
                  gap: "12px"
                }}>
                  <label style={{ 
                    fontWeight: 600, 
                    color: '#0891b2' 
                  }}>Lọc theo trạng thái: </label>
                  <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)} 
                    style={{ 
                      padding: "10px 16px", 
                      borderRadius: "8px", 
                      border: '1px solid #22d3ee', 
                      outline: 'none', 
                      fontWeight: 500, 
                      color: '#0891b2', 
                      background: '#fff',
                      cursor: "pointer" 
                    }}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <h2 style={{ 
                  color: "#0891b2", 
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700
                }}>Danh sách câu hỏi</h2>
              </div>
              
              {loading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: "60px 0",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                  <div style={{ 
                    display: "inline-block", 
                    border: "3px solid #22d3ee",
                    borderTop: "3px solid transparent",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    animation: "spin 1s linear infinite",
                    marginBottom: "15px"
                  }}></div>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                  <p style={{ color: '#0891b2', fontWeight: 600, fontSize: 16, margin: 0 }}>Đang tải danh sách câu hỏi...</p>
                </div>
              ) : error ? (
                <div style={{ 
                  color: '#f44336', 
                  textAlign: 'center', 
                  padding: "40px 20px",
                  fontWeight: 600,
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>⚠️</div>
                  <div>{error}</div>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: "60px 20px",
                  color: '#0891b2', 
                  fontWeight: 600,
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                  <div style={{ fontSize: "40px", marginBottom: "15px" }}>❓</div>
                  <div>Không có câu hỏi nào phù hợp với bộ lọc.</div>
                </div>
              ) : (
                <div style={{ 
                  width: '100%', 
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                  <div style={{ padding: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {filteredQuestions.map((question) => (
                        <div 
                          key={question.questionID || question.id}
                          style={{
                            backgroundColor: selectedQuestion && 
                                          (selectedQuestion.questionID || selectedQuestion.id) === 
                                          (question.questionID || question.id) ? "#f0f9ff" : "white",
                            borderRadius: "12px",
                            border: "1px solid #e1e1e1",
                            padding: "20px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                            transition: "all 0.3s ease",
                            marginBottom: "15px"
                          }}
                        >
                          <div 
                            onClick={() => handleQuestionClick(question)}
                            style={{
                              cursor: "pointer"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "50%",
                                  backgroundColor: "#0891b2",
                                  color: "#fff",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  fontWeight: "bold"
                                }}>
                                  {userDetails[question.userID]?.fullName?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <div style={{ fontWeight: "600", color: "#2c3e50" }}>
                                    {userDetails[question.userID]?.fullName || 'Đang tải...'}
                                  </div>
                                  <div style={{ fontSize: "14px", color: "#64748b" }}>
                                    {formatDate(question.createdAt)}
                                  </div>
                                </div>
                              </div>
                              {getStatusBadge(question.status, question.id)}
                            </div>
                            <div>
                              <h3 style={{ color: "#1e293b", fontSize: "18px", marginBottom: "10px" }}>
                                {question.title}
                              </h3>
                              <p style={{ 
                                color: "#475569", 
                                marginTop: "10px", 
                                lineHeight: "1.6",
                                maxHeight: selectedQuestion && 
                                          (selectedQuestion.questionID || selectedQuestion.id) === 
                                          (question.questionID || question.id) ? "none" : "80px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: selectedQuestion && 
                                        (selectedQuestion.questionID || selectedQuestion.id) === 
                                        (question.questionID || question.id) ? "block" : "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical"
                              }}>
                                {question.content}
                              </p>
                            </div>
                          </div>

                          {/* Hiển thị phần trả lời ngay dưới câu hỏi */}
                          {selectedQuestion && 
                           (selectedQuestion.questionID || selectedQuestion.id) === 
                           (question.questionID || question.id) && (
                            <div style={{
                              marginTop: "20px",
                              borderTop: "1px dashed #cbd5e1",
                              paddingTop: "20px"
                            }}>
                              {loadingAnswer ? (
                                <div style={{
                                  padding: "15px", 
                                  textAlign: "center",
                                  color: "#0891b2"
                                }}>
                                  <div style={{ 
                                    display: "inline-block", 
                                    border: "3px solid #22d3ee",
                                    borderTop: "3px solid transparent",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    animation: "spin 1s linear infinite",
                                    marginBottom: "10px"
                                  }}></div>
                                  <p style={{ margin: 0 }}>Đang tải câu trả lời...</p>
                                </div>
                              ) : existingAnswer ? (
                                <div style={{
                                  backgroundColor: "#f0f9ff", 
                                  padding: "15px", 
                                  borderRadius: "8px",
                                  marginBottom: "15px",
                                  border: "1px solid #bae6fd"
                                }}>
                                  <div style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between", 
                                    marginBottom: "10px",
                                    color: "#0c4a6e",
                                    fontSize: "14px"
                                  }}>
                                    <span>Người trả lời: {consultant?.fullName || 'Tư vấn viên'}</span>
                                    <span>{formatDate(existingAnswer.createdAt)}</span>
                                  </div>
                                  <p style={{ margin: 0, lineHeight: 1.6 }}>{existingAnswer.content}</p>
                                </div>
                              ) : null}
                                
                              {/* Chỉ hiển thị phần nhập và nút khi câu hỏi chưa được trả lời/đóng */}
                              {(!question.status || question.status?.toLowerCase() === 'pending') && (
                                <>
                                  <textarea
                                    value={answerText}
                                    onChange={handleAnswerChange}
                                    placeholder="Nhập câu trả lời của bạn..."
                                    disabled={submitting}
                                    style={{
                                      width: "100%",
                                      padding: "15px",
                                      borderRadius: "8px",
                                      border: "1px solid #e1e1e1",
                                      minHeight: "120px",
                                      fontSize: "16px",
                                      outline: "none",
                                      resize: "vertical",
                                      backgroundColor: "#fff"
                                    }}
                                  />
                                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "15px", gap: "10px" }}>
                                    <button 
                                      onClick={() => setSelectedQuestion(null)}
                                      style={{
                                        padding: "10px 20px",
                                        borderRadius: "8px",
                                        border: "1px solid #e1e1e1",
                                        backgroundColor: "#fff",
                                        cursor: "pointer",
                                        color: "#64748b",
                                        fontWeight: "500"
                                      }}
                                    >
                                      Hủy
                                    </button>
                                    <button 
                                      onClick={() => submitAnswer()}
                                      disabled={submitting || !answerText.trim()}
                                      style={{
                                        padding: "10px 20px",
                                        borderRadius: "8px",
                                        border: "none",
                                        backgroundColor: (submitting || !answerText.trim()) ? "#cbd5e1" : "#0891b2",
                                        cursor: (submitting || !answerText.trim()) ? "not-allowed" : "pointer",
                                        color: "#fff",
                                        fontWeight: "500"
                                      }}
                                    >
                                      {submitting ? "Đang gửi..." : "Gửi câu trả lời"}
                                    </button>
                                  </div>
                                </>
                              )}
                              {/* Nút đóng cho câu hỏi đã trả lời */}
                              {(question.status?.toLowerCase() === 'resolved' || question.status?.toLowerCase() === 'closed') && (
                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "15px" }}>
                                  <button 
                                    onClick={() => setSelectedQuestion(null)}
                                    style={{
                                      padding: "10px 20px",
                                      borderRadius: "8px",
                                      border: "1px solid #e1e1e1",
                                      backgroundColor: "#fff",
                                      cursor: "pointer",
                                      color: "#64748b",
                                      fontWeight: "500"
                                    }}
                                  >
                                    Đóng
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: "#fff",
                padding: "16px 24px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                marginBottom: "24px"
              }}>
                <h2 style={{ 
                  color: "#0891b2", 
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700
                }}>Lịch hẹn tư vấn online</h2>
              </div>
              {loadingBookings ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: "60px 0",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                  <div style={{ 
                    display: "inline-block", 
                    border: "3px solid #22d3ee",
                    borderTop: "3px solid transparent",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    animation: "spin 1s linear infinite",
                    marginBottom: "15px"
                  }}></div>
                  <p style={{ color: '#0891b2', fontWeight: 600, fontSize: 16, margin: 0 }}>Đang tải danh sách lịch hẹn...</p>
                </div>
              ) : paidBookings.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: "60px 20px",
                  color: '#0891b2', 
                  fontWeight: 600,
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                  <div style={{ fontSize: "40px", marginBottom: "15px" }}>📅</div>
                  <div>Không có lịch hẹn nào đã thanh toán.</div>
                </div>
              ) : (
                <div style={{ 
                  width: '100%', 
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                  <div style={{ overflowX: 'auto', width: "100%" }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ 
                          background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                          textAlign: "center"
                        }}>
                          <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Khách hàng</th>
                          <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Nội dung</th>
                          <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Ngày đặt lịch</th>
                          <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Giờ bắt đầu</th>
                          <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Trạng thái</th>
                          <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paidBookings.map((booking, idx) => (
                          <tr 
                            key={booking.bookingId || idx} 
                            style={{ 
                              borderBottom: '1px solid #e0f2fe', 
                              transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f9ff"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 10,
                                justifyContent: "center" 
                              }}>
                                <div style={{ 
                                  width: "36px", 
                                  height: "36px", 
                                  borderRadius: "50%", 
                                  backgroundColor: "#0891b2", 
                                  color: "white", 
                                  display: "flex", 
                                  alignItems: "center", 
                                  justifyContent: "center", 
                                  fontWeight: "bold",
                                  fontSize: "16px"
                                }}>
                                  {(bookingUserDetails[booking.userId]?.fullName || '?').charAt(0).toUpperCase()
                                  }
                                </div>
                                <span style={{ 
                                  fontWeight: 600, 
                                  color: '#0891b2' 
                                }}>
                                  {bookingUserDetails[booking.userId]?.fullName || 'Đang tải...'}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px', fontWeight: 500, maxWidth: "300px", textAlign: "center" }}>
                              <div style={{ 
                                overflow: "hidden", 
                                textOverflow: "ellipsis", 
                                whiteSpace: "nowrap", 
                                maxWidth: "100%"
                              }}>
                                {booking.content || 'Không có nội dung'}
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px', fontWeight: 500, textAlign: "center" }}>
                              {booking.appointmentDate || 'N/A'}
                            </td>
                            <td style={{ padding: '16px 20px', fontWeight: 500, textAlign: "center" }}>
                              {booking.startTime || 'N/A'}
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>
                              <div style={{ display: "flex", justifyContent: "center" }}>
                                {(() => {
                                  // Chuẩn hóa status từ backend
                                  let status = booking.status;
                                  let badgeColor = '#e0e0e0';
                                  let textColor = '#64748b';
                                  let label = status;
                                  if (status === 'Chờ bắt đầu') {
                                    badgeColor = '#fde68a'; // vàng nhạt
                                    textColor = '#b45309';
                                    label = 'Chờ bắt đầu';
                                  } else if (status === 'Đang diễn ra') {
                                    badgeColor = '#22d3ee'; // xanh cyan
                                    textColor = '#fff';
                                    label = 'Đang diễn ra';
                                  } else if (status === 'Đã kết thúc') {
                                    badgeColor = '#cbd5e1'; // xám nhạt
                                    textColor = '#64748b';
                                    label = 'Đã kết thúc';
                                  }
                                  return (
                                    <span style={{
                                      display: "inline-block",
                                      padding: "6px 12px",
                                      borderRadius: "20px",
                                      fontWeight: 600,
                                      fontSize: "13px",
                                      color: textColor,
                                      backgroundColor: badgeColor
                                    }}>{label}</span>
                                  );
                                })()}
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>
                              {booking.status === 'Đang diễn ra' && (
                                <button
                                  style={{
                                    background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: "8px",
                                    padding: '10px 16px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: "14px",
                                    transition: "all 0.2s",
                                    boxShadow: "0 2px 6px rgba(34,211,238,0.3)"
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(34,211,238,0.4)";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(34,211,238,0.3)";
                                  }}
                                  onClick={() => {
                                    const channelId = booking.bookingId?.toString();
                                    const channelName = `booking_${channelId}`;
                                    setVideoChannel(channelName);
                                    setShowVideoCall(true);
                                  }}
                                >
                                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ fontSize: "16px" }}>🎥</span> Tham gia tư vấn
                                  </span>
                                </button>
                              )}
                              {booking.status === 'Chờ bắt đầu' && (
                                <span style={{ color: "#b45309", fontSize: "14px", fontWeight: "500" }}>
                                  Chưa đến giờ tư vấn
                                </span>
                              )}
                              {booking.status === 'Đã kết thúc' && (
                                <button
                                  style={{
                                    background: '#e0f2fe',
                                    color: '#0891b2',
                                    border: '1px solid #22d3ee',
                                    borderRadius: "8px",
                                    padding: '8px 14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: "14px",
                                    marginLeft: 4,
                                    transition: "all 0.2s"
                                  }}
                                  onClick={() => {
                                    setDetailData({
                                      user: bookingUserDetails[booking.userId]?.fullName || 'N/A',
                                      content: booking.content || 'Không có',
                                      date: booking.appointmentDate || 'N/A',
                                      startTime: booking.startTime || 'N/A',
                                      endTime: booking.endTime || 'N/A',
                                      status: booking.status
                                    });
                                    setShowDetailModal(true);
                                  }}
                                >
                                  Xem chi tiết cuộc gọi
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <footer style={{ 
        backgroundColor: "#e0f2fe",
        color: "#0891b2", 
        padding: "20px",
        textAlign: "center",
        borderTop: "1px solid rgba(8,145,178,0.1)"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          <div style={{ fontWeight: 600, fontSize: "16px" }}>
            &copy; {new Date().getFullYear()} Sức khỏe giới tính
          </div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            Một sản phẩm của cơ sở y tế Việt Nam
          </div>
        </div>
      </footer>

      {/* Modal chi tiết cuộc gọi */}
      {showDetailModal && detailData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 32,
            minWidth: 340,
            maxWidth: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            position: 'relative'
          }}>
            <h2 style={{ color: '#0891b2', marginBottom: 18 }}>Chi tiết cuộc gọi</h2>
            <div style={{ marginBottom: 10 }}><b>Khách hàng:</b> {detailData.user}</div>
            <div style={{ marginBottom: 10 }}>
              <div><b>Nội dung</b></div> 
              <div style={{ 
                wordWrap: 'break-word', 
                wordBreak: 'break-word',
                maxWidth: '400px',
                marginLeft: '8px',
                marginTop: '4px',
                lineHeight: '1.5'
              }}>
                {detailData.content}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}><b>Ngày:</b> {detailData.date}</div>
            <div style={{ marginBottom: 10 }}><b>Bắt đầu:</b> {detailData.startTime}</div>
            <div style={{ marginBottom: 10 }}><b>Kết thúc:</b> {detailData.endTime}</div>
            <div style={{ marginBottom: 18 }}><b>Trạng thái:</b> {detailData.status}</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <button
                style={{
                  background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 32,
                  padding: '14px 48px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 18,
                  boxShadow: '0 4px 24px rgba(34,211,238,0.18)',
                  letterSpacing: 1,
                  transition: 'all 0.2s',
                  outline: 'none',
                  margin: 0
                }}
                onClick={() => setShowDetailModal(false)}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)';
                  e.currentTarget.style.transform = 'scale(1.06)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,211,238,0.28)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(34,211,238,0.18)';
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantInterface;
