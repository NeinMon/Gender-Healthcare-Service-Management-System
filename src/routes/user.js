// Route cho user
import express from 'express';
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
router.get('/', (req, res) => {
  res.json([
    { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@example.com", role: "customer" },
    { id: 2, name: "Trần Thị B", email: "tranthib@example.com", role: "consultant" }
  ]);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID người dùng
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id === 1) {
    res.json({ id: 1, name: "Nguyễn Văn A", email: "nguyenvana@example.com", role: "customer" });
  } else {
    res.status(404).json({ message: "Không tìm thấy người dùng" });
  }
});

export default router;
