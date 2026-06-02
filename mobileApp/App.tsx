import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  DoorOpen,
  Gauge,
  LockKeyhole,
  LogOut,
  Mail,
  Moon,
  Play,
  Plus,
  RadioTower,
  Server,
  ShieldCheck,
  Sun,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import DashboardExperience from './src/components/DashboardExperience';

type DeviceType = 'light' | 'door';
type Screen = 'login' | 'register' | 'dashboard';
type BackendStatus = 'unknown' | 'online' | 'offline';
type AppTheme = 'dark' | 'light';

type Device = {id?: number; pin: number; status: boolean; type: DeviceType};
type Room = {id?: number; devices: Device[]; roomName: string};
type Profile = {
  email: string;
  houseId?: number | string;
  nom: string;
  nomMaison?: string;
  prenom: string;
  role?: string;
};
type LogEntry = {action: string; id: string; room: string; time: string};
type SceneMode = 'away' | 'night' | 'welcome';
const ThemeContext = React.createContext<AppTheme>('dark');
const useLightTheme = () => useContext(ThemeContext) === 'light';
const isTest =
  (globalThis as {process?: {env?: {NODE_ENV?: string}}}).process?.env
    ?.NODE_ENV === 'test';

const defaultApi =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

const newRoom = (roomName = ''): Room => ({
  roomName,
  devices: [
    {pin: 2, status: false, type: 'light'},
    {pin: 7, status: false, type: 'door'},
  ],
});

const connectedRoom = (roomName: string, currentRooms: Room[]): Room => {
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

const isDeviceActive = (status: unknown, state: unknown) =>
  status === true ||
  String(status).toUpperCase() === 'TRUE' ||
  String(state).toUpperCase() === 'ON' ||
  String(state).toUpperCase() === 'OPEN';

const demoRooms: Room[] = [
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

const App = () => {
  const [apiBase, setApiBase] = useState(defaultApi);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('unknown');
  const [busy, setBusy] = useState(false);
  const [busyDevice, setBusyDevice] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [register, setRegister] = useState({
    email: '',
    houseId: '',
    nom: '',
    nomMaison: '',
    password: '',
    prenom: '',
  });
  const [rooms, setRooms] = useState<Room[]>([newRoom()]);
  const [screen, setScreen] = useState<Screen>('login');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [showServer, setShowServer] = useState(true);
  const [showSplash, setShowSplash] = useState(!isTest);
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [user, setUser] = useState<Profile | null>(null);
  const reveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    reveal.setValue(0);
    Animated.timing(reveal, {
      duration: 520,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [reveal, screen]);

  const totalDevices = useMemo(
    () => rooms.reduce((sum, room) => sum + room.devices.length, 0),
    [rooms],
  );
  const activeDevices = useMemo(
    () =>
      rooms.reduce(
        (sum, room) => sum + room.devices.filter(device => device.status).length,
        0,
      ),
    [rooms],
  );
  const request = async (path: string, options?: RequestInit) => {
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

  const normalizeRooms = (data: any): Room[] => {
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
            .filter((device: Device) => device.type === 'light' || device.type === 'door')
        : [],
    }));
  };

  const openDashboard = (profile: Profile, nextRooms: Room[], demo = false) => {
    setBackendStatus('online');
    setIsDemo(demo);
    setRooms(nextRooms.length ? nextRooms : []);
    setSelectedRoom('all');
    setShowServer(false);
    setUser(profile);
    setScreen('dashboard');
  };

  const login = async () => {
    setBusy(true);
    setMessage('');
    try {
      const data = await request('/auth/login', {
        body: JSON.stringify({email, password}),
        method: 'POST',
      });
      openDashboard(
        {
          email: data.email || email,
          houseId: data.houseId || data.house?.id,
          nom: data.nom || '',
          nomMaison: data.nomMaison || data.house?.houseName,
          prenom: data.prenom || '',
          role: data.role || 'guest',
        },
        normalizeRooms(data),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Connexion impossible');
    } finally {
      setBusy(false);
    }
  };

  const createAccount = async () => {
    const configuredRooms = rooms.filter(room => room.roomName.trim());
    if (!register.houseId && !configuredRooms.length) {
      setMessage('Ajoute au moins une piece.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const data = await request('/auth/register', {
        body: JSON.stringify({
          ...register,
          homeConfig: register.houseId ? [] : configuredRooms,
          role: register.houseId ? 'guest' : 'admin',
        }),
        method: 'POST',
      });
      openDashboard(
        {
          email: data.email || register.email,
          houseId: data.houseId || data.house?.id,
          nom: data.nom || register.nom,
          nomMaison: data.nomMaison || register.nomMaison,
          prenom: data.prenom || register.prenom,
          role: data.role || 'admin',
        },
        normalizeRooms(data),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Inscription impossible');
    } finally {
      setBusy(false);
    }
  };

  const startDemo = () => {
    setLogs([
      {action: 'Porte ouverte', id: 'demo-door', room: 'Chambre', time: now()},
    ]);
    openDashboard(
      {
        email: 'demo@smarthome.local',
        houseId: 'DEMO-001',
        nom: 'Demo',
        nomMaison: 'Villa Lucide',
        prenom: 'Marie',
        role: 'admin',
      },
      demoRooms.map(room => ({
        ...room,
        devices: room.devices.map(device => ({...device})),
      })),
      true,
    );
  };

  const testBackend = async () => {
    setBusy(true);
    setMessage('');
    try {
      await request('/users/email/ping@smarthome.local');
      setBackendStatus('online');
      setMessage('Backend joignable.');
    } catch (error) {
      const detail = error instanceof Error ? error.message : '';
      if (detail === 'User not found') {
        setBackendStatus('online');
        setMessage('Backend joignable.');
      } else {
        setBackendStatus('offline');
        setMessage(`Backend indisponible: ${detail}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const applyToggle = (roomIndex: number, deviceIndex: number) => {
    const room = rooms[roomIndex];
    const device = room?.devices[deviceIndex];
    if (!room || !device) {
      return;
    }
    const status = !device.status;
    setRooms(previous =>
      previous.map((item, index) =>
        index === roomIndex
          ? {
              ...item,
              devices: item.devices.map((entry, entryIndex) =>
                entryIndex === deviceIndex ? {...entry, status} : entry,
              ),
            }
          : item,
      ),
    );
    setLogs(previous => [
      {
        action:
          device.type === 'light'
            ? `Lumiere ${status ? 'allumee' : 'eteinte'}`
            : `Porte ${status ? 'ouverte' : 'fermee'}`,
        id: `${Date.now()}-${roomIndex}-${deviceIndex}-${status}`,
        room: room.roomName,
        time: now(),
      },
      ...previous,
    ]);
  };

  const toggleDevice = async (roomIndex: number, deviceIndex: number) => {
    const device = rooms[roomIndex]?.devices[deviceIndex];
    if (!device) {
      Alert.alert('Module introuvable', 'Recharge la maison puis reessaie.');
      return;
    }
    if (isDemo) {
      applyToggle(roomIndex, deviceIndex);
      return;
    }
    if (!device.id) {
      Alert.alert('Module non sauvegarde', 'Reconnecte-toi pour charger son identifiant.');
      return;
    }
    const state =
      device.type === 'light'
        ? device.status
          ? 'OFF'
          : 'ON'
        : device.status
          ? 'CLOSED'
          : 'OPEN';
    try {
      setBusyDevice(`${roomIndex}-${deviceIndex}`);
      const response = await fetch(
        `${apiBase}/devices/${device.id}/state?state=${state}`,
        {method: 'PUT'},
      );
      if (!response.ok) {
        throw new Error('Le backend a refuse la commande.');
      }
      applyToggle(roomIndex, deviceIndex);
    } catch (error) {
      Alert.alert('Commande impossible', error instanceof Error ? error.message : '');
    } finally {
      setBusyDevice(null);
    }
  };

  const runScene = async (mode: SceneMode) => {
    const shouldActivate = (device: Device) =>
      mode === 'welcome' ? device.type === 'light' : false;
    const candidates = rooms.flatMap((room, roomIndex) =>
      room.devices.flatMap((device, deviceIndex) => {
        const targetStatus = shouldActivate(device);
        return device.status === targetStatus ? [] : [{deviceIndex, roomIndex}];
      }),
    );
    for (const candidate of candidates) {
      await toggleDevice(candidate.roomIndex, candidate.deviceIndex);
    }
    setLogs(previous => [
      {
        action:
          mode === 'away'
            ? 'Scene Depart activee'
            : mode === 'night'
              ? 'Scene Nuit activee'
              : 'Scene Retour activee',
        id: `scene-${Date.now()}`,
        room: 'Maison',
        time: now(),
      },
      ...previous,
    ]);
  };

  const addRoom = async (roomName: string) => {
    const name = roomName.trim();
    if (!name) {
      return false;
    }
    if (rooms.some(room => room.roomName.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Piece deja existante', 'Choisis un autre nom pour cette piece.');
      return false;
    }
    const nextRoom = connectedRoom(name, rooms);
    if (isDemo) {
      setRooms(previous => [...previous, nextRoom]);
      return true;
    }
    if (!user?.houseId) {
      Alert.alert('Maison introuvable', 'Reconnecte-toi avant d ajouter une piece.');
      return false;
    }
    try {
      const savedRoom = await request('/rooms', {
        body: JSON.stringify({
          devices: [],
          house: {id: user.houseId},
          name,
        }),
        method: 'POST',
      });
      if (!savedRoom?.id) {
        throw new Error('Le backend n a pas retourne l identifiant de la piece.');
      }
      const savedDevices = await Promise.all(
        nextRoom.devices.map(device =>
          request('/devices', {
            body: JSON.stringify({
              pin: device.pin,
              room: {id: savedRoom.id},
              state: device.type === 'light' ? 'OFF' : 'CLOSED',
              type: device.type.toUpperCase(),
            }),
            method: 'POST',
          }),
        ),
      );
      setRooms(previous => [
        ...previous,
        {
          ...nextRoom,
          id: savedRoom.id,
          devices: nextRoom.devices.map((device, index) => ({
            ...device,
            id: savedDevices[index]?.id,
          })),
        },
      ]);
      return true;
    } catch (error) {
      Alert.alert(
        'Ajout impossible',
        error instanceof Error ? error.message : 'Le backend a refuse la nouvelle piece.',
      );
      return false;
    }
  };

  const addDevice = async (
    roomIndex: number,
    type: DeviceType,
    pin: number,
  ) => {
    const room = rooms[roomIndex];
    if (!room) {
      return false;
    }
    if (
      rooms.some(entry =>
        entry.devices.some(device => device.pin === pin),
      )
    ) {
      Alert.alert('PIN deja utilise', `Le PIN ${pin} pilote deja un autre module.`);
      return false;
    }
    const nextDevice: Device = {pin, status: false, type};
    if (isDemo) {
      setRooms(previous =>
        previous.map((entry, index) =>
          index === roomIndex
            ? {...entry, devices: [...entry.devices, nextDevice]}
            : entry,
        ),
      );
      return true;
    }
    if (!room.id) {
      Alert.alert('Piece non synchronisee', 'Reconnecte-toi avant d ajouter un module.');
      return false;
    }
    try {
      const savedDevice = await request('/devices', {
        body: JSON.stringify({
          pin,
          room: {id: room.id},
          state: type === 'light' ? 'OFF' : 'CLOSED',
          type: type.toUpperCase(),
        }),
        method: 'POST',
      });
      setRooms(previous =>
        previous.map((entry, index) =>
          index === roomIndex
            ? {
                ...entry,
                devices: [...entry.devices, {...nextDevice, id: savedDevice?.id}],
              }
            : entry,
        ),
      );
      return true;
    } catch (error) {
      Alert.alert('Association impossible', error instanceof Error ? error.message : '');
      return false;
    }
  };

  const removeDevice = async (roomIndex: number, deviceIndex: number) => {
    const device = rooms[roomIndex]?.devices[deviceIndex];
    if (!device) {
      return false;
    }
    try {
      if (!isDemo) {
        if (!device.id) {
          throw new Error('Ce module n est pas synchronise avec le backend.');
        }
        await request(`/devices/${device.id}`, {method: 'DELETE'});
      }
      setRooms(previous =>
        previous.map((room, index) =>
          index === roomIndex
            ? {
                ...room,
                devices: room.devices.filter((_, indexInRoom) => indexInRoom !== deviceIndex),
              }
            : room,
        ),
      );
      return true;
    } catch (error) {
      Alert.alert('Suppression impossible', error instanceof Error ? error.message : '');
      return false;
    }
  };

  const removeRoom = async (roomIndex: number) => {
    const room = rooms[roomIndex];
    if (!room) {
      return false;
    }
    try {
      if (!isDemo) {
        if (!room.id) {
          throw new Error('Cette piece n est pas synchronisee avec le backend.');
        }
        await request(`/rooms/${room.id}`, {method: 'DELETE'});
      }
      setRooms(previous => previous.filter((_, index) => index !== roomIndex));
      setSelectedRoom('all');
      return true;
    } catch (error) {
      Alert.alert('Suppression impossible', error instanceof Error ? error.message : '');
      return false;
    }
  };

  const logout = () => {
    setBackendStatus('unknown');
    setIsDemo(false);
    setLogs([]);
    setRooms([newRoom()]);
    setScreen('login');
    setShowServer(true);
    setUser(null);
  };

  return (
    <ThemeContext.Provider value={theme}>
    <SafeAreaProvider>
      <SafeAreaView style={[styles.safe, theme === 'light' && styles.safeLight]}>
        <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme === 'light' ? '#fff8f2' : '#21191d'} />
        {screen === 'dashboard' && user ? (
          <DashboardExperience
            activeDevices={activeDevices}
            addDevice={addDevice}
            addRoom={addRoom}
            backendStatus={backendStatus}
            busyDevice={busyDevice}
            isDemo={isDemo}
            logs={logs}
            logout={logout}
            apiBase={apiBase}
            rooms={rooms}
            removeDevice={removeDevice}
            removeRoom={removeRoom}
            runScene={runScene}
            selectedRoom={selectedRoom}
            setApiBase={setApiBase}
            setSelectedRoom={setSelectedRoom}
            share={() =>
              Share.share({
                message: `Rejoins SmartHome. ID maison: ${user.houseId}`,
              })
            }
            toggleDevice={toggleDevice}
            testBackend={testBackend}
            theme={theme}
            toggleTheme={() => setTheme(value => value === 'dark' ? 'light' : 'dark')}
            user={user}
          />
        ) : (
          <ScrollView
            contentContainerStyle={[styles.page, theme === 'light' && styles.pageLight]}
            persistentScrollbar
            showsVerticalScrollIndicator>
            <Animated.View
              style={[styles.pageContent, {
                opacity: reveal,
                transform: [
                  {
                    translateY: reveal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              }]}>
              <Hero
                activeDevices={activeDevices}
                backendStatus={backendStatus}
                dashboard={false}
                demo={isDemo}
                totalDevices={totalDevices}
              />
              <ServerPanel
                apiBase={apiBase}
                backendStatus={backendStatus}
                busy={busy}
                onChange={setApiBase}
                onToggle={() => setShowServer(value => !value)}
                show={showServer}
                testBackend={testBackend}
              />
              {message ? <Text style={styles.message}>{message}</Text> : null}
              {screen === 'login' ? (
                <LoginPanel
                  busy={busy}
                  email={email}
                  onEmail={setEmail}
                  onPassword={setPassword}
                  openRegister={() => setScreen('register')}
                  password={password}
                  startDemo={startDemo}
                  submit={login}
                />
              ) : null}
              {screen === 'register' ? (
                <RegisterPanel
                  busy={busy}
                  form={register}
                  rooms={rooms}
                  setForm={setRegister}
                  setRooms={setRooms}
                  submit={createAccount}
                  toLogin={() => setScreen('login')}
                />
              ) : null}
              <ThemeButton theme={theme} toggleTheme={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} />
            </Animated.View>
          </ScrollView>
        )}
        {showSplash ? <SplashIntro onDone={() => setShowSplash(false)} theme={theme} /> : null}
      </SafeAreaView>
    </SafeAreaProvider>
    </ThemeContext.Provider>
  );
};

const Hero = ({activeDevices, backendStatus, dashboard, demo, logout, totalDevices}: any) => {
  const light = useLightTheme();
  return <ImageBackground source={require('./assets/smart-home-header.png')} style={[styles.hero, light && styles.heroLight]} imageStyle={styles.heroImage}>
    <View style={styles.heroContent}>
      <View style={styles.brand}><Image accessibilityLabel="Logo SmartHome" source={require('./assets/smarthome-logo.png')} style={styles.brandLogo} /><Text style={styles.brandText}>SmartHome Mobile</Text></View>
      <Text style={styles.heroTitle}>{dashboard ? 'Maison connectee' : 'Controle Arduino'}</Text>
      <Text style={styles.heroStatus}>EN DIRECT - {demo ? 'Simulation locale active' : dashboard ? 'Systeme synchronise' : 'Console domotique'}</Text>
      <View style={styles.heroMetrics}>
        <Metric Icon={Cpu} label="Modules" value={`${totalDevices}`} />
        <Metric Icon={Gauge} label="Actifs" value={`${activeDevices}`} />
        <Metric Icon={Wifi} label="Reseau" value={backendStatus === 'offline' ? 'OFF' : 'OK'} />
      </View>
    </View>
    {logout ? <Pressable onPress={logout} style={styles.logout}><LogOut color="#ffffff" size={19} /></Pressable> : null}
  </ImageBackground>;
};

const ServerPanel = ({apiBase, backendStatus, busy, onChange, onToggle, show, testBackend}: any) => {
  const light = useLightTheme();
  return (
  <Glass>
    <Pressable onPress={onToggle} style={styles.spaceBetween}>
      <View style={styles.inline}><Server color="#f28c6b" size={19} /><View><Text style={[styles.panelTitle, light && styles.panelTitleLight]}>Connexion serveur</Text><Text style={[styles.meta, light && styles.metaLight]}>{backendStatus === 'online' ? 'Backend detecte' : 'Configuration reseau'}</Text></View></View>
      {show ? <ChevronUp color="#d8c4bb" /> : <ChevronDown color="#d8c4bb" />}
    </Pressable>
    {show ? <View style={styles.serverBody}><TextInput onChangeText={onChange} style={[styles.input, light && styles.inputLight]} value={apiBase} /><Pressable onPress={testBackend} style={styles.iconButton}>{busy ? <ActivityIndicator color="#fff" /> : <Zap color="#fff" />}</Pressable></View> : null}
  </Glass>
  );
};

const LoginPanel = ({busy, email, onEmail, onPassword, openRegister, password, startDemo, submit}: any) => {
  const light = useLightTheme();
  return (
    <Glass>
      <Text style={[styles.sectionTitle, light && styles.sectionTitleLight]}>Connexion</Text>
      <Text style={[styles.meta, light && styles.metaLight]}>Accede a ta console de pilotage.</Text>
      <Field Icon={Mail} label="Email" onChangeText={onEmail} value={email} />
      <Field Icon={LockKeyhole} label="Mot de passe" onChangeText={onPassword} secureTextEntry value={password} />
      <ActionButton label={busy ? 'Connexion...' : 'Se connecter'} onPress={submit} />
      <Pressable onPress={startDemo} style={styles.demoButton}><Play color="#f28c6b" /><Text style={styles.demoText}>Lancer la demonstration</Text></Pressable>
      <Pressable onPress={openRegister}><Text style={styles.link}>Creer un compte ou rejoindre une maison</Text></Pressable>
    </Glass>
  );
};

const RegisterPanel = ({busy, form, rooms, setForm, setRooms, submit, toLogin}: any) => {
  const light = useLightTheme();
  return (
    <Glass>
      <View style={styles.inline}><ShieldCheck color="#f28c6b" /><Text style={[styles.sectionTitle, light && styles.sectionTitleLight]}>Inscription</Text></View>
      {['prenom', 'nom', 'email', 'password', 'nomMaison', 'houseId'].map(key => (
        <Field Icon={key === 'email' ? Mail : key === 'password' ? LockKeyhole : key === 'nomMaison' ? RadioTower : key === 'houseId' ? Server : ShieldCheck} key={key} label={key === 'houseId' ? 'ID maison invitation (optionnel)' : key} onChangeText={(value: string) => setForm({...form, [key]: value})} secureTextEntry={key === 'password'} value={form[key]} />
      ))}
      {!form.houseId ? rooms.map((room: Room, index: number) => (
        <Field Icon={DoorOpen} key={`${index}`} label={`Piece ${index + 1}`} onChangeText={(value: string) => setRooms(rooms.map((item: Room, itemIndex: number) => itemIndex === index ? {...item, roomName: value} : item))} value={room.roomName} />
      )) : null}
      {!form.houseId ? <Pressable onPress={() => setRooms([...rooms, newRoom()])} style={styles.demoButton}><Plus color="#f28c6b" /><Text style={styles.demoText}>Ajouter une piece</Text></Pressable> : null}
      <ActionButton label={busy ? 'Creation...' : 'Finaliser'} onPress={submit} />
      <Pressable onPress={toLogin}><Text style={styles.link}>J ai deja un compte</Text></Pressable>
    </Glass>
  );
};

const Glass = ({children}: {children: React.ReactNode}) => {
  const light = useLightTheme();
  return <View style={[styles.glass, light && styles.glassLight]}>{children}</View>;
};
const Field = ({Icon = ShieldCheck, label, ...props}: any) => {
  const light = useLightTheme();
  return <View style={styles.field}><Text style={[styles.label, light && styles.labelLight]}>{label}</Text><View style={[styles.inputShell, light && styles.inputLight]}><Icon color={light ? '#9c6155' : '#7893a1'} size={18} /><TextInput placeholderTextColor={light ? '#ae8e86' : '#607481'} style={[styles.fieldInput, light && styles.fieldInputLight]} {...props} /></View></View>;
};
const ActionButton = ({label, onPress}: {label: string; onPress: () => void}) => <Pressable onPress={onPress} style={styles.action}><Text style={styles.actionText}>{label}</Text><ArrowRight color="#fff" /></Pressable>;
const Metric = ({Icon, label, value}: {Icon: LucideIcon; label: string; value: string}) => <View style={styles.metric}><Icon color="#f28c6b" size={17} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
const ThemeButton = ({theme, toggleTheme}: {theme: AppTheme; toggleTheme: () => void}) => (
  <Pressable accessibilityLabel={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'} onPress={toggleTheme} style={styles.themeButton}>
    {theme === 'dark' ? <Sun color="#f28c6b" size={18} /> : <Moon color="#a94d43" size={18} />}
    <Text style={styles.themeButtonText}>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</Text>
  </Pressable>
);
const SplashIntro = ({onDone, theme}: {onDone: () => void; theme: AppTheme}) => {
  const [visibleLetters, setVisibleLetters] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const name = 'SmartHome';

  useEffect(() => {
    const writing = setInterval(() => {
      setVisibleLetters(value => Math.min(value + 1, name.length));
    }, 95);
    const leaving = setTimeout(() => {
      clearInterval(writing);
      Animated.timing(fade, {
        duration: 340,
        toValue: 0,
        useNativeDriver: true,
      }).start(onDone);
    }, 1500);
    return () => {
      clearInterval(writing);
      clearTimeout(leaving);
    };
  }, [fade, onDone]);

  return (
    <Animated.View style={[styles.splash, theme === 'light' && styles.splashLight, {opacity: fade}]}>
      <Image accessibilityLabel="Logo SmartHome" source={require('./assets/smarthome-logo.png')} style={styles.splashLogo} />
      <Text style={[styles.splashName, theme === 'light' && styles.splashNameLight]}>
        {name.slice(0, visibleLetters)}
        <Text style={styles.splashCursor}>|</Text>
      </Text>
      <Text style={styles.splashTagline}>La maison qui vous ressemble</Text>
    </Animated.View>
  );
};
const now = () => new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
const styles = StyleSheet.create({
  action:{alignItems:'center',backgroundColor:'#a94d43',borderRadius:8,flexDirection:'row',gap:8,justifyContent:'center',marginTop:15,minHeight:52},actionText:{color:'#fff',fontSize:16,fontWeight:'800'},
  bandTitle:{color:'#fff',fontSize:21,fontWeight:'800',marginTop:3},brand:{alignItems:'center',flexDirection:'row',gap:7},brandText:{color:'#f28c6b',fontSize:14,fontWeight:'800',textTransform:'uppercase'},
  brandLogo:{borderRadius:7,height:28,width:28},dashboard:{gap:16},demoBadge:{alignSelf:'flex-start',backgroundColor:'rgba(255,192,91,.15)',borderRadius:6,color:'#ffc66d',fontWeight:'800',marginTop:10,padding:7},demoButton:{alignItems:'center',borderColor:'rgba(242,140,107,.50)',borderRadius:8,borderWidth:1,flexDirection:'row',gap:8,justifyContent:'center',marginTop:12,minHeight:50},demoText:{color:'#f28c6b',fontSize:15,fontWeight:'800'},
  deviceButton:{backgroundColor:'rgba(242,140,107,.12)',borderRadius:8,padding:12},deviceButtonText:{color:'#f8be8d',fontWeight:'800'},deviceName:{color:'#fff4eb',fontSize:16,fontWeight:'800'},deviceRow:{alignItems:'center',borderTopColor:'rgba(242,140,107,.15)',borderTopWidth:1,flexDirection:'row',gap:10,marginTop:12,minHeight:67,paddingTop:10},
  field:{gap:7,marginTop:14},fieldInput:{color:'#fff4eb',flex:1,fontSize:16,minHeight:48},filter:{backgroundColor:'rgba(13,31,49,.94)',borderColor:'rgba(117,231,216,.2)',borderRadius:8,borderWidth:1,padding:12},filterActive:{backgroundColor:'#a94d43',borderColor:'#f28c6b'},filterRow:{flexDirection:'row',gap:8},filterText:{color:'#d8c4bb',fontWeight:'800'},filterTextActive:{color:'#fff'},
  glass:{backgroundColor:'rgba(13,31,49,.94)',borderColor:'rgba(242,140,107,.22)',borderRadius:8,borderWidth:1,padding:16},grow:{flex:1},
  homeBrand:{color:'#f28c6b',fontSize:12,fontWeight:'800'},homeDemo:{backgroundColor:'rgba(255,192,91,.18)',borderRadius:10,color:'#ffc66d',fontSize:9,fontWeight:'800',marginLeft:'auto',paddingHorizontal:8,paddingVertical:5},homeExperience:{backgroundColor:'#21191d',flex:1,overflow:'hidden'},homeIconButton:{alignItems:'center',backgroundColor:'rgba(9,29,44,.80)',borderColor:'rgba(242,140,107,.22)',borderRadius:8,borderWidth:1,height:38,justifyContent:'center',width:38},homeLive:{alignItems:'center',backgroundColor:'rgba(9,29,44,.80)',borderColor:'rgba(242,140,107,.22)',borderRadius:14,borderWidth:1,flexDirection:'row',gap:5,paddingHorizontal:8,paddingVertical:6},homeLiveDot:{backgroundColor:'#80aa85',borderRadius:4,height:7,width:7},homeLiveText:{color:'#f8be8d',fontSize:8,fontWeight:'800'},homeName:{color:'#fff',fontSize:19,fontWeight:'800',marginTop:3},homePrompt:{left:18,position:'absolute',top:94},homePromptText:{color:'#d8c4bb',fontSize:12,fontWeight:'700',marginTop:4},homePromptTitle:{color:'#fff',fontSize:27,fontWeight:'800',marginTop:3},homeTelemetry:{alignItems:'center',backgroundColor:'rgba(3,15,25,.76)',borderColor:'rgba(242,140,107,.20)',borderRadius:8,borderWidth:1,bottom:18,flexDirection:'row',left:18,paddingHorizontal:12,paddingVertical:9,position:'absolute',right:18},homeTelemetryDivider:{backgroundColor:'rgba(242,140,107,.22)',height:22,marginHorizontal:10,width:1},homeTelemetryLabel:{color:'#d8c4bb',fontSize:10,fontWeight:'800',marginLeft:5,textTransform:'uppercase'},homeTelemetryValue:{color:'#f28c6b',fontSize:17,fontWeight:'800'},homeTopBar:{alignItems:'center',flexDirection:'row',justifyContent:'space-between',left:18,position:'absolute',right:18,top:17},
  hero:{borderColor:'rgba(242,140,107,.32)',borderRadius:8,borderWidth:1,minHeight:246,overflow:'hidden',padding:18},heroContent:{flex:1,justifyContent:'flex-end'},heroImage:{borderRadius:8},heroMetrics:{backgroundColor:'rgba(2,13,25,.82)',borderColor:'rgba(242,140,107,.35)',borderRadius:8,borderWidth:1,flexDirection:'row',marginTop:16,padding:10},heroStatus:{color:'#f5d8ca',fontSize:14,fontWeight:'800',marginTop:9},heroTitle:{color:'#fff',fontSize:31,fontWeight:'800',marginTop:6},
  iconButton:{alignItems:'center',backgroundColor:'#a94d43',borderRadius:8,justifyContent:'center',minHeight:46,minWidth:46},inline:{alignItems:'center',flexDirection:'row',gap:9},input:{backgroundColor:'rgba(2,13,25,.65)',borderColor:'rgba(117,231,216,.2)',borderRadius:8,borderWidth:1,color:'#fff4eb',flex:1,fontSize:16,minHeight:48,paddingHorizontal:12},inputShell:{alignItems:'center',backgroundColor:'rgba(2,13,25,.65)',borderColor:'rgba(117,231,216,.2)',borderRadius:8,borderWidth:1,flexDirection:'row',gap:9,paddingHorizontal:12},inspector:{backgroundColor:'#432e30',borderColor:'#765155',borderRadius:8,borderWidth:1,padding:14},inspectorTitle:{color:'#fff',fontSize:19,fontWeight:'800',marginTop:3},
  kicker:{color:'#f28c6b',fontSize:11,fontWeight:'800',textTransform:'uppercase'},label:{color:'#d8c4bb',fontSize:13,fontWeight:'800'},link:{color:'#f28c6b',fontSize:15,fontWeight:'800',paddingVertical:17,textAlign:'center'},log:{borderTopColor:'rgba(242,140,107,.14)',borderTopWidth:1,color:'#f3dfd6',fontWeight:'700',marginTop:12,paddingTop:12},logout:{alignItems:'center',backgroundColor:'rgba(2,13,25,.72)',borderRadius:8,justifyContent:'center',minHeight:42,minWidth:42,position:'absolute',right:14,top:14},
  message:{backgroundColor:'rgba(255,192,91,.12)',borderColor:'rgba(255,192,91,.35)',borderRadius:8,borderWidth:1,color:'#ffc66d',fontWeight:'700',padding:12},meta:{color:'#b6a49d',fontSize:13,fontWeight:'700',marginTop:5},metric:{alignItems:'center',flex:1,gap:3},metricLabel:{color:'#b6a49d',fontSize:10,fontWeight:'800',textTransform:'uppercase'},metricValue:{color:'#fff',fontSize:18,fontWeight:'800'},module:{backgroundColor:'#493236',borderColor:'#69474a',borderRadius:8,borderWidth:1,minHeight:115,padding:11,width:142},moduleBand:{backgroundColor:'#38272a',marginHorizontal:-16,padding:16},moduleRow:{flexDirection:'row',gap:9,marginTop:12},moduleStatus:{color:'#f28c6b',fontSize:9,fontWeight:'800'},moduleTitle:{color:'#fff',fontSize:16,fontWeight:'800',marginTop:14},
  roomSheet:{backgroundColor:'rgba(8,27,42,.97)',borderColor:'rgba(242,140,107,.30)',borderRadius:8,borderWidth:1,bottom:18,left:18,padding:15,position:'absolute',right:18},sheetActivity:{alignItems:'center',borderTopColor:'rgba(242,140,107,.16)',borderTopWidth:1,flexDirection:'row',gap:7,marginTop:13,paddingTop:11},sheetActivityText:{color:'#b6a49d',fontSize:11,fontWeight:'700'},sheetClose:{alignItems:'center',backgroundColor:'rgba(242,140,107,.10)',borderRadius:8,height:36,justifyContent:'center',width:36},sheetModules:{flexDirection:'row',gap:10,marginTop:13},sheetModule:{backgroundColor:'rgba(117,231,216,.06)',borderColor:'rgba(242,140,107,.16)',borderRadius:8,borderWidth:1,flex:1,minHeight:132,padding:11},sheetModuleActive:{backgroundColor:'rgba(65,214,158,.14)',borderColor:'rgba(242,140,107,.42)'},sheetModuleIcon:{alignItems:'center',backgroundColor:'rgba(242,140,107,.10)',borderRadius:20,height:40,justifyContent:'center',width:40},sheetModuleIconActive:{backgroundColor:'#f28c6b'},sheetModuleMeta:{color:'#b6a49d',fontSize:10,fontWeight:'700',marginTop:8},sheetModuleName:{color:'#fff',fontSize:15,fontWeight:'800',marginTop:4},sheetModuleType:{color:'#f28c6b',fontSize:9,fontWeight:'800',marginTop:10},sheetTitle:{color:'#fff',fontSize:23,fontWeight:'800',marginTop:3},
  page:{backgroundColor:'#21191d',padding:16,paddingBottom:28},pageContent:{gap:16},panelTitle:{color:'#fff4eb',fontSize:16,fontWeight:'800'},profileName:{color:'#fff',fontSize:21,fontWeight:'800'},roomTitle:{color:'#fff',fontSize:20,fontWeight:'800'},safe:{backgroundColor:'#21191d',flex:1},sectionTitle:{color:'#fff',fontSize:22,fontWeight:'800'},serverBody:{alignItems:'center',borderTopColor:'rgba(242,140,107,.16)',borderTopWidth:1,flexDirection:'row',gap:10,marginTop:14,paddingTop:14},spaceBetween:{alignItems:'center',flexDirection:'row',justifyContent:'space-between'},stats:{borderTopColor:'rgba(242,140,107,.16)',borderTopWidth:1,flexDirection:'row',marginTop:15,paddingTop:14},
  fieldInputLight:{color:'#4d3532'},glassLight:{backgroundColor:'rgba(255,250,246,.96)',borderColor:'rgba(169,77,67,.20)'},heroLight:{borderColor:'rgba(169,77,67,.34)'},inputLight:{backgroundColor:'#fffdfb',borderColor:'rgba(169,77,67,.22)',color:'#4d3532'},labelLight:{color:'#755750'},metaLight:{color:'#8b6b63'},pageLight:{backgroundColor:'#fff8f2'},panelTitleLight:{color:'#4d3532'},safeLight:{backgroundColor:'#fff8f2'},sectionTitleLight:{color:'#4d3532'},splash:{alignItems:'center',backgroundColor:'#21191d',bottom:0,justifyContent:'center',left:0,position:'absolute',right:0,top:0,zIndex:20},splashCursor:{color:'#f8be8d'},splashLight:{backgroundColor:'#fff8f2'},splashLogo:{borderRadius:18,height:92,width:92},splashName:{color:'#fff4eb',fontSize:38,fontWeight:'800',marginTop:17},splashNameLight:{color:'#4d3532'},splashTagline:{color:'#c9a092',fontSize:13,fontWeight:'700',marginTop:9},themeButton:{alignItems:'center',borderColor:'rgba(242,140,107,.35)',borderRadius:8,borderWidth:1,flexDirection:'row',gap:8,justifyContent:'center',minHeight:48},themeButtonText:{color:'#f28c6b',fontSize:14,fontWeight:'800'},
});

export default App;
