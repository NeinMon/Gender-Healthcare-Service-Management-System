const questions = [
  {
    id: 1,
    patientName: "Nguyễn Thị Lan",
    patientGender: "Nữ",
    question: "Tôi bị đau bụng dưới khi đến ngày kinh nguyệt, điều này có bình thường không?",
    category: "Chu kỳ kinh nguyệt",
    status: "pending",
    date: "2024-12-01",
    createdAt: "2024-12-01 14:30:00",
    priority: "normal",
    avatar: "👩"
  },
  {
    id: 2,
    patientName: "Trần Thị Mai",
    patientGender: "Nữ",
    question: "Tôi đã 35 tuổi và muốn có con. Những xét nghiệm nào tôi nên làm trước khi mang thai?",
    category: "Mang thai",
    status: "pending",
    date: "2024-12-01",
    createdAt: "2024-12-01 10:15:00",
    priority: "high",
    avatar: "👩"
  },
  {
    id: 3,
    patientName: "Lê Thị Hương",
    patientGender: "Nữ",
    question: "Tôi bị ngứa và có dịch bất thường ở vùng kín, có thể là bệnh gì?",
    category: "Sức khỏe sinh sản",
    status: "answered",
    reply: "Dựa trên các triệu chứng bạn mô tả, có thể bạn đang bị nhiễm trùng âm đạo. Tôi khuyên bạn nên đến khám trực tiếp để được chẩn đoán chính xác và điều trị kịp thời.",
    date: "2024-11-30",
    createdAt: "2024-11-30 16:45:00",
    answeredAt: "2024-11-30 17:20:00",
    priority: "high",
    avatar: "👩"
  },
  {
    id: 4,
    patientName: "Phạm Thị Linh",
    patientGender: "Nữ",
    question: "Thuốc tránh thai khẩn cấp có tác dụng phụ gì không? Tôi có thể dùng bao nhiều lần trong 1 tháng?",
    category: "Kế hoạch hóa gia đình",
    status: "pending",
    date: "2024-12-01",
    createdAt: "2024-12-01 09:20:00",
    priority: "high",
    avatar: "👩"
  },
  {
    id: 5,
    patientName: "Võ Thị Nga",
    patientGender: "Nữ",
    question: "Tôi 45 tuổi, kinh nguyệt không đều và thường xuyên bốc hỏa. Đây có phải là tiền mãn kinh?",
    category: "Tiền mãn kinh",
    status: "answered",
    reply: "Các triệu chứng bạn mô tả rất phù hợp với giai đoạn tiền mãn kinh. Tôi khuyên bạn nên theo dõi chu kỳ kinh nguyệt và có thể làm xét nghiệm hormone để xác định chính xác.",
    date: "2024-11-29",
    createdAt: "2024-11-29 11:30:00",
    answeredAt: "2024-11-29 14:15:00",
    priority: "normal",
    avatar: "👩"
  },
  {
    id: 6,
    patientName: "Nguyễn Văn Đức",
    patientGender: "Nam",
    question: "Tôi 30 tuổi, gần đây thấy có vấn đề về sinh lý nam giới. Tôi nên khám ở đâu?",
    category: "Sức khỏe nam giới",
    status: "pending",
    date: "2024-12-01",
    createdAt: "2024-12-01 15:10:00",
    priority: "normal",
    avatar: "👨"
  }
];

export default questions;
