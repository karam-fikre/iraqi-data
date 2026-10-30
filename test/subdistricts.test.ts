import { districts, getDistrict, governorates } from '../src/index';
import { subdistricts, getSubdistrict, searchSubdistricts, getSubdistrictsByDistrict, getNearestSubdistrict } from '../src/subdistricts';
import { distanceKm } from '../src/lookup';
import assert from 'assert';

describe('Sub-district data', () => {
  it('has one center for every district, and the نواحي on top', () => {
    const centers = subdistricts.filter((s) => s.isCenter);
    assert.strictEqual(centers.length, districts.length);
    assert.deepStrictEqual(centers.map((s) => s.districtId), districts.map((d) => d.id));
    assert.strictEqual(subdistricts.length - centers.length, 252);
  });

  it('puts every sub-district in a real district of the right governorate', () => {
    for (const s of subdistricts) assert.strictEqual(getDistrict(s.districtId)?.governorateId, s.governorateId, s.id);
  });

  it('lists sub-districts in the same order as districts, center first', () => {
    const order = [...new Set(subdistricts.map((s) => s.districtId))];
    assert.deepStrictEqual(order, districts.map((d) => d.id));
    for (const d of districts) assert.strictEqual(getSubdistrictsByDistrict(d.id)[0].isCenter, true, d.id);
  });

  it('has unique ids and P-codes', () => {
    const ids = subdistricts.map((s) => s.id);
    const pcodes = subdistricts.map((s) => s.pcode).filter(Boolean);
    assert.strictEqual(new Set(ids).size, ids.length);
    assert.strictEqual(new Set(pcodes).size, pcodes.length);
  });

  it('has a name in all three languages, in the right script', () => {
    for (const s of subdistricts) {
      assert.match(s.ar, /[؀-ۿ]/, s.id);
      assert.match(s.ku, /[؀-ۿ]/, s.id);
      assert.match(s.en, /^[A-Za-z]/, s.id);
      assert.match(s.id, /^[a-z0-9]+$/, s.id);
    }
  });

  it('keeps every center inside Iraq and near its district', () => {
    for (const s of subdistricts) {
      if (!s.center) continue;
      assert.ok(s.center.lat > 29 && s.center.lat < 37.5 && s.center.lng > 38.7 && s.center.lng < 48.8, s.id);
      const seat = getDistrict(s.districtId)!.center;
      assert.ok(distanceKm(s.center.lat, s.center.lng, seat.lat, seat.lng) < 120, s.id);
    }
  });

  it('corrects the Kifri and Mandali rows that COSIT prints swapped', () => {
    const names = (d: string) => getSubdistrictsByDistrict(d).map((s) => s.ar);
    assert.ok(names('kifri').includes('قرة تبة') && names('kifri').includes('جبارة'));
    assert.ok(names('mandali').includes('قزانية') && !names('kifri').includes('قزانية'));
  });

  it('cannot be changed by an app', () => {
    assert.ok(Object.isFrozen(subdistricts));
    assert.ok(Object.isFrozen(subdistricts[0]));
    assert.ok(Object.isFrozen(subdistricts[0].aliases));
  });
});

describe('getSubdistrict', () => {
  it('finds by id, name in any language, or alias', () => {
    assert.strictEqual(getSubdistrict('bashiqa')?.districtId, 'mosul');
    assert.strictEqual(getSubdistrict('بعشيقه')?.id, 'bashiqa');
    assert.strictEqual(getSubdistrict('بەعشیقە')?.id, 'bashiqa');
    assert.strictEqual(getSubdistrict('Ashnouna')?.en, 'Buhriz');
  });

  it('finds a district center by the name of its district', () => {
    assert.strictEqual(getSubdistrict('Mosul')?.id, 'mosulcenter');
    assert.strictEqual(getSubdistrict('الموصل')?.isCenter, true);
  });

  it('tells apart names used in more than one district', () => {
    assert.strictEqual(getSubdistrict('السلام', { district: 'khalis' })?.districtId, 'khalis');
    assert.strictEqual(getSubdistrict('السلام', { district: 'العمارة' }), undefined);
    assert.strictEqual(getSubdistrict('السلام', { district: 'الميمونة' })?.districtId, 'maimouna');
  });

  it('returns undefined for unknown places', () => {
    assert.strictEqual(getSubdistrict('Paris'), undefined);
    assert.strictEqual(getSubdistrict(''), undefined);
  });
});

describe('searchSubdistricts', () => {
  it('finds names that contain the query', () => {
    assert.ok(searchSubdistricts('بعش').some((s) => s.id === 'bashiqa'));
    assert.deepStrictEqual(searchSubdistricts(''), []);
  });

  it('searches inside a district or a governorate', () => {
    for (const s of searchSubdistricts('ال', { district: 'mosul' })) assert.strictEqual(s.districtId, 'mosul');
    for (const s of searchSubdistricts('سلام', { governorate: 'maysan' })) assert.strictEqual(s.governorateId, 'maysan');
    assert.ok(searchSubdistricts('سلام', { governorate: 'maysan' }).length > 0);
    assert.deepStrictEqual(searchSubdistricts('سلام', { governorate: 'nowhere' }), []);
  });
});

describe('getSubdistrictsByDistrict', () => {
  it('takes anything getDistrict accepts', () => {
    assert.deepStrictEqual(getSubdistrictsByDistrict('الموصل'), getSubdistrictsByDistrict('mosul'));
    assert.strictEqual(getSubdistrictsByDistrict('mosul').length, 6);
  });

  it('returns an empty list for an unknown district', () => {
    assert.deepStrictEqual(getSubdistrictsByDistrict('nowhere'), []);
  });

  it('gives every governorate some sub-districts', () => {
    for (const g of governorates) assert.ok(subdistricts.some((s) => s.governorateId === g.id), g.id);
  });
});

describe('getNearestSubdistrict', () => {
  it('returns each sub-district with a location, or one at the same spot, for its own center', () => {
    for (const s of subdistricts) {
      if (!s.center) continue;
      const found = getNearestSubdistrict(s.center.lat, s.center.lng)!;
      assert.deepStrictEqual([found.center?.lat, found.center?.lng], [s.center.lat, s.center.lng], s.id);
    }
  });

  it('returns undefined for a point farther than maxDistance from every center', () => {
    assert.strictEqual(getNearestSubdistrict(29.3759, 47.9774, { maxDistance: 20 }), undefined);  // Kuwait City
  });

  it('throws for something that is not a location', () => {
    assert.throws(() => getNearestSubdistrict(NaN, 44), RangeError);
  });
});
