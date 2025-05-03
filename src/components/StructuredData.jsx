import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Component for adding structured data (JSON-LD) to pages
 * This helps search engines better understand the content and context of our pages
 */
export const OrganizationStructuredData = () => {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Memorix',
    url: 'https://memorix.fun',
    logo: 'https://memorix.fun/logo.png',
    description: 'Create and schedule digital time capsules to preserve your memories for future release',
    sameAs: [
      'https://twitter.com/memorix',
      'https://facebook.com/memorixapp',
      'https://instagram.com/memorixapp'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-MEMORIX',
      contactType: 'customer service',
      email: 'contact@memorix.fun',
      availableLanguage: ['English', 'Arabic']
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
    </Helmet>
  );
};

export const WebsiteStructuredData = () => {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Memorix',
    url: 'https://memorix.fun',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://memorix.fun/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
};

export const ProductStructuredData = () => {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Memorix',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '2450'
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
    </Helmet>
  );
};

/**
 * Combined structured data for home page
 */
export const HomeStructuredData = () => {
  return (
    <>
      <OrganizationStructuredData />
      <WebsiteStructuredData />
      <ProductStructuredData />
    </>
  );
};

export default HomeStructuredData;
