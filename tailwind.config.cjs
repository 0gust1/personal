const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      fontFamily: {
        didone: [
          'Didot',
          'Bodoni MT',
          'Noto Serif Display',
          'URW Palladio L',
          'P052',
          'Sylfaen',
          'serif'
        ]
      }
    }
  },

  plugins: [require('@tailwindcss/typography')]
};

module.exports = config;
