import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";

//#region ../../../node_modules/.pnpm/fast-xml-parser@5.11.0/node_modules/fast-xml-parser/src/util.js
const nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
const nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
const nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
const regexName = /* @__PURE__ */ new RegExp("^[:A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$");
function getAllMatches(string, regex) {
	const matches = [];
	let match = regex.exec(string);
	while (match) {
		const allmatches = [];
		allmatches.startIndex = regex.lastIndex - match[0].length;
		const len = match.length;
		for (let index = 0; index < len; index++) allmatches.push(match[index]);
		matches.push(allmatches);
		match = regex.exec(string);
	}
	return matches;
}
const isName = function(string) {
	const match = regexName.exec(string);
	return !(match === null || typeof match === "undefined");
};
function isExist(v) {
	return typeof v !== "undefined";
}
/**
* Dangerous property names that could lead to prototype pollution or security issues
*/
const DANGEROUS_PROPERTY_NAMES = [
	"hasOwnProperty",
	"toString",
	"valueOf",
	"__defineGetter__",
	"__defineSetter__",
	"__lookupGetter__",
	"__lookupSetter__"
];
const criticalProperties = [
	"__proto__",
	"constructor",
	"prototype"
];

//#endregion
//#region ../../../node_modules/.pnpm/fast-xml-parser@5.11.0/node_modules/fast-xml-parser/src/validator.js
const defaultOptions$1 = {
	allowBooleanAttributes: false,
	unpairedTags: []
};
function validate(xmlData, options) {
	options = Object.assign({}, defaultOptions$1, options);
	const tags = [];
	let tagFound = false;
	let reachedRoot = false;
	if (xmlData[0] === "﻿") xmlData = xmlData.substr(1);
	for (let i = 0; i < xmlData.length; i++) if (xmlData[i] === "<" && xmlData[i + 1] === "?") {
		i += 2;
		i = readPI(xmlData, i);
		if (i.err) return i;
	} else if (xmlData[i] === "<") {
		let tagStartPos = i;
		i++;
		if (xmlData[i] === "!") {
			i = readCommentAndCDATA(xmlData, i);
			continue;
		} else {
			let closingTag = false;
			if (xmlData[i] === "/") {
				closingTag = true;
				i++;
			}
			let tagName = "";
			for (; i < xmlData.length && xmlData[i] !== ">" && xmlData[i] !== " " && xmlData[i] !== "	" && xmlData[i] !== "\n" && xmlData[i] !== "\r"; i++) tagName += xmlData[i];
			tagName = tagName.trim();
			if (tagName[tagName.length - 1] === "/") {
				tagName = tagName.substring(0, tagName.length - 1);
				i--;
			}
			if (!validateTagName(tagName)) {
				let msg;
				if (tagName.trim().length === 0) msg = "Invalid space after '<'.";
				else msg = "Tag '" + tagName + "' is an invalid name.";
				return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i));
			}
			const result = readAttributeStr(xmlData, i);
			if (result === false) return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i));
			let attrStr = result.value;
			i = result.index;
			if (attrStr[attrStr.length - 1] === "/") {
				const attrStrStart = i - attrStr.length;
				attrStr = attrStr.substring(0, attrStr.length - 1);
				const isValid = validateAttributeString(attrStr, options);
				if (isValid === true) tagFound = true;
				else return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
			} else if (closingTag) {
				if (!result.tagClosed) return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
				else if (attrStr.trim().length > 0) return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
				else if (tags.length === 0) return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
				else {
					const otg = tags.pop();
					if (tagName !== otg.tagName) {
						let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
						return getErrorObject("InvalidTag", "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.", getLineNumberForPosition(xmlData, tagStartPos));
					}
					if (tags.length == 0) reachedRoot = true;
				}
			} else {
				const isValid = validateAttributeString(attrStr, options);
				if (isValid !== true) return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
				if (reachedRoot === true) return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i));
				else if (options.unpairedTags.indexOf(tagName) !== -1) {} else tags.push({
					tagName,
					tagStartPos
				});
				tagFound = true;
			}
			for (i++; i < xmlData.length; i++) if (xmlData[i] === "<") {
				if (xmlData[i + 1] === "!") {
					i++;
					i = readCommentAndCDATA(xmlData, i);
					continue;
				} else if (xmlData[i + 1] === "?") {
					i = readPI(xmlData, ++i);
					if (i.err) return i;
				} else break;
			} else if (xmlData[i] === "&") {
				const afterAmp = validateAmpersand(xmlData, i);
				if (afterAmp == -1) return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
				i = afterAmp;
			} else if (reachedRoot === true && !isWhiteSpace(xmlData[i])) return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i));
			if (xmlData[i] === "<") i--;
		}
	} else {
		if (isWhiteSpace(xmlData[i])) continue;
		return getErrorObject("InvalidChar", "char '" + xmlData[i] + "' is not expected.", getLineNumberForPosition(xmlData, i));
	}
	if (!tagFound) return getErrorObject("InvalidXml", "Start tag expected.", 1);
	else if (tags.length == 1) return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
	else if (tags.length > 0) return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t) => t.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", {
		line: 1,
		col: 1
	});
	return true;
}
function isWhiteSpace(char) {
	return char === " " || char === "	" || char === "\n" || char === "\r";
}
/**
* Read Processing insstructions and skip
* @param {*} xmlData
* @param {*} i
*/
function readPI(xmlData, i) {
	const start = i;
	for (; i < xmlData.length; i++) if (xmlData[i] == "?" || xmlData[i] == " ") {
		const tagname = xmlData.substr(start, i - start);
		if (i > 5 && tagname === "xml") return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i));
		else if (xmlData[i] == "?" && xmlData[i + 1] == ">") {
			i++;
			break;
		} else continue;
	}
	return i;
}
function readCommentAndCDATA(xmlData, i) {
	if (xmlData.length > i + 5 && xmlData[i + 1] === "-" && xmlData[i + 2] === "-") {
		for (i += 3; i < xmlData.length; i++) if (xmlData[i] === "-" && xmlData[i + 1] === "-" && xmlData[i + 2] === ">") {
			i += 2;
			break;
		}
	} else if (xmlData.length > i + 8 && xmlData[i + 1] === "D" && xmlData[i + 2] === "O" && xmlData[i + 3] === "C" && xmlData[i + 4] === "T" && xmlData[i + 5] === "Y" && xmlData[i + 6] === "P" && xmlData[i + 7] === "E") {
		let angleBracketsCount = 1;
		for (i += 8; i < xmlData.length; i++) if (xmlData[i] === "<") angleBracketsCount++;
		else if (xmlData[i] === ">") {
			angleBracketsCount--;
			if (angleBracketsCount === 0) break;
		}
	} else if (xmlData.length > i + 9 && xmlData[i + 1] === "[" && xmlData[i + 2] === "C" && xmlData[i + 3] === "D" && xmlData[i + 4] === "A" && xmlData[i + 5] === "T" && xmlData[i + 6] === "A" && xmlData[i + 7] === "[") {
		for (i += 8; i < xmlData.length; i++) if (xmlData[i] === "]" && xmlData[i + 1] === "]" && xmlData[i + 2] === ">") {
			i += 2;
			break;
		}
	}
	return i;
}
const doubleQuote = "\"";
const singleQuote = "'";
/**
* Keep reading xmlData until '<' is found outside the attribute value.
* @param {string} xmlData
* @param {number} i
*/
function readAttributeStr(xmlData, i) {
	let attrStr = "";
	let startChar = "";
	let tagClosed = false;
	for (; i < xmlData.length; i++) {
		if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
			if (startChar === "") startChar = xmlData[i];
			else if (startChar !== xmlData[i]) {} else startChar = "";
		} else if (xmlData[i] === ">") {
			if (startChar === "") {
				tagClosed = true;
				break;
			}
		}
		attrStr += xmlData[i];
	}
	if (startChar !== "") return false;
	return {
		value: attrStr,
		index: i,
		tagClosed
	};
}
/**
* Select all the attributes whether valid or invalid.
*/
const validAttrStrRegxp = /* @__PURE__ */ new RegExp("(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['\"])(([\\s\\S])*?)\\5)?", "g");
function validateAttributeString(attrStr, options) {
	const matches = getAllMatches(attrStr, validAttrStrRegxp);
	const attrNames = {};
	for (let i = 0; i < matches.length; i++) {
		if (matches[i][1].length === 0) return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' has no space in starting.", getPositionFromMatch(matches[i]));
		else if (matches[i][3] !== void 0 && matches[i][4] === void 0) return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' is without value.", getPositionFromMatch(matches[i]));
		else if (matches[i][3] === void 0 && !options.allowBooleanAttributes) return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i][2] + "' is not allowed.", getPositionFromMatch(matches[i]));
		const attrName = matches[i][2];
		if (!validateAttrName(attrName)) return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches[i]));
		if (!Object.prototype.hasOwnProperty.call(attrNames, attrName)) attrNames[attrName] = 1;
		else return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches[i]));
	}
	return true;
}
function validateNumberAmpersand(xmlData, i) {
	let re = /\d/;
	if (xmlData[i] === "x") {
		i++;
		re = /[\da-fA-F]/;
	}
	for (; i < xmlData.length; i++) {
		if (xmlData[i] === ";") return i;
		if (!xmlData[i].match(re)) break;
	}
	return -1;
}
function validateAmpersand(xmlData, i) {
	i++;
	if (xmlData[i] === ";") return -1;
	if (xmlData[i] === "#") {
		i++;
		return validateNumberAmpersand(xmlData, i);
	}
	let count = 0;
	for (; i < xmlData.length; i++, count++) {
		if (xmlData[i].match(/\w/) && count < 20) continue;
		if (xmlData[i] === ";") break;
		return -1;
	}
	return i;
}
function getErrorObject(code, message, lineNumber) {
	return { err: {
		code,
		msg: message,
		line: lineNumber.line || lineNumber,
		col: lineNumber.col
	} };
}
function validateAttrName(attrName) {
	return isName(attrName);
}
function validateTagName(tagname) {
	return isName(tagname);
}
function getLineNumberForPosition(xmlData, index) {
	const lines = xmlData.substring(0, index).split(/\r?\n/);
	return {
		line: lines.length,
		col: lines[lines.length - 1].length + 1
	};
}
function getPositionFromMatch(match) {
	return match.startIndex + match[1].length;
}

//#endregion
//#region ../../../node_modules/.pnpm/@nodable+entities@3.0.0/node_modules/@nodable/entities/src/entities.js
/**
* Currency Symbols
* @type {Record<string, string>}
*/
const CURRENCY = {
	cent: "¢",
	pound: "£",
	curren: "¤",
	yen: "¥",
	euro: "€",
	dollar: "$",
	fnof: "ƒ",
	inr: "₹",
	af: "؋",
	birr: "ብር",
	peso: "₱",
	rub: "₽",
	won: "₩",
	yuan: "¥",
	cedil: "¸"
};
const XML = {
	amp: "&",
	apos: "'",
	gt: ">",
	lt: "<",
	quot: "\""
};
const COMMON_HTML = {
	nbsp: "\xA0",
	copy: "©",
	reg: "®",
	trade: "™",
	mdash: "—",
	ndash: "–",
	hellip: "…",
	laquo: "«",
	raquo: "»",
	lsquo: "‘",
	rsquo: "’",
	ldquo: "“",
	rdquo: "”",
	bull: "•",
	para: "¶",
	sect: "§",
	deg: "°",
	frac12: "½",
	frac14: "¼",
	frac34: "¾"
};

//#endregion
//#region ../../../node_modules/.pnpm/@nodable+entities@3.0.0/node_modules/@nodable/entities/src/EntityDecoder.js
/**
* Action constants for `onExternalEntity` and `onInputEntity` hooks.
*
* Use these instead of raw strings to avoid typos:
*
* @example
* import EntityDecoder, { ENTITY_ACTION } from './EntityDecoder.js';
* const dec = new EntityDecoder({
*   onInputEntity: (name, value) => ENTITY_ACTION.BLOCK,
* });
*/
const ENTITY_ACTION = Object.freeze({
	/** Resolve and expand the entity normally. */
	ALLOW: "allow",
	/** Silently skip this entity — it will not be registered. */
	BLOCK: "block",
	/** Throw an error, aborting entity registration entirely. */
	THROW: "throw"
});
const SPECIAL_CHARS = /* @__PURE__ */ new Set("!?\\\\/[]$%{}^&*()<>|+");
/**
* Validate that an entity name contains no dangerous characters.
* @param {string} name
* @returns {string} the name, unchanged
* @throws {Error} on invalid characters
*/
function validateEntityName$1(name) {
	if (name[0] === "#") throw new Error(`[EntityReplacer] Invalid character '#' in entity name: "${name}"`);
	for (const ch of name) if (SPECIAL_CHARS.has(ch)) throw new Error(`[EntityReplacer] Invalid character '${ch}' in entity name: "${name}"`);
	return name;
}
/**
* Merge one or more entity maps into a flat name→string map.
* Accepts either:
*   - plain string values:             { amp: '&' }
*   - legacy {regex,val} / {regx,val}: { lt: { regex: /.../, val: '<' } }
*
* Values containing '&' are skipped (recursive expansion risk).
*
* @param {...object} maps
* @returns {Record<string, string>}
*/
function mergeEntityMaps(...maps) {
	const out = Object.create(null);
	for (const map of maps) {
		if (!map) continue;
		for (const key of Object.keys(map)) {
			const raw = map[key];
			if (typeof raw === "string") out[key] = raw;
			else if (raw && typeof raw === "object" && raw.val !== void 0) {
				const val = raw.val;
				if (typeof val === "string") out[key] = val;
			}
		}
	}
	return out;
}
const LIMIT_TIER_EXTERNAL = "external";
const LIMIT_TIER_BASE = "base";
const LIMIT_TIER_ALL = "all";
/**
* Resolve `applyLimitsTo` option into a normalised Set of tier strings.
* Accepted values: 'external' | 'base' | 'all' | string[]
* Default: 'external' (only untrusted injected entities are counted).
* @param {string|string[]|undefined} raw
* @returns {Set<string>}
*/
function parseLimitTiers(raw) {
	if (!raw || raw === LIMIT_TIER_EXTERNAL) return /* @__PURE__ */ new Set([LIMIT_TIER_EXTERNAL]);
	if (raw === LIMIT_TIER_ALL) return /* @__PURE__ */ new Set([LIMIT_TIER_ALL]);
	if (raw === LIMIT_TIER_BASE) return /* @__PURE__ */ new Set([LIMIT_TIER_BASE]);
	if (Array.isArray(raw)) return new Set(raw);
	return /* @__PURE__ */ new Set([LIMIT_TIER_EXTERNAL]);
}
const NCR_LEVEL = Object.freeze({
	allow: 0,
	leave: 1,
	remove: 2,
	throw: 3
});
const XML10_ALLOWED_C0 = /* @__PURE__ */ new Set([
	9,
	10,
	13
]);
/**
* Parse the `ncr` constructor option into flat, hot-path-friendly fields.
* @param {object|undefined} ncr
* @returns {{ xmlVersion: number, onLevel: number, nullLevel: number }}
*/
function parseNCRConfig(ncr) {
	if (!ncr) return {
		xmlVersion: 1,
		onLevel: NCR_LEVEL.allow,
		nullLevel: NCR_LEVEL.remove
	};
	const xmlVersion = ncr.xmlVersion === 1.1 ? 1.1 : 1;
	const onLevel = NCR_LEVEL[ncr.onNCR] ?? NCR_LEVEL.allow;
	const nullLevel = NCR_LEVEL[ncr.nullNCR] ?? NCR_LEVEL.remove;
	return {
		xmlVersion,
		onLevel,
		nullLevel: Math.max(nullLevel, NCR_LEVEL.remove)
	};
}
/**
* Single-pass, zero-regex entity replacer for XML/HTML content.
*
* Algorithm: scan the string once for '&', read to ';', resolve via map
* or direct codepoint conversion, build output chunks, join once at the end.
*
* Entity lookup priority (highest → lowest):
*   1. input / runtime  (DOCTYPE entities for current document)
*   2. persistent external (survive across documents)
*   3. base named map   (DEFAULT_XML_ENTITIES + user-supplied namedEntities)
*
* Both input and external resolve as the 'external' tier for limit purposes.
* Base map entities resolve as the 'base' tier.
*
* Numeric / hex references (&#NNN; / &#xHH;) are resolved directly via
* String.fromCodePoint() — no map needed. They count as 'base' tier.
*
* @example
* const replacer = new EntityReplacer({ namedEntities: COMMON_HTML });
* replacer.setExternalEntities({ brand: 'Acme' });
*
* const instance = replacer.reset();
* instance.addInputEntities({ version: '1.0' });
* instance.encode('&brand; v&version; &lt;'); // 'Acme v1.0 <'
*/
var EntityDecoder = class {
	/**
	* @param {object} [options]
	* @param {object|null}  [options.namedEntities]        — extra named entities merged into base map
	* @param {object}  [options.limit]                 — security limits
	* @param {number}       [options.limit.maxTotalExpansions=0]  — 0 = unlimited
	* @param {number}       [options.limit.maxExpandedLength=0]   — 0 = unlimited
	* @param {'external'|'base'|'all'|string[]} [options.limit.applyLimitsTo='external']
	*   Which entity tiers count against the security limits:
	*   - 'external' (default) — only input/runtime + persistent external entities
	*   - 'base'               — only DEFAULT_XML_ENTITIES + namedEntities
	*   - 'all'                — every entity regardless of tier
	*   - string[]             — explicit combination, e.g. ['external', 'base']
	* @param {((resolved: string, original: string) => string)|null} [options.postCheck=null]
	* @param {string[]} [options.remove=[]] — entity names (e.g. ['nbsp', '#13']) to delete (replace with empty string)
	* @param {string[]} [options.leave=[]]  — entity names to keep as literal (unchanged in output)
	* @param {object}   [options.ncr]       — Numeric Character Reference controls
	* @param {1.0|1.1}  [options.ncr.xmlVersion=1.0]
	*   XML version governing which codepoint ranges are restricted:
	*   - 1.0 — C0 controls U+0001–U+001F (except U+0009/000A/000D) are prohibited
	*   - 1.1 — C0 controls are allowed when written as NCRs; C1 (U+007F–U+009F) decoded as-is
	* @param {'allow'|'leave'|'remove'|'throw'} [options.ncr.onNCR='allow']
	*   Base action for numeric references. Severity order: allow < leave < remove < throw.
	*   For codepoint ranges that carry a minimum level (surrogates → remove, XML 1.0 C0 → remove),
	*   the effective action is max(onNCR, rangeMinimum).
	* @param {'remove'|'throw'} [options.ncr.nullNCR='remove']
	*   Action for U+0000 (null). 'allow' and 'leave' are clamped to 'remove' since null is never safe.
	* @param {((name: string, value: string) => 'allow'|'block'|'throw')|null} [options.onExternalEntity=null]
	*   Hook called when an external entity is registered via `setExternalEntities()` or
	*   `addExternalEntity()`. Return `ENTITY_ACTION.ALLOW` to accept the entity,
	*   `ENTITY_ACTION.BLOCK` to silently skip it, or `ENTITY_ACTION.THROW` to abort with an error.
	* @param {((name: string, value: string) => 'allow'|'block'|'throw')|null} [options.onInputEntity=null]
	*   Hook called when an input entity is registered via `addInputEntities()`. Return
	*   `ENTITY_ACTION.ALLOW` to accept, `ENTITY_ACTION.BLOCK` to silently skip, or
	*   `ENTITY_ACTION.THROW` to abort with an error.
	*/
	constructor(options = {}) {
		this._limit = options.limit || {};
		this._maxTotalExpansions = this._limit.maxTotalExpansions || 0;
		this._maxExpandedLength = this._limit.maxExpandedLength || 0;
		this._postCheck = typeof options.postCheck === "function" ? options.postCheck : (r) => r;
		this._limitTiers = parseLimitTiers(this._limit.applyLimitsTo ?? LIMIT_TIER_EXTERNAL);
		this._numericAllowed = options.numericAllowed ?? true;
		this._baseMap = mergeEntityMaps(XML, options.namedEntities || null);
		/** @type {Record<string, string>} */
		this._externalMap = Object.create(null);
		/** @type {Record<string, string>} */
		this._inputMap = Object.create(null);
		this._totalExpansions = 0;
		this._expandedLength = 0;
		/** @type {Set<string>} */
		this._removeSet = new Set(options.remove && Array.isArray(options.remove) ? options.remove : []);
		/** @type {Set<string>} */
		this._leaveSet = new Set(options.leave && Array.isArray(options.leave) ? options.leave : []);
		const ncrCfg = parseNCRConfig(options.ncr);
		this._ncrXmlVersion = ncrCfg.xmlVersion;
		this._ncrOnLevel = ncrCfg.onLevel;
		this._ncrNullLevel = ncrCfg.nullLevel;
		/** @type {((name: string, value: string) => 'allow'|'block'|'throw')|null} */
		this._onExternalEntity = typeof options.onExternalEntity === "function" ? options.onExternalEntity : null;
		/** @type {((name: string, value: string) => 'allow'|'block'|'throw')|null} */
		this._onInputEntity = typeof options.onInputEntity === "function" ? options.onInputEntity : null;
	}
	/**
	* Invoke a registration hook for a single entity name/value pair.
	* Returns true when the entity should be accepted, false when it should be
	* silently skipped (BLOCK), and throws when the hook returns THROW.
	*
	* @param {((name: string, value: string) => 'allow'|'block'|'throw')|null} hook
	* @param {string} name
	* @param {string} value
	* @param {string} context  — used in error messages ('external' | 'input')
	* @returns {boolean}  true = accept, false = skip
	*/
	_applyRegistrationHook(hook, name, value, context) {
		if (!hook) return true;
		const action = hook(name, value);
		if (action === ENTITY_ACTION.BLOCK) return false;
		if (action === ENTITY_ACTION.THROW) throw new Error(`[EntityDecoder] Registration of ${context} entity "&${name};" was rejected by hook`);
		return true;
	}
	/**
	* Replace the full set of persistent external entities.
	* All keys are validated — throws on invalid characters.
	* If `onExternalEntity` is set, it is called once per entry; entries that
	* return `ENTITY_ACTION.BLOCK` are silently omitted, `ENTITY_ACTION.THROW`
	* aborts the whole call.
	* @param {Record<string, string | { regex?: RegExp, val: string }>} map
	*/
	setExternalEntities(map) {
		if (map) for (const key of Object.keys(map)) validateEntityName$1(key);
		if (!this._onExternalEntity) {
			this._externalMap = mergeEntityMaps(map);
			return;
		}
		const flat = mergeEntityMaps(map);
		const filtered = Object.create(null);
		for (const [name, value] of Object.entries(flat)) if (this._applyRegistrationHook(this._onExternalEntity, name, value, "external")) filtered[name] = value;
		this._externalMap = filtered;
	}
	/**
	* Add a single persistent external entity.
	* If `onExternalEntity` is set it is called before the entity is stored;
	* `ENTITY_ACTION.BLOCK` silently skips storage, `ENTITY_ACTION.THROW` raises.
	* @param {string} key
	* @param {string} value
	*/
	addExternalEntity(key, value) {
		validateEntityName$1(key);
		if (typeof value === "string" && value.indexOf("&") === -1) {
			if (this._applyRegistrationHook(this._onExternalEntity, key, value, "external")) this._externalMap[key] = value;
		}
	}
	/**
	* Inject DOCTYPE entities for the current document.
	* Also resets per-document expansion counters.
	* If `onInputEntity` is set it is called once per entry; entries returning
	* `ENTITY_ACTION.BLOCK` are silently omitted, `ENTITY_ACTION.THROW` aborts.
	* @param {Record<string, string | { regx?: RegExp, regex?: RegExp, val: string }>} map
	*/
	addInputEntities(map) {
		this._totalExpansions = 0;
		this._expandedLength = 0;
		if (!this._onInputEntity) {
			this._inputMap = mergeEntityMaps(map);
			return;
		}
		const flat = mergeEntityMaps(map);
		const filtered = Object.create(null);
		for (const [name, value] of Object.entries(flat)) if (this._applyRegistrationHook(this._onInputEntity, name, value, "input")) filtered[name] = value;
		this._inputMap = filtered;
	}
	/**
	* Wipe input/runtime entities and reset counters.
	* Call this before processing each new document.
	* @returns {this}
	*/
	reset() {
		this._inputMap = Object.create(null);
		this._totalExpansions = 0;
		this._expandedLength = 0;
		return this;
	}
	/**
	* Update the XML version used for NCR classification.
	* Call this as soon as the document's `<?xml version="...">` declaration is parsed.
	* @param {1.0|1.1|number} version
	*/
	setXmlVersion(version) {
		this._ncrXmlVersion = version === 1.1 ? 1.1 : 1;
	}
	/**
	* Replace all entity references in `str` in a single pass.
	*
	* @param {string} str
	* @returns {string}
	*/
	decode(str) {
		if (typeof str !== "string" || str.length === 0) return str;
		if (str.indexOf("&") === -1) return str;
		const original = str;
		const chunks = [];
		const len = str.length;
		let last = 0;
		let i = 0;
		const limitExpansions = this._maxTotalExpansions > 0;
		const limitLength = this._maxExpandedLength > 0;
		const checkLimits = limitExpansions || limitLength;
		while (i < len) {
			if (str.charCodeAt(i) !== 38) {
				i++;
				continue;
			}
			let j = i + 1;
			while (j < len && str.charCodeAt(j) !== 59 && j - i <= 32) j++;
			if (j >= len || str.charCodeAt(j) !== 59) {
				i++;
				continue;
			}
			const token = str.slice(i + 1, j);
			if (token.length === 0) {
				i++;
				continue;
			}
			let replacement;
			let tier;
			if (this._removeSet.has(token)) {
				replacement = "";
				if (tier === void 0) tier = LIMIT_TIER_EXTERNAL;
			} else if (this._leaveSet.has(token)) {
				i++;
				continue;
			} else if (token.charCodeAt(0) === 35) {
				const ncrResult = this._resolveNCR(token);
				if (ncrResult === void 0) {
					i++;
					continue;
				}
				replacement = ncrResult;
				tier = LIMIT_TIER_BASE;
			} else {
				const resolved = this._resolveName(token);
				replacement = resolved?.value;
				tier = resolved?.tier;
			}
			if (replacement === void 0) {
				i++;
				continue;
			}
			if (i > last) chunks.push(str.slice(last, i));
			chunks.push(replacement);
			last = j + 1;
			i = last;
			if (checkLimits && this._tierCounts(tier)) {
				if (limitExpansions) {
					this._totalExpansions++;
					if (this._totalExpansions > this._maxTotalExpansions) throw new Error(`[EntityReplacer] Entity expansion count limit exceeded: ${this._totalExpansions} > ${this._maxTotalExpansions}`);
				}
				if (limitLength) {
					const delta = replacement.length - (token.length + 2);
					if (delta > 0) {
						this._expandedLength += delta;
						if (this._expandedLength > this._maxExpandedLength) throw new Error(`[EntityReplacer] Expanded content length limit exceeded: ${this._expandedLength} > ${this._maxExpandedLength}`);
					}
				}
			}
		}
		if (last < len) chunks.push(str.slice(last));
		const result = chunks.length === 0 ? str : chunks.join("");
		return this._postCheck(result, original);
	}
	/**
	* Returns true if a resolved entity of the given tier should count
	* against the expansion/length limits.
	* @param {string} tier  — LIMIT_TIER_EXTERNAL | LIMIT_TIER_BASE
	* @returns {boolean}
	*/
	_tierCounts(tier) {
		if (this._limitTiers.has(LIMIT_TIER_ALL)) return true;
		return this._limitTiers.has(tier);
	}
	/**
	* Resolve a named entity token (without & and ;).
	* Priority: inputMap > externalMap > baseMap
	* Returns the resolved value tagged with its limit tier.
	*
	* @param {string} name
	* @returns {{ value: string, tier: string }|undefined}
	*/
	_resolveName(name) {
		if (name in this._inputMap) return {
			value: this._inputMap[name],
			tier: LIMIT_TIER_EXTERNAL
		};
		if (name in this._externalMap) return {
			value: this._externalMap[name],
			tier: LIMIT_TIER_EXTERNAL
		};
		if (name in this._baseMap) return {
			value: this._baseMap[name],
			tier: LIMIT_TIER_BASE
		};
	}
	/**
	* Classify a codepoint and return the minimum action level that must be applied.
	* Returns -1 when no minimum is imposed (normal allow path).
	*
	* Ranges checked (in priority order):
	*   1. U+0000            — null, governed by nullNCR (always ≥ remove)
	*   2. U+D800–U+DFFF     — surrogates, always prohibited (min: remove)
	*   3. U+0001–U+001F \ {0x09,0x0A,0x0D}  — XML 1.0 restricted C0 (min: remove)
	*      (skipped in XML 1.1 — C0 controls are allowed when written as NCRs)
	*
	* @param {number} cp  — codepoint
	* @returns {number}   — minimum NCR_LEVEL value, or -1 for no restriction
	*/
	_classifyNCR(cp) {
		if (cp === 0) return this._ncrNullLevel;
		if (cp >= 55296 && cp <= 57343) return NCR_LEVEL.remove;
		if (this._ncrXmlVersion === 1) {
			if (cp >= 1 && cp <= 31 && !XML10_ALLOWED_C0.has(cp)) return NCR_LEVEL.remove;
		}
		return -1;
	}
	/**
	* Execute a resolved NCR action.
	*
	* @param {number} action   — NCR_LEVEL value
	* @param {string} token    — raw token (e.g. '#38') for error messages
	* @param {number} cp       — codepoint, used only for error messages
	* @returns {string|undefined}
	*   - decoded character string  → 'allow'
	*   - ''                        → 'remove'
	*   - undefined                 → 'leave' (caller must skip past '&' only)
	*   - throws Error              → 'throw'
	*/
	_applyNCRAction(action, token, cp) {
		switch (action) {
			case NCR_LEVEL.allow: return String.fromCodePoint(cp);
			case NCR_LEVEL.remove: return "";
			case NCR_LEVEL.leave: return;
			case NCR_LEVEL.throw: throw new Error(`[EntityDecoder] Prohibited numeric character reference &${token}; (U+${cp.toString(16).toUpperCase().padStart(4, "0")})`);
			default: return String.fromCodePoint(cp);
		}
	}
	/**
	* Full NCR resolution pipeline for a numeric token.
	*
	* Steps:
	*   1. Parse the codepoint (decimal or hex).
	*   2. Validate the raw codepoint range (NaN, <0, >0x10FFFF).
	*   3. If numericAllowed is false and no minimum restriction applies → leave as-is.
	*   4. Classify the codepoint to find the minimum required action level.
	*   5. Resolve effective action = max(onNCR, minimum).
	*   6. Apply and return.
	*
	* @param {string} token  — e.g. '#38', '#x26', '#X26'
	* @returns {string|undefined}
	*   - string (incl. '')  — replacement ('' = remove)
	*   - undefined          — leave original &token; as-is
	*/
	_resolveNCR(token) {
		const second = token.charCodeAt(1);
		let cp;
		if (second === 120 || second === 88) cp = parseInt(token.slice(2), 16);
		else cp = parseInt(token.slice(1), 10);
		if (Number.isNaN(cp) || cp < 0 || cp > 1114111) return void 0;
		const minimum = this._classifyNCR(cp);
		if (!this._numericAllowed && minimum < NCR_LEVEL.remove) return void 0;
		const effective = minimum === -1 ? this._ncrOnLevel : Math.max(this._ncrOnLevel, minimum);
		return this._applyNCRAction(effective, token, cp);
	}
};

//#endregion
//#region ../../../node_modules/.pnpm/fast-xml-parser@5.11.0/node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
const defaultOnDangerousProperty = (name) => {
	if (DANGEROUS_PROPERTY_NAMES.includes(name)) return "__" + name;
	return name;
};
const defaultOptions = {
	preserveOrder: false,
	attributeNamePrefix: "@_",
	attributesGroupName: false,
	textNodeName: "#text",
	ignoreAttributes: true,
	removeNSPrefix: false,
	allowBooleanAttributes: false,
	parseTagValue: true,
	parseAttributeValue: false,
	trimValues: true,
	cdataPropName: false,
	numberParseOptions: {
		hex: true,
		leadingZeros: true,
		eNotation: true,
		unicode: false
	},
	tagValueProcessor: function(tagName, val) {
		return val;
	},
	attributeValueProcessor: function(attrName, val) {
		return val;
	},
	stopNodes: [],
	alwaysCreateTextNode: false,
	isArray: () => false,
	commentPropName: false,
	unpairedTags: [],
	processEntities: true,
	htmlEntities: false,
	entityDecoder: null,
	ignoreDeclaration: false,
	ignorePiTags: false,
	transformTagName: false,
	transformAttributeName: false,
	updateTag: function(tagName, jPath, attrs) {
		return tagName;
	},
	captureMetaData: false,
	maxNestedTags: 100,
	strictReservedNames: true,
	jPath: true,
	onDangerousProperty: defaultOnDangerousProperty
};
/**
* Validates that a property name is safe to use
* @param {string} propertyName - The property name to validate
* @param {string} optionName - The option field name (for error message)
* @throws {Error} If property name is dangerous
*/
function validatePropertyName(propertyName, optionName) {
	if (typeof propertyName !== "string") return;
	const normalized = propertyName.toLowerCase();
	if (DANGEROUS_PROPERTY_NAMES.some((dangerous) => normalized === dangerous.toLowerCase())) throw new Error(`[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`);
	if (criticalProperties.some((dangerous) => normalized === dangerous.toLowerCase())) throw new Error(`[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`);
}
/**
* Normalizes processEntities option for backward compatibility
* @param {boolean|object} value 
* @returns {object} Always returns normalized object
*/
function normalizeProcessEntities(value, htmlEntities) {
	if (typeof value === "boolean") return {
		enabled: value,
		maxEntitySize: 1e4,
		maxExpansionDepth: 1e4,
		maxTotalExpansions: Infinity,
		maxExpandedLength: 1e5,
		maxEntityCount: 1e3,
		allowedTags: null,
		tagFilter: null,
		appliesTo: "all"
	};
	if (typeof value === "object" && value !== null) return {
		enabled: value.enabled !== false,
		maxEntitySize: Math.max(1, value.maxEntitySize ?? 1e4),
		maxExpansionDepth: Math.max(1, value.maxExpansionDepth ?? 1e4),
		maxTotalExpansions: Math.max(1, value.maxTotalExpansions ?? Infinity),
		maxExpandedLength: Math.max(1, value.maxExpandedLength ?? 1e5),
		maxEntityCount: Math.max(1, value.maxEntityCount ?? 1e3),
		allowedTags: value.allowedTags ?? null,
		tagFilter: value.tagFilter ?? null,
		appliesTo: value.appliesTo ?? "all"
	};
	return normalizeProcessEntities(true);
}
const buildOptions = function(options) {
	const built = Object.assign({}, defaultOptions, options);
	const propertyNameOptions = [
		{
			value: built.attributeNamePrefix,
			name: "attributeNamePrefix"
		},
		{
			value: built.attributesGroupName,
			name: "attributesGroupName"
		},
		{
			value: built.textNodeName,
			name: "textNodeName"
		},
		{
			value: built.cdataPropName,
			name: "cdataPropName"
		},
		{
			value: built.commentPropName,
			name: "commentPropName"
		}
	];
	for (const { value, name } of propertyNameOptions) if (value) validatePropertyName(value, name);
	if (built.onDangerousProperty === null) built.onDangerousProperty = defaultOnDangerousProperty;
	built.processEntities = normalizeProcessEntities(built.processEntities, built.htmlEntities);
	built.unpairedTagsSet = new Set(built.unpairedTags);
	if (built.stopNodes && Array.isArray(built.stopNodes)) built.stopNodes = built.stopNodes.map((node) => {
		if (typeof node === "string" && node.startsWith("*.")) return ".." + node.substring(2);
		return node;
	});
	return built;
};

//#endregion
//#region ../../../node_modules/.pnpm/fast-xml-parser@5.11.0/node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
let METADATA_SYMBOL$1;
if (typeof Symbol !== "function") METADATA_SYMBOL$1 = "@@xmlMetadata";
else METADATA_SYMBOL$1 = Symbol("XML Node Metadata");
var XmlNode = class {
	constructor(tagname) {
		this.tagname = tagname;
		this.child = [];
		this[":@"] = Object.create(null);
	}
	add(key, val) {
		if (key === "__proto__") key = "#__proto__";
		this.child.push({ [key]: val });
	}
	addChild(node, startIndex) {
		if (node.tagname === "__proto__") node.tagname = "#__proto__";
		if (node[":@"] && Object.keys(node[":@"]).length > 0) this.child.push({
			[node.tagname]: node.child,
			[":@"]: node[":@"]
		});
		else this.child.push({ [node.tagname]: node.child });
		this.addStartIndex(startIndex);
	}
	addStartIndex(startIndex) {
		if (startIndex !== void 0) this.child[this.child.length - 1][METADATA_SYMBOL$1] = { startIndex };
	}
	addEndIndex(endIndex) {
		const lastChild = this.child[this.child.length - 1];
		if (lastChild !== void 0 && lastChild[METADATA_SYMBOL$1] !== void 0 && lastChild[METADATA_SYMBOL$1].endIndex === void 0) lastChild[METADATA_SYMBOL$1].endIndex = endIndex;
	}
	/** symbol used for metadata */
	static getMetaDataSymbol() {
		return METADATA_SYMBOL$1;
	}
};

//#endregion
//#region ../../../node_modules/.pnpm/xml-naming@0.3.0/node_modules/xml-naming/src/index.js
/**
* xml-naming
* Validates XML Name productions as defined in the XML 1.0 and 1.1 specifications.
* Covers: Name, NCName, QName, NMToken, NMTokens
*
* XML 1.0 spec: https://www.w3.org/TR/xml/#NT-Name
* XML 1.1 spec: https://www.w3.org/TR/xml11/#NT-NameStartChar
* XML NS spec:  https://www.w3.org/TR/xml-names/#NT-NCName
*/
const nameStartChar10 = ":A-Za-z_À-ÖØ-öø-˿Ͱ-ͽͿ-҆҈-῿‌-‍⁰-↏Ⰰ-⿯、-퟿豈-﷏ﷰ-�";
const nameChar10 = nameStartChar10 + "\\-\\.\\d" + "·" + "̀-ͯ" + "‿-⁀";
const nameStartChar11 = ":A-Za-z_À-˿Ͱ-ͽͿ-҆҈-῿‌-‍⁰-↏Ⰰ-⿯、-퟿豈-﷏ﷰ-�𐀀-󯿿";
const nameChar11 = nameStartChar11 + "\\-\\.\\d" + "·" + "̀-ͯ" + "҇" + "‿-⁀";
const buildRegexes = (startChar, char, flags = "") => {
	const ncNamePat = `[${startChar.replace(":", "")}][${char.replace(":", "")}]*`;
	return {
		name: new RegExp(`^[${startChar}][${char}]*$`, flags),
		ncName: new RegExp(`^${ncNamePat}$`, flags),
		qName: new RegExp(`^${ncNamePat}(?::${ncNamePat})?$`, flags),
		nmToken: new RegExp(`^[${char}]+$`, flags),
		nmTokens: new RegExp(`^[${char}]+(?:\\s+[${char}]+)*$`, flags)
	};
};
const regexes10 = buildRegexes(nameStartChar10, nameChar10);
const regexes11 = buildRegexes(nameStartChar11, nameChar11, "u");
const regexesAscii = buildRegexes(":A-Za-z_", ":A-Za-z_\\-\\.\\d");
const getRegexes = (xmlVersion = "1.0", asciiOnly = false) => {
	if (asciiOnly) return regexesAscii;
	return xmlVersion === "1.1" ? regexes11 : regexes10;
};
/**
* Returns true if the string is a valid QName (Qualified Name).
* Allows exactly one colon as a prefix separator: prefix:localName.
* Used for: element and attribute names in namespace-aware XML/SVG.
*
* @param {{ xmlVersion?: '1.0'|'1.1', asciiOnly?: boolean }} [opts]
*   asciiOnly: skip unicode-aware matching, ASCII names only (default false).
*/
const qName = (str, { xmlVersion = "1.0", asciiOnly = false } = {}) => getRegexes(xmlVersion, asciiOnly).qName.test(str);

//#endregion
//#region ../../../node_modules/.pnpm/fast-xml-parser@5.11.0/node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
var DocTypeReader = class {
	constructor(options, xmlVersion) {
		this.suppressValidationErr = !options;
		this.options = options;
		this.xmlVersion = xmlVersion || 1;
	}
	setXmlVersion(xmlVersion = 1) {
		this.xmlVersion = xmlVersion;
	}
	readDocType(xmlData, i) {
		const entities = Object.create(null);
		let entityCount = 0;
		if (xmlData[i + 3] === "O" && xmlData[i + 4] === "C" && xmlData[i + 5] === "T" && xmlData[i + 6] === "Y" && xmlData[i + 7] === "P" && xmlData[i + 8] === "E") {
			i = i + 9;
			let angleBracketsCount = 1;
			let hasBody = false, comment = false;
			let quoteChar = null;
			let exp = "";
			for (; i < xmlData.length; i++) {
				if (quoteChar !== null) {
					if (xmlData[i] === quoteChar) quoteChar = null;
					exp += xmlData[i];
					continue;
				}
				if (!hasBody && !comment && (xmlData[i] === "\"" || xmlData[i] === "'")) {
					quoteChar = xmlData[i];
					exp += xmlData[i];
					continue;
				}
				if (xmlData[i] === "<" && !comment) {
					if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
						i += 7;
						let entityName, val;
						[entityName, val, i] = this.readEntityExp(xmlData, i + 1, this.suppressValidationErr);
						if (val.indexOf("&") === -1) {
							if (this.options.enabled !== false && this.options.maxEntityCount != null && entityCount >= this.options.maxEntityCount) throw new Error(`Entity count (${entityCount + 1}) exceeds maximum allowed (${this.options.maxEntityCount})`);
							entities[entityName] = val;
							entityCount++;
						}
					} else if (hasBody && hasSeq(xmlData, "!ELEMENT", i)) {
						i += 8;
						const { index } = this.readElementExp(xmlData, i + 1);
						i = index;
					} else if (hasBody && hasSeq(xmlData, "!ATTLIST", i)) i += 8;
					else if (hasBody && hasSeq(xmlData, "!NOTATION", i)) {
						i += 9;
						const { index } = this.readNotationExp(xmlData, i + 1, this.suppressValidationErr);
						i = index;
					} else if (hasSeq(xmlData, "!--", i)) comment = true;
					else throw new Error(`Invalid DOCTYPE`);
					angleBracketsCount++;
					exp = "";
				} else if (xmlData[i] === ">") {
					if (comment) {
						if (xmlData[i - 1] === "-" && xmlData[i - 2] === "-") {
							comment = false;
							angleBracketsCount--;
						}
					} else angleBracketsCount--;
					if (angleBracketsCount === 0) break;
				} else if (xmlData[i] === "[") hasBody = true;
				else exp += xmlData[i];
			}
			if (quoteChar !== null || angleBracketsCount !== 0) throw new Error(`Unclosed DOCTYPE`);
		} else throw new Error(`Invalid Tag instead of DOCTYPE`);
		return {
			entities,
			i
		};
	}
	readEntityExp(xmlData, i) {
		i = skipWhitespace(xmlData, i);
		const startIndex = i;
		while (i < xmlData.length && !/\s/.test(xmlData[i]) && xmlData[i] !== "\"" && xmlData[i] !== "'") i++;
		let entityName = xmlData.substring(startIndex, i);
		validateEntityName(entityName, { xmlVersion: this.xmlVersion });
		i = skipWhitespace(xmlData, i);
		if (!this.suppressValidationErr) {
			if (xmlData.substring(i, i + 6).toUpperCase() === "SYSTEM") throw new Error("External entities are not supported");
			else if (xmlData[i] === "%") throw new Error("Parameter entities are not supported");
		}
		let entityValue = "";
		[i, entityValue] = this.readIdentifierVal(xmlData, i, "entity");
		if (this.options.enabled !== false && this.options.maxEntitySize != null && entityValue.length > this.options.maxEntitySize) throw new Error(`Entity "${entityName}" size (${entityValue.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`);
		i--;
		return [
			entityName,
			entityValue,
			i
		];
	}
	readNotationExp(xmlData, i) {
		i = skipWhitespace(xmlData, i);
		const startIndex = i;
		while (i < xmlData.length && !/\s/.test(xmlData[i])) i++;
		let notationName = xmlData.substring(startIndex, i);
		!this.suppressValidationErr && validateEntityName(notationName, { xmlVersion: this.xmlVersion });
		i = skipWhitespace(xmlData, i);
		const identifierType = xmlData.substring(i, i + 6).toUpperCase();
		if (!this.suppressValidationErr && identifierType !== "SYSTEM" && identifierType !== "PUBLIC") throw new Error(`Expected SYSTEM or PUBLIC, found "${identifierType}"`);
		i += identifierType.length;
		i = skipWhitespace(xmlData, i);
		let publicIdentifier = null;
		let systemIdentifier = null;
		if (identifierType === "PUBLIC") {
			[i, publicIdentifier] = this.readIdentifierVal(xmlData, i, "publicIdentifier");
			i = skipWhitespace(xmlData, i);
			if (xmlData[i] === "\"" || xmlData[i] === "'") [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
		} else if (identifierType === "SYSTEM") {
			[i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
			if (!this.suppressValidationErr && !systemIdentifier) throw new Error("Missing mandatory system identifier for SYSTEM notation");
		}
		return {
			notationName,
			publicIdentifier,
			systemIdentifier,
			index: --i
		};
	}
	readIdentifierVal(xmlData, i, type) {
		let identifierVal = "";
		const startChar = xmlData[i];
		if (startChar !== "\"" && startChar !== "'") throw new Error(`Expected quoted string, found "${startChar}"`);
		i++;
		const startIndex = i;
		while (i < xmlData.length && xmlData[i] !== startChar) i++;
		identifierVal = xmlData.substring(startIndex, i);
		if (xmlData[i] !== startChar) throw new Error(`Unterminated ${type} value`);
		i++;
		return [i, identifierVal];
	}
	readElementExp(xmlData, i) {
		i = skipWhitespace(xmlData, i);
		const startIndex = i;
		while (i < xmlData.length && !/\s/.test(xmlData[i])) i++;
		let elementName = xmlData.substring(startIndex, i);
		if (!this.suppressValidationErr && !qName(elementName, { xmlVersion: this.xmlVersion })) throw new Error(`Invalid element name: "${elementName}"`);
		i = skipWhitespace(xmlData, i);
		let contentModel = "";
		if (xmlData[i] === "E" && hasSeq(xmlData, "MPTY", i)) i += 4;
		else if (xmlData[i] === "A" && hasSeq(xmlData, "NY", i)) i += 2;
		else if (xmlData[i] === "(") {
			i++;
			const startIndex = i;
			while (i < xmlData.length && xmlData[i] !== ")") i++;
			contentModel = xmlData.substring(startIndex, i);
			if (xmlData[i] !== ")") throw new Error("Unterminated content model");
		} else if (!this.suppressValidationErr) throw new Error(`Invalid Element Expression, found "${xmlData[i]}"`);
		return {
			elementName,
			contentModel: contentModel.trim(),
			index: i
		};
	}
	readAttlistExp(xmlData, i) {
		i = skipWhitespace(xmlData, i);
		let startIndex = i;
		while (i < xmlData.length && !/\s/.test(xmlData[i])) i++;
		let elementName = xmlData.substring(startIndex, i);
		validateEntityName(elementName, { xmlVersion: this.xmlVersion });
		i = skipWhitespace(xmlData, i);
		startIndex = i;
		while (i < xmlData.length && !/\s/.test(xmlData[i])) i++;
		let attributeName = xmlData.substring(startIndex, i);
		if (!validateEntityName(attributeName, { xmlVersion: this.xmlVersion })) throw new Error(`Invalid attribute name: "${attributeName}"`);
		i = skipWhitespace(xmlData, i);
		let attributeType = "";
		if (xmlData.substring(i, i + 8).toUpperCase() === "NOTATION") {
			attributeType = "NOTATION";
			i += 8;
			i = skipWhitespace(xmlData, i);
			if (xmlData[i] !== "(") throw new Error(`Expected '(', found "${xmlData[i]}"`);
			i++;
			let allowedNotations = [];
			while (i < xmlData.length && xmlData[i] !== ")") {
				const startIndex = i;
				while (i < xmlData.length && xmlData[i] !== "|" && xmlData[i] !== ")") i++;
				let notation = xmlData.substring(startIndex, i);
				notation = notation.trim();
				if (!validateEntityName(notation, { xmlVersion: this.xmlVersion })) throw new Error(`Invalid notation name: "${notation}"`);
				allowedNotations.push(notation);
				if (xmlData[i] === "|") {
					i++;
					i = skipWhitespace(xmlData, i);
				}
			}
			if (xmlData[i] !== ")") throw new Error("Unterminated list of notations");
			i++;
			attributeType += " (" + allowedNotations.join("|") + ")";
		} else {
			const startIndex = i;
			while (i < xmlData.length && !/\s/.test(xmlData[i])) i++;
			attributeType += xmlData.substring(startIndex, i);
			if (!this.suppressValidationErr && ![
				"CDATA",
				"ID",
				"IDREF",
				"IDREFS",
				"ENTITY",
				"ENTITIES",
				"NMTOKEN",
				"NMTOKENS"
			].includes(attributeType.toUpperCase())) throw new Error(`Invalid attribute type: "${attributeType}"`);
		}
		i = skipWhitespace(xmlData, i);
		let defaultValue = "";
		if (xmlData.substring(i, i + 8).toUpperCase() === "#REQUIRED") {
			defaultValue = "#REQUIRED";
			i += 8;
		} else if (xmlData.substring(i, i + 7).toUpperCase() === "#IMPLIED") {
			defaultValue = "#IMPLIED";
			i += 7;
		} else [i, defaultValue] = this.readIdentifierVal(xmlData, i, "ATTLIST");
		return {
			elementName,
			attributeName,
			attributeType,
			defaultValue,
			index: i
		};
	}
};
const skipWhitespace = (data, index) => {
	while (index < data.length && /\s/.test(data[index])) index++;
	return index;
};
function hasSeq(data, seq, i) {
	for (let j = 0; j < seq.length; j++) if (seq[j] !== data[i + j + 1]) return false;
	return true;
}
function validateEntityName(name, xmlVersion) {
	if (qName(name, { xmlVersion })) return name;
	else throw new Error(`Invalid entity name ${name}`);
}

//#endregion
//#region ../../../node_modules/.pnpm/anynum@1.0.1/node_modules/anynum/digitTable.js
/**
* Flat lookup table: maps Unicode code point → ASCII digit (0-9).
* Only decimal digit characters (Unicode category Nd) are included.
*
* Strategy: Int32Array of size (maxCodePoint - minCodePoint + 1).
* Value 0xFF means "not a digit". Value 0-9 is the ASCII digit value.
* This gives O(1) lookup with no branching, no bisect, no loop.
*
* Memory: range is 0x0660 to 0x1FBF0 → ~129,936 entries × 1 byte = ~127 KB.
* Acceptable for a one-time init; lookup is a single array index.
*/
const SCRIPT_ZEROS = [
	48,
	1632,
	1776,
	2406,
	2534,
	2662,
	2790,
	2918,
	3046,
	3174,
	3302,
	3430,
	3558,
	3664,
	3792,
	3872,
	4160,
	4240,
	6112,
	6160,
	6470,
	6608,
	6784,
	6800,
	6992,
	7088,
	7232,
	7248,
	65296,
	120782,
	120792,
	120802,
	120812,
	120822,
	66720,
	68912,
	69734,
	69872,
	69942,
	70096,
	70384,
	70736,
	70864,
	71248,
	71360,
	71472,
	71904,
	72016,
	72688,
	72784,
	73040,
	73120,
	73552,
	92768,
	92864,
	93008,
	123200,
	123632,
	124144,
	125264,
	130032
];
const NOT_DIGIT = 255;
const HIGH_MAP = /* @__PURE__ */ new Map();
const LOW_MAX = 65535;
const TABLE_OFFSET = 1632;
const TABLE = (/* @__PURE__ */ new Uint8Array(63904)).fill(255);
for (const zero of SCRIPT_ZEROS) for (let d = 0; d < 10; d++) {
	const cp = zero + d;
	if (cp <= LOW_MAX) TABLE[cp - TABLE_OFFSET] = d;
	else HIGH_MAP.set(cp, d);
}

//#endregion
//#region ../../../node_modules/.pnpm/anynum@1.0.1/node_modules/anynum/anynum.js
const CHAR_0 = 48;
const CHAR_9 = 57;
const CHAR_MINUS = 45;
const MINUS_SET = /* @__PURE__ */ new Set([
	8722,
	65293,
	65123
]);
/**
* Normalize all Unicode decimal digit characters in a string to ASCII (0-9),
* and normalize Unicode minus variants to ASCII '-' (U+002D).
*
* Non-digit, non-minus characters are passed through unchanged.
*
* Performance design:
* - Fast path: if the string has no convertible characters, return it unchanged
*   (zero allocation).
* - BMP digits (0x0660..0xFFFF excl. surrogates): flat Uint8Array lookup (O(1)).
* - Supplementary plane digits (> 0xFFFF, encoded as surrogate pairs): Map lookup.
* - Minus variants: checked inline with a small fixed Set.
*
* @param {string} str
* @returns {string}
*/
function anynum(str) {
	if (typeof str !== "string") return str;
	const len = str.length;
	if (len === 0) return str;
	let firstHit = -1;
	for (let i = 0; i < len; i++) {
		const cc = str.charCodeAt(i);
		if (cc >= CHAR_0 && cc <= CHAR_9 || cc === CHAR_MINUS) continue;
		if (cc < 1632) {
			if (MINUS_SET.has(cc)) {
				firstHit = i;
				break;
			}
			continue;
		}
		if (cc >= 55296 && cc <= 56319) {
			if (i + 1 < len) {
				const low = str.charCodeAt(i + 1);
				if (low >= 56320 && low <= 57343) {
					const cp = 65536 + (cc - 55296 << 10) + (low - 56320);
					if (HIGH_MAP.has(cp)) {
						firstHit = i;
						break;
					}
				}
			}
			continue;
		}
		if (TABLE[cc - 1632] !== 255 || MINUS_SET.has(cc)) {
			firstHit = i;
			break;
		}
	}
	if (firstHit === -1) return str;
	const chars = [];
	if (firstHit > 0) chars.push(str.slice(0, firstHit));
	for (let i = firstHit; i < len; i++) {
		const cc = str.charCodeAt(i);
		if (cc >= CHAR_0 && cc <= CHAR_9 || cc === CHAR_MINUS) {
			chars.push(str[i]);
			continue;
		}
		if (cc < 1632) {
			chars.push(MINUS_SET.has(cc) ? "-" : str[i]);
			continue;
		}
		if (cc >= 55296 && cc <= 56319) {
			if (i + 1 < len) {
				const low = str.charCodeAt(i + 1);
				if (low >= 56320 && low <= 57343) {
					const cp = 65536 + (cc - 55296 << 10) + (low - 56320);
					const d = HIGH_MAP.get(cp);
					if (d !== void 0) {
						chars.push(String.fromCharCode(d + 48));
						i++;
						continue;
					}
				}
			}
			chars.push(str[i]);
			continue;
		}
		if (MINUS_SET.has(cc)) {
			chars.push("-");
			continue;
		}
		const d = TABLE[cc - TABLE_OFFSET];
		chars.push(d !== 255 ? String.fromCharCode(d + 48) : str[i]);
	}
	return chars.join("");
}

//#endregion
//#region ../../../node_modules/.pnpm/strnum@2.4.2/node_modules/strnum/strnum.js
const hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
const binRegex = /^0b[01]+$/;
const octRegex = /^0o[0-7]+$/;
const numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
const consider = {
	hex: true,
	binary: false,
	octal: false,
	leadingZeros: true,
	decimalPoint: ".",
	eNotation: true,
	infinity: "original",
	unicode: false
};
function toNumber(str, options = {}) {
	options = Object.assign({}, consider, options);
	if (!str || typeof str !== "string") return str;
	let trimmedStr = str.trim();
	if (trimmedStr.length === 0) return str;
	else if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr)) return str;
	else if (trimmedStr === "0") return 0;
	if (options.unicode) {
		trimmedStr = anynum(trimmedStr);
		if (trimmedStr === "0") return 0;
	}
	if (options.hex && hexRegex.test(trimmedStr)) return parse_int(trimmedStr, 16);
	else if (options.binary && binRegex.test(trimmedStr)) return parse_int(trimmedStr, 2);
	else if (options.octal && octRegex.test(trimmedStr)) return parse_int(trimmedStr, 8);
	else if (!isFinite(trimmedStr)) return handleInfinity(str, Number(trimmedStr), options);
	else if (trimmedStr.includes("e") || trimmedStr.includes("E")) return resolveEnotation(str, trimmedStr, options);
	else {
		const match = numRegex.exec(trimmedStr);
		if (match) {
			const sign = match[1] || "";
			const leadingZeros = match[2];
			let numTrimmedByZeros = trimZeros(match[3]);
			const decimalAdjacentToLeadingZeros = sign ? str[leadingZeros.length + 1] === "." : str[leadingZeros.length] === ".";
			if (!options.leadingZeros && (leadingZeros.length > 1 || leadingZeros.length === 1 && !decimalAdjacentToLeadingZeros)) return str;
			else {
				const num = Number(trimmedStr);
				const parsedStr = String(num);
				if (num === 0) return num;
				if (parsedStr.search(/[eE]/) !== -1) {
					if (options.eNotation) return num;
					else return str;
				} else if (trimmedStr.indexOf(".") !== -1) {
					if (parsedStr === "0") return num;
					else if (parsedStr === numTrimmedByZeros) return num;
					else if (parsedStr === `${sign}${numTrimmedByZeros}`) return num;
					else return str;
				}
				let n = leadingZeros ? numTrimmedByZeros : trimmedStr;
				if (leadingZeros) return n === parsedStr || sign + n === parsedStr ? num : str;
				else return n === parsedStr || n === sign + parsedStr ? num : str;
			}
		} else return str;
	}
}
const eNotationRegx = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
function resolveEnotation(str, trimmedStr, options) {
	if (!options.eNotation) return str;
	const notation = trimmedStr.match(eNotationRegx);
	if (notation) {
		let sign = notation[1] || "";
		const eChar = notation[3].indexOf("e") === -1 ? "E" : "e";
		const leadingZeros = notation[2];
		const eAdjacentToLeadingZeros = sign ? str[leadingZeros.length + 1] === eChar : str[leadingZeros.length] === eChar;
		if (leadingZeros.length > 1 && eAdjacentToLeadingZeros) return str;
		else if (leadingZeros.length === 1 && (notation[3].startsWith(`.${eChar}`) || notation[3][0] === eChar)) return Number(trimmedStr);
		else if (leadingZeros.length > 0) {
			if (options.leadingZeros && !eAdjacentToLeadingZeros) {
				trimmedStr = (notation[1] || "") + notation[3];
				return Number(trimmedStr);
			} else return str;
		} else return Number(trimmedStr);
	} else return str;
}
/**
* 
* @param {string} numStr without leading zeros
* @returns 
*/
function trimZeros(numStr) {
	if (numStr && numStr.indexOf(".") !== -1) {
		let end = numStr.length;
		while (end > 0 && numStr.charCodeAt(end - 1) === 48) end--;
		numStr = numStr.slice(0, end);
		if (numStr === ".") numStr = "0";
		else if (numStr[0] === ".") numStr = "0" + numStr;
		else if (numStr[numStr.length - 1] === ".") numStr = numStr.substring(0, numStr.length - 1);
		return numStr;
	}
	return numStr;
}
function parse_int(numStr, base) {
	const str = numStr.trim();
	if (base === 2 || base === 8) numStr = str.substring(2);
	if (parseInt) return parseInt(numStr, base);
	else if (Number.parseInt) return Number.parseInt(numStr, base);
	else if (window && window.parseInt) return window.parseInt(numStr, base);
	else throw new Error("parseInt, Number.parseInt, window.parseInt are not supported");
}
/**
* Handle infinite values based on user option
* @param {string} str - original input string
* @param {number} num - parsed number (Infinity or -Infinity)
* @param {object} options - user options
* @returns {string|number|null} based on infinity option
*/
function handleInfinity(str, num, options) {
	const isPositive = num === Infinity;
	switch (options.infinity.toLowerCase()) {
		case "null": return null;
		case "infinity": return num;
		case "string": return isPositive ? "Infinity" : "-Infinity";
		default: return str;
	}
}

//#endregion
//#region ../../../node_modules/.pnpm/fast-xml-parser@5.11.0/node_modules/fast-xml-parser/src/ignoreAttributes.js
function getIgnoreAttributesFn(ignoreAttributes) {
	if (typeof ignoreAttributes === "function") return ignoreAttributes;
	if (Array.isArray(ignoreAttributes)) return (attrName) => {
		for (const pattern of ignoreAttributes) {
			if (typeof pattern === "string" && attrName === pattern) return true;
			if (pattern instanceof RegExp && pattern.test(attrName)) return true;
		}
	};
	return () => false;
}

//#endregion
//#region ../../../node_modules/.pnpm/path-expression-matcher@1.6.2/node_modules/path-expression-matcher/src/Expression.js
/**
* Expression - Parses and stores a tag pattern expression
* 
* Patterns are parsed once and stored in an optimized structure for fast matching.
* 
* @example
* const expr = new Expression("root.users.user");
* const expr2 = new Expression("..user[id]:first");
* const expr3 = new Expression("root/users/user", { separator: '/' });
*/
var Expression = class {
	/**
	* Create a new Expression
	* @param {string} pattern - Pattern string (e.g., "root.users.user", "..user[id]")
	* @param {Object} options - Configuration options
	* @param {string} options.separator - Path separator (default: '.')
	*/
	constructor(pattern, options = {}, data) {
		this.pattern = pattern;
		this.separator = options.separator || ".";
		this.segments = this._parse(pattern);
		this.data = data;
		this._hasDeepWildcard = this.segments.some((seg) => seg.type === "deep-wildcard");
		this._hasAttributeCondition = this.segments.some((seg) => seg.attrName !== void 0);
		this._hasPositionSelector = this.segments.some((seg) => seg.position !== void 0);
	}
	/**
	* Parse pattern string into segments
	* @private
	* @param {string} pattern - Pattern to parse
	* @returns {Array} Array of segment objects
	*/
	_parse(pattern) {
		const segments = [];
		let i = 0;
		let currentPart = "";
		while (i < pattern.length) if (pattern[i] === this.separator) {
			if (i + 1 < pattern.length && pattern[i + 1] === this.separator) {
				if (currentPart.trim()) {
					segments.push(this._parseSegment(currentPart.trim()));
					currentPart = "";
				}
				segments.push({ type: "deep-wildcard" });
				i += 2;
			} else {
				if (currentPart.trim()) segments.push(this._parseSegment(currentPart.trim()));
				currentPart = "";
				i++;
			}
		} else {
			currentPart += pattern[i];
			i++;
		}
		if (currentPart.trim()) segments.push(this._parseSegment(currentPart.trim()));
		return segments;
	}
	/**
	* Parse a single segment
	* @private
	* @param {string} part - Segment string (e.g., "user", "ns::user", "user[id]", "ns::user:first")
	* @returns {Object} Segment object
	*/
	_parseSegment(part) {
		const segment = { type: "tag" };
		let bracketContent = null;
		let withoutBrackets = part;
		const bracketMatch = part.match(/^([^\[]+)(\[[^\]]*\])(.*)$/);
		if (bracketMatch) {
			withoutBrackets = bracketMatch[1] + bracketMatch[3];
			if (bracketMatch[2]) {
				const content = bracketMatch[2].slice(1, -1);
				if (content) bracketContent = content;
			}
		}
		let namespace = void 0;
		let tagAndPosition = withoutBrackets;
		if (withoutBrackets.includes("::")) {
			const nsIndex = withoutBrackets.indexOf("::");
			namespace = withoutBrackets.substring(0, nsIndex).trim();
			tagAndPosition = withoutBrackets.substring(nsIndex + 2).trim();
			if (!namespace) throw new Error(`Invalid namespace in pattern: ${part}`);
		}
		let tag = void 0;
		let positionMatch = null;
		if (tagAndPosition.includes(":")) {
			const colonIndex = tagAndPosition.lastIndexOf(":");
			const tagPart = tagAndPosition.substring(0, colonIndex).trim();
			const posPart = tagAndPosition.substring(colonIndex + 1).trim();
			if ([
				"first",
				"last",
				"odd",
				"even"
			].includes(posPart) || /^nth\(\d+\)$/.test(posPart)) {
				tag = tagPart;
				positionMatch = posPart;
			} else tag = tagAndPosition;
		} else tag = tagAndPosition;
		if (!tag) throw new Error(`Invalid segment pattern: ${part}`);
		segment.tag = tag;
		if (namespace) segment.namespace = namespace;
		if (bracketContent) {
			if (bracketContent.includes("=")) {
				const eqIndex = bracketContent.indexOf("=");
				segment.attrName = bracketContent.substring(0, eqIndex).trim();
				segment.attrValue = bracketContent.substring(eqIndex + 1).trim();
			} else segment.attrName = bracketContent.trim();
		}
		if (positionMatch) {
			const nthMatch = positionMatch.match(/^nth\((\d+)\)$/);
			if (nthMatch) {
				segment.position = "nth";
				segment.positionValue = parseInt(nthMatch[1], 10);
			} else segment.position = positionMatch;
		}
		return segment;
	}
	/**
	* Get the number of segments
	* @returns {number}
	*/
	get length() {
		return this.segments.length;
	}
	/**
	* Check if expression contains deep wildcard
	* @returns {boolean}
	*/
	hasDeepWildcard() {
		return this._hasDeepWildcard;
	}
	/**
	* Check if expression has attribute conditions
	* @returns {boolean}
	*/
	hasAttributeCondition() {
		return this._hasAttributeCondition;
	}
	/**
	* Check if expression has position selectors
	* @returns {boolean}
	*/
	hasPositionSelector() {
		return this._hasPositionSelector;
	}
	/**
	* Get string representation
	* @returns {string}
	*/
	toString() {
		return this.pattern;
	}
};

//#endregion
//#region ../../../node_modules/.pnpm/path-expression-matcher@1.6.2/node_modules/path-expression-matcher/src/ExpressionSet.js
/**
* ExpressionSet - An indexed collection of Expressions for efficient bulk matching
*
* Instead of iterating all expressions on every tag, ExpressionSet pre-indexes
* them at insertion time by depth and terminal tag name. At match time, only
* the relevant bucket is evaluated — typically reducing checks from O(E) to O(1)
* lookup plus O(small bucket) matches.
*
* Three buckets are maintained:
*  - `_byDepthAndTag`  — exact depth + exact tag name  (tightest, used first)
*  - `_wildcardByDepth` — exact depth + wildcard tag `*` (depth-matched only)
*  - `_deepWildcards`  — expressions containing `..`  (cannot be depth-indexed)
*
* @example
* import { Expression, ExpressionSet } from 'fast-xml-tagger';
*
* // Build once at config time
* const stopNodes = new ExpressionSet();
* stopNodes.add(new Expression('root.users.user'));
* stopNodes.add(new Expression('root.config.setting'));
* stopNodes.add(new Expression('..script'));
*
* // Query on every tag — hot path
* if (stopNodes.matchesAny(matcher)) { ... }
*/
var ExpressionSet = class {
	constructor() {
		/** @type {Map<string, import('./Expression.js').default[]>} depth:tag → expressions */
		this._byDepthAndTag = /* @__PURE__ */ new Map();
		/** @type {Map<number, import('./Expression.js').default[]>} depth → wildcard-tag expressions */
		this._wildcardByDepth = /* @__PURE__ */ new Map();
		/** @type {import('./Expression.js').default[]} expressions containing deep wildcard (..) */
		this._deepWildcards = [];
		/** @type {Map<string, import('./Expression.js').default[]>} terminalTag → deep wildcard expressions */
		this._deepByTerminalTag = /* @__PURE__ */ new Map();
		/** @type {Set<string>} pattern strings already added — used for deduplication */
		this._patterns = /* @__PURE__ */ new Set();
		/** @type {boolean} whether the set is sealed against further additions */
		this._sealed = false;
	}
	/**
	* Add an Expression to the set.
	* Duplicate patterns (same pattern string) are silently ignored.
	*
	* @param {import('./Expression.js').default} expression - A pre-constructed Expression instance
	* @returns {this} for chaining
	* @throws {TypeError} if called after seal()
	*
	* @example
	* set.add(new Expression('root.users.user'));
	* set.add(new Expression('..script'));
	*/
	add(expression) {
		if (this._sealed) throw new TypeError("ExpressionSet is sealed. Create a new ExpressionSet to add more expressions.");
		if (this._patterns.has(expression.pattern)) return this;
		this._patterns.add(expression.pattern);
		if (expression.hasDeepWildcard()) {
			const lastSeg = expression.segments[expression.segments.length - 1];
			if (lastSeg && lastSeg.type !== "deep-wildcard" && lastSeg.tag !== "*") {
				const tag = lastSeg.tag;
				if (!this._deepByTerminalTag.has(tag)) this._deepByTerminalTag.set(tag, []);
				this._deepByTerminalTag.get(tag).push(expression);
			} else this._deepWildcards.push(expression);
			return this;
		}
		const depth = expression.length;
		const tag = expression.segments[expression.segments.length - 1]?.tag;
		if (!tag || tag === "*") {
			if (!this._wildcardByDepth.has(depth)) this._wildcardByDepth.set(depth, []);
			this._wildcardByDepth.get(depth).push(expression);
		} else {
			const key = `${depth}:${tag}`;
			if (!this._byDepthAndTag.has(key)) this._byDepthAndTag.set(key, []);
			this._byDepthAndTag.get(key).push(expression);
		}
		return this;
	}
	/**
	* Add multiple expressions at once.
	*
	* @param {import('./Expression.js').default[]} expressions - Array of Expression instances
	* @returns {this} for chaining
	*
	* @example
	* set.addAll([
	*   new Expression('root.users.user'),
	*   new Expression('root.config.setting'),
	* ]);
	*/
	addAll(expressions) {
		for (const expr of expressions) this.add(expr);
		return this;
	}
	/**
	* Check whether a pattern string is already present in the set.
	*
	* @param {import('./Expression.js').default} expression
	* @returns {boolean}
	*/
	has(expression) {
		return this._patterns.has(expression.pattern);
	}
	/**
	* Number of expressions in the set.
	* @type {number}
	*/
	get size() {
		return this._patterns.size;
	}
	/**
	* Seal the set against further modifications.
	* Useful to prevent accidental mutations after config is built.
	* Calling add() or addAll() on a sealed set throws a TypeError.
	*
	* @returns {this}
	*/
	seal() {
		this._sealed = true;
		return this;
	}
	/**
	* Whether the set has been sealed.
	* @type {boolean}
	*/
	get isSealed() {
		return this._sealed;
	}
	/**
	* Test whether the matcher's current path matches any expression in the set.
	*
	* Evaluation order (cheapest → most expensive):
	*  1. Exact depth + tag bucket  — O(1) lookup, typically 0–2 expressions
	*  2. Depth-only wildcard bucket — O(1) lookup, rare
	*  3. Deep-wildcard list         — always checked, but usually small
	*
	* @param {import('./Matcher.js').default} matcher - Matcher instance (or readOnly view)
	* @returns {boolean} true if any expression matches the current path
	*
	* @example
	* if (stopNodes.matchesAny(matcher)) {
	*   // handle stop node
	* }
	*/
	matchesAny(matcher) {
		return this.findMatch(matcher) !== null;
	}
	/**
	* Find and return the first Expression that matches the matcher's current path.
	*
	* Uses the same evaluation order as matchesAny (cheapest → most expensive):
	*  1. Exact depth + tag bucket
	*  2. Depth-only wildcard bucket
	*  3. Deep-wildcard list
	*
	* @param {import('./Matcher.js').default} matcher - Matcher instance (or readOnly view)
	* @returns {import('./Expression.js').default | null} the first matching Expression, or null
	*
	* @example
	* const expr = stopNodes.findMatch(matcher);
	* if (expr) {
	*   // access expr.config, expr.pattern, etc.
	* }
	*/
	findMatch(matcher) {
		const depth = matcher.getDepth();
		const tag = matcher.getCurrentTag();
		const exactKey = `${depth}:${tag}`;
		const exactBucket = this._byDepthAndTag.get(exactKey);
		if (exactBucket) {
			for (let i = 0; i < exactBucket.length; i++) if (matcher.matches(exactBucket[i])) return exactBucket[i];
		}
		const wildcardBucket = this._wildcardByDepth.get(depth);
		if (wildcardBucket) {
			for (let i = 0; i < wildcardBucket.length; i++) if (matcher.matches(wildcardBucket[i])) return wildcardBucket[i];
		}
		const deepBucket = this._deepByTerminalTag.get(tag);
		if (deepBucket) {
			for (let i = 0; i < deepBucket.length; i++) if (matcher.matches(deepBucket[i])) return deepBucket[i];
		}
		for (let i = 0; i < this._deepWildcards.length; i++) if (matcher.matches(this._deepWildcards[i])) return this._deepWildcards[i];
		return null;
	}
};

//#endregion
//#region ../../../node_modules/.pnpm/path-expression-matcher@1.6.2/node_modules/path-expression-matcher/src/Matcher.js
/**
* MatcherView - A lightweight read-only view over a Matcher's internal state.
*
* Created once by Matcher and reused across all callbacks. Holds a direct
* reference to the parent Matcher so it always reflects current parser state
* with zero copying or freezing overhead.
*
* Users receive this via {@link Matcher#readOnly} or directly from parser
* callbacks. It exposes all query and matching methods but has no mutation
* methods — misuse is caught at the TypeScript level rather than at runtime.
*
* @example
* const matcher = new Matcher();
* const view = matcher.readOnly();
*
* matcher.push("root", {});
* view.getCurrentTag(); // "root"
* view.getDepth();      // 1
*/
var MatcherView = class {
	/**
	* @param {Matcher} matcher - The parent Matcher instance to read from.
	*/
	constructor(matcher) {
		this._matcher = matcher;
	}
	/**
	* Get the path separator used by the parent matcher.
	* @returns {string}
	*/
	get separator() {
		return this._matcher.separator;
	}
	/**
	* Get current tag name.
	* @returns {string|undefined}
	*/
	getCurrentTag() {
		const path = this._matcher.path;
		return path.length > 0 ? path[path.length - 1].tag : void 0;
	}
	/**
	* Get current namespace.
	* @returns {string|undefined}
	*/
	getCurrentNamespace() {
		const path = this._matcher.path;
		return path.length > 0 ? path[path.length - 1].namespace : void 0;
	}
	/**
	* Get current node's attribute value.
	* @param {string} attrName
	* @returns {*}
	*/
	getAttrValue(attrName) {
		const path = this._matcher.path;
		if (path.length === 0) return void 0;
		return path[path.length - 1].values?.[attrName];
	}
	/**
	* Check if current node has an attribute.
	* @param {string} attrName
	* @returns {boolean}
	*/
	hasAttr(attrName) {
		const path = this._matcher.path;
		if (path.length === 0) return false;
		const current = path[path.length - 1];
		return current.values !== void 0 && attrName in current.values;
	}
	/**
	* Get the value of a "kept" attribute from the nearest ancestor (or
	* current node) that declared it via `push(tag, attrs, ns, { keep: [...] })`.
	* @param {string} attrName
	* @returns {*}
	*/
	getAnyParentAttr(attrName) {
		return this._matcher.getAnyParentAttr(attrName);
	}
	/**
	* Check whether any ancestor (or the current node) kept the given
	* attribute via `push(tag, attrs, ns, { keep: [...] })`.
	* @param {string} attrName
	* @returns {boolean}
	*/
	hasAnyParentAttr(attrName) {
		return this._matcher.hasAnyParentAttr(attrName);
	}
	/**
	* Get current node's sibling position (child index in parent).
	* @returns {number}
	*/
	getPosition() {
		const path = this._matcher.path;
		if (path.length === 0) return -1;
		return path[path.length - 1].position ?? 0;
	}
	/**
	* Get current node's repeat counter (occurrence count of this tag name).
	* @returns {number}
	*/
	getCounter() {
		const path = this._matcher.path;
		if (path.length === 0) return -1;
		return path[path.length - 1].counter ?? 0;
	}
	/**
	* Get current node's sibling index (alias for getPosition).
	* @returns {number}
	* @deprecated Use getPosition() or getCounter() instead
	*/
	getIndex() {
		return this.getPosition();
	}
	/**
	* Get current path depth.
	* @returns {number}
	*/
	getDepth() {
		return this._matcher.path.length;
	}
	/**
	* Get path as string.
	* @param {string} [separator] - Optional separator (uses default if not provided)
	* @param {boolean} [includeNamespace=true]
	* @returns {string}
	*/
	toString(separator, includeNamespace = true) {
		return this._matcher.toString(separator, includeNamespace);
	}
	/**
	* Get path as array of tag names.
	* @returns {string[]}
	*/
	toArray() {
		return this._matcher.path.map((n) => n.tag);
	}
	/**
	* Match current path against an Expression.
	* @param {Expression} expression
	* @returns {boolean}
	*/
	matches(expression) {
		return this._matcher.matches(expression);
	}
	/**
	* Match any expression in the given set against the current path.
	* @param {ExpressionSet} exprSet
	* @returns {boolean}
	*/
	matchesAny(exprSet) {
		return exprSet.matchesAny(this._matcher);
	}
};
/**
* Matcher - Tracks current path in XML/JSON tree and matches against Expressions.
*
* The matcher maintains a stack of nodes representing the current path from root to
* current tag. It only stores attribute values for the current (top) node to minimize
* memory usage. Sibling tracking is used to auto-calculate position and counter.
*
* Use {@link Matcher#readOnly} to obtain a {@link MatcherView} safe to pass to
* user callbacks — it always reflects current state with no Proxy overhead.
*
* @example
* const matcher = new Matcher();
* matcher.push("root", {});
* matcher.push("users", {});
* matcher.push("user", { id: "123", type: "admin" });
*
* const expr = new Expression("root.users.user");
* matcher.matches(expr); // true
*/
var Matcher = class {
	/**
	* Create a new Matcher.
	* @param {Object} [options={}]
	* @param {string} [options.separator='.'] - Default path separator
	*/
	constructor(options = {}) {
		this.separator = options.separator || ".";
		this.path = [];
		this.siblingStacks = [];
		this._pathStringCache = null;
		this._view = new MatcherView(this);
		this._keptAttrs = [];
	}
	/**
	* Push a new tag onto the path.
	* @param {string} tagName
	* @param {Object|null} [attrValues=null]
	* @param {string|null} [namespace=null]
	* @param {Object|null} [options=null]
	* @param {string[]} [options.keep] - Names of attributes (from attrValues)
	*/
	push(tagName, attrValues = null, namespace = null, options = null) {
		this._pathStringCache = null;
		if (this.path.length > 0) this.path[this.path.length - 1].values = void 0;
		const currentLevel = this.path.length;
		let level = this.siblingStacks[currentLevel];
		if (!level) {
			level = {
				counts: /* @__PURE__ */ new Map(),
				total: 0
			};
			this.siblingStacks[currentLevel] = level;
		}
		const siblingKey = namespace ? `${namespace}:${tagName}` : tagName;
		const counter = level.counts.get(siblingKey) || 0;
		const position = level.total;
		level.counts.set(siblingKey, counter + 1);
		level.total++;
		const node = {
			tag: tagName,
			position,
			counter
		};
		if (namespace !== null && namespace !== void 0) node.namespace = namespace;
		if (attrValues !== null && attrValues !== void 0) node.values = attrValues;
		this.path.push(node);
		const depth = this.path.length;
		const keep = options !== null ? options.keep : null;
		if (keep !== null && keep !== void 0 && keep.length > 0 && attrValues) for (let i = 0; i < keep.length; i++) {
			const name = keep[i];
			if (attrValues[name] !== void 0) this._keptAttrs.push({
				depth,
				name,
				value: attrValues[name]
			});
		}
	}
	/**
	* Pop the last tag from the path.
	* @returns {Object|undefined} The popped node
	*/
	pop() {
		if (this.path.length === 0) return void 0;
		this._pathStringCache = null;
		const node = this.path.pop();
		if (this.siblingStacks.length > this.path.length + 1) this.siblingStacks.length = this.path.length + 1;
		const poppedDepth = this.path.length + 1;
		while (this._keptAttrs.length > 0 && this._keptAttrs[this._keptAttrs.length - 1].depth >= poppedDepth) this._keptAttrs.pop();
		return node;
	}
	/**
	* Update current node's attribute values.
	* Useful when attributes are parsed after push.
	* @param {Object} attrValues
	*/
	updateCurrent(attrValues) {
		if (this.path.length > 0) {
			const current = this.path[this.path.length - 1];
			if (attrValues !== null && attrValues !== void 0) current.values = attrValues;
		}
	}
	/**
	* Get current tag name.
	* @returns {string|undefined}
	*/
	getCurrentTag() {
		return this.path.length > 0 ? this.path[this.path.length - 1].tag : void 0;
	}
	/**
	* Get current namespace.
	* @returns {string|undefined}
	*/
	getCurrentNamespace() {
		return this.path.length > 0 ? this.path[this.path.length - 1].namespace : void 0;
	}
	/**
	* Get current node's attribute value.
	* @param {string} attrName
	* @returns {*}
	*/
	getAttrValue(attrName) {
		if (this.path.length === 0) return void 0;
		return this.path[this.path.length - 1].values?.[attrName];
	}
	/**
	* Check if current node has an attribute.
	* @param {string} attrName
	* @returns {boolean}
	*/
	hasAttr(attrName) {
		if (this.path.length === 0) return false;
		const current = this.path[this.path.length - 1];
		return current.values !== void 0 && attrName in current.values;
	}
	/**
	* Get the value of a "kept" attribute from the nearest ancestor (or
	* current node) that declared it via `push(tag, attrs, ns, { keep: [...] })`.
	* Unlike getAttrValue(), this works regardless of how deep the path has
	* gone since the attribute was pushed — but only for attribute names that
	* were explicitly marked with `keep` at push time. Cost is proportional to
	* the number of currently-kept attributes (typically 0-3), not path depth.
	* @param {string} attrName
	* @returns {*} the value, or undefined if no ancestor kept this attribute
	*/
	getAnyParentAttr(attrName) {
		const kept = this._keptAttrs;
		for (let i = kept.length - 1; i >= 0; i--) if (kept[i].name === attrName) return kept[i].value;
	}
	/**
	* Check whether any ancestor (or the current node) kept the given
	* attribute via `push(tag, attrs, ns, { keep: [...] })`.
	* @param {string} attrName
	* @returns {boolean}
	*/
	hasAnyParentAttr(attrName) {
		const kept = this._keptAttrs;
		for (let i = kept.length - 1; i >= 0; i--) if (kept[i].name === attrName) return true;
		return false;
	}
	/**
	* Get current node's sibling position (child index in parent).
	* @returns {number}
	*/
	getPosition() {
		if (this.path.length === 0) return -1;
		return this.path[this.path.length - 1].position ?? 0;
	}
	/**
	* Get current node's repeat counter (occurrence count of this tag name).
	* @returns {number}
	*/
	getCounter() {
		if (this.path.length === 0) return -1;
		return this.path[this.path.length - 1].counter ?? 0;
	}
	/**
	* Get current node's sibling index (alias for getPosition).
	* @returns {number}
	* @deprecated Use getPosition() or getCounter() instead
	*/
	getIndex() {
		return this.getPosition();
	}
	/**
	* Get current path depth.
	* @returns {number}
	*/
	getDepth() {
		return this.path.length;
	}
	/**
	* Get path as string.
	* @param {string} [separator] - Optional separator (uses default if not provided)
	* @param {boolean} [includeNamespace=true]
	* @returns {string}
	*/
	toString(separator, includeNamespace = true) {
		const sep = separator || this.separator;
		if (sep === this.separator && includeNamespace === true) {
			if (this._pathStringCache !== null) return this._pathStringCache;
			const result = this.path.map((n) => n.namespace ? `${n.namespace}:${n.tag}` : n.tag).join(sep);
			this._pathStringCache = result;
			return result;
		}
		return this.path.map((n) => includeNamespace && n.namespace ? `${n.namespace}:${n.tag}` : n.tag).join(sep);
	}
	/**
	* Get path as array of tag names.
	* @returns {string[]}
	*/
	toArray() {
		return this.path.map((n) => n.tag);
	}
	/**
	* Reset the path to empty.
	*/
	reset() {
		this._pathStringCache = null;
		this.path = [];
		this.siblingStacks = [];
		this._keptAttrs = [];
	}
	/**
	* Match current path against an Expression.
	* @param {Expression} expression
	* @returns {boolean}
	*/
	matches(expression) {
		const segments = expression.segments;
		if (segments.length === 0) return false;
		if (expression.hasDeepWildcard()) return this._matchWithDeepWildcard(segments);
		return this._matchSimple(segments);
	}
	/**
	* @private
	*/
	_matchSimple(segments) {
		if (this.path.length !== segments.length) return false;
		for (let i = 0; i < segments.length; i++) if (!this._matchSegment(segments[i], this.path[i], i === this.path.length - 1)) return false;
		return true;
	}
	/**
	* @private
	*/
	_matchWithDeepWildcard(segments) {
		let pathIdx = this.path.length - 1;
		let segIdx = segments.length - 1;
		while (segIdx >= 0 && pathIdx >= 0) {
			const segment = segments[segIdx];
			if (segment.type === "deep-wildcard") {
				segIdx--;
				if (segIdx < 0) return true;
				const nextSeg = segments[segIdx];
				let found = false;
				for (let i = pathIdx; i >= 0; i--) if (this._matchSegment(nextSeg, this.path[i], i === this.path.length - 1)) {
					pathIdx = i - 1;
					segIdx--;
					found = true;
					break;
				}
				if (!found) return false;
			} else {
				if (!this._matchSegment(segment, this.path[pathIdx], pathIdx === this.path.length - 1)) return false;
				pathIdx--;
				segIdx--;
			}
		}
		return segIdx < 0;
	}
	/**
	* @private
	*/
	_matchSegment(segment, node, isCurrentNode) {
		if (segment.tag !== "*" && segment.tag !== node.tag) return false;
		if (segment.namespace !== void 0) {
			if (segment.namespace !== "*" && segment.namespace !== node.namespace) return false;
		}
		if (segment.attrName !== void 0) {
			if (!isCurrentNode) return false;
			if (!node.values || !(segment.attrName in node.values)) return false;
			if (segment.attrValue !== void 0) {
				if (String(node.values[segment.attrName]) !== String(segment.attrValue)) return false;
			}
		}
		if (segment.position !== void 0) {
			if (!isCurrentNode) return false;
			const counter = node.counter ?? 0;
			if (segment.position === "first" && counter !== 0) return false;
			else if (segment.position === "odd" && counter % 2 !== 1) return false;
			else if (segment.position === "even" && counter % 2 !== 0) return false;
			else if (segment.position === "nth" && counter !== segment.positionValue) return false;
		}
		return true;
	}
	/**
	* Match any expression in the given set against the current path.
	* @param {ExpressionSet} exprSet
	* @returns {boolean}
	*/
	matchesAny(exprSet) {
		return exprSet.matchesAny(this);
	}
	/**
	* Create a snapshot of current state.
	* @returns {Object}
	*/
	snapshot() {
		return {
			path: this.path.map((node) => ({ ...node })),
			siblingStacks: this.siblingStacks.map((level) => level ? {
				counts: new Map(level.counts),
				total: level.total
			} : level),
			keptAttrs: this._keptAttrs.map((entry) => ({ ...entry }))
		};
	}
	/**
	* Restore state from snapshot.
	* @param {Object} snapshot
	*/
	restore(snapshot) {
		this._pathStringCache = null;
		this.path = snapshot.path.map((node) => ({ ...node }));
		this.siblingStacks = snapshot.siblingStacks.map((level) => level ? {
			counts: new Map(level.counts),
			total: level.total
		} : level);
		this._keptAttrs = (snapshot.keptAttrs || []).map((entry) => ({ ...entry }));
	}
	/**
	* Return the read-only {@link MatcherView} for this matcher.
	*
	* The same instance is returned on every call — no allocation occurs.
	* It always reflects the current parser state and is safe to pass to
	* user callbacks without risk of accidental mutation.
	*
	* @returns {MatcherView}
	*
	* @example
	* const view = matcher.readOnly();
	* // pass view to callbacks — it stays in sync automatically
	* view.matches(expr);       // ✓
	* view.getCurrentTag();     // ✓
	* // view.push(...)         // ✗ method does not exist — caught by TypeScript
	*/
	readOnly() {
		return this._view;
	}
};

//#endregion
//#region ../../../node_modules/.pnpm/is-unsafe@2.0.2/node_modules/is-unsafe/src/contexts/html.js
/**
* HTML context patterns.
*
* Detects XSS vectors that are dangerous when a string ends up rendered as HTML.
* All patterns use bounded quantifiers to ensure linear-time matching (ReDoS-safe).
*
* Each entry is { pattern: RegExp, id: string, description: string }
* so callers can inspect which rule fired if they need to.
*/
const HTML_PATTERNS = [
	{
		id: "html-script-open",
		description: "<script opening tag",
		pattern: /<script[\s>/]/i
	},
	{
		id: "html-script-close",
		description: "<\/script closing tag",
		pattern: /<\/script[\s>]/i
	},
	{
		id: "html-javascript-protocol",
		description: "javascript: URI scheme (with optional whitespace/encoding)",
		pattern: /j[\t\n\r ]*a[\t\n\r ]*v[\t\n\r ]*a[\t\n\r ]*s[\t\n\r ]*c[\t\n\r ]*r[\t\n\r ]*i[\t\n\r ]*p[\t\n\r ]*t[\t\n\r ]*:/i
	},
	{
		id: "html-vbscript-protocol",
		description: "vbscript: URI scheme",
		pattern: /vbscript[\t\n\r ]*:/i
	},
	{
		id: "html-data-html",
		description: "data:text/html URI — can execute scripts in browsers",
		pattern: /data[\t\n\r ]*:[\t\n\r ]*text\/html/i
	},
	{
		id: "html-data-xhtml",
		description: "data:application/xhtml+xml URI",
		pattern: /data[\t\n\r ]*:[\t\n\r ]*application\/xhtml/i
	},
	{
		id: "html-data-svg",
		description: "data:image/svg+xml URI — can execute scripts",
		pattern: /data[\t\n\r ]*:[\t\n\r ]*image\/svg\+xml/i
	},
	{
		id: "html-inline-event-handler",
		description: "Inline event handler attributes: onclick=, onerror=, onload=, etc.",
		pattern: /\bon\w{1,30}\s*=/i
	},
	{
		id: "html-entity-obfuscated-script",
		description: "HTML-entity-encoded <script (e.g. &#x3C;script or &lt;script)",
		pattern: /(?:&#x0*3[Cc];?|&#0*60;?|&lt;)\s*script/i
	},
	{
		id: "html-entity-obfuscated-javascript",
		description: "HTML-entity-encoded javascript: (partial — catches common &#106; or &#x6a; for \"j\")",
		pattern: /(?:&#x0*6[Aa];?|&#0*106;?)\s*(?:&#x0*61;?|a)[\s\S]{0,80}script\s*:/i
	},
	{
		id: "html-style-expression",
		description: "CSS expression() — IE-era code execution in style attributes",
		pattern: /style[\s\S]{0,20}expression\s*\(/i
	},
	{
		id: "html-object-embed",
		description: "<object or <embed tags that can load active content",
		pattern: /<(?:object|embed)[\s>/]/i
	},
	{
		id: "html-base-tag",
		description: "<base href= — can hijack all relative URLs on a page",
		pattern: /<base[\s>]/i
	},
	{
		id: "html-meta-refresh",
		description: "<meta http-equiv=\"refresh\" — can redirect users",
		pattern: /<meta[\s\S]{0,40}http-equiv[\s\S]{0,20}refresh/i
	},
	{
		id: "html-srcdoc",
		description: "srcdoc= attribute on iframes — embeds HTML that can run scripts",
		pattern: /srcdoc\s*=/i
	},
	{
		id: "html-iframe",
		description: "<iframe tag",
		pattern: /<iframe[\s>/]/i
	},
	{
		id: "html-form",
		description: "<form tag — can be used for phishing / credential harvesting injection",
		pattern: /<form[\s>/]/i
	}
];

//#endregion
//#region ../../../node_modules/.pnpm/is-unsafe@2.0.2/node_modules/is-unsafe/src/contexts/xml.js
/**
* XML context patterns.
*
* Detects injection vectors that are specifically dangerous when a string
* is inserted into an XML document (not HTML rendering context).
*
* Key distinction from HTML: these patterns target parser-level attacks —
* things that can confuse or subvert an XML parser, trigger external entity
* resolution, or inject DTD content. HTML rendering concerns (XSS) belong
* in the HTML context.
*/
const XML_PATTERNS = [
	{
		id: "xml-cdata-injection",
		description: "CDATA section injection: <![CDATA[ breaks out of text node context",
		pattern: /<!\[CDATA\[/i
	},
	{
		id: "xml-cdata-close",
		description: "CDATA close sequence: ]]> can terminate an enclosing CDATA section",
		pattern: /\]\]>/
	},
	{
		id: "xml-processing-instruction",
		description: "XML processing instruction: <?xml-stylesheet or <?php etc.",
		pattern: /<\?(?:xml[\- ]|php|asp)/i
	},
	{
		id: "xml-doctype-injection",
		description: "DOCTYPE declaration embedded in content — can define entities",
		pattern: /<!DOCTYPE(?:[\s[]|$)/i
	},
	{
		id: "xml-entity-system",
		description: "SYSTEM keyword — used in external entity declarations (XXE)",
		pattern: /\bSYSTEM\s+["']/i
	},
	{
		id: "xml-entity-public",
		description: "PUBLIC keyword — used in external entity declarations (XXE)",
		pattern: /\bPUBLIC\s+["']/i
	},
	{
		id: "xml-entity-declaration",
		description: "<!ENTITY declaration — defines entities, potential XXE or entity expansion",
		pattern: /<!ENTITY[\s%]/i
	},
	{
		id: "xml-billion-laughs",
		description: "Entity reference chaining / billion laughs: repeated &eX; style references",
		pattern: /(?:&\w{1,20};){3,}/
	},
	{
		id: "xml-namespace-confusion",
		description: "xmlns: attribute injection — can redefine namespaces to confuse parsers",
		pattern: /\bxmlns(?::\w{1,40})?\s*=/i
	},
	{
		id: "xml-comment-injection",
		description: "<!-- comment injection — can hide content from some parsers",
		pattern: /<!--/
	},
	{
		id: "xml-comment-close",
		description: "--> closes an enclosing XML comment",
		pattern: /-->/
	},
	{
		id: "xml-pi-close",
		description: "?> closes an enclosing processing instruction",
		pattern: /\?>/
	}
];

//#endregion
//#region ../../../node_modules/.pnpm/is-unsafe@2.0.2/node_modules/is-unsafe/src/contexts/svg.js
/**
* SVG context patterns.
*
* SVG is XML-based but renders in browsers, giving it a unique attack surface
* that combines XML parser behaviour with browser rendering and JavaScript execution.
*
* Many of these vectors bypass HTML sanitizers that don't understand SVG semantics
* (DOMPurify has documented bypass vulnerabilities specifically in SVG/XML context).
*/
const SVG_PATTERNS = [
	{
		id: "svg-script-element",
		description: "<script element inside SVG executes JavaScript",
		pattern: /<script[\s>/]/i
	},
	{
		id: "svg-xlink-href-javascript",
		description: "xlink:href with javascript: — classic SVG XSS via <a> or <use>",
		pattern: /xlink\s*:\s*href\s*=\s*["']?\s*javascript\s*:/i
	},
	{
		id: "svg-href-javascript",
		description: "href= with javascript: in SVG context (<a>, <animate>, etc.)",
		pattern: /href\s*=\s*["']?\s*javascript\s*:/i
	},
	{
		id: "svg-foreignobject",
		description: "<foreignObject embeds HTML inside SVG — can execute scripts",
		pattern: /<foreignObject[\s>/]/i
	},
	{
		id: "svg-use-external",
		description: "<use xlink:href or href pointing to external resource (non-fragment URL)",
		pattern: /<use[\s\S]{0,60}(?:xlink\s*:\s*)?href\s*=\s*(?:["'][^#]|[^"'#\s>])/i
	},
	{
		id: "svg-animate-href",
		description: "<animate attributeName=\"href\" — can dynamically change href to javascript:",
		pattern: /<animate[\s\S]{0,80}attributeName\s*=\s*["'][\s]*href["']/i
	},
	{
		id: "svg-animate-xlinkhref",
		description: "<animate attributeName=\"xlink:href\"",
		pattern: /<animate[\s\S]{0,80}attributeName\s*=\s*["'][\s]*xlink\s*:\s*href["']/i
	},
	{
		id: "svg-set-javascript",
		description: "<set to=\"javascript:...\" — sets an attribute to a javascript: URI",
		pattern: /<set[\s\S]{0,80}to\s*=\s*["']?\s*javascript\s*:/i
	},
	{
		id: "svg-event-handler",
		description: "SVG-specific event handler attributes: onload=, onerror=, onactivate=, etc.",
		pattern: /\bon(?:load|error|activate|begin|end|repeat|focus|blur|click|mouse\w{1,20}|key\w{1,20})\s*=/i
	},
	{
		id: "svg-handler-generic",
		description: "Generic on* handler catch-all for SVG attributes",
		pattern: /\bon\w{1,30}\s*=/i
	},
	{
		id: "svg-filter-feimage",
		description: "<feImage href= — filter primitive that can load external resources",
		pattern: /<feImage[\s\S]{0,80}(?:xlink\s*:\s*)?href\s*=/i
	},
	{
		id: "svg-image-external",
		description: "<image xlink:href with http/https or javascript protocol",
		pattern: /<image[\s\S]{0,80}(?:xlink\s*:\s*)?href\s*=\s*["']?\s*(?:https?|javascript)\s*:/i
	},
	{
		id: "svg-style-javascript",
		description: "style= attribute containing javascript: (e.g. background:url(javascript:...))",
		pattern: /style\s*=[\s\S]{0,60}javascript\s*:/i
	}
];

//#endregion
//#region ../../../node_modules/.pnpm/is-unsafe@2.0.2/node_modules/is-unsafe/src/contexts/sql.js
/**
* SQL context patterns — high-precision rules only.
*
* These rules have very low false-positive risk and are safe to apply to
* general user text (names, descriptions, search queries, etc.).
* All patterns are ReDoS-safe — unlike the `sql-injection` npm package
* which has an active CVE on its own detection regexes.
*
* For exhaustive coverage including noisier heuristics (comment sequences,
* hex literals, stacked queries with semicolons), use 'SQL-STRICT' instead.
* Apply 'SQL-STRICT' only to strings that are specifically SQL fragments,
* not to general free-text fields.
*/
const SQL_PATTERNS = [
	{
		id: "sql-block-comment-open",
		description: "SQL block comment open: /* ... */ — unusual in legitimate user text",
		pattern: /\/\*/
	},
	{
		id: "sql-union-select",
		description: "UNION SELECT — most common SQL injection aggregation attack",
		pattern: /\bUNION\s{1,20}(?:ALL\s{1,20})?SELECT\b/i
	},
	{
		id: "sql-drop-table",
		description: "DROP TABLE — destructive DDL injection",
		pattern: /\bDROP\s{1,20}TABLE\b/i
	},
	{
		id: "sql-drop-database",
		description: "DROP DATABASE — destructive DDL injection",
		pattern: /\bDROP\s{1,20}DATABASE\b/i
	},
	{
		id: "sql-insert-into",
		description: "INSERT INTO — data injection",
		pattern: /\bINSERT\s{1,20}INTO\b/i
	},
	{
		id: "sql-delete-from",
		description: "DELETE FROM — data deletion injection",
		pattern: /\bDELETE\s{1,20}FROM\b/i
	},
	{
		id: "sql-update-set",
		description: "UPDATE ... SET — data modification injection",
		pattern: /\bUPDATE\b[\s\S]{1,60}\bSET\b/i
	},
	{
		id: "sql-exec-xp",
		description: "EXEC xp_ — MSSQL extended stored procedure execution",
		pattern: /\bEXEC(?:UTE)?\s{1,20}xp_/i
	},
	{
		id: "sql-tautology-string",
		description: "Classic string tautology: ' OR '1'='1 or \" OR \"1\"=\"1\"",
		pattern: /'\s{0,10}OR\s{0,10}'[^']{0,20}'\s*=\s*'[^']{0,20}/i
	},
	{
		id: "sql-tautology-numeric",
		description: "Numeric tautology: OR 1=1",
		pattern: /\bOR\s{1,10}1\s*=\s*1\b/i
	},
	{
		id: "sql-always-true-zero",
		description: "Numeric tautology: OR 0=0",
		pattern: /\bOR\s{1,10}0\s*=\s*0\b/i
	},
	{
		id: "sql-sleep-benchmark",
		description: "Time-based blind injection: SLEEP() or BENCHMARK()",
		pattern: /\b(?:SLEEP|BENCHMARK)\s*\(/i
	},
	{
		id: "sql-waitfor-delay",
		description: "MSSQL time-based blind injection: WAITFOR DELAY",
		pattern: /\bWAITFOR\s{1,20}DELAY\b/i
	},
	{
		id: "sql-char-function",
		description: "CHAR() function — used to obfuscate injected strings",
		pattern: /\bCHAR\s*\(\s*\d{1,3}/i
	},
	{
		id: "sql-information-schema",
		description: "INFORMATION_SCHEMA — reconnaissance query for table/column enumeration",
		pattern: /\bINFORMATION_SCHEMA\b/i
	}
];

//#endregion
//#region ../../../node_modules/.pnpm/is-unsafe@2.0.2/node_modules/is-unsafe/src/contexts/shell.js
/**
* SHELL context patterns.
*
* Detects shell injection vectors and path traversal patterns.
* Designed for use when a string will be passed to a shell command,
* used as a file path, or interpolated into OS-level operations.
*/
const SHELL_PATTERNS = [
	{
		id: "shell-path-traversal-unix",
		description: "Unix path traversal: ../  — climbing the directory tree",
		pattern: /\.\.\//
	},
	{
		id: "shell-path-traversal-windows",
		description: "Windows path traversal: ..\\ — climbing the directory tree",
		pattern: /\.\.\\/
	},
	{
		id: "shell-path-traversal-encoded",
		description: "URL-encoded path traversal: %2e%2e or %2f variants",
		pattern: /%2e%2e|%2f\.\.|\.\.%2f/i
	},
	{
		id: "shell-null-byte",
		description: "Null byte injection: \\x00 or %00 — truncates strings in C-backed functions",
		pattern: /\x00|%00/
	},
	{
		id: "shell-semicolon",
		description: "Semicolon command separator: cmd1; cmd2",
		pattern: /;/
	},
	{
		id: "shell-pipe",
		description: "Pipe operator: cmd1 | cmd2",
		pattern: /\|/
	},
	{
		id: "shell-and-operator",
		description: "AND operator: cmd1 && cmd2",
		pattern: /&&/
	},
	{
		id: "shell-or-operator",
		description: "OR operator: cmd1 || cmd2",
		pattern: /\|\|/
	},
	{
		id: "shell-backtick",
		description: "Backtick command substitution: `cmd`",
		pattern: /`/
	},
	{
		id: "shell-dollar-paren",
		description: "Dollar-paren command substitution: $(cmd)",
		pattern: /\$\(/
	},
	{
		id: "shell-dollar-brace",
		description: "Dollar-brace variable expansion: ${var} — can be abused for injection",
		pattern: /\$\{/
	},
	{
		id: "shell-redirect-out",
		description: "Output redirection: cmd > file or cmd >> file",
		pattern: />{1,2}/
	},
	{
		id: "shell-redirect-in",
		description: "Input redirection: cmd < file",
		pattern: /</
	},
	{
		id: "shell-newline-injection",
		description: "Newline injection: \\n or \\r — can inject new shell commands",
		pattern: /[\n\r]/
	},
	{
		id: "shell-glob-star",
		description: "Glob expansion: * or ? — can expand to unintended files",
		pattern: /[/\\][*?]/
	},
	{
		id: "shell-absolute-root",
		description: "Absolute root path injection: string starting with / or \\ (Windows UNC)",
		pattern: /^(?:\/|\\\\)/
	},
	{
		id: "shell-windows-drive",
		description: "Windows drive letter path injection: C:\\ or D:/",
		pattern: /^[a-zA-Z]:[/\\]/
	},
	{
		id: "shell-curl-wget",
		description: "curl/wget with URL or flags — can exfiltrate data or download payloads",
		pattern: /\b(?:curl|wget)\s+(?:https?:\/\/|ftp:\/\/|-)/i
	}
];

//#endregion
//#region ../../../node_modules/.pnpm/is-unsafe@2.0.2/node_modules/is-unsafe/src/contexts/redos.js
/**
* REDOS context patterns.
*
* Detects strings that, if used as regular expressions, could cause
* catastrophic backtracking (ReDoS — Regular Expression Denial of Service).
*
* These patterns detect the structural forms that lead to exponential or
* polynomial backtracking in NFA-based regex engines (V8, PCRE, Java, etc.).
*
* Use this context when user-supplied strings will be compiled into RegExp objects.
*/
const REDOS_PATTERNS = [
	{
		id: "redos-nested-quantifier-plus",
		description: "Nested + quantifier inside a group with outer quantifier: (a+)+, (.+b)*, etc.",
		pattern: /\([^)]*\+[^)]*\)[+*]/
	},
	{
		id: "redos-nested-quantifier-star",
		description: "Nested * quantifier: (a*)* or (a*)+ — catastrophic backtracking",
		pattern: /\([^)]*\*[^)]*\)[*+]/
	},
	{
		id: "redos-nested-groups",
		description: "Doubly nested quantified groups: ((a+)+) — guaranteed catastrophic",
		pattern: /\(\([^)]{0,40}\)[+*]\)[+*]/
	},
	{
		id: "redos-alternation-overlap",
		description: "Overlapping alternation under quantifier: (a|a)+ — ambiguous NFA paths",
		pattern: /\(([^|()]{1,20})\|(?:\1)(?:\|[^|()]{1,20}){0,5}\)[+*?]{1,2}/
	},
	{
		id: "redos-star-plus-concat",
		description: "(x*x)+ pattern — triggers super-linear backtracking",
		pattern: /\([^)]{0,10}\*[^)]{0,10}\)[+*]/
	},
	{
		id: "redos-dot-star-greedy",
		description: "(.*){n,} or (.+){n,} — repeated greedy dot quantifiers",
		pattern: /\(\.[*+]\)\{?\d/
	},
	{
		id: "redos-large-repetition",
		description: "Very large fixed or range repetition count {1000,} or {1000,n} — denial of service via backtracking",
		pattern: /\{\d{4,}(?:,\d*)?\}/
	},
	{
		id: "redos-catastrophic-alternation",
		description: "Long alternation with many similar branches — polynomial backtracking risk",
		pattern: /\([^)]{0,200}(?:\|[^|)]{0,50}){9,}\)/
	}
];

//#endregion
//#region ../../../node_modules/.pnpm/is-unsafe@2.0.2/node_modules/is-unsafe/src/contexts/nosql.js
const sep = "[\"'\\s]*:";
const NOSQL_PATTERNS = [
	{
		id: "nosql-where-operator",
		description: "$where — executes arbitrary JavaScript server-side in MongoDB",
		pattern: new RegExp(`\\$where${sep}`, "i")
	},
	{
		id: "nosql-ne-operator",
		description: "$ne — \"not equal\" operator used to bypass equality checks",
		pattern: new RegExp(`\\$ne${sep}`, "i")
	},
	{
		id: "nosql-gt-operator",
		description: "$gt — \"greater than\" used to bypass password/value checks",
		pattern: new RegExp(`\\$gte?${sep}`, "i")
	},
	{
		id: "nosql-lt-operator",
		description: "$lt / $lte — \"less than\" bypass variants",
		pattern: new RegExp(`\\$lte?${sep}`, "i")
	},
	{
		id: "nosql-regex-operator",
		description: "$regex — can be used to extract data character by character (blind injection)",
		pattern: new RegExp(`\\$regex${sep}`, "i")
	},
	{
		id: "nosql-or-operator",
		description: "$or — logical OR; used to create always-true conditions",
		pattern: new RegExp(`\\$or${sep}\\s*\\[`, "i")
	},
	{
		id: "nosql-and-operator",
		description: "$and — logical AND operator injection",
		pattern: new RegExp(`\\$and${sep}\\s*\\[`, "i")
	},
	{
		id: "nosql-nor-operator",
		description: "$nor — logical NOR operator injection",
		pattern: new RegExp(`\\$nor${sep}\\s*\\[`, "i")
	},
	{
		id: "nosql-exists-operator",
		description: "$exists — can enumerate fields to determine schema",
		pattern: new RegExp(`\\$exists${sep}`, "i")
	},
	{
		id: "nosql-in-operator",
		description: "$in — matches any value in a list; can enumerate values",
		pattern: new RegExp(`\\$in${sep}\\s*\\[`, "i")
	},
	{
		id: "nosql-expr-operator",
		description: "$expr — allows aggregation expressions in queries (MongoDB 3.6+)",
		pattern: new RegExp(`\\$expr${sep}`, "i")
	},
	{
		id: "nosql-function-operator",
		description: "$function — executes arbitrary JavaScript in MongoDB 4.4+",
		pattern: new RegExp(`\\$function${sep}`, "i")
	},
	{
		id: "nosql-accumulator-operator",
		description: "$accumulator — custom aggregation with arbitrary JS execution",
		pattern: new RegExp(`\\$accumulator${sep}`, "i")
	},
	{
		id: "nosql-proto-pollution",
		description: "__proto__ — prototype pollution via object key injection",
		pattern: /__proto__/
	},
	{
		id: "nosql-constructor-prototype",
		description: "constructor.prototype — alternative prototype pollution vector (dot notation or JSON key)",
		pattern: /constructor[\s"':.,{\[]*prototype/i
	},
	{
		id: "nosql-proto-bracket",
		description: "[\"__proto__\"] — bracket-notation prototype pollution",
		pattern: /\[["']__proto__["']\]/
	}
];

//#endregion
//#region ../../../node_modules/.pnpm/is-unsafe@2.0.2/node_modules/is-unsafe/src/contexts/log.js
/**
* LOG context patterns.
*
* Detects injection vectors that are dangerous when a string is written
* to a log file, passed to a logging framework, or interpolated into
* a log message that will be parsed or displayed.
*
* Attack categories:
*   1. CRLF injection — injects fake log lines by embedding newlines
*   2. Log4Shell (CVE-2021-44228) — ${jndi:...} triggers JNDI lookup in Log4j
*   3. SSTI in log templates — {{...}}, #{...} trigger template evaluation
*      if the log message is passed through a template engine
*   4. Null byte injection — truncates log entries in some implementations
*   5. ANSI escape injection — manipulates terminal output when logs are
*      tailed in a terminal (colour codes, cursor movement, etc.)
*
* Note: Newline characters (\n, \r) will produce false positives for
* multi-line legitimate values. Use this context only for single-line
* log field values (usernames, IDs, request parameters, etc.).
*/
const LOG_PATTERNS = [
	{
		id: "log-crlf-injection",
		description: "CRLF injection: literal \\r or \\n embeds fake log lines",
		pattern: /[\r\n]/
	},
	{
		id: "log-url-encoded-crlf",
		description: "URL-encoded CRLF: %0d, %0a, %0D, %0A — decoded by some log parsers",
		pattern: /%0[dDaA]/
	},
	{
		id: "log-unicode-newline",
		description: "Unicode newline variants: U+2028 (line separator), U+2029 (paragraph separator)",
		pattern: /[\u2028\u2029]/
	},
	{
		id: "log-log4shell-jndi",
		description: "Log4Shell: ${jndi:...} triggers remote code execution in Apache Log4j",
		pattern: /\$\{jndi\s*:/i
	},
	{
		id: "log-log4shell-obfuscated",
		description: "Obfuscated Log4Shell: ${::-j}... lookup-bypass prefix used to evade WAF detection",
		pattern: /\$\{::-/
	},
	{
		id: "log-log4j-lookup",
		description: "Log4j lookup syntax: ${env:...}, ${sys:...}, ${ctx:...} — data exfiltration",
		pattern: /\$\{(?:env|sys|ctx|main|map|sd|web|docker|k8s|spring)\s*:/i
	},
	{
		id: "log-ssti-double-brace",
		description: "SSTI double-brace: {{expression}} — Jinja2, Twig, Handlebars, etc.",
		pattern: /\{\{[\s\S]{0,80}\}\}/
	},
	{
		id: "log-ssti-hash-brace",
		description: "SSTI hash-brace: #{expression} — Thymeleaf, Velocity, Ruby ERB",
		pattern: /#\{[\s\S]{0,80}\}/
	},
	{
		id: "log-ssti-dollar-brace",
		description: "SSTI/EL injection: ${expression with operators or method calls} — JSP EL, Freemarker, SpEL",
		pattern: /\$\{[^}]*(?:\.|\(|\*|\+|\bclass\b|\bruntime\b|\bprocess\b|\bexec\b)[^}]{0,80}\}/i
	},
	{
		id: "log-ssti-percent-tag",
		description: "SSTI ERB/ASP tag: <%= expression %> — Ruby ERB, ASP",
		pattern: /<%=[\s\S]{0,80}%>/
	},
	{
		id: "log-null-byte",
		description: "Null byte: \\x00 or %00 — can truncate log entries in C-backed loggers",
		pattern: /\x00|%00/
	},
	{
		id: "log-ansi-escape",
		description: "ANSI escape sequence: ESC[ — can manipulate terminal output when logs are tailed",
		pattern: /\x1b\[/
	}
];

//#endregion
//#region ../../../node_modules/.pnpm/is-unsafe@2.0.2/node_modules/is-unsafe/src/contexts/sql-strict.js
/**
* SQL-STRICT context patterns.
*
* Extends the base 'SQL' context with three additional rules that are
* effective at detecting real injections but carry a higher false-positive
* risk on general free-text input.
*
* Use 'SQL-STRICT' when:
*   - The string is specifically a SQL fragment or database identifier
*   - You control the input domain (e.g. a dedicated SQL search field)
*   - You can tolerate occasional false positives in exchange for broader coverage
*
* Use 'SQL' (not STRICT) when:
*   - The field is general user text (names, descriptions, comments)
*   - False positives would block legitimate content (e.g. "see note -- above")
*
* Rules moved here from 'SQL' due to false-positive risk:
*
*   sql-line-comment   — "--" fires on "see note -- above", "value--", CSS var(--primary)
*   sql-stacked-query  — "; SELECT" fires on legitimate prose with semicolons + SQL words
*   sql-hex-encoding   — "0xDEAD" fires on hex values in technical docs and log output
*/
const SQL_STRICT_EXTRA = [
	{
		id: "sql-line-comment",
		description: "SQL line comment: -- followed by whitespace or end of string",
		pattern: /--(?:\s|$)/
	},
	{
		id: "sql-stacked-query",
		description: "Stacked queries: semicolon immediately followed by a SQL keyword",
		pattern: /;\s{0,10}(?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b/i
	},
	{
		id: "sql-hex-encoding",
		description: "Hex-encoded string injection: 0x41414141 style (MySQL)",
		pattern: /\b0x[0-9a-f]{4,}/i
	}
];
const SQL_STRICT_PATTERNS = [...SQL_PATTERNS, ...SQL_STRICT_EXTRA];

//#endregion
//#region ../../../node_modules/.pnpm/is-unsafe@2.0.2/node_modules/is-unsafe/src/index.js
HTML_PATTERNS.label = "HTML";
XML_PATTERNS.label = "XML";
SVG_PATTERNS.label = "SVG";
SQL_PATTERNS.label = "SQL";
SQL_STRICT_PATTERNS.label = "SQL-STRICT";
SHELL_PATTERNS.label = "SHELL";
REDOS_PATTERNS.label = "REDOS";
NOSQL_PATTERNS.label = "NOSQL";
LOG_PATTERNS.label = "LOG";
const VALID_CONTEXTS = Object.freeze({
	HTML: HTML_PATTERNS,
	XML: XML_PATTERNS,
	SVG: SVG_PATTERNS,
	SQL: SQL_PATTERNS,
	"SQL-STRICT": SQL_STRICT_PATTERNS,
	SHELL: SHELL_PATTERNS,
	REDOS: REDOS_PATTERNS,
	NOSQL: NOSQL_PATTERNS,
	LOG: LOG_PATTERNS
});
/**
* @typedef {{ id: string, description: string, pattern: RegExp }} Rule
*/
/**
* @typedef {Rule[]} PatternList
*/
/**
* @typedef {Object} MatchResult
* @property {string} context     - Label identifying which context matched ('HTML', 'CUSTOM', etc.)
* @property {string} id          - Rule identifier
* @property {string} description - Human-readable description of what was matched
* @property {RegExp} pattern     - The pattern that matched
*/
/**
* @param {unknown} value
*/
function assertString(value) {
	if (typeof value !== "string") throw new TypeError(`is-unsafe: first argument must be a string, got ${typeof value}`);
}
/**
* @param {unknown} context
*/
function assertContext(context) {
	if (context instanceof RegExp) return;
	if (Array.isArray(context)) {
		if (context.length === 0) throw new TypeError("is-unsafe: context must not be an empty array");
		if (Array.isArray(context[0])) {
			for (const list of context) if (!Array.isArray(list) || list.length === 0) throw new TypeError("is-unsafe: each context in the array must be a non-empty pattern array (PatternList)");
		}
		return;
	}
	throw new TypeError(`is-unsafe: second argument must be a PatternList (e.g. HTML), an array of PatternLists (e.g. [HTML, XML]), or a RegExp. Got: ${typeof context}`);
}
/**
* Normalise any valid context arg into an array of PatternLists.
*
* @param {Rule[]|Rule[][]|RegExp} context
* @returns {{ lists: Rule[][]|null, regex: RegExp|null }}
*/
function normalise(context) {
	if (context instanceof RegExp) return {
		lists: null,
		regex: context
	};
	if (Array.isArray(context[0])) return {
		lists: context,
		regex: null
	};
	return {
		lists: [context],
		regex: null
	};
}
/**
* Test value against a single PatternList. Returns the first MatchResult or null.
*
* @param {string} value
* @param {Rule[]} list
* @returns {MatchResult|null}
*/
function matchList(value, list) {
	const label = list.label ?? "CUSTOM";
	for (const rule of list) if (rule.pattern.test(value)) return {
		context: label,
		id: rule.id,
		description: rule.description,
		pattern: rule.pattern
	};
	return null;
}
/**
* Returns `true` if `value` is unsafe in the given context(s), `false` otherwise.
*
* @param {string} value - The string to test
* @param {PatternList | PatternList[] | RegExp} context
*   - A PatternList imported from is-unsafe (e.g. `HTML`, `XML`)
*   - An array of PatternLists — returns true if unsafe in **any** of them
*   - A custom RegExp — returns true if the pattern matches
* @returns {boolean}
*
* @example
* import { isUnsafe, HTML, SQL } from 'is-unsafe';
*
* isUnsafe('<script>alert(1)<\/script>', HTML)       // true
* isUnsafe('hello world', HTML)                     // false
* isUnsafe('value', [HTML, SQL])                    // false
* isUnsafe('value', /my-pattern/i)                  // false
*/
function isUnsafe(value, context) {
	assertString(value);
	assertContext(context);
	const { lists, regex } = normalise(context);
	if (regex) return regex.test(value);
	for (const list of lists) if (matchList(value, list) !== null) return true;
	return false;
}

//#endregion
//#region ../../../node_modules/.pnpm/fast-xml-parser@5.11.0/node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
/**
* Extract raw attributes (without prefix) from prefixed attribute map
* @param {object} prefixedAttrs - Attributes with prefix from buildAttributesMap
* @param {object} options - Parser options containing attributeNamePrefix
* @returns {object} Raw attributes for matcher
*/
function extractRawAttributes(prefixedAttrs, options) {
	if (!prefixedAttrs) return {};
	const attrs = options.attributesGroupName ? prefixedAttrs[options.attributesGroupName] : prefixedAttrs;
	if (!attrs) return {};
	const rawAttrs = {};
	for (const key in attrs) if (key.startsWith(options.attributeNamePrefix)) {
		const rawName = key.substring(options.attributeNamePrefix.length);
		rawAttrs[rawName] = attrs[key];
	} else rawAttrs[key] = attrs[key];
	return rawAttrs;
}
/**
* Extract namespace from raw tag name
* @param {string} rawTagName - Tag name possibly with namespace (e.g., "soap:Envelope")
* @returns {string|undefined} Namespace or undefined
*/
function extractNamespace(rawTagName) {
	if (!rawTagName || typeof rawTagName !== "string") return void 0;
	const colonIndex = rawTagName.indexOf(":");
	if (colonIndex !== -1 && colonIndex > 0) {
		const ns = rawTagName.substring(0, colonIndex);
		if (ns !== "xmlns") return ns;
	}
}
var OrderedObjParser = class {
	constructor(options, externalEntities) {
		this.options = options;
		this.currentNode = null;
		this.tagsNodeStack = [];
		this.parseXml = parseXml;
		this.parseTextData = parseTextData;
		this.resolveNameSpace = resolveNameSpace;
		this.buildAttributesMap = buildAttributesMap;
		this.isItStopNode = isItStopNode;
		this.replaceEntitiesValue = replaceEntitiesValue;
		this.readStopNodeData = readStopNodeData;
		this.saveTextToParentTag = saveTextToParentTag;
		this.addChild = addChild;
		this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
		this.entityExpansionCount = 0;
		this.currentExpandedLength = 0;
		this.doctypefound = false;
		let namedEntities = { ...XML };
		if (this.options.entityDecoder) this.entityDecoder = this.options.entityDecoder;
		else {
			if (typeof this.options.htmlEntities === "object") namedEntities = this.options.htmlEntities;
			else if (this.options.htmlEntities === true) namedEntities = {
				...COMMON_HTML,
				...CURRENCY
			};
			this.entityDecoder = new EntityDecoder({
				namedEntities: {
					...namedEntities,
					...externalEntities
				},
				numericAllowed: this.options.htmlEntities,
				limit: {
					maxTotalExpansions: this.options.processEntities.maxTotalExpansions,
					maxExpandedLength: this.options.processEntities.maxExpandedLength,
					applyLimitsTo: this.options.processEntities.appliesTo
				},
				onInputEntity: (name, value) => isUnsafe(value, [HTML_PATTERNS, XML_PATTERNS]) ? ENTITY_ACTION.BLOCK : ENTITY_ACTION.ALLOW
			});
		}
		this.matcher = new Matcher();
		this.readonlyMatcher = this.matcher.readOnly();
		this.isCurrentNodeStopNode = false;
		this.stopNodeExpressionsSet = new ExpressionSet();
		const stopNodesOpts = this.options.stopNodes;
		if (stopNodesOpts && stopNodesOpts.length > 0) {
			for (let i = 0; i < stopNodesOpts.length; i++) {
				const stopNodeExp = stopNodesOpts[i];
				if (typeof stopNodeExp === "string") this.stopNodeExpressionsSet.add(new Expression(stopNodeExp));
				else if (stopNodeExp instanceof Expression) this.stopNodeExpressionsSet.add(stopNodeExp);
			}
			this.stopNodeExpressionsSet.seal();
		}
	}
};
/**
* @param {string} val
* @param {string} tagName
* @param {string|Matcher} jPath - jPath string or Matcher instance based on options.jPath
* @param {boolean} dontTrim
* @param {boolean} hasAttributes
* @param {boolean} isLeafNode
* @param {boolean} escapeEntities
*/
function parseTextData(val, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
	const options = this.options;
	if (val !== void 0) {
		if (options.trimValues && !dontTrim) val = val.trim();
		if (val.length > 0) {
			if (!escapeEntities) val = this.replaceEntitiesValue(val, tagName, jPath);
			const jPathOrMatcher = options.jPath ? jPath.toString() : jPath;
			const newval = options.tagValueProcessor(tagName, val, jPathOrMatcher, hasAttributes, isLeafNode);
			if (newval === null || newval === void 0) return val;
			else if (typeof newval !== typeof val || newval !== val) return newval;
			else if (options.trimValues) return parseValue(val, options.parseTagValue, options.numberParseOptions);
			else if (val.trim() === val) return parseValue(val, options.parseTagValue, options.numberParseOptions);
			else return val;
		}
	}
}
function resolveNameSpace(tagname) {
	if (this.options.removeNSPrefix) {
		const tags = tagname.split(":");
		const prefix = tagname.charAt(0) === "/" ? "/" : "";
		if (tags[0] === "xmlns") return "";
		if (tags.length === 2) tagname = prefix + tags[1];
	}
	return tagname;
}
const attrsRegx = /* @__PURE__ */ new RegExp("([^\\s=]+)\\s*(=\\s*(['\"])([\\s\\S]*?)\\3)?", "gm");
function buildAttributesMap(attrStr, jPath, tagName, force = false) {
	const options = this.options;
	if (force === true || options.ignoreAttributes !== true && typeof attrStr === "string") {
		const matches = getAllMatches(attrStr, attrsRegx);
		const len = matches.length;
		const attrs = {};
		const processedVals = new Array(len);
		let hasRawAttrs = false;
		const rawAttrsForMatcher = {};
		for (let i = 0; i < len; i++) {
			const attrName = this.resolveNameSpace(matches[i][1]);
			const oldVal = matches[i][4];
			if (attrName.length && oldVal !== void 0) {
				let val = oldVal;
				if (options.trimValues) val = val.trim();
				val = this.replaceEntitiesValue(val, tagName, this.readonlyMatcher);
				processedVals[i] = val;
				rawAttrsForMatcher[attrName] = val;
				hasRawAttrs = true;
			}
		}
		if (hasRawAttrs && typeof jPath === "object" && jPath.updateCurrent) jPath.updateCurrent(rawAttrsForMatcher);
		const jPathStr = options.jPath ? jPath.toString() : this.readonlyMatcher;
		let hasAttrs = false;
		for (let i = 0; i < len; i++) {
			const attrName = this.resolveNameSpace(matches[i][1]);
			if (this.ignoreAttributesFn(attrName, jPathStr)) continue;
			let aName = options.attributeNamePrefix + attrName;
			if (attrName.length) {
				if (options.transformAttributeName) aName = options.transformAttributeName(aName);
				aName = sanitizeName(aName, options);
				if (matches[i][4] !== void 0) {
					const oldVal = processedVals[i];
					const newVal = options.attributeValueProcessor(attrName, oldVal, jPathStr);
					if (newVal === null || newVal === void 0) attrs[aName] = oldVal;
					else if (typeof newVal !== typeof oldVal || newVal !== oldVal) attrs[aName] = newVal;
					else attrs[aName] = parseValue(oldVal, options.parseAttributeValue, options.numberParseOptions);
					hasAttrs = true;
				} else if (options.allowBooleanAttributes) {
					attrs[aName] = true;
					hasAttrs = true;
				}
			}
		}
		if (!hasAttrs) return;
		if (options.attributesGroupName && !options.preserveOrder) {
			const attrCollection = {};
			attrCollection[options.attributesGroupName] = attrs;
			return attrCollection;
		}
		return attrs;
	}
}
const parseXml = function(xmlData) {
	xmlData = xmlData.replace(/\r\n?/g, "\n");
	const xmlObj = new XmlNode("!xml");
	let currentNode = xmlObj;
	let textData = "";
	this.matcher.reset();
	this.entityDecoder.reset();
	this.entityExpansionCount = 0;
	this.currentExpandedLength = 0;
	this.doctypefound = false;
	const options = this.options;
	const docTypeReader = new DocTypeReader(options.processEntities);
	const xmlLen = xmlData.length;
	for (let i = 0; i < xmlLen; i++) if (xmlData[i] === "<") {
		const c1 = xmlData.charCodeAt(i + 1);
		if (c1 === 47) {
			const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
			let tagName = xmlData.substring(i + 2, closeIndex).trim();
			if (options.removeNSPrefix) {
				const colonIndex = tagName.indexOf(":");
				if (colonIndex !== -1) tagName = tagName.substr(colonIndex + 1);
			}
			tagName = transformTagName(options.transformTagName, tagName, "", options).tagName;
			if (currentNode) textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
			const lastTagName = this.matcher.getCurrentTag();
			if (tagName && options.unpairedTagsSet.has(tagName)) throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
			if (lastTagName && options.unpairedTagsSet.has(lastTagName)) {
				this.matcher.pop();
				this.tagsNodeStack.pop();
			}
			this.matcher.pop();
			this.isCurrentNodeStopNode = false;
			currentNode = this.tagsNodeStack.pop() || xmlObj;
			if (options.captureMetaData && currentNode) currentNode.addEndIndex(closeIndex + 1);
			textData = "";
			i = closeIndex;
		} else if (c1 === 63) {
			let tagData = readTagExp(xmlData, i, false, "?>");
			if (!tagData) throw new Error("Pi Tag is not closed.");
			textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
			const attsMap = this.buildAttributesMap(tagData.tagExp, this.matcher, tagData.tagName, true);
			if (attsMap) {
				const ver = attsMap[this.options.attributeNamePrefix + "version"];
				this.entityDecoder.setXmlVersion(Number(ver) || 1);
				docTypeReader.setXmlVersion(Number(ver) || 1);
			}
			if (options.ignoreDeclaration && tagData.tagName === "?xml" || options.ignorePiTags) {} else {
				const childNode = new XmlNode(tagData.tagName);
				childNode.add(options.textNodeName, "");
				if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent && options.ignoreAttributes !== true) childNode[":@"] = attsMap;
				this.addChild(currentNode, childNode, this.readonlyMatcher, i);
				if (options.captureMetaData) currentNode.addEndIndex(tagData.closeIndex + 2);
			}
			i = tagData.closeIndex + 1;
		} else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 45 && xmlData.charCodeAt(i + 3) === 45) {
			const endIndex = findClosingIndex(xmlData, "-->", i + 4, "Comment is not closed.");
			if (options.commentPropName) {
				const comment = xmlData.substring(i + 4, endIndex - 2);
				textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
				currentNode.add(options.commentPropName, [{ [options.textNodeName]: comment }]);
			}
			i = endIndex;
		} else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 68) {
			if (this.doctypefound) throw new Error("Multiple DOCTYPE declarations found.");
			this.doctypefound = true;
			const result = docTypeReader.readDocType(xmlData, i);
			this.entityDecoder.addInputEntities(result.entities);
			i = result.i;
		} else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 91) {
			const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
			const tagExp = xmlData.substring(i + 9, closeIndex);
			textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
			let val = this.parseTextData(tagExp, currentNode.tagname, this.readonlyMatcher, true, false, true, true);
			if (val == void 0) val = "";
			if (options.cdataPropName) currentNode.add(options.cdataPropName, [{ [options.textNodeName]: tagExp }]);
			else currentNode.add(options.textNodeName, val);
			i = closeIndex + 2;
		} else {
			let result = readTagExp(xmlData, i, options.removeNSPrefix);
			if (!result) {
				const context = xmlData.substring(Math.max(0, i - 50), Math.min(xmlLen, i + 50));
				throw new Error(`readTagExp returned undefined at position ${i}. Context: "${context}"`);
			}
			let tagName = result.tagName;
			const rawTagName = result.rawTagName;
			let tagExp = result.tagExp;
			let attrExpPresent = result.attrExpPresent;
			let closeIndex = result.closeIndex;
			({tagName, tagExp} = transformTagName(options.transformTagName, tagName, tagExp, options));
			if (options.strictReservedNames && (tagName === options.commentPropName || tagName === options.cdataPropName || tagName === options.textNodeName || tagName === options.attributesGroupName)) throw new Error(`Invalid tag name: ${tagName}`);
			if (currentNode && textData) {
				if (currentNode.tagname !== "!xml") textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher, false);
			}
			const lastTag = currentNode;
			if (lastTag && options.unpairedTagsSet.has(lastTag.tagname)) {
				currentNode = this.tagsNodeStack.pop();
				this.matcher.pop();
			}
			let isSelfClosing = false;
			if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
				isSelfClosing = true;
				if (tagName[tagName.length - 1] === "/") {
					tagName = tagName.substr(0, tagName.length - 1);
					tagExp = tagName;
				} else tagExp = tagExp.substr(0, tagExp.length - 1);
				attrExpPresent = tagName !== tagExp;
			}
			let prefixedAttrs = null;
			let namespace = void 0;
			namespace = extractNamespace(rawTagName);
			if (tagName !== xmlObj.tagname) this.matcher.push(tagName, {}, namespace);
			if (tagName !== tagExp && attrExpPresent) {
				prefixedAttrs = this.buildAttributesMap(tagExp, this.matcher, tagName);
				if (prefixedAttrs) extractRawAttributes(prefixedAttrs, options);
			}
			if (tagName !== xmlObj.tagname) this.isCurrentNodeStopNode = this.isItStopNode();
			const startIndex = i;
			if (this.isCurrentNodeStopNode) {
				let tagContent = "";
				if (isSelfClosing) i = result.closeIndex;
				else if (options.unpairedTagsSet.has(tagName)) i = result.closeIndex;
				else {
					const result = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
					if (!result) throw new Error(`Unexpected end of ${rawTagName}`);
					i = result.i;
					tagContent = result.tagContent;
				}
				const childNode = new XmlNode(tagName);
				if (prefixedAttrs) childNode[":@"] = prefixedAttrs;
				childNode.add(options.textNodeName, tagContent);
				this.matcher.pop();
				this.isCurrentNodeStopNode = false;
				this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
				if (options.captureMetaData) currentNode.addEndIndex(i + 1);
			} else {
				if (isSelfClosing) {
					({tagName, tagExp} = transformTagName(options.transformTagName, tagName, tagExp, options));
					const childNode = new XmlNode(tagName);
					if (prefixedAttrs) childNode[":@"] = prefixedAttrs;
					this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
					if (options.captureMetaData) currentNode.addEndIndex(closeIndex + 1);
					this.matcher.pop();
					this.isCurrentNodeStopNode = false;
				} else if (options.unpairedTagsSet.has(tagName)) {
					const childNode = new XmlNode(tagName);
					if (prefixedAttrs) childNode[":@"] = prefixedAttrs;
					this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
					if (options.captureMetaData) currentNode.addEndIndex(result.closeIndex + 1);
					this.matcher.pop();
					this.isCurrentNodeStopNode = false;
					i = result.closeIndex;
					continue;
				} else {
					const childNode = new XmlNode(tagName);
					if (this.tagsNodeStack.length > options.maxNestedTags) throw new Error("Maximum nested tags exceeded");
					this.tagsNodeStack.push(currentNode);
					if (prefixedAttrs) childNode[":@"] = prefixedAttrs;
					this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
					currentNode = childNode;
				}
				textData = "";
				i = closeIndex;
			}
		}
	} else textData += xmlData[i];
	return xmlObj.child;
};
function addChild(currentNode, childNode, matcher, startIndex) {
	if (!this.options.captureMetaData) startIndex = void 0;
	const jPathOrMatcher = this.options.jPath ? matcher.toString() : matcher;
	const result = this.options.updateTag(childNode.tagname, jPathOrMatcher, childNode[":@"]);
	if (result === false) {} else if (typeof result === "string") {
		childNode.tagname = result;
		currentNode.addChild(childNode, startIndex);
	} else currentNode.addChild(childNode, startIndex);
}
/**
* @param {object} val - Entity object with regex and val properties
* @param {string} tagName - Tag name
* @param {string|Matcher} jPath - jPath string or Matcher instance based on options.jPath
*/
function replaceEntitiesValue(val, tagName, jPath) {
	const entityConfig = this.options.processEntities;
	if (!entityConfig || !entityConfig.enabled) return val;
	if (entityConfig.allowedTags) {
		const jPathOrMatcher = this.options.jPath ? jPath.toString() : jPath;
		if (!(Array.isArray(entityConfig.allowedTags) ? entityConfig.allowedTags.includes(tagName) : entityConfig.allowedTags(tagName, jPathOrMatcher))) return val;
	}
	if (entityConfig.tagFilter) {
		const jPathOrMatcher = this.options.jPath ? jPath.toString() : jPath;
		if (!entityConfig.tagFilter(tagName, jPathOrMatcher)) return val;
	}
	return this.entityDecoder.decode(val);
}
function saveTextToParentTag(textData, parentNode, matcher, isLeafNode) {
	if (textData) {
		if (isLeafNode === void 0) isLeafNode = parentNode.child.length === 0;
		textData = this.parseTextData(textData, parentNode.tagname, matcher, false, parentNode[":@"] ? Object.keys(parentNode[":@"]).length !== 0 : false, isLeafNode);
		if (textData !== void 0 && textData !== "") parentNode.add(this.options.textNodeName, textData);
		textData = "";
	}
	return textData;
}
/**
* @param {Array<Expression>} stopNodeExpressions - Array of compiled Expression objects
* @param {Matcher} matcher - Current path matcher
*/
function isItStopNode() {
	if (this.stopNodeExpressionsSet.size === 0) return false;
	return this.matcher.matchesAny(this.stopNodeExpressionsSet);
}
/**
* Returns the tag Expression and where it is ending handling single-double quotes situation
* @param {string} xmlData 
* @param {number} i starting index
* @returns 
*/
function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
	let attrBoundary = 0;
	const len = xmlData.length;
	const closeCode0 = closingChar.charCodeAt(0);
	const closeCode1 = closingChar.length > 1 ? closingChar.charCodeAt(1) : -1;
	let result = "";
	let segmentStart = i;
	for (let index = i; index < len; index++) {
		const code = xmlData.charCodeAt(index);
		if (attrBoundary) {
			if (code === attrBoundary) attrBoundary = 0;
		} else if (code === 34 || code === 39) attrBoundary = code;
		else if (code === closeCode0) {
			if (closeCode1 !== -1) {
				if (xmlData.charCodeAt(index + 1) === closeCode1) {
					result += xmlData.substring(segmentStart, index);
					return {
						data: result,
						index
					};
				}
			} else {
				result += xmlData.substring(segmentStart, index);
				return {
					data: result,
					index
				};
			}
		} else if (code === 9 && !attrBoundary) {
			result += xmlData.substring(segmentStart, index) + " ";
			segmentStart = index + 1;
		}
	}
}
function findClosingIndex(xmlData, str, i, errMsg) {
	const closingIndex = xmlData.indexOf(str, i);
	if (closingIndex === -1) throw new Error(errMsg);
	else return closingIndex + str.length - 1;
}
function findClosingChar(xmlData, char, i, errMsg) {
	const closingIndex = xmlData.indexOf(char, i);
	if (closingIndex === -1) throw new Error(errMsg);
	return closingIndex;
}
function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
	const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
	if (!result) return;
	let tagExp = result.data;
	const closeIndex = result.index;
	const separatorIndex = tagExp.search(/\s/);
	let tagName = tagExp;
	let attrExpPresent = true;
	if (separatorIndex !== -1) {
		tagName = tagExp.substring(0, separatorIndex);
		tagExp = tagExp.substring(separatorIndex + 1).trimStart();
	}
	const rawTagName = tagName;
	if (removeNSPrefix) {
		const colonIndex = tagName.indexOf(":");
		if (colonIndex !== -1) {
			tagName = tagName.substr(colonIndex + 1);
			attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
		}
	}
	return {
		tagName,
		tagExp,
		closeIndex,
		attrExpPresent,
		rawTagName
	};
}
/**
* find paired tag for a stop node
* @param {string} xmlData 
* @param {string} tagName 
* @param {number} i 
*/
function readStopNodeData(xmlData, tagName, i) {
	const startIndex = i;
	let openTagCount = 1;
	const xmllen = xmlData.length;
	for (; i < xmllen; i++) if (xmlData[i] === "<") {
		const c1 = xmlData.charCodeAt(i + 1);
		if (c1 === 47) {
			const closeIndex = findClosingChar(xmlData, ">", i, `${tagName} is not closed`);
			if (xmlData.substring(i + 2, closeIndex).trim() === tagName) {
				openTagCount--;
				if (openTagCount === 0) return {
					tagContent: xmlData.substring(startIndex, i),
					i: closeIndex
				};
			}
			i = closeIndex;
		} else if (c1 === 63) i = findClosingIndex(xmlData, "?>", i + 1, "StopNode is not closed.");
		else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 45 && xmlData.charCodeAt(i + 3) === 45) i = findClosingIndex(xmlData, "-->", i + 3, "StopNode is not closed.");
		else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 91) i = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
		else {
			const tagData = readTagExp(xmlData, i, false);
			if (tagData) {
				if ((tagData && tagData.tagName) === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") openTagCount++;
				i = tagData.closeIndex;
			}
		}
	}
}
function parseValue(val, shouldParse, options) {
	if (shouldParse && typeof val === "string") {
		const newval = val.trim();
		if (newval === "true") return true;
		else if (newval === "false") return false;
		else return toNumber(val, options);
	} else if (isExist(val)) return val;
	else return "";
}
function transformTagName(fn, tagName, tagExp, options) {
	if (fn) {
		const newTagName = fn(tagName);
		if (tagExp === tagName) tagExp = newTagName;
		tagName = newTagName;
	}
	tagName = sanitizeName(tagName, options);
	return {
		tagName,
		tagExp
	};
}
function sanitizeName(name, options) {
	if (criticalProperties.includes(name)) throw new Error(`[SECURITY] Invalid name: "${name}" is a reserved JavaScript keyword that could cause prototype pollution`);
	else if (DANGEROUS_PROPERTY_NAMES.includes(name)) return options.onDangerousProperty(name);
	return name;
}

//#endregion
//#region ../../../node_modules/.pnpm/fast-xml-parser@5.11.0/node_modules/fast-xml-parser/src/xmlparser/node2json.js
const METADATA_SYMBOL = XmlNode.getMetaDataSymbol();
/**
* Helper function to strip attribute prefix from attribute map
* @param {object} attrs - Attributes with prefix (e.g., {"@_class": "code"})
* @param {string} prefix - Attribute prefix to remove (e.g., "@_")
* @returns {object} Attributes without prefix (e.g., {"class": "code"})
*/
function stripAttributePrefix(attrs, prefix) {
	if (!attrs || typeof attrs !== "object") return {};
	if (!prefix) return attrs;
	const rawAttrs = {};
	for (const key in attrs) if (key.startsWith(prefix)) {
		const rawName = key.substring(prefix.length);
		rawAttrs[rawName] = attrs[key];
	} else rawAttrs[key] = attrs[key];
	return rawAttrs;
}
/**
* 
* @param {array} node 
* @param {any} options 
* @param {Matcher} matcher - Path matcher instance
* @returns 
*/
function prettify(node, options, matcher, readonlyMatcher) {
	return compress(node, options, matcher, readonlyMatcher);
}
/**
* @param {array} arr 
* @param {object} options 
* @param {Matcher} matcher - Path matcher instance
* @returns object
*/
function compress(arr, options, matcher, readonlyMatcher) {
	let text;
	const compressedObj = {};
	for (let i = 0; i < arr.length; i++) {
		const tagObj = arr[i];
		const property = propName(tagObj);
		if (property !== void 0 && property !== options.textNodeName) {
			const rawAttrs = stripAttributePrefix(tagObj[":@"] || {}, options.attributeNamePrefix);
			matcher.push(property, rawAttrs);
		}
		if (property === options.textNodeName) {
			if (text === void 0) text = tagObj[property];
			else text += "" + tagObj[property];
		} else if (property === void 0) continue;
		else if (tagObj[property]) {
			let val = compress(tagObj[property], options, matcher, readonlyMatcher);
			const isLeaf = isLeafTag(val, options);
			if (Object.keys(val).length === 0 && options.alwaysCreateTextNode) val[options.textNodeName] = "";
			if (tagObj[":@"]) assignAttributes(val, tagObj[":@"], readonlyMatcher, options);
			else if (Object.keys(val).length === 1 && val[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) val = val[options.textNodeName];
			else if (Object.keys(val).length === 0) {
				if (options.alwaysCreateTextNode) val[options.textNodeName] = "";
				else val = "";
			}
			if (tagObj[METADATA_SYMBOL] !== void 0 && typeof val === "object" && val !== null) val[METADATA_SYMBOL] = tagObj[METADATA_SYMBOL];
			if (compressedObj[property] !== void 0 && Object.prototype.hasOwnProperty.call(compressedObj, property)) {
				if (!Array.isArray(compressedObj[property])) compressedObj[property] = [compressedObj[property]];
				compressedObj[property].push(val);
			} else {
				const jPathOrMatcher = options.jPath ? readonlyMatcher.toString() : readonlyMatcher;
				if (options.isArray(property, jPathOrMatcher, isLeaf)) compressedObj[property] = [val];
				else compressedObj[property] = val;
			}
			if (property !== void 0 && property !== options.textNodeName) matcher.pop();
		}
	}
	if (typeof text === "string") {
		if (text.length > 0) compressedObj[options.textNodeName] = text;
	} else if (text !== void 0) compressedObj[options.textNodeName] = text;
	return compressedObj;
}
function propName(obj) {
	const keys = Object.keys(obj);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (key !== ":@") return key;
	}
}
function assignAttributes(obj, attrMap, readonlyMatcher, options) {
	if (attrMap) {
		const keys = Object.keys(attrMap);
		const len = keys.length;
		for (let i = 0; i < len; i++) {
			const atrrName = keys[i];
			const rawAttrName = atrrName.startsWith(options.attributeNamePrefix) ? atrrName.substring(options.attributeNamePrefix.length) : atrrName;
			const jPathOrMatcher = options.jPath ? readonlyMatcher.toString() + "." + rawAttrName : readonlyMatcher;
			if (options.isArray(atrrName, jPathOrMatcher, true, true)) obj[atrrName] = [attrMap[atrrName]];
			else obj[atrrName] = attrMap[atrrName];
		}
	}
}
function isLeafTag(obj, options) {
	const { textNodeName } = options;
	const propCount = Object.keys(obj).length;
	if (propCount === 0) return true;
	if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) return true;
	return false;
}

//#endregion
//#region ../../../node_modules/.pnpm/fast-xml-parser@5.11.0/node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var XMLParser = class {
	constructor(options) {
		this.externalEntities = {};
		this.options = buildOptions(options);
	}
	/**
	* Parse XML dats to JS object 
	* @param {string|Uint8Array} xmlData 
	* @param {boolean|Object} validationOption 
	*/
	parse(xmlData, validationOption) {
		if (typeof xmlData !== "string" && xmlData.toString) xmlData = xmlData.toString();
		else if (typeof xmlData !== "string") throw new Error("XML data is accepted in String or Bytes[] form.");
		if (validationOption) {
			if (validationOption === true) validationOption = {};
			const result = validate(xmlData, validationOption);
			if (result !== true) throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
		}
		const orderedObjParser = new OrderedObjParser(this.options, this.externalEntities);
		const orderedResult = orderedObjParser.parseXml(xmlData);
		if (this.options.preserveOrder || orderedResult === void 0) return orderedResult;
		else return prettify(orderedResult, this.options, orderedObjParser.matcher, orderedObjParser.readonlyMatcher);
	}
	/**
	* Add Entity which is not by default supported by this library
	* @param {string} key 
	* @param {string} value 
	*/
	addEntity(key, value) {
		if (value.indexOf("&") !== -1) throw new Error("Entity value can't have '&'");
		else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
		else if (value === "&") throw new Error("An entity with value '&' is not permitted");
		else this.externalEntities[key] = value;
	}
	/**
	* Returns a Symbol that can be used to access the metadata
	* property on a node.
	* 
	* If Symbol is not available in the environment, an ordinary property is used
	* and the name of the property is here returned.
	* 
	* The XMLMetaData property is only present when `captureMetaData`
	* is true in the options.
	*/
	static getMetaDataSymbol() {
		return XmlNode.getMetaDataSymbol();
	}
};

//#endregion
//#region src/model.ts
function getPublishedAtTimestamp(item) {
	const timestamp = Date.parse(item.publishedAt);
	if (!Number.isFinite(timestamp)) throw new Error(`The Atom entry ${item.id} has an invalid published date.`);
	return timestamp;
}

//#endregion
//#region src/atom.ts
const parser = new XMLParser({
	attributeNamePrefix: "",
	cdataPropName: "#cdata",
	ignoreAttributes: false,
	textNodeName: "#text",
	trimValues: true
});
function parseAtomFeed(xml) {
	const feed = asRecord$1(parser.parse(xml).feed);
	if (!feed) throw new Error("The response is not an Atom feed.");
	return asArray(feed.entry).map(parseAtomEntry).sort(compareFeedItems);
}
function parseAtomEntry(value) {
	const entry = asRecord$1(value);
	if (!entry) throw new Error("The Atom feed contains an invalid entry.");
	const url = findEntryUrl(entry);
	const id = textValue(entry.id) ?? url;
	const publishedAt = textValue(entry.published);
	const title = textValue(entry.title);
	if (!id) throw new Error("An Atom entry must include an id or link.");
	if (!title) throw new Error(`The Atom entry ${id} does not include a title.`);
	if (!publishedAt) throw new Error(`The Atom entry ${id} does not include a published date.`);
	if (!url) throw new Error(`The Atom entry ${id} does not include a link.`);
	const item = {
		id,
		publishedAt,
		title,
		url
	};
	getPublishedAtTimestamp(item);
	return item;
}
function findEntryUrl(entry) {
	const links = asArray(entry.link).map(asRecord$1).filter((link) => link !== null).map((link) => ({
		href: textValue(link.href),
		rel: textValue(link.rel)
	})).filter((link) => link.href !== null);
	return links.find((link) => link.rel === "alternate")?.href ?? links[0]?.href ?? null;
}
function textValue(value) {
	if (typeof value === "string") return value.trim() || null;
	if (typeof value === "number") return String(value);
	const record = asRecord$1(value);
	if (!record) return null;
	return textValue(record["#cdata"]) ?? textValue(record["#text"]);
}
function asArray(value) {
	if (value === void 0 || value === null) return [];
	return Array.isArray(value) ? value : [value];
}
function asRecord$1(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
	return value;
}
function compareFeedItems(left, right) {
	const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : NaN;
	const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : NaN;
	if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) return leftTime - rightTime;
	return left.id.localeCompare(right.id);
}

//#endregion
//#region src/entrypoint.ts
function isMainModule(moduleUrl) {
	return process.argv[1] !== void 0 && moduleUrl === pathToFileURL(process.argv[1]).href;
}

//#endregion
//#region src/monitor.ts
function findPendingItems(items, state) {
	if (state.latestPublishedAt === null) return items;
	const latestTimestamp = Date.parse(state.latestPublishedAt);
	return items.filter((item) => getPublishedAtTimestamp(item) > latestTimestamp);
}

//#endregion
//#region src/state.ts
function createFeedState(latestPublishedAt = null) {
	return {
		latestPublishedAt: latestPublishedAt === null ? null : new Date(Date.parse(latestPublishedAt)).toISOString(),
		version: 1
	};
}
function createInitializedFeedState(items) {
	return createFeedState(findLatestPublishedAt(items));
}
function advanceLatestPublishedAt(state, items) {
	return createFeedState(findLatestPublishedAt(items, state.latestPublishedAt));
}
async function readFeedState(filePath) {
	const source = await readFile(filePath, "utf8");
	return parseFeedState(JSON.parse(source));
}
async function writeJsonFile(filePath, value) {
	await mkdir(dirname(filePath), { recursive: true });
	const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
	await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`);
	await rename(temporaryPath, filePath);
}
async function writeFeedState(filePath, state) {
	await writeJsonFile(filePath, state);
}
function parseFeedState(value) {
	const record = asRecord(value);
	if (record?.version !== 1 || record.latestPublishedAt !== null && typeof record.latestPublishedAt !== "string") throw new Error("The RSS read state file is invalid.");
	return createFeedState(record.latestPublishedAt);
}
function findLatestPublishedAt(items, currentLatestPublishedAt = null) {
	let latestTimestamp = currentLatestPublishedAt === null ? Number.NEGATIVE_INFINITY : Date.parse(currentLatestPublishedAt);
	let latestPublishedAt = currentLatestPublishedAt;
	for (const item of items) {
		const timestamp = getPublishedAtTimestamp(item);
		if (timestamp > latestTimestamp) {
			latestTimestamp = timestamp;
			latestPublishedAt = new Date(timestamp).toISOString();
		}
	}
	return latestPublishedAt;
}
function asRecord(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
	return value;
}

//#endregion
//#region src/workflow.ts
function getInput(name, defaultValue) {
	const value = process.env[`INPUT_${name.toUpperCase().replaceAll(" ", "_")}`];
	if (value === void 0 || value.trim() === "") {
		if (defaultValue !== void 0) return defaultValue;
		throw new Error(`Missing required input: ${name}`);
	}
	return value.trim();
}
function getBooleanInput(name, defaultValue = false) {
	const raw = getInput(name, String(defaultValue)).toLowerCase();
	if (raw === "true") return true;
	if (raw === "false") return false;
	throw new Error(`Input ${name} must be true or false.`);
}
async function setOutput(name, value) {
	const outputPath = process.env.GITHUB_OUTPUT;
	if (!outputPath) return;
	const delimiter = `feed-watcher-${randomUUID()}`;
	await appendFile(outputPath, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
}

//#endregion
//#region src/index.ts
async function main() {
	const feedUrl = getInput("feed-url");
	const stateFile = resolve(getInput("state-file", ".feed-watcher/state.json"));
	const initialize = getBooleanInput("initialize");
	const response = await fetch(feedUrl, { headers: { Accept: "application/atom+xml, application/xml;q=0.9" } });
	if (!response.ok) throw new Error(`Unable to fetch ${feedUrl}: HTTP ${response.status}`);
	const items = parseAtomFeed(await response.text());
	if (initialize) {
		await writeFeedState(stateFile, createInitializedFeedState(items));
		await setNewItemsOutput([]);
		return;
	}
	const state = await readStateOrExplainInitialization(stateFile);
	const pendingItems = findPendingItems(items, state);
	await writeFeedState(stateFile, advanceLatestPublishedAt(state, pendingItems));
	await setNewItemsOutput(pendingItems);
}
async function readStateOrExplainInitialization(stateFile) {
	try {
		return await readFeedState(stateFile);
	} catch (error) {
		if (isMissingFileError(error)) throw new Error("The feed watcher state is missing. Run this workflow manually with mode=initialize before publishing.");
		throw error;
	}
}
async function setNewItemsOutput(items) {
	await setOutput("new-items", JSON.stringify(items));
}
function isMissingFileError(error) {
	return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
if (isMainModule(import.meta.url)) main();

//#endregion
export { readStateOrExplainInitialization, setNewItemsOutput };
//# sourceMappingURL=index.js.map