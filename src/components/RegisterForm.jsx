import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import './RegisterForm.css';


function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [formError, setFormError] = useState('');
    const { register, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            
            // Create a preview URL for the image
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        
        // Validate terms acceptance
        if (!acceptTerms) {
            setFormError('You must accept the Terms of Use and Privacy Policy to register');
            return;
        }
        
        try {
            const result = await register(name, email, password, profilePicture);
            if (result.success) {
                console.log('Registration successful, navigating to dashboard');
                
                // Add a welcome notification
                addNotification(
                    `Welcome to Memorix, ${name}! We're excited to have you join us. Start by creating your first memory capsule!`, 
                    NOTIFICATION_TYPES.SYSTEM
                );
                
                // Add a small delay to ensure state updates before navigation
                setTimeout(() => {
                    navigate('/dashboard');
                }, 100);
            } else {
                setFormError(result.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setFormError('Registration failed. Please check your network connection and try again.');
        }
    };

    return (
        <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="profilePicture">Profile Picture:</label>
                <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                {previewUrl && (
                    <div className="image-preview">
                        <img src={previewUrl} alt="Profile Preview" style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '10px' }} />
                    </div>
                )}
            </div>
            
            <div className="form-group terms-checkbox">
                <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    required
                />
                <label htmlFor="terms">
                    I accept the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Use</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                </label>
            </div>
            
            {formError && <div className="error-message">{formError}</div>}
            
            <button type="submit" disabled={!acceptTerms}>Register</button>
        </form>
    );
}

export default RegisterForm;
