# Hệ Thống Quản Lý Dịch Vụ Chăm Sóc Sức Khỏe Giới Tính

Dịch vụ API backend cho Hệ Thống Quản Lý Chăm Sóc Sức Khỏe Giới Tính, cung cấp các chức năng theo dõi và quản lý sức khỏe toàn diện.

## 📋 Mục Lục

- [Tính Năng](#-tính-năng)
- [Công Nghệ](#-công-nghệ)
- [Bắt Đầu](#-bắt-đầu)
- [Tài Liệu API](#-tài-liệu-api)
- [Cấu Hình Cơ Sở Dữ Liệu](#-cấu-hình-cơ-sở-dữ-liệu)

## ✨ Tính Năng

- Xác thực và phân quyền người dùng
- Theo dõi và quản lý chu kỳ kinh nguyệt
- Diễn đàn hỏi đáp về sức khỏe
- Quản lý hồ sơ người dùng
- Kiểm soát truy cập dựa trên vai trò

## 🛠 Công Nghệ

- **Framework**: Spring Boot 3.4.6
- **ORM**: Spring Data JPA
- **Cơ sở dữ liệu**: SQL Server
- **Xác thực dữ liệu**: Spring Validation
- **Công cụ phát triển**: Lombok
- **Bảo mật**: Xác thực dựa trên token
- **Công cụ xây dựng**: Maven

## 🚀 Bắt Đầu

### Yêu Cầu Hệ Thống

- Java 24
- Maven 3.6+
- Cài đặt SQL Server

### Cài Đặt

1. Clone repository
```bash
git clone https://github.com/your-username/Gender-Healthcare-Service-Management-System.git
```

2. Di chuyển đến thư mục dự án
```bash
cd Gender-Healthcare-Service-Management-System/BE
```

3. Cấu hình cơ sở dữ liệu trong `application.properties`

4. Xây dựng và chạy ứng dụng
```bash
mvn spring-boot:run
```

Ứng dụng sẽ được truy cập tại: http://localhost:8080

## 📚 Tài Liệu API

### API Xác Thực

#### Đăng ký người dùng mới
```
POST /api/auth/register
```

Ví dụ body request:
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com", 
  "password": "password123",
  "gender": "Nam",
  "dob": "1990-01-01T00:00:00",
  "phone": "0123456789",
  "address": "Hà Nội"
}
```

#### Đăng nhập
```
POST /api/auth/login
```

Ví dụ body request:
```json
{
  "email": "nguyenvana@example.com",
  "password": "password123"
}
```

### API Người Dùng

#### Lấy tất cả người dùng
```
GET /api/users
```

#### Lấy người dùng theo ID
```
GET /api/users/{id}
```

#### Tạo người dùng
```
POST /api/users
```

Ví dụ body request:
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

#### Cập nhật người dùng
```
PUT /api/users/{id}
```

Ví dụ body request (các trường có thể được bỏ qua nếu không cập nhật):
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana_new@example.com",
  "password": "newpassword123"
}
```

#### Xóa người dùng
```
DELETE /api/users/{id}
```

### API Chu Kỳ Kinh Nguyệt

#### Lấy tất cả chu kỳ kinh nguyệt
```
GET /api/menstrual-cycles
```

#### Lấy chu kỳ kinh nguyệt theo ID
```
GET /api/menstrual-cycles/{id}
```

#### Lấy chu kỳ kinh nguyệt theo ID người dùng
```
GET /api/menstrual-cycles/user/{userId}
```

#### Kiểm tra người dùng có chu kỳ kinh nguyệt không
```
GET /api/menstrual-cycles/user/{userId}/exists
```

#### Tạo chu kỳ kinh nguyệt
```
POST /api/menstrual-cycles
```

#### Cập nhật chu kỳ kinh nguyệt
```
PUT /api/menstrual-cycles/{id}
```

#### Cập nhật hoặc tạo chu kỳ kinh nguyệt cho người dùng
```
PUT /api/menstrual-cycles/user/{userId}
```

#### Xóa chu kỳ kinh nguyệt
```
DELETE /api/menstrual-cycles/{id}
```

### API Câu Hỏi

```
GET /api/questions
POST /api/questions
GET /api/questions/{id}
PUT /api/questions/{id}
DELETE /api/questions/{id}
```

## 🛢 Cấu Hình Cơ Sở Dữ Liệu

Ứng dụng sử dụng SQL Server làm cơ sở dữ liệu.

Cấu hình kết nối (`application.properties`):
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=demo;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=12345
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
```

Lược đồ cơ sở dữ liệu được quản lý tự động bởi JPA/Hibernate với:
```properties
spring.jpa.hibernate.ddl-auto=update
```

## 📝 Giấy Phép

Dự án này được cấp phép theo Giấy phép MIT - xem tệp LICENSE để biết thêm chi tiết.

---

© 2025 Hệ Thống Quản Lý Dịch Vụ Chăm Sóc Sức Khỏe Giới Tính
