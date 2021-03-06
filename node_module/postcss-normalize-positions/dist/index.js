"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _postcssValueParser = _interopRequireWildcard(require("postcss-value-parser"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const directionKeywords = new Set(['top', 'right', 'bottom', 'left', 'center']);
const center = '50%';
const horizontal = new Map([['right', '100%'], ['left', '0']]);
const verticalValue = new Map([['bottom', '100%'], ['top', '0']]);
const mathFunctions = new Set(['calc', 'min', 'max', 'clamp']);

function isCommaNode(node) {
  return node.type === 'div' && node.value === ',';
}

function isVariableFunctionNode(node) {
  if (node.type !== 'function') {
    return false;
  }

  return ['var', 'env'].includes(node.value.toLowerCase());
}

function isMathFunctionNode(node) {
  if (node.type !== 'function') {
    return false;
  }

  return mathFunctions.has(node.value.toLowerCase());
}

function isNumberNode(node) {
  if (node.type !== 'word') {
    return false;
  }

  const value = parseFloat(node.value);
  return !isNaN(value);
}

function isDimensionNode(node) {
  if (node.type !== 'word') {
    return false;
  }

  const parsed = (0, _postcssValueParser.unit)(node.value);

  if (!parsed) {
    return false;
  }

  return parsed.unit !== '';
}

function transform(value) {
  const parsed = (0, _postcssValueParser.default)(value);
  const ranges = [];
  let rangeIndex = 0;
  let shouldContinue = true;
  parsed.nodes.forEach((node, index) => {
    // After comma (`,`) follows next background
    if (isCommaNode(node)) {
      rangeIndex += 1;
      shouldContinue = true;
      return;
    }

    if (!shouldContinue) {
      return;
    } // After separator (`/`) follows `background-size` values
    // Avoid them


    if (node.type === 'div' && node.value === '/') {
      shouldContinue = false;
      return;
    }

    if (!ranges[rangeIndex]) {
      ranges[rangeIndex] = {
        start: null,
        end: null
      };
    } // Do not try to be processed `var and `env` function inside background


    if (isVariableFunctionNode(node)) {
      shouldContinue = false;
      ranges[rangeIndex].start = null;
      ranges[rangeIndex].end = null;
      return;
    }

    const isPositionKeyword = node.type === 'word' && directionKeywords.has(node.value.toLowerCase()) || isDimensionNode(node) || isNumberNode(node) || isMathFunctionNode(node);

    if (ranges[rangeIndex].start === null && isPositionKeyword) {
      ranges[rangeIndex].start = index;
      ranges[rangeIndex].end = index;
      return;
    }

    if (ranges[rangeIndex].start !== null) {
      if (node.type === 'space') {
        return;
      } else if (isPositionKeyword) {
        ranges[rangeIndex].end = index;
        return;
      }

      return;
    }
  });
  ranges.forEach(range => {
    if (range.start === null) {
      return;
    }

    const nodes = parsed.nodes.slice(range.start, range.end + 1);

    if (nodes.length > 3) {
      return;
    }

    const firstNode = nodes[0].value.toLowerCase();
    const secondNode = nodes[2] && nodes[2].value ? nodes[2].value.toLowerCase() : null;

    if (nodes.length === 1 || secondNode === 'center') {
      if (secondNode) {
        nodes[2].value = nodes[1].value = '';
      }

      const map = new Map([...horizontal, ['center', center]]);

      if (map.has(firstNode)) {
        nodes[0].value = map.get(firstNode);
      }

      return;
    }

    if (firstNode === 'center' && directionKeywords.has(secondNode)) {
      nodes[0].value = nodes[1].value = '';

      if (horizontal.has(secondNode)) {
        nodes[2].value = horizontal.get(secondNode);
      }

      return;
    }

    if (horizontal.has(firstNode) && verticalValue.has(secondNode)) {
      nodes[0].value = horizontal.get(firstNode);
      nodes[2].value = verticalValue.get(secondNode);
      return;
    } else if (verticalValue.has(firstNode) && horizontal.has(secondNode)) {
      nodes[0].value = horizontal.get(secondNode);
      nodes[2].value = verticalValue.get(firstNode);
      return;
    }
  });
  return parsed.toString();
}

function pluginCreator() {
  return {
    postcssPlugin: 'postcss-normalize-positions',

    OnceExit(css) {
      const cache = new Map();
      css.walkDecls(/^(background(-position)?|(-\w+-)?perspective-origin)$/i, decl => {
        const value = decl.value;

        if (!value) {
          return;
        }

        if (cache.has(value)) {
          decl.value = cache.get(value);
          return;
        }

        const result = transform(value);
        decl.value = result;
        cache.set(value, result);
      });
    }

  };
}

pluginCreator.postcss = true;
var _default = pluginCreator;
exports.default = _default;
module.exports = exports.default;