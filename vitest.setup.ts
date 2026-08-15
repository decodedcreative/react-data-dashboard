import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// With `globals: false` Testing Library cannot register its own auto-cleanup,
// so rendered components would leak into later tests in the same file.
afterEach(cleanup);
