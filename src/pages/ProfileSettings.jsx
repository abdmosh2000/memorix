import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth';
import { updateUser } from '../api'; // Import API function
import SettingsControls from '../components/SettingsControls';
import './ProfileSettings.css'

function ProfileSettings() {
    const { user, authTokens } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // State for tracking which field is currently being edited
    const [editingField, setEditingField] = useState(null);
    // Preview for profile picture
    const [previewPicture, setPreviewPicture] = useState(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setProfilePicture(user.profilePicture || '');
        }
    }, [user]);

    const handleEdit = (field) => {
        setEditingField(field);
    };

    const handleCancel = () => {
        // Reset to original values
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setProfilePicture(user.profilePicture || '');
        }
        setEditingField(null);
        setPreviewPicture(null);
    };

    const handleSave = async (field) => {
        setLoading(true);
        setError(null);
        
        try {
            const updatedData = { _id: user._id };
            
            // Only include the field being edited
            if (field === 'name') updatedData.name = name;
            if (field === 'email') updatedData.email = email;
            if (field === 'profilePicture') updatedData.profilePicture = profilePicture;
            
            await updateUser(updatedData);
            
            // Update in localStorage
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...userData, ...updatedData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Close edit mode
            setEditingField(null);
            
            // Show success message
            alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
            
        } catch (err) {
            setError(err.message || 'Failed to update profile');
            console.error("Error updating profile:", err);
        } finally {
            setLoading(false);
        }
    };

    // Function to resize image before upload - with smaller size and quality
    const resizeImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.5) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Calculate new dimensions while preserving aspect ratio
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round(height * maxWidth / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round(width * maxHeight / height);
                            height = maxHeight;
                        }
                    }
                    
                    // Create canvas and resize image
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to data URL with reduced quality
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Check file size first
                if (file.size > 10 * 1024 * 1024) { // 10 MB
                    setError('File size too large. Please select an image under 10 MB.');
                    return;
                }
                
                setPreviewPicture(URL.createObjectURL(file));
                
                // Resize image
                const resizedImage = await resizeImage(file);
                setProfilePicture(resizedImage);
                
                console.log('Resized image size approximately:', 
                    Math.round(resizedImage.length * 0.75 / 1024), 'KB');
            } catch (err) {
                console.error('Error processing image:', err);
                setError('Error processing image. Please try again with a different image.');
            }
        }
    };

    return (
        <div className="profile-settings-page">
            <div className="profile-header">
                <h2>Profile Settings</h2>
                {user && (
                    <div className="profile-picture-large">
                        <img 
                            src={user.profilePicture || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="8" r="4" fill="%23888"/><path d="M20,19c0-4.4-3.6-8-8-8s-8,3.6-8,8" fill="%23888"/></svg>'} 
                            alt={user.name}
                        />
                    </div>
                )}
                
                {/* Add the SettingsControls component here */}
                <SettingsControls />
            </div>
            
            <div className="profile-settings-container">
                <div className="profile-field">
                    <div className="field-header">
                        <h3>Name</h3>
                        {editingField !== 'name' && (
                            <button 
                                className="edit-button" 
                                onClick={() => handleEdit('name')}
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    
                    {editingField === 'name' ? (
                        <div className="edit-field">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <div className="action-buttons">
                                <button 
                                    className="save-button" 
                                    onClick={() => handleSave('name')} 
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button 
                                    className="cancel-button" 
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="field-value">{user?.name || 'Not set'}</p>
                    )}
                </div>
                
                <div className="profile-field">
                    <div className="field-header">
                        <h3>Email</h3>
                        {editingField !== 'email' && (
                            <button 
                                className="edit-button" 
                                onClick={() => handleEdit('email')}
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    
                    {editingField === 'email' ? (
                        <div className="edit-field">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div className="action-buttons">
                                <button 
                                    className="save-button" 
                                    onClick={() => handleSave('email')} 
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button 
                                    className="cancel-button" 
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="field-value">{user?.email || 'Not set'}</p>
                    )}
                </div>
                
                <div className="profile-field">
                    <div className="field-header">
                        <h3>Profile Picture</h3>
                        {editingField !== 'profilePicture' && (
                            <button 
                                className="edit-button" 
                                onClick={() => handleEdit('profilePicture')}
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    
                    {editingField === 'profilePicture' ? (
                        <div className="edit-field">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePictureChange}
                            />
                            {previewPicture && (
                                <div className="image-preview">
                                    <img src={previewPicture} alt="Profile Preview" />
                                </div>
                            )}
                            <div className="action-buttons">
                                <button 
                                    className="save-button" 
                                    onClick={() => handleSave('profilePicture')} 
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button 
                                    className="cancel-button" 
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="field-value">
                            {user?.profilePicture ? (
                                <img 
                                    src={user.profilePicture} 
                                    alt="Current Profile" 
                                    className="profile-preview" 
                                />
                            ) : (
                                <p>No profile picture set</p>
                            )}
                        </div>
                    )}
                </div>
                
                {error && (
                    <div className="error-message">
                        Error: {error}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfileSettings;
