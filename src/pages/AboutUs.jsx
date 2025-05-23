import React from 'react';
import SEO from '../components/SEO';
import './AboutUs.css';

function AboutUs() {
    return (
        <div className="about-us-page">
            <SEO 
                title="About Memorix - Our Story and Mission" 
                description="Learn about the team behind Memorix, our vision for digital memory preservation, and how we're helping people connect their past with their future."
                keywords="about memorix, digital memory preservation, time capsule platform, memorix team, memorix mission"
                canonical="https://memorix.fun/about"
            />
            <h2>About Us</h2>
            <p>
                We are a dedicated team of passionate developers, designers, and storytellers who understand the
                importance of preserving memories for future generations. Our mission is to create a platform where
                users can securely store and share their personal stories, moments, and experiences in a safe and
                thoughtful way.
            </p>
            <p>
                At **Memorix**, we believe that memories are timeless. Whether it's a personal achievement, a life lesson,
                or simply a special moment, our platform ensures that your stories will be safely stored, waiting to
                be rediscovered whenever you need them.
            </p>
            <p>
                With a sleek, user-friendly interface, we aim to provide a seamless experience that allows you to create,
                store, and share memories with those you trust. The future is unpredictable, but memories can be cherished
                and shared forever.
            </p>
            <h3>Our Vision</h3>
            <p>
                Our vision is to help people connect with their past and future through the power of memories, empowering
                them to create meaningful legacies that inspire others.
            </p>
            <h3>About the Creator</h3>
            <p>
                This project was created by <strong>Abdallah Shalat</strong>, a web developer passionate about creating digital solutions
                that bring people closer together. With years of experience in web development, Abdallah Shalat's goal is to build
                innovative platforms that provide meaningful experiences for users worldwide.
            </p>
        </div>
    );
}

export default AboutUs;
