import React from 'react';
import RegisterForm from '../components/RegisterForm';
import SEO from '../components/SEO';

function Register() {
    return (
        <div className="register-page">
            <SEO 
                title="Join Memorix - Create Your Digital Time Capsule Account" 
                description="Sign up for Memorix to create and schedule digital time capsules. Store photos, messages, and memories for future release."
                keywords="memorix signup, register time capsule, create memory account, digital memory storage"
                canonical="https://memorix.fun/register"
                type="website"
            />
            <h2>Register</h2>
            <RegisterForm />
        </div>
    );
}

export default Register;
