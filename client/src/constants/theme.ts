import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { Colors } from './colors';

export const RepTheme: Theme = {
    ...DarkTheme,
    dark: true,
    colors: {
        ...DarkTheme.colors,
        primary: Colors.Primary,
        background: Colors.Background,
        card: Colors.Surface,
        text: Colors.TextPrimary,
        border: Colors.Border,
        notification: Colors.Primary,
    },
};
