import { governorates, getGovernorate, searchGovernorates, getGovernoratesByRegion, normalize } from '../src/index';
import assert from 'assert';

describe('Governorate data', () => {
  it('has 19 governorates, 4 of them in the Kurdistan Region', () => {
    assert.strictEqual(governorates.length, 19);
    assert.deepStrictEqual(
      getGovernoratesByRegion('kurdistan').map((g) => g.id),
      ['erbil', 'sulaymaniyah', 'duhok', 'halabja']
    );
    assert.strictEqual(getGovernoratesByRegion('federal').length, 15);
  });

  it('has unique ids and ISO codes', () => {
    const ids = governorates.map((g) => g.id);
    const isos = governorates.map((g) => g.iso).filter(Boolean);
    assert.strictEqual(new Set(ids).size, ids.length);
    assert.strictEqual(new Set(isos).size, isos.length);
    for (const iso of isos) assert.match(iso!, /^IQ-[A-Z]{2}$/);
  });

  it('has only trimmed, non-empty names', () => {
    for (const g of governorates) {
      for (const name of [g.ar, g.en, g.ku, g.capital.ar, g.capital.en, ...g.aliases]) {
        assert.ok(typeof name === 'string' && name.trim() === name && name !== '', `${g.id}: ${JSON.stringify(name)}`);
      }
      assert.match(g.id, /^[a-z]+$/);
    }
  });

  it('has no name or alias that two governorates share', () => {
    const seen = new Map<string, string>();
    for (const g of governorates) {
      for (const name of new Set([g.id, g.ar, g.en, g.ku, ...g.aliases].map(normalize))) {
        assert.ok(!seen.has(name), `"${name}" is used by both ${seen.get(name)} and ${g.id}`);
        seen.set(name, g.id);
      }
    }
  });

  it('cannot be changed by an app', () => {
    assert.ok(Object.isFrozen(governorates));
    assert.ok(Object.isFrozen(governorates[0]));
    assert.ok(Object.isFrozen(governorates[0].capital));
    assert.ok(Object.isFrozen(governorates[0].aliases));
  });
});

describe('normalize', () => {
  it('ignores hamza, taa marbuta, alef maqsura, tashkeel and the article', () => {
    assert.strictEqual(normalize('البَصْرَة'), normalize('بصره'));
    assert.strictEqual(normalize('الأنبار'), normalize('انبار'));
    assert.strictEqual(normalize('ديالى'), normalize('ديالي'));
  });

  it('ignores case, spaces, hyphens and the Latin article', () => {
    assert.strictEqual(normalize('Al-Qadisiyyah'), 'qadisiyyah');
    assert.strictEqual(normalize('As Sulaymaniyah'), 'sulaymaniyah');
    assert.strictEqual(normalize('Dhi Qar'), normalize('dhiqar'));
  });

  it('reads Kurdish letters the same as their Arabic-keyboard versions', () => {
    assert.strictEqual(normalize('سلێمانی'), normalize('سليماني'));
    assert.strictEqual(normalize('دهۆک'), normalize('دهوك'));
  });
});

describe('getGovernorate', () => {
  it('finds a governorate by id, ISO code, or name in any language', () => {
    for (const query of ['basra', 'IQ-BA', 'Basra', 'Basrah', 'البصرة', 'البصره', 'بصرة', 'بەسرە']) {
      assert.strictEqual(getGovernorate(query)?.id, 'basra', query);
    }
    assert.strictEqual(getGovernorate('Hawler')?.id, 'erbil');
    assert.strictEqual(getGovernorate('اربيل')?.id, 'erbil');
    assert.strictEqual(getGovernorate('هولير')?.id, 'erbil');
    assert.strictEqual(getGovernorate('salah al din')?.id, 'salahaddin');
    assert.strictEqual(getGovernorate('Halabja')?.iso, null);
  });

  it('finds every governorate by its own names', () => {
    for (const g of governorates) {
      for (const name of [g.id, g.ar, g.en, g.ku, ...g.aliases]) {
        assert.strictEqual(getGovernorate(name), g, `${g.id}: ${name}`);
      }
    }
  });

  it('returns undefined for a partial name, an unknown name or an empty query', () => {
    assert.strictEqual(getGovernorate('Bas'), undefined);
    assert.strictEqual(getGovernorate('Mosul'), undefined);
    assert.strictEqual(getGovernorate(''), undefined);
    assert.strictEqual(getGovernorate('  - '), undefined);
  });
});

describe('searchGovernorates', () => {
  it('finds governorates whose name contains the query', () => {
    assert.deepStrictEqual(searchGovernorates('نجف').map((g) => g.id), ['najaf']);
    assert.deepStrictEqual(searchGovernorates('kar').map((g) => g.id), ['karbala']);
  });

  it('puts exact matches first, then names that start with the query', () => {
    // Baghdad, Basra and Babil start with "ba"; Anbar only contains it
    const ids = searchGovernorates('ba').map((g) => g.id);
    assert.deepStrictEqual(ids.slice(0, 3), ['baghdad', 'basra', 'babil']);
    assert.ok(ids.includes('anbar'));
  });

  it('returns nothing for an empty query', () => {
    assert.deepStrictEqual(searchGovernorates(''), []);
    assert.deepStrictEqual(searchGovernorates('xyz'), []);
  });
});
