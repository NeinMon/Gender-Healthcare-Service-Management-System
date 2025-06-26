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

    // Map status values to match the backend values
    switch(status?.toLowerCase()) {
      case 'resolved':
        return <span key={`status-${id || 'resolved'}`} style={{...badgeStyle, backgroundColor: '#d0f7ea', color: '#0f766e'}}>Đã trả lời</span>;
      case 'pending':
        return <span key={`status-${id || 'pending'}`} style={{...badgeStyle, backgroundColor: '#fef9c3', color: '#ca8a04'}}>Chờ trả lời</span>;
      case 'closed':
        return <span key={`status-${id || 'closed'}`} style={{...badgeStyle, backgroundColor: '#fee2e2', color: '#b91c1c'}}>Đã đóng</span>;
      default:
        return <span key={`status-${id || 'unknown'}`} style={{...badgeStyle, backgroundColor: '#e0f2fe', color: '#0369a1'}}>Khác</span>;
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
        
        // Pre-fill the answer text if we're in edit mode
        if (data && data.content) {
          setAnswerText(data.content);
        }
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
      
      // If question is already resolved, fetch the existing answer
      if (question.status?.toLowerCase() === 'resolved') {
        // Sử dụng ID chính xác để truy vấn câu trả lời
        fetchExistingAnswer(questionId);
      } else {
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
  const filteredQuestions = questions.filter(question => {
    if (filterStatus === 'all') return true;
    
    // Map frontend filter values to backend status values
    if (filterStatus === 'pending' && (!question.status || question.status.toLowerCase() === 'pending')) {
      return true;
    }
    if (filterStatus === 'answered' && question.status?.toLowerCase() === 'resolved') {
      return true;
    }
    if (filterStatus === 'closed' && question.status?.toLowerCase() === 'closed') {
      return true;
    }
    
    return false;
  });  // Hàm submitAnswer không cần nhận tham số vì đã có selectedQuestion
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
  const confirmBooking = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/bookings/${bookingId}/status`, { method: 'PUT' });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: 'Đã xác nhận' } : b));
        alert('Đã xác nhận lịch hẹn!');
      } else {
        alert('Lỗi xác nhận lịch hẹn.');
      }
    } catch {
      alert('Lỗi kết nối máy chủ.');
    }
  };

  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100vw" }}>      {/* Header */}
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 20,
        paddingTop: 10,
        position: "relative",
        width: "100%",
        minHeight: 160
      }}>        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          paddingTop: 25,
          paddingLeft: 20,
          paddingRight: 20
        }}>
          <div style={{ flex: 1 }}></div> {/* Spacer on the left */}
          <div style={{ display: "flex", justifyContent: "center", flex: 1 }}>
            <img
              src="/Logo.png"
              alt="Logo"
              style={{ height: 120, width: 120, objectFit: "contain" }}
            />
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <UserAvatar userName={consultant?.fullName || 'Tư vấn viên'} />
          </div>
        </div>
        
      </header>

      {/* Main Content with Sidebar */}
      <div style={{ 
        display: "flex", 
        flex: 1, 
        width: "100%", 
        backgroundColor: "#fff", 
        boxShadow: "0 5px 20px rgba(0,0,0,0.05)", 
        marginTop: "-20px" 
      }}>
        {/* Sidebar */}
        <div style={{
          width: "220px",
          backgroundColor: "#f8fafc",
          borderRight: "1px solid #e2e8f0",
          padding: "30px 15px",
          display: "flex",
          flexDirection: "column",
          gap: "15px"
        }}>
          <button 
            onClick={() => setActiveSection('questions')}
            style={{
              padding: "15px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeSection === 'questions' ? "#0891b2" : "#e0f2fe",
              color: activeSection === 'questions' ? "#fff" : "#0891b2",
              fontWeight: "600",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.2s ease"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            Câu hỏi
          </button>
          <button 
            onClick={() => setActiveSection('online')}
            style={{
              padding: "15px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeSection === 'online' ? "#0891b2" : "#e0f2fe",
              color: activeSection === 'online' ? "#fff" : "#0891b2",
              fontWeight: "600",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.2s ease"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            Tư vấn online
          </button>
        </div>

        {/* Main Content Area */}
        <main style={{
          padding: "40px",
          flex: 1,
          backgroundColor: "#fff",
          boxSizing: "border-box",
          overflow: "auto"
        }}>
          {activeSection === 'questions' ? (
            <>
              <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ color: "#2c3e50", margin: 0 }}>Danh sách câu hỏi</h2>
                <div>
                  <select 
                    onChange={handleFilterChange}
                    value={filterStatus}
                    style={{
                      padding: "10px 15px",
                      borderRadius: "8px",
                      border: "1px solid #e1e1e1",
                      backgroundColor: "#f9f9f9",
                      fontSize: "16px"
                    }}
                  >
                    <option value="all">Tất cả câu hỏi</option>
                    <option value="pending">Chờ trả lời</option>
                    <option value="answered">Đã trả lời</option>

                  </select>
                </div>
              </div>
              
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", width: "100%" }}>
                  <div style={{ 
                    fontSize: "18px", 
                    color: "#0891b2",
                    marginBottom: "20px"
                  }}>
                    Đang tải danh sách câu hỏi...
                  </div>
                </div>
              ) : error ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "40px", 
                  width: "100%",
                  backgroundColor: "#fee",
                  borderRadius: "10px",
                  border: "1px solid #fcc",
                  marginBottom: "20px"
                }}>
                  <div style={{ 
                    fontSize: "18px", 
                    color: "#c53030",
                    marginBottom: "10px"
                  }}>
                    ⚠️ {error}
                  </div>
                  <p style={{ color: "#718096" }}>
                    Vui lòng thử lại sau hoặc liên hệ với quản trị viên.
                  </p>
                </div>
              ) : (                <div style={{ width: "100%" }}>
                  {filteredQuestions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#718096" }}>
                      Không có câu hỏi nào được tìm thấy
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {filteredQuestions.map((question) => (                          <div 
                            key={question.questionID || question.id}
                            onClick={() => handleQuestionClick(question)}
                            style={{
                              backgroundColor: selectedQuestion && 
                                              (selectedQuestion.questionID || selectedQuestion.id) === 
                                              (question.questionID || question.id) ? "#f0f9ff" : "white",
                              borderRadius: "12px",
                              border: "1px solid #e1e1e1",
                              padding: "20px",
                              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                              cursor: "pointer",
                              transition: "all 0.3s ease"
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
                        ))}
                      </div>

                      {/* Hiển thị phần trả lời ở cuối trang */}
                      {selectedQuestion && (
                        <div 
                          style={{
                            marginTop: "40px",
                            padding: "30px",
                            backgroundColor: "#f8fafc",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
                          }}
                        >                          <div style={{ marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "15px" }}>
                              <div>
                                <h4 style={{ color: "#0891b2", margin: "0 0 5px 0", fontSize: "20px" }}>
                                  {existingAnswer ? "Câu trả lời đã gửi" : "Trả lời câu hỏi"}
                                </h4>
                                <p style={{ margin: "0", color: "#64748b" }}>
                                  Câu hỏi: <strong>{selectedQuestion.title}</strong>
                                </p>
                              </div>
                              <div>
                                {getStatusBadge(selectedQuestion.status, selectedQuestion.id)}
                              </div>
                            </div>
                            
                            {/* Hiển thị nội dung câu hỏi */}
                            <div style={{ 
                              backgroundColor: "#f0f7ff", 
                              padding: "15px", 
                              borderRadius: "8px", 
                              marginTop: "10px",
                              border: "1px solid #dbeafe"
                            }}>
                              <div style={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                marginBottom: "5px",
                                fontSize: "14px",
                                color: "#1e40af"
                              }}>
                                <span>Người hỏi: {userDetails[selectedQuestion.userID]?.fullName || 'Không rõ'}</span>
                                <span>{formatDate(selectedQuestion.createdAt)}</span>
                              </div>
                              <h5 style={{ 
                                margin: "0 0 8px 0", 
                                fontSize: "16px", 
                                fontWeight: "600",
                                color: "#1e40af"
                              }}>
                                Nội dung câu hỏi:
                              </h5>
                              <p style={{ 
                                margin: "0", 
                                lineHeight: "1.6",
                                color: "#334155",
                                whiteSpace: "pre-wrap"
                              }}>
                                {selectedQuestion.content}
                              </p>
                            </div>
                          </div>

                          {loadingAnswer ? (
                            <div style={{
                              padding: "15px", 
                              textAlign: "center",
                              color: "#0891b2"
                            }}>
                              Đang tải câu trả lời...
                            </div>
                          ) : existingAnswer && (
                            <div style={{
                              backgroundColor: "#f0f9ff", 
                              padding: "15px", 
                              borderRadius: "8px",
                              marginBottom: "15px",
                              border: "1px solid #bae6fd"
                            }}>                              <div style={{ 
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
                          )}
                            
                          <textarea
                            value={answerText}
                            onChange={handleAnswerChange}
                            placeholder="Nhập câu trả lời của bạn..."
                            disabled={submitting || selectedQuestion.status?.toLowerCase() === 'resolved' || selectedQuestion.status?.toLowerCase() === 'closed'}
                            style={{
                              width: "100%",
                              padding: "15px",
                              borderRadius: "8px",
                              border: "1px solid #e1e1e1",
                              minHeight: "120px",
                              fontSize: "16px",
                              outline: "none",
                              resize: "vertical",
                              backgroundColor: (selectedQuestion.status?.toLowerCase() === 'resolved' || selectedQuestion.status?.toLowerCase() === 'closed') ? "#f5f5f5" : "#fff"
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
                            </button>                            <button 
                              onClick={() => submitAnswer()}
                              disabled={submitting || !answerText.trim() || selectedQuestion.status?.toLowerCase() === 'resolved' || selectedQuestion.status?.toLowerCase() === 'closed'}
                              style={{
                                padding: "10px 20px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: (submitting || !answerText.trim() || selectedQuestion.status?.toLowerCase() === 'resolved' || selectedQuestion.status?.toLowerCase() === 'closed') ? "#cbd5e1" : "#0891b2",
                                cursor: (submitting || !answerText.trim() || selectedQuestion.status?.toLowerCase() === 'resolved' || selectedQuestion.status?.toLowerCase() === 'closed') ? "not-allowed" : "pointer",
                                color: "#fff",
                                fontWeight: "500"
                              }}
                            >
                              {submitting ? "Đang gửi..." : (selectedQuestion.status?.toLowerCase() === 'resolved' || selectedQuestion.status?.toLowerCase() === 'closed') ? "Đã trả lời" : "Gửi câu trả lời"}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            // Phần giao diện "Tư vấn online"
            <div>
              <h2 style={{ color: "#2c3e50", margin: "0 0 20px 0" }}>Lịch hẹn tư vấn online</h2>
              {loadingBookings ? (
                <div style={{ textAlign: 'center', color: '#0891b2', padding: 30 }}>Đang tải lịch hẹn...</div>
              ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: 30 }}>Không có lịch hẹn nào.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', marginTop: 20 }}>
                    <thead style={{ background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)' }}>
                      <tr>
                        <th style={{ padding: 12, color: '#fff', fontWeight: 700 }}>Khách hàng</th>
                        <th style={{ color: '#fff', fontWeight: 700 }}>Nội dung</th>
                        <th style={{ color: '#fff', fontWeight: 700 }}>Ngày hẹn</th>
                        <th style={{ color: '#fff', fontWeight: 700 }}>Trạng thái</th>
                        <th style={{ color: '#fff', fontWeight: 700 }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.bookingId} style={{ borderBottom: '1px solid #e0f2fe' }}>
                          <td style={{ padding: 12, fontWeight: 600, color: '#0891b2' }}>{bookingUserDetails[booking.userId]?.fullName || '...'}</td>
                          <td style={{ fontWeight: 500 }}>{booking.content}</td>
                          <td style={{ fontWeight: 500 }}>{booking.appointmentDate}</td>
                          <td style={{ fontWeight: 700, color: booking.status === 'Chờ xác nhận' ? '#ff9800' : booking.status === 'Đã xác nhận' ? '#4caf50' : booking.status === 'Đã xong' ? '#2196f3' : '#757575' }}>{booking.status}</td>
                          <td>
                            {booking.status === 'Chờ xác nhận' && (
                              <button onClick={() => confirmBooking(booking.bookingId)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0891b2', color: '#fff', fontWeight: 600, cursor: 'pointer', marginRight: 8 }}>Xác nhận</button>
                            )}
                            {booking.status === 'Đã xác nhận' && (
                              <button
                                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#22d3ee', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => {
                                  // QUAN TRỌNG: Sử dụng bookingId làm tên kênh để đảm bảo nhất quán
                                  // Đảm bảo cách tạo kênh GIỐNG CHÍNH XÁC với MyAppointments.jsx
                                  const bookingId = booking.bookingId;
                                  // Luôn sử dụng "booking_" + bookingId làm tên kênh
                                  const channelName = bookingId ? `booking_${bookingId}` : null;
                                  
                                  if (!channelName) {
                                    alert("Không thể tham gia cuộc gọi do thiếu thông tin đặt lịch!");
                                    return;
                                  }
                                  
                                  console.log(`[CONSULTANT] Bắt đầu cuộc gọi trên kênh: ${channelName}`);
                                  setVideoChannel(channelName);
                                  setShowVideoCall(true);
                                }}
                              >
                                Tham gia tư vấn
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer style={{
        padding: "25px",
        backgroundColor: "#e0f2fe",
        textAlign: "center",
        color: "#0891b2",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <p style={{ fontSize: "16px" }}>© 2025 Hệ thống Chăm sóc Sức khỏe Giới Tính</p>
        <p style={{ marginTop: "10px", fontSize: "16px" }}>Hotline: 1900-xxxx | Email: support@healthcare.com</p>
      </footer>

      {/* Video Call Component - Always render but control visibility with state */}
      {showVideoCall && (
        <VideoCall
          channelName={videoChannel}
          onLeave={() => { setShowVideoCall(false); setVideoChannel(''); }}
          userRole="host"
        />
      )}
    </div>
  );
};

export default ConsultantInterface;
