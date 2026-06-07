import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {ArrowRight, Moon, ShieldCheck, Sun, type LucideIcon} from 'lucide-react-native';
import {useLightTheme} from '../../config/theme';
import type {AppTheme} from '../../types/smartHome';

type FieldProps = React.ComponentProps<typeof TextInput> & {
  Icon?: LucideIcon;
  label: string;
};

export const Field = ({Icon = ShieldCheck, label, ...props}: FieldProps) => {
  const light = useLightTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, light && styles.labelLight]}>{label}</Text>
      <View style={[styles.inputShell, light && styles.inputLight]}>
        <Icon color={light ? '#9c6155' : '#7893a1'} size={18} />
        <TextInput
          placeholderTextColor={light ? '#ae8e86' : '#607481'}
          style={[styles.fieldInput, light && styles.fieldInputLight]}
          {...props}
        />
      </View>
    </View>
  );
};

export const ActionButton = ({label, onPress}: {label: string; onPress: () => void}) => (
  <Pressable onPress={onPress} style={styles.action}>
    <Text style={styles.actionText}>{label}</Text>
    <ArrowRight color="#fff" />
  </Pressable>
);

export const ThemeButton = ({
  theme,
  toggleTheme,
}: {
  theme: AppTheme;
  toggleTheme: () => void;
}) => (
  <Pressable
    accessibilityLabel={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
    onPress={toggleTheme}
    style={styles.themeButton}>
    {theme === 'dark' ? <Sun color="#f28c6b" size={18} /> : <Moon color="#a94d43" size={18} />}
    <Text style={styles.themeButtonText}>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    backgroundColor: '#a94d43',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 15,
    minHeight: 52,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  field: {
    gap: 7,
    marginTop: 14,
  },
  fieldInput: {
    color: '#fff4eb',
    flex: 1,
    fontSize: 16,
    minHeight: 48,
  },
  fieldInputLight: {
    color: '#4d3532',
  },
  inputLight: {
    backgroundColor: '#fffdfb',
    borderColor: 'rgba(169,77,67,.22)',
    color: '#4d3532',
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: 'rgba(2,13,25,.65)',
    borderColor: 'rgba(117,231,216,.2)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 12,
  },
  label: {
    color: '#d8c4bb',
    fontSize: 13,
    fontWeight: '800',
  },
  labelLight: {
    color: '#755750',
  },
  themeButton: {
    alignItems: 'center',
    borderColor: 'rgba(242,140,107,.35)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  themeButtonText: {
    color: '#f28c6b',
    fontSize: 14,
    fontWeight: '800',
  },
});
