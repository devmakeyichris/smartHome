import type {DeviceType, RegisterForm, Room} from '../types/smartHome';

export const requestBackend = async (
  apiBase: string,
  path: string,
  options?: RequestInit,
) => {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {'Content-Type': 'application/json', ...options?.headers},
  });
  const text = await response.text();
  let body: any = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {}
  if (!response.ok) {
    throw new Error(typeof body === 'string' ? body : 'Erreur serveur');
  }
  return body;
};

export const loginUser = (apiBase: string, email: string, password: string) =>
  requestBackend(apiBase, '/auth/login', {
    body: JSON.stringify({email, password}),
    method: 'POST',
  });

export const registerUser = (
  apiBase: string,
  form: RegisterForm,
  configuredRooms: Room[],
) =>
  requestBackend(apiBase, '/auth/register', {
    body: JSON.stringify({
      ...form,
      homeConfig: form.houseId ? [] : configuredRooms,
      role: form.houseId ? 'guest' : 'admin',
    }),
    method: 'POST',
  });

export const pingBackend = (apiBase: string) =>
  requestBackend(apiBase, '/users/email/ping@smarthome.local');

export const updateDeviceState = (
  apiBase: string,
  deviceId: number,
  state: string,
) => fetch(`${apiBase}/devices/${deviceId}/state?state=${state}`, {method: 'PUT'});

export const createRoom = (apiBase: string, houseId: number | string, name: string) =>
  requestBackend(apiBase, '/rooms', {
    body: JSON.stringify({
      devices: [],
      house: {id: houseId},
      name,
    }),
    method: 'POST',
  });

export const createDevice = (
  apiBase: string,
  roomId: number,
  type: DeviceType,
  pin: number,
) =>
  requestBackend(apiBase, '/devices', {
    body: JSON.stringify({
      pin,
      room: {id: roomId},
      state: type === 'light' ? 'OFF' : 'CLOSED',
      type: type.toUpperCase(),
    }),
    method: 'POST',
  });

export const deleteDevice = (apiBase: string, deviceId: number) =>
  requestBackend(apiBase, `/devices/${deviceId}`, {method: 'DELETE'});

export const deleteRoom = (apiBase: string, roomId: number) =>
  requestBackend(apiBase, `/rooms/${roomId}`, {method: 'DELETE'});
