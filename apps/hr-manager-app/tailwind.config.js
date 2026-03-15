const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    join(__dirname, '../../libs/shared/utils/src/**/*.{ts,tsx,html}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
