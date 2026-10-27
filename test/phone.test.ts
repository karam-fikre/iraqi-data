import { parseMobile, isValidMobile, carriers } from '../src/index';
import assert from 'assert';

describe('parseMobile', () => {
  it('returns the number in standard formats', () => {
    assert.deepStrictEqual(parseMobile('07701234567'), {
      e164: '+9647701234567',
      local: '0770 123 4567',
      international: '+964 770 123 4567',
      carrier: 'asiacell',
    });
  });

  it('reads the ways people write a number', () => {
    for (const input of [
      '07701234567',
      '7701234567',
      '0770 123 4567',
      '0770-123-4567',
      '(0770) 123.4567',
      '+9647701234567',
      '+964 770 123 4567',
      '+964 (0) 770 123 4567',
      '+96407701234567',
      '009647701234567',
      '9647701234567',
      ' 07701234567 ',
    ]) {
      assert.strictEqual(parseMobile(input)?.e164, '+9647701234567', input);
    }
  });

  it('reads Arabic and Kurdish digits', () => {
    assert.strictEqual(parseMobile('٠٧٧٠١٢٣٤٥٦٧')?.e164, '+9647701234567');
    assert.strictEqual(parseMobile('۰۷۵۰ ۱۲۳ ۴۵۶۷')?.e164, '+9647501234567');
    assert.strictEqual(parseMobile('+٩٦٤ ٧٨٠ ١٢٣ ٤٥٦٧')?.e164, '+9647801234567');
  });

  it('ignores the direction marks copied with Arabic text', () => {
    assert.strictEqual(parseMobile('‎+964 770 123 4567‏')?.e164, '+9647701234567');
    assert.strictEqual(parseMobile('⁦07701234567⁩')?.e164, '+9647701234567');
  });

  it('finds the carrier from the prefix', () => {
    assert.strictEqual(parseMobile('07501234567')?.carrier, 'korek');
    assert.strictEqual(parseMobile('07511234567')?.carrier, 'korek');
    assert.strictEqual(parseMobile('07701234567')?.carrier, 'asiacell');
    assert.strictEqual(parseMobile('07791234567')?.carrier, 'asiacell');
    assert.strictEqual(parseMobile('07801234567')?.carrier, 'zain');
    assert.strictEqual(parseMobile('07901234567')?.carrier, 'zain');
  });

  it('accepts the smaller networks, with no carrier', () => {
    for (const input of ['07401234567', '07601234567', '07301234567']) {
      assert.strictEqual(parseMobile(input)?.carrier, null, input);
    }
  });

  it('rejects anything that is not an Iraqi mobile number', () => {
    for (const input of [
      '',
      '+964',
      '0770123456',       // a digit short
      '077012345678',     // a digit too many
      '07201234567',      // no network uses 072
      '07101234567',
      '017123456',        // Baghdad landline
      '+9667701234567',   // Saudi country code
      '+9717701234567',
      '0770123456a',
      '0770_123_4567',
      '770+1234567',
    ]) {
      assert.strictEqual(parseMobile(input), undefined, input);
    }
  });
});

describe('carriers', () => {
  it('names every carrier in Arabic, English and Kurdish', () => {
    assert.deepStrictEqual(carriers.asiacell, { ar: 'آسياسيل', en: 'Asiacell', ku: 'ئاسیاسێڵ' });
    assert.deepStrictEqual(carriers.zain, { ar: 'زين', en: 'Zain', ku: 'زین' });
    assert.deepStrictEqual(carriers.korek, { ar: 'كورك', en: 'Korek', ku: 'کورەک' });
  });

  it('has a name for every carrier parseMobile returns', () => {
    for (const input of ['07501234567', '07701234567', '07801234567', '07901234567']) {
      assert.ok(carriers[parseMobile(input)!.carrier!], input);
    }
  });

  it('cannot be changed by an app', () => {
    assert.ok(Object.isFrozen(carriers));
    assert.ok(Object.isFrozen(carriers.korek));
  });
});

describe('isValidMobile', () => {
  it('tells whether parseMobile can read the number', () => {
    assert.strictEqual(isValidMobile('0770 123 4567'), true);
    assert.strictEqual(isValidMobile('٠٧٩٠١٢٣٤٥٦٧'), true);
    assert.strictEqual(isValidMobile('0720 123 4567'), false);
    assert.strictEqual(isValidMobile('hello'), false);
  });
});
