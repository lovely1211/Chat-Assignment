import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Auth = () => {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    role: '',
    password: '',
  });  
  const navigate = useNavigate();

  const toggleAuthPage = () => {
    setIsLoginPage(!isLoginPage);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
  
    if (isLoginPage) {
      if (updatedFormData.email && updatedFormData.password) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } else {
      if (
        updatedFormData.name &&
        updatedFormData.email &&
        updatedFormData.contactNumber &&
        updatedFormData.role &&
        updatedFormData.password
      ) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    }
  };      

  const handleRegister = async(event) => {
    event.preventDefault();
    if(!formData.name || !formData.email || !formData.contactNumber || !formData.role || !formData.password ){
      alert("Please fill all the fields below.");
      return;
    }
    try {
      const newFormData = new FormData();
      newFormData.append('name', formData.name);
      newFormData.append('email', formData.email);
      newFormData.append('contactNumber', formData.contactNumber);
      newFormData.append('role', formData.role);
      newFormData.append('password', formData.password);

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post("http://localhost:8001/api/signup", formData, config);
      alert("Registration successful");
      
      localStorage.setItem("userInfo", JSON.stringify(data.user)); 
      window.location.href = '/'; 
    }catch (error){
      console.log(error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const normalizedEmail = formData.email.toLowerCase();
      const response = await axios.post('http://localhost:8001/api/signin', { email: normalizedEmail, password: formData.password }, formData, config);  
      const { token } = response.data;
  
      alert("Loggedin successful");
      localStorage.setItem('token', token);
      localStorage.setItem("userInfo", JSON.stringify(response.data.user)); 
      navigate('/');
    } catch (error) {
      console.log(error)
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">

      <div className="absolute inset-0 flex items-center justify-center">
        {/* Form Section */}
        <form className="w-1/3 p-8 bg-white text-gray-800 shadow-lg rounded-lg z-10" 
        onSubmit={!isLoginPage ? handleRegister : handleLogin}>

          {!isLoginPage && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Name</label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="text"
              name="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          {!isLoginPage && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Contact no.</label>
            <input
              type="text"
              name="contactNumber"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.contactNumber}
              onChange={handleInputChange}
            />
          </div>
          )}

          {!isLoginPage && (
          <div className='mb-4'>
            <label className="block text-gray-700 font-medium">Role</label>
          <select value={formData.role} 
          name='role'
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">-- Select Role --</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="institute">Institute</option>
          </select>
          </div>
          )}

          <div className="relative mb-4">
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.password}
              onChange={handleInputChange}
            />

            <button
             type="button"
             onClick={() => setShowPassword(!showPassword)}
             className="absolute right-2 top-2/3 transform -translate-y-1/2 bg-gray-200 p-1 rounded">
             {showPassword ? "Hide" : "Show"}
            </button>
             
          </div>

          <button
            type="submit"
            className={`w-full py-2 rounded-md text-white font-bold transition-all text-xl ${
              isValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'
            }`}
            disabled={!isValid}
          >
            {isLoginPage ? `Sign in` : `Sign up`}
          </button>

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}

          <div>
            <p className="text-sm text-gray-500 mt-4">
            {isLoginPage ? `Don't have an account? ` : `Already have an account? `}<span className="text-blue-500 underline cursor-pointer" onClick={toggleAuthPage}>{!isLoginPage ? 'Sign in' : 'Sign up'}</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
