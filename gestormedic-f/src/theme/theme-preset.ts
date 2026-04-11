import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

const GMPreset = definePreset(Aura, {
    primitive: {
        yale: {
            50: '#ecf2f7',
            100: '#d1e0ed',
            200: '#a3c1db',
            300: '#75a1c9',
            400: '#4782b7',
            500: '#1a3c5a',
            600: '#173652',
            700: '#132d44',
            800: '#102639',
            900: '#0c1e2d',
            950: '#07121b'
        },
        energy: {
            50: '#ebf4fc',
            100: '#cee3f8',
            200: '#a1c8f1',
            300: '#73adea',
            400: '#5e9fe6',
            500: '#4a90e2',
            600: '#4382cc',
            700: '#34659e',
            800: '#254871',
            900: '#162b44',
            950: '#0f1d2d'
        },
        slate: {
            50: '#eff2f3',
            100: '#d7dfe2',
            200: '#b0c0c6',
            300: '#88a0aa',
            400: '#748e9a',
            500: '#607d8b',
            600: '#56717d',
            700: '#435861',
            800: '#303f45',
            900: '#1d262a',
            950: '#13191c'
        }
    },
    semantic: {
        primary: {
            50: '{energy.50}',
            100: '{energy.100}',
            200: '{energy.200}',
            300: '{energy.300}',
            400: '{energy.400}',
            500: '{energy.500}',
            600: '{energy.600}',
            700: '{energy.700}',
            800: '{energy.800}',
            900: '{energy.900}',
            950: '{energy.950}'
        },
        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff',
                    50: '#f4f7f9',
                    100: '{slate.50}',
                    200: '{slate.100}',
                    300: '{slate.200}',
                    400: '{slate.300}',
                    500: '{slate.400}',
                    600: '{slate.500}',
                    700: '{slate.600}',
                    800: '{slate.700}',
                    900: '{slate.800}',
                    950: '{slate.900}'
                },
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.600}',
                    activeColor: '{primary.700}'
                },
                highlight: {
                    background: '{energy.50}',
                    focusBackground: '{energy.100}',
                    color: '{energy.700}',
                    focusColor: '{energy.800}'
                }
            },
            dark: {
                surface: {
                    0: '#ffffff',
                    50: '{yale.950}',
                    100: '{yale.900}',
                    200: '{yale.800}',
                    300: '{yale.700}',
                    400: '{yale.600}',
                    500: '{yale.500}',
                    600: '{yale.400}',
                    700: '{yale.300}',
                    800: '{yale.200}',
                    900: '{yale.100}',
                    950: '{yale.50}'
                },
                primary: {
                    color: '{primary.400}',
                    contrastColor: '{yale.950}',
                    hoverColor: '{primary.300}',
                    activeColor: '{primary.200}'
                },
                highlight: {
                    background: '{yale.900}',
                    focusBackground: '{yale.800}',
                    color: '{primary.50}',
                    focusColor: '{primary.100}'
                }
            }
        }
    }
});

export default GMPreset;
