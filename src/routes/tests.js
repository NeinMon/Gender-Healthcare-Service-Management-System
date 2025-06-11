// Route cho Tests (STI Tests)
import express from 'express';
const router = express.Router();

// GET /api/tests - Lấy danh sách xét nghiệm STI (admin only)
router.get('/', (req, res) => {
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

// POST /api/tests - Đăng ký xét nghiệm STI mới
router.post('/', (req, res) => {
  res.status(201).json({ message: 'STI test record created successfully', testId: 3 });
});

// GET /api/tests/my - Lấy danh sách xét nghiệm của người dùng hiện tại
router.get('/my', (req, res) => {
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

export default router;
