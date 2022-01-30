"use strict";const e=require("postcss-selector-parser"),t=/:dir\([^)]*\)/;module.exports=function(r){const o=Object(r).dir,s=Boolean(Object(r).preserve),n=Boolean(Object(r).shadow);return{postcssPlugin:"postcss-dir-pseudo-class",Rule(r,{result:a}){let l,c=!1;if(t.test(r.selector)){try{l=e((t=>{t.nodes.forEach((t=>{t.walk((t=>{if("pseudo"!==t.type)return;if(":dir"!==t.value)return;const s=t.nodes.toString();if("rtl"!==s&&"ltr"!==s)return;const l=t.parent;l.nodes.filter((e=>"pseudo"===e.type&&":dir"===e.value)).length>1&&!c&&(c=!0,r.warn(a,`Hierarchical :dir pseudo class usage can't be transformed correctly to [dir] attributes. This will lead to incorrect selectors for "${r.selector}"`));const p=t.prev(),i=t.next(),u=p&&p.type&&"combinator"!==p.type,d=i&&i.type&&"combinator"!==i.type,v=i&&i.type&&("combinator"!==i.type||"combinator"===i.type&&" "===i.value);u||d||0===l.nodes.indexOf(t)&&v||1===l.nodes.length?t.remove():t.replaceWith(e.universal());const b=l.nodes[0],y=b&&"combinator"===b.type&&" "===b.value,f=b&&"tag"===b.type&&"html"===b.value,m=b&&"pseudo"===b.type&&":root"===b.value;!b||f||m||y||l.prepend(e.combinator({value:" "}));const h=o===s,g=e.attribute({attribute:"dir",operator:"=",quoteMark:'"',value:`"${s}"`}),w=e.pseudo({value:":host-context"});w.append(g);const x=e.pseudo({value:(f||m?"":"html")+":not"});x.append(e.attribute({attribute:"dir",operator:"=",quoteMark:'"',value:`"${"ltr"===s?"rtl":"ltr"}"`})),h?f?l.insertAfter(b,x):l.prepend(x):f?l.insertAfter(b,g):n&&!m?l.prepend(w):l.prepend(g)}))}))})).processSync(r.selector)}catch(e){return void r.warn(a,`Failed to parse selector : ${r.selector}`)}void 0!==l&&l!==r.selector&&(s?r.cloneBefore({selector:l}):r.selector=l)}}}},module.exports.postcss=!0;