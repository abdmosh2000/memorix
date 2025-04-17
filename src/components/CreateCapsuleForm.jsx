import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth';
import { createCapsule } from '../api'; // Import API function
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import './CreateCapsuleForm.css';

function CreateCapsuleForm() {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [mediaType, setMediaType] = useState(null); // 'photo', 'video', 'audio', or null
    const [mediaSrc, setMediaSrc] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recipients, setRecipients] = useState([]);
    const [currentRecipient, setCurrentRecipient] = useState('');
    const [recipientError, setRecipientError] = useState('');
    const [error, setError] = useState('');
    
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const mediaChunksRef = useRef([]);
    
    // Function to handle photo capture
    const handleCapturePhoto = async () => {
        try {
            setMediaType('photo');
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            videoRef.current.style.display = 'block';
            
            // Let's add a button to take the actual photo
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Could not access camera. Please check permissions.');
        }
    };
    
    // Function to take the photo
    const takePhoto = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        setMediaSrc(dataUrl);
        
        // Stop the camera stream
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
        videoRef.current.style.display = 'none';
        setIsRecording(false);
    };
    
    // Function to handle video recording
    const handleRecordVideo = async () => {
        try {
            setMediaType('video');
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoRef.current.srcObject = stream;
            videoRef.current.style.display = 'block';
            
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    mediaChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(mediaChunksRef.current, { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);
                setMediaSrc(url);
                
                // Stop the camera stream
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
                
                // Convert blob to base64 for storage
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    setMediaSrc(reader.result);
                };
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing camera/microphone:', err);
            setError('Could not access camera/microphone. Please check permissions.');
        }
    };
    
    // Function to handle audio recording
    const handleRecordAudio = async () => {
        try {
            setMediaType('audio');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    mediaChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(mediaChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setMediaSrc(url);
                
                // Stop the audio stream
                stream.getTracks().forEach(track => track.stop());
                
                // Convert blob to base64 for storage
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    setMediaSrc(reader.result);
                };
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Could not access microphone. Please check permissions.');
        }
    };
    
    // Function to stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaType !== 'photo') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    
    // Function to clear media
    const clearMedia = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setMediaSrc(null);
        setMediaType(null);
        setIsRecording(false);
    };

    // Function to add a recipient
    const addRecipient = () => {
        setRecipientError('');
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(currentRecipient)) {
            setRecipientError(t('Please enter a valid email address'));
            return;
        }
        
        // Check if email already exists in recipients
        if (recipients.includes(currentRecipient)) {
            setRecipientError(t('This email has already been added'));
            return;
        }
        
        // Add email to recipients
        setRecipients([...recipients, currentRecipient]);
        setCurrentRecipient('');
    };
    
    // Function to remove a recipient
    const removeRecipient = (email) => {
        setRecipients(recipients.filter(r => r !== email));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const capsuleData = {
                title,
                content,
                releaseDate,
                isPublic,
                recipients,
                userId: user?._id, // Use _id instead of id
            };
            
            // Add media data if available
            if (mediaSrc && mediaType) {
                capsuleData.mediaContent = mediaSrc;
                capsuleData.mediaType = mediaType;
            }
            
            console.log('Submitting capsule data:', { 
                ...capsuleData, 
                mediaContent: mediaSrc ? 'Data URL (truncated)': null,
                recipients
            });
            
            try {
                const newCapsule = await createCapsule(capsuleData);
                console.log('Capsule created:', newCapsule);
                
                // Notify the user of successful creation
                if (recipients.length > 0) {
                    alert(t('Capsule created successfully and invitation sent to recipients.'));
                }
                
                // Navigate to a new rating page with the capsule ID as parameter
                if (newCapsule && newCapsule._id) {
                    navigate(`/rate-experience?capsuleId=${newCapsule._id}&title=${encodeURIComponent(title)}`);
                } else {
                    navigate('/dashboard');
                }
            } catch (err) {
                // Check if it's a subscription limit error
                if (err.response && err.response.data && 
                    (err.response.data.redirectTo === '/pricing' || 
                     err.response.data.message.includes('upgrade your subscription'))) {
                    
                    // Add notification about the subscription limit
                    addNotification(
                        'You have reached your free plan limit. Please upgrade your subscription to create more capsules.',
                        NOTIFICATION_TYPES.SYSTEM
                    );
                    
                    // Redirect to pricing page after a short delay
                    setTimeout(() => {
                        navigate('/pricing');
                    }, 500);
                    
                    return; // Don't throw the error, we're handling it
                } else {
                    throw err;
                }
            }
        } catch (error) {
            console.error('Error creating capsule:', error);
            setError(error.message || 'Error creating capsule. Please try again.');
        }
    };

    return (
        <form className="create-capsule-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="content">Content:</label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
            </div>
            
            {/* Media Capture Section */}
            <div className="form-group media-section">
                <label>Attach Media:</label>
                <div className="media-buttons">
                    <button 
                        type="button" 
                        className={`media-btn ${mediaType === 'photo' ? 'active' : ''}`}
                        onClick={handleCapturePhoto}
                        disabled={isRecording || mediaSrc}
                    >
                        📸 Photo
                    </button>
                    <button 
                        type="button" 
                        className={`media-btn ${mediaType === 'video' ? 'active' : ''}`}
                        onClick={handleRecordVideo}
                        disabled={isRecording || mediaSrc}
                    >
                        🎥 Video
                    </button>
                    <button 
                        type="button" 
                        className={`media-btn ${mediaType === 'audio' ? 'active' : ''}`}
                        onClick={handleRecordAudio}
                        disabled={isRecording || mediaSrc}
                    >
                        🎙️ Audio
                    </button>
                    
                    {mediaSrc && (
                        <button 
                            type="button" 
                            className="media-btn clear-btn"
                            onClick={clearMedia}
                        >
                            ❌ Clear
                        </button>
                    )}
                </div>
                
                {/* Media Preview */}
                <div className="media-preview">
                    {isRecording && (
                        <div className="recording-controls">
                            {mediaType === 'photo' ? (
                                <button type="button" className="capture-btn" onClick={takePhoto}>
                                    📸 Take Photo
                                </button>
                            ) : (
                                <div className="recording-indicator">
                                    <span className="recording-dot"></span> Recording...
                                    <button type="button" className="stop-btn" onClick={stopRecording}>
                                        ⏹️ Stop
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {mediaType === 'photo' && mediaSrc && (
                        <img src={mediaSrc} alt="Captured" className="media-preview-content" />
                    )}
                    
                    {mediaType === 'video' && mediaSrc && !isRecording && (
                        <video src={mediaSrc} controls className="media-preview-content"></video>
                    )}
                    
                    {mediaType === 'audio' && mediaSrc && !isRecording && (
                        <audio src={mediaSrc} controls className="media-preview-content"></audio>
                    )}
                    
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        muted={mediaType === 'photo'} 
                        className="camera-preview" 
                        style={{ display: 'none' }}
                    ></video>
                </div>
            </div>
            
            <div className="form-group">
                <label htmlFor="releaseDate">Release Date:</label>
                <input
                    type="datetime-local"
                    id="releaseDate"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="isPublic">Public:</label>
                <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                />
            </div>

            {/* Recipients Section */}
            <div className="form-group recipients-section">
                <label>{t('Add Recipients')}</label>
                <p className="recipients-info">
                    {t('Share this capsule with specific people. They will receive an email invitation.')}
                </p>
                
                <div className="recipient-input-container">
                    <input
                        type="email"
                        className="recipient-input"
                        placeholder={t('Enter recipient email')}
                        value={currentRecipient}
                        onChange={(e) => setCurrentRecipient(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addRecipient();
                            }
                        }}
                    />
                    <button 
                        type="button"
                        className="add-recipient-btn"
                        onClick={addRecipient}
                    >
                        {t('Add')}
                    </button>
                </div>
                
                {recipientError && (
                    <div className="recipient-error">{recipientError}</div>
                )}
                
                {recipients.length > 0 && (
                    <div className="recipients-list">
                        {recipients.map((email) => (
                            <div key={email} className="recipient-tag">
                                <span className="recipient-email">{email}</span>
                                <button
                                    type="button"
                                    className="remove-recipient"
                                    onClick={() => removeRecipient(email)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="submit-btn">Create Capsule</button>
        </form>
    );
}

export default CreateCapsuleForm;
