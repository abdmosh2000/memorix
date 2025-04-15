import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-links">
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact Us</Link>
                <Link to="/terms">Terms & Conditions</Link>
                <Link to="/privacy">Privacy Policy</Link>
            </div>
            <div className="footer-social">
                <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
            <p>&copy; {new Date().getFullYear()} Memorix. All rights reserved.</p>
        </footer>
    );
}

export default Footer;