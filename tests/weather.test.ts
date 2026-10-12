import { beforeEach, expect, it, vi } from 'vitest';

const location = vi.hoisted(() => ({
  requestForegroundPermissionsAsync: vi.fn(),
  getForegroundPermissionsAsync: vi.fn(),
  getCurrentPositionAsync: vi.fn(),
}));

vi.mock('expo-location', () => ({ ...location, Accuracy: { Low: 2 } }));

import { deviceCoordinates } from '../src/services/weather';

beforeEach(() => {
  vi.clearAllMocks();
  location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  location.getForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  location.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: -12.05, longitude: -77.04 } });
});

it('asks for location only after a user action', async () => {
  expect(await deviceCoordinates(false)).toEqual({ lat: -12.05, lon: -77.04 });
  expect(location.getForegroundPermissionsAsync).toHaveBeenCalledOnce();
  expect(location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();

  await deviceCoordinates();
  expect(location.requestForegroundPermissionsAsync).toHaveBeenCalledOnce();
  expect(location.getCurrentPositionAsync).toHaveBeenCalledTimes(2);
});

it('does not read coordinates after permission is denied', async () => {
  location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
  expect(await deviceCoordinates()).toBeNull();
  expect(location.getCurrentPositionAsync).not.toHaveBeenCalled();
});
