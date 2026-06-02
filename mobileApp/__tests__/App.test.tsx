/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Alert, TextInput} from 'react-native';
import App from '../App';

jest.mock('react-native-safe-area-context', () => {
  const ReactLib = require('react');
  const {View} = require('react-native');
  const SafeArea = ({children}: {children: React.ReactNode}) =>
    ReactLib.createElement(View, null, children);

  return {
    SafeAreaProvider: SafeArea,
    SafeAreaView: SafeArea,
  };
});

const pressText = (instance: ReactTestRenderer.ReactTestInstance) => {
  let pressable: ReactTestRenderer.ReactTestInstance | null = instance;

  while (pressable && typeof pressable.props.onPress !== 'function') {
    pressable = pressable.parent;
  }

  if (!pressable) {
    throw new Error('Pressable ancestor not found');
  }

  pressable.props.onPress();
};

test('renders correctly', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
});

test('opens the registration form', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  const registerLabel = renderer!.root.findByProps({
    children: 'Creer un compte ou rejoindre une maison',
  });

  await ReactTestRenderer.act(() => {
    pressText(registerLabel);
  });

  expect(renderer!.root.findByProps({children: 'Inscription'})).toBeTruthy();
  expect(renderer!.root.findByProps({children: 'Piece 1'})).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
});

test('controls a demo light from the interactive house scene', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  const demoLabel = renderer!.root.findByProps({
    children: 'Lancer la demonstration',
  });

  await ReactTestRenderer.act(() => {
    pressText(demoLabel);
  });

  expect(
    renderer!.root.findByProps({children: 'Bonjour Marie'}),
  ).toBeTruthy();

  const cuisine = renderer!.root.findByProps({
    accessibilityLabel: 'Explorer Cuisine',
  });

  await ReactTestRenderer.act(() => {
    cuisine.props.onPress();
  });

  const [turnOnLabel] = renderer!.root.findAllByProps({children: 'Allumer la LED'});

  await ReactTestRenderer.act(() => {
    pressText(turnOnLabel);
  });

  expect(
    renderer!.root.findAllByProps({children: 'Eteindre la LED'}).length,
  ).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
});

test('navigates through the connected home sections and runs a quick scene', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    pressText(renderer!.root.findByProps({children: 'Lancer la demonstration'}));
  });

  await ReactTestRenderer.act(async () => {
    await renderer!.root.findByProps({accessibilityLabel: 'Scene Nuit'}).props.onPress();
  });

  expect(renderer!.root.findByProps({children: 'Activite'})).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({accessibilityLabel: 'Onglet Activite'}).props.onPress();
  });

  expect(renderer!.root.findByProps({children: 'Journal de maison'})).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({accessibilityLabel: 'Onglet Acces'}).props.onPress();
  });

  expect(renderer!.root.findByProps({children: 'Acces RFID'})).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({accessibilityLabel: 'Ajouter un badge RFID'}).props.onPress();
  });

  expect(renderer!.root.findByProps({children: 'Nouveau badge 3'})).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({accessibilityLabel: 'Suspendre Badge principal'}).props.onPress();
  });

  expect(renderer!.root.findByProps({children: 'SUSPENDU'})).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({accessibilityLabel: 'Onglet Reglages'}).props.onPress();
  });

  expect(renderer!.root.findAllByProps({children: 'Reglages'}).length).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({accessibilityLabel: 'Nom de la nouvelle piece'}).props.onChangeText('Bureau');
  });

  await ReactTestRenderer.act(async () => {
    await renderer!.root.findByProps({accessibilityLabel: 'Ajouter la piece'}).props.onPress();
  });

  expect(renderer!.root.findByProps({children: 'Bureau'})).toBeTruthy();
  expect(renderer!.root.findByProps({children: 'EXTENSION'})).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({accessibilityLabel: 'Onglet Maison'}).props.onPress();
  });

  expect(renderer!.root.findByProps({accessibilityLabel: 'Explorer Bureau'})).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({accessibilityLabel: 'Explorer Bureau'}).props.onPress();
  });

  expect(renderer!.root.findAllByProps({children: 'Bureau'}).length).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    pressText(renderer!.root.findByProps({children: 'Allumer la LED'}));
  });

  expect(renderer!.root.findByProps({children: 'Eteindre la LED'})).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({accessibilityLabel: 'Configurer Bureau'}).props.onPress();
  });

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({accessibilityLabel: 'PIN du nouveau module'}).props.onChangeText('12');
  });

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({accessibilityLabel: 'Choisir une porte'}).props.onPress();
  });

  await ReactTestRenderer.act(async () => {
    await renderer!.root.findByProps({accessibilityLabel: 'Associer le module'}).props.onPress();
  });

  expect(renderer!.root.findByProps({accessibilityLabel: 'Supprimer door PIN 12'})).toBeTruthy();

  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
    buttons?.find(button => button.text === 'Supprimer')?.onPress?.();
  });

  await ReactTestRenderer.act(async () => {
    renderer!.root.findByProps({accessibilityLabel: 'Supprimer door PIN 12'}).props.onPress();
    await Promise.resolve();
  });

  expect(renderer!.root.findAllByProps({accessibilityLabel: 'Supprimer door PIN 12'})).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    renderer!.root.findByProps({accessibilityLabel: 'Supprimer la piece Bureau'}).props.onPress();
    await Promise.resolve();
  });

  expect(renderer!.root.findAllByProps({children: 'Bureau'})).toHaveLength(0);
  alertSpy.mockRestore();

  await ReactTestRenderer.act(() => {
    renderer!.root.findByProps({accessibilityLabel: 'Activer le mode clair'}).props.onPress();
  });

  expect(renderer!.root.findByProps({accessibilityLabel: 'Activer le mode sombre'})).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
});

test('keeps the app stable when login returns an incomplete house configuration', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    text: async () => JSON.stringify({
      email: 'ana@smarthome.local',
      homeConfig: {unexpected: true},
      nom: 'Test',
      nomMaison: 'Maison Test',
      prenom: 'Ana',
    }),
  }) as jest.Mock;
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  const [serverInput, emailInput, passwordInput] = renderer!.root.findAllByType(TextInput);
  expect(serverInput.props.value).toContain('8080');

  await ReactTestRenderer.act(() => {
    emailInput.props.onChangeText('ana@smarthome.local');
    passwordInput.props.onChangeText('secret');
  });

  await ReactTestRenderer.act(async () => {
    await pressText(renderer!.root.findByProps({children: 'Se connecter'}));
  });

  expect(renderer!.root.findByProps({children: 'Bonjour Ana'})).toBeTruthy();

  await ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
  globalThis.fetch = originalFetch;
});
