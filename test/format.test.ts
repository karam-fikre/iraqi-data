import { toLatinDigits, toArabicDigits, formatIQD } from '../src/index';
import assert from 'assert';

describe('toLatinDigits', () => {
  it('turns Arabic and Kurdish digits into 0-9', () => {
    assert.strictEqual(toLatinDigits('٠١٢٣٤٥٦٧٨٩'), '0123456789');
    assert.strictEqual(toLatinDigits('۰۱۲۳۴۵۶۷۸۹'), '0123456789');
  });

  it('turns the Arabic decimal point and thousands separator into . and ,', () => {
    assert.strictEqual(toLatinDigits('١٢٫٥'), '12.5');
    assert.strictEqual(toLatinDigits('٢٥٬٠٠٠'), '25,000');
  });

  it('keeps the rest of the text', () => {
    assert.strictEqual(toLatinDigits('شارع ١٤ رمضان'), 'شارع 14 رمضان');
    assert.strictEqual(toLatinDigits('Block 3, 0770'), 'Block 3, 0770');
    assert.strictEqual(toLatinDigits(''), '');
  });
});

describe('toArabicDigits', () => {
  it('turns 0-9 into Arabic digits and keeps the rest', () => {
    assert.strictEqual(toArabicDigits('0123456789'), '٠١٢٣٤٥٦٧٨٩');
    assert.strictEqual(toArabicDigits('شارع 14 رمضان'), 'شارع ١٤ رمضان');
    assert.strictEqual(toArabicDigits('25,000'), '٢٥,٠٠٠');
  });

  it('is undone by toLatinDigits', () => {
    assert.strictEqual(toLatinDigits(toArabicDigits('0770 123 4567')), '0770 123 4567');
  });
});

describe('formatIQD', () => {
  it('groups thousands and adds the currency', () => {
    assert.strictEqual(formatIQD(25000), '25,000 IQD');
    assert.strictEqual(formatIQD(1500000), '1,500,000 IQD');
    assert.strictEqual(formatIQD(250), '250 IQD');
    assert.strictEqual(formatIQD(0), '0 IQD');
  });

  it('writes the currency as د.ع in Arabic and Kurdish', () => {
    assert.strictEqual(formatIQD(25000, { lang: 'ar' }), '25,000 د.ع');
    assert.strictEqual(formatIQD(25000, { lang: 'ku' }), '25,000 د.ع');
    assert.strictEqual(formatIQD(25000, { lang: 'en' }), '25,000 IQD');
  });

  it('rounds to whole dinars', () => {
    assert.strictEqual(formatIQD(999.5), '1,000 IQD');
    assert.strictEqual(formatIQD(1234.4), '1,234 IQD');
    assert.strictEqual(formatIQD(-0.4), '0 IQD');
  });

  it('formats negative amounts', () => {
    assert.strictEqual(formatIQD(-25000), '-25,000 IQD');
  });

  it('throws for something that is not an amount', () => {
    assert.throws(() => formatIQD(NaN), RangeError);
    assert.throws(() => formatIQD(Infinity), RangeError);
  });
});
