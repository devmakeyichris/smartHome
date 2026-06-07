import React, {useContext} from 'react';
import type {AppTheme} from '../types/smartHome';

export const ThemeContext = React.createContext<AppTheme>('dark');

export const useLightTheme = () => useContext(ThemeContext) === 'light';
