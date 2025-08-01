import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import {
  fetchConsultantInfo,
  fetchUserQuestions,
  formatStatus,
  getStatusColor,
  formatDate,
  getFilteredQuestions,
  handleFilterChange,
  handleOpenQuestionDetail,
  handleCloseModal,
  handleRefreshQuestions,
  handleNavigateToAskQuestion,
  validateQuestion
} from './utils/userQuestionsHelpers';

const UserQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consultantNames, setConsultantNames] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    const fetchData = async () => {
      await fetchUserQuestions(setLoading, setQuestions, setConsultantNames, setError);
    };
    fetchData();
  }, []);

  // Filter questions based on selected status - thêm safety check
  const filteredQuestions = getFilteredQuestions(questions, filterStatus);

  // Modal state for showing question details
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const openQuestionDetail = (question) => {
    handleOpenQuestionDetail(question, setSelectedQuestion, setModalOpen);
  };

  const refreshQuestions = () => {
    const fetchData = async () => {
      await fetchUserQuestions(setLoading, setQuestions, setConsultantNames, setError);
    };
    handleRefreshQuestions(setError, fetchData);
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
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        position: "relative",
        height: "160px"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
          padding: "0 24px",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          pointerEvents: "none"
        }}>
          <Link to="/" style={{ 
            display: "flex", 
            alignItems: "center", 
            pointerEvents: "auto" 
          }}>
            <img
              src="/Logo.png"
              alt="Logo"
              style={{ height: 85, width: 85, objectFit: "contain" }}
            />
          </Link>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            pointerEvents: "auto" 
          }}>
            <UserAvatar userName="Khách hàng" />
          </div>
        </div>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}>
          <h1 style={{
            color: "#fff",
            margin: 0,
            fontSize: "48px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            Câu hỏi của tôi
          </h1>
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
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            flexWrap: "wrap",
            gap: "12px"
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
                <option value="Đã trả lời">Đã trả lời</option>
                <option value="Đang chờ">Đang chờ</option>
              </select>
            </div>
            <Link 
              to="/" 
              style={{ 
                textDecoration: 'none', 
                color: '#0891b2', 
                fontWeight: 600, 
                fontSize: "15px", 
                border: '1px solid #22d3ee', 
                borderRadius: "8px", 
                padding: '10px 20px', 
                background: '#fff', 
                transition: 'all 0.2s', 
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f9ff"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fff"}
            >
              <span style={{ fontSize: "18px" }}>←</span> Quay lại trang chủ
            </Link>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: "0 12px",
            marginBottom: "12px"
          }}>
            <div>
              <h2 style={{ fontWeight: 600, color: '#0891b2', margin: 0 }}>Danh sách câu hỏi của bạn</h2>
            </div>
            <div>
              <button
                style={{
                  backgroundColor: '#0891b2',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  boxShadow: "0 2px 6px rgba(8,145,178,0.3)",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(8,145,178,0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(8,145,178,0.3)";
                }}
                onClick={handleNavigateToAskQuestion}
              >
                + Đặt câu hỏi mới
              </button>
            </div>
          </div>

          <div>
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
                <p style={{ color: '#0891b2', fontWeight: 600, fontSize: 16, margin: 0 }}>Đang tải dữ liệu...</p>
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
                <div style={{ marginBottom: "20px" }}>{error}</div>
                <button
                  style={{
                    backgroundColor: '#0891b2',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(8,145,178,0.3)'
                  }}
                  onClick={refreshQuestions}
                >
                  🔄 Thử lại
                </button>
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
                <div style={{ fontSize: "40px", marginBottom: "15px" }}>💬</div>
                <div>
                  {filterStatus === 'all' 
                    ? 'Bạn chưa có câu hỏi nào. Hãy đặt câu hỏi đầu tiên!'
                    : 'Không có câu hỏi nào phù hợp với bộ lọc.'
                  }
                </div>
                <button
                  style={{
                    backgroundColor: '#0891b2',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    marginTop: '20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(8,145,178,0.3)'
                  }}
                  onClick={handleNavigateToAskQuestion}
                >
                  📝 Đặt câu hỏi mới
                </button>
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
                        <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Tiêu đề</th>
                        <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Ngày tạo</th>
                        <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Trạng thái</th>
                        <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuestions.map((question) => {
                        // Safety check để đảm bảo question tồn tại
                        if (!question) return null;
                        
                        return (
                        <tr 
                          key={question.id || question.questionID || Math.random()} 
                          style={{ 
                            borderBottom: '1px solid #e0f2fe', 
                            transition: "all 0.2s"
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f9ff"}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <td style={{ padding: '16px 20px', fontWeight: 500, maxWidth: "300px", textAlign: "center" }}>
                            <div style={{ 
                              overflow: "hidden", 
                              textOverflow: "ellipsis", 
                              whiteSpace: "nowrap", 
                              maxWidth: "100%"
                            }}>
                              {question?.title || 'Câu hỏi tư vấn'}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: 500, textAlign: "center" }}>
                            {formatDate(question?.date || question?.createdAt)}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <span style={{ 
                                display: "inline-block",
                                padding: "6px 12px",
                                borderRadius: "20px",
                                fontWeight: 600,
                                fontSize: "13px",
                                color: "#fff",
                                backgroundColor: getStatusColor(question?.status)
                              }}>
                                {formatStatus(question?.status)}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: "center" }}>
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
                              onClick={() => openQuestionDetail(question)}
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "16px" }}>👁️</span> Xem chi tiết
                              </span>
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal cho xem chi tiết câu hỏi */}
      {modalOpen && selectedQuestion && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "90%",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflow: "auto",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ color: "#0891b2", margin: 0 }}>{selectedQuestion?.title || "Câu hỏi tư vấn"}</h2>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#64748b"
                }}
                onClick={handleCloseModal(setModalOpen, setSelectedQuestion)}
              >
                ×
              </button>
            </div>

            {/* Câu hỏi của người dùng */}
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px',
              marginBottom: selectedQuestion?.status === 'resolved' ? '1.5rem' : '0',
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
                    {formatDate(selectedQuestion?.date || selectedQuestion?.createdAt)}
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
                {selectedQuestion?.content || selectedQuestion?.question || 'Không có nội dung'}
              </div>
            </div>

            {/* Câu trả lời từ tư vấn viên */}
            {selectedQuestion?.status === 'resolved' && (
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
                      {consultantNames[selectedQuestion?.consultantID] || 'Tư vấn viên'}
                    </p>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      {formatDate(selectedQuestion?.answeredAt || selectedQuestion?.replyDate)}
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
                  {selectedQuestion?.reply || selectedQuestion?.answer || (
                    <p style={{ margin: '0', fontStyle: 'italic', color: '#94a3b8' }}>
                      Câu hỏi đã được trả lời nhưng không thể hiển thị nội dung. Vui lòng làm mới trang.
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Nút hành động cho câu hỏi chưa được trả lời */}
            {selectedQuestion?.status !== 'resolved' && (
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

            <div style={{ marginTop: "24px", textAlign: "right" }}>
              <button 
                style={{
                  backgroundColor: "#e2e8f0",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
                onClick={handleCloseModal(setModalOpen, setSelectedQuestion)}
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

export default UserQuestions;