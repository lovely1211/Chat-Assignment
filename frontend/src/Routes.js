import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/authentication/auth';
import Home from './components/home/message';


const AppRoutes = () => {
  return (
    <div>
        <Router>
            <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Home />} /> 
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    </div>
  )
}

export default AppRoutes;