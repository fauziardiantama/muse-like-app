import { Text } from 'react-native';

// Feather glyphs rendered as plain Text, bypassing @expo/vector-icons'
// Feather component on purpose. That component gates rendering on
// expo-font loadAsync, which can never succeed in this app: the APK ships
// no res/raw or res/font, so the native asset lookup fails, and the
// failure is swallowed (no catch, no retry) — the component then renders
// an empty Text forever. React Native's own font fallback resolves this
// family straight from assets/fonts/<family>.ttf, which the build ships
// when the file is required below (preview-14 proved the point by
// omission: with no require left, Metro dropped the feather file from
// the APK entirely and only 3 .ttf remained).
const FEATHER_FAMILY = 'assets_fonts_feather';

// Bare require on purpose: it forces Metro to include the project-local
// Feather file in the APK as assets/fonts/assets_fonts_feather.ttf (the
// flattened project-asset name, as preview-13 already demonstrated).
// The value is never used — the family name above is what renders it.
require('../assets/fonts/Feather.ttf');

// Codepoints from @expo/vector-icons' Feather glyph map. Feather has no
// lightbulb glyph, so the Ide tab uses zap as its stand-in.
const GLYPHS = {
  menu: 61852,
  'message-circle': 61853,
  'file-text': 61804,
  zap: 61979,
  'check-square': 61741,
  grid: 61821,
  archive: 61707,
  settings: 61907,
  search: 61904,
  edit: 61791,
  camera: 61736,
  image: 61829,
  file: 61801,
  plus: 61888,
  'arrow-up': 61716,
  'arrow-down': 61708,
  'corner-up-left': 61774,
  mic: 61855,
  'chevron-left': 61743,
  'chevron-right': 61744,
  'credit-card': 61777,
  shield: 61910,
  'user-check': 61958,
  smartphone: 61921,
  bell: 61726,
  'pen-tool': 61876,
  lock: 61843,
  phone: 61878,
};

export default function Icon({ name, size = 24, color = '#fff', style }) {
  const code = GLYPHS[name];
  if (code == null) return null;
  return (
    <Text style={[{ fontFamily: FEATHER_FAMILY, fontSize: size, color }, style]}>
      {String.fromCharCode(code)}
    </Text>
  );
}
