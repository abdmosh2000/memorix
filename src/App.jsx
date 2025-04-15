import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfileSettings from './pages/ProfileSettings';
import CreateCapsule from './pages/CreateCapsule';
import PublicCapsules from './pages/PublicCapsules';
import Testimonials from './pages/Testimonials';
import Ratings from './pages/Ratings';
import RateExperience from './pages/RateExperience';
import Notifications from './pages/Notifications';
import UserProfile from './pages/UserProfile';
import Vision from './pages/Vision';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import StatsRecords from './pages/StatsRecords';
import Favorites from './pages/Favorites';
import { useAuth } from './auth'; // Custom auth hook
import { ThemeProvider } from './theme'; // Custom theme provider
import DemoNotifications from './components/DemoNotifications'; // Demo notifications generator
import './App.css'; // Global styles

function App() {
    const { isLoggedIn } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { authTokens, isLoading } = useAuth();
    
    // Add DemoNotifications if user is logged in
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <ThemeProvider>
            {isLoggedIn && <DemoNotifications />}
          
                <div className="app-container">
                    <Navbar toggleSidebar={toggleSidebar} />
                    <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <div className="content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/pricing" element={<Pricing />} />
                            <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/dashboard" />} />
                            <Route path="/register" element={!isLoggedIn ? <Register /> : <Navigate to="/dashboard" />} />
                            <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
                            <Route path="/profile" element={isLoggedIn ? <ProfileSettings /> : <Navigate to="/login" />} />
                            <Route path="/profile/settings" element={isLoggedIn ? <ProfileSettings /> : <Navigate to="/login" />} />
                            <Route path="/my-capsules" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
                            <Route path="/create" element={isLoggedIn ? <CreateCapsule /> : <Navigate to="/login" />} />
                            <Route path="/public" element={<PublicCapsules />} />
                            <Route path="/testimonials" element={<Testimonials />} />
                            <Route path="/ratings" element={<Ratings />} />
                            <Route path="/rate-experience" element={isLoggedIn ? <RateExperience /> : <Navigate to="/login" />} />
                            <Route path="/notifications" element={isLoggedIn ? <Notifications /> : <Navigate to="/login" />} />
                            <Route path="/profile/:userId" element={<UserProfile />} />
                            <Route path="/vision" element={<Vision />} />
                            <Route path="/about" element={<AboutUs />} />
                            <Route path="/contact" element={<ContactUs />} />
                            <Route path="/stats" element={<StatsRecords />} />
                            <Route path="/favorites" element={isLoggedIn ? <Favorites /> : <Navigate to="/login" />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
          
        </ThemeProvider>
    );
}

export default App;
