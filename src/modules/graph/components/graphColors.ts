// Stable colors with distinct light/dark backgrounds; values also have a table.
const colors = ['#1565c0', '#7b1fa2', '#00695c', '#ad1457', '#5d4037', '#37474f'];
const darkColors = ['#90caf9', '#ce93d8', '#80cbc4', '#f48fb1', '#bcaaa4', '#b0bec5'];
export const graphColor = (index: number, mode: 'light' | 'dark') =>
    (mode === 'dark' ? darkColors : colors)[index % colors.length];
