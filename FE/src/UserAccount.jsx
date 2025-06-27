import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UserAccount = () => {  const [userInfo, setUserInfo] = useState({
    userID: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    dob: '',
    formattedDob: '',
    role: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...userInfo });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    // Lấy userId từ localStorage sau khi đăng nhập
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }
    // Gọi API để lấy thông tin người dùng theo userId
    fetch(`http://localhost:8080/api/users/${userId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Không thể lấy thông tin tài khoản.');
        }
        return res.json();
      })
      .then(data => {
        if (!data || !data.email) {
          setError('Không tìm thấy thông tin tài khoản.');
          setLoading(false);
          return;
        }
        
        // Định dạng lại ngày tháng nếu có
        if (data.dob) {
          const dobDate = new Date(data.dob);
          data.formattedDob = dobDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
        }
        
        setUserInfo(data);
        setEditData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setError('Không thể lấy thông tin tài khoản.');
        setLoading(false);
      });
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...userInfo });
  };
  const handleSave = async () => {
    try {
      const userId = localStorage.getItem('userId');
      // Prepare the data to be sent
      const updateData = { ...editData };
      
      // Convert formattedDob back to dob if needed
      if (updateData.formattedDob) {
        updateData.dob = new Date(updateData.formattedDob).toISOString();
        delete updateData.formattedDob;
      }
      
      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Không thể cập nhật thông tin.');
      }
      
      const updatedUser = await response.json();
      
      // Format the date for display
      if (updatedUser.dob) {
        updatedUser.formattedDob = new Date(updatedUser.dob).toISOString().split('T')[0];
      }
      
      setUserInfo(updatedUser);
      setEditData(updatedUser);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error("Error updating user:", err);
      alert('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
    }
  };

  const handleCancel = () => {
    setEditData({ ...userInfo });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ 
      backgroundColor: "#f0f9ff !important", 
      background: "#f0f9ff !important",
      colorScheme: "light",
      minHeight: "100vh",
      width: "100vw",
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 0,
        position: "relative"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          paddingTop: 12,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 12,
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <img
              src="/Logo.png"
              alt="Logo"
              style={{ height: 70, width: 70, objectFit: "contain" }}
            />
            <Link 
              to="/" 
              style={{ 
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                textDecoration: "none",
                padding: "4px 20px",
                borderRadius: "14px",
                fontSize: "13px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)"}
              onMouseOut={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)"}
            >
              <span>←</span> Quay lại trang chủ
            </Link>
          </div>
          
          <h1
            style={{
              color: "#fff",
              margin: 0,
              padding: 0,
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: 1,
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              width: "auto"
            }}
          >
            Thông Tin Tài Khoản
          </h1>
          
          <div style={{ 
            width: 36, 
            height: 36, 
            borderRadius: "50%", 
            backgroundColor: "rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "16px",
            border: "2px solid rgba(255,255,255,0.5)"
          }}>
            {userInfo.fullName ? userInfo.fullName.charAt(0) : "U"}
          </div>
        </div>
      </header>

      <main style={{
        padding: "40px 20px",
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        {loading ? (
          <div>Đang tải thông tin tài khoản...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(8, 145, 178, 0.1)",
          marginBottom: "30px"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px"
          }}>
            <h2 style={{
              color: "#0891b2",
              fontSize: "28px",
              fontWeight: "700",
              margin: 0
            }}>
              Thông Tin Cá Nhân
            </h2>
            
            {!isEditing ? (
              <button
                onClick={handleEdit}
                style={{
                  background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                Chỉnh Sửa
              </button>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleSave}
                  style={{
                    background: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Lưu
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    background: "linear-gradient(135deg, #f44336 0%, #ef5350 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Hủy
                </button>
              </div>
            )}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px"
          }}>            {Object.entries(isEditing ? editData : userInfo).map(([key, value]) => {
              // Skip certain fields
              if (typeof value === 'object' && value !== null) return null;
              if (['userID', 'password', 'createdAt', 'updateAt', 'role', 'specification'].includes(key)) return null; // Added 'specification' to excluded fields
              if (key === 'dob' && userInfo.formattedDob) return null; // Skip dob if formattedDob exists
              return (
                <div key={key} style={{
                  padding: "20px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0"
                }}>                  <label style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#64748b",
                    marginBottom: "8px",
                    display: "block",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>                    {key === 'fullName' ? 'Họ Tên' :
                     key === 'email' ? 'Email' :
                     key === 'phone' ? 'Số Điện Thoại' :
                     key === 'address' ? 'Địa Chỉ' :
                     key === 'gender' ? 'Giới Tính' :
                     key === 'dob' ? 'Ngày Sinh' : 
                     key === 'formattedDob' ? 'Ngày Sinh' : key}
                  </label>
                  {isEditing ? (
                    key === 'gender' ? (
                      <select
                        name={key}
                        value={value}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "12px",
                          fontSize: "16px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "8px",
                          outline: "none",
                          transition: "border-color 0.3s ease"
                        }}
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>                    ) : key === 'formattedDob' || key === 'dob' ? (
                      <input
                        type="date"
                        name={key}
                        value={key === 'formattedDob' ? value : value.split('T')[0]}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "12px",
                          fontSize: "16px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "8px",
                          outline: "none",
                          transition: "border-color 0.3s ease"
                        }}
                      />
                    ) : (
                      <input
                        type={key === 'email' ? 'email' : 'text'}
                        name={key}
                        value={value}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "12px",
                          fontSize: "16px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "8px",
                          outline: "none",
                          transition: "border-color 0.3s ease"
                        }}
                      />
                    )
                  ) : (                    <div style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1e293b",
                      padding: "12px 0"
                    }}>                      {key === 'dob' || key === 'formattedDob' ? 
                        (value ? new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa cập nhật') :
                       value || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}
        {/* Cài Đặt Tài Khoản */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(8, 145, 178, 0.1)",
          marginBottom: "0"
        }}>
          <h2 style={{
            color: "#0891b2",
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "30px"
          }}>
            Cài Đặt Tài Khoản
          </h2>
          <div style={{
            display: "grid",
            gap: "20px"
          }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px",
                backgroundColor: "#fef2f2",
                borderRadius: "12px",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onClick={() => {
                if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
                  // Xóa tất cả dữ liệu session/localStorage
                  localStorage.removeItem('loggedInUser');
                  localStorage.removeItem('userId');
                  localStorage.removeItem('email');
                  localStorage.removeItem('fullName');
                  localStorage.removeItem('role');
                  
                  // Xóa sessionStorage nếu có
                  sessionStorage.clear();
                  
                  // Chuyển hướng về trang chủ
                  window.location.href = "/";
                }
              }}
            >
              <span>🚪 Đăng Xuất</span>
              <span style={{ fontSize: "18px" }}>→</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserAccount;
