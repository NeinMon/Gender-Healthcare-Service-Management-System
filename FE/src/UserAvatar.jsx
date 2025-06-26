import React from 'react';
import { Link } from 'react-router-dom';

const UserAvatar = ({ userName = "User", style = {} }) => {
  // Get user data from localStorage for consistency
  const loggedInUser = localStorage.getItem('loggedInUser');
  let currentUser = null;
  try {
    if (loggedInUser) {
      currentUser = JSON.parse(loggedInUser);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }

  const displayName = currentUser?.fullName || userName;

  return (
    <Link to="/user-account" style={{ textDecoration: 'none' }}>
      <div
        style={{
          width: style.width || 50,
          height: style.height || 50,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0891b2, #22d3ee)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "3px solid #fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
          ...style
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
        }}
        title={`Tài khoản của ${displayName}`}
      >
        <span style={{ 
          color: "#fff", 
          fontSize: style.fontSize || 20, 
          fontWeight: 600 
        }}>
          {displayName?.charAt(0)?.toUpperCase() || "U"}
        </span>
      </div>
    </Link>
  );
};

export default UserAvatar;
