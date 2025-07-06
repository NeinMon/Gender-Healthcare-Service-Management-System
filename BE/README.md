# 🏥 Gender Healthcare Service Management System - Backend API

Dịch vụ API backend cho Hệ Thống Quản Lý Chăm Sóc Sức Khỏe Giới Tính, cung cấp các chức năng theo dõi và quản lý sức khỏe toàn diện với tích hợp video calling.

## 📋 Mục Lục

- [Tính Năng](#-tính-năng)
- [Công Nghệ](#-công-nghệ)
- [Bắt Đầu](#-bắt-đầu)
- [Tài Liệu API](#-tài-liệu-api)
- [Cấu Hình Cơ Sở Dữ Liệu](#-cấu-hình-cơ-sở-dữ-liệu)
- [Video Call Integration](#-video-call-integration)

## ✨ Tính Năng

- 🔐 **Xác thực và phân quyền người dùng** (Authentication & Authorization)
- 📅 **Theo dõi và quản lý chu kỳ kinh nguyệt** (Menstrual Cycle Tracking)
- 💬 **Diễn đàn hỏi đáp về sức khỏe** (Health Q&A Forum)
- 👤 **Quản lý hồ sơ người dùng** (User Profile Management)
- 🎥 **Tư vấn video call trực tuyến** (Video Consultation Booking)
- 🧪 **Đặt lịch xét nghiệm** (Test Booking System)
- 🏥 **Quản lý dịch vụ y tế** (Healthcare Services)
- 🔑 **Kiểm soát truy cập dựa trên vai trò** (Role-based Access Control)
- 📊 **API documentation với Swagger** (Swagger/OpenAPI Integration)

## 🛠 Công Nghệ

### Backend Framework
- **Framework**: Spring Boot 3.4.6
- **Java Version**: Java 24
- **ORM**: Spring Data JPA 3.5.0
- **Validation**: Spring Validation + Jakarta Validation 3.0.2

### Database & Storage
- **Primary Database**: Microsoft SQL Server
- **Database Driver**: MS SQL Server JDBC 12.10.0
- **Testing Database**: H2 Database (for testing)

### Security & Authentication
- **Security**: Spring Security với JWT Token
- **Password Encoding**: BCrypt
- **Role-based Access**: Custom role management

### Video Communication
- **Agora SDK**: Agora Authentication 1.6.1
- **Video Services**: Token generation cho video calls
- **Real-time Communication**: WebRTC support

### Documentation & Development
- **API Documentation**: Swagger/OpenAPI 2.8.5
- **Code Generation**: Lombok
- **Build Tool**: Apache Maven 3.6+
- **Development Tools**: Spring Boot DevTools

## 🚀 Bắt Đầu

### Yêu Cầu Hệ Thống

- **Java**: 24 (JDK 24 hoặc cao hơn)
- **Maven**: 3.6+ (để build project)
- **Database**: Microsoft SQL Server 2019+
- **IDE**: IntelliJ IDEA hoặc Eclipse (khuyến nghị)

### Cài Đặt

1. **Clone repository**
```bash
git clone https://github.com/NeinMon/Gender-Healthcare-Service-Management-System.git
```

2. **Di chuyển đến thư mục backend**
```bash
cd Gender-Healthcare-Service-Management-System/BE
```

3. **Cấu hình cơ sở dữ liệu**
   - Tạo database tên `demo` trong SQL Server
   - Cập nhật thông tin kết nối trong `src/main/resources/application.properties`

4. **Build và chạy ứng dụng**
```bash
# Build project
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

### Truy cập ứng dụng

- **API Base URL**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Documentation**: http://localhost:8080/v3/api-docs

### Environment Variables (Tùy chọn)

```bash
export DB_URL=jdbc:sqlserver://localhost:1433;databaseName=demo
export DB_USERNAME=sa
export DB_PASSWORD=your_password
export JWT_SECRET=your_jwt_secret_key
export AGORA_APP_ID=your_agora_app_id
export AGORA_APP_CERTIFICATE=your_agora_certificate
```

## 📚 Tài Liệu API

> **💡 Tip**: Sử dụng Swagger UI tại http://localhost:8080/swagger-ui.html để testing API interactive

### 🔐 API Xác Thực (`/api/auth`)

#### Đăng ký người dùng mới
```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com", 
  "password": "password123",
  "gender": "Nam",
  "dob": "1990-01-01T00:00:00",
  "phone": "0123456789",
  "address": "Hà Nội",
  "roleID": 1
}
```

#### Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "nguyenvana@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userID": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "role": "USER"
  }
}
```

### 👤 API Người Dùng (`/api/users`)

#### Lấy tất cả người dùng
```http
GET /api/users
Authorization: Bearer {token}
```

#### Lấy người dùng theo ID
```http
GET /api/users/{id}
Authorization: Bearer {token}
```

#### Lấy danh sách tư vấn viên
```http
GET /api/users/consultants
```

#### Tạo người dùng mới
```http
POST /api/users
Content-Type: application/json
Authorization: Bearer {token}
```

#### Cập nhật thông tin người dùng
```http
PUT /api/users/{id}
Content-Type: application/json
Authorization: Bearer {token}
```

#### Xóa người dùng
```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

### 🩸 API Chu Kỳ Kinh Nguyệt (`/api/menstrual-cycles`)

#### Lấy tất cả chu kỳ
```http
GET /api/menstrual-cycles
Authorization: Bearer {token}
```

#### Lấy chu kỳ theo ID người dùng
```http
GET /api/menstrual-cycles/user/{userId}
Authorization: Bearer {token}
```

#### Kiểm tra tồn tại chu kỳ của người dùng
```http
GET /api/menstrual-cycles/user/{userId}/exists
Authorization: Bearer {token}
```

#### Tạo/Cập nhật chu kỳ cho người dùng
```http
PUT /api/menstrual-cycles/user/{userId}
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "lastPeriodDate": "2024-01-15T00:00:00",
  "cycleLength": 28,
  "periodDuration": 5,
  "notes": "Chu kỳ đều đặn"
}
```

### ❓ API Câu Hỏi (`/api/questions`)

#### Lấy tất cả câu hỏi
```http
GET /api/questions
```

#### Tạo câu hỏi mới
```http
POST /api/questions
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Chu kỳ kinh nguyệt không đều",
  "content": "Em muốn hỏi về tình trạng chu kỳ kinh nguyệt...",
  "userID": 1
}
```

#### Lấy câu hỏi theo ID
```http
GET /api/questions/{id}
```

#### Cập nhật câu hỏi
```http
PUT /api/questions/{id}
Content-Type: application/json
Authorization: Bearer {token}
```

### 💬 API Trả Lời (`/api/answers`)

#### Trả lời câu hỏi
```http
POST /api/answers/reply
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "questionId": 1,
  "consultantId": 2,
  "content": "Dựa vào triệu chứng bạn mô tả..."
}
```

#### Lấy câu trả lời theo câu hỏi
```http
GET /api/answers/question/{questionId}
```

### 🎥 API Video Call (`/api/agora`)

#### Lấy Agora token cho video call
```http
GET /api/agora/token?channelName={channelName}&uid={uid}&role={role}
```

**Parameters:**
- `channelName`: Tên kênh video call
- `uid`: User ID (số nguyên)
- `role`: `publisher` hoặc `subscriber`

**Response:**
```json
{
  "token": "006abc123...",
  "channelName": "booking_123",
  "uid": 1001
}
```

### 📅 API Đặt Lịch Tư Vấn (`/api/bookings`)

#### Lấy lịch hẹn theo tư vấn viên
```http
GET /api/bookings/consultant/{consultantId}
Authorization: Bearer {token}
```

#### Lấy lịch hẹn theo người dùng
```http
GET /api/bookings/user/{userId}
Authorization: Bearer {token}
```

#### Tạo lịch hẹn mới
```http
POST /api/bookings
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "userId": 1,
  "consultantId": 2,
  "appointmentDate": "2024-02-15",
  "startTime": "09:00",
  "content": "Tư vấn về chu kỳ kinh nguyệt"
}
```

#### Cập nhật trạng thái lịch hẹn
```http
PUT /api/bookings/{bookingId}/status?status={status}&endTime={endTime}
Authorization: Bearer {token}
```

**Status values:** `Chờ bắt đầu`, `Đang diễn ra`, `Đã kết thúc`, `Đã duyệt`, `Không được duyệt`

### 🧪 API Đặt Lịch Xét Nghiệm (`/api/test-bookings`)

#### Lấy tất cả lịch xét nghiệm
```http
GET /api/test-bookings
Authorization: Bearer {token}
```

#### Lấy lịch xét nghiệm theo người dùng
```http
GET /api/test-bookings/user/{userId}
Authorization: Bearer {token}
```

#### Tạo lịch xét nghiệm
```http
POST /api/test-bookings
Content-Type: application/json
Authorization: Bearer {token}
```

### 🏥 API Dịch Vụ (`/api/services`)

#### Lấy tất cả dịch vụ
```http
GET /api/services
```

#### Lấy dịch vụ theo ID
```http
GET /api/services/{id}
```

## 🛢 Cấu Hình Cơ Sở Dữ Liệu

### Database Requirements

Ứng dụng sử dụng **Microsoft SQL Server** làm cơ sở dữ liệu chính và **H2 Database** cho testing.

### Cấu Hình Kết Nối

Tạo file `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=demo;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=12345
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServerDialect
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080

# Logging Configuration
logging.level.com.genderhealthcare=DEBUG
logging.level.org.springframework.security=DEBUG

# CORS Configuration
app.cors.allowed-origins=http://localhost:5173,http://localhost:3000
```

### Database Schema

Lược đồ cơ sở dữ liệu được quản lý tự động bởi JPA/Hibernate với các bảng chính:

- **users** - Thông tin người dùng và tư vấn viên
- **roles** - Vai trò và quyền hạn
- **menstrual_cycles** - Chu kỳ kinh nguyệt
- **questions** - Câu hỏi từ người dùng
- **answers** - Câu trả lời từ tư vấn viên
- **bookings** - Lịch hẹn tư vấn video call
- **test_bookings** - Lịch hẹn xét nghiệm
- **services** - Dịch vụ y tế

### Database Setup Script

```sql
-- Tạo database
CREATE DATABASE demo;
USE demo;

-- Tạo roles mặc định
INSERT INTO roles (role_name, description) VALUES 
('USER', 'Người dùng thông thường'),
('CONSULTANT', 'Tư vấn viên y tế'),
('ADMIN', 'Quản trị viên hệ thống');

-- Tạo admin user mặc định
INSERT INTO users (name, email, password, role_id, gender, phone) VALUES 
('Admin', 'admin@healthcare.com', '$2a$10$...', 3, 'Other', '0000000000');
```

## 🎥 Video Call Integration

### Agora Configuration

Hệ thống tích hợp **Agora SDK** để cung cấp tính năng video call cho tư vấn trực tuyến.

#### Environment Variables

```bash
# Agora Configuration
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
```

#### Token Generation

API tự động tạo token cho video call sessions:

```java
@GetMapping("/token")
public ResponseEntity<TokenResponse> generateToken(
    @RequestParam String channelName,
    @RequestParam int uid,
    @RequestParam String role
) {
    // Token generation logic
    String token = agoraService.generateToken(channelName, uid, role);
    return ResponseEntity.ok(new TokenResponse(token, channelName, uid));
}
```

#### Video Call Flow

1. **User books consultation** → Tạo booking record
2. **System generates channel** → Channel name: `booking_{bookingId}`
3. **Frontend requests token** → Call `/api/agora/token`
4. **Video call starts** → Both parties join channel
5. **Call ends** → Update booking status to "Đã kết thúc"

### Security Features

- **JWT Authentication** - Tất cả API endpoints được bảo vệ
- **Role-based Access** - Phân quyền theo vai trò (USER, CONSULTANT, ADMIN)
- **CORS Configuration** - Cho phép frontend access
- **Password Encryption** - BCrypt hashing
- **Token Expiration** - JWT tokens có thời hạn
- **API Rate Limiting** - Giới hạn số request (planned)

## � Deployment

### Development Environment

```bash
# Chạy ở chế độ development
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Hoặc với environment variables
export SPRING_PROFILES_ACTIVE=dev
mvn spring-boot:run
```

### Production Deployment

```bash
# Build JAR file
mvn clean package -DskipTests

# Chạy JAR
java -jar target/demo-0.0.1-SNAPSHOT.jar

# Hoặc với custom profile
java -jar -Dspring.profiles.active=prod target/demo-0.0.1-SNAPSHOT.jar
```

### Docker Deployment (Optional)

```dockerfile
FROM openjdk:24-jdk-slim
VOLUME /tmp
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

```bash
# Build Docker image
docker build -t gender-healthcare-api .

# Run container
docker run -p 8080:8080 gender-healthcare-api
```

## 🧪 Testing

### Chạy Unit Tests

```bash
mvn test
```

### Chạy Integration Tests

```bash
mvn integration-test
```

### Test Coverage Report

```bash
mvn jacoco:report
# Report sẽ được tạo tại target/site/jacoco/index.html
```

## 📈 Monitoring & Health Check

### Health Check Endpoint

```http
GET /actuator/health
```

### Application Info

```http
GET /actuator/info
```

### Metrics

```http
GET /actuator/metrics
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   Giải pháp: Kiểm tra SQL Server đã khởi động và cấu hình connection string
   ```

2. **Port Already in Use**
   ```bash
   # Thay đổi port trong application.properties
   server.port=8081
   ```

3. **JWT Token Invalid**
   ```
   Giải pháp: Kiểm tra JWT secret key và token expiration time
   ```

4. **Agora Token Generation Failed**
   ```
   Giải pháp: Kiểm tra AGORA_APP_ID và AGORA_APP_CERTIFICATE
   ```

## 📞 Support & Contact

### Development Team
- **Backend Lead**: [NeinMon](https://github.com/NeinMon)
- **API Documentation**: Swagger UI at `/swagger-ui.html`
- **Tech Stack**: Spring Boot 3.4.6 + Java 24 + SQL Server

### Repository Information
- **Main Repository**: [Gender Healthcare Service Management System](https://github.com/NeinMon/Gender-Healthcare-Service-Management-System)
- **Backend Branch**: `main` (hoặc `backend`)
- **API Version**: v1.0.0

### Issues & Bug Reports
- **GitHub Issues**: [Report Issues](https://github.com/NeinMon/Gender-Healthcare-Service-Management-System/issues)
- **Email**: support@genderhealthcare.com (Placeholder)

## 📝 Giấy Phép

Dự án này được cấp phép theo **MIT License** - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🔄 Changelog

### Version 1.0.0 (2025-01-04)
- ✅ Initial release với full API endpoints
- ✅ JWT Authentication & Authorization
- ✅ Video call integration với Agora SDK
- ✅ Booking system cho consultation và test
- ✅ Q&A forum với expert answers
- ✅ Menstrual cycle tracking
- ✅ Swagger documentation
- ✅ Role-based access control

---

**© 2025 Gender Healthcare Service Management System**  
*Made with ❤️ for better healthcare accessibility*
