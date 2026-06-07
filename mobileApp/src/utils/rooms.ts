import type {Device, Room} from '../types/smartHome';

export const newRoom = (roomName = ''): Room => ({
  roomName,
  devices: [
    {pin: 2, status: false, type: 'light'},
    {pin: 7, status: false, type: 'door'},
  ],
});

export const connectedRoom = (roomName: string, currentRooms: Room[]): Room => {
  const usedPins = new Set(
    currentRooms.flatMap(room => room.devices.map(device => device.pin)),
  );
  let candidate = 2;
  const allocatePin = () => {
    while (usedPins.has(candidate)) {
      candidate += 1;
    }
    usedPins.add(candidate);
    return candidate;
  };

  return {
    roomName,
    devices: [
      {pin: allocatePin(), status: false, type: 'light'},
      {pin: allocatePin(), status: false, type: 'door'},
    ],
  };
};

export const isDeviceActive = (status: unknown, state: unknown) =>
  status === true ||
  String(status).toUpperCase() === 'TRUE' ||
  String(state).toUpperCase() === 'ON' ||
  String(state).toUpperCase() === 'OPEN';

export const normalizeRooms = (data: any): Room[] => {
  const config = data?.homeConfig || data?.house?.rooms || [];
  if (!Array.isArray(config)) {
    return [];
  }
  return config.map((room: any) => ({
    id: room.id,
    roomName: room.roomName || room.name || 'Piece',
    devices: Array.isArray(room.devices)
      ? room.devices
          .map((device: any) => ({
            id: device.id,
            pin: Number(device.pin || 0),
            status: isDeviceActive(device.status, device.state),
            type: String(device.type || '').toLowerCase(),
          }))
          .filter(
            (device: Device) => device.type === 'light' || device.type === 'door',
          )
      : [],
  }));
};
