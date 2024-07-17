import React from 'react';
import './ProfileCard.css';

const ProfileCard = ({ contact, onSelect }) => {
  return (
    <div className="profile-card" onClick={() => onSelect(contact)}>
      <img src={contact.imagelink || "https://via.placeholder.com/50"} alt="Profile" />
      <div className="profile-info">
        <p>{contact.username}</p>
        {contact.online ? <span className="online-status">Online</span> : <span className="offline-status">Offline</span>}
      </div>
    </div>
  );
};

export default ProfileCard;
