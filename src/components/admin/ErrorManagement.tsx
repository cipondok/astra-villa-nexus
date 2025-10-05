
import React, { useEffect } from 'react';
import DatabaseErrorManager from '@/components/admin/cs-tools/DatabaseErrorManager';

const ErrorManagement = () => {
  useEffect(() => {
    // SEO: set title, meta description, and canonical
    document.title = 'Database Error Manager | Admin';

    const ensureMeta = (name: string, content: string) => {
      const existing = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (existing) existing.setAttribute('content', content);
      else {
        const m = document.createElement('meta');
        m.name = name;
        m.content = content;
        document.head.appendChild(m);
      }
    };

    ensureMeta('description', 'Monitor and fix database errors in real time with Database Error Manager.');

    const canonicalUrl = window.location.origin + '/admin-dashboard#error-management';
    const existingLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (existingLink) existingLink.setAttribute('href', canonicalUrl);
    else {
      const l = document.createElement('link');
      l.rel = 'canonical';
      l.href = canonicalUrl;
      document.head.appendChild(l);
    }
  }, []);

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Database Error Manager</h1>
        <p className="text-muted-foreground">Real-time database error monitoring and quick fixes</p>
      </header>

      <section aria-label="Database errors">
        <DatabaseErrorManager />
      </section>
    </main>
  );
};

export default ErrorManagement;
