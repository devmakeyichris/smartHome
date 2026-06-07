import {Platform} from 'react-native';
import type {Room} from '../types/smartHome';

export const isTest =
  (globalThis as {process?: {env?: {NODE_ENV?: string}}}).process?.env
    ?.NODE_ENV === 'test';

export const defaultApi =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const demoRooms: Room[] = [
  {
    roomName: 'Salon',
    devices: [
      {id: 101, pin: 2, status: true, type: 'light'},
      {id: 102, pin: 7, status: false, type: 'door'},
    ],
  },
  {
    roomName: 'Cuisine',
    devices: [
      {id: 103, pin: 4, status: false, type: 'light'},
      {id: 104, pin: 8, status: false, type: 'door'},
    ],
  },
  {
    roomName: 'Chambre',
    devices: [
      {id: 105, pin: 6, status: false, type: 'light'},
      {id: 106, pin: 9, status: true, type: 'door'},
    ],
  },
];
