import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    price: '',
    managerId: 1 // Default manager ID, có thể lấy từ login session
  });

  // Load services khi component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Lấy danh sách services từ API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        console.error('Failed to fetch services');
        alert('Không thể tải danh sách dịch vụ');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      alert('Lỗi kết nối khi tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm services
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchServices(); // Load lại tất cả nếu search term rỗng
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/services/search?name=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        console.error('Failed to search services');
        alert('Không thể tìm kiếm dịch vụ');
      }
    } catch (error) {
      console.error('Error searching services:', error);
      alert('Lỗi kết nối khi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      serviceName: '',
      description: '',
      price: '',
      managerId: 1
    });
  };

  // Show alert message
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Thêm service mới
  const handleAddService = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.serviceName.trim()) {
      alert('Vui lòng nhập tên dịch vụ');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) < 1000) {
      alert('Giá dịch vụ phải từ 1,000 VNĐ trở lên');
      return;
    }

    try {
      const serviceData = {
        serviceName: formData.serviceName.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        managerId: formData.managerId
      };

      const response = await fetch('http://localhost:8080/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData)
      });

      if (response.ok) {
        showAlert('success', 'Thêm dịch vụ thành công!');
        setShowAddModal(false);
        resetForm();
        fetchServices(); // Reload danh sách
      } else {
        const errorText = await response.text();
        console.error('Failed to add service:', errorText);
        showAlert('error', 'Không thể thêm dịch vụ: ' + errorText);
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Lỗi kết nối khi thêm dịch vụ');
    }
  };

  // Sửa service
  const handleEditService = async (e) => {
    e.preventDefault();
    
    if (!editingService) return;

    // Validation
    if (!formData.serviceName.trim()) {
      alert('Vui lòng nhập tên dịch vụ');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) < 1000) {
      alert('Giá dịch vụ phải từ 1,000 VNĐ trở lên');
      return;
    }

    try {
      const serviceData = {
        serviceName: formData.serviceName.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        managerId: formData.managerId
      };

      const response = await fetch(`http://localhost:8080/api/services/${editingService.serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData)
      });

      if (response.ok) {
        showAlert('success', 'Cập nhật dịch vụ thành công!');
        setShowEditModal(false);
        setEditingService(null);
        resetForm();
        fetchServices(); // Reload danh sách
      } else {
        const errorText = await response.text();
        console.error('Failed to update service:', errorText);
        showAlert('error', 'Không thể cập nhật dịch vụ: ' + errorText);
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Lỗi kết nối khi cập nhật dịch vụ');
    }
  };

  // Xóa service
  const handleDeleteService = async (serviceId, serviceName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${serviceName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/services/${serviceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showAlert('success', 'Xóa dịch vụ thành công!');
        fetchServices(); // Reload danh sách
      } else {
        const errorText = await response.text();
        console.error('Failed to delete service:', errorText);
        showAlert('error', 'Không thể xóa dịch vụ: ' + errorText);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Lỗi kết nối khi xóa dịch vụ');
    }
  };

  // Mở modal edit và load dữ liệu service
  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      serviceName: service.serviceName,
      description: service.description || '',
      price: service.price.toString(),
      managerId: service.managerId
    });
    setShowEditModal(true);
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
  };

  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100vw" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        paddingBottom: 0,
        position: "relative",
        width: "100%"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "15px 20px"
        }}>
          <img
            src="/Logo.png"
            alt="Logo"
            style={{ height: 60, width: 60, objectFit: "contain" }}
          />
          <h1
            style={{
              color: "#fff",
              margin: 0,
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: "2rem"
            }}
          >
            Quản lý Dịch vụ
          </h1>
          <UserAvatar userName="Manager" />
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: "40px",
        width: "100%",
        flex: 1,
        backgroundColor: "#fff",
        boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
        marginTop: "-20px",
        boxSizing: "border-box"
      }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: "20px" }}>
          <Link 
            to="/" 
            style={{
              display: "flex",
              alignItems: "center",
              color: "#0891b2",
              textDecoration: "none",
              fontWeight: 500
            }}
          >
            ← Quay lại trang chủ
          </Link>
        </div>

        {/* Alert Messages */}
        {alert.show && (
          <div style={{ 
            backgroundColor: alert.type === 'success' ? "#d1fae5" : "#fee2e2",
            border: `1px solid ${alert.type === 'success' ? "#a7f3d0" : "#fecaca"}`,
            color: alert.type === 'success' ? "#065f46" : "#991b1b",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}>
            {alert.message}
          </div>
        )}

        {/* Search và Add Button */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "30px",
          flexWrap: "wrap",
          gap: "15px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e1e1e1",
                fontSize: "14px",
                minWidth: "300px"
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              style={{
                background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                color: "#fff",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              🔍 Tìm kiếm
            </button>
            <button
              onClick={fetchServices}
              style={{
                background: "#6b7280",
                color: "#fff",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              🔄 Làm mới
            </button>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            style={{
              background: "linear-gradient(90deg, #16a34a 0%, #22c55e 100%)",
              color: "#fff",
              border: "none",
              padding: "12px 25px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            ➕ Thêm dịch vụ mới
          </button>
        </div>

        {/* Services Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div style={{ fontSize: "18px", color: "#666", marginTop: "20px" }}>Đang tải dữ liệu...</div>
          </div>
        ) : (
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={tableHeaderStyle}>ID</th>
                  <th style={tableHeaderStyle}>Tên dịch vụ</th>
                  <th style={tableHeaderStyle}>Mô tả</th>
                  <th style={tableHeaderStyle}>Giá</th>
                  <th style={tableHeaderStyle}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ ...tableCellStyle, textAlign: "center", color: "#666", fontStyle: "italic" }}>
                      {searchTerm ? `Không tìm thấy dịch vụ nào với từ khóa "${searchTerm}"` : "Không có dịch vụ nào"}
                    </td>
                  </tr>
                ) : (
                  services.map((service, index) => (
                    <tr key={service.serviceId} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb" }}>
                      <td style={tableCellStyle}>{service.serviceId}</td>
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: "600", color: "#1f2937" }}>
                          {service.serviceName}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {service.description || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Không có mô tả</span>}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: "600", color: "#059669" }}>
                          {formatPrice(service.price)}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => openEditModal(service)}
                            style={{
                              background: "#3b82f6",
                              color: "#fff",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              cursor: "pointer"
                            }}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.serviceId, service.serviceName)}
                            style={{
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              cursor: "pointer"
                            }}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Summary */}
            {services.length > 0 && (
              <div style={{ 
                padding: "16px", 
                backgroundColor: "#f8fafc", 
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "14px",
                color: "#6b7280"
              }}>
                <span>Tổng số dịch vụ: <strong style={{ color: "#1f2937" }}>{services.length}</strong></span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#1f2937" }}>Thêm dịch vụ mới</h3>
            <form onSubmit={handleAddService}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Tên dịch vụ *</label>
                <input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                  placeholder="Nhập tên dịch vụ"
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, height: "100px" }}
                  placeholder="Nhập mô tả dịch vụ (tùy chọn)"
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Giá (VNĐ) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="1000"
                  style={inputStyle}
                  placeholder="Nhập giá dịch vụ (tối thiểu 1,000 VNĐ)"
                />
              </div>
              
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "30px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  style={{
                    ...buttonStyle,
                    background: "#6b7280"
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    background: "linear-gradient(90deg, #16a34a 0%, #22c55e 100%)"
                  }}
                >
                  Thêm dịch vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingService && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#1f2937" }}>
              Sửa dịch vụ: {editingService.serviceName}
            </h3>
            <form onSubmit={handleEditService}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Tên dịch vụ *</label>
                <input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                  placeholder="Nhập tên dịch vụ"
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{ ...inputStyle, height: "100px" }}
                  placeholder="Nhập mô tả dịch vụ (tùy chọn)"
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Giá (VNĐ) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="1000"
                  style={inputStyle}
                  placeholder="Nhập giá dịch vụ (tối thiểu 1,000 VNĐ)"
                />
              </div>
              
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "30px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingService(null);
                    resetForm();
                  }}
                  style={{
                    ...buttonStyle,
                    background: "#6b7280"
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    background: "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)"
                  }}
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        marginTop: "40px",
        padding: "20px",
        backgroundColor: "#e0f2fe",
        textAlign: "center",
        color: "#0891b2",
        width: "100%"
      }}>
        <p>© 2025 Hệ thống Quản lý Dịch vụ Chăm sóc Sức khỏe. Mọi quyền được bảo lưu.</p>
        <p style={{ marginTop: "10px" }}>Hotline: 1900-xxxx | Email: support@healthcare.com</p>
      </footer>
    </div>
  );
};

// Styles
const tableHeaderStyle = {
  padding: "16px",
  textAlign: "left",
  fontWeight: "600",
  color: "#374151",
  borderBottom: "2px solid #e5e7eb"
};

const tableCellStyle = {
  padding: "16px",
  borderBottom: "1px solid #e5e7eb",
  color: "#1f2937"
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "30px",
  maxWidth: "500px",
  width: "90%",
  maxHeight: "90vh",
  overflow: "auto"
};

const formGroupStyle = {
  marginBottom: "20px"
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "8px"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  color: "#1f2937",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box"
};

const buttonStyle = {
  color: "#fff",
  border: "none",
  padding: "12px 24px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s"
};

export default ServiceManager;
