# iraqi-data

[English](README.md) | **العربية**

[![npm version](https://img.shields.io/npm/v/iraqi-data.svg)](https://www.npmjs.com/package/iraqi-data)
[![CI](https://github.com/karam-fikre/iraqi-data/actions/workflows/ci.yml/badge.svg)](https://github.com/karam-fikre/iraqi-data/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/iraqi-data.svg)](LICENSE)

محافظات العراق وأقضيتها بالعربية والإنجليزية والكردية، جاهزة لنماذج العناوين والقوائم المنسدلة وتطبيقات التوصيل. البحث يفهم الطرق المختلفة التي يكتب بها الناس اسم المكان نفسه: `البصرة` و `البصره` و `Basrah` و `بەسرە` كلها تجد البصرة.

يعمل في **Node.js** و**المتصفح** و **React** و **React Native / Expo** و **Vue**، ويأتي مع أنواع TypeScript، وبلا أي اعتماديات.

## التثبيت

```bash
npm install iraqi-data
# أو
yarn add iraqi-data
```

حجم الحزمة كاملةً مع البيانات نحو 11 كيلوبايت بعد الضغط (gzip).

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

### الأقضية

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

getDistrict('الدغارة')?.ar;                   // 'أكد' (الدغارة مركزه)
getDistrictsByGovernorate('البصرة').length;    // 11
searchDistricts('كر', { governorate: 'بغداد' }).map((d) => d.ar);  // ['الكرخ']
```

### قوائم العنوان المنسدلة (React)

قائمة للمحافظات، وقائمة ثانية تعرض أقضية المحافظة المختارة:

```tsx
import { useState } from 'react';
import { governorates, getDistrictsByGovernorate } from 'iraqi-data';

export function AddressSelect() {
  const [governorate, setGovernorate] = useState('');
  const [district, setDistrict] = useState('');

  return (
    <>
      <select value={governorate} onChange={(e) => { setGovernorate(e.target.value); setDistrict(''); }}>
        <option value="">المحافظة</option>
        {governorates.map((g) => (
          <option key={g.id} value={g.id}>{g.ar}</option>
        ))}
      </select>

      <select value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!governorate}>
        <option value="">القضاء</option>
        {getDistrictsByGovernorate(governorate).map((d) => (
          <option key={d.id} value={d.id}>{d.ar}</option>
        ))}
      </select>
    </>
  );
}
```

استخدم `g.en` / `d.en` أو `g.ku` / `d.ku` للأسماء بالإنجليزية أو الكردية. احفظ المعرّفات (`'baghdad'` و `'abughraib'` …) في قاعدة بياناتك، وليس الأسماء المعروضة. المعرّف لا يتغير أبداً، أما تهجئة الاسم فقد تُصحَّح في إصدار لاحق.

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

### `districts: readonly District[]`

كل الأقضية الـ 182، مرتّبة حسب المحافظة بترتيب `governorates` نفسه، ثم حسب الاسم الإنجليزي. المصفوفة وعناصرها مجمّدة ولا يمكن تعديلها.

```ts
interface District {
  id: string;             // معرّف ثابت للحفظ: 'abughraib'
  governorateId: string;  // معرّف المحافظة: 'baghdad'
  pcode: string | null;   // رمز OCHA (P-code): 'IQG08Q01' (‏null إذا لم تعدّه OCHA قضاءً)
  ar: string;             // الاسم بالعربية
  en: string;             // الاسم بالإنجليزية
  ku: string;             // الاسم بالكردية (السورانية)
  center: { ar: string; en: string; lat: number; lng: number };  // مركز القضاء وإحداثياته
  aliases: string[];      // تهجئات وأسماء أخرى: 'الدغارة' لأكد
}
```

### `getDistrict(query: string): District | undefined`

تجد قضاءً واحداً بالـ `id` أو رمز P-code أو اسمه الكامل بأي لغة، بما في ذلك التهجئات الأخرى. تعمل مثل `getGovernorate`.

### `searchDistricts(query: string, options?: { governorate?: string }): District[]`

تجد كل قضاء يحتوي اسمه على نص البحث، بترتيب `searchGovernorates` نفسه. مرّر `governorate` (أي قيمة تقبلها `getGovernorate`) للبحث في أقضية تلك المحافظة فقط.

### `getDistrictsByGovernorate(governorate: string): District[]`

أقضية محافظة واحدة، تُحدَّد بأي قيمة تقبلها `getGovernorate`: `'basra'` أو `'البصرة'` أو `'IQ-BA'`. تُرجع `[]` لمحافظة غير معروفة.

### `normalize(text: string): string`

الدالة التي يستخدمها البحث لمقارنة الأسماء. هي مُصدَّرة لتقارن بها قيمك المحفوظة بالطريقة نفسها.

| تتجاهل | مثال |
| --- | --- |
| أشكال الهمزة | `أ إ آ` ← `ا` |
| التاء المربوطة والألف المقصورة | `ة` ← `ه`، `ى` ← `ي` |
| التشكيل والتطويل | `البَصْرَة` ← `بصره` |
| أداة التعريف | `البصرة` و `Al-Basrah` و `As Sulaymaniyah` |
| الحروف الكردية المكتوبة بلوحة مفاتيح عربية | `سلێمانی` = `سليماني`، `دهۆک` = `دهوك` |
| شكلا الهاء المستخدمان في الكردية | `ھەولێر` = `هەولێر` |
| حالة الأحرف والمسافات والشرطات | `Dhi Qar` = `dhiqar` |

```ts
normalize('Al-Qadisiyyah');  // 'qadisiyyah'
normalize('البَصْرَة');       // 'بصره'
```

## البيانات

### المحافظات

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

### الأقضية

| المحافظة | الأقضية |
| --- | --- |
| بغداد | أبو غريب، الأعظمية، ذات السلاسل، الكاظمية، الكرخ، المدائن، المحمودية، الراشدية، الرصافة، الصدر الأولى، الصدر الثانية، التاجي، الطارمية، الزوراء، الزهور |
| البصرة | أبو الخصيب، البصرة، الدير، الفاو، الهارثة، المدينة، القرنة، الصادق، سفوان، شط العرب، الزبير |
| نينوى | البعاج، الحمدانية، الحضر، مخمور، الموصل، الشيخان، سنجار، تلعفر، تلكيف |
| الأنبار | القائم، العامرية، عانة، الفلوجة، الحبانية، حديثة، هيت، الكرمة، العبور، الرمادي، راوة، الرطبة |
| صلاح الدين | العلم، آمرلي، بيجي، بلد، الضلوعية، الدور، الدجيل، سامراء، الشرقاط، تكريت، طوز خورماتو |
| كركوك | داقوق، الدبس، الحويجة، كركوك |
| ديالى | بلدروز، بعقوبة، الخالص، خانقين، كفري، مندلي، المنصورية، المقدادية |
| واسط | الأحرار، العزيزية، بدرة، الحي، الكوت، الموفقية، النعمانية، الصويرة، الزبيدية |
| بابل | الهاشمية، الحلة، الكفل، كوثى، المحاويل، المسيب، القاسم |
| كربلاء | عين التمر، الهندية، الحر، الحسينية، الجدول الغربي، كربلاء |
| النجف | الكوفة، المناذرة، المشخاب، النجف |
| القادسية | عفك، أكد، البدير، الديوانية، غماس، الحمزة، المهناوية، السنية، الشافعية، الشامية، الشنافية، السدير، سومر |
| المثنى | الهلال، الخضر، المجد، النجمي، الرميثة، السلمان، السماوة، السوير، الوركاء |
| ذي قار | البطحاء، الجبايش، الدواية، الفجر، الفهود، الغراف، الإصلاح، كرمة بني سعيد، الناصرية، النصر، قلعة سكر، الرفاعي، سيد دخيل، الشطرة، سوق الشيوخ |
| ميسان | علي الغربي، العمارة، الكحلاء، كميت، الميمونة، المجر الكبير، قلعة صالح |
| أربيل | عنكاوة، جومان، دشت أربيل، أربيل، حرير، خبات، خليفان، كويسنجق، ميركسور، بيرمام، قوشتبة، راوندوز، شقلاوة، سيدكان، سوران |
| السليمانية | بازيان، جمجمال، دربندخان، دوكان، حاجياوة، كلار، ماوت، بنجوين، بشدر، قرة داغ، رانية، سيد صادق، شهرزور، شاربازير، السليمانية |
| دهوك | عقرة، العمادية، بردرش، باتيفا، دهوك، سميل، زاخو |
| حلبجة | بمو، بيارة، حلبجة، خورمال، سيروان |

الأسماء الكردية ورموز P-code والإحداثيات لكل قضاء موجودة في [`src/districts.json`](src/districts.json).

القائمة هي التي اعتمدها التعداد العام للسكان لعام 2024:

- العراق الاتحادي يتبع [المجموعة الإحصائية السنوية 2024](https://cosit.gov.iq/documents/AAS2024/01.pdf) للجهاز المركزي للإحصاء، التي تذكر كل قضاء ونواحيه. أقضية كثيرة استُحدثت بعد 2019، مثل الصدر الأولى والثانية في بغداد، ومعظم أقضية ذي قار والقادسية.
- إقليم كردستان يتبع أقضية تعداد 2024، وهي تطابق تقسيمات حكومة الإقليم (سوران وبيرمام وسيدكان وحاجياوة…). حلبجة محافظة مستقلة بخمسة أقضية، وليست جزءاً من السليمانية.
- كفري وخانقين والشيخان يعدّها التعداد في محافظة اتحادية وأخرى في الإقليم معاً. هنا تُذكر مرة واحدة، في ديالى ونينوى. أما عقرة وبردرش ففي دهوك، كما يذكرها الجهاز المركزي للإحصاء.

`pcode` هو رمز القضاء في [الحدود الإدارية لـ OCHA](https://data.humdata.org/dataset/cod-ab-irq)، وهي من عام 2019. الأقضية المستحدثة بعدها، أو التي تعدّها OCHA نواحيَ (أبو غريب والتاجي)، قيمة `pcode` لها `null`.

`center` هو مركز القضاء، أي البلدة التي يُدار منها. غالباً تحمل اسم القضاء نفسه، لكن ليس دائماً: مركز المدائن سلمان باك، ومركز بشدر قلعة دزة. بعض الأقضية ليس لها بلدة مستقلة، مثل أحدث أقضية بغداد (الصدر الأولى والثانية والزوراء والزهور) وبمو في حلبجة، لذا نقطتها وسط المنطقة. الإحداثيات من OpenStreetMap، ومقرّبة إلى 4 منازل عشرية.

## المصادر

- قائمة الأقضية: [المجموعة الإحصائية السنوية 2024](https://cosit.gov.iq/documents/AAS2024/01.pdf) ونتائج تعداد 2024 كما نشرها موقع [City Population](https://www.citypopulation.de/en/iraq/admin/)
- رموز P-code للأقضية: [OCHA / الجهاز المركزي للإحصاء](https://data.humdata.org/dataset/cod-ab-irq)، بترخيص [CC BY-IGO](https://creativecommons.org/licenses/by/3.0/igo/)
- الإحداثيات: © المساهمون في [OpenStreetMap](https://www.openstreetmap.org/copyright)، و [Wikidata](https://www.wikidata.org)

## الخطط القادمة

- النواحي

## المساهمة

التصحيحات مرحّب بها جداً، خصوصاً التهجئات الكردية، والتهجئات الشائعة الأخرى التي يجب إضافتها إلى `aliases`. افتح issue أو pull request يعدّل الملف [`src/governorates.json`](src/governorates.json) أو [`src/districts.json`](src/districts.json).

### التطوير

```bash
npm install
npm test           # تشغيل الاختبارات
npm run typecheck  # فحص الأنواع
npm run build      # بناء dist/ ‏(CommonJS و ES modules)
```

## الترخيص

[MIT](LICENSE) © Karam Al-Dulaimi
