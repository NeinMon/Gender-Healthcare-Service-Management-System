# 🏥 Gender Healthcare Service Management System

Hệ thống quản lý dịch vụ chăm sóc sức khỏe giới tính - một ứng dụng web toàn diện dành cho việc theo dõi sức khỏe sinh sản, tư vấn giới tính và xét nghiệm STIs.

## 🌟 Tính năng chính

### 📅 Theo dõi chu kỳ sinh sản
- Khai báo và theo dõi chu kỳ kinh nguyệt
- Nhắc nhở thời điểm rụng trứng và khả năng mang thai
- Theo dõi triệu chứng và cường độ kinh nguyệt
- Dự đoán chu kỳ tiếp theo

### 💬 Tư vấn trực tuyến
- Đặt lịch tư vấn với chuyên gia
- Tư vấn về sức khỏe sinh sản và giới tính
- Lịch sử tư vấn và theo dõi
- Bảo mật thông tin tuyệt đối

### 🧪 Xét nghiệm STIs
- Đặt lịch xét nghiệm các bệnh lây truyền qua đường tình dục
- Nhiều gói xét nghiệm: Cơ bản, Trung cấp, Đầy đủ
- Theo dõi kết quả trực tuyến
- Hỗ trợ sau xét nghiệm

### ℹ️ Thông tin dịch vụ
- Bảng giá minh bạch
- Thông tin liên hệ và địa chỉ
- Hướng dẫn sử dụng dịch vụ

## 🚀 Công nghệ sử dụng

- **Frontend**: React 19.1.0 + Vite
- **Routing**: React Router DOM 7.6.0
- **Styling**: Inline CSS với design system nhất quán
- **Icons**: Emoji icons cho UI thân thiện

## 📦 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js 16+ 
- npm hoặc yarn

### Cài đặt
```bash
# Clone repository
git clone https://github.com/NeinMon/Gender-Healthcare-Service-Management-System.git

# Chuyển vào thư mục dự án
cd Gender-Healthcare-Service-Management-System

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

### Các lệnh có sẵn
```bash
npm run dev      # Chạy development server
npm run build    # Build cho production
npm run preview  # Preview build production
npm run lint     # Chạy ESLint
```

## 🌐 Cấu trúc dự án

```
src/
├── App.jsx          # Trang chủ với calculator chu kỳ
├── Login.jsx        # Trang đăng nhập
├── Register.jsx     # Trang đăng ký
├── Services.jsx     # Trang dịch vụ chính
├── main.jsx         # Entry point và routing
├── index.css        # Global styles
data/
├── accounts.js      # Dữ liệu tài khoản mẫu
```

## 🎨 UI/UX Design

- **Color Scheme**: Gradient xanh lá (#11998e → #38ef7d)
- **Typography**: System fonts với hierarchy rõ ràng  
- **Layout**: Responsive design, mobile-first approach
- **Components**: Cards, forms, tables với shadow effects
- **Navigation**: Simple navigation với anchor links

## 👥 Đối tượng sử dụng

- **Người dùng cá nhân**: Theo dõi sức khỏe sinh sản
- **Cặp đôi**: Lập kế hoạch gia đình an toàn
- **Chuyên gia y tế**: Tư vấn và hỗ trợ bệnh nhân

## 📱 Responsive Design

Ứng dụng được thiết kế responsive hoàn toàn:
- **Desktop**: Layout 2-3 cột với sidebar
- **Tablet**: Layout adapts với flexbox
- **Mobile**: Single column với touch-friendly buttons

## 🔐 Bảo mật

- Mã hóa thông tin cá nhân
- Session management
- Input validation và sanitization
- HTTPS enforced cho production

## 🚧 Roadmap

- [ ] Backend API integration
- [ ] Database cho user management
- [ ] Push notifications cho reminders  
- [ ] Mobile app (React Native)
- [ ] Advanced analytics và reports
- [ ] Multi-language support

## 👨‍💻 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`) 
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- **Project Link**: [https://github.com/NeinMon/Gender-Healthcare-Service-Management-System](https://github.com/NeinMon/Gender-Healthcare-Service-Management-System)
- **Email**: info@suckhoegioitinh.vn
- **Hotline**: 1900 1234

---

⭐ **Nếu project này hữu ích, hãy cho chúng tôi một star!** ⭐
