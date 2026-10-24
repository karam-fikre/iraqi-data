# iraqi-data

[English](README.md) | **العربية**

[![npm version](https://img.shields.io/npm/v/iraqi-data.svg)](https://www.npmjs.com/package/iraqi-data)
[![CI](https://github.com/karam-fikre/iraqi-data/actions/workflows/ci.yml/badge.svg)](https://github.com/karam-fikre/iraqi-data/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/iraqi-data.svg)](LICENSE)

محافظات العراق بالعربية والإنجليزية والكردية، جاهزة لنماذج العناوين والقوائم المنسدلة وتطبيقات التوصيل. البحث يفهم الطرق المختلفة التي يكتب بها الناس اسم المكان نفسه: `البصرة` و `البصره` و `Basrah` و `بەسرە` كلها تجد البصرة.

يعمل في **Node.js** و**المتصفح** و **React** و **React Native / Expo** و **Vue**، ويأتي مع أنواع TypeScript، وبلا أي اعتماديات.

## التثبيت

```bash
npm install iraqi-data
# أو
yarn add iraqi-data
```

## الاستخدام

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

getGovernorate('هولير')?.ar;   // 'أربيل'
getGovernorate('IQ-NI')?.capital.ar;  // 'الموصل'
getGovernorate('أربيل')?.capital;     // { ar: 'أربيل', en: 'Erbil', lat: 36.1912, lng: 44.0094 }

searchGovernorates('نجف').map((g) => g.ar);  // ['النجف']
searchGovernorates('ba').map((g) => g.ar);   // ['بغداد', 'البصرة', 'بابل', 'الأنبار', 'كربلاء']
```

### مثال قائمة منسدلة (React)

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

احفظ الـ `id` ‏(`'baghdad'` و `'basra'` …) في قاعدة بياناتك، وليس الاسم المعروض. الـ `id` لا يتغير أبداً، أما تهجئة الاسم فقد تُصحَّح في إصدار لاحق.

## الواجهة البرمجية (API)

### `governorates: readonly Governorate[]`

كل المحافظات الـ 19: المحافظات الـ 15 في العراق الاتحادي، ثم المحافظات الـ 4 في إقليم كردستان. المصفوفة وعناصرها مجمّدة ولا يمكن تعديلها.

```ts
interface Governorate {
  id: string;            // معرّف ثابت للحفظ: 'baghdad'
  iso: string | null;    // رمز ISO 3166-2: 'IQ-BG' (‏null لحلبجة لأنها بلا رمز بعد)
  ar: string;            // الاسم بالعربية
  en: string;            // الاسم بالإنجليزية
  ku: string;            // الاسم بالكردية (السورانية)
  region: 'federal' | 'kurdistan';
  capital: { ar: string; en: string; lat: number; lng: number };  // مركز المحافظة وإحداثياته
  aliases: string[];     // تهجئات أخرى: 'Basrah' و 'Arbil' و 'Hawler'
}
```

### `getGovernorate(query: string): Governorate | undefined`

تجد محافظة واحدة بالـ `id` أو رمز ISO أو اسمها الكامل بأي لغة، بما في ذلك التهجئات الأخرى. تُرجع `undefined` إذا لم تجد شيئاً. الأسماء الناقصة لا تُطابَق؛ استخدم `searchGovernorates` لها.

### `searchGovernorates(query: string): Governorate[]`

تجد كل محافظة يحتوي اسمها على نص البحث، للإكمال التلقائي. المطابقات التامة أولاً، ثم الأسماء التي تبدأ بنص البحث، ثم البقية. البحث الفارغ يُرجع `[]`.

### `getGovernoratesByRegion(region: 'federal' | 'kurdistan'): Governorate[]`

محافظات العراق الاتحادي أو محافظات إقليم كردستان.

### `normalize(text: string): string`

الدالة التي يستخدمها البحث لمقارنة الأسماء. هي مُصدَّرة لتقارن بها قيمك المحفوظة بالطريقة نفسها.

| تتجاهل | مثال |
| --- | --- |
| أشكال الهمزة | `أ إ آ` ← `ا` |
| التاء المربوطة والألف المقصورة | `ة` ← `ه`، `ى` ← `ي` |
| التشكيل والتطويل | `البَصْرَة` ← `بصره` |
| أداة التعريف | `البصرة` و `Al-Basrah` و `As Sulaymaniyah` |
| الحروف الكردية المكتوبة بلوحة مفاتيح عربية | `سلێمانی` = `سليماني`، `دهۆک` = `دهوك` |
| حالة الأحرف والمسافات والشرطات | `Dhi Qar` = `dhiqar` |

```ts
normalize('Al-Qadisiyyah');  // 'qadisiyyah'
normalize('البَصْرَة');       // 'بصره'
```

## البيانات

| العربية | الإنجليزية | الكردية | المركز | الإحداثيات | ISO | الإقليم |
| --- | --- | --- | --- | --- | --- | --- |
| بغداد | Baghdad | بەغدا | بغداد | 33.3062, 44.3872 | IQ-BG | اتحادي |
| البصرة | Basra | بەسرە | البصرة | 30.4952, 47.8091 | IQ-BA | اتحادي |
| نينوى | Nineveh | نەینەوا | الموصل | 36.3416, 43.1291 | IQ-NI | اتحادي |
| الأنبار | Anbar | ئەنبار | الرمادي | 33.4260, 43.2999 | IQ-AN | اتحادي |
| صلاح الدين | Salah al-Din | سەلاحەدین | تكريت | 34.6158, 43.6786 | IQ-SD | اتحادي |
| كركوك | Kirkuk | کەرکووک | كركوك | 35.4719, 44.3954 | IQ-KI | اتحادي |
| ديالى | Diyala | دیالە | بعقوبة | 33.7447, 44.6328 | IQ-DI | اتحادي |
| واسط | Wasit | واسیت | الكوت | 32.5147, 45.8189 | IQ-WA | اتحادي |
| بابل | Babil | بابل | الحلة | 32.4822, 44.4328 | IQ-BB | اتحادي |
| كربلاء | Karbala | کەربەلا | كربلاء | 32.5984, 44.0158 | IQ-KA | اتحادي |
| النجف | Najaf | نەجەف | النجف | 32.0010, 44.3300 | IQ-NA | اتحادي |
| القادسية | Al-Qadisiyyah | قادسیە | الديوانية | 31.9892, 44.9247 | IQ-QA | اتحادي |
| المثنى | Muthanna | موسەننا | السماوة | 31.3079, 45.2827 | IQ-MU | اتحادي |
| ذي قار | Dhi Qar | زیقار | الناصرية | 31.0440, 46.2399 | IQ-DQ | اتحادي |
| ميسان | Maysan | مەیسان | العمارة | 31.8498, 47.1496 | IQ-MA | اتحادي |
| أربيل | Erbil | هەولێر | أربيل | 36.1912, 44.0094 | IQ-AR | كردستان |
| السليمانية | Sulaymaniyah | سلێمانی | السليمانية | 35.5571, 45.4426 | IQ-SU | كردستان |
| دهوك | Duhok | دهۆک | دهوك | 36.8543, 42.9925 | IQ-DA | كردستان |
| حلبجة | Halabja | هەڵەبجە | حلبجة | 35.1792, 45.9874 | — | كردستان |

أقرّ مجلس النواب العراقي حلبجة محافظةً تاسعة عشرة للعراق عام 2025. ليس لها رمز ISO 3166-2 بعد، لذلك قيمة `iso` لها `null`.

الإحداثيات هي وسط مدينة مركز كل محافظة، مأخوذة من [OpenStreetMap](https://www.openstreetmap.org) (والكوت والديوانية من [Wikidata](https://www.wikidata.org))، ومقرّبة إلى 4 منازل عشرية (نحو 11 متراً). تختلف المصادر في تحديد وسط المدينة بما يصل إلى 3 كم تقريباً، لذا استخدمها لدبابيس الخرائط وحساب المسافات، وليس كعناوين دقيقة.

## الخطط القادمة

- الأقضية في كل محافظة
- النواحي

## المساهمة

التصحيحات مرحّب بها جداً، خصوصاً التهجئات الكردية، والتهجئات الشائعة الأخرى التي يجب إضافتها إلى `aliases`. افتح issue أو pull request يعدّل الملف [`src/governorates.json`](src/governorates.json).

### التطوير

```bash
npm install
npm test           # تشغيل الاختبارات
npm run typecheck  # فحص الأنواع
npm run build      # بناء dist/ ‏(CommonJS و ES modules)
```

## الترخيص

[MIT](LICENSE) © Karam Al-Dulaimi
