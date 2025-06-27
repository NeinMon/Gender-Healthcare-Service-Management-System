import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const UserQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consultantNames, setConsultantNames] = useState({});
  
  // Hàm lấy thông tin tư vấn viên
  const fetchConsultantInfo = async (consultantId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${consultantId}`);
      if (response.ok) {
        const consultantData = await response.json();
        return consultantData.fullName || `Tư vấn viên #${consultantId}`;
      } else {
        return `Tư vấn viên #${consultantId}`;
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin tư vấn viên:', error);
      return `Tư vấn viên #${consultantId}`;
    }
  };

  useEffect(() => {
    fetchUserQuestions();
  }, []);
    // Di chuyển hàm fetchUserQuestions ra ngoài useEffect để có thể gọi lại
  const fetchUserQuestions = async () => {
    try {
      setLoading(true);
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
      const userId = localStorage.getItem('userId') || loggedInUser.userID || loggedInUser.id;
      
      if (!userId) {
        throw new Error('Không tìm thấy ID người dùng');
      }
      
      console.log('Đang gọi API với userId:', userId);
      const response = await fetch(`http://localhost:8080/api/questions/user/${userId}`);
      
      // Log response status để debug
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Không thể tải danh sách câu hỏi. Status: ${response.status}`);
      }
      
      const questions = await response.json();
      console.log('Dữ liệu câu hỏi của người dùng:', questions);
      
      // Tạo danh sách câu hỏi với câu trả lời (nếu có)
      const questionsWithAnswers = await Promise.all(
        questions.map(async (question) => {
          // Format dữ liệu câu hỏi
          const formattedQuestion = {
            id: question.id || question.questionID,
            questionID: question.id || question.questionID,
            content: question.content || question.question,
            date: question.date || question.createdAt,
            status: question.status || 'pending',
            createdAt: question.createdAt || question.date,
            title: question.title || '',
          };

          // Map status từ backend sang frontend
          let isResolved = formattedQuestion.status === 'resolved';
          // Nếu câu hỏi đã được giải quyết thì lấy câu trả lời
          if (isResolved) {
            try {
              const answerResponse = await fetch(`http://localhost:8080/api/answers/${question.id || question.questionID}`);
              if (answerResponse.ok) {
                const answerData = await answerResponse.json();
                formattedQuestion.reply = answerData.content;
                formattedQuestion.answeredAt = answerData.createdAt;
                formattedQuestion.status = 'resolved';
                formattedQuestion.consultantID = answerData.consultantID;
              } else {
                // Không tìm thấy câu trả lời
              }
            } catch (error) {
              // Lỗi khi lấy câu trả lời
            }
          }
          return formattedQuestion;
        })
      );
        console.log('Dữ liệu đã xử lý với câu trả lời:', questionsWithAnswers);
      setQuestions(questionsWithAnswers);
      
      // Lấy danh sách consultantId duy nhất từ những câu hỏi đã được trả lời
      const consultantIds = [...new Set(
        questionsWithAnswers
          .filter(q => q.consultantID)
          .map(q => q.consultantID)
      )];
      
      // Fetch thông tin tư vấn viên cho từng consultantId
      const namesObj = {};
      await Promise.all(
        consultantIds.map(async (id) => {
          const name = await fetchConsultantInfo(id);
          namesObj[id] = name;
        })
      );
      setConsultantNames(namesObj);
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi:', error);
      setError(error.message);
      
      // Dữ liệu mẫu cho trường hợp API chưa hoàn thiện
      setQuestions([
        {
          id: 1,
          questionID: 1,
          title: "Câu hỏi về sức khỏe",
          content: "Tôi bị đau bụng dưới thường xuyên, có nên đi khám không?",
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          status: "pending"
        },
        {
          id: 2,
          questionID: 2,
          title: "Lo lắng về sức khỏe sinh sản",
          content: "Làm thế nào để giảm lo lắng về vấn đề sức khỏe sinh sản?",
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          status: "resolved",
          reply: "Bạn nên tham khảo ý kiến chuyên gia và thực hành thư giãn. Ngoài ra, việc tìm hiểu kiến thức đúng đắn về sức khỏe sinh sản cũng rất quan trọng để giảm lo lắng không cần thiết.",
          answeredAt: new Date(Date.now() - 86400000).toISOString(),
          consultantID: 1
        }
      ]);
      
      // Fetch tên tư vấn viên cho dữ liệu mẫu
      const sampleConsultantName = await fetchConsultantInfo(1);
      setConsultantNames({ 1: sampleConsultantName });
    } finally {
      setLoading(false);
    }
  };
    // Hàm format ngày giờ
  const formatDate = (dateString) => {
    if (!dateString) return "Không có thông tin";
    
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Lỗi khi format ngày:', e);
      return "Định dạng ngày không hợp lệ";
    }
  };
  return (
    <div style={{
      backgroundColor: "#f0f9ff !important",
      background: "#f0f9ff !important",
      minHeight: "100vh",
      colorScheme: "light",
      width: "100vw",
      margin: 0,
      padding: 0
    }}>
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 0,
        position: "relative",
        width: "100%"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "15px 20px"
        }}>
          <img
            src="/Logo.png"
            alt="Logo"
            style={{ height: 60, width: 60, objectFit: "contain" }}
          />
          <h1
            style={{
              color: "#fff",
              margin: 0,
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: "2.8rem"
            }}
          >
            Câu hỏi của tôi
          </h1>
          <UserAvatar userName="Khách hàng" />
        </div>
      </header>
      <main style={{
        padding: "40px 20px",
        minHeight: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        background: "#f0f9ff !important",
        backgroundColor: "#f0f9ff !important",
        colorScheme: "light"
      }}>
        <div style={{
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto"
        }}>
          <div style={{ marginBottom: "20px", padding: '0 32px' }}>
            <Link 
              to="/" 
              style={{
                display: "flex",
                alignItems: "center",
                color: "#0891b2",
                textDecoration: "none",
                fontWeight: 500
              }}
            >
              ← Quay lại trang chủ
            </Link>
          </div>
          <div style={{ margin: '24px 0 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px' }}>
            <div>
              <h2 style={{ fontWeight: 600, color: '#0891b2', margin: 0 }}>Danh sách câu hỏi của bạn</h2>
            </div>
            <div>
              <button
                style={{
                  backgroundColor: '#0891b2',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
                onClick={() => window.location.href = "/ask-question"}
              >
                + Đặt câu hỏi mới
              </button>
            </div>
          </div>

          <div className="question-answer-section">
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          margin: '0 32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#0891b2', fontWeight: 600, fontSize: '1.1rem' }}>Đang tải câu hỏi...</p>
        </div>
      )}
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '2rem', 
          borderRadius: '12px', 
          margin: '0 32px 1rem 32px',
          color: '#c62828',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #ffcdd2'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>❌</span>
            <strong>Có lỗi xảy ra</strong>
          </div>
          <p style={{ margin: 0 }}>Lỗi: {error}</p>
        </div>
      )}
      
      {!loading && questions.length === 0 && !error && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '3rem', 
          borderRadius: '12px', 
          textAlign: 'center',
          margin: '0 32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
          <h3 style={{ color: '#0891b2', marginBottom: '1rem' }}>Chưa có câu hỏi nào</h3>
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Bạn chưa có câu hỏi nào. Hãy đặt câu hỏi để nhận tư vấn từ các chuyên gia.
          </p>
          <button
            style={{
              backgroundColor: '#0891b2',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(8,145,178,0.3)'
            }}
            onClick={() => window.location.href = "/ask-question"}
          >
            📝 Đặt câu hỏi đầu tiên
          </button>
        </div>
      )}
      
      {questions.map((question) => {
        // Map status cho hiển thị
        const isAnswered = question.status === 'resolved';
        const statusLabel = isAnswered ? 'Đã trả lời' : 'Đang chờ';
        const statusBg = isAnswered ? '#e8f5e9' : '#fff3e0';
        const statusColor = isAnswered ? '#2e7d32' : '#f57c00';
        
        return (
          <div 
            key={question.id || question.questionID}
            style={{
              padding: '2rem',
              margin: '0 32px 2rem 32px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(8,145,178,0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem' 
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: '1.4rem', 
                  color: '#0891b2',
                  fontWeight: 700
                }}>
                  {question.title || 'Câu hỏi tư vấn'}
                </h3>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>📅</span>
                  {formatDate(question.date || question.createdAt)}
                </div>
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                borderRadius: '25px',
                fontSize: '0.9rem',
                fontWeight: 600,
                backgroundColor: statusBg,
                color: statusColor,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {statusLabel}
              </div>
            </div>
            
            {/* Câu hỏi của người dùng */}
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px',
              marginBottom: isAnswered ? '1.5rem' : '0',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1rem' 
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: '#0891b2', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '1rem',
                  boxShadow: '0 2px 8px rgba(8,145,178,0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.2rem' }}>👤</span>
                </div>
                <div>
                  <p style={{ margin: '0', fontWeight: 700, color: '#0891b2', fontSize: '1.1rem' }}>Bạn</p>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Người hỏi
                  </span>
                </div>
              </div>
              <div style={{ 
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#334155'
              }}>
                {question.content || question.question}
              </div>
            </div>

            {/* Câu trả lời từ tư vấn viên */}
            {isAnswered && (
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '12px',
                border: '1px solid #bfdbfe'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '1rem' 
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    backgroundColor: '#22c55e', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '1rem',
                    boxShadow: '0 2px 8px rgba(34,197,94,0.3)'
                  }}>
                    <span style={{ color: 'white', fontSize: '1.2rem' }}>👩‍⚕️</span>
                  </div>
                  <div>
                    <p style={{ margin: '0', fontWeight: 700, color: '#22c55e', fontSize: '1.1rem' }}>
                      {consultantNames[question.consultantID] || 'Tư vấn viên'}
                    </p>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      {question.answeredAt || question.replyDate ? 
                        formatDate(question.answeredAt || question.replyDate) : 
                        "Đã trả lời"}
                    </span>
                  </div>
                </div>
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: '#334155'
                }}>
                  {question.reply || question.answer || (
                    <p style={{ margin: '0', fontStyle: 'italic', color: '#94a3b8' }}>
                      Câu hỏi đã được trả lời nhưng không thể hiển thị nội dung. Vui lòng làm mới trang.
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Nút hành động cho câu hỏi chưa được trả lời */}
            {!isAnswered && (
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid #fbbf24'
              }}>
                <p style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#92400e',
                  fontWeight: 600 
                }}>
                  ⏳ Câu hỏi đang được xử lý
                </p>
                <p style={{ 
                  margin: '0',
                  fontSize: '0.9rem',
                  color: '#78716c'
                }}>
                  Tư vấn viên sẽ phản hồi trong thời gian sớm nhất. Cảm ơn bạn đã kiên nhẫn chờ đợi.
                </p>
              </div>
            )}
          </div>
        );
      })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserQuestions;