/**
 * Sample chat messages data for the ConsultantInterface component
 */
const chatMessagesData = {
  1: [ // Chat messages for consultation ID 1
    {
      id: 101,
      senderId: 'patient',
      senderName: 'Nguyễn Thị Hương',
      message: 'Xin chào bác sĩ, tôi đang gặp khó khăn khi lựa chọn biện pháp tránh thai phù hợp.',
      timestamp: '2025-06-15T10:32:00',
      read: true
    },
    {
      id: 102,
      senderId: 'consultant',
      senderName: 'Bác sĩ Tư Vấn',
      message: 'Chào chị Hương, rất vui được tư vấn cho chị. Hiện có nhiều biện pháp tránh thai, mỗi phương pháp có ưu nhược điểm khác nhau. Chị đã từng sử dụng biện pháp nào chưa?',
      timestamp: '2025-06-15T10:33:00',
      read: true
    },
    {
      id: 103,
      senderId: 'patient',
      senderName: 'Nguyễn Thị Hương',
      message: 'Tôi đã dùng thuốc uống nhưng gặp tác dụng phụ như tăng cân và đau đầu. Tôi muốn tìm hiểu về các biện pháp không hormone.',
      timestamp: '2025-06-15T10:35:00',
      read: true
    },
    {
      id: 104,
      senderId: 'consultant',
      senderName: 'Bác sĩ Tư Vấn',
      message: 'Tôi hiểu. Với trường hợp của chị, có thể cân nhắc các phương pháp như: bao cao su, màng ngăn âm đạo, vòng tránh thai bằng đồng IUD (không chứa hormone). Phương pháp nào phù hợp sẽ phụ thuộc vào nhiều yếu tố như lối sống, mức độ tiện lợi và hiệu quả mà chị mong muốn.',
      timestamp: '2025-06-15T10:38:00',
      read: true
    }
  ],
  2: [ // Chat messages for consultation ID 2
    {
      id: 201,
      senderId: 'patient',
      senderName: 'Lê Văn Tùng',
      message: 'Chào bác sĩ, tôi muốn được tư vấn về khả năng sinh sản ở tuổi 35.',
      timestamp: '2025-06-18T14:02:00',
      read: true
    },
    {
      id: 202,
      senderId: 'consultant',
      senderName: 'Bác sĩ Tư Vấn',
      message: 'Chào anh Tùng, ở độ tuổi 35, khả năng sinh sản của nam giới vẫn rất tốt, không giảm nhiều như ở phụ nữ cùng độ tuổi. Tuy nhiên, có một số yếu tố có thể ảnh hưởng như lối sống, stress, và tiền sử bệnh.',
      timestamp: '2025-06-18T14:04:00',
      read: true
    },
    {
      id: 203,
      senderId: 'patient',
      senderName: 'Lê Văn Tùng',
      message: 'Tôi có tiền sử gia đình về ung thư tuyến tiền liệt, điều này có ảnh hưởng đến khả năng sinh sản không?',
      timestamp: '2025-06-18T14:07:00',
      read: true
    },
    {
      id: 204,
      senderId: 'consultant',
      senderName: 'Bác sĩ Tư Vấn',
      message: 'Tiền sử gia đình về ung thư tuyến tiền liệt không trực tiếp ảnh hưởng đến khả năng sinh sản. Tuy nhiên, đó là yếu tố nguy cơ cần theo dõi định kỳ để phát hiện sớm bệnh về sau này. Tôi khuyên anh nên khám sức khỏe định kỳ 1 năm/lần sau tuổi 40.',
      timestamp: '2025-06-18T14:10:00',
      read: true
    },
    {
      id: 205,
      senderId: 'patient',
      senderName: 'Lê Văn Tùng',
      message: 'Cảm ơn bác sĩ. Tôi và vợ đang cố gắng có con, có biện pháp nào tăng cường khả năng thụ thai không?',
      timestamp: '2025-06-18T14:12:00',
      read: false
    }
  ],
  3: [ // Empty chat for consultation ID 3
  ],
  4: [ // Chat messages for consultation ID 4
    {
      id: 401,
      senderId: 'patient',
      senderName: 'Phạm Văn Nam',
      message: 'Chào bác sĩ, tôi gặp vấn đề về cương dương từ khi bị tiểu đường.',
      timestamp: '2025-06-20T13:15:00',
      read: true
    },
    {
      id: 402,
      senderId: 'consultant',
      senderName: 'Bác sĩ Tư Vấn',
      message: 'Chào anh Nam, rối loạn cương dương là một biến chứng phổ biến của bệnh tiểu đường. Điều này xảy ra do tổn thương thần kinh và mạch máu do đường huyết cao trong thời gian dài. Anh đã bị tiểu đường bao lâu rồi?',
      timestamp: '2025-06-20T13:18:00',
      read: true
    },
    {
      id: 403,
      senderId: 'patient',
      senderName: 'Phạm Văn Nam',
      message: 'Tôi được chẩn đoán tiểu đường type 2 khoảng 3 năm trước.',
      timestamp: '2025-06-20T13:20:00',
      read: false
    }
  ],
  5: [ // Chat messages for consultation ID 5 (cancelled)
    {
      id: 501,
      senderId: 'patient',
      senderName: 'Hoàng Thị Lan',
      message: 'Bác sĩ ơi, tôi rất xin lỗi nhưng tôi cần hủy lịch hẹn tư vấn về kế hoạch mang thai vào ngày mai. Tôi có việc đột xuất và sẽ đặt lịch lại trong tuần sau.',
      timestamp: '2025-06-16T15:40:00',
      read: true
    },
    {
      id: 502,
      senderId: 'consultant',
      senderName: 'Bác sĩ Tư Vấn',
      message: 'Chào chị Lan, không sao đâu ạ. Tôi sẽ hủy lịch hẹn ngày mai. Chị có thể liên hệ với phòng khám để đặt lịch lại khi nào thuận tiện.',
      timestamp: '2025-06-16T15:45:00',
      read: true
    },
    {
      id: 503,
      senderId: 'patient',
      senderName: 'Hoàng Thị Lan',
      message: 'Cảm ơn bác sĩ đã thông cảm. Tôi sẽ liên hệ lại sau.',
      timestamp: '2025-06-16T15:47:00',
      read: true
    }
  ]
};

export default chatMessagesData;
