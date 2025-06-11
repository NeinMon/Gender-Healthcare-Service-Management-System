// Route cho mensualcycle
import express from 'express';
const router = express.Router();

// GET /api/mensual-cycles/my - Lấy danh sách chu kỳ của người dùng hiện tại
router.get('/my', (req, res) => {
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

// POST /api/mensual-cycles - Thêm mới chu kỳ kinh nguyệt
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Mensual cycle record created successfully', mensualCycleId: 3 });
});

// PUT /api/mensual-cycles/:id - Cập nhật chu kỳ đã khai báo
router.put('/:id', (req, res) => {
  res.json({
    mensualCycleId: req.params.id,
    serviceId: 3,
    customerId: 1,
    startDate: req.body.startDate || '2025-06-12',
    endDate: req.body.endDate || '2025-06-18',
    note: req.body.note || 'Chu kỳ đã cập nhật'
  });
});

// DELETE /api/mensual-cycles/:id - Xóa chu kỳ
router.delete('/:id', (req, res) => {
  res.json({ message: 'Mensual cycle deleted successfully' });
});

export default router;
