import React, {useEffect, useMemo, useRef} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

const isTest =
  (globalThis as {process?: {env?: {NODE_ENV?: string}}}).process?.env
    ?.NODE_ENV === 'test';

type SceneDevice = {
  type: 'light' | 'door';
  status: boolean;
};

type SceneRoom = {
  roomName: string;
  devices: SceneDevice[];
};

type SmartHomeSceneProps = {
  activeDevices: number;
  immersive?: boolean;
  rooms: SceneRoom[];
  selectedRoom: string;
  theme?: 'dark' | 'light';
  onSelectRoom: (roomName: string) => void;
};

type SceneSlot = {
  door: ViewStyle;
  labelX: number;
  labelY: number;
  light: ViewStyle;
  roomButton: ViewStyle;
  tile: string;
};

const baseSlots: SceneSlot[] = [
  {
    tile: '180,57 285,110 208,150 102,98',
    labelX: 196,
    labelY: 102,
    roomButton: {left: '34%', top: '21%', width: '39%', height: '27%'},
    light: {left: '58%', top: '28%'},
    door: {left: '40%', top: '39%'},
  },
  {
    tile: '102,98 208,150 180,166 76,114',
    labelX: 128,
    labelY: 126,
    roomButton: {left: '18%', top: '39%', width: '38%', height: '22%'},
    light: {left: '25%', top: '43%'},
    door: {left: '45%', top: '53%'},
  },
  {
    tile: '208,150 285,110 312,124 235,166',
    labelX: 253,
    labelY: 134,
    roomButton: {left: '57%', top: '43%', width: '32%', height: '21%'},
    light: {left: '72%', top: '43%'},
    door: {left: '61%', top: '56%'},
  },
];

const percent = (value: number) => `${value}%` as `${number}%`;

const dynamicSlot = (
  centerX: number,
  centerY: number,
  halfWidth: number,
  halfHeight: number,
): SceneSlot => ({
  tile: `${centerX},${centerY - halfHeight} ${centerX + halfWidth},${centerY} ${centerX},${centerY + halfHeight} ${centerX - halfWidth},${centerY}`,
  labelX: centerX,
  labelY: centerY + 3,
  roomButton: {
    height: percent((halfHeight * 2 * 100) / 220),
    left: percent(((centerX - halfWidth) * 100) / 360),
    top: percent(((centerY - halfHeight) * 100) / 220),
    width: percent((halfWidth * 2 * 100) / 360),
  },
  light: {
    left: percent(((centerX + halfWidth * 0.28 - 19) * 100) / 360),
    top: percent(((centerY - halfHeight * 0.34 - 19) * 100) / 220),
  },
  door: {
    left: percent(((centerX - halfWidth * 0.18 - 19) * 100) / 360),
    top: percent(((centerY + halfHeight * 0.22 - 19) * 100) / 220),
  },
});

const buildSceneSlots = (roomCount: number) => {
  if (roomCount <= baseSlots.length) {
    return baseSlots.slice(0, roomCount);
  }

  const columns = Math.ceil(Math.sqrt(roomCount));
  const rows = Math.ceil(roomCount / columns);
  const halfWidth = Math.min(45, 230 / (columns + rows));
  const halfHeight = halfWidth * 0.46;
  const rawCenters = Array.from({length: roomCount}, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return {
      x: (column - row) * halfWidth,
      y: (column + row) * halfHeight,
    };
  });
  const xs = rawCenters.map(center => center.x);
  const ys = rawCenters.map(center => center.y);
  const offsetX = 180 - (Math.min(...xs) + Math.max(...xs)) / 2;
  const offsetY = 118 - (Math.min(...ys) + Math.max(...ys)) / 2;

  return rawCenters.map(center =>
    dynamicSlot(center.x + offsetX, center.y + offsetY, halfWidth, halfHeight),
  );
};

const SmartHomeScene = ({
  activeDevices,
  immersive = false,
  rooms,
  selectedRoom,
  theme = 'dark',
  onSelectRoom,
}: SmartHomeSceneProps) => {
  const scanOffset = useRef(new Animated.Value(0)).current;
  const pulseOpacity = useRef(new Animated.Value(0.35)).current;
  const cameraDepth = useRef(new Animated.Value(0)).current;
  const sceneSlots = useMemo(() => buildSceneSlots(rooms.length), [rooms.length]);
  const visibleRooms = rooms;
  const light = theme === 'light';

  useEffect(() => {
    if (isTest) {
      return;
    }

    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanOffset, {
          duration: 2600,
          toValue: 164,
          useNativeDriver: true,
        }),
        Animated.timing(scanOffset, {
          duration: 0,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, {
          duration: 900,
          toValue: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          duration: 900,
          toValue: 0.28,
          useNativeDriver: true,
        }),
      ]),
    );

    scanAnimation.start();
    pulseAnimation.start();

    return () => {
      scanAnimation.stop();
      pulseAnimation.stop();
    };
  }, [pulseOpacity, scanOffset]);

  useEffect(() => {
    if (isTest) {
      cameraDepth.setValue(selectedRoom === 'all' ? 0 : 1);
      return;
    }

    Animated.spring(cameraDepth, {
      damping: 18,
      mass: 0.7,
      stiffness: 120,
      toValue: selectedRoom === 'all' ? 0 : 1,
      useNativeDriver: true,
    }).start();
  }, [cameraDepth, selectedRoom]);

  return (
    <View style={[styles.scene, light && styles.sceneLight, immersive && styles.sceneImmersive]}>
      {!immersive ? <View style={styles.sceneHeader}>
        <View>
          <Text style={styles.kicker}>Jumeau numerique</Text>
          <Text style={styles.title}>Explorer la maison</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View> : null}

      <Animated.View
        style={[
          styles.viewport,
          immersive && styles.viewportImmersive,
          {
            transform: [
              {
                scale: cameraDepth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.045],
                }),
              },
              {
                translateY: cameraDepth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5],
                }),
              },
            ],
          },
        ]}>
        <Svg height="100%" viewBox="0 0 360 220" width="100%">
          <Defs>
            <LinearGradient id="scene-bg" x1="0" x2="1" y1="0" y2="1">
              <Stop offset="0" stopColor={light ? '#fff8f2' : '#21191d'} />
              <Stop offset="0.55" stopColor={light ? '#f2d9cf' : '#17383b'} />
              <Stop offset="1" stopColor={light ? '#e1c5bc' : '#061417'} />
            </LinearGradient>
            <LinearGradient id="front-wall" x1="0" x2="0.9" y1="0" y2="1">
              <Stop offset="0" stopColor={light ? '#c68473' : '#7b504d'} />
              <Stop offset="1" stopColor={light ? '#8f5a54' : '#2b292b'} />
            </LinearGradient>
            <LinearGradient id="right-wall" x1="0" x2="1" y1="0" y2="1">
              <Stop offset="0" stopColor={light ? '#aa766d' : '#536c67'} />
              <Stop offset="1" stopColor={light ? '#704a47' : '#172725'} />
            </LinearGradient>
            <RadialGradient id="ambient-glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={light ? '#f28c6b' : '#f28c6b'} stopOpacity={light ? '0.28' : '0.22'} />
              <Stop offset="1" stopColor="#f28c6b" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect fill="url(#scene-bg)" height="220" width="360" />
          <Circle cx="184" cy="123" fill="url(#ambient-glow)" r="138" />
          {[40, 80, 120, 160, 200, 240, 280, 320].map(x => (
            <Line
              key={`vertical-${x}`}
              stroke={light ? 'rgba(169, 77, 67, 0.14)' : 'rgba(128, 170, 133, 0.12)'}
              strokeWidth="1"
              x1={x}
              x2={x - 76}
              y1="20"
              y2="210"
            />
          ))}
          {[48, 82, 116, 150, 184].map(y => (
            <Line
              key={`horizontal-${y}`}
              stroke={light ? 'rgba(169, 77, 67, 0.14)' : 'rgba(128, 170, 133, 0.12)'}
              strokeWidth="1"
              x1="12"
              x2="348"
              y1={y}
              y2={y}
            />
          ))}

          <Polygon fill={light ? '#8f5a54' : '#352e30'} points="76,114 180,166 312,124 312,146 180,190 76,137" />
          <Polygon fill="url(#front-wall)" points="76,114 180,166 180,190 76,137" />
          <Polygon fill="url(#right-wall)" points="180,166 312,124 312,146 180,190" />
          <Polygon
            fill={light ? 'rgba(255,245,239,0.38)' : 'rgba(77,110,103,0.28)'}
            points="101,96 181,54 286,108 207,149"
            stroke={light ? 'rgba(169,77,67,0.30)' : 'rgba(128,170,133,0.34)'}
            strokeWidth="1"
          />
          <Line stroke={light ? 'rgba(169,77,67,0.34)' : 'rgba(128,170,133,0.38)'} strokeWidth="1" x1="101" x2="101" y1="96" y2="115" />
          <Line stroke={light ? 'rgba(169,77,67,0.34)' : 'rgba(128,170,133,0.38)'} strokeWidth="1" x1="181" x2="181" y1="54" y2="166" />
          <Line stroke={light ? 'rgba(169,77,67,0.34)' : 'rgba(128,170,133,0.38)'} strokeWidth="1" x1="286" x2="286" y1="108" y2="132" />

          {visibleRooms.map((room, roomIndex) => {
            const slot = sceneSlots[roomIndex];
            const active = selectedRoom === room.roomName;
            return (
              <G key={`${room.roomName}-${roomIndex}`}>
                <Polygon
                  fill={active ? (light ? '#d7644f' : '#b84e43') : light ? '#e6b4a5' : '#365b59'}
                  points={slot.tile}
                  stroke={active ? '#ffe1bd' : light ? '#b86d61' : '#80aa85'}
                  strokeWidth={active ? '3' : '1'}
                />
                <SvgText
                  fill={active ? '#ffffff' : light ? '#6f403b' : '#d2e2d2'}
                  fontSize="8"
                  fontWeight="700"
                  textAnchor="middle"
                  x={slot.labelX}
                  y={slot.labelY}>
                  {room.roomName.toUpperCase()}
                </SvgText>
              </G>
            );
          })}

          <Polygon fill={light ? '#674640' : '#1d302f'} points="168,166 192,174 192,193 168,185" stroke={light ? '#d29485' : '#80aa85'} />
          <Rect fill={light ? '#f8be8d' : '#80aa85'} height="12" opacity="0.85" width="4" x="179" y="174" />
          <Circle cx="180" cy="197" fill="#f28c6b" opacity="0.82" r="3" />
          <SvgText fill="#f28c6b" fontSize="7" fontWeight="700" textAnchor="middle" x="180" y="211">
            RFID ACCESS
          </SvgText>
        </Svg>

        <Animated.View
          pointerEvents="none"
          style={[styles.scanLine, {transform: [{translateY: scanOffset}]}]}
        />

        {visibleRooms.map((room, roomIndex) => (
          <Pressable
            accessibilityLabel={`Explorer ${room.roomName}`}
            key={`room-touch-${room.roomName}-${roomIndex}`}
            onPress={() => onSelectRoom(room.roomName)}
            style={[styles.roomTouch, sceneSlots[roomIndex].roomButton]}
          />
        ))}

        {visibleRooms.flatMap((room, roomIndex) =>
          room.devices.map((device, deviceIndex) => {
            const active = device.status;
            const position =
              device.type === 'light'
                ? sceneSlots[roomIndex].light
                : sceneSlots[roomIndex].door;

            return (
              <View
                accessibilityLabel={`${device.type} ${room.roomName}`}
                key={`${room.roomName}-${device.type}-${deviceIndex}`}
                style={[styles.hotspot, position]}>
                {active ? (
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.pulse, {opacity: pulseOpacity}]}
                  />
                ) : null}
                <View
                  style={[
                    styles.hotspotCore,
                    active && styles.hotspotCoreActive,
                  ]}>
                  <Text
                    style={[
                      styles.hotspotText,
                      active && styles.hotspotTextActive,
                    ]}>
                    {device.type === 'light' ? 'LED' : 'SRV'}
                  </Text>
                </View>
              </View>
            );
          }),
        )}
      </Animated.View>

      {!immersive ? <View style={styles.sceneFooter}>
        <Text style={styles.sceneMeta}>{visibleRooms.length} zones cartographiees</Text>
        <Text style={styles.sceneMetaStrong}>{activeDevices} modules actifs</Text>
        {rooms.length > baseSlots.length ? (
          <Text style={styles.sceneMeta}>Plan etendu automatiquement</Text>
        ) : null}
      </View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  scene: {
    backgroundColor: '#081727',
    marginHorizontal: -16,
    overflow: 'hidden',
    paddingBottom: 14,
    paddingTop: 17,
  },
  sceneImmersive: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 0,
    paddingBottom: 0,
    paddingTop: 0,
  },
  sceneLight: {
    backgroundColor: '#fff8f2',
  },
  sceneHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  kicker: {
    color: '#f28c6b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 3,
  },
  liveBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(242, 140, 107, 0.11)',
    borderColor: 'rgba(242, 140, 107, 0.35)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  liveDot: {
    backgroundColor: '#80aa85',
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  liveText: {
    color: '#f8be8d',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0,
  },
  viewport: {
    aspectRatio: 1.62,
    marginTop: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  viewportImmersive: {
    aspectRatio: 1.62,
    flex: undefined,
    marginTop: 0,
  },
  scanLine: {
    backgroundColor: 'rgba(242, 140, 107, 0.30)',
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 14,
  },
  roomTouch: {
    position: 'absolute',
  },
  hotspot: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    position: 'absolute',
    width: 38,
  },
  pulse: {
    backgroundColor: '#80aa85',
    borderRadius: 20,
    height: 38,
    position: 'absolute',
    width: 38,
  },
  hotspotCore: {
    alignItems: 'center',
    backgroundColor: '#153649',
    borderColor: '#659aa1',
    borderRadius: 14,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  hotspotCoreActive: {
    backgroundColor: '#08785c',
    borderColor: '#9bf6dc',
  },
  hotspotText: {
    color: '#b4c8ce',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0,
  },
  hotspotTextActive: {
    color: '#ffffff',
  },
  sceneFooter: {
    alignItems: 'center',
    borderTopColor: 'rgba(242, 140, 107, 0.18)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 11,
  },
  sceneMeta: {
    color: '#b6a49d',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0,
  },
  sceneMetaStrong: {
    color: '#f28c6b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0,
  },
});

export default SmartHomeScene;
