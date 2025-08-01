import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import VideoCall from './components/VideoCall';
import {
  checkUserAuthentication,
  fetchAppointments,
  getFilteredAppointments,
  formatStatus,
  getStatusColor,
  handleFilterChange,
  handleJoinVideoCall,
  handleShowDetailModal,
  handleVideoCallLeave,
  statusOptions,
  getConsultantDisplayName,
  getConsultantInitial,
  shouldShowJoinButton,
  shouldShowWaitingMessage,
  shouldShowDetailButton
} from './utils/myAppointmentsHelpers';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Đúng mapping status backend: 'Chờ bắt đầu', 'Đang diễn ra', 'Đã kết thúc'
  const [filterStatus, setFilterStatus] = useState('all');
  const [consultantNames, setConsultantNames] = useState({});
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoChannel, setVideoChannel] = useState(null);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  
  useEffect(() => {
    // Kiểm tra login và tải danh sách lịch hẹn
    const user = checkUserAuthentication(navigate);
    if (user) {
      fetchAppointments(setLoading, setAppointments, setConsultantNames, setError);
    }
  }, [navigate]);
  
  // Lọc chỉ các lịch đã thanh toán thành công
  const filteredAppointments = getFilteredAppointments(appointments, filterStatus);
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
          onLeave={() => handleVideoCallLeave(setShowVideoCall, setVideoChannel, activeBookingId, setActiveBookingId)}
          userRole="audience"
        />
      )}
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
            Lịch hẹn của tôi
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
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
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
              <div>{error}</div>
            </div>
          ) : filteredAppointments.length === 0 ? (
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
              <div>Không có lịch hẹn nào.</div>
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
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Tư vấn viên</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Nội dung</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Ngày đặt lịch</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Giờ bắt đầu</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Trạng thái</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((app, idx) => {
                      const consultantId = app.consultantId;
                      return (
                        <tr 
                          key={app.bookingId || idx} 
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
                                {getConsultantInitial(consultantId, consultantNames)}
                              </div>
                              <span style={{ 
                                fontWeight: 600, 
                                color: '#0891b2' 
                              }}>
                                {getConsultantDisplayName(consultantId, consultantNames)}
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
                              {app.content || 'Không có nội dung'}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: 500, textAlign: "center" }}>
                            {app.appointmentDate || 'N/A'}
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: 500, textAlign: "center" }}>
                            {app.startTime || 'N/A'}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <span style={{
                                display: "inline-block",
                                padding: "6px 12px",
                                borderRadius: "20px",
                                fontWeight: 600,
                                fontSize: "13px",
                                color: app.status === 'Đang diễn ra' ? '#fff' : (app.status === 'Chờ bắt đầu' ? '#b45309' : '#64748b'),
                                backgroundColor: getStatusColor(app.status)
                              }}>
                                {formatStatus(app.status)}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: "center" }}>
                            {shouldShowJoinButton(app.status) && (
                              <button
                                style={{
                                  background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: "8px",
                                  padding: '10px 16px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontSize: "15px",
                                  boxShadow: "0 2px 8px rgba(34,211,238,0.25)",
                                  outline: 'none',
                                  opacity: 1,
                                  filter: 'none',
                                  transition: "all 0.2s"
                                }}
                                onMouseOver={e => {
                                  e.currentTarget.style.background = 'linear-gradient(90deg, #0891b2 0%, #06b6d4 100%)';
                                  e.currentTarget.style.transform = "scale(1.04)";
                                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(34,211,238,0.35)";
                                }}
                                onMouseOut={e => {
                                  e.currentTarget.style.background = 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)';
                                  e.currentTarget.style.transform = "scale(1)";
                                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(34,211,238,0.25)";
                                }}
                                onClick={() => handleJoinVideoCall(app, setActiveBookingId, setVideoChannel, setShowVideoCall)}
                              >
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ fontSize: "16px" }}>🎥</span> Tham gia tư vấn
                                </span>
                              </button>
                            )}
                            {shouldShowWaitingMessage(app.status) && (
                              <span style={{ color: "#b45309", fontSize: "14px", fontWeight: "500" }}>
                                Chưa đến giờ hẹn
                              </span>
                            )}
                            {shouldShowDetailButton(app.status) && (
                              <>
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
                                  onClick={() => handleShowDetailModal(app, consultantNames, setDetailData, setShowDetailModal)}
                                >
                                  Xem chi tiết cuộc gọi
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Modal chi tiết */}
          {showDetailModal && detailData && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1001,
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                backgroundColor: '#fff',
                padding: '32px',
                borderRadius: '16px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                position: 'relative'
              }}>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    cursor: 'pointer',
                    color: '#64748b',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.2s'
                  }}
                >
                  ×
                </button>

                <h3 style={{
                  margin: '0 0 24px 0',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  paddingRight: '50px'
                }}>
                  Chi tiết cuộc hẹn
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{
                      fontWeight: '600',
                      color: '#475569',
                      minWidth: '120px',
                      fontSize: '15px'
                    }}>
                      Bác sĩ:
                    </span>
                    <span style={{
                      color: '#1e293b',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}>
                      {detailData.consultant}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{
                      fontWeight: '600',
                      color: '#475569',
                      minWidth: '120px',
                      fontSize: '15px'
                    }}>
                      Ngày hẹn:
                    </span>
                    <span style={{
                      color: '#1e293b',
                      fontSize: '15px'
                    }}>
                      {detailData.date}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{
                      fontWeight: '600',
                      color: '#475569',
                      minWidth: '120px',
                      fontSize: '15px'
                    }}>
                      Thời gian:
                    </span>
                    <span style={{
                      color: '#1e293b',
                      fontSize: '15px'
                    }}>
                      {detailData.startTime} - {detailData.endTime}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{
                      fontWeight: '600',
                      color: '#475569',
                      minWidth: '120px',
                      fontSize: '15px'
                    }}>
                      Trạng thái:
                    </span>
                    <span style={{
                      color: detailData.status === 'Đã kết thúc' ? '#059669' : '#dc2626',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}>
                      {detailData.status}
                    </span>
                  </div>

                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{
                      fontWeight: '600',
                      color: '#475569',
                      fontSize: '15px',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Nội dung tư vấn:
                    </span>
                    <div style={{
                      color: '#1e293b',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      maxHeight: '150px',
                      overflowY: 'auto',
                      padding: '8px 0'
                    }}>
                      {detailData.content}
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '24px',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    style={{
                      background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '15px',
                      boxShadow: '0 2px 8px rgba(34,211,238,0.25)',
                      transition: 'all 0.2s'
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Modal hủy lịch hẹn đã được ẩn */}
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
    </div>
  );
};

export default MyAppointments;