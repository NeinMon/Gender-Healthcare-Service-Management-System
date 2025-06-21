/**
 * Sample questions data for the ConsultantInterface component
 */
const questionsData = [
  {
    id: 1,
    title: 'Triệu chứng đau bụng dưới ở phụ nữ',
    content: 'Tôi thường xuyên bị đau bụng dưới, nhất là trong những ngày hành kinh. Đau nhiều đến mức khó đi làm. Tôi nên làm gì và có cần khám bác sĩ không?',
    askedBy: 'Nguyễn Thị H.',
    dateAsked: '2025-06-10T08:45:00',
    status: 'pending', // pending, answered, closed
    tags: ['đau bụng', 'kinh nguyệt', 'phụ nữ'],
    anonymousQuestion: false
  },
  {
    id: 2,
    title: 'Quan hệ an toàn và phòng tránh STIs',
    content: 'Tôi muốn tìm hiểu về các phương pháp quan hệ an toàn và làm thế nào để phòng tránh các bệnh lây qua đường tình dục hiệu quả nhất? Đặc biệt là trong các mối quan hệ mới.',
    askedBy: 'Ẩn danh',
    dateAsked: '2025-06-12T15:23:00',
    status: 'answered',
    answer: 'Quan hệ tình dục an toàn bao gồm việc sử dụng bao cao su đúng cách, là phương pháp hiệu quả nhất để phòng tránh STIs. Ngoài ra, bạn nên kiểm tra sức khỏe định kỳ, đặc biệt sau khi có quan hệ không an toàn hoặc bắt đầu mối quan hệ mới. Trao đổi thẳng thắn với đối tác về lịch sử tình dục và kiểm tra sức khỏe cũng rất quan trọng. Nếu có bất kỳ triệu chứng bất thường nào, hãy tìm gặp bác sĩ ngay.',
    answeredBy: 'Bác sĩ Nguyễn Văn A',
    dateAnswered: '2025-06-13T09:10:00',
    tags: ['STI', 'quan hệ an toàn', 'sức khỏe tình dục'],
    anonymousQuestion: true
  },
  {
    id: 3,
    title: 'Vấn đề về tinh trùng yếu',
    content: 'Tôi và vợ đã cố gắng có con trong 2 năm nhưng chưa thành công. Tôi đã kiểm tra và bác sĩ nói rằng tinh trùng của tôi hơi yếu. Có phương pháp tự nhiên nào để cải thiện chất lượng tinh trùng không?',
    askedBy: 'Trần V.D.',
    dateAsked: '2025-06-14T11:35:00',
    status: 'answered',
    answer: 'Để cải thiện chất lượng tinh trùng, anh có thể áp dụng các biện pháp như: duy trì chế độ ăn uống lành mạnh (nhiều trái cây, rau xanh, ngũ cốc nguyên hạt), tập thể dục đều đặn, tránh rượu bia và thuốc lá, giảm stress, tránh nhiệt độ cao ở vùng bìu (không tắm nước quá nóng, không mặc quần quá chật). Bổ sung một số vitamin như kẽm, selenium, vitamin C và E cũng có thể hữu ích. Tuy nhiên, tốt nhất nên tham khảo ý kiến bác sĩ chuyên khoa để có hướng điều trị phù hợp với tình trạng cụ thể.',
    answeredBy: 'Bác sĩ Lê Thị B',
    dateAnswered: '2025-06-15T14:20:00',
    tags: ['hiếm muộn', 'nam khoa', 'tinh trùng'],
    anonymousQuestion: false
  },
  {
    id: 4,
    title: 'Thuốc tránh thai khẩn cấp',
    content: 'Tôi đã quan hệ không an toàn cách đây 30 giờ. Tôi có thể uống thuốc tránh thai khẩn cấp không và có tác dụng phụ gì không?',
    askedBy: 'Ẩn danh',
    dateAsked: '2025-06-16T09:55:00',
    status: 'pending',
    tags: ['tránh thai khẩn cấp', 'thuốc tránh thai', 'sức khỏe tình dục'],
    anonymousQuestion: true
  },
  {
    id: 5,
    title: 'Thay đổi hormone ở tuổi 40',
    content: 'Tôi năm nay 42 tuổi và thấy cơ thể có nhiều thay đổi như đổ mồ hôi đêm, tâm trạng thất thường, chu kỳ kinh nguyệt không đều. Đây có phải là dấu hiệu của tiền mãn kinh không và tôi nên làm gì?',
    askedBy: 'Phạm T.H.',
    dateAsked: '2025-06-17T16:40:00',
    status: 'pending',
    tags: ['tiền mãn kinh', 'hormone', 'phụ nữ trung niên'],
    anonymousQuestion: false
  }
];

export default questionsData;
