(()=>{"use strict";var __webpack_modules__={"./node_modules/.pnpm/ts-md5@2.0.1/node_modules/ts-md5/dist/index.es.js":(__unused_webpack___webpack_module__,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Md5: () => (/* binding */ h),
/* harmony export */   Md5FileHasher: () => (/* binding */ l),
/* harmony export */   ParallelHasher: () => (/* binding */ u)
/* harmony export */ });
const c = new Int32Array(4);
class h {
  static hashStr(i, a = !1) {
    return this.onePassHasher.start().appendStr(i).end(a);
  }
  static hashAsciiStr(i, a = !1) {
    return this.onePassHasher.start().appendAsciiStr(i).end(a);
  }
  // Private Static Variables
  static stateIdentity = new Int32Array([
    1732584193,
    -271733879,
    -1732584194,
    271733878
  ]);
  static buffer32Identity = new Int32Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ]);
  static hexChars = "0123456789abcdef";
  static hexOut = [];
  // Permanent instance is to use for one-call hashing
  static onePassHasher = new h();
  static _hex(i) {
    const a = h.hexChars, t = h.hexOut;
    let e, s, r, n;
    for (n = 0; n < 4; n += 1)
      for (s = n * 8, e = i[n], r = 0; r < 8; r += 2)
        t[s + 1 + r] = a.charAt(e & 15), e >>>= 4, t[s + 0 + r] = a.charAt(e & 15), e >>>= 4;
    return t.join("");
  }
  static _md5cycle(i, a) {
    let t = i[0], e = i[1], s = i[2], r = i[3];
    t += (e & s | ~e & r) + a[0] - 680876936 | 0, t = (t << 7 | t >>> 25) + e | 0, r += (t & e | ~t & s) + a[1] - 389564586 | 0, r = (r << 12 | r >>> 20) + t | 0, s += (r & t | ~r & e) + a[2] + 606105819 | 0, s = (s << 17 | s >>> 15) + r | 0, e += (s & r | ~s & t) + a[3] - 1044525330 | 0, e = (e << 22 | e >>> 10) + s | 0, t += (e & s | ~e & r) + a[4] - 176418897 | 0, t = (t << 7 | t >>> 25) + e | 0, r += (t & e | ~t & s) + a[5] + 1200080426 | 0, r = (r << 12 | r >>> 20) + t | 0, s += (r & t | ~r & e) + a[6] - 1473231341 | 0, s = (s << 17 | s >>> 15) + r | 0, e += (s & r | ~s & t) + a[7] - 45705983 | 0, e = (e << 22 | e >>> 10) + s | 0, t += (e & s | ~e & r) + a[8] + 1770035416 | 0, t = (t << 7 | t >>> 25) + e | 0, r += (t & e | ~t & s) + a[9] - 1958414417 | 0, r = (r << 12 | r >>> 20) + t | 0, s += (r & t | ~r & e) + a[10] - 42063 | 0, s = (s << 17 | s >>> 15) + r | 0, e += (s & r | ~s & t) + a[11] - 1990404162 | 0, e = (e << 22 | e >>> 10) + s | 0, t += (e & s | ~e & r) + a[12] + 1804603682 | 0, t = (t << 7 | t >>> 25) + e | 0, r += (t & e | ~t & s) + a[13] - 40341101 | 0, r = (r << 12 | r >>> 20) + t | 0, s += (r & t | ~r & e) + a[14] - 1502002290 | 0, s = (s << 17 | s >>> 15) + r | 0, e += (s & r | ~s & t) + a[15] + 1236535329 | 0, e = (e << 22 | e >>> 10) + s | 0, t += (e & r | s & ~r) + a[1] - 165796510 | 0, t = (t << 5 | t >>> 27) + e | 0, r += (t & s | e & ~s) + a[6] - 1069501632 | 0, r = (r << 9 | r >>> 23) + t | 0, s += (r & e | t & ~e) + a[11] + 643717713 | 0, s = (s << 14 | s >>> 18) + r | 0, e += (s & t | r & ~t) + a[0] - 373897302 | 0, e = (e << 20 | e >>> 12) + s | 0, t += (e & r | s & ~r) + a[5] - 701558691 | 0, t = (t << 5 | t >>> 27) + e | 0, r += (t & s | e & ~s) + a[10] + 38016083 | 0, r = (r << 9 | r >>> 23) + t | 0, s += (r & e | t & ~e) + a[15] - 660478335 | 0, s = (s << 14 | s >>> 18) + r | 0, e += (s & t | r & ~t) + a[4] - 405537848 | 0, e = (e << 20 | e >>> 12) + s | 0, t += (e & r | s & ~r) + a[9] + 568446438 | 0, t = (t << 5 | t >>> 27) + e | 0, r += (t & s | e & ~s) + a[14] - 1019803690 | 0, r = (r << 9 | r >>> 23) + t | 0, s += (r & e | t & ~e) + a[3] - 187363961 | 0, s = (s << 14 | s >>> 18) + r | 0, e += (s & t | r & ~t) + a[8] + 1163531501 | 0, e = (e << 20 | e >>> 12) + s | 0, t += (e & r | s & ~r) + a[13] - 1444681467 | 0, t = (t << 5 | t >>> 27) + e | 0, r += (t & s | e & ~s) + a[2] - 51403784 | 0, r = (r << 9 | r >>> 23) + t | 0, s += (r & e | t & ~e) + a[7] + 1735328473 | 0, s = (s << 14 | s >>> 18) + r | 0, e += (s & t | r & ~t) + a[12] - 1926607734 | 0, e = (e << 20 | e >>> 12) + s | 0, t += (e ^ s ^ r) + a[5] - 378558 | 0, t = (t << 4 | t >>> 28) + e | 0, r += (t ^ e ^ s) + a[8] - 2022574463 | 0, r = (r << 11 | r >>> 21) + t | 0, s += (r ^ t ^ e) + a[11] + 1839030562 | 0, s = (s << 16 | s >>> 16) + r | 0, e += (s ^ r ^ t) + a[14] - 35309556 | 0, e = (e << 23 | e >>> 9) + s | 0, t += (e ^ s ^ r) + a[1] - 1530992060 | 0, t = (t << 4 | t >>> 28) + e | 0, r += (t ^ e ^ s) + a[4] + 1272893353 | 0, r = (r << 11 | r >>> 21) + t | 0, s += (r ^ t ^ e) + a[7] - 155497632 | 0, s = (s << 16 | s >>> 16) + r | 0, e += (s ^ r ^ t) + a[10] - 1094730640 | 0, e = (e << 23 | e >>> 9) + s | 0, t += (e ^ s ^ r) + a[13] + 681279174 | 0, t = (t << 4 | t >>> 28) + e | 0, r += (t ^ e ^ s) + a[0] - 358537222 | 0, r = (r << 11 | r >>> 21) + t | 0, s += (r ^ t ^ e) + a[3] - 722521979 | 0, s = (s << 16 | s >>> 16) + r | 0, e += (s ^ r ^ t) + a[6] + 76029189 | 0, e = (e << 23 | e >>> 9) + s | 0, t += (e ^ s ^ r) + a[9] - 640364487 | 0, t = (t << 4 | t >>> 28) + e | 0, r += (t ^ e ^ s) + a[12] - 421815835 | 0, r = (r << 11 | r >>> 21) + t | 0, s += (r ^ t ^ e) + a[15] + 530742520 | 0, s = (s << 16 | s >>> 16) + r | 0, e += (s ^ r ^ t) + a[2] - 995338651 | 0, e = (e << 23 | e >>> 9) + s | 0, t += (s ^ (e | ~r)) + a[0] - 198630844 | 0, t = (t << 6 | t >>> 26) + e | 0, r += (e ^ (t | ~s)) + a[7] + 1126891415 | 0, r = (r << 10 | r >>> 22) + t | 0, s += (t ^ (r | ~e)) + a[14] - 1416354905 | 0, s = (s << 15 | s >>> 17) + r | 0, e += (r ^ (s | ~t)) + a[5] - 57434055 | 0, e = (e << 21 | e >>> 11) + s | 0, t += (s ^ (e | ~r)) + a[12] + 1700485571 | 0, t = (t << 6 | t >>> 26) + e | 0, r += (e ^ (t | ~s)) + a[3] - 1894986606 | 0, r = (r << 10 | r >>> 22) + t | 0, s += (t ^ (r | ~e)) + a[10] - 1051523 | 0, s = (s << 15 | s >>> 17) + r | 0, e += (r ^ (s | ~t)) + a[1] - 2054922799 | 0, e = (e << 21 | e >>> 11) + s | 0, t += (s ^ (e | ~r)) + a[8] + 1873313359 | 0, t = (t << 6 | t >>> 26) + e | 0, r += (e ^ (t | ~s)) + a[15] - 30611744 | 0, r = (r << 10 | r >>> 22) + t | 0, s += (t ^ (r | ~e)) + a[6] - 1560198380 | 0, s = (s << 15 | s >>> 17) + r | 0, e += (r ^ (s | ~t)) + a[13] + 1309151649 | 0, e = (e << 21 | e >>> 11) + s | 0, t += (s ^ (e | ~r)) + a[4] - 145523070 | 0, t = (t << 6 | t >>> 26) + e | 0, r += (e ^ (t | ~s)) + a[11] - 1120210379 | 0, r = (r << 10 | r >>> 22) + t | 0, s += (t ^ (r | ~e)) + a[2] + 718787259 | 0, s = (s << 15 | s >>> 17) + r | 0, e += (r ^ (s | ~t)) + a[9] - 343485551 | 0, e = (e << 21 | e >>> 11) + s | 0, i[0] = t + i[0] | 0, i[1] = e + i[1] | 0, i[2] = s + i[2] | 0, i[3] = r + i[3] | 0;
  }
  _dataLength = 0;
  _bufferLength = 0;
  _state = new Int32Array(4);
  _buffer = new ArrayBuffer(68);
  _buffer8;
  _buffer32;
  constructor() {
    this._buffer8 = new Uint8Array(this._buffer, 0, 68), this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
  }
  /**
   * Initialise buffer to be hashed
   */
  start() {
    return this._dataLength = 0, this._bufferLength = 0, this._state.set(h.stateIdentity), this;
  }
  // Char to code point to to array conversion:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  // #Example.3A_Fixing_charCodeAt_to_handle_non-Basic-Multilingual-Plane_characters_if_their_presence_earlier_in_the_string_is_unknown
  /**
   * Append a UTF-8 string to the hash buffer
   * @param str String to append
   */
  appendStr(i) {
    const a = this._buffer8, t = this._buffer32;
    let e = this._bufferLength, s, r;
    for (r = 0; r < i.length; r += 1) {
      if (s = i.charCodeAt(r), s < 128)
        a[e++] = s;
      else if (s < 2048)
        a[e++] = (s >>> 6) + 192, a[e++] = s & 63 | 128;
      else if (s < 55296 || s > 56319)
        a[e++] = (s >>> 12) + 224, a[e++] = s >>> 6 & 63 | 128, a[e++] = s & 63 | 128;
      else {
        if (s = (s - 55296) * 1024 + (i.charCodeAt(++r) - 56320) + 65536, s > 1114111)
          throw new Error(
            "Unicode standard supports code points up to U+10FFFF"
          );
        a[e++] = (s >>> 18) + 240, a[e++] = s >>> 12 & 63 | 128, a[e++] = s >>> 6 & 63 | 128, a[e++] = s & 63 | 128;
      }
      e >= 64 && (this._dataLength += 64, h._md5cycle(this._state, t), e -= 64, t[0] = t[16]);
    }
    return this._bufferLength = e, this;
  }
  /**
   * Append an ASCII string to the hash buffer
   * @param str String to append
   */
  appendAsciiStr(i) {
    const a = this._buffer8, t = this._buffer32;
    let e = this._bufferLength, s, r = 0;
    for (; ; ) {
      for (s = Math.min(i.length - r, 64 - e); s--; )
        a[e++] = i.charCodeAt(r++);
      if (e < 64)
        break;
      this._dataLength += 64, h._md5cycle(this._state, t), e = 0;
    }
    return this._bufferLength = e, this;
  }
  /**
   * Append a byte array to the hash buffer
   * @param input array to append
   */
  appendByteArray(i) {
    const a = this._buffer8, t = this._buffer32;
    let e = this._bufferLength, s, r = 0;
    for (; ; ) {
      for (s = Math.min(i.length - r, 64 - e); s--; )
        a[e++] = i[r++];
      if (e < 64)
        break;
      this._dataLength += 64, h._md5cycle(this._state, t), e = 0;
    }
    return this._bufferLength = e, this;
  }
  /**
   * Get the state of the hash buffer
   */
  getState() {
    const i = this._state;
    return {
      buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)),
      buflen: this._bufferLength,
      length: this._dataLength,
      state: [i[0], i[1], i[2], i[3]]
    };
  }
  /**
   * Override the current state of the hash buffer
   * @param state New hash buffer state
   */
  setState(i) {
    const a = i.buffer, t = i.state, e = this._state;
    let s;
    for (this._dataLength = i.length, this._bufferLength = i.buflen, e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], s = 0; s < a.length; s += 1)
      this._buffer8[s] = a.charCodeAt(s);
  }
  /**
   * Hash the current state of the hash buffer and return the result
   * @param raw Whether to return the value as an \`Int32Array\`
   */
  end(i = !1) {
    const a = this._bufferLength, t = this._buffer8, e = this._buffer32, s = (a >> 2) + 1;
    this._dataLength += a;
    const r = this._dataLength * 8;
    if (t[a] = 128, t[a + 1] = t[a + 2] = t[a + 3] = 0, e.set(h.buffer32Identity.subarray(s), s), a > 55 && (h._md5cycle(this._state, e), e.set(h.buffer32Identity)), r <= 4294967295)
      e[14] = r;
    else {
      const n = r.toString(16).match(/(.*?)(.{0,8})$/);
      if (n === null) return i ? c : "";
      const o = parseInt(n[2], 16), _ = parseInt(n[1], 16) || 0;
      e[14] = o, e[15] = _;
    }
    return h._md5cycle(this._state, e), i ? this._state : h._hex(this._state);
  }
}
if (h.hashStr("hello") !== "5d41402abc4b2a76b9719d911017c592")
  throw new Error("Md5 self test failed.");
class l {
  constructor(i, a = !0, t = 1048576) {
    this._callback = i, this._async = a, this._partSize = t, this._configureReader();
  }
  _reader;
  _md5;
  _part;
  // private _length!: number;
  _blob;
  /**
   * Hash a blob of data in the worker
   * @param blob Data to hash
   */
  hash(i) {
    const a = this;
    a._blob = i, a._part = 0, a._md5 = new h(), a._processPart();
  }
  _fail() {
    this._callback({
      success: !1,
      result: "data read failed"
    });
  }
  _hashData(i) {
    let a = this;
    a._md5.appendByteArray(new Uint8Array(i.target.result)), a._part * a._partSize >= a._blob.size ? a._callback({
      success: !0,
      result: a._md5.end()
    }) : a._processPart();
  }
  _processPart() {
    const i = this;
    let a = 0, t;
    i._part += 1, i._blob.size > i._partSize ? (a = i._part * i._partSize, a > i._blob.size && (a = i._blob.size), t = i._blob.slice(
      (i._part - 1) * i._partSize,
      a
    )) : t = i._blob, i._async ? i._reader.readAsArrayBuffer(t) : setTimeout(() => {
      try {
        i._hashData({
          target: {
            result: i._reader.readAsArrayBuffer(
              t
            )
          }
        });
      } catch {
        i._fail();
      }
    }, 0);
  }
  _configureReader() {
    const i = this;
    i._async ? (i._reader = new FileReader(), i._reader.onload = i._hashData.bind(i), i._reader.onerror = i._fail.bind(i), i._reader.onabort = i._fail.bind(i)) : i._reader = new FileReaderSync();
  }
}
class u {
  _queue = [];
  _hashWorker;
  _processing;
  _ready = !0;
  constructor(i, a) {
    const t = this;
    Worker ? (t._hashWorker = new Worker(i, a), t._hashWorker.onmessage = t._recievedMessage.bind(t), t._hashWorker.onerror = (e) => {
      t._ready = !1, console.error("Hash worker failure", e);
    }) : (t._ready = !1, console.error("Web Workers are not supported in this browser"));
  }
  /**
   * Hash a blob of data in the worker
   * @param blob Data to hash
   * @returns Promise of the Hashed result
   */
  hash(i) {
    const a = this;
    let t;
    return t = new Promise((e, s) => {
      a._queue.push({
        blob: i,
        resolve: e,
        reject: s
      }), a._processNext();
    }), t;
  }
  /** Terminate any existing hash requests */
  terminate() {
    this._ready = !1, this._hashWorker.terminate();
  }
  // Processes the next item in the queue
  _processNext() {
    this._ready && !this._processing && this._queue.length > 0 && (this._processing = this._queue.pop(), this._hashWorker.postMessage(this._processing.blob));
  }
  // Hash result is returned from the worker
  _recievedMessage(i) {
    const a = i.data;
    a.success ? this._processing?.resolve(a.result) : this._processing?.reject(a.result), this._processing = void 0, this._processNext();
  }
}

//# sourceMappingURL=index.es.js.map


//# sourceURL=webpack://plugin-background-cover/./node_modules/.pnpm/ts-md5@2.0.1/node_modules/ts-md5/dist/index.es.js?`)},"./plugin.json":module=>{eval(`module.exports = /*#__PURE__*/JSON.parse('{"name":"siyuan-plugin-background-cover","author":"HowcanoeWang","url":"https://github.com/HowcanoeWang/siyuan-plugin-background-cover","version":"0.5.0","minAppVersion":"3.1.20","backends":["all"],"frontends":["desktop","mobile","desktop-window","browser-desktop","browser-mobile"],"displayName":{"default":"Background Cover","zh_CN":"\u66FF\u6362\u80CC\u666F\u56FE\u7247"},"description":{"default":"Add a picture you like to cover the entire Siyuan Note","zh_CN":"\u6DFB\u52A0\u4E00\u5F20\u4F60\u559C\u6B22\u7684\u56FE\u7247\u94FA\u6EE1\u6574\u4E2A\u601D\u6E90\u7B14\u8BB0"},"readme":{"default":"README.md","zh_CN":"README.md","en_US":"README_en_US.md"},"funding":{"openCollective":"","patreon":"","github":"https://github.com/HowcanoeWang"}}');

//# sourceURL=webpack://plugin-background-cover/./plugin.json?`)},"./src/constants.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cacheMaxNum: () => (/* binding */ cacheMaxNum),
/* harmony export */   demoImgURL: () => (/* binding */ demoImgURL),
/* harmony export */   diyIcon: () => (/* binding */ diyIcon),
/* harmony export */   hashLength: () => (/* binding */ hashLength),
/* harmony export */   localStorageKey: () => (/* binding */ localStorageKey),
/* harmony export */   packageName: () => (/* binding */ packageName),
/* harmony export */   packageVersion: () => (/* binding */ packageVersion),
/* harmony export */   pluginAssetsDir: () => (/* binding */ pluginAssetsDir),
/* harmony export */   pluginAssetsDirOS: () => (/* binding */ pluginAssetsDirOS),
/* harmony export */   pluginAssetsId: () => (/* binding */ pluginAssetsId),
/* harmony export */   supportedImageSuffix: () => (/* binding */ supportedImageSuffix),
/* harmony export */   synConfigFile: () => (/* binding */ synConfigFile)
/* harmony export */ });
/* harmony import */ var _plugin_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../plugin.json */ "./plugin.json");

const packageName = _plugin_json__WEBPACK_IMPORTED_MODULE_0__.name;
const packageVersion = _plugin_json__WEBPACK_IMPORTED_MODULE_0__.version;
const localStorageKey = _plugin_json__WEBPACK_IMPORTED_MODULE_0__.name;
const hashLength = 2097152;
const synConfigFile = "configs.json";
const pluginAssetsDir = \`/data/public/\${_plugin_json__WEBPACK_IMPORTED_MODULE_0__.name}\`;
const pluginAssetsId = "pluginAssetsDir";
let pluginAssetsDirOS = "";
let dataDir = window.siyuan.config.system.workspaceDir;
if (window.siyuan.config.system.os === "windows") {
  dataDir = dataDir.replaceAll("\\\\", "/");
  pluginAssetsDirOS = \`\${dataDir}\${pluginAssetsDir}\`;
} else {
  pluginAssetsDirOS = \`\${dataDir}\${pluginAssetsDir}\`;
}
const cacheMaxNum = 198;
const supportedImageSuffix = [".png", ".jpeg", ".jpg", ".jiff", ".jfif"];
const demoImgURL = "./plugins/siyuan-plugin-background-cover/static/FyBE0bUakAELfeF.jpg";
const diyIcon = {
  iconLogo: \`<symbol id="iconLogo" viewBox="0 0 32 32">
    <path d="M26 28h-20v-4l6-10 8.219 10 5.781-4v8z"></path>
    <path d="M26 15c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3c1.657 0 3 1.343 3 3z"></path>
    <path d="M28.681 7.159c-0.694-0.947-1.662-2.053-2.724-3.116s-2.169-2.030-3.116-2.724c-1.612-1.182-2.393-1.319-2.841-1.319h-15.5c-1.378 0-2.5 1.121-2.5 2.5v27c0 1.378 1.122 2.5 2.5 2.5h23c1.378 0 2.5-1.122 2.5-2.5v-19.5c0-0.448-0.137-1.23-1.319-2.841zM24.543 5.457c0.959 0.959 1.712 1.825 2.268 2.543h-4.811v-4.811c0.718 0.556 1.584 1.309 2.543 2.268zM28 29.5c0 0.271-0.229 0.5-0.5 0.5h-23c-0.271 0-0.5-0.229-0.5-0.5v-27c0-0.271 0.229-0.5 0.5-0.5 0 0 15.499-0 15.5 0v7c0 0.552 0.448 1 1 1h7v19.5z"></path>
    </symbol>\`
};


//# sourceURL=webpack://plugin-background-cover/./src/constants.ts?`)},"./src/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BgCoverPlugin)
/* harmony export */ });
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! siyuan */ "siyuan");
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(siyuan__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_configs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/configs */ "./src/utils/configs.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/logger */ "./src/utils/logger.ts");
/* harmony import */ var _utils_theme__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/theme */ "./src/utils/theme.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _services_bgRender__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./services/bgRender */ "./src/services/bgRender.ts");
/* harmony import */ var _ui_topbar__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ui/topbar */ "./src/ui/topbar.ts");
/* harmony import */ var _ui_notice__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ui/notice */ "./src/ui/notice.ts");
/* harmony import */ var _ui_settings__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ui/settings */ "./src/ui/settings.ts");
/* harmony import */ var _ui_fileManager__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ui/fileManager */ "./src/ui/fileManager.ts");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};










class BgCoverPlugin extends siyuan__WEBPACK_IMPORTED_MODULE_0__.Plugin {
  constructor() {
    super(...arguments);
    this.htmlThemeNode = document.getElementsByTagName("html")[0];
  }
  onload() {
    return __async(this, null, function* () {
      const frontEnd = (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.getFrontend)();
      const backEnd = (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.getBackend)();
      this.isMobileLayout = frontEnd === "mobile" || frontEnd === "browser-mobile";
      this.isBrowser = frontEnd.includes("browser");
      this.isAndroidBackend = backEnd === "android";
      window.bgCoverPlugin = {
        i18n: this.i18n,
        isMobileLayout: this.isMobileLayout,
        isBrowser: this.isBrowser,
        isAndroid: this.isAndroidBackend,
        isDev: false
      };
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_2__.debug)(\`\\u8BBE\\u7F6E\\u5168\\u5C40\\u53D8\\u91CFwindow.bgCoverPlugin\`, window.bgCoverPlugin);
      this.addIcons(_constants__WEBPACK_IMPORTED_MODULE_4__.diyIcon.iconLogo);
      yield _ui_topbar__WEBPACK_IMPORTED_MODULE_6__.initTopbar(this);
      this.addCommand({
        langKey: "selectPictureManualLabel",
        hotkey: "\\u21E7\\u2318F6",
        callback: () => {
          _ui_topbar__WEBPACK_IMPORTED_MODULE_6__.selectPictureByHand();
        }
      });
      this.addCommand({
        langKey: "selectPictureRandomLabel",
        hotkey: "\\u21E7\\u2318F7",
        callback: () => {
          _ui_topbar__WEBPACK_IMPORTED_MODULE_6__.selectPictureRandom(true);
        }
      });
      this.addCommand({
        langKey: "openBackgroundLabel",
        hotkey: "\\u21E7\\u2318F4",
        callback: () => {
          _ui_topbar__WEBPACK_IMPORTED_MODULE_6__.pluginOnOff();
        }
      });
      this.addCommand({
        langKey: "reduceBackgroundOpacityLabel",
        hotkey: "\\u21E7\\u23187",
        callback: () => {
          _ui_settings__WEBPACK_IMPORTED_MODULE_8__.opacityShortcut(false);
        }
      });
      this.addCommand({
        langKey: "addBackgroundOpacityLabel",
        hotkey: "\\u21E7\\u23188",
        callback: () => {
          _ui_settings__WEBPACK_IMPORTED_MODULE_8__.opacityShortcut(true);
        }
      });
      this.addCommand({
        langKey: "reduceBackgroundBlurLabel",
        hotkey: "\\u21E7\\u23189",
        callback: () => {
          _ui_settings__WEBPACK_IMPORTED_MODULE_8__.blurShortcut(false);
        }
      });
      this.addCommand({
        langKey: "addBackgroundBlurLabel",
        hotkey: "\\u21E7\\u23180",
        callback: () => {
          _ui_settings__WEBPACK_IMPORTED_MODULE_8__.blurShortcut(true);
        }
      });
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_2__.info)(this.i18n.helloPlugin);
    });
  }
  onLayoutReady() {
    return __async(this, null, function* () {
      _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.setParent(this);
      yield _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.load();
      _services_bgRender__WEBPACK_IMPORTED_MODULE_5__.createBgLayer();
      yield _ui_fileManager__WEBPACK_IMPORTED_MODULE_9__.checkAssetsDir();
      const [themeMode, themeName] = (0,_utils_theme__WEBPACK_IMPORTED_MODULE_3__.getCurrentThemeInfo)();
      _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("prevTheme", themeName);
      yield _services_bgRender__WEBPACK_IMPORTED_MODULE_5__.applySettings();
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_2__.debug)(\`frontend: \${(0,siyuan__WEBPACK_IMPORTED_MODULE_0__.getFrontend)()}; backend: \${(0,siyuan__WEBPACK_IMPORTED_MODULE_0__.getBackend)()}\`);
      _ui_notice__WEBPACK_IMPORTED_MODULE_7__.removeThemeRefreshDialog();
    });
  }
  onunload() {
    var bgLayer = document.getElementById("bglayer");
    bgLayer.remove();
    document.body.style.removeProperty("opacity");
    (0,_utils_logger__WEBPACK_IMPORTED_MODULE_2__.info)(\`\${this.i18n.byePlugin}\`);
  }
  themeOnChange() {
    return __async(this, null, function* () {
      const [themeMode, themeName] = (0,_utils_theme__WEBPACK_IMPORTED_MODULE_3__.getCurrentThemeInfo)();
      let prevTheme = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("prevTheme");
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_2__.debug)(\`Theme changed! from \${prevTheme} to \${themeMode} | \${themeName}\`);
      if (prevTheme !== themeName) {
        _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("prevTheme", themeName);
        yield _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[index][themeOnChange]");
        _ui_notice__WEBPACK_IMPORTED_MODULE_7__.themeRefreshDialog();
      }
    });
  }
  openSetting() {
    _ui_settings__WEBPACK_IMPORTED_MODULE_8__.openSettingDialog(this);
  }
}


//# sourceURL=webpack://plugin-background-cover/./src/index.ts?`)},"./src/services/bgRender.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applySettings: () => (/* binding */ applySettings),
/* harmony export */   changeBackgroundContent: () => (/* binding */ changeBackgroundContent),
/* harmony export */   changeBgPosition: () => (/* binding */ changeBgPosition),
/* harmony export */   changeBlur: () => (/* binding */ changeBlur),
/* harmony export */   changeOpacity: () => (/* binding */ changeOpacity),
/* harmony export */   createBgLayer: () => (/* binding */ createBgLayer),
/* harmony export */   isdisabledTheme: () => (/* binding */ isdisabledTheme),
/* harmony export */   useDefaultLiaoLiaoBg: () => (/* binding */ useDefaultLiaoLiaoBg)
/* harmony export */ });
/* harmony import */ var _utils_configs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/configs */ "./src/utils/configs.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types */ "./src/types.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _ui_fileManager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../ui/fileManager */ "./src/ui/fileManager.ts");
/* harmony import */ var _ui_settings__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../ui/settings */ "./src/ui/settings.ts");
/* harmony import */ var _ui_topbar__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../ui/topbar */ "./src/ui/topbar.ts");
/* harmony import */ var _ui_notice__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../ui/notice */ "./src/ui/notice.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/logger */ "./src/utils/logger.ts");
/* harmony import */ var _utils_theme__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/theme */ "./src/utils/theme.ts");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};









let autoRefreshTimer = null;
function createBgLayer() {
  var bgLayer = document.createElement("canvas");
  bgLayer.id = "bglayer";
  bgLayer.style.backgroundRepeat = "no-repeat";
  bgLayer.style.backgroundAttachment = "fixed";
  bgLayer.style.backgroundSize = "cover";
  bgLayer.style.backgroundPosition = "center center";
  bgLayer.style.width = "100%";
  bgLayer.style.height = "100%";
  bgLayer.style.position = "absolute";
  bgLayer.style.zIndex = "-10000";
  var htmlElement = document.documentElement;
  htmlElement.insertBefore(bgLayer, document.head);
  (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)("[bgRender][createBgLayer] bgLayer created");
}
function useDefaultLiaoLiaoBg() {
  (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(\`[bgRender][applySettings] \\u6CA1\\u6709\\u7F13\\u5B58\\u4EFB\\u4F55\\u56FE\\u7247\\uFF0C\\u4F7F\\u7528\\u9ED8\\u8BA4\\u7684\\u4E86\\u4E86\\u59B9\\u56FE\\u7247ULR\\u6765\\u5F53\\u4F5C\\u80CC\\u666F\\u56FE\`);
  changeBackgroundContent(_constants__WEBPACK_IMPORTED_MODULE_2__.demoImgURL, _types__WEBPACK_IMPORTED_MODULE_1__.bgMode.image);
  _utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.set("crtBgObj", void 0);
}
function changeBackgroundContent(background, mode) {
  var bgLayer = document.getElementById("bglayer");
  if (mode === _types__WEBPACK_IMPORTED_MODULE_1__.bgMode.image) {
    (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(\`[bgRender][changeBackgroundContent] \\u66FF\\u6362\\u5F53\\u524D\\u80CC\\u666F\\u56FE\\u7247\\u4E3A\${background}\`);
    bgLayer.style.setProperty("background-image", \`url('\${background}')\`);
  } else if (mode == _types__WEBPACK_IMPORTED_MODULE_1__.bgMode.video) {
    (0,_ui_notice__WEBPACK_IMPORTED_MODULE_6__.showNotImplementDialog)();
  } else {
    (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.error)(\`[SwitchBgCover Plugin][Error] Background type [\${mode}] is not supported, \`, 7e3, "error");
  }
}
;
function isdisabledTheme() {
  var disabledTheme = _utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("disabledTheme");
  const themeModeText = ["light", "dark"];
  const [themeMode, themeName] = (0,_utils_theme__WEBPACK_IMPORTED_MODULE_8__.getCurrentThemeInfo)();
  var result = disabledTheme[themeModeText[themeMode]][themeName];
  (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(\`[bgRender][isdisabledTheme] search mode='\${themeModeText[themeMode]}', name='\${themeName}' result is \${result}\`);
  return result;
}
function changeOpacity(alpha) {
  let opacity = 0.99 - 0.25 * alpha;
  if (_utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("activate") && !isdisabledTheme() && alpha !== 0) {
    document.body.style.setProperty("opacity", opacity.toString());
  } else {
    document.body.style.removeProperty("opacity");
  }
}
function changeBlur(blur) {
  var bgLayer = document.getElementById("bglayer");
  bgLayer.style.setProperty("filter", \`blur(\${blur}px)\`);
}
function changeBgPosition(x, y) {
  var bgLayer = document.getElementById("bglayer");
  if (x == null || x == void 0) {
    (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(\`[bgRender][changeBgPosition] xy\\u672A\\u5B9A\\u4E49\\uFF0C\\u4E0D\\u8FDB\\u884C\\u6539\\u53D8\`);
    bgLayer.style.setProperty("background-position", \`center\`);
  } else {
    (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(\`[bgRender][changeBgPosition] \\u4FEE\\u6539background-position\\u4E3A\${x}% \${y}%\`);
    bgLayer.style.setProperty("background-position", \`\${x}% \${y}%\`);
  }
}
function applySettings() {
  return __async(this, null, function* () {
    window.bgCoverPlugin.isDev = _utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("inDev");
    var bgLayer = document.getElementById("bglayer");
    (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(bgLayer);
    if (_utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("activate") && !isdisabledTheme()) {
      bgLayer.style.removeProperty("display");
    } else {
      bgLayer.style.setProperty("display", "none");
    }
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer);
      autoRefreshTimer = null;
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)("[bgRender][applySettings] Cleared existing auto-refresh timer.");
    }
    const cacheImgNum = _ui_fileManager__WEBPACK_IMPORTED_MODULE_3__.getCacheImgNum();
    (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(\`[bgRender][applySettings] cacheImgNum= \${cacheImgNum}\`);
    if (cacheImgNum === 0) {
      useDefaultLiaoLiaoBg();
    } else if (_utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("crtBgObj") === void 0) {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(\`[bgRender][applySettings] \\u7F13\\u5B58\\u4E2D\\u67091\\u5F20\\u4EE5\\u4E0A\\u7684\\u56FE\\u7247\\uFF0C\\u4F46\\u662F\\u8BBE\\u7F6E\\u7684bjObj\\u5374\\u662Fundefined\\uFF0C\\u968F\\u673A\\u62BD\\u4E00\\u5F20\`);
      yield _ui_topbar__WEBPACK_IMPORTED_MODULE_5__.selectPictureRandom();
    } else {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(\`[bgRender][applySettings] \\u7F13\\u5B58\\u4E2D\\u67091\\u5F20\\u4EE5\\u4E0A\\u7684\\u56FE\\u7247\\uFF0CbjObj\\u4E5F\\u6709\\u5185\\u5BB9\\u4E14\\u56FE\\u7247\\u5B58\\u5728\`);
      let crtBgObj = _utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("crtBgObj");
      let fileidx = _utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("fileidx");
      if (crtBgObj && crtBgObj.hash in fileidx) {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(\`[bgRender][applySettings] \\u5F53\\u524D\\u80CC\\u666F\\u56FE\\u6709\\u6548\\uFF0C\\u52A0\\u8F7D\\u5F53\\u524D\\u56FE\\u7247\`);
        changeBackgroundContent(crtBgObj.path, crtBgObj.mode);
      } else {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(\`[bgRender][applySettings] \\u5F53\\u524D\\u80CC\\u666F\\u56FE\\u65E0\\u6548\\u6216\\u4E22\\u5931\\uFF0C\\u968F\\u673A\\u9009\\u62E9\\u4E00\\u5F20\\u66FF\\u6362\`);
        yield _ui_topbar__WEBPACK_IMPORTED_MODULE_5__.selectPictureRandom();
      }
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(_utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("autoRefreshTime"), \`judgement result:\`, _utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("autoRefreshTime") > 0);
      if (_utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("autoRefresh") && _utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("autoRefreshTime") > 0) {
        const refreshTime = _utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("autoRefreshTime") * 60 * 1e3;
        autoRefreshTimer = setInterval(() => {
          _ui_topbar__WEBPACK_IMPORTED_MODULE_5__.selectPictureRandom(false);
        }, refreshTime);
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_7__.debug)(\`[bgRender][applySettings] Set up auto-refresh timer for every \${refreshTime / 1e3} seconds.\`);
      }
    }
    changeOpacity(_utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("opacity"));
    changeBlur(_utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("blur"));
    if (_utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("crtBgObj") === void 0) {
      changeBgPosition(null, null);
    } else {
      let bgObjCfg = _utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("bgObjCfg");
      let crtbgObjHash = _utils_configs__WEBPACK_IMPORTED_MODULE_0__.confmngr.get("crtBgObj").hash;
      var offx = "50";
      var offy = "50";
      if (crtbgObjHash in bgObjCfg) {
        offx = bgObjCfg[crtbgObjHash].offx;
        offy = bgObjCfg[crtbgObjHash].offy;
      }
      changeBgPosition(offx, offy);
    }
    _ui_settings__WEBPACK_IMPORTED_MODULE_4__.updateSettingPanelElementStatus();
  });
}


//# sourceURL=webpack://plugin-background-cover/./src/services/bgRender.ts?`)},"./src/types.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bgMode: () => (/* binding */ bgMode),
/* harmony export */   defaultLocalConfigs: () => (/* binding */ defaultLocalConfigs),
/* harmony export */   defaultSyncConfigs: () => (/* binding */ defaultSyncConfigs)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");

var bgMode = /* @__PURE__ */ ((bgMode2) => {
  bgMode2[bgMode2["image"] = 0] = "image";
  bgMode2[bgMode2["video"] = 1] = "video";
  bgMode2[bgMode2["live2d"] = 2] = "live2d";
  return bgMode2;
})(bgMode || {});
var defaultLocalConfigs = {
  "version": _constants__WEBPACK_IMPORTED_MODULE_0__.packageVersion,
  // \u5F53\u524D\u914D\u7F6E\u7684\u80CC\u666F\u56FE\u8DEF\u5F84
  "crtBgObj": void 0,
  // \u8BBE\u7F6E\u5F53\u524D\u56FE\u7247\u5728\u5F53\u524D\u8BBE\u5907\u4E0B\u7684\u72EC\u6709\u914D\u7F6E\uFF0C\u5982\u4F4D\u7F6Exy\u7B49
  "bgObjCfg": {},
  // \u7528\u4E8E\u5224\u65AD\u662F\u5426\u8FDB\u884C\u4E86\u80CC\u666F\u66F4\u6539
  "prevTheme": "",
  // \u542F\u52A8\u65F6\u968F\u673A\u66F4\u6539\u56FE\u7247
  "autoRefresh": true,
  "autoRefreshTime": 30,
  // \u5168\u5C40\u80CC\u666F\u56FE\u900F\u660E\u5EA6
  "opacity": 0.5,
  // \u5168\u5C40\u80CC\u666F\u56FE\u6A21\u7CCA\u5EA6
  "blur": 5,
  // \u662F\u5426\u542F\u7528\u80CC\u666F
  "activate": true,
  // \u5C4F\u853D\u80CC\u666F
  "disabledTheme": { light: {}, dark: {} },
  // \u5F00\u53D1\u8005\u6A21\u5F0F
  "inDev": false
};
var defaultSyncConfigs = {
  "fileidx": {},
  "noteAssetsFolder": {}
};


//# sourceURL=webpack://plugin-background-cover/./src/types.ts?`)},"./src/ui/components/dialogs.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   showConfirmationDialog: () => (/* binding */ showConfirmationDialog),
/* harmony export */   showNoticeDialog: () => (/* binding */ showNoticeDialog)
/* harmony export */ });
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! siyuan */ "siyuan");
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(siyuan__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _templates__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./templates */ "./src/ui/components/templates.ts");
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};


function showNoticeDialog(options) {
  const contentHTML = (0,_templates__WEBPACK_IMPORTED_MODULE_1__.createNoticeDialogTemplate)(options);
  const dialog = new siyuan__WEBPACK_IMPORTED_MODULE_0__.Dialog({
    title: options.title,
    content: contentHTML,
    width: window.bgCoverPlugin.isMobileLayout ? "92vw" : "520px"
  });
}
function showConfirmationDialog(options) {
  const finalOptions = __spreadValues({
    cancelText: options.cancelText || window.bgCoverPlugin.i18n.cancel,
    confirmText: options.confirmText || window.bgCoverPlugin.i18n.confirm
  }, options);
  const contentHTML = (0,_templates__WEBPACK_IMPORTED_MODULE_1__.createConfirmDialogTemplate)(finalOptions);
  const dialog = new siyuan__WEBPACK_IMPORTED_MODULE_0__.Dialog({
    title: finalOptions.title,
    content: contentHTML,
    width: window.bgCoverPlugin.isMobileLayout ? "92vw" : "520px"
  });
  const btns = dialog.element.querySelectorAll(".b3-button");
  const cancelButton = btns[0];
  const confirmButton = btns[1];
  cancelButton.addEventListener("click", () => {
    if (options.onCancel) {
      options.onCancel();
    }
    dialog.destroy();
  });
  confirmButton.addEventListener("click", () => {
    options.onConfirm();
    dialog.destroy();
  });
}


//# sourceURL=webpack://plugin-background-cover/./src/ui/components/dialogs.ts?`)},"./src/ui/components/templates.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createConfirmDialogTemplate: () => (/* binding */ createConfirmDialogTemplate),
/* harmony export */   createNoticeDialogTemplate: () => (/* binding */ createNoticeDialogTemplate)
/* harmony export */ });
function createNoticeDialogTemplate(options) {
  return \`
        <div class="b3-dialog__content">\${options.message}</div>
    \`;
}
function createConfirmDialogTemplate(options) {
  return \`
        <div class="b3-dialog__content">\${options.message}</div>
        <div class="b3-dialog__action">
            <button class="b3-button b3-button--cancel">\${options.cancelText}</button>
            <div class="fn__space"></div>
            <button class="b3-button b3-button--text">\${options.confirmText}</button>
        </div>
    \`;
}


//# sourceURL=webpack://plugin-background-cover/./src/ui/components/templates.ts?`)},"./src/ui/fileManager.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   batchUploadImages: () => (/* binding */ batchUploadImages),
/* harmony export */   checkAssetsDir: () => (/* binding */ checkAssetsDir),
/* harmony export */   clearCacheFolder: () => (/* binding */ clearCacheFolder),
/* harmony export */   generateCacheImgList: () => (/* binding */ generateCacheImgList),
/* harmony export */   getCacheImgNum: () => (/* binding */ getCacheImgNum),
/* harmony export */   imgExistsInCache: () => (/* binding */ imgExistsInCache),
/* harmony export */   openAssetsFolderPickerDialog: () => (/* binding */ openAssetsFolderPickerDialog),
/* harmony export */   selectPictureDialog: () => (/* binding */ selectPictureDialog),
/* harmony export */   uploadOneImage: () => (/* binding */ uploadOneImage)
/* harmony export */ });
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! siyuan */ "siyuan");
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(siyuan__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_configs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/configs */ "./src/utils/configs.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../types */ "./src/types.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _services_bgRender__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../services/bgRender */ "./src/services/bgRender.ts");
/* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./settings */ "./src/ui/settings.ts");
/* harmony import */ var _topbar__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./topbar */ "./src/ui/topbar.ts");
/* harmony import */ var _components_dialogs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/dialogs */ "./src/ui/components/dialogs.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/logger */ "./src/utils/logger.ts");
/* harmony import */ var _utils_api__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../utils/api */ "./src/utils/api.ts");
/* harmony import */ var _utils_pythonic__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../utils/pythonic */ "./src/utils/pythonic.ts");
/* harmony import */ var ts_md5__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ts-md5 */ "./node_modules/.pnpm/ts-md5@2.0.1/node_modules/ts-md5/dist/index.es.js");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};












let os = new _utils_pythonic__WEBPACK_IMPORTED_MODULE_10__.OS();
let cv2 = new _utils_pythonic__WEBPACK_IMPORTED_MODULE_10__.CloseCV();
let ka = new _utils_api__WEBPACK_IMPORTED_MODULE_9__.KernelApi();
function getCacheImgNum() {
  let cacheImgNum;
  let fileidx = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("fileidx");
  if (fileidx === null || fileidx == void 0) {
    cacheImgNum = 0;
  } else {
    cacheImgNum = Object.keys(_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("fileidx")).length;
  }
  return cacheImgNum;
}
function checkAssetsDir() {
  return __async(this, null, function* () {
    const oldAssetsDir = \`/data/public/\${_constants__WEBPACK_IMPORTED_MODULE_3__.packageName}/assets\`;
    if (yield os.folderExists(oldAssetsDir)) {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)(\`[fileManagerUI][checkAssetsDir] \\u68C0\\u6D4B\\u5230\\u65E7\\u7248\\u672C\\u7684\\u6587\\u4EF6\\u8DEF\\u5F84\\uFF0C\\u63D0\\u793A\\u7528\\u6237\\u91CD\\u7F6E\\u8BBE\\u7F6E\\u4EE5\\u53CA\\u6E05\\u9664assets\\u6587\\u4EF6\`);
      (0,_components_dialogs__WEBPACK_IMPORTED_MODULE_7__.showConfirmationDialog)({
        title: window.bgCoverPlugin.i18n.updateNoticeTitle,
        message: window.bgCoverPlugin.i18n.updateNoticeMsg,
        confirmText: window.bgCoverPlugin.i18n.updateNoticeConfirmBtn,
        cancelText: window.bgCoverPlugin.i18n.updateNoticeCancelBtn,
        onConfirm: () => {
          window.open("https://github.com/HowcanoeWang/siyuan-plugin-background-cover/issues", "_blank");
        }
      });
    }
    if (!(yield os.folderExists(_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDir))) {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)(\`[fileManagerUI][checkAssetsDir] \\u63D2\\u4EF6\\u6570\\u636E\\u6839\\u76EE\\u5F55\\u4E0D\\u5B58\\u5728\\uFF0C\\u521B\\u5EFA\\u6839\\u76EE\\u5F55\${_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDir}\`);
      yield os.mkdir(_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDir);
    }
    let imgFiles = yield os.listdir(_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDir);
    let fileidx = {};
    let fileidx_db = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("fileidx");
    let notCorrectCacheImgs = [];
    let extraCacheImgs = [];
    let missingCacheImgs = [];
    if (fileidx_db === void 0 || fileidx_db === null) {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)(\`The settings.fileidx is empty {}\`);
    }
    for (let i in imgFiles) {
      let item = imgFiles[i];
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)(\`[fileManagerUI][checkImgAssets] Check \${item.name} in cached dir\`);
      if (item.name.slice(0, 5) === "hash-") {
        const [hash_name, suffix] = os.splitext(item.name.split("-")[1]);
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)(\`[fileManagerUI][checkImgAssets] hash_name: \`, hash_name, fileidx_db, extraCacheImgs);
        if (hash_name in fileidx_db) {
          let bgObj_old = fileidx_db[hash_name];
          fileidx[hash_name] = bgObj_old;
        } else {
          extraCacheImgs.push(item.name);
          const imgPath = \`\${_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDir.slice(5)}/\${item.name}\`;
          const imageSize = yield cv2.getImageSize(imgPath);
          (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)(\`[fileManagerUI][checkImgAssets] the cached local file \${item.name} has md5: \${hash_name}\`);
          let bgObj = {
            name: item.name,
            path: imgPath,
            hash: hash_name,
            mode: _types__WEBPACK_IMPORTED_MODULE_2__.bgMode.image,
            height: imageSize.height,
            width: imageSize.width,
            parent: _constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsId
          };
          fileidx[hash_name] = bgObj;
        }
      } else {
        notCorrectCacheImgs.push(item.name);
      }
    }
    for (let k in fileidx_db) {
      if (!(k in fileidx)) {
        missingCacheImgs.push(fileidx_db[k].name);
      }
    }
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("fileidx", fileidx);
    yield _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[fileManagerUI][checkCacheImgDir]");
    if (notCorrectCacheImgs.length !== 0) {
      let msgInfo = \`\${window.bgCoverPlugin.i18n.cacheImgWrongName}<br/>[\${notCorrectCacheImgs}]<br/>\${window.bgCoverPlugin.i18n.doNotOperateCacheFolder}\`;
      (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.showMessage)(msgInfo, 7e3, "info");
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.info)(msgInfo);
    }
    if (extraCacheImgs.length !== 0) {
      let msgInfo = \`\${window.bgCoverPlugin.i18n.cacheImgExtra}<br/>[\${extraCacheImgs}]<br/>\${window.bgCoverPlugin.i18n.doNotOperateCacheFolder}\`;
      (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.showMessage)(msgInfo, 7e3, "info");
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.info)(msgInfo);
    }
    if (missingCacheImgs.length !== 0) {
      let msgInfo = \`\${window.bgCoverPlugin.i18n.cacheImgMissing}<br/>[\${missingCacheImgs}]<br/>\${window.bgCoverPlugin.i18n.doNotOperateCacheFolder}\`;
      (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.showMessage)(msgInfo, 7e3, "info");
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.info)(msgInfo);
    }
  });
}
function clearCacheFolder(mode) {
  return __async(this, null, function* () {
    if (mode == _types__WEBPACK_IMPORTED_MODULE_2__.bgMode.image) {
      let imgList = yield os.listdir(_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDir);
      let fileidx = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("fileidx");
      for (let i in imgList) {
        let item = imgList[i];
        if (item.isDir) {
          os.rmtree(\`\${_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDir}/\${item.name}/\`);
        } else {
          let full_path = \`\${_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDir}/\${item.name}\`;
          yield ka.removeFile(full_path);
          const [hash_name, suffix] = os.splitext(item.name.split("-")[1]);
          delete fileidx[hash_name];
        }
      }
      _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("fileidx", fileidx);
      let ulContainerElement = document.getElementById("cacheImgList");
      if (ulContainerElement) {
        ulContainerElement.innerHTML = null;
      }
      let displayDivElement = document.getElementById("displayCanvas");
      if (displayDivElement) {
        displayDivElement.innerHTML = null;
      }
    }
    const cacheImgNum = getCacheImgNum();
    if (cacheImgNum === 0) {
      _services_bgRender__WEBPACK_IMPORTED_MODULE_4__.useDefaultLiaoLiaoBg();
    }
    ;
    yield _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[fileManagerUI][clearCacheFolder]");
  });
}
function imgExistsInCache(file, notice = true) {
  return __async(this, null, function* () {
    let fileidx = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("fileidx");
    const blobSlice = File.prototype.slice;
    var chunk_blob = blobSlice.call(file, 0, Math.min(file.size, _constants__WEBPACK_IMPORTED_MODULE_3__.hashLength));
    let file_content = yield chunk_blob.text();
    var md5_slice = ts_md5__WEBPACK_IMPORTED_MODULE_11__.Md5.hashStr(\`\${file_content}\${file.size}\`).slice(0, 15);
    (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)(\`[fileManagerUI][imgExistsInCache] Blob content: [\${file_content.slice(20, 40)} ...] with length = \${file_content.length}file.size=\${file.size}\`);
    if (fileidx !== void 0 && md5_slice in fileidx) {
      if (notice) {
        const dialog = new siyuan__WEBPACK_IMPORTED_MODULE_0__.Dialog({
          title: \`\${window.bgCoverPlugin.i18n.inDevTitle}\`,
          content: \`<div class="b3-dialog__content">\${window.bgCoverPlugin.i18n.imageFileExist}</div>\`,
          width: window.bgCoverPlugin.isMobileLayout ? "92vw" : "520px"
        });
      } else {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)(\`[fileManagerUI][imgIsInCache] \\u5F53\\u524D\\u56FE\\u7247\${file.name}\\u5DF2\\u5B58\\u5728\`);
      }
      return "exists";
    } else {
      return md5_slice;
    }
  });
}
function uploadOneImage(file) {
  return __async(this, null, function* () {
    let fileSizeMB = file.size / 1024 / 1024;
    let md5_slice = yield imgExistsInCache(file);
    if (md5_slice !== "exists") {
      (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.showMessage)(\`\${file.name}-\${fileSizeMB.toFixed(2)}MB<br>\${window.bgCoverPlugin.i18n.addSingleImageUploadNotice}\`, 3e3, "info");
    }
    let fileidx = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("fileidx");
    if (fileidx === void 0 || fileidx === null) {
      fileidx = {};
    }
    ;
    if (md5_slice !== "exists") {
      const [prefix, suffix] = os.splitext(file.name);
      const hashedName = \`hash-\${md5_slice}.\${suffix}\`;
      const uploadResult = yield ka.putFile(\`\${_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDir}/\${hashedName}\`, file);
      if (uploadResult.code === 0) {
        const imgPath = \`\${_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDir.slice(5)}/\${hashedName}\`;
        const imageSize = yield cv2.getImageSize(imgPath);
        let bgObj = {
          name: file.name,
          hash: md5_slice,
          mode: _types__WEBPACK_IMPORTED_MODULE_2__.bgMode.image,
          path: imgPath,
          width: imageSize.width,
          height: imageSize.height,
          parent: _constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsId
        };
        fileidx[bgObj.hash] = bgObj;
        _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("crtBgObj", bgObj);
        _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("fileidx", fileidx);
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)(\`[fileManagerUI][addSingleLocalImageFile]: fileidx \${fileidx}\`);
        return bgObj;
      } else {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.error)(\`fail to upload file \${file.name} with error code \${uploadResult}\`);
        return null;
      }
    }
  });
}
function batchUploadImages(fileArray, applySetting = false) {
  return __async(this, null, function* () {
    let bgObj;
    (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)("[fileManagerUI][batchUploadImages] fileArray", fileArray);
    if (fileArray.length === 0) {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)("[fileManagerUI][batchUploadImages] fileArray\\u4E3A\\u7A7A\\uFF0C\\u4E0D\\u5B58\\u5728\\u9700\\u8981\\u4E0A\\u4F20\\u7684\\u56FE\\u7247");
    } else {
      for (let file of fileArray) {
        bgObj = yield uploadOneImage(file);
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)("[fileManagerUI][batchUploadImages] \\u5728\\u4E0A\\u4F20\\u7684\\u5FAA\\u73AF\\u5185", bgObj);
      }
      ;
      yield _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[fileManagerUI][batchUploadImages]");
      if (applySetting) {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)("[fileManagerUI][batchUploadImages] \\u5728\\u5E94\\u7528\\u8BBE\\u7F6E\\u7684\\u5224\\u65AD\\u5185", bgObj);
        _services_bgRender__WEBPACK_IMPORTED_MODULE_4__.changeBackgroundContent(bgObj.path, bgObj.mode);
        _settings__WEBPACK_IMPORTED_MODULE_5__.updateSettingPanelElementStatus();
      }
    }
  });
}
function selectPictureDialog() {
  return __async(this, null, function* () {
    const cacheManagerDialog = new siyuan__WEBPACK_IMPORTED_MODULE_0__.Dialog({
      title: window.bgCoverPlugin.i18n.selectPictureManagerTitle,
      width: window.bgCoverPlugin.isMobileLayout ? "92vw" : "520px",
      height: "92vh",
      content: \`
        <div class="fn__flex-column" style="height: 100%">
            <div class="layout-tab-bar fn__flex">

                <!-- tab 1 title -->
                <div class="item item--full item--focus" data-type="remove">
                    <span class="fn__flex-1"></span>
                    <span class="item__text">\${window.bgCoverPlugin.i18n.selectPictureManagerTab1}</span>
                    <span class="fn__flex-1"></span>
                </div>

                <!-- tab 2 title -->
                <!--div class="item item--full" data-type="missing">
                    <span class="fn__flex-1"></span>
                    <span class="item__text">\${window.bgCoverPlugin.i18n.selectPictureManagerTab2}</span>
                    <span class="fn__flex-1"></span>
                </div-->
            </div>
            <div class="fn__flex-1">

                <!-- tab 1 -->

                <div class="config-assets" data-type="remove" data-init="true">
                    <div class="fn__hr--b"></div>

                    <label class="fn__flex" style="justify-content: flex-end;">
                        <button id="removeAllImgs" class="b3-button b3-button--outline fn__flex-center fn__size200">
                            <svg class="svg"><use xlink:href="#iconTrashcan"></use></svg>
                            \${window.bgCoverPlugin.i18n.deleteAll}
                        </button>
                        <div class="fn__space"></div>
                    </label>

                    <div class="fn__hr"></div>

                    <ul id="cacheImgList" class="b3-list b3-list--background config-assets__list">

                        <li data-path="20230609230328-7vp057x.png" class="b3-list-item b3-list-item--hide-action">
                            <span class="b3-list-item__text">
                                20230609230328-7vp057x.png
                            </span>
                            <span data-type="open" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="\${window.bgCoverPlugin.i18n.setAsBg}">
                                <svg><use xlink:href="#iconHideDock"></use></svg>
                            </span>
                            <span data-type="clear" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="\${window.bgCoverPlugin.i18n.delete}">
                                <svg><use xlink:href="#iconTrashcan"></use></svg>
                            </span>
                        </li>
                        
                    </ul>

                    <!-- after rendering -->
                    <!--div class="config-assets__preview" data-path="assets/xxxx.png">
                        <img style="max-height: 100%" src="assets/xxxx.png">
                    </div-->

                    <!-- default empty -->
                    <div id="displayCanvas" class="config-assets__preview"></div>
                </div>

                <!-- tab 2, class add fn__none to cancle display -->

                <!--div class="fn__none config-assets" data-type="missing">
                    <div class="fn__hr"></div>
                    <ul class="b3-list b3-list--background config-assets__list">
                        <li class="fn__loading"><img src="/stage/loading-pure.svg"></li>
                    </ul>
                    <div class="fn__hr"></div>
                </div>
            </div>
        </div>
        \`
    });
    let listHtmlArray = generateCacheImgList();
    const cacheImgListElement = document.getElementById("cacheImgList");
    cacheImgListElement.innerHTML = "";
    for (const element of listHtmlArray) {
      cacheImgListElement.appendChild(element);
    }
    (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)("[fileManagerUI][selectPictureByHand]", listHtmlArray, cacheImgListElement);
    let deleteAllImgBtn = document.getElementById("removeAllImgs");
    deleteAllImgBtn.addEventListener("click", () => __async(this, null, function* () {
      yield clearCacheFolder(_types__WEBPACK_IMPORTED_MODULE_2__.bgMode.image);
    }));
  });
}
function generateCacheImgList() {
  let listHtml = [];
  let fileidx = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("fileidx");
  for (const i in fileidx) {
    let bgObj = fileidx[i];
    let parser = new DOMParser();
    let ulElementHtml = parser.parseFromString(
      \`
        <li data-hash="\${bgObj.hash}" class="b3-list-item b3-list-item--hide-action">
            <span class="b3-list-item__text">
                \${bgObj.name}
            </span>
            <span data-type="open" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="\${window.bgCoverPlugin.i18n.setAsBg}">
                <svg><use xlink:href="#iconHideDock"></use></svg>
            </span>
            <span data-type="clear" class="b3-tooltips b3-tooltips__w b3-list-item__action" aria-label="\${window.bgCoverPlugin.i18n.delete}">
                <svg><use xlink:href="#iconTrashcan"></use></svg>
            </span>
        </li>
        \`,
      "text/html"
    ).body.firstChild;
    let setBgBtn = ulElementHtml.querySelectorAll("span")[1];
    let delBtn = ulElementHtml.querySelectorAll("span")[2];
    setBgBtn.addEventListener("click", () => {
      _services_bgRender__WEBPACK_IMPORTED_MODULE_4__.changeBackgroundContent(bgObj.path, bgObj.mode);
      _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("crtBgObj", bgObj);
      _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[fileManagerUI][generateCacheImgList][setBgBtn.click]");
    });
    delBtn.addEventListener("click", () => {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)("Remove the background");
      let ulContainerElement = document.getElementById("cacheImgList");
      let rmLiEle = ulContainerElement.querySelectorAll(\`[data-hash="\${bgObj.hash}"]\`)[0];
      rmLiEle.remove();
      let displayDivElement = document.getElementById("displayCanvas");
      displayDivElement.innerHTML = null;
      _topbar__WEBPACK_IMPORTED_MODULE_6__.selectPictureRandom();
      let fileidx2 = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("fileidx");
      delete fileidx2[bgObj.hash];
      _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("fileidx", fileidx2);
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)(\`[fileManagerUI][_rmBg] \\u79FB\\u9664\\u4E0B\\u5217\\u8DEF\\u5F84\\u7684\\u56FE\\u7247\\uFF1A\${_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDir}/\${bgObj.name}\`);
      ka.removeFile(\`data/\${bgObj.path}\`);
      const cacheImgNum = getCacheImgNum();
      if (cacheImgNum === 0) {
        _services_bgRender__WEBPACK_IMPORTED_MODULE_4__.useDefaultLiaoLiaoBg();
      }
      ;
      _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[fileManagerUI][generateCacheImgList][delBtn.click]");
    });
    ulElementHtml.addEventListener("mouseenter", () => {
      let displayDivElement = document.getElementById("displayCanvas");
      displayDivElement.innerHTML = \`<img style="max-height: 100%" src="\${bgObj.path}">\`;
    });
    listHtml.push(ulElementHtml);
  }
  return listHtml;
}
function openAssetsFolderPickerDialog() {
  const rootPath = "data/assets";
  const selectedPaths = /* @__PURE__ */ new Set();
  return new Promise((resolve) => {
    const dialog = new siyuan__WEBPACK_IMPORTED_MODULE_0__.Dialog({
      title: window.bgCoverPlugin.i18n.addNoteAssetsDirectoryLabel,
      width: window.bgCoverPlugin.isMobileLayout ? "92vw" : "600px",
      height: "70vh",
      content: \`
            <div class="b3-dialog__content" style="height: calc(100% - 62px);">
                <div id="folderTreeContainer" class="b3-label file-tree" style="height: 100%;">
                    <!-- Tree will be rendered here -->
                </div>
            </div>
            <div class="b3-dialog__action">
                <button class="b3-button b3-button--cancel">\${window.bgCoverPlugin.i18n.cancel}</button>
                <div class="fn__space"></div>
                <button class="b3-button b3-button--text" id="folderPickerSelect">\${window.bgCoverPlugin.i18n.confirm}</button>
            </div>
            \`,
      destroyCallback: () => {
        resolve(null);
      }
    });
    const renderSubfolderNode = (path, parentElement, level = 0) => __async(this, null, function* () {
      let subDirs = [];
      let imageCount = 0;
      let hasSubDirs = false;
      try {
        const res = yield ka.readDir(path);
        if (res.code === 0 && res.data) {
          const items = res.data;
          (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)(\`ka.readDir -> items:\`, items);
          subDirs = items.filter((item) => item.isDir);
          (0,_utils_logger__WEBPACK_IMPORTED_MODULE_8__.debug)(\`\\u8BFB\\u53D6\\u6587\\u4EF6\\u5939\${path}\\u7684\\u5B50\\u6587\\u4EF6\\u5939\\u5185\\u5BB9:\`, subDirs);
          imageCount = items.filter(
            (item) => !item.isDir && _constants__WEBPACK_IMPORTED_MODULE_3__.supportedImageSuffix.includes(\`.\${os.splitext(item.name)[1].toLowerCase()}\`)
          ).length;
          hasSubDirs = subDirs.length > 0;
        }
      } catch (err) {
        console.error(\`[fileManagerUI] \\u8BFB\\u53D6\\u8DEF\\u5F84\\u5931\\u8D25 \${path}:\`, err);
      }
      const nodeElement = document.createElement("div");
      const folderName = path.split("/").pop() || path;
      const arrowHTML = hasSubDirs ? \`<span class="b3-list-item__toggle b3-list-item__toggle--hl">
                       <svg class="b3-list-item__arrow"><use xlink:href="#iconRight"></use></svg>
                   </span>\` : \`<span class="b3-list-item__toggle"></span>\`;
      const badgeHTML = \`
            <span class="counter counter--bg fn__flex-center b3-tooltips b3-tooltips__w" 
                aria-label="\${window.bgCoverPlugin.i18n.folderBgCountLabel}">
                \${imageCount}
            </span>\`;
      nodeElement.innerHTML = \`
            <div class="b3-list-item b3-list-item--narrow toggle">
                \${arrowHTML}
                <span class="b3-list-item__text ft__on-surface" >\${folderName}</span>
                <span class="fn__space"></span>
                <input class="b3-switch fn__flex-center" type="checkbox" data-path="\${path}" \${imageCount === 0 ? "disabled" : ""}>
                \${badgeHTML}
            </div>
            <div class="b3-list__panel" style="display: none;"></div>
            \`;
      parentElement.appendChild(nodeElement);
      const panel = nodeElement.querySelector(".b3-list__panel");
      const checkbox = nodeElement.querySelector(".b3-switch");
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          selectedPaths.add(path);
        } else {
          selectedPaths.delete(path);
        }
      });
      if (hasSubDirs) {
        const toggle = nodeElement.querySelector(".b3-list-item__toggle");
        const arrow = nodeElement.querySelector(".b3-list-item__arrow");
        toggle.addEventListener("click", () => __async(this, null, function* () {
          const isOpen = arrow.classList.toggle("b3-list-item__arrow--open");
          panel.style.display = isOpen ? "" : "none";
          if (isOpen && panel.childElementCount === 0) {
            for (const item of subDirs) {
              yield renderSubfolderNode(\`\${path}/\${item.name}\`, panel, level + 1);
            }
          }
        }));
      }
    });
    const treeContainer = dialog.element.querySelector("#folderTreeContainer");
    const initTree = () => __async(this, null, function* () {
      treeContainer.innerHTML = \`<div class="fn__loading" style="text-align: center; padding: 20px;"><img src="/stage/loading-pure.svg"></div>\`;
      try {
        const res = yield ka.readDir(rootPath);
        treeContainer.innerHTML = "";
        if (res.code === 0 && res.data) {
          const rootDirs = res.data.filter((item) => item.isDir);
          if (rootDirs.length > 0) {
            for (const dir of rootDirs) {
              const listContainer = document.createElement("div");
              listContainer.className = "b3-list b3-list--border b3-list--background";
              treeContainer.appendChild(listContainer);
              yield renderSubfolderNode(\`\${rootPath}/\${dir.name}\`, listContainer, 0);
            }
          } else {
            treeContainer.innerHTML = \`<div class="b3-list-item b3-list-item--narrow"><span class="b3-list-item__text ft__on-surface ft__smaller">\${window.bgCoverPlugin.i18n.emptyFolder}</span></div>\`;
          }
        }
      } catch (err) {
        console.error("Failed to read root assets directory:", err);
        treeContainer.innerHTML = \`<div class="b3-list-item"><span class="b3-list-item__text" style="color: var(--b3-theme-error);">Failed to load assets directory.</span></div>\`;
      }
    });
    initTree();
    const confirmButton = dialog.element.querySelector("#folderPickerSelect");
    confirmButton.addEventListener("click", () => {
      resolve(Array.from(selectedPaths));
      dialog.destroy();
    });
    const cancelButton = dialog.element.querySelector(".b3-button--cancel");
    cancelButton.addEventListener("click", () => {
      dialog.destroy();
    });
  });
}


//# sourceURL=webpack://plugin-background-cover/./src/ui/fileManager.ts?`)},"./src/ui/notice.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bugReportDialog: () => (/* binding */ bugReportDialog),
/* harmony export */   removeThemeRefreshDialog: () => (/* binding */ removeThemeRefreshDialog),
/* harmony export */   showNotImplementDialog: () => (/* binding */ showNotImplementDialog),
/* harmony export */   themeRefreshDialog: () => (/* binding */ themeRefreshDialog)
/* harmony export */ });
/* harmony import */ var _components_dialogs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/dialogs */ "./src/ui/components/dialogs.ts");

function showNotImplementDialog() {
  (0,_components_dialogs__WEBPACK_IMPORTED_MODULE_0__.showNoticeDialog)({
    title: window.bgCoverPlugin.i18n.notImplementTitle,
    message: window.bgCoverPlugin.i18n.notImplementMsg
  });
}
function bugReportDialog() {
  (0,_components_dialogs__WEBPACK_IMPORTED_MODULE_0__.showConfirmationDialog)({
    title: window.bgCoverPlugin.i18n.bugReportLabel,
    message: window.bgCoverPlugin.i18n.bugReportConfirmText,
    confirmText: window.bgCoverPlugin.i18n.confirmBugReport,
    onConfirm: () => {
      window.open("https://github.com/HowcanoeWang/siyuan-plugin-background-cover/issues", "_blank");
    }
  });
}
function themeRefreshDialog() {
  (0,_components_dialogs__WEBPACK_IMPORTED_MODULE_0__.showConfirmationDialog)({
    title: window.bgCoverPlugin.i18n.themeOnChangeTitle,
    message: window.bgCoverPlugin.i18n.themeOnChangeMsg,
    confirmText: window.bgCoverPlugin.i18n.themeRefresh,
    onConfirm: () => {
      window.location.reload();
    }
  });
}
function removeThemeRefreshDialog() {
  let dialog = document.getElementsByClassName("b3-dialog__container")[0];
  if (dialog !== void 0) {
    dialog.parentElement.parentElement.remove();
  }
}


//# sourceURL=webpack://plugin-background-cover/./src/ui/notice.ts?`)},"./src/ui/settings.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   blurShortcut: () => (/* binding */ blurShortcut),
/* harmony export */   generatedisabledThemeElement: () => (/* binding */ generatedisabledThemeElement),
/* harmony export */   opacityShortcut: () => (/* binding */ opacityShortcut),
/* harmony export */   openSettingDialog: () => (/* binding */ openSettingDialog),
/* harmony export */   updateAutoFreshStatus: () => (/* binding */ updateAutoFreshStatus),
/* harmony export */   updateCheckedElement: () => (/* binding */ updateCheckedElement),
/* harmony export */   updateOffsetSwitch: () => (/* binding */ updateOffsetSwitch),
/* harmony export */   updateSettingPanelElementStatus: () => (/* binding */ updateSettingPanelElementStatus),
/* harmony export */   updateSliderElement: () => (/* binding */ updateSliderElement)
/* harmony export */ });
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! siyuan */ "siyuan");
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(siyuan__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_configs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/configs */ "./src/utils/configs.ts");
/* harmony import */ var _services_bgRender__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../services/bgRender */ "./src/services/bgRender.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _fileManager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./fileManager */ "./src/ui/fileManager.ts");
/* harmony import */ var _topbar__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./topbar */ "./src/ui/topbar.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/logger */ "./src/utils/logger.ts");
/* harmony import */ var _utils_pythonic__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/pythonic */ "./src/utils/pythonic.ts");
/* harmony import */ var _utils_theme__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/theme */ "./src/utils/theme.ts");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};









let os = new _utils_pythonic__WEBPACK_IMPORTED_MODULE_7__.OS();
let cv2 = new _utils_pythonic__WEBPACK_IMPORTED_MODULE_7__.CloseCV();
function openSettingDialog(pluginInstance) {
  const cacheImgNum = _fileManager__WEBPACK_IMPORTED_MODULE_4__.getCacheImgNum();
  let crtBgObj = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("crtBgObj");
  var crtBgObjName = _constants__WEBPACK_IMPORTED_MODULE_3__.demoImgURL;
  if (crtBgObj !== void 0) {
    crtBgObjName = crtBgObj.name;
  }
  let crtBgObjCfg = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("bgObjCfg");
  var crtOffx = "50";
  var crtOffy = "50";
  if (crtBgObjCfg[crtBgObj.hash] !== void 0) {
    crtOffx = crtBgObjCfg[crtBgObj.hash].offx;
    crtOffy = crtBgObjCfg[crtBgObj.hash].offy;
  }
  const dialog = new siyuan__WEBPACK_IMPORTED_MODULE_0__.Dialog({
    // title: \`\${window.bgCoverPlugin.i18n.addTopBarIcon}(v\${packageInfo.version}) \${window.bgCoverPlugin.i18n.settingLabel}\`,
    width: window.bgCoverPlugin.isMobileLayout ? "92vw" : "max(520px, 60vw)",
    height: "max(520px, 60vh)",
    content: \`
        <div class="fn__flex-1 fn__flex config__panel" style="overflow: hidden;position: relative">
            <ul class="b3-tab-bar b3-list b3-list--background">

                <li data-name="config" class="b3-list-item b3-list-item--focus">
                    <svg class="b3-list-item__graphic"><use xlink:href="#iconEdit"></use></svg>
                    <span class="b3-list-item__text">\${window.bgCoverPlugin.i18n.tabConfigLabel}</span>
                </li>

                <li data-name="assets" class="b3-list-item">
                    <svg class="b3-list-item__graphic"><use xlink:href="#iconImage"></use></svg>
                    <span class="b3-list-item__text">\${window.bgCoverPlugin.i18n.tabAssetsLabel}</span>
                </li>

                <li data-name="theme" class="b3-list-item">
                    <svg class="b3-list-item__graphic"><use xlink:href="#iconTheme"></use></svg>
                    <span class="b3-list-item__text">\${window.bgCoverPlugin.i18n.tabThemeLabel}</span>
                </li>

                <li data-name="advance" class="b3-list-item">
                    <svg class="b3-list-item__graphic"><use xlink:href="#iconRiffCard"></use></svg>
                    <span class="b3-list-item__text">\${window.bgCoverPlugin.i18n.tabAdvanceLabel}</span>
                </li>

                <li data-name="about" class="b3-list-item">
                    <svg class="b3-list-item__graphic"><use xlink:href="#iconInfo"></use></svg>
                    <span class="b3-list-item__text">\${window.bgCoverPlugin.i18n.tabAboutLabel}</span>
                </li>

            </ul>

            <div class="config__tab-wrap">

                <!-- \\u5168\\u5C40\\u914D\\u7F6ETab -->
                <div class="config__tab-container" data-name="config">
                
                    <!--
                    // info panel part
                    -->
                    
                    <label class="fn__flex b3-label">
                        <div class="fn__flex-1">
                            \${window.bgCoverPlugin.i18n.imgPathLabel}
                            <div class="b3-label__text">
                                <code id="crtImgName" class="fn__code">\${crtBgObjName}</code>
                            </div>
                        </div>
                        <div class="fn__flex-center">  
                            <div>
                                <label for="cx">X</label> 
                                <input id="cx" class="b3-slider fn__size50"  max="100" min="0" step="5" type="range" value=\${crtOffx}>
                            </div>
                            <div>
                                <label for="cy">Y</label> 
                                <input id="cy" class="b3-slider fn__size50"  max="100" min="0" step="5" type="range" value=\${crtOffy}>
                            </div>
                        </div>
                    </label>

                    <!--
                    // onoff switch part
                    -->

                    <label class="fn__flex b3-label config__item">
                        <div class="fn__flex-1">
                            \${window.bgCoverPlugin.i18n.openBackgroundLabel}
                            <div class="b3-label__text">
                                \${window.bgCoverPlugin.i18n.openBackgroundLabelDes}
                            </div>
                        </div>
                        <span class="fn__flex-center" />
                        <input
                            id="onoffInput"
                            class="b3-switch fn__flex-center"
                            type="checkbox"
                            value="\${_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("activate")}"
                        />
                    </label>

                    
                    <!--
                    // \\u81EA\\u52A8\\u66F4\\u6362\\u80CC\\u666F\\u6309\\u94AE
                    -->
                    <div class="b3-label">
                        <div>\${window.bgCoverPlugin.i18n.autoRefreshLabel}</div>
                        <div class="fn__hr"></div>

                        <div class="fn__flex config__item">
                            <div class="fn__flex-center fn__flex-1 ft__on-surface">\${window.bgCoverPlugin.i18n.autoRefreshDes}</div>
                            <span class="fn__space"></span>
                            <input
                                id="autoRefreshInput"
                                class="b3-switch fn__flex-center"
                                type="checkbox"
                                value="\${_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("autoRefresh")}"
                            />
                        </div>

                        <div class="fn__hr"></div>

                        <div class="fn__flex config__item">
                            <div class="fn__flex-center fn__flex-1 ft__on-surface">\${window.bgCoverPlugin.i18n.autoRefreshTimeDes}</div>
                            <span class="fn__space"></span>
                            <input class="b3-text-field fn__flex-center fn__size200" id="autoRefreshTimeInput" type="number" min="0" max="36000" value="\${_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("autoRefreshTime")}">
                            <span class="fn__space"></span>
                            <span class="ft__on-surface fn__flex-center">\${window.bgCoverPlugin.i18n.autoRefreshTimeUnit}</span>
                        </div>

                    </div>

                    <!--
                    // slider part Input[4] - Input [5]
                    -->

                    <label class="fn__flex b3-label config__item">
                        <div class="fn__flex-1">
                            \${window.bgCoverPlugin.i18n.opacityLabel}
                            <div class="b3-label__text">
                                \${window.bgCoverPlugin.i18n.opacityDes}
                            </div>
                        </div>
                        <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="\${_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("opacity")}">   
                            <input id="opacityInput" class="b3-slider fn__size200" max="1" min="0" step="0.05" type="range" value="\${_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("opacity")}">
                        </div>
                    </label>
                    <label class="fn__flex b3-label config__item">
                        <div class="fn__flex-1">
                            \${window.bgCoverPlugin.i18n.blurLabel}
                            <div class="b3-label__text">
                                \${window.bgCoverPlugin.i18n.blurDes}
                            </div>
                        </div>
                        <div class="b3-tooltips b3-tooltips__n fn__flex-center" aria-label="\${_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("blur")}">   
                            <input id="blurInput" class="b3-slider fn__size200" max="10" min="0" step="1" type="range" value="\${_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("blur")}">
                        </div>
                    </label>
                </div>

                <!-- \\u6570\\u636E\\u76EE\\u5F55Tab -->

                <div class="config__tab-container fn__none" data-name="assets">

                    <label class="fn__flex b3-label config__item">
                        <div class="fn__flex-1">
                            <div class="fn__flex">
                                \${window.bgCoverPlugin.i18n.cacheDirectoryLabel}
                                <span class="fn__space"></span>
                                <span style="color: var(--b3-theme-on-surface)">\${window.bgCoverPlugin.i18n.cacheDirectoryDes}</span>
                                <span id="cacheImgNumElement" class="selected" style="color: rgb(255,0,0)">
                                    [ \${cacheImgNum} ]
                                </span>
                            </div>
                            <div class="b3-label__text">
                                <a href="file:///\${_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDirOS}/" style="word-break: break-all">\${_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDirOS}</a>
                            </div>
                        </div>
                        <span class="fn__space"></span>
                        <button id="cacheManagerBtn" class="b3-button b3-button--outline fn__flex-center fn__size100" id="appearanceRefresh">
                            <svg><use xlink:href="#iconDatabase"></use></svg>
                            \${window.bgCoverPlugin.i18n.cacheManager}
                        </button>
                    </label>
                
                </div>


                <!-- \\u5C4F\\u853D\\u4E3B\\u9898Tab -->

                <div class="config__tab-container fn__none" data-name="theme">

                    <div class="config-bazaar__panel">
                    
                        <div class="fn__flex config-bazaar__title">

                            <div>\${window.bgCoverPlugin.i18n.themeAdaptEditorMode0}</div>
                        
                        </div>

                        <div class="config-bazaar__content">

                            <div class="b3-cards" id="lightThemeBlockContainer">

                                <!-- label item add by for loop -->
                            
                            </div>
                        
                        </div>

                        <div class="fn__flex config-bazaar__title">

                            <div>\${window.bgCoverPlugin.i18n.themeAdaptEditorMode1}</div>
                        
                        </div>

                        <div class="config-bazaar__content">

                            <div class="b3-cards" id="darkThemeBlockContainer">

                                <!-- label item add by for loop -->
                            
                            </div>
                        
                        </div>

                    </div>

                </div>


                <!-- \\u9AD8\\u7EA7\\u8BBE\\u7F6ETab -->

                <div class="config__tab-container fn__none" data-name="advance">
                    <!--
                    // reset panel part, Button[0]
                    -->

                    <label class="b3-label config__item fn__flex">
                        <div class="fn__flex-1">
                        \${window.bgCoverPlugin.i18n.resetConfigLabel}
                            <div class="b3-label__text">
                                \${window.bgCoverPlugin.i18n.resetConfigDes}<span class="selected" style="color:rgb(255,0,0)">\${window.bgCoverPlugin.i18n.resetConfigDes2}
                                </span>
                            </div>
                        </div>
                        <span class="fn__space"></span>
                        <button id="resetBtn" class="b3-button b3-button--outline fn__flex-center fn__size100" id="appearanceRefresh">
                            <svg><use xlink:href="#iconRefresh"></use></svg>
                            \${window.bgCoverPlugin.i18n.reset}
                        </button>
                    </label>

                    <!--
                    // debug panel part
                    -->

                    <label class="fn__flex b3-label config__item">
                        <div class="fn__flex-1">
                            \${window.bgCoverPlugin.i18n.inDevModeLabel}
                            <div class="b3-label__text">
                                \${window.bgCoverPlugin.i18n.inDevModeDes} \\u2022 
                                FrontEnd: <code class="fn__code">\${(0,siyuan__WEBPACK_IMPORTED_MODULE_0__.getFrontend)()}</code> \\u2022 BackEnd: <code class="fn__code">\${(0,siyuan__WEBPACK_IMPORTED_MODULE_0__.getBackend)()}</code> \\u2022 
                                isMobileLayout: <code class="fn__code">\${window.bgCoverPlugin.isMobileLayout}</code> \\u2022 
                                isBrowser: <code class="fn__code">\${window.bgCoverPlugin.isBrowser}</code> \\u2022 
                                isAndroid: <code class="fn__code">\${window.bgCoverPlugin.isAndroid}</code>
                            </div>
                        </div>
                        <span class="fn__flex-center" />
                        <input
                            id="devModeInput"
                            class="b3-switch fn__flex-center"
                            type="checkbox"
                            value="\${_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("inDev")}"
                        />
                    </label>

                </div>

                <!-- \\u5173\\u4E8ETab -->

                <div class="config__tab-container fn__none" data-name="about">

                    <label class="fn__flex b3-label config__item"> 
                        <div class="fn__flex-1"> 
                            \${window.bgCoverPlugin.i18n.crtVersion} 
                            <div class="b3-abel__text"> 
                                v\${_constants__WEBPACK_IMPORTED_MODULE_3__.packageVersion}
                            </div> 
                        </div> 
                    </label>

                    <!--
                    Donations Section
                    -->
                    <label class="fn__flex b3-label config__item"> 
                        <div class="fn__flex-1"> 
                            \${window.bgCoverPlugin.i18n.donationTitle} 
                            <div class="b3-abel__text" style="text-align: center;"> 
                                <table style="width: 75%; margin-left: auto; margin-right: auto;"> 
                                    <thead> 
                                        <tr> 
                                            <th>\${window.bgCoverPlugin.i18n.donationAlipay}</th> 
                                            <th>\${window.bgCoverPlugin.i18n.donationWechat}</th> 
                                        </tr> 
                                    </thead> 
                                    <tbody> 
                                        <tr> 
                                            <td style="text-align: center;"> 
                                                <img width="256px" alt="" src="./plugins/siyuan-plugin-background-cover/static/ali.jpg"> 
                                            </td> 
                                            <td style="text-align: center;"> 
                                                <img width="256px" alt="" src="./plugins/siyuan-plugin-background-cover/static/wechat.png"> 
                                            </td> 
                                        </tr> 
                                    </tbody> 
                                </table> 
                            </div> 
                        </div> 
                    </label>

                </div>
            </div>
        
        </div>\`
  });
  const tabBar = dialog.element.querySelector(".b3-tab-bar");
  tabBar.addEventListener("click", (event) => {
    const target = event.target;
    const tabElement = target.closest("li");
    if (tabElement && !tabElement.classList.contains("b3-list-item--focus")) {
      const tabName = tabElement.getAttribute("data-name");
      tabBar.querySelectorAll("li").forEach((item) => {
        item.classList.remove("b3-list-item--focus");
      });
      tabElement.classList.add("b3-list-item--focus");
      dialog.element.querySelectorAll(".config__tab-container").forEach((container) => {
        container.classList.add("fn__none");
      });
      dialog.element.querySelector(\`.config__tab-container[data-name="\${tabName}"]\`).classList.remove("fn__none");
    }
  });
  const cxElement = document.getElementById("cx");
  const cyElement = document.getElementById("cy");
  updateOffsetSwitch();
  window.addEventListener("resize", updateOffsetSwitch);
  let elementsArray = [cxElement, cyElement];
  for (let i = 0; i < 2; i++) {
    elementsArray[i].addEventListener("input", () => {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_6__.debug)(elementsArray, cxElement.value, cyElement.value);
      _services_bgRender__WEBPACK_IMPORTED_MODULE_2__.changeBgPosition(cxElement.value, cyElement.value);
    });
    elementsArray[i].addEventListener("change", () => {
      let crtBgObj2 = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("crtBgObj");
      if (crtBgObj2 !== void 0) {
        let crtbgObjHash = crtBgObj2.hash;
        let bgObjCfg = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("bgObjCfg");
        let crtBjObjCfg = bgObjCfg[crtbgObjHash];
        if (crtBjObjCfg === void 0) {
          crtBjObjCfg = {
            offx: "50",
            offy: "50"
          };
        }
        crtBjObjCfg.offx = cxElement.value;
        crtBjObjCfg.offy = cyElement.value;
        bgObjCfg[crtbgObjHash] = crtBjObjCfg;
        _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("bgObjCfg", bgObjCfg);
        _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[settingsUI][openSettingDialog][cxyElement.change]");
      }
    });
  }
  const cacheManagerElement = document.getElementById("cacheManagerBtn");
  cacheManagerElement.addEventListener("click", () => __async(this, null, function* () {
    dialog.destroy();
    _topbar__WEBPACK_IMPORTED_MODULE_5__.selectPictureByHand();
  }));
  const activateElement = document.getElementById("onoffInput");
  activateElement.checked = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("activate");
  activateElement.addEventListener("click", () => {
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("activate", !_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("activate"));
    activateElement.value = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("activate");
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[settingsUI][openSettingDialog][activateElement.change]");
    _services_bgRender__WEBPACK_IMPORTED_MODULE_2__.applySettings();
  });
  generatedisabledThemeElement();
  const autoRefreshElement = document.getElementById("autoRefreshInput");
  autoRefreshElement.checked = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("autoRefresh");
  const autoRefreshTimeElement = document.getElementById("autoRefreshTimeInput");
  autoRefreshTimeElement.value = \`\${_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("autoRefreshTime")}\`;
  updateAutoFreshStatus();
  autoRefreshElement.addEventListener("click", () => {
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("autoRefresh", !_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("autoRefresh"));
    autoRefreshElement.value = \`\${_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("autoRefresh")}\`;
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[settingsUI][openSettingDialog][autoRefreshElement.change]");
    updateAutoFreshStatus();
    _services_bgRender__WEBPACK_IMPORTED_MODULE_2__.applySettings();
  });
  autoRefreshTimeElement.addEventListener("change", () => {
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("autoRefreshTime", autoRefreshTimeElement.value);
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[settingsUI][openSettingDialog][autoRefreshTimeElement.change]");
    _services_bgRender__WEBPACK_IMPORTED_MODULE_2__.applySettings();
  });
  const opacityElement = document.getElementById("opacityInput");
  opacityElement.addEventListener("change", () => {
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("opacity", parseFloat(opacityElement.value));
    if (_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("activate")) {
      _services_bgRender__WEBPACK_IMPORTED_MODULE_2__.changeOpacity(_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("opacity"));
    }
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[settingsUI][openSettingDialog][opacityElement.change]");
  });
  opacityElement.addEventListener("input", () => {
    opacityElement.parentElement.setAttribute("aria-label", opacityElement.value);
  });
  const blurElement = document.getElementById("blurInput");
  blurElement.addEventListener("change", () => {
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("blur", parseFloat(blurElement.value));
    if (_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("activate")) {
      _services_bgRender__WEBPACK_IMPORTED_MODULE_2__.changeBlur(_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("blur"));
    }
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[settingsUI][openSettingDialog][blurElement.change]");
  });
  blurElement.addEventListener("input", () => {
    blurElement.parentElement.setAttribute("aria-label", blurElement.value);
  });
  const resetSettingElement = document.getElementById("resetBtn");
  resetSettingElement.addEventListener("click", () => __async(this, null, function* () {
    os.rmtree(_constants__WEBPACK_IMPORTED_MODULE_3__.pluginAssetsDir);
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.reset();
    yield _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[settingsUI][openSettingDialog][resetSettingElement.click]");
    yield _services_bgRender__WEBPACK_IMPORTED_MODULE_2__.applySettings();
  }));
  const devModeElement = document.getElementById("devModeInput");
  devModeElement.checked = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("inDev");
  devModeElement.addEventListener("click", () => {
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("inDev", !_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("inDev"));
    devModeElement.value = \`\${_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("inDev")}\`;
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[settingsUI][openSettingDialog][devModeElement.change]");
  });
}
function generatedisabledThemeElement() {
  const [themeMode, themeName] = (0,_utils_theme__WEBPACK_IMPORTED_MODULE_8__.getCurrentThemeInfo)();
  const installedThemes = (0,_utils_theme__WEBPACK_IMPORTED_MODULE_8__.getInstalledThemes)();
  const ThemeBlockContainer = [
    document.getElementById("lightThemeBlockContainer"),
    document.getElementById("darkThemeBlockContainer")
  ];
  var disabledThemeConfig = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("disabledTheme");
  const themeModeText = ["light", "dark"];
  (0,_utils_logger__WEBPACK_IMPORTED_MODULE_6__.debug)("[settingsUI][generatedisabledThemeElement] Current block theme config:", disabledThemeConfig);
  for (var i = 0; i < installedThemes.length; i++) {
    var iThemes = installedThemes[i];
    for (var j = 0; j < iThemes.length; j++) {
      var itheme = iThemes[j];
      var btnOnOffValue;
      var ithemeConfig = disabledThemeConfig[themeModeText[i]];
      if (itheme["name"] in ithemeConfig) {
        btnOnOffValue = ithemeConfig[itheme["name"]];
      } else {
        btnOnOffValue = false;
        ithemeConfig[itheme["name"]] = btnOnOffValue;
      }
      let parser = new DOMParser();
      var blockLabelItem = parser.parseFromString(\`
            <div class="b3-card b3-card--wrap">
                <div class="fn__flex-1 fn__flex-column">
                    <div class="b3-card__info b3-card__info--left fn__flex-1">
                        <span class="crt_plugin-placeholder">\${itheme["name"]}</span>
                        <!-- span class="ft__on-surface ft__smaller"></span -->
                        <div class="b3-card__desc">
                            \${itheme["label"]}
                        </div>
                    </div>
                </div>
                <div class="b3-card__actions b3-card__actions--right">
                    <span class="fn__space"></span>
                    <input class="b3-switch fn__flex-center" data-mode="\${themeModeText[i]}" data-theme="\${itheme["name"]}" type="checkbox"></input>
                </div>
            </div>
            \`, "text/html").body.firstChild;
      ThemeBlockContainer[i].appendChild(blockLabelItem);
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_6__.debug)(\`\\u6DFB\\u52A0\\u5F53\\u524D\\u4E3B\\u9898\\u7684\\u84DD\\u8272\\u9AD8\\u4EAE\`, itheme["name"], themeName);
      if (themeMode === i && itheme["name"] === themeName) {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_6__.debug)(\`      => \\u5339\\u914D\\u5230\\u4E00\\u81F4\\u7684\\u4E3B\\u9898\`);
        let textSpan = blockLabelItem.querySelector("span.crt_plugin-placeholder");
        textSpan.style.setProperty("color", "var(--b3-theme-primary)");
        textSpan.textContent += \`[\${window.bgCoverPlugin.i18n.crtThemeText}]\`;
      }
      let onOffBtn = blockLabelItem.querySelectorAll("input")[0];
      onOffBtn.checked = btnOnOffValue;
      onOffBtn.addEventListener("click", () => __async(this, null, function* () {
        var disabledThemeCfg = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("disabledTheme");
        let mode = onOffBtn.getAttribute("data-mode");
        let theme = onOffBtn.getAttribute("data-theme");
        disabledThemeCfg[mode][theme] = !disabledThemeCfg[mode][theme];
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_6__.debug)(\`[settingsUI] User changed disabledTheme \${theme} in \${mode} mode\`);
        _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("disabledTheme", disabledThemeCfg);
        _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[settingsUI][generatedisabledThemeElement][onOffBtn.click]");
        yield _services_bgRender__WEBPACK_IMPORTED_MODULE_2__.applySettings();
      }));
    }
  }
  _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("disabledTheme", disabledThemeConfig);
  _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[settingsUI][generatedisabledThemeElement]");
}
function updateSliderElement(elementid, value, setAriaLabel = true) {
  let sliderElement = document.getElementById(elementid);
  if (sliderElement === null || sliderElement === void 0) {
  } else {
    sliderElement.value = value;
    if (setAriaLabel) {
      sliderElement.parentElement.setAttribute("aria-label", value);
    }
  }
}
function updateCheckedElement(elementid, value) {
  let checkedElement = document.getElementById(elementid);
  if (checkedElement === null || checkedElement === void 0) {
  } else {
    checkedElement.checked = value;
  }
}
function opacityShortcut(isAdd) {
  var opacity = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("opacity");
  if (isAdd) {
    opacity = Number((opacity + 0.1).toFixed(2));
  } else {
    opacity = Number((opacity - 0.1).toFixed(2));
  }
  ;
  if (opacity > 1 || opacity < 0) {
    (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.showMessage)(\`[\${window.bgCoverPlugin.i18n.addTopBarIcon}]\${window.bgCoverPlugin.i18n.opacityShortcutOverflow}\`, 4e3, "info");
    return;
  } else {
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("opacity", opacity);
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[settingsUI][opacityShortcut]");
    if (_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("activate")) {
      _services_bgRender__WEBPACK_IMPORTED_MODULE_2__.changeOpacity(opacity);
    }
    updateSliderElement("opacityInput", \`\${opacity}\`);
  }
  ;
}
function blurShortcut(isAdd) {
  var blur = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("blur");
  if (isAdd) {
    blur = Number((blur + 1).toFixed(0));
  } else {
    blur = Number((blur - 1).toFixed(0));
  }
  ;
  if (blur > 10 || blur < 0) {
    (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.showMessage)(\`[\${window.bgCoverPlugin.i18n.addTopBarIcon}]\${window.bgCoverPlugin.i18n.blurShortcutOverflow}\`, 4e3, "info");
    return;
  } else {
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.set("blur", blur);
    _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.save("[settingsUI][blurShortcut]");
    if (_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("activate")) {
      _services_bgRender__WEBPACK_IMPORTED_MODULE_2__.changeBlur(blur);
    }
    updateSliderElement("blurInput", \`\${blur}\`);
  }
  ;
}
function updateSettingPanelElementStatus() {
  let crtImageNameElement = document.getElementById("crtImgName");
  if (crtImageNameElement === null || crtImageNameElement === void 0) {
  } else {
    let bgObj = _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("crtBgObj");
    if (_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("crtBgObj") === void 0) {
      crtImageNameElement.textContent = _constants__WEBPACK_IMPORTED_MODULE_3__.demoImgURL.toString();
    } else {
      crtImageNameElement.textContent = bgObj.name;
    }
  }
  updateOffsetSwitch();
  let cacheImgNumEle = document.getElementById("cacheImgNumElement");
  if (cacheImgNumEle === null || cacheImgNumEle === void 0) {
  } else {
    const cacheImgNum = _fileManager__WEBPACK_IMPORTED_MODULE_4__.getCacheImgNum();
    cacheImgNumEle.textContent = \`[ \${cacheImgNum} ]\`;
  }
  updateCheckedElement("onoffInput", _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("activate"));
  updateAutoFreshStatus();
  updateSliderElement("opacityInput", _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("opacity"));
  updateSliderElement("blurInput", _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("blur"));
  updateCheckedElement("devModeInput", _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("inDev"));
}
function updateOffsetSwitch() {
  let cxElement = document.getElementById("cx");
  let cyElement = document.getElementById("cy");
  if (cxElement === null || cxElement === void 0) {
  } else {
    let bglayerElement = document.getElementById("bglayer");
    if (_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("activate")) {
      const container_h = parseInt(getComputedStyle(bglayerElement).height);
      const container_w = parseInt(getComputedStyle(bglayerElement).width);
      let fullside;
      if (_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("crtBgObj") === void 0) {
        fullside = cv2.getFullSide(
          container_w,
          container_h,
          2458,
          1383
          // \u9ED8\u8BA4\u4E86\u4E86\u56FE\u7684\u5BBD\u9AD8
        );
        cxElement.value = "50";
        cyElement.value = "50";
      } else {
        fullside = cv2.getFullSide(
          container_w,
          container_h,
          _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("crtBgObj").width,
          _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("crtBgObj").height
        );
      }
      if (fullside === "X") {
        cxElement.disabled = true;
        cyElement.disabled = false;
        cxElement.style.setProperty("opacity", "0.1");
        cyElement.style.removeProperty("opacity");
      } else {
        cyElement.disabled = true;
        cxElement.disabled = false;
        cyElement.style.setProperty("opacity", "0.1");
        cxElement.style.removeProperty("opacity");
      }
    } else {
      cyElement.disabled = true;
      cxElement.disabled = true;
      cyElement.style.setProperty("opacity", "0.1");
      cxElement.style.setProperty("opacity", "0.1");
    }
  }
}
function updateAutoFreshStatus() {
  updateCheckedElement("autoRefreshInput", _utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("autoRefresh"));
  const autoRefreshTimeElement = document.getElementById("autoRefreshTimeInput");
  if (autoRefreshTimeElement === null || autoRefreshTimeElement === void 0) {
  } else {
    if (!_utils_configs__WEBPACK_IMPORTED_MODULE_1__.confmngr.get("autoRefresh")) {
      autoRefreshTimeElement.disabled = true;
      autoRefreshTimeElement.style.setProperty("background-color", "var(--b3-theme-surface-lighter)");
      autoRefreshTimeElement.style.setProperty("color", "var(--b3-theme-disabled)");
    } else {
      autoRefreshTimeElement.disabled = false;
      autoRefreshTimeElement.style.removeProperty("background-color");
      autoRefreshTimeElement.style.removeProperty("color");
    }
  }
}


//# sourceURL=webpack://plugin-background-cover/./src/ui/settings.ts?`)},"./src/ui/topbar.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addDirectory: () => (/* binding */ addDirectory),
/* harmony export */   addNoteAssetsDirectory: () => (/* binding */ addNoteAssetsDirectory),
/* harmony export */   addSeveralLocalImagesFile: () => (/* binding */ addSeveralLocalImagesFile),
/* harmony export */   initTopbar: () => (/* binding */ initTopbar),
/* harmony export */   pluginOnOff: () => (/* binding */ pluginOnOff),
/* harmony export */   selectPictureByHand: () => (/* binding */ selectPictureByHand),
/* harmony export */   selectPictureRandom: () => (/* binding */ selectPictureRandom)
/* harmony export */ });
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! siyuan */ "siyuan");
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(siyuan__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/logger */ "./src/utils/logger.ts");
/* harmony import */ var _utils_pythonic__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/pythonic */ "./src/utils/pythonic.ts");
/* harmony import */ var _utils_configs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/configs */ "./src/utils/configs.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _services_bgRender__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../services/bgRender */ "./src/services/bgRender.ts");
/* harmony import */ var _topbar__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./topbar */ "./src/ui/topbar.ts");
/* harmony import */ var _notice__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./notice */ "./src/ui/notice.ts");
/* harmony import */ var _fileManager__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./fileManager */ "./src/ui/fileManager.ts");
/* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./settings */ "./src/ui/settings.ts");
var __knownSymbol = (name, symbol) => {
  return (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var __forAwait = (obj, it, method) => (it = obj[__knownSymbol("asyncIterator")]) ? it.call(obj) : (obj = obj[__knownSymbol("iterator")](), it = {}, method = (key, fn) => (fn = obj[key]) && (it[key] = (arg) => new Promise((yes, no, done) => (arg = fn.call(obj, arg), done = arg.done, Promise.resolve(arg.value).then((value) => yes({ value, done }), no)))), method("next"), method("return"), it);











let os = new _utils_pythonic__WEBPACK_IMPORTED_MODULE_2__.OS();
function initTopbar(pluginInstance) {
  return __async(this, null, function* () {
    const topBarElement = pluginInstance.addTopBar({
      icon: "iconLogo",
      title: window.bgCoverPlugin.i18n.addTopBarIcon,
      position: "right",
      callback: () => {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_1__.debug)(\`[topbarUI][initTopbar] click and open toolbar\`);
      }
    });
    topBarElement.addEventListener("click", () => __async(this, null, function* () {
      let rect = topBarElement.getBoundingClientRect();
      if (rect.width === 0) {
        rect = document.querySelector("#barMore").getBoundingClientRect();
      }
      if (rect.width === 0) {
        rect = document.querySelector("#barPlugins").getBoundingClientRect();
      }
      const menu = new siyuan__WEBPACK_IMPORTED_MODULE_0__.Menu("topBarSample", () => {
      });
      menu.addItem({
        icon: "iconIndent",
        label: \`\${window.bgCoverPlugin.i18n.selectPictureLabel}\`,
        type: "submenu",
        submenu: [
          {
            icon: "iconHand",
            label: \`\${window.bgCoverPlugin.i18n.selectPictureManualLabel}\`,
            accelerator: pluginInstance.commands[0].customHotkey,
            click: () => {
              selectPictureByHand();
            }
          },
          {
            icon: "iconMark",
            label: \`\${window.bgCoverPlugin.i18n.selectPictureRandomLabel}\`,
            accelerator: pluginInstance.commands[1].customHotkey,
            click: () => {
              selectPictureRandom(true);
            }
          }
        ]
      });
      let submenu = [
        {
          icon: "iconImage",
          label: \`\${window.bgCoverPlugin.i18n.addSeveralImagesLabel}\`,
          click: () => {
            addSeveralLocalImagesFile();
          }
        },
        {
          icon: "iconFolder",
          label: \`\${window.bgCoverPlugin.i18n.addDirectoryLabel}\`,
          click: () => {
            addDirectory();
          }
        }
        // {
        //     icon: "iconFilesRoot",
        //     label: \`\${window.bgCoverPlugin.i18n.addNoteAssetsDirectoryLabel}\`,
        //     click: () => {
        //         addNoteAssetsDirectory();
        //     }
        // },
      ];
      if (window.bgCoverPlugin.isAndroid && !window.bgCoverPlugin.isBrowser) {
        submenu.unshift(
          {
            icon: "iconSparkles",
            label: \`\${window.bgCoverPlugin.i18n.androidLimitNotice}\`,
            type: "readonly"
          }
        );
      }
      menu.addItem({
        icon: "iconAdd",
        label: \`\${window.bgCoverPlugin.i18n.addImageLabel}\`,
        type: "submenu",
        submenu
      });
      menu.addItem({
        id: "pluginOnOffMenu",
        icon: \`\${_utils_configs__WEBPACK_IMPORTED_MODULE_3__.confmngr.get("activate") ? "iconClose" : "iconSelect"}\`,
        label: \`\${_utils_configs__WEBPACK_IMPORTED_MODULE_3__.confmngr.get("activate") ? window.bgCoverPlugin.i18n.closeBackgroundLabel : window.bgCoverPlugin.i18n.openBackgroundLabel}\`,
        accelerator: pluginInstance.commands[2].customHotkey,
        click: () => {
          _topbar__WEBPACK_IMPORTED_MODULE_6__.pluginOnOff();
        }
      });
      menu.addSeparator();
      menu.addItem({
        icon: "iconGithub",
        label: \`\${window.bgCoverPlugin.i18n.bugReportLabel}\`,
        click: () => {
          _notice__WEBPACK_IMPORTED_MODULE_7__.bugReportDialog();
        }
      });
      menu.addItem({
        icon: "iconSettings",
        label: \`\${window.bgCoverPlugin.i18n.settingLabel}\`,
        click: () => {
          _settings__WEBPACK_IMPORTED_MODULE_9__.openSettingDialog(pluginInstance);
        }
      });
      if (window.bgCoverPlugin.isMobileLayout) {
        menu.fullscreen();
      } else {
        menu.open({
          x: rect.right,
          y: rect.bottom,
          isLeft: true
        });
      }
      ;
    }));
  });
}
;
function pluginOnOff() {
  return __async(this, null, function* () {
    _utils_configs__WEBPACK_IMPORTED_MODULE_3__.confmngr.set("activate", !_utils_configs__WEBPACK_IMPORTED_MODULE_3__.confmngr.get("activate"));
    _utils_configs__WEBPACK_IMPORTED_MODULE_3__.confmngr.save("[topbarUI][pluginOnOff]");
    _services_bgRender__WEBPACK_IMPORTED_MODULE_5__.applySettings();
  });
}
function selectPictureByHand() {
  return __async(this, null, function* () {
    yield _fileManager__WEBPACK_IMPORTED_MODULE_8__.selectPictureDialog();
  });
}
;
function selectPictureRandom(manualPress = false) {
  return __async(this, null, function* () {
    const cacheImgNum = _fileManager__WEBPACK_IMPORTED_MODULE_8__.getCacheImgNum();
    if (cacheImgNum === 0) {
      _services_bgRender__WEBPACK_IMPORTED_MODULE_5__.useDefaultLiaoLiaoBg();
      (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.showMessage)(\`\${window.bgCoverPlugin.i18n.noCachedImg4random}\`, 3e3, "info");
    } else if (cacheImgNum === 1) {
      if (manualPress) {
        (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.showMessage)(\`\${window.bgCoverPlugin.i18n.selectPictureRandomNotice}\`, 3e3, "info");
      }
      let belayerElement = document.getElementById("bglayer");
      if (belayerElement.style.getPropertyValue("background-image") === "") {
        let bgObj = _utils_configs__WEBPACK_IMPORTED_MODULE_3__.confmngr.get("crtBgObj");
        _services_bgRender__WEBPACK_IMPORTED_MODULE_5__.changeBackgroundContent(bgObj.path, bgObj.mode);
      }
    } else {
      let fileidx = _utils_configs__WEBPACK_IMPORTED_MODULE_3__.confmngr.get("fileidx");
      let crt_hash = _utils_configs__WEBPACK_IMPORTED_MODULE_3__.confmngr.get("crtBgObj").hash;
      let r_hash = "";
      while (true) {
        let r = Math.floor(Math.random() * cacheImgNum);
        r_hash = Object.keys(fileidx)[r];
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_1__.debug)(\`[topbarUI][selectPictureRandom] \\u968F\\u673A\\u62BD\\u4E00\\u5F20\\uFF0C\\u4E4B\\u524D\\uFF1A\${crt_hash}\\uFF0C\\u968F\\u673A\\u5230\\uFF1A\${r_hash}\`);
        if (r_hash !== crt_hash) {
          (0,_utils_logger__WEBPACK_IMPORTED_MODULE_1__.debug)(\`[topbarUI][selectPictureRandom] \\u5DF2\\u62BD\\u5230\\u4E0D\\u540C\\u7684\\u80CC\\u666F\\u56FE\${r_hash}\\uFF0C\\u8FDB\\u884C\\u66FF\\u6362\`);
          break;
        }
      }
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_1__.debug)("[topbarUI][selectPictureRandom] \\u8DF3\\u51FA\\u62BD\\u5361\\u6B7B\\u5FAA\\u73AF,\\u524D\\u666F\\u56FE\\u4E3A\\uFF1A", fileidx[r_hash]);
      _services_bgRender__WEBPACK_IMPORTED_MODULE_5__.changeBackgroundContent(fileidx[r_hash].path, fileidx[r_hash].mode);
      _utils_configs__WEBPACK_IMPORTED_MODULE_3__.confmngr.set("crtBgObj", fileidx[r_hash]);
    }
    yield _utils_configs__WEBPACK_IMPORTED_MODULE_3__.confmngr.save("[topbarUI][selectPictureRandom]");
    _settings__WEBPACK_IMPORTED_MODULE_9__.updateSettingPanelElementStatus();
  });
}
function addSeveralLocalImagesFile() {
  return __async(this, null, function* () {
    const cacheImgNum = _fileManager__WEBPACK_IMPORTED_MODULE_8__.getCacheImgNum();
    if (cacheImgNum >= _constants__WEBPACK_IMPORTED_MODULE_4__.cacheMaxNum) {
      (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.showMessage)(window.bgCoverPlugin.i18n.addSingleImageExceed1 + _constants__WEBPACK_IMPORTED_MODULE_4__.cacheMaxNum + window.bgCoverPlugin.i18n.addSingleImageExceed2, 7e3, "error");
    } else {
      const fileHandle = yield os.openFilePicker(_constants__WEBPACK_IMPORTED_MODULE_4__.supportedImageSuffix.toString(), true);
      let lastUploadedBgObj;
      for (const [index, file] of fileHandle.entries()) {
        const isLast = index === fileHandle.length - 1;
        let bgObj = yield _fileManager__WEBPACK_IMPORTED_MODULE_8__.uploadOneImage(file);
        if (bgObj !== void 0) {
          lastUploadedBgObj = bgObj;
          if (isLast) {
            yield _utils_configs__WEBPACK_IMPORTED_MODULE_3__.confmngr.save("[topbarUI][addSeveralLocalImagesFile]");
            _settings__WEBPACK_IMPORTED_MODULE_9__.updateSettingPanelElementStatus();
            _services_bgRender__WEBPACK_IMPORTED_MODULE_5__.changeBackgroundContent(lastUploadedBgObj.path, lastUploadedBgObj.mode);
          }
        }
        ;
      }
    }
    ;
  });
}
;
function addDirectory() {
  return __async(this, null, function* () {
    const cacheImgNum = _fileManager__WEBPACK_IMPORTED_MODULE_8__.getCacheImgNum();
    const fileList = yield os.openFolderPicker();
    let fileContainer = [];
    try {
      for (var iter = __forAwait(fileList), more, temp, error; more = !(temp = yield iter.next()).done; more = false) {
        const file = temp.value;
        const fileName = file.name;
        const [prefix, suffix] = os.splitext(fileName);
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_1__.debug)(\`[topbarUI][addDirectory] \\u5F53\\u524D\\u56FE\\u7247\${fileName}\\u540E\\u7F00\\u4E3A\${suffix}, \\u5B58\\u5728\\u4E8E\\u5141\\u8BB8\\u7684\\u56FE\\u7247\\u540E\\u7F00(\${_constants__WEBPACK_IMPORTED_MODULE_4__.supportedImageSuffix})\\u4E2D\\uFF1A\${_constants__WEBPACK_IMPORTED_MODULE_4__.supportedImageSuffix.includes(\`.\${suffix}\`)}\`);
        if (_constants__WEBPACK_IMPORTED_MODULE_4__.supportedImageSuffix.includes(\`.\${suffix}\`)) {
          let md5 = yield _fileManager__WEBPACK_IMPORTED_MODULE_8__.imgExistsInCache(file, false);
          if (md5 !== "exists") {
            fileContainer.push(file);
          } else {
            (0,_utils_logger__WEBPACK_IMPORTED_MODULE_1__.debug)(\`[topbarUI][addDirectory] \\u5F53\\u524D\\u56FE\\u7247\${fileName}md5\\u4E3A\${md5}, \\u5B58\\u5728\\u4E8E\\u7F13\\u5B58\\u4E2D\`);
          }
        }
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_1__.debug)(\`[topbarUI][addDirectory] fileContainer\`, fileContainer);
        if (fileContainer.length >= _constants__WEBPACK_IMPORTED_MODULE_4__.cacheMaxNum - cacheImgNum) {
          (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.showMessage)(window.bgCoverPlugin.i18n.addDirectoryLabelError1 + _constants__WEBPACK_IMPORTED_MODULE_4__.cacheMaxNum + window.bgCoverPlugin.i18n.addDirectoryLabelError2, 7e3, "error");
          break;
        }
      }
    } catch (temp) {
      error = [temp];
    } finally {
      try {
        more && (temp = iter.return) && (yield temp.call(iter));
      } finally {
        if (error)
          throw error[0];
      }
    }
    if (fileContainer.length >= 30) {
      (0,siyuan__WEBPACK_IMPORTED_MODULE_0__.confirm)(
        window.bgCoverPlugin.i18n.addDirectoryLabelConfirmTitle,
        \`\${window.bgCoverPlugin.i18n.addDirectoryLabelConfirm1} \${fileContainer.length} \${window.bgCoverPlugin.i18n.addDirectoryLabelConfirm2}\`,
        () => __async(this, null, function* () {
          yield _fileManager__WEBPACK_IMPORTED_MODULE_8__.batchUploadImages(fileContainer, true);
        })
      );
    } else {
      yield _fileManager__WEBPACK_IMPORTED_MODULE_8__.batchUploadImages(fileContainer, true);
    }
  });
}
function addNoteAssetsDirectory() {
  return __async(this, null, function* () {
    (0,_notice__WEBPACK_IMPORTED_MODULE_7__.showNotImplementDialog)();
    return;
    const selectedPath = yield fileManagerUI.openAssetsFolderPickerDialog();
    if (selectedPath) {
      debug(\`[topbarUI][addNoteAssetsDirectory] User selected folder: \${selectedPath}\`);
      showMessage(\`\\u5DF2\\u9009\\u62E9\\u6587\\u4EF6\\u5939: \${selectedPath}\`);
    } else {
      debug("[topbarUI][addNoteAssetsDirectory] User cancelled folder selection.");
    }
  });
}


//# sourceURL=webpack://plugin-background-cover/./src/ui/topbar.ts?`)},"./src/utils/api.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseApi: () => (/* binding */ BaseApi),
/* harmony export */   KernelApi: () => (/* binding */ KernelApi)
/* harmony export */ });
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logger */ "./src/utils/logger.ts");
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! siyuan */ "siyuan");
/* harmony import */ var siyuan__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(siyuan__WEBPACK_IMPORTED_MODULE_1__);
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};


const siyuanApiUrl = "";
const siyuanApiToken = "";
class BaseApi {
  /**
   * \u5411\u601D\u6E90\u8BF7\u6C42\u6570\u636E
   *
   * @param url - url
   * @param data - \u6570\u636E
   */
  siyuanRequest(url, data) {
    return __async(this, null, function* () {
      const reqUrl = \`\${siyuanApiUrl}\${url}\`;
      const fetchOps = {
        body: JSON.stringify(data),
        method: "POST"
      };
      if (siyuanApiToken !== "") {
        Object.assign(fetchOps, {
          headers: {
            Authorization: \`Token \${siyuanApiToken}\`
          }
        });
      }
      (0,_logger__WEBPACK_IMPORTED_MODULE_0__.debug)("\\u5F00\\u59CB\\u5411\\u601D\\u6E90\\u8BF7\\u6C42\\u6570\\u636E\\uFF0CreqUrl=>", reqUrl);
      (0,_logger__WEBPACK_IMPORTED_MODULE_0__.debug)("\\u5F00\\u59CB\\u5411\\u601D\\u6E90\\u8BF7\\u6C42\\u6570\\u636E\\uFF0CfetchOps=>", fetchOps);
      const response = yield fetch(reqUrl, fetchOps);
      const resJson = yield response.json();
      (0,_logger__WEBPACK_IMPORTED_MODULE_0__.debug)("\\u601D\\u6E90\\u8BF7\\u6C42\\u6570\\u636E\\u8FD4\\u56DE\\uFF0CresJson=>", resJson);
      if (resJson.code === -1) {
        throw new Error(resJson.msg);
      }
      return resJson;
    });
  }
}
class KernelApi extends BaseApi {
  /**
   * \u5217\u51FA\u7B14\u8BB0\u672C
   */
  lsNotebooks() {
    return __async(this, null, function* () {
      return yield this.siyuanRequest("/api/notebook/lsNotebooks", {});
    });
  }
  /**
   * \u6253\u5F00\u7B14\u8BB0\u672C
   *
   * @param notebookId - \u7B14\u8BB0\u672CID
   */
  openNotebook(notebookId) {
    return __async(this, null, function* () {
      return yield this.siyuanRequest("/api/notebook/openNotebook", {
        notebook: notebookId
      });
    });
  }
  /**
   * \u5217\u51FA\u6587\u4EF6
   *
   * @param path - \u8DEF\u5F84
   */
  readDir(path) {
    return __async(this, null, function* () {
      return yield this.siyuanRequest("/api/file/readDir", {
        path
      });
    });
  }
  /**
   * \u5199\u5165\u6587\u4EF6
   *
   * @param path - \u6587\u4EF6\u8DEF\u5F84\uFF0C\u4F8B\u5982\uFF1A/data/20210808180117-6v0mkxr/20200923234011-ieuun1p.sy
   * @param file - \u4E0A\u4F20\u7684\u6587\u4EF6
   */
  putFile(path, file) {
    const formData = new FormData();
    formData.append("path", path);
    formData.append("isDir", "false");
    formData.append("modTime", Math.floor(Date.now() / 1e3).toString());
    formData.append("file", file);
    return new Promise((resolve, reject) => {
      (0,siyuan__WEBPACK_IMPORTED_MODULE_1__.fetchPost)("/api/file/putFile", formData, (data) => {
        if (data.code === 0) {
          resolve(data);
        } else {
          reject(data);
        }
      });
    });
  }
  putFolder(path) {
    const formData = new FormData();
    formData.append("path", path);
    formData.append("isDir", "true");
    formData.append("modTime", Math.floor(Date.now() / 1e3).toString());
    return new Promise((resolve, reject) => {
      (0,siyuan__WEBPACK_IMPORTED_MODULE_1__.fetchPost)("/api/file/putFile", formData, (data) => {
        if (data.code === 0) {
          resolve(data);
        } else {
          reject(data);
        }
      });
    });
  }
  saveTextData(fileName, data) {
    return __async(this, null, function* () {
      return new Promise((resolve) => {
        const pathString = \`/temp/convert/pandoc/\${fileName}\`;
        const file = new File([new Blob([data])], pathString.split("/").pop());
        const formData = new FormData();
        formData.append("path", pathString);
        formData.append("file", file);
        formData.append("isDir", "false");
        (0,siyuan__WEBPACK_IMPORTED_MODULE_1__.fetchPost)("/api/file/putFile", formData, (response) => {
          resolve(response);
        });
      });
    });
  }
  /**
   * \u8F6C\u6362\u670D\u52A1
   *
   * @param from - \u539F\u59CB\u6587\u4EF6\u540D\uFF0C\u4E0D\u5305\u62EC\u8DEF\u5F84\uFF0C\u8DEF\u5F84\u5FC5\u987B\u653E\u5728 /temp/convert/pandoc
   * @param to - \u8F6C\u6362\u540E\u7684\u6587\u4EF6\u540D\uFF0C\u4E0D\u5305\u62EC\u8DEF\u5F84\uFF0C\u8DEF\u5F84\u76F8\u5BF9\u4E8E /temp/convert/pandoc
   */
  // public async convertPandoc(from: string, to: string): Promise<SiyuanData> {
  //   const params = {
  //     args: [
  //       "--to",
  //       "markdown_github-raw_html+tex_math_dollars+pipe_tables",
  //       from,
  //       "-o",
  //       to,
  //       "--extract-media",
  //       \`\${mediaDir}/\${shortHash(from).toLowerCase()}\`,
  //       "--wrap=none",
  //     ],
  //   }
  //   return await this.siyuanRequest("/api/convert/pandoc", params)
  // }
  // public async convertPandocCustom(args: string[]): Promise<SiyuanData> {
  //   const params = {
  //     args: args,
  //   }
  //   return await this.siyuanRequest("/api/convert/pandoc", params)
  // }
  /**
   * \u8BFB\u53D6\u6587\u4EF6
   *
   * @param path - \u6587\u4EF6\u8DEF\u5F84\uFF0C\u4F8B\u5982\uFF1A/data/20210808180117-6v0mkxr/20200923234011-ieuun1p.sy
   * @param type - \u7C7B\u578B
   */
  getFile(path, type) {
    return __async(this, null, function* () {
      const response = yield fetch(\`\${siyuanApiUrl}/api/file/getFile\`, {
        method: "POST",
        headers: {
          Authorization: \`Token \${siyuanApiToken}\`
        },
        body: JSON.stringify({
          path
        })
      });
      if (response.status === 200) {
        if (type === "text") {
          return yield response.text();
        }
        if (type === "json") {
          return (yield response.json()).data;
        }
      }
      return null;
    });
  }
  /**
   * \u5220\u9664\u6587\u4EF6
   *
   * @param path - \u8DEF\u5F84
   */
  removeFile(path) {
    return __async(this, null, function* () {
      const params = {
        path
      };
      return yield this.siyuanRequest("/api/file/removeFile", params);
    });
  }
  /**
   * \u901A\u8FC7 Markdown \u521B\u5EFA\u6587\u6863
   *
   * @param notebook - \u7B14\u8BB0\u672C
   * @param path - \u8DEF\u5F84
   * @param md - md
   */
  createDocWithMd(notebook, path, md) {
    return __async(this, null, function* () {
      const params = {
        notebook,
        path,
        markdown: md
      };
      return yield this.siyuanRequest("/api/filetree/createDocWithMd", params);
    });
  }
  /**
   * \u5BFC\u5165 Markdown \u6587\u4EF6
   *
   * @param localPath - \u672C\u5730 MD \u6587\u6863\u7EDD\u5BF9\u8DEF\u5F84
   * @param notebook - \u7B14\u8BB0\u672C
   * @param path - \u8DEF\u5F84
   */
  // public async importStdMd(localPath, notebook: string, path: string): Promise<SiyuanData> {
  //   const params = {
  //     // Users/terwer/Documents/mydocs/SiYuanWorkspace/public/temp/convert/pandoc/\u897F\u8499\u5B66\u4E60\u6CD5\uFF1A\u5982\u4F55\u5728\u77ED\u65F6\u95F4\u5185\u5FEB\u901F\u5B66\u4F1A\u65B0\u77E5\u8BC6-\u53CB\u8363\u65B9\u7565.md
  //     localPath: localPath,
  //     notebook: notebook,
  //     toPath: path,
  //   }
  //   return await this.siyuanRequest("/api/import/importStdMd", params)
  // }
  getInstalledTheme() {
    return __async(this, null, function* () {
      return yield this.siyuanRequest("api/bazaar/getInstalledTheme", {});
    });
  }
  getLocalStorage(key) {
    return __async(this, null, function* () {
      const response = yield this.siyuanRequest("/api/storage/getLocalStorage", {});
      if (response.code !== 0) {
        throw new Error(\`\\u83B7\\u53D6\\u5B58\\u50A8\\u5931\\u8D25: \${response.msg}\`);
      }
      const storageData = response.data;
      if (key === void 0) {
        return storageData;
      }
      if (!(key in storageData)) {
        return void 0;
      }
      return storageData[key];
    });
  }
  /**
   * \u66F4\u65B0\u601D\u6E90\u7B14\u8BB0\u672C\u5730\u5B58\u50A8\u4E2D\u7684\u6307\u5B9A\u952E\u503C
   * @param key \u8981\u66F4\u65B0\u7684\u952E\u540D
   * @param value \u8981\u8BBE\u7F6E\u7684\u503C
   */
  setLocalStorage(key, value) {
    return __async(this, null, function* () {
      let currentStorage = {};
      try {
        const response = yield this.getLocalStorage();
        currentStorage = response || {};
      } catch (e) {
        console.warn("\\u83B7\\u53D6\\u5F53\\u524D\\u5B58\\u50A8\\u5931\\u8D25\\uFF0C\\u5C06\\u4F7F\\u7528\\u7A7A\\u5BF9\\u8C61", e);
      }
      const updatedStorage = __spreadProps(__spreadValues({}, currentStorage), {
        [key]: value
      });
      const setResponse = yield this.siyuanRequest("/api/storage/setLocalStorage", {
        // key: "", // \u6CE8\u610F: \u601D\u6E90API\u53EF\u80FD\u9700\u8981\u7A7Akey\u8868\u793A\u6574\u4E2A\u5B58\u50A8
        val: updatedStorage
      });
      if (setResponse.code !== 0) {
        throw new Error(\`\\u5B58\\u50A8\\u66F4\\u65B0\\u5931\\u8D25: \${setResponse.msg}\`);
      }
    });
  }
}


//# sourceURL=webpack://plugin-background-cover/./src/utils/api.ts?`)},"./src/utils/configs.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   confmngr: () => (/* binding */ confmngr)
/* harmony export */ });
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/logger */ "./src/utils/logger.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types */ "./src/types.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _utils_api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/api */ "./src/utils/api.ts");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};




let ka = new _utils_api__WEBPACK_IMPORTED_MODULE_3__.KernelApi();
class configManager {
  constructor() {
    // \u7F13\u5B58\u88AB\u4FEE\u6539\u7684key\uFF0C\u7528\u4E8E\u6309\u9700\u4FDD\u5B58
    this.changedKeys = /* @__PURE__ */ new Set();
    // saved locally to /data/storage/local.json by localStorage API
    // \u652F\u6301\u4E0D\u540C\u8BBE\u5907\u4E4B\u95F4\u7684\u4E0D\u540C\u914D\u7F6E
    this.localCfg = structuredClone(_types__WEBPACK_IMPORTED_MODULE_1__.defaultLocalConfigs);
    // saved publically to /data/publish/{plugin-name}/{cst.pluginFileIdx}
    // \u5B58\u50A8\u7528\u6237\u4E0A\u4F20\u7684public\u4E2D\u7684\u6570\u636E\u5E93\u6587\u4EF6
    // \u7528\u4E8E\u6570\u636E\u91CD\u5EFA\u548C\u7D22\u5F15
    this.syncCfg = structuredClone(_types__WEBPACK_IMPORTED_MODULE_1__.defaultSyncConfigs);
  }
  // \u867D\u7136\u8FD9\u8FB9\u5206\u6210\u4E86LocalConfig\u548CSyncConfig\uFF0C\u5B58\u50A8\u5230\u4E0D\u540C\u7684\u56FE\u7247\u8DEF\u5F84\u4E0B
  // \u4F46\u662F\u5E0C\u671B\u8FD9\u4E2AconfigManger\u7684api, \u80FD\u63D0\u4F9B\u4E00\u4E2A\u826F\u597D\u4E14\u65E0\u611F\u7684\u8BFB\u5199\u4F53\u9A8C
  // \u76F4\u63A5\u8BBE\u7F6Econfig['key']\u7684\u503C\uFF0C\u81EA\u52A8\u5904\u7406\u4FDD\u5B58\u4E3Alocal\u8FD8\u662Fsync
  setParent(plugin) {
    this.plugin = plugin;
  }
  get(key) {
    var _a, _b;
    if (key in this.localCfg) {
      return (_a = this.localCfg) == null ? void 0 : _a[key];
    } else if (key in this.syncCfg) {
      return (_b = this.syncCfg) == null ? void 0 : _b[key];
    } else {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.info)(\`\\u5B58\\u50A8\\u952E "\${key}" \\u4E0D\\u5B58\\u5728\`);
      return null;
    }
  }
  set(key, value) {
    if (key in this.localCfg) {
      this.localCfg[key] = value;
      this.changedKeys.add(key);
    } else if (key in this.syncCfg) {
      this.syncCfg[key] = value;
      this.changedKeys.add(key);
    } else {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.info)(\`\\u5B58\\u50A8\\u952E "\${key}" \\u4E0D\\u5B58\\u5728\\u4E8E\\u9ED8\\u8BA4\\u914D\\u7F6E\\u4E2D\`);
    }
  }
  // \u79FB\u9664\u952E\u503C\u5BF9
  remove(key) {
    if (key in this.localCfg) {
      delete this.localCfg[key];
      this.changedKeys.add(key);
    } else if (key in this.syncCfg) {
      delete this.syncCfg[key];
      this.changedKeys.add(key);
    } else {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.info)(\`\\u5B58\\u50A8\\u952E "\${key}" \\u4E0D\\u5B58\\u5728\\u4E8E\\u9ED8\\u8BA4\\u914D\\u7F6E\\u4E2D\`);
    }
  }
  reset() {
    return __async(this, null, function* () {
      this.localCfg = structuredClone(_types__WEBPACK_IMPORTED_MODULE_1__.defaultLocalConfigs);
      this.syncCfg = structuredClone(_types__WEBPACK_IMPORTED_MODULE_1__.defaultSyncConfigs);
      Object.keys(_types__WEBPACK_IMPORTED_MODULE_1__.defaultLocalConfigs).forEach((k) => this.changedKeys.add(k));
      Object.keys(_types__WEBPACK_IMPORTED_MODULE_1__.defaultSyncConfigs).forEach((k) => this.changedKeys.add(k));
      yield this.save("[configs][reset]");
    });
  }
  /**
   * \u5BFC\u5165\u7684\u65F6\u5019\uFF0C\u9700\u8981\u5148\u52A0\u8F7D\u8BBE\u7F6E\uFF1B\u5982\u679C\u6CA1\u6709\u8BBE\u7F6E\uFF0C\u5219\u4F7F\u7528\u9ED8\u8BA4\u8BBE\u7F6E
   */
  load() {
    return __async(this, null, function* () {
      yield this._loadLocalCfg();
      yield this._loadSyncCfg();
    });
  }
  _loadLocalCfg() {
    return __async(this, null, function* () {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`[configs][_loadLocalCfg] \\u8BFB\\u53D6localStorage\\u4E2D\\u7684\\u63D2\\u4EF6\\u914D\\u7F6E\\u4FE1\\u606F\`);
      let loaded = yield ka.getLocalStorage(_constants__WEBPACK_IMPORTED_MODULE_2__.localStorageKey);
      if (loaded == null || loaded == void 0 || loaded == "") {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`localStorage\\u4E2D\\u6CA1\\u6709\\u63D2\\u4EF6\\u914D\\u7F6E\\u4FE1\\u606F\\uFF0C\\u4F7F\\u7528\\u9ED8\\u8BA4\\u914D\\u7F6E\\u5E76\\u4FDD\\u5B58\`);
        this._saveLocalCfg("[configs][localStorage init config]");
      } else {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`\\u8BFB\\u5165localStorage\\u914D\\u7F6E siyuan.storage[\${_constants__WEBPACK_IMPORTED_MODULE_2__.localStorageKey}]\`);
        if (typeof loaded === "string") {
          loaded = JSON.parse(loaded);
        }
        try {
          for (let key in loaded) {
            if (key in _types__WEBPACK_IMPORTED_MODULE_1__.defaultLocalConfigs) {
              this.set(key, loaded[key]);
            }
          }
          (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`   localStorage\\u914D\\u7F6E \\u8BFB\\u53D6\\u6210\\u529F: \`, loaded);
        } catch (error_msg) {
          (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.error)(\`   localStorage\\u914D\\u7F6E \\u8BFB\\u53D6\\u5931\\u8D25: \${error_msg}\`);
        }
      }
    });
  }
  _loadSyncCfg() {
    return __async(this, null, function* () {
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`[configs][_loadFileIdx] \\u8BFB\\u53D6 /data/publish/\\u63D2\\u4EF6\\u76EE\\u5F55/ \\u4E2D\\u7684\\u80CC\\u666F\\u6587\\u4EF6\\u7D22\\u5F15\\u4FE1\\u606F\`);
      let loaded = yield this.plugin.loadData(_constants__WEBPACK_IMPORTED_MODULE_2__.synConfigFile);
      (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\` synconfig.json \\u539F\\u59CB\\u8BFB\\u53D6\\u6570\\u636E\\uFF1A\`, loaded);
      if (loaded == null || loaded == void 0 || loaded == "") {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`/data/publish/\\u63D2\\u4EF6\\u76EE\\u5F55/ \\u4E2D\\u6CA1\\u6709 synconfig.json \\u914D\\u7F6E\\u6587\\u4EF6\\uFF0C\\u4F7F\\u7528\\u9ED8\\u8BA4\\u914D\\u7F6E\`);
        this._saveSyncCfg("[configs][synconfig.json init to default]");
      } else {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`\\u8BFB\\u5165 \${_constants__WEBPACK_IMPORTED_MODULE_2__.synConfigFile} \\u914D\\u7F6E\\u6587\\u4EF6\`);
        if (typeof loaded === "string") {
          loaded = JSON.parse(loaded);
        }
        try {
          for (let key in loaded) {
            if (key in _types__WEBPACK_IMPORTED_MODULE_1__.defaultSyncConfigs) {
              this.set(key, loaded[key]);
            }
          }
          (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`   synconfig.json \\u914D\\u7F6E\\u6587\\u4EF6\\u8BFB\\u53D6\\u6210\\u529F: \`, loaded);
        } catch (error_msg) {
          (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.error)(\`   synconfig.json \\u914D\\u7F6E\\u6587\\u4EF6\\u8BFB\\u53D6\\u5931\\u8D25: \${error_msg}\`);
        }
      }
    });
  }
  save(logHeader) {
    return __async(this, null, function* () {
      if (this.changedKeys.size === 0) {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`\${logHeader} No configuration changes, skipping save.\`);
        return;
      }
      let needsLocalSave = false;
      let needsSyncSave = false;
      for (const key of this.changedKeys) {
        if (key in _types__WEBPACK_IMPORTED_MODULE_1__.defaultLocalConfigs)
          needsLocalSave = true;
        if (key in _types__WEBPACK_IMPORTED_MODULE_1__.defaultSyncConfigs)
          needsSyncSave = true;
      }
      if (needsLocalSave) {
        yield this._saveLocalCfg(logHeader);
      }
      if (needsSyncSave) {
        yield this._saveSyncCfg(logHeader);
      }
      this.changedKeys.clear();
    });
  }
  _saveLocalCfg(logHeader) {
    return __async(this, null, function* () {
      let json = this.localCfg;
      if (logHeader) {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`\${logHeader}\\u5199\\u5165Local\\u914D\\u7F6E\\u6587\\u4EF6:\`, json);
      } else {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`\\u5199\\u5165Local\\u914D\\u7F6E\\u6587\\u4EF6:\`, json);
      }
      yield ka.setLocalStorage(_constants__WEBPACK_IMPORTED_MODULE_2__.localStorageKey, json);
    });
  }
  _saveSyncCfg(logHeader) {
    return __async(this, null, function* () {
      let json = this.syncCfg;
      if (logHeader) {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`\${logHeader}\\u5199\\u5165Sync\\u914D\\u7F6E\\u6587\\u4EF6\${_constants__WEBPACK_IMPORTED_MODULE_2__.synConfigFile}:\`, json);
      } else {
        (0,_utils_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`\\u5199\\u5165Sync\\u914D\\u7F6E\\u6587\\u4EF6\${_constants__WEBPACK_IMPORTED_MODULE_2__.synConfigFile}:\`, json);
      }
      this.plugin.saveData(_constants__WEBPACK_IMPORTED_MODULE_2__.synConfigFile, json);
    });
  }
}
const confmngr = new configManager();


//# sourceURL=webpack://plugin-background-cover/./src/utils/configs.ts?`)},"./src/utils/logger.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debug: () => (/* binding */ debug),
/* harmony export */   error: () => (/* binding */ error),
/* harmony export */   info: () => (/* binding */ info),
/* harmony export */   warn: () => (/* binding */ warn)
/* harmony export */ });
function getTimestamp() {
  const now = /* @__PURE__ */ new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
  return \`[\${hours}:\${minutes}:\${seconds}.\${milliseconds}]\`;
}
function info(...msg) {
  console.log(\`[BgCover Plugin]\${getTimestamp()} [INFO]\`, ...msg);
}
function debug(...msg) {
  if (window.bgCoverPlugin.isDev) {
    console.log(\`[BgCover Plugin]\${getTimestamp()}[DEBUG]\`, ...msg);
  }
}
function error(...msg) {
  console.error(\`[BgCover Plugin]\${getTimestamp()}[ERROR]\`, ...msg);
}
function warn(...msg) {
  console.warn(\`[BgCover Plugin]\${getTimestamp()} [WARN]\`, ...msg);
}


//# sourceURL=webpack://plugin-background-cover/./src/utils/logger.ts?`)},"./src/utils/pythonic.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CloseCV: () => (/* binding */ CloseCV),
/* harmony export */   Numpy: () => (/* binding */ Numpy),
/* harmony export */   OS: () => (/* binding */ OS)
/* harmony export */ });
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logger */ "./src/utils/logger.ts");
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./api */ "./src/utils/api.ts");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};


class Numpy {
  merge(array1, array2) {
    let mergedElement = [.../* @__PURE__ */ new Set([...array1, ...array2])];
    return mergedElement;
  }
}
class CloseCV {
  getImageSize(imgPath) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imgPath;
      img.onload = () => {
        const { naturalWidth, naturalHeight } = img;
        resolve({ width: naturalWidth, height: naturalHeight });
      };
      img.onerror = () => {
        reject(new Error("\\u65E0\\u6CD5\\u52A0\\u8F7D\\u56FE\\u50CF"));
      };
    });
  }
  getFullSide(container_w, container_h, img_w, img_h) {
    const container_ratio = container_w / container_h;
    const img_ratio = img_w / img_h;
    let fullside = "";
    if (container_ratio > img_ratio) {
      fullside = "X";
    } else {
      fullside = "Y";
    }
    (0,_logger__WEBPACK_IMPORTED_MODULE_0__.debug)(\`container W:H = [\${container_w} / \${container_h} = \${container_ratio}], image W:H = [\${img_w} / \${img_h} = \${img_ratio}], fullsize = \${fullside}\`);
    return fullside;
  }
}
class OS {
  constructor() {
    this.ka = new _api__WEBPACK_IMPORTED_MODULE_1__.KernelApi();
  }
  rmtree(dir) {
    return __async(this, null, function* () {
      let out = yield this.listdir(dir);
      for (let i in out) {
        let item = out[i];
        if (item.isDir) {
          this.rmtree(\`\${dir}/\${item.name}/\`);
        } else {
          let full_path = \`\${dir}/\${item.name}\`;
          yield this.ka.removeFile(full_path);
        }
      }
      if (dir.slice(-1) === "/") {
        yield this.ka.removeFile(dir);
      } else {
        yield this.ka.removeFile(dir + "/");
      }
    });
  }
  listdir(dir) {
    return __async(this, null, function* () {
      var outArray;
      let out = yield this.ka.readDir(dir);
      if (out !== null || out !== void 0) {
        (0,_logger__WEBPACK_IMPORTED_MODULE_0__.debug)("[os.listdir] out.data ->", out.data);
        outArray = out.data;
      }
      return outArray;
    });
  }
  /**
   * \u5224\u65AD\u6587\u4EF6\u5939\u662F\u5426\u5B58\u5728
   * @param dir \u6587\u4EF6\u5939\u8DEF\u5F84
   * @returns \u5B58\u5728\u8FD4\u56DEtrue\uFF0C\u4E0D\u5B58\u5728\u8FD4\u56DEfalse
   */
  folderExists(dir) {
    return __async(this, null, function* () {
      try {
        const out = yield this.ka.readDir(dir);
        if (out && out.code === 0) {
          return true;
        }
        if (out && out.code === 404) {
          return false;
        }
        return false;
      } catch (error2) {
        (0,_logger__WEBPACK_IMPORTED_MODULE_0__.debug)("[os.pathExists] error:", error2);
        return false;
      }
    });
  }
  mkdir(dir) {
    return __async(this, null, function* () {
      try {
        const out = yield this.ka.putFolder(dir);
        if (out && out.code === 0) {
          return true;
        }
        if (out && out.code === 404) {
          return false;
        }
        return false;
      } catch (error2) {
        (0,_logger__WEBPACK_IMPORTED_MODULE_0__.debug)("[os.pathExists] error:", error2);
        return false;
      }
    });
  }
  splitext(filename) {
    let suffix = filename.substring(filename.lastIndexOf(".") + 1, filename.length) || filename;
    let prefix = filename.substring(0, filename.lastIndexOf(".")) || filename;
    return [prefix, suffix];
  }
  /**
   * The function to open a localhost file url to File object
   * @param url 
   * @param fileName 
   * @param fileType 
   * @returns File
   * Example:
   * >>> const url = 'https://example.com/path/to/file.txt'; // Replace with your desired URL
   * >>> const fileName = 'file.txt'; // Replace with the desired file name
   * >>> const fileType = 'text/plain'; // Replace with the desired file type
   * 
   * openFile(url, fileName, fileType)
      .then((file) => {
          if (file) {
          // File-like object is created, you can now use it
          console.log('File:', file);
          } else {
          console.log('File could not be fetched.');
          }
      })
      .catch((error) => {
          console.error('Error:', error);
      });
   */
  openFile(url, fileName, fileType) {
    return __async(this, null, function* () {
      try {
        const response = yield fetch(url);
        const data = yield response.blob();
        const file = new File([data], fileName, { type: fileType });
        return file;
      } catch (error2) {
        console.error("Error fetching the file:", error2);
        return null;
      }
    });
  }
  /**
   * 
   * @param acceptedFileTypes : '.jpg,.png'
   * @returns 
   */
  openFilePicker(acceptedFileTypes, multipleSelect = false) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = multipleSelect;
        input.value = "";
        if (acceptedFileTypes) {
          input.accept = acceptedFileTypes;
        }
        input.addEventListener("change", () => {
          if (input.files) {
            resolve(Array.from(input.files));
          } else {
            reject(new Error("No file selected"));
          }
        });
        input.click();
      });
    });
  }
  openFolderPicker() {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.webkitdirectory = true;
        input.multiple = true;
        input.value = "";
        input.addEventListener("change", () => {
          if (input.files && input.files.length > 0) {
            const file = input.files[0];
            resolve(Array.from(input.files));
          } else {
            reject(new Error("No folder selected"));
          }
        });
        input.click();
      });
    });
  }
}


//# sourceURL=webpack://plugin-background-cover/./src/utils/pythonic.ts?`)},"./src/utils/theme.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getCurrentThemeInfo: () => (/* binding */ getCurrentThemeInfo),
/* harmony export */   getInstalledThemes: () => (/* binding */ getInstalledThemes)
/* harmony export */ });
function getCurrentThemeInfo() {
  const themeMode = window.siyuan.config.appearance.mode;
  let themeName = "";
  if (themeMode === 0) {
    themeName = window.siyuan.config.appearance.themeLight;
  } else {
    themeName = window.siyuan.config.appearance.themeDark;
  }
  return [themeMode, themeName];
}
function getInstalledThemes() {
  const lightThemes = window.siyuan.config.appearance.lightThemes;
  const darkThemes = window.siyuan.config.appearance.darkThemes;
  return [lightThemes, darkThemes];
}


//# sourceURL=webpack://plugin-background-cover/./src/utils/theme.ts?`)},siyuan:e=>{e.exports=require("siyuan")}},__webpack_module_cache__={};function __webpack_require__(e){var n=__webpack_module_cache__[e];if(n!==void 0)return n.exports;var t=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e](t,t.exports,__webpack_require__),t.exports}__webpack_require__.n=e=>{var n=e&&e.__esModule?()=>e.default:()=>e;return __webpack_require__.d(n,{a:n}),n},__webpack_require__.d=(e,n)=>{for(var t in n)__webpack_require__.o(n,t)&&!__webpack_require__.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:n[t]})},__webpack_require__.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),__webpack_require__.r=e=>{typeof Symbol<"u"&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var __webpack_exports__=__webpack_require__("./src/index.ts");module.exports=__webpack_exports__})();
