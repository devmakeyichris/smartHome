import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useLightTheme} from '../../config/theme';

const Glass = ({children}: {children: React.ReactNode}) => {
  const light = useLightTheme();

  return <View style={[styles.glass, light && styles.glassLight]}>{children}</View>;
};

const styles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(13,31,49,.94)',
    borderColor: 'rgba(242,140,107,.22)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  glassLight: {
    backgroundColor: 'rgba(255,250,246,.96)',
    borderColor: 'rgba(169,77,67,.20)',
  },
});

export default Glass;
