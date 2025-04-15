import React, { useState, useEffect } from 'react';
import { getTestimonials } from '../api'; // Import API function
import './Testimonials.css'

function Testimonials() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const data = await getTestimonials();
                setTestimonials(data);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
                console.error("Error fetching testimonials:", err);
            }
        };

        fetchTestimonials();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="testimonials-page">
            <h2>Testimonials</h2>
            <div className="testimonials-list">
                {testimonials.map(testimonial => (
                    <div key={testimonial.id} className="testimonial">
                        <p>{testimonial.content}</p>
                        <p>- {testimonial.author}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Testimonials;