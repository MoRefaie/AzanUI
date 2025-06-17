import { render, screen, waitFor } from '@testing-library/react';
import PrayerDashboard from '../src/pages/PrayerDashboard';
import * as api from '../src/services/api';
import { vi } from 'vitest';

vi.mock('../src/services/api');

describe('PrayerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and loads prayer times', async () => {
    (api.getPrayerTimes as any).mockResolvedValue({ Fajr: '04:00', Dhuhr: '12:00' });
    (api.getAzanSwitches as any).mockResolvedValue({ Fajr: 'On', Dhuhr: 'Off' });
    (api.getShortAzanSwitches as any).mockResolvedValue({ Fajr: 'Off', Dhuhr: 'On' });
    (api.getDuaaSwitches as any).mockResolvedValue({});
    (api.getSchedulerStatus as any).mockResolvedValue(true);
    (api.getGamaStatus as any).mockResolvedValue(false);

    render(<PrayerDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Fajr/i)).toBeInTheDocument();
      expect(screen.getByText(/Dhuhr/i)).toBeInTheDocument();
    });
  });
});
