import { useEffect } from 'react';

export function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    const siteName = 'LUXORA';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;

    document.title = fullTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    if (description) metaDesc.content = description;

    // Open Graph
    const setOG = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.content = content;
    };

    setOG('og:title', fullTitle);
    setOG('og:site_name', siteName);
    if (description) setOG('og:description', description);
    setOG('og:type', 'website');

    return () => {
      document.title = siteName;
    };
  }, [title, description]);
}
