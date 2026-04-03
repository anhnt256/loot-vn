import { createGlobPatternsForNx } from '@nx/react/tailwind';
import { join } from 'path';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForNx(join(__dirname, 'src')),
  ],
  theme: {
    extend: {
      colors: {
        'light-pink': '#FFB6C1',
        'pale-green': '#98FB98',
        moccasin: '#FFE4B5',
        'dark-gray': '#333333',
        gold: '#FFD700',
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
        gaming: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
