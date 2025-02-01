import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Profile from "./profile";
import axios from "axios";

const ProfilePopup = ({ onClose }) => {
    return (
        <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="absolute inset-0 bg-gray-500 opacity-50" onClick={onClose}></div>
            <div className="relative bg-white p-6 rounded-lg shadow-lg z-10">
                <Profile />
                <button
                    className="absolute top-2 right-2 text-xl font-bold"
                    onClick={onClose}
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

const socket = io("http://localhost:8001");

const Messages = () => {
    const [isProfilePopupOpen, setProfilePopupOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUserId] = useState(1);
    const messagesEndRef = useRef(null);

    // Scroll to the bottom of the chat
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const interval = setInterval(fetchUsers, 5000); // Poll every 5 seconds
        return () => clearInterval(interval); // Clean up on component unmount
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages();
        }
    }, [selectedUser]);

    useEffect(() => {
        socket.on("message", (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => socket.off("message"); // Clean up on component unmount
    }, []);

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8001/api/messages/online-status"
            );
            const currentUser = JSON.parse(localStorage.getItem("userInfo"));
            const filteredUsers = response.data.filter(
                (user) => user.id !== currentUser.id
            );
            setUsers(filteredUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Fetch messages between selected user and current user
    const fetchMessages = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8001/api/messages/${currentUserId}/${selectedUser.id}`
            );
            setMessages(response.data);

            // Mark unread messages as read
            const unreadMessageIds = response.data
                .filter((msg) => !msg.isRead)
                .map((msg) => msg.id);

            if (unreadMessageIds.length > 0) {
                await axios.put(`http://localhost:8001/api/messages/read`, {
                    messageIds: unreadMessageIds,
                });
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    // Send a new message
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            await axios.post("http://localhost:8001/api/messages/send", {
                senderId: currentUserId,
                receiverId: selectedUser.id,
                message: newMessage,
            });

            // Append the new message to the messages array
            setMessages((prevMessages) => [
                ...prevMessages,
                { message: newMessage, senderId: currentUserId },
            ]);

            // Clear the input field
            setNewMessage("");

            // Scroll to the bottom
            scrollToBottom();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleOpenProfile = () => setIsProfileOpen(true);
    const handleCloseProfile = () => setIsProfileOpen(false);

    return (
        <div className="flex h-screen">
            {isProfilePopupOpen && (
                <ProfilePopup onClose={() => setProfilePopupOpen(false)} />
            )}
            {/* User List */}
            <div className="w-1/4 bg-gray-100 border-r p-4">
                <div
                    className="m-4 flex justify-between items-center"
                    onClick={handleOpenProfile}
                >
                    <div className="flex flex-col space-y-2 cursor-pointer">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHdnnOykpAMMc0nO0bDPcYu4mrseuG9cNoopzDkPFjnp9pdO7BxLW4Ohv0p0tX5ZGivYQ&usqp=CAU"
                            alt="user"
                            className="w-10 rounded-full"
                        />
                        Profile
                    </div>
                </div>
                <h2 className="text-lg font-bold mb-4">Users</h2>
                <ul>
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className={`p-2 rounded-lg cursor-pointer flex items-center ${
                                selectedUser?.id === user.id
                                    ? "bg-blue-200"
                                    : "hover:bg-gray-200"
                            }`}
                            onClick={() => setSelectedUser(user)}
                        >
                            {user.isOnline && (
                                <span className="text-green-500 font-bold">
                                    *
                                </span>
                            )}
                            <span
                                className={`w-2 h-2 rounded-full mr-2 ${
                                    user.isOnline
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                }`}
                            ></span>
                            {user.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 flex flex-col">
                {selectedUser ? (
                    <>
                        <h2 className="text-lg font-bold mb-4">
                            Chat with {selectedUser.name}
                        </h2>
                        <div className="messages-container flex-1 mb-4 overflow-y-auto">
                            <ul>
                                {messages.map((msg, index) => (
                                    <li
                                        key={index}
                                        className={`p-2 rounded-lg ${
                                            msg.senderId === currentUserId
                                                ? "bg-blue-100 text-right"
                                                : "bg-gray-100 text-left"
                                        }`}
                                    >
                                        {msg.message}
                                    </li>
                                ))}
                            </ul>
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="flex items-center p-2 border-t bg-white sticky bottom-0">
                            <input
                                type="text"
                                className="flex-1 border border-black rounded-lg p-2"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button
                                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
                                onClick={handleSendMessage}
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">
                        Select a user to start chatting.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Messages;
