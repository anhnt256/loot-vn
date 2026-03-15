const { join } = require('path');

module.exports = {
  plugins: {
    '@tailwindcss/postcss': {
      config: join(__dirname, 'tailwind.config.ts'),
    },
    autoprefixer: {},
  },
};
