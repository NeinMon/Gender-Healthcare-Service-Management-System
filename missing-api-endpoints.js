// Add additional routes for API server

// Add tests endpoints
// GET /api/tests/my - Lịch sử xét nghiệm của tôi
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

// PUT /api/tests/:id - Cập nhật kết quả xét nghiệm
app.put('/api/tests/:id', (req, res) => {
  res.json({ 
    testId: req.params.id, 
    serviceId: 2, 
    staffId: 3, 
    testDate: req.body.testDate || '2025-06-10', 
    result: req.body.result || 'Cập nhật kết quả' 
  });
});

// DELETE /api/tests/:id - Xóa kết quả xét nghiệm
app.delete('/api/tests/:id', (req, res) => {
  res.json({ message: 'Test record deleted successfully' });
});

// Add mensual cycle routes
// PUT /api/mensual-cycles/:id - Cập nhật chu kỳ đã khai báo
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

// DELETE /api/mensual-cycles/:id - Xóa chu kỳ
app.delete('/api/mensual-cycles/:id', (req, res) => {
  res.json({ message: 'Mensual cycle deleted successfully' });
});

// Add auth endpoints
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
