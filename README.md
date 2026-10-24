# iraqi-data

**English** | [العربية](README.ar.md)

[![npm version](https://img.shields.io/npm/v/iraqi-data.svg)](https://www.npmjs.com/package/iraqi-data)
[![CI](https://github.com/karam-fikre/iraqi-data/actions/workflows/ci.yml/badge.svg)](https://github.com/karam-fikre/iraqi-data/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/iraqi-data.svg)](LICENSE)

The governorates of Iraq in Arabic, English and Kurdish, ready for address forms, dropdowns and delivery apps. Lookup and search understand the different ways people spell the same place: `البصرة`, `البصره`, `Basrah` and `بەسرە` all find Basra.

Works in **Node.js**, the **browser**, **React**, **React Native / Expo** and **Vue**, with TypeScript types included. No dependencies.

## Install

```bash
npm install iraqi-data
# or
yarn add iraqi-data
```

## Usage

```ts
import { governorates, getGovernorate, searchGovernorates } from 'iraqi-data';
// CommonJS: const { governorates, getGovernorate } = require('iraqi-data');

getGovernorate('Basrah');
// {
//   id: 'basra',
//   iso: 'IQ-BA',
//   ar: 'البصرة',
//   en: 'Basra',
//   ku: 'بەسرە',
//   region: 'federal',
//   capital: { ar: 'البصرة', en: 'Basra', lat: 30.4952, lng: 47.8091 },
//   aliases: ['Basrah']
// }

getGovernorate('هولير')?.en;   // 'Erbil'
getGovernorate('IQ-NI')?.capital.en;  // 'Mosul'
getGovernorate('Erbil')?.capital;     // { ar: 'أربيل', en: 'Erbil', lat: 36.1912, lng: 44.0094 }

searchGovernorates('نجف').map((g) => g.en);  // ['Najaf']
searchGovernorates('ba').map((g) => g.en);   // ['Baghdad', 'Basra', 'Babil', 'Anbar', 'Karbala']
```

### Dropdown example (React)

```tsx
import { governorates } from 'iraqi-data';

export function GovernorateSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {governorates.map((g) => (
        <option key={g.id} value={g.id}>{g.ar}</option>
      ))}
    </select>
  );
}
```

Store the `id` (`'baghdad'`, `'basra'`, …) in your database, not the display name. Ids never change, while a name's spelling may be corrected in a later version.

## API

### `governorates: readonly Governorate[]`

All 19 governorates: the 15 of federal Iraq, then the 4 of the Kurdistan Region. The array and its objects are frozen.

```ts
interface Governorate {
  id: string;            // stable id to store: 'baghdad'
  iso: string | null;    // ISO 3166-2 code: 'IQ-BG' (null for Halabja, which has none yet)
  ar: string;            // Arabic name
  en: string;            // English name
  ku: string;            // Kurdish (Sorani) name
  region: 'federal' | 'kurdistan';
  capital: { ar: string; en: string; lat: number; lng: number };  // capital city and its center
  aliases: string[];     // other spellings: 'Basrah', 'Arbil', 'Hawler'
}
```

### `getGovernorate(query: string): Governorate | undefined`

Finds one governorate by its id, ISO code, or full name in any language, including the aliases. Returns `undefined` if nothing matches. Partial names don't match; use `searchGovernorates` for those.

### `searchGovernorates(query: string): Governorate[]`

Finds every governorate whose name contains the query, for autocomplete. Exact matches come first, then names that start with the query, then the rest. An empty query returns `[]`.

### `getGovernoratesByRegion(region: 'federal' | 'kurdistan'): Governorate[]`

The governorates of federal Iraq or of the Kurdistan Region.

### `normalize(text: string): string`

The function lookup and search use to compare names. It's exported so you can compare your own stored values the same way.

| Ignores | Example |
| --- | --- |
| Hamza forms | `أ إ آ` → `ا` |
| Taa marbuta and alef maqsura | `ة` → `ه`, `ى` → `ي` |
| Tashkeel and tatweel | `البَصْرَة` → `بصره` |
| The article | `البصرة`, `Al-Basrah`, `As Sulaymaniyah` |
| Kurdish letters typed on an Arabic keyboard | `سلێمانی` = `سليماني`, `دهۆک` = `دهوك` |
| Case, spaces, hyphens | `Dhi Qar` = `dhiqar` |

```ts
normalize('Al-Qadisiyyah');  // 'qadisiyyah'
normalize('البَصْرَة');       // 'بصره'
```

## Data

| Arabic | English | Kurdish | Capital | Coordinates | ISO | Region |
| --- | --- | --- | --- | --- | --- | --- |
| بغداد | Baghdad | بەغدا | Baghdad | 33.3062, 44.3872 | IQ-BG | federal |
| البصرة | Basra | بەسرە | Basra | 30.4952, 47.8091 | IQ-BA | federal |
| نينوى | Nineveh | نەینەوا | Mosul | 36.3416, 43.1291 | IQ-NI | federal |
| الأنبار | Anbar | ئەنبار | Ramadi | 33.4260, 43.2999 | IQ-AN | federal |
| صلاح الدين | Salah al-Din | سەلاحەدین | Tikrit | 34.6158, 43.6786 | IQ-SD | federal |
| كركوك | Kirkuk | کەرکووک | Kirkuk | 35.4719, 44.3954 | IQ-KI | federal |
| ديالى | Diyala | دیالە | Baqubah | 33.7447, 44.6328 | IQ-DI | federal |
| واسط | Wasit | واسیت | Kut | 32.5147, 45.8189 | IQ-WA | federal |
| بابل | Babil | بابل | Hillah | 32.4822, 44.4328 | IQ-BB | federal |
| كربلاء | Karbala | کەربەلا | Karbala | 32.5984, 44.0158 | IQ-KA | federal |
| النجف | Najaf | نەجەف | Najaf | 32.0010, 44.3300 | IQ-NA | federal |
| القادسية | Al-Qadisiyyah | قادسیە | Diwaniyah | 31.9892, 44.9247 | IQ-QA | federal |
| المثنى | Muthanna | موسەننا | Samawah | 31.3079, 45.2827 | IQ-MU | federal |
| ذي قار | Dhi Qar | زیقار | Nasiriyah | 31.0440, 46.2399 | IQ-DQ | federal |
| ميسان | Maysan | مەیسان | Amarah | 31.8498, 47.1496 | IQ-MA | federal |
| أربيل | Erbil | هەولێر | Erbil | 36.1912, 44.0094 | IQ-AR | kurdistan |
| السليمانية | Sulaymaniyah | سلێمانی | Sulaymaniyah | 35.5571, 45.4426 | IQ-SU | kurdistan |
| دهوك | Duhok | دهۆک | Duhok | 36.8543, 42.9925 | IQ-DA | kurdistan |
| حلبجة | Halabja | هەڵەبجە | Halabja | 35.1792, 45.9874 | — | kurdistan |

Halabja was approved as Iraq's 19th governorate by the Iraqi parliament in 2025. It doesn't have an ISO 3166-2 code yet, so its `iso` is `null`.

Coordinates are the center of each capital city, from [OpenStreetMap](https://www.openstreetmap.org) (Kut and Diwaniyah from [Wikidata](https://www.wikidata.org)), rounded to 4 decimal places (about 11 m). Sources place a city's center differently by up to about 3 km, so use them for map pins and distances, not as exact addresses.

## Roadmap

- Districts (أقضية) of each governorate
- Sub-districts (نواحي)

## Contributing

Corrections are very welcome, especially Kurdish spellings and other common spellings that should be added as aliases. Open an issue or a pull request that edits [`src/governorates.json`](src/governorates.json).

### Development

```bash
npm install
npm test           # run the tests
npm run typecheck  # check the types
npm run build      # build dist/ (CommonJS and ES modules)
```

## License

[MIT](LICENSE) © Karam Al-Dulaimi
