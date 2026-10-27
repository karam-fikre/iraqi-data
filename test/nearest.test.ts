import { districts, governorates, getNearestDistrict, getNearestGovernorate } from '../src/index';
import assert from 'assert';

describe('getNearestDistrict', () => {
  it('returns each district for its own center', () => {
    for (const d of districts) assert.strictEqual(getNearestDistrict(d.center.lat, d.center.lng), d, d.id);
  });

  it('finds the district of well-known places', () => {
    const at = (lat: number, lng: number) => getNearestDistrict(lat, lng)?.id;
    assert.strictEqual(at(33.2625, 44.2346), 'abughraib');  // Baghdad airport
    assert.strictEqual(at(36.2376, 43.9632), 'ainkawa');    // Erbil airport
    assert.strictEqual(at(32.6165, 44.0324), 'karbala');    // Imam Husayn shrine
    assert.strictEqual(at(31.9961, 44.3148), 'najaf');      // Imam Ali shrine
  });

  it('returns undefined for a point farther than maxDistance from every center', () => {
    assert.strictEqual(getNearestDistrict(29.3759, 47.9774, { maxDistance: 50 }), undefined);  // Kuwait City
    assert.strictEqual(getNearestDistrict(29.3759, 47.9774)?.id, 'faw');
    assert.strictEqual(getNearestDistrict(31.9961, 44.3148, { maxDistance: 50 })?.id, 'najaf');
  });

  it('throws for something that is not a location', () => {
    assert.throws(() => getNearestDistrict(NaN, 44), RangeError);
    assert.throws(() => getNearestDistrict(33, Infinity), RangeError);
    assert.throws(() => getNearestDistrict(91, 44), RangeError);
  });
});

describe('getNearestGovernorate', () => {
  it('returns each governorate for its capital', () => {
    for (const g of governorates) assert.strictEqual(getNearestGovernorate(g.capital.lat, g.capital.lng), g, g.id);
  });

  it('finds the governorate of well-known places', () => {
    assert.strictEqual(getNearestGovernorate(30.549, 47.662)?.id, 'basra');            // Basra airport
    assert.strictEqual(getNearestGovernorate(35.5651, 45.4296)?.id, 'sulaymaniyah');  // Azadi Park
    assert.strictEqual(getNearestGovernorate(36.3833, 43.1407)?.id, 'nineveh');       // University of Mosul
  });

  it('returns undefined for a point farther than maxDistance', () => {
    assert.strictEqual(getNearestGovernorate(29.3759, 47.9774, { maxDistance: 50 }), undefined);
  });
});
