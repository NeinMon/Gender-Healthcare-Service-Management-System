# Gender Health Care API

Hệ thống API để quản lý thông tin người dùng cho ứng dụng Gender Health Care.

## Cài đặt và chạy

### Yêu cầu
- Java 24
- Maven

### Cài đặt

```bash
# Clone repository
git clone [repository-url]

# Di chuyển vào thư mục dự án
cd gender-healthcare

# Biên dịch và chạy ứng dụng
mvn spring-boot:run
```

Ứng dụng sẽ chạy tại địa chỉ: http://localhost:8080

## API Endpoints

### User API

#### Lấy danh sách tất cả user
```
GET /api/users
```

#### Lấy thông tin user theo ID
```
GET /api/users/{id}
```

#### Tạo user mới
```
POST /api/users
```
Body:
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

#### Cập nhật thông tin user
```
PUT /api/users/{id}
```
Body (các trường có thể bỏ trống nếu không cập nhật):
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana_new@example.com",
  "password": "newpassword123"
}
```

#### Xóa user
```
DELETE /api/users/{id}
```

## Cơ sở dữ liệu

Ứng dụng sử dụng H2 database (database trong bộ nhớ) trong môi trường phát triển.
Bạn có thể truy cập giao diện quản lý H2 tại: http://localhost:8080/h2-console

Thông tin đăng nhập:
- JDBC URL: jdbc:h2:mem:testdb
- Username: sa
- Password: (để trống)

## Công nghệ sử dụng

- Spring Boot 3.4.6
- Spring Data JPA
- Spring Validation
- H2 Database
- Lombok
