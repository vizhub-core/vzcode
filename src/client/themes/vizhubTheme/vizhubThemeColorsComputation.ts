import { hcl } from 'd3-color';

const sidebarDark = hcl('#3d4b65');
const sidebarLight = hcl('#5b677d');

const luminaceDifference = sidebarLight.l - sidebarDark.l;

const backgroundLuminance =
  sidebarDark.l - luminaceDifference * 1.1;
export const backgroundColor = hcl(
  sidebarDark.h,
  sidebarDark.c,
  backgroundLuminance,
).formatHex();

const luminance = 90;

// The luminance difference between background and foreground
// measured in the OneDark Pro VSCode theme.
// const oneDarkContrast = 62;

// Use this to check luminance difference (contrast).
// console.log(luminance - backgroundLuminance);

const saturation = 70;
export const light = hcl(0, 0, luminance).formatHex();
const dark = hcl(
  sidebarDark.h,
  sidebarDark.c,
  80,
).formatHex();

export const defaultRotation = 0.397;

export const vizhubThemeColorsComputation = (
  rotation = defaultRotation,
) => {
  const entries = [
    'keyword',
    [
      'tag',
      'variable',
      'variable2',
      'variable3',
      'definition',
    ],
    ['qualifier', 'builtin', 'header'],
    ['string', 'string2'],
    ['atom', 'number'],
    ['link', 'attribute', 'property'],
  ];

  const lightEntries = ['operator'];

  const theme: any = {
    container: {
      color: light,
      backgroundColor,
    },
    headerBackgroundColor: hcl(
      sidebarDark.h,
      sidebarDark.c,
      (backgroundLuminance + sidebarDark.l) / 2,
    ).formatHex(),
    selectionBackground: '#000',
    lineNumbers: {
      color: 'rgba(255,255,255,0.2)',
      cursor: 'pointer',
    },
    //keyword: { color: '#c679de' },
    //atom: { color: '#98c379' },
    //property: { color: '#61afef' },
    //number: { color: '#d19a66' },
    comment: { color: dark },
    meta: { color: dark },
    //variable: { color: '#5bafef' },
    //number: { color: light },
    fatCursor: {
      backgroundColor: 'rgba(228, 232, 255, 0.3)',
    },
    default: { color: light },
    link: {
      cursor: 'pointer',
    },
  };

  theme.searching = theme.fatCursor;

  theme.colors = entries.map((entry, i) => {
    const t = ((i + 0) / entries.length + rotation) % 1;
    const color = hcl(
      t * 360,
      saturation,
      luminance,
    ).formatHex();
    const keys =
      typeof entry === 'string' ? [entry] : entry;
    keys.forEach((key) => {
      theme[key] = Object.assign({}, theme[key], { color });
    });
    return color;
  });

  theme.link.textDecoration = 'none';
  theme.header.fontWeight = 'normal';

  lightEntries.forEach((key) => {
    theme[key] = { color: light };
  });

  theme.colors.push(theme.colors[0]);
  theme.colors.push(light);

  theme.caretColor = 'white';

  theme.gutters = theme.gutter = Object.assign(
    {},
    theme.container,
    {
      border: 'none',
    },
  );

  theme.matchingBracket = {
    color: theme.container.color,
    borderBottom: '1px solid rgba(255,255,255,0.4)',
  };

  return theme;
};
