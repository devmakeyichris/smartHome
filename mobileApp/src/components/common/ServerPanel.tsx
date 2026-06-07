import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {ChevronDown, ChevronUp, Server, Zap} from 'lucide-react-native';
import {useLightTheme} from '../../config/theme';
import type {BackendStatus} from '../../types/smartHome';
import Glass from './Glass';

type ServerPanelProps = {
  apiBase: string;
  backendStatus: BackendStatus;
  busy: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  show: boolean;
  testBackend: () => void;
};

const ServerPanel = ({
  apiBase,
  backendStatus,
  busy,
  onChange,
  onToggle,
  show,
  testBackend,
}: ServerPanelProps) => {
  const light = useLightTheme();

  return (
    <Glass>
      <Pressable onPress={onToggle} style={styles.spaceBetween}>
        <View style={styles.inline}>
          <Server color="#f28c6b" size={19} />
          <View>
            <Text style={[styles.panelTitle, light && styles.panelTitleLight]}>Connexion serveur</Text>
            <Text style={[styles.meta, light && styles.metaLight]}>
              {backendStatus === 'online' ? 'Backend detecte' : 'Configuration reseau'}
            </Text>
          </View>
        </View>
        {show ? <ChevronUp color="#d8c4bb" /> : <ChevronDown color="#d8c4bb" />}
      </Pressable>
      {show ? (
        <View style={styles.serverBody}>
          <TextInput
            onChangeText={onChange}
            style={[styles.input, light && styles.inputLight]}
            value={apiBase}
          />
          <Pressable onPress={testBackend} style={styles.iconButton}>
            {busy ? <ActivityIndicator color="#fff" /> : <Zap color="#fff" />}
          </Pressable>
        </View>
      ) : null}
    </Glass>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#a94d43',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 46,
    minWidth: 46,
  },
  inline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  input: {
    backgroundColor: 'rgba(2,13,25,.65)',
    borderColor: 'rgba(117,231,216,.2)',
    borderRadius: 8,
    borderWidth: 1,
    color: '#fff4eb',
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  inputLight: {
    backgroundColor: '#fffdfb',
    borderColor: 'rgba(169,77,67,.22)',
    color: '#4d3532',
  },
  meta: {
    color: '#b6a49d',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
  metaLight: {
    color: '#8b6b63',
  },
  panelTitle: {
    color: '#fff4eb',
    fontSize: 16,
    fontWeight: '800',
  },
  panelTitleLight: {
    color: '#4d3532',
  },
  serverBody: {
    alignItems: 'center',
    borderTopColor: 'rgba(242,140,107,.16)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
  },
  spaceBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ServerPanel;
