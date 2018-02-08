"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Patch", {
  enumerable: true,
  get: function get() {
    return _Patch.default;
  }
});
exports.default = void 0;

var _Remutable = _interopRequireDefault(require("./Remutable"));

var _Patch = _interopRequireDefault(require("./Patch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.assign(_Remutable.default, {
  Patch: _Patch.default
});
var _default = _Remutable.default;
exports.default = _default;