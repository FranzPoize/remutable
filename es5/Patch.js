function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import Remutable from './Remutable';
import 'should';
import _bindAll from 'lodash/bindAll';
import _extend from 'lodash/bindAll';
import _clone from 'lodash/bindAll';

var __DEV__ = process.env.NODE_ENV === 'development';

var Patch =
/*#__PURE__*/
function () {
  function Patch(_ref) {
    var _ref$mutations = _ref.mutations,
        mutations = _ref$mutations === void 0 ? {} : _ref$mutations,
        from = _ref.from,
        to = _ref.to;

    _classCallCheck(this, Patch);

    if (__DEV__) {
      mutations.should.be.an.Object;
      from.should.be.an.Object;
      from.h.should.be.ok;
      from.v.should.be.a.Number;
      to.should.be.an.Object;
      to.h.should.be.ok;
      to.v.should.be.a.Number;
    }

    Object.assign(this, {
      mutations: mutations,
      from: from,
      to: to,
      _js: null,
      _json: null
    });

    _bindAll(this, ['toJS', 'toJSON']);
  }

  _createClass(Patch, [{
    key: "toJS",
    value: function toJS() {
      if (this._js === null) {
        this._js = {
          m: this.mutations,
          f: this.from,
          t: this.to
        };
      }

      return this._js;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      if (this._json === null) {
        this._json = JSON.stringify(this.toJS());
      }

      return this._json;
    }
  }, {
    key: "source",
    get: function get() {
      return this.from.h;
    }
  }, {
    key: "target",
    get: function get() {
      return this.to.h;
    }
  }], [{
    key: "revert",
    value: function revert(patch) {
      var mutations = {};
      Object.keys(patch.mutations).forEach(function (key) {
        var _patch$mutations$key = patch.mutations[key],
            f = _patch$mutations$key.f,
            t = _patch$mutations$key.t;
        mutations[key] = {
          f: t,
          t: f
        };
      });
      return new Patch({
        mutations: mutations,
        from: {
          h: patch.to.h,
          v: patch.to.v
        },
        to: {
          h: patch.from.h,
          v: patch.from.v
        }
      });
    }
  }, {
    key: "fromMutations",
    value: function fromMutations(_ref2) {
      var mutations = _ref2.mutations,
          hash = _ref2.hash,
          version = _ref2.version;
      var from = {
        h: hash,
        v: version
      }; // New hash is calculated so that if two identical remutables are updated
      // using structurally equal mutations, then they will get the same hash.

      var to = {
        h: Remutable.hashFn(hash + Remutable.signFn(mutations)),
        v: version + 1
      };
      return new Patch({
        mutations: mutations,
        from: from,
        to: to
      });
    }
  }, {
    key: "fromJS",
    value: function fromJS(_ref3) {
      var m = _ref3.m,
          f = _ref3.f,
          t = _ref3.t;

      if (__DEV__) {
        m.should.be.an.Object;
        f.should.be.an.Object;
        t.should.be.an.Object;
      }

      return new Patch({
        mutations: m,
        from: f,
        to: t
      });
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(json) {
      return Patch.fromJS(JSON.parse(json));
    }
  }, {
    key: "combine",
    value: function combine(patchA, patchB) {
      if (__DEV__) {
        patchA.should.be.an.instanceOf(Patch);
        patchB.should.be.an.instanceOf(Patch); // One can only combine compatible patches

        patchA.target.should.be.exactly(patchB.source);
      }

      var mutations = _clone(patchA.mutations);

      Object.keys(patchB.mutations).forEach(function (key) {
        if (!mutations[key]) {
          mutations[key] = patchB.mutations[key];
        } else {
          _extend(mutations[key].t, patchB.mutations[key].t);
        }
      });
      return new Patch({
        mutations: mutations,
        from: _clone(patchA.from),
        to: _clone(patchB.to)
      });
    }
  }, {
    key: "fromDiff",
    value: function fromDiff(prev, next) {
      if (__DEV__) {
        (prev instanceof Remutable || prev instanceof Remutable.Consumer).should.be.ok;
        (next instanceof Remutable || next instanceof Remutable.Consumer).should.be.ok;
        prev.version.should.be.below(next.version);
      }

      var from = {
        h: prev.hash,
        v: prev.version
      };
      var to = {
        h: next.hash,
        v: next.version
      };
      var mutations = {};
      var diffKeys = {};
      [prev, next].forEach(function (rem) {
        return rem.head.forEach(function (val, key) {
          return prev.head.get(key) !== next.head.get(key) ? diffKeys[key] = null : void val;
        });
      });
      Object.keys(diffKeys).forEach(function (key) {
        return mutations[key] = {
          f: prev.head.get(key),
          t: next.head.get(key)
        };
      });
      return new Patch({
        mutations: mutations,
        from: from,
        to: to
      });
    }
  }]);

  return Patch;
}();

export default Patch;