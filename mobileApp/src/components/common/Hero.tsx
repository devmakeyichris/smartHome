import React from 'react';
import {Image, ImageBackground, Pressable, StyleSheet, Text, View} from 'react-native';
import {Cpu, Gauge, LogOut, Wifi, type LucideIcon} from 'lucide-react-native';
import {useLightTheme} from '../../config/theme';
import type {BackendStatus} from '../../types/smartHome';

type HeroProps = {
  activeDevices: number;
  backendStatus: BackendStatus;
  dashboard: boolean;
  demo: boolean;
  logout?: () => void;
  totalDevices: number;
};

const Hero = ({activeDevices, backendStatus, dashboard, demo, logout, totalDevices}: HeroProps) => {
  const light = useLightTheme();

  return (
    <ImageBackground
      source={require('../../../assets/smart-home-header.png')}
      style={[styles.hero, light && styles.heroLight]}
      imageStyle={styles.heroImage}>
      <View style={styles.heroContent}>
        <View style={styles.brand}>
          <Image
            accessibilityLabel="Logo SmartHome"
            source={require('../../../assets/smarthome-logo.png')}
            style={styles.brandLogo}
          />
          <Text style={styles.brandText}>SmartHome Mobile</Text>
        </View>
        <Text style={styles.heroTitle}>{dashboard ? 'Maison connectee' : 'Controle Arduino'}</Text>
        <Text style={styles.heroStatus}>
          EN DIRECT - {demo ? 'Simulation locale active' : dashboard ? 'Systeme synchronise' : 'Console domotique'}
        </Text>
        <View style={styles.heroMetrics}>
          <Metric Icon={Cpu} label="Modules" value={`${totalDevices}`} />
          <Metric Icon={Gauge} label="Actifs" value={`${activeDevices}`} />
          <Metric Icon={Wifi} label="Reseau" value={backendStatus === 'offline' ? 'OFF' : 'OK'} />
        </View>
      </View>
      {logout ? (
        <Pressable onPress={logout} style={styles.logout}>
          <LogOut color="#ffffff" size={19} />
        </Pressable>
      ) : null}
    </ImageBackground>
  );
};

const Metric = ({Icon, label, value}: {Icon: LucideIcon; label: string; value: string}) => (
  <View style={styles.metric}>
    <Icon color="#f28c6b" size={17} />
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  brandLogo: {
    borderRadius: 7,
    height: 28,
    width: 28,
  },
  brandText: {
    color: '#f28c6b',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  hero: {
    borderColor: 'rgba(242,140,107,.32)',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 246,
    overflow: 'hidden',
    padding: 18,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroImage: {
    borderRadius: 8,
  },
  heroLight: {
    borderColor: 'rgba(169,77,67,.34)',
  },
  heroMetrics: {
    backgroundColor: 'rgba(2,13,25,.82)',
    borderColor: 'rgba(242,140,107,.35)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 16,
    padding: 10,
  },
  heroStatus: {
    color: '#f5d8ca',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 9,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 31,
    fontWeight: '800',
    marginTop: 6,
  },
  logout: {
    alignItems: 'center',
    backgroundColor: 'rgba(2,13,25,.72)',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 42,
    minWidth: 42,
    position: 'absolute',
    right: 14,
    top: 14,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
  },
  metricLabel: {
    color: '#b6a49d',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default Hero;
