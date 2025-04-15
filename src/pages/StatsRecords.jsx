import React, { useState, useEffect } from 'react';
import { getStats } from '../api'; // Import API function
import './StatsRecords.css'

function StatsRecords() {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getStats();
                setStats(data);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
                console.error("Error fetching stats:", err);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="stats-records-page">
            <h2>Stats & Records</h2>
            <div className="stats-list">
                <p>Total Capsules: {stats.totalCapsules}</p>
                <p>Users by Country: {stats.usersByCountry}</p>
                <p>Most Viewed Capsules: {stats.mostViewedCapsules}</p>
                <p>Average Capsule Lifespan: {stats.averageCapsuleLifespan}</p>
            </div>
        </div>
    );
}

export default StatsRecords;