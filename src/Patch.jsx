import Remutable from './Remutable';
import 'should';
import _bindAll from 'lodash/bindAll';
import _extend from 'lodash/extend';
import _clone from 'lodash/clone';
const __DEV__ = process.env.NODE_ENV === 'development';

class Patch {
  constructor({ mutations = {}, from, to }) {
    if(__DEV__) {
      mutations.should.be.an.Object;
      from.should.be.an.Object;
      from.h.should.be.ok;
      from.v.should.be.a.Number;
      to.should.be.an.Object;
      to.h.should.be.ok;
      to.v.should.be.a.Number;
    }
    Object.assign(this, {
      mutations,
      from,
      to,
      _js: null,
      _json: null,
    });
    _bindAll(this, [
      'toJS',
      'toJSON',
    ]);
  }

  get source() {
    return this.from.h;
  }

  get target() {
    return this.to.h;
  }

  toJS() {
    if(this._js === null) {
      this._js = {
        m: this.mutations,
        f: this.from,
        t: this.to,
      };
    }
    return this._js;
  }

  toJSON() {
    if(this._json === null) {
      this._json = JSON.stringify(this.toJS());
    }
    return this._json;
  }

  static revert(patch) {
    const mutations = {};
    Object.keys(patch.mutations).forEach((key) => {
      const { f, t } = patch.mutations[key];
      mutations[key] = { f: t, t: f };
    });
    return new Patch({
      mutations,
      from: { h: patch.to.h, v: patch.to.v },
      to: { h: patch.from.h, v: patch.from.v },
    });
  }

  static fromMutations({ mutations, hash, version }) {
    const from = {
      h: hash,
      v: version,
    };
    // New hash is calculated so that if two identical remutables are updated
    // using structurally equal mutations, then they will get the same hash.
    const to = {
      h: Remutable.hashFn(hash + Remutable.signFn(mutations)),
      v: version + 1,
    };
    return new Patch({ mutations, from, to });
  }

  static fromJS({ m, f, t }) {
    if(__DEV__) {
      m.should.be.an.Object;
      f.should.be.an.Object;
      t.should.be.an.Object;
    }
    return new Patch({
      mutations: m,
      from: f,
      to: t,
    });
  }

  static fromJSON(json) {
    return Patch.fromJS(JSON.parse(json));
  }

  static combine(patchA, patchB) {
    if(__DEV__) {
      patchA.should.be.an.instanceOf(Patch);
      patchB.should.be.an.instanceOf(Patch);
      // One can only combine compatible patches
      patchA.target.should.be.exactly(patchB.source);
    }
	const mutations = _clone(patchA.mutations);
	Object.keys(patchB.mutations).forEach((key) => {
		if (!mutations[key]) {
			mutations[key] = patchB.mutations[key];
		}
		else {
			_extend(mutations[key].t, patchB.mutations[key].t);
		}
	});
    return new Patch({
      mutations,
      from: _clone(patchA.from),
      to: _clone(patchB.to),
    });
  }

  static fromDiff(prev, next) {
    if(__DEV__) {
      (prev instanceof Remutable || prev instanceof Remutable.Consumer).should.be.ok;
      (next instanceof Remutable || next instanceof Remutable.Consumer).should.be.ok;
      prev.version.should.be.below(next.version);
    }
    const from = {
      h: prev.hash,
      v: prev.version,
    };
    const to = {
      h: next.hash,
      v: next.version,
    };
    const mutations = {};
    const diffKeys = {};
    [prev, next].forEach((rem) =>
      rem.head.forEach((val, key) =>
        prev.head.get(key) !== next.head.get(key) ? (diffKeys[key] = null) : void val
      )
    );
    Object.keys(diffKeys).forEach((key) => mutations[key] = {
      f: prev.head.get(key),
      t: next.head.get(key),
    });
    return new Patch({ mutations, from, to });
  }
}

export default Patch;
