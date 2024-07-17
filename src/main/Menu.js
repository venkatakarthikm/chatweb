import React, { useEffect, useState, useCallback } from "react";
import "./Menu.css";
import ChatArea from "./ChatArea";
import ProfileCard from "./ProfileCard";
import axios from "axios";
import config from "../config";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Profile from "./Profile";

const Menu = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContacts, setShowContacts] = useState(true);
  const [theme, setTheme] = useState("light-theme");
  const [userData, setUserData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storedContacts, setStoredContacts] = useState([]);
  const [hoveredContact, setHoveredContact] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url;
      if (searchTerm) {
        url = `${config.url}/searchuser/${searchTerm}`;
      } else {
        url = `${config.url}/connections/${userData.username}`;
      }
      const response = await axios.get(url);
      if (response.data === "No User found") {
        setContacts([]);
        setError("No user found");
      } else {
        const fetchedContacts = response.data;
        setContacts(fetchedContacts);
        localStorage.setItem("contacts", JSON.stringify(fetchedContacts));
        setStoredContacts(fetchedContacts);
      }
    } catch (err) {
      setError("Error fetching contacts");
    }
    setLoading(false);
  }, [searchTerm, userData.username]);

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 60000);
    return () => clearInterval(interval);
  }, [fetchContacts]);

  useEffect(() => {
    const storedContacts = localStorage.getItem("contacts");
    if (storedContacts) {
      setStoredContacts(JSON.parse(storedContacts));
    }
  }, []);

  useEffect(() => {
    if (selectedContact) {
      localStorage.setItem("selectedContact", JSON.stringify(selectedContact));
    }
  }, [selectedContact]);

  const handleSelectContact = (contact) => {
    const filteredContact = {
      username: contact.username,
      profilename: contact.profilename,
      imagelink: contact.imagelink,
    };
    setSelectedContact(filteredContact);
    setShowContacts(false);
    setShowProfile(false); // Hide profile when a contact is selected
  };

  const handleBackButtonClick = () => {
    setSelectedContact(null);
    setShowContacts(true);
    setShowProfile(false); // Hide profile when back button is clicked
  };

  const toggleTheme = () => {
    setTheme(theme === "light-theme" ? "dark-theme" : "light-theme");
  };

  const handleLogout = () => {
    localStorage.removeItem("isUserLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedContact");
    localStorage.removeItem("contacts");
    window.location.reload();
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setSelectedContact(null); // Deselect any selected contact
  };

  const isMobile = window.innerWidth <= 575.98;

  return (
    <div className={`menu-container ${theme}`}>
      <div
        className="menu-left"
        style={{ display: isMobile && !showContacts ? "none" : "flex" }}
      >
        <div className="menu-header">
          <div className="menu-avatar">
            <img
              src={userData.imagelink || "https://via.placeholder.com/50"}
              alt="Avatar"
            />
          </div>
          <div className="menu-title">
            <h1>WhatsApp</h1>
          </div>
          <button onClick={toggleTheme}>
            {theme === "light-theme" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
        <input
          type="text"
          className="search-bar"
          placeholder="Search contacts"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setContacts([]);
          }}
        />
        {loading && <p>Loading...</p>}
        {!loading && error && <p>{error}</p>}
        {!loading && !error && contacts.length === 0 && <p>No users found</p>}
        {!loading && !error && contacts.length > 0 && (
          <div className="contact-list">
            {contacts.map((contact) => (
              <ProfileCard
                key={contact._id}
                contact={contact}
                onSelect={handleSelectContact}
                onMouseEnter={() => setHoveredContact(contact)}
                onMouseLeave={() => setHoveredContact(null)}
              />
            ))}
          </div>
        )}
        <div className="menu-footer">
          <div className="footer-section">
            <button onClick={handleProfileClick}>
              <AccountCircleIcon className="account-icon" />
            </button>
          </div>
          <div className="footer-section">
            <button className="placeholder-button">+</button>
          </div>
          <div className="footer-section">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
      <div
        className="menu-right"
        style={{ display: isMobile && showContacts ? "none" : "flex" }}
      >
        <div className="menu-header">
          <button className={`back-button ${theme}`} onClick={handleBackButtonClick}>
            <ArrowBackIcon />
          </button>
          {selectedContact && (
            <div className="chat-header">
              <img
                src={selectedContact.imagelink || "https://via.placeholder.com/50"}
                alt="Avatar"
              />
              <h2>{selectedContact.username}</h2>
              {selectedContact.online ? <span className="online-status">Online</span> : <span className="offline-status">Offline</span>}
            </div>
          )}
        </div>
        {showProfile ? (
          <Profile theme={theme} />
        ) : (
          <ChatArea selectedContact={selectedContact} sendIcon={<SendIcon />} />
        )}
      </div>
      {hoveredContact && (
        <div className="hovered-contact-info">
          <h3>{hoveredContact.username}</h3>
          <p>{hoveredContact.profilename}</p>
          <img
            src={hoveredContact.imagelink || "https://via.placeholder.com/50"}
            alt="Avatar"
          />
          {hoveredContact.online ? <span className="online-status">Online</span> : <span className="offline-status">Offline</span>}
        </div>
      )}
    </div>
  );
};

export default Menu;
