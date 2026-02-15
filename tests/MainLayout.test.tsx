import { render, screen, waitFor } from '@testing-library/react';
import MainLayout from '../src/components/layout/MainLayout';
import * as api from '../src/services/api';
import { vi } from 'vitest';

vi.mock('../src/services/api');

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the default timetable and updates when the configUpdated event fires', async () => {
    // initial call returns "Initial"
    (api.getConfig as any).mockResolvedValueOnce({ DEFAULT_TIMETABLE: 'Initial' });
    render(
      <MainLayout>
        <div>Child</div>
      </MainLayout>
    );

    // wait for initial timetable to render
    await waitFor(() => expect(screen.getByText(/Prayer Times/i)).toBeInTheDocument());
    expect(screen.getByText(/\(Initial\)/i)).toBeInTheDocument();

    // change mock so subsequent calls return a new value
    (api.getConfig as any).mockResolvedValueOnce({ DEFAULT_TIMETABLE: 'Updated' });

    // dispatch the global event that should make MainLayout refetch
    window.dispatchEvent(new Event('configUpdated'));

    // ensure the new timetable is shown
    await waitFor(() => expect(screen.getByText(/\(Updated\)/i)).toBeInTheDocument());
  });
});