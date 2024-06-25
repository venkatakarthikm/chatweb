import React, { useEffect, useState } from "react";
import "./Menu.css";
import ChatArea from "./ChatArea";
import ProfileCard from "./ProfileCard";
import axios from "axios";
import config from "../config";

const Menu = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContacts, setShowContacts] = useState(true);
  const [theme, setTheme] = useState("light-theme");
  const [userData, setUserData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
    }
  }, []);

  useEffect(() => {
    const storedContact = localStorage.getItem("selectedContact");
    if (storedContact) {
      // Parse stored contact data
      const parsedContact = JSON.parse(storedContact);
      // Filter out sensitive fields
      const filteredContact = {
        username: parsedContact.username,
        profilename: parsedContact.profilename,
        imagelink: parsedContact.imagelink,
      };
      setSelectedContact(filteredContact);
      setShowContacts(false);
    }
  }, []);

  useEffect(() => {
    if (selectedContact) {
      localStorage.setItem("selectedContact", JSON.stringify(selectedContact));
    }
  }, [selectedContact]);

  useEffect(() => {
    if (searchTerm) {
      setLoading(true);
      setError(null);
      axios
        .get(`${config.url}/searchuser/${searchTerm}`)
        .then((response) => {
          if (response.data === "No User found") {
            setContacts([]);
            setError("No user found");
          } else {
            setContacts(response.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError("Error fetching contacts");
          setLoading(false);
        });
    } else {
      setContacts([]);
    }
  }, [searchTerm]);

  const handleSelectContact = (contact) => {
    // Filter the selected contact to store only non-sensitive fields
    const filteredContact = {
      username: contact.username,
      profilename: contact.profilename,
      imagelink: contact.imagelink,
    };
    setSelectedContact(filteredContact);
    setShowContacts(false);
  };

  const handleBackButtonClick = () => {
    setSelectedContact(null);
    setShowContacts(true);
  };

  const toggleTheme = () => {
    setTheme(theme === "light-theme" ? "dark-theme" : "light-theme");
  };

  const handleLogout = () => {
    localStorage.removeItem("isUserLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedContact");
    window.location.reload(); // You might want to redirect to the login page instead
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
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
              />
            ))}
          </div>
        )}
        <div className="menu-footer">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <div
        className="menu-right"
        style={{ display: isMobile && showContacts ? "none" : "flex" }}
      >
        <div className="menu-header">
          <button className="back-button" onClick={handleBackButtonClick}>
            Back
          </button>
          {selectedContact && (
            <div className="chat-header">
              <img
                src={selectedContact.imagelink || "https://via.placeholder.com/50"}
                alt="Avatar"
              />
              <h2>{selectedContact.username}</h2>
            </div>
          )}
        </div>
        <ChatArea selectedContact={selectedContact} />
      </div>
    </div>
  );
};

export default Menu;
