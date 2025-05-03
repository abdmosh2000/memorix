import React from 'react';
import LoginForm from '../components/LoginForm';
import SEO from '../components/SEO';

function Login() {
    return (
        <div className="login-page">
            <SEO 
                title="Login to Memorix - Access Your Digital Time Capsules"
                description="Log in to your Memorix account to create, manage, and share your time capsules and preserved memories."
                keywords="memorix login, time capsule login, digital memories access"
                canonical="https://memorix.fun/login"
                type="website"
            />
            <h2>Login</h2>
            <LoginForm />
        </div>
    );
}

export default Login;
