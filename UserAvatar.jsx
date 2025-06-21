import React from 'react';
import { Link } from 'react-router-dom';

const UserAvatar = ({ userName = "User" }) => {
  return (
    <Link to="/user-account">
      <div style={{ 
        width: 40, 
        height: 40, 
        borderRadius: "50%", 
        backgroundColor: "rgba(255,255,255,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        fontSize: "16px",
        border: "2px solid rgba(255,255,255,0.5)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        textDecoration: "none"
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = "rgba(255,255,255,0.5)";
        e.target.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = "rgba(255,255,255,0.3)";
        e.target.style.transform = "scale(1)";
      }}
      title="Thông tin tài khoản"
      >
        {userName.charAt(0).toUpperCase()}
      </div>
    </Link>
  );
};

export default UserAvatar;
