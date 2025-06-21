import React from 'react';

const CustomerAvatar = ({ name, gender, size = 50, showName = false }) => {
  // Function to generate avatar based on name and gender
  const getAvatarData = (name, gender) => {
    const firstName = name.split(' ').pop(); // Get first name
    const initials = firstName.charAt(0).toUpperCase();
    
    // Color schemes based on gender
    const maleColors = [
      { bg: '#3498db', text: '#ffffff' }, // Blue
      { bg: '#2ecc71', text: '#ffffff' }, // Green
      { bg: '#9b59b6', text: '#ffffff' }, // Purple
      { bg: '#34495e', text: '#ffffff' }, // Dark gray
      { bg: '#e67e22', text: '#ffffff' }, // Orange
    ];
    
    const femaleColors = [
      { bg: '#e91e63', text: '#ffffff' }, // Pink
      { bg: '#ff5722', text: '#ffffff' }, // Deep orange
      { bg: '#673ab7', text: '#ffffff' }, // Deep purple
      { bg: '#ff9800', text: '#ffffff' }, // Orange
      { bg: '#795548', text: '#ffffff' }, // Brown
    ];
    
    // Select color based on name hash and gender
    const colors = gender === 'Nam' ? maleColors : femaleColors;
    const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = nameHash % colors.length;
    
    return {
      initials,
      color: colors[colorIndex],
      emoji: gender === 'Nam' ? '👨' : '👩'
    };
  };

  const avatarData = getAvatarData(name, gender);

  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: avatarData.color.bg,
    color: avatarData.color.text,
    fontSize: `${size * 0.4}px`,
    fontWeight: 'bold',
    flexShrink: 0,
    border: '2px solid #ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: showName ? '12px' : '0' }}>
      <div style={avatarStyle}>
        {avatarData.initials}
      </div>
      {showName && (
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
            {name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {gender}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAvatar;
