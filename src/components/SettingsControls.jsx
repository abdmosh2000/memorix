import React from 'react';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import './SettingsControls.css';

function SettingsControls() {
    return (
        <div className="settings-controls">
            <div className="settings-control-item">
                <label>Language</label>
                <LanguageSelector />
            </div>
            
            <div className="settings-control-item">
                <label>Theme</label>
                <ThemeToggle />
            </div>
        </div>
    );
}

export default SettingsControls;
