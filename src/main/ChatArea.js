import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatArea.css';
import config from './../config';

const ChatArea = ({ selectedContact }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const messageContainerRef = useRef(null);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('user'));
    if (storedUserData) {
      setUserData(storedUserData);
    }
  }, []);

  useEffect(() => {
    if (userData && selectedContact) {
      networkcheck();
    }
  }, [userData, selectedContact]);

  const networkcheck = async () => {
    try {
      const response = await axios.post(`${config.url}/searchconnection`, {
        userData: {
          username: userData.username,
          profilename: userData.profilename,
          email: userData.email,
        },
        receiverData: {
          username: selectedContact.username,
          profilename: selectedContact.profilename,
          email: selectedContact.email,
        }
      });
      const networkData = response.data;
      setNetworkId(networkData.networkid);
    } catch (error) {
      setNetworkId(null); // Reset networkId on error
      console.error('Error creating or finding chat connection', error);
    }
  };

  useEffect(() => {
    // Clear messages when selectedContact changes
    setMessages([]);
  }, [selectedContact]);

  useEffect(() => {
    fetchMessages(); // Initial fetch when component mounts
    const interval = setInterval(fetchMessages, 1000); // Fetch messages every second
    return () => clearInterval(interval); // Cleanup on unmount
  }, [networkId]);

  const fetchMessages = async () => {
    try {
      if (!networkId) return; // Exit if networkId is not set
      const response = await axios.get(`${config.url}/viewchat/${networkId}`);
      const fetchedMessages = response.data.map(msg => ({
        ...msg,
        read: false
      }));
      setMessages(fetchedMessages);
      if (initialLoadRef.current) {
        scrollToBottom();
        initialLoadRef.current = false;
      }
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  const sendMessage = async () => {
    if (!networkId || !message) return;

    try {
      await axios.post(`${config.url}/sendmessage`, {
        networkid: networkId,
        sender: userData.username,
        msg: message
      });
      setMessage('');
      fetchMessages(); // Fetch messages again after sending new message
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="chat-area">
      {selectedContact ? (
        <>
          <div ref={messageContainerRef} className="message-container">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`message ${msg.sender === userData.username ? 'sent' : 'received'} ${msg.read ? 'read' : 'unread'}`}
                // Assuming onClick marks message as read
              >
                <div className="message-content">{msg.msg}</div>
                <div className="message-time">{msg.msgtime}</div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      ) : (
        <p className="select-to-chat">Select a contact to start chatting</p>
      )}
    </div>
  );
};

export default ChatArea;
