import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AGORA_CONFIG } from '../config/agora.config';

const VideoCall = ({ channelName, onLeave, userRole = 'audience' }) => {
  const [client, setClient] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [token, setToken] = useState(null);
  const [joinError, setJoinError] = useState('');

  // Tạo UID là số nguyên khác nhau cho host và audience để tránh xung đột
  const uid = userRole === 'host' ? Math.floor(Math.random() * 9000) + 1000 : Math.floor(Math.random() * 9000) + 10000;

  const APP_ID = AGORA_CONFIG.APP_ID;
  
  // Reference cho video local và remote
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  
  // Debug thông tin kênh và role
  console.log(`VideoCall initializing - Channel: ${channelName}, Role: ${userRole}`);

  useEffect(() => {
    // Khởi tạo Agora client
    const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setClient(agoraClient);

    // Định nghĩa các event handler functions
    const handleUserPublishedSafe = async (user, mediaType) => {
      console.log(`🔔 Người dùng mới tham gia: UID ${user.uid} đã xuất bản ${mediaType}`);
      try {
        if (!agoraClient) {
          console.error('Client is null in handleUserPublished');
          return;
        }
        
        // Subscribe to the user's media
        await agoraClient.subscribe(user, mediaType);
        console.log(`✅ Đã đăng ký ${mediaType} stream từ UID ${user.uid}`);
        
        // Handle video media
        if (mediaType === "video") {
          // Update remoteUsers state to trigger UI update
          setRemoteUsers(prevUsers => {
            // Check if user already exists in the array
            const existingUserIndex = prevUsers.findIndex(u => u.uid === user.uid);
            
            if (existingUserIndex >= 0) {
              // Update existing user
              const updatedUsers = [...prevUsers];
              updatedUsers[existingUserIndex] = user;
              console.log(`🔄 Cập nhật người dùng hiện có: ${user.uid}`);
              return updatedUsers;
            } else {
              // Add new user
              console.log(`➕ Thêm người dùng mới: ${user.uid}`);
              return [...prevUsers, user];
            }
          });
        }
        
        // Handle audio media
        if (mediaType === "audio") {
          // Play audio immediately
          if (user.audioTrack) {
            user.audioTrack.play();
            console.log(`🔊 Đang phát audio từ UID ${user.uid}`);
          }
        }
      } catch (err) {
        console.error(`❌ Lỗi khi xử lý người dùng ${user.uid} xuất bản ${mediaType}:`, err);
      }
    };
    
    const handleUserUnpublishedSafe = (user, mediaType) => {
      console.log(`📴 Người dùng ${user.uid} đã dừng xuất bản ${mediaType}`);
      try {
        if (mediaType === "audio") {
          if (user.audioTrack) {
            user.audioTrack.stop();
          }
        }
        
        if (mediaType === "video") {
          // Just update the UI - don't remove the user from array as they might still have audio
          setRemoteUsers(prevUsers => {
            return prevUsers.map(u => {
              if (u.uid === user.uid) {
                // Create a new user object without videoTrack
                const updatedUser = {...u};
                updatedUser.videoTrack = null;
                return updatedUser;
              }
              return u;
            });
          });
        }
      } catch (err) {
        console.error(`❌ Lỗi khi xử lý người dùng ${user.uid} dừng xuất bản:`, err);
      }
    };
    
    const handleUserLeftSafe = (user) => {
      try {
        console.log(`👋 Người dùng với UID ${user.uid} đã rời khỏi kênh`);
        
        // Remove user from remoteUsers array
        setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
      } catch (err) {
        console.error(`❌ Lỗi khi xử lý người dùng ${user.uid} rời khỏi:`, err);
      }
    };

    // Đăng ký event listeners với client
    agoraClient.on("user-published", handleUserPublishedSafe);
    agoraClient.on("user-unpublished", handleUserUnpublishedSafe);
    agoraClient.on("user-left", handleUserLeftSafe);

    // Cleanup function
    return () => {
      agoraClient.off("user-published", handleUserPublishedSafe);
      agoraClient.off("user-unpublished", handleUserUnpublishedSafe);
      agoraClient.off("user-left", handleUserLeftSafe);
      if (isJoined) leaveChannel();
    };
  }, []);

  const fetchToken = async (channel) => {
    try {
      // Chuyển đổi role cho đúng định dạng API backend yêu cầu
      const roleForApi = userRole === 'host' ? 'publisher' : 'subscriber';
      
      console.log(`🔑 Đang lấy token cho kênh: ${channel}, role: ${roleForApi}, uid: ${uid}`);
      
      // QUAN TRỌNG: Sử dụng đúng URL và tham số mà backend yêu cầu
      const apiUrl = `http://localhost:8080/api/agora/token`;
      const queryParams = `?channelName=${encodeURIComponent(channel)}&uid=${uid}&role=${roleForApi}`;
      
      console.log("Calling API: " + apiUrl + queryParams);
      
      // Gọi API endpoint để lấy token
      const response = await fetch(apiUrl + queryParams, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API response:", data);
      
      // Kiểm tra token trong API response
      if (!data.token) {
        console.error('❌ Token is empty in server response:', data);
        throw new Error('Token is empty in server response');
      }
      
      // Trả về giá trị token
      console.log(`✅ Token nhận được`);
      return data.token;
    } catch (error) {
      console.error(`❌ Lỗi khi lấy token từ server: ${error.message}`, error);
      setJoinError(`Token fetch failed: ${error.message}`);
      throw error;
    }
  };

  // Handlers are now defined in the useEffect above

  const joinChannel = async () => {
    try {
      // Tạo UID là số nguyên khác nhau cho host và audience để tránh xung đột
      console.log(`⚙️ Khởi tạo kết nối với UID: ${uid}, vai trò: ${userRole}, kênh: ${channelName}`);

      if (!channelName) {
        console.error('Tên kênh không hợp lệ:', channelName);
        setJoinError("Không có thông tin kênh. Không thể tham gia cuộc gọi.");
        return;
      }

      try {
        // Lấy token từ server trước khi tham gia
        console.log("Đang lấy token từ server...");
        const newToken = await fetchToken(channelName);
        
        // Lưu token vào state
        setToken(newToken);
        
        if (!client) {
          console.error('Client is null!');
          setJoinError('Lỗi khởi tạo kết nối');
          return;
        }

        console.log(`====== THAM GIA CUỘC GỌI ======`);
        console.log(`Vai trò: ${userRole}`);
        console.log(`Kênh: ${channelName}`);
        console.log(`UID: ${uid}`);
        console.log(`Token: ${newToken.substring(0, 20)}...`);
        console.log('============================');
        
        // Tham gia kênh với token đã lấy được
        await client.join(APP_ID, channelName, newToken, uid);
        console.log('🎉 Đã tham gia với UID:', uid);
        
        console.log('Khởi tạo camera và microphone...');
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        
        console.log('Đã tạo thành công camera track và microphone track');
        setLocalVideoTrack(videoTrack);
        setLocalAudioTrack(audioTrack);
        
        if (localVideoRef.current) {
          console.log('Bắt đầu hiển thị video local');
          videoTrack.play(localVideoRef.current);
        }
        
        // Thêm delay nhỏ trước khi xuất bản để đảm bảo kết nối ổn định
        console.log('Đợi 1 giây trước khi xuất bản tracks...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Xuất bản audio/video tracks...');
        await client.publish([videoTrack, audioTrack]);
        
        setIsJoined(true);
        console.log(`✅ Đã xuất bản audio/video tracks đến kênh ${channelName}`);
      } catch (error) {
        console.error('❌ Lỗi khi tham gia cuộc gọi:', error);
        setJoinError(`Không thể tham gia cuộc gọi: ${error.message}`);
      }
    } catch (error) {
      console.error("Lỗi khi khởi tạo kết nối:", error);
      setJoinError("Lỗi khi khởi tạo kết nối: " + error.message);
    }
  };

  const leaveChannel = async () => {
    try {
      // Luôn đánh dấu kết thúc cuộc gọi nếu là host (tư vấn viên) trước khi thực hiện các thao tác khác
      // để đảm bảo callback được gọi ngay cả khi có lỗi
      const shouldEndCall = userRole === 'host';
      console.log(`🏁 [TRƯỚC] Tự động cập nhật trạng thái cuộc gọi: ${shouldEndCall ? 'Đã kết thúc' : 'Không thay đổi'}`);
      
      // Gọi callback ngay lập tức để cập nhật trạng thái cuộc gọi
      if (shouldEndCall && typeof onLeave === 'function') {
        console.log(`📱 Gọi callback onLeave(true) để cập nhật trạng thái "Đã kết thúc"`);
        onLeave(true);
      }
      
      console.log("🚪 Đang rời khỏi kênh...");
      
      // Release local tracks
      localAudioTrack?.close();
      localVideoTrack?.close();
      
      // Leave the channel
      if (client) {
        await client.leave();
      }
      
      console.log("👋 Đã rời khỏi kênh");
      
      // Reset state
      setRemoteUsers([]);
      setLocalAudioTrack(null);
      setLocalVideoTrack(null);
      setIsJoined(false);
      
      // Gọi lại callback onLeave cho người dùng không phải host
      if (!shouldEndCall && typeof onLeave === 'function') {
        console.log(`📱 Gọi callback onLeave(false) cho người dùng không phải tư vấn viên`);
        onLeave(false);
      }
      
    } catch (err) {
      console.error(`❌ Lỗi khi rời khỏi kênh: ${err}`);
      
      // Vẫn gọi onLeave ngay cả khi có lỗi nếu chưa được gọi trước đó
      if (typeof onLeave === 'function' && userRole !== 'host') {
        onLeave(false);
      }
    }
  };

  const toggleMute = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isMuted);
      setIsMuted(!isMuted);
      console.log(`🎤 Microphone ${!isMuted ? 'bật' : 'tắt'}`);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoOff);
      setIsVideoOff(!isVideoOff);
      console.log(`📷 Camera ${!isVideoOff ? 'bật' : 'tắt'}`);
    }
  };

  // Render remote videos
  useEffect(() => {
    try {
      console.log(`♻️ Cập nhật danh sách remoteUsers: ${remoteUsers.length} người dùng`);
      
      remoteUsers.forEach(user => {
        if (user.videoTrack) {
          const container = remoteVideoRefs.current[user.uid];
          if (container) {
            console.log(`▶️ Bắt đầu phát video của người dùng ${user.uid} vào container`);
            // Đảm bảo dừng bất kỳ phát lại nào hiện tại trước khi phát lại
            user.videoTrack.stop();
            // Sử dụng setTimeout để đảm bảo DOM đã được cập nhật
            setTimeout(() => {
              if (remoteVideoRefs.current[user.uid]) {
                user.videoTrack.play(remoteVideoRefs.current[user.uid]);
              }
            }, 100);
          } else {
            console.warn(`⚠️ Không tìm thấy container cho UID ${user.uid}`);
          }
        } else {
          console.warn(`⚠️ Người dùng ${user.uid} không có video track`);
        }
      });
    } catch (error) {
      console.error("❌ Lỗi khi render remote videos:", error);
    }
  }, [remoteUsers]);
  
  // Thêm kiểm tra khi channelName thay đổi
  useEffect(() => {
    console.log(`🚀 VideoCall: Kênh đã được cập nhật thành "${channelName}"`);
    // Reset lại các state nếu kênh thay đổi trong khi đã tham gia
    if (isJoined && channelName) {
      console.log("Channel đã thay đổi trong khi đang tham gia, cần reset lại kết nối");
      leaveChannel();
    }
  }, [channelName]);

  // In the component - add this effect to handle remote video playback
  useEffect(() => {
    const playRemoteVideos = async () => {
      remoteUsers.forEach(user => {
        if (user.videoTrack) {
          // Find the container for this user
          const playerContainer = document.getElementById(`remote-player-${user.uid}`);
          if (playerContainer) {
            console.log(`🎥 Playing remote video for UID: ${user.uid}`);
            user.videoTrack.play(playerContainer);
          } else {
            console.warn(`⚠️ Container for remote user ${user.uid} not found!`);
          }
        }
      });
    };
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      playRemoteVideos();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [remoteUsers]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        zIndex: 99999, // tăng zIndex lên rất cao để đảm bảo nổi trên mọi overlay
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0 }}>Tư vấn trực tuyến</h3>
          <div style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.8 }}>
            {userRole === 'host' ? '💼 Tư vấn viên' : '👤 Khách hàng'} | Kênh: {channelName || 'Chưa có'} | {isJoined ? '🟢 Đã kết nối' : '🟠 Chưa kết nối'}
          </div>
          {joinError && <div style={{ color: '#ff5555', marginTop: '5px' }}>Lỗi: {joinError}</div>}
        </div>
        <button
          onClick={leaveChannel}
          style={{
            backgroundColor: '#ff4444',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Kết thúc cuộc gọi
        </button>
      </div>

      {/* Video Container */}
      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        {/* Remote Video (Main) */}
        <div style={{ flex: 1, position: 'relative' }}>
          {remoteUsers.map(user => (
            <div
              key={user.uid}
              ref={el => remoteVideoRefs.current[user.uid] = el}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#333'
              }}
            />
          ))}
          {remoteUsers.length === 0 && (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{ fontSize: '48px' }}>{userRole === 'host' ? '👨‍⚕️' : '👩‍⚕️'}</div>
              {isJoined ? (
                <div>
                  <p>Đang chờ {userRole === 'host' ? 'khách hàng' : 'tư vấn viên'} tham gia...</p>
                  <p style={{ fontSize: '14px', opacity: 0.8 }}>Kênh: {channelName}</p>
                </div>
              ) : (
                <div>Nhấn "Tham gia cuộc gọi" để bắt đầu kết nối</div>
              )}
            </div>
          )}
        </div>

        {/* Local Video (Small) */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '200px',
          height: '150px',
          backgroundColor: '#333',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '2px solid #fff'
        }}>
          <div
            ref={localVideoRef}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Controls */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px'
      }}>
        {!isJoined ? (
          <button
            onClick={() => {
              if (!channelName) {
                alert("Không thể tham gia cuộc gọi vì thiếu thông tin kênh!");
                return;
              }
              joinChannel();
            }}
            disabled={!channelName}
            style={{
              backgroundColor: !channelName ? '#888' : '#4CAF50',
              color: '#fff',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              cursor: channelName ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            🎥 Tham gia cuộc gọi {!channelName ? '(Thiếu kênh)' : ''}
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              style={{
                backgroundColor: isMuted ? '#ff4444' : '#4CAF50',
                color: '#fff',
                border: 'none',
                padding: '15px',
                borderRadius: '50%',
                cursor: 'pointer',
                width: '60px',
                height: '60px',
                fontSize: '20px'
              }}
              title={isMuted ? 'Bật mic' : 'Tắt mic'}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>

            <button
              onClick={toggleVideo}
              style={{
                backgroundColor: isVideoOff ? '#ff4444' : '#4CAF50',
                color: '#fff',
                border: 'none',
                padding: '15px',
                borderRadius: '50%',
                cursor: 'pointer',
                width: '60px',
                height: '60px',
                fontSize: '20px'
              }}
              title={isVideoOff ? 'Bật camera' : 'Tắt camera'}
            >
              {isVideoOff ? '📹' : '📷'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
