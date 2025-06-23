import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const ConsultantInterface = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('consultations');
  const [consultations, setConsultations] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [callTimerInterval, setCallTimerInterval] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [consultantInfo, setConsultantInfo] = useState({
    // name: 'Bác sĩ Tư Vấn',
    // specialty: 'Sức khỏe phụ nữ',
    // patients: 120,
    // consultations: 450,
    // rating: 4.9
  });  // Xác thực người dùng và lấy thông tin consultant từ localStorage
  useEffect(() => {
    const verifyConsultantRole = async () => {
      try {
        // Lấy thông tin người dùng từ localStorage
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
        
        // Thêm log để debug
        console.log('Thông tin người dùng từ localStorage:', loggedInUser);
        
        // Lấy userID hoặc id từ dữ liệu người dùng
        const userId = loggedInUser.userID || loggedInUser.id;
        
        if (!userId) {
          console.warn('Thiếu userID/id, chuyển hướng về trang đăng nhập');
          navigate('/');
          return;
        }
        
        // Lấy role và kiểm tra linh hoạt
        const userRole = loggedInUser.role || '';
        console.log('Vai trò người dùng:', userRole, typeof userRole);
        
        // Kiểm tra phù hợp với enum Role từ backend (CUSTOMER, CONSULTANT, MANAGER, ADMIN)
        const isConsultant = 
          userRole === 'CONSULTANT' || 
          userRole === 'consultant' || 
          userRole === 'Consultant';
        
        if (!isConsultant) {
          console.warn(`Vai trò "${userRole}" không phải là vai trò tư vấn viên`);
          alert(`Bạn không có quyền truy cập trang này. Vai trò hiện tại: ${userRole}`);
          navigate('/');
          return;
        }
        
        // Cập nhật thông tin consultant từ localStorage
        setConsultantInfo({
          id: userId,
          name: loggedInUser.fullName || loggedInUser.name || 'Bác sĩ Tư Vấn',
          specialty: 'Sức khỏe phụ nữ', // Thông tin mặc định
          patients: Math.floor(Math.random() * 200) + 50, // Tạm thời dùng dữ liệu ngẫu nhiên
          consultations: Math.floor(Math.random() * 500) + 200,
          // // rating: (Math.random() * 1 + 4).toFixed(1)
        });
        
        console.log('Đã xác thực tư vấn viên thành công:', loggedInUser.fullName || loggedInUser.name);
        
      } catch (error) {
        console.error('Lỗi khi xác thực:', error);
        alert('Phiên đăng nhập hết hạn hoặc không hợp lệ');
        navigate('/');
      }
    };
    
    verifyConsultantRole();
  }, [navigate]);

  // Manage full screen mode for consultant interface
  useEffect(() => {
    // Add CSS class to body when component mounts
    document.body.classList.add('consultant-fullscreen-active');
    
    // Remove CSS class when component unmounts
    return () => {
      document.body.classList.remove('consultant-fullscreen-active');
    };
  }, []);

  

  // Thêm useEffect để nạp câu hỏi
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/questions');
        if (!response.ok) {
          throw new Error('Không thể tải câu hỏi');
        }
        const rawData = await response.json();
        console.log('Dữ liệu gốc từ API:', rawData);
        
        // Lấy thông tin người dùng cho mỗi câu hỏi
        const questionsWithUserDetails = [];
        
        for (const item of rawData) {
          let userName = "Người dùng " + (item.userID || "");
          
          // Lấy thông tin người dùng
          if (item.userID) {
            const userDetail = await fetchUserDetails(item.userID);
            if (userDetail) {
              userName = userDetail.fullName || userName;
              // Lưu vào cache
              setUserDetails(prev => ({
                ...prev,
                [item.userID]: userDetail
              }));
            }
          }
          
          questionsWithUserDetails.push({
            id: item.questionID || item.id,
            patientName: userName,
            date: item.createdAt || item.date || new Date().toISOString(),
            question: item.content || item.title || "",
            status: mapStatus(item.status),
            reply: item.reply || "",
            userID: item.userID // Lưu userID để có thể sử dụng sau này
          });
        }
        
        console.log('Dữ liệu đã chuyển đổi:', questionsWithUserDetails);
        setQuestions(questionsWithUserDetails);
      } catch (error) {
        console.error('Lỗi khi tải câu hỏi:', error);
        
        // Dữ liệu mẫu khi API thất bại
        const mockQuestions = [
          {
            id:
            
            1,
            patientName: 'Nguyễn Thị A',
            date: new Date().toISOString(),
            question: 'Tôi bị đau bụng dưới thường xuyên, có nên đi khám không?',
            status: 'pending',
            reply: ''
          },
          {
            id: 2,
            patientName: 'Trần Văn B',
            date: new Date().toISOString(),
            question: 'Làm thế nào để giảm lo lắng về vấn đề sức khỏe sinh sản?',
            status: 'answered',
            reply: 'Bạn nên tham khảo ý kiến chuyên gia và thực hành thư giãn.'
          }
        ];
        
        console.log('Sử dụng dữ liệu mẫu:', mockQuestions);
        setQuestions(mockQuestions);
      }
    };

    // Hàm để chuyển đổi trạng thái từ backend sang frontend
    const mapStatus = (backendStatus) => {
      switch(backendStatus?.toLowerCase()) {
        case 'mới':
        case 'chờ':
        case 'chưa trả lời':
          return 'pending';
        case 'đã trả lời':
        case 'hoàn thành':
          return 'answered';
        default:
          return 'pending';
      }
    };

    fetchQuestions();
  }, []);

  // Thêm useEffect để nạp dữ liệu cuộc tư vấn
  // useEffect(() => {
  //   const fetchConsultations = async () => {
  //     try {
  //       const response = await fetch('http://localhost:8080/api/consultations');
  //       if (!response.ok) {
  //         throw new Error('Không thể tải dữ liệu tư vấn');
  //       }
  //       const data = await response.json();
  //       setConsultations(data);
  //     } catch (error) {
  //       console.error('Lỗi khi tải dữ liệu tư vấn:', error);
  //     }
  //   };

  //   fetchConsultations();
  // }, []);
  const handleLogout = () => {
    // Xóa thông tin đăng nhập từ localStorage
    localStorage.removeItem('loggedInUser');
    // Có thể gọi API để invalidate token ở phía server
    // fetch('http://localhost:8080/api/auth/logout', { method: 'POST' });
    // Chuyển hướng về trang chủ
    navigate('/');
  };  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      // Lấy thông tin người dùng từ localStorage
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
      const consultantId = loggedInUser.userID; // Sử dụng userID từ localStorage
      
      if (!consultantId) {
        alert('Không tìm thấy thông tin tư vấn viên, vui lòng đăng nhập lại');
        navigate('/');
        return;
      }
      
      // Tạo timestamp hiện tại định dạng "YYYY-MM-DD HH:MM:SS"
      const now = new Date();
      const createdAt = now.getFullYear() + '-' + 
                       String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(now.getDate()).padStart(2, '0') + ' ' + 
                       String(now.getHours()).padStart(2, '0') + ':' + 
                       String(now.getMinutes()).padStart(2, '0') + ':' + 
                       String(now.getSeconds()).padStart(2, '0');
      
      // Gửi API phù hợp với định dạng yêu cầu
      const response = await fetch(`http://localhost:8080/api/answers/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: selectedItem.id,
          consultantId: consultantId,
          content: replyText,
          createdAt: createdAt // Thêm trường createdAt
        }),
      });
      
      if (!response.ok) {
        throw new Error('Không thể gửi câu trả lời');
      }
      
      // Cập nhật UI sau khi gửi thành công
      const updatedQuestions = questions.map(q => {
        if (q.id === selectedItem.id) {
          return { 
            ...q, 
            status: 'answered', 
            reply: replyText,
            answeredAt: createdAt // Lưu thời gian trả lời
          };
        }
        return q;
      });
      
      setQuestions(updatedQuestions);
      setSelectedItem({ 
        ...selectedItem, 
        status: 'answered', 
        reply: replyText,
        answeredAt: createdAt
      });
      setReplyText('');
      
      alert("Câu trả lời đã được gửi!");
    } catch (error) {
      console.error('Lỗi khi gửi câu trả lời:', error);
      alert('Đã xảy ra lỗi khi gửi câu trả lời. Vui lòng thử lại.');
    }

  };  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMessage = {
      sender: 'consultant',
      text: messageText,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageText('');
    
    // Trong ứng dụng thực tế, bạn sẽ lưu tin nhắn vào cơ sở dữ liệu
    // Có thể triển khai API gửi tin nhắn trong tương lai
    try {
      // Mã ví dụ để gửi tin nhắn lên server (được comment lại)
      /*
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
      const consultantId = loggedInUser.userID;
      
      const response = await fetch('http://localhost:8080/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultationId: selectedItem.id,
          senderId: consultantId,
          content: messageText,
          timestamp: new Date().toISOString()
        }),
      });
      */
      
      // Cập nhật trạng thái cuộc tư vấn nếu cần
      if (selectedItem.status === 'scheduled') {
        // Cập nhật UI
        const updatedConsultations = consultations.map(c => {
          if (c.id === selectedItem.id) {
            return { ...c, status: 'ongoing' };
          }
          return c;
        });
        
        setConsultations(updatedConsultations);
        setSelectedItem({ ...selectedItem, status: 'ongoing' });
        
        // Có thể thêm API cập nhật trạng thái ở đây
        // fetch(`http://localhost:8080/api/consultations/${selectedItem.id}/status`, {...});
      }
    } catch (error) {
      console.error('Lỗi khi xử lý tin nhắn:', error);
    }
  };
  const startChat = (item) => {
    setSelectedItem(item);
    setIsChatOpen(true);
    setIsVideoCall(false); // Start with text chat by default
  };
  const startVideoCall = (item) => {
    setSelectedItem(item);
    setIsChatOpen(true);
    setIsVideoCall(true); // Start as video call
    
    // Start the call timer
    setCallTimer(0);
    const interval = setInterval(() => {
      setCallTimer(prev => prev + 1);
    }, 1000);
    setCallTimerInterval(interval);
  };
  const closeChat = () => {
    setIsChatOpen(false);
    setIsVideoCall(false);
    setIsMicMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    
    // Clear the call timer
    if (callTimerInterval) {
      clearInterval(callTimerInterval);
      setCallTimerInterval(null);
    }
  };
  const completeConsultation = async () => {
    if (selectedItem && selectedItem.status !== 'completed') {
      // Confirm before completing the consultation
      if (window.confirm('Bạn có chắc chắn muốn kết thúc cuộc tư vấn này không?')) {
        try {
          // Gửi cập nhật lên API
          const response = await fetch(`http://localhost:8080/api/consultations/${selectedItem.id}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'completed' }),
          });

          if (!response.ok) {
            throw new Error('Không thể cập nhật trạng thái tư vấn');
          }

          // Update consultation status to completed
          const updatedConsultations = consultations.map(c => {
            if (c.id === selectedItem.id) {
              return { ...c, status: 'completed' };
            }
            return c;
          });
          
          setConsultations(updatedConsultations);
          // Update the selected item
          setSelectedItem({ ...selectedItem, status: 'completed' });
          
          alert("Cuộc tư vấn đã được đánh dấu là hoàn thành!");
          
          // Close the chat/call window after completing
          closeChat();
        } catch (error) {
          console.error('Lỗi khi cập nhật trạng thái tư vấn:', error);
          alert('Đã xảy ra lỗi khi cập nhật trạng thái. Vui lòng thử lại.');
        }
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#0891b2';
      case 'ongoing': return '#43a047';
      case 'completed': return '#757575';
      case 'pending': return '#fbc02d';
      case 'answered': return '#43a047';
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Đã lên lịch';
      case 'ongoing': return 'Đang diễn ra';
      case 'completed': return 'Đã hoàn thành';
      case 'pending': return 'Chưa trả lời';
      case 'answered': return 'Đã trả lời';
      default: return status;
    }
  };  

  // Thêm function này vào trong component ConsultantInterface
  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
      return null;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng ${userId}:`, error);
      return null;
    }
  };

  return (
    <div 
      className="consultant-fullscreen"
      style={{ 
        backgroundColor: '#f5f5f5', 
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <header style={{ 
        backgroundColor: '#0891b2', 
        color: 'white', 
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'white', marginRight: '2rem' }}>
            <h1 style={{ margin: 0 }}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🏥</span> 
              Tư Vấn Sức Khỏe Giới Tính
            </h1>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            marginRight: '1rem', 
            display: 'flex', 
            alignItems: 'center' 
          }}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>👩‍⚕️</span>
            <span>{consultantInfo.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Đăng Xuất
          </button>
        </div>
      </header>      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ 
          width: '320px', 
          backgroundColor: 'white', 
          padding: '1.5rem',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
          minHeight: '100%',
          borderRight: '1px solid #e0e0e0'
        }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '1.5rem',
            padding: '1rem',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '0.5rem',
              background: '#e1f5fe',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto'
            }}>
              👩‍⚕️
            </div>
            <h2 style={{ margin: '0.5rem 0', fontSize: '1.5rem' }}>{consultantInfo.name}</h2>
            <p style={{ margin: '0.25rem 0', color: '#0891b2' }}>{consultantInfo.specialty}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span>Bệnh nhân:</span>
              <span>{consultantInfo.patients}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span>Cuộc tư vấn:</span>
              <span>{consultantInfo.consultations}</span>
            </div>
          </div>

          <div>
            <button 
              onClick={() => setActiveTab('consultations')}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '0.75rem',
                backgroundColor: activeTab === 'consultations' ? '#0891b2' : 'white',
                color: activeTab === 'consultations' ? 'white' : '#333',
                border: activeTab === 'consultations' ? 'none' : '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                textAlign: 'left'
              }}
            >
              🗓️ Cuộc tư vấn
            </button>
            <button 
              onClick={() => setActiveTab('questions')}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: activeTab === 'questions' ? '#0891b2' : 'white',
                color: activeTab === 'questions' ? 'white' : '#333',
                border: activeTab === 'questions' ? 'none' : '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                textAlign: 'left',
                position: 'relative'
              }}
            >
              ❓ Câu hỏi
              {questions.filter(q => q.status === 'pending').length > 0 && (
                <span style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#f44336',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem'
                }}>
                  {questions.filter(q => q.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>        {/* Main Content */}
        <div style={{ flex: 1, padding: '0', backgroundColor: 'white', overflow: 'auto' }}>
          {activeTab === 'consultations' && (
            <div style={{ backgroundColor: 'white', padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Cuộc tư vấn</h2>
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {consultations.map(consultation => (
                  <div 
                    key={consultation.id}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #e0e0e0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UserAvatar userName={consultation.patientName} />
                      <div style={{ marginLeft: '1rem' }}>
                        <h3 style={{ margin: '0 0 0.25rem 0' }}>{consultation.patientName}</h3>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                          {new Date(consultation.date).toLocaleDateString('vi-VN')} - {consultation.time}
                        </p>
                        <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                          {consultation.symptoms}
                        </p>
                      </div>
                    </div><div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        marginRight: '1rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        backgroundColor: getStatusColor(consultation.status) + '20',
                        color: getStatusColor(consultation.status)
                      }}>
                        {getStatusText(consultation.status)}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => startChat(consultation)}
                          style={{
                            backgroundColor: '#0891b2',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Trò chuyện
                        </button>
                        <button 
                          onClick={() => startVideoCall(consultation)}
                          style={{
                            backgroundColor: '#43a047',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Cuộc gọi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}          {activeTab === 'questions' && (
            <div style={{ backgroundColor: 'white', padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Câu hỏi từ bệnh nhân</h2>
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {questions.map(question => (
                  <div 
                    key={question.id}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #e0e0e0',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedItem(question)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <UserAvatar 
                          userName={question.patientName}
                        />
                        <div style={{ marginLeft: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: '0 0.5rem 0 0' }}>{question.patientName}</h3>
                            <span style={{ 
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              backgroundColor: getStatusColor(question.status) + '20',
                              color: getStatusColor(question.status)
                            }}>
                              {getStatusText(question.status)}
                            </span>
                          </div>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                            {new Date(question.date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', marginLeft: '3.5rem' }}>
                      <p style={{ margin: '0', fontWeight: 'bold' }}>{question.question}</p>
                      {question.reply && (
                        <div style={{ 
                          marginTop: '0.5rem', 
                          padding: '0.75rem', 
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px' 
                        }}>
                          <p style={{ margin: '0', color: '#0891b2' }}>
                            <span style={{ fontWeight: 'bold' }}>Trả lời:</span> {question.reply}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Detail & Reply */}
          {activeTab === 'questions' && selectedItem && (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderTop: '1px solid #e0e0e0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>Chi tiết câu hỏi</h2>
                <button 
                  onClick={() => setSelectedItem(null)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#757575',
                    cursor: 'pointer',
                    fontSize: '1.25rem'
                  }}
                >
                  ✖
                </button>
              </div>
              <div style={{ 
                padding: '1rem', 
                marginBottom: '1rem',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px'
              }}>                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <UserAvatar 
                    userName={selectedItem.patientName}
                  />
                  <div style={{ marginLeft: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <h3 style={{ margin: '0 0.5rem 0 0' }}>{selectedItem.patientName}</h3>
                      <span style={{ 
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        backgroundColor: getStatusColor(selectedItem.status) + '20',
                        color: getStatusColor(selectedItem.status)
                      }}>
                        {getStatusText(selectedItem.status)}
                      </span>
                    </div>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                      {new Date(selectedItem.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <p style={{ 
                  margin: '0.5rem 0', 
                  padding: '1rem', 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  {selectedItem.question}
                </p>
              </div>

              {selectedItem.reply ? (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#e1f5fe',
                  borderRadius: '8px'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0891b2' }}>Trả lời của bạn:</h3>
                  <p style={{ margin: '0' }}>{selectedItem.reply}</p>
                </div>
              ) : (
                <form onSubmit={handleSendReply}>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      marginBottom: '1rem',
                      minHeight: '120px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      fontSize: '1rem'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#0891b2',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Gửi câu trả lời
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {isChatOpen && selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>          <div style={{
            width: '95%',
            height: '95%',
            backgroundColor: 'white',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            maxWidth: 'none',
            maxHeight: 'none'
          }}>{/* Chat Header */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#0891b2',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserAvatar 
                 userName={selectedItem.patientName}
                />
                <div style={{ marginLeft: '0.75rem' }}>
                  <h3 style={{ margin: '0' }}>{selectedItem.patientName}</h3>
                  <p style={{ margin: '0', fontSize: '0.8rem' }}>
                    {selectedItem.date && new Date(selectedItem.date).toLocaleDateString('vi-VN')} - {selectedItem.time}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {selectedItem.status !== 'completed' && (
                  <button 
                    onClick={completeConsultation}
                    style={{
                      backgroundColor: '#43a047',
                      border: 'none',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      marginRight: '1rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Hoàn thành
                  </button>
                )}
                <button 
                  onClick={closeChat}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1.25rem'
                  }}
                >
                  ✖
                </button>
              </div>
            </div>

            {/* Video Call or Chat Messages */}
            {isVideoCall ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#0e0e0e',
                position: 'relative'
              }}>
                {/* Main video area */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '1rem'
                }}>
                  {/* Patient video (main view) */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#2d2d2d',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'                  }}>
                    {isScreenSharing ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          fontSize: '4rem',
                          marginBottom: '1rem'
                        }}>
                          🖥️
                        </div>
                        <div style={{
                          color: 'white',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}>
                          Đang chia sẻ màn hình
                        </div>
                      </div>                    ) : (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: 0.7
                      }}>
                        <UserAvatar 
                          userName={selectedItem.patientName}
                        />
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '20px',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}>
                      {selectedItem.patientName}
                    </div>
                  </div>
                  
                  {/* Consultant video (PiP) */}
                  <div style={{
                    position: 'absolute',
                    width: '180px',
                    height: '120px',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#0891b2',
                    borderRadius: '8px',
                    border: '2px solid white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {isVideoOff ? (
                      <div style={{ fontSize: '2rem', color: 'white' }}>👩‍⚕️</div>
                    ) : (
                      <div style={{ 
                        fontSize: '2rem', 
                        color: 'white',
                        backgroundColor: '#075d73',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '50%'
                      }}>
                        👩‍⚕️
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Call timer */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: 0,
                  right: 0,
                  textAlign: 'center'                }}>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem'                  }}>
                    {`${Math.floor(callTimer / 3600).toString().padStart(2, '0')}:${Math.floor((callTimer % 3600) / 60).toString().padStart(2, '0')}:${(callTimer % 60).toString().padStart(2, '0')}`}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                backgroundColor: '#f5f5f5'
              }}>
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender === 'consultant' ? 'flex-end' : 'flex-start',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: msg.sender === 'consultant' ? '#0891b2' : 'white',
                      color: msg.sender === 'consultant' ? 'white' : '#333',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      <p style={{ margin: '0 0 0.25rem 0' }}>{msg.text}</p>
                      <span style={{ fontSize: '0.7rem', opacity: 0.8, textAlign: 'right', display: 'block' }}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}            {/* Chat Input or Call Controls */}
            {isVideoCall ? (
              <div style={{
                padding: '1rem',
                backgroundColor: '#0e0e0e',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem'
              }}>
                {/* Mute/Unmute Button */}
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  style={{
                    backgroundColor: isMicMuted ? '#f44336' : '#424242',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '1.25rem'
                  }}
                >
                  {isMicMuted ? '🔇' : '🎙️'}
                </button>
                
                {/* End Call Button */}
                <button
                  onClick={closeChat}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '1.5rem'
                  }}
                >
                  📞
                </button>
                
                {/* Video On/Off Button */}
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  style={{
                    backgroundColor: isVideoOff ? '#f44336' : '#424242',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '1.25rem'
                  }}
                >                  {isVideoOff ? '🚫' : '📹'}
                </button>
                
                {/* Screen Share Button */}
                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  style={{
                    backgroundColor: isScreenSharing ? '#ff9800' : '#424242',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '1.25rem'
                  }}
                >
                  {isScreenSharing ? '🖥️' : '🔄'}
                </button>
                
                {/* Chat Toggle Button */}
                <button
                  onClick={() => setIsVideoCall(false)}
                  style={{
                    backgroundColor: '#424242',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '1.25rem'
                  }}
                >
                  💬
                </button>
              </div>
            ) : (
              <form 
                onSubmit={handleSendMessage}
                style={{
                  padding: '1rem',
                  borderTop: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <input 
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '30px',
                    border: '1px solid #ddd',
                    marginRight: '0.75rem',
                    fontSize: '1rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsVideoCall(true)}
                  style={{
                    backgroundColor: '#43a047',
                    color: 'white',
                    border: 'none',
                    borderRadius: '30px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    marginRight: '0.5rem'
                  }}
                >
                  📹
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0891b2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '30px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  →
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantInterface;
