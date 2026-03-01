import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="scroll-smooth">
        <Head>
          <meta charSet="utf-8" />
          
          {/* 🟢 BRANDING & ICONS */}
          {/* Prioritizing SVG for crisp scaling on all devices */}
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          
          {/* Set theme color to match your slate-50 background */}
          <meta name="theme-color" content="#f8fafc" />

          {/* ❌ NOTE: We use 'next/font/google' in _app.js for optimized loading. */}
        </Head>
        
        {/* 🟢 BODY STYLING: Aligned with the app's slate palette */}
        <body className="antialiased bg-slate-50 text-slate-900 selection:bg-red-100 selection:text-red-900 dark:bg-slate-950 dark:text-slate-50">
          
          {/* 🌗 THEME SCRIPT: Blocking execution to prevent dark-mode flicker */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var theme = localStorage.getItem('theme');
                    var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                    if (theme === 'dark' || (!theme && supportDarkMode)) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
          
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;