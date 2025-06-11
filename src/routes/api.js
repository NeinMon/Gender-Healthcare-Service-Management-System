// Danh sách các route API dựa trên sơ đồ CSDL
import express from 'express';
import userRoutes from './user.js';
import serviceRoutes from './service.js';
import consultationRoutes from './consultation.js';
import bookingRoutes from './booking.js';
import testsRoutes from './tests.js';
import feedbackRoutes from './feedback.js';
import mensualCycleRoutes from './mensualcycle.js';
import questionAnswerRoutes from './question_answer.js';
import postRoutes from './post.js';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách người dùng
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 */
router.get('/users', (req, res) => {
  res.json([]);
});

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Lấy danh sách dịch vụ
 *     responses:
 *       200:
 *         description: Danh sách dịch vụ
 */
router.get('/services', (req, res) => {
  res.json([]);
});

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Lấy danh sách câu hỏi
 *     responses:
 *       200:
 *         description: Danh sách câu hỏi
 */
router.get('/questions', (req, res) => {
  res.json([]);
});

/**
 * @swagger
 * /api/answers:
 *   get:
 *     summary: Lấy danh sách câu trả lời
 *     responses:
 *       200:
 *         description: Danh sách câu trả lời
 */
router.get('/answers', (req, res) => {
  res.json([]);
});

/**
 * @swagger
 * /api/feedbacks:
 *   get:
 *     summary: Lấy danh sách phản hồi
 *     responses:
 *       200:
 *         description: Danh sách phản hồi
 */
router.get('/feedbacks', (req, res) => {
  res.json([]);
});

// Đăng ký các route
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/consultations', consultationRoutes);
router.use('/bookings', bookingRoutes);
router.use('/tests', testsRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/mensual-cycles', mensualCycleRoutes);
router.use('/questions', questionAnswerRoutes); // Contains both questions and answers routes
router.use('/posts', postRoutes);

export default router;
