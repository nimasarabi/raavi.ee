(() => {
  const STORAGE_KEY = 'raavi-lang';

  const safeGet = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const safeSet = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore storage errors (private mode, etc.)
    }
  };

  const path = window.location.pathname || '/';
  const isEtPath = path === '/et' || path.startsWith('/et/');
  const isEnPath = path === '/en' || path.startsWith('/en/');

  if (isEtPath) safeSet('et');
  if (isEnPath) safeSet('en');

  const preferred = safeGet() || (isEtPath ? 'et' : 'en');

  const stripPrefix = (value, prefix) => {
    if (value === prefix) return '/';
    const stripped = value.replace(new RegExp('^' + prefix), '');
    return stripped === '' ? '/' : stripped;
  };

  const toRelative = (pathname) => {
    if (!pathname || pathname === '/') return './';
    if (pathname.startsWith('/')) return pathname.slice(1);
    return pathname;
  };

  const mapToEt = (pathname) => {
    if (pathname === '/' || pathname === '') return '/et/';
    if (pathname.startsWith('/et/')) return pathname;
    let base = pathname;
    if (pathname === '/en' || pathname.startsWith('/en/')) {
      base = stripPrefix(pathname, '/en');
    }

    const mappings = [
      ['/portfolio/events', '/et/portfolio/events'],
      ['/portfolio/product', '/et/portfolio/product'],
      ['/portfolio', '/et/portfolio'],
      ['/services', '/et/services'],
      ['/contact', '/et/contact'],
      ['/faqs', '/et/faqs'],
      ['/404', '/et/404'],
    ];

    for (const [from, to] of mappings) {
      if (base === from || base.startsWith(from + '/')) {
        return base.replace(from, to);
      }
    }

    return '/et' + (base.startsWith('/') ? base : '/' + base);
  };

  const applyBase = (pathname) => {
    const host = window.location.hostname;
    const parts = window.location.pathname.split('/').filter(Boolean);
    const basePrefix = host.endsWith('github.io') && parts.length ? '/' + parts[0] : '';
    if (!basePrefix) return pathname;
    if (pathname === '/') return basePrefix + '/';
    return basePrefix + (pathname.startsWith('/') ? pathname : '/' + pathname);
  };

  const getBasePath = (pathname) => {
    if (pathname === '/en' || pathname.startsWith('/en/')) return stripPrefix(pathname, '/en');
    if (pathname === '/et' || pathname.startsWith('/et/')) return stripPrefix(pathname, '/et');
    return pathname || '/';
  };

  const updateLanguageLinks = () => {
    const etHref = mapToEt(path);
    const base = getBasePath(path);
    const enHref = path === '/en' || path.startsWith('/en/') ? path : base;

    const options = document.querySelectorAll('.language-option');
    options.forEach((link) => {
      const label = (link.textContent || '').toLowerCase();
      if (label.includes('eesti')) link.setAttribute('href', toRelative(etHref));
      if (label.includes('english') || label.includes('inglise')) link.setAttribute('href', toRelative(enHref || '/'));
    });
  };

  updateLanguageLinks();

  if (preferred === 'et' && !isEtPath) {
    const target = mapToEt(path);
    if (target && target !== path) {
      window.location.replace(applyBase(target));
      return;
    }
  }

  if (preferred === 'en' && isEtPath) {
    const target = stripPrefix(path, '/et');
    if (target !== path) {
      window.location.replace(applyBase(target));
      return;
    }
  }

  const shouldRewrite = (link) => {
    if (!link) return false;
    if (link.getAttribute('role') === 'option') return false;
    if (link.closest('.language-picker') || link.closest('.lang-switch')) return false;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    let url;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return false;
    }
    if (url.origin !== window.location.origin) return false;
    return true;
  };

  const rewriteLinksToEt = () => {
    const links = document.querySelectorAll('a[href]');
    links.forEach((link) => {
      if (!shouldRewrite(link)) return;
      const url = new URL(link.getAttribute('href'), window.location.href);
      const mapped = mapToEt(url.pathname);
      if (mapped && mapped !== url.pathname) {
        url.pathname = mapped;
        const rel = toRelative(url.pathname);
        link.setAttribute('href', rel + url.search + url.hash);
      }
    });
  };

  if (preferred === 'et') {
    rewriteLinksToEt();
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    if (link.getAttribute('role') === 'option') {
      const label = (link.textContent || '').toLowerCase();
      if (label.includes('eesti')) safeSet('et');
      if (label.includes('english') || label.includes('inglise')) safeSet('en');
      return;
    }

    const href = link.getAttribute('href');
    if (!href) return;
    let url;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;

    if (url.pathname === '/et' || url.pathname.startsWith('/et/')) safeSet('et');
    if (url.pathname === '/en' || url.pathname.startsWith('/en/')) safeSet('en');
  });
})();
