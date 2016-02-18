'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Patch = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _Remutable = require('./Remutable');

var _Remutable2 = _interopRequireDefault(_Remutable);

var _Patch = require('./Patch');

var _Patch2 = _interopRequireDefault(_Patch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_extends(_Remutable2.default, { Patch: _Patch2.default });

exports.Patch = _Patch2.default;
exports.default = _Remutable2.default;