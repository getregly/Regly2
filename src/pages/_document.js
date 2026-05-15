// src/pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Brand fonts — DM Sans (body) + DM Serif Display (headings) + Playfair Display (accent) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />

        {/* Global styles */}
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }

          :root {
            --terra:   #C0442B;
            --espr:    #1A0A06;
            --cream:   #F5F0E8;
            --blush:   #E8D5CC;
            --muted:   #8A7A6A;
            --border:  #E8E5DF;
            --white:   #FFFFFF;
            --warm-wh: #FAFAF8;

            --font-body:    'DM Sans', system-ui, sans-serif;
            --font-display: 'DM Serif Display', Georgia, serif;
            --font-accent:  'Playfair Display', Georgia, serif;

            --radius-sm: 6px;
            --radius-md: 10px;
            --radius-lg: 16px;
            --radius-xl: 20px;

            --shadow-sm: 0 1px 8px rgba(26,10,6,0.06);
            --shadow-md: 0 2px 16px rgba(26,10,6,0.08);
            --shadow-lg: 0 4px 32px rgba(26,10,6,0.10);
          }

          html {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }

          body {
            font-family: var(--font-body);
            background: var(--cream);
            color: var(--espr);
            margin: 0;
            padding: 0;
            font-size: 15px;
            line-height: 1.6;
            font-weight: 400;
          }

          button, input, select, textarea {
            font-family: inherit;
          }

          /* Smooth focus rings */
          :focus-visible {
            outline: 2px solid var(--terra);
            outline-offset: 2px;
          }

          /* Scrollbar — subtle warm tone */
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: var(--cream); }
          ::-webkit-scrollbar-thumb { background: var(--blush); border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: var(--muted); }

          /* Input placeholder */
          ::placeholder { color: var(--muted); opacity: 0.6; }

          /* Selection */
          ::selection { background: rgba(192,68,43,0.15); color: var(--espr); }
        `}</style>

        {/* Open Graph */}
        <meta property="og:site_name" content="Regly" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://getregly.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://getregly.com/og-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
