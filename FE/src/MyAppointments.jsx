import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Kiểm tra đăng nhập và lấy thông tin người dùng
  useEffect(() => {
    const userJson = localStorage.getItem('loggedInUser');
    if (!userJson) {
      navigate('/login', { state: { from: '/my-appointments' } });
      return;
    }

    fetchAppointments();
  }, [navigate]);

  // Lấy danh sách lịch hẹn từ API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const userJson = localStorage.getItem('loggedInUser');
      const user = JSON.parse(userJson);
      
      // Gọi API để lấy danh sách lịch hẹn
      // Trong môi trường development, sử dụng dữ liệu mẫu
      // Trong môi trường production, thay thế bằng API thực
      
      // Giả lập dữ liệu lịch hẹn để phát triển UI
      setTimeout(() => {
        const mockAppointments = [
          {
            id: 'AP001',
            consultantId: 1,
            consultantName: 'TS. Nguyễn Văn A',
            consultantAvatar: '/Doctor.png',
            specialization: 'Tư vấn sức khỏe sinh sản',
            date: '2025-06-25',
            timeSlot: '10:00 - 11:00',
            consultationMethod: 'video',
            reason: 'Tư vấn về sức khỏe sinh sản',
            details: 'Cần tư vấn về vấn đề sức khỏe sinh sản và kế hoạch hóa gia đình',
            status: 'confirmed',
            createdAt: '2025-06-15T08:30:00'
          },
          {
            id: 'AP002',
            consultantId: 2,
            consultantName: 'ThS. Trần Thị B',
            consultantAvatar: '/Doctor2.jpg',
            specialization: 'Tư vấn tâm lý giới tính',
            date: '2025-06-28',
            timeSlot: '14:00 - 15:00',
            consultationMethod: 'audio',
            reason: 'Tư vấn về vấn đề tâm lý',
            details: 'Cần tư vấn về các vấn đề tâm lý liên quan đến giới tính',
            status: 'pending',
            createdAt: '2025-06-17T14:20:00'
          },
          {
            id: 'AP003',
            consultantId: 3,
            consultantName: 'BS. Lê Văn C',
            consultantAvatar: '/docter3.jpg',
            specialization: 'Tư vấn sức khỏe sinh sản',
            date: '2025-06-20',
            timeSlot: '09:00 - 10:00',
            consultationMethod: 'chat',
            reason: 'Tư vấn về bệnh phụ khoa',
            details: 'Cần tư vấn về một số triệu chứng bệnh phụ khoa',
            status: 'completed',
            createdAt: '2025-06-10T11:15:00'
          },
          {
            id: 'AP004',
            consultantId: 1,
            consultantName: 'TS. Nguyễn Văn A',
            consultantAvatar: '/Doctor.png',
            specialization: 'Tư vấn sức khỏe sinh sản',
            date: '2025-06-15',
            timeSlot: '15:30 - 16:30',
            consultationMethod: 'video',
            reason: 'Tư vấn kế hoạch hóa gia đình',
            details: 'Cần tư vấn về các phương pháp kế hoạch hóa gia đình phù hợp',
            status: 'cancelled',
            cancelReason: 'Có việc đột xuất không thể tham gia',
            createdAt: '2025-06-05T16:45:00'
          }
        ];
        
        setAppointments(mockAppointments);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Lọc danh sách lịch hẹn theo trạng thái
  const filteredAppointments = appointments.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  // Xử lý việc hủy lịch hẹn
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      // Gọi API để hủy lịch hẹn
      // Trong môi trường development, giả lập thành công
      // Trong môi trường production, thay thế bằng API thực
      
      // Cập nhật UI sau khi hủy lịch hẹn thành công
      setAppointments(appointments.map(app => 
        app.id === selectedAppointment.id 
          ? { ...app, status: 'cancelled', cancelReason } 
          : app
      ));
      
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelReason('');
      
    } catch (err) {
      alert('Có lỗi xảy ra khi hủy lịch hẹn. Vui lòng thử lại sau.');
    }
  };

  // Kiểm tra xem lịch hẹn có thể hủy hay không (24 giờ trước buổi hẹn)
  const canCancelAppointment = (appointment) => {
    if (appointment.status !== 'confirmed' && appointment.status !== 'pending') return false;
    
    const appointmentDate = new Date(`${appointment.date}T${appointment.timeSlot.split(' - ')[0]}`);
    const now = new Date();
    const diffHours = (appointmentDate - now) / (1000 * 60 * 60);
    
    return diffHours >= 24;
  };

  // Kiểm tra xem buổi tư vấn có thể tham gia ngay bây giờ không
  const canJoinNow = (appointment) => {
    if (appointment.status !== 'confirmed') return false;
    
    const appointmentDate = new Date(`${appointment.date}T${appointment.timeSlot.split(' - ')[0]}`);
    const endTime = new Date(`${appointment.date}T${appointment.timeSlot.split(' - ')[1]}`);
    const now = new Date();
    
    // Cho phép tham gia trước 15 phút và trong suốt thời gian diễn ra
    const canJoinBefore = (appointmentDate - now) / (1000 * 60) <= 15;
    const notEnded = now < endTime;
    
    return canJoinBefore && notEnded;
  };

  // Format trạng thái hiển thị
  const formatStatus = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Format phương thức tư vấn
  const formatMethod = (method) => {
    switch (method) {
      case 'video':
        return 'Video call';
      case 'audio':
        return 'Audio call';
      case 'chat':
        return 'Chat';
      default:
        return method;
    }
  };

  // Hiển thị màu sắc theo trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'completed':
        return '#2196f3';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  // Xử lý khi nhấp vào nút tham gia buổi tư vấn
  const handleJoinConsultation = (appointment) => {
    alert('Tham gia buổi tư vấn: ' + appointment.id);
  };

  // Xử lý khi nhấp vào nút đánh giá buổi tư vấn
  const handleRateConsultation = (appointment) => {
    navigate(`/feedback/${appointment.id}`);
  };

  // UI rendering
  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#fff', margin: 0, padding: 0 }}>
      {/* Header mới */}
      <div style={{ width: '100%', background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)', padding: '36px 0 24px 0', margin: 0 }}>
        <h2 style={{ textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 38, letterSpacing: 1, margin: 0 }}>Lịch hẹn của tôi</h2>
      </div>
      <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto', padding: '0 0 32px 0' }}>
        <div style={{ margin: '32px 0 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px' }}>
          <div>
            <label style={{ fontWeight: 600, color: '#0891b2' }}>Lọc theo trạng thái: </label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #22d3ee', outline: 'none', fontWeight: 600, color: '#0891b2', background: '#fff' }}>
              <option value="all">Tất cả</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <Link to="/services" style={{ textDecoration: 'none', color: '#22d3ee', fontWeight: 600, fontSize: 16, border: '1px solid #22d3ee', borderRadius: 8, padding: '8px 20px', background: '#fff', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(34,211,238,0.08)' }}>← Quay lại trang dịch vụ</Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <span style={{ color: '#0891b2', fontWeight: 600, fontSize: 18 }}>Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div style={{ color: '#f44336', textAlign: 'center', marginTop: 60, fontWeight: 600 }}>{error}</div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60, color: '#0891b2', fontWeight: 600 }}>Không có lịch hẹn nào.</div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto', padding: '0 32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead style={{ background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)' }}>
                <tr>
                  <th style={{ padding: 14, color: '#fff', fontWeight: 700 }}>Bác sĩ/Tư vấn viên</th>
                  <th style={{ color: '#fff', fontWeight: 700 }}>Chuyên môn</th>
                  <th style={{ color: '#fff', fontWeight: 700 }}>Ngày</th>
                  <th style={{ color: '#fff', fontWeight: 700 }}>Khung giờ</th>
                  <th style={{ color: '#fff', fontWeight: 700 }}>Phương thức</th>
                  <th style={{ color: '#fff', fontWeight: 700 }}>Trạng thái</th>
                  <th style={{ color: '#fff', fontWeight: 700 }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #e0f2fe', transition: 'background 0.2s' }}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
                      <img src={app.consultantAvatar} alt="avatar" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #22d3ee', background: '#e0f2fe' }} />
                      <span style={{ fontWeight: 600, color: '#0891b2' }}>{app.consultantName}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{app.specialization}</td>
                    <td style={{ fontWeight: 500 }}>{app.date}</td>
                    <td style={{ fontWeight: 500 }}>{app.timeSlot}</td>
                    <td style={{ fontWeight: 500 }}>{formatMethod(app.consultationMethod)}</td>
                    <td style={{ color: getStatusColor(app.status), fontWeight: 700 }}>{formatStatus(app.status)}</td>
                    <td>
                      <button style={{ marginRight: 8, background: '#22d3ee', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => { setSelectedAppointment(app); setShowDetails(true); }}>Chi tiết</button>
                      {app.status === 'confirmed' && canJoinNow(app) && (
                        <button style={{ marginRight: 8, background: '#0891b2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => handleJoinConsultation(app)}>Tham gia</button>
                      )}
                      {app.status === 'confirmed' && canCancelAppointment(app) && (
                        <button style={{ marginRight: 8, background: '#f44336', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => { setSelectedAppointment(app); setShowCancelModal(true); }}>Hủy</button>
                      )}
                      {app.status === 'completed' && (
                        <button style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => handleRateConsultation(app)}>Đánh giá</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal chi tiết lịch hẹn */}
        {showDetails && selectedAppointment && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(8,145,178,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: 32, borderRadius: 16, minWidth: 350, maxWidth: 420, boxShadow: '0 8px 32px rgba(8,145,178,0.15)' }}>
              <h3 style={{ color: '#0891b2', fontWeight: 700, marginBottom: 18 }}>Chi tiết lịch hẹn</h3>
              <p><b>Bác sĩ/Tư vấn viên:</b> {selectedAppointment.consultantName}</p>
              <p><b>Chuyên môn:</b> {selectedAppointment.specialization}</p>
              <p><b>Ngày:</b> {selectedAppointment.date}</p>
              <p><b>Khung giờ:</b> {selectedAppointment.timeSlot}</p>
              <p><b>Phương thức:</b> {formatMethod(selectedAppointment.consultationMethod)}</p>
              <p><b>Lý do tư vấn:</b> {selectedAppointment.reason}</p>
              <p><b>Chi tiết:</b> {selectedAppointment.details}</p>
              <p><b>Trạng thái:</b> <span style={{ color: getStatusColor(selectedAppointment.status) }}>{formatStatus(selectedAppointment.status)}</span></p>
              {selectedAppointment.status === 'cancelled' && (
                <p><b>Lý do hủy:</b> {selectedAppointment.cancelReason}</p>
              )}
              <div style={{ textAlign: 'right', marginTop: 20 }}>
                <button style={{ background: '#22d3ee', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowDetails(false)}>Đóng</button>
              </div>
            </div>
          </div>
        )}
        {/* Modal hủy lịch hẹn */}
        {showCancelModal && selectedAppointment && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(8,145,178,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: 32, borderRadius: 16, minWidth: 350, maxWidth: 420, boxShadow: '0 8px 32px rgba(244,67,54,0.10)' }}>
              <h3 style={{ color: '#f44336', fontWeight: 700, marginBottom: 18 }}>Hủy lịch hẹn</h3>
              <p style={{ fontWeight: 500 }}>Bạn chắc chắn muốn hủy lịch hẹn này?</p>
              <textarea
                placeholder="Lý do hủy (bắt buộc)"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                style={{ width: '100%', minHeight: 60, marginBottom: 16, borderRadius: 8, border: '1px solid #f44336', padding: 10, fontWeight: 500 }}
              />
              <div style={{ textAlign: 'right' }}>
                <button onClick={() => setShowCancelModal(false)} style={{ marginRight: 10, background: '#e0e0e0', color: '#333', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Bỏ qua</button>
                <button onClick={handleCancelAppointment} disabled={!cancelReason} style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: cancelReason ? 'pointer' : 'not-allowed', opacity: cancelReason ? 1 : 0.7 }}>Xác nhận hủy</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
