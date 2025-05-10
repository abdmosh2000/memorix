import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth';
import { createCapsule } from '../api'; // Import API function
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import saveMemorySound from '../assets/sounds/savememory.mp3';
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
    const [showSubscriptionLimitModal, setShowSubscriptionLimitModal] = useState(false);
    
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Refs
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const mediaChunksRef = useRef([]);
    const audioRef = useRef(null); // Audio ref for the success sound
    
    // Function to compress image
    const compressImage = (dataUrl, maxWidth = 1200, quality = 0.7) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions if image is too large
                if (width > maxWidth) {
                    height = Math.floor(height * (maxWidth / width));
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to compressed JPEG
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = dataUrl;
        });
    };
    
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
    const takePhoto = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL and compress
        const dataUrl = canvas.toDataURL('image/jpeg');
        const compressedDataUrl = await compressImage(dataUrl);
        setMediaSrc(compressedDataUrl);
        
        // Stop the camera stream
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
        videoRef.current.style.display = 'none';
        setIsRecording(false);
    };
    
    // Function to compress video (reduce quality)
    const compressVideo = async (blob, targetSize = 5 * 1024 * 1024) => { // 5MB target
        // If the blob is already smaller than target size, return it as is
        if (blob.size <= targetSize) {
            return blob;
        }
        
        // For larger videos, we'll use a lower quality setting
        // This is a simple approach - in production you might want to use a proper video compression library
        const quality = Math.min(0.8, targetSize / blob.size);
        
        // For this simple implementation, we'll just return the original blob
        // with a warning that it might be too large
        console.warn(`Video size (${(blob.size / (1024 * 1024)).toFixed(2)}MB) exceeds recommended size. This may cause upload issues.`);
        
        return blob;
    };
    
    // Function to handle video recording
    const handleRecordVideo = async () => {
        try {
            setMediaType('video');
            // Use lower resolution for video to reduce file size
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 15 }
                },
                audio: true
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoRef.current.srcObject = stream;
            videoRef.current.style.display = 'block';
            
            // Use lower bitrate for recording
            const options = { 
                mimeType: 'video/webm;codecs=vp8,opus',
                videoBitsPerSecond: 600000 // 600 kbps
            };
            
            mediaRecorderRef.current = new MediaRecorder(stream, options);
            mediaChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    mediaChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(mediaChunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setMediaSrc(url);
                
                // Stop the camera stream
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
                
                // Compress video if needed
                const compressedBlob = await compressVideo(blob);
                
                // Convert blob to base64 for storage
                const reader = new FileReader();
                reader.readAsDataURL(compressedBlob);
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
    
    // Function to compress audio
    const compressAudio = async (blob, targetSize = 2 * 1024 * 1024) => { // 2MB target
        // If the blob is already smaller than target size, return it as is
        if (blob.size <= targetSize) {
            return blob;
        }
        
        // For larger audio, we'll use a lower quality setting
        console.warn(`Audio size (${(blob.size / (1024 * 1024)).toFixed(2)}MB) exceeds recommended size. This may cause upload issues.`);
        
        return blob;
    };
    
    // Function to handle audio recording
    const handleRecordAudio = async () => {
        try {
            setMediaType('audio');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Use lower bitrate for recording
            const options = { 
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 64000 // 64 kbps
            };
            
            mediaRecorderRef.current = new MediaRecorder(stream, options);
            mediaChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    mediaChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(mediaChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setMediaSrc(url);
                
                // Stop the audio stream
                stream.getTracks().forEach(track => track.stop());
                
                // Compress audio if needed
                const compressedBlob = await compressAudio(blob);
                
                // Convert blob to base64 for storage
                const reader = new FileReader();
                reader.readAsDataURL(compressedBlob);
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
    
    // Function to handle file uploads from device
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Get media type from data attribute
        const type = e.target.dataset.type; // 'photo', 'video', or 'audio'
        setMediaType(type);
        
        try {
            // Show loading state
            setIsRecording(true); // Reuse recording state to show loading

            // Process file based on its type
            if (type === 'photo') {
                // Handle image upload
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const dataUrl = event.target.result;
                    // Compress image before setting
                    const compressedDataUrl = await compressImage(dataUrl);
                    setMediaSrc(compressedDataUrl);
                    setIsRecording(false);
                };
                reader.readAsDataURL(file);
            }
            else if (type === 'video') {
                // Handle video upload
                const blob = new Blob([file], { type: file.type });
                // Compress video if needed
                const compressedBlob = await compressVideo(blob);
                
                // Convert to data URL for preview
                const reader = new FileReader();
                reader.onload = (event) => {
                    setMediaSrc(event.target.result);
                    setIsRecording(false);
                };
                reader.readAsDataURL(compressedBlob);
            }
            else if (type === 'audio') {
                // Handle audio upload
                const blob = new Blob([file], { type: file.type });
                // Compress audio if needed
                const compressedBlob = await compressAudio(blob);
                
                // Convert to data URL
                const reader = new FileReader();
                reader.onload = (event) => {
                    setMediaSrc(event.target.result);
                    setIsRecording(false);
                };
                reader.readAsDataURL(compressedBlob);
            }
        } catch (err) {
            console.error('Error processing uploaded file:', err);
            setError('Could not process the uploaded file. Please try another file or a different method.');
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
                // Check if media size is too large
                const estimatedSize = mediaSrc.length * 0.75; // Rough estimate of base64 size in bytes
                const maxSize = 8 * 1024 * 1024; // 8MB max
                
                if (estimatedSize > maxSize) {
                    // For images, try to compress further
                    if (mediaType === 'photo') {
                        const furtherCompressed = await compressImage(mediaSrc, 800, 0.5);
                        capsuleData.mediaContent = furtherCompressed;
                    } else {
                        // For video/audio, warn the user
                        console.warn(`Media size (${(estimatedSize / (1024 * 1024)).toFixed(2)}MB) is large and may cause upload issues.`);
                        capsuleData.mediaContent = mediaSrc;
                    }
                } else {
                    capsuleData.mediaContent = mediaSrc;
                }
                
                capsuleData.mediaType = mediaType;
            }
            
            console.log('Submitting capsule data:', { 
                ...capsuleData, 
                mediaContent: mediaSrc ? `Data URL (${(mediaSrc.length * 0.75 / (1024 * 1024)).toFixed(2)}MB estimated)`: null,
                recipients
            });
            
            try {
                const newCapsule = await createCapsule(capsuleData);
                console.log('Memory saved:', newCapsule);
                
                // Play the memory saved sound
                if (audioRef.current) {
                    audioRef.current.volume = 0.6; // Set appropriate volume
                    audioRef.current.play().catch(e => console.log('Audio play failed:', e));
                }
                
                // Notify the user of successful creation
                if (recipients.length > 0) {
                    addNotification(
                        t('✨ Your memory has been preserved and invitations sent to your loved ones.'),
                        NOTIFICATION_TYPES.SUCCESS
                    );
                } else {
                    addNotification(
                        t('✨ Your memory has been beautifully preserved in time.'),
                        NOTIFICATION_TYPES.SUCCESS
                    );
                }
                
                // Navigate to a new rating page with the capsule ID as parameter
                if (newCapsule && newCapsule._id) {
                    navigate(`/rate-experience?capsuleId=${newCapsule._id}&title=${encodeURIComponent(title)}`);
                } else {
                    navigate('/dashboard');
                }
            } catch (err) {
                // Check if it's a subscription limit error using improved error handling
                if (err.redirectToPricing || 
                    (err.response && err.response.data && err.response.data.redirectTo === '/pricing') ||
                    (err.message && err.message.toLowerCase().includes('upgrade'))) {
                    
                    // Show the subscription limit modal instead of immediately redirecting
                    setShowSubscriptionLimitModal(true);
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
                <label htmlFor="title">Name Your Memory:</label>
                <input
                    type="text"
                    id="title"
                    placeholder="Give this precious moment a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="content">Tell Your Story:</label>
                <textarea
                    id="content"
                    placeholder="Capture your feelings, emotions, and every detail you want to remember forever..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
            </div>
            
            {/* Media Capture Section */}
            <div className="form-group media-section">
                <label>Capture or Upload Media:</label>
                <div className="media-options">
                    <div className="option-group">
                        <h4 className="option-title">Record Now</h4>
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
                        </div>
                    </div>
                    
                    <div className="option-group">
                        <h4 className="option-title">Upload From Device</h4>
                        <div className="upload-buttons">
                            <label className={`upload-btn ${mediaType === 'photo' && mediaSrc ? 'active' : ''}`}>
                                📸 Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={isRecording || mediaSrc}
                                    className="file-input"
                                    data-type="photo"
                                />
                            </label>
                            <label className={`upload-btn ${mediaType === 'video' && mediaSrc ? 'active' : ''}`}>
                                🎥 Video
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileUpload}
                                    disabled={isRecording || mediaSrc}
                                    className="file-input"
                                    data-type="video"
                                />
                            </label>
                            <label className={`upload-btn ${mediaType === 'audio' && mediaSrc ? 'active' : ''}`}>
                                🎙️ Audio
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleFileUpload}
                                    disabled={isRecording || mediaSrc}
                                    className="file-input"
                                    data-type="audio"
                                />
                            </label>
                        </div>
                    </div>
                    
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
                <label htmlFor="releaseDate">When to Reveal This Memory:</label>
                <input
                    type="datetime-local"
                    id="releaseDate"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    required
                />
                <small className="field-hint">Choose when your memory will be revealed - a birthday, anniversary, or any special moment</small>
            </div>
            <div className="form-group public-option">
                <label htmlFor="isPublic">Share with the World:</label>
                <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                />
                <small className="field-hint">When checked, your memory becomes visible to everyone in the public gallery</small>
            </div>

            {/* Recipients Section */}
            <div className="form-group recipients-section">
                <label>{t('Share with Loved Ones:')}</label>
                <p className="recipients-info">
                    {t('Invite special people to cherish this memory with you. They will receive a heartfelt invitation to view your memory when it is revealed.')}
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
            
            {/* Audio element for the memory saved sound with error handling */}
            <audio 
                ref={audioRef} 
                src={saveMemorySound} 
                preload="auto" 
                onError={(e) => {
                    console.warn('Sound file could not be loaded:', e);
                    // Prevent console errors by removing the source
                    e.target.removeAttribute('src');
                }}
            />
            
            <button type="submit" className="submit-btn">✨ Preserve This Memory ✨</button>
            
            {/* Subscription Limit Modal */}
            {showSubscriptionLimitModal && (
                <div className="modal-overlay">
                    <div className="subscription-limit-modal">
                        <h2>Free Plan Limit Reached</h2>
                        <p>
                            You've reached the limit of your free plan. Free users can only create one capsule.
                        </p>
                        <p>
                            Upgrade your plan to create more capsules and unlock additional premium features.
                        </p>
                        <div className="subscription-limit-actions">
                            <button 
                                className="upgrade-button"
                                onClick={() => navigate('/pricing')}
                            >
                                Upgrade Now
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => setShowSubscriptionLimitModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}

export default CreateCapsuleForm;
