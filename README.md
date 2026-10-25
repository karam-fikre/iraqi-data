# iraqi-data

**English** | [العربية](README.ar.md)

[![npm version](https://img.shields.io/npm/v/iraqi-data.svg)](https://www.npmjs.com/package/iraqi-data)
[![CI](https://github.com/karam-fikre/iraqi-data/actions/workflows/ci.yml/badge.svg)](https://github.com/karam-fikre/iraqi-data/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/iraqi-data.svg)](LICENSE)

The governorates of Iraq and their districts in Arabic, English and Kurdish, ready for address forms, dropdowns and delivery apps. Lookup and search understand the different ways people spell the same place: `البصرة`, `البصره`, `Basrah` and `بەسرە` all find Basra.

Works in **Node.js**, the **browser**, **React**, **React Native / Expo** and **Vue**, with TypeScript types included. No dependencies.

## Install

```bash
npm install iraqi-data
# or
yarn add iraqi-data
```

The whole package, data included, is about 11 KB gzipped.

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

### Districts

```ts
import { getDistrict, searchDistricts, getDistrictsByGovernorate } from 'iraqi-data';

getDistrict('ابو غريب');
// {
//   id: 'abughraib',
//   governorateId: 'baghdad',
//   pcode: null,
//   ar: 'أبو غريب',
//   en: 'Abu Ghraib',
//   ku: 'ئەبو غرێب',
//   center: { ar: 'أبو غريب', en: 'Abu Ghraib', lat: 33.3145, lng: 44.1682 },
//   aliases: []
// }

getDistrict('الدغارة')?.en;                   // 'Akkad' (Daghara is its seat)
getDistrictsByGovernorate('البصرة').length;    // 11
searchDistricts('كر', { governorate: 'baghdad' }).map((d) => d.en);  // ['Karkh']
```

### Address dropdowns (React)

A governorate dropdown, and a district dropdown that lists the chosen governorate's districts:

```tsx
import { useState } from 'react';
import { governorates, getDistrictsByGovernorate } from 'iraqi-data';

export function AddressSelect() {
  const [governorate, setGovernorate] = useState('');
  const [district, setDistrict] = useState('');

  return (
    <>
      <select value={governorate} onChange={(e) => { setGovernorate(e.target.value); setDistrict(''); }}>
        <option value="">Governorate</option>
        {governorates.map((g) => (
          <option key={g.id} value={g.id}>{g.en}</option>
        ))}
      </select>

      <select value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!governorate}>
        <option value="">District</option>
        {getDistrictsByGovernorate(governorate).map((d) => (
          <option key={d.id} value={d.id}>{d.en}</option>
        ))}
      </select>
    </>
  );
}
```

Use `g.ar` / `d.ar` or `g.ku` / `d.ku` for an Arabic or Kurdish form. Store the ids (`'baghdad'`, `'abughraib'`, …) in your database, not the display names. Ids never change, while a name's spelling may be corrected in a later version.

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

### `districts: readonly District[]`

All 182 districts (أقضية), grouped by governorate in the same order as `governorates`, then sorted by English name. The array and its objects are frozen.

```ts
interface District {
  id: string;             // stable id to store: 'abughraib'
  governorateId: string;  // the governorate's id: 'baghdad'
  pcode: string | null;   // OCHA P-code: 'IQG08Q01' (null if OCHA doesn't list it as a district)
  ar: string;             // Arabic name
  en: string;             // English name
  ku: string;             // Kurdish (Sorani) name
  center: { ar: string; en: string; lat: number; lng: number };  // the town the district is run from
  aliases: string[];      // other spellings and names: 'Daghara' for Akkad
}
```

### `getDistrict(query: string): District | undefined`

Finds one district by its id, P-code, or full name in any language, including the aliases. Works like `getGovernorate`.

### `searchDistricts(query: string, options?: { governorate?: string }): District[]`

Finds every district whose name contains the query, ranked like `searchGovernorates`. Pass `governorate` (anything `getGovernorate` accepts) to search only that governorate's districts.

### `getDistrictsByGovernorate(governorate: string): District[]`

The districts of one governorate, found by anything `getGovernorate` accepts: `'basra'`, `'البصرة'`, `'IQ-BA'`. Returns `[]` for an unknown governorate.

### `normalize(text: string): string`

The function lookup and search use to compare names. It's exported so you can compare your own stored values the same way.

| Ignores | Example |
| --- | --- |
| Hamza forms | `أ إ آ` → `ا` |
| Taa marbuta and alef maqsura | `ة` → `ه`, `ى` → `ي` |
| Tashkeel and tatweel | `البَصْرَة` → `بصره` |
| The article | `البصرة`, `Al-Basrah`, `As Sulaymaniyah` |
| Kurdish letters typed on an Arabic keyboard | `سلێمانی` = `سليماني`, `دهۆک` = `دهوك` |
| The two forms of heh used in Kurdish | `ھەولێر` = `هەولێر` |
| Case, spaces, hyphens | `Dhi Qar` = `dhiqar` |

```ts
normalize('Al-Qadisiyyah');  // 'qadisiyyah'
normalize('البَصْرَة');       // 'بصره'
```

## Data

### Governorates

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

### Districts

| Governorate | Districts |
| --- | --- |
| Baghdad | Abu Ghraib, Adhamiya, Dhat al-Salasil, Kadhimiya, Karkh, Mada'in, Mahmudiya, Rashidiya, Rusafa, Sadr City 1, Sadr City 2, Taji, Tarmiya, Zawraa, Zuhur |
| Basra | Abu al-Khasib, Basra, Dair, Faw, Hartha, Madina, Qurna, Sadiq, Safwan, Shatt al-Arab, Zubair |
| Nineveh | Ba'aj, Hamdaniya, Hatra, Makhmur, Mosul, Shekhan, Sinjar, Tal Afar, Tel Kaif |
| Anbar | Al-Qa'im, Amiriyah, Anah, Fallujah, Habbaniyah, Haditha, Hit, Karma, Obour, Ramadi, Rawa, Rutba |
| Salah al-Din | Al-Alam, Amerli, Baiji, Balad, Dhuluiya, Dour, Dujail, Samarra, Shirqat, Tikrit, Tuz Khurmatu |
| Kirkuk | Daquq, Dibis, Hawija, Kirkuk |
| Diyala | Balad Ruz, Baqubah, Khalis, Khanaqin, Kifri, Mandali, Mansuriya, Muqdadiya |
| Wasit | Ahrar, Aziziyah, Badra, Hai, Kut, Muwaffaqiya, Numaniyah, Suwaira, Zubaidiya |
| Babil | Hashimiya, Hillah, Kifl, Kutha, Mahawil, Musayyib, Qasim |
| Karbala | Ain al-Tamr, Hindiya, Hur, Husseiniya, Jadwal al-Gharbi, Karbala |
| Najaf | Kufa, Manathera, Mishkhab, Najaf |
| Al-Qadisiyyah | Afak, Akkad, Budair, Diwaniyah, Ghammas, Hamza, Mhanawiya, Saniya, Shafi'iya, Shamiya, Shinafiya, Sudair, Sumer |
| Muthanna | Hilal, Khidhir, Majd, Najmi, Rumaitha, Salman, Samawah, Suwair, Warka |
| Dhi Qar | Batha, Chibayish, Dawaya, Fajr, Fuhud, Gharraf, Islah, Karmat Bani Sa'id, Nasiriyah, Nasr, Qal'at Sukkar, Rifai, Sayyid Dakhil, Shatra, Suq al-Shuyukh |
| Maysan | Ali al-Gharbi, Amarah, Kahla, Kumait, Maimouna, Majar al-Kabir, Qal'at Salih |
| Erbil | Ainkawa, Choman, Dashti Hawler, Erbil, Harir, Khabat, Khalifan, Koya, Mergasor, Pirmam, Qushtapa, Rawanduz, Shaqlawa, Sidakan, Soran |
| Sulaymaniyah | Bazyan, Chamchamal, Darbandikhan, Dukan, Haji Awa, Kalar, Mawat, Penjwen, Pshdar, Qaradagh, Ranya, Said Sadiq, Sharazoor, Sharbazher, Sulaymaniyah |
| Duhok | Akre, Amedi, Bardarash, Batifa, Duhok, Simele, Zakho |
| Halabja | Bamo, Byara, Halabja, Khurmal, Sirwan |

Arabic and Kurdish names, P-codes and coordinates for each are in [`src/districts.json`](src/districts.json).

The list is the one Iraq's 2024 census used:

- Federal Iraq follows the [2024 Annual Statistical Abstract](https://cosit.gov.iq/documents/AAS2024/01.pdf) of the Central Statistical Organization (COSIT), which lists every district with its sub-districts. Many districts are new since 2019, such as Sadr City 1 and 2 in Baghdad, and most of Dhi Qar's and Al-Qadisiyyah's.
- The Kurdistan Region follows the districts of the 2024 census, which match the Kurdistan Regional Government's own divisions (Soran, Pirmam, Sidakan, Haji Awa…). Halabja is its own governorate with five districts, not part of Sulaymaniyah.
- Kifri, Khanaqin and Shekhan are counted in both a federal and a Kurdistan governorate by the census. They're listed once here, in Diyala and Nineveh. Akre and Bardarash are in Duhok, as COSIT lists them.

`pcode` is the district's P-code in the [OCHA administrative boundaries](https://data.humdata.org/dataset/cod-ab-irq), which are from 2019. Districts created since then, or that OCHA counts as sub-districts (Abu Ghraib, Taji), have `pcode: null`.

Each `center` is the town the district is run from. It's often a town of the same name, but not always: Mada'in is run from Salman Pak, and Pshdar from Qaladiza. A few districts have no separate town, such as Baghdad's newest (Sadr City 1 and 2, Zawraa, Zuhur) and Bamo in Halabja, so their point is the middle of the area. Coordinates are from OpenStreetMap, rounded to 4 decimal places.

## Sources

- District list: [COSIT Annual Statistical Abstract 2024](https://cosit.gov.iq/documents/AAS2024/01.pdf) and the 2024 census results, as published by [City Population](https://www.citypopulation.de/en/iraq/admin/)
- District P-codes: [OCHA / Iraq Central Statistics Office](https://data.humdata.org/dataset/cod-ab-irq), [CC BY-IGO](https://creativecommons.org/licenses/by/3.0/igo/)
- Coordinates: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, and [Wikidata](https://www.wikidata.org)

## Roadmap

- Sub-districts (نواحي)

## Contributing

Corrections are very welcome, especially Kurdish spellings and other common spellings that should be added as aliases. Open an issue or a pull request that edits [`src/governorates.json`](src/governorates.json) or [`src/districts.json`](src/districts.json).

### Development

```bash
npm install
npm test           # run the tests
npm run typecheck  # check the types
npm run build      # build dist/ (CommonJS and ES modules)
```

## License

[MIT](LICENSE) © Karam Al-Dulaimi
