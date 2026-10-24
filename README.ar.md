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
//   capital: { ar: 'البصرة', en: 'Basra' },
//   aliases: ['Basrah']
// }

getGovernorate('هولير')?.ar;   // 'أربيل'
getGovernorate('IQ-NI')?.capital.ar;  // 'الموصل'

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
  capital: { ar: string; en: string };  // مركز المحافظة
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

| العربية | الإنجليزية | الكردية | المركز | ISO | الإقليم |
| --- | --- | --- | --- | --- | --- |
| بغداد | Baghdad | بەغدا | بغداد | IQ-BG | اتحادي |
| البصرة | Basra | بەسرە | البصرة | IQ-BA | اتحادي |
| نينوى | Nineveh | نەینەوا | الموصل | IQ-NI | اتحادي |
| الأنبار | Anbar | ئەنبار | الرمادي | IQ-AN | اتحادي |
| صلاح الدين | Salah al-Din | سەلاحەدین | تكريت | IQ-SD | اتحادي |
| كركوك | Kirkuk | کەرکووک | كركوك | IQ-KI | اتحادي |
| ديالى | Diyala | دیالە | بعقوبة | IQ-DI | اتحادي |
| واسط | Wasit | واسیت | الكوت | IQ-WA | اتحادي |
| بابل | Babil | بابل | الحلة | IQ-BB | اتحادي |
| كربلاء | Karbala | کەربەلا | كربلاء | IQ-KA | اتحادي |
| النجف | Najaf | نەجەف | النجف | IQ-NA | اتحادي |
| القادسية | Al-Qadisiyyah | قادسیە | الديوانية | IQ-QA | اتحادي |
| المثنى | Muthanna | موسەننا | السماوة | IQ-MU | اتحادي |
| ذي قار | Dhi Qar | زیقار | الناصرية | IQ-DQ | اتحادي |
| ميسان | Maysan | مەیسان | العمارة | IQ-MA | اتحادي |
| أربيل | Erbil | هەولێر | أربيل | IQ-AR | كردستان |
| السليمانية | Sulaymaniyah | سلێمانی | السليمانية | IQ-SU | كردستان |
| دهوك | Duhok | دهۆک | دهوك | IQ-DA | كردستان |
| حلبجة | Halabja | هەڵەبجە | حلبجة | — | كردستان |

أقرّ مجلس النواب العراقي حلبجة محافظةً تاسعة عشرة للعراق عام 2025. ليس لها رمز ISO 3166-2 بعد، لذلك قيمة `iso` لها `null`.

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
