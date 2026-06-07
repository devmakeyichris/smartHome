import React, {useState} from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleUserRound,
  CircuitBoard,
  CreditCard,
  DoorOpen,
  History,
  Home,
  KeyRound,
  Lightbulb,
  LogOut,
  MapPin,
  Moon,
  Plus,
  Power,
  Send,
  Settings,
  ShieldCheck,
  ShieldOff,
  Sun,
  Trash2,
  Wifi,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import SmartHomeScene from './SmartHomeScene';
import type {
  AccessBadge,
  ActivityFilter,
  AppTheme,
  BackendStatus,
  DashboardTab,
  Device,
  DeviceType,
  LogEntry,
  Profile,
  Room,
  SceneMode,
} from '../types/smartHome';

type DashboardExperienceProps = {
  activeDevices: number;
  addDevice: (roomIndex: number, type: DeviceType, pin: number) => Promise<boolean>;
  addRoom: (roomName: string) => Promise<boolean>;
  apiBase: string;
  backendStatus: BackendStatus;
  busyDevice: string | null;
  isDemo: boolean;
  logs: LogEntry[];
  logout: () => void;
  rooms: Room[];
  removeDevice: (roomIndex: number, deviceIndex: number) => Promise<boolean>;
  removeRoom: (roomIndex: number) => Promise<boolean>;
  runScene: (mode: SceneMode) => void;
  selectedRoom: string;
  setApiBase: (value: string) => void;
  setSelectedRoom: (roomName: string) => void;
  share: () => void;
  testBackend: () => void;
  theme: AppTheme;
  toggleTheme: () => void;
  toggleDevice: (roomIndex: number, deviceIndex: number) => void;
  user: Profile;
};

const DashboardExperience = ({
  activeDevices,
  addDevice,
  addRoom,
  apiBase,
  backendStatus,
  busyDevice,
  isDemo,
  logs,
  logout,
  rooms,
  removeDevice,
  removeRoom,
  runScene,
  selectedRoom,
  setApiBase,
  setSelectedRoom,
  share,
  testBackend,
  theme,
  toggleTheme,
  toggleDevice,
  user,
}: DashboardExperienceProps) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [managedRoomName, setManagedRoomName] = useState<string | null>(null);
  const [newDevicePin, setNewDevicePin] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>('light');
  const [newRoomName, setNewRoomName] = useState('');
  const [badges, setBadges] = useState<AccessBadge[]>([
    {id: 'main', label: 'Badge principal', owner: user.prenom || 'Proprietaire', status: 'Autorise'},
    ...(isDemo ? [{id: 'guest', label: 'Badge invite', owner: 'Invite maison', status: 'Autorise' as const}] : []),
  ]);
  const roomIndex = rooms.findIndex(room => room.roomName === selectedRoom);
  const activeRoom = roomIndex >= 0 ? rooms[roomIndex] : null;
  const managedRoomIndex = rooms.findIndex(room => room.roomName === managedRoomName);
  const managedRoom = managedRoomIndex >= 0 ? rooms[managedRoomIndex] : null;
  const lastLog = logs[0];
  const filteredLogs = logs.filter(log =>
    activityFilter === 'all'
      ? true
      : activityFilter === 'light'
        ? log.action.toLowerCase().includes('lumiere')
        : log.action.toLowerCase().includes('porte'),
  );
  const openTab = (tab: DashboardTab) => {
    setSelectedRoom('all');
    setActiveTab(tab);
  };
  const addBadge = () =>
    setBadges(previous => [
      ...previous,
      {
        id: `badge-${Date.now()}`,
        label: `Nouveau badge ${previous.length + 1}`,
        owner: 'A scanner avec le lecteur RFID',
        status: 'A associer',
      },
    ]);
  const removeBadge = (id: string) =>
    setBadges(previous => previous.filter(badge => badge.id !== id));
  const toggleBadge = (id: string) =>
    setBadges(previous => previous.map(badge =>
      badge.id === id
        ? {...badge, status: badge.status === 'Autorise' ? 'Suspendu' : 'Autorise'}
        : badge,
    ));
  const submitRoom = async () => {
    if (!newRoomName.trim()) {
      return;
    }
    const name = newRoomName.trim();
    if (await addRoom(name)) {
      setManagedRoomName(name);
      setNewRoomName('');
    }
  };
  const submitDevice = async () => {
    const pin = Number(newDevicePin);
    if (!Number.isInteger(pin) || pin < 0) {
      Alert.alert('PIN invalide', 'Saisis un numero de PIN Arduino valide.');
      return;
    }
    if (await addDevice(managedRoomIndex, newDeviceType, pin)) {
      setNewDevicePin('');
    }
  };
  const confirmRemoveDevice = (deviceIndex: number) => {
    if (!managedRoom) {
      return;
    }
    Alert.alert(
      'Supprimer ce module ?',
      'Il ne sera plus pilote depuis cette piece.',
      [
        {text: 'Annuler'},
        {onPress: () => removeDevice(managedRoomIndex, deviceIndex), style: 'destructive', text: 'Supprimer'},
      ],
    );
  };
  const confirmRemoveRoom = () => {
    if (!managedRoom) {
      return;
    }
    Alert.alert(
      `Supprimer ${managedRoom.roomName} ?`,
      'Les modules associes a cette piece seront egalement retires.',
      [
        {text: 'Annuler'},
        {
          onPress: async () => {
            if (await removeRoom(managedRoomIndex)) {
              setManagedRoomName(null);
            }
          },
          style: 'destructive',
          text: 'Supprimer',
        },
      ],
    );
  };
  const openRoom = (roomName: string) => {
    setActiveTab('home');
    setSelectedRoom(roomName);
  };

  return (
    <View style={[styles.root, theme === 'light' && styles.rootLight]}>
      {activeTab === 'home' ? (
        <>
          <SmartHomeScene
            activeDevices={activeDevices}
            immersive
            rooms={rooms}
            selectedRoom={selectedRoom}
            theme={theme}
            onSelectRoom={setSelectedRoom}
          />
          <View style={styles.homePrompt}>
            <Text style={styles.kicker}>Maison vivante</Text>
            <Text style={[styles.homeTitle, theme === 'light' && styles.homeTitleLight]}>
              {activeRoom ? activeRoom.roomName : `Bonjour ${user.prenom || ''}`}
            </Text>
            <Text style={[styles.homeText, theme === 'light' && styles.homeTextLight]}>
              {activeRoom
                ? 'Les commandes de cette piece sont ouvertes.'
                : 'Touchez une piece ou choisissez une ambiance.'}
            </Text>
          </View>
          {!activeRoom ? (
            <>
              <View style={styles.roomExplorer}>
                <Text style={styles.roomExplorerTitle}>Toutes les pieces</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.roomExplorerRow}>
                    {rooms.map((room, index) => (
                      <Pressable
                        accessibilityLabel={`Ouvrir ${room.roomName}`}
                        key={`${room.roomName}-${index}`}
                        onPress={() => setSelectedRoom(room.roomName)}
                        style={[styles.roomShortcut, index >= 3 && styles.roomShortcutExtension]}>
                        <MapPin color={index >= 3 ? '#f8be8d' : '#80aa85'} size={15} />
                        <Text style={styles.roomShortcutName}>{room.roomName}</Text>
                        <Text style={styles.roomShortcutMeta}>
                          {room.devices.filter(device => device.status).length}/{room.devices.length}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <View style={styles.sceneStrip}>
                <SceneButton Icon={Sun} label="Retour" onPress={() => runScene('welcome')} />
                <SceneButton Icon={Moon} label="Nuit" onPress={() => runScene('night')} />
                <SceneButton Icon={Power} label="Depart" onPress={() => runScene('away')} />
              </View>
            </>
          ) : null}
          {activeRoom ? (
            <View style={styles.roomSheet}>
              <View style={styles.spaceBetween}>
                <View>
                  <Text style={styles.kicker}>Piece selectionnee</Text>
                  <Text style={styles.sheetTitle}>{activeRoom.roomName}</Text>
                </View>
                <Pressable accessibilityLabel="Fermer la piece" onPress={() => setSelectedRoom('all')} style={styles.iconButton}>
                  <X color="#f4c7ad" size={20} />
                </Pressable>
              </View>
              {activeRoom.devices.length ? <View style={styles.moduleRow}>
                {activeRoom.devices.slice(0, 2).map((device, deviceIndex) => (
                  <Pressable
                    accessibilityLabel={deviceAction(device)}
                    disabled={busyDevice === `${roomIndex}-${deviceIndex}`}
                    key={`${device.type}-${device.pin}`}
                    onPress={() => toggleDevice(roomIndex, deviceIndex)}
                    style={[styles.module, device.status && styles.moduleActive]}>
                    <View style={[styles.moduleIcon, device.status && styles.moduleIconActive]}>
                      {device.type === 'light' ? (
                        <Lightbulb color={device.status ? '#4a291f' : '#bea99f'} size={24} />
                      ) : (
                        <DoorOpen color={device.status ? '#4a291f' : '#bea99f'} size={24} />
                      )}
                    </View>
                    <Text style={styles.moduleType}>{device.type === 'light' ? 'LUMIERE' : 'PORTE'}</Text>
                    <Text style={styles.moduleName}>{deviceAction(device)}</Text>
                    <Text style={styles.moduleMeta}>
                      PIN {device.pin} - {busyDevice === `${roomIndex}-${deviceIndex}` ? 'SYNC' : device.status ? 'ACTIF' : 'INACTIF'}
                    </Text>
                  </Pressable>
                ))}
              </View> : (
                <Text style={styles.roomEmptyText}>Cette piece attend son premier module Arduino.</Text>
              )}
              <Pressable accessibilityLabel={`Configurer ${activeRoom.roomName}`} onPress={() => {
                setManagedRoomName(activeRoom.roomName);
                openTab('settings');
              }} style={styles.configureRoomAction}>
                <CircuitBoard color="#f28c6b" size={16} />
                <Text style={styles.configureRoomText}>
                  {activeRoom.devices.length > 2 ? `${activeRoom.devices.length} modules - Configurer` : 'Configurer les modules'}
                </Text>
              </Pressable>
              <View style={styles.latestActivity}>
                <Activity color="#f28c6b" size={15} />
                <Text style={styles.activityMeta}>
                  {lastLog ? `${lastLog.action} - ${lastLog.room} - ${lastLog.time}` : 'Aucune activite recente'}
                </Text>
              </View>
            </View>
          ) : null}
        </>
      ) : null}

      {activeTab === 'activity' ? (
        <DashboardPage eyebrow="Journal de maison" theme={theme} title="Activite">
          <View style={styles.filterRow}>
            <FilterButton active={activityFilter === 'all'} label="Tout" onPress={() => setActivityFilter('all')} />
            <FilterButton active={activityFilter === 'light'} label="Lumieres" onPress={() => setActivityFilter('light')} />
            <FilterButton active={activityFilter === 'door'} label="Portes" onPress={() => setActivityFilter('door')} />
          </View>
          {filteredLogs.length ? filteredLogs.map(log => (
            <View key={log.id} style={[styles.listRow, theme === 'light' && styles.listRowLight]}>
              <View style={styles.listIcon}><Activity color="#f28c6b" size={17} /></View>
              <View style={styles.grow}>
                <Text style={[styles.listTitle, theme === 'light' && styles.listTitleLight]}>{log.action}</Text>
                <Text style={styles.activityMeta}>{log.room} - {log.time}</Text>
              </View>
              <CheckCircle2 color="#80aa85" size={18} />
            </View>
          )) : <EmptyState Icon={History} text="Les activites recentes apparaitront ici." />}
        </DashboardPage>
      ) : null}

      {activeTab === 'access' ? (
        <DashboardPage eyebrow="Entree securisee" theme={theme} title="Acces RFID">
          <View style={styles.rfidHero}>
            <View style={styles.rfidPulse}><KeyRound color="#fff4eb" size={29} /></View>
            <Text style={styles.rfidTitle}>Badges de la famille</Text>
            <Text style={styles.rfidText}>Les passages autorises sont visibles en un coup d'oeil.</Text>
          </View>
          {badges.map(badge => (
            <AccessCard badge={badge} key={badge.id} onRemove={() => removeBadge(badge.id)} onToggle={() => toggleBadge(badge.id)} theme={theme} />
          ))}
          <Pressable accessibilityLabel="Ajouter un badge RFID" onPress={addBadge} style={styles.outlineAction}>
            <Plus color="#f28c6b" size={20} />
            <Text style={styles.outlineActionText}>Ajouter un badge</Text>
          </Pressable>
        </DashboardPage>
      ) : null}

      {activeTab === 'settings' ? (
        <DashboardPage eyebrow="Votre espace" theme={theme} title="Reglages">
          <View style={[styles.profileRow, theme === 'light' && styles.listRowLight]}>
            <View style={styles.profileAvatar}><CircleUserRound color="#fff4eb" size={28} /></View>
            <View>
              <Text style={[styles.profileName, theme === 'light' && styles.listTitleLight]}>{user.prenom} {user.nom}</Text>
              <Text style={styles.activityMeta}>{user.email}</Text>
            </View>
          </View>
          <Pressable accessibilityLabel={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'} onPress={toggleTheme} style={[styles.settingsRow, theme === 'light' && styles.settingsRowLight]}>
            {theme === 'dark' ? <Sun color="#f28c6b" size={19} /> : <Moon color="#a94d43" size={19} />}
            <Text style={[styles.settingsText, theme === 'light' && styles.settingsTextLight]}>{theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}</Text>
          </Pressable>
          <Text style={[styles.settingsLabel, theme === 'light' && styles.settingsLabelLight]}>Adresse du backend</Text>
          <View style={styles.serverRow}>
            <TextInput onChangeText={setApiBase} style={[styles.serverInput, theme === 'light' && styles.serverInputLight]} value={apiBase} />
            <Pressable accessibilityLabel="Tester le backend" onPress={testBackend} style={styles.serverButton}>
              <Zap color="#fff4eb" size={18} />
            </Pressable>
          </View>
          <View style={[styles.settingsRow, theme === 'light' && styles.settingsRowLight]}>
            <Wifi color="#80aa85" size={19} />
            <Text style={[styles.settingsText, theme === 'light' && styles.settingsTextLight]}>{backendStatus === 'offline' ? 'Backend indisponible' : 'Maison connectee'}</Text>
          </View>
          <Pressable accessibilityLabel="Partager la maison" onPress={share} style={[styles.settingsRow, theme === 'light' && styles.settingsRowLight]}>
            <Send color="#f28c6b" size={19} />
            <Text style={[styles.settingsText, theme === 'light' && styles.settingsTextLight]}>Partager l'identifiant maison</Text>
          </Pressable>
          <Text style={[styles.settingsLabel, theme === 'light' && styles.settingsLabelLight]}>Pieces de la maison</Text>
          {rooms.map((room, index) => {
            const expanded = managedRoomName === room.roomName;
            return (
              <View key={`${room.roomName}-${index}`}>
                <Pressable
                  accessibilityLabel={`Configurer ${room.roomName}`}
                  onPress={() => setManagedRoomName(expanded ? null : room.roomName)}
                  style={[styles.roomRow, theme === 'light' && styles.listRowLight]}>
                  <DoorOpen color="#f28c6b" size={18} />
                  <View style={styles.grow}>
                    <Text style={[styles.settingsText, theme === 'light' && styles.settingsTextLight]}>{room.roomName}</Text>
                    <Text style={styles.activityMeta}>{room.devices.length} module{room.devices.length > 1 ? 's' : ''}</Text>
                  </View>
                  <Text style={styles.roomPosition}>{index < 3 ? 'MAQUETTE' : 'EXTENSION'}</Text>
                  {expanded ? <ChevronUp color="#f28c6b" size={17} /> : <ChevronDown color="#c9a092" size={17} />}
                </Pressable>
                {expanded ? (
                  <View style={[styles.roomManager, theme === 'light' && styles.roomManagerLight]}>
                    <View style={styles.spaceBetween}>
                      <Text style={[styles.roomManagerTitle, theme === 'light' && styles.settingsTextLight]}>Equipements associes</Text>
                      <Pressable accessibilityLabel={`Ouvrir ${room.roomName}`} onPress={() => openRoom(room.roomName)} style={styles.smallAction}>
                        <MapPin color="#f8be8d" size={15} />
                        <Text style={styles.smallActionText}>Ouvrir</Text>
                      </Pressable>
                    </View>
                    {room.devices.length ? room.devices.map((device, deviceIndex) => (
                      <View key={`${device.type}-${device.pin}-${deviceIndex}`} style={styles.managedDeviceRow}>
                        {device.type === 'light' ? <Lightbulb color="#f28c6b" size={18} /> : <DoorOpen color="#80aa85" size={18} />}
                        <View style={styles.grow}>
                          <Text style={[styles.settingsText, theme === 'light' && styles.settingsTextLight]}>{device.type === 'light' ? 'Lumiere LED' : 'Porte servo'}</Text>
                          <Text style={styles.activityMeta}>PIN {device.pin} - {device.status ? 'ACTIF' : 'INACTIF'}</Text>
                        </View>
                        <Pressable accessibilityLabel={`Supprimer ${device.type} PIN ${device.pin}`} onPress={() => confirmRemoveDevice(deviceIndex)}>
                          <Trash2 color="#c98d82" size={17} />
                        </Pressable>
                      </View>
                    )) : <Text style={styles.roomEmptyText}>Aucun module associe.</Text>}
                    <Text style={[styles.settingsLabel, theme === 'light' && styles.settingsLabelLight]}>Associer un module Arduino</Text>
                    <View style={styles.modulePicker}>
                      <Pressable accessibilityLabel="Choisir une lumiere" onPress={() => setNewDeviceType('light')} style={[styles.moduleChoice, newDeviceType === 'light' && styles.moduleChoiceActive]}>
                        <Lightbulb color={newDeviceType === 'light' ? '#fff4eb' : '#f28c6b'} size={16} />
                        <Text style={[styles.moduleChoiceText, newDeviceType === 'light' && styles.moduleChoiceTextActive]}>Lumiere</Text>
                      </Pressable>
                      <Pressable accessibilityLabel="Choisir une porte" onPress={() => setNewDeviceType('door')} style={[styles.moduleChoice, newDeviceType === 'door' && styles.moduleChoiceActive]}>
                        <DoorOpen color={newDeviceType === 'door' ? '#fff4eb' : '#80aa85'} size={16} />
                        <Text style={[styles.moduleChoiceText, newDeviceType === 'door' && styles.moduleChoiceTextActive]}>Porte</Text>
                      </Pressable>
                    </View>
                    <View style={styles.serverRow}>
                      <TextInput
                        accessibilityLabel="PIN du nouveau module"
                        keyboardType="number-pad"
                        onChangeText={setNewDevicePin}
                        placeholder="PIN Arduino"
                        placeholderTextColor={theme === 'light' ? '#ae8e86' : '#9c8b86'}
                        style={[styles.serverInput, theme === 'light' && styles.serverInputLight]}
                        value={newDevicePin}
                      />
                      <Pressable accessibilityLabel="Associer le module" onPress={submitDevice} style={styles.serverButton}>
                        <Plus color="#fff4eb" size={20} />
                      </Pressable>
                    </View>
                    <Pressable accessibilityLabel={`Supprimer la piece ${room.roomName}`} onPress={confirmRemoveRoom} style={styles.deleteRoomAction}>
                      <Trash2 color="#c98d82" size={16} />
                      <Text style={styles.deleteRoomText}>Supprimer la piece</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })}
          <View style={styles.serverRow}>
            <TextInput
              accessibilityLabel="Nom de la nouvelle piece"
              onChangeText={setNewRoomName}
              placeholder="Ex. Bureau"
              placeholderTextColor={theme === 'light' ? '#ae8e86' : '#9c8b86'}
              style={[styles.serverInput, theme === 'light' && styles.serverInputLight]}
              value={newRoomName}
            />
            <Pressable accessibilityLabel="Ajouter la piece" onPress={submitRoom} style={styles.serverButton}>
              <Plus color="#fff4eb" size={20} />
            </Pressable>
          </View>
          <Pressable accessibilityLabel="Se deconnecter" onPress={logout} style={styles.logoutAction}>
            <LogOut color="#f28c6b" size={19} />
            <Text style={styles.logoutText}>Se deconnecter</Text>
          </Pressable>
        </DashboardPage>
      ) : null}

      <View style={[styles.topBar, theme === 'light' && styles.topBarLight]}>
        <View>
          <View style={styles.inline}>
            <Image accessibilityLabel="Logo SmartHome" source={require('../../assets/smarthome-logo.png')} style={styles.brandLogo} />
            <Text style={styles.brand}>NOTRE MAISON</Text>
          </View>
          <Text style={[styles.houseName, theme === 'light' && styles.houseNameLight]}>{user.nomMaison || 'Maison connectee'}</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={[styles.liveText, theme === 'light' && styles.liveTextLight]}>{backendStatus === 'offline' ? 'HORS LIGNE' : 'EN LIGNE'}</Text>
        </View>
      </View>
      <BottomNav activeTab={activeTab} openTab={openTab} theme={theme} />
    </View>
  );
};

const BottomNav = ({activeTab, openTab, theme}: {activeTab: DashboardTab; openTab: (tab: DashboardTab) => void; theme: 'dark' | 'light'}) => (
  <View style={[styles.bottomNav, theme === 'light' && styles.bottomNavLight]}>
    <NavButton Icon={Home} active={activeTab === 'home'} label="Maison" onPress={() => openTab('home')} />
    <NavButton Icon={History} active={activeTab === 'activity'} label="Activite" onPress={() => openTab('activity')} />
    <NavButton Icon={KeyRound} active={activeTab === 'access'} label="Acces" onPress={() => openTab('access')} />
    <NavButton Icon={Settings} active={activeTab === 'settings'} label="Reglages" onPress={() => openTab('settings')} />
  </View>
);

const NavButton = ({Icon, active, label, onPress}: {Icon: LucideIcon; active: boolean; label: string; onPress: () => void}) => (
  <Pressable accessibilityLabel={`Onglet ${label}`} onPress={onPress} style={styles.navButton}>
    <Icon color={active ? '#f28c6b' : '#9c8b86'} size={20} />
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
  </Pressable>
);

const SceneButton = ({Icon, label, onPress}: {Icon: LucideIcon; label: string; onPress: () => void}) => (
  <Pressable accessibilityLabel={`Scene ${label}`} onPress={onPress} style={styles.sceneButton}>
    <Icon color="#f8be8d" size={18} />
    <Text style={styles.sceneText}>{label}</Text>
  </Pressable>
);

const DashboardPage = ({children, eyebrow, theme, title}: {children: React.ReactNode; eyebrow: string; theme: 'dark' | 'light'; title: string}) => (
  <ScrollView contentContainerStyle={[styles.page, theme === 'light' && styles.pageLight]}>
    <Text style={styles.kicker}>{eyebrow}</Text>
    <Text style={[styles.pageTitle, theme === 'light' && styles.pageTitleLight]}>{title}</Text>
    {children}
  </ScrollView>
);

const FilterButton = ({active, label, onPress}: {active: boolean; label: string; onPress: () => void}) => (
  <Pressable accessibilityLabel={`Filtre ${label}`} onPress={onPress} style={[styles.filter, active && styles.filterActive]}>
    <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
  </Pressable>
);

const EmptyState = ({Icon, text}: {Icon: LucideIcon; text: string}) => (
  <View style={styles.empty}><Icon color="#c9a092" size={25} /><Text style={styles.emptyText}>{text}</Text></View>
);

const AccessCard = ({badge, onRemove, onToggle, theme}: {badge: AccessBadge; onRemove: () => void; onToggle: () => void; theme: 'dark' | 'light'}) => (
  <View style={[styles.listRow, theme === 'light' && styles.listRowLight]}>
    <View style={styles.listIcon}><CreditCard color="#f28c6b" size={22} /></View>
    <View style={styles.grow}>
      <Text style={[styles.listTitle, theme === 'light' && styles.listTitleLight]}>{badge.label}</Text>
      <Text style={styles.activityMeta}>{badge.owner}</Text>
    </View>
    <View style={styles.badgeActions}>
      <Text style={[styles.accessStatus, badge.status !== 'Autorise' && styles.accessStatusPending]}>{badge.status.toUpperCase()}</Text>
      <View style={styles.inline}>
        <Pressable accessibilityLabel={`${badge.status === 'Autorise' ? 'Suspendre' : 'Autoriser'} ${badge.label}`} onPress={onToggle}>
          {badge.status === 'Autorise' ? <ShieldOff color="#c9a092" size={17} /> : <ShieldCheck color="#80aa85" size={17} />}
        </Pressable>
        <Pressable accessibilityLabel={`Supprimer ${badge.label}`} onPress={onRemove}>
          <Trash2 color="#c9a092" size={17} />
        </Pressable>
      </View>
    </View>
  </View>
);

const deviceAction = (device: Device) =>
  device.type === 'light'
    ? device.status ? 'Eteindre la LED' : 'Allumer la LED'
    : device.status ? 'Fermer la porte' : 'Ouvrir la porte';

const styles = StyleSheet.create({
  accessStatus:{color:'#80aa85',fontSize:10,fontWeight:'800'},accessStatusPending:{color:'#f8be8d'},activityMeta:{color:'#b6a49d',fontSize:12,fontWeight:'700',marginTop:4},badgeActions:{alignItems:'flex-end',gap:7},bottomNav:{alignItems:'center',backgroundColor:'rgba(37,26,28,.98)',borderTopColor:'rgba(242,140,107,.20)',borderTopWidth:1,bottom:0,flexDirection:'row',height:72,left:0,position:'absolute',right:0},bottomNavLight:{backgroundColor:'rgba(255,250,246,.98)',borderTopColor:'rgba(169,77,67,.20)'},brand:{color:'#f28c6b',fontSize:11,fontWeight:'800'},brandLogo:{borderRadius:6,height:23,width:23},configureRoomAction:{alignItems:'center',borderTopColor:'rgba(242,140,107,.18)',borderTopWidth:1,flexDirection:'row',gap:7,marginTop:12,paddingTop:11},configureRoomText:{color:'#f28c6b',fontSize:12,fontWeight:'800'},deleteRoomAction:{alignItems:'center',borderColor:'rgba(201,141,130,.35)',borderRadius:8,borderWidth:1,flexDirection:'row',gap:8,justifyContent:'center',marginTop:15,padding:12},deleteRoomText:{color:'#c98d82',fontSize:13,fontWeight:'800'},empty:{alignItems:'center',backgroundColor:'rgba(255,244,235,.04)',borderColor:'rgba(242,140,107,.16)',borderRadius:8,borderWidth:1,gap:11,marginTop:16,padding:24},emptyText:{color:'#c9b8b1',fontSize:14,fontWeight:'700',textAlign:'center'},filter:{backgroundColor:'rgba(255,244,235,.04)',borderColor:'rgba(242,140,107,.18)',borderRadius:8,borderWidth:1,paddingHorizontal:13,paddingVertical:10},filterActive:{backgroundColor:'#a94d43',borderColor:'#f28c6b'},filterRow:{flexDirection:'row',gap:8,marginBottom:14,marginTop:18},filterText:{color:'#c9b8b1',fontWeight:'800'},filterTextActive:{color:'#fff4eb'},grow:{flex:1},homePrompt:{left:18,position:'absolute',top:95},homeText:{color:'#c9b8b1',fontSize:12,fontWeight:'700',marginTop:4},homeTextLight:{color:'#8b6b63'},homeTitle:{color:'#fff4eb',fontSize:27,fontWeight:'800',marginTop:3},homeTitleLight:{color:'#4d3532'},houseName:{color:'#fff4eb',fontSize:19,fontWeight:'800',marginTop:3},houseNameLight:{color:'#4d3532'},iconButton:{alignItems:'center',backgroundColor:'rgba(242,140,107,.10)',borderRadius:8,height:36,justifyContent:'center',width:36},inline:{alignItems:'center',flexDirection:'row',gap:8},kicker:{color:'#f28c6b',fontSize:11,fontWeight:'800',textTransform:'uppercase'},latestActivity:{alignItems:'center',borderTopColor:'rgba(242,140,107,.18)',borderTopWidth:1,flexDirection:'row',gap:7,marginTop:13,paddingTop:11},listIcon:{alignItems:'center',backgroundColor:'rgba(242,140,107,.10)',borderRadius:22,height:44,justifyContent:'center',width:44},listRow:{alignItems:'center',backgroundColor:'rgba(255,244,235,.045)',borderColor:'rgba(242,140,107,.16)',borderRadius:8,borderWidth:1,flexDirection:'row',gap:11,marginTop:10,padding:13},listRowLight:{backgroundColor:'rgba(255,253,251,.95)',borderColor:'rgba(169,77,67,.20)'},listTitle:{color:'#fff4eb',fontSize:15,fontWeight:'800'},listTitleLight:{color:'#4d3532'},liveBadge:{alignItems:'center',backgroundColor:'rgba(128,170,133,.12)',borderColor:'rgba(128,170,133,.30)',borderRadius:15,borderWidth:1,flexDirection:'row',gap:5,paddingHorizontal:9,paddingVertical:7},liveDot:{backgroundColor:'#80aa85',borderRadius:4,height:7,width:7},liveText:{color:'#cbe1c9',fontSize:8,fontWeight:'800'},liveTextLight:{color:'#5f8b68'},logoutAction:{alignItems:'center',borderColor:'rgba(242,140,107,.28)',borderRadius:8,borderWidth:1,flexDirection:'row',gap:10,marginTop:22,padding:14},logoutText:{color:'#f28c6b',fontSize:14,fontWeight:'800'},managedDeviceRow:{alignItems:'center',borderBottomColor:'rgba(242,140,107,.14)',borderBottomWidth:1,flexDirection:'row',gap:9,paddingVertical:11},module:{backgroundColor:'rgba(255,244,235,.045)',borderColor:'rgba(242,140,107,.16)',borderRadius:8,borderWidth:1,flex:1,minHeight:132,padding:11},moduleActive:{backgroundColor:'rgba(248,190,141,.15)',borderColor:'rgba(248,190,141,.52)'},moduleChoice:{alignItems:'center',borderColor:'rgba(242,140,107,.24)',borderRadius:8,borderWidth:1,flex:1,flexDirection:'row',gap:7,justifyContent:'center',padding:10},moduleChoiceActive:{backgroundColor:'#a94d43',borderColor:'#f28c6b'},moduleChoiceText:{color:'#c9b8b1',fontSize:12,fontWeight:'800'},moduleChoiceTextActive:{color:'#fff4eb'},moduleIcon:{alignItems:'center',backgroundColor:'rgba(255,244,235,.08)',borderRadius:20,height:40,justifyContent:'center',width:40},moduleIconActive:{backgroundColor:'#f8be8d'},moduleMeta:{color:'#b6a49d',fontSize:10,fontWeight:'700',marginTop:8},moduleName:{color:'#fff4eb',fontSize:15,fontWeight:'800',marginTop:4},modulePicker:{flexDirection:'row',gap:8,marginTop:9},moduleRow:{flexDirection:'row',gap:10,marginTop:13},moduleType:{color:'#f28c6b',fontSize:9,fontWeight:'800',marginTop:10},navButton:{alignItems:'center',flex:1,gap:5,justifyContent:'center'},navLabel:{color:'#9c8b86',fontSize:10,fontWeight:'800'},navLabelActive:{color:'#f28c6b'},outlineAction:{alignItems:'center',borderColor:'rgba(242,140,107,.40)',borderRadius:8,borderWidth:1,flexDirection:'row',gap:8,justifyContent:'center',marginTop:14,padding:14},outlineActionText:{color:'#f28c6b',fontSize:14,fontWeight:'800'},page:{paddingBottom:95,paddingHorizontal:18,paddingTop:105},pageLight:{backgroundColor:'#fff8f2'},pageTitle:{color:'#fff4eb',fontSize:31,fontWeight:'800',marginTop:4},pageTitleLight:{color:'#4d3532'},profileAvatar:{alignItems:'center',backgroundColor:'#a94d43',borderRadius:26,height:52,justifyContent:'center',width:52},profileName:{color:'#fff4eb',fontSize:18,fontWeight:'800'},profileRow:{alignItems:'center',backgroundColor:'rgba(255,244,235,.045)',borderColor:'rgba(242,140,107,.16)',borderRadius:8,borderWidth:1,flexDirection:'row',gap:12,marginTop:18,padding:14},rfidHero:{alignItems:'center',backgroundColor:'rgba(169,77,67,.20)',borderColor:'rgba(242,140,107,.30)',borderRadius:8,borderWidth:1,marginTop:18,padding:19},rfidPulse:{alignItems:'center',backgroundColor:'#a94d43',borderRadius:28,height:56,justifyContent:'center',width:56},rfidText:{color:'#d8c4bb',fontSize:13,fontWeight:'700',marginTop:6,textAlign:'center'},rfidTitle:{color:'#fff4eb',fontSize:18,fontWeight:'800',marginTop:13},roomEmptyText:{color:'#c9b8b1',fontSize:12,fontWeight:'700',marginTop:12},roomExplorer:{backgroundColor:'rgba(33,25,29,.82)',borderColor:'rgba(242,140,107,.20)',borderTopWidth:1,bottom:151,left:0,paddingBottom:8,paddingHorizontal:18,paddingTop:8,position:'absolute',right:0},roomExplorerRow:{flexDirection:'row',gap:8},roomExplorerTitle:{color:'#c9b8b1',fontSize:10,fontWeight:'800',marginBottom:6,textTransform:'uppercase'},roomManager:{backgroundColor:'rgba(51,33,34,.72)',borderColor:'rgba(242,140,107,.20)',borderRadius:8,borderWidth:1,marginTop:6,padding:12},roomManagerLight:{backgroundColor:'rgba(255,253,251,.92)',borderColor:'rgba(169,77,67,.18)'},roomManagerTitle:{color:'#fff4eb',fontSize:14,fontWeight:'800'},roomPosition:{color:'#a94d43',fontSize:9,fontWeight:'800',marginLeft:'auto'},roomRow:{alignItems:'center',backgroundColor:'rgba(255,244,235,.045)',borderColor:'rgba(242,140,107,.16)',borderRadius:8,borderWidth:1,flexDirection:'row',gap:10,marginTop:8,padding:12},roomShortcut:{alignItems:'center',backgroundColor:'rgba(128,170,133,.10)',borderColor:'rgba(128,170,133,.30)',borderRadius:8,borderWidth:1,flexDirection:'row',gap:6,paddingHorizontal:9,paddingVertical:8},roomShortcutExtension:{backgroundColor:'rgba(242,140,107,.10)',borderColor:'rgba(242,140,107,.35)'},roomShortcutMeta:{color:'#c9a092',fontSize:10,fontWeight:'800'},roomShortcutName:{color:'#fff4eb',fontSize:12,fontWeight:'800'},roomSheet:{backgroundColor:'rgba(51,33,34,.98)',borderColor:'rgba(242,140,107,.34)',borderRadius:8,borderWidth:1,bottom:82,left:18,padding:15,position:'absolute',right:18},root:{backgroundColor:'#21191d',flex:1,overflow:'hidden'},rootLight:{backgroundColor:'#fff8f2'},sceneButton:{alignItems:'center',backgroundColor:'rgba(65,43,42,.88)',borderColor:'rgba(242,140,107,.25)',borderRadius:8,borderWidth:1,flex:1,gap:5,justifyContent:'center',minHeight:54},sceneStrip:{bottom:86,flexDirection:'row',gap:8,left:18,position:'absolute',right:18},sceneText:{color:'#f8be8d',fontSize:11,fontWeight:'800'},serverButton:{alignItems:'center',backgroundColor:'#a94d43',borderRadius:8,height:48,justifyContent:'center',width:48},serverInput:{backgroundColor:'rgba(255,244,235,.05)',borderColor:'rgba(242,140,107,.20)',borderRadius:8,borderWidth:1,color:'#fff4eb',flex:1,fontSize:14,minHeight:48,paddingHorizontal:11},serverInputLight:{backgroundColor:'#fffdfb',borderColor:'rgba(169,77,67,.24)',color:'#4d3532'},serverRow:{flexDirection:'row',gap:8,marginTop:8},settingsLabel:{color:'#d8c4bb',fontSize:13,fontWeight:'800',marginTop:20},settingsLabelLight:{color:'#755750'},settingsRow:{alignItems:'center',borderBottomColor:'rgba(242,140,107,.14)',borderBottomWidth:1,flexDirection:'row',gap:10,paddingVertical:15},settingsRowLight:{borderBottomColor:'rgba(169,77,67,.16)'},settingsText:{color:'#e8d6ce',fontSize:14,fontWeight:'700'},settingsTextLight:{color:'#61433d'},sheetTitle:{color:'#fff4eb',fontSize:23,fontWeight:'800',marginTop:3},smallAction:{alignItems:'center',backgroundColor:'rgba(169,77,67,.78)',borderRadius:8,flexDirection:'row',gap:5,paddingHorizontal:8,paddingVertical:7},smallActionText:{color:'#fff4eb',fontSize:11,fontWeight:'800'},spaceBetween:{alignItems:'center',flexDirection:'row',justifyContent:'space-between'},topBar:{alignItems:'center',flexDirection:'row',justifyContent:'space-between',left:18,position:'absolute',right:18,top:17},topBarLight:{backgroundColor:'rgba(255,248,242,.90)',borderBottomColor:'rgba(169,77,67,.12)',borderBottomWidth:1,left:0,paddingBottom:10,paddingHorizontal:18,right:0,top:0,paddingTop:17},
});

export default DashboardExperience;
