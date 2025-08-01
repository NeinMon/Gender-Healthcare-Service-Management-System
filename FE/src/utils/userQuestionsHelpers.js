// Utility functions for UserQuestions component

// User management
export const getUserInfo = () => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const userId = localStorage.getItem('userId') || loggedInUser.userID || loggedInUser.id;
  return { loggedInUser, userId };
};

// API calls
export const fetchConsultantInfo = async (consultantId) => {
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

export const fetchUserQuestions = async (
  setLoading,
  setQuestions,
  setConsultantNames,
  setError
) => {
  try {
    setLoading(true);
    const { userId } = getUserInfo();
    
    if (!userId) {
      throw new Error('Không tìm thấy ID người dùng');
    }
    
    console.log('Đang gọi API với userId:', userId);
    const response = await fetch(`http://localhost:8080/api/questions/user/${userId}`);
    
    // Log response status để debug
    console.log('API response status:', response.status);
    
    // Xử lý đặc biệt cho trường hợp 404 (không có dữ liệu)
    if (response.status === 404) {
      console.log('Không tìm thấy câu hỏi nào cho user này (404)');
      setQuestions([]);
      setConsultantNames({});
      setError(null); // Không hiển thị lỗi cho trường hợp này
      return;
    }
    
    if (!response.ok) {
      throw new Error(`Không thể tải danh sách câu hỏi. Status: ${response.status}`);
    }
    
    const questions = await response.json();
    console.log('Dữ liệu câu hỏi của người dùng:', questions);
    
    // Kiểm tra nếu không có dữ liệu hoặc mảng rỗng
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.log('Không có câu hỏi nào từ backend');
      setQuestions([]);
      setConsultantNames({});
      setError(null); // Không hiển thị lỗi cho trường hợp này
      return;
    }
    
    // Tạo danh sách câu hỏi với câu trả lời (nếu có)
    const questionsWithAnswers = await Promise.all(
      questions.map(async (question) => {
        // Kiểm tra question có tồn tại không
        if (!question) {
          return null;
        }
        
        // Format dữ liệu câu hỏi với fallback values
        const formattedQuestion = {
          id: question?.id || question?.questionID || Math.random(),
          questionID: question?.id || question?.questionID || Math.random(),
          content: question?.content || question?.question || 'Không có nội dung',
          date: question?.date || question?.createdAt || new Date().toISOString(),
          status: question?.status || 'pending',
          createdAt: question?.createdAt || question?.date || new Date().toISOString(),
          title: question?.title || 'Câu hỏi tư vấn',
        };

        // Map status từ backend sang frontend
        let isResolved = formattedQuestion.status === 'resolved';
        // Nếu câu hỏi đã được giải quyết thì lấy câu trả lời
        if (isResolved && (question?.id || question?.questionID)) {
          try {
            const answerResponse = await fetch(`http://localhost:8080/api/answers/${question.id || question.questionID}`);
            if (answerResponse.ok) {
              const answerData = await answerResponse.json();
              if (answerData) {
                formattedQuestion.reply = answerData.content || 'Đã có phản hồi';
                formattedQuestion.answeredAt = answerData.createdAt || new Date().toISOString();
                formattedQuestion.status = 'resolved';
                formattedQuestion.consultantID = answerData.consultantID;
              }
            }
          } catch (error) {
            console.error('Lỗi khi lấy câu trả lời cho câu hỏi:', question?.id || question?.questionID, error);
          }
        }
        return formattedQuestion;
      })
    );
    
    // Lọc bỏ các câu hỏi null
    const validQuestions = questionsWithAnswers.filter(q => q !== null);
    console.log('Dữ liệu đã xử lý với câu trả lời:', validQuestions);
    setQuestions(validQuestions);
    
    // Lấy danh sách consultantId duy nhất từ những câu hỏi đã được trả lời
    const consultantIds = [...new Set(
      validQuestions
        .filter(q => q && q.consultantID)
        .map(q => q.consultantID)
    )];
    
    // Fetch thông tin tư vấn viên cho từng consultantId nếu có
    const namesObj = {};
    if (consultantIds.length > 0) {
      await Promise.all(
        consultantIds.map(async (id) => {
          try {
            const name = await fetchConsultantInfo(id);
            namesObj[id] = name;
          } catch (error) {
            console.error('Lỗi khi fetch thông tin tư vấn viên:', id, error);
            namesObj[id] = `Tư vấn viên #${id}`;
          }
        })
      );
    }
    setConsultantNames(namesObj);
  } catch (error) {
    console.error('Lỗi khi tải câu hỏi:', error);
    
    // Chỉ hiển thị lỗi cho những trường hợp thật sự có vấn đề
    // Không hiển thị lỗi cho 404 hoặc database trống
    if (error.message.includes('Status: 404')) {
      setError(null);
      setQuestions([]);
    } else {
      setError(error.message);
      setQuestions([]);
    }
    
    setConsultantNames({});
  } finally {
    setLoading(false);
  }
};

// Data formatting helpers
export const formatStatus = (status) => {
  switch (status) {
    case 'resolved':
      return 'Đã trả lời';
    case 'pending':
      return 'Đang chờ';
    default:
      return status || 'Không xác định';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'resolved':
      return '#4caf50';
    case 'pending':
      return '#ff9800';
    default:
      return '#757575';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return "Không có thông tin";
  
  try {
    const formattedDate = new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Loại bỏ từ "lúc" trong chuỗi ngày tháng
    return formattedDate.replace('lúc ', '');
  } catch (e) {
    console.error('Lỗi khi format ngày:', e);
    return "Định dạng ngày không hợp lệ";
  }
};

// Filtering helpers
export const getFilteredQuestions = (questions, filterStatus) => {
  return (questions || []).filter(question => {
    if (!question) return false;
    if (filterStatus === 'all') return true;
    
    // Map the backend status to our filter status
    if (filterStatus === 'Đã trả lời' && question?.status === 'resolved') return true;
    if (filterStatus === 'Đang chờ' && question?.status === 'pending') return true;
    
    return false;
  });
};

// Event handlers
export const handleFilterChange = (e, setFilterStatus) => {
  setFilterStatus(e.target.value);
};

export const handleOpenQuestionDetail = (question, setSelectedQuestion, setModalOpen) => {
  if (!question) {
    console.error('Không thể mở chi tiết: question không tồn tại');
    return;
  }
  setSelectedQuestion(question);
  setModalOpen(true);
};

export const handleCloseModal = (setModalOpen, setSelectedQuestion = null) => {
  return () => {
    setModalOpen(false);
    if (setSelectedQuestion) {
      setSelectedQuestion(null);
    }
  };
};

export const handleRefreshQuestions = (setError, fetchUserQuestions) => {
  setError(null);
  fetchUserQuestions();
};

export const handleNavigateToAskQuestion = () => {
  window.location.href = "/ask-question";
};

// Validation helpers
export const validateQuestion = (question) => {
  return question && (question.id || question.questionID);
};
