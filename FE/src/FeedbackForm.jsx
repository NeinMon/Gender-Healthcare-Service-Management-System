import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const FeedbackForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [improvement, setImprovement] = useState('');
  const [bookFollowUp, setBookFollowUp] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Kiểm tra đăng nhập
    const userJson = localStorage.getItem('loggedInUser');
    if (!userJson) {
      navigate('/login');
      return;
    }

    fetchAppointmentDetails();
  }, [appointmentId, navigate]);

  // Lấy thông tin buổi tư vấn
  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      
      // Giả lập dữ liệu cho môi trường development
      // Trong môi trường production, thay thế bằng API call thực
      setTimeout(() => {
        const mockAppointment = {
          id: appointmentId,
          consultantId: 1,
          consultantName: 'TS. Nguyễn Văn A',
          consultantAvatar: '/Doctor.png',
          specialization: 'Tư vấn sức khỏe sinh sản',
          date: '2025-06-20',
          timeSlot: '10:00 - 11:00',
          consultationMethod: 'video',
          reason: 'Tư vấn về sức khỏe sinh sản',
          details: 'Cần tư vấn về vấn đề sức khỏe sinh sản và kế hoạch hóa gia đình',
          status: 'completed'
        };
        
        setAppointment(mockAppointment);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('Không thể tải thông tin buổi tư vấn. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Xử lý đánh giá sao
  const handleRatingChange = (value) => {
    setRating(value);
  };

  // Xử lý gửi đánh giá
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Dữ liệu đánh giá
      const feedbackData = {
        appointmentId,
        consultantId: appointment.consultantId,
        rating,
        comment,
        improvement,
        bookFollowUp
      };
      
      console.log('Feedback data:', feedbackData);
      
      // Giả lập gửi đánh giá thành công
      // Trong môi trường production, thay thế bằng API call thực
      setTimeout(() => {
        setIsSubmitted(true);
        setIsSubmitting(false);
      }, 1500);
      
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        backgroundColor: "#f0f9ff"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⌛</div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        backgroundColor: "#f0f9ff",
        padding: "20px"
      }}>
        <div style={{ 
          backgroundColor: "white", 
          padding: "30px", 
          borderRadius: "16px",
          textAlign: "center",
          maxWidth: "600px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ color: "#dc2626", marginBottom: "16px" }}>
            {error || 'Không thể tải thông tin buổi tư vấn'}
          </h2>
          <p style={{ marginBottom: "24px", color: "#475569" }}>
            Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề tiếp tục xảy ra.
          </p>
          <button
            onClick={() => navigate('/my-appointments')}
            style={{
              backgroundColor: "#0891b2",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            Quay lại lịch hẹn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: "#f0f9ff", 
      minHeight: "100vh", 
      padding: "0"
    }}>
      {/* Header */}
      <header style={{
        background: "#19bdd4",
        width: "100%",
        padding: "22px 0",
        margin: 0,
        border: "none",
        position: "relative",
        minHeight: 90,
        boxShadow: "0 4px 20px rgba(8,145,178,0.15)"
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          margin: 0,
          padding: 0,
          position: "relative"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            zIndex: 1
          }}>
            <img
              src="/Logo.png"
              alt="Logo"
              style={{ 
                height: 48, 
                width: 48, 
                objectFit: "contain", 
                marginRight: 15
              }}
            />
            <h1
              style={{
                color: "#fff",
                margin: 0,
                fontWeight: 800,
                letterSpacing: 0.5,
                fontSize: 30,
                lineHeight: 1.1,
                fontFamily: 'Montserrat, Arial, sans-serif',
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              Đánh giá buổi tư vấn
            </h1>
          </div>
        </div>
        <div style={{ 
          position: "absolute", 
          top: 20, 
          right: 24,
          zIndex: 10
        }}>
          <UserAvatar userName="Người dùng" />
        </div>
      </header>

      {/* Main content */}
      <div style={{ 
        padding: "40px 20px", 
        maxWidth: "800px", 
        margin: "0 auto" 
      }}>
        <div style={{ marginBottom: "20px" }}>
          <Link 
            to="/my-appointments" 
            style={{
              display: "flex",
              alignItems: "center",
              color: "#0891b2",
              textDecoration: "none",
              fontWeight: 500
            }}
          >
            ← Quay lại danh sách lịch hẹn
          </Link>
        </div>

        {isSubmitted ? (
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "16px",
            padding: "40px 20px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(8,145,178,0.1)"
          }}>
            <div style={{ 
              fontSize: "64px", 
              marginBottom: "20px",
              color: "#0891b2"
            }}>
              ✅
            </div>
            <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
              Cảm ơn bạn đã gửi đánh giá!
            </h2>
            <p style={{ 
              fontSize: "16px", 
              color: "#7f8c8d", 
              marginBottom: "30px",
              maxWidth: "600px",
              margin: "0 auto 30px auto"
            }}>
              Phản hồi của bạn rất quan trọng với chúng tôi để cải thiện chất lượng dịch vụ. 
              {bookFollowUp && ' Chúng tôi đã ghi nhận yêu cầu đặt lịch tái tư vấn của bạn và sẽ liên hệ sớm.'}
            </p>
            <div>
              <Link 
                to="/my-appointments"
                style={{
                  display: "inline-block",
                  backgroundColor: "#0891b2",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "500",
                  marginRight: "16px"
                }}
              >
                Xem lịch hẹn của tôi
              </Link>
              <Link 
                to="/services"
                style={{
                  display: "inline-block",
                  backgroundColor: "white",
                  border: "1px solid #0891b2",
                  color: "#0891b2",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "500"
                }}
              >
                Khám phá dịch vụ khác
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(8,145,178,0.1)"
          }}>
            {/* Thông tin buổi tư vấn */}
            <div style={{ 
              backgroundColor: "#f8fafc", 
              padding: "20px",
              borderBottom: "1px solid #e2e8f0"
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  marginRight: "16px"
                }}>
                  <img 
                    src={appointment.consultantAvatar}
                    alt={appointment.consultantName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <h2 style={{ margin: "0 0 8px 0", color: "#0891b2" }}>
                    {appointment.consultantName}
                  </h2>
                  <p style={{ margin: 0, color: "#64748b" }}>
                    {appointment.specialization} • {new Date(appointment.date).toLocaleDateString('vi-VN')} • {appointment.timeSlot}
                  </p>
                </div>
              </div>
            </div>

            {/* Form đánh giá */}
            <form onSubmit={handleSubmit} style={{ padding: "30px" }}>
              {/* Đánh giá sao */}
              <div style={{ marginBottom: "30px", textAlign: "center" }}>
                <h3 style={{ 
                  margin: "0 0 12px 0", 
                  color: "#334155",
                  fontWeight: "600" 
                }}>
                  Bạn đánh giá buổi tư vấn như thế nào?
                </h3>
                
                <div style={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  gap: "8px"
                }}>
                  {[...Array(5)].map((_, i) => {
                    const ratingValue = i + 1;
                    
                    return (
                      <label 
                        key={i}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      >
                        <input
                          type="radio"
                          name="rating"
                          value={ratingValue}
                          onClick={() => handleRatingChange(ratingValue)}
                          style={{ display: "none" }}
                        />
                        <span
                          style={{ 
                            color: ratingValue <= (hover || rating) ? "#facc15" : "#e2e8f0",
                            fontSize: "42px",
                            transition: "color 0.2s"
                          }}
                        >
                          ★
                        </span>
                      </label>
                    );
                  })}
                </div>
                
                <p style={{ 
                  margin: "12px 0 0 0", 
                  color: "#64748b",
                  fontSize: "14px" 
                }}>
                  {rating === 1 && "Không hài lòng"}
                  {rating === 2 && "Chưa tốt"}
                  {rating === 3 && "Tạm được"}
                  {rating === 4 && "Hài lòng"}
                  {rating === 5 && "Rất hài lòng"}
                </p>
              </div>
              
              {/* Nhận xét chi tiết */}
              <div style={{ marginBottom: "24px" }}>
                <label 
                  htmlFor="comment" 
                  style={{ 
                    display: "block", 
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "#334155"
                  }}
                >
                  Nhận xét của bạn về buổi tư vấn:
                </label>
                <textarea 
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về buổi tư vấn..."
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "16px",
                    boxSizing: "border-box"
                  }}
                ></textarea>
              </div>
              
              {/* Đề xuất cải thiện */}
              <div style={{ marginBottom: "24px" }}>
                <label 
                  htmlFor="improvement" 
                  style={{ 
                    display: "block", 
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "#334155"
                  }}
                >
                  Đề xuất cải thiện (nếu có):
                </label>
                <textarea 
                  id="improvement"
                  value={improvement}
                  onChange={(e) => setImprovement(e.target.value)}
                  placeholder="Bạn có đề xuất gì để chúng tôi cải thiện dịch vụ?"
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "16px",
                    boxSizing: "border-box"
                  }}
                ></textarea>
              </div>
              
              {/* Đặt lịch tái tư vấn */}
              <div style={{ marginBottom: "30px" }}>
                <label style={{ 
                  display: "flex", 
                  alignItems: "center",
                  cursor: "pointer"
                }}>
                  <input
                    type="checkbox"
                    checked={bookFollowUp}
                    onChange={(e) => setBookFollowUp(e.target.checked)}
                    style={{ marginRight: "10px" }}
                  />
                  <span style={{ color: "#334155", fontWeight: "500" }}>
                    Tôi muốn đặt lịch tái tư vấn với {appointment.consultantName}
                  </span>
                </label>
              </div>
              
              {/* Submit button */}
              <div style={{ 
                display: "flex", 
                justifyContent: "center",
                marginTop: "20px" 
              }}>
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  style={{
                    backgroundColor: rating > 0 ? "#0891b2" : "#e2e8f0",
                    color: rating > 0 ? "white" : "#94a3b8",
                    border: "none",
                    padding: "14px 28px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "16px",
                    cursor: rating > 0 ? "pointer" : "not-allowed",
                    transition: "all 0.2s ease",
                    minWidth: "200px"
                  }}
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
