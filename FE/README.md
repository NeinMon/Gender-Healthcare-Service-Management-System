# 🏥 Gender Healthcare Service Management System - Frontend

Hệ thống quản lý dịch vụ chăm sóc sức khỏe giới tính - Giao diện người dùng hiện đại được xây dựng với React, cung cấp các dịch vụ chăm sóc sức khỏe sinh sản toàn diện.

## 🌟 Tính năng chính

### 🏠 Trang chủ động (Homepage)
- Giao diện hiện đại với carousel hình ảnh tự động
- Thống kê hoạt động với animation counters
- Form đăng ký và đăng nhập tích hợp
- Responsive design với fade-in animations

### 👤 Quản lý tài khoản người dùng
- Đăng ký tài khoản với validation đầy đủ
- Đăng nhập bảo mật với xác thực
- Quản lý thông tin cá nhân (UserAccount.jsx)
- Chỉnh sửa profile với giao diện thân thiện

### 🩺 Dịch vụ y tế
- **Tư vấn trực tuyến**: Đặt lịch và tương tác với chuyên gia
- **Theo dõi chu kỳ**: Ghi nhận và dự đoán chu kỳ kinh nguyệt
- **Xét nghiệm**: Đặt lịch các gói xét nghiệm STIs
- **Hỏi đáp**: Tính năng đặt câu hỏi cho chuyên gia

### 💬 Giao diện tư vấn
- Chat interface với consultant
- Quản lý cuộc hội thoại real-time
- Lịch sử tư vấn và theo dõi

## 🚀 Công nghệ sử dụng

### Frontend Framework
- **React**: 18.3.1 - Thư viện JavaScript để xây dựng giao diện người dùng
- **Vite**: Build tool hiện đại cho development và production

### Routing & Navigation  
- **React Router DOM**: 7.6.0 - Single Page Application routing

### Styling & UI
- **CSS Modules**: Inline styling với design system nhất quán
- **Responsive Design**: Mobile-first approach
- **Gradient Design**: Linear gradients với color scheme chuyên nghiệp

### Development Tools
- **ESLint**: Code linting với các rules hiện đại
- **Hot Module Replacement**: Development experience tối ưu

## 📦 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- **Node.js**: 16.0.0 hoặc cao hơn
- **npm**: 8.0.0 hoặc cao hơn (hoặc yarn)
- **Git**: Để clone repository

### Cài đặt
```bash
# Clone repository từ nhánh FrontEnd
git clone -b FrontEnd https://github.com/NeinMon/Gender-Healthcare-Service-Management-System.git

# Chuyển vào thư mục FE
cd Gender-Healthcare-Service-Management-System/FE

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

### Các lệnh có sẵn
```bash
npm run dev      # Chạy development server (localhost:5173)
npm run build    # Build cho production
npm run preview  # Preview build production
npm run lint     # Chạy ESLint để kiểm tra code
```

## 🌐 Cấu trúc dự án

```
FE/
├── public/                          # Static assets
│   ├── Logo.png                    # Logo chính của ứng dụng
│   ├── Doctor.png, Doctor2.jpg     # Hình ảnh đội ngũ bác sĩ
│   ├── consultation.jpg            # Hình tư vấn
│   ├── dichvuchamsoc.jpg          # Dịch vụ chăm sóc
│   ├── health-blog.jpg            # Blog sức khỏe
│   ├── lab-testing.jpg            # Xét nghiệm
│   └── ...                        # Các hình ảnh khác
├── src/
│   ├── components/                 # Reusable components
│   │   └── CustomerAvatar.jsx     # Avatar component
│   ├── App.jsx                    # Homepage với form đăng ký/đăng nhập
│   ├── Services.jsx               # Trang dịch vụ chính
│   ├── Login.jsx                  # Trang đăng nhập
│   ├── Register.jsx               # Trang đăng ký
│   ├── UserAccount.jsx            # Quản lý tài khoản người dùng
│   ├── UserAvatar.jsx             # Avatar người dùng
│   ├── ConsultantInterface.jsx    # Giao diện chat với chuyên gia
│   ├── ConsultationBooking.jsx    # Đặt lịch tư vấn
│   ├── PeriodTracking.jsx         # Theo dõi chu kỳ
│   ├── TestBooking.jsx            # Đặt lịch xét nghiệm
│   ├── AskQuestion.jsx            # Hỏi đáp chuyên gia
│   ├── main.jsx                   # Entry point & routing
│   ├── App.css                    # Component-specific styles
│   └── index.css                  # Global styles
├── package.json                   # Dependencies và scripts
├── vite.config.js                # Vite configuration
├── eslint.config.js              # ESLint configuration
└── README.md                     # Documentation
```

## 🎨 UI/UX Design

### Color Palette
- **Primary**: Linear gradient (#0891b2 → #22d3ee) - Cyan professional
- **Secondary**: Complementary greens và blues
- **Background**: Light blue (#f0f9ff) cho clean appearance  
- **Text**: Dark slate (#1e293b) với high contrast

### Typography
- **Font Family**: Inter, Segoe UI, system fonts
- **Hierarchy**: Clear heading sizes (28px, 24px, 18px, 16px)
- **Weight**: 400 (normal), 600 (semibold), 700 (bold)

### Layout & Components
- **Design System**: Consistent spacing (8px grid)
- **Border Radius**: 12px cho cards, 8px cho inputs
- **Shadow**: Multi-layer shadows cho depth
- **Responsive**: Mobile-first với breakpoints
- **Animations**: Smooth transitions và fade-in effects

### Interactive Elements
- **Buttons**: Gradient backgrounds với hover effects
- **Forms**: Clean inputs với validation states
- **Cards**: Elevated design với subtle shadows
- **Navigation**: Intuitive với clear visual hierarchy

## � Tính năng kỹ thuật

### Performance Optimizations
- **Vite HMR**: Hot Module Replacement cho development nhanh
- **Code Splitting**: Lazy loading cho các route
- **Image Optimization**: Optimized assets trong public folder
- **Bundle Analysis**: Webpack bundle analyzer tích hợp

### State Management
- **React Hooks**: useState, useEffect cho local state
- **Local Storage**: Persistent user data
- **Form Validation**: Real-time validation với feedback

### API Integration Ready
- **Fetch API**: Sẵn sàng integrate với backend
- **Error Handling**: Comprehensive error boundaries
- **Loading States**: User-friendly loading indicators

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px (Single column layout)
- **Tablet**: 768px - 1024px (Adapted grid layout)  
- **Desktop**: 1024px+ (Multi-column với sidebar)

### Mobile Features
- **Touch Friendly**: Large touch targets (44px minimum)
- **Swipe Navigation**: Gesture support cho carousel
- **Optimized Forms**: Mobile keyboard optimization
- **Fast Loading**: Optimized cho mobile networks

## 🔐 Bảo mật và Authentication

### Frontend Security
- **Input Sanitization**: XSS protection cho user inputs
- **Form Validation**: Client-side validation trước khi submit
- **Secure Storage**: LocalStorage cho session management
- **HTTPS Ready**: Production deployment với SSL

### User Authentication Flow
1. **Registration**: Multi-step validation với confirmPassword
2. **Login**: Secure credential handling
3. **Session**: Persistent login state
4. **Logout**: Clean session termination

## 🚧 Development Roadmap

### Phase 1: Current (✅ Completed)
- [x] Responsive UI components
- [x] User registration/login system  
- [x] Service pages (consultation, testing, period tracking)
- [x] Basic routing và navigation

### Phase 2: Backend Integration (🔄 In Progress)
- [ ] REST API integration cho user management
- [ ] Database connectivity cho user data
- [ ] Real-time chat với WebSocket
- [ ] File upload cho test results

### Phase 3: Advanced Features (📋 Planned)
- [ ] Push notifications cho reminders
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (English/Vietnamese)
- [ ] Mobile app (React Native)
- [ ] Payment integration cho services

### Phase 4: Performance & Scale (🎯 Future)
- [ ] PWA (Progressive Web App) features
- [ ] Offline functionality với service workers
- [ ] Advanced caching strategies
- [ ] Load balancing và CDN integration

## 👨‍💻 Contributing Guidelines

### Để đóng góp vào dự án:

1. **Fork Repository**
   ```bash
   # Fork trên GitHub, sau đó clone
   git clone https://github.com/YOUR_USERNAME/Gender-Healthcare-Service-Management-System.git
   cd Gender-Healthcare-Service-Management-System/FE
   ```

2. **Tạo Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Development Setup**
   ```bash
   npm install
   npm run dev
   ```

4. **Code Standards**
   - Follow ESLint rules
   - Use consistent naming conventions
   - Write meaningful commit messages
   - Add comments cho complex logic

5. **Testing**
   ```bash
   npm run lint    # Check code style
   npm run build   # Ensure build passes
   ```

6. **Submit Pull Request**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   git push origin feature/amazing-feature
   ```

### Code Style Guidelines
- **Components**: PascalCase (UserAccount.jsx)
- **Variables**: camelCase (userName, isEditing)
- **Constants**: UPPER_SNAKE_CASE 
- **CSS**: Inline styles với consistent naming
- **Commits**: Conventional commits (feat:, fix:, docs:, style:)

## 📊 Project Stats

- **Components**: 12+ React components
- **Routes**: 8+ navigable pages
- **Assets**: 15+ optimized images
- **Dependencies**: Modern React ecosystem
- **Bundle Size**: Optimized với Vite
- **Performance**: 90+ Lighthouse score target

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

### Project Information
- **Repository**: [GitHub - Gender Healthcare Service Management System](https://github.com/NeinMon/Gender-Healthcare-Service-Management-System)
- **Branch**: `FrontEnd` (Main development branch)
- **Live Demo**: Coming soon...

### Development Team
- **Frontend Lead**: [NeinMon](https://github.com/NeinMon)
- **UI/UX Design**: Modern healthcare-focused design
- **Tech Stack**: React + Vite ecosystem

### Support Channels
- **Issues**: [GitHub Issues](https://github.com/NeinMon/Gender-Healthcare-Service-Management-System/issues)
- **Discussions**: [GitHub Discussions](https://github.com/NeinMon/Gender-Healthcare-Service-Management-System/discussions)
- **Email**: support@genderhealth.dev (Placeholder)

### Business Contact
- **Service Inquiry**: info@suckhoegioitinh.vn
- **Hotline**: 1900 1234 (Placeholder)
- **Address**: Vietnam Healthcare Services

---

## 🎯 Quick Start Summary

```bash
# Quick setup cho developers
git clone -b FrontEnd https://github.com/NeinMon/Gender-Healthcare-Service-Management-System.git
cd Gender-Healthcare-Service-Management-System/FE
npm install && npm run dev
# Mở http://localhost:5173
```

---

⭐ **Nếu project này hữu ích cho bạn, hãy star repository để support team!** ⭐

**Made with ❤️ for better healthcare accessibility**
