/**
 * Sample consultation data for the ConsultantInterface component
 */
const consultationsData = [
  {
    id: 1,
    patientName: 'Nguyễn Thị Hương',
    patientAge: 28,
    patientGender: 'Nữ',
    date: '2025-06-15T10:30:00',
    status: 'scheduled', // scheduled, completed, cancelled
    type: 'online', // online, in-person
    topic: 'Sức khỏe sinh sản và tránh thai',
    summary: 'Tư vấn về các biện pháp tránh thai và kế hoạch hóa gia đình.',
    notes: 'Bệnh nhân quan tâm đến phương pháp tránh thai không hormone.',
    avatar: '/docter4.jpg'
  },
  {
    id: 2,
    patientName: 'Lê Văn Tùng',
    patientAge: 35,
    patientGender: 'Nam',
    date: '2025-06-18T14:00:00',
    status: 'completed',
    type: 'online',
    topic: 'Sức khỏe sinh sản nam giới',
    summary: 'Thảo luận về các vấn đề sức khỏe sinh sản ở nam giới trung niên.',
    notes: 'Bệnh nhân có tiền sử gia đình mắc ung thư tuyến tiền liệt.',
    avatar: '/docter3.jpg'
  },
  {
    id: 3,
    patientName: 'Trần Thị Mai',
    patientAge: 22,
    patientGender: 'Nữ',
    date: '2025-06-19T09:15:00',
    status: 'scheduled',
    type: 'in-person',
    topic: 'Tư vấn về kinh nguyệt không đều',
    summary: 'Khách hàng gặp vấn đề về kinh nguyệt không đều kéo dài 6 tháng.',
    notes: 'Có thể liên quan đến căng thẳng học tập và chế độ ăn uống.',
    avatar: '/thietbi.jpg'
  },
  {
    id: 4,
    patientName: 'Phạm Văn Nam',
    patientAge: 42,
    patientGender: 'Nam',
    date: '2025-06-20T16:30:00',
    status: 'scheduled',
    type: 'online',
    topic: 'Rối loạn cương dương',
    summary: 'Tư vấn về rối loạn cương dương và các phương pháp điều trị.',
    notes: 'Bệnh nhân đang bị tiểu đường type 2, có thể liên quan.',
    avatar: '/doinguyte.jpg'
  },
  {
    id: 5,
    patientName: 'Hoàng Thị Lan',
    patientAge: 31,
    patientGender: 'Nữ',
    date: '2025-06-17T11:00:00',
    status: 'cancelled',
    type: 'online',
    topic: 'Tư vấn về kế hoạch mang thai',
    summary: 'Khách hàng muốn tư vấn về việc chuẩn bị mang thai.',
    notes: 'Đã hủy cuộc hẹn, sẽ đặt lịch lại trong tuần sau.',
    avatar: '/health-blog.jpg'
  }
];

export default consultationsData;
