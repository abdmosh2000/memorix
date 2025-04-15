import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true }
];

function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];
    
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };
    
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        
        // Set direction for RTL languages
        const isRtl = languages.find(lang => lang.code === langCode)?.rtl;
        document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
        
        setIsOpen(false);
    };
    
    return (
        <div className="language-selector" ref={dropdownRef}>
            <button 
                className="language-button" 
                onClick={toggleDropdown}
                aria-label="Select language"
            >
                <span className="language-flag">{currentLang.flag}</span>
                <span className="language-code">{currentLang.code.toUpperCase()}</span>
            </button>
            
            {isOpen && (
                <div className="language-dropdown">
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            className={`language-option ${language.code === i18n.language ? 'active' : ''}`}
                            onClick={() => changeLanguage(language.code)}
                        >
                            <span className="language-flag">{language.flag}</span>
                            <span className="language-name">{language.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LanguageSelector;
