import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {LockKeyhole, Mail, Play} from 'lucide-react-native';
import {useLightTheme} from '../../config/theme';
import Glass from '../common/Glass';
import {ActionButton, Field} from '../common/FormControls';

type LoginPanelProps = {
  busy: boolean;
  email: string;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  openRegister: () => void;
  password: string;
  startDemo: () => void;
  submit: () => void;
};

const LoginPanel = ({
  busy,
  email,
  onEmail,
  onPassword,
  openRegister,
  password,
  startDemo,
  submit,
}: LoginPanelProps) => {
  const light = useLightTheme();

  return (
    <Glass>
      <Text style={[styles.sectionTitle, light && styles.sectionTitleLight]}>Connexion</Text>
      <Text style={[styles.meta, light && styles.metaLight]}>Accede a ta console de pilotage.</Text>
      <Field Icon={Mail} label="Email" onChangeText={onEmail} value={email} />
      <Field
        Icon={LockKeyhole}
        label="Mot de passe"
        onChangeText={onPassword}
        secureTextEntry
        value={password}
      />
      <ActionButton label={busy ? 'Connexion...' : 'Se connecter'} onPress={submit} />
      <Pressable onPress={startDemo} style={styles.demoButton}>
        <Play color="#f28c6b" />
        <Text style={styles.demoText}>Lancer la demonstration</Text>
      </Pressable>
      <Pressable onPress={openRegister}>
        <Text style={styles.link}>Creer un compte ou rejoindre une maison</Text>
      </Pressable>
    </Glass>
  );
};

const styles = StyleSheet.create({
  demoButton: {
    alignItems: 'center',
    borderColor: 'rgba(242,140,107,.50)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 50,
  },
  demoText: {
    color: '#f28c6b',
    fontSize: 15,
    fontWeight: '800',
  },
  link: {
    color: '#f28c6b',
    fontSize: 15,
    fontWeight: '800',
    paddingVertical: 17,
    textAlign: 'center',
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
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionTitleLight: {
    color: '#4d3532',
  },
});

export default LoginPanel;
