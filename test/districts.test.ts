import { districts, governorates, getDistrict, searchDistricts, getDistrictsByGovernorate, normalize } from '../src/index';
import assert from 'assert';

describe('District data', () => {
  it('has the 182 districts of the 2024 census', () => {
    assert.strictEqual(districts.length, 182);
    assert.strictEqual(getDistrictsByGovernorate('baghdad').length, 15);
    assert.strictEqual(getDistrictsByGovernorate('erbil').length, 15);
  });

  it('puts every district in a governorate, and every governorate has districts', () => {
    const governorateIds = governorates.map((g) => g.id);
    for (const d of districts) assert.ok(governorateIds.includes(d.governorateId), `${d.id}: ${d.governorateId}`);
    for (const id of governorateIds) assert.ok(getDistrictsByGovernorate(id).length > 0, id);
  });

  it('lists districts in the same governorate order as governorates', () => {
    const order = [...new Set(districts.map((d) => d.governorateId))];
    assert.deepStrictEqual(order, governorates.map((g) => g.id));
  });

  it('has unique ids and P-codes', () => {
    const ids = districts.map((d) => d.id);
    const pcodes = districts.map((d) => d.pcode).filter(Boolean);
    assert.strictEqual(new Set(ids).size, ids.length);
    assert.strictEqual(new Set(pcodes).size, pcodes.length);
    for (const pcode of pcodes) assert.match(pcode!, /^IQG\d{2}Q\d{2}$/);
  });

  it('has only trimmed, non-empty names', () => {
    for (const d of districts) {
      for (const name of [d.ar, d.en, d.ku, d.center.ar, d.center.en, ...d.aliases]) {
        assert.ok(typeof name === 'string' && name.trim() === name && name !== '', `${d.id}: ${JSON.stringify(name)}`);
      }
      assert.match(d.id, /^[a-z0-9]+$/);
    }
  });

  it('has no name or alias that two districts share', () => {
    const seen = new Map<string, string>();
    for (const d of districts) {
      for (const name of new Set([d.id, d.ar, d.en, d.ku, ...d.aliases].map(normalize))) {
        assert.ok(!seen.has(name), `"${name}" is used by both ${seen.get(name)} and ${d.id}`);
        seen.set(name, d.id);
      }
    }
  });

  it('has center coordinates inside Iraq, with at most 4 decimal places', () => {
    for (const { id, center } of districts) {
      assert.ok(center.lat > 29 && center.lat < 37.4, `${id}: lat ${center.lat}`);
      assert.ok(center.lng > 38.7 && center.lng < 48.6, `${id}: lng ${center.lng}`);
      for (const n of [center.lat, center.lng]) assert.strictEqual(n, Number(n.toFixed(4)), `${id}: ${n}`);
    }
  });

  it('has each center within 350 km of its governorate capital (Anbar is that big)', () => {
    const rad = Math.PI / 180;
    for (const d of districts) {
      const { capital } = governorates.find((g) => g.id === d.governorateId)!;
      const dLat = (d.center.lat - capital.lat) * rad;
      const dLng = (d.center.lng - capital.lng) * rad * Math.cos(capital.lat * rad);
      const km = 6371 * Math.hypot(dLat, dLng);
      assert.ok(km < 350, `${d.id} is ${Math.round(km)} km from ${capital.en}`);
    }
  });

  it('gives each district its own center', () => {
    const seen = new Map<string, string>();
    for (const { id, center } of districts) {
      const key = `${center.lat},${center.lng}`;
      assert.ok(!seen.has(key), `${id} and ${seen.get(key)} share the center ${key}`);
      seen.set(key, id);
    }
  });

  it('cannot be changed by an app', () => {
    assert.ok(Object.isFrozen(districts));
    assert.ok(Object.isFrozen(districts[0]));
    assert.ok(Object.isFrozen(districts[0].center));
    assert.ok(Object.isFrozen(districts[0].aliases));
  });
});

describe('getDistrict', () => {
  it('finds a district by id, P-code, or name in any language', () => {
    for (const query of ['zubair', 'IQG02Q06', 'iqg02q06', 'Zubair', 'Al-Zubair', 'الزبير', 'زبير', 'زوبێر']) {
      assert.strictEqual(getDistrict(query)?.id, 'zubair', query);
    }
    assert.strictEqual(getDistrict('أبو غريب')?.id, 'abughraib');
    assert.strictEqual(getDistrict('ابو غريب')?.pcode, null);
  });

  it('finds a district by another name for it or its seat', () => {
    assert.strictEqual(getDistrict('Al-Obour')?.id, 'obour');
    assert.strictEqual(getDistrict('الدغارة')?.id, 'akkad');
    assert.strictEqual(getDistrict('Bnaslawa')?.id, 'dashtihawler');
  });

  it('keeps Rawanduz and Soran as separate districts', () => {
    assert.strictEqual(getDistrict('Rawanduz')?.id, 'rawanduz');
    assert.strictEqual(getDistrict('سوران')?.id, 'soran');
  });

  it('finds every district by its own names', () => {
    for (const d of districts) {
      for (const name of [d.id, d.ar, d.en, d.ku, ...d.aliases]) {
        assert.strictEqual(getDistrict(name), d, `${d.id}: ${name}`);
      }
    }
  });

  it('returns undefined for a partial name, an unknown name or an empty query', () => {
    assert.strictEqual(getDistrict('Zub'), undefined);
    assert.strictEqual(getDistrict('Baghdad'), undefined);
    assert.strictEqual(getDistrict(''), undefined);
  });
});

describe('searchDistricts', () => {
  it('finds districts whose name contains the query', () => {
    assert.deepStrictEqual(searchDistricts('غريب').map((d) => d.id), ['abughraib']);
  });

  it('searches only one governorate when asked', () => {
    const all = searchDistricts('ka');
    const inBaghdad = searchDistricts('ka', { governorate: 'baghdad' });
    assert.ok(inBaghdad.length > 0 && inBaghdad.length < all.length);
    for (const d of inBaghdad) assert.strictEqual(d.governorateId, 'baghdad');
    assert.deepStrictEqual(searchDistricts('ka', { governorate: 'بغداد' }), inBaghdad);
    assert.deepStrictEqual(searchDistricts('ka', { governorate: 'nowhere' }), []);
  });

  it('returns nothing for an empty query', () => {
    assert.deepStrictEqual(searchDistricts(''), []);
  });
});

describe('getDistrictsByGovernorate', () => {
  it('accepts any name of the governorate', () => {
    const ids = getDistrictsByGovernorate('basra').map((d) => d.id);
    assert.ok(ids.includes('zubair') && ids.includes('faw'));
    assert.deepStrictEqual(getDistrictsByGovernorate('البصرة').map((d) => d.id), ids);
    assert.deepStrictEqual(getDistrictsByGovernorate('IQ-BA').map((d) => d.id), ids);
  });

  it('gives Halabja its own districts', () => {
    assert.deepStrictEqual(getDistrictsByGovernorate('halabja').map((d) => d.id), ['bamo', 'byara', 'halabja', 'khurmal', 'sirwan']);
    assert.ok(!getDistrictsByGovernorate('sulaymaniyah').some((d) => d.id === 'halabja'));
  });

  it('returns nothing for an unknown governorate', () => {
    assert.deepStrictEqual(getDistrictsByGovernorate('nowhere'), []);
  });
});
