import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

const GMPreset = definePreset(Aura, {
    primitive: {
        yale: {
            50: '#f0f4f8',
            100: '#d1e0ed',
            200: '#a3c1db',
            300: '#75a1c9',
            400: '#4782b7',
            500: '#1a3c5a',
            600: '#173652',
            700: '#132d44',
            800: '#102639',
            900: '#0c1e2d', // Color base solicitado
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
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617'
                },
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.600}',
                    activeColor: '{primary.700}'
                }
            },
            dark: {
                surface: {
                    0: '{yale.950}',
                    50: '{yale.900}',  // Fondo base oscuro solicitado (#0c1e2d)
                    100: '{yale.800}',
                    200: '{yale.700}',
                    300: '{yale.600}',
                    400: '{yale.500}',
                    500: '{yale.400}',
                    600: '{yale.300}',
                    700: '{yale.200}',
                    800: '#e2e8f0',
                    900: '#f1f5f9',
                    950: '#ffffff'
                },
                primary: {
                    color: '{primary.400}',
                    contrastColor: '{yale.950}',
                    hoverColor: '{primary.300}',
                    activeColor: '{primary.200}'
                }
            }
        }
    }
});

export default GMPreset;
