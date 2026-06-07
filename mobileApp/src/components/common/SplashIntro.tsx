import React, {useEffect, useRef, useState} from 'react';
import {Animated, Image, StyleSheet, Text} from 'react-native';
import type {AppTheme} from '../../types/smartHome';

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
      <Image
        accessibilityLabel="Logo SmartHome"
        source={require('../../../assets/smarthome-logo.png')}
        style={styles.splashLogo}
      />
      <Text style={[styles.splashName, theme === 'light' && styles.splashNameLight]}>
        {name.slice(0, visibleLetters)}
        <Text style={styles.splashCursor}>|</Text>
      </Text>
      <Text style={styles.splashTagline}>La maison qui vous ressemble</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  splash: {
    alignItems: 'center',
    backgroundColor: '#21191d',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  splashCursor: {
    color: '#f8be8d',
  },
  splashLight: {
    backgroundColor: '#fff8f2',
  },
  splashLogo: {
    borderRadius: 18,
    height: 92,
    width: 92,
  },
  splashName: {
    color: '#fff4eb',
    fontSize: 38,
    fontWeight: '800',
    marginTop: 17,
  },
  splashNameLight: {
    color: '#4d3532',
  },
  splashTagline: {
    color: '#c9a092',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 9,
  },
});

export default SplashIntro;
