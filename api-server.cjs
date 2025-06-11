const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');
// Đường dẫn tới các module route

// Tạo ứng dụng Express
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());

// Cấu hình Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gender Healthcare Service Management API',
      version: '1.0.0',
      description: 'API Documentation for Gender Healthcare Service Management',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development Server',
      },
    ],
  },
  apis: ['./api-server.cjs'], // API được định nghĩa trong file hiện tại
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         roleId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Service:
 *       type: object
 *       properties:
 *         serviceId:
 *           type: integer
 *         serviceName:
 *           type: string
 *         description:
 *           type: string
 *         managerId:
 *           type: integer
 *     Booking:
 *       type: object
 *       properties:
 *         bookId:
 *           type: integer
 *         customerId:
 *           type: integer
 *         consultantId:
 *           type: integer
 *         serviceId:
 *           type: integer
 *         bookingDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *     Consultation:
 *       type: object
 *       properties:
 *         consultationId:
 *           type: integer
 *         serviceId:
 *           type: integer
 *         customerId:
 *           type: integer
 *         consultantId:
 *           type: integer
 *         bookingId:
 *           type: integer
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *     STITest:
 *       type: object
 *       properties:
 *         testId:
 *           type: integer
 *         serviceId:
 *           type: integer
 *         staffId:
 *           type: integer
 *         testDate:
 *           type: string
 *           format: date
 *         result:
 *           type: string
 *     Feedback:
 *       type: object
 *       properties:
 *         feedbackId:
 *           type: integer
 *         customerId:
 *           type: integer
 *         serviceId:
 *           type: integer
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     MensualCycle:
 *       type: object
 *       properties:
 *         mensualCycleId:
 *           type: integer
 *         serviceId:
 *           type: integer
 *         customerId:
 *           type: integer
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         note:
 *           type: string
 *     Question:
 *       type: object
 *       properties:
 *         questionId:
 *           type: integer
 *         content:
 *           type: string
 *         customerId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Answer:
 *       type: object
 *       properties:
 *         answerId:
 *           type: integer
 *         questionId:
 *           type: integer
 *         consultantId:
 *           type: integer
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Post:
 *       type: object
 *       properties:
 *         postId:
 *           type: integer
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         adminId:
 *           type: integer
 *     Role:
 *       type: object
 *       properties:
 *         roleId:
 *           type: integer
 *         roleName:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Quản lý người dùng
 *   - name: Services
 *     description: Quản lý dịch vụ 
 *   - name: Bookings
 *     description: Quản lý đặt lịch
 *   - name: Consultations
 *     description: Quản lý tư vấn trực tuyến
 *   - name: STITests
 *     description: Quản lý xét nghiệm STI
 *   - name: MensualCycles
 *     description: Quản lý chu kỳ kinh nguyệt
 *   - name: Questions
 *     description: Quản lý câu hỏi
 *   - name: Answers
 *     description: Quản lý câu trả lời
 *   - name: Feedbacks
 *     description: Quản lý phản hồi
 *   - name: Posts
 *     description: Quản lý bài viết
 *   - name: Roles
 *     description: Quản lý vai trò
 */

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Test API endpoint
 *     description: Test if the API server is working
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API is working"
 */
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Đăng nhập người dùng
 *     description: Đăng nhập vào hệ thống và nhận JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Đăng nhập thất bại
 * 
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Đăng ký tài khoản mới
 *     description: Đăng ký người dùng mới vào hệ thống
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đăng ký thành công"
 *                 userId:
 *                   type: integer
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc email đã tồn tại
 *
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Lấy danh sách người dùng
 *     description: Lấy danh sách tất cả người dùng (chỉ admin)
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Không có quyền truy cập
 * 
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Xem thông tin cá nhân
 *     description: Lấy thông tin người dùng hiện tại
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Không có quyền truy cập
 *   put:
 *     tags: [Users]
 *     summary: Cập nhật thông tin cá nhân
 *     description: Cập nhật thông tin người dùng hiện tại
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
app.get('/api/users', (req, res) => {
  res.json([
    { userId: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', roleId: 1 },
    { userId: 2, name: 'Trần Thị B', email: 'tranthib@example.com', roleId: 2 }
  ]);
});

app.post('/api/users', (req, res) => {
  res.status(201).json({ message: 'User created successfully', userId: 3 });
});

/**
 * @swagger
 * /api/services:
 *   get:
 *     tags: [Services]
 *     summary: Danh sách dịch vụ
 *     description: Lấy danh sách tất cả dịch vụ hiện có
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *   post:
 *     tags: [Services]
 *     summary: Tạo dịch vụ mới
 *     description: Tạo một dịch vụ mới (chỉ admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Tạo dịch vụ thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *
 * /api/services/{id}:
 *   get:
 *     tags: [Services]
 *     summary: Chi tiết dịch vụ
 *     description: Lấy thông tin chi tiết của một dịch vụ
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của dịch vụ
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Không tìm thấy dịch vụ
 */
app.get('/api/services', (req, res) => {
  res.json([
    { serviceId: 1, serviceName: 'Tư vấn sức khỏe sinh sản', description: 'Dịch vụ tư vấn về sức khỏe sinh sản', managerId: 1 },
    { serviceId: 2, serviceName: 'Xét nghiệm STI', description: 'Dịch vụ xét nghiệm các bệnh lây truyền qua đường tình dục', managerId: 2 },
    { serviceId: 3, serviceName: 'Theo dõi kinh nguyệt', description: 'Dịch vụ theo dõi chu kỳ kinh nguyệt', managerId: 1 }
  ]);
});

app.post('/api/services', (req, res) => {
  res.status(201).json({ message: 'Service created successfully', serviceId: 4 });
});

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get all bookings
 *     description: Retrieve a list of all bookings
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking
 *     description: Create a new booking in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid input
 */
app.get('/api/bookings', (req, res) => {
  res.json([
    { bookId: 1, customerId: 1, consultantId: 2, serviceId: 1, bookingDate: '2025-06-15T10:00:00Z', status: 'confirmed' },
    { bookId: 2, customerId: 1, consultantId: 2, serviceId: 2, bookingDate: '2025-06-20T14:00:00Z', status: 'pending' }
  ]);
});

app.post('/api/bookings', (req, res) => {
  res.status(201).json({ message: 'Booking created successfully', bookId: 3 });
});

/**
 * @swagger
 * /api/consultations:
 *   get:
 *     tags: [Consultations]
 *     summary: Danh sách tư vấn
 *     description: Lấy danh sách tất cả các lịch tư vấn (chỉ admin)
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consultation'
 *       401:
 *         description: Không có quyền truy cập
 *   post:
 *     tags: [Consultations]
 *     summary: Đặt lịch tư vấn
 *     description: Đặt lịch tư vấn mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Consultation'
 *     responses:
 *       201:
 *         description: Đặt lịch tư vấn thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *
 * /api/consultations/my:
 *   get:
 *     tags: [Consultations]
 *     summary: Danh sách lịch đã đặt của tôi
 *     description: Lấy danh sách lịch tư vấn đã đặt của người dùng hiện tại
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consultation'
 *       401:
 *         description: Không có quyền truy cập
 */
app.get('/api/consultations', (req, res) => {
  res.json([
    { 
      consultationId: 1, 
      serviceId: 1, 
      customerId: 1, 
      consultantId: 2, 
      bookingId: 1, 
      startTime: '2025-06-15T10:00:00Z', 
      endTime: '2025-06-15T11:00:00Z' 
    },
    { 
      consultationId: 2, 
      serviceId: 2, 
      customerId: 1, 
      consultantId: 2, 
      bookingId: 2, 
      startTime: '2025-06-20T14:00:00Z', 
      endTime: '2025-06-20T15:00:00Z' 
    }
  ]);
});

app.post('/api/consultations', (req, res) => {
  res.status(201).json({ message: 'Consultation created successfully', consultationId: 3 });
});

/**
 * @swagger
 * /api/tests:
 *   get:
 *     tags: [STITests]
 *     summary: Danh sách xét nghiệm STI
 *     description: Lấy danh sách tất cả xét nghiệm STI (chỉ admin)
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/STITest'
 *       401:
 *         description: Không có quyền truy cập
 *   post:
 *     tags: [STITests]
 *     summary: Đăng ký xét nghiệm STI
 *     description: Đăng ký thực hiện xét nghiệm STI mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/STITest'
 *     responses:
 *       201:
 *         description: Đăng ký xét nghiệm thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *
 * /api/tests/my:
 *   get:
 *     tags: [STITests]
 *     summary: Lịch sử xét nghiệm của tôi
 *     description: Lấy danh sách xét nghiệm STI của người dùng hiện tại
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/STITest'
 *       401:
 *         description: Không có quyền truy cập
 */
app.get('/api/tests', (req, res) => {
  res.json([
    { 
      testId: 1, 
      serviceId: 2, 
      staffId: 3, 
      testDate: '2025-06-10', 
      result: 'Âm tính' 
    },
    { 
      testId: 2, 
      serviceId: 2, 
      staffId: 3, 
      testDate: '2025-06-05', 
      result: 'Chưa có kết quả' 
    }
  ]);
});

app.post('/api/tests', (req, res) => {
  res.status(201).json({ message: 'STI test record created successfully', testId: 3 });
});

/**
 * @swagger
 * /api/feedbacks:
 *   get:
 *     tags: [Feedbacks]
 *     summary: Xem feedback đã gửi
 *     description: Xem các feedback đã gửi của người dùng hiện tại
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *       401:
 *         description: Không có quyền truy cập
 *   post:
 *     tags: [Feedbacks]
 *     summary: Gửi feedback dịch vụ
 *     description: Gửi phản hồi về một dịch vụ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - content
 *             properties:
 *               serviceId:
 *                 type: integer
 *                 description: ID của dịch vụ cần phản hồi
 *               content:
 *                 type: string
 *                 description: Nội dung phản hồi
 *     responses:
 *       201:
 *         description: Gửi feedback thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy dịch vụ
 */
app.get('/api/feedbacks', (req, res) => {
  res.json([
    { 
      feedbackId: 1, 
      customerId: 1, 
      serviceId: 1, 
      content: 'Dịch vụ rất tốt, tư vấn viên nhiệt tình', 
      createdAt: '2025-06-15T12:00:00Z' 
    },
    { 
      feedbackId: 2, 
      customerId: 1, 
      serviceId: 2, 
      content: 'Xét nghiệm nhanh và chính xác', 
      createdAt: '2025-06-06T16:30:00Z' 
    }
  ]);
});

app.post('/api/feedbacks', (req, res) => {
  res.status(201).json({ message: 'Feedback created successfully', feedbackId: 3 });
});

/**
 * @swagger
 * /api/mensual-cycles/my:
 *   get:
 *     tags: [MensualCycles]
 *     summary: Lấy danh sách chu kỳ của người dùng hiện tại
 *     description: Xem danh sách chu kỳ kinh nguyệt của người dùng đăng nhập
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MensualCycle'
 *       401:
 *         description: Không có quyền truy cập
 *
 * /api/mensual-cycles:
 *   post:
 *     tags: [MensualCycles]
 *     summary: Thêm mới chu kỳ kinh nguyệt
 *     description: Tạo mới một chu kỳ kinh nguyệt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo chu kỳ thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensualCycle'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *
 * /api/mensual-cycles/{id}:
 *   put:
 *     tags: [MensualCycles]
 *     summary: Cập nhật chu kỳ đã khai báo
 *     description: Chỉnh sửa thông tin chu kỳ kinh nguyệt
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của chu kỳ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensualCycle'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy chu kỳ
 *   delete:
 *     tags: [MensualCycles]
 *     summary: Xóa chu kỳ
 *     description: Xóa một chu kỳ kinh nguyệt
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của chu kỳ
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy chu kỳ
 */
app.get('/api/mensual-cycles/my', (req, res) => {
  res.json([
    { 
      mensualCycleId: 1, 
      serviceId: 3, 
      customerId: 1, 
      startDate: '2025-05-15', 
      endDate: '2025-05-21', 
      note: 'Chu kỳ bình thường' 
    },
    { 
      mensualCycleId: 2, 
      serviceId: 3, 
      customerId: 1, 
      startDate: '2025-06-12', 
      endDate: '2025-06-18', 
      note: 'Chu kỳ bình thường' 
    }
  ]);
});

app.post('/api/mensual-cycles', (req, res) => {
  res.status(201).json({ message: 'Mensual cycle record created successfully', mensualCycleId: 3 });
});

/**
 * @swagger
 * /api/questions:
 *   get:
 *     tags: [Questions]
 *     summary: Xem danh sách câu hỏi
 *     description: Lấy danh sách tất cả các câu hỏi
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *   post:
 *     tags: [Questions]
 *     summary: Gửi câu hỏi
 *     description: Gửi câu hỏi mới vào hệ thống
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung câu hỏi
 *     responses:
 *       201:
 *         description: Gửi câu hỏi thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
app.get('/api/questions', (req, res) => {
  res.json([
    { 
      questionId: 1, 
      content: 'Làm thế nào để phòng tránh các bệnh lây truyền qua đường tình dục?', 
      customerId: 1, 
      createdAt: '2025-06-10T09:15:00Z' 
    },
    { 
      questionId: 2, 
      content: 'Chu kỳ kinh nguyệt không đều có nguy hiểm không?', 
      customerId: 1, 
      createdAt: '2025-06-08T14:20:00Z' 
    }
  ]);
});

app.post('/api/questions', (req, res) => {
  res.status(201).json({ message: 'Question created successfully', questionId: 3 });
});

/**
 * @swagger
 * /api/answers:
 *   get:
 *     tags: [Answers]
 *     summary: Lấy danh sách câu trả lời
 *     description: Xem tất cả câu trả lời trong hệ thống
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Answer'
 *
 * /api/answers/{id}:
 *   post:
 *     tags: [Answers]
 *     summary: Trả lời câu hỏi
 *     description: Thêm câu trả lời cho một câu hỏi (chỉ consultant)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của câu hỏi cần trả lời
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung câu trả lời
 *     responses:
 *       201:
 *         description: Trả lời thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Answer'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy câu hỏi
 */
app.get('/api/answers', (req, res) => {
  res.json([
    { 
      answerId: 1, 
      questionId: 1, 
      consultantId: 2, 
      content: 'Sử dụng bao cao su đúng cách là biện pháp hiệu quả nhất để phòng tránh các bệnh lây truyền qua đường tình dục. Ngoài ra, bạn nên kiểm tra sức khỏe định kỳ.', 
      createdAt: '2025-06-10T10:30:00Z' 
    },
    { 
      answerId: 2, 
      questionId: 2, 
      consultantId: 2, 
      content: 'Chu kỳ kinh nguyệt không đều có thể là dấu hiệu của một số vấn đề sức khỏe, nhưng không phải lúc nào cũng nguy hiểm. Bạn nên đến gặp bác sĩ để được kiểm tra cụ thể.', 
      createdAt: '2025-06-08T16:45:00Z' 
    }
  ]);
});

app.post('/api/answers', (req, res) => {
  res.status(201).json({ message: 'Answer created successfully', answerId: 3 });
});

/**
 * @swagger
 * /api/posts:
 *   get:
 *     tags: [Posts]
 *     summary: Danh sách bài viết
 *     description: Lấy danh sách tất cả bài viết
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *   post:
 *     tags: [Posts]
 *     summary: Tạo bài viết mới
 *     description: Tạo bài viết mới (chỉ admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Tạo bài viết thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 * 
 * /api/posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Chi tiết bài viết
 *     description: Lấy thông tin chi tiết của một bài viết
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Không tìm thấy bài viết
 */
app.get('/api/posts', (req, res) => {
  res.json([
    { 
      postId: 1, 
      title: 'Sức khỏe sinh sản ở tuổi dậy thì', 
      content: 'Bài viết chia sẻ thông tin về sức khỏe sinh sản cần thiết cho các bạn trẻ tuổi dậy thì...', 
      createdAt: '2025-06-01T08:00:00Z', 
      adminId: 3 
    },
    { 
      postId: 2, 
      title: 'Cách phòng tránh các bệnh lây truyền qua đường tình dục', 
      content: 'Bài viết hướng dẫn các biện pháp phòng tránh các bệnh lây truyền qua đường tình dục hiệu quả...', 
      createdAt: '2025-06-05T10:15:00Z', 
      adminId: 3 
    }
  ]);
});

app.post('/api/posts', (req, res) => {
  res.status(201).json({ message: 'Post created successfully', postId: 3 });
});

/**
 * @swagger
 * /api/roles:
 *   get:
 *     tags: [Roles]
 *     summary: Get all roles
 *     description: Retrieve a list of all user roles
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
app.get('/api/roles', (req, res) => {
  res.json([
    { roleId: 1, roleName: 'admin' },
    { roleId: 2, roleName: 'consultant' },
    { roleId: 3, roleName: 'customer' },
    { roleId: 4, roleName: 'staff' }
  ]);
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'user@example.com' && password === 'password') {
    res.json({ 
      token: 'mock-jwt-token',
      user: { 
        userId: 1, 
        name: 'Nguyễn Văn A', 
        email: 'nguyenvana@example.com', 
        roleId: 3 
      }
    });
  } else {
    res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Thiếu thông tin đăng ký' });
    return;
  }
  res.status(201).json({ message: 'Đăng ký thành công', userId: 4 });
});

// Tests endpoints
app.get('/api/tests/my', (req, res) => {
  res.json([
    { 
      testId: 1, 
      serviceId: 2, 
      staffId: 3, 
      testDate: '2025-06-10', 
      result: 'Âm tính' 
    }
  ]);
});

app.put('/api/tests/:id', (req, res) => {
  res.json({ 
    testId: req.params.id, 
    serviceId: 2, 
    staffId: 3, 
    testDate: req.body.testDate || '2025-06-10', 
    result: req.body.result || 'Cập nhật kết quả' 
  });
});

app.delete('/api/tests/:id', (req, res) => {
  res.json({ message: 'Test record deleted successfully' });
});

// Mensual cycle endpoints
app.put('/api/mensual-cycles/:id', (req, res) => {
  res.json({
    mensualCycleId: req.params.id,
    serviceId: 3,
    customerId: 1,
    startDate: req.body.startDate || '2025-06-12',
    endDate: req.body.endDate || '2025-06-18',
    note: req.body.note || 'Chu kỳ đã cập nhật'
  });
});

app.delete('/api/mensual-cycles/:id', (req, res) => {
  res.json({ message: 'Mensual cycle deleted successfully' });
});

// Trang chủ chuyển hướng đến Swagger
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Khởi động server
app.listen(PORT, () => {
  console.log('==========================================');
  console.log(`API Server đang chạy tại http://localhost:${PORT}`);
  console.log(`Swagger UI có sẵn tại http://localhost:${PORT}/api-docs`);
  console.log('==========================================');
  
  // Hiển thị một thông báo đơn giản để xác nhận server đang chạy
  process.stdout.write('Server đang chạy... Nhấn Ctrl+C để dừng\n');
});
