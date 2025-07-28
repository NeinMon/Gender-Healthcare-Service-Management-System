# Gender Healthcare Service Management System - Backend API Documentation

## Tổng quan hệ thống

Hệ thống quản lý dịch vụ chăm sóc sức khỏe phụ nữ được xây dựng theo kiến trúc 3 lớp:
- **API Layer**: Tiếp nhận HTTP requests từ frontend, không xử lý logic nghiệp vụ
- **Service Layer**: Xử lý toàn bộ logic nghiệp vụ và quy trình
- **Repository Layer**: Kết nối và thao tác với database

## Cấu trúc API Controllers

### 1. AuthAPI
**Đường dẫn**: `/api/auth`
**Chức năng**: Xác thực và phân quyền người dùng
- Đăng ký tài khoản cho customer, consultant, staff
- Đăng nhập và phân quyền truy cập
- Quản lý session và bảo mật

### 2. UserAPI  
**Đường dẫn**: `/api/users`
**Chức năng**: Quản lý thông tin người dùng
- CRUD operations cho user profile
- Quản lý thông tin customer, consultant, staff
- Cập nhật thông tin cá nhân

### 3. BookingAPI
**Đường dẫn**: `/api/bookings`  
**Chức năng**: Quản lý lịch tư vấn sức khỏe
- Tạo booking với dịch vụ mặc định
- Tạo booking với dịch vụ cụ thể
- Cập nhật trạng thái booking
- Quản lý lịch hẹn consultant

### 4. PaymentAPI
**Đường dẫn**: `/api/payment`
**Chức năng**: Xử lý thanh toán qua PayOS
- Tạo liên kết thanh toán
- Theo dõi trạng thái thanh toán
- Đồng bộ với cổng thanh toán
- Hủy thanh toán

### 5. ServiceAPI
**Đường dẫn**: `/api/services`
**Chức năng**: Quản lý dịch vụ tư vấn
- CRUD cho catalog dịch vụ
- Quản lý giá và mô tả dịch vụ
- Phân loại dịch vụ chăm sóc

### 6. QuestionAPI
**Đường dẫn**: `/api/questions`
**Chức năng**: Hệ thống hỏi đáp sức khỏe
- Tạo câu hỏi từ khách hàng
- Quản lý danh sách câu hỏi
- Phân loại câu hỏi theo chủ đề

### 7. AnswerAPI
**Đường dẫn**: `/api/answers`
**Chức năng**: Quản lý câu trả lời
- Consultant trả lời câu hỏi
- Liên kết answer với question
- Theo dõi lịch sử tư vấn

### 8. MenstrualCycleAPI
**Đường dẫn**: `/api/menstrual-cycles`
**Chức năng**: Theo dõi chu kỳ kinh nguyệt
- Ghi nhận thông tin chu kỳ
- Tính toán dự đoán
- Hỗ trợ tư vấn sức khỏe sinh sản

### 9. TestBookingAPI
**Đường dẫn**: `/api/test-bookings`
**Chức năng**: Đặt lịch xét nghiệm offline
- Tạo lịch xét nghiệm
- Check-in/check-out
- Quản lý trạng thái xét nghiệm

### 10. AgoraAPI
**Đường dẫn**: `/api/agora`
**Chức năng**: Video call tư vấn
- Tạo token cho video call
- Quản lý phiên tư vấn trực tuyến
- Tích hợp Agora SDK

## Service Layer

### AuthService
- Xử lý logic đăng ký/đăng nhập
- Validate thông tin user
- Quản lý phân quyền

### UserService
- CRUD operations cho user
- Quản lý profile và thông tin cá nhân
- Validate dữ liệu user

### BookingService  
- Logic đặt lịch tư vấn
- Quản lý trạng thái booking
- Tích hợp với payment và service
- Xử lý quy trình tư vấn

### PaymentService
- Tích hợp PayOS gateway
- Xử lý webhook
- Đồng bộ trạng thái thanh toán
- Bảo mật giao dịch

### ServiceService
- Quản lý catalog dịch vụ
- CRUD cho service offerings
- Tính toán giá dịch vụ

### QuestionService
- Validate câu hỏi
- Phân loại và quản lý Q&A
- Liên kết với consultant

### AnswerService
- Xử lý câu trả lời từ consultant
- Đảm bảo chất lượng tư vấn
- Theo dõi lịch sử

### MenstrualCycleService
- Tính toán chu kỳ kinh nguyệt
- Dự đoán ngày quan trọng
- Validate dữ liệu sức khỏe

### TestBookingInfoService
- Quản lý lịch xét nghiệm
- Xử lý check-in/check-out
- Theo dõi tiến trình

### AgoraService
- Tạo token video call
- Quản lý phiên tư vấn
- Bảo mật video call

## Repository Layer

Các repository implements JPA để thao tác với database:
- UserRepository
- BookingRepository  
- PaymentRepository
- ServiceRepository
- QuestionRepository
- AnswerRepository
- MenstrualCycleRepository
- TestBookingInfoRepository

## Đặc tính kỹ thuật

### Bảo mật
- CORS được cấu hình cho tất cả API
- Validation dữ liệu với Jakarta Validation
- Exception handling toàn cục

### Giao dịch
- @Transactional đảm bảo tính nhất quán
- Rollback tự động khi lỗi
- Quản lý connection pool

### Integration
- PayOS payment gateway
- Agora video SDK
- RESTful API standards

### Error Handling
- Custom exceptions
- Structured error responses
- Logging và monitoring

## Quy trình sử dụng

1. **Authentication**: Đăng ký/đăng nhập qua AuthAPI
2. **Service Discovery**: Tìm dịch vụ qua ServiceAPI  
3. **Booking**: Đặt lịch qua BookingAPI
4. **Payment**: Thanh toán qua PaymentAPI
5. **Consultation**: Video call qua AgoraAPI
6. **Q&A**: Hỏi đáp qua QuestionAPI/AnswerAPI
7. **Health Tracking**: Theo dõi sức khỏe qua MenstrualCycleAPI
8. **Testing**: Xét nghiệm qua TestBookingAPI

## Lưu ý phát triển

- Tuân thủ kiến trúc 3 lớp nghiêm ngặt
- API chỉ handle HTTP, không chứa business logic
- Service layer chứa toàn bộ nghiệp vụ
- Repository chỉ thao tác database
- Exception handling nhất quán
- Documentation và comment đầy đủ
