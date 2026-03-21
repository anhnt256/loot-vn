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
    extend: {},
  },
  plugins: [],
};
