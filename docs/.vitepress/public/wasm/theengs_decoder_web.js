// This code implements the `-sMODULARIZE` settings by taking the generated
// JS program code (INNER_JS_CODE) and wrapping it in a factory function.

// When targeting node and ES6 we use `await import ..` in the generated code
// so the outer function needs to be marked as async.
async function createTheengsDecoderModule(moduleArg = {}) {
  var moduleRtn;

// include: shell.js
// include: minimum_runtime_check.js
(function() {
  // "30.0.0" -> 300000
  function humanReadableVersionToPacked(str) {
    str = str.split('-')[0]; // Remove any trailing part from e.g. "12.53.3-alpha"
    var vers = str.split('.').slice(0, 3);
    while(vers.length < 3) vers.push('00');
    vers = vers.map((n, i, arr) => n.padStart(2, '0'));
    return vers.join('');
  }
  // 300000 -> "30.0.0"
  var packedVersionToHumanReadable = n => [n / 10000 | 0, (n / 100 | 0) % 100, n % 100].join('.');

  var TARGET_NOT_SUPPORTED = 2147483647;

  // Note: We use a typeof check here instead of optional chaining using
  // globalThis because older browsers might not have globalThis defined.
  var currentNodeVersion = typeof process !== 'undefined' && process.versions?.node ? humanReadableVersionToPacked(process.versions.node) : TARGET_NOT_SUPPORTED;
  if (currentNodeVersion < TARGET_NOT_SUPPORTED) {
    throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');
  }
  if (currentNodeVersion < 2147483647) {
    throw new Error(`This emscripten-generated code requires node v${ packedVersionToHumanReadable(2147483647) } (detected v${packedVersionToHumanReadable(currentNodeVersion)})`);
  }

  var userAgent = typeof navigator !== 'undefined' && navigator.userAgent;
  if (!userAgent) {
    return;
  }

  var currentSafariVersion = userAgent.includes("Safari/") && !userAgent.includes("Chrome/") && userAgent.match(/Version\/(\d+\.?\d*\.?\d*)/) ? humanReadableVersionToPacked(userAgent.match(/Version\/(\d+\.?\d*\.?\d*)/)[1]) : TARGET_NOT_SUPPORTED;
  if (currentSafariVersion < 150000) {
    throw new Error(`This emscripten-generated code requires Safari v${ packedVersionToHumanReadable(150000) } (detected v${currentSafariVersion})`);
  }

  var currentFirefoxVersion = userAgent.match(/Firefox\/(\d+(?:\.\d+)?)/) ? parseFloat(userAgent.match(/Firefox\/(\d+(?:\.\d+)?)/)[1]) : TARGET_NOT_SUPPORTED;
  if (currentFirefoxVersion < 79) {
    throw new Error(`This emscripten-generated code requires Firefox v79 (detected v${currentFirefoxVersion})`);
  }

  var currentChromeVersion = userAgent.match(/Chrome\/(\d+(?:\.\d+)?)/) ? parseFloat(userAgent.match(/Chrome\/(\d+(?:\.\d+)?)/)[1]) : TARGET_NOT_SUPPORTED;
  if (currentChromeVersion < 85) {
    throw new Error(`This emscripten-generated code requires Chrome v85 (detected v${currentChromeVersion})`);
  }
})();

// end include: minimum_runtime_check.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(moduleArg) => Promise<Module>
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = moduleArg;

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = !!globalThis.window;
var ENVIRONMENT_IS_WORKER = !!globalThis.WorkerGlobalScope;
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = globalThis.process?.versions?.node && globalThis.process?.type != 'renderer';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)


var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

var _scriptName = import.meta.url;

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var readAsync, readBinary;

if (ENVIRONMENT_IS_SHELL) {

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  try {
    scriptDirectory = new URL('.', _scriptName).href; // includes trailing slash
  } catch {
    // Must be a `blob:` or `data:` URL (e.g. `blob:http://site.com/etc/etc`), we cannot
    // infer anything from them.
  }

  if (!(globalThis.window || globalThis.WorkerGlobalScope)) throw new Error('not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)');

  {
// include: web_or_worker_shell_read.js
if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.responseType = 'arraybuffer';
      xhr.send(null);
      return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
    };
  }

  readAsync = async (url) => {
    assert(!isFileURI(url), "readAsync does not work with file:// URLs");
    var response = await fetch(url, { credentials: 'same-origin' });
    if (response.ok) {
      return response.arrayBuffer();
    }
    throw new Error(response.status + ' : ' + response.url);
  };
// end include: web_or_worker_shell_read.js
  }
} else
{
  throw new Error('environment detection error');
}

var out = console.log.bind(console);
var err = console.error.bind(console);

var IDBFS = 'IDBFS is no longer included by default; build with -lidbfs.js';
var PROXYFS = 'PROXYFS is no longer included by default; build with -lproxyfs.js';
var WORKERFS = 'WORKERFS is no longer included by default; build with -lworkerfs.js';
var FETCHFS = 'FETCHFS is no longer included by default; build with -lfetchfs.js';
var ICASEFS = 'ICASEFS is no longer included by default; build with -licasefs.js';
var JSFILEFS = 'JSFILEFS is no longer included by default; build with -ljsfilefs.js';
var OPFS = 'OPFS is no longer included by default; build with -lopfs.js';

var NODEFS = 'NODEFS is no longer included by default; build with -lnodefs.js';

// perform assertions in shell.js after we set up out() and err(), as otherwise
// if an assertion fails it cannot print the message

assert(!ENVIRONMENT_IS_NODE, 'node environment detected but not enabled at build time (add `node` to `-sENVIRONMENT` to enable)');

assert(!ENVIRONMENT_IS_SHELL, 'shell environment detected but not enabled at build time (add `shell` to `-sENVIRONMENT` to enable)');

// end include: shell.js

// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;

if (!globalThis.WebAssembly) {
  err('no native wasm support detected');
}

// Wasm globals

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed' + (text ? ': ' + text : ''));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */
var isFileURI = (filename) => filename.startsWith('file://');

// include: runtime_common.js
// include: runtime_stack_check.js
// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // If the stack ends at address zero we write our cookies 4 bytes into the
  // stack.  This prevents interference with SAFE_HEAP and ASAN which also
  // monitor writes to address zero.
  if (max == 0) {
    max += 4;
  }
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  HEAPU32[((max)>>2)] = 0x02135467;
  HEAPU32[(((max)+(4))>>2)] = 0x89BACDFE;
  // Also test the global address 0 for integrity.
  HEAPU32[((0)>>2)] = 1668509029;
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  // See writeStackCookie().
  if (max == 0) {
    max += 4;
  }
  var cookie1 = HEAPU32[((max)>>2)];
  var cookie2 = HEAPU32[(((max)+(4))>>2)];
  if (cookie1 != 0x02135467 || cookie2 != 0x89BACDFE) {
    abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
  }
  // Also test the global address 0 for integrity.
  if (HEAPU32[((0)>>2)] != 0x63736d65 /* 'emsc' */) {
    abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
  }
}
// end include: runtime_stack_check.js
// include: runtime_exceptions.js
// Base Emscripten EH error class
class EmscriptenEH {}

class EmscriptenSjLj extends EmscriptenEH {}

// end include: runtime_exceptions.js
// include: runtime_debug.js
var runtimeDebug = true; // Switch to false at runtime to disable logging at the right times

// Used by XXXXX_DEBUG settings to output debug messages.
function dbg(...args) {
  if (!runtimeDebug && typeof runtimeDebug != 'undefined') return;
  // TODO(sbc): Make this configurable somehow.  Its not always convenient for
  // logging to show up as warnings.
  console.warn(...args);
}

// Endianness check
(() => {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 0x6373;
  if (h8[0] !== 0x73 || h8[1] !== 0x63) abort('Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)');
})();

function consumedModuleProp(prop) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      set() {
        abort(`Attempt to set \`Module.${prop}\` after it has already been processed.  This can happen, for example, when code is injected via '--post-js' rather than '--pre-js'`);

      }
    });
  }
}

function makeInvalidEarlyAccess(name) {
  return () => assert(false, `call to '${name}' via reference taken before Wasm module initialization`);

}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === 'FS_createPath' ||
         name === 'FS_createDataFile' ||
         name === 'FS_createPreloadedFile' ||
         name === 'FS_preloadFile' ||
         name === 'FS_unlink' ||
         name === 'addRunDependency' ||
         // The old FS has some functionality that WasmFS lacks.
         name === 'FS_createLazyFile' ||
         name === 'FS_createDevice' ||
         name === 'removeRunDependency';
}

function missingLibrarySymbol(sym) {

  // Any symbol that is not included from the JS library is also (by definition)
  // not exported on the Module object.
  unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get() {
        var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
        if (isExportedByForceFilesystem(sym)) {
          msg += '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        abort(msg);
      },
    });
  }
}

// end include: runtime_debug.js
// include: binaryDecode.js
// Prevent Closure from minifying the binaryDecode() function, or otherwise
// Closure may analyze through the WASM_BINARY_DATA placeholder string into this
// function, leading into incorrect results.
/** @noinline */
function binaryDecode(bin) {
  for (var i = 0, l = bin.length, o = new Uint8Array(l), c; i < l; ++i) {
    c = bin.charCodeAt(i);
    o[i] = ~c >> 8 & c; // Recover the null byte in a manner that is compatible with https://crbug.com/453961758
  }
  return o;
}
// end include: binaryDecode.js
var readyPromiseResolve, readyPromiseReject;

// Memory management

var runtimeInitialized = false;



function updateMemoryViews() {
  var b = wasmMemory.buffer;
  HEAP8 = new Int8Array(b);
  HEAP16 = new Int16Array(b);
  HEAPU8 = new Uint8Array(b);
  HEAPU16 = new Uint16Array(b);
  HEAP32 = new Int32Array(b);
  HEAPU32 = new Uint32Array(b);
  HEAPF32 = new Float32Array(b);
  HEAPF64 = new Float64Array(b);
  HEAP64 = new BigInt64Array(b);
  HEAPU64 = new BigUint64Array(b);
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// end include: runtime_common.js
assert(globalThis.Int32Array && globalThis.Float64Array && Int32Array.prototype.subarray && Int32Array.prototype.set,
       'JS engine does not provide full typed array support');

function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  consumedModuleProp('preRun');
  // Begin ATPRERUNS hooks
  callRuntimeCallbacks(onPreRuns);
  // End ATPRERUNS hooks
}

function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;

  checkStackCookie();

  // No ATINITS hooks

  wasmExports['__wasm_call_ctors']();

  // No ATPOSTCTORS hooks
}

function postRun() {
  checkStackCookie();
   // PThreads reuse the runtime from the main thread.

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  consumedModuleProp('postRun');

  // Begin ATPOSTRUNS hooks
  callRuntimeCallbacks(onPostRuns);
  // End ATPOSTRUNS hooks
}

/**
 * @param {string|number=} what
 */
function abort(what) {
  Module['onAbort']?.(what);

  what = `Aborted(${what})`;
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // definition for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject?.(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// show errors on likely calls to FS when it was not included
function fsMissing() {
  abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM');
}
var FS = {
  init: fsMissing,
  createDataFile: fsMissing,
  createPreloadedFile: fsMissing,
  createLazyFile: fsMissing,
  open: fsMissing,
  mkdev: fsMissing,
  registerDevice:  fsMissing,
  analyzePath: fsMissing,
  ErrnoError: fsMissing,
};


function createExportWrapper(name, nargs) {
  return (...args) => {
    assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
    var f = wasmExports[name];
    assert(f, `exported native function \`${name}\` not found`);
    // Only assert for too many arguments. Too few can be valid since the missing arguments will be zero filled.
    assert(args.length <= nargs, `native function \`${name}\` called with ${args.length} args but expects ${nargs}`);
    return f(...args);
  };
}

var wasmBinaryFile;

function findWasmBinary() {
  return binaryDecode(' asm   Ý3`  ` ` ` `|``|` ` ` `~~`\r `~~ ` `\n ```~``~ `| ` |`||`|`|`~|`|`~`|```~`~~`| `~`|~` ~`~~`~`~`~`~~~~ `~~ `~~|`} `~~~~`~~`~~ ` `~` env_embind_register_class env_embind_register_void env_embind_register_bool env_embind_register_integer 	env_embind_register_bigint env_embind_register_float env_embind_register_std_string env_embind_register_std_wstring env_embind_register_emval \renv_embind_register_memory_view env"_embind_register_class_constructor env_embind_register_class_function env	_abort_js  wasi_snapshot_preview1fd_close wasi_snapshot_preview1fd_write wasi_snapshot_preview1fd_seek envemscripten_resize_heap ûù \r     \r\r\r\r\r\r\r\r\r\r\r\r\r\r                   \r !\r""""""""""""\r\r\r\r  #""$$""""\r %& \n\n \r\r \'((	#\r) **+\r ,))--))*).)/01 \r \r002\r\r\r\r\r\r\r\r\r\r			\rp$$AA A ¹memory __wasm_call_ctors \r__getTypeName __indirect_function_table malloc free fflush strerror Áemscripten_stack_get_end emscripten_stack_get_base emscripten_stack_init emscripten_stack_get_free _emscripten_stack_restore _emscripten_stack_alloc emscripten_stack_get_current 	A A#&(*+>E^®­íîðîñïðõò÷úóûôý\n«\rù Òô\r   (×    A ( ê 6A   6 ê Ý AÞ A¤²  AÞ A° AA  AÞ Aò® AAAÿ  A´Þ Aë® AAAÿ  A¨Þ Aé® AA Aÿ AÀÞ Aè­ AA~Aÿÿ AÌÞ Aß­ AA Aÿÿ AØÞ Aü­ AAxAÿÿÿÿ AäÞ Aó­ AA A AðÞ Aº° AAxAÿÿÿÿ AüÞ A±° AA A Aß A§° ABBÿÿÿÿÿÿÿÿÿ  Aß A° AB B A ß A® A A¬ß AÆ± A AÔÂ AÙ°  Aè» AA¿°  A°¼ AAå°  Aü¼ AAô°  A  AÈ½ A A¸  Að½ A Aã¸  A¾ AA¼¸  AÀ¾ AAë´  Aè¾ AAµ  A¿ AA²µ  A¸¿ AAÏµ  Aà¿ AA¹  AÀ AA¦¹  Að½ A Aµ¶  A¾ AA¶  AÀ¾ AA÷¶  Aè¾ AAÕ¶  A¿ AAý·  A¸¿ AAÛ·  A°À AAº·  AØÀ A	A·  AÁ AAõµ  A¨Á AAÍ¹  C A A 6¤ê A A 6¨ê  A A ( ê 6¨ê A A¤ê 6 ê  A¬ê  B# Ak! $    6 (! A   Aj$  ®# AÀk!   $     A;j6P  AÕ® 6L   A 6H   6D   6@  A 6<   ¡ ¢   (H£   (H  (D¤   (D  (@¤   (@  (L  (<¥   (<     A;j6T    (T6¼  A 6¸  (¼!  (¸§ A !   64  A 60    )07x  (x!  (|!   6  A©´ 6   6   6  (!  (!  (!    (6   6    )7   Aj©    6,  A 6(    )(7X  (X!  (\\!	   6t  A® 6p   	6l   6h  (t!\n  (p!  (h!    (l6d   6`    )`7   Aj©    6$  A 6     ) 7  (!\r  (!   \n6´  A¦± 6°   6¬   \r6¨  (°!  (¨!    (¬6¤   6     ) 7   Aj¬   AÀj$ c# Ak! $    6  6 (!  (6  A 6 (     Aj$   9# Ak! $    6 (· ! Aj$   A  A Q# Ak! $    6 (!@ A FAq\r  ¸  A  Aj$ 	 ¹ 	 º 	 »  A # Ak!   6AµÂ # Ak!   6A¸Â # Ak!   6AºÂ (A !   A 6  B 7   ½   l# Ak! $    6 A 6  Aj¿  AjÀ  (Á  ( (  Aj$ á# Aàk! $    6Ü  6Ø  6Ô (Ø! A(j­  (Ô! A#j®  - #!  A(j  ¯ 6$ Aj A$j°  (!@@ (A G AqA GrAqE\r   Aä» ±  A6 Aj A(j² @  AjË A HAqE\r   Aä» ±  A6 A Aq:   ³  Aj  ´  AAq:  A6@ - Aq\r   É  A(jµ  Aàj$ Ã# A k! $  ( ! (!   6  6  6 A 6 ! (! AjÆ ! AjÇ ! (È !	 (!\n AjÉ !A !A !\r     	 \n   \rAq \rAq  A j$ P# Ak! $    6  6  6   ( (¶   Aj$ b# Ak! $    6  6  6  6    ( (¶  ( ¶   Aj$ Ã# A k! $  ( ! (!   6  6  6 A 6 ! (! Aj ! Aj ! ( !	 (!\n Aj !A !A !\r     	 \n   \rAq \rAq  A j$ D# Ak! $    6 (!  A(jAÜ  Aj$  \'# Ak!   6 (! A2:   m# A k! $   :    6  6 (! (!  - :     - Ý 6 (! A j$  \\# Ak!  6 (( !A !A !   !   6   6   ( !    (6   6 [# Ak! $    6  6 (! Ú   ( (ß Ã  Aj$  l# A0k! $   6 (! Aj à   Aj6,  (,) 7   ) 7   Ajá  A0j$ T# Ak! $    6 (! A 6 B 7  Ú  A â  Aj$  E# Ak! $    6  6 ( (ã ! Aj$  <# Ak! $    6 (! ä  Aj$  9# Ak! $    6 (Ï ! Aj$  # Ak!   6AÐÁ <# Ak! $    6 (! ¼  Aj$  	 AÐÁ 	 AìÁ 	 AÂ # Ak!   6 (<# Ak! $    6 (! Ä  Aj$  D# Ak! $    6 (  Â ! Aj$  # Ak!   6A4# Ak! $    6Ã ! Aj$  # Ak!   6AÄÂ # Ak!   6 (	 AÀÂ 7# Ak!   6 (! AÜ 6  A6 A\n6 Ý\n# A0k! $    6,  6(  6$ ((Ê ! (,! (! ( !  Auj!@@ AqE\r  (  j( !	 !	 	!\n ($! Aj Ë  Aj  Aj \n   AjÌ ! AjÉ  AjÉ  A0j$  # Ak!   6A4# Ak! $    6Í ! Aj$  # Ak!   6AÃ c# Ak! $    6A ! (! ( !  (6  6   6 (! Aj$  # Ak!   6 (J# Ak! $    6  6   (Aj (( Ð  Aj$ # Ak! $    6  (Î A tAj 6 (Î ! ( 6  (Aj! (Ï ! (Î A t!@ E\r    ü\n   (! Aj$  	 AÈÂ 9# Ak! $    6 (Ñ ! Aj$  ?# Ak! $    6 (Ò Ó ! Aj$  \\# Ak! $    6  6  6 (! Ú   ( (Ã  Aj$  a# Ak! $    6 (!@@ Ô AqE\r  Õ ! Ö ! ! Aj$  a# Ak! $    6 (!@@ Ô AqE\r  × ! Ø ! ! Aj$  # Ak!   6 (8# Ak!   6 (- Av!A ! Aÿq AÿqGAq# Ak!   6 ((\'# Ak!   6 (- Aÿ qAÿq# Ak!   6 (( 9# Ak! $    6 (Ù ! Aj$  # Ak!   6 (<# Ak! $    6 (! Û  Aj$  # Ak!   6 (_# Ak! $    6  6  6 (!  ( (å  Ajæ  Aj$  # AÀk! $   : »   6´  6° (°! A¨j ç  (´è  (´é !  )¨78 (°! (´é ! A(j  ê  AÀ j  )87  )07  )(7 AÀ j  Aj Ajë  (´ì !  - »: & - &!	  AÀ j  	í 6¼ (¼!\n AÀj$  \n# Ak!   69# Ak! $    6 (Ú ! Aj$  l# Ak! $   6  ( ! Aj!   6  6  6 (!  (Û   (6 Aj$ £# A k! $   Ü 6  Ý 6 (!@@ (A GAqE\r  (Þ !A ! !   6  6  6 (!  (ß   (6 A j$ e# Ak! $    6  6 (!  Ï  á jAj Ï  (jAjâ  Aj$ h# Ak! $    6  6 (! Aj ä  (!  (6   ( å ! Aj$  # Ak!   6 (½# Ak!   6  6  6  (!  6  (6   (6 Aj!@@ (A GAqE\r  ( ( j!A !  6  Aj!@@ (A GAqE\r  ( ( j!A !  6  A :  (!# Ak!   6 (A : m# Ak! $    6  6 (!  (î 6  (ï 6   ( ( ð  Aj$  D# Ak! $    6 (! ñ  Ajæ  Aj$ # Ak!   6 (?# Ak! $   6  6   (ó  Aj$ # AÀ k! $   6< (<!  ) 70  )7(  ) 7   )07  )(7  ) 7    Aj Ajò  AÀ j$ # Ak!   6 (AjÝ# A k! $   :    6  6 (! (!  - :    - ô  Aä j! Aj °  (!@@ (A G AqA GrAq\r  Ajõ E\r  (ö Aq\r  AjA÷   Aä j( 6 (! A j$  O# Ak! $    6 (!   Ò ø 6 (! Aj$  X# Ak! $    6 (!   Ò  Ñ jø 6 (! Aj$  E# Ak!  6  6   6 (!  (6  Aj (6  9# Ak!   6 (!  ( 6  (6 A : # A k! $    6  6 (!  )7  ) 7  A :  Aj!  ) 7  )7  Ajú   (6  Aä jA ÷  A j$  1# Ak!   6  6 (!  (6  â# A k! $   :    6  6 (!@@ û Aq\r  A Aq:  ü !@@ A"F\r  A\'F\r @@ AÛ F\r  Aû F\r@ Ajý AqE\r  (þ !  - :     - ÿ Aq:   - :    -  Aq: @ Aj AqE\r  ( !  - :     -  Aq:   - :    -  Aq: @ Aj AqE\r    ( Aq:    Aq: @ Aj AqE\r    ( Aq:    Aq:  - Aq! A j$  # Ak!   6 (, ?# Ak! $    6 ( AsAq! Aj$  1# Ak!   6  6 (!  (6  O# Ak! $    6  6 (! Aj ù  (! Aj$  1# Ak!   6  6 (!  (6  1# Ak!   6 (!  ) 7  A : 	 ç# Ak! $    6 (!@@@ ü ! A K@@ ! A !Aÿ -  AÿqG!AA Aq! Aj ÷  Aä j (6  A Aq:     A:  AAq:  - Aq! Aj$  k# Ak! $    6  (Aj6 (!A !Aÿ@ - 	 AÿqGAq\r    , ! Aj$  # Ak!   6AAqJ# Ak! $    6 (! AÀ Aÿq    Aj$  ´# A0k! $   : -   6(  6$ ((!@@ A-j AqE\r  A jA÷  Aä j ( 6  A Aq: /  @ û Aq\r  A Aq: /@ AÝ À AqE\r  AAq: / A 6 A.j Aj @@@ Aj AqE\r   ($ (  6@ (A GAq\r  AjA÷  Aä j (6  A Aq: / (!  A-j : \n@   - \nô Aq\r  A Aq: /  A-j : 	@  - 	 Aq\r  A Aq: /@ û Aq\r  A Aq: /@ AÝ À AqE\r  AAq: /@ A,À Aq\r  AjA÷  Aä j (6  A Aq: /  - /Aq! A0j$  ¹# A k! $   :    6 (!@@ Aj AqE\r  AjA÷  Aä j (6  A Aq:   @  Aj : @  -  Aq\r  A Aq: @ û Aq\r  A Aq: @ AÝ À AqE\r  AAq: @ A,À Aq\r  AjA÷  Aä j (6  A Aq:   - Aq! A j$  # Ak!   6AAqI# Ak! $    6 (! A Aÿq    Aj$  ±# AÀ k! $   : =   68  64 (8!@@ A=j AqE\r  A0jA÷  Aä j (06  A Aq: ?  @ û Aq\r  A Aq: ?@ Aý À AqE\r  AAq: ?@@  Aq\r  A Aq: ?@ û Aq\r  A Aq: ?@ A:À Aq\r  A,jA÷  Aä j (,6  A Aq: ?   6( A>j A(j @@ A\'j AqE\r  (4!  A(j 6   ( 6 @ ( A GAq\r    6(  (4 (  6@ (A GAq\r  AjA÷  Aä j (6  A Aq: ? ( ((   ( 6  ( !  A=j : @   - ô Aq\r  A Aq: ?  A=j : @  -  Aq\r  A Aq: ?@ û Aq\r  A Aq: ?@ Aý À AqE\r  AAq: ?@ A,À Aq\r  AjA÷  Aä j (6  A Aq: ?@ û Aq\r  A Aq: ?  - ?Aq! AÀ j$  þ# A k! $   :    6 (!@@ Aj AqE\r  AjA÷  Aä j (6  A Aq:   @ û Aq\r  A Aq: @ Aý À AqE\r  AAq: @  Aj : @  -  Aq\r  A Aq: @ û Aq\r  A Aq: @ A:À Aq\r  AjA÷  Aä j (6  A Aq:   Aj : @  -  Aq\r  A Aq: @ û Aq\r  A Aq: @ Aý À AqE\r  AAq: @ A,À Aq\r  AjA÷  Aä j (6  A Aq:   - Aq! A j$  # Ak!   6AAq# A k! $    6  6 (!  @@   Aq\r  A Aq:    6 ( (¡  AAq:  - Aq! A j$  ê# Ak! $    6 (!  ü :   @@@  ü :   @ ,  , FAqE\r @ , \r  A÷  Aä j ( 6  A Aq: @ , AÜ FAqE\r @ ü ÀE\r     AAq:  - Aq! Aj$  ù# A k! $    6  6 (! A :   ü : @ , ¢ !A ! Aq! !@ E\r Aÿ - A?H!@ AqE\r    - ! A$j!	 - !\n  \nAj:  	 \nAÿqj :    ü :  A$j!Aÿ  - jA :    - $: @@ , Aô FAqE\r  (AAq£ Aÿ@ - AGAqE\r  AjA÷  Aä j (6  A Aq:  AAq: @ , Aæ FAqE\r  (A Aq£ Aÿ@ - AGAqE\r  AjA÷  Aä j (6  A Aq:  AAq: @ , Aî FAqE\r Aÿ@ - AGAqE\r  AjA÷  Aä j (6  A Aq:  AAq: @ A$j (¤ Aq\r  A÷  Aä j ( 6  A Aq:  AAq:  - Aq! A j$  u# Ak! $    6 (!  ü : @@ , ¢ AqE\r    ü :  AAq! Aj$  0# Ak!   6 (!Aÿ - AqA GAq8# Ak! $    6 (Aj¥  Aj$ m# Ak! $    6 (!  ¦ 6@@ (A JAqE\r  (!A !  :  A: 	 Aj$ -# Ak!   6 (!Aÿ -  A FAq}# Ak! $    6  :  (!@@ ü À , GAqE\r  A Aq:    AAq:  - Aq! Aj$  # Ak!   6  6# Ak!   6AAqK# Ak! $    6  6 ( ( ¬ ! Aj$  Z# Ak! $    6 (!Aÿ -  Ak! Aj Aÿq­  - ! Aj$  ý# Ak! $   :    6 (!@@ û Aq\r  A Aq:  ü !@@ A"F\r  A\'F\r @@ AÛ F\r  Aû F\r  - :    -  Aq:   - :    -  Aq:    Aq:    Aq:  - Aq! Aj$  S# Ak!   6  :  (!Aÿ  - Aq: Aÿ - !Aÿ   - r: ,# Ak!   6 (! A 6  A 6# Ak! $    6 (!  @@ ü À´ AqE\r     Aq:   µ Aq:  - Aq! Aj$  # Ak!   6 ((# Ak!   6  6K# Ak! $    6 (( ! Aj ·  (! Aj$  # Ak! $   6   6 (!  (6    ( ¶ 6@@ (A GAqE\r  ( !A ! ! Aj$  E# Ak! $    6 (! (  (¸ ! Aj$  Æ# Ak! $    6  6 (!  (® 6 @@ ( A GAq\r  A 6@@ (A GAqE\r  ( ( ¯   ( 6  ( 6   ( 6 ( °   ( 6 (! Aj$  A# Ak!   6  6 (!Aÿ  - Ar:   (6# Ak!   6 (M# Ak! $    6 (! (  Aj Aj¹  A 6 Aj$ ­# A0k! $    6( ((! A jº   ü :   @@@  ü :   @ ,  , FAqE\r @ , \r  AjA÷  Aä j (6  A Aq: /@ , AÜ FAqE\r   ü : @ , \r  AjA÷  Aä j (6  A Aq: /@ , Aõ FAqE\r   @  Aj» Aq\r  A Aq: / A j!Aÿÿ@  /¼ AqE\r  A j½  ¾   , ¿ : @ , \r  AjA÷  Aä j (6  A Aq: /    , À   A ÀÀ @ Á Aq\r  AjA÷  Aä j (6  A Aq: / AAq: / - /Aq! A0j$  P# Ak! $    6  6 (! AAÿq   (6  Aj$ # Ak! $    : A0!A9! ,  À ÀÇ !A! Aq! !@ \r Aß !Aú !	 ,  À 	ÀÇ !\nA! \nAq! ! \r AÁ !\rAÚ ! ,  \rÀ ÀÇ !A! Aq! ! \r  , A+F!A! Aq! ! \r  , A-F!A! Aq! ! \r  , A.F! Aq! Aj$  b# Ak! $    6  :  (! AAÿq A !Aÿ  -  AÿqGAq:   Aj$ Ó\n	~}||# AÐ k! $    6H  6D A : C (H,  AUj! AK@@@   A: C  (HAj6H  (HAj6H@@ (H,  Ð Aq\r  (H,  A.GAqE\r  A Aq: O B 78 A ;6 B7(@@ (H,  Ð AqE\r  (H,  A0k: \'@ )8B³æÌ³æÌVAqE\r   )8B\n~78 )8!Aÿ 1 \'!@ B }VAqE\r Aÿ  1 \' )8|78  (HAj6H @ (H,  \r A !Aÿ@@ - C AÿqGAqE\r  B7@ )8BXAqE\r  (D )8BB|Ñ  AAq: O (D )8Ò  AAq: O@@ )8BÿÿÿÿÿÿÿVAqE\r  )8B\n78  /6Aj;6 @@ (H,  Ð AqE\r  /6Aj;6  (HAj6H @ (H,  A.FAqE\r   (HAj6H@@ (H,  Ð AqE\r@ )8B³æÌ³æ TAqE\r   )8B\n~ (H-  APj­Bÿ|78  /6Aj;6  (HAj6H  A 6@@ (H,  Aå FAq\r  (H,  AÅ FAqE\r  (HAj6H A : @@ (H,  A-FAqE\r  A:   (HAj6H@ (H,  A+FAqE\r   (HAj6H@@ (H,  Ð AqE\r  (A\nl (H,  A0kj6@ ( .6jA´JAqE\r A !Aÿ@@ -  AÿqGAqE\r  (D! - C!	C    !\n C    \n 	»Ó  (D!A !Aÿ@@ - C AÿqGAqE\r Ô !\rÔ !\r  \rÓ  AAq: O  (HAj6H A !Aÿ@ -  AÿqGAqE\r  (! A  k6  .6 (j6@ (H,  E\r  A Aq: O  )8º (Õ 9 (D!A !Aÿ@@ - C AÿqGAqE\r  +! +!  Ó  AAq: O - OAq! AÐ j$  !# Ak!   6 (A : 	# Ak! $    6 (!@@  Aj§ AqE\r   A ¨ 6 Aj© !Aÿ  -  6 A6 (! Aj$  O# Ak! $    6  6 (ª  (ª IAq! Aj$  T# Ak! $    6  6 (!  ( 6 «  (! Aj$  # Ak!   6 (( # Ak!   6 (( -# Ak!   6 (!  ( Aj6  # Ak!   6 (1# Ak!   6  :  (!  - :   9# Ak! $    6 (± ! Aj$  5# Ak!   6  6 (!  ( kAm63# Ak!   6 (! A 6 A :  A 6;# Ak! $    6 (A² ! Aj$  # Ak! $    6  6 (!@@  (³ Aq\r  A:  A 6 (!  (A  kj6  (6 (! Aj$  9# Ak!   6  6 (! ( (j (MAqF# Ak!   :  , A\'F!A! Aq! !@ \r  , A"F! Aq# A k! $    6 (!  ü : @@@ , ¢ AqE\r @    , À   ü :  , ¢ Aq\r  AjA÷  Aä j (6  A Aq:  A ÀÀ @ Á Aq\r  AjA÷  Aä j (6  A Aq:  AAq:  - Aq! A j$  # Ak! $   6   6  (( 6@@ (A GAqE\r (È !@ Aj É \r   (Ê 6  (! Aj$  1# Ak!   6  6 (!  (6  ¯# A k! $    6  6 (!  AjÌ 6   AjÍ 6@@ (A GAqE\r   (6  (6  ( (j6 Î   (6 (! A j$  T# Ak!   6  6  6 (! (! ( 6  ( (k! ( 6 .# Ak!   6 (! A ;  A 6 Ý# A k! $    6  6 (! (A ;  A : @@@Aÿ - AHAqE\r  ü : A !Aÿ@ -  AÿqGAq\r  AjA÷  Aä j (6  A Aq:   , Â : Aÿ@ - AJAqE\r  AjA÷  Aä j (6  A Aq:  (!Aÿÿ / At!Aÿ  - r! ( ;     - Aj:   AAq:  - Aq! A j$  ç# Ak! $    6  ; (!Aÿÿ@@ /Ã AqE\r Aÿÿ  /Aÿq;  A Aq: Aÿÿ@ /Ä AqE\r Aÿÿ / A\nt!Aÿÿ   /AÿqrAj6 AAq: Aÿÿ  /6 AAq:  - Aq! Aj$  # Ak!   6 ((­# A k! $    6  6  Aj6 (!  Aj6 A :  @@ (AIAqE\r  (! (!  Aj6  :   (ArA¿q! (!  Aj6  :    (Av;\nAÿÿ@@ /\nA HAqE\r Aÿÿ /\nAÀr! (!	  	Aj6 	 :  Aÿÿ /\nArA¿q!\n (!  Aj6  \n:  Aÿÿ  /\nAu;\nAÿÿ@@ /\nAHAqE\r Aÿÿ /\nAàr! (!\r  \rAj6 \r :  Aÿÿ /\nArA¿q! (!  Aj6  :  Aÿÿ  /\nAu;\nAÿÿ /\nAðr! (!  Aj6  :  @@ (Aj!  6A !Aÿ -   AÿqGAqE\r ( (,  À   A j$ # Ak! $    :  A AqÅ 6@@@ (,  \r  A : @ (,   , FAqE\r   (- :   (Aj6  , ! Aj$  # Ak! $    6  :  (!@@ (A GAq\r @ ( (OAqE\r  A 6 ( Æ  - ! (! (!  Aj6  j :   Aj$ %# Ak!   6 ((A GAqb# Ak!   : @@ , AÁ HAqE\r   , A0k:   , A_q:   , AÁ kA\nj: Aÿ - U# Ak!   ;Aÿÿ /A°N!A ! Aq! !@ E\r Aÿÿ /A¸H! AqU# Ak!   ;Aÿÿ /A¸N!A ! Aq! !@ E\r Aÿÿ /AÀH! Aq># Ak!   : A !Aÿ -  AÿqG!AA  AqAÔ» j!# Ak!   6 (A: [# Ak!   :   :   : \r ,  , L!A ! Aq! !@ E\r  ,  , \rL! Aq# Ak!   6 ((H# Ak! $    6  6 ((  (Ë ! Aj$  A# Ak!   6 (!@@ (E\r   (Alj!A ! ¡# Ak! $    6  6@@ ( (FAqE\r  A 6@ (A GAq\r  A6@ (A GAq\r  A6  ( (Ô 6 (! Aj$  K# Ak! $    6 (( ! Aj Ï  (! Aj$  Ò# Ak! $    6  6 (!  ( 6 @@@ (  (IAqE\r@ ( ( É \r   ( 6@@ ( !A !Aÿ -   AÿqGAqE\r  ( Aj6    ( Aj6   A 6 (! Aj$  # Ak!   6H# Ak! $    6  6 (!  (·  Aj$  K# Ak!   :  , !A0 L!A ! Aq! !@ E\r  , A9L! AqP# Ak! $    6  7  (! A\nAÿq   ) 7  Aj$ P# Ak! $    6  7  (! AAÿq   ) 7  Aj$ P# Ak! $    6  9  (! AAÿq   + 9  Aj$  AÀÿA Ö |# Ak! $    9  6@@ (A JAqE\r  A : @@ (E\r@ (AqE\r Aÿ  - ×  +¢9  (Au6  - Aj:   (! A  k6 A : @@ (E\r@ (AqE\r Aÿ  - Ø  +¢9  (Au6  - Aj:   +! Aj$  K|# Ak! $    6  6 5B  5Ù ! Aj$  o|# Ak! $    6 (At!A Ã  Atj( ! (AtAj! A Ã  Atj( Ö ! Aj$  o|# Ak! $    6 (At!AðÃ  Atj( ! (AtAj! AðÃ  Atj( Ö ! Aj$  &# Ak!   7  )7  + 9# Ak! $    6 (Ø ! Aj$  1# Ak!   6  6 (!  (6  # Ak!   6 (( # Ak!   6 ((U# Ak! $    6 (!@@ à AqE\r  !A ! ! Aj$  1# Ak!   6  6 (!  (6  0# Ak!   6 (!Aÿ - A qA GAq^# Ak! $    6 (!@@ Ô AqE\r  ã !A! Ak! Aj$  %# Ak!   6  6  6)# Ak!   6 ((AÿÿÿÿqA t1# Ak!   6  6 (!  (6  d# A k! $   6   6  (6 (! Aj æ  ( Ajç ! A j$  R# Ak! $   6   6 (!  (6  (è  Aj$  H# Ak! $    6  6 ((  (é ! Aj$  H# Ak! $   6   6 (!  Ajê  Aj$  u# Ak! $    6  6@@ (A GAqE\r   ( (ë 6  (ì 6 (! Aj$  ;# Ak!   6  6 (!  (( 6  A 6 â# Ak! $    6  6 (! Aû Àí   (î 6@@ (A GAqE\r  (È ï  A:Àí  (  ð   (Ê 6@ (A FAqE\r  A,Àí   Aý Àí  ñ ! Aj$  K# Ak! $    6 (! A° ò  ñ ! Aj$  A# Ak! $    6  :  ( , ó  Aj$ # Ak!   6 (( # Ak! $    6  6 (! A"Àó @@ (!A !Aÿ -   AÿqGAqE\r (!  Aj6  ,  ô   A"Àó  Aj$ ¬# A k! $    6  6 (! õ A~j! A>K@@@@@@@@@@ ?   ( + ö 6  (6  6 (! AÛ Àí   (î 6@@ (A GAqE\r (  ð   (Ê 6@ (A FAqE\r  A,Àí   AÝ Àí   ñ 6  ( ë 6  ( ( ÷ 6  ( (  (ø 6  ( ) ù 6  ( ) ú 6 (!A !Aÿ   -   AÿqGAqA GAqû 6  (ì 6 (! A j$  9# Ak! $    6 (ü ! Aj$  L# Ak! $    6  6 ( ( (Ø   Aj$ I# Ak! $    6  :  (!Aÿ  - ý  Aj$ # Ak! $    6  :  (!  ,  : \nA !Aÿ@@ - \n AÿqGAqE\r  AÜ Àó   , \nó   , ó  Aj$ /# Ak!   6 (!Aÿ - Aÿ qAÿqQ# Ak! $    6  9  (!  +   ñ ! Aj$  Q# Ak! $    6  6 (!  (ï  ñ ! Aj$  ]# Ak! $    6  6  6 (!  ( (  ñ ! Aj$  Q# Ak! $    6  7  (!  )   ñ ! Aj$  Q# Ak! $    6  7  (!  )   ñ ! Aj$  c# Ak! $    6  :  (!A !Aÿ  -  AÿqGAq  ñ ! Aj$  9# Ak! $    6 ( ! Aj$  T# Ak! $    6  :  (!Aÿ   - þ  (j6 Aj$ K# Ak! $    6  :  ((  , ÿ A! Aj$  G# Ak! $    6  :  (!  , Ï  Aj$  §# Ak! $    :  AAqÅ 6@ (!A !Aÿ -   AÿqG!A ! Aq! !@ E\r  (,  , G!@ AqE\r   (Aj6 (,  ! Aj$  µ|# A k! $    6  9 (!@@ + AqE\r  A° ò @ + AqE\r  A° ò @ +A ·cAqE\r  A-Àó   +9 +! Aj    ( A !Aÿ@ -  AÿqGAqE\r   ( ,  A !Aÿÿ / AÿÿqGAqE\r  Aå Àó   .  A j$ M# Ak! $    6  6  6 ( ( (  Aj$ # A k! $    6  7 (!@@ )B SAqE\r  A-Àó   )BB|7  )7  )  A j$ ¦# AÀ k! $    6<  70 (<!  AjAj6  (6@ )0B\nB0|§! (Aj!  6  :    )0B\n70 )0B RAq\r   ( (  AÀ j$ v# Ak! $    6  :  (!A !Aÿ@@ -  AÿqGAqE\r  A± ò  A³± ò  Aj$ %# Ak!   9 + +bAqU# Ak!   9 +A ·b!A ! Aq! !@ E\r  +D       @¢ +a! AqÁ|# A k! $    6  9 (!  6 AëÜ6 A	: \n  Aj ;  +ü6   ( 6@@ (A\nOAqE\r  (A\nn6  - \nAj: \n  (A\nn6   + ( ¸¡ (¸¢9   + ü6  +  (¸¡9  + !    ü (j6@ ( (OAqE\r  A 6  ( Aj6 A !Aÿÿ@ / AÿÿqGAqE\r  ( A\nOAqE\r   /Aj; A6 @ (A\np!A !@ \r  , \nA J!@ AqE\r   (A\nn6  - \nAj: \n (! A j$  # A0k! $    6,  6( (,!  AjAj6  (6@ ((A\npA0j! (Aj!  6  :    ((A\nn6( ((\r   ( (  A0j$ â# A0k! $    6,  6(  : \' (,!  AjAj6  (6@@ - \'!  Aj: \'A ! Aÿq AÿqGAqE\r ((A\npA0j! (Aj!  6  :    ((A\nn6(  (Aj!	  	6 	A.:    ( (  A0j$ # Ak! $    6  ;\n (!@@ .\nA HAqE\r  A-Àó   .\nAsAÿÿqAj;  /\n;Aÿÿ  /  Aj$ \\# Ak! $    6  6  6 (!   ( (  (j6 Aj$ ||# Ak! $    6 A ;\n A: 	 , 	! A t6@ (+ D    ÐcAfAqE\r @@ , 	A NAqE\r@ (+  , 	× fAqE\r  , 	Ø ! (!   + ¢9   .\n (j;\n  (Au6  - 	Aj: 	 @ (+ A ·dAqE\r  (+ Dñhãµøä>eAqE\r @@ , 	A NAqE\r@ (+  , 	 cAqE\r  , 	× ! (!   + ¢9   .\n (k;\n  (Au6  - 	Aj: 	  .\n! Aj$  S# Ak! $    6  6  6 ( ( ( (k  Aj$ »# A0k! $    6,  ;* (,!  AjAj6  (6@Aÿÿ /*A\noA0j! (Aj!  6  :  Aÿÿ  /*A\nm;*A !Aÿÿ /* AÿÿqGAq\r   ( (  A0j$ Z# Ak! $    6  6  6 ((  ( (Í  (! Aj$  o|# Ak! $    6 (At!AÀÄ  Atj( ! (AtAj! AÀÄ  Atj( Ö ! Aj$  # Ak!   6 ((# AÀ k! $    6<  68  64  60 (8Ê ! (<! (! ( !  Auj!	@@ AqE\r  	(  j( !\n !\n \n! (4! Aj Ë  (0!\r Aj \rË  A$j 	 Aj Aj    A$jÌ ! A$jÉ  AjÉ  AjÉ  AÀ j$  # Ak!   6A4# Ak! $    6 ! Aj$  # Ak!   6A Å c# Ak! $    6A ! (! ( !  (6  6   6 (! Aj$  	 AÅ 	  A (øà ! A   6´ê A (üà ! A   6¸ê A (üà ! A   6¼ê A (ôà ! A   6Àê A (ôà ! A   6Äê A (ôà ! A   6Èê A (ôà ! A   6Ìê A (øà ! A   6Ðê A (üà ! A   6Ôê A (øà ! A   6Øê A (øà ! A   6Üê A (øà ! A   6àê A (ðà ! A   6äê A (øà ! A   6èê A (øà ! A   6ìê A (ôà ! A   6ðê A (üà ! A   6ôê ö5ªA (â ! A   6ë A ( â !A  6ë A (èâ !A  6ë A (Ðê !A  6ë A (ã !A  6ë A (Øê !A  6ë A (°á !A  6ë A (´á !A  6ë A (¸á !A  6 ë A (¼á !	A  	6¤ë A (Àá !\nA  \n6¨ë A (Äá !A  6¬ë A (á !A  6°ë A (¼ê !\rA  \r6´ë A (á !A  6¸ë A (¼ê !A  6¼ë A (á !A  6Àë A (¼ê !A  6Äë A (á !A  6Èë A (¼ê !A  6Ìë A ( á !A  6Ðë A (¤á !A  6Ôë A (á !A  6Øë A (´ê !A  6Üë A (á !A  6àë A (¸ê !A  6äë A (á !A  6èë A (¸ê !A  6ìë A (á !A  6ðë A (¸ê !A  6ôë A (¨á !A  6øë A (¬á !A  6üë A (àâ ! A   6ì A (äâ !!A  !6ì A (´â !"A  "6ì A (¸â !#A  #6ì A (¼â !$A  $6ì A (Àâ !%A  %6ì A (Èâ !&A  &6ì A (Ìâ !\'A  \'6ì A (Äâ !(A  (6 ì A (Ìâ !)A  )6¤ì A (Ðâ !*A  *6¨ì A (Ôâ !+A  +6¬ì A (Øâ !,A  ,6°ì A (Üâ !-A  -6´ì A (´ã !.A  .6¸ì A (¸ã !/A  /6¼ì A (¼ã !0A  06Àì A (Àã !1A  16Äì A (Äã !2A  26Èì A (Èã !3A  36Ìì A (Ìã !4A  46Ðì A (Ðã !5A  56Ôì A (Ôã !6A  66Øì A (Øã !7A  76Üì A (ää !8A  86àì A (èä !9A  96äì A (ìä !:A  :6èì A (ðä !;A  ;6ìì A (ôä !<A  <6ðì A (øä !=A  =6ôì A (üä !>A  >6øì A (å !?A  ?6üì A (ìâ !@A  @6í A (Ôê !AA  A6í A (ðâ !BA  B6í A (Ôê !CA  C6í A (ôâ !DA  D6í A (Ôê !EA  E6í A (øâ !FA  F6í A (üâ !GA  G6í A (ã !HA  H6 í A (ã !IA  I6¤í A (ã !JA  J6¨í A (ã !KA  K6¬í A (ã !LA  L6°í A (ã !MA  M6´í A (Èá !NA  N6¸í A (Ìá !OA  O6¼í A (å !PA  P6Àí A (å !QA  Q6Äí A (èá !RA  R6Èí A (ìá !SA  S6Ìí A (ðá !TA  T6Ðí A (Àê !UA  U6Ôí A (ôá !VA  V6Øí A (Äê !WA  W6Üí A (øá !XA  X6àí A (Èê !YA  Y6äí A (üá !ZA  Z6èí A (â ![A  [6ìí A (â !\\A  \\6ðí A (â !]A  ]6ôí A (â !^A  ^6øí A (Ìê !_A  _6üí A (â !`A  `6î A (Ìê !aA  a6î A (â !bA  b6î A (â !cA  c6î A (¤ã !dA  d6î A (¨ã !eA  e6î A (¬ã !fA  f6î A (°ã !gA  g6î A (Üã !hA  h6 î A (àã !iA  i6¤î A (ã !jA  j6¨î A (ã !kA  k6¬î A (äã !lA  l6°î A (èã !mA  m6´î A (¨æ !nA  n6¸î A (¬æ !oA  o6¼î A (ôã !pA  p6Àî A (øã !qA  q6Äî A (üã !rA  r6Èî A (ä !sA  s6Ìî A (ä !tA  t6Ðî A (ä !uA  u6Ôî A (ä !vA  v6Øî A (ä !wA  w6Üî A (ä !xA  x6àî A (ä !yA  y6äî A (ä !zA  z6èî A ( ä !{A  {6ìî A (¤ä !|A  |6ðî A (Üê !}A  }6ôî A (¨ä !~A  ~6øî A (Üê !A  6üî A (¬ä !A  6ï A (°ä !A  6ï A (´ä !A  6ï A (àê !A  6ï A (¸ä !A  6ï A (àê !A  6ï A (¼ä !A  6ï A (àê !A  6ï A (Àä !A  6 ï A (Ää !A  6¤ï A (Èä !A  6¨ï A (äê !A  6¬ï A (Ìä !A  6°ï A (Ðä !A  6´ï A (Ôä !A  6¸ï A (Øä !A  6¼ï A (Üä !A  6Àï A (àä !A  6Äï A (°æ !A  6Èï A (´æ !A  6Ìï A (¸æ !A  6Ðï A (¼æ !A  6Ôï A (Àæ !A  6Øï A (Äæ !A  6Üï A (Èæ !A  6àï A (Ìæ !A  6äï A (Ðæ !A  6èï A (Ôæ !A  6ìï A (ã !A  6ðï A ( ã !A  6ôï A (Ðá !A  6øï A (Ôá !A  6üï A (Øá ! A   6ð A (Üá !¡A  ¡6ð A (àá !¢A  ¢6ð A (äá !£A  £6ð A (¤â !¤A  ¤6ð A (¨â !¥A  ¥6ð A (¬â !¦A  ¦6ð A (°â !§A  §6ð A (Øæ !¨A  ¨6 ð A (Üæ !©A  ©6¤ð A (àæ !ªA  ª6¨ð A (äæ !«A  «6¬ð A (èæ !¬A  ¬6°ð A (ìæ !­A  ­6´ð A (ðæ !®A  ®6¸ð A (ôæ !¯A  ¯6¼ð A (øæ !°A  °6Àð A (üæ !±A  ±6Äð A (ç !²A  ²6Èð A (ç !³A  ³6Ìð A (ìã !´A  ´6Ðð A (ðã !µA  µ6Ôð A (å !¶A  ¶6Øð A (å !·A  ·6Üð A (å !¸A  ¸6àð A (å !¹A  ¹6äð A (å !ºA  º6èð A ( å !»A  »6ìð A (¤å !¼A  ¼6ðð A (¨å !½A  ½6ôð A (¬å !¾A  ¾6øð A (°å !¿A  ¿6üð A (´å !ÀA  À6ñ A (¸å !ÁA  Á6ñ A (¼å !ÂA  Â6ñ A (Àå !ÃA  Ã6ñ A (Äå !ÄA  Ä6ñ A (Èå !ÅA  Å6ñ A (Ìå !ÆA  Æ6ñ A (Ðå !ÇA  Ç6ñ A (Ôå !ÈA  È6 ñ A (Øå !ÉA  É6¤ñ A (Üå !ÊA  Ê6¨ñ A (àå !ËA  Ë6¬ñ A (äå !ÌA  Ì6°ñ A (èê !ÍA  Í6´ñ A (èå !ÎA  Î6¸ñ A (ìê !ÏA  Ï6¼ñ A (ìå !ÐA  Ð6Àñ A (ðå !ÑA  Ñ6Äñ A (ôå !ÒA  Ò6Èñ A (¤æ !ÓA  Ó6Ìñ A (øå !ÔA  Ô6Ðñ A (¤æ !ÕA  Õ6Ôñ A (üå !ÖA  Ö6Øñ A (¤æ !×A  ×6Üñ A (æ !ØA  Ø6àñ A (¤æ !ÙA  Ù6äñ A (æ !ÚA  Ú6èñ A (¤æ !ÛA  Û6ìñ A (æ !ÜA  Ü6ðñ A (¤æ !ÝA  Ý6ôñ A (æ !ÞA  Þ6øñ A (¤æ !ßA  ß6üñ A (æ !àA  à6ò A (¤æ !áA  á6ò A (æ !âA  â6ò A (¤æ !ãA  ã6ò A (æ !äA  ä6ò A (¤æ !åA  å6ò A (æ !æA  æ6ò A (¤æ !çA  ç6ò A ( æ !èA  è6 ò A (¤æ !éA  é6¤ò A (ç !êA  ê6¨ò A (ðê !ëA  ë6¬ò A (ç !ìA  ì6°ò A (ç !íA  í6´ò A (ç !îA  î6¸ò A (ç !ïA  ï6¼ò A (ç !ðA  ð6Àò A ( ç !ñA  ñ6Äò A (¤ç !òA  ò6Èò A (¨ç !óA  ó6Ìò A (¬ç !ôA  ô6Ðò A (°ç !õA  õ6Ôò A (´ç !öA  ö6Øò A (¼ç !÷A  ÷6Üò A (¸ç !øA  ø6àò A (¼ç !ùA  ù6äò A (Àç !úA  ú6èò A (Äç !ûA  û6ìò A (Èç !üA  ü6ðò A (Ìç !ýA  ý6ôò A (Ðç !þA  þ6øò A (Ôç !ÿA  ÿ6üò A (Øç !A  6ó A (Üç !A  6ó A (àç !A  6ó A (äç !A  6ó A (èç !A  6ó A (ìç !A  6ó A (ðç !A  6ó A (ôç !A  6ó A (øç !A  6 ó A (üç !A  6¤ó A (è !A  6¨ó A (è !A  6¬ó A (è !A  6°ó A (è !A  6´ó A (è !A  6¸ó A (ôê !A  6¼ó A (è !A  6Àó A (è !A  6Äó A (è !A  6Èó A ( è !A  6Ìó A (¤è !A  6Ðó A (¨è !A  6Ôó A (¬è !A  6Øó A (°è !A  6Üó A (´è !A  6àó A (¸è !A  6äó A (¼è !A  6èó A (Àè !A  6ìó A (Äè !A  6ðó A (Èè !A  6ôó A (Ìè !A  6øó A (Ðè !A  6üó A (Ôè ! A   6ô A (Øè !¡A  ¡6ô A (Üè !¢A  ¢6ô A (àè !£A  £6ô A (äè !¤A  ¤6ô A (èè !¥A  ¥6ô A (ìè !¦A  ¦6ô A (ðè !§A  §6ô A (ôè !¨A  ¨6 ô A (øè !©A  ©6¤ô À# A k!   6  6  6  6  (6 A 6@@ (E\r ( (Akj-  ! ( (j :   ( (Akj-  ! ( (Ajj :    (Ak6  (Aj6  ( (jA :  ²	|# A k! $    6  6  6  6  :   :   : \r (! (!	 (!\n (!A !Aÿ -  AÿqG!\rA !   	 \n  \rAq Aq Aq® ü6  (AuAä l (Aÿqj·D      Y@£9 A !Aÿ@ -  AÿqGAqE\r @ (AFAqE\r  (AÿÿJAqE\r   + D      `@ 9  + ! A j$  ß	|# A0k! $    6,  6(  6$  6   :   :   :  (,! (( ($j!	 ( !\n Aj 	 \nÐ A !Aÿ@ -  AÿqGAqE\r   (( ($j AjA ¯  ( ¬  A ·9A !Aÿ@@ -  AÿqGAq\r   Aj¶ A Aå ¹9 Aj¶ !\rA!  \rA  å 7   * »9A !Aÿ@ -  AÿqGAqE\r @@ ( ALAqE\r  +D     À_@dAqE\r   +D      p@¡9@ ( AFAqE\r  +D    Àÿß@dAqE\r   +D      ð@¡9 +! AjÉ  A0j$  T# Ak! $    6  6 (!  °  (j6 (! Aj$  a# Ak! $    6 (!@@ Ô AqE\r   !  ! ! Aj$  # Ak! $    6  6  6 A 6 @@ ( ( j,  Aß FAqE\r  ( Aj6     ( ( j±  Aj$ # A k! $    6  6  6  6@@ (Ø  ( (jIAqE\r  A Aq:  AAq:  - Aq! A j$  +# A k! $    6x  6t  6p  6l  6h (x! (l! (h( Aj!  AÌ j6Ä  6À  6¼  (À´ ) 7° (¼!	  )°7ð  AÌ j6ü  	6ø (ü!\n \nAj )ð7  \n (ø6  AÜ j6Ô  AÌ j6Ð  (Ð6¬ (¬! Aj! (!\r  6È  \r6Ä (È! (!@@ ( A GAqE\r  (  (Äµ !A ! !  AÈj6Ô  6Ð  6Ì (Ô!  (ÌÛ   (Ð6  AÜ j6À  AÈj6¼  (¼) 7° A¸j  )°7 A¸j Aj¶  (¸! AÜ j · @@ AÜ j¸ Aq\r  AÜ jÎ AKAqE\r   (t (pOAq:  A6H (l! (h( Aj!  A8j6¬  6¨  6¤  (¨´ ) 7 (¤!  )7  A8j6  6 (! Aj )7   (6  A8j6à  (à6¨ (¨! Aj! (!  6Ü  6Ø (Ü! (!@@ ( A GAqE\r  (  (Øµ !A ! !  AØj6è  6ä  6à (è!  (àÛ   (ä6  AØj6  () 7 Aj  )7 Aj Aj¶ @ (¹ AsAqE\r  (hA6  A Aq:  A6H (l!  (h( Aj!!  A$j6   6  !6  (´ ) 7 (!"  )7  A$j6   "6 ( !# #Aj )7  # (6  A$j6ì  (ì6¤ (¤!$ $Aj!% $(!&  %6ð  &6ì (ð!\' \'(!(@@ \'( A GAqE\r  \'(  (ìµ !)A !) )!*  Aäj6ü  (6ø  *6ô (ü!+ + (ôÛ  + (ø6  Aäj6  () 7 Aj  )7  Aj ¶   (º 64 (h!, , ,( Aj6  Aj AÜ j»  (t!- (4!.   Aj - .¼ Aq:  AjÉ  A6H AÜ jÉ  - Aq!/ A j$  /# Ak!   6 (s# Ak! $    6  6  ( ( 6@@ (A GAqE\r  ( !A ! ! Aj$  A# Ak! $    6 (!  (   Aj$  {# Ak! $    6  6 A Aq:   ³   (6  (     AAq: @ - Aq\r   É  Aj$ ?# Ak! $    6 (Ñ A FAq! Aj$  q# Ak! $    6  Aj 6 (A G!A ! Aq! !@ E\r  ( ! Aq! Aj$  g# Ak! $    6  Aj 6@@ (A GAqE\r  ( !A ! ! Aj$  º# Ak! $    6  6 (!  6 (¾ @@ (Ô Aq\r  (!  (6  ) 7   Ö â   (× Ó  (Õ Ù  (! Aj$  Ü# A k! $    6  6  6  6@@ Añ¹ ½ AqE\r  ( (FAqE\r  AAq: @ Aí¹ ½ AqE\r  ( (OAqE\r  AAq: @ Aë¹ ½ AqE\r  ( (KAqE\r  AAq: @ Að¹ ½ AqE\r  ( (MAqE\r  AAq: @ Aó¹ ½ AqE\r  ( (IAqE\r  AAq:  A Aq:  - Aq! A j$  ¦# Ak! $    6  6  (ß 6 @@ (  (Ñ GAqE\r  A Aq:  (! (! ( !  A A  Ø A FAq:  - Aq! Aj$  # Ak!   6# Ak!   6  :  A : \n@@ , A0NAqE\r  , A9LAqE\r   , A0k: \n@ , Aá NAqE\r  , Aæ LAqE\r   , Aá kA\nj: \nAÿ - \n¸Lù# A°k! $    6  6  6  6  6ü  6ø  6ô (! A : ó  (6À (À!	@@ 	( A GAqE\r  	( Á !\nA !\n  \n6ì A 6è@@@@ (è (ìHAqE\r (! (è!  AØj6¤  6   6  ( ´ ) 7 (!\r  )7ø  AØj6	  \r6	 (	! Aj )ø7   (	6  AØj6Ì  (Ì6À (À! Aj! (!  6ø  6ô (ø! (!@@ ( A GAqE\r  (  (ôµ !A ! !  AÄj6  6  6ü (!  (üÛ   (6  AÄj6È  (È) 7À  )À7@ AjÂ AqE\r  (! (è!  AÀj6  6  6  (´ ) 7ø (!  )ø7	  AÀj6	  6	 (	! Aj )	7   (	6  AÀj6Ø  (Ø6¼ (¼! Aj! (!  6  6 (! (!@@ ( A GAqE\r  (  (µ ! A !   !!  AÐj6  6  !6 (!" " (Û  " (6  AÐj6Ì  (Ì6Ü  (Ü) 7Ð AÐj  )Ð7x AÐj Aø jÃ  (!# (!$ (ü!% (ø!& (ô!\'   AÐj # $ % & \'À Aq: ó (èAj!(  (6è@@ ( (ìHAqE\r A !)Aÿ - ó )AÿqG!*A !+ *Aq!, +!-@ ,\r  (!. (è!/  A°j6ô  .6ð  /6ì  (ð´ ) 7à (ì!0  )à7	  A°j6¤	  06 	 (¤	!1 1Aj )	7  1 ( 	6  A°j6Ü  (Ü6 (!2 2Aj!3 2(!4  36è\r  46ä\r (è\r!5 5(!6@@ 5( A GAqE\r  5(  (ä\rµ !7A !7 7!8  AÔj6ô\r  66ð\r  86ì\r (ô\r!9 9 (ì\rÛ  9 (ð\r6  AÔj6ì  (ì) 7à Aèj  )à7p Aèj Að j¶  (èÄ ,  Aü F!-@@ -AqE\r A !:Aÿ - ó :AÿqG!;A !< ;Aq!= <!>@ =E\r  (!? (è!@  A j6Ü  ?6Ø  @6Ô  (Ø´ ) 7È (Ô!A  )È7¨	  A j6´	  A6°	 (´	!B BAj )¨	7  B (°	6  A j6Ð  (Ð6 (!C CAj!D C(!E  D6Ô\r  E6Ð\r (Ô\r!F F(!G@@ F( A GAqE\r  F(  (Ð\rµ !HA !H H!I  AÈj6à\r  G6Ü\r  I6Ø\r (à\r!J J (Ø\rÛ  J (Ü\r6  AÈj6ü  (ü) 7ð Aøj  )ð7h Aøj Aè j¶  (øÄ ,  A&F!>@@ >AqE\r  A : ó  (èAj6è A 6 (!K (è!L  Aj6Ä  K6À  L6¼  (À´ ) 7° (¼!M  )°7¸	  Aj6Ä	  M6À	 (Ä	!N NAj )¸	7  N (À	6  Aj6Ä  (Ä6 (!O OAj!P O(!Q  P6À\r  Q6¼\r (À\r!R R(!S@@ R( A GAqE\r  R(  (¼\rµ !TA !T T!U  A¼j6Ì\r  S6È\r  U6Ä\r (Ì\r!V V (Ä\rÛ  V (È\r6  A¼j6  () 7 Aj  )7` Aj Aà j¶   (Ä 6@@ (A GAqE\r  (Aé² Å A GAqE\r @@  (Ø  ( ( Aèj³ AqE\r   (6 A: ó A : ó@ (èA HAqE\r @@ (A GAqE\r  (AÍ² Å A GAqE\r @@  (Ø  ( ( Aèj³ AqE\r   (6 A: ó A : ó@ (èA HAqE\r @@ (A FAqE\r  (AÞ² Å A GAqE\r  A: ó@@ (üA GAqE\r  (A¾± Å A GAqE\r   (ü6@@ (øA GAqE\r  (A² Å A GAqE\r   (ø6A !WAÿ@ - ó WAÿqGAq\r  (A FAqE\r @ (è (ìH!XA !Y XAq!Z Y![@ ZE\r  (,  Aü G![@ [AqE\r  (!\\ (èAj!]  ]6è  Aøj6¬  \\6¨  ]6¤  (¨´ ) 7 (¤!^  )7È	  Aøj6Ô	  ^6Ð	 (Ô	!_ _Aj )È	7  _ (Ð	6  Aøj6ô  (ô6 (!` `Aj!a `(!b  a6  b6 (!c c(!d@@ c( A GAqE\r  c(  (µ !eA !e e!f  Aìj6  d6  f6 (!g g (Û  g (6  Aìj6  () 7 Aj  )7X Aj AØ j¶ @ (Æ AsAqE\r  (!h (è!i  Aèj6  h6  i6  (´ ) 7 (!j  )7Ø	  Aèj6ä	  j6à	 (ä	!k kAj )Ø	7  k (à	6  Aèj6¸  (¸6 (!l lAj!m l(!n  m6¬\r  n6¨\r (¬\r!o o(!p@@ o( A GAqE\r  o(  (¨\rµ !qA !q q!r  A°j6¸\r  p6´\r  r6°\r (¸\r!s s (°\rÛ  s (´\r6  A°j6  () 7 Aj  )7P Aj AÐ j¶   (Ä 6@ (è (ìHAqE\r  (A GAqE\r   (èAj6è (!t (èAj!u  u6è  AØj6ü  t6ø  u6ô  (ø´ ) 7è (ô!v  )è7è	  AØj6ô	  v6ð	 (ô	!w wAj )è	7  w (ð	6  AØj6¬  (¬6  ( !x xAj!y x(!z  y6\r  z6\r (\r!{ {(!|@@ {( A GAqE\r  {(  (\rµ !}A !} }!~  A¤j6¤\r  |6 \r  ~6\r (¤\r!  (\rÛ   ( \r6  A¤j6¬  (¬) 7  A¨j  ) 7H A¨j AÈ j¶   (¨Ä 6@ (A GAqE\r  (A GAqE\r  (,  A&GAqE\r  (,  Aü GAqE\r @ ( (øFAqE\r  (AÜ­ AÙ \r   (Aj6@@ (Aá¯ Å A GAqE\r  (! (! (èAj!  6è  AÈj6ä  6à  6Ü  (à´ ) 7Ð (Ü!  )Ð7ø	  AÈj6\n  6\n (\n! Aj )ø	7   (\n6  AÈj6   ( 6¤ (¤! Aj! (!  6\r  6\r (\r! (!@@ ( A GAqE\r  (  (\rµ !A ! !  Aj6\r  6\r  6\r (\r!  (\rÛ   (\r6  Aj6¼  (¼) 7° A¸j  )°7 A¸j Aj¶ @@  (¸Ä Å A GAqE\r  A: ó A : ó  (èAj6è@@ (A´­ Å A GAqE\r  (! (èAj!  6è  A´j6Ì  6È  6Ä  (È´ ) 7¸ (Ä!  )¸7\n  A´j6\n  6\n (\n! Aj )\n7   (\n6  A´j6¼  (¼6Ä (Ä! Aj! (!  6ä  6à (ä! (!@@ ( A GAqE\r  (  (àµ !A ! !  A´j6ð  6ì  6è (ð!  (èÛ   (ì6  A´j6¬  (¬) 7  A¨j  ) 7  A¨j A j¶   (¨º 6Ä A6°  A£j6@ (ôA FAqE\r  A : ó A 6  (ô6@ (,  !A !@ E\r  ( (°I!@ AqE\r @ (,  A:GAqE\r  (!Aÿ -  è ! (!  Aj6  A£jj :    (Aj6@ ( (°GAqE\r  A : ó (° A£jjA :  @ (A±­ Å A GAqE\r   A£j Aj (°¬  (° AjjA :    Aj6@  ( (Ä (°² Aq\r  A : ó@@ ( (Äj ( (°Ù \r  A: ó A : ó  (èAj6è@ (A¸­ Å A GAqE\r  (! (èAj!  6è  Aôj6´  6°  6¬  (°´ ) 7  (¬!   ) 7\n  Aôj6¤\n   6 \n (¤\n!¡ ¡Aj )\n7  ¡ ( \n6  Aôj6°  (°6È (È!¢ ¢Aj!£ ¢(!¤  £6Ð  ¤6Ì (Ð!¥ ¥(!¦@@ ¥( A GAqE\r  ¥(  (Ìµ !§A !§ §!¨  A¨j6Ü  ¦6Ø  ¨6Ô (Ü!© © (ÔÛ  © (Ø6  A¨j6¼  (¼) 7° A¸j  )°7@ A¸j AÀ j¶   (¸º 6 (!ª (èAj!«  «6è  Aàj6  ª6  «6  (´ ) 7 (!¬  )7¨\n  Aàj6´\n  ¬6°\n (´\n!­ ­Aj )¨\n7  ­ (°\n6  Aàj6  (6¨ (¨!® ®Aj!¯ ®(!°  ¯6ð  °6ì (ð!± ±(!²@@ ±( A GAqE\r  ±(  (ìµ !³A !³ ³!´  Aj6ü  ²6ø  ´6ô (ü!µ µ (ôÛ  µ (ø6  Aj6Ì  (Ì) 7À AÈj  )À78 AÈj A8j¶   (ÈÄ Ø 6ð@  ( ( (ð² Aq\r  A : ó A : ß (!¶ (è!·  AÌj6  ¶6  ·6ü  (´ ) 7ð (ü!¸  )ð7¸\n  AÌj6Ä\n  ¸6À\n (Ä\n!¹ ¹Aj )¸\n7  ¹ (À\n6  AÌj6  (6¬ (¬!º ºAj!» º(!¼  »6Ü  ¼6Ø (Ü!½ ½(!¾@@ ½( A GAqE\r  ½(  (Øµ !¿A !¿ ¿!À  Aj6è  ¾6ä  À6à (è!Á Á (àÛ  Á (ä6  Aj6Ü  (Ü) 7Ð AØj  )Ð70 AØj A0j¶ @ (ØÄ ,  A!FAqE\r  A: ß  (èAj6è ( (j!Â (!Ã (è!Ä  A¼j6ì  Ã6è  Ä6ä  (è´ ) 7Ø (ä!Å  )Ø7È\n  A¼j6Ô\n  Å6Ð\n (Ô\n!Æ ÆAj )È\n7  Æ (Ð\n6  A¼j6ü  (ü6° (°!Ç ÇAj!È Ç(!É  È6È  É6Ä (È!Ê Ê(!Ë@@ Ê( A GAqE\r  Ê(  (Äµ !ÌA !Ì Ì!Í  Aôj6Ô  Ë6Ð  Í6Ì (Ô!Î Î (ÌÛ  Î (Ð6  Aôj6ì  (ì) 7à Aèj  )à7( Aèj A(j¶ @@ Â (èÄ  (ðÙ \r A !ÏAÿ - ß ÏAÿqG!Ð A A ÐAqAq: óA !ÑAÿ - ß ÑAÿqG!Ò AA  ÒAqAq: ó  (èAj6è (!Ó (è!Ô  A¬j6Ô  Ó6Ð  Ô6Ì  (Ð´ ) 7À (Ì!Õ  )À7Ø\n  A¬j6ä\n  Õ6à\n (ä\n!Ö ÖAj )Ø\n7  Ö (à\n6  A¬j6ð  (ð6´ (´!× ×Aj!Ø ×(!Ù  Ø6´  Ù6° (´!Ú Ú(!Û@@ Ú( A GAqE\r  Ú(  (°µ !ÜA !Ü Ü!Ý  Aèj6À  Û6¼  Ý6¸ (À!Þ Þ (¸Û  Þ (¼6  Aèj6ü  (ü) 7ð Aøj  )ð7 Aøj Aj¶   (øÄ 6 (è (ìHAqE\r (A GAqE\rA !ßAÿ@ - ó ßAÿqGAq\r  (,  Aü FAqE\r   (èAj6èA !àAÿ@ - ó àAÿqGAqE\r  (,  A&FAqE\r   (èAj6è A : óA !áAÿ - ó áAÿqGAqE\r@ (è (ìH!âA !ã âAq!ä ã!å@ äE\r  (,  A&G!å@ åAqE\r  (!æ (èAj!ç  ç6è  Aj6¼  æ6¸  ç6´  (¸´ ) 7¨ (´!è  )¨7è\n  Aj6ô\n  è6ð\n (ô\n!é éAj )è\n7  é (ð\n6  Aj6è  (è6 (!ê êAj!ë ê(!ì  ë6ü\r  ì6ø\r (ü\r!í í(!î@@ í( A GAqE\r  í(  (ø\rµ !ïA !ï ï!ð  Aàj6  î6  ð6 (!ñ ñ (Û  ñ (6  Aàj6¬  (¬) 7  A¨j  ) 7 A¨j Aj¶ @ (¨Æ AsAqE\r  (!ò (è!ó  Aj6¤  ò6   ó6  ( ´ ) 7 (!ô  )7ø\n  Aj6  ô6 (!õ õAj )ø\n7  õ (6  Aj6ä  (ä6¸ (¸!ö öAj!÷ ö(!ø  ÷6   ø6 ( !ù ù(!ú@@ ù( A GAqE\r  ù(  (µ !ûA !û û!ü  AÜj6¬  ú6¨  ü6¤ (¬!ý ý (¤Û  ý (¨6  AÜj6  () 7 Aj  )7  Aj ¶   (Ä 6@ (è (ìHAqE\r  (A GAqE\r   (èAj6è A : óA !þAÿ - ó þAÿqGAq!ÿ A°j$  ÿ<# Ak! $    6 (( ¢ ! Aj$  g# Ak! $    Ü 6 (A G!A ! Aq! !@ E\r  (¤ ! Aq! Aj$  £# A k! $   Ü 6  Ý 6 (!@@ (A GAqE\r  (¥ !A ! !   6  6  6 (!  (Ð   (6 A j$ g# Ak! $    6  Aj 6@@ (A GAqE\r  ( !A ! ! Aj$  E# Ak! $    6  6 ( (Ý ! Aj$  q# Ak! $    6  Aj 6 (A G!A ! Aq! !@ E\r  (¦ ! Aq! Aj$  ¤aç# Aðk! $    6À  6¼  6¸  6´  6° (À!  (¼6¼\n (¼\n!@@ ( A GAqE\r  ( Á !A !  6¬  (¼6è  (è( A FAq: «A !	Aÿ@@ - « 	AÿqGAq\r  A 6¤@@ (¤ (¬HAqE\r (¼!\n (¤!  Aj6\n  \n6\n  6\n  (\n´ ) 7\n (\n!  )\n7Ø  Aj6ä  6à (ä!\r \rAj )Ø7  \r (à6  Aj6È\n  (È\n6Ä (Ä! Aj! (!  6  6 (! (!@@ ( A GAqE\r  (  (µ !A ! !  AÀ\nj6  6  6 (!  (Û   (6  AÀ\nj6ð  (ð) 7è  )è7È@ AÈjÂ AqE\r  (¼! (¤!  Aüj6\n  6\n  6ü	  (\n´ ) 7ð	 (ü	!  )ð	7è  Aüj6ô  6ð (ô! Aj )è7   (ð6  Aüj6Ô\n  (Ô\n6À (À! Aj! (!  6¤  6  (¤! (!@@ ( A GAqE\r  (  ( µ !A ! !   AÌ\nj6°  6¬   6¨ (°!! ! (¨Û  ! (¬6  AÌ\nj6ô  (ô6  () 7ø Aj  )ø7À Aj AÀjÃ  (¸!" (´!# (°!$   Aj " # $Ç Aq: « (¤Aj!%  %6¤@@ % (¬HAqE\r A !&Aÿ - « &AÿqG!\'A !( \'Aq!) (!*@ )\r  (¼!+ (¤!,  Aìj6ì	  +6è	  ,6ä	  (è	´ ) 7Ø	 (ä	!-  )Ø	7ø  Aìj6\r  -6\r (\r!. .Aj )ø7  . (\r6  Aìj6ä  (ä6 (!/ /Aj!0 /(!1  06  16 (!2 2(!3@@ 2( A GAqE\r  2(  (µ !4A !4 4!5  AÜj6   36  56 ( !6 6 (Û  6 (6  AÜj6  () 7 Aj  )7¸ Aj A¸j¶  (Ä ,  Aü F!*@@ *AqE\r A !7Aÿ - « 7AÿqG!8A !9 8Aq!: 9!;@ :E\r  (¼!< (¤!=  AÜj6Ô	  <6Ð	  =6Ì	  (Ð	´ ) 7À	 (Ì	!>  )À	7\r  AÜj6\r  >6\r (\r!? ?Aj )\r7  ? (\r6  AÜj6Ø  (Ø6 (!@ @Aj!A @(!B  A6  B6ü (!C C(!D@@ C( A GAqE\r  C(  (üµ !EA !E E!F  AÐj6  D6  F6 (!G G (Û  G (6  AÐj6¤  (¤) 7 A j  )7° A j A°j¶  ( Ä ,  A&F!;@@ ;AqE\r  A : «  (¤Aj6¤ A : Û (¼!H (¤!I  AÄj6¼	  H6¸	  I6´	  (¸	´ ) 7¨	 (´	!J  )¨	7\r  AÄj6¤\r  J6 \r (¤\r!K KAj )\r7  K ( \r6  AÄj6  (6 (!L LAj!M L(!N  M6Ð  N6Ì (Ð!O O(!P@@ O( A GAqE\r  O(  (Ìµ !QA !Q Q!R  Aj6Ü  P6Ø  R6Ô (Ü!S S (ÔÛ  S (Ø6  Aj6Ì  (Ì6à  (à) 7Ð AÜj  )Ð7¨ AÜj A¨j¶   (ÜÄ 6Ô A 6À@@ (¸A GAqE\r  (ÔAé² Å A GAqE\r   (¸6À@ (´A GAqE\r  (ÔAÍ² Å A GAqE\r   (´6À@@ (ÀA GAqE\r  (¼!T (¤Aj!U  A°j6¤	  T6 	  U6	  ( 	´ ) 7	 (	!V  )	7¨\r  A°j6´\r  V6°\r (´\r!W WAj )¨\r7  W (°\r6  A°j6  (6 (!X XAj!Y X(!Z  Y6ä  Z6à (ä![ [(!\\@@ [( A GAqE\r  [(  (àµ !]A !] ]!^  Aj6ð  \\6ì  ^6è (ð!_ _ (èÛ  _ (ì6  Aj6  () 7 Aj  )7x Aj Aø j¶ @@ (È AqE\r  (¼!` (¤Aj!a  A j6	  `6	  a6	  (	´ ) 7ø (	!b  )ø7¸\r  A j6Ä\r  b6À\r (Ä\r!c cAj )¸\r7  c (À\r6  A j6  (6 (!d dAj!e d(!f  e6¼  f6¸ (¼!g g(!h@@ g( A GAqE\r  g(  (¸µ !iA !i i!j  Aøj6È  h6Ä  j6À (È!k k (ÀÛ  k (Ä6  Aøj6ä  (ä6ø  (ø) 7è Aôj  )è7` Aôj Aà j¶   (ôÄ ,  A!FAq: Û (¼!l (¤Aj!mA !nAÿ m - Û nAÿqGAqj!o  Aj6ô  l6ð  o6ì  (ð´ ) 7à (ì!p  )à7È\r  Aj6Ô\r  p6Ð\r (Ô\r!q qAj )È\r7  q (Ð\r6  Aj6Ì  (Ì6 (!r rAj!s r(!t  s6ì  t6è (ì!u u(!v@@ u( A GAqE\r  u(  (èµ !wA !w w!x  AÄj6ø  v6ô  x6ð (ø!y y (ðÛ  y (ô6  AÄj6´  (´) 7¨ A°j  )¨7X A°j AØ j¶   (°Ä Ø 6 (¼!z (¤Aj!{  Aüj6Ü  z6Ø  {6Ô  (Ø´ ) 7È (Ô!|  )È7Ø\r  Aüj6ä\r  |6à\r (ä\r!} }Aj )Ø\r7  } (à\r6  Aüj6ô  (ô6 (!~ ~Aj! ~(!  6¨  6¤ (¨! (!@@ ( A GAqE\r  (  (¤µ !A ! !  Aìj6´  6°  6¬ (´!  (¬Û   (°6  Aìj6ü  (ü6  () 7 Aj  )7P Aj AÐ j¶ @@ (Ä A® Å A GAqE\r  (À! (¼! (¤Aj!  Aèj6Ä  6À  6¼  (À´ ) 7° (¼!  )°7è\r  Aèj6ô\r  6ð\r (ô\r! Aj )è\r7   (ð\r6  Aèj6¼  (¼6ô (ô! Aj! (!  6   6 ( ! (!@@ ( A GAqE\r  (  (µ !A ! !  A´j6¬  6¨  6¤ (¬!  (¤Û   (¨6  A´j6¬  (¬) 7  A¨j  ) 7( A¨j A(j¶    (¨É j-  : û   , û¿ : ç (¼! (¤Aj!  AÔj6¬  6¨  6¤  (¨´ ) 7 (¤!  )7ø\r  AÔj6  6 (! Aj )ø\r7   (6  AÔj6Ô  (Ô6ì (ì! Aj! (!  6È  6Ä (È! (!@@ ( A GAqE\r  (  (Äµ !A ! !  AÌj6Ô  6Ð  6Ì (Ô!  (ÌÛ   (Ð6  AÌj6Ü  (Ü) 7Ð AØj  )Ð7  AØj A j¶   (ØÊ : æ (¼! (¤Aj!   AÀj6  6   6  (´ ) 7 (!¡  )7  AÀj6  ¡6 (!¢ ¢Aj )7  ¢ (6  AÀj6È  (È6ð (ð!£ £Aj!¤ £(!¥  ¤6´  ¥6° (´!¦ ¦(!§@@ ¦( A GAqE\r  ¦(  (°µ !¨A !¨ ¨!©  AÀj6À  §6¼  ©6¸ (À!ª ª (¸Û  ª (¼6  AÀj6ì  (ì) 7à Aèj  )à7 Aèj Aj¶   (èÊ : ÓAÿ - ç!«Aÿ « - æuAq!¬Aÿ@ ¬ - ÓFAqE\r  A: «  (¤Aj6¤ (À!­ (¼!® (¤Aj!¯  A°j6ü  ®6ø  ¯6ô  (ø´ ) 7è (ô!°  )è7  A°j6¤  °6  (¤!± ±Aj )7  ± ( 6  A°j6°  (°6ø (ø!² ²Aj!³ ²(!´  ³6  ´6 (!µ µ(!¶@@ µ( A GAqE\r  µ(  (µ !·A !· ·!¸  A¨j6  ¶6  ¸6 (!¹ ¹ (Û  ¹ (6  A¨j6¼  (¼) 7° A¸j  )°7H A¸j AÈ j¶  ­ (¸É j!º (¼!» (¤Aj!¼A !½Aÿ ¼ - Û ½AÿqGAqj!¾  A j6ä  »6à  ¾6Ü  (à´ ) 7Ð (Ü!¿  )Ð7¨  A j6´  ¿6° (´!À ÀAj )¨7  À (°6  A j6À  (À6 (!Á ÁAj!Â Á(!Ã  Â6Ø  Ã6Ô (Ø!Ä Ä(!Å@@ Ä( A GAqE\r  Ä(  (Ôµ !ÆA !Æ Æ!Ç  A¸j6ä  Å6à  Ç6Ü (ä!È È (ÜÛ  È (à6  A¸j6Ä  (Ä) 7¸ AÀj  )¸7@ AÀj AÀ j¶ @@ º (ÀÄ  (Ù A GAsAqE\r A !ÉAÿ - Û ÉAÿqG!Ê A A ÊAqAq: « (À!Ë (¼!Ì (¤Aj!Í  Aj6Ì  Ì6È  Í6Ä  (È´ ) 7¸ (Ä!Î  )¸7¸  Aj6Ä  Î6À (Ä!Ï ÏAj )¸7  Ï (À6  Aj6¤  (¤6ü (ü!Ð ÐAj!Ñ Ð(!Ò  Ñ6ø  Ò6ô (ø!Ó Ó(!Ô@@ Ó( A GAqE\r  Ó(  (ôµ !ÕA !Õ Õ!Ö  Aj6  Ô6  Ö6ü (!× × (üÛ  × (6  Aj6Ì  (Ì) 7À AÈj  )À78 AÈj A8j¶  Ë (ÈÉ j!Ø (¼!Ù (¤Aj!ÚA !ÛAÿ Ú - Û ÛAÿqGAqj!Ü  Aj6´  Ù6°  Ü6¬  (°´ ) 7  (¬!Ý  ) 7È  Aj6Ô  Ý6Ð (Ô!Þ ÞAj )È7  Þ (Ð6  Aj6´  (´6  ( !ß ßAj!à ß(!á  à6Ä  á6À (Ä!â â(!ã@@ â( A GAqE\r  â(  (Àµ !äA !ä ä!å  A¬j6Ð  ã6Ì  å6È (Ð!æ æ (ÈÛ  æ (Ì6  A¬j6Ô  (Ô) 7È AÐj  )È70 AÐj A0j¶ @ Ø (ÐÄ  (Ù E\r A !çAÿ - Û çAÿqG!è AA  èAqAq: « (¼!é (¤Aj!ê  Aäj6  é6  ê6  (´ ) 7 (!ë  )7Ø  Aäj6ä  ë6à (ä!ì ìAj )Ø7  ì (à6  Aôj6¬\n  Aäj6¨\n  (¨\n6Ì (Ì!í íAj!î í(!ï  î6è  ï6ä (è!ð ð(!ñ@@ ð( A GAqE\r  ð(  (äµ !òA !ò ò!ó  A \nj6ô  ñ6ð  ó6ì (ô!ô ô (ìÛ  ô (ð6  Aôj6à  A \nj6Ü  (Ü) 7Ð AØj  )Ð7p AØj Að j¶  (Ø!õ Aôj õ·   (ÀØ 6à (¼!ö (¤Aj!÷  AÌj6  ö6  ÷6ü  (´ ) 7ð (ü!ø  )ð7è  AÌj6ô  ø6ð (ô!ù ùAj )è7  ù (ð6  AÌj6¸\n  (¸\n6È (È!ú úAj!û ú(!ü  û6ü  ü6ø (ü!ý ý(!þ@@ ý( A GAqE\r  ý(  (øµ !ÿA !ÿ ÿ!  A°\nj6  þ6  6 (!  (Û   (6  A°\nj6ä  (ä) 7Ø Aàj  )Ø7h Aàj Aè j¶   (àº 6Ü AÀj Aôj»  (à! (Ü!   AÀj  ¼ Aq: « AÀjÉ  AôjÉ  (°A G!A ! Aq! !@ E\r  (¼! (¤!  A°j6ì  6è  6ä  (è´ ) 7Ø (ä!  )Ø7ø  A°j6  6 (! Aj )ø7   (6  A°j6¨  (¨6¤ (¤! Aj! (!  6°  6¬ (°! (!@@ ( A GAqE\r  (  (¬µ !A ! !  A j6¼  6¸  6´ (¼!  (´Û   (¸6  A j6ä  (ä) 7Ø Aàj  )Ø7  Aàj A j¶  (àÄ A¾± Å A G!@@ AqE\r  (¼! (¤Aj!  A j6Ô  6Ð  6Ì  (Ð´ ) 7À (Ì!  )À7  A j6  6 (! Aj )7   (6  A j6  (6¨ (¨! Aj! (!  6  6 (! (!@@ ( A GAqE\r  (  (µ !A ! !  Aj6¨  6¤  6  (¨!  ( Û   (¤6  Aj6ô  (ô) 7è Aðj  )è7 Aðj Aj¶ @ (ðÄ Aá¯ Å A GAqE\r  (°!  (¼!¡ (¤Aj!¢  Aj6¼  ¡6¸  ¢6´  (¸´ ) 7¨ (´!£  )¨7  Aj6¤  £6  (¤!¤ ¤Aj )7  ¤ ( 6  Aj6  (6¬ (¬!¥ ¥Aj!¦ ¥(!§  ¦6  §6 (!¨ ¨(!©@@ ¨( A GAqE\r  ¨(  (µ !ªA !ª ª!«  Aj6  ©6  «6 (!¬ ¬ (Û  ¬ (6  Aj6  () 7ø Aj  )ø7 Aj Aj¶ @@   (Ä Å A GAqE\r  (¼!­ (¤Aj!®  Aj6¤  ­6   ®6  ( ´ ) 7 (!¯  )7¨  Aj6´  ¯6° (´!° °Aj )¨7  ° (°6  Aj6  (6° (°!± ±Aj!² ±(!³  ²6ô  ³6ð (ô!´ ´(!µ@@ ´( A GAqE\r  ´(  (ðµ !¶A !¶ ¶!·  Aü\nj6  µ6ü  ·6ø (!¸ ¸ (øÛ  ¸ (ü6  Aü\nj6  () 7 Aj  )7 Aj Aj¶  (Ä AÇ³ Å A G!¹ A A ¹AqAq: « (¼!º (¤Aj!»  Aðj6  º6  »6  (´ ) 7ø (!¼  )ø7¸  Aðj6Ä  ¼6À (Ä!½ ½Aj )¸7  ½ (À6  Aðj6ø\n  (ø\n6´ (´!¾ ¾Aj!¿ ¾(!À  ¿6à  À6Ü (à!Á Á(!Â@@ Á( A GAqE\r  Á(  (Üµ !ÃA !Ã Ã!Ä  Að\nj6ì  Â6è  Ä6ä (ì!Å Å (äÛ  Å (è6  Að\nj6¤  (¤) 7 A j  )7 A j Aj¶  ( Ä AÇ³ Å A G!Æ AA  ÆAqAq: « A Aq: ÇA !ÇAÿ  - Û ÇAÿqGAq (¤j6¤@@ (¬ (¤AjJAqE\r A !ÈAÿ - « ÈAÿqG!ÉA !Ê ÉAq!Ë Ê!Ì@ Ë\r  (¼!Í (¤Aj!Î  Aàj6ô  Í6ð  Î6ì  (ð´ ) 7à (ì!Ï  )à7È  Aàj6Ô  Ï6Ð (Ô!Ð ÐAj )È7  Ð (Ð6  Aàj6ì\n  (ì\n6¸ (¸!Ñ ÑAj!Ò Ñ(!Ó  Ò6Ì  Ó6È (Ì!Ô Ô(!Õ@@ Ô( A GAqE\r  Ô(  (Èµ !ÖA !Ö Ö!×  Aä\nj6Ø  Õ6Ô  ×6Ð (Ø!Ø Ø (ÐÛ  Ø (Ô6  Aä\nj6´  (´) 7¨ A°j  )¨7 A°j Aj¶  (°Ä ,  Aü F!Ì@ ÌAqE\r A !ÙAÿ - « ÙAÿqG!ÚA !Û ÚAq!Ü Û!Ý@ ÜE\r  (¼!Þ (¤Aj!ß  AÐj6Ü  Þ6Ø  ß6Ô  (Ø´ ) 7È (Ô!à  )È7Ø  AÐj6è  à6ä (è!á áAj )Ø7  á (ä6  AÐj6à\n  (à\n6¼ (¼!â âAj!ã â(!ä  ã6¸  ä6´ (¸!å å(!æ@@ å( A GAqE\r  å(  (´µ !çA !ç ç!è  AØ\nj6Ä  æ6À  è6¼ (Ä!é é (¼Û  é (À6  AØ\nj6È  (È) 7¸ AÄj  )¸7 AÄj Aj¶  (ÄÄ ,  A&F!Ý@ ÝAqE\r  A : «  (¤Aj6¤ A !êAÿ  - « êAÿqGAq: Ç - ÇAq!ë Aðj$  ëq# Ak! $    6  Aj 6 (A G!A ! Aq! !@ E\r  (§ ! Aq! Aj$  g# Ak! $    6  Aj 6@@ (A GAqE\r  (¬ !A ! ! Aj$  k# Ak! $    6  Aj 6@@ (A GAqE\r  (² !A ! Aÿq! Aj$   ¥+|"||~~~|~~|!|7||&||||||||# A k! $    6  6 (! ( ! Aàj Ì  (!  AÈj6Ì2  6È2 Aé² 6Ä2  (È2Í ) 7¸2 (Ä2!  )¸27Àa  AÈj6Ìa  6Èa (Ìa! Aj )Àa7   (Èa6  AÈj63  (36¤d (¤d! Aj!	 (!\n  	6 e  \n6e ( e! (! ( !\r  Aå j 6e \r (eÎ !  A3j6¬e  6¨e  6¤e (¬e!  (¤eÛ   (¨e6  A3j6Ì[  (Ì[) 7À[ AÈÛ j  )À[7¨ AÈÛ j A¨j¶   (È[Ä 6Ø (!  A´j6´2  6°2 AÍ² 6¬2  (°2Í ) 7 2 (¬2!  ) 27Ða  A´j6Üa  6Øa (Üa! Aj )Ða7   (Øa6  A´j6ü2  (ü26¨d (¨d! Aj! (!  6e  6e (e! (! ( !  Aå j 6e  (eÎ !  Aô2j6e  6e  6e (e!  (eÛ   (e6  Aô2j6Ü[  (Ü[) 7Ð[ AØÛ j  )Ð[7° AØÛ j A°j¶   (Ø[Ä 6Ä (!  A j62  62 A¾± 62  (2Í ) 72 (2!  )27àa  A j6ìa  6èa (ìa! Aj )àa7   (èa6  A j6ð2  (ð26¬d (¬d! Aj! (!   6ðd   6ìd (ðd!! !(!" !( !#  Aìä j 6èd # (èdÎ !$  Aè2j6üd  "6ød  $6ôd (üd!% % (ôdÛ  % (ød6  Aè2j6ì[  (ì[) 7à[ AèÛ j  )à[7¸ AèÛ j A¸j¶   (è[Ä 6° (!&  Aj62  &62 A² 6ü1  (2Í ) 7ð1 (ü1!\'  )ð17ða  Aj6üa  \'6øa (üa!( (Aj )ða7  ( (øa6  Aj6ä2  (ä26°d (°d!) )Aj!* )(!+  *6Ød  +6Ôd (Ød!, ,(!- ,( !.  AÔä j 6Ðd . (ÐdÎ !/  AÜ2j6äd  -6àd  /6Üd (äd!0 0 (ÜdÛ  0 (àd6  AÜ2j6ü[  (ü[) 7ð[ AøÛ j  )ð[7À AøÛ j AÀj¶   (ø[Ä 6 (!1  Aøj6ì1  16è1 A¯² 6ä1  (è1Í ) 7Ø1 (ä1!2  )Ø17b  Aøj6b  26b (b!3 3Aj )b7  3 (b6  Aøj6Ø2  (Ø26´d (´d!4 4Aj!5 4(!6  56Àd  66¼d (Àd!7 7(!8 7( !9  A¼ä j 6¸d 9 (¸dÎ !:  AÐ2j6Ìd  86Èd  :6Äd (Ìd!; ; (ÄdÛ  ; (Èd6  AÐ2j6\\  (\\) 7\\ AÜ j  )\\7È AÜ j AÈj¶   (\\Ä 6 A6ô@@@ (ØA FAqE\r  (ÄA FAqE\r  (°A FAqE\r   (ô6 A6ð A 6ì@@ (ìAIAqE\r Aèj!< (ìAtAë j( != Açj®   < = - çÏ 6è AÜj Aèj°  (à!>@ (ÜA G >AqA GrAqE\r   (ô6 A6ð  AÐj63 (3!? ?A Ð  ?A 6 AàjAj!@  AÀj6¨7  @6¤7 AÃ¯ 6 7 (¤7!A ( 7!B  AÀj6g  A6g  B6g (g!C C (g6  C (g6  AÀj6´7  (´76°k (°k!D D( !E D(!F  E6¼k  F6¸k (¼k!G GAj!H  A¸ë j 6´k H (´kÑ !I  A¬7j6Èk  G6Äk  I6Àk (Èk!J J (ÀkÛ  J (Äk6  A¬7j6ÜZ  (ÜZ6ìZ  (ìZ) 7àZ AÈj  )àZ7  AÈj A jÃ   )È7Ð (Ø!K (Ä!L (°!M (!N (!O@  AÐj K L M N OÀ AqE\r  AàjAj!P  A¸j67  P67 A² 67 (7!Q (7!R  A¸j6g  Q6g  R6g (g!S S (g6  S (g6 (!T  A¨j6Ô1  T6Ð1 A² 6Ì1  (Ð1Í ) 7À1 (Ì1!U  )À17b  A¨j6b  U6b (b!V VAj )b7  V (b6  A¨j6ä8  A¸j6à8  (ä86l (l!W WAj!X W(!Y  X6èo  Y6äo (èo!Z Z(![ Z( !\\  Aäï j 6ào Z(!] \\ (ào ]Ò !^  AØ8j6ôo  [6ðo  ^6ìo (ôo!_ _ (ìoÛ  _ (ðo6 (à8!`  AØ8j6Ìl  `6Èl (Ìl!a (Èl!b  a) 7Àl  )Àl7 b AjÓ @ a(A GAqE\r  a(Ô As AàjAj!c  A j67  c67 A° 67 (7!d (7!e  A j6¨g  d6¤g  e6 g (¨g!f f (¤g6  f ( g6 (!g  Aj6¼1  g6¸1 A° 6´1  (¸1Í ) 7¨1 (´1!h  )¨17 b  Aj6¬b  h6¨b (¬b!i iAj ) b7  i (¨b6  Aj6Ô8  A j6Ð8  (Ô86l (l!j jAj!k j(!l  k6Ðo  l6Ìo (Ðo!m m(!n m( !o  AÌï j 6Èo m(!p o (Èo pÒ !q  AÈ8j6Üo  n6Øo  q6Ôo (Üo!r r (ÔoÛ  r (Øo6 (Ð8!s  AÈ8j6Ül  s6Øl (Ül!t (Øl!u  t) 7Ðl  )Ðl7 u AjÓ @ t(A GAqE\r  t(Ô As AàjAj!v  Aj67  v67 A©² 6ü6 (7!w (ü6!x  Aj6´g  w6°g  x6¬g (´g!y y (°g6  y (¬g6 (!z  Aøj6¤1  z6 1 A©² 61  ( 1Í ) 71 (1!{  )17°b  Aøj6¼b  {6¸b (¼b!| |Aj )°b7  | (¸b6  Aøj6Ä8  Aj6À8  (Ä86l (l!} }Aj!~ }(!  ~6¸o  6´o (¸o! (! ( !  A´ï j 6°o (!  (°o Ò !  A¸8j6Äo  6Ào  6¼o (Äo!  (¼oÛ   (Ào6 (À8!  A¸8j6ìl  6èl (ìl! (èl!  ) 7àl  )àl7  AjÓ @ (A GAqE\r  (Ô As@ AàjAjA± Õ AqE\r   AàjAj6ä9 A¹± 6à9  (ä96øo (øo! Aj Ö !  AØ9j6p  6p  6üo (p!  (üoÛ   (p6 (à9!  AØ9j6äs  6às (äs! (às!  ) 7Øs  )Øs7  Aj× @ (A GAqE\r  (Ô As A 6ô AàjAj!  Aìj6ø6  6ô6 A¹± 6ð6 (ô6! (ð6!  Aìj6Àg  6¼g  6¸g (Àg!  (¼g6   (¸g6  Aìj6ô9  Aôj6ð9  (ô96Ìu (Ìu! ( ! (!  6èu  6äu (èu! Aj!  Aäõ j 6àu  (àu Ø !  Aè9j6ôu  6ðu  6ìu (ôu!  (ìuÛ   (ðu6 (ð9!  Aè9j6Üu  6Øu (Üu! (Øu( !  ) 7Ðu  )Ðu7ø  AøjÙ @ (A GAqE\r  (Ô As Aèj!  AØj6ì6  6è6 A± 6ä6 (è6! (ä6!  AØj6Ìg  6Èg  6Äg (Ìg!    (Èg6    (Äg6  Aàj6:  AØj6:  (:6¬k (¬k!¡ ¡( !¢ ¡(!£  ¢6Ôk  £6Ðk (Ôk!¤ ¤Aj!¥  AÐë j 6Ìk ¥ (ÌkÑ !¦  Aø9j6àk  ¤6Ük  ¦6Øk (àk!§ § (ØkÛ  § (Ük6  Aàj6´{  Aø9j6°{ (°{!¨  Aàj6È{  ¨6Ä{  (Ä{) 7¸{  )¸{7ð AÀû j Aðj¶  (À{!© Aàj ©· A!ªA !« AÈj Aàj « ªÚ  AÈj¶  «Aç !¬ AÈjÉ   ¬6Ô (Ô!­@@@@@@@@@@@@@@@@@@@@@@@ ­AF\r  ­AF\r ­AF\r ­AF\r ­AF\r ­AF\r ­AF\r ­AF\r ­A	F\r ­A\nF\r	 ­AF\r\n ­AF\r ­A\rF\r ­AF\r\r ­AF\r ­AF\r ­AF\r ­AF\r ­AF\r ­AF\r ­AþF\r ­AÿF\r AàjAj!®  AÀj6à6  ®6Ü6 A¹± 6Ø6 (Ü6!¯ (Ø6!°  AÀj6Øg  ¯6Ôg  °6Ðg (Øg!± ± (Ôg6  ± (Ðg6  AÀj6ä< AÃ´ 6à<  (ä<6ôt (ôt!² ²( !³ ²(!´  ³6øy  ´6ôy (øy!µ µAj!¶  Aôù j 6ðy ¶ (ðy µØ !·  AØ<j6z  µ6z  ·6üy (z!¸ ¸ (üyÛ  ¸ (z6 (à<!¹  AØ<j6q  ¹6q (q!º (q!»  º) 7øp  )øp7À » AÀj× @ º(A GAqE\r  º(Ô As AàjAj!¼  A¸j6Ô6  ¼6Ð6 A¹± 6Ì6 (Ð6!½ (Ì6!¾  A¸j6äg  ½6àg  ¾6Üg (äg!¿ ¿ (àg6  ¿ (Üg6  A¸j6Ô< AÑ³ 6Ð<  (Ô<6øt (øt!À À( !Á À(!Â  Á6ày  Â6Üy (ày!Ã ÃAj!Ä  AÜù j 6Øy Ä (Øy ÃØ !Å  AÈ<j6ìy  Ã6èy  Å6äy (ìy!Æ Æ (äyÛ  Æ (èy6 (Ð<!Ç  AÈ<j6q  Ç6q (q!È (q!É  È) 7q  )q7È É AÈj× @ È(A GAqE\r  È(Ô As AàjAj!Ê  A°j6È6  Ê6Ä6 A¹± 6À6 (Ä6!Ë (À6!Ì  A°j6ðg  Ë6ìg  Ì6èg (ðg!Í Í (ìg6  Í (èg6  A°j6Ä< Aô³ 6À<  (Ä<6üt (üt!Î Î( !Ï Î(!Ð  Ï6Èy  Ð6Äy (Èy!Ñ ÑAj!Ò  AÄù j 6Ày Ò (Ày ÑØ !Ó  A¸<j6Ôy  Ñ6Ðy  Ó6Ìy (Ôy!Ô Ô (ÌyÛ  Ô (Ðy6 (À<!Õ  A¸<j6¤q  Õ6 q (¤q!Ö ( q!×  Ö) 7q  )q7Ð × AÐj× @ Ö(A GAqE\r  Ö(Ô As AàjAj!Ø  A¨j6¼6  Ø6¸6 A¹± 6´6 (¸6!Ù (´6!Ú  A¨j6üg  Ù6øg  Ú6ôg (üg!Û Û (øg6  Û (ôg6  A¨j6´< Aø³ 6°<  (´<6u (u!Ü Ü( !Ý Ü(!Þ  Ý6°y  Þ6¬y (°y!ß ßAj!à  A¬ù j 6¨y à (¨y ßØ !á  A¨<j6¼y  ß6¸y  á6´y (¼y!â â (´yÛ  â (¸y6 (°<!ã  A¨<j6´q  ã6°q (´q!ä (°q!å  ä) 7¨q  )¨q7Ø å AØj× @ ä(A GAqE\r  ä(Ô As AàjAj!æ  A j6°6  æ6¬6 A¹± 6¨6 (¬6!ç (¨6!è  A j6h  ç6h  è6h (h!é é (h6  é (h6  A j6¤< A³´ 6 <  (¤<6u (u!ê ê( !ë ê(!ì  ë6y  ì6y (y!í íAj!î  Aù j 6y î (y íØ !ï  A<j6¤y  í6 y  ï6y (¤y!ð ð (yÛ  ð ( y6 ( <!ñ  A<j6Äq  ñ6Àq (Äq!ò (Àq!ó  ò) 7¸q  )¸q7à ó Aàj× @ ò(A GAqE\r  ò(Ô As AàjAj!ô  Aj6¤6  ô6 6 A¹± 66 ( 6!õ (6!ö  Aj6h  õ6h  ö6h (h!÷ ÷ (h6  ÷ (h6  Aj6< A´ 6<  (<6u (u!ø ø( !ù ø(!ú  ù6y  ú6üx (y!û ûAj!ü  Aüø j 6øx ü (øx ûØ !ý  A<j6y  û6y  ý6y (y!þ þ (yÛ  þ (y6 (<!ÿ  A<j6Ôq  ÿ6Ðq (Ôq! (Ðq!  ) 7Èq  )Èq7è  Aèj× @ (A GAqE\r  (Ô As AàjAj!  Aj66  66 A¹± 66 (6! (6!  Aj6 h  6h  6h ( h!  (h6   (h6  Aj6< A´ 6<  (<6u (u! ( ! (!  6èx  6äx (èx! Aj!  Aäø j 6àx  (àx Ø !  Aø;j6ôx  6ðx  6ìx (ôx!  (ìxÛ   (ðx6 (<!  Aø;j6äq  6àq (äq! (àq!  ) 7Øq  )Øq7ð  Aðj× @ (A GAqE\r  (Ô As AàjAj!  Aj66  66 A¹± 66 (6! (6!  Aj6¬h  6¨h  6¤h (¬h!  (¨h6   (¤h6  Aj6ô; AÖ³ 6ð;  (ô;6u (u! ( ! (!  6Ðx  6Ìx (Ðx! Aj!  AÌø j 6Èx  (Èx Ø !  Aè;j6Üx  6Øx  6Ôx (Üx!  (ÔxÛ   (Øx6 (ð;!  Aè;j6ôq  6ðq (ôq! (ðq!  ) 7èq  )èq7ø  Aøj× @ (A GAqE\r  (Ô As AàjAj!  Aj66  6ü5 A¹± 6ø5 (ü5! (ø5!   Aj6¸h  6´h   6°h (¸h!¡ ¡ (´h6  ¡ (°h6  Aj6ä; AÛ³ 6à;  (ä;6u (u!¢ ¢( !£ ¢(!¤  £6¸x  ¤6´x (¸x!¥ ¥Aj!¦  A´ø j 6°x ¦ (°x ¥Ø !§  AØ;j6Äx  ¥6Àx  §6¼x (Äx!¨ ¨ (¼xÛ  ¨ (Àx6 (à;!©  AØ;j6r  ©6r (r!ª (r!«  ª) 7øq  )øq7 « Aj× @ ª(A GAqE\r  ª(Ô As\r AàjAj!¬  Aøj6ô5  ¬6ð5 A¹± 6ì5 (ð5!­ (ì5!®  Aøj6Äh  ­6Àh  ®6¼h (Äh!¯ ¯ (Àh6  ¯ (¼h6  Aøj6Ô; A¤´ 6Ð;  (Ô;6u (u!° °( !± °(!²  ±6 x  ²6x ( x!³ ³Aj!´  Aø j 6x ´ (x ³Ø !µ  AÈ;j6¬x  ³6¨x  µ6¤x (¬x!¶ ¶ (¤xÛ  ¶ (¨x6 (Ð;!·  AÈ;j6r  ·6r (r!¸ (r!¹  ¸) 7r  )r7 ¹ Aj× @ ¸(A GAqE\r  ¸(Ô As AàjAj!º  Aðj6è5  º6ä5 A¹± 6à5 (ä5!» (à5!¼  Aðj6Ðh  »6Ìh  ¼6Èh (Ðh!½ ½ (Ìh6  ½ (Èh6  Aðj6Ä; AÌ³ 6À;  (Ä;6u (u!¾ ¾( !¿ ¾(!À  ¿6x  À6x (x!Á ÁAj!Â  Aø j 6x Â (x ÁØ !Ã  A¸;j6x  Á6x  Ã6x (x!Ä Ä (xÛ  Ä (x6 (À;!Å  A¸;j6¤r  Å6 r (¤r!Æ ( r!Ç  Æ) 7r  )r7 Ç Aj× @ Æ(A GAqE\r  Æ(Ô As AàjAj!È  Aèj6Ü5  È6Ø5 A¹± 6Ô5 (Ø5!É (Ô5!Ê  Aèj6Üh  É6Øh  Ê6Ôh (Üh!Ë Ë (Øh6  Ë (Ôh6  Aèj6´; A´ 6°;  (´;6 u ( u!Ì Ì( !Í Ì(!Î  Í6ðw  Î6ìw (ðw!Ï ÏAj!Ð  Aì÷ j 6èw Ð (èw ÏØ !Ñ  A¨;j6üw  Ï6øw  Ñ6ôw (üw!Ò Ò (ôwÛ  Ò (øw6 (°;!Ó  A¨;j6´r  Ó6°r (´r!Ô (°r!Õ  Ô) 7¨r  )¨r7 Õ Aj× @ Ô(A GAqE\r  Ô(Ô As\n AàjAj!Ö  Aàj6Ð5  Ö6Ì5 A¹± 6È5 (Ì5!× (È5!Ø  Aàj6èh  ×6äh  Ø6àh (èh!Ù Ù (äh6  Ù (àh6  Aàj6¤; Aá³ 6 ;  (¤;6¤u (¤u!Ú Ú( !Û Ú(!Ü  Û6Øw  Ü6Ôw (Øw!Ý ÝAj!Þ  AÔ÷ j 6Ðw Þ (Ðw ÝØ !ß  A;j6äw  Ý6àw  ß6Üw (äw!à à (ÜwÛ  à (àw6 ( ;!á  A;j6Är  á6Àr (Är!â (Àr!ã  â) 7¸r  )¸r7  ã A j× @ â(A GAqE\r  â(Ô As	 AàjAj!ä  AØj6Ä5  ä6À5 A¹± 6¼5 (À5!å (¼5!æ  AØj6ôh  å6ðh  æ6ìh (ôh!ç ç (ðh6  ç (ìh6  AØj6; Aæ³ 6;  (;6¨u (¨u!è è( !é è(!ê  é6Àw  ê6¼w (Àw!ë ëAj!ì  A¼÷ j 6¸w ì (¸w ëØ !í  A;j6Ìw  ë6Èw  í6Äw (Ìw!î î (ÄwÛ  î (Èw6 (;!ï  A;j6Ôr  ï6Ðr (Ôr!ð (Ðr!ñ  ð) 7Èr  )Èr7¨ ñ A¨j× @ ð(A GAqE\r  ð(Ô As AàjAj!ò  AÐj6¸5  ò6´5 A¹± 6°5 (´5!ó (°5!ô  AÐj6i  ó6üh  ô6øh (i!õ õ (üh6  õ (øh6  AÐj6; Aë³ 6;  (;6¬u (¬u!ö ö( !÷ ö(!ø  ÷6¨w  ø6¤w (¨w!ù ùAj!ú  A¤÷ j 6 w ú ( w ùØ !û  Aø:j6´w  ù6°w  û6¬w (´w!ü ü (¬wÛ  ü (°w6 (;!ý  Aø:j6är  ý6àr (är!þ (àr!ÿ  þ) 7Ør  )Ør7° ÿ A°j× @ þ(A GAqE\r  þ(Ô As AàjAj!  AÈj6¬5  6¨5 A¹± 6¤5 (¨5! (¤5!  AÈj6i  6i  6i (i!  (i6   (i6  AÈj6ô: A´ 6ð:  (ô:6°u (°u! ( ! (!  6w  6w (w! Aj!  A÷ j 6w  (w Ø !  Aè:j6w  6w  6w (w!  (wÛ   (w6 (ð:!  Aè:j6ôr  6ðr (ôr! (ðr!  ) 7èr  )èr7¸  A¸j× @ (A GAqE\r  (Ô As AàjAj!  AÀj6 5  65 A¹± 65 (5! (5!  AÀj6i  6i  6i (i!  (i6   (i6  AÀj6ä: A´ 6à:  (ä:6´u (´u! ( ! (!  6øv  6ôv (øv! Aj!  Aôö j 6ðv  (ðv Ø !  AØ:j6w  6w  6üv (w!  (üvÛ   (w6 (à:!  AØ:j6s  6s (s! (s!  ) 7ør  )ør7À  AÀj× @ (A GAqE\r  (Ô As AàjAj!  A¸j65  65 A¹± 65 (5! (5!  A¸j6¤i  6 i  6i (¤i!  ( i6   (i6  A¸j6Ô: Aý³ 6Ð:  (Ô:6¸u (¸u!   ( !¡  (!¢  ¡6àv  ¢6Üv (àv!£ £Aj!¤  AÜö j 6Øv ¤ (Øv £Ø !¥  AÈ:j6ìv  £6èv  ¥6äv (ìv!¦ ¦ (ävÛ  ¦ (èv6 (Ð:!§  AÈ:j6s  §6s (s!¨ (s!©  ¨) 7s  )s7È © AÈj× @ ¨(A GAqE\r  ¨(Ô As AàjAj!ª  A°j65  ª65 A¹± 65 (5!« (5!¬  A°j6°i  «6¬i  ¬6¨i (°i!­ ­ (¬i6  ­ (¨i6  A°j6Ä: A¹´ 6À:  (Ä:6¼u (¼u!® ®( !¯ ®(!°  ¯6Èv  °6Äv (Èv!± ±Aj!²  AÄö j 6Àv ² (Àv ±Ø !³  A¸:j6Ôv  ±6Ðv  ³6Ìv (Ôv!´ ´ (ÌvÛ  ´ (Ðv6 (À:!µ  A¸:j6¤s  µ6 s (¤s!¶ ( s!·  ¶) 7s  )s7Ð · AÐj× @ ¶(A GAqE\r  ¶(Ô As AàjAj!¸  A¨j6ü4  ¸6ø4 A¹± 6ô4 (ø4!¹ (ô4!º  A¨j6¼i  ¹6¸i  º6´i (¼i!» » (¸i6  » (´i6  A¨j6´: A´ 6°:  (´:6Àu (Àu!¼ ¼( !½ ¼(!¾  ½6°v  ¾6¬v (°v!¿ ¿Aj!À  A¬ö j 6¨v À (¨v ¿Ø !Á  A¨:j6¼v  ¿6¸v  Á6´v (¼v!Â Â (´vÛ  Â (¸v6 (°:!Ã  A¨:j6´s  Ã6°s (´s!Ä (°s!Å  Ä) 7¨s  )¨s7Ø Å AØj× @ Ä(A GAqE\r  Ä(Ô As AàjAj!Æ  A j6ð4  Æ6ì4 A¹± 6è4 (ì4!Ç (è4!È  A j6Èi  Ç6Äi  È6Ài (Èi!É É (Äi6  É (Ài6  A j6¤: A¾´ 6 :  (¤:6Äu (Äu!Ê Ê( !Ë Ê(!Ì  Ë6v  Ì6v (v!Í ÍAj!Î  Aö j 6v Î (v ÍØ !Ï  A:j6¤v  Í6 v  Ï6v (¤v!Ð Ð (vÛ  Ð ( v6 ( :!Ñ  A:j6Äs  Ñ6Às (Äs!Ò (Às!Ó  Ò) 7¸s  )¸s7à Ó Aàj× @ Ò(A GAqE\r  Ò(Ô As AàjAj!Ô  Aj6ä4  Ô6à4 A¹± 6Ü4 (à4!Õ (Ü4!Ö  Aj6Ôi  Õ6Ði  Ö6Ìi (Ôi!× × (Ði6  × (Ìi6  Aj6: Aï³ 6:  (:6Èu (Èu!Ø Ø( !Ù Ø(!Ú  Ù6v  Ú6üu (v!Û ÛAj!Ü  Aüõ j 6øu Ü (øu ÛØ !Ý  A:j6v  Û6v  Ý6v (v!Þ Þ (vÛ  Þ (v6 (:!ß  A:j6Ôs  ß6Ðs (Ôs!à (Ðs!á  à) 7Ès  )Ès7è á Aèj× @ à(A GAqE\r  à(Ô As AàjAj!â  Aj6Ø4  â6Ô4 A¹± 6Ð4 (Ô4!ã (Ð4!ä  Aj6ài  ã6Üi  ä6Øi (ài!å å (Üi6  å (Øi6  Aj6ð<  (ð<6¨k (¨k!æ æ( !ç æ(!è  ç6ìk  è6èk (ìk!é éAj!ê  Aèë j 6äk ê (äkÑ !ë  Aè<j6øk  é6ôk  ë6ðk (øk!ì ì (ðkÛ  ì (ôk6  Aè<j6Ô{@@ (Ô{( Û AsAqE\r  AàjAj!í  Aj6Ì4  í6È4 A¹± 6Ä4 (È4!î (Ä4!ï  Aj6ìi  î6èi  ï6äi (ìi!ð ð (èi6  ð (äi6 (!ñ  Aøj61  ñ61 A¹± 61  (1Í ) 7ø0 (1!ò  )ø07Àb  Aøj6Ìb  ò6Èb (Ìb!ó óAj )Àb7  ó (Èb6  Aøj6´8  Aj6°8  (´86 l ( l!ô ôAj!õ ô(!ö  õ6 o  ö6o ( o!÷ ÷(!ø ÷( !ù  Aï j 6o ÷(!ú ù (o úÒ !û  A¨8j6¬o  ø6¨o  û6¤o (¬o!ü ü (¤oÛ  ü (¨o6 (°8!ý  A¨8j6ül  ý6øl (ül!þ (øl!ÿ  þ) 7ðl  )ðl7¸ ÿ A¸jÓ @ þ(A GAqE\r  þ(Ô As@ AàjÎ AOAqE\r    AàjA¯ ,  ¿ : ÷Aÿ@ - ÷A uAqAFAqE\r   AàjAj6Ô9 AÂ² 6Ð9  (Ô96p (p! Aj Ö !  AÈ9j6p  6p  6p (p!  (pÛ   (p6 (Ð9!  AÈ9j6ôs  6ðs (ôs! (ðs!  ) 7ès  )ès7°  A°j× @ (A GAqE\r  (Ô As A : ö AàjAj!  Aìj6À4  6¼4 AÂ² 6¸4 (¼4! (¸4!  Aìj6øi  6ôi  6ði (øi!  (ôi6   (ði6  Aìj6Ð=  Aöj6Ì=  (Ð=6Üt (Üt! ( ! (!  6{  6{ ({! Aj!  Aû j 6{  ({ Ø !  AÄ=j6{  6{  6{ ({!  ({Û   ({6 (Ì=!  AÄ=j6ô{  6ð{ (ô{! (ð{!A !Aÿ -   AÿqG!  ) 7è{  )è{7¨ Aq A¨jÜ @ (A GAqE\r  (Ô As AàjAj!  Aäj6´4  6°4 AÂ² 6¬4 (°4! (¬4!  Aäj6j  6j  6üi (j!  (j6   (üi6 (!  AÔj6ô0  6ð0 AÂ² 6ì0  (ð0Í ) 7à0 (ì0!  )à07Ðb  AÔj6Üb  6Øb (Üb! Aj )Ðb7   (Øb6  AÔj6¤8  Aäj6 8  (¤86¤l (¤l! Aj! (!  6o  6o (o!   (!¡  ( !¢  Aï j 6o  (!£ ¢ (o £Ò !¤  A8j6o  ¡6o  ¤6o (o!¥ ¥ (oÛ  ¥ (o6 ( 8!¦  A8j6m  ¦6m (m!§ (m!¨  §) 7m  )m7  ¨ A jÓ @ §(A GAqE\r  §(Ô AsAÿ@ - ÷AuAqAFAqE\r   AàjAj6Ä9 A® 6À9  (Ä96p (p!© ©Aj ©Ö !ª  A¸9j6¤p  ©6 p  ª6p (¤p!« « (pÛ  « ( p6 (À9!¬  A¸9j6t  ¬6t (t!­ (t!®  ­) 7øs  )øs7 ® Aj× @ ­(A GAqE\r  ­(Ô As A: Ó AàjAj!¯  AÈj6¨4  ¯6¤4 A® 6 4 (¤4!° ( 4!±  AÈj6j  °6j  ±6j (j!² ² (j6  ² (j6  AÈj6À=  AÓj6¼=  (À=6àt (àt!³ ³( !´ ³(!µ  ´6ðz  µ6ìz (ðz!¶ ¶Aj!·  Aìú j 6èz · (èz ¶Ø !¸  A´=j6üz  ¶6øz  ¸6ôz (üz!¹ ¹ (ôzÛ  ¹ (øz6 (¼=!º  A´=j6|  º6| (|!» (|!¼A !½Aÿ ¼-   ½AÿqG!¾  ») 7ø{  )ø{7 ¾Aq AjÜ @ »(A GAqE\r  »(Ô As AàjAj!¿  AÀj64  ¿64 A® 64 (4!À (4!Á  AÀj6j  À6j  Á6j (j!Â Â (j6  Â (j6 (!Ã  A°j6Ü0  Ã6Ø0 A® 6Ô0  (Ø0Í ) 7È0 (Ô0!Ä  )È07àb  A°j6ìb  Ä6èb (ìb!Å ÅAj )àb7  Å (èb6  A°j68  AÀj68  (86¨l (¨l!Æ ÆAj!Ç Æ(!È  Ç6ðn  È6ìn (ðn!É É(!Ê É( !Ë  Aìî j 6èn É(!Ì Ë (èn ÌÒ !Í  A8j6ün  Ê6øn  Í6ôn (ün!Î Î (ônÛ  Î (øn6 (8!Ï  A8j6m  Ï6m (m!Ð (m!Ñ  Ð) 7m  )m7 Ñ AjÓ @ Ð(A GAqE\r  Ð(Ô AsAÿ@ - ÷AuAqAFAqE\r   AàjAj6´9 Aî­ 6°9  (´96¨p (¨p!Ò ÒAj ÒÖ !Ó  A¨9j6´p  Ò6°p  Ó6¬p (´p!Ô Ô (¬pÛ  Ô (°p6 (°9!Õ  A¨9j6t  Õ6t (t!Ö (t!×  Ö) 7t  )t7 × Aj× @ Ö(A GAqE\r  Ö(Ô As A: ¯ AàjAj!Ø  A¤j64  Ø64 Aî­ 64 (4!Ù (4!Ú  A¤j6¨j  Ù6¤j  Ú6 j (¨j!Û Û (¤j6  Û ( j6  A¤j6°=  A¯j6¬=  (°=6ät (ät!Ü Ü( !Ý Ü(!Þ  Ý6Øz  Þ6Ôz (Øz!ß ßAj!à  AÔú j 6Ðz à (Ðz ßØ !á  A¤=j6äz  ß6àz  á6Üz (äz!â â (ÜzÛ  â (àz6 (¬=!ã  A¤=j6|  ã6| (|!ä (|!åA !æAÿ å-   æAÿqG!ç  ä) 7|  )|7ø çAq AøjÜ @ ä(A GAqE\r  ä(Ô As AàjAj!è  Aj64  è64 Aî­ 6ü3 (4!é (ü3!ê  Aj6´j  é6°j  ê6¬j (´j!ë ë (°j6  ë (¬j6 (!ì  Aj6Ä0  ì6À0 Aî­ 6¼0  (À0Í ) 7°0 (¼0!í  )°07ðb  Aj6üb  í6øb (üb!î îAj )ðb7  î (øb6  Aj68  Aj68  (86¬l (¬l!ï ïAj!ð ï(!ñ  ð6Øn  ñ6Ôn (Øn!ò ò(!ó ò( !ô  AÔî j 6Ðn ò(!õ ô (Ðn õÒ !ö  Aø7j6än  ó6àn  ö6Ün (än!÷ ÷ (ÜnÛ  ÷ (àn6 (8!ø  Aø7j6¬m  ø6¨m (¬m!ù (¨m!ú  ù) 7 m  ) m7ð ú AðjÓ @ ù(A GAqE\r  ù(Ô AsAÿ@ - ÷AuAqAFAqE\r   AàjAj6¤9 A° 6 9  (¤96¸p (¸p!û ûAj ûÖ !ü  A9j6Äp  û6Àp  ü6¼p (Äp!ý ý (¼pÛ  ý (Àp6 ( 9!þ  A9j6¤t  þ6 t (¤t!ÿ ( t!  ÿ) 7t  )t7è  Aèj× @ ÿ(A GAqE\r  ÿ(Ô As A:  AàjAj!  Aj6ø3  6ô3 A° 6ð3 (ô3! (ð3!  Aj6Àj  6¼j  6¸j (Àj!  (¼j6   (¸j6  Aj6 =  Aj6=  ( =6èt (èt! ( ! (!  6Àz  6¼z (Àz! Aj!  A¼ú j 6¸z  (¸z Ø !  A=j6Ìz  6Èz  6Äz (Ìz!  (ÄzÛ   (Èz6 (=!  A=j6¤|  6 | (¤|! ( |!A !Aÿ -   AÿqG!  ) 7|  )|7à Aq AàjÜ @ (A GAqE\r  (Ô As AàjAj!  Aøj6ì3  6è3 A° 6ä3 (è3! (ä3!  Aøj6Ìj  6Èj  6Äj (Ìj!  (Èj6   (Äj6 (!  Aèj6¬0  6¨0 A° 6¤0  (¨0Í ) 70 (¤0!  )07c  Aèj6c  6c (c! Aj )c7   (c6  Aèj6ô7  Aøj6ð7  (ô76°l (°l! Aj! (!  6Àn  6¼n (Àn! (! ( !  A¼î j 6¸n (!  (¸n Ò !  Aè7j6Ìn  6Èn  6Än (Ìn!    (ÄnÛ    (Èn6 (ð7!¡  Aè7j6¼m  ¡6¸m (¼m!¢ (¸m!£  ¢) 7°m  )°m7Ø £ AØjÓ @ ¢(A GAqE\r  ¢(Ô As   AàjA¯ ,  ¿ : ÷Aÿ@ - ÷A uAqAFAqE\r   AàjAj69 AÇ² 69  (96Èp (Èp!¤ ¤Aj ¤Ö !¥  A9j6Ôp  ¤6Ðp  ¥6Ìp (Ôp!¦ ¦ (ÌpÛ  ¦ (Ðp6 (9!§  A9j6´t  §6°t (´t!¨ (°t!©  ¨) 7¨t  )¨t7Ð © AÐj× @ ¨(A GAqE\r  ¨(Ô As A: ç AàjAj!ª  AÜj6à3  ª6Ü3 AÇ² 6Ø3 (Ü3!« (Ø3!¬  AÜj6Øj  «6Ôj  ¬6Ðj (Øj!­ ­ (Ôj6  ­ (Ðj6  AÜj6=  Açj6=  (=6ìt (ìt!® ®( !¯ ®(!°  ¯6¨z  °6¤z (¨z!± ±Aj!²  A¤ú j 6 z ² ( z ±Ø !³  A=j6´z  ±6°z  ³6¬z (´z!´ ´ (¬zÛ  ´ (°z6 (=!µ  A=j6´|  µ6°| (´|!¶ (°|!·A !¸Aÿ ·-   ¸AÿqG!¹  ¶) 7¨|  )¨|7È ¹Aq AÈjÜ @ ¶(A GAqE\r  ¶(Ô As AàjAj!º  AÔj6Ô3  º6Ð3 AÇ² 6Ì3 (Ð3!» (Ì3!¼  AÔj6äj  »6àj  ¼6Üj (äj!½ ½ (àj6  ½ (Üj6 (!¾  AÄj60  ¾60 AÇ² 60  (0Í ) 70 (0!¿  )07c  AÄj6c  ¿6c (c!À ÀAj )c7  À (c6  AÄj6ä7  AÔj6à7  (ä76´l (´l!Á ÁAj!Â Á(!Ã  Â6¨n  Ã6¤n (¨n!Ä Ä(!Å Ä( !Æ  A¤î j 6 n Ä(!Ç Æ ( n ÇÒ !È  AØ7j6´n  Å6°n  È6¬n (´n!É É (¬nÛ  É (°n6 (à7!Ê  AØ7j6Ìm  Ê6Èm (Ìm!Ë (Èm!Ì  Ë) 7Àm  )Àm7À Ì AÀjÓ @ Ë(A GAqE\r  Ë(Ô AsAÿ@ - ÷AuAqAFAqE\r   AàjAj69 Aû¯ 69  (96Øp (Øp!Í ÍAj ÍÖ !Î  Aø8j6äp  Í6àp  Î6Üp (äp!Ï Ï (ÜpÛ  Ï (àp6 (9!Ð  Aø8j6Ät  Ð6Àt (Ät!Ñ (Àt!Ò  Ñ) 7¸t  )¸t7¸ Ò A¸j× @ Ñ(A GAqE\r  Ñ(Ô As A: Ã AàjAj!Ó  A¸j6È3  Ó6Ä3 Aû¯ 6À3 (Ä3!Ô (À3!Õ  A¸j6ðj  Ô6ìj  Õ6èj (ðj!Ö Ö (ìj6  Ö (èj6  A¸j6=  AÃj6ü<  (=6ðt (ðt!× ×( !Ø ×(!Ù  Ø6z  Ù6z (z!Ú ÚAj!Û  Aú j 6z Û (z ÚØ !Ü  Aô<j6z  Ú6z  Ü6z (z!Ý Ý (zÛ  Ý (z6 (ü<!Þ  Aô<j6Ä|  Þ6À| (Ä|!ß (À|!àA !áAÿ à-   áAÿqG!â  ß) 7¸|  )¸|7° âAq A°jÜ @ ß(A GAqE\r  ß(Ô As AàjAj!ã  A°j6¼3  ã6¸3 Aû¯ 6´3 (¸3!ä (´3!å  A°j6üj  ä6øj  å6ôj (üj!æ æ (øj6  æ (ôj6 (!ç  A j6ü/  ç6ø/ Aû¯ 6ô/  (ø/Í ) 7è/ (ô/!è  )è/7 c  A j6¬c  è6¨c (¬c!é éAj ) c7  é (¨c6  A j6Ô7  A°j6Ð7  (Ô76¸l (¸l!ê êAj!ë ê(!ì  ë6n  ì6n (n!í í(!î í( !ï  Aî j 6n í(!ð ï (n ðÒ !ñ  AÈ7j6n  î6n  ñ6n (n!ò ò (nÛ  ò (n6 (Ð7!ó  AÈ7j6Üm  ó6Øm (Üm!ô (Øm!õ  ô) 7Ðm  )Ðm7¨ õ A¨jÓ @ ô(A GAqE\r  ô(Ô As@ AàjÎ AOAqE\r  Aj AàjAAÚ  Aj¶ A Aç !ö AjÉ   ö6@ (A JAqE\r   AàjAj6ô8 Aä® 6ð8  (ô86èp (èp!÷ ÷Aj ÷Ö !ø  Aè8j6ôp  ÷6ðp  ø6ìp (ôp!ù ù (ìpÛ  ù (ðp6 (ð8!ú  Aè8j6Ôt  ú6Ðt (Ôt!û (Ðt!ü  û) 7Èt  )Èt7  ü A j× @ û(A GAqE\r  û(Ô As AàjAj!ý  Aj6°3  ý6¬3 Aä® 6¨3 (¬3!þ (¨3!ÿ  Aj6k  þ6k  ÿ6k (k!  (k6   (k6  Aj6à=  Aj6Ü=  (à=6Øt (Øt! ( ! (!  6 {  6{ ( {! Aj!  Aû j 6{  ({ Ø !  AÔ=j6¬{  6¨{  6¤{ (¬{!  (¤{Û   (¨{6 (Ü=!  AÔ=j6è|  6ä| (è|! (ä|( !  ) 7Ø|  )Ø|7  AjÝ @ (A GAqE\r  (Ô As AàjAj!  Aj6¤3  6 3 Aä® 63 ( 3! (3!  Aj6k  6k  6k (k!  (k6   (k6 (!  Aðj6ä/  6à/ Aä® 6Ü/  (à/Í ) 7Ð/ (Ü/!  )Ð/7°c  Aðj6¼c  6¸c (¼c! Aj )°c7   (¸c6  Aðj6Ä7  Aj6À7  (Ä76¼l (¼l! Aj! (!  6øm  6ôm (øm! (! ( !  Aôí j 6ðm (!  (ðm Ò !  A¸7j6n  6n  6üm (n!  (ümÛ   (n6 (À7!  A¸7j6ìm  6èm (ìm! (èm!  ) 7àm  )àm7  AjÓ @ (A GAqE\r  (Ô As AàjÉ  AàjAj!  Aàj63  63 A® 63 (3! (3!   Aàj6 k  6k   6k ( k!¡ ¡ (k6  ¡ (k6  Aàj6ì=  (ì=6¤k (¤k!¢ ¢( !£ ¢(!¤  £6l  ¤6l (l!¥ ¥Aj!¦  Aì j 6ük ¦ (ükÑ !§  Aä=j6l  ¥6l  §6l (l!¨ ¨ (lÛ  ¨ (l6  Aä=j6ì|  (ì|6ü|  (ü|) 7ð| Aèj  )ð|7 Aèj Ajá   Aèj6Ü  (Ü6ð= (ð=!©@@ ©( A GAq\r  AÔjÞ  ©(!ª ©( î !« AÔj ª «ß   (Ü6ô= AÌjÞ @@ AÔj AÌjà AqE\r A¼j AÔjá  A¬j A¼jâ   A¬j6>  (>) 7ø= A´j  )ø=7ø A´j Aøjá   Aj6Ì/  A´j6È/ AÃ¯ 6Ä/  (È/Í ) 7¸/ (Ä/!¬  )¸/7Àc  Aj6Ìc  ¬6Èc (Ìc!­ ­Aj )Àc7  ­ (Èc6  Aj6À>  (À>6d (d!® ®Aj!¯ ®(!°  ¯6f  °6f (f!± ±(!² ±( !³  Aæ j 6f ³ (fÎ !´  A¸>j6¤f  ²6 f  ´6f (¤f!µ µ (fÛ  µ ( f6  A¸>j6ÈZ  (ÈZ6¼[  (¼[) 7°[ A¤j  )°[7 A¤j AjÃ  (Ø!¶ (Ä!· (°!¸@@  A¤j ¶ · ¸Ç AqE\r   Aüj6´/  A´j6°/ AÍ® 6¬/  (°/Í ) 7 / (¬/!¹  ) /7Ðc  Aüj6Üc  ¹6Øc (Üc!º ºAj )Ðc7  º (Øc6  Aüj6´>  (´>6d (d!» »Aj!¼ »(!½  ¼6f  ½6üe (f!¾ ¾(!¿ ¾( !À  Aüå j 6øe À (øeÎ !Á  A¬>j6f  ¿6f  Á6f (f!Â Â (fÛ  Â (f6  A¬>j6ÌZ  (ÌZ6¬[  (¬[) 7 [ Aj  ) [7ð Aj AðjÃ   Aìj6ì*  Aj6è* A 6ä*  (è*´ ) 7Ø* (ä*!Ã  )Ø*7G  Aìj6¤G  Ã6 G (¤G!Ä ÄAj )G7  Ä ( G6  Aìj6Ä-  (Ä-6üO (üO!Å ÅAj!Æ Å(!Ç  Æ6¸U  Ç6´U (¸U!È È(!É@@ È( A GAqE\r  È(  (´Uµ !ÊA !Ê Ê!Ë  A¼-j6ÄU  É6ÀU  Ë6¼U (ÄU!Ì Ì (¼UÛ  Ì (ÀU6  A¼-j6´]  (´]6È]  (È]) 7¸] AÄÝ j  )¸]7è AÄÝ j Aèj¶ @@ (Ä]Ä A³ Å A GAqE\r   (Ø6è  AØj6Ô*  Aj6Ð* A6Ì*  (Ð*´ ) 7À* (Ì*!Í  )À*7¨G  AØj6´G  Í6°G (´G!Î ÎAj )¨G7  Î (°G6  AØj6¸-  (¸-6P (P!Ï ÏAj!Ð Ï(!Ñ  Ð6¤U  Ñ6 U (¤U!Ò Ò(!Ó@@ Ò( A GAqE\r  Ò(  ( Uµ !ÔA !Ô Ô!Õ  A°-j6°U  Ó6¬U  Õ6¨U (°U!Ö Ö (¨UÛ  Ö (¬U6  A°-j6Ì]  (Ì]6à]  (à]) 7Ð] AÜÝ j  )Ð]7à AÜÝ j Aàj¶ @ (Ü]Ä AÍ² Å A GAqE\r   (Ä6è AÄjAä» ±  (è!×  A´j6¼*  Aj6¸* A6´*  (¸*´ ) 7¨* (´*!Ø  )¨*7¸G  A´j6ÄG  Ø6ÀG (ÄG!Ù ÙAj )¸G7  Ù (ÀG6  A´j6È.  (È.6ÐO (ÐO!Ú ÚAj!Û Ú(!Ü  Û6W  Ü6W (W!Ý Ý(!Þ@@ Ý( A GAqE\r  Ý(  (Wµ !ßA !ß ß!à  AÀ.j6 W  Þ6W  à6W ( W!á á (WÛ  á (W6  AÀ.j6`  (`) 7` Aà j  )`7Ø Aà j AØj¶  (`É !â  A¤j6¤*  Aj6 * A6*  ( *´ ) 7* (*!ã  )*7ÈG  A¤j6ÔG  ã6ÐG (ÔG!ä äAj )ÈG7  ä (ÐG6  A¤j6¼.  (¼.6ÔO (ÔO!å åAj!æ å(!ç  æ6W  ç6üV (W!è è(!é@@ è( A GAqE\r  è(  (üVµ !êA !ê ê!ë  A´.j6W  é6W  ë6W (W!ì ì (WÛ  ì (W6  A´.j6`  (`) 7` Aà j  )`7Ð Aà j AÐj¶ @@@  × â (`É ² AqE\r  A 6  A 6  Aj6*  Aj6* A 6*  (*´ ) 7ø) (*!í  )ø)7ØG  Aj6äG  í6àG (äG!î îAj )ØG7  î (àG6  Aj6¬-  (¬-6P (P!ï ïAj!ð ï(!ñ  ð6U  ñ6U (U!ò ò(!ó@@ ò( A GAqE\r  ò(  (Uµ !ôA !ô ô!õ  A¤-j6U  ó6U  õ6U (U!ö ö (UÛ  ö (U6  A¤-j6ä]  (ä]6ø]  (ø]) 7è] AôÝ j  )è]7È AôÝ j AÈj¶ @ (ô]Ä A± Å A GAqE\r  A 6  A 6 ( !÷ (!ø  ÷Auj!ù@@ ÷AqE\r  ù(  øj( !ú ø!ú ú!û (è!ü  Aüj6ô)  Aj6ð) A6ì)  (ð)´ ) 7à) (ì)!ý  )à)7èG  Aüj6ôG  ý6ðG (ôG!þ þAj )èG7  þ (ðG6  Aüj6°.  (°.6ØO (ØO!ÿ ÿAj! ÿ(!  6ìV  6èV (ìV! (!@@ ( A GAqE\r  (  (èVµ !A ! !  A¨.j6øV  6ôV  6ðV (øV!  (ðVÛ   (ôV6  A¨.j6¬`  (¬`) 7 ` A¨à j  ) `7À A¨à j AÀj¶  (¨`É !  Aìj6Ü)  Aj6Ø) A6Ô)  (Ø)´ ) 7È) (Ô)!  )È)7øG  Aìj6H  6H (H! Aj )øG7   (H6  Aìj6¤.  (¤.6ÜO (ÜO! Aj! (!  6ØV  6ÔV (ØV! (!@@ ( A GAqE\r  (  (ÔVµ !A ! !  A.j6äV  6àV  6ÜV (äV!  (ÜVÛ   (àV6  A.j6¼`  (¼`) 7°` A¸à j  )°`7¸ A¸à j A¸j¶  (¸`É !  AÜj6Ä)  Aj6À) A6¼)  (À)´ ) 7°) (¼)!  )°)7H  AÜj6H  6H (H! Aj )H7   (H6  AÜj6ä>  (ä>6ÀO (ÀO! Aj! (!  6äW  6àW (äW! (!@@ ( A GAqE\r  (  (àWµ !A ! !  AÜ>j6ðW  6ìW  6èW (ðW!  (èWÛ   (ìW6  AÜ>j6}  (}) 7} Aý j  )}7° Aý j A°j¶  (}ã !  AÌj6¬)  Aj6¨) A6¤)  (¨)´ ) 7) (¤)!  ))7H  AÌj6¤H  6 H (¤H! Aj )H7   ( H6  AÌj6ü>  (ü>6¸O (¸O!   Aj!¡  (!¢  ¡6X  ¢6X (X!£ £(!¤@@ £( A GAqE\r  £(  (Xµ !¥A !¥ ¥!¦  Aô>j6X  ¤6X  ¦6X (X!§ § (XÛ  § (X6  Aô>j6Ì{@@ (Ì{( Û AqE\r A!¨  A¼j6)  Aj6) A6)  ()´ ) 7) ()!©  ))7¨H  A¼j6´H  ©6°H (´H!ª ªAj )¨H7  ª (°H6  A¼j6Ø>  (Ø>6ÄO (ÄO!« «Aj!¬ «(!­  ¬6ÐW  ­6ÌW (ÐW!® ®(!¯@@ ®( A GAqE\r  ®(  (ÌWµ !°A !° °!±  AÐ>j6ÜW  ¯6ØW  ±6ÔW (ÜW!² ² (ÔWÛ  ² (ØW6  AÐ>j6}  (}) 7} Aý j  )}7¨ Aý j A¨j¶  (}ã !¨ ¨!³  A¬j6ü(  Aj6ø( A6ô(  (ø(´ ) 7è( (ô(!´  )è(7¸H  A¬j6ÄH  ´6ÀH (ÄH!µ µAj )¸H7  µ (ÀH6  A¬j6ð>  (ð>6¼O (¼O!¶ ¶Aj!· ¶(!¸  ·6øW  ¸6ôW (øW!¹ ¹(!º@@ ¹( A GAqE\r  ¹(  (ôWµ !»A !» »!¼  Aè>j6X  º6X  ¼6üW (X!½ ½ (üWÛ  ½ (X6  Aè>j6Ð{@@ (Ð{( Û AqE\r A !¾  Aj6ä(  Aj6à( A6Ü(  (à(´ ) 7Ð( (Ü(!¿  )Ð(7ÈH  Aj6ÔH  ¿6ÐH (ÔH!À ÀAj )ÈH7  À (ÐH6  Aj6Ì>  (Ì>6ÈO (ÈO!Á ÁAj!Â Á(!Ã  Â6¼W  Ã6¸W (¼W!Ä Ä(!Å@@ Ä( A GAqE\r  Ä(  (¸Wµ !ÆA !Æ Æ!Ç  AÄ>j6ÈW  Å6ÄW  Ç6ÀW (ÈW!È È (ÀWÛ  È (ÄW6  AÄ>j6¬}  (¬}) 7 } A¨ý j  ) }7  A¨ý j A j¶  (¨}ã !¾ ¾!É  ù ü   Aq ³Aq ÉAq û  9Ð A6ð  A´j6¼? A¸² 6¸? (¼?Í !Ê (¸?!Ë  Ê6°f  Ë6¬f (°f!Ì Ì(!Í Ì( !Î  A¬æ j 6¨f Î (¨fÎ !Ï  A°?j6¼f  Í6¸f  Ï6´f (¼f!Ð Ð (´fÛ  Ð (¸f6  A°?j6°}@ (°}( A GAsAsAqE\r   Aj6/  A´j6/ A¸² 6/  (/Í ) 7/ (/!Ñ  )/7àc  Aj6ìc  Ñ6èc (ìc!Ò ÒAj )àc7  Ò (èc6  Aj6¨>  (¨>6d (d!Ó ÓAj!Ô Ó(!Õ  Ô6èe  Õ6äe (èe!Ö Ö(!× Ö( !Ø  Aäå j 6àe Ø (àeÎ !Ù  A >j6ôe  ×6ðe  Ù6ìe (ôe!Ú Ú (ìeÛ  Ú (ðe6  A >j6ÐZ  (ÐZ6[  ([) 7[ Aj  )[7 Aj AjÃ  A 6@ (!Û  Aj6¤+ (¤+!Ü@@ Ü( A GAqE\r  Ü( Á !ÝA !Ý@ Û ÝIAqE\r A +¨ô A ·b!ÞA !ß ÞAq!à ß!á@ àE\r  (Aj!â  Aðj6Ì(  Aj6È(  â6Ä(  (È(´ ) 7¸( (Ä(!ã  )¸(7ØH  Aðj6äH  ã6àH (äH!ä äAj )ØH7  ä (àH6  Aðj6,  (,6´P (´P!å åAj!æ å(!ç  æ6 S  ç6S ( S!è è(!é@@ è( A GAqE\r  è(  (Sµ !êA !ê ê!ë  A,j6¬S  é6¨S  ë6¤S (¬S!ì ì (¤SÛ  ì (¨S6  A,j6\\  (\\) 7\\ AÜ j  )\\7È AÜ j AÈj¶  (\\Ä A G!íA !î íAq!ï î!á ïE\r  (Aj!ð  Aàj6´(  Aj6°(  ð6¬(  (°(´ ) 7 ( (¬(!ñ  ) (7èH  Aàj6ôH  ñ6ðH (ôH!ò òAj )èH7  ò (ðH6  Aàj6,  (,6¸P (¸P!ó óAj!ô ó(!õ  ô6S  õ6S (S!ö ö(!÷@@ ö( A GAqE\r  ö(  (Sµ !øA !ø ø!ù  A,j6S  ÷6S  ù6S (S!ú ú (SÛ  ú (S6  A,j6¬\\  (¬\\) 7 \\ A¨Ü j  ) \\7À A¨Ü j AÀj¶  (¨\\Ä A° AÙ A F!á@@ áAqE\r  (!û  AÐj6(  Aj6(  û6(  ((´ ) 7( ((!ü  )(7øH  AÐj6I  ü6I (I!ý ýAj )øH7  ý (I6  AÐj6,  (,6¼P (¼P!þ þAj!ÿ þ(!  ÿ6øR  6ôR (øR! (!@@ ( A GAqE\r  (  (ôRµ !A ! !  Aü+j6S  6S  6üR (S!  (üRÛ   (S6  Aü+j6¼\\  (¼\\) 7°\\  )°\\7 A¸Ü j Aj¶  (¸\\Ä ,  AVj! AK@@@@@  A +¨ô !  +Ð £9Ð A +¨ô  +Ð¢9ÐA +¨ô !  +Ð ¡9Ð A +¨ô  +Ð 9Ð (!  AÀj6(  Aj6(  6ü\'  ((´ ) 7ð\' (ü\'!  )ð\'7I  AÀj6I  6I (I! Aj )I7   (I6  AÀj6ø+  (ø+6ÀP (ÀP! Aj! (!  6äR  6àR (äR! (!@@ ( A GAqE\r  (  (àRµ !A ! !  Að+j6ðR  6ìR  6èR (ðR!  (èRÛ   (ìR6  Að+j6Ì\\  (Ì\\) 7À\\ AÈÜ j  )À\\7¸ AÈÜ j A¸j¶ @@ (È\\Ä Ø AFAqE\r  (!  A°j6ì\'  Aj6è\'  6ä\'  (è\'´ ) 7Ø\' (ä\'!  )Ø\'7I  A°j6¤I  6 I (¤I! Aj )I7   ( I6  A°j6ì+  (ì+6ÄP (ÄP! Aj! (!  6ÐR  6ÌR (ÐR! (!@@ ( A GAqE\r  (  (ÌRµ !A ! !  Aä+j6ÜR  6ØR  6ÔR (ÜR!  (ÔRÛ   (ØR6  Aä+j6Ü\\  (Ü\\) 7Ð\\  )Ð\\7X AØÜ j AØ j¶  (Ø\\Ä ,  A_j! A=K@@@@@@@@@@@ >\n\n\n\n\n\n\n\n \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n	\n (Aj!   A j6Ô\'  Aj6Ð\'   6Ì\'  (Ð\'´ ) 7À\' (Ì\'!¡  )À\'7¨I  A j6´I  ¡6°I (´I!¢ ¢Aj )¨I7  ¢ (°I6  A j6´@  (´@6O (O!£ £Aj!¤ £(!¥  ¤6ÔY  ¥6ÐY (ÔY!¦ ¦(!§@@ ¦( A GAqE\r  ¦(  (ÐYµ !¨A !¨ ¨!©  A¬À j6àY  §6ÜY  ©6ØY (àY!ª ª (ØYÛ  ª (ÜY6  A¬À j6Ì}  (Ì}) 7À} AÈý j  )À}7 AÈý j Aj¶  (È}ä !«  +Ð «£9Ð	 (Aj!¬  Aj6¼\'  Aj6¸\'  ¬6´\'  (¸\'´ ) 7¨\' (´\'!­  )¨\'7¸I  Aj6ÄI  ­6ÀI (ÄI!® ®Aj )¸I7  ® (ÀI6  Aj6¨@  (¨@6O (O!¯ ¯Aj!° ¯(!±  °6ÀY  ±6¼Y (ÀY!² ²(!³@@ ²( A GAqE\r  ²(  (¼Yµ !´A !´ ´!µ  A À j6ÌY  ³6ÈY  µ6ÄY (ÌY!¶ ¶ (ÄYÛ  ¶ (ÈY6  A À j6Ü}  (Ü}) 7Ð} AØý j  )Ð}7 AØý j Aj¶   (Ø}ä  +Ð¢9Ð (Aj!·  Aj6¤\'  Aj6 \'  ·6\'  ( \'´ ) 7\' (\'!¸  )\'7ÈI  Aj6ÔI  ¸6ÐI (ÔI!¹ ¹Aj )ÈI7  ¹ (ÐI6  Aj6@  (@6O (O!º ºAj!» º(!¼  »6¬Y  ¼6¨Y (¬Y!½ ½(!¾@@ ½( A GAqE\r  ½(  (¨Yµ !¿A !¿ ¿!À  AÀ j6¸Y  ¾6´Y  À6°Y (¸Y!Á Á (°YÛ  Á (´Y6  AÀ j6ì}  (ì}) 7à} Aèý j  )à}7  Aèý j A j¶  (è}ä !Â  +Ð Â¡9Ð (Aj!Ã  Aðj6\'  Aj6\'  Ã6\'  (\'´ ) 7ø& (\'!Ä  )ø&7ØI  Aðj6äI  Ä6àI (äI!Å ÅAj )ØI7  Å (àI6  Aðj6@  (@6O (O!Æ ÆAj!Ç Æ(!È  Ç6Y  È6Y (Y!É É(!Ê@@ É( A GAqE\r  É(  (Yµ !ËA !Ë Ë!Ì  AÀ j6¤Y  Ê6 Y  Ì6Y (¤Y!Í Í (YÛ  Í ( Y6  AÀ j6ü}  (ü}) 7ð} Aøý j  )ð}7( Aøý j A(j¶   (ø}ä  +Ð 9Ð  +Ðü7è )è!Î (Aj!Ï  AØj6ô&  Aj6ð&  Ï6ì&  (ð&´ ) 7à& (ì&!Ð  )à&7èI  AØj6ôI  Ð6ðI (ôI!Ñ ÑAj )èI7  Ñ (ðI6  AØj6À@  (À@6O (O!Ò ÒAj!Ó Ò(!Ô  Ó6èY  Ô6äY (èY!Õ Õ(!Ö@@ Õ( A GAqE\r  Õ(  (äYµ !×A !× ×!Ø  A¸À j6ôY  Ö6ðY  Ø6ìY (ôY!Ù Ù (ìYÛ  Ù (ðY6  A¸À j6ì~  (ì~) 7à~ Aèþ j  )à~70 Aèþ j A0j¶   Î (è~å ¹9Ð  +Ðü7Ð )Ð!Ú (Aj!Û  AÀj6Ü&  Aj6Ø&  Û6Ô&  (Ø&´ ) 7È& (Ô&!Ü  )È&7øI  AÀj6J  Ü6J (J!Ý ÝAj )øI7  Ý (J6  AÀj6ð@  (ð@6üN (üN!Þ ÞAj!ß Þ(!à  ß6¸Z  à6´Z (¸Z!á á(!â@@ á( A GAqE\r  á(  (´Zµ !ãA !ã ã!ä  AèÀ j6ÄZ  â6ÀZ  ä6¼Z (ÄZ!å å (¼ZÛ  å (ÀZ6  AèÀ j6ü~  (ü~) 7ð~ Aøþ j  )ð~78 Aøþ j A8j¶   Ú (ø~æ ­¹9Ð  +Ðü7¸ )¸!æ (Aj!ç  A¨j6Ä&  Aj6À&  ç6¼&  (À&´ ) 7°& (¼&!è  )°&7J  A¨j6J  è6J (J!é éAj )J7  é (J6  A¨j6ä@  (ä@6O (O!ê êAj!ë ê(!ì  ë6¤Z  ì6 Z (¤Z!í í(!î@@ í( A GAqE\r  í(  ( Zµ !ïA !ï ï!ð  AÜÀ j6°Z  î6¬Z  ð6¨Z (°Z!ñ ñ (¨ZÛ  ñ (¬Z6  AÜÀ j6  () 7 Aÿ j  )7@ Aÿ j AÀ j¶   æ (æ ­¹9Ð +Ð!òD        !ó  ò ób: § - §!ô  óD      ð? ô9Ð  +Ðü7 )!õ (Aj!ö  Aj6¬&  Aj6¨&  ö6¤&  (¨&´ ) 7& (¤&!÷  )&7J  Aj6¤J  ÷6 J (¤J!ø øAj )J7  ø ( J6  Aj6Ø@  (Ø@6O (O!ù ùAj!ú ù(!û  ú6Z  û6Z (Z!ü ü(!ý@@ ü( A GAqE\r  ü(  (Zµ !þA !þ þ!ÿ  AÐÀ j6Z  ý6Z  ÿ6Z (Z!	 	 (ZÛ  	 (Z6  AÐÀ j6  () 7 Aÿ j  )7H Aÿ j AÈ j¶   õ (æ ­¹9Ð  +Ðü7 )!	 (Aj!	  Aðj6&  Aj6&  	6&  (&´ ) 7& (&!	  )&7¨J  Aðj6´J  	6°J (´J!	 	Aj )¨J7  	 (°J6  Aðj6Ì@  (Ì@6O (O!	 	Aj!	 	(!	  	6üY  	6øY (üY!	 	(!	@@ 	( A GAqE\r  	(  (øYµ !	A !	 	!	  AÄÀ j6Z  	6Z  	6Z (Z!	 	 (ZÛ  	 (Z6  AÄÀ j6¬  (¬) 7  A¨ÿ j  ) 7P A¨ÿ j AÐ j¶   	 (¨æ ­¹9Ð (!	  Aàj6ü%  Aj6ø%  	6ô%  (ø%´ ) 7è% (ô%!	  )è%7¸J  Aàj6ÄJ  	6ÀJ (ÄJ!	 	Aj )¸J7  	 (ÀJ6  Aàj6à+  (à+6ÈP (ÈP!	 	Aj!	 	(!	  	6¼R  	6¸R (¼R!	 	(!	@@ 	( A GAqE\r  	(  (¸Rµ !	A !	 	!	  AØ+j6ÈR  	6ÄR  	6ÀR (ÈR!	 	 (ÀRÛ  	 (ÄR6  AØ+j6ì\\  (ì\\) 7à\\ AèÜ j  )à\\7° AèÜ j A°j¶ @@ (è\\Ä A¾­ AÙ \r  +Ð!	 (Aj!	  AÐj6ä%  Aj6à%  	6Ü%  (à%´ ) 7Ð% (Ü%!	  )Ð%7ÈJ  AÐj6ÔJ  	6ÐJ (ÔJ!	 	Aj )ÈJ7  	 (ÐJ6  AÐj6@  (@6 O ( O!	 	Aj!	 	(!	  	6Y  	6Y (Y!	 	(! 	@@ 	( A GAqE\r  	(  (Yµ !¡	A !¡	 ¡	!¢	  Aü?j6Y   	6Y  ¢	6Y (Y!£	 £	 (YÛ  £	 (Y6  Aü?j6~  (~) 7~ Aþ j  )~7h Aþ j Aè j¶ @ 	 (~ä dAqE\r  (Aj!¤	  AÀj6Ì%  Aj6È%  ¤	6Ä%  (È%´ ) 7¸% (Ä%!¥	  )¸%7ØJ  AÀj6äJ  ¥	6àJ (äJ!¦	 ¦	Aj )ØJ7  ¦	 (àJ6  AÀj6ø?  (ø?6¤O (¤O!§	 §	Aj!¨	 §	(!©	  ¨	6ðX  ©	6ìX (ðX!ª	 ª	(!«	@@ ª	( A GAqE\r  ª	(  (ìXµ !¬	A !¬	 ¬	!­	  Að?j6üX  «	6øX  ­	6ôX (üX!®	 ®	 (ôXÛ  ®	 (øX6  Að?j6~  (~) 7~ Aþ j  )~7` Aþ j Aà j¶   (~ä 9Ð (!¯	  A°j6´%  Aj6°%  ¯	6¬%  (°%´ ) 7 % (¬%!°	  ) %7èJ  A°j6ôJ  °	6ðJ (ôJ!±	 ±	Aj )èJ7  ±	 (ðJ6  A°j6Ô+  (Ô+6ÌP (ÌP!²	 ²	Aj!³	 ²	(!´	  ³	6¨R  ´	6¤R (¨R!µ	 µ	(!¶	@@ µ	( A GAqE\r  µ	(  (¤Rµ !·	A !·	 ·	!¸	  AÌ+j6´R  ¶	6°R  ¸	6¬R (´R!¹	 ¹	 (¬RÛ  ¹	 (°R6  AÌ+j6ü\\  (ü\\) 7ð\\ AøÜ j  )ð\\7¨ AøÜ j A¨j¶ @@ (ø\\Ä AÝ¯ AÙ \r  +Ð!º	 (Aj!»	  A j6%  Aj6%  »	6%  (%´ ) 7% (%!¼	  )%7øJ  A j6K  ¼	6K (K!½	 ½	Aj )øJ7  ½	 (K6  A j6ì?  (ì?6¨O (¨O!¾	 ¾	Aj!¿	 ¾	(!À	  ¿	6ÜX  À	6ØX (ÜX!Á	 Á	(!Â	@@ Á	( A GAqE\r  Á	(  (ØXµ !Ã	A !Ã	 Ã	!Ä	  Aä?j6èX  Â	6äX  Ä	6àX (èX!Å	 Å	 (àXÛ  Å	 (äX6  Aä?j6¬~  (¬~) 7 ~ A¨þ j  ) ~7x A¨þ j Aø j¶ @ º	 (¨~ä cAqE\r  (Aj!Æ	  Aj6%  Aj6%  Æ	6ü$  (%´ ) 7ð$ (ü$!Ç	  )ð$7K  Aj6K  Ç	6K (K!È	 È	Aj )K7  È	 (K6  Aj6à?  (à?6¬O (¬O!É	 É	Aj!Ê	 É	(!Ë	  Ê	6ÈX  Ë	6ÄX (ÈX!Ì	 Ì	(!Í	@@ Ì	( A GAqE\r  Ì	(  (ÄXµ !Î	A !Î	 Î	!Ï	  AØ?j6ÔX  Í	6ÐX  Ï	6ÌX (ÔX!Ð	 Ð	 (ÌXÛ  Ð	 (ÐX6  AØ?j6¼~  (¼~) 7°~ A¸þ j  )°~7p A¸þ j Að j¶   (¸~ä 9Ð (!Ñ	  Aj6ì$  Aj6è$  Ñ	6ä$  (è$´ ) 7Ø$ (ä$!Ò	  )Ø$7K  Aj6¤K  Ò	6 K (¤K!Ó	 Ó	Aj )K7  Ó	 ( K6  Aj6È+  (È+6ÐP (ÐP!Ô	 Ô	Aj!Õ	 Ô	(!Ö	  Õ	6R  Ö	6R (R!×	 ×	(!Ø	@@ ×	( A GAqE\r  ×	(  (Rµ !Ù	A !Ù	 Ù	!Ú	  AÀ+j6 R  Ø	6R  Ú	6R ( R!Û	 Û	 (RÛ  Û	 (R6  AÀ+j6]  (]) 7] AÝ j  )]7  AÝ j A j¶ @@ (]Ä A AÙ \r @@ +ÐA ·cAqE\r  (Aj!Ü	  Aðj6Ô$  Aj6Ð$  Ü	6Ì$  (Ð$´ ) 7À$ (Ì$!Ý	  )À$7¨K  Aðj6´K  Ý	6°K (´K!Þ	 Þ	Aj )¨K7  Þ	 (°K6  Aðj6Ô?  (Ô?6°O (°O!ß	 ß	Aj!à	 ß	(!á	  à	6´X  á	6°X (´X!â	 â	(!ã	@@ â	( A GAqE\r  â	(  (°Xµ !ä	A !ä	 ä	!å	  AÌ?j6ÀX  ã	6¼X  å	6¸X (ÀX!æ	 æ	 (¸XÛ  æ	 (¼X6  AÌ?j6Ì~  (Ì~) 7À~ AÈþ j  )À~7 AÈþ j Aj¶   (È~ä  +Ð 9Ð (Aj!ç	  Aàj6¼$  Aj6¸$  ç	6´$  (¸$´ ) 7¨$ (´$!è	  )¨$7¸K  Aàj6ÄK  è	6ÀK (ÄK!é	 é	Aj )¸K7  é	 (ÀK6  Aàj6È?  (È?6´O (´O!ê	 ê	Aj!ë	 ê	(!ì	  ë	6 X  ì	6X ( X!í	 í	(!î	@@ í	( A GAqE\r  í	(  (Xµ !ï	A !ï	 ï	!ð	  AÀ?j6¬X  î	6¨X  ð	6¤X (¬X!ñ	 ñ	 (¤XÛ  ñ	 (¨X6  AÀ?j6Ü~  (Ü~) 7Ð~ AØþ j  )Ð~7 AØþ j Aj¶  (Ø~ä !ò	  +Ð ò	¡9Ð (!ó	  AÐj6¤$  Aj6 $  ó	6$  ( $´ ) 7$ ($!ô	  )$7ÈK  AÐj6ÔK  ô	6ÐK (ÔK!õ	 õ	Aj )ÈK7  õ	 (ÐK6  AÐj6¼+  (¼+6ÔP (ÔP!ö	 ö	Aj!÷	 ö	(!ø	  ÷	6R  ø	6üQ (R!ù	 ù	(!ú	@@ ù	( A GAqE\r  ù	(  (üQµ !û	A !û	 û	!ü	  A´+j6R  ú	6R  ü	6R (R!ý	 ý	 (RÛ  ý	 (R6  A´+j6]  (]) 7] AÝ j  )]7 AÝ j Aj¶ @@ (]Ä A¨® AÙ \r   +Ðü7È  )Èç ¹9Ð (!þ	  A¸j6$  Aj6$  þ	6$  ($´ ) 7ø# ($!ÿ	  )ø#7ØK  A¸j6äK  ÿ	6àK (äK!\n \nAj )ØK7  \n (àK6  A¸j6°+  (°+6ØP (ØP!\n \nAj!\n \n(!\n  \n6ìQ  \n6èQ (ìQ!\n \n(!\n@@ \n( A GAqE\r  \n(  (èQµ !\nA !\n \n!\n  A¨+j6øQ  \n6ôQ  \n6ðQ (øQ!\n \n (ðQÛ  \n (ôQ6  A¨+j6°]  (°]) 7 ] A¬Ý j  ) ]7 A¬Ý j Aj¶ @ (¬]Ä AÄ® AÙ \r @@ +ÐA ·cAqE\r  AÄjA¾¯ è @@ +ÐA ·dAqE\r  AÄjAû® è  AÄjA è   (Aj6 A¤j A¼jé  A¤jê !\n A¬j  \n± @@ A¬jA° ½ AqE\r  +Ð!\nA  \n9¨ô  A6ð  A´j6¬? A° 6¨? (¬?Í !\n (¨?!\n  \n6Èf  \n6Äf (Èf!\n \n(!\n \n( !\n  AÄæ j 6Àf \n (ÀfÎ !\n  A ?j6Ôf  \n6Ðf  \n6Ìf (Ôf!\n \n (ÌfÛ  \n (Ðf6  A ?j6´}@@ (´}( A GAsAsAqE\r   +ÐA ·bAq: £ (!\n  Aj6E  \n6E  A¬j6E  (EÍ ) 7E (E!\n AôÄ j \n»   )E7°  Aj6¼  AôÄ j6¸ (¼!\n \nAj )°7  \nAj AôÄ j»  AôÄ jÉ   Aj6 E  A£j6E  ( E6ô (ô!\n \nAj!\n \nAj!\n  \n6  \n6ü (!\n \n(!\n \n( !\n  (üë 6ø \n(!\n \n (ø \nì !\n  AÅ j6  \n6  \n6 (!\n \n (Û  \n (6 (E!\n  AÅ j6ä{  \n6à{ (ä{!\n (à{! \nA !¡\nAÿ  \n-   ¡\nAÿqG!¢\n  \n) 7Ø{  )Ø{7 ¢\nAq AjÜ @ \n(A GAqE\r  \n(Ô As Ají  (!£\n  Aðj6ðD  £\n6ìD  A¬j6èD  (ìDÍ ) 7àD (èD!¤\n AÔÄ j ¤\n»   )àD7À  Aðj6Ì  AÔÄ j6È (Ì!¥\n ¥\nAj )À7  ¥\nAj AÔÄ j»  AÔÄ jÉ   Aðj6ðE  AÐj6ìE  (ðE6à (à!¦\n ¦\nAj!§\n ¦\nAj!¨\n  §\n6ø  ¨\n6ô (ø!©\n ©\n(!ª\n ©\n( !«\n  (ôë 6ð ©\n(!¬\n «\n (ð ¬\nì !­\n  AäÅ j6  ª\n6  ­\n6ü (!®\n ®\n (üÛ  ®\n (6 (ìE!¯\n  AäÅ j6Ô  ¯\n6Ð (Ô!°\n (Ð+ !±\n  °\n) 7È  )È7 ±\n Ajî @ °\n(A GAqE\r  °\n(Ô As Aðjí @ AÄjAä» ï AqE\r  (!²\n  AØj6ÐD  ²\n6ÌD  A¬j6ÈD  (ÌDÍ ) 7ÀD (ÈD!³\n A´Ä j ³\n»   )ÀD7Ð  AØj6Ü  A´Ä j6Ø (Ü!´\n ´\nAj )Ð7  ´\nAj A´Ä j»  A´Ä jÉ   AØj6ÀF  AÄj6¼F  (ÀF6Ì (Ì!µ\n µ\nAj!¶\n µ\nAj!·\n  ¶\n6ð  ·\n6ì (ð!¸\n ¸\n(!¹\n ¸\n( !º\n  (ìë 6è ¸\n(!»\n º\n (è »\nì !¼\n  A´Æ j6ü  ¹\n6ø  ¼\n6ô (ü!½\n ½\n (ôÛ  ½\n (ø6 (¼F!¾\n  A´Æ j6¤  ¾\n6  (¤!¿\n ( !À\n  ¿\n) 7  )7 À\n Ajð @ ¿\n(A GAqE\r  ¿\n(Ô As AØjí @ A¬jA²² A AÔ AGAqE\r  (!Á\n  A¸j6°D  Á\n6¬D  A¬j6¨D  (¬DÍ ) 7 D (¨D!Â\n AÄ j Â\n»   ) D7à  A¸j6ì  AÄ j6è (ì!Ã\n Ã\nAj )à7  Ã\nAj AÄ j»  AÄ jÉ   A¸j6äF  (äF6è (è!Ä\n Ä\nAj!Å\n Ä\nAj!Æ\n  Å\n6ð  Æ\n6ì (ð!Ç\n Ç\n(!È\n Ç\n( !É\n  (ìë 6è É\n (èñ !Ê\n  AÜÆ j6ü  È\n6ø  Ê\n6ô (ü!Ë\n Ë\n (ôÛ  Ë\n (ø6  AÜÆ j6ô  (ô6  () 7ø Aj  )ø7ð Aj Aðj¶  (ä !Ì\n A¸jí   Ì\n9Ð A¬jA¯ Aæ :    +ÐDÍÌÌÌÌÌü?¢D      @@ 9° (!Í\n  Aj6D  Í\n6D  A¬j6D  (DÍ ) 7D (D!Î\n AôÃ j Î\n»   )D7ð  Aj6ü  AôÃ j6ø (ü!Ï\n Ï\nAj )ð7  Ï\nAj AôÃ j»  AôÃ jÉ   Aj6àE  A°j6ÜE  (àE6ä (ä!Ð\n Ð\nAj!Ñ\n Ð\nAj!Ò\n  Ñ\n6à  Ò\n6Ü (à!Ó\n Ó\n(!Ô\n Ó\n( !Õ\n  (Üë 6Ø Ó\n(!Ö\n Õ\n (Ø Ö\nì !×\n  AÔÅ j6ì  Ô\n6è  ×\n6ä (ì!Ø\n Ø\n (äÛ  Ø\n (è6 (ÜE!Ù\n  AÔÅ j6ä  Ù\n6à (ä!Ú\n (à+ !Û\n  Ú\n) 7Ø  )Ø7ø Û\n Aøjî @ Ú\n(A GAqE\r  Ú\n(Ô As Ají  A¬jA¯ Aã :  @ A¬jA± A AÔ AGAqE\r  (!Ü\n  Aøj6ðC  Ü\n6ìC  A¬j6èC  (ìCÍ ) 7àC (èC!Ý\n AÔÃ j Ý\n»   )àC7  Aøj6  AÔÃ j6 (!Þ\n Þ\nAj )7  Þ\nAj AÔÃ j»  AÔÃ jÉ   Aøj6ØF  (ØF6ì (ì!ß\n ß\nAj!à\n ß\nAj!á\n  à\n6Ø  á\n6Ô (Ø!â\n â\n(!ã\n â\n( !ä\n  (Ôë 6Ð ä\n (Ðñ !å\n  AÐÆ j6ä  ã\n6à  å\n6Ü (ä!æ\n æ\n (ÜÛ  æ\n (à6  AÐÆ j6  (6   ( ) 7 Aj  )7à Aj Aàj¶  (ä !ç\n Aøjí   ç\n9 A¬jA¯ Aã :    +D      @@¡D      @¢D      "@£9ð (!è\n  AØj6ÐC  è\n6ÌC  A¬j6ÈC  (ÌCÍ ) 7ÀC (ÈC!é\n A´Ã j é\n»   )ÀC7  AØj6  A´Ã j6 (!ê\n ê\nAj )7  ê\nAj A´Ã j»  A´Ã jÉ   AØj6ÐE  Aðj6ÌE  (ÐE6è (è!ë\n ë\nAj!ì\n ë\nAj!í\n  ì\n6È  í\n6Ä (È!î\n î\n(!ï\n î\n( !ð\n  (Äë 6À î\n(!ñ\n ð\n (À ñ\nì !ò\n  AÄÅ j6Ô  ï\n6Ð  ò\n6Ì (Ô!ó\n ó\n (ÌÛ  ó\n (Ð6 (ÌE!ô\n  AÄÅ j6ô  ô\n6ð (ô!õ\n (ð+ !ö\n  õ\n) 7è  )è7è ö\n Aèjî @ õ\n(A GAqE\r  õ\n(Ô As AØjí  A¬jA¯ Aæ :   A¬jÎ Ak!÷\n@ A¬jAñ¯  ÷\nAÔ AGAqE\r  (!ø\n  A¸j6°C  ø\n6¬C  A¬j6¨C  (¬CÍ ) 7 C (¨C!ù\n AÃ j ù\n»   ) C7   A¸j6¬  AÃ j6¨ (¬!ú\n ú\nAj ) 7  ú\nAj AÃ j»  AÃ jÉ   A¸j6ÌF  (ÌF6ð (ð!û\n û\nAj!ü\n û\nAj!ý\n  ü\n6À  ý\n6¼ (À!þ\n þ\n(!ÿ\n þ\n( !  (¼ë 6¸  (¸ñ !  AÄÆ j6Ì  ÿ\n6È  6Ä (Ì!  (ÄÛ   (È6  AÄÆ j6¤  (¤6´  (´) 7¨ A°j  )¨7Ð A°j AÐj¶  (°ä ! A¸jí   9Ð A¬jÎ Ak! A¬j AAé¯ Ñ   +ÐDR¸ëQ@£9° (!  Aj6C  6C  A¬j6C  (CÍ ) 7C (C! AôÂ j »   )C7°  Aj6¼  AôÂ j6¸ (¼! Aj )°7  Aj AôÂ j»  AôÂ jÉ   Aj6ÀE  A°j6¼E  (ÀE6ì (ì! Aj! Aj!  6°  6¬ (°! (! ( !  (¬ë 6¨ (!  (¨ ì !  A´Å j6¼  6¸  6´ (¼!  (´Û   (¸6 (¼E!  A´Å j6  6 (! (+ !  ) 7ø  )ø7Ø  AØjî @ (A GAqE\r  (Ô As Ají  A¬jÎ Ak! A¬j AAñ¯ Ñ   (ì6ô A 6ð A¬jÉ  AÄjÉ @ (ð    Aj6ô#  Aj6ð# A 6ì#  (ð#´ ) 7à# (ì#!  )à#7èK  Aj6ôK  6ðK (ôK! Aj )èK7   (ðK6  Aj6 -  ( -6P (P! Aj! (!  6üT  6øT (üT! (!@@ ( A GAqE\r  (  (øTµ !A ! !  A-j6U  6U  6U (U!  (UÛ   (U6  A-j6ü]  (ü]6^  (^) 7^ AÞ j  )^7à AÞ j Aàj¶ @@ (^Ä A± Å A GAqE\r   Aøj6Ü#  Aj6Ø# A 6Ô#  (Ø#´ ) 7È# (Ô#!  )È#7øK  Aøj6L  6L (L!   Aj )øK7    (L6  Aøj6-  (-6P (P!¡ ¡Aj!¢ ¡(!£  ¢6èT  £6äT (èT!¤ ¤(!¥@@ ¤( A GAqE\r  ¤(  (äTµ !¦A !¦ ¦!§  A-j6ôT  ¥6ðT  §6ìT (ôT!¨ ¨ (ìTÛ  ¨ (ðT6  A-j6^  (^6¨^  (¨^) 7^ A¤Þ j  )^7  A¤Þ j A j¶ @@ (¤^Ä A® Å A GAqE\r   Aàj6/  A´j6/ AÍ® 6ü.  (/Í ) 7ð. (ü.!©  )ð.7ðc  Aàj6üc  ©6øc (üc!ª ªAj )ðc7  ª (øc6  Aàj6>  (>6d (d!« «Aj!¬ «(!­  ¬6Ðe  ­6Ìe (Ðe!® ®(!¯ ®( !°  AÌå j 6Èe ° (ÈeÎ !±  A>j6Üe  ¯6Øe  ±6Ôe (Üe!² ² (ÔeÛ  ² (Øe6  A>j6ÔZ  (ÔZ6[  ([) 7[ Aðj  )[7 Aðj AjÃ  A 6Ü (ØA G!³A !´ ³Aq!µ ´!¶@ µE\r   AÌj6Ä#  Aðj6À# A6¼#  (À#´ ) 7°# (¼#!·  )°#7L  AÌj6L  ·6L (L!¸ ¸Aj )L7  ¸ (L6  AÌj6-  (-6P (P!¹ ¹Aj!º ¹(!»  º6ÔT  »6ÐT (ÔT!¼ ¼(!½@@ ¼( A GAqE\r  ¼(  (ÐTµ !¾A !¾ ¾!¿  A-j6àT  ½6ÜT  ¿6ØT (àT!À À (ØTÛ  À (ÜT6  A-j6¬^  (¬^6À^  (À^) 7°^ A¼Þ j  )°^7 A¼Þ j Aj¶  (¼^Ä Aé² Å A G!¶@@ ¶AqE\r   (Ø6Ü (ÄA G!ÁA !Â ÁAq!Ã Â!Ä@ ÃE\r   A¼j6¬#  Aðj6¨# A6¤#  (¨#´ ) 7# (¤#!Å  )#7L  A¼j6¤L  Å6 L (¤L!Æ ÆAj )L7  Æ ( L6  A¼j6ü,  (ü,6P (P!Ç ÇAj!È Ç(!É  È6ÀT  É6¼T (ÀT!Ê Ê(!Ë@@ Ê( A GAqE\r  Ê(  (¼Tµ !ÌA !Ì Ì!Í  Aô,j6ÌT  Ë6ÈT  Í6ÄT (ÌT!Î Î (ÄTÛ  Î (ÈT6  Aô,j6Ä^  (Ä^6Ø^  (Ø^) 7È^ AÔÞ j  )È^7 AÔÞ j Aj¶  (Ô^Ä AÍ² Å A G!Ä@ ÄAqE\r   (Ä6Ü (Ü!Ï  A¨j6#  Aðj6# A6#  (#´ ) 7# (#!Ð  )#7¨L  A¨j6´L  Ð6°L (´L!Ñ ÑAj )¨L7  Ñ (°L6  A¨j6.  (.6àO (àO!Ò ÒAj!Ó Ò(!Ô  Ó6ÄV  Ô6ÀV (ÄV!Õ Õ(!Ö@@ Õ( A GAqE\r  Õ(  (ÀVµ !×A !× ×!Ø  A.j6ÐV  Ö6ÌV  Ø6ÈV (ÐV!Ù Ù (ÈVÛ  Ù (ÌV6  A.j6Ì`  (Ì`) 7À` AÈà j  )À`7ø AÈà j Aøj¶   Ï (È`É j-  : »   , »¿ : §  Aj6ü"  Aðj6ø" A6ô"  (ø"´ ) 7è" (ô"!Ú  )è"7¸L  Aj6ÄL  Ú6ÀL (ÄL!Û ÛAj )¸L7  Û (ÀL6  Aj6Ô.  (Ô.6ÌO (ÌO!Ü ÜAj!Ý Ü(!Þ  Ý6¨W  Þ6¤W (¨W!ß ß(!à@@ ß( A GAqE\r  ß(  (¤Wµ !áA !á á!â  AÌ.j6´W  à6°W  â6¬W (´W!ã ã (¬WÛ  ã (°W6  AÌ.j6¼a  (¼a) 7°a A¸á j  )°a7è A¸á j Aèj¶   (¸aÊ : ¦Aÿ - §!äAÿ  ä - ¦uAqAj6 (!å  Aj6ä"  Aðj6à"  å6Ü"  (à"´ ) 7Ð" (Ü"!æ  )Ð"7ÈL  Aj6ÔL  æ6ÐL (ÔL!ç çAj )ÈL7  ç (ÐL6 (!è AÔj A¼jé  AÔjê !é AÜj  é±   Aèj6ðB  è6ìB  AÜj6èB  (ìBÍ ) 7àB (èB!ê AÔÂ j ê»   )àB7À  Aèj6Ì  AÔÂ j6È (Ì!ë ëAj )À7  ëAj AÔÂ j»  AÔÂ jÉ   Aèj6G  Aj6G  (G6Ä (Ä!ì ìAj!í ìAj!î  í6   î6 ( !ï ï(!ð ï( !ñ  (ë 6 ï(!ò ñ ( òì !ó  AøÆ j6¬  ð6¨  ó6¤ (¬!ô ô (¤Û  ô (¨6 (G!õ  AøÆ j6  õ6 (!ö (!÷  ö) 7  )7ð ÷ Aðjò @ ö(A GAqE\r  ö(Ô As Aèjí  AÜjÉ   (ì6ô  AÄj6Ì"  Aj6È" A6Ä"  (È"´ ) 7¸" (Ä"!ø  )¸"7ØL  AÄj6äL  ø6àL (äL!ù ùAj )ØL7  ù (àL6 (!ú Aj A¼jé  Ajê !û A j  û±   A¬j6ÐB  ú6ÌB  A j6ÈB  (ÌBÍ ) 7ÀB (ÈB!ü A´Â j ü»   )ÀB7Ð  A¬j6Ü  A´Â j6Ø (Ü!ý ýAj )Ð7  ýAj A´Â j»  A´Â jÉ   A¬j6ôF  AÄj6ðF  (ôF6È (È!þ þAj!ÿ þAj!  ÿ6  6 (! (! ( !  (ë 6 (!  ( ì !  AèÆ j6  6  6 (!  (Û   (6 (ðF!  AèÆ j6  6 (! (!  ) 7  )7  Ajò @ (A GAqE\r  (Ô As A¬jí  A jÉ   (ì6ô  Aj6´"  Aj6°" A 6¬"  (°"´ ) 7 " (¬"!  ) "7èL  Aj6ôL  6ðL (ôL! Aj )èL7   (ðL6  Aj6ð,  (ð,6P (P! Aj! (!  6¬T  6¨T (¬T! (!@@ ( A GAqE\r  (  (¨Tµ !A ! !  Aè,j6¸T  6´T  6°T (¸T!  (°TÛ   (´T6  Aè,j6Ü^  (Ü^6ð^  (ð^) 7à^ AìÞ j  )à^7Ø AìÞ j AØj¶ @@ (ì^Ä A³ Å A GAqE\r   (Ø6  Aô\rj6"  Aj6" A6"  ("´ ) 7" ("!  )"7øL  Aô\rj6M  6M (M! Aj )øL7   (M6  Aô\rj6ä,  (ä,6P (P! Aj! (!  6T  6T (T! (!@@ ( A GAqE\r  (  (Tµ !A ! !  AÜ,j6¤T  6 T  6T (¤T!  (TÛ   ( T6  AÜ,j6ô^  (ô^6_  (_) 7ø^ Aß j  )ø^7ø Aß j Aøj¶ @ (_Ä AÍ² Å A GAqE\r   (Ä6 (!  AØ\rj6"  Aj6" A6ü!  ("´ ) 7ð! (ü!!  )ð!7M  AØ\rj6M  6M (M!   Aj )M7    (M6  AØ\rj6.  (.6äO (äO!¡ ¡Aj!¢ ¡(!£  ¢6°V  £6¬V (°V!¤ ¤(!¥@@ ¤( A GAqE\r  ¤(  (¬Vµ !¦A !¦ ¦!§  A.j6¼V  ¥6¸V  §6´V (¼V!¨ ¨ (´VÛ  ¨ (¸V6  A.j6Ü`  (Ü`) 7Ð` AØà j  )Ð`7ð AØà j Aðj¶   (Ø`É j!©  AÈ\rj6ì!  Aj6è! A6ä!  (è!´ ) 7Ø! (ä!!ª  )Ø!7M  AÈ\rj6¤M  ª6 M (¤M!« «Aj )M7  « ( M6  AÈ\rj6.  (.6èO (èO!¬ ¬Aj!­ ¬(!®  ­6V  ®6V (V!¯ ¯(!°@@ ¯( A GAqE\r  ¯(  (Vµ !±A !± ±!²  Aø-j6¨V  °6¤V  ²6 V (¨V!³ ³ ( VÛ  ³ (¤V6  Aø-j6ì`  (ì`) 7à` Aèà j  )à`7è Aèà j Aèj¶  (è`É !´ Aè\rj © ´Ð   A´j6? A÷® 6? (?Í !µ (?!¶  µ6àf  ¶6Üf (àf!· ·(!¸ ·( !¹  AÜæ j 6Øf ¹ (ØfÎ !º  A?j6ìf  ¸6èf  º6äf (ìf!» » (äfÛ  » (èf6  A?j6¸}@@ (¸}( A GAsAsAqE\r   A°\rj6ì.  A´j6è. A÷® 6ä.  (è.Í ) 7Ø. (ä.!¼  )Ø.7d  A°\rj6d  ¼6d (d!½ ½Aj )d7  ½ (d6  A°\rj6>  (>6 d ( d!¾ ¾Aj!¿ ¾(!À  ¿6¸e  À6´e (¸e!Á Á(!Â Á( !Ã  A´å j 6°e Ã (°eÎ !Ä  A>j6Äe  Â6Àe  Ä6¼e (Äe!Å Å (¼eÛ  Å (Àe6  A>j6ØZ  (ØZ6üZ  (üZ) 7ðZ AÀ\rj  )ðZ7Ø AÀ\rj AØjÃ  A 6¬\r@ (¬\r!Æ  AÀ\rj6 + ( +!Ç@@ Ç( A GAqE\r  Ç( Á !ÈA !È@ Æ ÈIAqE\r  (¬\r!É  A\rj6Ô!  AÀ\rj6Ð!  É6Ì!  (Ð!´ ) 7À! (Ì!!Ê  )À!7¨M  A\rj6´M  Ê6°M (´M!Ë ËAj )¨M7  Ë (°M6  A \rj6+  A\rj6+  (+6ÜP (ÜP!Ì ÌAj!Í Ì(!Î  Í6ØQ  Î6ÔQ (ØQ!Ï Ï(!Ð@@ Ï( A GAqE\r  Ï(  (ÔQµ !ÑA !Ñ Ñ!Ò  A+j6äQ  Ð6àQ  Ò6ÜQ (äQ!Ó Ó (ÜQÛ  Ó (àQ6  A \rj6üP  A+j6øP  (øP) 7èP AôÐ j  )èP7Ð AôÐ j AÐj¶  (ôP!Ô A \rj Ô·  A \rj Aè\rjó !Õ A \rjÉ @ ÕAqE\r  (¬\rAj!Ö  Aôj6¼!  AÀ\rj6¸!  Ö6´!  (¸!´ ) 7¨! (´!!×  )¨!7¸M  Aôj6ÄM  ×6ÀM (ÄM!Ø ØAj )¸M7  Ø (ÀM6  A\rj6+  Aôj6+  (+6àP (àP!Ù ÙAj!Ú Ù(!Û  Ú6ÄQ  Û6ÀQ (ÄQ!Ü Ü(!Ý@@ Ü( A GAqE\r  Ü(  (ÀQµ !ÞA !Þ Þ!ß  A+j6ÐQ  Ý6ÌQ  ß6ÈQ (ÐQ!à à (ÈQÛ  à (ÌQ6  A\rj6Q  A+j6Q  (Q) 7Q AÑ j  )Q7È AÑ j AÈj¶  (Q!á A\rj á·  (¬\rAj!â  Aäj6¤!  AÀ\rj6 !  â6!  ( !´ ) 7! (!!ã  )!7ÈM  Aäj6ÔM  ã6ÐM (ÔM!ä äAj )ÈM7  ä (ÐM6 A\rj Aäjô !å A\rjÉ @@ åAqE\r  (¬\rAj!æ  AÐj6!  AÀ\rj6!  æ6!  (!´ ) 7ø  (!!ç  )ø 7ØM  AÐj6äM  ç6àM (äM!è èAj )ØM7  è (àM6  AÐj6ô-  (ô-6ìO (ìO!é éAj!ê é(!ë  ê6V  ë6V (V!ì ì(!í@@ ì( A GAqE\r  ì(  (Vµ !îA !î î!ï  Aì-j6V  í6V  ï6V (V!ð ð (VÛ  ð (V6  Aì-j6ü`  (ü`) 7ð` Aøà j  )ð`7¨ Aøà j A¨j¶   (ø`É 6à (!ñ A¤j A¼jé  A¤jê !ò A¬j  ò±   A¸j6°B  ñ6¬B  A¬j6¨B  (¬BÍ ) 7 B (¨B!ó AÂ j ó»   ) B7à  A¸j6ì  AÂ j6è (ì!ô ôAj )à7  ôAj AÂ j»  AÂ jÉ   A¸j6G  Aàj6G  (G6À (À!õ õAj!ö õAj!÷  ö6¸  ÷6´ (¸!ø ø(!ù ø( !ú  (´ë 6° ø(!û ú (° ûì !ü  AÇ j6Ä  ù6À  ü6¼ (Ä!ý ý (¼Û  ý (À6 (G!þ  AÇ j6Ô|  þ6Ð| (Ô|!ÿ (Ð|( !\r  ÿ) 7È|  )È|7° \r A°jÝ @ ÿ(A GAqE\r  ÿ(Ô As A¸jí  A¬jÉ  (¬\rAj!\r  Aj6ô   AÀ\rj6ð   \r6ì   (ð ´ ) 7à  (ì !\r  )à 7èM  Aj6ôM  \r6ðM (ôM!\r \rAj )èM7  \r (ðM6  Aj6ü*  Aj6ø*  (ø*6äP (äP!\r \rAj!\r \r(!\r  \r6°Q  \r6¬Q (°Q!\r \r(!\r@@ \r( A GAqE\r  \r(  (¬Qµ !\rA !\r \r!\r  Að*j6¼Q  \r6¸Q  \r6´Q (¼Q!\r \r (´QÛ  \r (¸Q6  Aj6¨Q  Að*j6¤Q  (¤Q) 7Q A Ñ j  )Q7¸ A Ñ j A¸j¶  ( Q!\r Aj \r·  Aè\rj Ajõ  AjÉ  (!\r AÜj A¼jé  AÜjê !\r Aäj  \r±   Aðj6B  \r6B  Aäj6B  (BÍ ) 7B (B!\r AôÁ j \r»   )B7ð  Aðj6ü  AôÁ j6ø (ü!\r \rAj )ð7  \rAj AôÁ j»  AôÁ jÉ   Aðj6°F  Aè\rj6¬F  (°F6Ð (Ð!\r \rAj!\r \rAj!\r  \r6Ø  \r6Ô (Ø!\r \r(!\r \r( !\r  (Ôë 6Ð \r(!\r \r (Ð \rì !\r  A¤Æ j6ä  \r6à  \r6Ü (ä!\r \r (ÜÛ  \r (à6 (¬F!\r  A¤Æ j6´  \r6° (´!\r (°!\r  \r) 7¨  )¨7À \r AÀjð @ \r(A GAqE\r  \r(Ô As Aðjí  AäjÉ   (ì6ô  (¬\rAj6¬\r (!\r A°j A¼jé  A°jê !\r A¸j  \r±   AÄj6ðA  \r6ìA  A¸j6èA  (ìAÍ ) 7àA (èA!\r AÔÁ j \r»   )àA7  AÄj6  AÔÁ j6 (! \r  \rAj )7   \rAj AÔÁ j»  AÔÁ jÉ   AÄj6 F  Aè\rj6F  ( F6Ô (Ô!¡\r ¡\rAj!¢\r ¡\rAj!£\r  ¢\r6À  £\r6¼ (À!¤\r ¤\r(!¥\r ¤\r( !¦\r  (¼ë 6¸ ¤\r(!§\r ¦\r (¸ §\rì !¨\r  AÆ j6Ì  ¥\r6È  ¨\r6Ä (Ì!©\r ©\r (ÄÛ  ©\r (È6 (F!ª\r  AÆ j6Ä  ª\r6À (Ä!«\r (À!¬\r  «\r) 7¸  )¸7à ¬\r Aàjð @ «\r(A GAqE\r  «\r(Ô As AÄjí  A¸jÉ   (ì6ô Aè\rjÉ   A j6Ü   Aj6Ø  A 6Ô   (Ø ´ ) 7È  (Ô !­\r  )È 7øM  A j6N  ­\r6N (N!®\r ®\rAj )øM7  ®\r (N6  A j6Ø,  (Ø,6 P ( P!¯\r ¯\rAj!°\r ¯\r(!±\r  °\r6T  ±\r6T (T!²\r ²\r(!³\r@@ ²\r( A GAqE\r  ²\r(  (Tµ !´\rA !´\r ´\r!µ\r  AÐ,j6T  ³\r6T  µ\r6T (T!¶\r ¶\r (TÛ  ¶\r (T6  AÐ,j6_  (_6 _  ( _) 7_ Aß j  )_7Ð Aß j AÐj¶ @@ (_Ä Aµ³ Å A GAqE\r   (Ø6  Aj6Ä   Aj6À  A6¼   (À ´ ) 7°  (¼ !·\r  )° 7N  Aj6N  ·\r6N (N!¸\r ¸\rAj )N7  ¸\r (N6  Aj6Ì,  (Ì,6¤P (¤P!¹\r ¹\rAj!º\r ¹\r(!»\r  º\r6ðS  »\r6ìS (ðS!¼\r ¼\r(!½\r@@ ¼\r( A GAqE\r  ¼\r(  (ìSµ !¾\rA !¾\r ¾\r!¿\r  AÄ,j6üS  ½\r6øS  ¿\r6ôS (üS!À\r À\r (ôSÛ  À\r (øS6  AÄ,j6¤_  (¤_6¸_  (¸_) 7¨_ A´ß j  )¨_7 A´ß j Aj¶ @ (´_Ä AÍ² Å A GAqE\r   (Ä6 (!Á\r  Að\nj6¬   Aj6¨  A6¤   (¨ ´ ) 7  (¤ !Â\r  ) 7N  Að\nj6¤N  Â\r6 N (¤N!Ã\r Ã\rAj )N7  Ã\r ( N6  Að\nj6è-  (è-6ðO (ðO!Ä\r Ä\rAj!Å\r Ä\r(!Æ\r  Å\r6ôU  Æ\r6ðU (ôU!Ç\r Ç\r(!È\r@@ Ç\r( A GAqE\r  Ç\r(  (ðUµ !É\rA !É\r É\r!Ê\r  Aà-j6V  È\r6üU  Ê\r6øU (V!Ë\r Ë\r (øUÛ  Ë\r (üU6  Aà-j6a  (a) 7a Aá j  )a7 Aá j Aj¶  Á\r (aÉ j!Ì\r Aj Ì\rAÐ   Aà\nj6   Aj6  A 6   ( ´ ) 7  ( !Í\r  ) 7¨N  Aà\nj6´N  Í\r6°N (´N!Î\r Î\rAj )¨N7  Î\r (°N6  Aà\nj6À,  (À,6¨P (¨P!Ï\r Ï\rAj!Ð\r Ï\r(!Ñ\r  Ð\r6ÜS  Ñ\r6ØS (ÜS!Ò\r Ò\r(!Ó\r@@ Ò\r( A GAqE\r  Ò\r(  (ØSµ !Ô\rA !Ô\r Ô\r!Õ\r  A¸,j6èS  Ó\r6äS  Õ\r6àS (èS!Ö\r Ö\r (àSÛ  Ö\r (äS6  A¸,j6¼_  (¼_6Ð_  (Ð_) 7À_ AÌß j  )À_7 AÌß j Aj¶ @ (Ì_Ä A²³ Å A GAqE\r  A 6Ü\n  Aj¶ 6Ü\n  (Ü\nØ Aj 6Ø\n  (Ü\n (Ø\nA¬  (Ø\n!×\r Aj ×\rè  (Ø\n  A 6Ô\n@@ (Ô\nALAqE\r (Ô\n!Ø\r Aj Ø\r¯ ,  é !Ù\r (Ô\n!Ú\r Aj Ú\r¯  Ù\r:    (Ô\nAj6Ô\n  A6Ð\n@@ (Ð\nALAqE\r (Ð\n!Û\r Aj Û\rAA:ÀÐ   (Ð\nAj6Ð\n  (!Ü\r A¤\nj A¼jé  A¤\njê !Ý\r A¬\nj  Ý\r±   A¸\nj6ÐA  Ü\r6ÌA  A¬\nj6ÈA  (ÌAÍ ) 7ÀA (ÈA!Þ\r A´Á j Þ\r»   )ÀA7  A¸\nj6  A´Á j6 (!ß\r ß\rAj )7  ß\rAj A´Á j»  A´Á jÉ   A¸\nj6F  Aj6F  (F6Ø (Ø!à\r à\rAj!á\r à\rAj!â\r  á\r6¨  â\r6¤ (¨!ã\r ã\r(!ä\r ã\r( !å\r  (¤ë 6  ã\r(!æ\r å\r (  æ\rì !ç\r  AÆ j6´  ä\r6°  ç\r6¬ (´!è\r è\r (¬Û  è\r (°6 (F!é\r  AÆ j6Ô  é\r6Ð (Ô!ê\r (Ð!ë\r  ê\r) 7È  )È7 ë\r Ajð @ ê\r(A GAqE\r  ê\r(Ô As A¸\njí  A¬\njÉ   (ì6ô AjÉ   A\nj6ü  Aj6ø A 6ô  (ø´ ) 7è (ô!ì\r  )è7¸N  A\nj6ÄN  ì\r6ÀN (ÄN!í\r í\rAj )¸N7  í\r (ÀN6  A\nj6´,  (´,6¬P (¬P!î\r î\rAj!ï\r î\r(!ð\r  ï\r6ÈS  ð\r6ÄS (ÈS!ñ\r ñ\r(!ò\r@@ ñ\r( A GAqE\r  ñ\r(  (ÄSµ !ó\rA !ó\r ó\r!ô\r  A¬,j6ÔS  ò\r6ÐS  ô\r6ÌS (ÔS!õ\r õ\r (ÌSÛ  õ\r (ÐS6  A¬,j6Ô_  (Ô_6è_  (è_) 7Ø_ Aäß j  )Ø_7È Aäß j AÈj¶ @ (ä_Ä Aõ² Å A GAqE\r   (Ø6\n  A\nj6ä  Aj6à A6Ü  (à´ ) 7Ð (Ü!ö\r  )Ð7ÈN  A\nj6ÔN  ö\r6ÐN (ÔN!÷\r ÷\rAj )ÈN7  ÷\r (ÐN6  A\nj6¨,  (¨,6°P (°P!ø\r ø\rAj!ù\r ø\r(!ú\r  ù\r6´S  ú\r6°S (´S!û\r û\r(!ü\r@@ û\r( A GAqE\r  û\r(  (°Sµ !ý\rA !ý\r ý\r!þ\r  A ,j6ÀS  ü\r6¼S  þ\r6¸S (ÀS!ÿ\r ÿ\r (¸SÛ  ÿ\r (¼S6  A ,j6ì_  (ì_6ü_  (ü_) 7ð_ Aøß j  )ð_7À Aøß j AÀj¶ @ (ø_Ä AÍ² Å A GAqE\r   (Ä6\n (\n!  Aä	j6Ì  Aj6È A6Ä  (È´ ) 7¸ (Ä!  )¸7ØN  Aä	j6äN  6àN (äN! Aj )ØN7   (àN6  Aä	j6Ü-  (Ü-6ôO (ôO! Aj! (!  6àU  6ÜU (àU! (!@@ ( A GAqE\r  (  (ÜUµ !A ! !  AÔ-j6ìU  6èU  6äU (ìU!  (äUÛ   (èU6  AÔ-j6a  (a) 7a Aá j  )a7¸ Aá j A¸j¶   (aÉ j!  AÔ	j6´  Aj6° A6¬  (°´ ) 7  (¬!  ) 7èN  AÔ	j6øN  6ôN (øN! Aj )èN7   (ôN6  AÔ	j6Ð-  (Ð-6øO (øO! Aj! (!  6ÌU  6ÈU (ÌU! (!@@ ( A GAqE\r  (  (ÈUµ !A ! !  AÈ-j6ØU  6ÔU  6ÐU (ØU!  (ÐUÛ   (ÔU6  AÈ-j6¬a  (¬a) 7 a A¨á j  ) a7° A¨á j A°j¶  (¨aÉ ! Aô	j  Ð  AÈ	jAä» ±  A 6Ä	@@ (Ä	 Aô	jÎ IAqE\r (Ä	! A¸	j Aô	j AÚ   A¸	jA AÞ : ·	 AÈ	j , ·	ÿ  A¸	jÉ   (Ä	Aj6Ä	 @ AÈ	jAä» ï AqE\r   A´j6? AÃ± 6? (?Í ! (?!  6øf  6ôf (øf! (! ( !  Aôæ j 6ðf  (ðfÎ !  A?j6g  6g  6üf (g!  (üfÛ   (g6  A?j6¼}@@ (¼}( A GAsAsAqE\r   AÈ	jA á 9¨	 (! Aüj A¼jé  Aüjê !  A	j   ±   A	j6°A  6¬A  A	j6¨A  (¬AÍ ) 7 A (¨A!¡ AÁ j ¡»   ) A7   A	j6¬  AÁ j6¨ (¬!¢ ¢Aj ) 7  ¢Aj AÁ j»  AÁ jÉ   A	j6°E  A¨	j6¬E  (°E6ð (ð!£ £Aj!¤ £Aj!¥  ¤6  ¥6 (!¦ ¦(!§ ¦( !¨  (ë 6 ¦(!© ¨ ( ©ì !ª  A¤Å j6¤  §6   ª6 (¤!« « (Û  « ( 6 (¬E!¬  A¤Å j6  ¬6 (!­ (+ !®  ­) 7  )7  ® A jî @ ­(A GAqE\r  ­(Ô As A	jí  A	jÉ  (!¯ AÐj A¼jé  AÐjê !° AØj  °±   Aäj6A  ¯6A  AØj6A  (AÍ ) 7A (A!± AôÀ j ±»   )A7°  Aäj6¼  AôÀ j6¸ (¼!² ²Aj )°7  ²Aj AôÀ j»  AôÀ jÉ   Aäj6F  AÈ	j6üE  (F6Ü (Ü!³ ³Aj!´ ³Aj!µ  ´6  µ6 (!¶ ¶(!· ¶( !¸  (ë 6 ¶(!¹ ¸ ( ¹ì !º  AôÅ j6  ·6  º6 (!» » (Û  » (6 (üE!¼  AôÅ j6ä  ¼6à (ä!½ (à!¾  ½) 7Ø  )Ø7¨ ¾ A¨jð @ ½(A GAqE\r  ½(Ô As Aäjí  AØjÉ   (ì6ô AÈ	jÉ  Aô	jÉ  AÔjö    (ô6 A6ð  (ìAj6ì   (ô6 A6ð Aàj÷  (!¿ A j$  ¿ # AÀ k! $    68  64 (8! ø  Aj! (4! Aj  ù   (,6  )$7  )7  Ajú  AÀ j$  # Ak!   6 (y# Ak! $   6   6@@ (A GAq\r  A 6 (!  (6    (  6 (! Aj$  m# A k! $   :    6  6 (!  - :  - !   Aj û 6 (! A j$  1# Ak!   6  6 (!  (6  q# Ak! $   6   6 (!@@ à AqE\r   (6  ( !A ! ! Aj$  # A k! $   6   6  6@@ (A GAq\r  A 6 (!  (6 (!   ( â 6 (! A j$  R# A k! $    6 (!  ) 7  )7  Ajì  A j$ 5# Ak!   6 (!A !Aÿ -  AÿqGAq­# A k! $    6  6 (! (!  6  6 (Aj!  Aj 6  (Ñ ! Aj ü   (6   6 (( A GAsAsAq! A j$  # Ak! $    6  6 (!@  AqE\r  þ @@ ¤ Aq\r  A 6   ( 6 (! Aj$  ^# Ak! $    6 Ü !  Aj 6 Ý !  (   Aj$ £# A k! $   6   6  6 (!@  AqE\r   @@ à Aq\r  A 6  (6 (!   ( â 6 (! A j$  X# Ak! $    6  Ü 6@ (A GAqE\r  ( (  Aj$ t# A k! $    6  6  6  6 (! (! (! AjÚ       AjÆ  A j$ `# Ak! $    6 (A F!A! Aq! !@ \r  ( ! Aq! Aj$  n# Ak! $    :   Ü 6@ (A GAqE\r  (!A !Aÿ  -  AÿqGAq£  Aj$ X# Ak! $    6  Ü 6@ (A GAqE\r  ( (  Aj$ \'# Ak!   6 (! A 6 B# Ak!   6  6  6 (!  (6   (6 2# Ak!   6  6 (( ((GAqD# Ak! $   6 (!   (  (ý  Aj$ \'# Ak!  6   (Aj) 7 j# Ak! $    6  Aj 6@@ (A GAqE\r  ( !A ! Aq! Aj$  j|# Ak! $    6  Aj 6@@ (A GAqE\r  ( !A ·! ! Aj$  i~# Ak! $    6  Aj 6@@ (A GAqE\r  ( !B ! ! Aj$  g# Ak! $    6  Aj 6@@ (A GAqE\r  ( !A ! ! Aj$  /~# Ak!   7 )! B?!   }E# Ak! $    6  6 ( (þ ! Aj$  $# Ak!  6   () 7 # Ak!   6 (( H# Ak! $    6 (! Aj «  (! Aj$  # A k! $   6   6  6@@ (A GAq\r  A 6 (!  (6 (!   ( ª 6 (! A j$  ?# Ak! $    6 (! AjÉ  Aj$  X# Ak! $    9  Ü 6@ (A GAqE\r  ( +Ó  Aj$ K# Ak! $    6  6 ( (½ AsAq! Aj$  S# A k! $    6 (!  ) 7  )7  Aj¶  A j$ y# Ak! $   6   6@@ (A GAq\r  A 6 (!  (6    ( º 6 (! Aj$  R# A k! $    6 (!  ) 7  )7  Aj»  A j$ # Ak! $    6  6  (Ñ 6 ( (Ñ F!A ! Aq! !@ E\r  (Ï  (Ï  (ÿ A F! Aq! Aj$  H# Ak! $    6  6  ( AGAq! Aj$  G# Ak! $    6  6 (!  (  Aj$  C# Ak! $    6 (!  (Ê 6 Aj$  G# Ak! $    6 (!   Ajä  Aj$  # Ak!   6 (c# Ak! $   6  6 (!  (¼ 6    (½  (å  Aj$ \\# Ak! $    6 (!  (6  )7  ) 7  Ajæ  Aj$  	# A k! $   :    6  6 (( ! Aj Â  (è  (é !  (6$ (! (é ! Aj  Ã  ($! A(j  )7  )7  A(j   Ä  (ì !	  - :  - !\n  A(j 	 \nÅ 6 (! A j$  H# Ak! $    6  6 (!  (  Aj$  ¥	# A0k! $    6  6  6 (!  6    Aj6  ( ! A Û  A 6@ (A GAqE\r  (È ! ( As! Aj  Aq   - :   (6  (! ( !	  6,  6(  	6$ (,!\n \n ($Û  \n ((6 Aj ) 7  (! A0j$  c# Ak! $    6  6 (!  (ß 6    (Ú 6 (! Aj$  Q# Ak! $    6  6  6 ( ( (Ó ! Aj$  z# A k! $    6  6 (!  »  Aj ¼  É  ( Aj½ ! Aj¾  A j$  à# A k! $    6  6 (! Ë @ Ô AqE\r     ã Ì   (Ñ 6  (Ô AsAq:   (Í  (!  (6  ) 7  (A §  ( ! A :   Aj¨ A !Aÿ@@ -  AÿqGAqE\r   (GAqE\r  ( (©  (A â @ Ô Aq\r  ( GAqE\r   Ö â  A j$ J# Ak! $    6 (!  Ajé ¿ À  Aj$ # Aðk! $    6@  6<  68  (8Ø 64 A 60@@@ (0AIAqE\r (<! (0AtAë j( ! A+j®     - +Ï 6, A j A,j°  ($!@ ( A G AqA GrAqE\r @@ (<A©² Õ AqE\r  (<!  Aj6\\  6X A©² 6T (X! (T!	  Aj6¨  6¤  	6  (¨!\n \n (¤6  \n ( 6  Aj6h  (h6¼ (¼! ( ! (!\r  6È  \r6Ä (È! Aj!  AÄj 6À  (ÀÑ !  Aà j6Ô  6Ð  6Ì (Ô!  (ÌÛ   (Ð6  Aà j6  () 7x Aj  )x7 Aj Aj¶ @ (Ä Ø  (4GAqE\r  (8! (<!  Aj6P  6L A©² 6H (L! (H!  Aj6´  6°  6¬ (´!  (°6   (¬6  Aj6t  (t6¸ (¸! ( ! (!  6à  6Ü (à! Aj!  AÜj 6Ø  (ØÑ !  Aì j6ì  6è  6ä (ì!  (äÛ   (è6  Aì j6  (6  () 7 Aj  )7  Aj ¶ @  (Ä  (4Ù A GAsAqE\r   (06D  (0Aj60  A6D (D! Aðj$  Î# AÐ k! $    6L  6H  6D (H! ( ! Aj Ì    AjAj (D 6@@@ (A HAq\r  (ANAqE\rAä» ! (!Aë  Atj(!   ±  Aj÷  AÐ j$ # Ak! $    6p  6l  6h  6d (l! ( ! A0j Ì    A0jAj (h 6( ((A N!A ! Aq!	 !\n@ 	E\r  A0jAj! (d!  A j6  6  6 (!\r (!  A j6Ä  \r6À  6¼ (Ä!  (À6   (¼6  A j6  (6Ø (Ø! ( ! (!  6ä  6à (ä! Aj!  Aàj 6Ü  (ÜÑ !  Aj6ð  6ì  6è (ð!  (èÛ   (ì6  Aj6 (( Û As!\n@@ \nAqE\r  A0jAj! (d!  Aj6|  6x  6t (x! (t!  Aj6Ð  6Ì  6È (Ð!  (Ì6   (È6   6¤  Aj6   ( 6Ô (Ô! ( ! (!  6ü  6ø (ü! Aj!   Aøj 6ô   (ôÑ !!  Aj6  6  !6 (!" " (Û  " (6   6¸  Aj6´  (´) 7¨ A°j  )¨7 A°j Aj¶    (°·  A6  Aä» ±  A6 A0j÷  Aj$ .# Ak!   6 (! A 6  A:  1# Ak!   6 (!Aÿ - AqA GAqT# Ak!   6  6  :  (!  (6 A !Aÿ  -  AÿqGAq:  # Ak!   6 (( 9# Ak! $    6 ( ! Aj$  # Ak!   6 (r# Ak! $    6  6 (!@@ ( A GAq\r  A 6  (  ( 6 (! Aj$  # Ak!   6  6  (6 @@@ (!  Aj6 E\r@ ( (\r  A 6 ( (!  (  Alj6    ( 6 (¯# Ak! $    6  6  Aj 6@@ (A GAqE\r  ( !A !  6 @@ ( A GAqE\r  ( ! ( è  (! Aj   Aj$ 1# Ak!   6  6 (!  (6  # Ak!   6 (( c# Ak! $    6 (!@@ õ A|jAK\r   ( 6 A 6 (! Aj$  E# Ak! $    6  6 ( ( ! Aj$  h# Ak! $    6  6 (! Aj ä  (!  (6   (  ! Aj$  d# A k! $   6   6  (6 (! Aj æ  ( Aj ! A j$  H# Ak! $    6  6 ((  ( ! Aj$  u# Ak! $    6  6@@ (A GAqE\r   ( (ð 6  (ì 6 (! Aj$  # Ak! $    6 (! õ Axj! AK@@@@    )  Aq:   )  Aq:  A Aq:  - Aq! Aj$  ># Ak! $    7 ) ­XAq! Aj$  k# Ak! $    7 @@ ) B SAqE\r  A Aq:   )  ­WAq:  - Aq! Aj$   AÝ# Ak! $    6 (! õ A|j! AK@@@@@@@ 	 A !Aÿ  -   AÿqGAq6  )  6  )  6  (  6  +  6 A 6 (! Aj$  U# Ak! $    7@@ ) AqE\r  )§!A ! ! Aj$  U# Ak! $    7@@ ) AqE\r  )§!A ! ! Aj$  f# A k! $    6 Ajæ  ( Aj¤  Aj Ajü  (º ! A j$  V# Ak! $    9@@ +  AqE\r  +ü!A ! ! Aj$  h# Ak! $    9 +¡ ¸f!A ! Aq! !@ E\r  + ¸e! Aq! Aj$   A m# Ak! $    6 A 6@@ (A GAqE\r  (Aj6  (£ 6  (! Aj$  9# Ak! $    6 (Ê ! Aj$  1# Ak!   6 (!Aÿ - AÀ qA GAqU# Ak! $    6 (!@@ ¤ AqE\r  !A ! ! Aj$  r# Ak! $    6 (! õ AÿqAF!A! Aq! !@ \r  õ AÿqAF! Aq! Aj$  # Ak! $    6 (! õ Axj! AK@@@@    ) ¨ Aq:   ) © Aq:  A Aq:  - Aq! Aj$  ># Ak! $    7 )ª ¬XAq! Aj$  h# Ak! $    7 )« ¬Y!A ! Aq! !@ E\r  )ª ¬W! Aq! Aj$   « As	 AxÝ# Ak! $    6 (! õ A|j! AK@@@@@@@ 	 A !Aÿ  -   AÿqGAq6  ) ­ 6  ) ® 6  ( ¯ 6  + ° 6 A 6 (! Aj$  U# Ak! $    7@@ )¨ AqE\r  )§!A ! ! Aj$  U# Ak! $    7@@ )© AqE\r  )§!A ! ! Aj$  f# A k! $    6 Ajæ  ( Aj¤  Aj Ajü  (É ! A j$  V# Ak! $    9@@ +± AqE\r  +ü!A ! ! Aj$  h# Ak! $    9 +« ·f!A ! Aq! !@ E\r  +ª ·e! Aq! Aj$  á# Ak! $    6 (! õ A|j! AK@@@@@@@ 	 A !Aÿ  -   AÿqGAq:   ) ³ :   ) ´ :   ( µ :   + ¶ :  A : Aÿ - ! Aj$  ]# Ak! $    7@@ )· AqE\r  )§Aÿq!A ! Aÿq! Aj$  ]# Ak! $    7@@ )¸ AqE\r  )§Aÿq!A ! Aÿq! Aj$  j# A k! $    6 Ajæ  ( Aj¤  Aj Ajü  (Ê Aÿq! A j$  ^# Ak! $    9@@ +¹ AqE\r  +üAÿq!A ! Aÿq! Aj$  B# Ak! $    7 )º Aÿq­XAq! Aj$  o# Ak! $    7 @@ ) B SAqE\r  A Aq:   ) º Aÿq­WAq:  - Aq! Aj$  p# Ak! $    9 +» Aÿq·f!A ! Aq! !@ E\r  +º Aÿq·e! Aq! Aj$  \n AÿAÿq	 A Aÿq)# Ak!   6 A6 (AjA|qE# Ak! $    6  6 ( (¾ ! Aj$  @# Ak! $    6  6 ( ! Aj$  # Ak!   6 (( V# Ak! $    6  6 (!@ (A GAqE\r   (Á  Aj$ <# Ak! $    6  6 (  Aj$ ]# Ak!   6  6 (!  6@@ (A GAqE\r  (!Aä» !  6  (?# Ak! $   6  6   (ó  Aj$ # A0k! $   6,  6( ((!  (,6$  )7  ) 7 ($!  )7  )7      Æ  A0j$ Ý# A k! $   :    6  6 (! (!  - :    - Ç  Aà j! Aj °  (!@@ (A G AqA GrAq\r  AjÈ E\r  (ö Aq\r  AjA÷   Aà j( 6 (! A j$  # Ak! $   6   6  6 (!  )7  ) 7  A :  Aj!  (6   ( É   (6 Aà jA ÷  Aj$  â# A k! $   :    6  6 (!@@ Ê Aq\r  A Aq:  Ë !@@ A"F\r  A\'F\r @@ AÛ F\r  Aû F\r@ Ajý AqE\r  (þ !  - :     - Ì Aq:   - :    - Í Aq: @ Aj AqE\r  ( !  - :     - Î Aq:   - :    - Ï Aq: @ Aj AqE\r    (Ð Aq:   Ñ Aq: @ Aj AqE\r    (Ò Aq:   Ó Aq:  - Aq! A j$  # Ak!   6 (, 8# Ak!  6   6 (!  (6  A :  ç# Ak! $    6 (!@@@ Ë ! A K@@ ! A !Aÿ -  AÿqG!AA Aq! Aj ÷  Aà j (6  A Aq:  Ô   A:  AAq:  - Aq! Aj$  k# Ak! $    6  (Aj6 (!A !Aÿ@ -  AÿqGAq\r  Õ  , ! Aj$  ´# A0k! $   : -   6(  6$ ((!@@ A-j AqE\r  A jA÷  Aà j ( 6  A Aq: / Ô @ Ê Aq\r  A Aq: /@ AÝ ÀÖ AqE\r  AAq: / A 6 A.j Aj @@@ Aj AqE\r   ($ ( 6@ (A GAq\r  AjA÷  Aà j (6  A Aq: / (!  A-j : \n@   - \nÇ Aq\r  A Aq: /  A-j : 	@  - 	× Aq\r  A Aq: /@ Ê Aq\r  A Aq: /@ AÝ ÀÖ AqE\r  AAq: /@ A,ÀÖ Aq\r  AjA÷  Aà j (6  A Aq: /  - /Aq! A0j$  ¹# A k! $   :    6 (!@@ Aj AqE\r  AjA÷  Aà j (6  A Aq:  Ô @  Aj : @  - × Aq\r  A Aq: @ Ê Aq\r  A Aq: @ AÝ ÀÖ AqE\r  AAq: @ A,ÀÖ Aq\r  AjA÷  Aà j (6  A Aq:   - Aq! A j$  ±# AÀ k! $   : =   68  64 (8!@@ A=j AqE\r  A0jA÷  Aà j (06  A Aq: ? Ô @ Ê Aq\r  A Aq: ?@ Aý ÀÖ AqE\r  AAq: ?@@ Ø Aq\r  A Aq: ?@ Ê Aq\r  A Aq: ?@ A:ÀÖ Aq\r  A,jA÷  Aà j (,6  A Aq: ?   6( A>j A(j @@ A\'j AqE\r  (4!  A(j 6   ( 6 @ ( A GAq\r    6(  (4 ( 6@ (A GAq\r  AjA÷  Aà j (6  A Aq: ? ( ((   ( 6  ( !  A=j : @   - Ç Aq\r  A Aq: ?  A=j : @  - × Aq\r  A Aq: ?@ Ê Aq\r  A Aq: ?@ Aý ÀÖ AqE\r  AAq: ?@ A,ÀÖ Aq\r  AjA÷  Aà j (6  A Aq: ?@ Ê Aq\r  A Aq: ?  - ?Aq! AÀ j$  þ# A k! $   :    6 (!@@ Aj AqE\r  AjA÷  Aà j (6  A Aq:  Ô @ Ê Aq\r  A Aq: @ Aý ÀÖ AqE\r  AAq: @  Aj : @  - × Aq\r  A Aq: @ Ê Aq\r  A Aq: @ A:ÀÖ Aq\r  AjA÷  Aà j (6  A Aq:   Aj : @  - × Aq\r  A Aq: @ Ê Aq\r  A Aq: @ Aý ÀÖ AqE\r  AAq: @ A,ÀÖ Aq\r  AjA÷  Aà j (6  A Aq:   - Aq! A j$  # A k! $    6  6 (!  @@ Ù Aq\r  A Aq:    6 ( (¡  AAq:  - Aq! A j$  ê# Ak! $    6 (!  Ë :  Ô @@@  Ë :  Ô @ ,  , FAqE\r @ , \r  A÷  Aà j ( 6  A Aq: @ , AÜ FAqE\r @ Ë ÀE\r  Ô   AAq:  - Aq! Aj$  ù# A k! $    6  6 (! A :   Ë : @ , Ú !A ! Aq! !@ E\r Aÿ - A?H!@ AqE\r  Ô  - ! A j!	 - !\n  \nAj:  	 \nAÿqj :    Ë :  A j!Aÿ  - jA :    -  : @@ , Aô FAqE\r  (AAq£ Aÿ@ - AGAqE\r  AjA÷  Aà j (6  A Aq:  AAq: @ , Aæ FAqE\r  (A Aq£ Aÿ@ - AGAqE\r  AjA÷  Aà j (6  A Aq:  AAq: @ , Aî FAqE\r Aÿ@ - AGAqE\r  AjA÷  Aà j (6  A Aq:  AAq: @ A j (¤ Aq\r  A÷  Aà j ( 6  A Aq:  AAq:  - Aq! A j$  u# Ak! $    6 (!  Ë : @@ , Ú AqE\r Ô   Ë :  AAq! Aj$  8# Ak! $    6 (AjÛ  Aj$ m# Ak! $    6 (!  Ü 6@@ (A JAqE\r  (!A !  :  A:  Aj$ }# Ak! $    6  :  (!@@ Ë À , GAqE\r  A Aq:  Ô  AAq:  - Aq! Aj$  ý# Ak! $   :    6 (!@@ Ê Aq\r  A Aq:  Ë !@@ A"F\r  A\'F\r @@ AÛ F\r  Aû F\r  - :    - Í Aq:   - :    - Ï Aq:   Ñ Aq:   Ó Aq:  - Aq! Aj$  # Ak! $    6 (!  @@ Ë ÀÝ AqE\r   Ù Aq:   Þ Aq:  - Aq! Aj$  ­# A0k! $    6( ((! A jº   Ë :  Ô @@@  Ë :  Ô @ ,  , FAqE\r @ , \r  AjA÷  Aà j (6  A Aq: /@ , AÜ FAqE\r   Ë : @ , \r  AjA÷  Aà j (6  A Aq: /@ , Aõ FAqE\r  Ô @  Ajß Aq\r  A Aq: / A j!Aÿÿ@  /¼ AqE\r  A j½  ¾   , ¿ : @ , \r  AjA÷  Aà j (6  A Aq: / Ô   , À   A ÀÀ @ Á Aq\r  AjA÷  Aà j (6  A Aq: / AAq: / - /Aq! A0j$  # Ak! $    : A0!A9! ,  À Àá !A! Aq! !@ \r Aß !Aú !	 ,  À 	Àá !\nA! \nAq! ! \r AÁ !\rAÚ ! ,  \rÀ Àá !A! Aq! ! \r  , A+F!A! Aq! ! \r  , A-F!A! Aq! ! \r  , A.F! Aq! Aj$  !# Ak!   6 (A : 8# Ak!   6 (! ( !  Aj6 Aÿ -  F# Ak!   :  , A\'F!A! Aq! !@ \r  , A"F! Aq# A k! $    6 (!  Ë : @@@ , Ú AqE\r @ Ô   , À   Ë :  , Ú Aq\r  AjA÷  Aà j (6  A Aq:  A ÀÀ @ Á Aq\r  AjA÷  Aà j (6  A Aq:  AAq:  - Aq! A j$  Ý# A k! $    6  6 (! (A ;  A : @@@Aÿ - AHAqE\r  Ë : A !Aÿ@ -  AÿqGAq\r  AjA÷  Aà j (6  A Aq:   , à : Aÿ@ - AJAqE\r  AjA÷  Aà j (6  A Aq:  (!Aÿÿ / At!Aÿ  - r! ( ;  Ô   - Aj:   AAq:  - Aq! A j$  b# Ak!   : @@ , AÁ HAqE\r   , A0k:   , A_q:   , AÁ kA\nj: Aÿ - [# Ak!   :   :   : \r ,  , L!A ! Aq! !@ E\r  ,  , \rL! AqÌ# A k! $   6   6  6 (!@@ Ajã AqE\r  A 6  (6   (¶ 6@ (A GAqE\r   ( 6  (6 (!   ( ä 6 (! A j$  (# Ak!   6 (( A GAsAq²# A k! $   6   6  6 (!   ( 6 (!  (6 (!@@  ( å Aq\r   (æ  A 6  ( 6 (! A j$  # A k! $   6   6  6@@ (A GAq\r  A Aq:  (!  (6 (!   ( ç Aq:  - Aq! A j$  ¶# Ak! $    6  6 (!@@ (A GAq\r    (è 6  (Ê 6 @@ (A GAqE\r  ( ( é   ( 6  ( A GAq\r   (6 Aj$ W# A k! $   6   6  6 ( Ajê ë AAq! A j$  ¡# A k! $    6  6  (( 6@@@ (A GAqE\r  (Ê 6@ ( (FAqE\r   (6  (6  A 6 (! A j$  S# Ak!   6  6 (!@@ (A GAqE\r  ( kAm!A !  6# Ak!   6 (( A# Ak!   6  6 (!Aÿ  - Aÿ q:   (6­	# AÐ k! $    6  (6 (! ( ! (!  6(  6$ ((! Aj!  A$j 6   ( Ñ !  Aj64  60  6, (4!	 	 (,Û  	 (06  6L  Aj6H (L!\n  (H) 7@  \n) 78  )@7  )87  Aj í @ \n(A GAqE\r  \n(Ô As AÐ j$ "  Ü   Ü  Ý î §# Ak! $    6  6  6 @@ (A GAq\r  A Aq: @ (A GAq\r  (ï  AAq:   ( ( ( ð Aq:  - Aq! Aj$  ;# Ak! $    6 (A Aÿq  Aj$ # A0k! $    6(  6$  6  ((! ($õ !@@@ AF\r @ AF\r @ A F\r  AÀ G\r  þ  ($ ( ñ Aq: /    ($ ( ñ Aq: /  ($( 6  AjÌ 6 ( !   ( ò Aq: / ($( ! ($(! Aj  ó  ( !	  )7   Aj 	ô Aq: /  ($õ Aÿq   ($) 7  AAq: / - /Aq!\n A0j$  \n# A0k! $    6(  6$  6  ((!    ($( 6@@@ (A GAqE\r@@ (È A GAqE\r @@ ( AqE\r   (È 6  AjÌ 6 ( !   ( õ 6  (È 6  Aj 6 ( !   ( ä 6   (  6@ (A GAq\r  A Aq: /@ ( (  ( ð Aq\r  A Aq: /  (Ê 6  AAq: / - /Aq! A0j$  f# A k! $   6   6  6 (!  (6 (!  ( ö Aq! A j$  D# Ak! $   6  6   ( (û  Aj$ ã# A k! $    6  6 (! (!  ÷ 6 ø ! Aj Aj ù    Ajú 6@@ (A GAqE\r  AAÿq   (6   ø 6 AAq:  A Aÿq  A Aq:  - Aq! A j$  ²# A k! $   6   6  6 (!   ( 6 (!  (6 (!@@  ( ü Aq\r   (æ  A 6  ( 6 (! A j$  Æ# A k! $   6   6  6 (!@@ Ajã AqE\r  ï  AAq:   ( Ajþ 6@ (A GAq\r  ï  A Aq:   (¡  AAq:  - Aq! A j$  # Ak!   6 (( # Ak!   6 ((G# Ak! $   6  6   ((  (  Aj$ õ# A k! $    6  6 (!@@ ( AqE\r  A 6   ( 6@ (A GAqE\r   (6  ( 6   (Aj 6@ (A GAqE\r  ( ( (  ( (jA :    (6 (! A j$  B# Ak!   6  6  6 (!  (6   (6 # A k! $   6   6  6@@ (A GAq\r  A Aq:  (!  (6 (!   ( ý Aq:  - Aq! A j$  # A k! $   6   6  6  ( Ajþ 6@@ (A GAq\r  A Aq:  ( (  AAq:  - Aq! A j$  õ# A k! $    6  6 (!@@ (ã AqE\r  A 6   (Í 6@ (A GAqE\r   (6  (ÿ 6   (Aj 6@ (A GAqE\r  ( ( (  ( (jA :    (6 (! A j$  f# Ak! $    6 (!@@ ( A GAq\r  A 6  ( Ø 6 (! Aj$  # Ak! $    6  6 (!@@  (³ Aq\r  A:  A 6  (6   ( (j6 Î   ( 6 (! Aj$  S# Ak!   6  6  6 (! (! ( ! (!@ E\r    ü\n  (# Ak!   6 (( A GAsAqÒ# Ak! $    6  6 (!  ( 6 @@@ (  (IAqE\r@ ( (  \r   ( 6@@ ( !A !Aÿ -   AÿqGAqE\r  ( Aj6    ( Aj6   A 6 (! Aj$  # Ak!   6 ((S# Ak!   6  6  6 (! (! ( ! (!@ E\r    ü\n  B# Ak!   6  6  6 (!  (6   (6 Q# Ak! $    6  6 (! (  ( ( ! Aj$  ­# Ak! $    6  6  6 @@ ( (FAqE\r  A 6@ (A GAq\r  A6@ (A GAq\r  A6  ( ( ( Ù 6 (! Aj$  C# Ak! $    6 (õ AÿqA FAq! Aj$  # A k! $   6   6  6@@ (A GAq\r  A Aq:  (!  (6 (!   (  Aq:  - Aq! A j$  f# A k! $   6   6  6 (!  (6 (!  (  Aq! A j$  |# A k! $   6   6  6 (!@@ Ajã AqE\r  ï   Ajê  AAq! A j$  P# Ak! $    6  6 (! AAÿq   (6  Aj$ P# Ak! $    6  6 (! A\nAÿq   47  Aj$ P# Ak! $    6  6 (! A\nAÿq   47  Aj$ Ê# Ak! $    6 (! õ ! AK@@@@@@ \r A !Aÿ  -   AÿqGAq:   ) B RAq:   + A ·bAq:  A Aq:  AAq:  - Aq! Aj$  Ù|# Ak! $    6 (! õ A|j! AK@@@@@@@ 	  -  !D        ! D      ð?  9  ) º9  ) ¹9  (  9  + 9 A ·9 +! Aj$  h|# A k! $    6 Ajæ  ( Aj¤  Aj Ajü  (ä ! A j$  à~# Ak! $    6 (! õ A|j! AK@@@@@@@ 	 A !Aÿ  -   AÿqGAq­7  )  7  )  7  (  7  +  7 B 7 )! Aj$  V~# Ak! $    7@@ ) AqE\r  )!B ! ! Aj$  V~# Ak! $    7@@ ) AqE\r  )!B ! ! Aj$  h~# A k! $    6 Ajæ  ( Aj¤  Aj Ajü  (å ! A j$  X~# Ak! $    9@@ + AqE\r  +ü!B ! ! Aj$  =# Ak! $    7 ) XAq! Aj$  # Ak!   7AAqh# Ak! $    9 + ¹f!A ! Aq! !@ E\r  + ¹e! Aq! Aj$    B BÝ# Ak! $    6 (! õ A|j! AK@@@@@@@ 	 A !Aÿ  -   AÿqGAq6  )  6  )  6  (   6  + ¡ 6 A 6 (! Aj$  U# Ak! $    7@@ )¢ AqE\r  )§!A ! ! Aj$  U# Ak! $    7@@ )£ AqE\r  )§!A ! ! Aj$  f# A k! $    6 Ajæ  ( Aj¤  Aj Ajü  (æ ! A j$  V# Ak! $    9@@ +¤ AqE\r  +ü!A ! ! Aj$  ># Ak! $    7 )¥ ­XAq! Aj$  k# Ak! $    7 @@ ) B SAqE\r  A Aq:   ) ¥ ­WAq:  - Aq! Aj$  h# Ak! $    9 +¦ ¸f!A ! Aq! !@ E\r  +¥ ¸e! Aq! Aj$   A A V# Ak!   6  6 (! - ! - !Aÿ !   q Aqr:    - q: 2# Ak!   6  6 (-  ! ( :  e# Ak! $    6  6 (!  Ï  (jAj Ï  Ñ jAjâ  Aj$ Ì# A k! $   6   6  6 (!@@ Aj¬ AqE\r  A 6  (6   (­ 6@ (A GAqE\r   ( 6  (6 (!   ( ® 6 (! A j$  1# Ak!   6  6 (!  (6  # Ak!   6A Aq# Ak! $   6   6  (( 6@@ (A GAqE\r (È !@ Aj ¯ \r   (Ê 6  (! Aj$  ²# A k! $   6   6  6 (!   ( 6 (!  (6 (!@@  ( ° Aq\r   (æ  A 6  ( 6 (! A j$  r# Ak! $    6  6 (!@@ (A GAq\r  A6  (  (× 6 (! Aj$  # A k! $   6   6  6@@ (A GAq\r  A Aq:  (!  (6 (!   ( ± Aq:  - Aq! A j$  # A k! $   6   6  6  ( Aj² 6@@ (A GAq\r  A Aq:  ( (  AAq:  - Aq! A j$  õ# A k! $    6  6 (!@@ (¬ AqE\r  A 6   (³ 6@ (A GAqE\r   (6  (´ 6   (Aj 6@ (A GAqE\r  ( ( (µ  ( (jA :    (6 (! A j$  Ò# Ak! $    6  6 (!  ( 6 @@@ (  (IAqE\r@ ( ( ¯ \r   ( 6@@ ( !A !Aÿ -   AÿqGAqE\r  ( Aj6    ( Aj6   A 6 (! Aj$  <# Ak! $    6 (( Ñ ! Aj$  l# Ak! $    6  6  6 (! (! ( ¶ ! (!@ E\r    ü\n   Aj$ x# Ak! $    6  Ü 6  Ý 6 (!  (ë 6  (!  (  · Aq! Aj$  # A k! $   6   6  6@@ (A GAq\r  A Aq:  (!  (6 (!   ( ¸ Aq:  - Aq! A j$  f# A k! $   6   6  6 (!  (6 (!  ( ¹ Aq! A j$  Æ# A k! $   6   6  6 (!@@ Aj¬ AqE\r  ï  AAq:   ( Aj² 6@ (A GAq\r  ï  A Aq:   (¡  AAq:  - Aq! A j$  # Ak! $   6   6 (!  (6    ( ­ 6@@ (A GAqE\r  ( !A ! ! Aj$  ¾\n# AÐ k! $    6  (6  ( ! Aj! (!  6(  6$ ((! (!@@ ( A GAqE\r  (  ($µ !A ! !	  Aj64  60  	6, (4!\n \n (,Û  \n (06  6L  Aj6H (L!  (H) 7@  ) 78  )@7  )87  Aj í @ (A GAqE\r  (Ô As AÐ j$ E# Ak! $    6  6 (!  »  Aj$  ë# A0k! $    6  6  (6 (! Aj! (!  6   6 ( ! (!@@ ( A GAqE\r  (  (µ !A ! !	  Aj6,  6(  	6$ (,!\n \n ($Û  \n ((6 (! Aj ¿ ! A0j$  <# Ak! $    6 (! É  Aj$  H# Ak! $    6  6 ((  (À ! Aj$  u# Ak! $    6  6@@ (A GAqE\r   ( (Á 6  (Â 6 (! Aj$  # Ak! $    6  6 (! õ A~j! A>K@@@@@@@@@@ ?   ( + Ã 6  ( Ä 6  ( Å 6  ( ( Æ 6  ( (  (Ç 6  ( ) È 6  ( ) É 6 (!A !Aÿ   -   AÿqGAqA GAqÊ 6  (Â 6 (! Aj$  j# Ak! $    6  (ë 6@@ Aj¬ AqE\r  A6 A 6 (! Aj$   # Ak!   6  9 A  # Ak!   6  6A  # Ak!   6  6A ¡# A k! $    6  6  (ë 6 (!  Aj ¯ 6@@ (A HAqE\r  A6@ (A JAqE\r  A6 A6 (! A j$  \'# Ak!   6  6  6A  # Ak!   6  7 A  # Ak!   6  7 A  # Ak!   6  : A a# Ak! $    6 (!  Ï  Ñ jAj Ï  á jAjâ  Aj$ M# Ak! $    6  6  6 ( ( (Î  Aj$ A# Ak! $    6  6 ( (Ï  Aj$ J# Ak! $    6  6  6 ( (AÐ  Aj$ # Ak!   6  6# Ak! $    6  6  6  (A t6 @@ (Ñ AqE\r  ( (  (¡  ( (   Aj$ "# Ak!   6 (AKAqo         ¡ ¢ £ ¤ ¥ ¦ § ¨ © ª « @@@ AI\r    rAq\r@  (  ( G\r Aj!  Aj!  A|j"AK\r  E\r@@  -  " -  "G\r Aj!  Aj!  Aj"E\r   kA Y -  !@  -  "E\r   AÿqG\r @ - !  - "E\r Aj!  Aj!   AÿqF\r   Aÿqk  @    ü\n    @ AI\r     Õ    j!@@   sAq\r @@  Aq\r   !@ \r   !  !@  -  :   Aj! Aj"AqE\r  I\r  A|q!@ AÀ I\r   A@j"K\r @  ( 6   (6  (6  (6  (6  (6  (6  (6  ( 6   ($6$  ((6(  (,6,  (060  (464  (868  (<6< AÀ j! AÀ j" M\r   O\r@  ( 6  Aj! Aj" I\r @ AO\r   !@ AO\r   ! A|j!  !@  -  :    - :   - :   - :  Aj! Aj" M\r @  O\r @  -  :   Aj! Aj" G\r   -@  Ø Aj" "\r A     Ö   !@@  AqE\r @  -  \r     k  !@ Aj"AqE\r -  \r @ "Aj!A ( "k rAxqAxF\r @ "Aj! -  \r    ku@ \r A @@  -  "\r A ! @@ Aÿq -  "G\r E\r Aj"E\r Aj!  - !  Aj!  \r A ! Aÿq!    -  kû@@@@ Aÿq"E\r @  AqE\r  Aÿq!@  -  "E\r  F\r  Aj" Aq\r A  ( "k rAxqAxG\r Al!@A  s"k rAxqAxG\r  (!  Aj"!  A krAxqAxF\r     Ø j  !@ " -  "E\r  Aj!  AÿqG\r       Ú " A   -   AÿqFé A G!@@@  AqE\r  E\r  Aÿq!@  -   F\r Aj"A G!  Aj" AqE\r \r  E\r@  -   AÿqF\r  AI\r  AÿqAl!@A  (  s"k rAxqAxG\r  Aj!  A|j"AK\r  E\r Aÿq!@@  -   G\r     Aj!  Aj"\r A @ ,  "\r   A !@   Û " E\r @ - \r     - E\r @ - \r    Þ   - E\r @ - \r    ß   - E\r @ - \r    à    á ! w  - "A G!@ E\r   -  At r" -  At - r"F\r   Aj!@ " - "A G! E\r  Aj! AtAþq r" G\r   A    Aj!  - "A G!@@ E\r   - At  -  Atr Atr" - At -  Atr - Atr"F\r @ Aj! - " A G!  E\r !   rAt" G\r  ! A~jA     Aj!  - "A G!@@ E\r   - At  -  Atr  - Atr r" (  " AÿüqAx  AxAÿüqr"F\r @ Aj! - " A G!  E\r ! At  r" G\r  ! A}jA  # A k"$  B 7 B 7 B 7 B 7A !@@@@@@ -  "\r A!A!@   j-  E\r  AÿqAtj Aj"6  Aj AvAqj" ( A tr6   j-  "\r A!A! AK\rA!A!A ! A !	A!\nA!@@@  j j-  "  j-  "G\r @  \nG\r  \n 	j!	A! Aj!@  M\r   k!\nA! !	A! 	! 	Aj!	A!\n  	j" I\r A!A !A!	A!A!@@@  j j-  "  	j-  "G\r @  G\r   j!A! Aj!@  O\r  	 k!A! 	!A! ! Aj!A!  j"	 I\r  \n!@@     Aj AjK""\nj   "Aj"Ó E\r    Asj"  KAj!\nA !\r  \nk!\r A?r!A !  !@ !	@   "k O\r A !  A  Ü "  j ! E\r   k I\rA ! Aj  j" Aj-  "AvAqj(  vAqE\r @   Atj( "F\r    k" 	  	Kj! A !@   	  	K""j-  " E\r @@  Aÿq  j-  G\r  Aj"j-  " E\r    kj! A ! !@ E\r @@  Aj"j-    j-  G\r  	M\r   \nj!  \r! !  A j$    A°ô ×~# Ak"$ @@@@ A$J\r A !  -  "\r  !â A6 B !  !@@ Àä E\r - ! Aj"! \r  !@ Aÿq"AUj  AA  A-F! Aj!@@ ArAG\r  -  A0G\r A!	@ - AßqAØ G\r  Aj!A!\n Aj! A !\n A\n !\nA !	 \n­!A !B !@@@ -  "APj"AÿqA\nI\r @ AjAÿqAK\r  A©j! A¿jAÿqAK\r AIj! \n AÿqL\r  B  B  A!@ )B R\r   ~"\r ­Bÿ"BV\r  \r |!A!	 ! Aj! ! @ E\r      	6 @@@ E\r â AÄ 6  A  BP! !  T\r@ \r  §Aq\r â AÄ 6  B|!  X\r â AÄ 6   ¬" }! Aj$     A F  AwjAIr     Bã      Bÿÿÿÿã §     Bã §   A r    A¿jAI   Aß q    AjAI	    @  \r A â   6 A      (<ì  ë # A k"$    ("6  (!  6  6   k"6  j! Aj!A!@@@@@  (< AjA Aj ë E\r  !@  ("F\r@ AJ\r  ! AA   ("K"	j" (   A  	k"j6  AA 	j" (  k6   k! !  (<   	k" Aj ë E\r  AG\r    (,"6   6     (0j6 !A !  A 6  B 7    ( A r6  AF\r   (k! A j$  K# Ak"$     Aÿq Aj ë ! )! Aj$ B     (<  ï  A* ñ  A¼ô Nò ! A A 6ìô A   6Ôô A A A k6ðô A A (ê 6ôô  A    A¼õ ö AÀõ  A¼õ ÷ \\    (H"Aj r6H@  ( "AqE\r    A r6 A  B 7    (,"6   6     (0j6A   A  Ü "  k  ¬A!@@  E\r  Aÿ M\r@@A (ê ( \r  AqA¿F\râ A6 @ AÿK\r    A?qAr:    AvAÀr:  A@@ A°I\r  A@qAÀG\r   A?qAr:    AvAàr:     AvA?qAr: A@ A|jAÿÿ?K\r    A?qAr:    AvAðr:     AvA?qAr:    AvA?qAr: Aâ A6 A!    :  A @  \r A    A ü ~@  ½"B4§Aÿq"AÿF\r @ \r @@  D        b\r A !  D      ðC¢ þ !  ( A@j!  6     Axj6  BÿÿÿÿÿÿÿBð?¿!   æ@@ ("\r A ! ú \r (!@   ("kM\r      ($  @@ (PA H\r  E\r  !@@   j"Aj-  A\nF\r Aj"E\r      ($  " I\r  k! (!  !A !   Ö   ( j6  j! ,@    l" ÿ " G\r  A    nò~@ E\r    :     j"Aj :   AI\r    :    :  A}j :   A~j :   AI\r    :  A|j :   A	I\r   A   kAq"j" AÿqAl"6    kA|q"j"A|j 6  A	I\r   6  6 Axj 6  Atj 6  AI\r   6  6  6  6 Apj 6  Alj 6  Ahj 6  Adj 6   AqAr"k"A I\r  ­B~!  j!@  7  7  7  7  A j! A`j"AK\r   æ# AÐk"$   6Ì A jA A(ü   (Ì6È@@A   AÈj AÐ j A j   A N\r A!     ( "A_q6 @@@@  (0\r   AÐ 60  A 6  B 7  (,!   6,A !  (\rA!  ú \r    AÈj AÐ j A j   ! A q!@ E\r   A A   ($    A 60   6,  A 6  (!  B 7 A !    ( " r6 A  A q!  AÐj$   ~# AÀ k"$   6< A)j! A\'j!	 A(j!\nA !A !@@@@@A !\r@ ! \r AÿÿÿÿsJ\r \r j! !\r@@@@@@ -  "E\r @@@@ Aÿq"\r  \r! A%G\r \r!@@ - A%F\r  ! \rAj!\r - ! Aj"! A%F\r  \r k"\r Aÿÿÿÿs"J\r\n@  E\r     \r  \r\r  6< Aj!\rA!@ , APj"A	K\r  - A$G\r  Aj!\rA! !  \r6<A !@@ \r,  "A`j"AM\r  \r!A ! \r!A t"AÑqE\r @  \rAj"6<  r! \r, "A`j"A O\r !\rA t"AÑq\r @@ A*G\r @@ , APj"\rA	K\r  - A$G\r @@  \r   \rAtjA\n6 A !  \rAtj( ! Aj!A! \r Aj!@  \r   6<A !A !  ( "\rAj6  \r( !A !  6< AJ\rA  k! AÀ r! A<j "A H\r (<!A !\rA!@@ -  A.F\r A !@ - A*G\r @@ , APj"A	K\r  - A$G\r @@  \r   AtjA\n6 A !  Atj( ! Aj! \r Aj!@  \r A !  ( "Aj6  ( !  6< AJ!  Aj6<A! A<j ! (<!@ \r!A! ",  "\rAjAFI\r Aj! A:l \rjAïÄ j-  "\rAjAÿqAI\r   6<@@ \rAF\r  \rE\r\r@ A H\r @  \r   Atj \r6 \r   Atj) 70  E\r	 A0j \r    AJ\rA !\r  E\r	  -  A q\r Aÿÿ{q"  AÀ q!A !AÂ­ ! \n!@@@@@@@@@@@@@@@@@ -  "À"\rASq \r AqAF \r "\rA¨j!	\n  \n!@ \rA¿j  \rAÓ F\rA !AÂ­ ! )0!A !\r@@@@@@@   (0 6  (0 6  (0 ¬7  (0 ;  (0 :   (0 6  (0 ¬7  A AK! Ar!Aø !\rA !AÂ­ ! )0" \n \rA q ! P\r AqE\r \rAvAÂ­ j!A!A !AÂ­ ! )0" \n ! AqE\r   k"\r  \rJ!@ )0"BU\r  B  }"70A!AÂ­ !@ AqE\r A!AÃ­ !AÄ­ AÂ­  Aq"!  \n !  A Hq\r Aÿÿ{q  !@ B R\r  \r  \n! \n!A !  \n k Pj"\r  \rJ!\r - 0!\r (0"\rA÷¹  \r!   Aÿÿÿÿ AÿÿÿÿIû "\rj!@ AL\r  ! \r!\r ! \r! -  \r )0"PE\rA !\r	@ E\r  (0!A !\r  A  A    A 6  >  Aj60 Aj!A!A !\r@@ ( "E\r Aj ý "A H\r   \rkK\r Aj!  \rj"\r I\r A=! \rA H\r\r  A   \r  @ \r\r A !\rA ! (0!@ ( "E\r Aj ý " j" \rK\r   Aj   Aj!  \rI\r   A   \r AÀ s   \r  \rJ!\r	  A Hq\r\nA=!   +0    \r   "\rA N\r \r- ! \rAj!\r   \r\n E\rA!\r@@  \rAtj( "E\r  \rAtj    A! \rAj"\rA\nG\r @ \rA\nI\r A!@  \rAtj( \rA! \rAj"\rA\nF\r A!  \r: \'A! 	! \n! ! \n!   k"  J" AÿÿÿÿsJ\rA=!   j"  J"\r K\r  A  \r          A0 \r  As   A0  A         A  \r  AÀ s  (<!A !A=!â  6 A! AÀ j$   @  -  A q\r     ÿ {A !@  ( ",  APj"A	M\r A @A!@ AÌ³æ K\r A  A\nl"j  AÿÿÿÿsK!   Aj"6  , ! ! ! APj"A\nI\r  ¾ @@@@@@@@@@@@@@@@@@@ Awj 	\n\r  ( "Aj6    ( 6   ( "Aj6    4 7   ( "Aj6    5 7   ( "Aj6    4 7   ( "Aj6    5 7   ( AjAxq"Aj6    ) 7   ( "Aj6    2 7   ( "Aj6    3 7   ( "Aj6    0  7   ( "Aj6    1  7   ( AjAxq"Aj6    ) 7   ( "Aj6    5 7   ( AjAxq"Aj6    ) 7   ( AjAxq"Aj6    ) 7   ( "Aj6    4 7   ( "Aj6    5 7   ( AjAxq"Aj6    + 9       5 @  P\r @ Aj"  §Aq- É  r:    B" B R\r  . @  P\r @ Aj"  §AqA0r:    B" B R\r  {~@  BT\r @ Aj"  " B\n" B\n~}§A0r:   BÿÿÿÿV\r @  P\r   §!@ Aj"  A\nn"A\nlkA0r:   A	K! ! \r  # Ak"$ @  L\r  AÀq\r     k"A AI" @ \r @   A  A~j"AÿK\r       Aj$      A A  Ä~~|# A°k"$ A ! A 6,@@  "BU\r A!	AÌ­ !\n " !@ AqE\r A!	AÏ­ !\nAÒ­ AÍ­  Aq"	!\n 	E!@@ Bøÿ Bøÿ R\r   A   	Aj" Aÿÿ{q    \n 	   Aí¯ A´  A q"A± A ´    bA   A    AÀ s     J!\r Aj!@@@@  A,jþ "  "D        a\r   (,"Aj6, A r"Aá G\r A r"Aá F\rA  A H! (,!  Acj"6,A  A H! D      °A¢! A0jA A  A Hj"!@  ü"6  Aj!  ¸¡D    eÍÍA¢"D        b\r @@ AN\r  ! ! ! ! !@ A AI!@ A|j" I\r  ­!B !@  5   |" BëÜ"BëÜ~}>  A|j" O\r  BëÜT\r  A|j" > @@ " M\r A|j"( E\r   (, k"6, ! A J\r @ AJ\r  AjA	nAj! Aæ F!@A  k"A	 A	I!\r@@  I\r A A ( !AëÜ \rv!A \rtAs!A ! !@  ( " \rv j6   q l! Aj" I\r A A ( ! E\r   6  Aj!  (, \rj"6,   j" " Atj   kAu J! A H\r A !@  O\r   kAuA	l!A\n! ( "A\nI\r @ Aj!  A\nl"O\r @ A   Aæ Fk A G Aç Fqk"  kAuA	lAwjN\r  A0jA`A¤b A Hj AÈ j"A	m"Atj!\rA\n!@  A	lk"AJ\r @ A\nl! Aj"AG\r  \rAj!@@ \r( "  n" lk"\r   F\r@@ Aq\r D      @C! AëÜG\r \r M\r \rA|j-  AqE\rD     @C!D      à?D      ð?D      ø?  FD      ø?  Av"F  I!@ \r  \n-  A-G\r  ! ! \r  k"6     a\r  \r  j"6 @ AëÜI\r @ \rA 6 @ \rA|j"\r O\r  A|j"A 6  \r \r( Aj"6  AÿëÜK\r   kAuA	l!A\n! ( "A\nI\r @ Aj!  A\nl"O\r  \rAj"   K!@@ " M"\r A|j"( E\r @@ Aç F\r  Aq! AsA A " J A{Jq"\r j!AA~ \r j! Aq"\r Aw!@ \r  A|j( "\rE\r A\n!A ! \rA\np\r @ "Aj! \r A\nl"pE\r  As!  kAuA	l!@ A_qAÆ G\r A !   jAwj"A  A J"  H!A !   j jAwj"A  A J"  H!A!\r AýÿÿÿAþÿÿÿ  r"J\r  A GjAj!@@ A_q"AÆ G\r   AÿÿÿÿsJ\r A  A J!@   Au"s k­  "kAJ\r @ Aj"A0:    kAH\r  A~j" :  A!\r AjA-A+ A H:    k" AÿÿÿÿsJ\rA!\r  j" 	AÿÿÿÿsJ\r  A    	j"     \n 	   A0   As @@@@ AÆ G\r  AjA	r!    K"!@ 5   !@@  F\r   AjM\r@ Aj"A0:    AjK\r   G\r  Aj"A0:       k  Aj" M\r @ E\r   Aõ¹ A   O\r AH\r@@ 5   " AjM\r @ Aj"A0:    AjK\r     A	 A	H  Awj! Aj" O\r A	J! ! \r @ A H\r   Aj  K!\r AjA	r! !@@ 5   " G\r  Aj"A0:  @@  F\r   AjM\r@ Aj"A0:    AjK\r    A  Aj!  rE\r   Aõ¹ A      k"   J   k! Aj" \rO\r AJ\r   A0 AjAA       k  !  A0 A	jA	A    A    AÀ s     J!\r \n AtAuA	qj!@ AK\r A k!D      0@!@ D      0@¢! Aj"\r @ -  A-G\r    ¡ !    ¡!@ (," Au"s k­  " G\r  Aj"A0:   (,! 	Ar! A q! A~j" Aj:   AjA-A+ A H:   AH AqEq! Aj!@ " ü"AÉ j-   r:    ·¡D      0@¢!@ Aj" AjkAG\r  D        a q\r  A.:  Aj! D        b\r A!\r Aûÿÿÿ 	  k"jkJ\r   A    j Aj  Ajk" A~j H  "j"         A0   As    Aj    A0  kA A         A    AÀ s     J!\r A°j$  \r.  ( AjAxq"Aj6    )  ) 9    ½ø&# Ak"$ @@@@@  AôK\r @A (ö "A  AjAøq  AI"Av"v" AqE\r @@  AsAq j"At"A¨ö j" (°ö "(" G\r A  A~ wq6ö   A (ö I\r  ( G\r   6   6 Aj!   Ar6  j" (Ar6 A (ö "M\r@  E\r @@   tA t" A   krqh"At"A¨ö j" (°ö " ("G\r A  A~ wq"6ö  A (ö I\r (  G\r  6  6   Ar6   j"  k"Ar6   j 6 @ E\r  AxqA¨ö j!A (ö !@@ A Avt"q\r A   r6ö  ! ("A (ö I\r  6  6  6  6  Aj! A  6ö A  6ö A (ö "	E\r 	hAt(°ø "(Axq k! !@@@ (" \r  (" E\r  (Axq k"   I"!    !  !  A (ö "\nI\r (!@@ ("  F\r  (" \nI\r ( G\r  ( G\r   6   6@@@ ("E\r  Aj! ("E\r Aj!@ ! " Aj!  ("\r   Aj!  ("\r   \nI\r A 6 A ! @ E\r @@  ("At"(°ø G\r  A°ø j  6   \rA  	A~ wq6ö   \nI\r@@ ( G\r    6   6  E\r   \nI\r   6@ ("E\r   \nI\r   6   6 ("E\r   \nI\r   6   6@@ AK\r    j" Ar6   j"   (Ar6  Ar6  j" Ar6  j 6 @ E\r  AxqA¨ö j!A (ö ! @@A Avt" q\r A   r6ö  ! (" \nI\r   6   6   6   6A  6ö A  6ö  Aj! A!  A¿K\r   Aj"Axq!A (ö "E\r A!@  AôÿÿK\r  A& Avg" kvAq  AtkA>j!A  k!@@@@ At(°ø "\r A ! A !A !  A A Avk AFt!A !@@ (Axq k" O\r  ! ! \r A ! ! !    ("   AvAqj("F   !  At! ! \r @   r\r A !A t" A   kr q" E\r  hAt(°ø !   E\r@  (Axq k" I!@  ("\r   (!   !    ! !  \r  E\r  A (ö  kO\r  A (ö "I\r (!@@ ("  F\r  (" I\r ( G\r  ( G\r   6   6@@@ ("E\r  Aj! ("E\r Aj!@ ! " Aj!  ("\r   Aj!  ("\r   I\r A 6 A ! @ E\r @@  ("At"(°ø G\r  A°ø j  6   \rA  A~ wq"6ö   I\r@@ ( G\r    6   6  E\r   I\r   6@ ("E\r   I\r   6   6 ("E\r   I\r   6   6@@ AK\r    j" Ar6   j"   (Ar6  Ar6  j" Ar6  j 6 @ AÿK\r  AøqA¨ö j! @@A (ö "A Avt"q\r A   r6ö   !  (" I\r   6  6   6  6A! @ AÿÿÿK\r  A& Avg" kvAq  AtrA>s!    6 B 7  AtA°ø j!@@@ A  t"q\r A   r6ö   6   6 A A  Avk  AFt!  ( !@ "(Axq F\r  Av!  At!   Aqj"("\r  Aj"  I\r   6   6  6  6  I\r ("  I\r   6  6 A 6  6   6 Aj! @A (ö "  I\r A (ö !@@   k"AI\r   j" Ar6   j 6   Ar6   Ar6   j"   (Ar6A !A !A  6ö A  6ö  Aj! @A (ö " M\r A   k"6ö A A (ö "  j"6ö   Ar6   Ar6  Aj! @@A (Øù E\r A (àù !A B7äù A B 7Üù A  AjApqAØªÕªs6Øù A A 6ìù A A 6¼ù A !A !   A/j"j"A  k"q" M\rA ! @A (¸ù "E\r A (°ù " j" M\r  K\r@@@A - ¼ù Aq\r @@@@@A (ö "E\r AÀù ! @@   ( "I\r     (jI\r  (" \r A  "AF\r !@A (Üù " Aj" qE\r   k  jA   kqj!  M\r@A (¸ù " E\r A (°ù " j" M\r   K\r  "  G\r  k q" "  (   (jF\r !   AF\r@  A0jI\r   !  kA (àù "jA  kq" AF\r  j!  ! AG\rA A (¼ù Ar6¼ù   !A  !  AF\r  AF\r   O\r   k" A(jM\rA A (°ù  j" 6°ù @  A (´ù M\r A   6´ù @@@@A (ö "E\r AÀù ! @   ( "  ("jF\r  (" \r @@A (ö " E\r    O\rA  6ö A ! A  6Äù A  6Àù A A6 ö A A (Øù 6¤ö A A 6Ìù @  At" A¨ö j"6°ö   6´ö   Aj" A G\r A  AXj" Ax kAq"k"6ö A   j"6ö   Ar6   jA(6A A (èù 6ö   O\r   I\r   (Aq\r     j6A  Ax kAq" j"6ö A A (ö  j"  k" 6ö    Ar6  jA(6A A (èù 6ö @ A (ö O\r A  6ö   j!AÀù ! @@@  ( " F\r  (" \r   - AqE\rAÀù ! @@@   ( "I\r     (j"I\r  (!  A  AXj" Ax kAq"k"6ö A   j"6ö   Ar6   jA(6A A (èù 6ö   A\' kAqjAQj"    AjI"A6 A )Èù 7 A )Àù 7A  Aj6Èù A  6Äù A  6Àù A A 6Ìù  Aj! @  A6  Aj!  Aj!   I\r   F\r   (A~q6   k"Ar6  6 @@ AÿK\r  AøqA¨ö j! @@A (ö "A Avt"q\r A   r6ö   !  ("A (ö I\r   6  6A!A!A! @ AÿÿÿK\r  A& Avg" kvAq  AtrA>s!    6 B 7  AtA°ø j!@@@A (ö "A  t"q\r A   r6ö   6   6 A A  Avk  AFt!  ( !@ "(Axq F\r  Av!  At!   Aqj"("\r  Aj" A (ö I\r   6   6A!A! ! !  A (ö "I\r ("  I\r   6  6   6A ! A!A!  j 6   j  6 A (ö "  M\r A    k"6ö A A (ö "  j"6ö   Ar6   Ar6  Aj! â A06 A ! ê     6     ( j6    !  Aj$   \n  Ax  kAqj" Ar6 Ax kAqj"  j"k! @@@ A (ö G\r A  6ö A A (ö   j"6ö   Ar6@ A (ö G\r A  6ö A A (ö   j"6ö   Ar6  j 6 @ ("AqAG\r  (!@@ AÿK\r @ (" AøqA¨ö j"F\r  A (ö I\r ( G\r@  G\r A A (ö A~ Avwq6ö @  F\r  A (ö I\r ( G\r  6  6 (!@@  F\r  ("A (ö I\r ( G\r ( G\r  6  6@@@ ("E\r  Aj! ("E\r Aj!@ !	 "Aj! ("\r  Aj! ("\r  	A (ö I\r 	A 6 A ! E\r @@  ("At"(°ø G\r  A°ø j 6  \rA A (ö A~ wq6ö  A (ö I\r@@ ( G\r   6  6 E\r A (ö "I\r  6@ ("E\r   I\r  6  6 ("E\r   I\r  6  6 Axq"  j!   j"(!  A~q6   Ar6   j  6 @  AÿK\r   AøqA¨ö j!@@A (ö "A  Avt" q\r A    r6ö  !  (" A (ö I\r  6   6  6   6A!@  AÿÿÿK\r   A&  Avg"kvAq AtrA>s!  6 B 7 AtA°ø j!@@@A (ö "A t"q\r A   r6ö   6   6  A A Avk AFt! ( !@ "(Axq  F\r Av! At!  Aqj"("\r  Aj"A (ö I\r  6   6  6  6 A (ö " I\r ("  I\r  6  6 A 6  6  6 Ajê  Ä\n@@  E\r   Axj"A (ö "I\r  A|j( "AqAF\r  Axq" j!@ Aq\r  AqE\r  ( "k" I\r   j! @ A (ö F\r  (!@ AÿK\r @ (" AøqA¨ö j"F\r   I\r ( G\r@  G\r A A (ö A~ Avwq6ö @  F\r   I\r ( G\r  6  6 (!@@  F\r  (" I\r ( G\r ( G\r  6  6@@@ ("E\r  Aj! ("E\r Aj!@ ! "Aj! ("\r  Aj! ("\r   I\r A 6 A ! E\r@@  ("At"(°ø G\r  A°ø j 6  \rA A (ö A~ wq6ö   I\r@@ ( G\r   6  6 E\r  I\r  6@ ("E\r   I\r  6  6 ("E\r  I\r  6  6 ("AqAG\r A   6ö   A~q6   Ar6   6   O\r ("AqE\r@@ Aq\r @ A (ö G\r A  6ö A A (ö   j" 6ö    Ar6 A (ö G\rA A 6ö A A 6ö @ A (ö "	G\r A  6ö A A (ö   j" 6ö    Ar6   j  6  (!@@ AÿK\r @ (" AøqA¨ö j"F\r   I\r ( G\r@  G\r A A (ö A~ Avwq6ö @  F\r   I\r ( G\r  6  6 (!\n@@  F\r  (" I\r ( G\r ( G\r  6  6@@@ ("E\r  Aj! ("E\r Aj!@ ! "Aj! ("\r  Aj! ("\r   I\r A 6 A ! \nE\r @@  ("At"(°ø G\r  A°ø j 6  \rA A (ö A~ wq6ö  \n I\r@@ \n( G\r  \n 6 \n 6 E\r  I\r  \n6@ ("E\r   I\r  6  6 ("E\r   I\r  6  6  Axq  j" Ar6   j  6   	G\rA   6ö   A~q6   Ar6   j  6 @  AÿK\r   AøqA¨ö j!@@A (ö "A  Avt" q\r A    r6ö  !  ("  I\r  6   6  6   6A!@  AÿÿÿK\r   A&  Avg"kvAq AtrA>s!  6 B 7 AtA°ø j!@@@@A (ö "A t"q\r A   r6ö   6 A! A!  A A Avk AFt! ( !@ "(Axq  F\r Av! At!  Aqj"("\r  Aj"  I\r   6 A! A! ! ! !  I\r (" I\r  6  6A !A! A!  j 6   6   j 6 A A ( ö Aj"A 6 ö ê   ? Atd~@@  ­B|BøÿÿÿA (ê " ­|"BÿÿÿÿV\r   §"O\r  \râ A06 AA  6ê   u~    ~  ~| B " B "~| Bÿÿÿÿ" Bÿÿÿÿ"~"B   ~|"B | Bÿÿÿÿ  ~|"B |7   B  Bÿÿÿÿ7   A $ A AjApq$  # # k #  # S~@@ AÀ qE\r   A@j­!B ! E\r  AÀ  k­  ­"!  !   7    7S~@@ AÀ qE\r   A@j­!B ! E\r  AÀ  k­  ­"!  !   7    7©~# A k"$  Bÿÿÿÿÿÿ?!@@ B0Bÿÿ"§"AÿjAýK\r   B< B! Aj­!@@  Bÿÿÿÿÿÿÿÿ" BT\r  B|!  BR\r  B |!B   BÿÿÿÿÿÿÿV"!  ­ |!@   P\r  BÿÿR\r   B< BB! Bÿ!@ AþM\r Bÿ!B ! @Aø Aø  P"" k"Að L\r B ! B !  BÀ  !A !@  F\r  Aj   A k  ) )B R!       ) "B< )B! @@ Bÿÿÿÿÿÿÿÿ ­"BT\r   B|!  BR\r   B  |!   B    BÿÿÿÿÿÿÿV"!  ­! A j$  B4 B  ¿ @   " \r ¢    >  A  AK!@@  "\rí " E\r      \n    \n    \n           AÜ± A ë      (H"Aj r6H@  (  (F\r   A A   ($    A 6  B 7@  ( "AqE\r    A r6 A    (,  (0j"6   6 AtAuX# Ak"$ A!@  £ \r    AjA  (   AG\r  - ! Aj$  G   7p    (,  ("k¬7x  (!@ P\r    k¬Y\r   §j!   6hâ~  )x  ("  (,"k¬|!@@@  )p"P\r   Y\r  ¤ "AJ\r  (!  (,!  B7p   6h     k¬|7xA B|!  (!  (!@  )p"B Q\r   }"  k¬Y\r   §j!   6h     (," k¬|7x@  K\r  Aj :   ê~# Ak"$  ¼"Aÿÿÿq!@@ Av"Aÿq"E\r @ AÿF\r  ­B! AÿqAÿ j!B ! ­B!B !Aÿÿ!@ \r B !A !B !  ­B  g"AÑ j Aÿ  k! )BÀ ! ) !   7    ­B0 Av­B? 7 Aj$ ¡~# Ak"$ @@ \r B !B !   Au"s k"­B  g"AÑ j  )BÀ A k­B0|BB  A H! ) !   7    7 Aj$ µ~~~# Aà k"$  Bÿÿÿÿÿÿ?!  B! Bÿÿÿÿÿÿ?"B !	 B0§Aÿÿq!\n@@@ B0§Aÿÿq"A~jA~I\r A ! \nA~jA~K\r@ P Bÿÿÿÿÿÿÿÿÿ "\rBÀÿÿ T \rBÀÿÿ Q\r  B !@ P Bÿÿÿÿÿÿÿÿÿ "BÀÿÿ T BÀÿÿ Q\r  B ! !@  \rBÀÿÿ B R\r @  PE\r Bàÿÿ !B ! BÀÿÿ !B !@  BÀÿÿ B R\r   \r!B !@ PE\r Bàÿÿ ! BÀÿÿ !@  \rB R\r B !@  B R\r B !A !@ \rBÿÿÿÿÿÿ?V\r  AÐ j     P"yBÀ B  |§"Aqj A k! )X"B !	 )P! Bÿÿÿÿÿÿ?V\r  AÀ j     P"yBÀ B  |§"Aqj   kAj! )H! )@!  \nj jAj!\n@@ B"B B" B "~" B"B " 	B"	~|"\r T­ \r B1 Bÿÿÿÿ" Bÿÿÿÿ"~|" \rT­|  	~|  Bþÿ"\r ~"  ~|" T­   Bÿÿÿÿ"~|" T­||" T­|  	~"  ~|" T­B  B |  B |" T­|  \r 	~"  ~|"	  ~|"  ~|"B  	 T­  	T­|  T­|B |" T­|   \r ~"	  ~|"B   	T­B |" T­  B |" T­||" T­|   B " \r ~|" T­|" T­|" T­|"BÀ P\r  \nAj!\n B?! B B?! B B?! B!  B!@ \nAÿÿH\r  BÀÿÿ !B !@@ \nA J\r @A \nk"Aÿ K\r  A0j   \nAÿ j"\n  A j   \n  Aj          )  ) )0 )8B R­! )( )! )! ) !B ! \n­B0 Bÿÿÿÿÿÿ?!  !@ P BU BQ\r   B|"P­|!@  BB Q\r  !   B|" T­|!   7    7 Aà j$  A  A ~~~# Að k"$  Bÿÿÿÿÿÿÿÿÿ !@@@ P" Bÿÿÿÿÿÿÿÿÿ "BÀ|BÀT P\r  B R BÀ|"	BÀV 	BÀQ\r@  BÀÿÿ T BÀÿÿ Q\r  B ! !@ P BÀÿÿ T BÀÿÿ Q\r  B !@  BÀÿÿ B R\r Bàÿÿ      BP"!B   !  BÀÿÿ P\r@  B R\r   B R\r  !  !  PE\r  ! !    V  V  Q"\n!   \n"	Bÿÿÿÿÿÿ?!   \n"B0§Aÿÿq!@ 	B0§Aÿÿq"\r  Aà j     P"yBÀ B  |§"Aqj A k! )h! )`!   \n! Bÿÿÿÿÿÿ?!@ \r  AÐ j     P"\nyBÀ B  \n|§"\nAqj A \nk! )X! )P! B B=B! B B=! B!  !@  F\r @  k"\nAÿ M\r B !B! AÀ j  A \nk  A0j   \n  )0 )@ )HB R­! )8! B! B!@@ BU\r B !B !    P\r  }!  }  T­}"BÿÿÿÿÿÿÿV\r A j     P"\nyBÀ B  \n§Atj"\n   \nk! )(! ) !  |  |" T­|"BP\r  B B? B! Aj! B! 	B!@ AÿÿH\r  BÀÿÿ !B !A !\n@@ A L\r  !\n Aj   Aÿ j    A k  )  ) )B R­! )! B B=! \n­B0 BBÿÿÿÿÿÿ? ! §Aq!@@@@@ª  @ AF\r    AK­|" T­|! !   B|" T­|! !   B R A Gq­|" T­|! !   P A Gq­|" T­|! ! E\r«    7    7 Að j$ ô~# Ak"$  ½"Bÿÿÿÿÿÿÿ!@@ B4Bÿ"P\r @ BÿQ\r  B! B<! Bø |! B! B<!Bÿÿ!@ PE\r B !B !B !  B  y§"A1j  )BÀ !Aø  k­! ) !   7    B0 B 7 Aj$ æ~A!@  B R Bÿÿÿÿÿÿÿÿÿ "BÀÿÿ V BÀÿÿ Q\r  B R Bÿÿÿÿÿÿÿÿÿ "BÀÿÿ V BÀÿÿ Q\r @     PE\r A @  B S\r @   T  S  QE\r A     B R@   V  U  QE\r A     B R! Ø~A!@  B R Bÿÿÿÿÿÿÿÿÿ "BÀÿÿ V BÀÿÿ Q\r  B R Bÿÿÿÿÿÿÿÿÿ "BÀÿÿ V BÀÿÿ Q\r @     PE\r A @  B S\r    T  S  Q\r     B R   V  U  Q\r      B R! ® @@ AH\r   D      à¢! @ AÿO\r  Axj!  D      à¢!  Aý AýIApj! AxJ\r   D      `¢! @ A¸pM\r  AÉj!  D      `¢!  Aðh AðhKAj!   Aÿj­B4¿¢<    7    B0§Aq BÀÿÿ B0§r­B0 Bÿÿÿÿÿÿ?7~# Ak"$ @@ \r B !B !  ­B Að  g"Ask  )BÀ A k­B0|! ) !   7    7 Aj$ T# Ak"$      B¬  ) !   )7   7  Aj$ æ# AÐ k"$ @@ AH\r  A j  B Bÿÿ ©  )(! ) !@ AÿÿO\r  Aj! Aj  B Bÿÿ ©  Aýÿ AýÿIA~j! )! )! AJ\r  AÀ j  B B9©  )H! )@!@ Aô~M\r  Aÿ j! A0j  B B9©  Aè} Aè}KAþj! )8! )0!   B  Aÿÿ j­B0©    )7   ) 7  AÐ j$ ~~~# AÐk"$  Bÿÿÿÿÿÿ?! Bÿÿÿÿÿÿ?!  B! B0§Aÿÿq!	@@@ B0§Aÿÿq"\nA~jA~I\r A ! 	A~jA~K\r@ P Bÿÿÿÿÿÿÿÿÿ "BÀÿÿ T BÀÿÿ Q\r  B !@ P Bÿÿÿÿÿÿÿÿÿ "BÀÿÿ T BÀÿÿ Q\r  B ! !@  BÀÿÿ B R\r @  BÀÿÿ PE\r B !Bàÿÿ ! BÀÿÿ !B !@  BÀÿÿ B R\r B !@  B R\r Bàÿÿ    P!B !@  B R\r  BÀÿÿ !B !A !@ Bÿÿÿÿÿÿ?V\r  AÀj     P"yBÀ B  |§"Aqj A k! )È! )À! Bÿÿÿÿÿÿ?V\r  A°j     P"\ryBÀ B  \r|§"\rAqj  \r jApj! )¸! )°! A j B1 BÀ "B"B B°æ¼õ  }"B   AjB  )¨}B  B   Aj )B? )B"B  B   Aðj B B  )}B   Aàj )ðB? )øB"B  B   AÐj B B  )è}B   AÀj )ÐB? )ØB"B  B   A°j B B  )È}B   A j B  )°B? )¸BB|"B   Aj BB  B   Að j B B  )¨ ) " )|" T­| BV­|}B   AjB }B  B    \n 	kj"\nAÿÿ j!	@@ )p"B" )B? )"B|"B|"B " BÀ "B"B "~" B"B " )xB B? B?|  T­|  T­|B|"B "~|" T­  Bÿÿÿÿ" B?" BBÿÿÿÿ"~|" T­|  ~|  ~"  ~|" T­B  B |  B |" T­|  Bÿÿÿÿ" ~"  ~|" T­   Bþÿÿÿ"~|" T­||" T­|   ~"  ~|"  ~|"  ~|"B   T­  T­|  T­|B |" T­|    ~"  ~|"B   T­B |" T­  B |" T­||" T­| A   B "  ~| T­B"V  Q­|" T­|"Bÿÿÿÿÿÿÿ V\r   ! AÐ j  BÀ T"­""   B A?s­"    \nAþÿ j 	 Aj!	 B1 )X} )P"B R­}!B  }! Aà j B B?" B"    B0 )h} )`"B R­}!B  }! !@ 	AÿÿH\r  BÀÿÿ !B !@@ 	AH\r  B B?! 	­B0 Bÿÿÿÿÿÿ?! B!@ 	AJ\r B ! AÀ j  A 	k  A0j   	Að j  A j   )@" )H"  )8 )(B ) "B?} )0" B"T­}!  }! Aj  BB     BB     B" |" V   T­|" V  Q­|" T­|"  BÀÿÿ T  )V  )"V  Qq­|" T­|"  BÀÿÿ T  ) V  )"V  Qq­|" T­| !   7    7 AÐj$ K~ Bÿÿÿÿÿÿ?!@@ B0§Aÿÿq"AÿÿF\r A! \rAA   P   P! ç~~# Ak"$ @@@  B B ® E\r   ¶ E\r  B0§"Aÿÿq"AÿÿG\r Aj    ©   )" )"  µ  )! ) !@  Bÿÿÿÿÿÿÿÿÿ "  Bÿÿÿÿÿÿÿÿÿ "	® A J\r @    	® E\r  ! Að j  B B ©  )x! )p! B0§Aÿÿq!\n@@ E\r  ! Aà j  B BÀ»À ©  )h"B0§Aj! )`!@ \n\r  AÐ j  	B BÀ»À ©  )X"	B0§Aj!\n )P! 	Bÿÿÿÿÿÿ?BÀ ! Bÿÿÿÿÿÿ?BÀ !@  \nL\r @@@  }  T­}"	B S\r @ 	  }"B R\r  A j  B B ©  )(! ) ! 	B B?! B B?! B! Aj" \nJ\r  \n!@@  }  T­}"	B Y\r  !	 	  }"B R\r  A0j  B B ©  )8! )0!@ 	Bÿÿÿÿÿÿ?V\r @ B?! Aj! B!  	B"	BÀ T\r  Aq!\n@ A J\r  AÀ j  	Bÿÿÿÿÿÿ? Aø j \nr­B0B BÀÃ?©  )H! )@! 	Bÿÿÿÿÿÿ?  \nr­B0!   7    7 Aj$     Bÿÿÿÿÿÿÿÿÿ 7   7 Ù	~~# A0k"$ B !@@ AK\r  At"(ÌÉ ! (ÀÉ !@@@ (" (hF\r   Aj6 -  ! ¦ ! º \r A!@@ AUj  AA A-F!@ (" (hF\r   Aj6 -  ! ¦ !A !	@@@@ A_qAÉ F\r A !\n@ 	AF\r@@ (" (hF\r   Aj6 -  ! ¦ ! 	, ©­ ! 	Aj"\n!	  A rF\r @ \nAF\r  \nAF\r E\r \nAI\r \nAF\r@ )p"B S\r   (Aj6 E\r  \nAI\r  B S!@@ \r   (Aj6 \nAj"\nAK\r   ²C  §  )! ) !@@@@@@ \n\r A !	@ A_qAÎ F\r A !\n@ 	AF\r@@ (" (hF\r   Aj6 -  ! ¦ ! 	, î¯ ! 	Aj"\n!	  A rF\r  \n @@ (" (hF\r   Aj6 -  ! ¦ !@@ A(G\r A!	B !Bàÿÿ ! )pB S\r  (Aj6@@@ (" (hF\r   Aj6 -  ! ¦ ! A¿j!\n@@ APjA\nI\r  \nAI\r  Aj!\n Aß F\r  \nAO\r 	Aj!	Bàÿÿ ! A)F\r@ )p"B S\r   (Aj6@@ E\r  	\râ A6 B !@@ B S\r   (Aj6 	Aj"	E\r B !@ )pB S\r   (Aj6â A6   ¥ @ A0G\r @@ ("	 (hF\r   	Aj6 	-  !	 ¦ !	@ 	A_qAØ G\r  Aj     »  )! )! )pB S\r   (Aj6 A j      ¼  )(! ) !B !B !   7    7 A0j$    A F  AwjAIrÍ\n~~~~~# A°k"$ @@ (" (hF\r   Aj6 -  ! ¦ !A !B !	A !\n@@@@@ A0F\r  A.G\r (" (hF\r  Aj6 -  !@ (" (hF\r A!\n  Aj6 -  !A!\n ¦ !  ¦ !B !	@ A0F\r A!@@@ (" (hF\r   Aj6 -  ! ¦ ! 	B|!	 A0F\r A!A!\nBÀÿ?!A !B !\rB !B !A !B !@@ !@@ APj"A\nI\r  A r!@ A.F\r  AjAK\r A.G\r  \rA! !	 A©j  A9J!@@ BU\r   Atj!@ BV\r  A0j ¨  A j  B BÀý?©  Aj )0 )8 ) " )("©   ) ) \r ¬  )! ) !\r E\r  \r  AÐ j  B Bÿ?©  AÀ j )P )X \r ¬ A! )H! )@!\r B|!A!\n@ (" (hF\r   Aj6 -  ! ¦ ! @@ \n\r @@@ )pB S\r   ("Aj6 E\r  A~j6 E\r  A}j6 \r B ¥  Aà jD         ·¦­  )h! )`!\r@ BU\r  !@ At! B|"BR\r @@@@ A_qAÐ G\r   ½ "BR\r@ E\r  )pBU\rB !\r B ¥ B !B ! )pB S\r  (Aj6B !@ \r  Að jD         ·¦­  )x! )p!\r@ 	  B |B`|"A  k­W\r â AÄ 6  A j ¨  Aj )  )¨BBÿÿÿÿÿÿ¿ÿÿ ©  Aj ) )BBÿÿÿÿÿÿ¿ÿÿ ©  )! )!\r@  A~j¬S\r @ AL\r @ A j \r B BÀÿ¿¬  \r B Bÿ?¯ ! Aj \r  )  \r AJ" )¨  ¬  At" r! B|! )! )!\r AJ\r @@ A  k­|"	§"A  A J  	 ­S"Añ I\r  Aj ¨ B !	 )! )!B ! AàjD      ð?A k° ­  AÐj ¨  Aðj )à )è )Ð" )Ø"±  )ø! )ð!	 AÀj  AqE A I \r B B ® A Gqq"r²  A°j   )À )È©  Aj )° )¸ 	 ¬  A j  B  \r B   ©  Aj )  )¨ ) )¬  Aðj ) ) 	 ³ @ )ð"\r )ø"B B ® \r â AÄ 6  Aàj \r  §´  )è! )à!\râ AÄ 6  AÐj ¨  AÀj )Ð )ØB BÀ ©  A°j )À )ÈB BÀ ©  )¸! )°!\r   \r7    7 A°j$ ¯	~~~~|# AÆ k"$ A !A  k"	 k!\nB !A !@@@@@ A0F\r  A.G\r (" (hF\r  Aj6 -  !@ (" (hF\r A!  Aj6 -  !A! ¦ !  ¦ !B !@ A0G\r @@@ (" (hF\r   Aj6 -  ! ¦ ! B|! A0F\r A!A!A !\r A 6 APj!@@@@@@@ A.F"\r B ! A	M\r A !A !B !A !A !\rA !@@@ AqE\r @ \r  !A! E! B|!@ \rAüJ\r  §! Aj \rAtj!@ E\r   ( A\nljAPj!   A0F!  6 A!A  Aj" A	F"! \r j!\r A0F\r   (FAr6FAÜ!@@ (" (hF\r   Aj6 -  ! ¦ ! APj! A.F"\r  A\nI\r    !@ E\r  A_qAÅ G\r @  ½ "BR\r  E\rB ! )pB S\r   (Aj6  |! E! A H\r )pB S\r   (Aj6 E\râ A6 B ! B ¥ B !@ ("\r  D         ·¦­  )! ) !@ B	U\r   R\r @ AK\r   v\r A0j ¨  A j ²  Aj )0 )8 )  )(©  )! )!@  	Av­W\r â AÄ 6  Aà j ¨  AÐ j )` )hBBÿÿÿÿÿÿ¿ÿÿ ©  AÀ j )P )XBBÿÿÿÿÿÿ¿ÿÿ ©  )H! )@!@  A~j¬Y\r â AÄ 6  Aj ¨  Aj ) )B BÀ ©  Að j ) )B BÀ ©  )x! )p!@ E\r @ AJ\r  Aj \rAtj"( !@ A\nl! Aj"A	G\r   6  \rAj!\r §!@ A	N\r  BU\r   J\r @ B	R\r  AÀj ¨  A°j (²  A j )À )È )° )¸©  )¨! ) !@ BU\r  Aj ¨  Aj (²  Aðj ) ) ) )©  AàjA kAt( É ¨  AÐj )ð )ø )à )èµ  )Ø! )Ð! (!@  A}ljAj"AJ\r   v\r Aàj ¨  AÐj ²  AÀj )à )è )Ð )Ø©  A°j AtAøÈ j( ¨  A j )À )È )° )¸©  )¨! ) !@ \r"Aj!\r Aj Atj"A|j( E\r A !@@ A	o"\r A ! A	j  B S!@@ \r A !A !AëÜA kAtA É j( "\rm!	A !A !A !@ Aj Atj" ( " \rn" j"6  AjAÿq   F Eq"! Awj  ! 	   \rlkl! Aj" G\r  E\r   6  Aj!  kA	j!@ Aj Atj!	 A$H!@@@ \r  A$G\r 	( AÑéùO\r Aÿj!\rA !@ !@@ Aj \rAÿq"Atj"5 B ­|"BëÜZ\r A !  BëÜ"BëÜ~}! §!  >      B R  AjAÿq"G  F! Aj!\r  G\r  Acj! ! E\r @@ AjAÿq" F\r  ! Aj AþjAÿqAtj" (  Aj Atj( r6  ! A	j! Aj Atj 6 @@ AjAÿq! Aj AjAÿqAtj!	@A	A A-J!\r@@ !A !@@@  jAÿq" F\r Aj Atj( " At(É "I\r  K\r Aj"AG\r  A$G\r B !A !B !@@  jAÿq" G\r  Aj AjAÿq"AtjA|jA 6  Aj Aj Atj( ²  Aðj  B Bå·À ©  Aàj )ð )ø ) )¬  )è! )à! Aj"AG\r  AÐj ¨  AÀj   )Ð )Ø© B ! )È! )À! Añ j" k"A  A J   J""Að M\rB !B !B ! \r j! !  F\r AëÜ \rv!A \rtAs!A ! !@ Aj Atj" ( " \rv j"6  AjAÿq   F Eq"! Awj  !  q l! AjAÿq" G\r  E\r@  F\r  Aj Atj 6  ! 	 	( Ar6  AjD      ð?Aá k° ­  A°j ) )  ±  )¸! )°! AjD      ð?Añ  k° ­  A j   ) )·  Aðj   ) " )¨"³  Aàj   )ð )ø¬  )è! )à!@ AjAÿq"\r F\r @@ Aj \rAtj( "\rAÿÉµîK\r @ \r\r  AjAÿq F\r Aðj ·D      Ð?¢­  Aàj   )ð )ø¬  )è! )à!@ \rAÊµîF\r  AÐj ·D      è?¢­  AÀj   )Ð )Ø¬  )È! )À! ·!@ AjAÿq G\r  Aj D      à?¢­  Aj   ) )¬  )! )! A°j D      è?¢­  A j   )° )¸¬  )¨! ) ! Aï K\r  AÐj  B BÀÿ?·  )Ð )ØB B ® \r  AÀj  B BÀÿ?¬  )È! )À! A°j    ¬  A j )° )¸  ³  )¨! ) !@ Aÿÿÿÿq \nA~jL\r  Aj  ¸  Aj  B Bÿ?©  ) )B B¸À ¯ ! )  AJ"! )  !  B B ® !@  j"Aî j \nJ\r    G A Hrq A GqE\râ AÄ 6  Aðj   ´  )ø! )ð!   7   7  AÆ j$ Ó~@@  ("  (hF\r    Aj6 -  !  ¦ !@@@@@ AUj  @@  ("  (hF\r    Aj6 -  !  ¦ ! A-F! AFj! E\r AuK\r  )pB S\r    (Aj6 AFj!A ! ! AvI\r B !@ APjA\nO\r A !@  A\nlj!@@  ("  (hF\r    Aj6 -  !  ¦ ! APj!@ APj"A	K\r  AÌ³æ H\r ¬! A\nO\r @ ­ B\n~|!@@  ("  (hF\r    Aj6 -  !  ¦ ! BP|!@ APj"A	K\r  B®×ÇÂë£S\r A\nO\r @@@  ("  (hF\r    Aj6 -  !  ¦ ! APjA\nI\r @  )pB S\r     (Aj6B  }  !B!  )pB S\r     (Aj6B ~# A k"$   6<  6 A6 AjB ¥   Aj A¹  )! ) !@ E\r    ( (<kj (j6    7   7  A j$ D|# Ak"$     A¾  )  ) ! Aj$  EA¶® !@  AK\r @@  \r A !   At/àÉ " E\r  AÌ j!      À ³# Ak"$   : @@  ("\r @  ú E\r A!  (!@  (" F\r   (P Aÿq"F\r    Aj6  :  @   AjA  ($  AF\r A! - ! Aj$  @ A÷ÿÿÿO\r @@@ AI\r  Ar"Aj !   Axj6   6    6 !    :  E\r E\r     ü\n     jA :  Ä   AÌ° Å  +# Ak"$    6 AÄº  ë  O@ ( , " A H"" O\r Ç     (    j  k"   IÃ    AÌ° È  +# Ak"$    6 A»  ë  ( @  , AJ\r   (   (Aÿÿÿÿq   #         Ë     k j6ñ@ Aöÿÿÿ kK\r   , A H!  ( !A÷ÿÿÿ!	@ AòÿÿÿK\r A  j"	 At" 	 K"	ArAj 	AI!	    ! 	 !@ E\r  E\r    ü\n  @   j"F\r   k"E\r   j j  j j ü\n  @ Aj"AF\r       6    	Axr6Ä  º@   ("AÿÿÿÿqAjA\n  , "A H""K\r   (    !@@ \r  Av!@ E\r    ü\n    - !@@ ÀAJ\r    6   Aÿ q:   jA :         k  (  "A    Î   »@@  (AÿÿÿÿqAjA\n  , "A H""  (  "k I\r  E\r  (    A H!@ E\r   j  ü\n    j!@@  , AJ\r    6   Aÿ q:   jA :         j k  A   Î   ¦@ Aöÿÿÿ kK\r   , A H!  ( !	A÷ÿÿÿ!\n@ AòÿÿÿK\r A  j" At"\n  \nK"ArAj AI!\n 	   !	 \n !@ E\r  E\r   	 ü\n  @ E\r  E\r   j  ü\n     j"k!@  F\r  E\r   j j 	 j j ü\n  @ Aj"AF\r  	     6    \nAxr6    j j"6  jA :  Ä  @@@@  , "A H\r A\n! A\nF\r   AjAÿ q:   ("  (AÿÿÿÿqAj"G\r   A  A A Ê  !   Aj6  ( !    j" A :    :  @  (  , " A H" I\r @ E\r @@  (AÿÿÿÿqAjA\n A H"" k I\r   (    !  F\r  k"E\r  j" j  ü\n       j k  A  Ê   ( !  j! !@@ E\r  :   Aj! Aj!   j!@@  , AJ\r    6   Aÿ q:   jA :    Ç         Ø Ò @@@@  (  , " A H"" I\r @  k"   I"	 k  (AÿÿÿÿqAjA\n "j I\r   (    A H!@@@  	G\r  !	  K\r !  	k!  j!@@@  	O\r @ E\r  E\r    ü\n  @ E\r   j  	j ü\n    	k j!  , AJ\r   6   jO\r  AjI\r@  	j K\r    	kj!@ E\r  	E\r    	ü\n    	k!  j! 	 j!A !	   Aÿ q:   jA :         j 	 jk   	  Î   Ç   ! E\r   j" j  	j ü\n  @ E\r  E\r   j  ü\n    	k j!@@  , AJ\r    6   Aÿ q:   jA :         Ü .  (     , "A H"  (     Õ FA!@  K\r @ \r  A   j   j"   jÖ "  k  F! o@  F\r @   k  k"H\r A k! ,  !@   k" H\r     jÓ " E\r    Ó E\r  Aj!   !      A A  Ø Ø r@@ AF\r   (  , " A H" O\rÇ    (    A H j    k"     I"    IÓ "   K   Ik y@@@ A\nK\r    :  A÷ÿÿÿO\r Ar"Aj !   Axj6   6    6 ! @ Aj"E\r     ü\n  Ä       Ø Ì # Ak"$    (" ("j AjÜ " (     , A H! @ E\r  E\r    (  ü\n     j!@ E\r  E\r   (  ü\n    jA :   Aj$ l@ A÷ÿÿÿO\r @ A\nK\r   A 6  B 7    :    Ar"Aj !   6   6    Axj6  Ä       Ø Ã   Ì# Ak"$  Aõ¯ Ý ! A 6  ( !  , !â "( ! A 6     A H"  Aj æ ! ( !  6 @@ AÄ F\r  ("  F\r@ E\r     k6  É  Aj$   ß   à  B# Ak"$  Aj  AÍ± â  ( Aj , A HÈ  B# Ak"$  Aj  AÍ¯ â  ( Aj , A Hã  Ì|# Ak"$  A² Ý ! A 6  ( !  , !â "( ! A 6     A H"  Aj¿ ! ( !  6 @@ AÄ F\r  ("  F\r@ E\r     k6  É  Aj$   ß   à  # A0k"$  ( ! (! , !  6    A H"6(    6$  Ø 6   )$7  )7   A/j Aj AjÛ  A0j$ +# Ak"$    6 Aþ¹  ë   A    æ {@@ (L"A H\r  E\r Aÿÿÿÿqó (G\r@  Aÿq" (PF\r  (" (F\r   Aj6   :     Â    ç @ AÌ j"è E\r  ä @@  Aÿq" (PF\r  (" (F\r   Aj6   :    Â !@ é AqE\r  ê      ( "Aÿÿÿÿ 6    ( !  A 6  \r   Aõ ]# Ak"$   6A (¨Å "    @    Ø jAj-  A\nF\r A\n å ê  W# Ak"$ AÈ» AAA (¨Å "   6     A\n å ê   A (ðù \n          A     A     A     A \r   ( (F3 @ \r   ( (F@   G\r A  ( (Ô E# AÐ k"$ @@@  ( (G\r A!A ! AÛ A°Û A ø "E\r  ( "E\r AjA A8ü  A: K A6    6  6 A6D  Aj A ( (  @ (,"AG\r   ($6  AF! AÐ j$   AÇ´ 6 Aç6 Aþ® 6 A¬®  ì  ø# AÀ k"$     ( "Axj( "j!@@ A|j( "( (G\r A !@ A H\r  A  A  kF! A~F\r B 7  6  6   6  6 B 7 B 7$ B 7, A 6< B74  Aj  AA  ( (   A  (AF!@ A H\r    k" H\r  B 7  6  6  6  6 B 7 B 7$ B 7, A 6< B74  Aj  AA  ( (   (\r B 7  6  6   6  6 B 7 B 7$ B 7, B 7 3 A 6< A: ;  Aj AA  ( (  A !@@ ((  (A  ($AFA  ( AFA  (,AF!@ (AF\r @ (,E\r A !@ ( AF\r A !A ! ($AG\r (! AÀ j$  w@ ($"\r   6  6 A6$  (86@@ ( (8G\r  ( G\r  (AG\r  6 A: 6 A6  Aj6$# @  ( ((G\r     ù D @  ( ((G\r     ù   ("      ( (  YA!@@  - Aq\r A ! E\r AÛ AàÛ A ø "E\r - AqA G!    ö ! Ã# AÀ k"$ @@@@ (AÞ G\r  A 6 @    ü E\r A! ( "E\r  ( 6 A ! AÛ AÜ A ø "E\rA !A !@ ( "E\r   ( "6  ("  ("AsqAq\r As qAà q\r  (" (" ("(G\rA!@ AÞ G\r  AÛ AÀÜ A ø E!A !@  AÛ AÜ A ø "E\r  AqE\r  þ !A !@  AÛ AôÜ A ø "E\r  AqE\r  ÿ !A !  AÛ A°Û A ø " E\r A ! AÛ A°Û A ø "E\r  AjA A8ü   A G: ; A6   6  6 A64  Aj A ( (  @ ("AG\r   (A  6  AF! AÀ j$  ±@@@ \r A A ! AÛ AÜ A ø "E\r (  ("Asq\r@  ("( ("(G\r A AqE\r AÛ AÜ A ø " \r A ! AÛ AôÜ A ø " E\r    ÿ ! cA !@ E\r  AÛ AôÜ A ø "E\r  (  (Asq\r   (( ((G\r   (( ((F!   A: 5@  (G\r  A: 4@@ ("\r  A6$  6  6 AG\r (0AF\r@  G\r @ ("AG\r   6 ! (0AG\r AF\r  ($Aj6$ A: 6ª @@   ( ö E\r   (G\r (AF\r  6@   (  ö E\r @@  (F\r   (G\r AG\r A6   6 @ (,AF\r  A ;4  ("    A   ( (  @ - 5AG\r  A6, - 4E\r A6,  6  ((Aj6( ($AG\r (AG\r A: 6  ("       ( (  ± @@   ( ö E\r   (G\r (AF\r  6   (  ö E\r @@  (F\r   (G\r AG\r A6   6  6   ((Aj6(@ ($AG\r  (AG\r  A: 6 A6,L @   ( ö E\r         ("        ( (  \' @   ( ö E\r          \n   $ #   kApq"$   # @  \r A !@A (Äõ E\r A (Äõ  !@A (ê E\r A (ê   r!@ø ( " E\r @@  (  (F\r     r!  (8" \r ù  @  (  (F\r   A A   ($    (\r A@  ("  ("F\r     k¬A  ((    A 6  B 7  B 7A ¯ê AíàÀï   N10emscripten3valE Â± â {"brand":"KKM","model":"Tracking K9","model_id":"K9","tag":"0708","condition":["servicedata","=",30,"index",0,"21010f","&","uuid","index",0,"feaa"],"properties":{".cal":{"decoder":["value_from_hex_data","servicedata",12,2,false,false],"post_proc":["/",256,"*",100,">",0,"/",100]},"tempc":{"decoder":["value_from_hex_data","servicedata",10,2,false,true],"post_proc":["+",".cal"]},"_.cal":{"decoder":["value_from_hex_data","servicedata",16,2,false,false],"post_proc":["/",256,"*",100,">",0,"/",100]},"hum":{"decoder":["value_from_hex_data","servicedata",14,2,false,false],"post_proc":["+",".cal"]},"volt":{"decoder":["value_from_hex_data","servicedata",6,4,false,false],"post_proc":["/",1000]},"accx":{"condition":["servicedata",0,"21010f"],"decoder":["value_from_hex_data","servicedata",18,4,false,true]},"accy":{"condition":["servicedata",0,"21010f"],"decoder":["value_from_hex_data","servicedata",22,4,false,true]},"accz":{"condition":["servicedata",0,"21010f"],"decoder":["value_from_hex_data","servicedata",26,4,false,true]}}} {"brand":"Tilt","model":"Brewing Hydro- Thermometer","model_id":"TILT","tag":"0201","condition":["manufacturerdata","=",50,"index",0,"4c000215a495bb","&","manufacturerdata","index",16,"c5b14b44b5121370f02d74de"],"properties":{"color":{"decoder":["string_from_hex_data","manufacturerdata",14,2],"lookup":["10","red","20","green","30","black","40","purple","50","orange","60","blue","70","yellow","80","pink"]},"tempf":{"decoder":["value_from_hex_data","manufacturerdata",40,4,false,true]},"gravity":{"decoder":["value_from_hex_data","manufacturerdata",44,4,false,false],"post_proc":["/",1000]},"txpower":{"condition":["manufacturerdata",48,"bit",3,1],"decoder":["value_from_hex_data","manufacturerdata",48,2,false,true]}}} {"brand":"Apple/Beats","model":"AirPods (Pro)/Solo|Studio Buds","model_id":"APPLEAIRPODS","tag":"1218","condition":["manufacturerdata","=",58,"index",0,"4c00071901"],"properties":{"version":{"decoder":["string_from_hex_data","manufacturerdata",10,4],"lookup":["0220","AirPods 1st gen.","0f20","AirPods 2nd gen.","0e20","AirPods Pro 1st gen.","1420","AirPods Pro 2 Lightning","2420","AirPods Pro 2 USB-C","0a20","AirPods Max Lightning","0320","PowerbeatsÂ³","0520","BeatsX","0620","Beats SoloÂ³"]},"color":{"decoder":["string_from_hex_data","manufacturerdata",22,2],"lookup":["00","white","01","black","02","red","03","blue","04","pink","05","gray","06","silver","07","gold","08","rose gold","09","space gray","0a","dark blue","0b","light blue","0c","yellow","11","green"]},"batt_r":{"condition":["manufacturerdata",14,"bit",1,1],"decoder":["value_from_hex_data","manufacturerdata",16,1],"post_proc":["*",10,"max",100]},"_batt_r":{"condition":["manufacturerdata",14,"bit",1,0,"&","manufacturerdata",10,"!","0a20"],"decoder":["value_from_hex_data","manufacturerdata",17,1],"post_proc":["*",10,"max",100]},"batt_l":{"condition":["manufacturerdata",14,"bit",1,1,"&","manufacturerdata",10,"!","0a20"],"decoder":["value_from_hex_data","manufacturerdata",17,1],"post_proc":["*",10,"max",100]},"_batt_l":{"condition":["manufacturerdata",14,"bit",1,0,"&","manufacturerdata",10,"!","0a20"],"decoder":["value_from_hex_data","manufacturerdata",16,1],"post_proc":["*",10,"max",100]},"batt_case":{"condition":["manufacturerdata",10,"!","0a20"],"decoder":["value_from_hex_data","manufacturerdata",19,1],"post_proc":["*",10,"max",100]},"charging_r":{"condition":["manufacturerdata",14,"bit",1,1],"decoder":["bit_static_value","manufacturerdata",18,1,false,true]},"_charging_r":{"condition":["manufacturerdata",14,"bit",1,0,"&","manufacturerdata",10,"!","0a20"],"decoder":["bit_static_value","manufacturerdata",18,0,false,true]},"charging_l":{"condition":["manufacturerdata",14,"bit",1,1,"&","manufacturerdata",10,"!","0a20"],"decoder":["bit_static_value","manufacturerdata",18,0,false,true]},"_charging_l":{"condition":["manufacturerdata",14,"bit",1,0,"&","manufacturerdata",10,"!","0a20"],"decoder":["bit_static_value","manufacturerdata",18,1,false,true]},"charging_case":{"condition":["manufacturerdata",10,"!","0a20"],"decoder":["bit_static_value","manufacturerdata",18,2,false,true]}}} {"brand":"Mopeka/Lippert","model":"Pro Check (Universal)/BottleCheck Sensor","model_id":"M1017","tag":"ff01","condition":["manufacturerdata","=",24,"index",0,"590003","|","manufacturerdata","=",24,"index",0,"590006","|","manufacturerdata","=",24,"index",0,"59000c"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",8,2,false,true],"post_proc":["&",127,"-",40,"min",-40]},".cal":{"decoder":["value_from_hex_data","manufacturerdata",8,2,false,true],"post_proc":["&",127]},"_.cal":{"decoder":["value_from_hex_data","manufacturerdata",8,2,false,true],"post_proc":["&",127,"*",".cal","*",-0.00000535]},"__.cal":{"decoder":["value_from_hex_data","manufacturerdata",8,2,false,true],"post_proc":["&",127,"*",-0.002822,"+",0.573045,"+",".cal"]},"lvl_cm":{"decoder":["value_from_hex_data","manufacturerdata",10,4,true,false],"post_proc":["&",16383,"*",".cal","/",10]},"sync":{"decoder":["bit_static_value","manufacturerdata",8,3,false,true]},"volt":{"decoder":["value_from_hex_data","manufacturerdata",6,2,false,false],"post_proc":["&",127,"/",32]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",6,2,false,false],"post_proc":["&",127,"/",32,"-",2.2,"/",0.65,"*",100,"max",100,"min",0]},"quality":{"decoder":["value_from_hex_data","manufacturerdata",12,2,false,false],"post_proc":[">",6,"max",3,"min",0]},"accx":{"decoder":["value_from_hex_data","manufacturerdata",20,2,false,true]},"accy":{"decoder":["value_from_hex_data","manufacturerdata",22,2,false,true]}}} {"brand":"iNode","model":"Energy Meter","model_id":"INEM","tag":"0c01","condition":["manufacturerdata","index",0,"90","|","manufacturerdata","index",0,"92","|","manufacturerdata","index",0,"94","|","manufacturerdata","index",0,"96","&","manufacturerdata","=",26,"index",2,"82"],"properties":{".cal":{"decoder":["value_from_hex_data","manufacturerdata",16,4,true,false],"post_proc":["&",16383]},"avg":{"decoder":["value_from_hex_data","manufacturerdata",4,4,true,false],"post_proc":["*",60,"/",".cal"]},"avgu":{"decoder":["bit_static_value","manufacturerdata",18,0,"kW","mÂ³"]},"sum":{"decoder":["value_from_hex_data","manufacturerdata",8,4,true,false],"post_proc":["/",".cal"]},"sumu":{"decoder":["bit_static_value","manufacturerdata",18,0,"kWh","mÂ³"]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",20,1,false,false],"post_proc":["-",1,"*",10]},"_batt":{"condition":["manufacturerdata",20,"1","|","manufacturerdata",20,"c","|","manufacturerdata",20,"d","|","manufacturerdata",20,"e","|","manufacturerdata",20,"f"],"decoder":["static_value",100]},"lowbatt":{"decoder":["bit_static_value","manufacturerdata",1,2,false,true]}}} {"brand":"SmartDry","model":"Laundry Sensor","model_id":"SDLS","tag":"ff01","condition":["manufacturerdata","=",28,"index",0,"ae01"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",4,8,true,false,true]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",12,8,true,false,true]},"shake":{"decoder":["value_from_hex_data","manufacturerdata",20,4,true,false]},"volt":{"decoder":["value_from_hex_data","manufacturerdata",24,2,false,false],"post_proc":["+","2847","/",1000]},"wake":{"decoder":["bit_static_value","manufacturerdata",27,0,false,true]}}} {"brand":"ThermoPro","model":"TH Sensor","model_id":"TP35X/393","tag":"0103","condition":["name","index",0,"TP350","|","name","index",0,"TP357","|","name","index",0,"TP358","|","name","index",0,"TP359","|","name","index",0,"TP393","&","manufacturerdata",">=",12,"index",0,"c2"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",2,4,true,true],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",6,2,false,false]},"batt_low":{"condition":["manufacturerdata",9,"bit",1,1],"decoder":["static_value",false]},"_batt_low":{"condition":["manufacturerdata",9,"bit",1,0],"decoder":["static_value",true]}}} {"brand":"Xiaomi","model":"Mi Body Composition Scale","model_id":"XMTZC02HM/XMTZC05HM","tag":"05","condition":["servicedata","index",1,"22","|","servicedata","index",1,"2a","|","servicedata","index",1,"62","|","servicedata","index",1,"6a","&","servicedata","=",26,"&","uuid","contain","181b"],"properties":{"weighing_mode":{"decoder":["bit_static_value","servicedata",1,2,"person","object"]},"unit":{"decoder":["static_value","kg"]},"weight":{"decoder":["value_from_hex_data","servicedata",22,4,true,false],"post_proc":["/",200]},"impedance":{"condition":["servicedata",3,"6"],"decoder":["value_from_hex_data","servicedata",18,4,true,false]}}} {"brand":"Xiaomi","model":"Mi Body Composition Scale","model_id":"XMTZC02HM/XMTZC05HM","tag":"05","condition":["servicedata","index",1,"32","|","servicedata","index",1,"3a","|","servicedata","index",1,"72","|","servicedata","index",1,"7a","&","servicedata","=",26,"&","uuid","contain","181b"],"properties":{"weighing_mode":{"decoder":["bit_static_value","servicedata",1,2,"person","object"]},"unit":{"decoder":["static_value","lb"]},"weight":{"decoder":["value_from_hex_data","servicedata",22,4,true,false],"post_proc":["/",100]},"impedance":{"condition":["servicedata",3,"6"],"decoder":["value_from_hex_data","servicedata",18,4,true,false]}}} {"brand":"Qingping","model":"Air Monitor Lite","model_id":"CGDN1","tag":"0f","condition":["servicedata","=",48,"index",2,"0e","|","servicedata","=",48,"index",2,"24","&","uuid","index",0,"fdcd"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",20,4,true,false],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","servicedata",24,4,true,false],"post_proc":["/",10]},"pm25":{"decoder":["value_from_hex_data","servicedata",32,4,true,false]},"pm10":{"decoder":["value_from_hex_data","servicedata",36,4,true,false]},"co2":{"decoder":["value_from_hex_data","servicedata",44,4,true,false]}}} {"brand":"Sensirion","model":"MyCOâ/COâ Gadget","model_id":"SCD4X","tag":"0f","condition":["manufacturerdata",">=",24,"index",0,"d5060008","|","manufacturerdata",">=",24,"index",0,"d506000a"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",12,4,true,true],"post_proc":["*",175,"/",65535,"-",45]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",16,4,true,false],"post_proc":["*",100,"/",65535]},"co2":{"decoder":["value_from_hex_data","manufacturerdata",20,4,true,false]}}} {"brand":"Govee","model":"Smart CO2 Monitor","model_id":"H5140","tag":"0f03","condition":["name","contain","GV5140","&","manufacturerdata",">=",20,"index",0,"01000101"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",8,6,false,false],"post_proc":["/",10000]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",8,6,false,false],"post_proc":["&",2147483647,"%",1000,"/",10]},"co2":{"decoder":["value_from_hex_data","manufacturerdata",14,4,false,false]}}} {"brand":"Xiaomi","model":"TH Sensor","model_id":"LYWSD03MMC/MJWSD05MMC_PVVX_BTHOME","tag":"0102","condition":["servicedata","=",22,"index",0,"40","|","servicedata","=",20,"index",0,"40","&","uuid","index",0,"fcd2","&","name","index",0,"ATC"],"properties":{"packet_1":{"condition":["servicedata",2,"00","&","servicedata","=",22],"decoder":["value_from_hex_data","servicedata",4,2,false,false]},"tempc":{"condition":["servicedata",10,"02","&","servicedata","=",22],"decoder":["value_from_hex_data","servicedata",12,4,true,true],"post_proc":["/",100]},"hum":{"condition":["servicedata",16,"03","&","servicedata","=",22],"decoder":["value_from_hex_data","servicedata",18,4,true,false],"post_proc":["/",100]},"batt":{"condition":["servicedata",6,"01","&","servicedata","=",22],"decoder":["value_from_hex_data","servicedata",8,2,false,false]},"packet_2":{"condition":["servicedata",2,"00","&","servicedata","=",20],"decoder":["value_from_hex_data","servicedata",4,2,false,false]},"volt":{"condition":["servicedata",6,"0c","&","servicedata","=",20],"decoder":["value_from_hex_data","servicedata",8,4,true,false],"post_proc":["/",1000]},"power":{"condition":["servicedata",12,"10","&","servicedata","=",20],"decoder":["value_from_hex_data","servicedata",14,2,false,false]},"open":{"condition":["servicedata",16,"11","&","servicedata","=",20],"decoder":["value_from_hex_data","servicedata",18,2,false,false]}}} {"brand":"Xiaomi","model":"TH Sensor","model_id":"LYWSD03MMC/MJWSD05MMC_PVVX_DECR","tag":"01","condition":["servicedata","=",12,"&","uuid","index",0,"181a"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",0,4,true,true],"post_proc":["/",100]},"hum":{"decoder":["value_from_hex_data","servicedata",4,4,true,false],"post_proc":["/",100]},"batt":{"decoder":["value_from_hex_data","servicedata",8,2,false,false]}}} {"brand":"Blue Maestro","model":"Tempo Disc","model_id":"TD1in1","tag":"0108","condition":["manufacturerdata","index",4,"0d","&","manufacturerdata","=",24,"index",0,"3301"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",16,4,false,true],"post_proc":["/",10]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",6,2,false,false]}}} {"brand":"Blue Maestro","model":"Tempo Disc","model_id":"TD3in1","tag":"0208","condition":["manufacturerdata","index",4,"16","|","manufacturerdata","index",4,"17","&","manufacturerdata","=",32,"index",0,"3301"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",16,4,false,true],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",20,4,false,false],"post_proc":["/",10]},"tempc2_dp":{"decoder":["value_from_hex_data","manufacturerdata",24,4,false,true],"post_proc":["/",10]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",6,2,false,false]}}} {"brand":"Blue Maestro","model":"Tempo Disc","model_id":"TD4in1","tag":"0208","condition":["manufacturerdata","index",4,"1b","&","manufacturerdata","=",32,"index",0,"3301"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",16,4,false,true],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",20,4,false,false],"post_proc":["/",10]},"pres":{"decoder":["value_from_hex_data","manufacturerdata",24,4,false,false],"post_proc":["/",10]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",6,2,false,false]}}} {"brand":"Govee","model":"Thermo-Hygrometer","model_id":"H5179_N","tag":"0103","condition":["name","index",0,"GV5179","&","manufacturerdata",">=",16,"index",0,"0100"],"properties":{"tempc":{"condition":["manufacturerdata",8,"bit",3,0],"decoder":["value_from_hex_data","manufacturerdata",8,6,false,false],"post_proc":["/",1000,">",0,"/",10]},"_tempc":{"condition":["manufacturerdata",8,"bit",3,1],"decoder":["value_from_hex_data","manufacturerdata",8,6,false,false],"post_proc":["&",8388607,"/",1000,">",0,"/",10,"*",-1]},"hum":{"condition":["name","not_contain","GV5108"],"decoder":["value_from_hex_data","manufacturerdata",8,6,false,false],"post_proc":["&",8388607,"%",1000,"/",10]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",14,2,false,false]}}} {"brand":"Govee","model":"Smart Thermo-Hygrometer","model_id":"H5100/01/02/04/05/08/74/77","tag":"0103","condition":["name","index",0,"GVH5100","|","name","index",0,"GVH5101","|","name","index",0,"GVH5102","|","name","index",0,"GVH5104","|","name","index",0,"GVH5174","|","name","index",0,"GVH5177","|","name","index",0,"GVH5105","|","name","index",0,"GV5108","&","manufacturerdata",">=",16,"index",0,"0100"],"properties":{"tempc":{"condition":["manufacturerdata",8,"bit",3,0],"decoder":["value_from_hex_data","manufacturerdata",8,6,false,false],"post_proc":["/",1000,">",0,"/",10]},"_tempc":{"condition":["manufacturerdata",8,"bit",3,1],"decoder":["value_from_hex_data","manufacturerdata",8,6,false,false],"post_proc":["&",8388607,"/",1000,">",0,"/",10,"*",-1]},"hum":{"condition":["name","not_contain","GV5108"],"decoder":["value_from_hex_data","manufacturerdata",8,6,false,false],"post_proc":["&",8388607,"%",1000,"/",10]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",14,2,false,false]}}} {"brand":"Govee","model":"Thermo-Hygrometer","model_id":"H5074","tag":"0103","condition":["name","index",0,"Govee_H5074","&","manufacturerdata",">=",18,"index",0,"88ec"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",6,4,true,true],"post_proc":["/",100]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",10,4,true,false],"post_proc":["/",100]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",14,2,false,false]}}} {"brand":"Inkbird","model":"T(H) Sensor","model_id":"IBS-TH1/TH2/P01B/ITH-12S","tag":"0103","condition":["name","index",0,"sps","|","name","index",0,"tps","&","manufacturerdata","=",18],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",0,4,true],"post_proc":["/",100]},"extprobe":{"condition":["manufacturerdata",9,"0","&","name","contain","sps"],"decoder":["static_value",false]},"_extprobe":{"condition":["manufacturerdata",9,"!","0","&","name","contain","sps"],"decoder":["static_value",true]},"hum":{"condition":["manufacturerdata",4,"!","ffff","&","manufacturerdata",4,"!","0000"],"decoder":["value_from_hex_data","manufacturerdata",4,4,true,false],"post_proc":["/",100]},"batt":{"condition":["manufacturerdata",14,"!","f","&","manufacturerdata",14,"!","e"],"decoder":["value_from_hex_data","manufacturerdata",14,2,false,false]}}} {"brand":"Otio/BeeWi","model":"Door & Window Sensor","model_id":"BSDOO","tag":"0405","condition":["manufacturerdata","=",14,"index",4,"080c"],"properties":{"open":{"decoder":["bit_static_value","manufacturerdata",9,0,false,true]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",12,2,false,false]}}} {"brand":"Govee","model":"Thermo-Hygrometer","model_id":"H5072/75","tag":"0103","condition":["name","index",0,"GVH5072","|","name","index",0,"GVH5075","&","manufacturerdata",">=",16,"index",0,"88ec"],"properties":{"tempc":{"condition":["manufacturerdata",6,"bit",3,0],"decoder":["value_from_hex_data","manufacturerdata",6,6,false,false],"post_proc":["/",1000,">",0,"/",10]},"_tempc":{"condition":["manufacturerdata",6,"bit",3,1],"decoder":["value_from_hex_data","manufacturerdata",6,6,false,false],"post_proc":["&",8388607,"/",10000,"*",-1]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",6,6,false,false],"post_proc":["&",8388607,"%",1000,"/",10]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",12,2,false,false]}}} {"brand":"Xiaomi/VegTrug","model":"MiFlora","model_id":"HHCCJCY10","tag":"09","condition":["servicedata","=",18,"&","uuid","index",0,"fd50"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",2,4,false,true],"post_proc":["/",10]},"moi":{"decoder":["value_from_hex_data","servicedata",0,2,false,false]},"lux":{"decoder":["value_from_hex_data","servicedata",6,6,false,false]},"fer":{"decoder":["value_from_hex_data","servicedata",14,4,false,false]},"batt":{"decoder":["value_from_hex_data","servicedata",12,2,false,false]}}} {"brand":"Jaalee","model":"TH sensor","model_id":"F525/F51C","tag":"0102","condition":["uuid","contain","f525","|","uuid","contain","f51c","&","manufacturerdata","=",52],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",40,4,false],"post_proc":["*",175,"/",65535,"-",45]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",44,4,false,false],"post_proc":["*",100,"/",65535]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",50,2,false,false]}}} {"brand":"Govee","model":"Thermo-Hygrometer","model_id":"H5179","tag":"0103","condition":["name","index",0,"Govee_H5179","&","manufacturerdata","=",22,"index",0,"0188ec"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",12,4,true,true],"post_proc":["/",100]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",16,4,true,false],"post_proc":["/",100]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",20,2,false,false]}}} {"brand":"Polar","model":"Heart Rate Sensor","model_id":"H10","tag":"0b00","condition":["manufacturerdata","=",12,"index",0,"6b00"],"properties":{"bpm":{"decoder":["value_from_hex_data","manufacturerdata",10,2,false,false]}}} {"brand":"GENERIC","model":"Service data","model_id":"ServiceData","tag":"08","condition":["uuid","index",0,"180f"],"properties":{"batt":{"decoder":["value_from_hex_data","servicedata",0,2,false,false]}}} {"brand":"Govee","model":"Bluetooth BBQ Thermometer","model_id":"H5055","tag":"0301","condition":["manufacturerdata","index",12,"06","|","manufacturerdata","index",12,"20","|","manufacturerdata","index",12,"22","&","manufacturerdata","=",44,"index",40,"0000","|","manufacturerdata","=",41,"index",40,"0"],"properties":{"tempc1":{"condition":["manufacturerdata",14,"!","ffff","&","manufacturerdata",10,"bit",3,0,"&","manufacturerdata",10,"bit",2,0],"decoder":["value_from_hex_data","manufacturerdata",14,4,true,false]},"tempc2":{"condition":["manufacturerdata",28,"!","ffff","&","manufacturerdata",10,"bit",3,0,"&","manufacturerdata",10,"bit",2,0],"decoder":["value_from_hex_data","manufacturerdata",28,4,true,false]},"tempc3":{"condition":["manufacturerdata",14,"!","ffff","&","manufacturerdata",10,"bit",3,0,"&","manufacturerdata",10,"bit",2,1],"decoder":["value_from_hex_data","manufacturerdata",14,4,true,false]},"tempc4":{"condition":["manufacturerdata",28,"!","ffff","&","manufacturerdata",10,"bit",3,0,"&","manufacturerdata",10,"bit",2,1],"decoder":["value_from_hex_data","manufacturerdata",28,4,true,false]},"tempc5":{"condition":["manufacturerdata",14,"!","ffff","&","manufacturerdata",10,"bit",3,1,"&","manufacturerdata",10,"bit",2,0],"decoder":["value_from_hex_data","manufacturerdata",14,4,true,false]},"tempc6":{"condition":["manufacturerdata",28,"!","ffff","&","manufacturerdata",10,"bit",3,1,"&","manufacturerdata",10,"bit",2,0],"decoder":["value_from_hex_data","manufacturerdata",28,4,true,false]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",8,2,false]}}} {"brand":"Apple","model":"Apple Watch","model_id":"APPLEWATCH","tag":"0b18","condition":["manufacturerdata","index",10,"98","|","manufacturerdata","index",10,"18","&","manufacturerdata","=",18,"index",0,"4c001005"],"properties":{"unlocked":{"condition":["manufacturerdata",10,"98"],"decoder":["static_value",true]},"_unlocked":{"condition":["manufacturerdata",10,"18"],"decoder":["static_value",false]}}} {"brand":"Shelly","model":"ShellyBLU Motion","model_id":"SBMO-003Z","tag":"0406","condition":["servicedata","=",22,"index",0,"44","&","uuid","index",0,"fcd2","&","name","index",0,"SBMO-"],"properties":{"packet":{"condition":["servicedata",2,"00"],"decoder":["value_from_hex_data","servicedata",4,2,false,false]},"batt":{"condition":["servicedata",6,"01"],"decoder":["value_from_hex_data","servicedata",8,2,false,false]},"lux":{"condition":["servicedata",10,"05"],"decoder":["value_from_hex_data","servicedata",12,6,true,false],"post_proc":["/",100]},"motion":{"condition":["servicedata",18,"21"],"decoder":["bit_static_value","servicedata",21,0,false,true]},"mac":{"condition":["manufacturerdata","=",30],"decoder":["revmac_from_hex_data","manufacturerdata",18]}}} {"brand":"Shelly","model":"ShellyBLU Door/Window encrypted","model_id":"SBDW_002C_ENCR","tag":"040602","condition":["servicedata","index",0,"45","&","uuid","index",0,"fcd2","&","name","index",0,"SBDW-"],"properties":{"cipher":{"decoder":["string_from_hex_data","servicedata",2,26]},"ctr":{"decoder":["string_from_hex_data","servicedata",28,8]},"mic":{"decoder":["string_from_hex_data","servicedata",36,8]},"mac":{"condition":["manufacturerdata","=",30],"decoder":["revmac_from_hex_data","manufacturerdata",18]}}} {"brand":"Shelly","model":"ShellyBLU H&T encrypted","model_id":"SBHT-003C_ENCR","tag":"010602","condition":["servicedata","=",36,"index",0,"45","|","servicedata","=",40,"index",0,"45","&","uuid","index",0,"fcd2","&","name","index",0,"SBHT-"],"properties":{"cipher":{"condition":["servicedata","=",36],"decoder":["string_from_hex_data","servicedata",2,18]},"_cipher":{"condition":["servicedata","=",40],"decoder":["string_from_hex_data","servicedata",2,22]},"ctr":{"condition":["servicedata","=",36],"decoder":["string_from_hex_data","servicedata",20,8]},"_ctr":{"condition":["servicedata","=",40],"decoder":["string_from_hex_data","servicedata",24,8]},"mic":{"condition":["servicedata","=",36],"decoder":["string_from_hex_data","servicedata",28,8]},"_mic":{"condition":["servicedata","=",40],"decoder":["string_from_hex_data","servicedata",32,8]},"mac":{"condition":["manufacturerdata","=",30],"decoder":["revmac_from_hex_data","manufacturerdata",18]}}} {"brand":"Shelly","model":"ShellyBLU Button1 encrypted","model_id":"SBBT_002C_ENCR","tag":"110602","condition":["servicedata","index",0,"41","|","servicedata","index",0,"45","&","uuid","index",0,"fcd2","&","name","index",0,"SBBT-"],"properties":{"cipher":{"decoder":["string_from_hex_data","servicedata",2,12]},"ctr":{"decoder":["string_from_hex_data","servicedata",14,8]},"mic":{"decoder":["string_from_hex_data","servicedata",22,8]},"mac":{"condition":["manufacturerdata","=",30],"decoder":["revmac_from_hex_data","manufacturerdata",18]}}} {"brand":"Shelly","model":"ShellyBLU Motion encrypted","model_id":"SBMO_003Z_ENCR","tag":"040602","condition":["servicedata","index",0,"45","&","uuid","index",0,"fcd2","&","name","index",0,"SBMO-"],"properties":{"cipher":{"decoder":["string_from_hex_data","servicedata",2,20]},"ctr":{"decoder":["string_from_hex_data","servicedata",22,8]},"mic":{"decoder":["string_from_hex_data","servicedata",30,8]},"mac":{"condition":["manufacturerdata","=",30],"decoder":["revmac_from_hex_data","manufacturerdata",18]}}} {"brand":"Shelly","model":"ShellyBLU Switch4","model_id":"SBBT-004CEU/US","tag":"1106","condition":["servicedata","=",26,"index",0,"40","|","servicedata","=",26,"index",0,"44","&","uuid","index",0,"fcd2","&","name","index",0,"SBBT-"],"properties":{"packet":{"condition":["servicedata",2,"00"],"decoder":["value_from_hex_data","servicedata",4,2,false,false]},"batt":{"condition":["servicedata",6,"01"],"decoder":["value_from_hex_data","servicedata",8,2,false,false]},"button1":{"condition":["servicedata",10,"3a"],"decoder":["string_from_hex_data","servicedata",12,2],"lookup":["00",0,"01",1,"02",2,"03",3,"04",9,"fe",11]},"button2":{"condition":["servicedata",14,"3a"],"decoder":["string_from_hex_data","servicedata",16,2],"lookup":["00",0,"01",1,"02",2,"03",3,"04",9,"fe",11]},"button3":{"condition":["servicedata",18,"3a"],"decoder":["string_from_hex_data","servicedata",20,2],"lookup":["00",0,"01",1,"02",2,"03",3,"04",9,"fe",11]},"button4":{"condition":["servicedata",22,"3a"],"decoder":["string_from_hex_data","servicedata",24,2],"lookup":["00",0,"01",1,"02",2,"03",3,"04",9,"fe",11]},"mac":{"condition":["manufacturerdata","=",30],"decoder":["revmac_from_hex_data","manufacturerdata",18]}}} {"brand":"Shelly","model":"ShellyBLU Button1","model_id":"SBBT-002C","tag":"1106","condition":["servicedata","=",14,"index",0,"40","|","servicedata","=",14,"index",0,"44","&","uuid","index",0,"fcd2","&","name","index",0,"SBBT-"],"properties":{"packet":{"condition":["servicedata",2,"00"],"decoder":["value_from_hex_data","servicedata",4,2,false,false]},"batt":{"condition":["servicedata",6,"01"],"decoder":["value_from_hex_data","servicedata",8,2,false,false]},"button":{"condition":["servicedata",10,"3a"],"decoder":["string_from_hex_data","servicedata",12,2],"lookup":["00",0,"01",1,"02",2,"03",3,"04",9,"fe",11]},"mac":{"condition":["manufacturerdata","=",30],"decoder":["revmac_from_hex_data","manufacturerdata",18]}}} {"brand":"Shelly","model":"ShellyBLU Door/Window","model_id":"SBDW-002C","tag":"0406","condition":["servicedata","=",28,"index",0,"44","&","uuid","index",0,"fcd2","&","name","index",0,"SBDW-"],"properties":{"packet":{"condition":["servicedata",2,"00"],"decoder":["value_from_hex_data","servicedata",4,2,false,false]},"batt":{"condition":["servicedata",6,"01"],"decoder":["value_from_hex_data","servicedata",8,2,false,false]},"lux":{"condition":["servicedata",10,"05"],"decoder":["value_from_hex_data","servicedata",12,6,true,false],"post_proc":["/",100]},"open":{"condition":["servicedata",18,"2d"],"decoder":["bit_static_value","servicedata",21,0,false,true]},"rot":{"condition":["servicedata",22,"3f"],"decoder":["value_from_hex_data","servicedata",24,4,true,true],"post_proc":["/",10]},"mac":{"condition":["manufacturerdata","=",30],"decoder":["revmac_from_hex_data","manufacturerdata",18]}}} {"brand":"Shelly","model":"ShellyBLU H&T","model_id":"SBHT-003C","tag":"0106","condition":["servicedata","=",20,"index",0,"44","|","servicedata","=",24,"index",0,"44","&","uuid","index",0,"fcd2","&","name","index",0,"SBHT-"],"properties":{"packet":{"condition":["servicedata",2,"00"],"decoder":["value_from_hex_data","servicedata",4,2,false,false]},"batt":{"condition":["servicedata",6,"01"],"decoder":["value_from_hex_data","servicedata",8,2,false,false]},"hum":{"condition":["servicedata",10,"2e"],"decoder":["value_from_hex_data","servicedata",12,2,false,false]},"button":{"condition":["servicedata",14,"3a"],"decoder":["string_from_hex_data","servicedata",16,2],"lookup":["01",1,"fe",11]},"_button":{"condition":["servicedata",14,"!","3a"],"decoder":["static_value",0]},"tempc":{"condition":["servicedata",14,"45"],"decoder":["value_from_hex_data","servicedata",16,4,true,true],"post_proc":["/",10]},"_tempc":{"condition":["servicedata",18,"45"],"decoder":["value_from_hex_data","servicedata",20,4,true,true],"post_proc":["/",10]},"mac":{"condition":["manufacturerdata","=",30],"decoder":["revmac_from_hex_data","manufacturerdata",18]}}} {"brand":"Xiaomi","model":"TH Sensor","model_id":"LYWSD03MMC/MJWSD05MMC_PVVX_BTHOME_ENCR","tag":"010202","condition":["servicedata","=",34,"index",0,"41","&","uuid","index",0,"fcd2","&","name","index",0,"ATC"],"properties":{"cipher":{"decoder":["string_from_hex_data","servicedata",2,16]},"ctr":{"decoder":["string_from_hex_data","servicedata",18,8]},"mic":{"decoder":["string_from_hex_data","servicedata",26,8]}}} {"brand":"Xiaomi","model":"TH Sensor","model_id":"LYWSD03MMC/MJWSD05MMC_PVVX_BTHOME_ENCR","tag":"010202","condition":["servicedata","=",32,"index",0,"41","&","uuid","index",0,"fcd2","&","name","index",0,"ATC"],"properties":{"cipher":{"decoder":["string_from_hex_data","servicedata",2,14]},"ctr":{"decoder":["string_from_hex_data","servicedata",16,8]},"mic":{"decoder":["string_from_hex_data","servicedata",24,8]}}} {"brand":"Xiaomi","model":"TH Sensor","model_id":"LYWSD03MMC/MJWSD05MMC_PVVX_ENCR","tag":"010001","condition":["servicedata","=",22,"&","uuid","index",0,"181a"],"properties":{"cipher":{"decoder":["string_from_hex_data","servicedata",2,12]},"ctr":{"decoder":["string_from_hex_data","servicedata",0,2]},"mic":{"decoder":["string_from_hex_data","servicedata",14,8]}}} {"brand":"GENERIC","model":"GAEN","model_id":"GAEN","tag":"fe","condition":["uuid","index",0,"fd6f"],"properties":{"rpi":{"decoder":["string_from_hex_data","servicedata",0,32]},"aem":{"decoder":["string_from_hex_data","servicedata",32,8]}}} {"brand":"GENERIC","model":"ThermoBeacon","model_id":"WS02/WS08","tag":"0101","condition":["manufacturerdata","index",0,"1000","|","manufacturerdata","index",0,"1100","|","manufacturerdata","index",0,"1500","|","manufacturerdata","index",0,"1800","|","manufacturerdata","index",0,"1b00","&","manufacturerdata",">=",40],"properties":{"tempc":{"condition":["manufacturerdata","=",40],"decoder":["value_from_hex_data","manufacturerdata",24,4,true],"post_proc":["/",16]},"hum":{"condition":["manufacturerdata","=",40],"decoder":["value_from_hex_data","manufacturerdata",28,4,true],"post_proc":["/",16]},"volt":{"condition":["manufacturerdata","=",40],"decoder":["value_from_hex_data","manufacturerdata",20,4,true],"post_proc":["/",1000]},"time":{"condition":["manufacturerdata","=",40],"decoder":["value_from_hex_data","manufacturerdata",32,8,true,false]},"tempc_max":{"condition":["manufacturerdata","=",44],"decoder":["value_from_hex_data","manufacturerdata",20,4,true],"post_proc":["/",16]},"time_max":{"condition":["manufacturerdata","=",44],"decoder":["value_from_hex_data","manufacturerdata",24,8,true,false]},"tempc_min":{"condition":["manufacturerdata","=",44],"decoder":["value_from_hex_data","manufacturerdata",32,4,true],"post_proc":["/",16]},"time_min":{"condition":["manufacturerdata","=",44],"decoder":["value_from_hex_data","manufacturerdata",36,8,true,false]},"mac":{"decoder":["revmac_from_hex_data","manufacturerdata",8]}}} {"brand":"Inkbird","model":"iBBQ","model_id":"IBT-2X(S)","tag":"0301","condition":["manufacturerdata","=",28,"index",0,"01000000","&","manufacturerdata","revmac@index",8],"conditionnomac":["name","index",0,"iBBQ","|","name","index",0,"xBBQ","&","manufacturerdata","=",28,"index",0,"01000000"],"properties":{"tempc":{"condition":["manufacturerdata",22,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",20,4,true,false],"post_proc":["/",10]},"tempc2":{"condition":["manufacturerdata",26,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",24,4,true,false],"post_proc":["/",10]},"mac":{"decoder":["revmac_from_hex_data","manufacturerdata",8]}}} {"brand":"Oria","model":"TH Sensor","model_id":"T201","tag":"0103","condition":["name","index",0,"T201","&","manufacturerdata",">=",38],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",24,4,false,true],"post_proc":["/",100]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",28,4,false,false],"post_proc":["/",100]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",32,2,false,false]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",8]}}} {"brand":"Oria","model":"TH Sensor","model_id":"T301","tag":"0103","condition":["name","index",0,"T301","&","manufacturerdata","=",38],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",24,4,false,true],"post_proc":["/",100]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",28,4,false,false],"post_proc":["/",100]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",32,2,false,false]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",8]}}} {"brand":"Inkbird","model":"iBBQ","model_id":"IBT-2X(S)","tag":"0301","condition":["manufacturerdata","=",28,"index",0,"00000000","&","manufacturerdata","mac@index",8],"conditionnomac":["name","index",0,"iBBQ","|","name","index",0,"xBBQ","&","manufacturerdata","=",28,"index",0,"00000000"],"properties":{"tempc":{"condition":["manufacturerdata",22,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",20,4,true,false],"post_proc":["/",10]},"tempc2":{"condition":["manufacturerdata",26,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",24,4,true,false],"post_proc":["/",10]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",8]}}} {"brand":"Inkbird","model":"iBBQ","model_id":"IBT-4X(S/C)","tag":"0301","condition":["manufacturerdata","=",36,"index",0,"00000000","&","manufacturerdata","mac@index",8],"conditionnomac":["name","index",0,"iBBQ","&","manufacturerdata","=",36,"index",0,"00000000"],"properties":{"tempc":{"condition":["manufacturerdata",22,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",20,4,true,false],"post_proc":["/",10]},"tempc2":{"condition":["manufacturerdata",26,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",24,4,true,false],"post_proc":["/",10]},"tempc3":{"condition":["manufacturerdata",30,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",28,4,true,false],"post_proc":["/",10]},"tempc4":{"condition":["manufacturerdata",34,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",32,4,true,false],"post_proc":["/",10]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",8]}}} {"brand":"Inkbird/Tenergy","model":"iBBQ/SOLIS6","model_id":"IBT-6XS/SOLIS-6","tag":"0301","condition":["manufacturerdata","=",44,"index",0,"00000000","&","manufacturerdata","mac@index",8],"conditionnomac":["name","index",0,"iBBQ","&","manufacturerdata","=",44,"index",0,"00000000"],"properties":{"tempc":{"condition":["manufacturerdata",22,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",20,4,true,false],"post_proc":["/",10]},"tempc2":{"condition":["manufacturerdata",26,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",24,4,true,false],"post_proc":["/",10]},"tempc3":{"condition":["manufacturerdata",30,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",28,4,true,false],"post_proc":["/",10]},"tempc4":{"condition":["manufacturerdata",34,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",32,4,true,false],"post_proc":["/",10]},"tempc5":{"condition":["manufacturerdata",38,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",36,4,true,false],"post_proc":["/",10]},"tempc6":{"condition":["manufacturerdata",42,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",40,4,true,false],"post_proc":["/",10]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",8]}}} {"brand":"Feasycom","model":"Beacon","model_id":"FEASY","tag":"0608","condition":["servicedata","=",22,"&","uuid","index",0,"fff0"],"properties":{"beaconmodel":{"decoder":["string_from_hex_data","servicedata",0,2,false,false],"lookup":["15","BP102","19","BP109","1a","BP103","1b","BP104","1c","BP201","1d","BP106","1e","BP101","24","BP120","27","BP108","28","BP108N","29","BP103B","46","BP104D"]},"batt":{"condition":["servicedata",20,"!","65"],"decoder":["value_from_hex_data","servicedata",20,2,false,false],"post_proc":["&",127]},"plugged_in":{"condition":["servicedata",20,"65"],"decoder":["static_value",true]},"_plugged_in":{"condition":["servicedata",20,"!","65"],"decoder":["static_value",false]},"mac":{"decoder":["mac_from_hex_data","servicedata",8]}}} {"brand":"MikroTik","model":"TG-BT5-IN/-OUT","model_id":"TG-BT5","tag":"0708","condition":["manufacturerdata","=",40,"index",0,"4f090100"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",24,4,true,true],"post_proc":["/",256]},"accx":{"decoder":["value_from_hex_data","manufacturerdata",12,4,true,true],"post_proc":["/",256]},"accy":{"decoder":["value_from_hex_data","manufacturerdata",16,4,true,true],"post_proc":["/",256]},"accz":{"decoder":["value_from_hex_data","manufacturerdata",20,4,true,true],"post_proc":["/",256]},"flag_reed":{"decoder":["bit_static_value","manufacturerdata",37,0,false,true]},"flag_tilt":{"decoder":["bit_static_value","manufacturerdata",37,1,false,true]},"flag_fall":{"decoder":["bit_static_value","manufacturerdata",37,2,false,true]},"flag_impact_x":{"decoder":["bit_static_value","manufacturerdata",37,3,false,true]},"flag_impact_y":{"decoder":["bit_static_value","manufacturerdata",36,0,false,true]},"flag_impact_z":{"decoder":["bit_static_value","manufacturerdata",36,1,false,true]},"uptime":{"decoder":["value_from_hex_data","manufacturerdata",28,8,true,false]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",38,2,false,false],"post_proc":["&",127]}}} {"brand":"EcoFlow","model":"Power Station","model_id":"ECOFLOW_ADV","tag":"1409","condition":["manufacturerdata","=",52,"index",0,"b5b5"],"properties":{"version":{"decoder":["string_from_hex_data","manufacturerdata",6,6],"lookup":["00","off","523630","RIVER 2","523631","RIVER 2 Max","523632","RIVER 2 Pro","523635","RIVER 3","523333","DELTA 2"]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",38,2,false,false],"post_proc":["&",127]}}} {"brand":"XOSS","model":"X2 Heart Rate Sensor","model_id":"XOSSX2","tag":"0b01","condition":["manufacturerdata","=",12,"index",0,"04ff"],"properties":{"bpm":{"decoder":["value_from_hex_data","manufacturerdata",10,2,false,false]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",6,2,false,false],"post_proc":["&",127]}}} {"brand":"Oras","model":"Smart faucet","model_id":"ORAS","tag":"0801","condition":["manufacturerdata","=",40,"index",0,"3101"],"properties":{"serial":{"decoder":["ascii_from_hex_data","manufacturerdata",10,20]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",6,2,false,false],"post_proc":["&",127]}}} {"brand":"Aranet","model":"Aranet4 COâ Monitor","model_id":"ARANET4","tag":"0f","condition":["manufacturerdata","=",48,"index",0,"0207"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",24,4,true,true],"post_proc":["/",20]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",32,2,false,false]},"pres":{"decoder":["value_from_hex_data","manufacturerdata",28,4,true,false],"post_proc":["/",10]},"co2":{"decoder":["value_from_hex_data","manufacturerdata",20,4,true,false]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",34,2,false,false],"post_proc":["&",127]}}} {"brand":"NodOn","model":"NIU smart button","model_id":"NODONNIU","tag":"1106","condition":["servicedata","=",32,"&","uuid","index",0,"0000"],"properties":{"button":{"decoder":["string_from_hex_data","servicedata",30,2],"lookup":["01",1,"02",2,"03",9,"04",10,"05",3,"06",4,"07",5]},"color":{"decoder":["string_from_hex_data","servicedata",20,4],"lookup":["0002","White","0003","TechBlue","0004","CozyGrey","0005","Wazabi","0006","Lagoon","0007","Softberry"]},"batt":{"decoder":["value_from_hex_data","servicedata",24,2,false,false],"post_proc":["&",127]}}} {"brand":"SwitchBot","model":"Outdoor Meter","model_id":"W340001X","tag":"0100","condition":["servicedata","=",6,"index",0,"77","&","name","index",0,"WoIOSensorTH"],"properties":{"batt":{"decoder":["value_from_hex_data","servicedata",4,2,false,false],"post_proc":["&",127]}}} {"brand":"SwitchBot","model":"Curtain (2/3)","model_id":"W070160X","tag":"0d22","condition":["servicedata","=",10,"index",0,"63","|","servicedata","=",12,"index",0,"63","|","servicedata","=",12,"index",0,"7b","&",["uuid","index",0,"0d00","|","uuid","index",0,"fd3d"]],"properties":{"moving":{"decoder":["bit_static_value","servicedata",6,3,false,true]},"position":{"decoder":["value_from_hex_data","servicedata",6,2,false,false],"post_proc":["&",127]},"calibrated":{"decoder":["bit_static_value","servicedata",2,2,false,true]},"lightlevel":{"decoder":["value_from_hex_data","servicedata",8,1,false,false]},"batt":{"decoder":["value_from_hex_data","servicedata",4,2,false,false],"post_proc":["&",127]}}} {"brand":"SwitchBot","model":"Contact Sensor","model_id":"W120150X","tag":"0406","condition":["uuid","index",0,"0d00","|","uuid","index",0,"fd3d","&","servicedata","=",18,"index",0,"64"],"properties":{"contact":{"condition":["servicedata",7,"bit",2,0],"decoder":["bit_static_value","servicedata",7,1,"closed","open"]},"_contact":{"condition":["servicedata",7,"bit",2,1],"decoder":["static_value","timeout not closed"]},"motion":{"decoder":["bit_static_value","servicedata",2,2,false,true]},"lightlevel":{"decoder":["bit_static_value","servicedata",7,0,"dark","bright"]},"scopetested":{"decoder":["bit_static_value","servicedata",2,3,false,true]},"in_ct":{"decoder":["value_from_hex_data","servicedata",16,1,false,false],"post_proc":[">",2]},"out_ct":{"decoder":["value_from_hex_data","servicedata",16,1,false,false],"post_proc":["&",3]},"push_ct":{"decoder":["value_from_hex_data","servicedata",17,1,false,false]},"batt":{"decoder":["value_from_hex_data","servicedata",4,2,false,false],"post_proc":["&",127]}}} {"brand":"SwitchBot","model":"Meter (Plus)","model_id":"THX1/W230150X","tag":"0102","condition":["servicedata","=",12,"index",0,"54","|","servicedata","=",12,"index",0,"69","&",["uuid","index",0,"0d00","|","uuid","index",0,"fd3d"]],"properties":{".cal":{"decoder":["value_from_hex_data","servicedata",7,1,false,false],"post_proc":["/",10]},"tempc":{"condition":["servicedata",8,"bit",3,0],"decoder":["value_from_hex_data","servicedata",8,2,true,false],"post_proc":["+",".cal","*",-1]},"_tempc":{"condition":["servicedata",8,"bit",3,1],"decoder":["value_from_hex_data","servicedata",8,2,true,false],"post_proc":["+",".cal","-",128]},"hum":{"decoder":["value_from_hex_data","servicedata",10,2,false,false],"post_proc":["&",127]},"batt":{"decoder":["value_from_hex_data","servicedata",4,2,false,false],"post_proc":["&",127]}}} {"brand":"SwitchBot","model":"Motion Sensor","model_id":"W110150X","tag":"0406","condition":["uuid","index",0,"0d00","|","uuid","index",0,"fd3d","&","servicedata","=",12,"index",0,"73"],"properties":{"motion":{"decoder":["bit_static_value","servicedata",2,2,false,true]},"led":{"decoder":["bit_static_value","servicedata",10,1,false,true]},"scopetested":{"decoder":["bit_static_value","servicedata",2,3,false,true]},"sensingdistance":{"condition":["servicedata",11,"bit",3,0,"&","servicedata",11,"bit",2,0],"decoder":["static_value","long"]},"_sensingdistance":{"condition":["servicedata",11,"bit",3,0,"&","servicedata",11,"bit",2,1],"decoder":["static_value","middle"]},"__sensingdistance":{"condition":["servicedata",11,"bit",3,1,"&","servicedata",11,"bit",2,0],"decoder":["static_value","short"]},"lightlevel":{"decoder":["bit_static_value","servicedata",11,1,"dark","bright"]},"batt":{"decoder":["value_from_hex_data","servicedata",4,2,false,false],"post_proc":["&",127]}}} {"brand":"SwitchBot","model":"Bot","model_id":"X1","tag":"0e22","condition":["uuid","index",0,"0d00","|","uuid","index",0,"fd3d","&","servicedata",">=",6,"index",0,"48"],"properties":{"mode":{"decoder":["bit_static_value","servicedata",2,3,"onestate","on/off"]},"state":{"decoder":["bit_static_value","servicedata",2,2,"on","off"]},"batt":{"decoder":["value_from_hex_data","servicedata",4,2,false,false],"post_proc":["&",127]}}} {"brand":"Sensirion","model":"TH Sensor","model_id":"SHT4X","tag":"01","condition":["manufacturerdata",">=",20,"index",0,"d5060006"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",12,4,true,true],"post_proc":["*",175,"/",65535,"-",45]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",16,4,true,false],"post_proc":["*",125,"/",65535,"-",6]}}} {"brand":"Radioland","model":"RDL52832","model_id":"RDL52832","tag":"070a","condition":["manufacturerdata","=",50,"&","name","index",0,"RDL52832"],"properties":{"mfid":{"decoder":["string_from_hex_data","manufacturerdata",0,4]},"uuid":{"decoder":["string_from_hex_data","manufacturerdata",8,32]},"major":{"decoder":["value_from_hex_data","manufacturerdata",40,4,false]},"minor":{"decoder":["value_from_hex_data","manufacturerdata",44,4,false]},"txpower":{"decoder":["value_from_hex_data","manufacturerdata",48,2,false]},"tempc":{"decoder":["value_from_hex_data","servicedata",0,4,false,true],"post_proc":["/",256]},"hum":{"decoder":["value_from_hex_data","servicedata",4,4,false,true],"post_proc":["/",256]},".cal":{"decoder":["value_from_hex_data","servicedata",12,2,false,false],"post_proc":["/",10]},"accx":{"condition":["servicedata",8,"0000"],"decoder":["value_from_hex_data","servicedata",14,2,false,false],"post_proc":["/",100,"+",".cal","*",9.80665]},"_accx":{"condition":["servicedata",8,"0001"],"decoder":["value_from_hex_data","servicedata",14,2,false,false],"post_proc":["/",100,"+",".cal","+",1,"*",9.80665]},"__accx":{"condition":["servicedata",8,"0100"],"decoder":["value_from_hex_data","servicedata",14,2,false,false],"post_proc":["/",100,"+",".cal","*",-1,"*",9.80665]},"___accx":{"condition":["servicedata",8,"0101"],"decoder":["value_from_hex_data","servicedata",14,2,false,false],"post_proc":["/",100,"+",".cal","+",1,"*",-1,"*",9.80665]},"_.cal":{"decoder":["value_from_hex_data","servicedata",20,2,false,false],"post_proc":["/",10]},"accy":{"condition":["servicedata",16,"0000"],"decoder":["value_from_hex_data","servicedata",22,2,false,false],"post_proc":["/",100,"+",".cal","*",9.80665]},"_accy":{"condition":["servicedata",16,"0001"],"decoder":["value_from_hex_data","servicedata",22,2,false,false],"post_proc":["/",100,"+",".cal","+",1,"*",9.80665]},"__accy":{"condition":["servicedata",16,"0100"],"decoder":["value_from_hex_data","servicedata",22,2,false,false],"post_proc":["/",100,"+",".cal","*",-1,"*",9.80665]},"___accy":{"condition":["servicedata",16,"0101"],"decoder":["value_from_hex_data","servicedata",22,2,false,false],"post_proc":["/",100,"+",".cal","+",1,"*",-1,"*",9.80665]},"__.cal":{"decoder":["value_from_hex_data","servicedata",28,2,false,false],"post_proc":["/",10]},"accz":{"condition":["servicedata",24,"0000"],"decoder":["value_from_hex_data","servicedata",30,2,false,false],"post_proc":["/",100,"+",".cal","*",9.80665]},"_accz":{"condition":["servicedata",24,"0001"],"decoder":["value_from_hex_data","servicedata",30,2,false,false],"post_proc":["/",100,"+",".cal","+",1,"*",9.80665]},"__accz":{"condition":["servicedata",24,"0100"],"decoder":["value_from_hex_data","servicedata",30,2,false,false],"post_proc":["/",100,"+",".cal","*",-1,"*",9.80665]},"___accz":{"condition":["servicedata",24,"0101"],"decoder":["value_from_hex_data","servicedata",30,2,false,false],"post_proc":["/",100,"+",".cal","+",1,"*",-1,"*",9.80665]}}} {"brand":"Mokosmart","model":"Beacon","model_id":"Mokobeacon","tag":"0708","condition":["uuid","index",0,"ff01"],"properties":{"batt":{"decoder":["value_from_hex_data","servicedata",0,2,false]},"x_axis":{"decoder":["value_from_hex_data","servicedata",14,4,false],"post_proc":["/",10000,"*",9.80665]},"y_axis":{"decoder":["value_from_hex_data","servicedata",18,4,false],"post_proc":["/",10000,"*",9.80665]},"z_axis":{"decoder":["value_from_hex_data","servicedata",22,4,false],"post_proc":["/",10000,"*",9.80665]}}} {"brand":"SensorPush","model":"HT.w","model_id":"SPHT","tag":"0109","condition":["manufacturerdata","=",10,"index",0,"04"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",2,8,true,true],"post_proc":["%",66001,"*",0.0025,"+",-40]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",2,8,true,false],"post_proc":["%",2640106001,"/",66001,"*",0.0025]}}} {"brand":"Victron Energy","model":"Smart Battery Sense","model_id":"VICTSBS","tag":"1408","condition":["manufacturerdata","index",8,"a5a3","|","manufacturerdata","index",8,"a4a3","&","manufacturerdata","=",50,"index",0,"e10211","&","manufacturerdata","index",12,"02ffff"],"properties":{"volt":{"condition":["manufacturerdata",24,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",24,4,true,false],"post_proc":["/",100]},"tempc":{"condition":["manufacturerdata",37,"bit",0,0,"&","manufacturerdata",37,"bit",1,1],"decoder":["value_from_hex_data","manufacturerdata",32,4,true,false],"post_proc":["-",27315,"/",100]},"alarm_reason":{"decoder":["value_from_hex_data","manufacturerdata",28,4]}}} {"brand":"Victron Energy","model":"Smart BatteryProtect","model_id":"VICTSBP","tag":"1408","condition":["manufacturerdata","=",50,"index",0,"e10211","&","manufacturerdata","index",12,"09ffff"],"properties":{"device_state":{"decoder":["string_from_hex_data","manufacturerdata",20,2],"lookup":["00","off","01","low power","02","fault","03","bulk","04","absorption","05","float","06","storage","07","equalize manual","09","inverting","0b","power_supply","f5","starting up","f6","repeated absorption","f7","recondition","f8","battery safe","f9","active","fc","external control","ff","N/A"]},"output_state":{"decoder":["string_from_hex_data","manufacturerdata",22,2],"lookup":["00","off","01","on","ff","N/A"]},"volt_in":{"condition":["manufacturerdata",34,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",34,4,true,true],"post_proc":["&",32767,"/",100]},"volt_out":{"condition":["manufacturerdata",38,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",38,4,true,false],"post_proc":["/",100]},"error_code":{"condition":["manufacturerdata",24,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",24,2]},"alarm_reason":{"decoder":["value_from_hex_data","manufacturerdata",26,4]},"warning_reason":{"decoder":["value_from_hex_data","manufacturerdata",30,4]}}} {"brand":"GENERIC","model":"TPMS","model_id":"TPMS","tag":"0a01","condition":["manufacturerdata","=",36,"index",0,"000","&","manufacturerdata","mac@index",4],"conditionnomac":["manufacturerdata","=",36,"&","name","index",0,"TPMS"],"properties":{"count":{"decoder":["value_from_hex_data","manufacturerdata",5,1,false],"post_proc":["+",1]},"pres":{"decoder":["value_from_hex_data","manufacturerdata",16,8,true],"post_proc":["/",100000]},"tempc":{"decoder":["value_from_hex_data","manufacturerdata",24,8,true],"post_proc":["/",100]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",32,2,true]},"alarm":{"decoder":["bit_static_value","manufacturerdata",35,0,false,true]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",4]}}} {"brand":"SwitchBot","model":"Meter (Plus)","model_id":"THX1/W230150X","tag":"0100","condition":["name","index",0,"WoSensorTH","&","manufacturerdata","=",26],"properties":{".cal":{"decoder":["value_from_hex_data","manufacturerdata",21,1,false,false],"post_proc":["/",10]},"tempc":{"condition":["manufacturerdata",22,"bit",3,0],"decoder":["value_from_hex_data","manufacturerdata",22,2,true,false],"post_proc":["+",".cal","*",-1]},"_tempc":{"condition":["manufacturerdata",22,"bit",3,1],"decoder":["value_from_hex_data","manufacturerdata",22,2,true,false],"post_proc":["+",".cal","-",128]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",24,2,false,false],"post_proc":["&",127]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",4]}}} {"brand":"SwitchBot","model":"Outdoor Meter","model_id":"W340001X","tag":"0100","condition":["manufacturerdata","=",28,"&","name","index",0,"WoIOSensorTH"],"properties":{".cal":{"decoder":["value_from_hex_data","manufacturerdata",21,1,false,false],"post_proc":["/",10]},"tempc":{"condition":["manufacturerdata",22,"bit",3,0],"decoder":["value_from_hex_data","manufacturerdata",22,2,true,false],"post_proc":["+",".cal","*",-1]},"_tempc":{"condition":["manufacturerdata",22,"bit",3,1],"decoder":["value_from_hex_data","manufacturerdata",22,2,true,false],"post_proc":["+",".cal","-",128]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",24,2,false,false],"post_proc":["&",127]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",4]}}} {"brand":"SwitchBot","model":"Meter Pro (CO2)","model_id":"W490001X","tag":"0f02","condition":["uuid","index",0,"fd3d","&","servicedata","=",6,"index",0,"35","&","manufacturerdata","=",36,"index",0,"6909"],"properties":{".cal":{"decoder":["value_from_hex_data","manufacturerdata",21,1,false,false],"post_proc":["/",10]},"tempc":{"condition":["manufacturerdata",22,"bit",3,0],"decoder":["value_from_hex_data","manufacturerdata",22,2,true,false],"post_proc":["+",".cal","*",-1]},"_tempc":{"condition":["manufacturerdata",22,"bit",3,1],"decoder":["value_from_hex_data","manufacturerdata",22,2,true,false],"post_proc":["+",".cal","-",128]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",24,2,false,false],"post_proc":["&",127]},"co2":{"decoder":["value_from_hex_data","manufacturerdata",30,4,false,false]},"batt":{"decoder":["value_from_hex_data","servicedata",4,2,false,false],"post_proc":["&",127]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",4]}}} {"brand":"SwitchBot","model":"Blind Tilt","model_id":"W270160X","tag":"0d22","condition":["uuid","index",0,"0d00","|","uuid","index",0,"fd3d","&","servicedata","=",6,"index",0,"78","&","manufacturerdata",">=",24,"index",0,"6909"],"properties":{"open":{"decoder":["value_from_hex_data","manufacturerdata",20,2,false,false],"post_proc":["&",127,"-",50,"*",2,"Â±",100,"abs"]},"direction":{"decoder":["value_from_hex_data","manufacturerdata",20,2,false,false],"post_proc":["&",127,"-",50,"*",2,"SBBT-dir"]},"motion":{"decoder":["bit_static_value","manufacturerdata",20,3,false,true]},"calibrated":{"decoder":["bit_static_value","manufacturerdata",19,0,false,true]},"lightlevel":{"decoder":["value_from_hex_data","manufacturerdata",18,1,false,false]},"batt":{"decoder":["value_from_hex_data","servicedata",4,2,false,false],"post_proc":["&",127]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",4]}}} {"brand":"SwitchBot","model":"Outdoor Meter","model_id":"W340001X","tag":"0102","condition":["servicedata","=",6,"index",0,"77","&","uuid","index",0,"fd3d","&","manufacturerdata","=",28],"properties":{".cal":{"decoder":["value_from_hex_data","manufacturerdata",21,1,false,false],"post_proc":["/",10]},"tempc":{"condition":["manufacturerdata",22,"bit",3,0],"decoder":["value_from_hex_data","manufacturerdata",22,2,true,false],"post_proc":["+",".cal","*",-1]},"_tempc":{"condition":["manufacturerdata",22,"bit",3,1],"decoder":["value_from_hex_data","manufacturerdata",22,2,true,false],"post_proc":["+",".cal","-",128]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",24,2,false,false],"post_proc":["&",127]},"batt":{"decoder":["value_from_hex_data","servicedata",4,2,false,false],"post_proc":["&",127]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",4]}}} {"brand":"Qingping","model":"Contact Sensor","model_id":"CGH1","tag":"0404","condition":["servicedata","=",34,"index",2,"04","|","servicedata","=",28,"index",2,"04","&","uuid","index",0,"fdcd"],"properties":{"open":{"condition":["servicedata","=",28],"decoder":["bit_static_value","servicedata",21,0,true,false]},"_open":{"condition":["servicedata","=",34],"decoder":["bit_static_value","servicedata",33,0,true,false]},"mac":{"decoder":["revmac_from_hex_data","servicedata",4]}}} {"brand":"Qingping","model":"Motion & Light","model_id":"CGPR1","tag":"0404","condition":["servicedata","=",28,"index",2,"12","|","servicedata","=",34,"index",2,"12","|","servicedata","=",40,"index",2,"12","&","uuid","index",0,"fdcd"],"properties":{"lux":{"condition":["servicedata","=",40],"decoder":["value_from_hex_data","servicedata",32,4,true,false]},"_lux":{"condition":["servicedata","=",34],"decoder":["value_from_hex_data","servicedata",22,4,true,false]},"motion":{"condition":["servicedata","=",34],"decoder":["bit_static_value","servicedata",21,0,false,true]},"_motion":{"condition":["servicedata","=",28],"decoder":["bit_static_value","servicedata",21,0,false,true]},"batt":{"condition":["servicedata","=",40],"decoder":["value_from_hex_data","servicedata",20,2,false,false]},"mac":{"decoder":["revmac_from_hex_data","servicedata",4]}}} {"brand":"ClearGrass/Qingping","model":"Round TH","model_id":"CGG1","tag":"01","condition":["servicedata","=",34,"index",2,"07","|","servicedata","=",34,"index",2,"16","&","uuid","index",0,"fdcd"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",20,4,true],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","servicedata",24,4,true],"post_proc":["/",10]},"batt":{"decoder":["value_from_hex_data","servicedata",32,2,false]},"mac":{"decoder":["revmac_from_hex_data","servicedata",4]}}} {"brand":"Qingping","model":"TH Lite","model_id":"CGDK2","tag":"01","condition":["servicedata","=",34,"index",2,"10","&","uuid","index",0,"fdcd"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",20,4,true],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","servicedata",24,4,true,false],"post_proc":["/",10]},"batt":{"decoder":["value_from_hex_data","servicedata",32,2,false]},"mac":{"decoder":["revmac_from_hex_data","servicedata",4]}}} {"brand":"ClearGrass/Qingping","model":"Thermo-Hygrometer CO2 Detector","model_id":"CGP22C","tag":"0f","condition":["servicedata","=",42,"index",2,"5d","&","uuid","index",0,"fdcd"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",20,4,true,true],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","servicedata",24,4,true,false],"post_proc":["/",10]},"co2":{"decoder":["value_from_hex_data","servicedata",38,4,true,false]},"batt":{"decoder":["value_from_hex_data","servicedata",32,2,false,false],"post_proc":["&",127]},"mac":{"decoder":["revmac_from_hex_data","servicedata",4]}}} {"brand":"ClearGrass/Qingping","model":"Barometer Pro","model_id":"CGP23W","tag":"02","condition":["servicedata","=",42,"index",2,"18","&","uuid","index",0,"fdcd"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",20,4,true,true],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","servicedata",24,4,true,false],"post_proc":["/",10]},"pres":{"decoder":["value_from_hex_data","servicedata",38,4,true,false],"post_proc":["/",10]},"batt":{"decoder":["value_from_hex_data","servicedata",32,2,false,false],"post_proc":["&",127]},"mac":{"decoder":["revmac_from_hex_data","servicedata",4]}}} {"brand":"ClearGrass/Qingping","model":"Alarm Clock","model_id":"CGC1/CGD1","tag":"01","condition":["servicedata","=",34,"index",2,"0c","|","servicedata","=",34,"index",2,"1e","&","uuid","index",0,"fdcd"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",20,4,true,true],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","servicedata",24,4,true,false],"post_proc":["/",10]},"batt":{"decoder":["value_from_hex_data","servicedata",32,2,false,false],"post_proc":["&",127]},"mac":{"decoder":["revmac_from_hex_data","servicedata",4]}}} {"brand":"ClearGrass/Qingping","model":"Weather Station","model_id":"CGP1W","tag":"02","condition":["servicedata","=",42,"index",2,"09","&","uuid","index",0,"fdcd"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",20,4,true],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","servicedata",24,4,true,false],"post_proc":["/",10]},"pres":{"decoder":["value_from_hex_data","servicedata",32,4,true,false],"post_proc":["/",10]},"batt":{"decoder":["value_from_hex_data","servicedata",40,2,false,false],"post_proc":["&",127]},"mac":{"decoder":["revmac_from_hex_data","servicedata",4]}}} {"brand":"April Brother","model":"N03","model_id":"ABN03","tag":"0208","condition":["servicedata","=",30,"index",0,"ab03"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",18,4,true,true],"post_proc":["/",8]},"hum":{"decoder":["value_from_hex_data","servicedata",22,4,true,false],"post_proc":["/",2]},"lux":{"decoder":["value_from_hex_data","servicedata",26,4,true,false]},"batt":{"decoder":["value_from_hex_data","servicedata",16,2,false,false]},"mac":{"decoder":["mac_from_hex_data","servicedata",4]}}} {"brand":"Victron Energy","model":"Victron encrypted","model_id":"VICTRON_ENCR","tag":"140003","condition":["manufacturerdata",">=",44,"index",0,"e10210"],"properties":{"cipher":{"condition":["manufacturerdata","=",44],"decoder":["string_from_hex_data","manufacturerdata",20,24]},"_cipher":{"condition":["manufacturerdata","=",46],"decoder":["string_from_hex_data","manufacturerdata",20,26]},"__cipher":{"condition":["manufacturerdata","=",48],"decoder":["string_from_hex_data","manufacturerdata",20,28]},"___cipher":{"condition":["manufacturerdata","=",50],"decoder":["string_from_hex_data","manufacturerdata",20,30]},"ctr":{"decoder":["string_from_hex_data","manufacturerdata",14,4,true]},"mic":{"decoder":["string_from_hex_data","manufacturerdata",18,2]}}} {"brand":"Victron Energy","model":"Orion XS","model_id":"VICTORIONXS","tag":"1408","condition":["manufacturerdata","=",48,"index",0,"e10211","&","manufacturerdata","index",12,"0fffff"],"properties":{"device_state":{"decoder":["string_from_hex_data","manufacturerdata",20,2],"lookup":["00","off","01","low power","02","fault","03","bulk","04","absorption","05","float","06","storage","07","equalize manual","09","inverting","0b","power_supply","f5","starting up","f6","repeated absorption","f7","recondition","f8","battery safe","f9","active","fc","external control","ff","N/A"]},"volt_out":{"condition":["manufacturerdata",24,"!","7fff"],"decoder":["value_from_hex_data","manufacturerdata",24,4,true,true],"post_proc":["/",100]},"current_out":{"condition":["manufacturerdata",28,"!","7fff"],"decoder":["value_from_hex_data","manufacturerdata",28,4,true,true],"post_proc":["/",10]},"volt_in":{"condition":["manufacturerdata",32,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",32,4,true,false],"post_proc":["/",100]},"current_in":{"condition":["manufacturerdata",36,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",36,4,true,false],"post_proc":["/",10]},"error_code":{"condition":["manufacturerdata",22,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",22,2]}}} {"brand":"Victron Energy","model":"Solar Charge Controller","model_id":"VICTSCC","tag":"1408","condition":["manufacturerdata","=",44,"index",0,"e10211","&","manufacturerdata","index",12,"01ffff"],"properties":{"device_state":{"decoder":["value_from_hex_data","manufacturerdata",20,2]},"_device_state":{"decoder":["string_from_hex_data","manufacturerdata",20,2],"lookup":["00","off","01","low power","02","fault","03","bulk","04","absorption","05","float","06","storage","07","equalize manual","09","inverting","0b","power supply","f5","starting up","f6","repeated absorption","f7","recondition","f8","battery safe","f9","active","fc","external control","ff","N/A"]},"volt_batt":{"condition":["manufacturerdata",24,"!","7fff"],"decoder":["value_from_hex_data","manufacturerdata",24,4,true,true],"post_proc":["&",32767,"/",100]},"current_batt":{"condition":["manufacturerdata",28,"!","7fff"],"decoder":["value_from_hex_data","manufacturerdata",28,4,true,true],"post_proc":["&",32767,"/",10]},"yield_today":{"condition":["manufacturerdata",32,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",32,4,true,false],"post_proc":["/",100]},"pv_power":{"condition":["manufacturerdata",36,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",36,4,true,false]},"current_load":{"condition":["manufacturerdata",40,"!","01ff"],"decoder":["value_from_hex_data","manufacturerdata",40,4,true,false],"post_proc":["&",511,"/",10]},"error_code":{"condition":["manufacturerdata",22,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",22,2]}}} {"brand":"Victron Energy","model":"Blue Smart Charger","model_id":"VICTBSC","tag":"1400","condition":["manufacturerdata","=",46,"index",0,"e10211","&","manufacturerdata","index",12,"08ffff"],"properties":{"device_state":{"decoder":["value_from_hex_data","manufacturerdata",20,2]},"_device_state":{"decoder":["string_from_hex_data","manufacturerdata",20,2],"lookup":["00","off","01","low power","02","fault","03","bulk","04","absorption","05","float","06","storage","07","equalize manual","09","inverting","0b","power supply","f5","starting up","f6","repeated absorption","f7","recondition","f8","battery safe","f9","active","fc","external control","ff","N/A"]},"volt_batt_1":{"condition":["manufacturerdata",24,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",24,4,true,false],"post_proc":["&",8191,"/",100]},"current_batt_1":{"condition":["manufacturerdata",26,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",26,4,true,false],"post_proc":[">",5,"&",2047,"/",10]},"volt_batt_2":{"condition":["manufacturerdata",30,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",30,4,true,false],"post_proc":["&",8191,"/",100]},"current_batt_2":{"condition":["manufacturerdata",32,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",32,4,true,false],"post_proc":[">",5,"&",2047,"/",10]},"volt_batt_3":{"condition":["manufacturerdata",36,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",36,4,true,false],"post_proc":["&",8191,"/",100]},"current_batt_3":{"condition":["manufacturerdata",38,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",38,4,true,false],"post_proc":[">",5,"&",2047,"/",10]},"tempc":{"condition":["manufacturerdata",42,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",42,2],"post_proc":["&",127,"-",40]},"current_ac":{"condition":["manufacturerdata",44,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",42,4,false,false],"post_proc":["&",511,"/",10]},"error_code":{"condition":["manufacturerdata",22,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",22,2]}}} {"brand":"Ruuvi","model":"RuuviTag","model_id":"RuuviTag_RAWv2","tag":"0708","condition":["manufacturerdata","=",52,"index",0,"990405"],"properties":{"tempc":{"condition":["manufacturerdata",6,"!","8000"],"decoder":["value_from_hex_data","manufacturerdata",6,4,false,true],"post_proc":["/",200]},"hum":{"condition":["manufacturerdata",10,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",10,4,false,false],"post_proc":["/",400]},"pres":{"condition":["manufacturerdata",14,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",14,4,false,false],"post_proc":["+",50000,"/",100]},"accx":{"condition":["manufacturerdata",18,"!","8000"],"decoder":["value_from_hex_data","manufacturerdata",18,4,false,true],"post_proc":["/",10000,"*",9.80665]},"accy":{"condition":["manufacturerdata",22,"!","8000"],"decoder":["value_from_hex_data","manufacturerdata",22,4,false,true],"post_proc":["/",10000,"*",9.80665]},"accz":{"condition":["manufacturerdata",26,"!","8000"],"decoder":["value_from_hex_data","manufacturerdata",26,4,false,true],"post_proc":["/",10000,"*",9.80665]},"volt":{"condition":["manufacturerdata",30,"!","7ff"],"decoder":["value_from_hex_data","manufacturerdata",30,4,false,false],"post_proc":[">",5,"+",1600,"/",1000]},"tx":{"condition":["manufacturerdata",33,"!","f","&","manufacturerdata",32,"!","1"],"decoder":["value_from_hex_data","manufacturerdata",30,4,false,false],"post_proc":["%",32,"*",2,"-",40]},"mov":{"condition":["manufacturerdata",34,"!","ff"],"decoder":["value_from_hex_data","manufacturerdata",34,2,false,false]},"seq":{"condition":["manufacturerdata",36,"!","ffff"],"decoder":["value_from_hex_data","manufacturerdata",36,4,false,false]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",40]}}} {"brand":"Xiaomi/Amazfit","model":"Mi Band/Smart Watch","model_id":"MB/SW","tag":"0b0a","condition":["manufacturerdata","=",52,"index",0,"5701","&","manufacturerdata","mac@index",40],"conditionnomac":["uuid","contain","fee0"],"properties":{"steps":{"condition":["servicedata","=",8],"decoder":["value_from_hex_data","servicedata",0,4,true,false]},"act_bpm":{"condition":["manufacturerdata",0,"570102","&","manufacturerdata",10,"!","f"],"decoder":["value_from_hex_data","manufacturerdata",10,2,false,false]},"device":{"decoder":["static_value","Xiaomi/Amazfit Tracker"]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",40]}}} {"brand":"rbaron","model":"b-parasite","model_id":"BPv1.0-1.2","tag":"0904","condition":["servicedata",">=",32,"index",0,"1","|","servicedata",">=",32,"index",0,"2","&","uuid","index",0,"181a"],"properties":{"tempc":{"condition":["servicedata",0,"1"],"decoder":["value_from_hex_data","servicedata",8,4,false,true],"post_proc":["/",1000]},"_tempc":{"condition":["servicedata",0,"2"],"decoder":["value_from_hex_data","servicedata",8,4,false,true],"post_proc":["/",100]},"hum":{"decoder":["value_from_hex_data","servicedata",12,4,false,false],"post_proc":["/",655.35]},"moi":{"decoder":["value_from_hex_data","servicedata",16,4,false,false],"post_proc":["/",655.35]},"lux":{"condition":["servicedata",1,"bit",0,1],"decoder":["value_from_hex_data","servicedata",32,4,false,false]},"volt":{"decoder":["value_from_hex_data","servicedata",4,4,false,false],"post_proc":["/",1000]},"mac":{"decoder":["mac_from_hex_data","servicedata",20]}}} {"brand":"VCHON","model":"Thermo-Hygrometer","model_id":"VCH6003","tag":"0101","condition":["manufacturerdata","=",22,"index",0,"0109","&","manufacturerdata","mac@index",10],"conditionnomac":["name","index","0","XL0801","&","manufacturerdata","=",22,"index",0,"0109"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",4,4,false],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",8,2,false]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",10]}}} {"brand":"Xiaomi","model":"RoPot","model_id":"HHCCPOT002","tag":"09","condition":["servicedata","index",2,"205d01"],"properties":{"moi":{"condition":["servicedata",25,"8"],"decoder":["value_from_hex_data","servicedata",30,2,false]},"fer":{"condition":["servicedata",25,"9"],"decoder":["value_from_hex_data","servicedata",30,4,true]},"mac":{"decoder":["revmac_from_hex_data","servicedata",10]}}} {"brand":"Xiaomi/VegTrug","model":"MiFlora","model_id":"HHCCJCY01HHCC","tag":"09","condition":["servicedata","index",4,"9800","|","servicedata","index",4,"bc03","&","uuid","index",0,"fe95","&","servicedata",">=",32],"properties":{"tempc":{"condition":["servicedata",24,"0410"],"decoder":["value_from_hex_data","servicedata",30,4,true],"post_proc":["/",10]},"moi":{"condition":["servicedata",24,"0810"],"decoder":["value_from_hex_data","servicedata",30,2,false]},"lux":{"condition":["servicedata",24,"0710"],"decoder":["value_from_hex_data","servicedata",30,6,true]},"fer":{"condition":["servicedata",24,"0910"],"decoder":["value_from_hex_data","servicedata",30,4,true]},"mac":{"decoder":["revmac_from_hex_data","servicedata",10]}}} {"brand":"Xiaomi","model":"Formaldehyde detector","model_id":"JQJCY01YM","tag":"0f","condition":["servicedata","index",2,"20df02"],"properties":{"for":{"condition":["servicedata",23,"0"],"decoder":["value_from_hex_data","servicedata",28,4,true],"post_proc":["/",100]},"hum":{"condition":["servicedata",23,"6"],"decoder":["value_from_hex_data","servicedata",28,4,true,false],"post_proc":["/",10]},"tempc":{"condition":["servicedata",23,"4"],"decoder":["value_from_hex_data","servicedata",28,4,true,false],"post_proc":["/",10]},"batt":{"condition":["servicedata",23,"a"],"decoder":["value_from_hex_data","servicedata",28,2,false,false]},"mac":{"decoder":["revmac_from_hex_data","servicedata",10]}}} {"brand":"Xiaomi/Mijia","model":"e-ink Clock","model_id":"LYWSD02","tag":"01","condition":["uuid","index",0,"fe95","&","servicedata","index",4,"5b04"],"properties":{"tempc":{"condition":["servicedata",24,"0410"],"decoder":["value_from_hex_data","servicedata",30,4,true],"post_proc":["/",10]},"hum":{"condition":["servicedata",24,"0610"],"decoder":["value_from_hex_data","servicedata",30,4,true,false],"post_proc":["/",10]},"batt":{"condition":["servicedata",24,"0a10"],"decoder":["value_from_hex_data","servicedata",30,2,false,false]},"mac":{"decoder":["revmac_from_hex_data","servicedata",10]}}} {"brand":"ClearGrass/Qingping","model":"Round TH","model_id":"CGG1","tag":"0102","condition":["servicedata","=",30,"|","servicedata","=",32,"|","servicedata","=",36,"&","name","index",0,"Qingping Temp & RH","|","name","index",0,"ClearGrass Temp & RH","&","uuid","index",0,"fe95"],"properties":{"tempc":{"condition":["servicedata",">=",32,"&","servicedata",23,"!","6"],"decoder":["value_from_hex_data","servicedata",28,4,true],"post_proc":["/",10]},"hum":{"condition":["servicedata","=",36,"&","servicedata",23,"!","6"],"decoder":["value_from_hex_data","servicedata",32,4,true],"post_proc":["/",10]},"_hum":{"condition":["servicedata","=",32,"&","servicedata",23,"6"],"decoder":["value_from_hex_data","servicedata",28,4,true],"post_proc":["/",10]},"batt":{"condition":["servicedata","=",30],"decoder":["value_from_hex_data","servicedata",28,2,false]},"mac":{"decoder":["revmac_from_hex_data","servicedata",10]}}} {"brand":"Xiaomi","model":"Mi Jia round","model_id":"LYWSDCGQ","tag":"01","condition":["servicedata","index",2,"20aa01"],"properties":{"batt":{"condition":["servicedata",23,"a"],"decoder":["value_from_hex_data","servicedata",28,2,false,false]},"tempc":{"condition":["servicedata",23,"d","|","servicedata",23,"4"],"decoder":["value_from_hex_data","servicedata",28,4,true],"post_proc":["/",10]},"hum":{"condition":["servicedata",23,"d"],"decoder":["value_from_hex_data","servicedata",32,4,true,false],"post_proc":["/",10]},"_hum":{"condition":["servicedata",23,"6"],"decoder":["value_from_hex_data","servicedata",28,4,true,false],"post_proc":["/",10]},"mac":{"decoder":["revmac_from_hex_data","servicedata",10]}}} {"brand":"Xiaomi","model":"MiLamp","model_id":"MUE4094RT","tag":"0404","condition":["servicedata",">=",18,"index",2,"30dd","&","uuid","index",0,"fe95"],"properties":{"motion":{"condition":["servicedata",0,"40"],"decoder":["static_value",true],"is_bool":1},"darkness":{"condition":["servicedata",0,"40"],"decoder":["value_from_hex_data","servicedata",8,2,true]},"mac":{"condition":["servicedata",0,"30"],"decoder":["revmac_from_hex_data","servicedata",10]}}} {"brand":"Atomax","model":"Skale I/II","model_id":"SKALE","tag":"0501","condition":["manufacturerdata","=",12,"index",0,"ef81"],"properties":{"weight":{"decoder":["value_from_hex_data","manufacturerdata",4,4,true,true],"post_proc":["/",10]}}} {"brand":"GENERIC","model":"iBeacon","model_id":"IBEACON","tag":"06","condition":["manufacturerdata","=",50,"index",0,"4c000215"],"properties":{"mfid":{"decoder":["string_from_hex_data","manufacturerdata",0,4]},"uuid":{"decoder":["string_from_hex_data","manufacturerdata",8,32]},"major":{"decoder":["value_from_hex_data","manufacturerdata",40,4,false]},"minor":{"decoder":["value_from_hex_data","manufacturerdata",44,4,false]},"txpower":{"condition":["manufacturerdata",48,"bit",3,1],"decoder":["value_from_hex_data","manufacturerdata",48,2,false]},"volt":{"condition":["manufacturerdata",48,"bit",3,0],"decoder":["value_from_hex_data","manufacturerdata",48,2,false],"post_proc":["/",10]}}} {"brand":"GENERIC","model":"BR TPMS","model_id":"TPMSBR","tag":"0a03","condition":["manufacturerdata","=",14,"&","name","index",0,"BR"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",4,2,false]},"pres":{"decoder":["value_from_hex_data","manufacturerdata",6,4,false,false],"post_proc":["/",10,"-",14.5,"/",14.5]},"volt":{"decoder":["value_from_hex_data","manufacturerdata",2,2,false],"post_proc":["/",10]}}} {"brand":"Xiaomi","model":"Mi Smart Scale","model_id":"XMTZC01HM/XMTZC04HM","tag":"05","condition":["servicedata","index",0,"22","|","servicedata","index",0,"a2","|","servicedata","index",0,"62","|","servicedata","index",0,"e2","&","servicedata","=",20,"&","uuid","contain","181d"],"properties":{"weighing_mode":{"decoder":["bit_static_value","servicedata",0,2,"person","object"]},"unit":{"decoder":["static_value","kg"]},"weight":{"decoder":["value_from_hex_data","servicedata",2,4,true,false],"post_proc":["/",200]}}} {"brand":"April Brother","model":"N07","model_id":"ABN07","tag":"010a","condition":["servicedata","=",22,"index",0,"40","&","uuid","index",0,"fcd2","&","name","index",0,"asensor_"],"properties":{"packet":{"condition":["servicedata",2,"00"],"decoder":["value_from_hex_data","servicedata",4,2,false,false]},"batt":{"condition":["servicedata",6,"01"],"decoder":["value_from_hex_data","servicedata",8,2,false,false]},"tempc":{"condition":["servicedata",10,"02"],"decoder":["value_from_hex_data","servicedata",12,4,true,true],"post_proc":["/",100]},"hum":{"condition":["servicedata",16,"03"],"decoder":["value_from_hex_data","servicedata",18,4,true,false],"post_proc":["/",100]}}} {"brand":"Xiaomi","model":"Mi Smart Scale","model_id":"XMTZC01HM/XMTZC04HM","tag":"05","condition":["servicedata","index",0,"23","|","servicedata","index",0,"a3","|","servicedata","index",0,"63","|","servicedata","index",0,"e3","&","servicedata","=",20,"&","uuid","contain","181d"],"properties":{"weighing_mode":{"decoder":["bit_static_value","servicedata",0,2,"person","object"]},"unit":{"decoder":["static_value","lb"]},"weight":{"decoder":["value_from_hex_data","servicedata",2,4,true,false],"post_proc":["/",100]}}} {"brand":"Oras","model":"Hydractiva Digital","model_id":"ADHS","tag":"0c01","condition":["manufacturerdata","=",42,"index",0,"eefa"],"properties":{"session":{"decoder":["value_from_hex_data","manufacturerdata",4,6,false,false]},"seconds":{"decoder":["value_from_hex_data","manufacturerdata",10,4,false,false]},"litres":{"decoder":["value_from_hex_data","manufacturerdata",20,6,false,false],"post_proc":["/",2560]},"tempc":{"decoder":["value_from_hex_data","manufacturerdata",26,2,false,false]},"energy":{"decoder":["value_from_hex_data","manufacturerdata",28,4,false,false],"post_proc":["/",100]}}} {"brand":"Onset","model":"Hobo Water Level Sensor","model_id":"HOBOMX2001","tag":"ff","condition":["manufacturerdata","=",44,"index",0,"c500"],"properties":{"lvl_cm":{"decoder":["value_from_hex_data","manufacturerdata",36,8,true,true,true],"post_proc":["*",100]}}} {"brand":"Sensor Easy","model":"SE RHT","model_id":"SE_RHT","tag":"01","condition":["name","index",1," RHT ","&","uuid","index",0,"2a6e","|","uuid","index",0,"2a6f"],"properties":{"tempc":{"condition":["servicedata","=",4],"decoder":["value_from_hex_data","servicedata",0,4,true,true],"post_proc":["/",100]},"hum":{"condition":["servicedata","=",2],"decoder":["value_from_hex_data","servicedata",0,2,true,true]},"volt":{"condition":["manufacturerdata","=",10,"index",4,"f2"],"decoder":["value_from_hex_data","manufacturerdata",6,4,true,false],"post_proc":["/",1000]}}} {"brand":"Sensor Easy","model":"SE MAG","model_id":"SE_MAG","tag":"0404","condition":["servicedata","=",4,"&","uuid","index",0,"2a06","&","name","index",1," MAG"],"properties":{"open":{"decoder":["bit_static_value","servicedata",1,0,true,false]},"volt":{"condition":["manufacturerdata","=",10,"index",4,"f2"],"decoder":["value_from_hex_data","manufacturerdata",6,4,true,false],"post_proc":["/",1000]}}} {"brand":"Sensor Easy","model":"SE TEMP PROBE","model_id":"SE_TPROBE","tag":"01","condition":["servicedata","=",4,"&","uuid","index",0,"2a6e","&","name","index",1," TPROBE"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",0,4,true,true],"post_proc":["/",100]},"volt":{"condition":["manufacturerdata","=",10,"index",4,"f2"],"decoder":["value_from_hex_data","manufacturerdata",6,4,true,false],"post_proc":["/",1000]}}} {"brand":"Sensor Easy","model":"SE TEMP","model_id":"SE_TEMP","tag":"01","condition":["servicedata","=",4,"&","uuid","index",0,"2a6e","&","name","index",1," T "],"properties":{"tempc":{"condition":["servicedata",0,"!","ff7f"],"decoder":["value_from_hex_data","servicedata",0,4,true,true],"post_proc":["/",100]},"volt":{"condition":["manufacturerdata","=",10,"index",4,"f2"],"decoder":["value_from_hex_data","manufacturerdata",6,4,true,false],"post_proc":["/",1000]}}} {"brand":"Tuya","model":"Thermo-Hygrometer","model_id":"THB1/BTH01/TH05F","tag":"0102","condition":["name","index",0,"THB1","|","name","index",0,"BTH01","|","name","index",0,"TH05F","&","servicedata","=",28,"index",0,"40","&","uuid","index",0,"fcd2"],"properties":{"packet":{"condition":["servicedata",2,"00"],"decoder":["value_from_hex_data","servicedata",4,2,false,false]},"tempc":{"condition":["servicedata",10,"02"],"decoder":["value_from_hex_data","servicedata",12,4,true,true],"post_proc":["/",100]},"hum":{"condition":["servicedata",16,"03"],"decoder":["value_from_hex_data","servicedata",18,4,true,false],"post_proc":["/",100]},"batt":{"condition":["servicedata",6,"01"],"decoder":["value_from_hex_data","servicedata",8,2,false,false]},"volt":{"condition":["servicedata",22,"0c"],"decoder":["value_from_hex_data","servicedata",24,4,true,false],"post_proc":["/",1000]}}} {"brand":"rbaron","model":"b-parasite","model_id":"BPv2.0","tag":"0902","condition":["name","contain","prst","uuid","contain","fcd2"],"properties":{"tempc":{"condition":["servicedata",6,"02"],"decoder":["value_from_hex_data","servicedata",8,4,true,true],"post_proc":["/",100]},"hum":{"condition":["servicedata",26,"2e"],"decoder":["value_from_hex_data","servicedata",28,2,false,false]},"moi":{"condition":["servicedata",30,"2f"],"decoder":["value_from_hex_data","servicedata",32,2,false,false]},"lux":{"condition":["servicedata",12,"05"],"decoder":["value_from_hex_data","servicedata",14,6,true,false],"post_proc":["/",100]},"batt":{"condition":["servicedata",2,"01"],"decoder":["value_from_hex_data","servicedata",4,2,true,false]},"volt":{"condition":["servicedata",20,"0c"],"decoder":["value_from_hex_data","servicedata",22,4,true,false],"post_proc":["/",1000]}}} {"brand":"Ruuvi","model":"RuuviTag","model_id":"RuuviTag_RAWv1","tag":"0708","condition":["manufacturerdata","=",32,"index",0,"990403"],"properties":{"hum":{"decoder":["value_from_hex_data","manufacturerdata",6,2,false,false],"post_proc":["/",2]},"tempc":{"decoder":["bf_value_from_hex_data","manufacturerdata",8,4,false,true]},"pres":{"decoder":["value_from_hex_data","manufacturerdata",12,4,false,false],"post_proc":["+",50000,"/",100]},"accx":{"decoder":["value_from_hex_data","manufacturerdata",16,4,false,true],"post_proc":["/",10000,"*",9.80665]},"accy":{"decoder":["value_from_hex_data","manufacturerdata",20,4,false,true],"post_proc":["/",10000,"*",9.80665]},"accz":{"decoder":["value_from_hex_data","manufacturerdata",24,4,false,true],"post_proc":["/",10000,"*",9.80665]},"volt":{"decoder":["value_from_hex_data","manufacturerdata",28,4,false,false],"post_proc":["/",1000]}}} {"brand":"BlueCharm","model":"Beacon 08/04P/021","model_id":"KSensor","tag":"0708","condition":["uuid","index",0,"feaa","&","servicedata","=",26,"index",0,"21010b","|","servicedata","=",26,"index",0,"21000b"],"properties":{".cal":{"decoder":["value_from_hex_data","servicedata",12,2,false,false],"post_proc":["/",256,"*",100,">",0,"/",100]},"tempc":{"decoder":["value_from_hex_data","servicedata",10,2,false,true],"post_proc":["+",".cal"]},"accx":{"decoder":["value_from_hex_data","servicedata",14,4,false,true]},"accy":{"decoder":["value_from_hex_data","servicedata",18,4,false,true]},"accz":{"decoder":["value_from_hex_data","servicedata",22,4,false,true]},"volt":{"decoder":["value_from_hex_data","servicedata",6,4,false,false],"post_proc":["/",1000]}}} {"brand":"KKM","model":"Long Range K6P","model_id":"K6P","tag":"01","condition":["servicedata","=",18,"index",0,"210107","&","uuid","index",0,"feaa"],"properties":{".cal":{"decoder":["value_from_hex_data","servicedata",12,2,false,false],"post_proc":["/",256,"*",100,">",0,"/",100]},"tempc":{"decoder":["value_from_hex_data","servicedata",10,2,false,true],"post_proc":["+",".cal"]},"_.cal":{"decoder":["value_from_hex_data","servicedata",16,2,false,false],"post_proc":["/",256,"*",100,">",0,"/",100]},"hum":{"decoder":["value_from_hex_data","servicedata",14,2,false,false],"post_proc":["+",".cal"]},"volt":{"decoder":["value_from_hex_data","servicedata",6,4,false,false],"post_proc":["/",1000]}}} {"brand":"Mokosmart","model":"BeaconX Pro","model_id":"MBXPRO","tag":"0708","condition":["uuid","index",0,"feab"],"properties":{"volt":{"condition":["servicedata",0,"40"],"decoder":["value_from_hex_data","servicedata",6,4,false],"post_proc":["/",1000]},"x_axis":{"condition":["servicedata",0,"60"],"decoder":["value_from_hex_data","servicedata",12,4,false],"post_proc":["/",10000,"*",9.80665]},"y_axis":{"condition":["servicedata",0,"60"],"decoder":["value_from_hex_data","servicedata",16,4,false],"post_proc":["/",10000,"*",9.80665]},"z_axis":{"condition":["servicedata",0,"60"],"decoder":["value_from_hex_data","servicedata",20,4,false],"post_proc":["/",10000,"*",9.80665]},"_volt":{"condition":["servicedata",0,"60"],"decoder":["value_from_hex_data","servicedata",24,4,false],"post_proc":["/",1000]},"tempc":{"condition":["servicedata",0,"70"],"decoder":["value_from_hex_data","servicedata",6,4,false],"post_proc":["/",10]},"hum":{"condition":["servicedata",0,"70"],"decoder":["value_from_hex_data","servicedata",10,4,false,false],"post_proc":["/",10]},"__volt":{"condition":["servicedata",0,"70"],"decoder":["value_from_hex_data","servicedata",14,4,false],"post_proc":["/",1000]}}} {"brand":"SensorPush","model":"HTP.xw","model_id":"SPHTP","tag":"0209","condition":["manufacturerdata","=",14,"index",0,"00"],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",2,12,true,true],"post_proc":["%",72001,"*",0.0025,"+",-40]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",2,12,true,false],"post_proc":["%",2880112001,"/",72001,"*",0.0025]},"pres":{"decoder":["value_from_hex_data","manufacturerdata",2,12,true,false],"post_proc":["%",273613520207001,"/",2880112001,"+",30000.0,"/",100.0]}}} {"brand":"Inkbird","model":"Pool Thermometer","model_id":"IBS-P02B","tag":"0103","condition":["name","index",0,"IBS-P02B","&","manufacturerdata","=",36],"properties":{"tempc":{"decoder":["value_from_hex_data","manufacturerdata",12,2,true,false],"post_proc":["/",10]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",20,2]},"lowbatt":{"decoder":["bit_static_value","manufacturerdata",26,0,false,true]},"displayunit":{"decoder":["bit_static_value","manufacturerdata",23,0,"Â°C","Â°F"]},"mac":{"decoder":["mac_from_hex_data","manufacturerdata",0]}}} {"brand":"ClearGrass/Qingping","model":"Round TH","model_id":"CGG1_PVVX","tag":"0102","condition":["servicedata","=",30,"&","uuid","index",0,"181a","&","name","index",0,"CGG"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",12,4,true],"post_proc":["/",100]},"hum":{"decoder":["value_from_hex_data","servicedata",16,4,true],"post_proc":["/",100]},"batt":{"decoder":["value_from_hex_data","servicedata",24,2,false]},"volt":{"decoder":["value_from_hex_data","servicedata",20,4,true],"post_proc":["/",1000]},"mac":{"decoder":["revmac_from_hex_data","servicedata",0]}}} {"brand":"ClearGrass/Qingping","model":"TH Lite","model_id":"CGDK2_PVVX","tag":"0102","condition":["servicedata","=",30,"&","uuid","index",0,"181a","&","name","index",0,"CGD"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",12,4,true],"post_proc":["/",100]},"hum":{"decoder":["value_from_hex_data","servicedata",16,4,true],"post_proc":["/",100]},"batt":{"decoder":["value_from_hex_data","servicedata",24,2,false]},"volt":{"decoder":["value_from_hex_data","servicedata",20,4,true],"post_proc":["/",1000]},"mac":{"decoder":["revmac_from_hex_data","servicedata",0]}}} {"brand":"Xiaomi","model":"TH Sensor","model_id":"LYWSD03MMC/MJWSD05MMC_PVVX","tag":"01","condition":["servicedata","=",30,"index",6,"38c1a4","&","uuid","index",0,"181a"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",12,4,true,true],"post_proc":["/",100]},"hum":{"decoder":["value_from_hex_data","servicedata",16,4,true,false],"post_proc":["/",100]},"batt":{"decoder":["value_from_hex_data","servicedata",24,2,false,false]},"volt":{"decoder":["value_from_hex_data","servicedata",20,4,true,false],"post_proc":["/",1000]},"mac":{"decoder":["revmac_from_hex_data","servicedata",0]}}} {"brand":"April Brother","model":"ABTemp","model_id":"ABTemp","tag":"0608","condition":["manufacturerdata","=",50,"index",0,"4c000215b5b182c7eab14988aa99b5c1517008d9"],"properties":{"mfid":{"decoder":["string_from_hex_data","manufacturerdata",0,4]},"uuid":{"decoder":["string_from_hex_data","manufacturerdata",8,32]},"major":{"decoder":["value_from_hex_data","manufacturerdata",40,4,false]},"batt":{"decoder":["value_from_hex_data","manufacturerdata",44,2,false]},"tempc":{"decoder":["value_from_hex_data","manufacturerdata",46,2,false]},"txpower":{"decoder":["value_from_hex_data","manufacturerdata",48,2,false]},"mac":{"condition":["servicedata","=",22],"decoder":["revmac_from_hex_data","servicedata",0]}}} {"brand":"Xiaomi","model":"TH Sensor","model_id":"LYWSD03MMC/MJWSD05MMC_ATC","tag":"01","condition":["servicedata","=",26,"index",0,"a4c138","&","uuid","index",0,"181a"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",12,4,false,true],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","servicedata",16,2,false,false]},"batt":{"decoder":["value_from_hex_data","servicedata",18,2,false,false]},"volt":{"decoder":["value_from_hex_data","servicedata",20,4,false,false],"post_proc":["/",1000]},"mac":{"decoder":["mac_from_hex_data","servicedata",0]}}} {"brand":"ClearGrass/Qingping","model":"TH Lite","model_id":"CGDK2_ATC1441","tag":"0102","condition":["servicedata","=",26,"&","uuid","index",0,"181a","&","name","index",0,"CGDK"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",12,4,false],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","servicedata",16,2,false]},"batt":{"decoder":["value_from_hex_data","servicedata",18,2,false]},"volt":{"decoder":["value_from_hex_data","servicedata",20,4,false],"post_proc":["/",1000]},"mac":{"decoder":["mac_from_hex_data","servicedata",0]}}} {"brand":"ClearGrass/Qingping","model":"Round TH","model_id":"CGG1_ATC1441","tag":"0102","condition":["servicedata","=",26,"&","uuid","index",0,"181a","&","name","index",0,"CGG"],"properties":{"tempc":{"decoder":["value_from_hex_data","servicedata",12,4,false],"post_proc":["/",10]},"hum":{"decoder":["value_from_hex_data","servicedata",16,2,false]},"batt":{"decoder":["value_from_hex_data","servicedata",18,2,false]},"volt":{"decoder":["value_from_hex_data","servicedata",20,4,false],"post_proc":["/",1000]},"mac":{"decoder":["mac_from_hex_data","servicedata",0]}}} {"brand":"Otodata","model":"Rotarex-compatible Monitor","model_id":"RC1010","tag":"ff","condition":["manufacturerdata","=",42,"index",0,"b103","|","manufacturerdata","=",48,"index",0,"b103"],"properties":{"level":{"condition":["manufacturerdata","=",42],"decoder":["value_from_hex_data","manufacturerdata",22,4,true,false],"post_proc":["/",100]},"status":{"condition":["manufacturerdata","=",42],"decoder":["value_from_hex_data","manufacturerdata",26,4,true,false]},"serial":{"condition":["manufacturerdata","=",48],"decoder":["value_from_hex_data","manufacturerdata",18,8,true,false],"post_proc":["abs"]},"modeltype":{"condition":["manufacturerdata","=",48],"decoder":["value_from_hex_data","manufacturerdata",40,8,true,false],"post_proc":["abs"]}}} {"brand":"Teltonika","model":"FMT100","model_id":"FMT100","tag":"100a","condition":["name","index",0,"FMT100_"],"properties":{"device":{"decoder":["static_value","FMT100 2G vehicle tracker"]}}} {"brand":"nut","model":"Smart Tracker","model_id":"NUT","tag":"100b","condition":["name","index",0,"nut","&","uuid","index",0,"180a"],"properties":{"device":{"decoder":["static_value","nut Tracker"]}}} {"brand":"Tag-It","model":"Smart Tracker","model_id":"TAGIT","tag":"100b","condition":["name","index",0,"Tag-It","&","manufacturerdata","=",26],"properties":{"device":{"decoder":["static_value","Tag-It Tracker"]}}} {"brand":"Bosch","model":"Nyon","model_id":"BOSCHNYON","tag":"100a","condition":["name","index",0,"Nyon","&","manufacturerdata","=",14,"index",0,"a602"],"properties":{"device":{"decoder":["static_value","Bosch Nyon Tracker"]}}} {"brand":"Theengs","model":"iBeacon Tracker","model_id":"TheengsIB02","tag":"1019","condition":["manufacturerdata","=",50,"index",0,"4c000215546865656e67732d69426561636f6e32"],"properties":{"device":{"decoder":["static_value","Theengs iBeacon Tracker"]}}} {"brand":"Theengs","model":"iBeacon Tracker","model_id":"TheengsIB01","tag":"1009","condition":["manufacturerdata","=",50,"index",0,"4c000215546865656e67732d69426561636f6e31"],"properties":{"device":{"decoder":["static_value","Theengs iBeacon Tracker"]}}} {"brand":"HolyIoT","model":"Beacon","model_id":"HOLYIOT","tag":"1009","condition":["manufacturerdata","=",50,"index",0,"4c000215","&","servicedata","=",26,"index",0,"41","&","uuid","index",0,"5242"],"properties":{"batt":{"decoder":["value_from_hex_data","servicedata",2,2]},"device":{"decoder":["static_value","HolyIoT Beacon Tracker"]}}} {"brand":"Gigaset","model":"G-Tag","model_id":"GTAG","tag":"1008","condition":["manufacturerdata","=",24,"index",0,"800102151234"],"properties":{"device":{"decoder":["static_value","Gigaset G-Tag Tracker"]}}} {"brand":"Tile","model":"Smart Tracker","model_id":"TILE","tag":"100b","condition":["name","index",0,"Tile"],"properties":{"device":{"decoder":["static_value","Tile Tracker"]}}} {"brand":"Tile","model":"Smart Tracker","model_id":"TILE","tag":"100b","condition":["uuid","index",0,"feed","|","uuid","index",0,"feec","|","uuid","index",0,"fd84","&","no-mfgdata"],"properties":{"device":{"decoder":["static_value","Tile Tracker"]}}} {"brand":"nut","model":"Smart Tracker","model_id":"NUTALE","tag":"100b","condition":["name","index",0,"nutale","&","servicedata","=",24,"&","uuid","index",0,"0900"],"properties":{"device":{"decoder":["static_value","nutale Tracker"]}}} {"brand":"iTAG","model":"Smart Tracker","model_id":"ITAG","tag":"100b","condition":["name","index",0,"iTAG","&","manufacturerdata",">=",8],"properties":{"device":{"decoder":["static_value","iTAG Tracker"]}}} {"brand":"GENERIC","model":"BM6 Battery Monitor","model_id":"BM6","tag":"0808","condition":["manufacturerdata","=",50,"index",0,"4c0002153ba29cd9a42c894856badaf2606ef777"],"properties":{"batt":{"decoder":["value_from_hex_data","manufacturerdata",42,2,false]},"device":{"decoder":["static_value","BM6 Tracker"]}}} {"brand":"GENERIC","model":"BM2 Battery Monitor","model_id":"BM2","tag":"0808","condition":["manufacturerdata","=",50,"index",0,"4c000215655f83caae16a10a702e31f30d58dd82"],"properties":{"batt":{"decoder":["value_from_hex_data","manufacturerdata",48,2,false]},"device":{"decoder":["static_value","BM2 Tracker"]}}} {"brand":"Mobvoi","model":"TicWatch GTH (Pro)","model_id":"TICWATCHGTH","tag":"100b","condition":["name","index",0,"TicWatch GTH"],"properties":{"device":{"decoder":["static_value","TicWatch GTH (Pro) Tracker"]}}} {"brand":"GENERIC","model":"MS-CDP","model_id":"MS-CDP","tag":"fe","condition":["manufacturerdata","index",0,"060001"],"properties":{"device":{"decoder":["static_value","Microsoft advertising beacon"]}}} {"brand":"Govee","model":"Smart Air Quality Monitor","model_id":"H5106","tag":"0f03","condition":["name","index",0,"GVH5106","&","manufacturerdata",">=",16,"index",0,"0100"],"properties":{"tempc":{"condition":["manufacturerdata",8,"bit",3,0],"decoder":["value_from_hex_data","manufacturerdata",8,8,false,false],"post_proc":["/",1000000,">",0,"/",10]},"_tempc":{"condition":["manufacturerdata",8,"bit",3,1],"decoder":["value_from_hex_data","manufacturerdata",8,8,false,false],"post_proc":["&",2147483647,"/",1000000,">",0,"/",10,"*",-1]},"hum":{"decoder":["value_from_hex_data","manufacturerdata",8,8,false,false],"post_proc":["&",2147483647,"%",1000000,"/",1000,">",0,"/",10]},".cal":{"decoder":["value_from_hex_data","manufacturerdata",8,8,false,false],"post_proc":["&",2147483647,"/",1000,">",0,"*",1000]},"pm25":{"decoder":["value_from_hex_data","manufacturerdata",8,8,false,false],"post_proc":["&",2147483647,"-",".cal"]}}} {"brand":"Oral-B","model":"BT Toothbrush","model_id":"ORALB_BT","tag":"0b","condition":["manufacturerdata",">=",22,"index",0,"dc00"],"properties":{"state":{"decoder":["string_from_hex_data","manufacturerdata",10,2],"lookup":["01","initialising","02","idle","03","running","04","charging","73","sleeping"]},"mode":{"decoder":["string_from_hex_data","manufacturerdata",18,2],"lookup":["00","off","01","daily clean","02","sensitive","03","massage","04","whitening","05","deep clean","06","tongue cleaning","07","turbo"]},"sector":{"decoder":["string_from_hex_data","manufacturerdata",20,2],"lookup":["01",1,"02",2,"03",3,"04",4,"05",5,"06",6,"07",7,"08",8]},"pressure":{"decoder":["value_from_hex_data","manufacturerdata",12,2,false,false]},".cal":{"decoder":["value_from_hex_data","manufacturerdata",16,2,false,false]},"duration":{"decoder":["value_from_hex_data","manufacturerdata",14,2,false,false],"post_proc":["*",60,"+",".cal"]}}} {"brand":"Apple","model":"Apple Continuity","model_id":"APPLE_CONT","tag":"fe","condition":["manufacturerdata",">=",10,"index",0,"4c000","|","manufacturerdata",">=",10,"index",0,"4c001","&","manufacturerdata","<",50],"properties":{"device":{"decoder":["static_value","Apple device"]}}} {"brand":"Apple","model":"Apple Continuity","model_id":"APPLE_CONTAT","tag":"fe","condition":["manufacturerdata",">",50,"index",0,"4c000","|","manufacturerdata",">",50,"index",0,"4c001"],"properties":{"device":{"decoder":["static_value","Apple device"]}}} {"brand":"Apple","model":"Apple iPhone/iPad","model_id":"APPLEDEVICE","tag":"1018","condition":["manufacturerdata",">=",8,"index",0,"4c0010"],"properties":{"device":{"decoder":["static_value","iPhone/iPad"]}}} {"brand":"UNI-T","model":"UT363 BT Anemometer","model_id":"UT363BT","tag":"1301","condition":["manufacturerdata","=",38,"index",22,"4d2f53","&","manufacturerdata","=",38,"index",0,"aabb"],"properties":{"windspeed":{"decoder":["ascii_from_hex_data","manufacturerdata",10,12],"is_double":1}}} {"properties":{"mfid":{"unit":"hex","name":"manufacturer id"},"uuid":{"unit":"hex","name":"service uuid"},"major":{"unit":"hex","name":"major value"},"minor":{"unit":"hex","name":"minor value"},"txpower":{"unit":"dBm","name":"signal_strength"},"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"accx":{"unit":"m/sÂ²","name":"acceleration x"},"accy":{"unit":"m/sÂ²","name":"acceleration y"},"accz":{"unit":"m/sÂ²","name":"acceleration z"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"volt":{"unit":"V","name":"voltage"},"accx":{"unit":"m/sÂ²","name":"acceleration x"},"accy":{"unit":"m/sÂ²","name":"acceleration y"},"accz":{"unit":"m/sÂ²","name":"acceleration z"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"}}} {"properties":{"packet":{"unit":"int","name":"packet id"},"batt":{"unit":"%","name":"battery"},"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"}}} {"properties":{"volt":{"unit":"V","name":"voltage"},"x_axis":{"unit":"m/sÂ²","name":"x_axis"},"y_axis":{"unit":"m/sÂ²","name":"y_axis"},"z_axis":{"unit":"m/sÂ²","name":"z_axis"},"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"batt_low":{"unit":"status","name":"battery"}}} {"properties":{"avg":{"unit":"kW/mÂ³","name":"average"},"avgu":{"unit":"string","name":"average unit"},"sum":{"unit":"kWh/mÂ³","name":"sum"},"sumu":{"unit":"string","name":"sum unit"},"batt":{"unit":"%","name":"battery"},"lowbatt":{"unit":"status","name":"battery"}}} {"properties":{"batt":{"unit":"%","name":"battery"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"moi":{"unit":"%","name":"moisture"},"lux":{"unit":"lx","name":"illuminance"},"fer":{"unit":"ÂµS/cm","name":"fertility"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"extprobe":{"unit":"status","name":"external probe connected"},"hum":{"unit":"%","name":"humidity"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"contact":{"unit":"string","name":"contact"},"motion":{"unit":"status","name":"motion"},"lightlevel":{"unit":"string","name":"light level"},"scopetested":{"unit":"status","name":"scope tested"},"in_ct":{"unit":"int","name":"in count"},"out_ct":{"unit":"int","name":"out count"},"push_ct":{"unit":"int","name":"push count"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"tempc2_dp":{"unit":"Â°C","name":"dew point"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"open":{"unit":"status","name":"door"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"button":{"unit":"int","name":"button press type"},"color":{"unit":"string","name":"color"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"serial":{"unit":"string","name":"serial number"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"accx":{"unit":"m/sÂ²","name":"acceleration x"},"accy":{"unit":"m/sÂ²","name":"acceleration y"},"accz":{"unit":"m/sÂ²","name":"acceleration z"},"flag_reed":{"unit":"status","name":"flag reed switch"},"flag_tilt":{"unit":"status","name":"flag tilting"},"flag_fall":{"unit":"status","name":"flag free fall"},"flag_impact_x":{"unit":"status","name":"flag impact x-axis"},"flag_impact_y":{"unit":"status","name":"flag impact y-axis"},"flag_impact_z":{"unit":"status","name":"flag impact z-axis"},"uptime":{"unit":"s","name":"duration"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"version":{"unit":"string","name":"model version"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"moving":{"unit":"status","name":"moving"},"position":{"unit":"%","name":"position"},"calibrated":{"unit":"status","name":"calibrated"},"lightlevel":{"unit":"int","name":"light level"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"motion":{"unit":"status","name":"motion"},"led":{"unit":"status","name":"LED"},"scopetested":{"unit":"status","name":"scope tested"},"sensingdistance":{"unit":"string","name":"sensing distance"},"lightlevel":{"unit":"string","name":"light level"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"mode":{"unit":"string","name":"mode"},"state":{"unit":"string","name":"state"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"bpm":{"unit":"bpm","name":"heart rate"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"tempc1":{"unit":"Â°C","name":"temperature"},"tempc2":{"unit":"Â°C","name":"temperature"},"tempc3":{"unit":"Â°C","name":"temperature"},"tempc4":{"unit":"Â°C","name":"temperature"},"tempc5":{"unit":"Â°C","name":"temperature"},"tempc6":{"unit":"Â°C","name":"temperature"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"pres":{"unit":"hPa","name":"pressure"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"pres":{"unit":"hPa","name":"pressure"},"co2":{"unit":"ppm","name":"carbon_dioxide"},"batt":{"unit":"%","name":"battery"}}} {"properties":{"session":{"unit":"int","name":"session"},"seconds":{"unit":"s","name":"duration"},"litres":{"unit":"L","name":"water"},"tempc":{"unit":"Â°C","name":"temperature"},"energy":{"unit":"kWh","name":"energy"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"lvl_cm":{"unit":"cm","name":"distance"},"sync":{"unit":"status","name":"sync pressed"},"volt":{"unit":"V","name":"voltage"},"batt":{"unit":"%","name":"battery"},"quality":{"unit":"status","name":"reading quality"},"accx":{"unit":"m/sÂ²","name":"acceleration x"},"accy":{"unit":"m/sÂ²","name":"acceleration y"}}} {"properties":{"weighing_mode":{"unit":"string","name":"weighing_mode"},"unit":{"unit":"string","name":"unit"},"weight":{"unit":"kg","name":"weight"}}} {"properties":{"weight":{"unit":"g","name":"weight"}}} {"properties":{"weighing_mode":{"unit":"string","name":"weighing_mode"},"unit":{"unit":"string","name":"unit"},"weight":{"unit":"lb","name":"weight"}}} {"properties":{"moi":{"unit":"%","name":"moisture"},"fer":{"unit":"ÂµS/cm","name":"fertility"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"batt":{"unit":"%","name":"battery"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"pres":{"unit":"hPa","name":"pressure"},"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"batt":{"unit":"%","name":"battery"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"lux":{"unit":"lx","name":"illuminance"},"motion":{"unit":"status","name":"motion"},"batt":{"unit":"%","name":"battery"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"open":{"unit":"%","name":"open"},"direction":{"unit":"string","name":"direction"},"motion":{"unit":"status","name":"motion"},"calibrated":{"unit":"status","name":"calibrated"},"lightlevel":{"unit":"int","name":"light level"},"batt":{"unit":"%","name":"battery"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"co2":{"unit":"ppm","name":"carbon_dioxide"},"batt":{"unit":"%","name":"battery"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"lux":{"unit":"lx","name":"illuminance"},"batt":{"unit":"%","name":"battery"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"batt":{"unit":"%","name":"battery"},"lowbatt":{"unit":"status","name":"battery"},"displayunit":{"unit":"string","name":"displayUnit"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"open":{"unit":"status","name":"door"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"hum":{"unit":"%","name":"humidity"},"tempc":{"unit":"Â°C","name":"temperature"},"pres":{"unit":"hPa","name":"pressure"},"accx":{"unit":"m/sÂ²","name":"acceleration x"},"accy":{"unit":"m/sÂ²","name":"acceleration y"},"accz":{"unit":"m/sÂ²","name":"acceleration z"},"volt":{"unit":"V","name":"voltage"},"tx":{"unit":"dBm","name":"signal_strength"},"mov":{"unit":"int","name":"movement counter"},"seq":{"unit":"int","name":"measurement sequence number"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"volt":{"unit":"V","name":"voltage"},"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"time":{"unit":"int","name":"time_stamp"},"tempc_max":{"unit":"Â°C","name":"temperature"},"time_max":{"unit":"int","name":"time_stamp"},"tempc_min":{"unit":"Â°C","name":"temperature"},"time_min":{"unit":"int","name":"time_stamp"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"packet":{"unit":"int","name":"packet id"},"batt":{"unit":"%","name":"battery"},"lux":{"unit":"lux","name":"illuminance"},"motion":{"unit":"status","name":"motion"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"packet":{"unit":"int","name":"packet id"},"batt":{"unit":"%","name":"battery"},"lux":{"unit":"lux","name":"illuminance"},"open":{"unit":"status","name":"door"},"rot":{"unit":"0","name":"rotation"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"batt":{"unit":"%","name":"battery"},"tempc":{"unit":"Â°C","name":"temperature"},"pres":{"unit":"bar","name":"pressure"},"count":{"unit":"int","name":"count"},"alarm":{"unit":"status","name":"problem"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"cipher":{"unit":"hex","name":"ciphertext"},"ctr":{"unit":"hex","name":"counter"},"mic":{"unit":"hex","name":"message integrity check"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"mfid":{"unit":"hex","name":"manufacturer id"},"uuid":{"unit":"hex","name":"service uuid"},"major":{"unit":"hex","name":"major value"},"batt":{"unit":"%","name":"battery"},"tempc":{"unit":"Â°C","name":"temperature"},"txpower":{"unit":"dBm","name":"signal_strength"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"beaconmodel":{"unit":"string","name":"beacon model"},"batt":{"unit":"%","name":"battery"},"plugged_in":{"unit":"status","name":"plug"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"lux":{"unit":"lx","name":"illuminance"},"tempc":{"unit":"Â°C","name":"temperature"},"fer":{"unit":"ÂµS/cm","name":"fertility"},"moi":{"unit":"%","name":"moisture"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"packet":{"unit":"int","name":"packet id"},"batt":{"unit":"%","name":"battery"},"hum":{"unit":"%","name":"humidity"},"button":{"unit":"int","name":"button press type"},"tempc":{"unit":"Â°C","name":"temperature"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"tempc2":{"unit":"Â°C","name":"temperature"},"tempc3":{"unit":"Â°C","name":"temperature"},"tempc4":{"unit":"Â°C","name":"temperature"},"tempc5":{"unit":"Â°C","name":"temperature"},"tempc6":{"unit":"Â°C","name":"temperature"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"tempc2":{"unit":"Â°C","name":"temperature"},"tempc3":{"unit":"Â°C","name":"temperature"},"tempc4":{"unit":"Â°C","name":"temperature"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"tempc2":{"unit":"Â°C","name":"temperature"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"packet":{"unit":"int","name":"packet id"},"batt":{"unit":"%","name":"battery"},"button":{"unit":"int","name":"button press type"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"packet":{"unit":"int","name":"packet id"},"batt":{"unit":"%","name":"battery"},"button1":{"unit":"int","name":"button1 press type"},"button2":{"unit":"int","name":"button2 press type"},"button3":{"unit":"int","name":"button3 press type"},"button4":{"unit":"int","name":"button4 press type"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"batt":{"unit":"%","name":"battery"},"volt":{"unit":"V","name":"voltage"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"moi":{"unit":"%","name":"moisture"},"lux":{"unit":"lx","name":"illuminance"},"volt":{"unit":"V","name":"voltage"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"batt":{"unit":"%","name":"battery"},"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"for":{"unit":"mg/mÂ³","name":"formaldehyde"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"motion":{"unit":"status","name":"motion"},"darkness":{"unit":"lx","name":"illuminance"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"steps":{"unit":"int","name":"step-count"},"act_bpm":{"unit":"bpm","name":"activity heart rate"},"device":{"unit":"string","name":"tracker device"},"mac":{"unit":"string","name":"MAC address"}}} {"properties":{"batt":{"unit":"%","name":"battery"},"x_axis":{"unit":"m/sÂ²","name":"x_axis"},"y_axis":{"unit":"m/sÂ²","name":"y_axis"},"z_axis":{"unit":"m/sÂ²","name":"z_axis"}}} {"properties":{"volt":{"unit":"V","name":"voltage"},"tempc":{"unit":"Â°C","name":"temperature"},"alarm_reason":{"unit":"int","name":"alarm reason"}}} {"properties":{"device_state":{"unit":"string","name":"device state"},"output_state":{"unit":"string","name":"output state"},"volt_in":{"unit":"V","name":"voltage"},"volt_out":{"unit":"V","name":"voltage"},"error_code":{"unit":"int","name":"error code"},"alarm_reason":{"unit":"int","name":"alarm reason"},"warning_reason":{"unit":"int","name":"warning reason"}}} {"properties":{"state":{"unit":"string","name":"state"},"mode":{"unit":"string","name":"mode"},"sector":{"unit":"int","name":"sector"},"pressure":{"unit":"int","name":"Pressure"},"duration":{"unit":"s","name":"duration"}}} {"properties":{"packet_1":{"unit":"int","name":"packet id"},"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"batt":{"unit":"%","name":"battery"},"packet_2":{"unit":"int","name":"packet id"},"volt":{"unit":"V","name":"voltage"},"power":{"unit":"int","name":"power"},"open":{"unit":"int","name":"open"}}} {"properties":{"unlocked":{"unit":"status","name":"lock"}}} {"properties":{"cipher":{"unit":"hex","name":"ciphertext"},"ctr":{"unit":"hex","name":"counter"},"mic":{"unit":"hex","name":"message integrity check"}}} {"properties":{"color":{"unit":"string","name":"color"},"tempf":{"unit":"Â°C","name":"temperature"},"gravity":{"unit":"SG","name":"specific_gravity"},"txpower":{"unit":"dBm","name":"signal_strength"}}} {"properties":{"version":{"unit":"string","name":"model version"},"color":{"unit":"string","name":"color"},"batt_r":{"unit":"%","name":"battery"},"batt_l":{"unit":"%","name":"battery"},"batt_case":{"unit":"%","name":"battery"},"charging_r":{"unit":"status","name":"battery_charging"},"charging_l":{"unit":"status","name":"battery_charging"},"charging_case":{"unit":"status","name":"battery_charging"}}} {"properties":{"bpm":{"unit":"bpm","name":"heart rate"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"pres":{"unit":"hPa","name":"pressure"}}} {"properties":{"level":{"unit":"%","name":"level"},"status":{"unit":"int","name":"status"},"serial":{"unit":"int","name":"serial"},"modeltype":{"unit":"int","name":"model type"}}} {"properties":{"device":{"unit":"string","name":"device type"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"shake":{"unit":"int","name":"shake"},"volt":{"unit":"V","name":"voltage"},"wake":{"unit":"status","name":"wake"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"accx":{"unit":"m/sÂ²","name":"acceleration x"},"accy":{"unit":"m/sÂ²","name":"acceleration y"},"accz":{"unit":"m/sÂ²","name":"acceleration z"},"volt":{"unit":"V","name":"voltage"}}} {"properties":{"hum":{"unit":"%","name":"humidity"},"tempc":{"unit":"Â°C","name":"temperature"},"pres":{"unit":"hPa","name":"pressure"},"accx":{"unit":"m/sÂ²","name":"acceleration x"},"accy":{"unit":"m/sÂ²","name":"acceleration y"},"accz":{"unit":"m/sÂ²","name":"acceleration z"},"volt":{"unit":"V","name":"voltage"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"volt":{"unit":"V","name":"voltage"}}} {"properties":{"packet":{"unit":"int","name":"packet id"},"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"batt":{"unit":"%","name":"battery"},"volt":{"unit":"V","name":"voltage"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"moi":{"unit":"%","name":"moisture"},"lux":{"unit":"lx","name":"illuminance"},"batt":{"unit":"%","name":"battery"},"volt":{"unit":"V","name":"voltage"}}} {"properties":{"open":{"unit":"status","name":"door"},"volt":{"unit":"V","name":"voltage"}}} {"properties":{"mfid":{"unit":"hex","name":"manufacturer id"},"uuid":{"unit":"hex","name":"service uuid"},"major":{"unit":"hex","name":"major value"},"minor":{"unit":"hex","name":"minor value"},"txpower":{"unit":"dBm","name":"signal_strength"},"volt":{"unit":"V","name":"voltage"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"volt":{"unit":"V","name":"voltage"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"pres":{"unit":"bar","name":"pressure"},"volt":{"unit":"V","name":"voltage"}}} {"properties":{"device_state":{"unit":"string","name":"device state"},"volt_out":{"unit":"V","name":"voltage"},"current_out":{"unit":"A","name":"current"},"volt_in":{"unit":"V","name":"voltage"},"current_in":{"unit":"A","name":"current"},"error_code":{"unit":"int","name":"error code"}}} {"properties":{"device_state":{"unit":"string","name":"device state"},"volt_batt":{"unit":"V","name":"voltage"},"current_batt":{"unit":"A","name":"current"},"yield_today":{"unit":"kWh","name":"energy"},"pv_power":{"unit":"W","name":"power"},"current_load":{"unit":"A","name":"current"},"error_code":{"unit":"int","name":"error code"}}} {"properties":{"device_state":{"unit":"string","name":"device state"},"volt_batt_1":{"unit":"V","name":"voltage"},"current_batt_1":{"unit":"A","name":"current"},"volt_batt_2":{"unit":"V","name":"voltage"},"current_batt_2":{"unit":"A","name":"current"},"volt_batt_3":{"unit":"V","name":"voltage"},"current_batt_3":{"unit":"A","name":"current"},"tempc":{"unit":"Â°C","name":"temperature"},"current_ac":{"unit":"A","name":"current"},"error_code":{"unit":"int","name":"error code"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"co2":{"unit":"ppm","name":"carbon_dioxide"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"pm25":{"unit":"Î¼g/mÂ³","name":"pm25"},"pm10":{"unit":"Î¼g/mÂ³","name":"pm10"},"co2":{"unit":"ppm","name":"carbon_dioxide"}}} {"properties":{"lvl_cm":{"unit":"cm","name":"distance"}}} {"properties":{"weighing_mode":{"unit":"string","name":"weighing_mode"},"unit":{"unit":"string","name":"unit"},"weight":{"unit":"kg","name":"weight"},"impedance":{"unit":"Î©","name":"impedance"}}} {"properties":{"weighing_mode":{"unit":"string","name":"weighing_mode"},"unit":{"unit":"string","name":"unit"},"weight":{"unit":"lb","name":"weight"},"impedance":{"unit":"Î©","name":"impedance"}}} {"properties":{"device":{"unit":"string","name":"device"}}} {"properties":{"device":{"unit":"string","name":"tracker device"}}} {"properties":{"batt":{"unit":"%","name":"battery"},"device":{"unit":"string","name":"tracker device"}}} {"properties":{"windspeed":{"unit":"m/s","name":"wind_speed"}}} {"properties":{"rpi":{"unit":"hex","name":"rolling proximity identifier"},"aem":{"unit":"hex","name":"associated encrypted metadata"}}} {"properties":{"tempc":{"unit":"Â°C","name":"temperature"},"hum":{"unit":"%","name":"humidity"},"pm25":{"unit":"Î¼g/mÂ³","name":"pm25"}}} infinity revmac@index max -+   0X0x -0X+0X 0X-0x+0x 0x unsigned short cont unsigned int bit float acts properties getProperties abs %s:%d: %s Unknown error SBBT-dir decoder TheengsDecoder encr unsigned char lookup /emsdk/emscripten/system/lib/libcxxabi/src/private_typeinfo.cpp down condition : no conversion min contain _in nan _cm stoul ctrl is_bool null model .cal track unsigned long long unsigned long std::wstring basic_string std::string std::u16string std::u32string tag tempf inf bf true static_value getAttribute false type name is_double : out of range bad_alloc was thrown in -fno-exceptions mode stod brand servicedatauuid void model_id tempc post_proc cidc prmac manufacturerdata no-mfgdata servicedata ascii_from_hex_data string_from_hex_data value_from_hex_data revmac_from_hex_data not_ BODY THBX BATT PLANT WCVR ACTR AIR UNIQ BBQ CTMO AUDIO BTN BCON NAN ACEL TRACK ENRG INF TIRE decodeBLE SCALE WIND RMAC THB catching a class without an object? emscripten::memory_view<short> emscripten::memory_view<unsigned short> emscripten::memory_view<int> emscripten::memory_view<unsigned int> emscripten::memory_view<float> emscripten::memory_view<uint8_t> emscripten::memory_view<int8_t> emscripten::memory_view<uint16_t> emscripten::memory_view<int16_t> emscripten::memory_view<uint64_t> emscripten::memory_view<int64_t> emscripten::memory_view<uint32_t> emscripten::memory_view<int32_t> emscripten::memory_view<char> emscripten::memory_view<unsigned char> emscripten::memory_view<signed char> emscripten::memory_view<long> emscripten::memory_view<unsigned long> emscripten::memory_view<double> >= <= < . (null) invalid_argument was thrown in -fno-exceptions mode with message "%s" length_error was thrown in -fno-exceptions mode with message "%s" out_of_range was thrown in -fno-exceptions mode with message "%s" libc++abi:  //""\\\\bfn\nr\rt	    Àï ðÝ NSt3__212basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEEE  Àï 8Þ NSt3__212basic_stringIDsNS_11char_traitsIDsEENS_9allocatorIDsEEEE   Àï Þ NSt3__212basic_stringIDiNS_11char_traitsIDiEENS_9allocatorIDiEEEE   Àï ÐÞ N10emscripten11memory_viewIcEE  Àï øÞ N10emscripten11memory_viewIaEE  Àï  ß N10emscripten11memory_viewIhEE  Àï Hß N10emscripten11memory_viewIsEE  Àï pß N10emscripten11memory_viewItEE  Àï ß N10emscripten11memory_viewIiEE  Àï Àß N10emscripten11memory_viewIjEE  Àï èß N10emscripten11memory_viewIlEE  Àï à N10emscripten11memory_viewImEE  Àï 8à N10emscripten11memory_viewIxEE  Àï `à N10emscripten11memory_viewIyEE  Àï à N10emscripten11memory_viewIfEE  Àï °à N10emscripten11memory_viewIdEE  Àï Øà 16TheengsDecoderJS  Dð üà     Ðà P16TheengsDecoderJS Dð  á    Ðà PK16TheengsDecoderJS pp v vp    ìà pp  Tá ìà Tá Àï \\á NSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE pppp   $@      Y@     Ã@    ×A    yÃAC à7µ¸FnµO8Mõù?éHwZ20ùÝOu<¿s        ¹?áz?{®Gâ6?-CëyE>:0â²Ò<¼Ø#öI93§¨Õý¥2=§ôDº[%Ï(È\nCo¬d          ð?    ¹?MbP?ü©ñÒò×z>H¯¼¯Ò<VçÖ99heüSÚ2\rÑ1ET%ÂÞ·²þ\n×}        Tá ìà Tá Tá ppppp   ô                 	             \n\n\n  	  	                               \r \r   	   	                                               	                                                  	                                                   	                                              	                                                      	                                                   	         0123456789ABCDEFÑt W½*pRÿÿ>\'\n   d   è  \'    @B   áõ   5   q   kÿÿÿÎûÿÿ¿ÿÿ           N ë§~ uú ¹,ý·z¼ Ì¢ =I×  *_·úXÙýÊ½áÍÜ@x }gaì å\nÔ Ì>Ov¯  D ® ®` úw!ë+ `A ©£nN                                                        *                    \'9H                                  8R`S  Ê        »Ûë+;PSuccess Illegal byte sequence Domain error Result not representable Not a tty Permission denied Operation not permitted No such file or directory No such process File exists Value too large for defined data type No space left on device Out of memory Resource busy Interrupted system call Resource temporarily unavailable Invalid seek Cross-device link Read-only file system Directory not empty Connection reset by peer Operation timed out Connection refused Host is down Host is unreachable Address in use Broken pipe I/O error No such device or address Block device required No such device Not a directory Is a directory Text file busy Exec format error Invalid argument Argument list too long Symbolic link loop Filename too long Too many open files in system No file descriptors available Bad file descriptor No child process Bad address File too large Too many links No locks available Resource deadlock would occur State not recoverable Owner died Operation canceled Function not implemented No message of desired type Identifier removed Device not a stream No data available Device timeout Out of streams resources Link has been severed Protocol error Bad message File descriptor in bad state Not a socket Destination address required Message too large Protocol wrong type for socket Protocol not available Protocol not supported Socket type not supported Not supported Protocol family not supported Address family not supported by protocol Address not available Network is down Network unreachable Connection reset by network Connection aborted No buffer space available Socket is connected Socket not connected Cannot send after socket shutdown Operation already in progress Operation in progress Stale file handle Remote I/O error Quota exceeded No medium found Wrong medium type Multihop attempted Required key not available Key has expired Key has been revoked Key was rejected by service èï í Xð N10__cxxabiv116__shim_type_infoE    èï ¼í í N10__cxxabiv117__class_type_infoE   èï ìí í N10__cxxabiv117__pbase_type_infoE   èï î àí N10__cxxabiv119__pointer_type_infoE èï Lî í N10__cxxabiv120__function_type_infoE    èï î àí N10__cxxabiv129__pointer_to_member_type_infoE       Ìî                èï Øî í N10__cxxabiv123__fundamental_type_infoE ¸î ï v Dn    ¸î ï b   ¸î $ï c   ¸î 0ï h   ¸î <ï a   ¸î Hï s   ¸î Tï t   ¸î `ï i   ¸î lï j   ¸î xï l   ¸î ï m   ¸î ï x   ¸î ï y   ¸î ¨ï f   ¸î ´ï d       °í                             ð                       !   èï ð °í N10__cxxabiv120__si_class_type_infoE        î    "         #   Àï `ð St9type_info  Aðà°	Ë  J  4· ,ë ä >d Z â vf @X }  _$ ÊÑ UÝ ¦ _í þ  aæ Ö£ Äè þ  5ß Ú¡  Ù [ ¯ Zx Õ O ¦ 3E Ð> á: z Ö Ë( ;Ñ L ä7 H ¶  I°  - 7 ©Ò V ¥ @  Z é~ z´ ì ³  >² o ¹ ( ùa Ö\\ .0 ³* ï¾ ív ¯s Nu {À \r$ UO ß ¸y éÄ Õ& ñ¹ Æ i ë º ø- Æ ¤2  W ãÒ Û! ¨Ó ¾ Z» V c í² Ý 3F ðÆ  ê¦ bÖ ¢ Æ¤ Þ ¢ B ñ« 1 ¹¨ ºÌ Ò Ö£ êÙ ©Ï ó  Ã¯ _ p± È& ;Ñ ( ^  *Å ÕÉ m¬ E, aÌ L /È "  ´ Ky ì¨ Ãï ·¤  0 - 3_ ;® ¬4 u $~ ¾ , û ­h 5Ä ðM qÃ á å Ì ä @ R  n c? ¶È ^l ´t  u (m ¹s s ão ãn âx 6r ÿm k ©Ô  t e  ¨I þÅ ß1 D N3 W ®5 ê e \r¸ ÑB É üC  ©w íÔ pv íÔ ( Á 7J ú ÞÁ ÒU ?À è mÔ ãp íÔ ) äÊ Ê è mÔ ÷S «Ã À Ë ÒN  º VÕ Ññ {À óÿ [Ï Éô ëÌ ÍÄ ¤¼ Â ¼ àù Î 8 = ÿË Ø; ÿË E: Ê æh µ ` u­ 9d Òµ ¹k i« dZ u­ gW ª =b u­ 9o ,± e\\ u­ 	 »                                             <ú                            ÿÿÿÿÿÿÿÿ                                                            ô     èú  ý  target_features+bulk-memory+bulk-memory-opt+call-indirect-overlong+\nmultivalue+mutable-globals+nontrapping-fptoint+reference-types+sign-ext');
}

function getBinarySync(file) {
  return file;
}

async function getWasmBinary(binaryFile) {

  // Otherwise, getBinarySync should be able to get it synchronously
  return getBinarySync(binaryFile);
}

async function instantiateArrayBuffer(binaryFile, imports) {
  try {
    var binary = await getWasmBinary(binaryFile);
    var instance = await WebAssembly.instantiate(binary, imports);
    return instance;
  } catch (reason) {
    err(`failed to asynchronously prepare wasm: ${reason}`);

    // Warn on some common problems.
    if (isFileURI(binaryFile)) {
      err(`warning: Loading from a file URI (${binaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
    }
    abort(reason);
  }
}

async function instantiateAsync(binary, binaryFile, imports) {
  return instantiateArrayBuffer(binaryFile, imports);
}

function getWasmImports() {
  // prepare imports
  var imports = {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports,
  };
  return imports;
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
async function createWasm() {
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    wasmExports = instance.exports;

    assignWasmExports(wasmExports);

    updateMemoryViews();

    return wasmExports;
  }

  // Prefer streaming instantiation if available.
  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
    trueModule = null;
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above PTHREADS-enabled path.
    return receiveInstance(result['instance']);
  }

  var info = getWasmImports();

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module['instantiateWasm']) {
    return new Promise((resolve, reject) => {
      try {
        Module['instantiateWasm'](info, (inst, mod) => {
          resolve(receiveInstance(inst, mod));
        });
      } catch(e) {
        err(`Module.instantiateWasm callback failed with error: ${e}`);
        reject(e);
      }
    });
  }

  wasmBinaryFile ??= findWasmBinary();
  var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
  var exports = receiveInstantiationResult(result);
  return exports;
}

// end include: preamble.js

// Begin JS library code


  class ExitStatus {
      name = 'ExitStatus';
      constructor(status) {
        this.message = `Program terminated with exit(${status})`;
        this.status = status;
      }
    }

  /** @type {!Int16Array} */
  var HEAP16;

  /** @type {!Int32Array} */
  var HEAP32;

  /** not-@type {!BigInt64Array} */
  var HEAP64;

  /** @type {!Int8Array} */
  var HEAP8;

  /** @type {!Float32Array} */
  var HEAPF32;

  /** @type {!Float64Array} */
  var HEAPF64;

  /** @type {!Uint16Array} */
  var HEAPU16;

  /** @type {!Uint32Array} */
  var HEAPU32;

  /** not-@type {!BigUint64Array} */
  var HEAPU64;

  /** @type {!Uint8Array} */
  var HEAPU8;

  var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    };
  var onPostRuns = [];
  var addOnPostRun = (cb) => onPostRuns.push(cb);

  var onPreRuns = [];
  var addOnPreRun = (cb) => onPreRuns.push(cb);


  
    /**
   * @param {number} ptr
   * @param {string} type
   */
  function getValue(ptr, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': return HEAP8[ptr];
      case 'i8': return HEAP8[ptr];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP64[((ptr)>>3)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      case '*': return HEAPU32[((ptr)>>2)];
      default: abort(`invalid type for getValue: ${type}`);
    }
  }

  var noExitRuntime = true;

  function ptrToString(ptr) {
      assert(typeof ptr === 'number', `ptrToString expects a number, got ${typeof ptr}`);
      // Convert to 32-bit unsigned value
      ptr >>>= 0;
      return '0x' + ptr.toString(16).padStart(8, '0');
    }

  
    /**
   * @param {number} ptr
   * @param {number} value
   * @param {string} type
   */
  function setValue(ptr, value, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': HEAP8[ptr] = value; break;
      case 'i8': HEAP8[ptr] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': HEAP64[((ptr)>>3)] = BigInt(value); break;
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      case '*': HEAPU32[((ptr)>>2)] = value; break;
      default: abort(`invalid type for setValue: ${type}`);
    }
  }

  var stackRestore = (val) => __emscripten_stack_restore(val);

  var stackSave = () => _emscripten_stack_get_current();

  var warnOnce = (text) => {
      warnOnce.shown ||= {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    };

  

  var __abort_js = () =>
      abort('native code called abort()');

  var AsciiToString = (ptr) => {
      var str = '';
      while (1) {
        var ch = HEAPU8[ptr++];
        if (!ch) return str;
        str += String.fromCharCode(ch);
      }
    };
  
  var awaitingDependencies = {
  };
  
  var registeredTypes = {
  };
  
  var typeDependencies = {
  };
  
  var BindingError =  class BindingError extends Error { constructor(message) { super(message); this.name = 'BindingError'; }};
  var throwBindingError = (message) => { throw new BindingError(message); };
  /** @param {Object=} options */
  function sharedRegisterType(rawType, registeredInstance, options = {}) {
      var name = registeredInstance.name;
      if (!rawType) {
        throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
          return;
        } else {
          throwBindingError(`Cannot register type '${name}' twice`);
        }
      }
  
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
  
      if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach((cb) => cb());
      }
    }
  /** @param {Object=} options */
  function registerType(rawType, registeredInstance, options = {}) {
      return sharedRegisterType(rawType, registeredInstance, options);
    }
  
  var integerReadValueFromPointer = (name, width, signed) => {
      // integers are quite common, so generate very specialized functions
      switch (width) {
        case 1: return signed ?
          (pointer) => HEAP8[pointer] :
          (pointer) => HEAPU8[pointer];
        case 2: return signed ?
          (pointer) => HEAP16[((pointer)>>1)] :
          (pointer) => HEAPU16[((pointer)>>1)]
        case 4: return signed ?
          (pointer) => HEAP32[((pointer)>>2)] :
          (pointer) => HEAPU32[((pointer)>>2)]
        case 8: return signed ?
          (pointer) => HEAP64[((pointer)>>3)] :
          (pointer) => HEAPU64[((pointer)>>3)]
        default:
          throw new TypeError(`invalid integer width (${width}): ${name}`);
      }
    };
  
  var embindRepr = (v) => {
      if (v === null) {
          return 'null';
      }
      var t = typeof v;
      if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
      } else {
          return '' + v;
      }
    };
  
  var assertIntegerRange = (typeName, value, minRange, maxRange) => {
      if (value < minRange || value > maxRange) {
        throw new TypeError(`Passing a number "${embindRepr(value)}" from JS side to C/C++ side to an argument of type "${typeName}", which is outside the valid range [${minRange}, ${maxRange}]!`);
      }
    };
  /** @suppress {globalThis} */
  var __embind_register_bigint = (primitiveType, name, size, minRange, maxRange) => {
      name = AsciiToString(name);
  
      const isUnsignedType = minRange === 0n;
  
      let fromWireType = (value) => value;
      if (isUnsignedType) {
        // uint64 get converted to int64 in ABI, fix them up like we do for 32-bit integers.
        const bitSize = size * 8;
        fromWireType = (value) => {
          return BigInt.asUintN(bitSize, value);
        }
        maxRange = fromWireType(maxRange);
      }
  
      registerType(primitiveType, {
        name,
        fromWireType: fromWireType,
        toWireType: (destructors, value) => {
          if (typeof value == "number") {
            value = BigInt(value);
          }
          else if (typeof value != "bigint") {
            throw new TypeError(`Cannot convert "${embindRepr(value)}" to ${name}`);
          }
          assertIntegerRange(name, value, minRange, maxRange);
          return value;
        },
        readValueFromPointer: integerReadValueFromPointer(name, size, !isUnsignedType),
        destructorFunction: null, // This type does not need a destructor
      });
    };

  
  /** @suppress {globalThis} */
  var __embind_register_bool = (rawType, name, trueValue, falseValue) => {
      name = AsciiToString(name);
      registerType(rawType, {
        name,
        fromWireType: function(wt) {
          // ambiguous emscripten ABI: sometimes return values are
          // true or false, and sometimes integers (0 or 1)
          return !!wt;
        },
        toWireType: function(destructors, o) {
          return o ? trueValue : falseValue;
        },
        readValueFromPointer: function(pointer) {
          return this.fromWireType(HEAPU8[pointer]);
        },
        destructorFunction: null, // This type does not need a destructor
      });
    };

  
  
  var shallowCopyInternalPointer = (o) => {
      return {
        count: o.count,
        deleteScheduled: o.deleteScheduled,
        preservePointerOnDelete: o.preservePointerOnDelete,
        ptr: o.ptr,
        ptrType: o.ptrType,
        smartPtr: o.smartPtr,
        smartPtrType: o.smartPtrType,
      };
    };
  
  var throwInstanceAlreadyDeleted = (obj) => {
      function getInstanceTypeName(handle) {
        return handle.$$.ptrType.registeredClass.name;
      }
      throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
    };
  
  var finalizationRegistry = false;
  
  var detachFinalizer = (handle) => {};
  
  var runDestructor = ($$) => {
      if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr);
      } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr);
      }
    };
  var releaseClassHandle = ($$) => {
      $$.count.value -= 1;
      var toDelete = 0 === $$.count.value;
      if (toDelete) {
        runDestructor($$);
      }
    };
  
  var downcastPointer = (ptr, ptrClass, desiredClass) => {
      if (ptrClass === desiredClass) {
        return ptr;
      }
      if (undefined === desiredClass.baseClass) {
        return null; // no conversion
      }
  
      var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
      if (rv === null) {
        return null;
      }
      return desiredClass.downcast(rv);
    };
  
  var registeredPointers = {
  };
  
  var registeredInstances = {
  };
  
  var getBasestPointer = (class_, ptr) => {
      if (ptr === undefined) {
          throwBindingError('ptr should not be undefined');
      }
      while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
      }
      return ptr;
    };
  var getInheritedInstance = (class_, ptr) => {
      ptr = getBasestPointer(class_, ptr);
      return registeredInstances[ptr];
    };
  
  var InternalError =  class InternalError extends Error { constructor(message) { super(message); this.name = 'InternalError'; }};
  var throwInternalError = (message) => { throw new InternalError(message); };
  
  var makeClassHandle = (prototype, record) => {
      if (!record.ptrType || !record.ptr) {
        throwInternalError('makeClassHandle requires ptr and ptrType');
      }
      var hasSmartPtrType = !!record.smartPtrType;
      var hasSmartPtr = !!record.smartPtr;
      if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError('Both smartPtrType and smartPtr must be specified');
      }
      record.count = { value: 1 };
      return attachFinalizer(Object.create(prototype, {
        $$: {
          value: record,
          writable: true,
        },
      }));
    };
  /** @suppress {globalThis} */
  function RegisteredPointer_fromWireType(ptr) {
      // ptr is a raw pointer (or a raw smartpointer)
  
      // rawPointer is a maybe-null raw pointer
      var rawPointer = this.getPointee(ptr);
      if (!rawPointer) {
        this.destructor(ptr);
        return null;
      }
  
      var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
      if (undefined !== registeredInstance) {
        // JS object has been neutered, time to repopulate it
        if (0 === registeredInstance.$$.count.value) {
          registeredInstance.$$.ptr = rawPointer;
          registeredInstance.$$.smartPtr = ptr;
          return registeredInstance['clone']();
        } else {
          // else, just increment reference count on existing object
          // it already has a reference to the smart pointer
          var rv = registeredInstance['clone']();
          this.destructor(ptr);
          return rv;
        }
      }
  
      function makeDefaultHandle() {
        if (this.isSmartPointer) {
          return makeClassHandle(this.registeredClass.instancePrototype, {
            ptrType: this.pointeeType,
            ptr: rawPointer,
            smartPtrType: this,
            smartPtr: ptr,
          });
        } else {
          return makeClassHandle(this.registeredClass.instancePrototype, {
            ptrType: this,
            ptr,
          });
        }
      }
  
      var actualType = this.registeredClass.getActualType(rawPointer);
      var registeredPointerRecord = registeredPointers[actualType];
      if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this);
      }
  
      var toType;
      if (this.isConst) {
        toType = registeredPointerRecord.constPointerType;
      } else {
        toType = registeredPointerRecord.pointerType;
      }
      var dp = downcastPointer(
          rawPointer,
          this.registeredClass,
          toType.registeredClass);
      if (dp === null) {
        return makeDefaultHandle.call(this);
      }
      if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
          ptrType: toType,
          ptr: dp,
          smartPtrType: this,
          smartPtr: ptr,
        });
      } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
          ptrType: toType,
          ptr: dp,
        });
      }
    }
  var attachFinalizer = (handle) => {
      if (!globalThis.FinalizationRegistry) {
        attachFinalizer = (handle) => handle;
        return handle;
      }
      // If the running environment has a FinalizationRegistry (see
      // https://github.com/tc39/proposal-weakrefs), then attach finalizers
      // for class handles.  We check for the presence of FinalizationRegistry
      // at run-time, not build-time.
      finalizationRegistry = new FinalizationRegistry((info) => {
        console.warn(info.leakWarning);
        releaseClassHandle(info.$$);
      });
      attachFinalizer = (handle) => {
        var $$ = handle.$$;
        var hasSmartPtr = !!$$.smartPtr;
        if (hasSmartPtr) {
          // We should not call the destructor on raw pointers in case other code expects the pointee to live
          var info = { $$: $$ };
          // Create a warning as an Error instance in advance so that we can store
          // the current stacktrace and point to it when / if a leak is detected.
          // This is more useful than the empty stacktrace of `FinalizationRegistry`
          // callback.
          var cls = $$.ptrType.registeredClass;
          var err = new Error(`Embind found a leaked C++ instance ${cls.name} <${ptrToString($$.ptr)}>.\n` +
          "We'll free it automatically in this case, but this functionality is not reliable across various environments.\n" +
          "Make sure to invoke .delete() manually once you're done with the instance instead.\n" +
          "Originally allocated"); // `.stack` will add "at ..." after this sentence
          if ('captureStackTrace' in Error) {
            Error.captureStackTrace(err, RegisteredPointer_fromWireType);
          }
          info.leakWarning = err.stack.replace(/^Error: /, '');
          finalizationRegistry.register(handle, info, handle);
        }
        return handle;
      };
      detachFinalizer = (handle) => finalizationRegistry.unregister(handle);
      return attachFinalizer(handle);
    };
  
  
  
  
  var deletionQueue = [];
  var flushPendingDeletes = () => {
      while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj['delete']();
      }
    };
  
  var delayFunction;
  var init_ClassHandle = () => {
      let proto = ClassHandle.prototype;
  
      Object.assign(proto, {
        "isAliasOf"(other) {
          if (!(this instanceof ClassHandle)) {
            return false;
          }
          if (!(other instanceof ClassHandle)) {
            return false;
          }
  
          var leftClass = this.$$.ptrType.registeredClass;
          var left = this.$$.ptr;
          other.$$ = /** @type {Object} */ (other.$$);
          var rightClass = other.$$.ptrType.registeredClass;
          var right = other.$$.ptr;
  
          while (leftClass.baseClass) {
            left = leftClass.upcast(left);
            leftClass = leftClass.baseClass;
          }
  
          while (rightClass.baseClass) {
            right = rightClass.upcast(right);
            rightClass = rightClass.baseClass;
          }
  
          return leftClass === rightClass && left === right;
        },
  
        "clone"() {
          if (!this.$$.ptr) {
            throwInstanceAlreadyDeleted(this);
          }
  
          if (this.$$.preservePointerOnDelete) {
            this.$$.count.value += 1;
            return this;
          } else {
            var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), {
              $$: {
                value: shallowCopyInternalPointer(this.$$),
              }
            }));
  
            clone.$$.count.value += 1;
            clone.$$.deleteScheduled = false;
            return clone;
          }
        },
  
        "delete"() {
          if (!this.$$.ptr) {
            throwInstanceAlreadyDeleted(this);
          }
  
          if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
            throwBindingError('Object already scheduled for deletion');
          }
  
          detachFinalizer(this);
          releaseClassHandle(this.$$);
  
          if (!this.$$.preservePointerOnDelete) {
            this.$$.smartPtr = undefined;
            this.$$.ptr = undefined;
          }
        },
  
        "isDeleted"() {
          return !this.$$.ptr;
        },
  
        "deleteLater"() {
          if (!this.$$.ptr) {
            throwInstanceAlreadyDeleted(this);
          }
          if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
            throwBindingError('Object already scheduled for deletion');
          }
          deletionQueue.push(this);
          if (deletionQueue.length === 1 && delayFunction) {
            delayFunction(flushPendingDeletes);
          }
          this.$$.deleteScheduled = true;
          return this;
        },
      });
  
      // Support `using ...` from https://github.com/tc39/proposal-explicit-resource-management.
      const symbolDispose = Symbol.dispose;
      if (symbolDispose) {
        proto[symbolDispose] = proto['delete'];
      }
    };
  /** @constructor */
  function ClassHandle() {
    }
  
  var createNamedFunction = (name, func) => Object.defineProperty(func, 'name', { value: name });
  
  
  var ensureOverloadTable = (proto, methodName, humanName) => {
      if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        // Inject an overload resolver function that routes to the appropriate overload based on the number of arguments.
        proto[methodName] = function(...args) {
          // TODO This check can be removed in -O3 level "unsafe" optimizations.
          if (!proto[methodName].overloadTable.hasOwnProperty(args.length)) {
            throwBindingError(`Function '${humanName}' called with an invalid number of arguments (${args.length}) - expects one of (${proto[methodName].overloadTable})!`);
          }
          return proto[methodName].overloadTable[args.length].apply(this, args);
        };
        // Move the previous function into the overload table.
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
      }
    };
  
  /** @param {number=} numArguments */
  var exposePublicSymbol = (name, value, numArguments) => {
      if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
          throwBindingError(`Cannot register public name '${name}' twice`);
        }
  
        // We are exposing a function with the same name as an existing function. Create an overload table and a function selector
        // that routes between the two.
        ensureOverloadTable(Module, name, name);
        if (Module[name].overloadTable.hasOwnProperty(numArguments)) {
          throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`);
        }
        // Add the new function into the overload table.
        Module[name].overloadTable[numArguments] = value;
      } else {
        Module[name] = value;
        Module[name].argCount = numArguments;
      }
    };
  
  var char_0 = 48;
  
  var char_9 = 57;
  var makeLegalFunctionName = (name) => {
      assert(typeof name === 'string');
      name = name.replace(/[^a-zA-Z0-9_]/g, '$');
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
        return `_${name}`;
      }
      return name;
    };
  
  
  /** @constructor */
  function RegisteredClass(name,
                               constructor,
                               instancePrototype,
                               rawDestructor,
                               baseClass,
                               getActualType,
                               upcast,
                               downcast) {
      this.name = name;
      this.constructor = constructor;
      this.instancePrototype = instancePrototype;
      this.rawDestructor = rawDestructor;
      this.baseClass = baseClass;
      this.getActualType = getActualType;
      this.upcast = upcast;
      this.downcast = downcast;
      this.pureVirtualFunctions = [];
    }
  
  
  var upcastPointer = (ptr, ptrClass, desiredClass) => {
      while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
          throwBindingError(`Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`);
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass;
      }
      return ptr;
    };
  
  /** @suppress {globalThis} */
  function constNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError(`null is not a valid ${this.name}`);
        }
        return 0;
      }
  
      if (!handle.$$) {
        throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
      }
      if (!handle.$$.ptr) {
        throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
  
  
  /** @suppress {globalThis} */
  function genericPointerToWireType(destructors, handle) {
      var ptr;
      if (handle === null) {
        if (this.isReference) {
          throwBindingError(`null is not a valid ${this.name}`);
        }
  
        if (this.isSmartPointer) {
          ptr = this.rawConstructor();
          if (destructors !== null) {
            destructors.push(this.rawDestructor, ptr);
          }
          return ptr;
        } else {
          return 0;
        }
      }
  
      if (!handle || !handle.$$) {
        throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
      }
      if (!handle.$$.ptr) {
        throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
      }
      if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError(`Cannot convert argument of type ${(handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name)} to parameter type ${this.name}`);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
  
      if (this.isSmartPointer) {
        // TODO: this is not strictly true
        // We could support BY_EMVAL conversions from raw pointers to smart pointers
        // because the smart pointer can hold a reference to the handle
        if (undefined === handle.$$.smartPtr) {
          throwBindingError('Passing raw pointer to smart pointer is illegal');
        }
  
        switch (this.sharingPolicy) {
          case 0: // NONE
            // no upcasting
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              throwBindingError(`Cannot convert argument of type ${(handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name)} to parameter type ${this.name}`);
            }
            break;
  
          case 1: // INTRUSIVE
            ptr = handle.$$.smartPtr;
            break;
  
          case 2: // BY_EMVAL
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              var clonedHandle = handle['clone']();
              ptr = this.rawShare(
                ptr,
                Emval.toHandle(() => clonedHandle['delete']())
              );
              if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr);
              }
            }
            break;
  
          default:
            throwBindingError('Unsupported sharing policy');
        }
      }
      return ptr;
    }
  
  
  
  /** @suppress {globalThis} */
  function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError(`null is not a valid ${this.name}`);
        }
        return 0;
      }
  
      if (!handle.$$) {
        throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
      }
      if (!handle.$$.ptr) {
        throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
      }
      if (handle.$$.ptrType.isConst) {
        throwBindingError(`Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
  
  
  /** @suppress {globalThis} */
  function readPointer(pointer) {
      return this.fromWireType(HEAPU32[((pointer)>>2)]);
    }
  
  var init_RegisteredPointer = () => {
      Object.assign(RegisteredPointer.prototype, {
        getPointee(ptr) {
          if (this.rawGetPointee) {
            ptr = this.rawGetPointee(ptr);
          }
          return ptr;
        },
        destructor(ptr) {
          this.rawDestructor?.(ptr);
        },
        readValueFromPointer: readPointer,
        fromWireType: RegisteredPointer_fromWireType,
      });
    };
  /** @constructor
    @param {*=} pointeeType,
    @param {*=} sharingPolicy,
    @param {*=} rawGetPointee,
    @param {*=} rawConstructor,
    @param {*=} rawShare,
    @param {*=} rawDestructor,
     */
  function RegisteredPointer(
      name,
      registeredClass,
      isReference,
      isConst,
  
      // smart pointer properties
      isSmartPointer,
      pointeeType,
      sharingPolicy,
      rawGetPointee,
      rawConstructor,
      rawShare,
      rawDestructor
    ) {
      this.name = name;
      this.registeredClass = registeredClass;
      this.isReference = isReference;
      this.isConst = isConst;
  
      // smart pointer properties
      this.isSmartPointer = isSmartPointer;
      this.pointeeType = pointeeType;
      this.sharingPolicy = sharingPolicy;
      this.rawGetPointee = rawGetPointee;
      this.rawConstructor = rawConstructor;
      this.rawShare = rawShare;
      this.rawDestructor = rawDestructor;
  
      if (!isSmartPointer && registeredClass.baseClass === undefined) {
        if (isConst) {
          this.toWireType = constNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        } else {
          this.toWireType = nonConstNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        }
      } else {
        this.toWireType = genericPointerToWireType;
        // Here we must leave this.destructorFunction undefined, since whether genericPointerToWireType returns
        // a pointer that needs to be freed up is runtime-dependent, and cannot be evaluated at registration time.
        // TODO: Create an alternative mechanism that allows removing the use of var destructors = []; array in
        //       craftInvokerFunction altogether.
      }
    }
  
  /** @param {number=} numArguments */
  var replacePublicSymbol = (name, value, numArguments) => {
      if (!Module.hasOwnProperty(name)) {
        throwInternalError('Replacing nonexistent public symbol');
      }
      // If there's an overload table for this symbol, replace the symbol in the overload table instead.
      if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value;
      } else {
        Module[name] = value;
        Module[name].argCount = numArguments;
      }
    };
  
  
  
  var wasmTableMirror = [];
  
  
  var getWasmTableEntry = (funcPtr) => {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        /** @suppress {checkTypes} */
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      /** @suppress {checkTypes} */
      assert(wasmTable.get(funcPtr) == func, 'table mirror is out of date');
      return func;
    };
  var embind__requireFunction = (signature, rawFunction, isAsync = false) => {
      assert(!isAsync, 'async bindings are only supported with JSPI');
  
      signature = AsciiToString(signature);
  
      function makeDynCaller() {
        var rtn = getWasmTableEntry(rawFunction);
        return rtn;
      }
  
      var fp = makeDynCaller();
      if (typeof fp != 'function') {
          throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
      }
      return fp;
    };
  
  
  
  class UnboundTypeError extends Error {}
  
  
  
  var getTypeName = (type) => {
      var ptr = ___getTypeName(type);
      var rv = AsciiToString(ptr);
      _free(ptr);
      return rv;
    };
  var throwUnboundTypeError = (message, types) => {
      var unboundTypes = [];
      var seen = {};
      function visit(type) {
        if (seen[type]) {
          return;
        }
        if (registeredTypes[type]) {
          return;
        }
        if (typeDependencies[type]) {
          typeDependencies[type].forEach(visit);
          return;
        }
        unboundTypes.push(type);
        seen[type] = true;
      }
      types.forEach(visit);
  
      throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([', ']));
    };
  
  
  
  
  var whenDependentTypesAreResolved = (myTypes, dependentTypes, getTypeConverters) => {
      myTypes.forEach((type) => typeDependencies[type] = dependentTypes);
  
      function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
          throwInternalError('Mismatched type converter count');
        }
        for (var i = 0; i < myTypes.length; ++i) {
          registerType(myTypes[i], myTypeConverters[i]);
        }
      }
  
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      for (let [i, dt] of dependentTypes.entries()) {
        if (registeredTypes.hasOwnProperty(dt)) {
          typeConverters[i] = registeredTypes[dt];
        } else {
          unregisteredTypes.push(dt);
          if (!awaitingDependencies.hasOwnProperty(dt)) {
            awaitingDependencies[dt] = [];
          }
          awaitingDependencies[dt].push(() => {
            typeConverters[i] = registeredTypes[dt];
            ++registered;
            if (registered === unregisteredTypes.length) {
              onComplete(typeConverters);
            }
          });
        }
      }
      if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
      }
    };
  var __embind_register_class = (rawType,
                             rawPointerType,
                             rawConstPointerType,
                             baseClassRawType,
                             getActualTypeSignature,
                             getActualType,
                             upcastSignature,
                             upcast,
                             downcastSignature,
                             downcast,
                             name,
                             destructorSignature,
                             rawDestructor) => {
      name = AsciiToString(name);
      getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
      upcast &&= embind__requireFunction(upcastSignature, upcast);
      downcast &&= embind__requireFunction(downcastSignature, downcast);
      rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
      var legalFunctionName = makeLegalFunctionName(name);
  
      exposePublicSymbol(legalFunctionName, function() {
        // this code cannot run if baseClassRawType is zero
        throwUnboundTypeError(`Cannot construct ${name} due to unbound types`, [baseClassRawType]);
      });
  
      whenDependentTypesAreResolved(
        [rawType, rawPointerType, rawConstPointerType],
        baseClassRawType ? [baseClassRawType] : [],
        (base) => {
          base = base[0];
  
          var baseClass;
          var basePrototype;
          if (baseClassRawType) {
            baseClass = base.registeredClass;
            basePrototype = baseClass.instancePrototype;
          } else {
            basePrototype = ClassHandle.prototype;
          }
  
          var constructor = createNamedFunction(name, function(...args) {
            if (Object.getPrototypeOf(this) !== instancePrototype) {
              throw new BindingError(`Use 'new' to construct ${name}`);
            }
            if (undefined === registeredClass.constructor_body) {
              throw new BindingError(`${name} has no accessible constructor`);
            }
            var body = registeredClass.constructor_body[args.length];
            if (undefined === body) {
              throw new BindingError(`Tried to invoke ctor of ${name} with invalid number of parameters (${args.length}) - expected (${Object.keys(registeredClass.constructor_body).toString()}) parameters instead!`);
            }
            return body.apply(this, args);
          });
  
          var instancePrototype = Object.create(basePrototype, {
            constructor: { value: constructor },
          });
  
          constructor.prototype = instancePrototype;
  
          var registeredClass = new RegisteredClass(name,
                                                    constructor,
                                                    instancePrototype,
                                                    rawDestructor,
                                                    baseClass,
                                                    getActualType,
                                                    upcast,
                                                    downcast);
  
          if (registeredClass.baseClass) {
            // Keep track of class hierarchy. Used to allow sub-classes to inherit class functions.
            registeredClass.baseClass.__derivedClasses ??= [];
  
            registeredClass.baseClass.__derivedClasses.push(registeredClass);
          }
  
          var referenceConverter = new RegisteredPointer(name,
                                                         registeredClass,
                                                         true,
                                                         false,
                                                         false);
  
          var pointerConverter = new RegisteredPointer(name + '*',
                                                       registeredClass,
                                                       false,
                                                       false,
                                                       false);
  
          var constPointerConverter = new RegisteredPointer(name + ' const*',
                                                            registeredClass,
                                                            false,
                                                            true,
                                                            false);
  
          registeredPointers[rawType] = {
            pointerType: pointerConverter,
            constPointerType: constPointerConverter
          };
  
          replacePublicSymbol(legalFunctionName, constructor);
  
          return [referenceConverter, pointerConverter, constPointerConverter];
        }
      );
    };

  var heap32VectorToArray = (count, firstElement) => {
      var array = [];
      for (var i = 0; i < count; i++) {
        // TODO(https://github.com/emscripten-core/emscripten/issues/17310):
        // Find a way to hoist the `>> 2` or `>> 3` out of this loop.
        array.push(HEAPU32[(((firstElement)+(i * 4))>>2)]);
      }
      return array;
    };
  
  
  
  
  var runDestructors = (destructors) => {
      while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
      }
    };
  
  
  function usesDestructorStack(argTypes) {
      // Skip return value at index 0 - it's not deleted here.
      for (var i = 1; i < argTypes.length; ++i) {
        // The type does not define a destructor function - must use dynamic stack
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
          return true;
        }
      }
      return false;
    }
  
  
  function checkArgCount(numArgs, minArgs, maxArgs, humanName, throwBindingError) {
      if (numArgs < minArgs || numArgs > maxArgs) {
        var argCountMessage = minArgs == maxArgs ? minArgs : `${minArgs} to ${maxArgs}`;
        throwBindingError(`function ${humanName} called with ${numArgs} arguments, expected ${argCountMessage}`);
      }
    }
  function createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync) {
      var needsDestructorStack = usesDestructorStack(argTypes);
      var argCount = argTypes.length - 2;
      var argsList = [];
      var argsListWired = ['fn'];
      if (isClassMethodFunc) {
        argsListWired.push('thisWired');
      }
      for (var i = 0; i < argCount; ++i) {
        argsList.push(`arg${i}`)
        argsListWired.push(`arg${i}Wired`)
      }
      argsList = argsList.join(',')
      argsListWired = argsListWired.join(',')
  
      var invokerFnBody = `return function (${argsList}) {\n`;
  
      invokerFnBody += "checkArgCount(arguments.length, minArgs, maxArgs, humanName, throwBindingError);\n";
  
      if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n";
      }
  
      var dtorStack = needsDestructorStack ? "destructors" : "null";
      var args1 = ["humanName", "throwBindingError", "invoker", "fn", "runDestructors", "fromRetWire", "toClassParamWire"];
  
      if (isClassMethodFunc) {
        invokerFnBody += `var thisWired = toClassParamWire(${dtorStack}, this);\n`;
      }
  
      for (var i = 0; i < argCount; ++i) {
        var argName = `toArg${i}Wire`;
        invokerFnBody += `var arg${i}Wired = ${argName}(${dtorStack}, arg${i});\n`;
        args1.push(argName);
      }
  
      invokerFnBody += (returns || isAsync ? "var rv = ":"") + `invoker(${argsListWired});\n`;
  
      var returnVal = returns ? "rv" : "";
  
      if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
      } else {
        for (var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
          var paramName = (i === 1 ? "thisWired" : ("arg"+(i - 2)+"Wired"));
          if (argTypes[i].destructorFunction !== null) {
            invokerFnBody += `${paramName}_dtor(${paramName});\n`;
            args1.push(`${paramName}_dtor`);
          }
        }
      }
  
      if (returns) {
        invokerFnBody += "var ret = fromRetWire(rv);\n" +
                         "return ret;\n";
      } else {
      }
  
      invokerFnBody += "}\n";
  
      args1.push('checkArgCount', 'minArgs', 'maxArgs');
      invokerFnBody = `if (arguments.length !== ${args1.length}){ throw new Error(humanName + "Expected ${args1.length} closure arguments " + arguments.length + " given."); }\n${invokerFnBody}`;
      return new Function(args1, invokerFnBody);
    }
  
  function getRequiredArgCount(argTypes) {
      var requiredArgCount = argTypes.length - 2;
      for (var i = argTypes.length - 1; i >= 2; --i) {
        if (!argTypes[i].optional) {
          break;
        }
        requiredArgCount--;
      }
      return requiredArgCount;
    }
  
  function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, /** boolean= */ isAsync) {
      // humanName: a human-readable string name for the function to be generated.
      // argTypes: An array that contains the embind type objects for all types in the function signature.
      //    argTypes[0] is the type object for the function return value.
      //    argTypes[1] is the type object for function this object/class type, or null if not crafting an invoker for a class method.
      //    argTypes[2...] are the actual function parameters.
      // classType: The embind type object for the class to be bound, or null if this is not a method of a class.
      // cppInvokerFunc: JS Function object to the C++-side function that interops into C++ code.
      // cppTargetFunc: Function pointer (an integer to FUNCTION_TABLE) to the target C++ function the cppInvokerFunc will end up calling.
      // isAsync: Optional. If true, returns an async function. Async bindings are only supported with JSPI.
      var argCount = argTypes.length;
  
      if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
      }
  
      assert(!isAsync, 'async bindings are only supported with JSPI');
      var isClassMethodFunc = (argTypes[1] !== null && classType !== null);
  
      // Free functions with signature "void function()" do not need an invoker that marshalls between wire types.
      // TODO: This omits argument count check - enable only at -O3 or similar.
      //    if (ENABLE_UNSAFE_OPTS && argCount == 2 && argTypes[0].name == "void" && !isClassMethodFunc) {
      //       return FUNCTION_TABLE[fn];
      //    }
  
      // Determine if we need to use a dynamic stack to store the destructors for the function parameters.
      // TODO: Remove this completely once all function invokers are being dynamically generated.
      var needsDestructorStack = usesDestructorStack(argTypes);
  
      var returns = !argTypes[0].isVoid;
  
      var expectedArgCount = argCount - 2;
      var minArgs = getRequiredArgCount(argTypes);
      // Build the arguments that will be passed into the closure around the invoker
      // function.
      var retType = argTypes[0];
      var instType = argTypes[1];
      var closureArgs = [humanName, throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, retType.fromWireType.bind(retType), instType?.toWireType.bind(instType)];
      for (var i = 2; i < argCount; ++i) {
        var argType = argTypes[i];
        closureArgs.push(argType.toWireType.bind(argType));
      }
      if (!needsDestructorStack) {
        // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
        for (var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) {
          if (argTypes[i].destructorFunction !== null) {
            closureArgs.push(argTypes[i].destructorFunction);
          }
        }
      }
      closureArgs.push(checkArgCount, minArgs, expectedArgCount);
  
      let invokerFactory = createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync);
      var invokerFn = invokerFactory(...closureArgs);
      return createNamedFunction(humanName, invokerFn);
    }
  var __embind_register_class_constructor = (
      rawClassType,
      argCount,
      rawArgTypesAddr,
      invokerSignature,
      invoker,
      rawConstructor
    ) => {
      assert(argCount > 0);
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      invoker = embind__requireFunction(invokerSignature, invoker);
      var args = [rawConstructor];
      var destructors = [];
  
      whenDependentTypesAreResolved([], [rawClassType], (classType) => {
        classType = classType[0];
        var humanName = `constructor ${classType.name}`;
  
        if (undefined === classType.registeredClass.constructor_body) {
          classType.registeredClass.constructor_body = [];
        }
        if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
          throw new BindingError(`Cannot register multiple constructors with identical number of parameters (${argCount-1}) for class '${classType.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        }
        classType.registeredClass.constructor_body[argCount - 1] = () => {
          throwUnboundTypeError(`Cannot construct ${classType.name} due to unbound types`, rawArgTypes);
        };
  
        whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
          // Insert empty slot for context type (argTypes[1]).
          argTypes.splice(1, 0, null);
          classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
          return [];
        });
        return [];
      });
    };

  
  
  
  
  
  
  var getFunctionName = (signature) => {
      signature = signature.trim();
      const argsIndex = signature.indexOf("(");
      if (argsIndex === -1) return signature;
      assert(signature.endsWith(")"), "Parentheses for argument names should match.");
      return signature.slice(0, argsIndex);
    };
  var __embind_register_class_function = (rawClassType,
                                      methodName,
                                      argCount,
                                      rawArgTypesAddr, // [ReturnType, ThisType, Args...]
                                      invokerSignature,
                                      rawInvoker,
                                      context,
                                      isPureVirtual,
                                      isAsync,
                                      isNonnullReturn) => {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      methodName = AsciiToString(methodName);
      methodName = getFunctionName(methodName);
      rawInvoker = embind__requireFunction(invokerSignature, rawInvoker, isAsync);
  
      whenDependentTypesAreResolved([], [rawClassType], (classType) => {
        classType = classType[0];
        var humanName = `${classType.name}.${methodName}`;
  
        if (methodName.startsWith("@@")) {
          methodName = Symbol[methodName.substring(2)];
        }
  
        if (isPureVirtual) {
          classType.registeredClass.pureVirtualFunctions.push(methodName);
        }
  
        function unboundTypesHandler() {
          throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`, rawArgTypes);
        }
  
        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (undefined === method || (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2)) {
          // This is the first overload to be registered, OR we are replacing a
          // function in the base class with a function in the derived class.
          unboundTypesHandler.argCount = argCount - 2;
          unboundTypesHandler.className = classType.name;
          proto[methodName] = unboundTypesHandler;
        } else {
          // There was an existing function with the same name registered. Set up
          // a function overload routing table.
          ensureOverloadTable(proto, methodName, humanName);
          proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
        }
  
        whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
          var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context, isAsync);
  
          // Replace the initial unbound-handler-stub function with the
          // appropriate member function, now that all types are resolved. If
          // multiple overloads are registered for this function, the function
          // goes into an overload table.
          if (undefined === proto[methodName].overloadTable) {
            // Set argCount in case an overload is registered later
            memberFunction.argCount = argCount - 2;
            proto[methodName] = memberFunction;
          } else {
            proto[methodName].overloadTable[argCount - 2] = memberFunction;
          }
  
          return [];
        });
        return [];
      });
    };

  
  var emval_freelist = [];
  
  var emval_handles = [0,1,,1,null,1,true,1,false,1];
  var __emval_decref = (handle) => {
      if (handle > 9 && 0 === --emval_handles[handle + 1]) {
        assert(emval_handles[handle] !== undefined, `decref for unallocated handle`);
        var value = emval_handles[handle];
        emval_handles[handle] = undefined;
        emval_freelist.push(handle);
      }
    };
  
  
  
  var Emval = {
  toValue:(handle) => {
        if (!handle) {
            throwBindingError(`Cannot use deleted val. handle = ${handle}`);
        }
        // handle 2 is supposed to be `undefined`.
        assert(handle === 2 || emval_handles[handle] !== undefined && handle % 2 === 0, `invalid handle: ${handle}`);
        return emval_handles[handle];
      },
  toHandle:(value) => {
        switch (value) {
          case undefined: return 2;
          case null: return 4;
          case true: return 6;
          case false: return 8;
          default:{
            const handle = emval_freelist.pop() || emval_handles.length;
            emval_handles[handle] = value;
            emval_handles[handle + 1] = 1;
            return handle;
          }
        }
      },
  };
  
  var EmValType = {
      name: 'emscripten::val',
      fromWireType: (handle) => {
        var rv = Emval.toValue(handle);
        __emval_decref(handle);
        return rv;
      },
      toWireType: (destructors, value) => Emval.toHandle(value),
      readValueFromPointer: readPointer,
      destructorFunction: null, // This type does not need a destructor
  
      // TODO: do we need a deleteObject here?  write a test where
      // emval is passed into JS via an interface
    };
  var __embind_register_emval = (rawType) => registerType(rawType, EmValType);

  var floatReadValueFromPointer = (name, width) => {
      switch (width) {
        case 4: return function(pointer) {
          return this.fromWireType(HEAPF32[((pointer)>>2)]);
        };
        case 8: return function(pointer) {
          return this.fromWireType(HEAPF64[((pointer)>>3)]);
        };
        default:
          throw new TypeError(`invalid float width (${width}): ${name}`);
      }
    };
  
  
  
  var __embind_register_float = (rawType, name, size) => {
      name = AsciiToString(name);
      registerType(rawType, {
        name,
        fromWireType: (value) => value,
        toWireType: (destructors, value) => {
          if (typeof value != "number" && typeof value != "boolean") {
            throw new TypeError(`Cannot convert ${embindRepr(value)} to ${name}`);
          }
          // The VM will perform JS to Wasm value conversion, according to the spec:
          // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
          return value;
        },
        readValueFromPointer: floatReadValueFromPointer(name, size),
        destructorFunction: null, // This type does not need a destructor
      });
    };

  
  
  
  
  /** @suppress {globalThis} */
  var __embind_register_integer = (primitiveType, name, size, minRange, maxRange) => {
      name = AsciiToString(name);
  
      const isUnsignedType = minRange === 0;
  
      let fromWireType = (value) => value;
      if (isUnsignedType) {
        var bitshift = 32 - 8*size;
        fromWireType = (value) => (value << bitshift) >>> bitshift;
        maxRange = fromWireType(maxRange);
      }
  
      registerType(primitiveType, {
        name,
        fromWireType: fromWireType,
        toWireType: (destructors, value) => {
          if (typeof value != "number" && typeof value != "boolean") {
            throw new TypeError(`Cannot convert "${embindRepr(value)}" to ${name}`);
          }
          assertIntegerRange(name, value, minRange, maxRange);
          // The VM will perform JS to Wasm value conversion, according to the spec:
          // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
          return value;
        },
        readValueFromPointer: integerReadValueFromPointer(name, size, minRange !== 0),
        destructorFunction: null, // This type does not need a destructor
      });
    };

  
  var __embind_register_memory_view = (rawType, dataTypeIndex, name) => {
      var typeMapping = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
        BigInt64Array,
        BigUint64Array,
      ];
  
      var TA = typeMapping[dataTypeIndex];
  
      function decodeMemoryView(handle) {
        var size = HEAPU32[((handle)>>2)];
        var data = HEAPU32[(((handle)+(4))>>2)];
        return new TA(HEAP8.buffer, data, size);
      }
  
      name = AsciiToString(name);
      registerType(rawType, {
        name,
        fromWireType: decodeMemoryView,
        readValueFromPointer: decodeMemoryView,
      }, {
        ignoreDuplicateRegistrations: true,
      });
    };

  
  
  
  
  var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      assert(typeof str === 'string', `stringToUTF8Array expects a string (got ${typeof str})`);
      // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
      // undefined and false each don't write out any bytes.
      if (!(maxBytesToWrite > 0))
        return 0;
  
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
      for (var i = 0; i < str.length; ++i) {
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
        // and https://www.ietf.org/rfc/rfc2279.txt
        // and https://tools.ietf.org/html/rfc3629
        var u = str.codePointAt(i);
        if (u <= 0x7F) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 0x7FF) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 0xC0 | (u >> 6);
          heap[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0xFFFF) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 0xE0 | (u >> 12);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          if (u > 0x10FFFF) warnOnce(`Invalid Unicode code point ${ptrToString(u)} encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).`);
          heap[outIdx++] = 0xF0 | (u >> 18);
          heap[outIdx++] = 0x80 | ((u >> 12) & 63);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
          // Gotcha: if codePoint is over 0xFFFF, it is represented as a surrogate pair in UTF-16.
          // We need to manually skip over the second code unit for correct iteration.
          i++;
        }
      }
      // Null-terminate the pointer to the buffer.
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
  var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF8 requires a third parameter that specifies the length of the output buffer');
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    };
  
  var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var c = str.charCodeAt(i); // possibly a lead surrogate
        if (c <= 0x7F) {
          len++;
        } else if (c <= 0x7FF) {
          len += 2;
        } else if (c >= 0xD800 && c <= 0xDFFF) {
          len += 4; ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };
  
  
  
  var UTF8Decoder = globalThis.TextDecoder && new TextDecoder();
  
  var findStringEnd = (heapOrArray, idx, maxBytesToRead, ignoreNul) => {
      var maxIdx = idx + maxBytesToRead;
      if (ignoreNul) return maxIdx;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.
      // As a tiny code save trick, compare idx against maxIdx using a negation,
      // so that maxBytesToRead=undefined/NaN means Infinity.
      while (heapOrArray[idx] && !(idx >= maxIdx)) ++idx;
      return idx;
    };
  
  
    /**
   * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
   * array that contains uint8 values, returns a copy of that string as a
   * Javascript String object.
   * heapOrArray is either a regular array, or a JavaScript typed array view.
   * @param {number=} idx
   * @param {number=} maxBytesToRead
   * @param {boolean=} ignoreNul - If true, the function will not stop on a NUL character.
   * @return {string}
   */
  var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead, ignoreNul) => {
  
      var endPtr = findStringEnd(heapOrArray, idx, maxBytesToRead, ignoreNul);
  
      // When using conditional TextDecoder, skip it for short strings as the overhead of the native call is not worth it.
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = '';
      while (idx < endPtr) {
        // For UTF8 byte structure, see:
        // http://en.wikipedia.org/wiki/UTF-8#Description
        // https://www.ietf.org/rfc/rfc2279.txt
        // https://tools.ietf.org/html/rfc3629
        var u0 = heapOrArray[idx++];
        if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 0xF0) == 0xE0) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          if ((u0 & 0xF8) != 0xF0) warnOnce(`Invalid UTF-8 leading byte ${ptrToString(u0)} encountered when deserializing a UTF-8 string in wasm memory to a JS string!`);
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
        }
  
        if (u0 < 0x10000) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        }
      }
      return str;
    };
  
    /**
   * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
   * emscripten HEAP, returns a copy of that string as a Javascript String object.
   *
   * @param {number} ptr
   * @param {number=} maxBytesToRead - An optional length that specifies the
   *   maximum number of bytes to read. You can omit this parameter to scan the
   *   string until the first 0 byte. If maxBytesToRead is passed, and the string
   *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
   *   string will cut short at that byte index.
   * @param {boolean=} ignoreNul - If true, the function will not stop on a NUL character.
   * @return {string}
   */
  var UTF8ToString = (ptr, maxBytesToRead, ignoreNul) => {
      assert(typeof ptr == 'number', `UTF8ToString expects a number (got ${typeof ptr})`);
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead, ignoreNul) : '';
    };
  var __embind_register_std_string = (rawType, name) => {
      name = AsciiToString(name);
      var stdStringIsUTF8 = true;
  
      registerType(rawType, {
        name,
        // For some method names we use string keys here since they are part of
        // the public/external API and/or used by the runtime-generated code.
        fromWireType(value) {
          var length = HEAPU32[((value)>>2)];
          var payload = value + 4;
  
          var str;
          if (stdStringIsUTF8) {
            str = UTF8ToString(payload, length, true);
          } else {
            str = '';
            for (var i = 0; i < length; ++i) {
              str += String.fromCharCode(HEAPU8[payload + i]);
            }
          }
  
          _free(value);
  
          return str;
        },
        toWireType(destructors, value) {
          if (value instanceof ArrayBuffer) {
            value = new Uint8Array(value);
          }
  
          var length;
          var valueIsOfTypeString = (typeof value == 'string');
  
          // We accept `string` or array views with single byte elements
          if (!(valueIsOfTypeString || (ArrayBuffer.isView(value) && value.BYTES_PER_ELEMENT == 1))) {
            throwBindingError('Cannot pass non-string to std::string');
          }
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            length = lengthBytesUTF8(value);
          } else {
            length = value.length;
          }
  
          // assumes POINTER_SIZE alignment
          var base = _malloc(4 + length + 1);
          var ptr = base + 4;
          HEAPU32[((base)>>2)] = length;
          if (valueIsOfTypeString) {
            if (stdStringIsUTF8) {
              stringToUTF8(value, ptr, length + 1);
            } else {
              for (var i = 0; i < length; ++i) {
                var charCode = value.charCodeAt(i);
                if (charCode > 255) {
                  _free(base);
                  throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                }
                HEAPU8[ptr + i] = charCode;
              }
            }
          } else {
            HEAPU8.set(value, ptr);
          }
  
          if (destructors !== null) {
            destructors.push(_free, base);
          }
          return base;
        },
        readValueFromPointer: readPointer,
        destructorFunction(ptr) {
          _free(ptr);
        },
      });
    };

  
  
  
  var UTF16Decoder = globalThis.TextDecoder ? new TextDecoder('utf-16le') : undefined;;
  
  var UTF16ToString = (ptr, maxBytesToRead, ignoreNul) => {
      assert(ptr % 2 == 0, 'pointer passed to UTF16ToString must be 2-byte aligned');
      var idx = ((ptr)>>1);
      var endIdx = findStringEnd(HEAPU16, idx, maxBytesToRead / 2, ignoreNul);
  
      // When using conditional TextDecoder, skip it for short strings as the overhead of the native call is not worth it.
      if (endIdx - idx > 16 && UTF16Decoder)
        return UTF16Decoder.decode(HEAPU16.subarray(idx, endIdx));
  
      // Fallback: decode without UTF16Decoder
      var str = '';
  
      // If maxBytesToRead is not passed explicitly, it will be undefined, and the
      // for-loop's condition will always evaluate to true. The loop is then
      // terminated on the first null char.
      for (var i = idx; i < endIdx; ++i) {
        var codeUnit = HEAPU16[i];
        // fromCharCode constructs a character from a UTF-16 code unit, so we can
        // pass the UTF16 string right through.
        str += String.fromCharCode(codeUnit);
      }
  
      return str;
    };
  
  var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
      assert(outPtr % 2 == 0, 'pointer passed to stringToUTF16 must be 2-byte aligned');
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF16 requires a third parameter that specifies the length of the output buffer');
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      maxBytesToWrite ??= 0x7FFFFFFF;
      if (maxBytesToWrite < 2) return 0;
      maxBytesToWrite -= 2; // Null terminator.
      var startPtr = outPtr;
      var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
      for (var i = 0; i < numCharsToWrite; ++i) {
        // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        HEAP16[((outPtr)>>1)] = codeUnit;
        outPtr += 2;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP16[((outPtr)>>1)] = 0;
      return outPtr - startPtr;
    };
  
  var lengthBytesUTF16 = (str) => str.length*2;
  
  var UTF32ToString = (ptr, maxBytesToRead, ignoreNul) => {
      assert(ptr % 4 == 0, 'pointer passed to UTF32ToString must be 2-byte aligned');
      var str = '';
      var startIdx = ((ptr)>>2);
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      for (var i = 0; !(i >= maxBytesToRead / 4); i++) {
        var utf32 = HEAPU32[startIdx + i];
        if (!utf32 && !ignoreNul) break;
        str += String.fromCodePoint(utf32);
      }
      return str;
    };
  
  var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
      assert(outPtr % 4 == 0, 'pointer passed to stringToUTF32 must be 4-byte aligned');
      assert(typeof maxBytesToWrite == 'number', 'stringToUTF32 requires a third parameter that specifies the length of the output buffer');
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      maxBytesToWrite ??= 0x7FFFFFFF;
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
        var codePoint = str.codePointAt(i);
        // Gotcha: if codePoint is over 0xFFFF, it is represented as a surrogate pair in UTF-16.
        // We need to manually skip over the second code unit for correct iteration.
        if (codePoint > 0xFFFF) {
          i++;
        }
        HEAP32[((outPtr)>>2)] = codePoint;
        outPtr += 4;
        if (outPtr + 4 > endPtr) break;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP32[((outPtr)>>2)] = 0;
      return outPtr - startPtr;
    };
  
  var lengthBytesUTF32 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var codePoint = str.codePointAt(i);
        // Gotcha: if codePoint is over 0xFFFF, it is represented as a surrogate pair in UTF-16.
        // We need to manually skip over the second code unit for correct iteration.
        if (codePoint > 0xFFFF) {
          i++;
        }
        len += 4;
      }
  
      return len;
    };
  var __embind_register_std_wstring = (rawType, charSize, name) => {
      name = AsciiToString(name);
      var decodeString, encodeString, lengthBytesUTF;
      if (charSize === 2) {
        decodeString = UTF16ToString;
        encodeString = stringToUTF16;
        lengthBytesUTF = lengthBytesUTF16;
      } else {
        assert(charSize === 4, 'only 2-byte and 4-byte strings are currently supported');
        decodeString = UTF32ToString;
        encodeString = stringToUTF32;
        lengthBytesUTF = lengthBytesUTF32;
      }
      registerType(rawType, {
        name,
        fromWireType: (value) => {
          // Code mostly taken from _embind_register_std_string fromWireType
          var length = HEAPU32[((value)>>2)];
          var str = decodeString(value + 4, length * charSize, true);
  
          _free(value);
  
          return str;
        },
        toWireType: (destructors, value) => {
          if (!(typeof value == 'string')) {
            throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
          }
  
          // assumes POINTER_SIZE alignment
          var length = lengthBytesUTF(value);
          var ptr = _malloc(4 + length + charSize);
          HEAPU32[((ptr)>>2)] = length / charSize;
  
          encodeString(value, ptr + 4, length + charSize);
  
          if (destructors !== null) {
            destructors.push(_free, ptr);
          }
          return ptr;
        },
        readValueFromPointer: readPointer,
        destructorFunction(ptr) {
          _free(ptr);
        }
      });
    };

  
  var __embind_register_void = (rawType, name) => {
      name = AsciiToString(name);
      registerType(rawType, {
        isVoid: true, // void return values can be optimized out sometimes
        name,
        fromWireType: () => undefined,
        // TODO: assert if anything else is given?
        toWireType: (destructors, o) => undefined,
      });
    };

  var getHeapMax = () =>
      // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
      // full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
      // for any code that deals with heap sizes, which would require special
      // casing all heap size related code to treat 0 specially.
      2147483648;
  
  var alignMemory = (size, alignment) => {
      assert(alignment, "alignment argument is required");
      return Math.ceil(size / alignment) * alignment;
    };
  
  var growMemory = (size) => {
      var oldHeapSize = wasmMemory.buffer.byteLength;
      var pages = ((size - oldHeapSize + 65535) / 65536) | 0;
      try {
        // round size grow request up to wasm page size (fixed 64KB per spec)
        wasmMemory.grow(pages); // .grow() takes a delta compared to the previous size
        updateMemoryViews();
        return 1 /*success*/;
      } catch(e) {
        err(`growMemory: Attempted to grow heap from ${oldHeapSize} bytes to ${size} bytes, but got error: ${e}`);
      }
      // implicit 0 return to save code size (caller will cast "undefined" into 0
      // anyhow)
    };
  var _emscripten_resize_heap = (requestedSize) => {
      var oldSize = HEAPU8.length;
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      requestedSize >>>= 0;
      // With multithreaded builds, races can happen (another thread might increase the size
      // in between), so return a failure, and let the caller retry.
      assert(requestedSize > oldSize);
  
      // Memory resize rules:
      // 1.  Always increase heap size to at least the requested size, rounded up
      //     to next page multiple.
      // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
      //     geometrically: increase the heap size according to
      //     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
      //     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
      // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
      //     linearly: increase the heap size by at least
      //     MEMORY_GROWTH_LINEAR_STEP bytes.
      // 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
      //     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
      // 4.  If we were unable to allocate as much memory, it may be due to
      //     over-eager decision to excessively reserve due to (3) above.
      //     Hence if an allocation fails, cut down on the amount of excess
      //     growth, in an attempt to succeed to perform a smaller allocation.
  
      // A limit is set for how much we can grow. We should not exceed that
      // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        err(`Cannot enlarge memory, requested ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`);
        return false;
      }
  
      // Loop through potential heap size increases. If we attempt a too eager
      // reservation that fails, cut down on the attempted size and reserve a
      // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown); // ensure geometric growth
        // but limit overreserving (default to capping at +96MB overgrowth at most)
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296 );
  
        var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
  
        var replacement = growMemory(newSize);
        if (replacement) {
  
          return true;
        }
      }
      err(`Failed to grow the heap from ${oldSize} bytes to ${newSize} bytes, not enough memory!`);
      return false;
    };

  var SYSCALLS = {
  varargs:undefined,
  getStr(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
  };
  var _fd_close = (fd) => {
      abort('fd_close called without SYSCALLS_REQUIRE_FILESYSTEM');
    };

  var INT53_MAX = 9007199254740992;
  
  var INT53_MIN = -9007199254740992;
  var bigintToI53Checked = (num) => (num < INT53_MIN || num > INT53_MAX) ? NaN : Number(num);
  function _fd_seek(fd, offset, whence, newOffset) {
    offset = bigintToI53Checked(offset);
  
  
      return 70;
    ;
  }

  var printCharBuffers = [null,[],[]];
  
  var printChar = (stream, curr) => {
      var buffer = printCharBuffers[stream];
      assert(buffer);
      if (curr === 0 || curr === 10) {
        (stream === 1 ? out : err)(UTF8ArrayToString(buffer));
        buffer.length = 0;
      } else {
        buffer.push(curr);
      }
    };
  
  var flush_NO_FILESYSTEM = () => {
      // flush anything remaining in the buffers during shutdown
      _fflush(0);
      if (printCharBuffers[1].length) printChar(1, 10);
      if (printCharBuffers[2].length) printChar(2, 10);
    };
  
  
  var _fd_write = (fd, iov, iovcnt, pnum) => {
      // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        for (var j = 0; j < len; j++) {
          printChar(fd, HEAPU8[ptr+j]);
        }
        num += len;
      }
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    };
init_ClassHandle();
init_RegisteredPointer();
assert(emval_handles.length === 5 * 2);
// End JS library code

// include: postlibrary.js
// This file is included after the automatically-generated JS library code
// but before the wasm module is created.

{

  // Begin ATMODULES hooks
  if (Module['noExitRuntime']) noExitRuntime = Module['noExitRuntime'];
if (Module['print']) out = Module['print'];
if (Module['printErr']) err = Module['printErr'];
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];

Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;

  // End ATMODULES hooks

  checkIncomingModuleAPI();

  if (Module['arguments']) arguments_ = Module['arguments'];
  if (Module['thisProgram']) thisProgram = Module['thisProgram'];

  // Assertions on removed incoming Module JS APIs.
  assert(typeof Module['memoryInitializerPrefixURL'] == 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
  assert(typeof Module['pthreadMainPrefixURL'] == 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
  assert(typeof Module['cdInitializerPrefixURL'] == 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
  assert(typeof Module['filePackagePrefixURL'] == 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');
  assert(typeof Module['read'] == 'undefined', 'Module.read option was removed');
  assert(typeof Module['readAsync'] == 'undefined', 'Module.readAsync option was removed (modify readAsync in JS)');
  assert(typeof Module['readBinary'] == 'undefined', 'Module.readBinary option was removed (modify readBinary in JS)');
  assert(typeof Module['setWindowTitle'] == 'undefined', 'Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)');
  assert(typeof Module['TOTAL_MEMORY'] == 'undefined', 'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY');
  assert(typeof Module['ENVIRONMENT'] == 'undefined', 'Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)');
  assert(typeof Module['STACK_SIZE'] == 'undefined', 'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time')
  // If memory is defined in wasm, the user can't provide it, or set INITIAL_MEMORY
  assert(typeof Module['wasmMemory'] == 'undefined', 'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally');
  assert(typeof Module['INITIAL_MEMORY'] == 'undefined', 'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically');

  if (Module['preInit']) {
    if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
    while (Module['preInit'].length > 0) {
      Module['preInit'].shift()();
    }
  }
  consumedModuleProp('preInit');
}

// Begin runtime exports
  var missingLibrarySymbols = [
  'writeI53ToI64',
  'writeI53ToI64Clamped',
  'writeI53ToI64Signaling',
  'writeI53ToU64Clamped',
  'writeI53ToU64Signaling',
  'readI53FromI64',
  'readI53FromU64',
  'convertI32PairToI53',
  'convertI32PairToI53Checked',
  'convertU32PairToI53',
  'stackAlloc',
  'getTempRet0',
  'setTempRet0',
  'zeroMemory',
  'exitJS',
  'withStackSave',
  'strError',
  'inetPton4',
  'inetNtop4',
  'inetPton6',
  'inetNtop6',
  'readSockaddr',
  'writeSockaddr',
  'readEmAsmArgs',
  'jstoi_q',
  'getExecutableName',
  'autoResumeAudioContext',
  'getDynCaller',
  'dynCall',
  'handleException',
  'keepRuntimeAlive',
  'runtimeKeepalivePush',
  'runtimeKeepalivePop',
  'callUserCallback',
  'maybeExit',
  'asyncLoad',
  'asmjsMangle',
  'mmapAlloc',
  'HandleAllocator',
  'getUniqueRunDependency',
  'addRunDependency',
  'removeRunDependency',
  'addOnInit',
  'addOnPostCtor',
  'addOnPreMain',
  'addOnExit',
  'STACK_SIZE',
  'STACK_ALIGN',
  'POINTER_SIZE',
  'ASSERTIONS',
  'ccall',
  'cwrap',
  'convertJsFunctionToWasm',
  'getEmptyTableSlot',
  'updateTableMap',
  'getFunctionAddress',
  'addFunction',
  'removeFunction',
  'intArrayFromString',
  'intArrayToString',
  'stringToAscii',
  'stringToNewUTF8',
  'stringToUTF8OnStack',
  'writeArrayToMemory',
  'registerKeyEventCallback',
  'maybeCStringToJsString',
  'findEventTarget',
  'getBoundingClientRect',
  'fillMouseEventData',
  'registerMouseEventCallback',
  'registerWheelEventCallback',
  'registerUiEventCallback',
  'registerFocusEventCallback',
  'fillDeviceOrientationEventData',
  'registerDeviceOrientationEventCallback',
  'fillDeviceMotionEventData',
  'registerDeviceMotionEventCallback',
  'screenOrientation',
  'fillOrientationChangeEventData',
  'registerOrientationChangeEventCallback',
  'fillFullscreenChangeEventData',
  'registerFullscreenChangeEventCallback',
  'JSEvents_requestFullscreen',
  'JSEvents_resizeCanvasForFullscreen',
  'registerRestoreOldStyle',
  'hideEverythingExceptGivenElement',
  'restoreHiddenElements',
  'setLetterbox',
  'softFullscreenResizeWebGLRenderTarget',
  'doRequestFullscreen',
  'fillPointerlockChangeEventData',
  'registerPointerlockChangeEventCallback',
  'registerPointerlockErrorEventCallback',
  'requestPointerLock',
  'fillVisibilityChangeEventData',
  'registerVisibilityChangeEventCallback',
  'registerTouchEventCallback',
  'fillGamepadEventData',
  'registerGamepadEventCallback',
  'registerBeforeUnloadEventCallback',
  'fillBatteryEventData',
  'registerBatteryEventCallback',
  'setCanvasElementSize',
  'getCanvasElementSize',
  'jsStackTrace',
  'getCallstack',
  'convertPCtoSourceLocation',
  'getEnvStrings',
  'checkWasiClock',
  'wasiRightsToMuslOFlags',
  'wasiOFlagsToMuslOFlags',
  'initRandomFill',
  'randomFill',
  'safeSetTimeout',
  'setImmediateWrapped',
  'safeRequestAnimationFrame',
  'clearImmediateWrapped',
  'registerPostMainLoop',
  'registerPreMainLoop',
  'getPromise',
  'makePromise',
  'idsToPromises',
  'makePromiseCallback',
  'ExceptionInfo',
  'findMatchingCatch',
  'incrementUncaughtExceptionCount',
  'decrementUncaughtExceptionCount',
  'Browser_asyncPrepareDataCounter',
  'isLeapYear',
  'ydayFromDate',
  'arraySum',
  'addDays',
  'getSocketFromFD',
  'getSocketAddress',
  'FS_createPreloadedFile',
  'FS_preloadFile',
  'FS_modeStringToFlags',
  'FS_getMode',
  'FS_fileDataToTypedArray',
  'FS_stdin_getChar',
  'FS_mkdirTree',
  '_setNetworkCallback',
  'heapObjectForWebGLType',
  'toTypedArrayIndex',
  'webgl_enable_ANGLE_instanced_arrays',
  'webgl_enable_OES_vertex_array_object',
  'webgl_enable_WEBGL_draw_buffers',
  'webgl_enable_WEBGL_multi_draw',
  'webgl_enable_EXT_polygon_offset_clamp',
  'webgl_enable_EXT_clip_control',
  'webgl_enable_WEBGL_polygon_mode',
  'emscriptenWebGLGet',
  'computeUnpackAlignedImageSize',
  'colorChannelsInGlTextureFormat',
  'emscriptenWebGLGetTexPixelData',
  'emscriptenWebGLGetUniform',
  'webglGetUniformLocation',
  'webglPrepareUniformLocationsBeforeFirstUse',
  'webglGetLeftBracePos',
  'emscriptenWebGLGetVertexAttrib',
  '__glGetActiveAttribOrUniform',
  'writeGLArray',
  'registerWebGlEventCallback',
  'runAndAbortIfError',
  'ALLOC_NORMAL',
  'ALLOC_STACK',
  'allocate',
  'writeStringToMemory',
  'writeAsciiToMemory',
  'allocateUTF8',
  'allocateUTF8OnStack',
  'demangle',
  'stackTrace',
  'getNativeTypeSize',
  'getFunctionArgsName',
  'requireRegisteredType',
  'createJsInvokerSignature',
  'getEnumValueType',
  'PureVirtualError',
  'registerInheritedInstance',
  'unregisterInheritedInstance',
  'getInheritedInstanceCount',
  'getLiveInheritedInstances',
  'enumReadValueFromPointer',
  'installIndexedIterator',
  'setDelayFunction',
  'validateThis',
  'count_emval_handles',
  'getStringOrSymbol',
  'emval_returnValue',
  'emval_lookupTypes',
  'emval_addMethodCaller',
];
missingLibrarySymbols.forEach(missingLibrarySymbol)

  var unexportedSymbols = [
  'run',
  'out',
  'err',
  'callMain',
  'abort',
  'wasmExports',
  'writeStackCookie',
  'checkStackCookie',
  'INT53_MAX',
  'INT53_MIN',
  'bigintToI53Checked',
  'HEAP8',
  'HEAPU8',
  'HEAP16',
  'HEAPU16',
  'HEAP32',
  'HEAPU32',
  'HEAPF32',
  'HEAPF64',
  'HEAP64',
  'HEAPU64',
  'stackSave',
  'stackRestore',
  'createNamedFunction',
  'ptrToString',
  'getHeapMax',
  'growMemory',
  'ENV',
  'ERRNO_CODES',
  'DNS',
  'Protocols',
  'Sockets',
  'timers',
  'warnOnce',
  'readEmAsmArgsArray',
  'alignMemory',
  'wasmTable',
  'wasmMemory',
  'noExitRuntime',
  'addOnPreRun',
  'addOnPostRun',
  'freeTableIndexes',
  'functionsInTableMap',
  'setValue',
  'getValue',
  'PATH',
  'PATH_FS',
  'UTF8Decoder',
  'UTF8ArrayToString',
  'UTF8ToString',
  'stringToUTF8Array',
  'stringToUTF8',
  'lengthBytesUTF8',
  'AsciiToString',
  'UTF16Decoder',
  'UTF16ToString',
  'stringToUTF16',
  'lengthBytesUTF16',
  'UTF32ToString',
  'stringToUTF32',
  'lengthBytesUTF32',
  'JSEvents',
  'specialHTMLTargets',
  'findCanvasEventTarget',
  'currentFullscreenStrategy',
  'restoreOldWindowedStyle',
  'UNWIND_CACHE',
  'ExitStatus',
  'flush_NO_FILESYSTEM',
  'emSetImmediate',
  'emClearImmediate_deps',
  'emClearImmediate',
  'promiseMap',
  'uncaughtExceptionCount',
  'exceptionCaught',
  'Browser',
  'requestFullscreen',
  'requestFullScreen',
  'setCanvasSize',
  'getUserMedia',
  'createContext',
  'getPreloadedImageData__data',
  'wget',
  'MONTH_DAYS_REGULAR',
  'MONTH_DAYS_LEAP',
  'MONTH_DAYS_REGULAR_CUMULATIVE',
  'MONTH_DAYS_LEAP_CUMULATIVE',
  'SYSCALLS',
  'preloadPlugins',
  'FS_stdin_getChar_buffer',
  'FS_unlink',
  'FS_createPath',
  'FS_createDevice',
  'FS_readFile',
  'FS',
  'FS_root',
  'FS_mounts',
  'FS_devices',
  'FS_streams',
  'FS_nextInode',
  'FS_nameTable',
  'FS_currentPath',
  'FS_initialized',
  'FS_ignorePermissions',
  'FS_filesystems',
  'FS_syncFSRequests',
  'FS_lookupPath',
  'FS_getPath',
  'FS_hashName',
  'FS_hashAddNode',
  'FS_hashRemoveNode',
  'FS_lookupNode',
  'FS_createNode',
  'FS_destroyNode',
  'FS_isRoot',
  'FS_isMountpoint',
  'FS_isFile',
  'FS_isDir',
  'FS_isLink',
  'FS_isChrdev',
  'FS_isBlkdev',
  'FS_isFIFO',
  'FS_isSocket',
  'FS_flagsToPermissionString',
  'FS_nodePermissions',
  'FS_mayLookup',
  'FS_mayCreate',
  'FS_mayDelete',
  'FS_mayOpen',
  'FS_checkOpExists',
  'FS_nextfd',
  'FS_getStreamChecked',
  'FS_getStream',
  'FS_createStream',
  'FS_closeStream',
  'FS_dupStream',
  'FS_doSetAttr',
  'FS_chrdev_stream_ops',
  'FS_major',
  'FS_minor',
  'FS_makedev',
  'FS_registerDevice',
  'FS_getDevice',
  'FS_getMounts',
  'FS_syncfs',
  'FS_mount',
  'FS_unmount',
  'FS_lookup',
  'FS_mknod',
  'FS_statfs',
  'FS_statfsStream',
  'FS_statfsNode',
  'FS_create',
  'FS_mkdir',
  'FS_mkdev',
  'FS_symlink',
  'FS_rename',
  'FS_rmdir',
  'FS_readdir',
  'FS_readlink',
  'FS_stat',
  'FS_fstat',
  'FS_lstat',
  'FS_doChmod',
  'FS_chmod',
  'FS_lchmod',
  'FS_fchmod',
  'FS_doChown',
  'FS_chown',
  'FS_lchown',
  'FS_fchown',
  'FS_doTruncate',
  'FS_truncate',
  'FS_ftruncate',
  'FS_utime',
  'FS_open',
  'FS_close',
  'FS_isClosed',
  'FS_llseek',
  'FS_read',
  'FS_write',
  'FS_mmap',
  'FS_msync',
  'FS_ioctl',
  'FS_writeFile',
  'FS_cwd',
  'FS_chdir',
  'FS_createDefaultDirectories',
  'FS_createDefaultDevices',
  'FS_createSpecialDirectories',
  'FS_createStandardStreams',
  'FS_staticInit',
  'FS_init',
  'FS_quit',
  'FS_findObject',
  'FS_analyzePath',
  'FS_createFile',
  'FS_createDataFile',
  'FS_forceLoadFile',
  'FS_createLazyFile',
  'MEMFS',
  'TTY',
  'PIPEFS',
  'SOCKFS',
  'tempFixedLengthArray',
  'miniTempWebGLFloatBuffers',
  'miniTempWebGLIntBuffers',
  'GL',
  'AL',
  'GLUT',
  'EGL',
  'GLEW',
  'IDBStore',
  'SDL',
  'SDL_gfx',
  'print',
  'printErr',
  'jstoi_s',
  'InternalError',
  'BindingError',
  'throwInternalError',
  'throwBindingError',
  'registeredTypes',
  'awaitingDependencies',
  'typeDependencies',
  'tupleRegistrations',
  'structRegistrations',
  'sharedRegisterType',
  'whenDependentTypesAreResolved',
  'getTypeName',
  'getFunctionName',
  'heap32VectorToArray',
  'usesDestructorStack',
  'checkArgCount',
  'getRequiredArgCount',
  'createJsInvoker',
  'UnboundTypeError',
  'EmValType',
  'EmValOptionalType',
  'throwUnboundTypeError',
  'ensureOverloadTable',
  'exposePublicSymbol',
  'replacePublicSymbol',
  'embindRepr',
  'registeredInstances',
  'getBasestPointer',
  'getInheritedInstance',
  'registeredPointers',
  'registerType',
  'integerReadValueFromPointer',
  'floatReadValueFromPointer',
  'assertIntegerRange',
  'readPointer',
  'runDestructors',
  'craftInvokerFunction',
  'embind__requireFunction',
  'genericPointerToWireType',
  'constNoSmartPtrRawPointerToWireType',
  'nonConstNoSmartPtrRawPointerToWireType',
  'init_RegisteredPointer',
  'RegisteredPointer',
  'RegisteredPointer_fromWireType',
  'runDestructor',
  'releaseClassHandle',
  'finalizationRegistry',
  'detachFinalizer_deps',
  'detachFinalizer',
  'attachFinalizer',
  'makeClassHandle',
  'init_ClassHandle',
  'ClassHandle',
  'throwInstanceAlreadyDeleted',
  'deletionQueue',
  'flushPendingDeletes',
  'delayFunction',
  'RegisteredClass',
  'shallowCopyInternalPointer',
  'downcastPointer',
  'upcastPointer',
  'char_0',
  'char_9',
  'makeLegalFunctionName',
  'emval_freelist',
  'emval_handles',
  'emval_symbols',
  'Emval',
  'emval_methodCallers',
];
unexportedSymbols.forEach(unexportedRuntimeSymbol);

  // End runtime exports
  // Begin JS library exports
  // End JS library exports

// end include: postlibrary.js

function checkIncomingModuleAPI() {
  ignoredModuleProp('fetchSettings');
  ignoredModuleProp('logReadFiles');
  ignoredModuleProp('loadSplitModule');
  ignoredModuleProp('onMalloc');
  ignoredModuleProp('onRealloc');
  ignoredModuleProp('onFree');
  ignoredModuleProp('onSbrkGrow');
}

// Imports from the Wasm binary.
var ___getTypeName = makeInvalidEarlyAccess('___getTypeName');
var _malloc = makeInvalidEarlyAccess('_malloc');
var _free = makeInvalidEarlyAccess('_free');
var _fflush = makeInvalidEarlyAccess('_fflush');
var _strerror = makeInvalidEarlyAccess('_strerror');
var _emscripten_stack_get_end = makeInvalidEarlyAccess('_emscripten_stack_get_end');
var _emscripten_stack_get_base = makeInvalidEarlyAccess('_emscripten_stack_get_base');
var _emscripten_stack_init = makeInvalidEarlyAccess('_emscripten_stack_init');
var _emscripten_stack_get_free = makeInvalidEarlyAccess('_emscripten_stack_get_free');
var __emscripten_stack_restore = makeInvalidEarlyAccess('__emscripten_stack_restore');
var __emscripten_stack_alloc = makeInvalidEarlyAccess('__emscripten_stack_alloc');
var _emscripten_stack_get_current = makeInvalidEarlyAccess('_emscripten_stack_get_current');
var memory = makeInvalidEarlyAccess('memory');
var __indirect_function_table = makeInvalidEarlyAccess('__indirect_function_table');
var wasmMemory = makeInvalidEarlyAccess('wasmMemory');
var wasmTable = makeInvalidEarlyAccess('wasmTable');

function assignWasmExports(wasmExports) {
  assert(typeof wasmExports['__getTypeName'] != 'undefined', 'missing Wasm export: __getTypeName');
  assert(typeof wasmExports['malloc'] != 'undefined', 'missing Wasm export: malloc');
  assert(typeof wasmExports['free'] != 'undefined', 'missing Wasm export: free');
  assert(typeof wasmExports['fflush'] != 'undefined', 'missing Wasm export: fflush');
  assert(typeof wasmExports['strerror'] != 'undefined', 'missing Wasm export: strerror');
  assert(typeof wasmExports['emscripten_stack_get_end'] != 'undefined', 'missing Wasm export: emscripten_stack_get_end');
  assert(typeof wasmExports['emscripten_stack_get_base'] != 'undefined', 'missing Wasm export: emscripten_stack_get_base');
  assert(typeof wasmExports['emscripten_stack_init'] != 'undefined', 'missing Wasm export: emscripten_stack_init');
  assert(typeof wasmExports['emscripten_stack_get_free'] != 'undefined', 'missing Wasm export: emscripten_stack_get_free');
  assert(typeof wasmExports['_emscripten_stack_restore'] != 'undefined', 'missing Wasm export: _emscripten_stack_restore');
  assert(typeof wasmExports['_emscripten_stack_alloc'] != 'undefined', 'missing Wasm export: _emscripten_stack_alloc');
  assert(typeof wasmExports['emscripten_stack_get_current'] != 'undefined', 'missing Wasm export: emscripten_stack_get_current');
  assert(typeof wasmExports['memory'] != 'undefined', 'missing Wasm export: memory');
  assert(typeof wasmExports['__indirect_function_table'] != 'undefined', 'missing Wasm export: __indirect_function_table');
  ___getTypeName = createExportWrapper('__getTypeName', 1);
  _malloc = createExportWrapper('malloc', 1);
  _free = createExportWrapper('free', 1);
  _fflush = createExportWrapper('fflush', 1);
  _strerror = createExportWrapper('strerror', 1);
  _emscripten_stack_get_end = wasmExports['emscripten_stack_get_end'];
  _emscripten_stack_get_base = wasmExports['emscripten_stack_get_base'];
  _emscripten_stack_init = wasmExports['emscripten_stack_init'];
  _emscripten_stack_get_free = wasmExports['emscripten_stack_get_free'];
  __emscripten_stack_restore = wasmExports['_emscripten_stack_restore'];
  __emscripten_stack_alloc = wasmExports['_emscripten_stack_alloc'];
  _emscripten_stack_get_current = wasmExports['emscripten_stack_get_current'];
  memory = wasmMemory = wasmExports['memory'];
  __indirect_function_table = wasmTable = wasmExports['__indirect_function_table'];
}

var wasmImports = {
  /** @export */
  _abort_js: __abort_js,
  /** @export */
  _embind_register_bigint: __embind_register_bigint,
  /** @export */
  _embind_register_bool: __embind_register_bool,
  /** @export */
  _embind_register_class: __embind_register_class,
  /** @export */
  _embind_register_class_constructor: __embind_register_class_constructor,
  /** @export */
  _embind_register_class_function: __embind_register_class_function,
  /** @export */
  _embind_register_emval: __embind_register_emval,
  /** @export */
  _embind_register_float: __embind_register_float,
  /** @export */
  _embind_register_integer: __embind_register_integer,
  /** @export */
  _embind_register_memory_view: __embind_register_memory_view,
  /** @export */
  _embind_register_std_string: __embind_register_std_string,
  /** @export */
  _embind_register_std_wstring: __embind_register_std_wstring,
  /** @export */
  _embind_register_void: __embind_register_void,
  /** @export */
  emscripten_resize_heap: _emscripten_resize_heap,
  /** @export */
  fd_close: _fd_close,
  /** @export */
  fd_seek: _fd_seek,
  /** @export */
  fd_write: _fd_write
};


// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

var calledRun;

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  _emscripten_stack_init();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}

function run() {

  stackCheckInit();

  preRun();

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    assert(!calledRun);
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    readyPromiseResolve?.(Module);
    Module['onRuntimeInitialized']?.();
    consumedModuleProp('onRuntimeInitialized');

    assert(!Module['_main'], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(() => {
      setTimeout(() => Module['setStatus'](''), 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
  checkStackCookie();
}

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = (x) => {
    has = true;
  }
  try { // it doesn't matter if it fails
    flush_NO_FILESYSTEM();
  } catch(e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.');
    warnOnce('(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)');
  }
}

var wasmExports;

// In modularize mode the generated code is within a factory function so we
// can use await here (since it's not top-level-await).
wasmExports = await (createWasm());

run();

// end include: postamble.js

// include: postamble_modularize.js
// In MODULARIZE mode we wrap the generated code in a factory function
// and return either the Module itself, or a promise of the module.
//
// We assign to the `moduleRtn` global here and configure closure to see
// this as an extern so it won't get minified.

if (runtimeInitialized)  {
  moduleRtn = Module;
} else {
  // Set up the promise that indicates the Module is initialized
  moduleRtn = new Promise((resolve, reject) => {
    readyPromiseResolve = resolve;
    readyPromiseReject = reject;
  });
}

// Assertion for attempting to access module properties on the incoming
// moduleArg.  In the past we used this object as the prototype of the module
// and assigned properties to it, but now we return a distinct object.  This
// keeps the instance private until it is ready (i.e the promise has been
// resolved).
for (const prop of Object.keys(Module)) {
  if (!(prop in moduleArg)) {
    Object.defineProperty(moduleArg, prop, {
      configurable: true,
      get() {
        abort(`Access to module property ('${prop}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`)
      }
    });
  }
}
// end include: postamble_modularize.js



  return moduleRtn;
}

// Export using a UMD style export, or ES6 exports if selected
export default createTheengsDecoderModule;

