import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth';
import { getFavoriteCapsules } from '../api'; // Import API function
import CapsuleCard from '../components/CapsuleCard';


function Favorites() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const data = await getFavoriteCapsules(user.id);
                setFavorites(data);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
                console.error("Error fetching favorite capsules:", err);
            }
        };

        fetchFavorites();
    }, [user.id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="favorites-page">
            <h2>Favorite Capsules</h2>
            <div className="capsule-list">
                {favorites.map(capsule => (
                    <CapsuleCard key={capsule.id} capsule={capsule} />
                ))}
            </div>
        </div>
    );
}

export default Favorites;