/** @type {import('tailwindcss').Config} */
// ╔══════════════════════════════════════════════════════════════╗
// ║  AESTHETIK-CONVOLVE — Tailwind Configuration                 ║
// ║  POST-INTERNET BRUTALISM × TACTILE WORKBENCH UI              ║
// ╚══════════════════════════════════════════════════════════════╝

const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── CORE PALETTE ─────────────────────────────────────────────
      colors: {
        // Primary
        'safety-orange':   '#FF4500',
        'electric-gold':   '#FFD700',
        'cutting-mat':     '#1B3B2B',
        'void-black':      '#000000',
        'bone-white':      '#F5F0E8',

        // Extended Mat shades (for depth on the workspace floor)
        mat: {
          50:  '#E8F2EC',
          100: '#C5DDD0',
          200: '#9DC5B0',
          300: '#74AD90',
          400: '#4A9470',
          500: '#1B3B2B', // base cutting-mat
          600: '#163222',
          700: '#11291A',
          800: '#0C1F13',
          900: '#07150C',
        },

        // Orange scale (UI highlights, hover states)
        orange: {
          50:  '#FFF2EC',
          100: '#FFD9C7',
          200: '#FFBEA0',
          300: '#FFA278',
          400: '#FF8050',
          500: '#FF4500', // base safety-orange
          600: '#E03A00',
          700: '#BF3000',
          800: '#9E2700',
          900: '#7D1E00',
        },

        // Gold scale (accents, active states, glows)
        gold: {
          50:  '#FFFCE6',
          100: '#FFF6B3',
          200: '#FFEE7F',
          300: '#FFE54C',
          400: '#FFDC1A',
          500: '#FFD700', // base electric-gold
          600: '#E6C200',
          700: '#BFA100',
          800: '#997F00',
          900: '#735F00',
        },

        // UI semantic aliases
        'ui-bg':       '#FF4500',  // page background
        'ui-surface':  '#1B3B2B',  // cards / panels (the mat)
        'ui-accent':   '#FFD700',  // active dials, CTAs
        'ui-border':   '#000000',  // all borders, always
        'ui-text':     '#000000',  // primary text
        'ui-text-inv': '#F5F0E8',  // text on dark surfaces
      },

      // ── TYPOGRAPHY ───────────────────────────────────────────────
      fontFamily: {
        // Display: heavy industrial slab for headers
        display: ['"Bebas Neue"', '"Impact"', 'ui-sans-serif', 'sans-serif'],
        // Mono: the authentic lab-terminal readout
        mono:    ['"IBM Plex Mono"', '"Courier New"', 'ui-monospace', 'monospace'],
        // Body: compact grotesque — no softness
        body:    ['"Barlow Condensed"', '"Arial Narrow"', 'ui-sans-serif', 'sans-serif'],
      },

      fontSize: {
        'dial-label': ['0.625rem', { lineHeight: '1', letterSpacing: '0.12em' }],
        'readout':    ['0.75rem',  { lineHeight: '1', letterSpacing: '0.08em' }],
        'panel-head': ['1.125rem', { lineHeight: '1', letterSpacing: '0.05em' }],
        'hud':        ['2rem',     { lineHeight: '1', letterSpacing: '-0.02em' }],
        'hero':       ['5rem',     { lineHeight: '0.9', letterSpacing: '-0.04em' }],
      },

      // ── BORDERS — everything is 4px solid black ──────────────────
      borderWidth: {
        DEFAULT: '4px',
        '0':  '0',
        '2':  '2px',
        '4':  '4px',   // the standard
        '8':  '8px',   // heavy panel outlines
        '12': '12px',  // outermost frame
      },

      borderRadius: {
        none: '0px',
        DEFAULT: '0px', // zero border-radius everywhere
      },

      // ── SHADOWS — "Classic OS" drop shadows ──────────────────────
      boxShadow: {
        // Hard inset shadow (pressed state)
        'btn-pressed':  'inset 4px 4px 0 #000',
        // Standard raised panel
        'panel':        '6px 6px 0 #000',
        // Heavy window frame
        'window':       '8px 8px 0 #000',
        // Elevated / active widget
        'widget-active':'4px 4px 0 #FFD700',
        // Gold glow (metric gauges in alarm state)
        'gold-glow':    '0 0 20px 4px rgba(255,215,0,0.6)',
        // Orange danger glow
        'orange-glow':  '0 0 20px 4px rgba(255,69,0,0.7)',
        // Mat depth (image pin shadow)
        'pinned':       '0 12px 40px rgba(0,0,0,0.7), 0 4px 8px rgba(0,0,0,0.5)',
        // Ripple ring (animated via JS)
        'ripple':       '0 0 0 0 rgba(255,215,0,0.8)',
        // None
        'none':         'none',
      },

      // ── SPACING — generous, structured ───────────────────────────
      spacing: {
        'dial':     '4.5rem',   // rotary dial diameter
        'gauge':    '7rem',     // analog gauge diameter
        'pin':      '1.25rem',  // thumbtack pin
        'grid-gap': '3px',      // matrix grid gap
      },

      // ── ANIMATION ────────────────────────────────────────────────
      keyframes: {
        // Chromatic aberration text glitch
        'chr-aber': {
          '0%,100%': { textShadow: 'none' },
          '20%':     { textShadow: '-3px 0 #FF0000, 3px 0 #0000FF' },
          '40%':     { textShadow: '3px 0 #00FF00, -3px 0 #FF0000' },
          '60%':     { textShadow: '-2px 0 #0000FF, 2px 0 #00FF00' },
          '80%':     { textShadow: '2px 0 #FF0000, -2px 0 #0000FF' },
        },
        // LED VU-meter blink
        'vu-blink': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.2' },
        },
        // Gauge needle jitter
        'needle-jitter': {
          '0%,100%': { transform: 'rotate(var(--needle-deg))' },
          '25%':     { transform: 'rotate(calc(var(--needle-deg) + 2deg))' },
          '75%':     { transform: 'rotate(calc(var(--needle-deg) - 1.5deg))' },
        },
        // Impact shockwave ring
        'shockwave': {
          '0%':   { transform: 'scale(0)',   opacity: '0.9' },
          '70%':  { transform: 'scale(2.5)', opacity: '0.4' },
          '100%': { transform: 'scale(4)',   opacity: '0' },
        },
        // Panel slide-in from left (Framer Motion handles most, CSS fallback)
        'slide-in-left': {
          '0%':   { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',      opacity: '1' },
        },
        // Scan line sweep
        'scanline': {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
        // Dial tick
        'dial-tick': {
          '0%':   { transform: 'rotate(var(--dial-from))' },
          '100%': { transform: 'rotate(var(--dial-to))' },
        },
      },

      animation: {
        'chr-aber':        'chr-aber 0.4s ease-in-out',
        'vu-blink':        'vu-blink 0.5s ease-in-out infinite',
        'needle-jitter':   'needle-jitter 0.15s ease-in-out infinite',
        'shockwave':       'shockwave 0.6s cubic-bezier(0.2,0.6,0.4,1) forwards',
        'slide-in-left':   'slide-in-left 0.3s cubic-bezier(0.16,1,0.3,1)',
        'scanline':        'scanline 8s linear infinite',
        'dial-tick':       'dial-tick 0.1s ease-out forwards',
      },

      // ── BACKGROUND PATTERNS ───────────────────────────────────────
      backgroundImage: {
        // Cutting mat crosshatch (1mm grid lines)
        'cutting-mat-grid': `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 19px,
            rgba(255,255,255,0.06) 19px,
            rgba(255,255,255,0.06) 20px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 19px,
            rgba(255,255,255,0.06) 19px,
            rgba(255,255,255,0.06) 20px
          )
        `,
        // Orange linen texture overlay
        'safety-linen': `
          repeating-linear-gradient(
            45deg,
            rgba(0,0,0,0.04) 0px,
            rgba(0,0,0,0.04) 1px,
            transparent 1px,
            transparent 6px
          )
        `,
        // Gauge arc gradient
        'gauge-arc': `conic-gradient(
          #FFD700 0deg,
          #FF4500 180deg,
          #000 180deg
        )`,
      },

      // ── Z-INDEX SCALE ─────────────────────────────────────────────
      zIndex: {
        'canvas':  '1',
        'mat':     '2',
        'panel':   '10',
        'window':  '20',
        'overlay': '30',
        'hud':     '40',
        'modal':   '50',
        'tooltip': '60',
      },

      // ── TRANSITIONS ───────────────────────────────────────────────
      transitionTimingFunction: {
        'spring':     'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'industrial': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'snap':       'cubic-bezier(0.6, 0.0, 0.4, 1.0)',
      },
    },
  },

  plugins: [
    // ── BRUTALIST UTILITIES ───────────────────────────────────────
    plugin(function ({ addUtilities, addComponents, theme }) {

      // Hard border utility (4px solid black, zero radius)
      addUtilities({
        '.border-brutal': {
          border:       '4px solid #000000',
          borderRadius: '0px',
        },
        '.border-brutal-2': {
          border:       '2px solid #000000',
          borderRadius: '0px',
        },
        '.border-brutal-8': {
          border:       '8px solid #000000',
          borderRadius: '0px',
        },
        '.shadow-window': {
          boxShadow:    '8px 8px 0 #000000',
        },
        '.shadow-panel': {
          boxShadow:    '6px 6px 0 #000000',
        },
        '.shadow-widget-active': {
          boxShadow:    '4px 4px 0 #FFD700',
        },
        // Pinned image look (on cutting mat)
        '.pinned-image': {
          boxShadow: '0 12px 40px rgba(0,0,0,0.7), 0 4px 8px rgba(0,0,0,0.5)',
          transform: 'rotate(-0.5deg)',
        },
        // Scan line overlay
        '.scanlines': {
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.15) 0px,
            rgba(0,0,0,0.15) 1px,
            transparent 1px,
            transparent 3px
          )`,
          backgroundSize: '100% 3px',
          pointerEvents: 'none',
        },
        // Text glitch class (trigger via JS)
        '.text-glitch': {
          animation: 'chr-aber 0.4s ease-in-out',
        },
        // Industrial knurling pattern (for dial edges)
        '.knurled': {
          backgroundImage: `repeating-conic-gradient(
            #1a1a1a 0deg 10deg,
            #2a2a2a 10deg 20deg
          )`,
        },
      });

      // ── COMPONENT PRESETS ───────────────────────────────────────
      addComponents({
        // Classic OS window chrome
        '.window-chrome': {
          border:           '4px solid #000000',
          borderRadius:     '0px',
          boxShadow:        '8px 8px 0 #000000',
          backgroundColor:  '#FF4500',
          overflow:         'hidden',
        },
        // Window title bar
        '.window-titlebar': {
          backgroundColor:  '#000000',
          color:            '#FFD700',
          fontFamily:       '"IBM Plex Mono", monospace',
          fontSize:         '0.75rem',
          letterSpacing:    '0.08em',
          textTransform:    'uppercase',
          padding:          '6px 12px',
          display:          'flex',
          alignItems:       'center',
          justifyContent:   'space-between',
          userSelect:       'none',
        },
        // Matrix cell (convolution dial container)
        '.matrix-cell': {
          width:            '5rem',
          height:           '5rem',
          border:           '4px solid #000000',
          borderRadius:     '0px',
          backgroundColor:  '#1B3B2B',
          display:          'flex',
          flexDirection:    'column',
          alignItems:       'center',
          justifyContent:   'center',
          cursor:           'ns-resize',
          position:         'relative',
          transition:       'box-shadow 0.1s ease',
          '&:hover': {
            boxShadow:      '4px 4px 0 #FFD700',
          },
          '&.active': {
            boxShadow:      '0 0 20px 4px rgba(255,215,0,0.6)',
          },
        },
        // Readout LCD display
        '.readout-lcd': {
          fontFamily:       '"IBM Plex Mono", monospace',
          backgroundColor:  '#0A1F0F',
          color:            '#39FF14',
          border:           '3px inset #000',
          padding:          '4px 8px',
          fontSize:         '1.1rem',
          letterSpacing:    '0.1em',
          textShadow:       '0 0 6px rgba(57,255,20,0.8)',
          minWidth:         '6ch',
          textAlign:        'right',
        },
        // Heavy button
        '.btn-brutalist': {
          border:           '4px solid #000000',
          borderRadius:     '0px',
          boxShadow:        '6px 6px 0 #000000',
          fontFamily:       '"Bebas Neue", sans-serif',
          fontSize:         '1.2rem',
          letterSpacing:    '0.1em',
          textTransform:    'uppercase',
          cursor:           'pointer',
          transition:       'transform 0.05s, box-shadow 0.05s',
          '&:active': {
            transform:      'translate(6px, 6px)',
            boxShadow:      '0 0 0 #000000',
          },
        },
        // Toggle switch track
        '.toggle-track': {
          width:            '4rem',
          height:           '2rem',
          border:           '4px solid #000000',
          borderRadius:     '0px',
          backgroundColor:  '#1B3B2B',
          position:         'relative',
          cursor:           'pointer',
        },
        // Gauge container
        '.gauge-container': {
          width:            '7rem',
          height:           '7rem',
          border:           '4px solid #000000',
          borderRadius:     '50%',          // only circles exempt from zero-radius
          backgroundColor:  '#0A0A0A',
          position:         'relative',
          boxShadow:        '6px 6px 0 #000000, inset 0 2px 8px rgba(0,0,0,0.8)',
        },
        // HUD metric panel
        '.hud-panel': {
          backgroundColor:  '#1B3B2B',
          border:           '4px solid #000000',
          boxShadow:        '6px 6px 0 #000000',
          padding:          '12px 16px',
          fontFamily:       '"IBM Plex Mono", monospace',
        },
      });
    }),
  ],
};