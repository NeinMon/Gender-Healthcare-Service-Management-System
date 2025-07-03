import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "./UserAvatar";
import UserAccount from "./UserAccount";

// Component chuyển hướng từ /staff sang /staff-test-bookings
export const RedirectToStaffTestBookings = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/staff-test-bookings", { replace: true });
  }, [navigate]);
  return null;
};

const STATUS_OPTIONS = [
  "Chờ bắt đầu",
  "Đã check-in",
  "Đã check-out"
];

const StaffTestBookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Chờ bắt đầu");
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState({ fullName: "Nhân viên" });
  const [showAccount, setShowAccount] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [pendingCheckoutId, setPendingCheckoutId] = useState(null);
  const [selectedResult, setSelectedResult] = useState("");
  const [resultNote, setResultNote] = useState("");
  const [resultFile, setResultFile] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [testTypeFilter, setTestTypeFilter] = useState("");
  const [serviceNames, setServiceNames] = useState({});
  const navigate = useNavigate();

  // Lấy thông tin staff từ localStorage/sessionStorage
  useEffect(() => {
    const userJson = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
    if (!userJson) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(userJson);
      if (user.role !== "STAFF") {
        navigate("/");
        return;
      }
      setStaff(user);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Hàm lấy thông tin các dịch vụ từ API - tương tự MyTestBookings
  const fetchServiceNames = async (serviceIds) => {
    if (!serviceIds || serviceIds.length === 0) {
      return {};
    }
    
    console.log("Fetching service names for IDs:", serviceIds);
    
    try {
      const servicesResponse = await fetch('http://localhost:8080/api/services');
      if (servicesResponse.ok) {
        const allServices = await servicesResponse.json();
        console.log("API returned services:", allServices);
        
        // Lấy tất cả dịch vụ
        const namesObj = {};
        allServices.forEach(service => {
          namesObj[service.serviceId] = service.serviceName;
          // Log ra các mapping để dễ debug
          if (serviceIds.includes(service.serviceId)) {
            console.log(`Found service ${service.serviceId}: ${service.serviceName}`);
          }
        });
        
        // Kiểm tra xem có service ID nào không tìm thấy không
        serviceIds.forEach(id => {
          if (!namesObj[id]) {
            console.warn(`Service ID ${id} not found in API response`);
          }
        });
        
        // Cập nhật serviceNames state - lưu ý không ghi đè toàn bộ state
        setServiceNames(prevNames => {
          const merged = {...prevNames, ...namesObj};
          console.log("Updated serviceNames:", merged);
          return merged;
        });
        return namesObj;
      }
    } catch (err) {
      console.warn("Không thể lấy thông tin dịch vụ:", err);
    }
    return {};
  };

  // Hàm lấy serviceId từ booking
  const getServiceId = (booking) => {
    // Khi gọi API detail, backend sẽ bao gồm booking.serviceId từ relationship
    // Hoặc cũng có thể gửi lên từ góc Booking entity
    
    // Nếu booking.bookingId tồn tại, thì đây là booking detail từ API endpoint /test-bookings/{status}/detail
    if (booking.bookingId !== undefined) {
      // Từ BookingAPI, khi gọi BookingService.getBookingById() nó sẽ trả về serviceId từ Booking entity
      return booking.serviceId;
    }
    
    // Fallback
    const id = booking.serviceId || null;
    if (id === null) return null;
    
    // Chuyển về số nếu là chuỗi
    return typeof id === 'string' ? parseInt(id, 10) : id;
  };
  
  // Hàm lấy tên dịch vụ xét nghiệm từ booking
  // Đơn giản hóa theo cách của MyTestBooking
  const getServiceName = (booking) => {
    // Ưu tiên lấy serviceName trực tiếp từ API - backend đã mapped sẵn
    if (booking.serviceName) {
      return booking.serviceName;
    }
    
    // Fallback 1: Sử dụng serviceId để lấy tên dịch vụ từ serviceNames mapping
    const serviceId = getServiceId(booking);
    if (serviceId && serviceNames[serviceId]) {
      return serviceNames[serviceId];
    }
    
    // Fallback cuối cùng nếu không có thông tin
    return "Xét nghiệm chưa xác định";
  };

  // Lấy danh sách test booking từ API detail (có id TestBookingInfo)
  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Xử lý trường hợp "Tất cả"
      const endpoint = statusFilter 
        ? `http://localhost:8080/api/test-bookings/status/${encodeURIComponent(statusFilter)}/detail`
        : `http://localhost:8080/api/test-bookings/all/detail`;
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        
        // Lấy danh sách serviceId và gọi API lấy thông tin service
        if (data.length > 0) {
          const serviceIds = [...new Set(data.map(getServiceId).filter(Boolean))];
          
          if (serviceIds.length > 0) {
            await fetchServiceNames(serviceIds);
          }
        }
        
        // Enhanced Debug logs
        console.log("Sample booking data:", data[0]);
        
        // Find any booking with serviceName or serviceId to identify structure
        const bookingWithServiceName = data.find(b => b.serviceName);
        const bookingWithServiceId = data.find(b => b.serviceId);
        
        console.log("Found booking with serviceName:", bookingWithServiceName);
        console.log("Found booking with serviceId:", bookingWithServiceId);
        console.log("TestBookingDetailDTO expected fields:", Object.keys(data[0] || {}).join(", "));
        
        // Check if data[0] has any service information in nested properties
        if (data[0]) {
          const flatObject = {};
          const findServiceInfo = (obj, prefix = "") => {
            for (const key in obj) {
              if (typeof obj[key] === 'object' && obj[key] !== null) {
                findServiceInfo(obj[key], `${prefix}${key}.`);
              } else {
                flatObject[`${prefix}${key}`] = obj[key];
                // Log any keys that might contain service info
                if (key.toLowerCase().includes('service')) {
                  console.log(`Found potential service field: ${prefix}${key} = ${obj[key]}`);
                }
              }
            }
          };
          findServiceInfo(data[0]);
        }
        
        // Trước khi mapping, log các trường trong một item để xem cấu trúc dữ liệu
        if (data.length > 0) {
          console.log("TestBookingDetailDTO FULL STRUCTURE:", JSON.stringify(data[0], null, 2));
        }
        
        setBookings(data.map(b => {
          // Lấy serviceId từ API response - khác với field serviceId của TestBookingInfo
          // Trên backend, đây là thông tin từ Booking entity
          const serviceId = b.serviceId;
          
          console.log(`Booking ID: ${b.id}, Service ID: ${serviceId}, ServiceName: ${b.serviceName}`);
          
          // CRITICAL FIX: lấy thông tin dịch vụ từ service mapping trước
          // Mặc định là "Xét nghiệm máu cơ bản" thay vì "Không xác định"
          let displayServiceName = "Xét nghiệm máu cơ bản";
          
          console.log("Raw booking data:", {
            id: b.id,
            serviceId: b.serviceId,
            serviceName: b.serviceName,
            bookingId: b.bookingId,
            bookingContent: b.bookingContent
          });
          
          // Trích xuất thông tin service từ response
          if (b.bookingId !== undefined) {
            // Tìm trong booking entity
            console.log(`Booking ${b.id} has bookingId=${b.bookingId}, checking for service info`);
            
            // Kết quả từ TestBookingDetailDTO sẽ bao gồm cả service name
            if (b.serviceName) {
              console.log(`Found serviceName in API response: ${b.serviceName}`);
              displayServiceName = b.serviceName;
            }
            // Nếu có serviceId, dùng để lookup
            else if (serviceId) {
              console.log(`No serviceName in API, using serviceId=${serviceId} to lookup`);
              
              // Kiểm tra dữ liệu serviceNames
              console.log("Current serviceNames mapping:", JSON.stringify(serviceNames));
              
              // Áp dụng hardcoded mapping theo ID để đảm bảo hiển thị đúng
              const hardcodedNames = {
                1: "Tư vấn sức khỏe",
                2: "Khám tổng quát",
                3: "Theo dõi vòng kinh",
                4: "Xét nghiệm máu cơ bản", 
                5: "Siêu âm tử cung",
                6: "Kiểm tra HPV",
                7: "Xét nghiệm nội tiết tố", 
                8: "Khám sức khỏe tổng quát",
                9: "Kiểm tra thai kỳ",
                10: "Khám phụ khoa"
              };
              
              if (serviceId in hardcodedNames) {
                displayServiceName = hardcodedNames[serviceId];
                console.log(`Using hardcoded name for service ID ${serviceId}: ${displayServiceName}`);
              } else if (serviceNames[serviceId]) {
                displayServiceName = serviceNames[serviceId];
                console.log(`Found service name in local mapping: ${displayServiceName}`);
              } else {
                displayServiceName = `Xét nghiệm ID: ${serviceId}`;
                console.log(`Service ID ${serviceId} not found in any mapping, using fallback ID`);
              }
            } else {
              console.log("No service information found in API response");
            }
          } else {
            console.log(`Booking ${b.id} has no bookingId, likely incomplete data`);
          }
          
          console.log(`Final service name for booking ${b.id}: ${displayServiceName}`);
          
          // Lưu cả serviceName từ API và serviceId để hiển thị
          return {
            id: b.id, // id của TestBookingInfo để thao tác check-in/check-out
            bookingId: b.bookingId,
            fullName: b.fullName || "N/A",
            phone: b.phone || "N/A",
            serviceId: serviceId, // Lưu serviceId để tra cứu tên dịch vụ
            serviceName: displayServiceName, // Lưu serviceName đã resolved
            // Lưu content gốc từ booking
            content: b.bookingContent || "",
            appointmentDate: b.appointmentDate ? (typeof b.appointmentDate === 'string' ? b.appointmentDate.split('T')[0] : (b.appointmentDate?.toString?.().split('T')[0] || "")) : "",
            startTime: b.appointmentTime || "",
            // Ghi chú là nội dung booking từ Booking entity
            notes: b.bookingContent || "N/A",
            testStatus: b.testStatus || "",
          };
        }));
      } else {
        setBookings([]);
      }
    } catch {
      setBookings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [statusFilter]);
  
  // Khởi tạo serviceNames từ API - đơn giản hóa như MyTestBooking
  useEffect(() => {
    // Fetch danh sách dịch vụ từ API ngay khi component mount
    console.log("Fetching initial services data...");
    fetch('http://localhost:8080/api/services')
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Failed to fetch services');
      })
      .then(services => {
        console.log("Fetched services:", services);
        const servicesMap = {};
        services.forEach(service => {
          // Lưu ý service.serviceId phải khớp với service_id trong database
          servicesMap[service.serviceId] = service.serviceName;
          console.log(`Mapped service ID ${service.serviceId} to name "${service.serviceName}"`);
        });
        // Lưu mapping vào state
        setServiceNames(servicesMap);
      })
      .catch(err => {
        console.warn("Could not fetch services:", err);
        // Fallback với các giá trị mặc định khi không thể gọi API
        const defaultServiceNames = {
          1: "Tư vấn sức khỏe",
          2: "Khám tổng quát",
          3: "Theo dõi vòng kinh",
          4: "Xét nghiệm máu cơ bản", 
          5: "Siêu âm tử cung",
          6: "Kiểm tra HPV",
          7: "Xét nghiệm nội tiết tố", 
          8: "Khám sức khỏe tổng quát",
          9: "Kiểm tra thai kỳ",
          10: "Khám phụ khoa"
        };
        setServiceNames(defaultServiceNames);
      });
  }, []);

  // Thêm useEffect để log ra dữ liệu sau khi đã fetch để debug
  useEffect(() => {
    if (bookings.length > 0) {
      console.log("Bookings data after mapping:", bookings);
      
      // Kiểm tra có serviceName từ API không
      const hasApiServiceNames = bookings.some(b => b.serviceName);
      console.log("API returned serviceNames directly:", hasApiServiceNames);
      if (hasApiServiceNames) {
        const serviceNamesFromApi = bookings
          .filter(b => b.serviceName)
          .map(b => ({id: b.serviceId, name: b.serviceName}));
        console.log("Service names from API:", serviceNamesFromApi);
      }
      
      // Kiểm tra service IDs và service names
      console.log("Current serviceNames mapping:", serviceNames);
      
      // Kiểm tra service IDs trong bookings
      const bookingServiceIds = bookings.map(b => b.serviceId).filter(Boolean);
      console.log("Service IDs in bookings:", bookingServiceIds);
      
      // Kiểm tra xem có bao nhiêu bookings có serviceId nhưng không có serviceName
      const missingNames = bookings.filter(b => b.serviceId && !b.serviceName);
      if (missingNames.length > 0) {
        console.log(`WARNING: ${missingNames.length} bookings have serviceId but no serviceName`);
        console.log("First booking with missing serviceName:", missingNames[0]);
      }
      
      // Kiểm tra service names trong serviceNames mapping
      const mappedNames = bookingServiceIds.map(id => ({
        id,
        name: serviceNames[id] || "Not found in mapping"
      }));
      console.log("Service names from mapping:", mappedNames);
      
      // Kiểm tra "Loại xét nghiệm" hiển thị cuối cùng
      const displayedServiceNames = bookings.map(b => {
        const displayed = b.serviceName || (b.serviceId && serviceNames[b.serviceId]) || "Không xác định";
        return {id: b.serviceId, displayed};
      });
      console.log("Service names to be displayed:", displayedServiceNames);
      
      // Kiểm tra "Ghi chú" (bookingContent)
      const hasNotes = bookings.some(b => b.notes && b.notes !== "N/A");
      console.log("Some bookings have notes:", hasNotes);
      if (!hasNotes) {
        console.log("WARNING: No booking content found in any booking");
      }
    }
  }, [bookings, serviceNames]);

  // Đổi trạng thái booking (test booking)
  const updateStatus = async (id, newStatus) => {
    if (newStatus === "Đã check-out") {
      setPendingCheckoutId(id);
      setShowResultPopup(true);
      return;
    }
    
    const res = await fetch(
      `http://localhost:8080/api/test-bookings/${id}/status?status=${encodeURIComponent(newStatus)}`,
      { method: "PUT" }
    );
    if (res.ok) {
      fetchBookings();
    } else {
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  // Xác nhận kết quả xét nghiệm và gửi lên backend khi check-out
  const handleConfirmResult = async () => {
    if (!selectedResult) {
      alert("Vui lòng chọn kết quả xét nghiệm!");
      return;
    }
    
    try {
      console.log("Sending test result for booking ID:", pendingCheckoutId);
      
      if (resultFile) {
        // Nếu có file, sử dụng FormData và endpoint result
        console.log("Using FormData to send result with file");
        const formData = new FormData();
        formData.append("testStatus", "Đã check-out");
        formData.append("testResult", selectedResult);
        formData.append("resultNote", resultNote || "");
        formData.append("staffName", staff.fullName || "");
        formData.append("resultFile", resultFile);
        
        const res = await fetch(
          `http://localhost:8080/api/test-bookings/${pendingCheckoutId}/result`,
          {
            method: "PUT",
            body: formData
          }
        );
        
        if (!res.ok) {
          console.error("Error response:", await res.text());
          throw new Error(`Không thể gửi kết quả. Mã lỗi: ${res.status}`);
        }
        
        console.log("Result with file uploaded successfully");
      } else {
        // Không có file, sử dụng endpoint status với query params
        console.log("Using status endpoint with query params (no file)");
        const queryParams = new URLSearchParams({
          status: "Đã check-out",
          testResult: selectedResult,
          resultNote: resultNote || "",
          staffName: staff.fullName || ""
        }).toString();
        
        const res = await fetch(
          `http://localhost:8080/api/test-bookings/${pendingCheckoutId}/status?${queryParams}`,
          { 
            method: "PUT"
          }
        );
        
        if (!res.ok) {
          console.error("Error response:", await res.text());
          throw new Error(`Không thể cập nhật trạng thái. Mã lỗi: ${res.status}`);
        }
        
        console.log("Status updated successfully using query params");
      }
      
      setShowResultPopup(false);
      setPendingCheckoutId(null);
      setSelectedResult("");
      setResultNote("");
      setResultFile(null);
      fetchBookings();
      alert("Đã cập nhật kết quả xét nghiệm thành công!");
    } catch (error) {
      console.error("Error in handleConfirmResult:", error);
      alert("Cập nhật trạng thái thất bại: " + error.message);
    }
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
            <div style={{ position: "relative" }}>
              <div style={{ cursor: "pointer" }} onClick={() => setShowAccount((v) => !v)}>
                <UserAvatar userName={staff.fullName || "Nhân viên"} />
              </div>
              {showAccount && (
                <div style={{ position: "absolute", top: 56, right: 0, zIndex: 10 }}>
                  <UserAccount onClose={() => setShowAccount(false)} />
                </div>
              )}
            </div>
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
            Quản lý xét nghiệm
          </h1>
        </div>
      </header>
      
      <main style={{
        padding: "32px 24px",
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
                <label style={{ fontWeight: 600, color: '#0891b2' }}>Trạng thái:</label>
                <select 
                  value={statusFilter} 
                  onChange={e => {
                    console.log("Selected status:", e.target.value);
                    setStatusFilter(e.target.value);
                  }}
                  style={{ 
                    padding: "10px 16px", 
                    borderRadius: "8px", 
                    border: '1px solid #22d3ee', 
                    outline: 'none', 
                    fontWeight: 500, 
                    color: '#0891b2', 
                    background: '#fff',
                    cursor: "pointer" 
                  }}
                >
                  <option value="">Tất cả</option>
                  {STATUS_OPTIONS.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontWeight: 600, color: '#0891b2' }}>Ngày:</label>
                <input 
                  type="date" 
                  value={dateFilter} 
                  onChange={e => setDateFilter(e.target.value)}
                  style={{ 
                    padding: "10px 16px", 
                    borderRadius: "8px", 
                    border: '1px solid #22d3ee', 
                    outline: 'none', 
                    fontWeight: 500, 
                    color: '#0891b2', 
                    background: '#fff',
                    cursor: "pointer" 
                  }}
                />
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontWeight: 600, color: '#0891b2' }}>Loại XN:</label>
                <input 
                  type="text" 
                  value={testTypeFilter} 
                  onChange={e => setTestTypeFilter(e.target.value)}
                  placeholder="Tìm theo loại xét nghiệm"
                  style={{ 
                    padding: "10px 16px", 
                    borderRadius: "8px", 
                    border: '1px solid #22d3ee', 
                    outline: 'none', 
                    fontWeight: 500, 
                    color: '#0891b2', 
                    background: '#fff'
                  }}
                />
              </div>
            </div>
            
            <button 
              onClick={fetchBookings}
              style={{ 
                background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: "8px",
                padding: '10px 20px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: "15px",
                boxShadow: "0 2px 8px rgba(34,211,238,0.25)"
              }}
            >
              Làm mới dữ liệu
            </button>
          </div>
          
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
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ 
                      background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                      textAlign: "center"
                    }}>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Họ tên</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>SĐT</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Loại xét nghiệm</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Ngày</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Giờ</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Ghi chú</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Trạng thái</th>
                      <th style={{ padding: '16px 20px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center" }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: "30px 0", color: "#0891b2", fontWeight: 500 }}>Không có lịch xét nghiệm nào</td>
                      </tr>
                    ) : (
                      bookings
                        .filter(b => {
                          // Lọc theo ngày nếu có
                          if (dateFilter && b.appointmentDate !== dateFilter) {
                            return false;
                          }
                          // Lọc theo loại xét nghiệm (dịch vụ) nếu có
                          if (testTypeFilter) {
                            // Sử dụng cùng logic hiển thị để tìm kiếm
                            // Sử dụng trực tiếp serviceName đã resolved lúc fetch
                            const serviceName = b.serviceName || "Không xác định";
                            
                            console.log(`Filter: Comparing '${serviceName}' with '${testTypeFilter}'`);
                            
                            if (!serviceName.toLowerCase().includes(testTypeFilter.toLowerCase())) {
                              console.log(`Filter: Excluded booking ${b.id}`);
                              return false;
                            }
                            console.log(`Filter: Included booking ${b.id}`);
                          }
                          return true;
                        })
                        .map(b => (
                          <tr 
                            key={b.id}
                            style={{ 
                              borderBottom: '1px solid #e0f2fe', 
                              transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f9ff"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>{b.fullName}</td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>{b.phone}</td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 10,
                              justifyContent: "center"
                            }}>
                              <div style={{ 
                                width: "30px", 
                                height: "30px", 
                                borderRadius: "50%", 
                                backgroundColor: "#0891b2", 
                                color: "white", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                fontWeight: "bold",
                                fontSize: "16px"
                              }}>
                                🧪
                              </div>
                              <span style={{ 
                                fontWeight: 600, 
                                color: '#0891b2' 
                              }}>
                                {/* Hiển thị serviceName đã được resolved từ trước trong fetchBookings */}
                                {b.serviceName || "Xét nghiệm máu cơ bản"}
                              </span>
                            </div>
                          </td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>{b.appointmentDate || "N/A"}</td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>{b.startTime || "N/A"}</td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>
                              <div style={{ 
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {b.notes || "N/A"}
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>
                              <div style={{ display: "flex", justifyContent: "center" }}>
                                <span style={{
                                  display: "inline-block",
                                  padding: "6px 12px",
                                  borderRadius: "20px",
                                  fontWeight: 600,
                                  fontSize: "13px",
                                  backgroundColor: 
                                    b.testStatus === "Chờ bắt đầu" ? "#fde68a" : 
                                    b.testStatus === "Đã check-in" ? "#22d3ee" : "#86efac",
                                  color: 
                                    b.testStatus === "Chờ bắt đầu" ? "#b45309" : 
                                    b.testStatus === "Đã check-in" ? "#fff" : "#166534"
                                }}>
                                  {b.testStatus}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: "center" }}>
                              {b.testStatus === "Chờ bắt đầu" && (
                                <button 
                                  onClick={() => updateStatus(b.id, "Đã check-in")}
                                  style={{
                                    background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                >
                                  Check-in
                                </button>
                              )}
                              {b.testStatus === "Đã check-in" && (
                                <button 
                                  onClick={() => updateStatus(b.id, "Đã check-out")}
                                  style={{
                                    background: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                >
                                  Check-out
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Popup nhập kết quả xét nghiệm khi check-out */}
      {showResultPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ 
            background: "#fff", 
            padding: 32, 
            borderRadius: 12, 
            minWidth: 450,
            maxWidth: '90vw',
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            position: 'relative'
          }}>
            <h2 style={{ color: '#0891b2', marginBottom: 18, fontWeight: 700, fontSize: 24 }}>Nhập kết quả xét nghiệm</h2>
            
            {/* Thông tin khách hàng và loại xét nghiệm */}
            {pendingCheckoutId && bookings.find(b => b.id === pendingCheckoutId) && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 10 }}><b>Khách hàng:</b> {bookings.find(b => b.id === pendingCheckoutId)?.fullName}</div>
                <div style={{ marginBottom: 10 }}>
                  <b>Loại xét nghiệm:</b> {bookings.find(b => b.id === pendingCheckoutId)?.content || "N/A"}
                </div>
                <div style={{ marginBottom: 10 }}><b>Ngày khám:</b> {bookings.find(b => b.id === pendingCheckoutId)?.appointmentDate}</div>
              </div>
            )}
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Kết quả xét nghiệm:</label>
              <select 
                value={selectedResult} 
                onChange={e => setSelectedResult(e.target.value)} 
                style={{ 
                  width: "100%", 
                  padding: "10px 12px", 
                  borderRadius: 8, 
                  marginBottom: 16,
                  border: '1px solid #cbd5e1',
                  fontSize: '16px'
                }}
              >
                <option value="">-- Chọn kết quả --</option>
                <option value="Âm tính">Âm tính</option>
                <option value="Dương tính">Dương tính</option>
              </select>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Ghi chú chi tiết:</label>
              <textarea 
                value={resultNote} 
                onChange={e => setResultNote(e.target.value)}
                placeholder="Nhập chi tiết kết quả xét nghiệm nếu cần..."
                style={{ 
                  width: "100%", 
                  padding: "10px 12px", 
                  minHeight: 100, 
                  resize: "vertical",
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: '16px' 
                }}
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>File kết quả (nếu có):</label>
              <input 
                type="file" 
                onChange={e => setResultFile(e.target.files[0])} 
                style={{ 
                  width: "100%", 
                  padding: "10px 0", 
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <button 
                onClick={() => { 
                  setShowResultPopup(false); 
                  setPendingCheckoutId(null); 
                  setSelectedResult(""); 
                  setResultNote("");
                  setResultFile(null);
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
                onClick={handleConfirmResult} 
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
                Xác nhận kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTestBookingManager;
