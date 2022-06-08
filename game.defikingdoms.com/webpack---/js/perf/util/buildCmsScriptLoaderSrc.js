"use strict";
'use es6';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildCmsScriptLoaderSrc = void 0;

const buildCmsScriptLoaderSrc = ({
  portalId
}) => {
  return `/hs/scriptloader/${portalId}.js`;
};

exports.buildCmsScriptLoaderSrc = buildCmsScriptLoaderSrc;