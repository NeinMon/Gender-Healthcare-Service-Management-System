import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('services'); // 'services' hoặc 'users'
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    price: '',
    managerId: null // Sẽ được set từ userId
  });
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    gender: '',
    dob: '',
    phone: '',
    address: '',
    role: 'CONSULTANT',
    specification: ''
  });

  // Load services khi component mount
  useEffect(() => {
    // Lấy userId từ localStorage/sessionStorage
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser') || '{}');
    const currentUserId = localStorage.getItem('userId') || loggedInUser.userID || loggedInUser.id;
    
    if (currentUserId) {
      setUserId(Number(currentUserId));
      setFormData(prev => ({
        ...prev,
        managerId: Number(currentUserId)
      }));
    } else {
      console.warn('Không tìm thấy userId, sử dụng giá trị mặc định');
      setUserId(1);
      setFormData(prev => ({
        ...prev,
        managerId: 1
      }));
    }
    
    fetchServices();
    fetchUsers();
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
        showAlert('error', 'Không thể tải danh sách dịch vụ');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      showAlert('error', 'Lỗi kết nối khi tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm services
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      if (activeTab === 'services') {
        fetchServices();
      } else {
        fetchUsers();
      }
      return;
    }

    try {
      setLoading(true);
      if (activeTab === 'services') {
        const response = await fetch(`http://localhost:8080/api/services/search?name=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        } else {
          console.error('Failed to search services');
          showAlert('error', 'Không thể tìm kiếm dịch vụ');
        }
      } else {
        // Search users by name, email, or phone
        const response = await fetch('http://localhost:8080/api/users');
        if (response.ok) {
          const data = await response.json();
          const filteredUsers = data.filter(user => 
            (user.role === 'CONSULTANT' || user.role === 'STAFF') &&
            (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.phone?.includes(searchTerm))
          );
          setUsers(filteredUsers);
        } else {
          console.error('Failed to search users');
          showAlert('error', 'Không thể tìm kiếm tài khoản');
        }
      }
    } catch (error) {
      console.error('Error searching:', error);
      showAlert('error', activeTab === 'services' ? 'Lỗi kết nối khi tìm kiếm dịch vụ' : 'Lỗi kết nối khi tìm kiếm tài khoản');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách users từ API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/users');
      if (response.ok) {
        const data = await response.json();
        // Chỉ lấy consultant và staff
        const filteredUsers = data.filter(user => 
          user.role === 'CONSULTANT' || user.role === 'STAFF'
        );
        setUsers(filteredUsers);
      } else {
        console.error('Failed to fetch users');
        showAlert('error', 'Không thể tải danh sách tài khoản');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('error', 'Lỗi kết nối khi tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  // Reset user form
  const resetUserForm = () => {
    setUserFormData({
      fullName: '',
      email: '',
      password: '',
      gender: '',
      dob: '',
      phone: '',
      address: '',
      role: 'CONSULTANT',
      specification: ''
    });
  };

  // Xử lý thay đổi input user form
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      serviceName: '',
      description: '',
      price: '',
      managerId: userId || 1
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
      showAlert('error', 'Vui lòng nhập tên dịch vụ');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) < 1000) {
      showAlert('error', 'Giá dịch vụ phải từ 1,000 VNĐ trở lên');
      return;
    }

    if (!userId) {
      showAlert('error', 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      const serviceData = {
        serviceName: formData.serviceName.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        managerId: userId
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
      showAlert('error', 'Lỗi kết nối khi thêm dịch vụ');
    }
  };

  // Sửa service
  const handleEditService = async (e) => {
    e.preventDefault();
    
    if (!editingService) return;

    // Validation
    if (!formData.serviceName.trim()) {
      showAlert('error', 'Vui lòng nhập tên dịch vụ');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) < 1000) {
      showAlert('error', 'Giá dịch vụ phải từ 1,000 VNĐ trở lên');
      return;
    }

    if (!userId) {
      showAlert('error', 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      const serviceData = {
        serviceName: formData.serviceName.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        managerId: userId
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
      showAlert('error', 'Lỗi kết nối khi cập nhật dịch vụ');
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
      showAlert('error', 'Lỗi kết nối khi xóa dịch vụ');
    }
  };

  // Mở modal edit và load dữ liệu service
  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      serviceName: service.serviceName,
      description: service.description || '',
      price: service.price.toString(),
      managerId: userId || service.managerId
    });
    setShowEditModal(true);
  };

  // Thêm user mới
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!userFormData.fullName.trim()) {
      showAlert('error', 'Vui lòng nhập họ tên');
      return;
    }
    
    if (!userFormData.email.trim()) {
      showAlert('error', 'Vui lòng nhập email');
      return;
    }
    
    if (!userFormData.password || userFormData.password.length < 6) {
      showAlert('error', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!userFormData.phone.trim()) {
      showAlert('error', 'Vui lòng nhập số điện thoại');
      return;
    }

    try {
      const userData = {
        fullName: userFormData.fullName.trim(),
        email: userFormData.email.trim(),
        password: userFormData.password,
        gender: userFormData.gender || 'Nam',
        dob: userFormData.dob ? new Date(userFormData.dob).toISOString() : null,
        phone: userFormData.phone.trim(),
        address: userFormData.address.trim() || null,
        role: userFormData.role,
        specification: userFormData.role === 'CONSULTANT' ? (userFormData.specification?.trim() || null) : null
      };

      console.log('Creating user with data:', userData);

      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      console.log('Create response status:', response.status);

      if (response.ok) {
        showAlert('success', 'Thêm tài khoản thành công!');
        setShowAddUserModal(false);
        resetUserForm();
        fetchUsers();
      } else {
        const errorText = await response.text();
        console.error('Failed to add user:', errorText);
        showAlert('error', 'Không thể thêm tài khoản: ' + errorText);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      showAlert('error', 'Lỗi kết nối khi thêm tài khoản: ' + error.message);
    }
  };

  // Sửa user
  const handleEditUser = async (e) => {
    e.preventDefault();
    
    if (!editingUser) return;

    // Validation
    if (!userFormData.fullName.trim()) {
      showAlert('error', 'Vui lòng nhập họ tên');
      return;
    }

    if (!userFormData.email.trim()) {
      showAlert('error', 'Vui lòng nhập email');
      return;
    }

    if (!userFormData.phone.trim()) {
      showAlert('error', 'Vui lòng nhập số điện thoại');
      return;
    }

    try {
      const userData = {
        userID: editingUser.userID,
        fullName: userFormData.fullName.trim(),
        email: userFormData.email.trim(),
        gender: userFormData.gender || 'Nam',
        dob: userFormData.dob ? new Date(userFormData.dob).toISOString() : null,
        phone: userFormData.phone.trim(),
        address: userFormData.address.trim() || null,
        role: userFormData.role,
        specification: userFormData.role === 'CONSULTANT' ? (userFormData.specification?.trim() || null) : null
      };

      // Chỉ thêm password nếu có thay đổi
      if (userFormData.password && userFormData.password.length >= 6) {
        userData.password = userFormData.password;
      }

      console.log('Updating user with data:', userData);

      const response = await fetch(`http://localhost:8080/api/users/${editingUser.userID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      console.log('Update response status:', response.status);

      if (response.ok) {
        showAlert('success', 'Cập nhật tài khoản thành công!');
        setShowEditUserModal(false);
        setEditingUser(null);
        resetUserForm();
        fetchUsers();
      } else {
        const errorText = await response.text();
        console.error('Failed to update user:', errorText);
        showAlert('error', 'Không thể cập nhật tài khoản: ' + errorText);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showAlert('error', 'Lỗi kết nối khi cập nhật tài khoản: ' + error.message);
    }
  };

  // Xóa user
  const handleDeleteUser = async (userIdToDelete, userName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/users/${userIdToDelete}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showAlert('success', 'Xóa tài khoản thành công!');
        fetchUsers();
      } else {
        const errorText = await response.text();
        console.error('Failed to delete user:', errorText);
        showAlert('error', 'Không thể xóa tài khoản: ' + errorText);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showAlert('error', 'Lỗi kết nối khi xóa tài khoản');
    }
  };

  // Mở modal edit user
  const openEditUserModal = (user) => {
    setEditingUser(user);
    setUserFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '', // Để trống để không thay đổi password
      gender: user.gender || 'Nam',
      dob: user.dob ? user.dob.split('T')[0] : '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'CONSULTANT',
      specification: user.specification || ''
    });
    setShowEditUserModal(true);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
  };

  return (
    <div style={{ 
      backgroundColor: "#f0f9ff", 
      minHeight: "100vh",
      width: "100%",
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        position: "relative",
        height: "160px"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
          padding: "0 24px",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          pointerEvents: "none"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            pointerEvents: "auto" 
          }}>
            <img
              src="/Logo.png"
              alt="Logo"
              style={{ height: 85, width: 85, objectFit: "contain" }}
            />
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            pointerEvents: "auto" 
          }}>
            <UserAvatar userName="Manager" />
          </div>
        </div>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}>
          <h1 style={{
            color: "#fff",
            margin: 0,
            fontSize: "48px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            Quản lý Dịch vụ & Tài khoản
          </h1>
        </div>
      </header>

      {/* Tabs */}
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "12px 12px 0 0",
        margin: "24px 24px 0",
        maxWidth: "1200px",
        width: "calc(100% - 48px)",
        alignSelf: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
      }}>
        <div style={{ display: "flex", gap: "0" }}>
          <button
            onClick={() => {
              setActiveTab('services');
              setSearchTerm(''); // Clear search when switching tabs
            }}
            style={{
              padding: "20px 30px",
              border: "none",
              backgroundColor: activeTab === 'services' ? "#0891b2" : "transparent",
              color: activeTab === 'services' ? "#fff" : "#6b7280",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: activeTab === 'services' ? "12px 0 0 0" : "0",
              cursor: "pointer",
              transition: "all 0.3s",
              borderBottom: activeTab === 'services' ? "none" : "1px solid #e5e7eb"
            }}
          >
            📋 Quản lý Dịch vụ
          </button>
          <button
            onClick={() => {
              setActiveTab('users');
              setSearchTerm(''); // Clear search when switching tabs
            }}
            style={{
              padding: "20px 30px",
              border: "none",
              backgroundColor: activeTab === 'users' ? "#0891b2" : "transparent",
              color: activeTab === 'users' ? "#fff" : "#6b7280",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: activeTab === 'users' ? "0 12px 0 0" : "0",
              cursor: "pointer",
              transition: "all 0.3s",
              borderBottom: activeTab === 'users' ? "none" : "1px solid #e5e7eb"
            }}
          >
            👥 Quản lý Tài khoản
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        padding: "0 24px 32px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f0f9ff"
      }}>
        <div style={{
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}>
          {/* Alert Messages */}
          {alert.show && (
            <div style={{ 
              backgroundColor: alert.type === 'success' ? "#d1fae5" : "#fee2e2",
              border: `1px solid ${alert.type === 'success' ? "#a7f3d0" : "#fecaca"}`,
              color: alert.type === 'success' ? "#065f46" : "#991b1b",
              padding: "16px 20px",
              borderRadius: "12px",
              fontWeight: 500,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
              {alert.message}
            </div>
          )}

          {/* Search và Add Button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: "#fff",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center", 
              gap: "12px",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="text"
                  placeholder={activeTab === 'services' ? "Tìm kiếm dịch vụ..." : "Tìm kiếm tài khoản..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #22d3ee",
                    fontSize: "14px",
                    minWidth: "300px",
                    outline: "none",
                    fontWeight: 500,
                    color: "#0891b2"
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(34,211,238,0.25)"
                  }}
                >
                  🔍 Tìm kiếm
                </button>
                <button
                  onClick={activeTab === 'services' ? fetchServices : fetchUsers}
                  style={{
                    background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(34,211,238,0.25)"
                  }}
                >
                  🔄 Làm mới
                </button>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (activeTab === 'services') {
                  resetForm();
                  setShowAddModal(true);
                } else {
                  resetUserForm();
                  setShowAddUserModal(true);
                }
              }}
              style={{
                background: "linear-gradient(90deg, #16a34a 0%, #22c55e 100%)",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(34,197,94,0.25)"
              }}
            >
              {activeTab === 'services' ? '➕ Thêm dịch vụ mới' : '➕ Thêm tài khoản mới'}
            </button>
          </div>

        {/* Services Table */}
        {activeTab === 'services' && (
          <>
            {/* Services content */}
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: "60px 0",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}>
            <div style={{ 
              display: "inline-block", 
              border: "3px solid #22d3ee",
              borderTop: "3px solid transparent",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              animation: "spin 1s linear infinite",
              marginBottom: "15px"
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ color: '#0891b2', fontWeight: 600, fontSize: 16, margin: 0 }}>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div style={{ 
            width: '100%', 
            backgroundColor: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}>
            <div style={{ overflowX: 'auto', width: "100%" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ 
                    background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                    textAlign: "center"
                  }}>
                    <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>ID</th>
                    <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Tên dịch vụ</th>
                    <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Mô tả</th>
                    <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Giá</th>
                    <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {services.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "30px 0", color: "#0891b2", fontWeight: 500 }}>
                        {searchTerm ? `Không tìm thấy dịch vụ nào với từ khóa "${searchTerm}"` : "Không có dịch vụ nào"}
                      </td>
                    </tr>
                  ) : (
                    services.map((service, index) => (
                      <tr 
                        key={service.serviceId} 
                        style={{ 
                          borderBottom: '1px solid #e0f2fe', 
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f9ff"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={{ padding: '16px 20px', textAlign: "center" }}>{service.serviceId}</td>
                        <td style={{ padding: '16px 20px', textAlign: "center" }}>
                          <div style={{ fontWeight: "600", color: "#0891b2" }}>
                            {service.serviceName}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: "center" }}>
                          <div style={{ 
                            maxWidth: "200px", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis", 
                            whiteSpace: "nowrap",
                            margin: "0 auto"
                          }}>
                            {service.description || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Không có mô tả</span>}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: "center" }}>
                          <div style={{ fontWeight: "600", color: "#059669" }}>
                            {formatPrice(service.price)}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <button
                              onClick={() => openEditModal(service)}
                              style={{
                                background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                                color: "#fff",
                                border: "none",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontWeight: 600
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
                                padding: "8px 12px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontWeight: 600
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
            </div>
            
            {/* Summary */}
            {services.length > 0 && (
              <div style={{ 
                padding: "16px", 
                backgroundColor: "#f0f9ff", 
                borderTop: "1px solid #e0f2fe",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "14px",
                color: "#0891b2",
                fontWeight: 600
              }}>
                <span>Tổng số dịch vụ: <strong style={{ color: "#0891b2" }}>{services.length}</strong></span>
              </div>
            )}
          </div>
        )}
        </>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
          <>
            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: "60px 0",
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
              }}>
                <div style={{ 
                  display: "inline-block", 
                  border: "3px solid #22d3ee",
                  borderTop: "3px solid transparent",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  animation: "spin 1s linear infinite",
                  marginBottom: "15px"
                }}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                <p style={{ color: '#0891b2', fontWeight: 600, fontSize: 16, margin: 0 }}>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div style={{ 
                width: '100%', 
                backgroundColor: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
              }}>
                <div style={{ overflowX: 'auto', width: "100%" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ 
                        background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                        textAlign: "center"
                      }}>
                        <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>ID</th>
                        <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Họ tên</th>
                        <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Email</th>
                        <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Vai trò</th>
                        <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Chuyên môn</th>
                        <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>SĐT</th>
                        <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: "center", padding: "30px 0", color: "#0891b2", fontWeight: 500 }}>
                            Không có tài khoản nào
                          </td>
                        </tr>
                      ) : (
                        users.map((user, index) => (
                          <tr 
                            key={user.userID} 
                            style={{ 
                              borderBottom: '1px solid #e0f2fe', 
                              transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f9ff"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>{user.userID}</td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>
                              <div style={{ fontWeight: "600", color: "#0891b2" }}>
                                {user.fullName}
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>{user.email}</td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>
                              <span style={{
                                display: "inline-block",
                                padding: "6px 12px",
                                borderRadius: "20px",
                                fontWeight: 600,
                                fontSize: "13px",
                                backgroundColor: user.role === 'CONSULTANT' ? "#dbeafe" : "#fef3c7",
                                color: user.role === 'CONSULTANT' ? "#1d4ed8" : "#92400e"
                              }}>
                                {user.role === 'CONSULTANT' ? 'Tư vấn viên' : 'Nhân viên'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>
                              {user.role === 'CONSULTANT' ? (
                                user.specification || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Chưa có</span>
                              ) : (
                                <span style={{ color: "#9ca3af", fontStyle: "italic" }}>N/A</span>
                              )}
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>{user.phone}</td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                <button
                                  onClick={() => openEditUserModal(user)}
                                  style={{
                                    background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                                    color: "#fff",
                                    border: "none",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    fontWeight: 600
                                  }}
                                >
                                  ✏️ Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.userID, user.fullName)}
                                  style={{
                                    background: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    fontWeight: 600
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
                </div>
                
                {/* Summary */}
                {users.length > 0 && (
                  <div style={{ 
                    padding: "16px", 
                    backgroundColor: "#f0f9ff", 
                    borderTop: "1px solid #e0f2fe",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#0891b2",
                    fontWeight: 600
                  }}>
                    <span>Tổng số tài khoản: <strong style={{ color: "#0891b2" }}>{users.length}</strong></span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#0891b2", fontWeight: 700, fontSize: 24 }}>Thêm dịch vụ mới</h3>
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
              
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "30px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  style={{
                    background: '#e0f2fe',
                    color: '#0891b2',
                    border: '1px solid #22d3ee',
                    borderRadius: 32,
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 32,
                    padding: '12px 32px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 16,
                    boxShadow: '0 4px 24px rgba(34,211,238,0.18)'
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
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#0891b2", fontWeight: 700, fontSize: 24 }}>
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
              
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "30px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingService(null);
                    resetForm();
                  }}
                  style={{
                    background: '#e0f2fe',
                    color: '#0891b2',
                    border: '1px solid #22d3ee',
                    borderRadius: 32,
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 32,
                    padding: '12px 32px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 16,
                    boxShadow: '0 4px 24px rgba(34,211,238,0.18)'
                  }}
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#0891b2", fontWeight: 700, fontSize: 24 }}>Thêm tài khoản mới</h3>
            <form onSubmit={handleAddUser}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Họ tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={userFormData.fullName}
                  onChange={handleUserInputChange}
                  required
                  style={inputStyle}
                  placeholder="Nhập họ và tên"
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={userFormData.email}
                  onChange={handleUserInputChange}
                  required
                  style={inputStyle}
                  placeholder="Nhập địa chỉ email"
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Mật khẩu *</label>
                <input
                  type="password"
                  name="password"
                  value={userFormData.password}
                  onChange={handleUserInputChange}
                  required
                  minLength="6"
                  style={inputStyle}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>Giới tính</label>
                  <select
                    name="gender"
                    value={userFormData.gender}
                    onChange={handleUserInputChange}
                    style={inputStyle}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>Vai trò *</label>
                  <select
                    name="role"
                    value={userFormData.role}
                    onChange={handleUserInputChange}
                    required
                    style={inputStyle}
                  >
                    <option value="CONSULTANT">Tư vấn viên</option>
                    <option value="STAFF">Nhân viên</option>
                  </select>
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Số điện thoại *</label>
                <input
                  type="tel"
                  name="phone"
                  value={userFormData.phone}
                  onChange={handleUserInputChange}
                  required
                  style={inputStyle}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Ngày sinh</label>
                <input
                  type="date"
                  name="dob"
                  value={userFormData.dob}
                  onChange={handleUserInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Địa chỉ</label>
                <textarea
                  name="address"
                  value={userFormData.address}
                  onChange={handleUserInputChange}
                  style={{ ...inputStyle, height: "80px" }}
                  placeholder="Nhập địa chỉ (tùy chọn)"
                />
              </div>

              {userFormData.role === 'CONSULTANT' && (
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Chuyên môn</label>
                  <input
                    type="text"
                    name="specification"
                    value={userFormData.specification}
                    onChange={handleUserInputChange}
                    style={inputStyle}
                    placeholder="Nhập chuyên môn (dành cho tư vấn viên)"
                  />
                </div>
              )}
              
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "30px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    resetUserForm();
                  }}
                  style={{
                    background: '#e0f2fe',
                    color: '#0891b2',
                    border: '1px solid #22d3ee',
                    borderRadius: 32,
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 32,
                    padding: '12px 32px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 16,
                    boxShadow: '0 4px 24px rgba(34,211,238,0.18)'
                  }}
                >
                  Thêm tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#0891b2", fontWeight: 700, fontSize: 24 }}>
              Sửa tài khoản: {editingUser.fullName}
            </h3>
            <form onSubmit={handleEditUser}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Họ tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={userFormData.fullName}
                  onChange={handleUserInputChange}
                  required
                  style={inputStyle}
                  placeholder="Nhập họ và tên"
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={userFormData.email}
                  onChange={handleUserInputChange}
                  required
                  style={inputStyle}
                  placeholder="Nhập địa chỉ email"
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Mật khẩu mới (để trống nếu không thay đổi)</label>
                <input
                  type="password"
                  name="password"
                  value={userFormData.password}
                  onChange={handleUserInputChange}
                  minLength="6"
                  style={inputStyle}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>Giới tính</label>
                  <select
                    name="gender"
                    value={userFormData.gender}
                    onChange={handleUserInputChange}
                    style={inputStyle}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>Vai trò *</label>
                  <select
                    name="role"
                    value={userFormData.role}
                    onChange={handleUserInputChange}
                    required
                    style={inputStyle}
                  >
                    <option value="CONSULTANT">Tư vấn viên</option>
                    <option value="STAFF">Nhân viên</option>
                  </select>
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Số điện thoại *</label>
                <input
                  type="tel"
                  name="phone"
                  value={userFormData.phone}
                  onChange={handleUserInputChange}
                  required
                  style={inputStyle}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Ngày sinh</label>
                <input
                  type="date"
                  name="dob"
                  value={userFormData.dob}
                  onChange={handleUserInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Địa chỉ</label>
                <textarea
                  name="address"
                  value={userFormData.address}
                  onChange={handleUserInputChange}
                  style={{ ...inputStyle, height: "80px" }}
                  placeholder="Nhập địa chỉ (tùy chọn)"
                />
              </div>

              {userFormData.role === 'CONSULTANT' && (
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Chuyên môn</label>
                  <input
                    type="text"
                    name="specification"
                    value={userFormData.specification}
                    onChange={handleUserInputChange}
                    style={inputStyle}
                    placeholder="Nhập chuyên môn (dành cho tư vấn viên)"
                  />
                </div>
              )}
              
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "30px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setEditingUser(null);
                    resetUserForm();
                  }}
                  style={{
                    background: '#e0f2fe',
                    color: '#0891b2',
                    border: '1px solid #22d3ee',
                    borderRadius: 32,
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 32,
                    padding: '12px 32px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 16,
                    boxShadow: '0 4px 24px rgba(34,211,238,0.18)'
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
        padding: "20px",
        backgroundColor: "#e0f2fe",
        textAlign: "center",
        color: "#0891b2",
        width: "100%",
        marginTop: "auto"
      }}>
        <p style={{ margin: "0 0 10px 0", fontWeight: 600 }}>© 2025 Hệ thống Quản lý Dịch vụ Chăm sóc Sức khỏe. Mọi quyền được bảo lưu.</p>
        <p style={{ margin: 0, fontSize: "14px" }}>Hotline: 1900-xxxx | Email: support@healthcare.com</p>
      </footer>
    </div>
  );
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.25)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "32px",
  maxWidth: "500px",
  width: "90%",
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  position: 'relative'
};

const formGroupStyle = {
  marginBottom: "20px"
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: "600",
  color: "#0891b2",
  marginBottom: "8px"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
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
