'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Remutable = require('./Remutable');

var _Remutable2 = _interopRequireDefault(_Remutable);

require('should');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __DEV__ = process.env.NODE_ENV === 'development';

var Patch = function () {
  function Patch(_ref) {
    var _ref$mutations = _ref.mutations;
    var mutations = _ref$mutations === undefined ? {} : _ref$mutations;
    var from = _ref.from;
    var to = _ref.to;

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
    _extends(this, {
      mutations: mutations,
      from: from,
      to: to,
      _js: null,
      _json: null
    });
    _lodash2.default.bindAll(this, ['toJS', 'toJSON']);
  }

  _createClass(Patch, [{
    key: 'toJS',
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
    key: 'toJSON',
    value: function toJSON() {
      if (this._json === null) {
        this._json = JSON.stringify(this.toJS());
      }
      return this._json;
    }
  }, {
    key: 'source',
    get: function get() {
      return this.from.h;
    }
  }, {
    key: 'target',
    get: function get() {
      return this.to.h;
    }
  }], [{
    key: 'revert',
    value: function revert(patch) {
      var mutations = {};
      Object.keys(patch.mutations).forEach(function (key) {
        var _patch$mutations$key = patch.mutations[key];
        var f = _patch$mutations$key.f;
        var t = _patch$mutations$key.t;

        mutations[key] = { f: t, t: f };
      });
      return new Patch({
        mutations: mutations,
        from: { h: patch.to.h, v: patch.to.v },
        to: { h: patch.from.h, v: patch.from.v }
      });
    }
  }, {
    key: 'fromMutations',
    value: function fromMutations(_ref2) {
      var mutations = _ref2.mutations;
      var hash = _ref2.hash;
      var version = _ref2.version;

      var from = {
        h: hash,
        v: version
      };
      // New hash is calculated so that if two identical remutables are updated
      // using structurally equal mutations, then they will get the same hash.
      var to = {
        h: _Remutable2.default.hashFn(hash + _Remutable2.default.signFn(mutations)),
        v: version + 1
      };
      return new Patch({ mutations: mutations, from: from, to: to });
    }
  }, {
    key: 'fromJS',
    value: function fromJS(_ref3) {
      var m = _ref3.m;
      var f = _ref3.f;
      var t = _ref3.t;

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
    key: 'fromJSON',
    value: function fromJSON(json) {
      return Patch.fromJS(JSON.parse(json));
    }
  }, {
    key: 'combine',
    value: function combine(patchA, patchB) {
      if (__DEV__) {
        patchA.should.be.an.instanceOf(Patch);
        patchB.should.be.an.instanceOf(Patch);
        // One can only combine compatible patches
        patchA.target.should.be.exactly(patchB.source);
      }
      var mutations = _lodash2.default.clone(patchA.mutations);
      Object.keys(patchB.mutations).forEach(function (key) {
        if (!mutations[key]) {
          mutations[key] = patchB.mutations[key];
        } else {
          _lodash2.default.extend(mutations[key].t, patchB.mutations[key].t);
        }
      });
      return new Patch({
        mutations: mutations,
        from: _lodash2.default.clone(patchA.from),
        to: _lodash2.default.clone(patchB.to)
      });
    }
  }, {
    key: 'fromDiff',
    value: function fromDiff(prev, next) {
      if (__DEV__) {
        (prev instanceof _Remutable2.default || prev instanceof _Remutable2.default.Consumer).should.be.ok;
        (next instanceof _Remutable2.default || next instanceof _Remutable2.default.Consumer).should.be.ok;
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
      return new Patch({ mutations: mutations, from: from, to: to });
    }
  }]);

  return Patch;
}();

exports.default = Patch;