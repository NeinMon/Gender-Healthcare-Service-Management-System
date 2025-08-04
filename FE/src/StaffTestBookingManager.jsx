import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "./UserAvatar";
import UserAccount from "./UserAccount";
import {
  STATUS_OPTIONS,
  fetchServiceNames,
  getServiceId,
  getServiceName,
  getStatusColor,
  fetchBookings,
  updateBookingStatus,
  fetchTestParameters,
  initializeSelectedParameters,
  initializeEditingParameters,
  validateRequiredParameters,
  validateOverallResult,
  hasParameterValues,
  sendTestResultWithSummary,
  sendTestResultSummary,
  completeTestBooking,
  fetchTestResults,
  fetchTestResultSummary,
  fetchParameterNames,
  updateTestResult,
  createTestResult,
  updateTestResultSummary,
  createTestResultSummary,
  transformBookingData
} from "./utils/staffTestBookingHelpers";

// Component chuyển hướng từ /staff sang /staff-test-bookings
export const RedirectToStaffTestBookings = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/staff-test-bookings", { replace: true });
  }, [navigate]);
  return null;
};

const StaffTestBookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState({ fullName: "Nhân viên" });
  const [showAccount, setShowAccount] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [pendingCheckoutId, setPendingCheckoutId] = useState(null);
  const [selectedParameters, setSelectedParameters] = useState({});
  const [resultNote, setResultNote] = useState("");
  const [showViewResultModal, setShowViewResultModal] = useState(false);
  const [viewResultData, setViewResultData] = useState(null);
  const [showEditResultModal, setShowEditResultModal] = useState(false);
  const [editResultData, setEditResultData] = useState(null);
  const [editingParameters, setEditingParameters] = useState({});
  const [editingResultNote, setEditingResultNote] = useState("");
  const [editingOverallResult, setEditingOverallResult] = useState("");
  const [editingOverallStatus, setEditingOverallStatus] = useState("NORMAL");
  const [testParameters, setTestParameters] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [testTypeFilter, setTestTypeFilter] = useState("");
  const [serviceNames, setServiceNames] = useState({});
  const [serviceNamesLoaded, setServiceNamesLoaded] = useState(false);
  const [overallResult, setOverallResult] = useState("");
  const [overallStatus, setOverallStatus] = useState("NORMAL"); // Mặc định là bình thường
  const navigate = useNavigate();

  // Hàm helper cho màu sắc trạng thái
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

  // Hàm lấy danh sách bookings với helper functions
  const handleFetchBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchBookings(statusFilter);
      let serviceIds = [];
      if (data.length > 0) {
        serviceIds = [...new Set(data.map(getServiceId).filter(Boolean))];
      }
      const namesObj = await fetchServiceNames(serviceIds);
      setServiceNames(prevNames => ({...prevNames, ...namesObj}));
      
      const transformedBookings = transformBookingData(data, {...serviceNames, ...namesObj});
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
    setLoading(false);
  };

  // Khởi tạo serviceNames từ API ngay khi component mount
  useEffect(() => {
    const initializeServices = async () => {
      try {
        const servicesMap = await fetchServiceNames([]);
        setServiceNames(servicesMap);
        setServiceNamesLoaded(true);
      } catch (error) {
        console.error('Error initializing services:', error);
        setServiceNames({});
        setServiceNamesLoaded(true);
      }
    };
    
    initializeServices();
  }, []);

  // Chỉ fetch bookings khi serviceNames đã sẵn sàng hoặc khi đổi trạng thái
  useEffect(() => {
    if (serviceNamesLoaded) {
      handleFetchBookings();
    }
    // eslint-disable-next-line
  }, [statusFilter, serviceNamesLoaded]);

  // Hàm đổi trạng thái booking (test booking)
  const handleUpdateStatus = async (id, newStatus) => {
    const success = await updateBookingStatus(id, newStatus);
    if (success) {
      handleFetchBookings();
    } else {
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  // Hàm mở popup để gửi kết quả
  const openResultPopup = async (id) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      alert("Không tìm thấy thông tin booking!");
      return;
    }
    
    console.log("Opening result popup for booking:", booking);
    console.log("Service ID:", booking.serviceId);
    
    try {
      setCurrentBooking(booking);
      setPendingCheckoutId(id);
      setShowResultPopup(true);
      
      // Lấy test parameters cho service này
      const parametersUrl = `http://localhost:8080/api/service-test-parameters/service/${booking.serviceId}`;
      console.log("Fetching parameters from:", parametersUrl);
      
      const parametersResponse = await fetch(parametersUrl);
      console.log("Parameters response status:", parametersResponse.status);
      
      if (parametersResponse.ok) {
        const parameters = await parametersResponse.json();
        console.log("Parameters received:", parameters);
        
        if (parameters && parameters.length > 0) {
          setTestParameters(parameters);
          
          // Khởi tạo selectedParameters với giá trị rỗng
          const initialParams = {};
          parameters.forEach(param => {
            initialParams[param.parameterId] = '';
          });
          setSelectedParameters(initialParams);
        } else {
          console.warn("No parameters found for service", booking.serviceId);
          // Khởi tạo với parameters mặc định cho testing
          const defaultParams = [
            { parameterId: 'temp1', parameterName: 'Kết quả chung', unit: '', normalRange: 'Âm tính/Dương tính' }
          ];
          setTestParameters(defaultParams);
          setSelectedParameters({ 'temp1': '' });
        }
      } else {
        const errorText = await parametersResponse.text();
        console.error("Error fetching parameters:", errorText);
        
        // Fallback: tạo parameters mặc định
        const fallbackParams = [
          { parameterId: 'fallback1', parameterName: 'Kết quả xét nghiệm', unit: '', normalRange: 'Âm tính/Dương tính' },
          { parameterId: 'fallback2', parameterName: 'Ghi chú bổ sung', unit: '', normalRange: 'Tùy chọn' }
        ];
        setTestParameters(fallbackParams);
        setSelectedParameters({ 'fallback1': '', 'fallback2': '' });
        
        console.warn("Using fallback parameters due to API error");
      }
      
    } catch (error) {
      console.error("Error loading test parameters:", error);
      
      // Fallback parameters kể cả khi có exception
      const emergencyParams = [
        { parameterId: 'emergency1', parameterName: 'Kết quả', unit: '', normalRange: 'Nhập kết quả' }
      ];
      setTestParameters(emergencyParams);
      setSelectedParameters({ 'emergency1': '' });
      
      alert("Không thể tải thông tin tham số xét nghiệm từ server. Sử dụng form đơn giản.");
    }
  };

  // Xác nhận và gửi kết quả xét nghiệm (chuyển từ "Đã check-out" thành "Đã kết thúc")
  const handleConfirmResult = async () => {
    // Kiểm tra tất cả các tham số bắt buộc đã được nhập chưa
    const missingParameters = [];
    testParameters.forEach(param => {
      const value = selectedParameters[param.parameterId];
      if (!value || value.trim() === '') {
        missingParameters.push(param.parameterName);
      }
    });

    // Bắt buộc nhập đầy đủ tất cả tham số - không cho phép bỏ qua
    if (missingParameters.length > 0) {
      alert(`Vui lòng nhập đầy đủ tất cả các tham số bắt buộc:\n- ${missingParameters.join('\n- ')}\n\nKhông thể gửi kết quả khi thiếu tham số.`);
      return;
    }

    // Kiểm tra có ít nhất một dữ liệu được nhập
    const hasParameterValues = Object.values(selectedParameters).some(value => value && value.trim() !== '');
    if (!hasParameterValues && (!overallResult || overallResult.trim() === '')) {
      alert("Vui lòng nhập ít nhất một giá trị tham số hoặc kết quả tổng quát!");
      return;
    }
    if (!hasParameterValues && (!overallResult || overallResult.trim() === '')) {
      alert("Vui lòng nhập ít nhất một giá trị tham số hoặc kết quả tổng quát!");
      return;
    }
    
    try {
      // Lặp qua từng parameter và gửi từng thông số một với kết quả tổng quát
      const parameterEntries = Object.entries(selectedParameters)
        .filter(([_, value]) => value && value.trim() !== '');

      // Nếu có kết quả chi tiết, gửi từng thông số
      if (parameterEntries.length > 0) {
        let summaryCreated = false;
        for (const [parameterId, value] of parameterEntries) {
          const isNumericId = !isNaN(parseInt(parameterId));
          const testResultObj = {
            testBookingInfoId: pendingCheckoutId,
            parameterId: isNumericId ? parseInt(parameterId) : parameterId,
            resultValue: value.trim(),
            note: resultNote || "",
            status: overallStatus || "NORMAL",
            // Chỉ gửi kết quả tổng quát với parameter đầu tiên để tránh trùng lặp
            overallResult: !summaryCreated && overallResult ? overallResult.trim() : null,
            overallStatus: !summaryCreated ? (overallStatus || "NORMAL") : null,
            overallNote: !summaryCreated ? resultNote : null
          };
          
          // Gửi từng thông số với endpoint mới
          const res = await fetch('http://localhost:8080/api/test-results/with-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testResultObj)
          });
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Gửi kết quả cho tham số ${parameterId} thất bại: ${errorText}`);
          }
          summaryCreated = true; // Đánh dấu đã tạo summary
        }
      } else {
        // Nếu chỉ có kết quả tổng quát, chỉ lưu summary
        const summaryObj = {
          testBookingInfoId: pendingCheckoutId,
          overallResult: overallResult.trim(),
          overallStatus: overallStatus || "NORMAL",
          note: resultNote || ""
        };
        
        const summaryRes = await fetch('http://localhost:8080/api/test-result-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(summaryObj)
        });
        if (!summaryRes.ok) {
          const errorText = await summaryRes.text();
          throw new Error(`Gửi kết quả tổng quát thất bại: ${errorText}`);
        }
      }

      // Chuyển trạng thái thành "Đã kết thúc"
      const completeRes = await fetch(
        `http://localhost:8080/api/test-bookings/${pendingCheckoutId}/status?status=${encodeURIComponent("Đã kết thúc")}`,
        { method: "PUT" }
      );
      if (!completeRes.ok) {
        throw new Error(`Không thể hoàn thành xét nghiệm. Mã lỗi: ${completeRes.status}`);
      }

      setShowResultPopup(false);
      setPendingCheckoutId(null);
      setSelectedParameters({});
      setResultNote("");
      setOverallResult("");
      setOverallStatus("NORMAL");
      setTestParameters([]);
      setCurrentBooking(null);
      handleFetchBookings();
      alert("Đã gửi kết quả xét nghiệm thành công!");
    } catch (error) {
      console.error("Error in handleConfirmResult:", error);
      alert("Gửi kết quả thất bại: " + error.message);
    }
  };

  // Hàm xem kết quả xét nghiệm đã hoàn thành
  const handleViewResult = async (booking) => {
    try {
      console.log("Fetching test results for booking ID:", booking.id);
      
      // Lấy test result từ API mới (dùng testBookingInfoId)
      const response = await fetch(`http://localhost:8080/api/test-results/test-booking/${booking.id}`);
      console.log("Test results response status:", response.status);
      
      let testResults = [];
      let parameterNames = {}; // Để map ID tham số với tên tham số
      if (response.ok) {
        testResults = await response.json();
        console.log("Test results:", testResults);
        
        // Lấy thông tin tên tham số từ API service-test-parameters
        if (testResults.length > 0) {
          try {
            const serviceId = booking.serviceId;
            if (serviceId) {
              console.log("Fetching parameter names for service:", serviceId);
              const parametersResponse = await fetch(`http://localhost:8080/api/service-test-parameters/service/${serviceId}`);
              if (parametersResponse.ok) {
                const parameters = await parametersResponse.json();
                console.log("Service parameters:", parameters);
                
                // Tạo map từ parameterId sang parameterName
                parameters.forEach(param => {
                  parameterNames[param.parameterId] = param.parameterName;
                });
              }
            }
          } catch (paramError) {
            console.log("Error fetching parameter names:", paramError);
          }
        }
      } else if (response.status === 404) {
        console.log("No test results found for this booking");
        testResults = [];
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error('Không thể lấy thông tin kết quả chi tiết');
      }
      
      // Lấy kết quả tổng quát
      let summaryData = null;
      try {
        console.log("Fetching summary for booking ID:", booking.id);
        const summaryResponse = await fetch(`http://localhost:8080/api/test-result-summary/test-booking/${booking.id}`);
        console.log("Summary response status:", summaryResponse.status);
        
        if (summaryResponse.ok) {
          summaryData = await summaryResponse.json();
          console.log("Summary data:", summaryData);
        } else if (summaryResponse.status === 404) {
          console.log("No summary found for this booking");
        }
      } catch (summaryError) {
        console.log("Error fetching summary:", summaryError);
      }
      
      setViewResultData({
        customerName: booking.fullName,
        phone: booking.phone,
        serviceName: booking.serviceName,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.startTime,
        testResults: testResults,
        parameterNames: parameterNames, // Thêm map tên tham số
        summary: summaryData,
        bookingContent: booking.notes
      });
      setShowViewResultModal(true);
    } catch (error) {
      console.error("Error in handleViewResult:", error);
      alert("Không thể tải thông tin kết quả: " + error.message);
    }
  };

  // Hàm mở modal chỉnh sửa kết quả
  const handleEditResult = async (booking) => {
    try {
      console.log("Fetching test results for editing, booking ID:", booking.id);
      
      // Lấy test result từ API mới (dùng testBookingInfoId)
      const response = await fetch(`http://localhost:8080/api/test-results/test-booking/${booking.id}`);
      console.log("Test results response status:", response.status);
      
      let testResults = [];
      if (response.ok) {
        testResults = await response.json();
        console.log("Test results for editing:", testResults);
      } else if (response.status === 404) {
        console.log("No test results found for editing");
        testResults = [];
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error('Không thể lấy thông tin kết quả chi tiết');
      }

      // Lấy test parameters cho service này
      const parametersResponse = await fetch(`http://localhost:8080/api/service-test-parameters/service/${booking.serviceId}`);
      if (parametersResponse.ok) {
        const parameters = await parametersResponse.json();
        setTestParameters(parameters);
        // Khởi tạo editing parameters với giá trị hiện tại
        const currentParams = {};
        parameters.forEach(param => {
          const existing = testResults.find(tr => tr.parameterId === param.parameterId);
          currentParams[param.parameterId] = existing ? existing.resultValue : '';
        });
        setEditingParameters(currentParams);
      } else {
        console.log("No parameters found for service:", booking.serviceId);
        setTestParameters([]);
        setEditingParameters({});
      }

      // Lấy test result summary hiện có (nếu có)
      let summaryData = null;
      try {
        console.log("Fetching summary for editing, booking ID:", booking.id);
        const summaryResponse = await fetch(`http://localhost:8080/api/test-result-summary/test-booking/${booking.id}`);
        console.log("Summary response status:", summaryResponse.status);
        
        if (summaryResponse.ok) {
          summaryData = await summaryResponse.json();
          console.log("Summary data for editing:", summaryData);
          
          // Load dữ liệu summary vào form
          setEditingOverallResult(summaryData.overallResult || '');
          setEditingOverallStatus(summaryData.overallStatus || 'NORMAL');
          setEditingResultNote(summaryData.note || '');
        } else if (summaryResponse.status === 404) {
          console.log("No summary found for editing");
          // Reset form về trạng thái mặc định
          setEditingOverallResult('');
          setEditingOverallStatus('NORMAL');
          setEditingResultNote('');
        }
      } catch (summaryError) {
        console.log("Error fetching summary for editing:", summaryError);
        // Reset form về trạng thái mặc định nếu có lỗi
        setEditingOverallResult('');
        setEditingOverallStatus('NORMAL');
        setEditingResultNote('');
      }

      setEditResultData({
        id: booking.id,
        // Không set resultId vì có thể có nhiều result, sẽ lấy từng cái khi update
        customerName: booking.fullName,
        phone: booking.phone,
        serviceName: booking.serviceName,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.startTime,
        bookingContent: booking.notes,
        testResults: testResults,
        summary: summaryData // Thêm summary data để reference
      });
      
      setShowEditResultModal(true);
    } catch (error) {
      console.error("Error in handleEditResult:", error);
      alert("Không thể tải thông tin kết quả: " + error.message);
    }
  };

  // Hàm cập nhật kết quả xét nghiệm
  const handleUpdateResult = async () => {
    console.log("Starting handleUpdateResult");
    console.log("editResultData:", editResultData);
    console.log("editingParameters:", editingParameters);
    
    // Kiểm tra tất cả các tham số bắt buộc đã được nhập chưa
    const missingParameters = [];
    testParameters.forEach(param => {
      const value = editingParameters[param.parameterId];
      if (!value || value.trim() === '') {
        missingParameters.push(param.parameterName);
      }
    });

    // Bắt buộc nhập đầy đủ tất cả tham số - không cho phép bỏ qua
    if (missingParameters.length > 0) {
      alert(`Vui lòng nhập đầy đủ tất cả các tham số bắt buộc:\n- ${missingParameters.join('\n- ')}\n\nKhông thể cập nhật kết quả khi thiếu tham số.`);
      return;
    }

    // Kiểm tra có ít nhất một tham số được nhập
    const hasValues = Object.values(editingParameters).some(value => value && value.trim() !== '');
    if (!hasValues && (!editingOverallResult || editingOverallResult.trim() === '')) {
      alert("Vui lòng nhập ít nhất một giá trị tham số hoặc kết quả tổng quát!");
      return;
    }
    
    try {
      // Lặp qua từng parameter và cập nhật từng result
      const parameterEntries = Object.entries(editingParameters)
        .filter(([_, value]) => value && value.trim() !== '');

      for (const [parameterId, value] of parameterEntries) {
        console.log(`Processing parameter ${parameterId} with value: ${value}`);
        
        // Tìm test result existing cho parameter này
        const existingResult = editResultData.testResults.find(tr => 
          tr.parameterId.toString() === parameterId.toString()
        );
        
        console.log(`Existing result for parameter ${parameterId}:`, existingResult);
        
        if (existingResult) {
          // Cập nhật result existing
          const updateData = {
            resultId: existingResult.resultId,
            testBookingInfoId: editResultData.id,
            parameterId: parseInt(parameterId),
            resultValue: value.trim(),
            note: editingResultNote || "",
            status: "NORMAL", // Hoặc logic khác để xác định status
            createdAt: existingResult.createdAt, // Giữ nguyên createdAt
            updatedAt: new Date().toISOString() // Cập nhật updatedAt
          };
          
          console.log(`Updating existing result with data:`, updateData);
          
          const response = await fetch(
            `http://localhost:8080/api/test-results/${existingResult.resultId}`,
            { 
              method: "PUT",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateData)
            }
          );
          
          console.log(`Update response status: ${response.status}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Update error response:`, errorText);
            throw new Error(`Không thể cập nhật kết quả cho tham số ${parameterId}. Mã lỗi: ${response.status}`);
          }
        } else {
          // Tạo mới result nếu chưa có
          const createData = {
            testBookingInfoId: editResultData.id,
            parameterId: parseInt(parameterId),
            resultValue: value.trim(),
            note: editingResultNote || "",
            status: "NORMAL"
          };
          
          console.log(`Creating new result with data:`, createData);
          
          const response = await fetch(
            `http://localhost:8080/api/test-results`,
            { 
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(createData)
            }
          );
          
          console.log(`Create response status: ${response.status}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Create error response:`, errorText);
            throw new Error(`Không thể tạo kết quả cho tham số ${parameterId}. Mã lỗi: ${response.status}`);
          }
        }
      }

      // Cập nhật hoặc tạo mới Test Result Summary
      if (editingOverallResult && editingOverallResult.trim() !== '') {
        try {
          // Kiểm tra xem đã có summary cho booking này chưa
          const summaryResponse = await fetch(`http://localhost:8080/api/test-result-summary/test-booking/${editResultData.id}`);
          
          if (summaryResponse.ok) {
            // Đã có summary, cập nhật
            const existingSummary = await summaryResponse.json();
            console.log("Existing summary found:", existingSummary);
            
            const updateSummaryData = {
              testBookingInfoId: editResultData.id,
              overallResult: editingOverallResult.trim(),
              overallStatus: editingOverallStatus || "NORMAL",
              note: editingResultNote || ""
            };
            
            console.log(`Updating summary with data:`, updateSummaryData);
            
            const updateSummaryResponse = await fetch(
              `http://localhost:8080/api/test-result-summary/${existingSummary.id}`,
              {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateSummaryData)
              }
            );
            
            if (!updateSummaryResponse.ok) {
              const errorText = await updateSummaryResponse.text();
              console.error("Update summary error:", errorText);
              throw new Error(`Không thể cập nhật kết quả tổng quát. Mã lỗi: ${updateSummaryResponse.status}`);
            }
            
            console.log("Summary updated successfully");
          } else if (summaryResponse.status === 404) {
            // Chưa có summary, tạo mới
            console.log("No existing summary found, creating new one");
            
            const createSummaryData = {
              testBookingInfoId: editResultData.id,
              overallResult: editingOverallResult.trim(),
              overallStatus: editingOverallStatus || "NORMAL",
              note: editingResultNote || ""
            };
            
            console.log(`Creating new summary with data:`, createSummaryData);
            
            const createSummaryResponse = await fetch(
              `http://localhost:8080/api/test-result-summary`,
              {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createSummaryData)
              }
            );
            
            if (!createSummaryResponse.ok) {
              const errorText = await createSummaryResponse.text();
              console.error("Create summary error:", errorText);
              throw new Error(`Không thể tạo kết quả tổng quát. Mã lỗi: ${createSummaryResponse.status}`);
            }
            
            console.log("Summary created successfully");
          } else {
            throw new Error(`Lỗi khi kiểm tra summary hiện có. Mã lỗi: ${summaryResponse.status}`);
          }
        } catch (summaryError) {
          console.error("Error handling summary:", summaryError);
          // Không throw error ở đây để không làm gián đoạn việc cập nhật test results
          alert("Cảnh báo: Cập nhật kết quả chi tiết thành công nhưng có lỗi khi cập nhật kết quả tổng quát: " + summaryError.message);
        }
      }
      
      setShowEditResultModal(false);
      setEditResultData(null);
      setEditingParameters({});
      setEditingResultNote("");
      setEditingOverallResult("");
      setEditingOverallStatus("NORMAL");
      setTestParameters([]);
      handleFetchBookings();
      alert("Đã cập nhật kết quả xét nghiệm thành công!");
    } catch (error) {
      console.error("Error in handleUpdateResult:", error);
      alert("Cập nhật kết quả thất bại: " + error.message);
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
          maxWidth: "1600px",
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
          maxWidth: "1600px",
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
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                  <thead>
                    <tr style={{ 
                      background: "linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)",
                      textAlign: "center"
                    }}>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "120px" }}>Họ tên</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "110px" }}>SĐT</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "200px" }}>Loại xét nghiệm</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "100px" }}>Ngày</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "80px" }}>Giờ</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "150px" }}>Ghi chú</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "110px" }}>Trạng thái</th>
                      <th style={{ padding: '16px 24px', color: '#fff', fontWeight: 600, fontSize: "15px", textAlign: "center", minWidth: "160px" }}>Hành động</th>
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
                            
                            if (!serviceName.toLowerCase().includes(testTypeFilter.toLowerCase())) {
                              return false;
                            }
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
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>{b.fullName}</td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>{b.phone}</td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 10,
                              justifyContent: "center",
                              flexWrap: 'wrap'
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
                                fontSize: "16px",
                                flexShrink: 0
                              }}>
                                🧪
                              </div>
                              <span style={{ 
                                fontWeight: 600, 
                                color: '#0891b2',
                                textAlign: 'center',
                                wordWrap: 'break-word'
                              }}>
                                {/* Hiển thị serviceName đã được resolved từ mapping */}
                                {b.serviceName || "Xét nghiệm chưa xác định"}
                              </span>
                            </div>
                          </td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>{b.appointmentDate || "N/A"}</td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>{b.startTime || "N/A"}</td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>
                              <div style={{ 
                                maxWidth: '250px',
                                wordWrap: 'break-word',
                                whiteSpace: 'normal',
                                lineHeight: '1.4'
                              }} title={b.notes || "N/A"}>
                                {b.notes || "N/A"}
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>
                              <div style={{ display: "flex", justifyContent: "center" }}>
                                <span style={{
                                  display: "inline-block",
                                  padding: "6px 12px",
                                  borderRadius: "20px",
                                  fontWeight: 600,
                                  fontSize: "13px",
                                  backgroundColor: getStatusColor(b.testStatus).bg,
                                  color: getStatusColor(b.testStatus).color
                                }}>
                                  {b.testStatus}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: "center" }}>
                              {b.testStatus === "Chờ bắt đầu" && (
                                <button 
                                  onClick={() => handleUpdateStatus(b.id, "Đã check-in")}
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
                                  onClick={() => handleUpdateStatus(b.id, "Đã check-out")}
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
                              {b.testStatus === "Đã check-out" && (
                                <button 
                                  onClick={() => openResultPopup(b.id)}
                                  style={{
                                    background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                >
                                  Gửi kết quả
                                </button>
                              )}
                              {b.testStatus === "Đã kết thúc" && (
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button 
                                    onClick={() => handleViewResult(b)}
                                    style={{
                                      background: 'linear-gradient(90deg, #9c27b0 0%, #ba68c8 100%)',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: '12px'
                                    }}
                                  >
                                    Xem kết quả
                                  </button>
                                  <button 
                                    onClick={() => handleEditResult(b)}
                                    style={{
                                      background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: '12px'
                                    }}
                                  >
                                    Sửa kết quả
                                  </button>
                                </div>
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
      
      {/* Modal xem kết quả xét nghiệm */}
      {showViewResultModal && viewResultData && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
      <div style={{ 
        background: "#fff", 
        padding: 32, 
        borderRadius: 12, 
        minWidth: 500,
        maxWidth: '90vw',
        maxHeight: '85vh', // Thêm chiều cao tối đa
        overflow: 'auto', // Thêm thanh cuộn khi nội dung vượt quá kích thước
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        position: 'relative'
      }}>
            <button 
              onClick={() => setShowViewResultModal(false)}
              style={{
                position: 'absolute',
                top: 12, right: 16,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: '#0891b2',
                cursor: 'pointer',
                fontWeight: 700
              }}
              title="Đóng"
            >×</button>
            
            <h2 style={{ color: '#0891b2', marginBottom: 18, fontWeight: 700, fontSize: 24 }}>Kết quả xét nghiệm</h2>
            
            <div style={{ marginBottom: 16, lineHeight: 1.6 }}>
              <div style={{ marginBottom: 12 }}><strong>Khách hàng:</strong> {viewResultData.customerName}</div>
              <div style={{ marginBottom: 12 }}><strong>Số điện thoại:</strong> {viewResultData.phone}</div>
              <div style={{ marginBottom: 12 }}><strong>Loại xét nghiệm:</strong> {viewResultData.serviceName}</div>
              <div style={{ marginBottom: 12 }}><strong>Ngày khám:</strong> {viewResultData.appointmentDate}</div>
              <div style={{ marginBottom: 12 }}><strong>Giờ khám:</strong> {viewResultData.appointmentTime || 'N/A'}</div>
              
              {/* Hiển thị kết quả tổng quát */}
              {viewResultData.summary && (
                <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f0f9ff', borderRadius: 8, border: '1px solid #22d3ee' }}>
                  <strong style={{ display: 'block', marginBottom: 12, color: '#0891b2', fontSize: 16 }}>Kết quả tổng quát:</strong>
                  
                  {viewResultData.summary.overallResult && (
                    <div style={{ marginBottom: 10 }}>
                      <strong>Kết luận:</strong> 
                      <div style={{ marginTop: 4, color: '#374151', fontStyle: 'italic' }}>
                        {viewResultData.summary.overallResult}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ marginBottom: 10 }}>
                    <strong>Trạng thái tổng quát:</strong> 
                    <span style={{ 
                      fontWeight: 600, 
                      color: viewResultData.summary.overallStatus === 'NORMAL' ? '#059669' : '#dc2626',
                      backgroundColor: viewResultData.summary.overallStatus === 'NORMAL' ? '#f0fdf4' : '#fef2f2',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      marginLeft: '8px',
                      border: `1px solid ${viewResultData.summary.overallStatus === 'NORMAL' ? '#bbf7d0' : '#fecaca'}`
                    }}>
                      {viewResultData.summary.overallStatus === 'NORMAL' ? 'Bình thường' : 'Bất thường'}
                    </span>
                  </div>
                  
                  {viewResultData.summary.note && (
                    <div style={{ marginTop: 10 }}>
                      <strong>Ghi chú tổng quát:</strong>
                      <div style={{ marginTop: 4, color: '#374151' }}>{viewResultData.summary.note}</div>
                    </div>
                  )}
                  
                  <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280' }}>
                    <strong>Cập nhật lần cuối:</strong> {new Date(viewResultData.summary.updatedAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              )}

              {/* Hiển thị kết quả theo parameter */}
              <div style={{ marginBottom: 16 }}>
                <strong style={{ display: 'block', marginBottom: 8, color: '#0891b2' }}>Kết quả chi tiết theo tham số:</strong>
                {viewResultData.testResults && viewResultData.testResults.length > 0 ? (
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: 12, 
                    borderRadius: 6,
                    border: '1px solid #e5e7eb'
                  }}>
                    {viewResultData.testResults.map((tr, index) => (
                      <div key={index} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: index < viewResultData.testResults.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                        <div><strong>Tham số:</strong> {viewResultData.parameterNames[tr.parameterId] || tr.parameterId}</div>
                        <div><strong>Kết quả:</strong> {tr.resultValue} {tr.unit || ''}</div>
                        <div><strong>Trạng thái:</strong> <span style={{
                          color: tr.status === 'NORMAL' ? '#059669' : '#dc2626',
                          fontWeight: 600
                        }}>{tr.status === 'NORMAL' ? 'Bình thường' : tr.status}</span></div>
                        {tr.note && <div><strong>Ghi chú:</strong> {tr.note}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#6b7280', fontStyle: 'italic' }}>Chưa có kết quả chi tiết</div>
                )}
              </div>
              
              {viewResultData.bookingContent && (
                <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
                  <strong>Ghi chú booking:</strong> {viewResultData.bookingContent}
                </div>
              )}
            </div>
            
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button 
                onClick={() => setShowViewResultModal(false)}
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
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa kết quả xét nghiệm */}
      {showEditResultModal && editResultData && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
      <div style={{ 
        background: "#fff", 
        padding: 32, 
        borderRadius: 12, 
        minWidth: 500,
        maxWidth: '90vw',
        maxHeight: '85vh', // Thêm chiều cao tối đa
        overflow: 'auto', // Thêm thanh cuộn khi nội dung vượt quá kích thước
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        position: 'relative'
      }}>
            <button 
              onClick={() => setShowEditResultModal(false)}
              style={{
                position: 'absolute',
                top: 12, right: 16,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: '#0891b2',
                cursor: 'pointer',
                fontWeight: 700
              }}
              title="Đóng"
            >×</button>
            
            <h2 style={{ color: '#0891b2', marginBottom: 18, fontWeight: 700, fontSize: 24 }}>Chỉnh sửa kết quả xét nghiệm</h2>
            
            {/* Thông tin khách hàng */}
            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
              <div style={{ marginBottom: 8 }}><strong>Khách hàng:</strong> {editResultData.customerName}</div>
              <div style={{ marginBottom: 8 }}><strong>Số điện thoại:</strong> {editResultData.phone}</div>
              <div style={{ marginBottom: 8 }}><strong>Loại xét nghiệm:</strong> {editResultData.serviceName}</div>
              <div style={{ marginBottom: 8 }}><strong>Ngày khám:</strong> {editResultData.appointmentDate}</div>
              <div><strong>Giờ khám:</strong> {editResultData.appointmentTime || 'N/A'}</div>
            </div>
            
            {/* Form chỉnh sửa */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
                Tham số xét nghiệm:
              </label>
              {testParameters.length > 0 ? (
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: 16, 
                  borderRadius: 8,
                  border: '1px solid #e5e7eb'
                }}>
                  {testParameters.map((param) => (
                    <div key={param.parameterId} style={{ marginBottom: 12 }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: 500,
                        color: '#374151'
                      }}>
                        {param.parameterName} {param.unit ? `(${param.unit})` : ''} <span style={{ color: '#000000', fontWeight: 600 }}>*</span>:
                      </label>
                      <input
                        type="text"
                        value={editingParameters[param.parameterId] || ''}
                        onChange={e => setEditingParameters(prev => ({
                          ...prev,
                          [param.parameterId]: e.target.value
                        }))}
                        placeholder={`Nhập ${param.parameterName.toLowerCase()}`}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          fontSize: '14px'
                        }}
                      />
                      {param.referenceRange && (
                        <small style={{ color: '#6b7280', fontSize: '12px' }}>
                          Giá trị bình thường: {param.referenceRange}
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  Đang tải tham số xét nghiệm...
                </div>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Ghi chú kết quả (tùy chọn):</label>
              <textarea 
                value={editingResultNote} 
                onChange={e => setEditingResultNote(e.target.value)} 
                placeholder="Nhập ghi chú thêm về kết quả xét nghiệm..."
                style={{ 
                  width: "100%", 
                  padding: "10px 12px", 
                  borderRadius: 8, 
                  border: '1px solid #cbd5e1',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Kết quả tổng quát */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
                Kết quả tổng quát <span style={{ color: '#000000', fontWeight: 600 }}>*</span>:
              </label>
              <textarea 
                value={editingOverallResult} 
                onChange={e => setEditingOverallResult(e.target.value)} 
                placeholder="Nhập kết quả tổng quát..."
                style={{ 
                  width: "100%", 
                  padding: "10px 12px", 
                  borderRadius: 8, 
                  border: '1px solid #cbd5e1',
                  fontSize: '16px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Trạng thái kết quả */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
                Trạng thái kết quả <span style={{ color: '#000000', fontWeight: 600 }}>*</span>:
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="editResultStatus"
                    value="NORMAL"
                    checked={editingOverallStatus === 'NORMAL'}
                    onChange={e => setEditingOverallStatus(e.target.value)}
                    style={{ marginRight: "6px" }}
                  />
                  <span style={{ color: "#059669", fontWeight: 500 }}>Bình thường</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="editResultStatus"
                    value="ABNORMAL"
                    checked={editingOverallStatus === 'ABNORMAL'}
                    onChange={e => setEditingOverallStatus(e.target.value)}
                    style={{ marginRight: "6px" }}
                  />
                  <span style={{ color: "#dc2626", fontWeight: 500 }}>Bất thường</span>
                </label>
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <button 
                onClick={() => { 
                  setShowEditResultModal(false); 
                  setEditResultData(null); 
                  setEditingParameters({}); 
                  setEditingResultNote("");
                  setEditingOverallResult("");
                  setEditingOverallStatus("NORMAL");
                  setTestParameters([]);
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
                onClick={handleUpdateResult} 
                style={{
                  background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 32,
                  padding: '12px 32px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 16,
                  boxShadow: '0 4px 24px rgba(16,185,129,0.18)'
                }}
              >
                Cập nhật kết quả
              </button>
            </div>
          </div>
        </div>
      )}

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
        maxHeight: '85vh', // Thêm chiều cao tối đa
        overflow: 'auto', // Thêm thanh cuộn khi nội dung vượt quá kích thước
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        position: 'relative'
      }}>
            <h2 style={{ color: '#0891b2', marginBottom: 18, fontWeight: 700, fontSize: 24 }}>Gửi kết quả xét nghiệm</h2>
            
            {/* Thông tin khách hàng và loại xét nghiệm */}
            {currentBooking && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 10 }}><b>Khách hàng:</b> {currentBooking.fullName}</div>
                <div style={{ marginBottom: 10 }}>
                  <b>Loại xét nghiệm:</b> {currentBooking.serviceName || "N/A"}
                </div>
                <div style={{ marginBottom: 10 }}><b>Ngày khám:</b> {currentBooking.appointmentDate}</div>
              </div>
            )}
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
                Tham số xét nghiệm:
              </label>
              {testParameters.length > 0 ? (
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: 16, 
                  borderRadius: 8,
                  border: '1px solid #e5e7eb'
                }}>
                  {testParameters.map((param) => (
                    <div key={param.parameterId} style={{ marginBottom: 12 }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 4, 
                        fontWeight: 500,
                        color: '#374151'
                      }}>
                        {param.parameterName} {param.unit ? `(${param.unit})` : ''}:
                      </label>
                      <input
                        type="text"
                        value={selectedParameters[param.parameterId] || ''}
                        onChange={e => setSelectedParameters(prev => ({
                          ...prev,
                          [param.parameterId]: e.target.value
                        }))}
                        placeholder={`Nhập ${param.parameterName.toLowerCase()}`}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          fontSize: '14px'
                        }}
                      />
                      {param.referenceRange && (
                        <small style={{ color: '#6b7280', fontSize: '12px' }}>
                          Giá trị bình thường: {param.referenceRange}
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  Đang tải tham số xét nghiệm...
                </div>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
                Kết quả tổng quát <span style={{ color: '#000000', fontWeight: 600 }}>*</span>:
              </label>
              <textarea 
                value={overallResult} 
                onChange={e => setOverallResult(e.target.value)} 
                placeholder="Nhập kết luận tổng quát về xét nghiệm..."
                style={{ 
                  width: "100%", 
                  padding: "10px 12px", 
                  borderRadius: 8, 
                  border: '1px solid #cbd5e1',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
                Trạng thái kết quả <span style={{ color: '#000000', fontWeight: 600 }}>*</span>:
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="resultStatus" 
                    value="NORMAL" 
                    checked={overallStatus === "NORMAL"} 
                    onChange={() => setOverallStatus("NORMAL")}
                    style={{ marginRight: "6px" }}
                  />
                  <span style={{ color: "#059669", fontWeight: 500 }}>Bình thường</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="resultStatus" 
                    value="ABNORMAL" 
                    checked={overallStatus === "ABNORMAL"} 
                    onChange={() => setOverallStatus("ABNORMAL")} 
                    style={{ marginRight: "6px" }}
                  />
                  <span style={{ color: "#dc2626", fontWeight: 500 }}>Bất thường</span>
                </label>
              </div>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Ghi chú kết quả (tùy chọn):</label>
              <textarea 
                value={resultNote} 
                onChange={e => setResultNote(e.target.value)} 
                placeholder="Nhập ghi chú thêm về kết quả xét nghiệm..."
                style={{ 
                  width: "100%", 
                  padding: "10px 12px", 
                  borderRadius: 8, 
                  border: '1px solid #cbd5e1',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <button 
                onClick={() => { 
                  setShowResultPopup(false); 
                  setPendingCheckoutId(null); 
                  setSelectedParameters({}); 
                  setResultNote("");
                  setTestParameters([]);
                  setCurrentBooking(null);
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
                Gửi kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTestBookingManager;
