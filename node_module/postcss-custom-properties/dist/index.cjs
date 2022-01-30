"use strict";var e=require("postcss-value-parser"),t=require("path"),r=require("postcss"),s=require("fs");function o(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}function n(e){if(e&&e.__esModule)return e;var t=Object.create(null);return e&&Object.keys(e).forEach((function(r){if("default"!==r){var s=Object.getOwnPropertyDescriptor(e,r);Object.defineProperty(t,r,s.get?s:{enumerable:!0,get:function(){return e[r]}})}})),t.default=e,Object.freeze(t)}var i=o(e),a=o(t);function c(e){const t=e.selector?e:e.parent;return/(!\s*)?postcss-custom-properties:\s*off\b/i.test(t.toString())}function u(e,t){const r=new Map,s=new Map,o=new Map;e.nodes.slice().forEach((e=>{const o=f(e)?r:m(e)?s:null;o&&(e.nodes.slice().forEach((e=>{if(e.variable&&!c(e)){const{prop:r}=e;o.set(r,i.default(e.value)),t.preserve||e.remove()}})),t.preserve||!w(e)||c(e)||e.remove())}));for(const[e,t]of r.entries())o.set(e,t);for(const[e,t]of s.entries())o.set(e,t);return o}const l=/^html$/i,p=/^:root$/i,f=e=>"rule"===e.type&&e.selector.split(",").some((e=>l.test(e)))&&Object(e.nodes).length,m=e=>"rule"===e.type&&e.selector.split(",").some((e=>p.test(e)))&&Object(e.nodes).length,w=e=>0===Object(e.nodes).length;function v(e){const t=new Map;if("customProperties"in e)for(const[r,s]of Object.entries(e.customProperties))t.set(r,i.default(s.toString()));if("custom-properties"in e)for(const[r,s]of Object.entries(e["custom-properties"]))t.set(r,i.default(s.toString()));return t}async function d(e){var t;return v(await(t=e,Promise.resolve().then((function(){return n(require(t))}))))}async function y(e){const t=(await Promise.all(e.map((async e=>{if(e instanceof Promise?e=await e:e instanceof Function&&(e=await e()),"string"==typeof e){const t=a.default.resolve(e);return{type:a.default.extname(t).slice(1).toLowerCase(),from:t}}if("customProperties"in e&&Object(e.customProperties)===e.customProperties)return e;if("custom-properties"in e&&Object(e["custom-properties"])===e["custom-properties"])return e;if("from"in e){const t=a.default.resolve(e.from);let r=e.type;return r||(r=a.default.extname(t).slice(1).toLowerCase()),{type:r,from:t}}return Object.keys(e).length,null})))).filter((e=>!!e)),o=await Promise.all(t.map((async e=>{if("type"in e&&"from"in e){if("css"===e.type||"pcss"===e.type)return await async function(e){const t=await s.promises.readFile(e);return u(r.parse(t,{from:e.toString()}),{preserve:!0})}(e.from);if("js"===e.type||"cjs"===e.type)return await d(e.from);if("mjs"===e.type)return await d(e.from);if("json"===e.type)return await async function(e){return v(await j(e))}(e.from);throw new Error("Invalid source type: "+e.type)}return v(e)}))),n=new Map;return o.forEach((e=>{for(const[t,r]of e.entries())n.set(t,r)})),n}const j=async e=>JSON.parse((await s.promises.readFile(e)).toString());function O(e,t){return e.nodes&&e.nodes.length&&e.nodes.slice().forEach((r=>{if(b(r)){const[s,...o]=r.nodes.filter((e=>"div"!==e.type)),{value:n}=s,i=e.nodes.indexOf(r);if(t.has(n)){const r=t.get(n).nodes;!function(e,t,r){const s=new Map(t);s.delete(r),O(e,s)}({nodes:r},t,n),i>-1&&e.nodes.splice(i,1,...r)}else o.length&&(i>-1&&e.nodes.splice(i,1,...o),O(e,t))}else O(r,t)})),e.toString()}const g=/^var$/i,b=e=>"function"===e.type&&g.test(e.value)&&Object(e.nodes).length>0;var h=(e,t,r)=>{if(x(e)&&!function(e){const t=e.prev();return Boolean(c(e)||t&&"comment"===t.type&&/(!\s*)?postcss-custom-properties:\s*ignore\s+next\b/i.test(t.text))}(e)){const s=e.value;let o=O(i.default(s),t);const n=new Set;for(;P.test(o)&&!n.has(o);){n.add(o);o=O(i.default(o),t)}if(o!==s)if(r.preserve){const t=e.cloneBefore({value:o});F(t)&&(t.raws.value.value=t.value.replace(S,"$1"),t.raws.value.raw=t.raws.value.value+t.raws.value.raw.replace(S,"$2"))}else e.value=o,F(e)&&(e.raws.value.value=e.value.replace(S,"$1"),e.raws.value.raw=e.raws.value.value+e.raws.value.raw.replace(S,"$2"))}};const $=/^--[A-z][\w-]*$/,P=/(^|[^\w-])var\([\W\w]+\)/,x=e=>!$.test(e.prop)&&P.test(e.value),F=e=>"value"in Object(Object(e.raws).value)&&"raw"in e.raws.value&&S.test(e.raws.value.raw),S=/^([\W\w]+)(\s*\/\*[\W\w]+?\*\/)$/;async function E(e,t,r){"css"===t&&await async function(e,t){const r=`:root {\n${Object.keys(t).reduce(((e,r)=>(e.push(`\t${r}: ${t[r]};`),e)),[]).join("\n")}\n}\n`;await s.promises.writeFile(e,r)}(e,r),"scss"===t&&await async function(e,t){const r=`${Object.keys(t).reduce(((e,r)=>{const s=r.replace("--","$");return e.push(`${s}: ${t[r]};`),e}),[]).join("\n")}\n`;await s.promises.writeFile(e,r)}(e,r),"js"===t&&await async function(e,t){const r=`module.exports = {\n\tcustomProperties: {\n${Object.keys(t).reduce(((e,r)=>(e.push(`\t\t'${k(r)}': '${k(t[r])}'`),e)),[]).join(",\n")}\n\t}\n};\n`;await s.promises.writeFile(e,r)}(e,r),"json"===t&&await async function(e,t){const r=`${JSON.stringify({"custom-properties":t},null,"  ")}\n`;await s.promises.writeFile(e,r)}(e,r),"mjs"===t&&await async function(e,t){const r=`export const customProperties = {\n${Object.keys(t).reduce(((e,r)=>(e.push(`\t'${k(r)}': '${k(t[r])}'`),e)),[]).join(",\n")}\n};\n`;await s.promises.writeFile(e,r)}(e,r)}function M(e){const t={};for(const[r,s]of e.entries())t[r]=s.toString();return t}const k=e=>e.replace(/\\([\s\S])|(')/g,"\\$1$2").replace(/\n/g,"\\n").replace(/\r/g,"\\r"),q=e=>{const t=!("preserve"in Object(e))||Boolean(e.preserve),r="overrideImportFromWithRoot"in Object(e)&&Boolean(e.overrideImportFromWithRoot);let s=[];Array.isArray(null==e?void 0:e.importFrom)?s=e.importFrom:null!=e&&e.importFrom&&(s=[e.importFrom]);let o=[];Array.isArray(null==e?void 0:e.exportTo)?o=e.exportTo:null!=e&&e.exportTo&&(o=[e.exportTo]);const n=y(s);let i=new Map;const c=0===s.length&&0===o.length;return{postcssPlugin:"postcss-custom-properties",prepare:()=>c?{Once:e=>{i=u(e,{preserve:t})},Declaration:e=>{h(e,i,{preserve:t})},OnceExit:()=>{i.clear()}}:{Once:async e=>{const s=(await n).entries(),c=u(e,{preserve:t}).entries();if(r)for(const[e,t]of[...s,...c])i.set(e,t);else for(const[e,t]of[...c,...s])i.set(e,t);await function(e,t){return Promise.all(t.map((async t=>{if(t instanceof Function)return void await t(M(e));if("string"==typeof t){const r=a.default.resolve(t),s=a.default.extname(r).slice(1).toLowerCase();return void await E(r,s,M(e))}let r={};if(r="toJSON"in t?t.toJSON(M(e)):M(e),"to"in t){const e=a.default.resolve(t.to);let s=t.type;return s||(s=a.default.extname(e).slice(1).toLowerCase()),void await E(e,s,r)}"customProperties"in t?t.customProperties=r:"custom-properties"in t&&(t["custom-properties"]=r)})))}(i,o)},Declaration:e=>{h(e,i,{preserve:t})},OnceExit:()=>{i.clear()}}}};q.postcss=!0,module.exports=q;