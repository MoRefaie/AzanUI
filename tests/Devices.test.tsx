import { render, screen, waitFor } from '@testing-library/react';
import Devices from '../src/pages/Devices';
import * as api from '../src/services/api';
import { vi } from 'vitest';

vi.mock('../src/services/api');

describe('Devices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and loads devices', async () => {
    (api.getConfig as any).mockResolvedValue({ DEVICES: ['dev1'], AUDIO_VOLUME: '40.0' });
    (api.scanDevices as any).mockResolvedValue({ status: 'success', data: { devices: [{ identifier: 'dev1', name: 'Device 1' }] } });

    render(<Devices />);
    await waitFor(() => {
      expect(screen.getByText(/Device 1/i)).toBeInTheDocument();
    });
  });
});
