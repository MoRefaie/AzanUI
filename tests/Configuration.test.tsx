import { render, screen, waitFor } from '@testing-library/react';
import Configuration from '../src/pages/Configuration';
import * as api from '../src/services/api';
import { vi } from 'vitest';

vi.mock('../src/services/api');

describe('Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and loads configuration', async () => {
    (api.getConfig as any).mockResolvedValue({ TIMEZONE: 'UTC', SOURCES: [] });
    render(<Configuration />);
    await waitFor(() => {
      expect(screen.getByText(/timezone/i)).toBeInTheDocument();
    });
  });
});
