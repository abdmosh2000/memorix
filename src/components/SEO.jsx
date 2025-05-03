import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO component for managing head tags in all pages
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - Keywords for SEO
 * @param {string} props.canonical - Canonical URL
 * @param {string} props.image - OG image URL
 * @param {string} props.type - OG type
 */
const SEO = ({ 
  title = "Memorix - Digital Time Capsules for Your Future Memories",
  description = "Create digital time capsules to preserve memories, photos, and messages for future release. Schedule personal time capsules with Memorix - connecting your past with your future.",
  keywords = "time capsule, digital memories, future messages, memory preservation, scheduled messages, legacy content, personal archives",
  canonical = "https://memorix.fun",
  image = "https://memorix.fun/og-image.jpg",
  type = "website"
}) => {
  // Build the full title with brand name
  const fullTitle = title.includes("Memorix") ? title : `${title} | Memorix`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
