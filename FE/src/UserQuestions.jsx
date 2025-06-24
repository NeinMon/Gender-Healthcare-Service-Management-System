import React, { useState, useEffect } from 'react';
import UserAvatar from './UserAvatar';

const UserQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Thêm hàm refresh để người dùng có thể làm mới dữ liệu
  const refreshQuestions = () => {
    setLoading(true);
    setError(null);
    fetchUserQuestions();
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
          status: "answered",
          reply: "Bạn nên tham khảo ý kiến chuyên gia và thực hành thư giãn. Ngoài ra, việc tìm hiểu kiến thức đúng đắn về sức khỏe sinh sản cũng rất quan trọng để giảm lo lắng không cần thiết.",
          answeredAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
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
    <div className="question-answer-section">
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Đang tải câu hỏi...</p>
        </div>
      )}
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          color: '#c62828'
        }}>
          <p>Lỗi: {error}</p>
          <button 
            onClick={refreshQuestions}
            style={{
              backgroundColor: '#c62828',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginTop: '0.5rem'
            }}
          >
            Thử lại
          </button>
        </div>
      )}
      
      {!loading && !error && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          marginBottom: '1rem'
        }}>
          <button 
            onClick={refreshQuestions}
            style={{
              backgroundColor: 'transparent',
              color: '#0891b2',
              border: '1px solid #0891b2',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🔄</span> Làm mới
          </button>
        </div>
      )}
      
      {!loading && questions.length === 0 && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '2rem', 
          borderRadius: '8px', 
          textAlign: 'center'
        }}>
          <p>Bạn chưa có câu hỏi nào. Hãy đặt câu hỏi để nhận tư vấn.</p>          <button
            style={{
              backgroundColor: '#0891b2',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '1rem'
            }}
            onClick={() => window.location.href = "/ask-question"}
          >
            Đặt câu hỏi
          </button>
        </div>
      )}
      
      {questions.map((question) => {
        // Map status cho hiển thị
        const isAnswered = question.status === 'resolved';
        const statusLabel = isAnswered ? 'Đã trả lời' : 'Đang chờ';
        const statusBg = isAnswered ? '#e8f5e9' : '#fff8e1';
        const statusColor = isAnswered ? '#43a047' : '#ff8f00';
        return (
          <div 
            key={question.id || question.questionID}
            style={{
              padding: '1.5rem',
              marginBottom: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem' 
            }}>
              <h3 style={{ margin: '0', fontSize: '1.2rem', color: '#333' }}>
                {question.title || 'Câu hỏi của bạn'}
              </h3>
              <div style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                backgroundColor: statusBg,
                color: statusColor
              }}>
                {statusLabel}
              </div>
            </div>
            
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '8px',
              marginBottom: isAnswered ? '1rem' : '0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '0.75rem' 
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: '#e1f5fe', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '0.75rem'
                }}>
                  👤
                </div>
                <div>
                  <p style={{ margin: '0', fontWeight: 'bold' }}>Bạn</p>
                  <span style={{ fontSize: '0.75rem', color: '#757575' }}>
                    {formatDate(question.date || question.createdAt)}
                  </span>
                </div>
              </div>
              <p style={{ margin: '0' }}>{question.content || question.question}</p>
            </div>
            {isAnswered && (
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#e1f5fe', 
                borderRadius: '8px',
                marginTop: '1rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '0.75rem' 
                }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    backgroundColor: '#e8f5e9', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '0.75rem'
                  }}>
                    👩‍⚕️
                  </div>
                  <div>
                    <p style={{ margin: '0', fontWeight: 'bold', color: '#0891b2' }}>
                      Tư vấn viên
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#757575' }}>
                      {question.answeredAt || question.replyDate ? 
                        formatDate(question.answeredAt || question.replyDate) : 
                        "Đã trả lời"}
                    </span>
                  </div>
                </div>
                {question.reply || question.answer ? (
                  <p style={{ margin: '0' }}>{question.reply || question.answer}</p>
                ) : (
                  <p style={{ margin: '0', fontStyle: 'italic', color: '#666' }}>
                    Câu hỏi đã được trả lời nhưng không thể hiển thị nội dung. Vui lòng làm mới trang.
                  </p>
                )}
                
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <button style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #0891b2',
                    color: '#0891b2',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                  onClick={() => window.location.href = "/ask-question"}
                  >
                    Gửi câu hỏi bổ sung
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserQuestions;