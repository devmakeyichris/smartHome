import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {DoorOpen, LockKeyhole, Mail, Plus, RadioTower, Server, ShieldCheck} from 'lucide-react-native';
import {useLightTheme} from '../../config/theme';
import type {RegisterForm, Room} from '../../types/smartHome';
import {newRoom} from '../../utils/rooms';
import Glass from '../common/Glass';
import {ActionButton, Field} from '../common/FormControls';

type RegisterPanelProps = {
  busy: boolean;
  form: RegisterForm;
  rooms: Room[];
  setForm: (value: RegisterForm) => void;
  setRooms: (value: Room[]) => void;
  submit: () => void;
  toLogin: () => void;
};

const RegisterPanel = ({
  busy,
  form,
  rooms,
  setForm,
  setRooms,
  submit,
  toLogin,
}: RegisterPanelProps) => {
  const light = useLightTheme();

  return (
    <Glass>
      <View style={styles.inline}>
        <ShieldCheck color="#f28c6b" />
        <Text style={[styles.sectionTitle, light && styles.sectionTitleLight]}>Inscription</Text>
      </View>
      {(['prenom', 'nom', 'email', 'password', 'nomMaison', 'houseId'] as Array<keyof RegisterForm>).map(key => (
        <Field
          Icon={
            key === 'email'
              ? Mail
              : key === 'password'
                ? LockKeyhole
                : key === 'nomMaison'
                  ? RadioTower
                  : key === 'houseId'
                    ? Server
                    : ShieldCheck
          }
          key={key}
          label={key === 'houseId' ? 'ID maison invitation (optionnel)' : key}
          onChangeText={(value: string) => setForm({...form, [key]: value})}
          secureTextEntry={key === 'password'}
          value={form[key]}
        />
      ))}
      {!form.houseId
        ? rooms.map((room: Room, index: number) => (
            <Field
              Icon={DoorOpen}
              key={`${index}`}
              label={`Piece ${index + 1}`}
              onChangeText={(value: string) =>
                setRooms(
                  rooms.map((item: Room, itemIndex: number) =>
                    itemIndex === index ? {...item, roomName: value} : item,
                  ),
                )
              }
              value={room.roomName}
            />
          ))
        : null}
      {!form.houseId ? (
        <Pressable onPress={() => setRooms([...rooms, newRoom()])} style={styles.demoButton}>
          <Plus color="#f28c6b" />
          <Text style={styles.demoText}>Ajouter une piece</Text>
        </Pressable>
      ) : null}
      <ActionButton label={busy ? 'Creation...' : 'Finaliser'} onPress={submit} />
      <Pressable onPress={toLogin}>
        <Text style={styles.link}>J ai deja un compte</Text>
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
  inline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  link: {
    color: '#f28c6b',
    fontSize: 15,
    fontWeight: '800',
    paddingVertical: 17,
    textAlign: 'center',
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

export default RegisterPanel;
