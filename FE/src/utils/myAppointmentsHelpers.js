import React from 'react';
import VideoCall from '../components/VideoCall';

// Các hàm tiện ích cho component MyAppointments

// Xác thực và quản lý người dùng
export const checkUserAuthentication = (navigate) => {
  const userJson = localStorage.getItem('loggedInUser');
  if (!userJson) {
    navigate('/login', { state: { from: '/my-appointments' } });
    return null;
  }
  
  try {
    // Xác nhận là user object hợp lệ
    const user = JSON.parse(userJson);
    if (!user.userID) { // Sử dụng user.userID theo Users entity
      navigate('/login', { state: { from: '/my-appointments' } });
      return null;
    }
    return user;
  } catch (err) {
    navigate('/login', { state: { from: '/my-appointments' } });
    return null;
  }
};

export const getUserFromStorage = () => {
  const userJson = localStorage.getItem('loggedInUser');
  if (!userJson) return null;
  
  try {
    const user = JSON.parse(userJson);
    return user?.userID ? user : null;
  } catch (err) {
    return null;
  }
};

// Các hàm gọi API
export const fetchAppointments = async (setLoading, setAppointments, setConsultantNames, setError) => {
  try {
    setLoading(true);
    const user = getUserFromStorage();
    const userId = user?.userID;
    
    if (!userId) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }
    
    // Lấy danh sách booking của user - sử dụng endpoint consultations
    const response = await fetch(`http://localhost:8080/api/bookings/user/${userId}/consultations`);
    if (!response.ok) {
      throw new Error('Lỗi khi lấy danh sách lịch hẹn');
    }
    
    const data = await response.json();
    console.log(`🔄 [MyAppointments] Làm mới dữ liệu: ${data.length} lịch hẹn`);
    setAppointments(data);
    
    // Lấy thông tin tư vấn viên
    await fetchConsultantNames(data, setConsultantNames);
    setLoading(false);
  } catch (err) {
    setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau: ' + err.message);
    setLoading(false);
  }
};

export const fetchConsultantNames = async (appointments, setConsultantNames) => {
  // Lấy danh sách ID tư vấn viên duy nhất
  const consultantIds = [...new Set(appointments.map(item => item.consultantId).filter(Boolean))];
  
  // Gọi API lấy thông tin tư vấn viên cho từng consultantId
  const namesObj = {};
  await Promise.all(
    consultantIds.map(async (id) => {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${id}`);
        if (res.ok) {
          const consultantData = await res.json();
          // Sử dụng fullName từ entity Users
          namesObj[id] = consultantData.fullName || `Tư vấn viên #${id}`;
        } else {
          namesObj[id] = `Tư vấn viên #${id}`;
        }
      } catch {
        namesObj[id] = `Tư vấn viên #${id}`;
      }
    })
  );
  setConsultantNames(namesObj);
};

// Lọc và xử lý dữ liệu
export const getFilteredAppointments = (appointments, filterStatus) => {
  // Lọc chỉ các lịch đã thanh toán thành công (paymentStatus === 'PAID')
  return appointments.filter(app => {
    if (filterStatus === 'all') return app.payment?.status === 'PAID';
    return app.status === filterStatus && app.payment?.status === 'PAID';
  });
};

// Định dạng trạng thái và styling
export const formatStatus = (status) => {
  switch (status) {
    case 'Chờ bắt đầu':
      return 'Chờ bắt đầu';
    case 'Đang diễn ra':
      return 'Đang diễn ra';
    case 'Đã kết thúc':
      return 'Đã kết thúc';
    default:
      return status || 'Không xác định';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Chờ bắt đầu':
      return '#fde68a'; // vàng nhạt
    case 'Đang diễn ra':
      return '#22d3ee'; // xanh cyan
    case 'Đã kết thúc':
      return '#cbd5e1'; // xám nhạt
    default:
      return '#757575';
  }
};

// Các hàm xử lý sự kiện
export const handleFilterChange = (e, setFilterStatus) => {
  setFilterStatus(e.target.value);
};

export const handleJoinVideoCall = (app, setActiveBookingId, setVideoChannel, setShowVideoCall) => {
  const bookingId = app.bookingId;
  const channelName = bookingId ? `booking_${bookingId}` : null;
  if (!channelName) {
    alert("Không thể tham gia cuộc gọi do thiếu thông tin đặt lịch!");
    return;
  }
  setActiveBookingId(bookingId);
  setVideoChannel(channelName);
  setShowVideoCall(true);
};

export const handleShowDetailModal = (app, consultantNames, setDetailData, setShowDetailModal) => {
  setDetailData({
    consultant: consultantNames[app.consultantId] || 'N/A',
    content: app.content || 'Không có',
    date: app.appointmentDate || 'N/A',
    startTime: app.startTime || 'N/A',
    endTime: app.endTime || 'N/A',
    status: app.status
  });
  setShowDetailModal(true);
};

export const handleVideoCallLeave = (setShowVideoCall, setVideoChannel, activeBookingId, setActiveBookingId) => {
  console.log(`🔄 [MyAppointments] Cuộc gọi kết thúc`);
  setShowVideoCall(false);
  setVideoChannel(null);
  
  // Xóa ID lịch hẹn đang hoạt động
  if (activeBookingId) {
    setActiveBookingId(null);
  }
};

// Data constants
export const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Chờ bắt đầu', label: 'Chờ bắt đầu' },
  { value: 'Đang diễn ra', label: 'Đang diễn ra' },
  { value: 'Đã kết thúc', label: 'Đã kết thúc' }
];

// Utility functions
export const getConsultantDisplayName = (consultantId, consultantNames) => {
  return consultantNames[consultantId] || 'Đang tải...';
};

export const getConsultantInitial = (consultantId, consultantNames) => {
  return (consultantNames[consultantId] || '?').charAt(0).toUpperCase();
};

export const shouldShowJoinButton = (status) => {
  return status === 'Đang diễn ra';
};

export const shouldShowWaitingMessage = (status) => {
  return status === 'Chờ bắt đầu';
};

export const shouldShowDetailButton = (status) => {
  return status === 'Đã kết thúc';
};

// Video call rendering
export const renderVideoCall = (videoChannel, onLeave) => {
  return React.createElement(VideoCall, {
    channelName: videoChannel,
    onLeave: onLeave,
    userRole: "audience"
  });
};

// Modal rendering
export const renderDetailModal = (detailData, setShowDetailModal) => {
  return React.createElement('div', {
    style: {
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
    }
  }, React.createElement('div', {
    style: {
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
    }
  }, [
    React.createElement('button', {
      key: 'close-btn',
      onClick: () => setShowDetailModal(false),
      style: {
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
      }
    }, '×'),
    React.createElement('h3', {
      key: 'title',
      style: {
        margin: '0 0 24px 0',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1e293b',
        paddingRight: '50px'
      }
    }, 'Chi tiết cuộc hẹn'),
    React.createElement('div', {
      key: 'content',
      style: { display: 'flex', flexDirection: 'column', gap: '16px' }
    }, [
      React.createElement('div', {
        key: 'consultant',
        style: {
          display: 'flex',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }
      }, [
        React.createElement('span', {
          key: 'label',
          style: {
            fontWeight: '600',
            color: '#475569',
            minWidth: '120px',
            fontSize: '15px'
          }
        }, 'Bác sĩ:'),
        React.createElement('span', {
          key: 'value',
          style: {
            color: '#1e293b',
            fontSize: '15px',
            fontWeight: '500'
          }
        }, detailData.consultant)
      ]),
      React.createElement('div', {
        key: 'date',
        style: {
          display: 'flex',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }
      }, [
        React.createElement('span', {
          key: 'label',
          style: {
            fontWeight: '600',
            color: '#475569',
            minWidth: '120px',
            fontSize: '15px'
          }
        }, 'Ngày hẹn:'),
        React.createElement('span', {
          key: 'value',
          style: {
            color: '#1e293b',
            fontSize: '15px'
          }
        }, detailData.date)
      ]),
      React.createElement('div', {
        key: 'time',
        style: {
          display: 'flex',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }
      }, [
        React.createElement('span', {
          key: 'label',
          style: {
            fontWeight: '600',
            color: '#475569',
            minWidth: '120px',
            fontSize: '15px'
          }
        }, 'Thời gian:'),
        React.createElement('span', {
          key: 'value',
          style: {
            color: '#1e293b',
            fontSize: '15px'
          }
        }, `${detailData.startTime} - ${detailData.endTime}`)
      ]),
      React.createElement('div', {
        key: 'status',
        style: {
          display: 'flex',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }
      }, [
        React.createElement('span', {
          key: 'label',
          style: {
            fontWeight: '600',
            color: '#475569',
            minWidth: '120px',
            fontSize: '15px'
          }
        }, 'Trạng thái:'),
        React.createElement('span', {
          key: 'value',
          style: {
            color: detailData.status === 'Đã kết thúc' ? '#059669' : '#dc2626',
            fontSize: '15px',
            fontWeight: '500'
          }
        }, detailData.status)
      ]),
      React.createElement('div', {
        key: 'content-detail',
        style: {
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }
      }, [
        React.createElement('span', {
          key: 'label',
          style: {
            fontWeight: '600',
            color: '#475569',
            fontSize: '15px',
            display: 'block',
            marginBottom: '8px'
          }
        }, 'Nội dung tư vấn:'),
        React.createElement('div', {
          key: 'value',
          style: {
            color: '#1e293b',
            fontSize: '15px',
            lineHeight: '1.6',
            maxHeight: '150px',
            overflowY: 'auto',
            padding: '8px 0'
          }
        }, detailData.content)
      ])
    ]),
    React.createElement('div', {
      key: 'footer',
      style: {
        marginTop: '24px',
        display: 'flex',
        justifyContent: 'flex-end'
      }
    }, React.createElement('button', {
      onClick: () => setShowDetailModal(false),
      style: {
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
      }
    }, 'Đóng'))
  ]));
};
