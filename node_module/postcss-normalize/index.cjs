var postcssBrowserComments = require('postcss-browser-comments');
var Module = require('module');
var path = require('path');

var fs = require('fs');
var postcss = require('postcss');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var postcssBrowserComments__default = /*#__PURE__*/_interopDefaultLegacy(postcssBrowserComments);
var Module__default = /*#__PURE__*/_interopDefaultLegacy(Module);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);

const assign = (...objects) => Object.assign(...objects);
const create = (...objects) => assign(Object.create(null), ...objects);

const currentFilename = __filename;
const currentDirname = path__default['default'].dirname(currentFilename); // get resolved filenames for normalize.css

const normalizeCSS = resolve('@csstools/normalize.css');
const normalizeDir = path__default['default'].dirname(normalizeCSS);
const normalizeOpinionatedCSS = path__default['default'].join(normalizeDir, 'opinionated.css'); // get resolved filenames for sanitize.css

const sanitizeCSS = resolve('sanitize.css');
const sanitizeDir = path__default['default'].dirname(sanitizeCSS);
const sanitizeAssetsCSS = path__default['default'].join(sanitizeDir, 'assets.css');
const sanitizeFormsCSS = path__default['default'].join(sanitizeDir, 'forms.css');
const sanitizeReduceMotionCSS = path__default['default'].join(sanitizeDir, 'reduce-motion.css');
const sanitizeTypographyCSS = path__default['default'].join(sanitizeDir, 'typography.css');
const sanitizeSystemUiCSS = path__default['default'].join(sanitizeDir, 'system-ui.css');
const sanitizeUiMonospace = path__default['default'].join(sanitizeDir, 'ui-monospace.css'); // export a hashmap of css library filenames

const parsableFilenames = create({
  [normalizeCSS]: true,
  [normalizeOpinionatedCSS]: true,
  [sanitizeCSS]: true,
  [sanitizeAssetsCSS]: true,
  [sanitizeFormsCSS]: true,
  [sanitizeReduceMotionCSS]: true,
  [sanitizeTypographyCSS]: true,
  [sanitizeSystemUiCSS]: true,
  [sanitizeUiMonospace]: true
}); // export a hashmap of css library filenames by id

const resolvedFilenamesById = create({
  'normalize': [normalizeCSS],
  'normalize/opinionated': [normalizeOpinionatedCSS],
  'normalize/*': [normalizeOpinionatedCSS],
  'sanitize': [sanitizeCSS],
  'sanitize/assets': [sanitizeAssetsCSS],
  'sanitize/forms': [sanitizeCSS, sanitizeFormsCSS],
  'sanitize/page': [sanitizeAssetsCSS],
  // deprecated; remaining for v10.0.0 compatibility
  'sanitize/reduce-motion': [sanitizeCSS, sanitizeReduceMotionCSS],
  'sanitize/system-ui': [sanitizeCSS, sanitizeSystemUiCSS],
  'sanitize/typography': [sanitizeCSS, sanitizeTypographyCSS],
  'sanitize/ui-monospace': [sanitizeCSS, sanitizeUiMonospace],
  'sanitize/*': [sanitizeCSS, sanitizeFormsCSS]
}); // get the resolved filename of a package/module

function resolve(id) {
  return resolve[id] = resolve[id] || Module__default['default']._resolveFilename(id, {
    id: currentFilename,
    filename: currentFilename,
    paths: Module__default['default']._nodeModulePaths(currentDirname)
  });
}

const cache$1 = create();
async function readFile(filename) {
  filename = path__default['default'].resolve(filename);
  cache$1[filename] = cache$1[filename] || create();
  return new Promise((resolve, reject) => fs__default['default'].stat(filename, (statsError, {
    mtime
  }) => statsError ? reject(statsError) : mtime === cache$1[filename].mtime ? resolve(cache$1[filename].data) : fs__default['default'].readFile(filename, 'utf8', (readFileError, data) => readFileError ? reject(readFileError) : resolve((cache$1[filename] = {
    data,
    mtime
  }).data))));
}

const cache = create(null);
var parse = ((filename, transformer) => readFile(filename).then( // cache the parsed css root
css => cache[css] = cache[css] || postcss__default['default'].parse(css, {
  from: filename
})).then( // clone the cached root
root => root.clone()).then( // transform the cloned root
clone => Promise.resolve(transformer(clone)).then( // resolve the cloned root
() => clone)));

var postcssImportNormalize = (commentsTransformer => opts => {
  opts = create(opts); // return an postcss-import configuration

  return create({
    load(filename, importOptions) {
      return filename in parsableFilenames // parse the file (the file and css are conservatively cached)
      ? parse(filename, commentsTransformer).then(root => root.toResult({
        to: filename,
        map: true
      }).css) : typeof opts.load === 'function' // otherwise, use the override loader
      ? opts.load.call(null, filename, importOptions) // otherwise, return the (conservatively cached) contents of the file
      : readFile(filename);
    },

    resolve(id, basedir, importOptions) {
      // get the css id by removing css extensions
      const cssId = id.replace(cssExtRegExp$1, '');
      return cssId in resolvedFilenamesById // return the known resolved path for the css id
      ? resolvedFilenamesById[cssId] : typeof opts.resolve === 'function' // otherwise, use the override resolver
      ? opts.resolve.call(null, id, basedir, importOptions) // otherwise, return the id to be resolved by postcss-import
      : id;
    }

  });
});
const cssExtRegExp$1 = /\.css\b/g;

const postcssPlugin = (commentsTransformer, opts) => root => {
  const promises = [];
  const insertedFilenames = {}; // use @import insertion point

  root.walkAtRules(importRegExp, atrule => {
    // get name as a fallback value for the library (e.g. @import-normalize is like @import "normalize.css")
    const name = atrule.name.match(importRegExp)[1]; // get url from "library", 'library', url("library"), url('library'), or the fallback value

    const url = (atrule.params.match(paramsRegExp) || []).slice(1).find(part => part) || name;

    if (url) {
      // get the css id by removing css extensions
      const cssId = url.replace(cssExtRegExp, '');

      if (cssId in resolvedFilenamesById) {
        // promise the library import is replaced with its contents
        promises.push(Promise.all(resolvedFilenamesById[cssId].filter( // ignore filenames that have already been inserted
        filename => insertedFilenames[filename] = opts.allowDuplicates || !(filename in insertedFilenames)).map( // parse the file (the file and css are conservatively cached)
        filename => parse(filename, commentsTransformer))).then(roots => {
          if (roots.length) {
            // combine all the library nodes returned by the parsed files
            const nodes = roots.reduce((all, root) => all.concat(root.nodes), []); // replace the import with all the library nodes

            atrule.replaceWith(...nodes);
          }
        }));
      }
    }
  });
  return Promise.all([].concat( // promise the library imports are replaced with their contents
  promises, // promise certain libraries are prepended
  Promise.all([].concat(opts.forceImport || []).reduce( // filter the id to be a known id or boolean true
  (all, id) => {
    if (id === true) {
      all.push(...resolvedFilenamesById.normalize);
    } else if (typeof id === 'string') {
      const cssId = id.replace(cssExtRegExp, '');

      if (cssId in resolvedFilenamesById) {
        all.push(...resolvedFilenamesById[cssId]);
      }
    }

    return all;
  }, []).filter( // ignore filenames that have already been inserted
  filename => insertedFilenames[filename] = opts.allowDuplicates || !(filename in insertedFilenames)).map( // parse the file (the file and css are conservatively cached)
  filename => parse(filename, commentsTransformer))).then(roots => {
    if (roots.length) {
      // combine all the library nodes returned by the parsed files
      const nodes = roots.reduce((all, root) => all.concat(root.nodes), []); // prepend the stylesheet with all the library nodes

      root.prepend(...nodes);
    }
  })));
};

const cssExtRegExp = /\.css\b/g;
const importRegExp = /^import(?:-(normalize|sanitize))?$/;
const paramsRegExp = /^\s*(?:url\((?:"(.+)"|'(.+)')\)|"(.+)"|'(.+)')[\W\w]*$/;

const plugin = opts => {
  opts = create(opts);
  const commentsTransformer = postcssBrowserComments__default['default'](opts).Once;
  const normalizeTransformer = postcssPlugin(commentsTransformer, opts);
  const postcssImportConfig = postcssImportNormalize(commentsTransformer);
  return {
    postcssPlugin: 'postcss-normalize',

    Once(root) {
      return normalizeTransformer(root);
    },

    postcssImport: postcssImportConfig
  };
};

plugin.postcss = true;

module.exports = plugin;
