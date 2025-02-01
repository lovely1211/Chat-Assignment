import React, { useEffect, useState } from 'react';
import Logout from './logout';
import axios from 'axios';

const Profile = ({ onClose }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.id && !parsedUser._id) {
          console.error('User ID is missing in localStorage data:', parsedUser);
          return;
        }
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || '',
          contactNumber: parsedUser.contactNumber || '',
          email: parsedUser.email || '',
          role: parsedUser.role || '',
        });
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }
  }, []);  

  const handleEditClick = () => setIsEditing(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveClick = async () => {
    try {
      if (!user || (!user.id && !user._id)) {
        console.error('No valid user ID available to update.');
        return;
      }

      const response = await axios.put(
        `http://localhost:8001/api/users/${user.id}`,
        formData
      );

      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setIsEditing(false);
      
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Error updating profile. Please try again.');
    }
  };    

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p className="text-center text-red-600">No user data available. Please log in.</p>
          <button
            onClick={onClose}
            className="bg-blue-500 text-white p-2 rounded mt-3 w-full"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
      <div className="relative bg-white p-4 rounded-lg shadow-lg w-1/3">
        <button onClick={onClose} className="absolute top-3 right-3 text-2xl font-bold px-1 border-2 border-black rounded-md">
          &times;
        </button>
        <div className="text-4xl font-bold text-center m-2">
          {isEditing ? 'Edit Profile' : 'User Profile'}
        </div>
        <div className="m-4 p-2">
          {isEditing ? (
            <>
              <p><strong>Name: </strong>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border p-1 rounded"
                />
              </p>
              <p><strong>Phone: </strong>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="border p-1 rounded"
                />
              </p>
              <p><strong>Email: </strong>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border p-1 rounded"
                />
              </p>
              <p><strong>Role: </strong>
                <select 
                  value={formData.role} 
                  onChange={handleChange}
                  name="role"
                  className="border p-1 rounded"
                >
                  <option value="">-- Select Role --</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="institute">Institute</option>
                </select>
              </p>
              <button
                onClick={handleSaveClick}
                className="bg-green-500 hover:bg-green-700 text-white p-2 rounded mt-3 w-1/2 font-bold text-xl"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <p><strong>Name: </strong> {user.name}</p>
              <p><strong>Phone: </strong> {user.contactNumber}</p>
              <p><strong>Email: </strong> {user.email}</p>
              <p><strong>Role: </strong> {user.role}</p>
              <div className="flex flex-row justify-between">
                <button
                  onClick={handleEditClick}
                  className="border-2 border-black rounded-xl hover:bg-blue-800 bg-blue-600 text-white font-bold p-2 text-xl mt-4 mx-2 w-1/4"
                >
                  Edit
                </button>
                <Logout />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
