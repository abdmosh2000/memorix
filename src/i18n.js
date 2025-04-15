import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Define translations
const resources = {
    en: {
        translation: {
            // Navigation
            "Welcome to Memorix": "Welcome to Memorix",
            "Memorix": "Memorix",
            "Pricing": "Pricing",
            "Public Capsules": "Public Capsules",
            "Ratings": "Ratings",
            "About Us": "About Us",
            "Login": "Login",
            "Register": "Register",
            "Dashboard": "Dashboard",
            "Profile": "Profile",
            "Settings": "Settings",
            "Logout": "Logout",
            
            // Homepage
            "Your Digital Memory Capsule": "Your Digital Memory Capsule",
            "Preserve moments in time": "Preserve moments in time",
            "Share when you're ready": "Share when you're ready",
            "Join Now": "Join Now",
            "Explore Capsules": "Explore Capsules",
            "Create Capsule": "Create Capsule",
            "Users Worldwide": "Users Worldwide",
            "Memories Preserved": "Memories Preserved",
            "Countries Reached": "Countries Reached",
            "Powerful Features": "Powerful Features",
            "Everything you need": "Everything you need to preserve memories for the future",
            
            // Features
            "Privacy First": "Privacy First",
            "Time Release": "Time Release",
            "Global Access": "Global Access",
            "Military Encryption": "Military Encryption",
            "Digital Legacy": "Digital Legacy",
            "Multi-Device": "Multi-Device",
            
            // How it works
            "How Memorix Works": "How Memorix Works",
            "Three simple steps": "Three simple steps to create your time capsule",
            "Create a Capsule": "Create a Capsule",
            "Customize Privacy": "Customize Privacy",
            "Time-Release Magic": "Time-Release Magic",
            
            // Notifications
            "Notifications": "Notifications",
            "Mark all as read": "Mark all as read",
            "No notifications yet": "No notifications yet",
            "View all notifications": "View all notifications",
            "Just now": "Just now",
            "min ago": "min ago",
            "mins ago": "mins ago",
            "hour ago": "hour ago",
            "hours ago": "hours ago",
            "day ago": "day ago",
            "days ago": "days ago",
            
            // Theme
            "Light": "Light",
            "Dark": "Dark",
            "Switch to light mode": "Switch to light mode",
            "Switch to dark mode": "Switch to dark mode",
        }
    },
    es: {
        translation: {
            // Navigation
            "Welcome to Memorix": "Bienvenido a Memorix",
            "Memorix": "Memorix",
            "Pricing": "Precios",
            "Public Capsules": "Cápsulas Públicas",
            "Ratings": "Calificaciones",
            "About Us": "Sobre Nosotros",
            "Login": "Iniciar Sesión",
            "Register": "Registrarse",
            "Dashboard": "Panel de Control",
            "Profile": "Perfil",
            "Settings": "Ajustes",
            "Logout": "Cerrar Sesión",
            
            // Homepage
            "Your Digital Memory Capsule": "Tu Cápsula de Memoria Digital",
            "Preserve moments in time": "Preserva momentos en el tiempo",
            "Share when you're ready": "Comparte cuando estés listo",
            "Join Now": "Únete Ahora",
            "Explore Capsules": "Explorar Cápsulas",
            "Create Capsule": "Crear Cápsula",
            "Users Worldwide": "Usuarios en Todo el Mundo",
            "Memories Preserved": "Recuerdos Preservados",
            "Countries Reached": "Países Alcanzados",
            "Powerful Features": "Características Potentes",
            "Everything you need": "Todo lo que necesitas para preservar recuerdos para el futuro",
            
            // Features
            "Privacy First": "Privacidad Primero",
            "Time Release": "Liberación Programada",
            "Global Access": "Acceso Global",
            "Military Encryption": "Encriptación Militar",
            "Digital Legacy": "Legado Digital",
            "Multi-Device": "Multi-Dispositivo",
            
            // How it works
            "How Memorix Works": "Cómo Funciona Memorix",
            "Three simple steps": "Tres sencillos pasos para crear tu cápsula del tiempo",
            "Create a Capsule": "Crea una Cápsula",
            "Customize Privacy": "Personaliza la Privacidad",
            "Time-Release Magic": "Magia de Liberación Programada",
            
            // Notifications
            "Notifications": "Notificaciones",
            "Mark all as read": "Marcar todo como leído",
            "No notifications yet": "Aún no hay notificaciones",
            "View all notifications": "Ver todas las notificaciones",
            "Just now": "Justo ahora",
            "min ago": "min atrás",
            "mins ago": "mins atrás",
            "hour ago": "hora atrás",
            "hours ago": "horas atrás",
            "day ago": "día atrás",
            "days ago": "días atrás",
            
            // Theme
            "Light": "Claro",
            "Dark": "Oscuro",
            "Switch to light mode": "Cambiar a modo claro",
            "Switch to dark mode": "Cambiar a modo oscuro",
        }
    },
    fr: {
        translation: {
            // Navigation
            "Welcome to Memorix": "Bienvenue sur Memorix",
            "Memorix": "Memorix",
            "Pricing": "Tarifs",
            "Public Capsules": "Capsules Publiques",
            "Ratings": "Évaluations",
            "About Us": "À Propos",
            "Login": "Connexion",
            "Register": "S'inscrire",
            "Dashboard": "Tableau de Bord",
            "Profile": "Profil",
            "Settings": "Paramètres",
            "Logout": "Déconnexion",
            
            // Homepage
            "Your Digital Memory Capsule": "Votre Capsule Mémorielle Numérique",
            "Preserve moments in time": "Préservez des moments dans le temps",
            "Share when you're ready": "Partagez quand vous êtes prêt",
            "Join Now": "Rejoignez Maintenant",
            "Explore Capsules": "Explorer les Capsules",
            "Create Capsule": "Créer une Capsule",
            "Users Worldwide": "Utilisateurs dans le Monde",
            "Memories Preserved": "Souvenirs Préservés",
            "Countries Reached": "Pays Atteints",
            "Powerful Features": "Fonctionnalités Puissantes",
            "Everything you need": "Tout ce dont vous avez besoin pour préserver des souvenirs pour l'avenir",
            
            // Features
            "Privacy First": "Confidentialité d'Abord",
            "Time Release": "Libération Programmée",
            "Global Access": "Accès Global",
            "Military Encryption": "Cryptage Militaire",
            "Digital Legacy": "Héritage Numérique",
            "Multi-Device": "Multi-Appareils",
            
            // How it works
            "How Memorix Works": "Comment Fonctionne Memorix",
            "Three simple steps": "Trois étapes simples pour créer votre capsule temporelle",
            "Create a Capsule": "Créez une Capsule",
            "Customize Privacy": "Personnalisez la Confidentialité",
            "Time-Release Magic": "Magie de la Libération Programmée",
            
            // Notifications
            "Notifications": "Notifications",
            "Mark all as read": "Tout marquer comme lu",
            "No notifications yet": "Pas encore de notifications",
            "View all notifications": "Voir toutes les notifications",
            "Just now": "À l'instant",
            "min ago": "min",
            "mins ago": "mins",
            "hour ago": "heure",
            "hours ago": "heures",
            "day ago": "jour",
            "days ago": "jours",
            
            // Theme
            "Light": "Clair",
            "Dark": "Sombre",
            "Switch to light mode": "Passer au mode clair",
            "Switch to dark mode": "Passer au mode sombre",
        }
    },
    ar: {
        translation: {
            // Navigation
            "Welcome to Memorix": "مرحباً بك في ميموريكس",
            "Memorix": "ميموريكس",
            "Pricing": "الأسعار",
            "Public Capsules": "الكبسولات العامة",
            "Ratings": "التقييمات",
            "About Us": "من نحن",
            "Login": "تسجيل الدخول",
            "Register": "التسجيل",
            "Dashboard": "لوحة التحكم",
            "Profile": "الملف الشخصي",
            "Settings": "الإعدادات",
            "Logout": "تسجيل الخروج",
            
            // Homepage
            "Your Digital Memory Capsule": "كبسولة ذاكرتك الرقمية",
            "Preserve moments in time": "احفظ لحظات في الزمن",
            "Share when you're ready": "شارك عندما تكون مستعداً",
            "Join Now": "انضم الآن",
            "Explore Capsules": "استكشف الكبسولات",
            "Create Capsule": "إنشاء كبسولة",
            "Users Worldwide": "مستخدمين حول العالم",
            "Memories Preserved": "ذكريات محفوظة",
            "Countries Reached": "بلدان تم الوصول إليها",
            "Powerful Features": "ميزات قوية",
            "Everything you need": "كل ما تحتاجه لحفظ الذكريات للمستقبل",
            
            // Features
            "Privacy First": "الخصوصية أولاً",
            "Time Release": "إطلاق موقوت",
            "Global Access": "وصول عالمي",
            "Military Encryption": "تشفير عسكري",
            "Digital Legacy": "إرث رقمي",
            "Multi-Device": "متعدد الأجهزة",
            
            // How it works
            "How Memorix Works": "كيف يعمل ميموريكس",
            "Three simple steps": "ثلاث خطوات بسيطة لإنشاء كبسولة الزمن الخاصة بك",
            "Create a Capsule": "أنشئ كبسولة",
            "Customize Privacy": "خصص الخصوصية",
            "Time-Release Magic": "سحر الإطلاق الموقوت",
            
            // Notifications
            "Notifications": "الإشعارات",
            "Mark all as read": "تعليم الكل كمقروء",
            "No notifications yet": "لا توجد إشعارات بعد",
            "View all notifications": "عرض كل الإشعارات",
            "Just now": "الآن",
            "min ago": "دقيقة مضت",
            "mins ago": "دقائق مضت",
            "hour ago": "ساعة مضت",
            "hours ago": "ساعات مضت",
            "day ago": "يوم مضى",
            "days ago": "أيام مضت",
            
            // Theme
            "Light": "فاتح",
            "Dark": "داكن",
            "Switch to light mode": "التبديل إلى الوضع الفاتح",
            "Switch to dark mode": "التبديل إلى الوضع الداكن",
        }
    }
};

i18n
    .use(LanguageDetector) // detect user language
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        fallbackLng: "en",
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        },
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

// Function to change language
export const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    
    // Set page direction for RTL languages
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    
    // Store language preference
    localStorage.setItem('i18nextLng', lng);
};

// Initialize direction for RTL languages on load
const currentLng = i18n.language || localStorage.getItem('i18nextLng') || 'en';
if (currentLng === 'ar') {
    document.documentElement.dir = 'rtl';
}

export default i18n;
