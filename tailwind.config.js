/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        caliber: {
          black:      '#111210',
          dark:       '#1c1d18',
          surface:    '#252722',
          elevated:   '#2d2f27',
          border:     '#383a30',
          muted:      '#4a4d3f',
          dim:        '#6b6d5c',
          gold:       '#9B935D',
          'gold-light':'#b5ad74',
          'gold-dark': '#7a7348',
          olive:      '#41481D',
          'olive-light':'#556025',
          teal:       '#244544',
          'teal-light':'#2e5a58',
          steel:      '#F7F7F7',
          red:        '#c0392b',
          green:      '#2d6a4f',
        },
      },
      fontFamily: {
        heading: ['"Rajdhani"', 'sans-serif'],
        body:    ['"Rajdhani"', 'sans-serif'],
      },
      backgroundImage: {
        'topo': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cpath d='M0 200 Q100 150 200 200 Q300 250 400 200' stroke='%239B935D' stroke-width='0.5' fill='none' opacity='0.15'/%3E%3Cpath d='M0 220 Q100 170 200 220 Q300 270 400 220' stroke='%239B935D' stroke-width='0.5' fill='none' opacity='0.12'/%3E%3Cpath d='M0 180 Q100 130 200 180 Q300 230 400 180' stroke='%239B935D' stroke-width='0.5' fill='none' opacity='0.12'/%3E%3Cpath d='M0 240 Q100 190 200 240 Q300 290 400 240' stroke='%239B935D' stroke-width='0.5' fill='none' opacity='0.08'/%3E%3Cpath d='M0 160 Q100 110 200 160 Q300 210 400 160' stroke='%239B935D' stroke-width='0.5' fill='none' opacity='0.08'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
