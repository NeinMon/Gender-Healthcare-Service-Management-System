import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import VideoCall from './components/VideoCall';
import {
  formatDate,
  getStatusBadge,
  fetchConsultantInfo,
  fetchQuestions,
  fetchExistingAnswer,
  fetchBookings,
  handleQuestionClick,
  handleAnswerChange,
  handleFilterChange,
  submitAnswer,
  updateBookingStatus,
  confirmBooking,
  rejectBooking,
  endBooking,
  getFilteredQuestions,
  getFilteredBookings,
  statusOptions,
  handleVideoCallLeave,
  startVideoCall
} from './utils/consultantHelpers.jsx';

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
  const [activeSection, setActiveSection] = useState('questions'); // Add state for active section: 'questions', 'online', 'leave'
  const [consultant, setConsultant] = useState({ fullName: 'Tư vấn viên' }); // Thêm state cho thông tin tư vấn viên
  // Booking states for online consult
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingUserDetails, setBookingUserDetails] = useState({});
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoChannel, setVideoChannel] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  
  // Leave request states
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaveRequests, setLoadingLeaveRequests] = useState(false);
  const [errorLeaveRequests, setErrorLeaveRequests] = useState('');
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const [showEditLeaveModal, setShowEditLeaveModal] = useState(false);
  const [editingLeaveRequest, setEditingLeaveRequest] = useState(null);
  const [leaveFormData, setLeaveFormData] = useState({
    leaveDate: '',
    shift: 'MORNING',
    note: ''
  });

  useEffect(() => {
    // Fetch thông tin tư vấn viên sử dụng helper
    fetchConsultantInfo(setConsultant);
  }, []);

  useEffect(() => {
    // Fetch questions sử dụng helper
    fetchQuestions(setQuestions, setLoading, setError);
  }, []);
  
  // Filter data sử dụng helper functions
  const filteredQuestions = getFilteredQuestions(questions, filterStatus);
  const paidFilteredBookings = getFilteredBookings(bookings, filterStatus);

  // Fetch bookings sử dụng helper khi chuyển tab
  useEffect(() => {
    if (activeSection === 'online') {
      fetchBookings(setLoadingBookings, setBookings, setBookingUserDetails);
    } else if (activeSection === 'leave') {
      fetchLeaveRequests();
    }
  }, [activeSection]);

  // Leave request functions
  const fetchLeaveRequests = async () => {
    setLoadingLeaveRequests(true);
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser') || '{}');
      const consultantId = loggedInUser.userID || loggedInUser.id;
      
      if (!consultantId) {
        throw new Error('Không tìm thấy thông tin tư vấn viên');
      }

      const response = await fetch(`http://localhost:8080/api/leave-requests/consultant/${consultantId}`);
      if (response.ok) {
        const data = await response.json();
        // Sort by created date descending
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLeaveRequests(sortedData);
      } else {
        throw new Error('Không thể tải danh sách đơn xin nghỉ');
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      alert('Lỗi khi tải danh sách đơn xin nghỉ: ' + error.message);
    } finally {
      setLoadingLeaveRequests(false);
    }
  };

  const submitLeaveRequest = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser') || '{}');
      const consultantId = loggedInUser.userID || loggedInUser.id;
      
      if (!consultantId) {
        alert('Không tìm thấy thông tin tư vấn viên');
        return;
      }

      if (!leaveFormData.leaveDate || !leaveFormData.shift) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }

      // Check if date is in the past
      const today = new Date().toISOString().split('T')[0];
      if (leaveFormData.leaveDate < today) {
        alert('Không thể xin nghỉ trong quá khứ');
        return;
      }

      const requestData = {
        consultantId: parseInt(consultantId),
        leaveDate: leaveFormData.leaveDate,
        shift: leaveFormData.shift,
        note: leaveFormData.note.trim()
      };

      const response = await fetch('http://localhost:8080/api/leave-requests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        alert('Tạo đơn xin nghỉ thành công!');
        setShowAddLeaveModal(false);
        resetLeaveForm();
        fetchLeaveRequests();
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Lỗi khi tạo đơn xin nghỉ: ' + error.message);
    }
  };

  const updateLeaveRequest = async () => {
    try {
      if (!editingLeaveRequest) return;

      if (!leaveFormData.leaveDate || !leaveFormData.shift) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }

      // Check if date is in the past
      const today = new Date().toISOString().split('T')[0];
      if (leaveFormData.leaveDate < today) {
        alert('Không thể xin nghỉ trong quá khứ');
        return;
      }

      const requestData = {
        consultantId: editingLeaveRequest.consultantId,
        leaveDate: leaveFormData.leaveDate,
        shift: leaveFormData.shift,
        note: leaveFormData.note.trim()
      };

      const response = await fetch(`http://localhost:8080/api/leave-requests/${editingLeaveRequest.leaveRequestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        alert('Cập nhật đơn xin nghỉ thành công!');
        setShowEditLeaveModal(false);
        setEditingLeaveRequest(null);
        resetLeaveForm();
        fetchLeaveRequests();
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
      alert('Lỗi khi cập nhật đơn xin nghỉ: ' + error.message);
    }
  };

  const deleteLeaveRequest = async (requestId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn xin nghỉ này?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/leave-requests/${requestId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Xóa đơn xin nghỉ thành công!');
        fetchLeaveRequests();
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      console.error('Error deleting leave request:', error);
      alert('Lỗi khi xóa đơn xin nghỉ: ' + error.message);
    }
  };

  const resetLeaveForm = () => {
    setLeaveFormData({
      leaveDate: '',
      shift: 'MORNING',
      note: ''
    });
  };

  const openEditLeaveModal = (request) => {
    setEditingLeaveRequest(request);
    setLeaveFormData({
      leaveDate: request.leaveDate,
      shift: request.shift,
      note: request.note || ''
    });
    setShowEditLeaveModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return { bg: '#fef3c7', text: '#92400e' };
      case 'APPROVED': return { bg: '#d1fae5', text: '#065f46' };
      case 'REJECTED': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ duyệt';
      case 'APPROVED': return 'Đã duyệt';
      case 'REJECTED': return 'Từ chối';
      default: return status;
    }
  };

  const getShiftText = (shift) => {
    switch (shift) {
      case 'MORNING': return 'Ca sáng (08:00 - 12:00)';
      case 'AFTERNOON': return 'Ca chiều (13:30 - 17:30)';
      case 'FULL_DAY': return 'Cả ngày (08:00 - 17:30)';
      default: return shift;
    }
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
            await handleVideoCallLeave(endCall, videoChannel, setBookings, updateBookingStatus, setShowVideoCall, setVideoChannel);
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
                onClick={() => {
                  setActiveSection('questions');
                  setFilterStatus('all'); // Reset filter khi chuyển section
                }}
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
                onClick={() => {
                  setActiveSection('online');
                  setFilterStatus('all'); // Reset filter khi chuyển section
                }}
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
              <button 
                onClick={() => {
                  setActiveSection('leave');
                  setFilterStatus('all'); // Reset filter khi chuyển section
                }}
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: activeSection === 'leave' ? "#0891b2" : "#e0f2fe",
                  color: activeSection === 'leave' ? "#fff" : "#0891b2",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease"
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"></path>
                  <line x1="8" y1="6" x2="8" y2="2"></line>
                  <line x1="16" y1="6" x2="16" y2="2"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Đơn xin nghỉ
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
                    onChange={e => handleFilterChange(e, setFilterStatus)} 
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
                            onClick={() => handleQuestionClick(question, setSelectedQuestion, setAnswerText, setExistingAnswer, setLoadingAnswer, () => fetchExistingAnswer(question.id, setExistingAnswer, setLoadingAnswer))}
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
                                      onClick={() => submitAnswer(selectedQuestion, answerText, setSubmitting, setQuestions, setSelectedQuestion, setAnswerText)}
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
          ) : activeSection === 'online' ? (
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
                    onChange={e => handleFilterChange(e, setFilterStatus)} 
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
                    <option value="all">Tất cả</option>
                    <option value="Chờ bắt đầu">Chờ bắt đầu</option>
                    <option value="Đang diễn ra">Đang diễn ra</option>
                    <option value="Đã kết thúc">Đã kết thúc</option>
                  </select>
                </div>
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
              ) : paidFilteredBookings.length === 0 ? (
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
                  <div>
                    {filterStatus === 'all' 
                      ? 'Không có lịch hẹn nào đã thanh toán.' 
                      : `Không có lịch hẹn nào ở trạng thái "${filterStatus}".`
                    }
                  </div>
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
                        {paidFilteredBookings.map((booking, idx) => (
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
          ) : activeSection === 'online' ? (
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
                    onChange={e => handleFilterChange(e, setFilterStatus)} 
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
                    <option value="all">Tất cả</option>
                    <option value="Chờ bắt đầu">Chờ bắt đầu</option>
                    <option value="Đang diễn ra">Đang diễn ra</option>
                    <option value="Đã kết thúc">Đã kết thúc</option>
                  </select>
                </div>
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
              ) : paidFilteredBookings.length === 0 ? (
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
                  <div>
                    {filterStatus === 'all' 
                      ? 'Không có lịch hẹn nào đã thanh toán.' 
                      : `Không có lịch hẹn nào ở trạng thái "${filterStatus}".`
                    }
                  </div>
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
                        {paidFilteredBookings.map((booking, idx) => (
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
          ) : activeSection === 'leave' ? (
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
                }}>Quản lý đơn xin nghỉ</h2>
                <button
                  onClick={() => setShowAddLeaveModal(true)}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#22d3ee",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease"
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Tạo đơn xin nghỉ
                </button>
              </div>

              {loadingLeaveRequests ? (
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
                  <p style={{ color: '#0891b2', fontWeight: 600, fontSize: 16, margin: 0 }}>Đang tải danh sách đơn xin nghỉ...</p>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: "60px 20px",
                  color: '#0891b2', 
                  fontWeight: 600,
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                  <div style={{ fontSize: "40px", marginBottom: "15px" }}>📋</div>
                  <div>Chưa có đơn xin nghỉ nào</div>
                </div>
              ) : (
                <div style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  overflow: "hidden"
                }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "14px"
                    }}>
                      <thead style={{
                        backgroundColor: "#f8fafc",
                        borderBottom: "2px solid #e2e8f0"
                      }}>
                        <tr>
                          <th style={{
                            textAlign: "left",
                            padding: "16px",
                            fontWeight: "600",
                            color: "#0891b2",
                            borderRight: "1px solid #e2e8f0"
                          }}>Ngày nghỉ</th>
                          <th style={{
                            textAlign: "left", 
                            padding: "16px",
                            fontWeight: "600",
                            color: "#0891b2",
                            borderRight: "1px solid #e2e8f0"
                          }}>Ca làm việc</th>
                          <th style={{
                            textAlign: "left",
                            padding: "16px", 
                            fontWeight: "600",
                            color: "#0891b2",
                            borderRight: "1px solid #e2e8f0"
                          }}>Ghi chú</th>
                          <th style={{
                            textAlign: "center",
                            padding: "16px",
                            fontWeight: "600", 
                            color: "#0891b2",
                            borderRight: "1px solid #e2e8f0"
                          }}>Trạng thái</th>
                          <th style={{
                            textAlign: "center",
                            padding: "16px",
                            fontWeight: "600",
                            color: "#0891b2"
                          }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveRequests.map((request, index) => (
                          <tr key={request.leaveRequestId || index} style={{
                            borderBottom: "1px solid #e2e8f0",
                            transition: "background-color 0.2s ease"
                          }}>
                            <td style={{
                              padding: "16px",
                              borderRight: "1px solid #e2e8f0",
                              fontWeight: "500"
                            }}>
                              {new Date(request.leaveDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td style={{
                              padding: "16px",
                              borderRight: "1px solid #e2e8f0"
                            }}>
                              {getShiftText(request.shift)}
                            </td>
                            <td style={{
                              padding: "16px",
                              borderRight: "1px solid #e2e8f0",
                              maxWidth: "200px",
                              wordWrap: "break-word"
                            }}>
                              {request.note || 'Không có ghi chú'}
                            </td>
                            <td style={{
                              padding: "16px",
                              textAlign: "center",
                              borderRight: "1px solid #e2e8f0"
                            }}>
                              <span style={{
                                padding: "6px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                backgroundColor: getStatusColor(request.status).bg,
                                color: getStatusColor(request.status).text
                              }}>
                                {getStatusText(request.status)}
                              </span>
                            </td>
                            <td style={{
                              padding: "16px",
                              textAlign: "center"
                            }}>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                {request.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => openEditLeaveModal(request)}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: "4px",
                                        border: "none",
                                        backgroundColor: "#fbbf24",
                                        color: "#fff",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease"
                                      }}
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      onClick={() => deleteLeaveRequest(request.leaveRequestId)}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: "4px",
                                        border: "none",
                                        backgroundColor: "#ef4444",
                                        color: "#fff",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease"
                                      }}
                                    >
                                      Xóa
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : null}
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

      {/* Modal thêm đơn xin nghỉ */}
      {showAddLeaveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 32,
            minWidth: 400,
            maxWidth: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
          }}>
            <h2 style={{ color: '#0891b2', marginBottom: 20 }}>Tạo đơn xin nghỉ</h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                Ngày nghỉ:
              </label>
              <input
                type="date"
                value={leaveFormData.leaveDate}
                onChange={(e) => setLeaveFormData({...leaveFormData, leaveDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                Ca làm việc:
              </label>
              <select
                value={leaveFormData.shift}
                onChange={(e) => setLeaveFormData({...leaveFormData, shift: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              >
                <option value="MORNING">Ca sáng (08:00 - 12:00)</option>
                <option value="AFTERNOON">Ca chiều (13:30 - 17:30)</option>
                <option value="FULL_DAY">Cả ngày (08:00 - 17:30)</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                Ghi chú:
              </label>
              <textarea
                value={leaveFormData.note}
                onChange={(e) => setLeaveFormData({...leaveFormData, note: e.target.value})}
                placeholder="Lý do xin nghỉ (không bắt buộc)"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => {
                  setShowAddLeaveModal(false);
                  resetLeaveForm();
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Hủy
              </button>
              <button
                onClick={submitLeaveRequest}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Tạo đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal sửa đơn xin nghỉ */}
      {showEditLeaveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 32,
            minWidth: 400,
            maxWidth: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
          }}>
            <h2 style={{ color: '#0891b2', marginBottom: 20 }}>Chỉnh sửa đơn xin nghỉ</h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                Ngày nghỉ:
              </label>
              <input
                type="date"
                value={leaveFormData.leaveDate}
                onChange={(e) => setLeaveFormData({...leaveFormData, leaveDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                Ca làm việc:
              </label>
              <select
                value={leaveFormData.shift}
                onChange={(e) => setLeaveFormData({...leaveFormData, shift: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              >
                <option value="MORNING">Ca sáng (08:00 - 12:00)</option>
                <option value="AFTERNOON">Ca chiều (13:30 - 17:30)</option>
                <option value="FULL_DAY">Cả ngày (08:00 - 17:30)</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
                Ghi chú:
              </label>
              <textarea
                value={leaveFormData.note}
                onChange={(e) => setLeaveFormData({...leaveFormData, note: e.target.value})}
                placeholder="Lý do xin nghỉ (không bắt buộc)"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => {
                  setShowEditLeaveModal(false);
                  setEditingLeaveRequest(null);
                  resetLeaveForm();
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Hủy
              </button>
              <button
                onClick={updateLeaveRequest}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantInterface;
