import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Component for adding capsule-specific structured data (JSON-LD) to pages
 * This helps search engines better understand capsule collections and individual capsules
 */

export const CapsuleListStructuredData = ({ capsules }) => {
  const capsuleListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: capsules.map((capsule, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: capsule.title,
        description: capsule.description,
        dateCreated: capsule.releaseDate,
        author: {
          '@type': 'Person',
          name: capsule.userName
        },
        ...(capsule.tags && { keywords: capsule.tags.join(', ') }),
        ...(capsule.images && capsule.images.length > 0 && {
          image: capsule.images[0].url
        })
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(capsuleListSchema)}
      </script>
    </Helmet>
  );
};

export const CapsuleCollectionStructuredData = () => {
  // This is more general structured data for the public capsules page
  // when specific capsule data is not yet loaded
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Public Time Capsules | Memorix Community',
    description: 'Browse public time capsules from the Memorix community. Discover shared memories, stories, photos, and experiences from users around the world.',
    url: 'https://memorix.fun/public',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Memorix',
      url: 'https://memorix.fun'
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(collectionSchema)}
      </script>
    </Helmet>
  );
};

export default CapsuleCollectionStructuredData;
