import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPublicCapsules, rateCapsule } from '../api'; // Import API functions
import { useAuth } from '../auth';
import SEO from '../components/SEO';
import CapsuleCollectionStructuredData, { CapsuleListStructuredData } from '../components/CapsuleStructuredData';
import { addNotification, NOTIFICATION_TYPES } from '../notifications';
import CapsuleCard from '../components/CapsuleCard';
import './PublicCapsules.css';

function PublicCapsules() {
    const { t } = useTranslation();
    const { isLoggedIn, user } = useAuth();
    const [capsules, setCapsules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, popular, recent
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingMore, setLoadingMore] = useState(false);

    // State for the "Add Demo Capsule" feature
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Function to get a random profile image
    const getRandomProfileImage = () => {
        const gender = Math.random() > 0.5 ? 'women' : 'men';
        const id = Math.floor(Math.random() * 70) + 1;
        return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;
    };
    
    // Function to get random unsplash images
    const getRandomImages = () => {
        const imageIds = [
            'photo-1523050854058-8df90110c9f1',
            'photo-1535982330050-f1c2fb79ff78',
            'photo-1519225421980-715cb0215aed',
            'photo-1533577116850-9cc66cad8a9b',
            'photo-1501785888041-af3ef285b470',
            'photo-1539635278303-d4002c07eae3',
            'photo-1465495976277-4387d4b0b4c6',
            'photo-1522071820081-009f0129c71c',
            'photo-1530103862676-de8c9debad1d'
        ];
        
        // Pick 1-3 random images
        const numImages = Math.floor(Math.random() * 3) + 1;
        const shuffled = imageIds.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, numImages);
        
        return selected.map(id => ({ url: `https://images.unsplash.com/${id}` }));
    };
    
    // Generate some random tags
    const getRandomTags = () => {
        const allTags = [
            'memories', 'journey', 'family', 'friends', 'vacation', 
            'travel', 'adventure', 'celebration', 'milestone', 'love',
            'education', 'career', 'nature', 'city', 'tech', 'food',
            'sports', 'music', 'art', 'pets', 'hobby', 'achievement'
        ];
        
        // Pick 2-5 random tags
        const numTags = Math.floor(Math.random() * 4) + 2;
        const shuffled = allTags.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numTags);
    };
    
    // Function to add a new demo capsule
    const addDemoCapsule = () => {
        if (!title.trim() || !description.trim()) {
            alert(t('Please enter both title and description'));
            return;
        }
        
        // Create a new capsule with the form data
        const newCapsule = {
            id: `${Date.now()}`,  // use timestamp as ID
            title: title,
            description: description,
            releaseDate: new Date().toISOString().split('T')[0],
            isPublic: true,
            userName: isLoggedIn ? (user?.name || user?.username || 'Anonymous User') : 'Demo User',
            userId: isLoggedIn ? user?.id : `demo${Date.now()}`,
            userPhoto: isLoggedIn && user?.photo ? user.photo : getRandomProfileImage(),
            totalRatings: 0,
            ratingCount: 0,
            userRating: 0,
            tags: getRandomTags(),
            comments: [],
            images: getRandomImages()
        };
        
        // Add the new capsule to the list
        const updatedCapsules = [newCapsule, ...capsules];
        setCapsules(updatedCapsules);
        
        // Save to localStorage
        localStorage.setItem('capsules', JSON.stringify(updatedCapsules));
        
        // Clear the form fields
        setTitle('');
        setDescription('');
        
        // Show notification
        addNotification(
            t('Your new capsule has been published!'),
            NOTIFICATION_TYPES.SYSTEM
        );
        
        // Hide the form
        setShowAddForm(false);
    };
    
    useEffect(() => {
        const fetchPublicCapsules = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch public capsules from the API
                const response = await getPublicCapsules();
                
                console.log('API response for public capsules:', response);
                
                // Process the fetched capsules for display
                let fetchedCapsules = [];
                
                if (response && Array.isArray(response)) {
                    fetchedCapsules = response.map(capsule => {
                        // Format the capsule data for display
                        return {
                            id: capsule._id,
                            title: capsule.title,
                            description: capsule.content || 'No description available',
                            releaseDate: new Date(capsule.releaseDate).toISOString().split('T')[0],
                            isPublic: capsule.isPublic,
                            userName: capsule.user ? capsule.user.name : 'Anonymous',
                            userId: capsule.user ? capsule.user._id : null,
                            userPhoto: 'https://randomuser.me/api/portraits/men/32.jpg', // Placeholder
                            totalRatings: capsule.totalRatings || 0,
                            ratingCount: capsule.ratingCount || 0,
                            userRating: 0, // Will be set if user has rated
                            tags: capsule.tags || [],
                            comments: capsule.comments || [],
                            images: capsule.mediaType === 'photo' ? [{ url: capsule.mediaUrl || '' }] : []
                        };
                    });
                    
                    // Save the fetched capsules to localStorage for offline access
                    localStorage.setItem('capsules', JSON.stringify(fetchedCapsules));
                } else if (!fetchedCapsules.length) {
                    // Fallback to local storage if API returned no capsules
                    const storedCapsules = localStorage.getItem('capsules');
                    if (storedCapsules) {
                        try {
                            fetchedCapsules = JSON.parse(storedCapsules);
                        } catch (e) {
                            console.error('Error parsing stored capsules:', e);
                        }
                    }
                    
                    // If still empty, use demo capsules
                    if (!fetchedCapsules.length) {
                        fetchedCapsules = [
                            {
                                id: '1',
                                title: 'My Graduation Day',
                                description: 'All the memories from my graduation ceremony and the celebration afterwards.',
                                releaseDate: '2023-05-15',
                                isPublic: true,
                                userName: 'Sarah Johnson',
                                userId: 'user123',
                                userPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
                                totalRatings: 18,
                                ratingCount: 4,
                                userRating: 0,
                                tags: ['graduation', 'college', 'celebration'],
                                comments: [
                                    {
                                        id: 'c1',
                                        text: 'Such wonderful memories! Congratulations on your achievement.',
                                        userId: 'user456',
                                        userName: 'Michael Brown',
                                        userPhoto: 'https://randomuser.me/api/portraits/men/22.jpg',
                                        createdAt: '2023-05-20T15:32:00.000Z'
                                    }
                                ],
                                images: [
                                    { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1' }
                                ]
                            },
                            {
                                id: '2',
                                title: 'Summer Trip 2023',
                                description: 'Our amazing adventure exploring the national parks. So many beautiful landscapes and wildlife encounters.',
                                releaseDate: '2023-08-10',
                                isPublic: true,
                                userName: 'David Chen',
                                userId: 'user456',
                                userPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
                                totalRatings: 24,
                                ratingCount: 5,
                                userRating: 0,
                                tags: ['travel', 'nature', 'summer', 'hiking'],
                                comments: [],
                                images: [
                                    { url: 'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b' }
                                ]
                            }
                        ];
                    }
                }
                
                // Apply filter
                let filteredResults = [...fetchedCapsules];
                if (filter === 'popular') {
                    filteredResults = filteredResults.sort((a, b) => {
                        const aAvg = a.ratingCount > 0 ? a.totalRatings / a.ratingCount : 0;
                        const bAvg = b.ratingCount > 0 ? b.totalRatings / b.ratingCount : 0;
                        return bAvg - aAvg;
                    });
                } else if (filter === 'recent') {
                    filteredResults = filteredResults.sort((a, b) => {
                        return new Date(b.releaseDate) - new Date(a.releaseDate);
                    });
                }
                
                // Use a small delay for better UX
                setTimeout(() => {
                    setCapsules(filteredResults);
                    setLoading(false);
                }, 500);
                
            } catch (err) {
                setError(err);
                setLoading(false);
                console.error("Error fetching public capsules:", err);
                
                // Fallback to local storage on error
                const storedCapsules = localStorage.getItem('capsules');
                if (storedCapsules) {
                    try {
                        const parsedCapsules = JSON.parse(storedCapsules);
                        setCapsules(parsedCapsules);
                    } catch (e) {
                        console.error('Error parsing stored capsules:', e);
                    }
                }
            }
        };

        fetchPublicCapsules();
    }, [filter]); // Re-fetch when filter changes
    
    // Handle rating change
    const handleRatingChange = async (capsuleId, rating) => {
        try {
            // Update capsules state with new rating
            const updatedCapsules = capsules.map(capsule => 
                capsule.id === capsuleId 
                    ? { 
                        ...capsule, 
                        userRating: rating,
                        totalRatings: capsule.totalRatings + (rating - (capsule.userRating || 0)),
                        ratingCount: capsule.userRating ? capsule.ratingCount : capsule.ratingCount + 1
                      } 
                    : capsule
            );
            
            setCapsules(updatedCapsules);
            
            // Update localStorage
            localStorage.setItem('capsules', JSON.stringify(updatedCapsules));
            
            // Show notification
            const ratedCapsule = capsules.find(c => c.id === capsuleId);
            if (ratedCapsule) {
                addNotification(
                    t('You rated "{{title}}" with {{rating}} stars', { 
                        title: ratedCapsule.title,
                        rating: rating
                    }),
                    NOTIFICATION_TYPES.SYSTEM
                );
            }
        } catch (err) {
            console.error("Error rating capsule:", err);
            addNotification(t('Failed to rate capsule. Please try again.'), NOTIFICATION_TYPES.SYSTEM);
        }
    };
    
    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
    
    // Handle search submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // In a real app, this would trigger a new API call with the search query
        console.log("Searching for:", searchQuery);
    };
    
    // Filter capsules based on search query
    const filteredCapsules = searchQuery 
        ? capsules.filter(capsule => 
            capsule.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            capsule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (capsule.tags && capsule.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
        ) 
        : capsules;
    
    // Load more capsules
    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            // In a real app, you would fetch more capsules:
            // const moreCapsules = await getMorePublicCapsules(filter, searchQuery, capsules.length);
            // setCapsules([...capsules, ...moreCapsules]);
            
            // For demonstration, add dummy delay
            setTimeout(() => {
                setLoadingMore(false);
                // You would add more capsules here
            }, 1000);
        } catch (err) {
            console.error("Error loading more capsules:", err);
            setLoadingMore(false);
        }
    };
    
    return (
        <div className="public-capsules-page">
            <SEO 
                title="Explore Public Time Capsules | Memorix Community" 
                description="Browse public time capsules from the Memorix community. Discover shared memories, stories, photos, and experiences from users around the world."
                keywords="public time capsules, shared memories, digital time capsule, memorix community, memory sharing, user capsules, public memories"
                canonical="https://memorix.fun/public"
                type="website"
            />
            <CapsuleCollectionStructuredData />
            {!loading && !error && filteredCapsules.length > 0 && (
                <CapsuleListStructuredData capsules={filteredCapsules} />
            )}
            <div className="page-header">
                <h1 className="page-title">{t('Public Capsules')}</h1>
                <p className="page-description">
                    {t('Explore memories shared by the Memorix community. Find inspiration, connect with others, and discover personal stories from around the world.')}
                </p>
                <button 
                    className="create-capsule-button"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? t('Cancel') : t('+ Create Quick Demo Capsule')}
                </button>
            </div>
            
            {showAddForm && (
                <div className="quick-create-form">
                    <h3>{t('Create a Demo Capsule')}</h3>
                    <div className="form-group">
                        <label htmlFor="title">{t('Title')}</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('Enter capsule title')}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">{t('Description')}</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('Enter capsule description')}
                            rows={4}
                        ></textarea>
                    </div>
                    <div className="form-buttons">
                        <button 
                            className="cancel-button"
                            onClick={() => setShowAddForm(false)}
                        >
                            {t('Cancel')}
                        </button>
                        <button 
                            className="create-button"
                            onClick={addDemoCapsule}
                            disabled={!title.trim() || !description.trim()}
                        >
                            {t('Create Capsule')}
                        </button>
                    </div>
                </div>
            )}
            
            <div className="filters-container">
                <div className="filter-buttons">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        {t('All')}
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'popular' ? 'active' : ''}`}
                        onClick={() => setFilter('popular')}
                    >
                        {t('Most Popular')}
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'recent' ? 'active' : ''}`}
                        onClick={() => setFilter('recent')}
                    >
                        {t('Recently Added')}
                    </button>
                </div>
                
                <form className="search-form" onSubmit={handleSearchSubmit}>
                    <input 
                        type="text"
                        placeholder={t('Search capsules...')}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        🔍
                    </button>
                </form>
            </div>
            
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>{t('Loading capsules...')}</p>
                </div>
            ) : error ? (
                <div className="error-message">
                    <p>{t('Error')}: {error.message}</p>
                    <button onClick={() => window.location.reload()}>
                        {t('Try Again')}
                    </button>
                </div>
            ) : filteredCapsules.length === 0 ? (
                <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <h3>{t('No Capsules Found')}</h3>
                    <p>{t('Try adjusting your search or filters to find more memories.')}</p>
                </div>
            ) : (
                <>
                    <div className="capsule-list">
                        {filteredCapsules.map(capsule => (
                            <CapsuleCard 
                                key={capsule.id} 
                                capsule={capsule}
                                onRatingChange={handleRatingChange}
                            />
                        ))}
                    </div>
                    
                    <div className="load-more-container">
                        <button 
                            className={`load-more-btn ${loadingMore ? 'loading' : ''}`}
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                        >
                            {loadingMore ? t('Loading...') : t('Load More')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default PublicCapsules;
