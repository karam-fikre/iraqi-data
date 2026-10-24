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
//   capital: { ar: 'البصرة', en: 'Basra' },
//   aliases: ['Basrah']
// }

getGovernorate('هولير')?.en;   // 'Erbil'
getGovernorate('IQ-NI')?.capital.en;  // 'Mosul'

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
  capital: { ar: string; en: string };
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

| Arabic | English | Kurdish | Capital | ISO | Region |
| --- | --- | --- | --- | --- | --- |
| بغداد | Baghdad | بەغدا | Baghdad | IQ-BG | federal |
| البصرة | Basra | بەسرە | Basra | IQ-BA | federal |
| نينوى | Nineveh | نەینەوا | Mosul | IQ-NI | federal |
| الأنبار | Anbar | ئەنبار | Ramadi | IQ-AN | federal |
| صلاح الدين | Salah al-Din | سەلاحەدین | Tikrit | IQ-SD | federal |
| كركوك | Kirkuk | کەرکووک | Kirkuk | IQ-KI | federal |
| ديالى | Diyala | دیالە | Baqubah | IQ-DI | federal |
| واسط | Wasit | واسیت | Kut | IQ-WA | federal |
| بابل | Babil | بابل | Hillah | IQ-BB | federal |
| كربلاء | Karbala | کەربەلا | Karbala | IQ-KA | federal |
| النجف | Najaf | نەجەف | Najaf | IQ-NA | federal |
| القادسية | Al-Qadisiyyah | قادسیە | Diwaniyah | IQ-QA | federal |
| المثنى | Muthanna | موسەننا | Samawah | IQ-MU | federal |
| ذي قار | Dhi Qar | زیقار | Nasiriyah | IQ-DQ | federal |
| ميسان | Maysan | مەیسان | Amarah | IQ-MA | federal |
| أربيل | Erbil | هەولێر | Erbil | IQ-AR | kurdistan |
| السليمانية | Sulaymaniyah | سلێمانی | Sulaymaniyah | IQ-SU | kurdistan |
| دهوك | Duhok | دهۆک | Duhok | IQ-DA | kurdistan |
| حلبجة | Halabja | هەڵەبجە | Halabja | — | kurdistan |

Halabja was approved as Iraq's 19th governorate by the Iraqi parliament in 2025. It doesn't have an ISO 3166-2 code yet, so its `iso` is `null`.

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
