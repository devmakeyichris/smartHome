import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import LoginPanel from '../components/auth/LoginPanel';
import RegisterPanel from '../components/auth/RegisterPanel';
import DashboardExperience from '../components/DashboardExperience';
import {ThemeButton} from '../components/common/FormControls';
import Hero from '../components/common/Hero';
import ServerPanel from '../components/common/ServerPanel';
import SplashIntro from '../components/common/SplashIntro';
import {defaultApi, demoRooms, isTest} from '../config/appConfig';
import {ThemeContext} from '../config/theme';
import {
  createDevice,
  createRoom,
  deleteDevice,
  deleteRoom,
  loginUser,
  pingBackend,
  registerUser,
  updateDeviceState,
} from '../services/smartHomeApi';
import type {
  AppTheme,
  BackendStatus,
  Device,
  DeviceType,
  LogEntry,
  Profile,
  RegisterForm,
  Room,
  SceneMode,
  Screen,
} from '../types/smartHome';
import {connectedRoom, newRoom, normalizeRooms} from '../utils/rooms';
import {now} from '../utils/time';

const HomeScreen = () => {
  const [apiBase, setApiBase] = useState(defaultApi);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('unknown');
  const [busy, setBusy] = useState(false);
  const [busyDevice, setBusyDevice] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [register, setRegister] = useState<RegisterForm>({
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
      const data = await loginUser(apiBase, email, password);
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
      const data = await registerUser(apiBase, register, configuredRooms);
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
      await pingBackend(apiBase);
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
      const response = await updateDeviceState(apiBase, device.id, state);
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
      const savedRoom = await createRoom(apiBase, user.houseId, name);
      if (!savedRoom?.id) {
        throw new Error('Le backend n a pas retourne l identifiant de la piece.');
      }
      const savedDevices = await Promise.all(
        nextRoom.devices.map(device =>
          createDevice(apiBase, savedRoom.id, device.type, device.pin),
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
      const savedDevice = await createDevice(apiBase, room.id, type, pin);
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
        await deleteDevice(apiBase, device.id);
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
        await deleteRoom(apiBase, room.id);
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

const styles = StyleSheet.create({
  message: {
    backgroundColor: 'rgba(255,192,91,.12)',
    borderColor: 'rgba(255,192,91,.35)',
    borderRadius: 8,
    borderWidth: 1,
    color: '#ffc66d',
    fontWeight: '700',
    padding: 12,
  },
  page: {
    backgroundColor: '#21191d',
    padding: 16,
    paddingBottom: 28,
  },
  pageContent: {
    gap: 16,
  },
  pageLight: {
    backgroundColor: '#fff8f2',
  },
  safe: {
    backgroundColor: '#21191d',
    flex: 1,
  },
  safeLight: {
    backgroundColor: '#fff8f2',
  },
});

export default HomeScreen;
