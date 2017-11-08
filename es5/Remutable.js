function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { str as crc32 } from 'crc-32';
import Immutable from 'immutable';
import 'should';
import _bindAll from 'lodash/bindAll';

var __DEV__ = process.env.NODE_ENV === 'development';

var Consumer = function Consumer(ctx) {
  var _this = this;

  _classCallCheck(this, Consumer);

  if (__DEV__) {
    ctx.should.be.an.instanceOf(Remutable);
  }

  this._ctx = ctx; // proxy all these methods to ctx

  ['toJS', 'toJSON'].forEach(function (m) {
    return _this[m] = ctx[m];
  }); // proxy all these property getters to ctx

  ['head', 'hash', 'version'].forEach(function (p) {
    return Object.defineProperty(_this, p, {
      enumerable: true,
      get: function get() {
        return ctx[p];
      }
    });
  });
};

var Producer =
/*#__PURE__*/
function () {
  function Producer(ctx) {
    var _this2 = this;

    _classCallCheck(this, Producer);

    if (__DEV__) {
      ctx.should.be.an.instanceOf(Remutable);
    }

    _bindAll(this, ['set', 'apply']);

    this._ctx = ctx; // proxy all these methods to ctx

    ['delete', 'rollback', 'commit', 'match', 'toJS', 'toJSON'].forEach(function (m) {
      return _this2[m] = ctx[m];
    }); // proxy all these property getters to ctx

    ['head', 'working', 'hash', 'version'].forEach(function (p) {
      return Object.defineProperty(_this2, p, {
        enumerable: true,
        get: function get() {
          return ctx[p];
        }
      });
    });
  } // intercept set to make it chainable


  _createClass(Producer, [{
    key: "set",
    value: function set() {
      this._ctx.set.apply(this._ctx, arguments);

      return this;
    } // intercept apply to make it chainable

  }, {
    key: "apply",
    value: function apply() {
      this._ctx.apply.apply(this._ctx, arguments);

      return this;
    }
  }]);

  return Producer;
}();

var Remutable =
/*#__PURE__*/
function () {
  // placeholder reference
  function Remutable() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var hash = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, Remutable);

    Object.defineProperty(this, "_head", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "_working", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "_mutations", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "_hash", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "_version", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "_dirty", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: null
    });
    hash = hash || Remutable.hashFn(Remutable.signFn(data));

    if (__DEV__) {
      data.should.be.an.Object;
      version.should.be.a.Number;
    }

    _bindAll(this, ['createConsumer', 'createProducer', 'destroy', 'toJS', 'toJSON', 'get', 'set', 'delete', 'commit', 'rollback', 'match', 'apply']);

    this._head = new Immutable.Map(data);
    this._working = this._head;
    this._version = version;
    this._hash = hash;
    this._dirty = false;
    this._mutations = {};
    this._js = {
      hash: {},
      js: null
    };
    this._json = {
      hash: {},
      json: null
    };
  }

  _createClass(Remutable, [{
    key: "createConsumer",
    value: function createConsumer() {
      return new Consumer(this);
    }
  }, {
    key: "createProducer",
    value: function createProducer() {
      return new Producer(this);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      // Explicitly nullify references
      this._head = null;
      this._working = null;
      this._dirty = null;
      this._mutations = null;
      this._serialized = null;
    }
  }, {
    key: "toJS",
    value: function toJS() {
      if (this._js.hash !== this._hash) {
        this._js = {
          hash: this._hash,
          js: {
            h: this._hash,
            v: this._version,
            d: this._head.toJS()
          }
        };
      }

      return this._js.js;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      if (this._json.hash !== this._hash) {
        this._json = {
          hash: this._hash,
          json: JSON.stringify(this.toJS())
        };
      }

      return this._json.json;
    }
  }, {
    key: "get",
    value: function get(key) {
      return this._working.get(key);
    }
  }, {
    key: "set",
    value: function set(key, val) {
      if (__DEV__) {
        key.should.be.a.String;
      }

      this._dirty = true; // Retain the previous value to make the patch reversible

      var f = this._head.get(key);

      var t = val;
      this._mutations[key] = {
        f: f,
        t: t
      };

      if (val === void 0) {
        this._working = this._working.delete(key);
      } else {
        this._working = this._working.set(key, val);
      }

      return this;
    }
  }, {
    key: "delete",
    value: function _delete(key) {
      return this.set(key, void 0);
    }
  }, {
    key: "commit",
    value: function commit() {
      var patch = Remutable.Patch.fromMutations({
        mutations: this._mutations,
        hash: this._hash,
        version: this._version
      });
      this._head = this._working;
      this._mutations = {};
      this._dirty = false;
      this._hash = patch.to.h;
      this._version = patch.to.v;
      return patch;
    }
  }, {
    key: "rollback",
    value: function rollback() {
      this._working = this._head;
      this._mutations = {};
      this._dirty = false;
      return this;
    }
  }, {
    key: "match",
    value: function match(patch) {
      if (__DEV__) {
        patch.should.be.an.instanceOf(Remutable.Patch);
      }

      return this._hash === patch.from.h;
    }
  }, {
    key: "apply",
    value: function apply(patch) {
      if (this._dirty || !this.match(patch)) {
        throw new Error();
      }

      var head = this._head.withMutations(function (map) {
        Object.keys(patch.mutations).forEach(function (key) {
          var t = patch.mutations[key].t;

          if (t === void 0) {
            map = map.delete(key);
          } else {
            map = map.set(key, t);
          }
        });
        return map;
      });

      this._working = this._head = head;
      this._hash = patch.to.h;
      this._version = patch.to.v;
      return this;
    }
  }, {
    key: "dirty",
    get: function get() {
      return this._dirty;
    }
  }, {
    key: "hash",
    get: function get() {
      return this._hash;
    }
  }, {
    key: "version",
    get: function get() {
      return this._version;
    }
  }, {
    key: "head",
    get: function get() {
      return this._head;
    }
  }, {
    key: "working",
    get: function get() {
      return this._working;
    }
  }], [{
    key: "fromJS",
    value: function fromJS(_ref) {
      var h = _ref.h,
          v = _ref.v,
          d = _ref.d;
      return new Remutable(d, v, h);
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(json) {
      return Remutable.fromJS(JSON.parse(json));
    }
  }]);

  return Remutable;
}();

Object.defineProperty(Remutable, "Patch", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: null
});
Object.defineProperty(Remutable, "hashFn", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: crc32
});
Object.defineProperty(Remutable, "signFn", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: JSON.stringify.bind(JSON)
});
Object.defineProperty(Remutable, "Consumer", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: Consumer
});
Object.defineProperty(Remutable, "Producer", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: Producer
});
;
export default Remutable;