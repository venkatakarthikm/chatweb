// ProfileCard.js
import React from 'react';
import './ProfileCard.css';

const ProfileCard = ({ contact, onSelect }) => {
  return (
    <div className="profile-card" onClick={() => onSelect(contact)}>
      <img src={contact.imagelink || "https://via.placeholder.com/50"} alt="Profile" />
      <div className="profile-info">
        <p>{contact.username}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
