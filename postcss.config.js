// ref: https://tailwindcss.com/docs/using-with-preprocessors
export default {
  plugins: {
    //Some plugins, like tailwindcss/nesting, need to run before Tailwind,
    'tailwindcss/nesting': {},
    tailwindcss: {},
    //But others, like autoprefixer, need to run after,
    autoprefixer: {}
  }
};
