/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      fontWeight: {
        500: '500',
        600: '600',
        700: '700',
        800: '800',
        900: '900',
      },
      colors: {
        /* ── Airbnb Design System ── */
        rausch:      '#ff385c',
        'rausch-deep': '#e00b41',
        'plus-magenta': '#92174d',
        'luxe-purple': '#460479',
        'ink-black':  '#222222',
        'ash-gray':   '#6a6a6a',
        'mute-gray':  '#929292',
        'stone-gray': '#c1c1c1',
        'hairline':   '#dddddd',
        'soft-cloud': '#f7f7f7',
        'info-blue':  '#428bff',
        'error-red':  '#c13515',

        /* ── Legacy compat ── */
        surface:    '#ffffff',
        background: '#f7f7f7',
        text: {
          main:  '#222222',
          muted: '#6a6a6a',
        },
        status: {
          danger:  '#c13515',
          warning: '#f59e0b',
        },
      },
      borderRadius: {
        'sm':     '4px',
        'md':     '8px',
        'card':   '14px',
        'lg':     '20px',
        'pill':   '32px',
        'circle': '50%',
      },
      boxShadow: {
        'elevation-1': 'rgba(0,0,0,0.08) 0 4px 12px',
        'elevation-2': 'rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.10) 0 4px 8px 0',
        'rausch':      '0 8px 24px rgba(255,56,92,0.30)',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
