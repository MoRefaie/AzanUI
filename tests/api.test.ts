import { updateConfig } from '../src/services/api';
import { vi } from 'vitest';

describe('api.updateConfig', () => {
  const originalDispatch = window.dispatchEvent;
  beforeEach(() => {
    // spy on dispatchEvent
    window.dispatchEvent = vi.fn();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    window.dispatchEvent = originalDispatch;
    vi.restoreAllMocks();
  });

  it('dispatches a configUpdated event when update succeeds', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ status: 'success', data: {} }),
    } as any;
    (global.fetch as any).mockResolvedValue(mockResponse);

    await updateConfig({ DEFAULT_TIMETABLE: 'Foo' });

    expect(global.fetch).toHaveBeenCalled();
    expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('configUpdated'));
  });

  it('still dispatches when returnOutput is true', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ status: 'success', data: {} }),
    } as any;
    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await updateConfig({ DEFAULT_TIMETABLE: 'Bar' }, true);
    expect(result).toEqual({ status: 'success', data: {} });
    expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('configUpdated'));
  });
});