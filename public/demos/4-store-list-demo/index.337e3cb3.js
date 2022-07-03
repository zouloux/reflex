// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"g8Ueu":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "init", ()=>init);
var _reflex = require("../../src/reflex");
var _storeListDemoApp = require("./StoreListDemoApp");
var _debug = require("../../src/reflex/debug");
// -----------------------------------------------------------------------------
(0, _debug.setReflexDebug)(true);
let renderIndex = 0;
function init() {
    const p = (0, _debug.trackPerformances)("Root rendering");
    (0, _reflex.render)(/*#__PURE__*/ (0, _reflex.h)((0, _storeListDemoApp.StoreListDemoApp), {
        render: init,
        renderIndex: renderIndex++
    }), document.body);
    p();
}
init();

},{"../../src/reflex":"cuBJf","./StoreListDemoApp":"cjD7G","../../src/reflex/debug":"7uUcT","@parcel/transformer-js/src/esmodule-helpers.js":"j7FRh"}],"cjD7G":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// ----------------------------------------------------------------------------- LIST APP
parcelHelpers.export(exports, "StoreListDemoApp", ()=>StoreListDemoApp);
var _reflex = require("../../src/reflex");
var _store = require("../../src/store/store");
var _reflexStoreState = require("../../src/store/reflexStoreState");
var _demoHelpers = require("../demoHelpers");
const getInitialListState = ()=>[];
const listStore = (0, _store.createStore)(getInitialListState(), {
    clearList () {
        return getInitialListState();
    },
    addItem (state, position, item) {
        return position === "bottom" ? [
            ...state,
            item
        ] : [
            item,
            ...state
        ];
    },
    removeItem (state, item) {
        return state.filter((currentItem)=>currentItem != item);
    },
    moveItem (state, item, offset) {
        const index = state.indexOf(item) + offset;
        if (index < 0 || index >= state.length) return;
        state = this.removeItem(state, item);
        state.splice(index, 0, item);
        return state;
    },
    addRandomItems (state, total = 0) {
        total ||= (0, _demoHelpers.rand)(5 + state.length) + 1;
        for(let i = 0; i < total; ++i)state = this.addItem(state, "bottom", {
            id: (0, _demoHelpers.createUID)(),
            name: (0, _demoHelpers.pickRandom)((0, _demoHelpers.colorList)) + " " + (0, _demoHelpers.pickRandom)((0, _demoHelpers.foodList))
        });
        return state;
    },
    removeRandomItems (state) {
        const total = (0, _demoHelpers.rand)(state.length) + 1;
        for(let i = 0; i < total; ++i){
            const item = (0, _demoHelpers.pickRandom)(state);
            state = this.removeItem(state, item);
        }
        return state;
    }
});
// ----------------------------------------------------------------------------- LIST ITEM
const listItemStyle = {
    border: `1px solid black`
};
function ListItem(props) {
    // console.log("ListItem")
    const { item  } = props;
    return /*#__PURE__*/ (0, _reflex.h)("tr", {
        class: "ListItem",
        "data-id": item.id,
        style: listItemStyle
    }, /*#__PURE__*/ (0, _reflex.h)("td", null, item.name), /*#__PURE__*/ (0, _reflex.h)("td", null, /*#__PURE__*/ (0, _reflex.h)("button", {
        onClick: (e)=>listStore.dispatch("moveItem", item, -1)
    }, "\u2B06")), /*#__PURE__*/ (0, _reflex.h)("td", null, /*#__PURE__*/ (0, _reflex.h)("button", {
        onClick: (e)=>listStore.dispatch("moveItem", item, 1)
    }, "\u2B07")), /*#__PURE__*/ (0, _reflex.h)("td", null, /*#__PURE__*/ (0, _reflex.h)("button", {
        onClick: (e)=>listStore.dispatch("removeItem", item)
    }, "Remove")));
}
function StoreListDemoApp(props) {
    const list = (0, _reflexStoreState.storeState)(listStore);
    const nameInput = (0, _reflex.ref)();
    function controlSubmitted(event) {
        event.preventDefault();
        if (!nameInput.dom.value) return;
        listStore.dispatch("addItem", "top", {
            name: nameInput.dom.value,
            id: (0, _demoHelpers.createUID)()
        });
        nameInput.dom.value = "";
    }
    function Controls() {
        return /*#__PURE__*/ (0, _reflex.h)("div", {
            className: "StatefulDemoApp_controls"
        }, /*#__PURE__*/ (0, _reflex.h)("table", null, /*#__PURE__*/ (0, _reflex.h)("button", {
            onClick: (e)=>listStore.dispatch("addRandomItems")
        }, "Add random items to bottom"), /*#__PURE__*/ (0, _reflex.h)("button", {
            onClick: (e)=>listStore.dispatch("addRandomItems", 1000)
        }, "Add 1.000 items to bottom"), /*#__PURE__*/ (0, _reflex.h)("button", {
            onClick: (e)=>listStore.dispatch("addRandomItems", 10000)
        }, "Add 10.000 items to bottom"), /*#__PURE__*/ (0, _reflex.h)("button", {
            onClick: (e)=>listStore.dispatch("removeRandomItems")
        }, "Remove random items"), /*#__PURE__*/ (0, _reflex.h)("button", {
            onClick: (e)=>listStore.dispatch("clearList")
        }, "Clear list")), /*#__PURE__*/ (0, _reflex.h)("form", {
            onSubmit: controlSubmitted
        }, /*#__PURE__*/ (0, _reflex.h)("table", null, /*#__PURE__*/ (0, _reflex.h)("input", {
            id: "StatefulDemoApp_nameInput",
            ref: nameInput,
            type: "text",
            name: "name",
            placeholder: "Name ..."
        }), /*#__PURE__*/ (0, _reflex.h)("button", {
            type: "submit"
        }, "Add to top"))));
    }
    return ()=>/*#__PURE__*/ (0, _reflex.h)("div", {
            class: "StatefulDemoApp"
        }, /*#__PURE__*/ (0, _reflex.h)("span", null, "Root render index : ", props.renderIndex), /*#__PURE__*/ (0, _reflex.h)(Controls, null), /*#__PURE__*/ (0, _reflex.h)("h3", null, list.value.length, " element", list.value.length > 1 ? "s" : ""), /*#__PURE__*/ (0, _reflex.h)("table", null, list.value.map((item)=>/*#__PURE__*/ (0, _reflex.h)(ListItem, {
                item: item,
                key: item.id
            }))));
}

},{"../../src/reflex":"cuBJf","../../src/store/store":"bonrN","../../src/store/reflexStoreState":"lTIuh","../demoHelpers":"yZRLL","@parcel/transformer-js/src/esmodule-helpers.js":"j7FRh"}],"bonrN":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// ----------------------------------------------------------------------------- CREATE STORE
parcelHelpers.export(exports, "createStore", ()=>createStore);
var _signal = require("@zouloux/signal");
function createStore(state = null, reducers = null, actions) {
    // Init signals
    const onBefore = (0, _signal.Signal)();
    const onAfter = (0, _signal.Signal)();
    const onCanceled = (0, _signal.Signal)();
    // Init properties
    let isLocked = false;
    // let _isDispatching = false
    let isUpdating = false;
    let lockUpdated = false;
    // Update state and call listeners
    // Will be synchronous if there are no asynchronous before listeners
    const update = async (newState = state)=>{
        // Dispatch are locked, just save new state
        // without dispatching before or after listeners
        if (isLocked) {
            // Remember that state has been updated while locked
            // To dispatch new state when unlocking
            lockUpdated = true;
            // Save new state
            state = newState;
            return;
        }
        // Prevent dispatches
        isUpdating = true;
        // Dispatch all asynchronous before listeners
        let oldState = state;
        // Only if we have some listeners, otherwise keep it synchronous
        if (onBefore.listeners.length > 0) // Start all promises in parallel
        try {
            await Promise.all(onBefore.listeners.map(async (l)=>await l(newState, oldState)));
        // FIXME : Add sequential option ?
        // for ( const listener of _beforeListeners )
        // 	await listener( newState, oldState )
        } // Stop update if any of those middlewares trows rejection
        catch (e) {
            onCanceled.dispatch(e);
            isUpdating = false;
            return;
        }
        // All listeners validated state change, save new state
        state = newState;
        // Unlock right before after listeners so they can dispatch if needed
        isUpdating = false;
        // Notify all after listeners that state changed
        onAfter.dispatch(newState, oldState);
    };
    // Expose public API
    return {
        // Get and set state
        getState: ()=>state,
        setState: (newState)=>update(typeof newState === "function" ? newState(state) : newState),
        // Dispatch reducer
        dispatch: (reducerName, ...rest)=>new Promise(async (resolve, reject)=>{
                // FIXME -> Dispatch should be able to override updating state
                // FIXME -> And kill current onBefore listeners
                // Already updating state asynchronously
                if (isUpdating) return reject("updating");
                // Call reducer synchronously and update reduced data
                await update(reducers[reducerName](state, ...rest));
                // Everything has been dispatched successfully
                resolve();
            }),
        // Expose signals
        onBefore,
        onAfter,
        onCanceled,
        // Lock or unlock updates
        async lock (locked) {
            isLocked = locked;
            // If unlocking and state has changed while locked
            if (!isLocked && lockUpdated) {
                // Dispatch new state
                lockUpdated = false;
                await update(state);
            }
        },
        // Get locked states
        get locked () {
            return isLocked;
        },
        // get isDispatching () { return _isDispatching },
        get isUpdating () {
            return isUpdating;
        },
        // Expose actions
        actions
    };
}

},{"@zouloux/signal":"kuTKe","@parcel/transformer-js/src/esmodule-helpers.js":"j7FRh"}],"lTIuh":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "storeState", ()=>storeState);
var _reflex = require("../reflex");
function storeState(store) {
    const bit = (0, _reflex.state)(store.getState());
    store.onAfter.add(()=>bit.set(store.getState()));
    // TODO : When component is removed, remove onAfter listener
    return bit;
}

},{"../reflex":"cuBJf","@parcel/transformer-js/src/esmodule-helpers.js":"j7FRh"}],"yZRLL":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "toHex", ()=>toHex);
parcelHelpers.export(exports, "createUID", ()=>createUID);
parcelHelpers.export(exports, "pickRandom", ()=>pickRandom);
parcelHelpers.export(exports, "rand", ()=>rand);
parcelHelpers.export(exports, "randBoolean", ()=>randBoolean);
parcelHelpers.export(exports, "foodList", ()=>foodList);
parcelHelpers.export(exports, "colorList", ()=>colorList);
parcelHelpers.export(exports, "firstnameList", ()=>firstnameList);
parcelHelpers.export(exports, "lastnameList", ()=>lastnameList);
const toHex = (n)=>(~~n).toString(16);
const createUID = ()=>`${toHex(Date.now())}-${toHex(Math.random() * 999999999)}`;
const pickRandom = (array)=>array[~~(Math.random() * array.length)];
const rand = (max)=>~~(Math.random() * max);
const randBoolean = (threshold = .5)=>Math.random() > threshold;
const foodList = [
    "Cheese",
    "Carrots",
    "Pastas",
    "Pizza",
    "Burgers",
    "Ham",
    "Salad",
    "Mustard"
];
const colorList = [
    "Red",
    "Blue",
    "Yellow",
    "Purple",
    "Orange",
    "Black",
    "White",
    "Green"
];
const firstnameList = [
    "Alfred",
    "Jessica",
    "Gwen",
    "Jeanne"
];
const lastnameList = [
    "Dupont",
    "Smith",
    "Stevensen",
    "Odea"
];

},{"@parcel/transformer-js/src/esmodule-helpers.js":"j7FRh"}],"7uUcT":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getReflexDebug", ()=>getReflexDebug);
parcelHelpers.export(exports, "setReflexDebug", ()=>setReflexDebug);
// ----------------------------------------------------------------------------- TRACK PERFORMANCES
parcelHelpers.export(exports, "trackPerformances", ()=>trackPerformances);
// ----------------------------------------------------------------------------- ENABLE / DISABLE
let _enableReflexDebug = false;
function getReflexDebug() {
    return _enableReflexDebug;
}
function setReflexDebug(value) {
    _enableReflexDebug = value;
}
function trackPerformances(subject) {
    return ()=>{};
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"j7FRh"}]},["g8Ueu"], "g8Ueu", "parcelRequirea1a1")
