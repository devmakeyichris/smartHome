import type {LucideIcon} from 'lucide-react-native';

export type DeviceType = 'light' | 'door';
export type Screen = 'login' | 'register' | 'dashboard';
export type BackendStatus = 'unknown' | 'online' | 'offline';
export type AppTheme = 'dark' | 'light';
export type SceneMode = 'away' | 'night' | 'welcome';

export type Device = {
  id?: number;
  pin: number;
  status: boolean;
  type: DeviceType;
};

export type Room = {
  id?: number;
  devices: Device[];
  roomName: string;
};

export type Profile = {
  email: string;
  houseId?: number | string;
  nom: string;
  nomMaison?: string;
  prenom: string;
  role?: string;
};

export type LogEntry = {
  action: string;
  id: string;
  room: string;
  time: string;
};

export type DashboardTab = 'home' | 'activity' | 'access' | 'settings';
export type ActivityFilter = 'all' | 'light' | 'door';

export type AccessBadge = {
  id: string;
  label: string;
  owner: string;
  status: 'Autorise' | 'Suspendu' | 'A associer';
};

export type RegisterForm = {
  email: string;
  houseId: string;
  nom: string;
  nomMaison: string;
  password: string;
  prenom: string;
};

export type MetricConfig = {
  Icon: LucideIcon;
  label: string;
  value: string;
};
