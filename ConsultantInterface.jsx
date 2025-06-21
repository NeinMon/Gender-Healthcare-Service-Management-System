import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import CustomerAvatar from './components/CustomerAvatar';
import consultationsData from './data/consultations';
import questionsData from './data/questions';
import chatMessagesData from './data/chatMessages';

const ConsultantInterface = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('consultations');
  const [consultations, setConsultations] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState('');  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [callTimerInterval, setCallTimerInterval] = useState(null);  const [consultantInfo, setConsultantInfo] = useState({
    name: 'Bác sĩ Tư Vấn',
    specialty: 'Sức khỏe phụ nữ',
    patients: 120,
    consultations: 450,
    rating: 4.9
  });

  // Get consultant info from localStorage if available
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    if (loggedInUser.role === 'consultant') {
      setConsultantInfo({
        name: loggedInUser.name || 'Bác sĩ Tư Vấn',
        specialty: 'Sức khỏe phụ nữ',
        patients: Math.floor(Math.random() * 200) + 50,
        consultations: Math.floor(Math.random() * 500) + 200,
        rating: (Math.random() * 1 + 4).toFixed(1)
      });
    }
  }, []);

  // Manage full screen mode for consultant interface
  useEffect(() => {
    // Add CSS class to body when component mounts
    document.body.classList.add('consultant-fullscreen-active');
    
    // Remove CSS class when component unmounts
    return () => {
      document.body.classList.remove('consultant-fullscreen-active');
    };
  }, []);

  // Initialize data from imported files
  useEffect(() => {
    setConsultations(consultationsData);
    setQuestions(questionsData);
  }, []);  // Load chat messages when a conversation is selected
  useEffect(() => {
    if (selectedItem && isChatOpen && selectedItem.id) {
      try {
        const consultationMessages = chatMessagesData[selectedItem.id] || [];
        if (consultationMessages.length > 0) {
          setChatMessages(consultationMessages.map(msg => ({
            sender: msg.sender,
            text: msg.text,
            time: msg.time
          })));
        } else {
          // If no messages exist for this consultation, initialize with a greeting
          setChatMessages([
            {
              sender: 'patient',
              text: `Xin chào bác sĩ, tôi là ${selectedItem.patientName}.`,
              time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading chat messages:', error);
        // Initialize with a greeting if error occurs
        setChatMessages([
          {
            sender: 'patient',
            text: `Xin chào bác sĩ, tôi là ${selectedItem.patientName}.`,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }
  }, [selectedItem, isChatOpen]);

  const handleLogout = () => {
    // Add any logout logic here
    navigate('/');
  };
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    if (activeTab === 'questions' && selectedItem) {
      // Update the question with the reply
      const updatedQuestions = questions.map(q => {
        if (q.id === selectedItem.id) {
          return { ...q, status: 'answered', reply: replyText };
        }
        return q;
      });
      
      setQuestions(updatedQuestions);
      // Update the selected item
      setSelectedItem({ ...selectedItem, status: 'answered', reply: replyText });
      setReplyText('');
      
      // In a real application, you would save this to the database here
      alert("Câu trả lời đã được gửi!");
    }
  };
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMessage = {
      sender: 'consultant',
      text: messageText,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageText('');
    
    // In a real application, you would save this message to the database here
    // For now, we just show a notification
    if (selectedItem.status === 'scheduled') {
      // Update consultation status to ongoing when first message is sent
      const updatedConsultations = consultations.map(c => {
        if (c.id === selectedItem.id) {
          return { ...c, status: 'ongoing' };
        }
        return c;
      });
      
      setConsultations(updatedConsultations);
      // Update the selected item
      setSelectedItem({ ...selectedItem, status: 'ongoing' });
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
  const completeConsultation = () => {
    if (selectedItem && selectedItem.status !== 'completed') {
      // Confirm before completing the consultation
      if (window.confirm('Bạn có chắc chắn muốn kết thúc cuộc tư vấn này không?')) {
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
        
        // In a real application, you would save this to the database here
        alert("Cuộc tư vấn đã được đánh dấu là hoàn thành!");
        
        // Close the chat/call window after completing
        closeChat();
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
  };  return (
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Đánh giá:</span>
              <span>{consultantInfo.rating}/5 ⭐</span>
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
                textAlign: 'left'
              }}
            >
              ❓ Câu hỏi
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
                      <CustomerAvatar 
                        name={consultation.patientName} 
                        gender={consultation.patientGender || 'Nữ'}
                        size={50}
                      />
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
                        <CustomerAvatar 
                          name={question.patientName} 
                          gender={question.patientGender || 'Nữ'}
                          size={50}
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
                  <CustomerAvatar 
                    name={selectedItem.patientName} 
                    gender={selectedItem.patientGender || 'Nữ'}
                    size={50}
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
                <CustomerAvatar 
                  name={selectedItem.patientName} 
                  gender={selectedItem.patientGender || 'Nữ'}
                  size={40}
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
                        <CustomerAvatar 
                          name={selectedItem.patientName} 
                          gender={selectedItem.patientGender || 'Nữ'}
                          size={200}
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
