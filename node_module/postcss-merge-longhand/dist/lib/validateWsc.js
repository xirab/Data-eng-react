"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isColor = isColor;
exports.isStyle = isStyle;
exports.isValidWsc = isValidWsc;
exports.isWidth = isWidth;

var _colornames = _interopRequireDefault(require("./colornames.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const widths = new Set(['thin', 'medium', 'thick']);
const styles = new Set(['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset']);

function isStyle(value) {
  return value && styles.has(value.toLowerCase());
}

function isWidth(value) {
  return value && widths.has(value.toLowerCase()) || /^(\d+(\.\d+)?|\.\d+)(\w+)?$/.test(value);
}

function isColor(value) {
  if (!value) {
    return false;
  }

  value = value.toLowerCase();

  if (/rgba?\(/.test(value)) {
    return true;
  }

  if (/hsla?\(/.test(value)) {
    return true;
  }

  if (/#([0-9a-z]{6}|[0-9a-z]{3})/.test(value)) {
    return true;
  }

  if (value === 'transparent') {
    return true;
  }

  if (value === 'currentcolor') {
    return true;
  }

  return _colornames.default.has(value);
}

function isValidWsc(wscs) {
  const validWidth = isWidth(wscs[0]);
  const validStyle = isStyle(wscs[1]);
  const validColor = isColor(wscs[2]);
  return validWidth && validStyle || validWidth && validColor || validStyle && validColor;
}