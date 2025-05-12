import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import NetworkStatus from './components/NetworkStatus';
import MobileNavbar from './components/MobileNavbar';

// Essential pages - loaded eagerly
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Secondary pages - lazy loaded
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResendVerification = lazy(() => import('./pages/ResendVerification'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const CreateCapsule = lazy(() => import('./pages/CreateCapsule'));
const PublicCapsules = lazy(() => import('./pages/PublicCapsules'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const Ratings = lazy(() => import('./pages/Ratings'));
const RateExperience = lazy(() => import('./pages/RateExperience'));
const Notifications = lazy(() => import('./pages/Notifications'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Vision = lazy(() => import('./pages/Vision'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const StatsRecords = lazy(() => import('./pages/StatsRecords'));
const Favorites = lazy(() => import('./pages/Favorites'));

// Payment related pages - lazy loaded
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/PaymentFailed'));
const Checkout = lazy(() => import('./pages/Checkout'));

// Admin pages - lazy loaded
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const EditUser = lazy(() => import('./pages/EditUser'));
import { useAuth } from './auth'; // Custom auth hook
// ThemeProvider is already wrapped in index.js
import DemoNotifications from './components/DemoNotifications'; // Demo notifications generator
import './App.css'; // Global styles

function App() {
    const { isLoggedIn, user } = useAuth();
    const isAdmin = user && user.role === 'admin';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { authTokens, isLoading } = useAuth();
    
    // Add DemoNotifications if user is logged in
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <HelmetProvider>
            {isLoggedIn && <DemoNotifications />}
            <NetworkStatus />
          
                <div className="app-container">
                    <Navbar toggleSidebar={toggleSidebar} />
                    <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <div className="content">
                        <Suspense fallback={<div className="loading-page">Loading...</div>}>
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
                                <Route path="/verify-email" element={<VerifyEmail />} />
                                <Route path="/resend-verification" element={<ResendVerification />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/checkout" element={isLoggedIn ? <Checkout /> : <Navigate to="/login" />} />
                                <Route path="/payment/success" element={isLoggedIn ? <PaymentSuccess /> : <Navigate to="/login" />} />
                                <Route path="/payment/failed" element={<PaymentFailed />} />
                                <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
                                <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
                                <Route path="/admin/edit-user/:userId" element={isAdmin ? <EditUser /> : <Navigate to="/dashboard" />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </Suspense>
                    </div>
                    <Footer />
                    <MobileNavbar />
                </div>
        </HelmetProvider>
    );
}

export default App;
