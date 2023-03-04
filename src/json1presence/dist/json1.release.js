"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.editOp = exports.replaceOp = exports.insertOp = exports.moveOp = exports.removeOp = exports.type = void 0;

const deepEqual_js_1 = __importDefault(require("./deepEqual.js")), deepClone_js_1 = __importDefault(require("./deepClone.js")), cursor_js_1 = require("./cursor.js"), types_js_1 = require("./types.js"), RELEASE_MODE = !0, log = () => {};

function assert(pred, msg) {
    if (!pred) throw new Error(msg);
}

let debugMode = !1;

exports.type = {
    name: "json1presence",
    uri: "http://sharejs.org/types/JSONv1presence",
    readCursor: cursor_js_1.readCursor,
    writeCursor: cursor_js_1.writeCursor,
    create: data => data,
    isNoop: op => null == op,
    setDebug(val) {
        debugMode = val, log.quiet = !val;
    },
    registerSubtype,
    checkValidOp,
    normalize,
    apply,
    transformPosition,
    compose,
    tryTransform,
    transform,
    makeInvertible,
    invert,
    invertWithDoc,
    RM_UNEXPECTED_CONTENT: types_js_1.ConflictType.RM_UNEXPECTED_CONTENT,
    DROP_COLLISION: types_js_1.ConflictType.DROP_COLLISION,
    BLACKHOLE: types_js_1.ConflictType.BLACKHOLE,
    transformNoConflict: (op1, op2, side) => transformWithConflictsPred(() => !0, op1, op2, side),
    typeAllowingConflictsPred: allowConflict => Object.assign(Object.assign({}, exports.type), {
        transform: (op1, op2, side) => transformWithConflictsPred(allowConflict, op1, op2, side)
    })
};

const getComponent = r => r ? r.getComponent() : null;

function isObject(o) {
    return o && "object" == typeof o && !Array.isArray(o);
}

const shallowClone = obj => Array.isArray(obj) ? obj.slice() : null !== obj && "object" == typeof obj ? Object.assign({}, obj) : obj, hasPick = c => c && (null != c.p || void 0 !== c.r), hasDrop = c => c && (null != c.d || void 0 !== c.i);

function removeChild(container, key) {
    return assert(null != container), "number" == typeof key ? (assert(Array.isArray(container), "Invalid key - child is not an array"), 
    (container = container.slice()).splice(key, 1)) : (assert(isObject(container), "Invalid key - child is not an object"), 
    delete (container = Object.assign({}, container))[key]), container;
}

function insertChildMut(container, key, value) {
    return "number" == typeof key ? (assert(null != container, "Container is missing for key"), 
    assert(Array.isArray(container), "Cannot use numerical key for object container"), 
    assert(container.length >= key, "Cannot insert into out of bounds index"), container.splice(key, 0, value)) : (assert(isObject(container), "Cannot insert into missing item"), 
    assert(void 0 === container[key], "Trying to overwrite value at key. Your op needs to remove it first"), 
    container[key] = value), value;
}

exports.removeOp = (path, value = !0) => cursor_js_1.writeCursor().writeAtPath(path, "r", value).get(), 
exports.moveOp = (from, to) => cursor_js_1.writeCursor().writeMove(from, to).get(), 
exports.insertOp = (path, value) => cursor_js_1.writeCursor().writeAtPath(path, "i", value).get(), 
exports.replaceOp = (path, oldVal, newVal) => cursor_js_1.writeCursor().at(path, w => {
    w.write("r", oldVal), w.write("i", newVal);
}).get(), exports.editOp = (path, type, subOp, preserveNoop = !1) => cursor_js_1.writeCursor().at(path, w => writeEdit(w, type, subOp, preserveNoop)).get();

const replaceChild = (obj, k, v) => ((obj = shallowClone(obj))[k] = v, obj), isValidKey = (container, key) => null != container && ("number" == typeof key ? Array.isArray(container) : "object" == typeof container), maybeGetChild = (container, key) => isValidKey(container, key) ? container[key] : void 0, subtypes = {};

function registerSubtype(subtype) {
    let _subtype = subtype.type ? subtype.type : subtype;
    _subtype.name && (subtypes[_subtype.name] = _subtype), _subtype.uri && (subtypes[_subtype.uri] = _subtype);
}

const typeOrThrow = name => {
    const type = subtypes[name];
    if (type) return type;
    throw Error("Missing type: " + name);
};

registerSubtype(require("ot-text-unicode"));

const add = (a, b) => a + b;

registerSubtype({
    name: "number",
    apply: add,
    compose: add,
    invert: n => -n,
    transform: a => a
});

const getEditType = c => null == c ? null : c.et ? typeOrThrow(c.et) : c.es ? subtypes["text-unicode"] : null != c.ena ? subtypes.number : null, getEdit = c => c.es ? c.es : null != c.ena ? c.ena : c.e, writeEdit = (w, typeOrName, edit, preserveNoop = !1) => {
    const [type, name] = "string" == typeof typeOrName ? [ typeOrThrow(typeOrName), typeOrName ] : [ typeOrName, typeOrName.name ];
    !preserveNoop && type.isNoop && type.isNoop(edit) || ("number" === name ? w.write("ena", edit) : "text-unicode" === name ? w.write("es", edit) : (w.write("et", name), 
    w.write("e", edit)));
};

function checkNonNegInteger(n) {
    assert("number" == typeof n), assert(n >= 0), assert(n === (0 | n));
}

function checkScalar(s) {
    "number" == typeof s ? checkNonNegInteger(s) : assert("string" == typeof s);
}

function checkValidOp(op) {
    if (null === op) return;
    const pickedSlots = new Set, droppedSlots = new Set, checkComponent = e => {
        let empty = !0, hasEdit = !1;
        for (let k in e) {
            const v = e[k];
            if (empty = !1, assert("p" === k || "r" === k || "d" === k || "i" === k || "e" === k || "es" === k || "ena" === k || "et" === k, "Invalid component item '" + k + "'"), 
            "p" === k) checkNonNegInteger(v), assert(!pickedSlots.has(v)), pickedSlots.add(v), 
            assert(void 0 === e.r); else if ("d" === k) checkNonNegInteger(v), assert(!droppedSlots.has(v)), 
            droppedSlots.add(v), assert(void 0 === e.i); else if ("e" === k || "es" === k || "ena" === k) {
                assert(!hasEdit), hasEdit = !0;
                const t = getEditType(e);
                assert(t, "Missing type in edit"), t.checkValidOp && t.checkValidOp(getEdit(e));
            }
        }
        assert(!empty);
    }, checkDescent = (descent, isRoot, removed) => {
        if (!Array.isArray(descent)) throw Error("Op must be null or a list");
        if (0 === descent.length) throw Error("Empty descent");
        isRoot || checkScalar(descent[0]);
        let last = 1, numDescents = 0, lastKey = 0;
        for (let i = 0; i < descent.length; i++) {
            const d = descent[i];
            if (assert(null != d), Array.isArray(d)) {
                const key = checkDescent(d, !1, removed);
                if (numDescents) {
                    const t1 = typeof lastKey, t2 = typeof key;
                    t1 === t2 ? assert(lastKey < key, "descent keys are not in order") : assert("number" === t1 && "string" === t2);
                }
                lastKey = key, numDescents++, last = 3;
            } else "object" == typeof d ? (assert(1 === last, `Prev not scalar - instead ${last}`), 
            checkComponent(d), last = 2) : (assert(3 !== last), checkScalar(d), assert(cursor_js_1.isValidPathItem(d), "Invalid path key"), 
            last = 1);
        }
        return assert(1 !== numDescents, "Operation makes multiple descents. Remove some []"), 
        assert(2 === last || 3 === last), descent[0];
    };
    checkDescent(op, !0, !1), assert(pickedSlots.size === droppedSlots.size, "Mismatched picks and drops in op");
    for (let i = 0; i < pickedSlots.size; i++) assert(pickedSlots.has(i)), assert(droppedSlots.has(i));
}

function normalize(op) {
    let nextSlot = 0, slotMap = [];
    const w = cursor_js_1.writeCursor();
    return w.mergeTree(op, (c, w) => {
        const t = getEditType(c);
        if (t) {
            const op = getEdit(c);
            writeEdit(w, t, t.normalize ? t.normalize(op) : op);
        }
        for (const k of [ "r", "p", "i", "d" ]) if (void 0 !== c[k]) {
            const r = "p" === k || "d" === k ? (inSlot = c[k], null == slotMap[inSlot] && (slotMap[inSlot] = nextSlot++), 
            slotMap[inSlot]) : c[k];
            w.write(k, r);
        }
        var inSlot;
    }), w.get();
}

function apply(snapshot, op) {
    if (log.quiet = !debugMode, checkValidOp(op), null === op) return snapshot;
    const held = [];
    return function drop(root, descent) {
        let subDoc = root, i = 0, rootContainer = {
            root
        }, m = 0, container = rootContainer, key = "root";
        function mut() {
            for (;m < i; m++) {
                let d = descent[m];
                "object" != typeof d && (assert(isValidKey(container, key)), container = container[key] = shallowClone(container[key]), 
                key = d);
            }
        }
        for (;i < descent.length; i++) {
            const d = descent[i];
            if (Array.isArray(d)) {
                const child = drop(subDoc, d);
                child !== subDoc && void 0 !== child && (mut(), subDoc = container[key] = child);
            } else if ("object" == typeof d) {
                null != d.d ? (mut(), subDoc = insertChildMut(container, key, held[d.d])) : void 0 !== d.i && (mut(), 
                subDoc = insertChildMut(container, key, d.i));
                const t = getEditType(d);
                if (t) mut(), subDoc = container[key] = t.apply(subDoc, getEdit(d)); else if (void 0 !== d.e) throw Error("Subtype " + d.et + " undefined");
            } else subDoc = maybeGetChild(subDoc, d);
        }
        return rootContainer.root;
    }(snapshot = function pick(subDoc, descent) {
        const stack = [];
        let i = 0;
        for (;i < descent.length; i++) {
            const d = descent[i];
            if (Array.isArray(d)) break;
            "object" != typeof d && (stack.push(subDoc), subDoc = maybeGetChild(subDoc, d));
        }
        for (let j = descent.length - 1; j >= i; j--) subDoc = pick(subDoc, descent[j]);
        for (--i; i >= 0; i--) {
            const d = descent[i];
            if ("object" != typeof d) {
                const container = stack.pop();
                subDoc = subDoc === maybeGetChild(container, d) ? container : void 0 === subDoc ? removeChild(container, d) : (k = d, 
                v = subDoc, (obj = shallowClone(obj = container))[k] = v, obj);
            } else hasPick(d) && (assert(void 0 !== subDoc, "Cannot pick up or remove undefined"), 
            null != d.p && (held[d.p] = subDoc), subDoc = void 0);
        }
        var obj, k, v;
        return subDoc;
    }(snapshot, op), op);
}

const incPrefix = () => {}, decPrefix = () => {};

function transformPosition(path, op) {
    path = path.slice(), checkValidOp(op);
    const r = cursor_js_1.readCursor(op);
    let pickedAtSlot, pickIndex, removed = !1;
    const advStack = [];
    for (let i = 0; ;i++) {
        const k = path[i], c = r.getComponent();
        if (c && (void 0 !== c.r ? removed = !0 : null != c.p && (removed = !1, pickedAtSlot = c.p, 
        pickIndex = i)), i >= path.length) break;
        let pickOffset = 0;
        const pickAdv = cursor_js_1.advancer(r, void 0, (k, c) => {
            hasPick(c) && pickOffset++;
        });
        advStack.unshift(pickAdv);
        const hasNext = pickAdv(k);
        if ("number" == typeof k && (path[i] -= pickOffset), !hasNext) break;
    }
    if (advStack.forEach(pickAdv => pickAdv.end()), removed) return null;
    const handleDrop = () => {
        let i = 0;
        if (null != pickedAtSlot) {
            const rPath = r.getPath();
            i = rPath.length, path = rPath.concat(path.slice(pickIndex));
        }
        for (;i < path.length; i++) {
            const k = path[i], c = getComponent(r), et = getEditType(c);
            if (et) {
                const e = getEdit(c);
                et.transformPosition && (path[i] = et.transformPosition(path[i], e));
                break;
            }
            let dropOffset = 0;
            const hasNext = cursor_js_1.advancer(r, (k, c) => hasDrop(c) ? ~(k - dropOffset) : k - dropOffset, (k, c) => {
                hasDrop(c) && dropOffset++;
            })(k);
            if ("number" == typeof k && (path[i] += dropOffset), !hasNext) break;
        }
    };
    return null != pickedAtSlot ? r.eachDrop(null, slot => {
        slot === pickedAtSlot && handleDrop();
    }) : handleDrop(), path;
}

const setOrRemoveChild = (container, key, child) => {
    "number" == typeof key ? (assert(Array.isArray(container)), assert(key < container.length)) : (assert(!Array.isArray(container)), 
    assert(void 0 !== container[key])), void 0 === child ? "number" == typeof key ? container.splice(key, 1) : delete container[key] : container[key] = child;
};

function compose(op1, op2) {
    if (checkValidOp(op1), checkValidOp(op2), null == op1) return op2;
    if (null == op2) return op1;
    let nextSlot = 0;
    const r1 = cursor_js_1.readCursor(op1), r2 = cursor_js_1.readCursor(op2), w = cursor_js_1.writeCursor(), heldPickWrites = [], heldDropWrites = [], held1Pick = [], held2Drop = [], p1SlotMap = [], p2SlotMap = [], visitedOp2EditCs = new Set;
    r1.traverse(null, c => {
        null != c.p && (held1Pick[c.p] = r1.clone());
    }), r2.traverse(null, c => {
        null != c.d && (held2Drop[c.d] = r2.clone());
    });
    const w2 = cursor_js_1.writeCursor();
    return function xfBoundary(r1Pick, r1Drop, r2Pick, r2Drop, litIn, rmParent, wd, wp) {
        assert(r1Drop || r2Pick);
        const c1d = getComponent(r1Drop), c2p = getComponent(r2Pick), rmHere = !!c2p && void 0 !== c2p.r, insHere = !!c1d && void 0 !== c1d.i, drop1Slot = c1d ? c1d.d : null, pick2Slot = c2p ? c2p.p : null, rmChildren = (rmParent || rmHere) && null == pick2Slot;
        if (null != pick2Slot) r2Drop = held2Drop[pick2Slot], wd = heldDropWrites[pick2Slot] = new cursor_js_1.WriteCursor; else if (c2p && void 0 !== c2p.r) r2Drop = null; else {
            const c2d = getComponent(r2Drop);
            c2d && null != c2d.d && (r2Drop = null);
        }
        const c2d = getComponent(r2Drop);
        if (null != drop1Slot) if (r1Pick = held1Pick[drop1Slot], wp = heldPickWrites[drop1Slot] = new cursor_js_1.WriteCursor, 
        rmChildren) rmParent && !rmHere && wp.write("r", !0); else {
            const slot = p1SlotMap[drop1Slot] = nextSlot++;
            wd.write("d", slot);
        } else if (c1d && void 0 !== c1d.i) r1Pick = null; else {
            const c1p = getComponent(r1Pick);
            c1p && null != c1p.p && (r1Pick = null);
        }
        let litOut;
        insHere ? (assert(void 0 === litIn), litOut = c1d.i) : litOut = litIn;
        const insComponent = (null == pick2Slot ? !insHere || rmParent || rmHere : void 0 === litOut) ? null : wd.getComponent();
        if (null != pick2Slot) if (void 0 !== litIn || insHere) ; else {
            const slot = null != drop1Slot ? p1SlotMap[drop1Slot] : nextSlot++;
            p2SlotMap[pick2Slot] = slot, wp.write("p", slot);
        } else rmHere && (insHere || void 0 !== litIn || (c2p.r, wp.write("r", c2p.r)));
        const type1 = rmChildren ? null : getEditType(c1d), type2 = getEditType(c2d);
        if ((type1 || type2) && (type1 && type1.name, type2 && type2.name), type1 && type2) {
            assert(type1 === type2);
            const e1 = getEdit(c1d), e2 = getEdit(c2d), r = type1.compose(e1, e2);
            writeEdit(wd, type1, r), visitedOp2EditCs.add(c2d);
        } else type1 ? writeEdit(wd, type1, getEdit(c1d)) : type2 && (writeEdit(wd, type2, getEdit(c2d)), 
        visitedOp2EditCs.add(c2d));
        const hasContainerLiteral = "object" == typeof litOut && null != litOut;
        let isCloned = !1, p1PickOff = 0, p1DropOff = 0, p2PickOff = 0, p2DropOff = 0, litOff = 0;
        const p2DropAdv = cursor_js_1.advancer(r2Drop, (k, c) => hasDrop(c) ? p2DropOff - k - 1 : k - p2DropOff, (k, c) => {
            hasDrop(c) && p2DropOff++;
        }), p1PickAdv = cursor_js_1.advancer(r1Pick, (k, c) => hasPick(c) ? p1PickOff - k - 1 : k - p1PickOff, (k, c) => {
            hasPick(c) && p1PickOff++;
        });
        if (cursor_js_1.eachChildOf(r1Drop, r2Pick, (inKey, _p1Drop, _p2Pick) => {
            let _p1Pick, _p2Drop, p1PickKey = inKey, p2DropKey = inKey, litKey = inKey;
            if ("number" == typeof inKey) {
                let p2Mid = inKey + p2PickOff;
                _p2Drop = p2DropAdv(p2Mid), p2DropKey = p2Mid + p2DropOff;
                let p1Mid = inKey + p1DropOff;
                _p1Pick = p1PickAdv(p1Mid), hasDrop(getComponent(_p2Drop)) && (_p1Pick = null), 
                p1PickKey = p1Mid + p1PickOff, litKey = inKey + litOff, assert(p1PickKey >= 0, "p1PickKey is negative"), 
                assert(p2DropKey >= 0, "p2DropKey is negative");
                const hd1 = hasDrop(getComponent(_p1Drop)), hp2 = hasPick(getComponent(_p2Pick));
                (hd1 || hp2 && !rmChildren) && litOff--, hd1 && p1DropOff--, hp2 && p2PickOff--;
            } else _p1Pick = p1PickAdv(inKey), _p2Drop = p2DropAdv(inKey);
            wp.descend(p1PickKey), wd.descend(p2DropKey);
            const _lit = hasContainerLiteral && !hasDrop(getComponent(_p1Drop)) ? litOut[litKey] : void 0, _litResult = xfBoundary(_p1Pick, _p1Drop, _p2Pick, _p2Drop, _lit, rmChildren, wd, wp);
            var container, key, child;
            hasContainerLiteral && !rmChildren ? _lit !== _litResult && (isCloned || (litOut = Array.isArray(litOut) ? litOut.slice() : Object.assign({}, litOut), 
            isCloned = !0), container = litOut, child = _litResult, "number" == typeof (key = litKey) ? (assert(Array.isArray(container)), 
            assert(key < container.length)) : (assert(!Array.isArray(container)), assert(void 0 !== container[key])), 
            void 0 === child ? "number" == typeof key ? container.splice(key, 1) : delete container[key] : container[key] = child) : assert(void 0 === _litResult), 
            wd.ascend(), wp.ascend();
        }), p1PickAdv.end(), p2DropAdv.end(), null != insComponent) insComponent.i = litOut; else if (!rmParent && !rmHere && null == pick2Slot) return litOut;
    }(r1, r1.clone(), r2, r2.clone(), void 0, !1, w, w2), w.reset(), w.mergeTree(w2.get()), 
    w.reset(), w.get(), heldPickWrites.map(w => w.get()), heldDropWrites.map(w => w.get()), 
    r1.traverse(w, (c, w) => {
        const slot1 = c.p;
        if (null != slot1) {
            const slot = p1SlotMap[slot1];
            null != slot && w.write("p", slot);
            const _w = heldPickWrites[slot1];
            _w && _w.get(), _w && w.mergeTree(_w.get());
        } else void 0 !== c.r && w.write("r", c.r);
    }), w.reset(), w.get(), r2.traverse(w, (c, w) => {
        const slot2 = c.d;
        if (null != slot2) {
            const slot = p2SlotMap[slot2];
            null != slot && w.write("d", slot);
            const _w = heldDropWrites[slot2];
            _w && w.mergeTree(_w.get());
        } else void 0 !== c.i && w.write("i", c.i);
        const t = getEditType(c);
        t && !visitedOp2EditCs.has(c) && writeEdit(w, t, getEdit(c));
    }), w.get();
}

function invert(op) {
    if (null == op) return null;
    const r = new cursor_js_1.ReadCursor(op), w = new cursor_js_1.WriteCursor;
    let editsToTransform;
    const heldPick = [], heldWrites = [];
    return function invertSimple(r, w, subDoc) {
        const c = r.getComponent();
        let insertHere, subdocModified = !1;
        if (c) {
            null != c.p && (w.write("d", c.p), heldPick[c.p] = r.clone()), void 0 !== c.r && w.write("i", c.r), 
            null != c.d && (w.write("p", c.d), subDoc = void 0), void 0 !== c.i && (subDoc = insertHere = c.i);
            const t = getEditType(c);
            t && (void 0 === subDoc ? (editsToTransform || (editsToTransform = new Set), editsToTransform.add(c)) : (getEdit(c), 
            subDoc = t.apply(subDoc, getEdit(c)), subdocModified = !0));
        }
        let dropOff = 0;
        for (const key of r) {
            w.descend(key);
            const raw = "number" == typeof key ? key - dropOff : key, childIn = maybeGetChild(subDoc, raw);
            hasDrop(r.getComponent()) && dropOff++;
            const childOut = invertSimple(r, w, childIn);
            if (void 0 !== subDoc && void 0 !== childOut) {
                if (subdocModified || (subdocModified = !0, subDoc = shallowClone(subDoc)), !isValidKey(subDoc, raw)) throw Error("Cannot modify child - invalid operation");
                subDoc[raw] = childOut;
            }
            w.ascend();
        }
        if (void 0 === insertHere) return subdocModified ? subDoc : void 0;
        w.write("r", subDoc);
    }(r, w, void 0), editsToTransform && (w.reset(), function transformEdits(rPick, rDrop, w) {
        const cd = rDrop.getComponent();
        if (cd) {
            const dropSlot = cd.d;
            if (null != dropSlot && (rPick = heldPick[dropSlot], w = heldWrites[dropSlot] = cursor_js_1.writeCursor()), 
            editsToTransform.has(cd)) {
                const t = getEditType(cd);
                if (!t.invert) throw Error(`Cannot invert subtype ${t.name}`);
                writeEdit(w, t, t.invert(getEdit(cd)));
            }
        }
        let pickOff = 0, dropOff = 0;
        const ap = cursor_js_1.advancer(rPick, (k, c) => hasPick(c) ? pickOff - k - 1 : k - pickOff, (k, c) => {
            hasPick(c) && pickOff++;
        });
        for (const key of rDrop) if ("number" == typeof key) {
            const mid = key - dropOff, _rPick = ap(mid), raw = mid + pickOff;
            w.descend(raw), transformEdits(_rPick, rDrop, w), hasDrop(rDrop.getComponent()) && dropOff++, 
            w.ascend();
        } else w.descend(key), transformEdits(ap(key), rDrop, w), w.ascend();
        ap.end();
    }(r.clone(), r, w), heldWrites.length && (w.reset(), r.traverse(w, (c, w) => {
        const slot = c.p;
        if (null != slot) {
            const _w = heldWrites[slot];
            _w && _w.get(), _w && w.mergeTree(_w.get());
        }
    }))), w.get();
}

const anyComponent = (op, fn) => op.some(c => "object" == typeof c && (Array.isArray(c) ? anyComponent(c, fn) : fn(c)));

function makeInvertible(op, doc) {
    if (null == op || !anyComponent(op, c => {
        var _a;
        return void 0 !== c.r || null != (null === (_a = getEditType(c)) || void 0 === _a ? void 0 : _a.makeInvertible);
    })) return op;
    const r = new cursor_js_1.ReadCursor(op), w = new cursor_js_1.WriteCursor;
    let hasEdits = !1;
    const heldPick = [], heldDoc = [], traversePick = (r, w, subDoc) => {
        const c = r.getComponent();
        let modified = !1;
        if (c) {
            null != c.d && w.write("d", c.d), void 0 !== c.i && w.write("i", c.i);
            const pickSlot = c.p;
            if (null != pickSlot && (heldPick[pickSlot] = r.clone(), assert(void 0 !== subDoc, "Operation picks up at an invalid key"), 
            heldDoc[pickSlot] = subDoc, w.write("p", c.p)), void 0 !== c.r && void 0 === subDoc) throw Error("Invalid doc / op in makeInvertible: removed item missing from doc");
            const t = getEditType(c);
            t && (t.makeInvertible ? hasEdits = !0 : writeEdit(w, t, getEdit(c), !0));
        }
        let listOff = 0;
        for (const key of r) {
            w.descend(key);
            const keyRaw = "number" == typeof key ? key - listOff : key, childIn = maybeGetChild(subDoc, keyRaw), childOut = traversePick(r, w, childIn);
            childIn !== childOut && (modified || (modified = !0, subDoc = shallowClone(subDoc)), 
            void 0 === childOut ? (subDoc = removeChild(subDoc, keyRaw), "number" == typeof key && listOff++) : subDoc[keyRaw] = childOut), 
            w.ascend();
        }
        return c && (void 0 !== c.r ? (w.write("r", deepClone_js_1.default(subDoc)), subDoc = void 0) : null != c.p && (subDoc = void 0)), 
        subDoc;
    };
    return traversePick(r, w, doc), w.get(), hasEdits && (w.reset(), function traverseDrop(rPick, rDrop, w, subDoc, isLiteral) {
        const c = rDrop.getComponent();
        if (c) {
            void 0 !== c.i ? (subDoc = c.i, isLiteral = !0) : null != c.d && (subDoc = heldDoc[c.d], 
            rPick = heldPick[c.d], isLiteral = !1, c.d);
            let t = getEditType(c);
            if (t && t.makeInvertible) {
                const edit = getEdit(c);
                writeEdit(w, t, t.makeInvertible(edit, subDoc), !0);
            }
        }
        let pickOff = 0, dropOff = 0;
        const ap = cursor_js_1.advancer(rPick, (k, c) => hasPick(c) ? pickOff - k - 1 : k - pickOff, (k, c) => {
            hasPick(c) && pickOff++;
        });
        for (const key of rDrop) if ("number" == typeof key) {
            const mid = key - dropOff, _rPick = ap(mid), raw = mid + pickOff, child = maybeGetChild(subDoc, isLiteral ? mid : raw);
            w.descend(key), traverseDrop(_rPick, rDrop, w, child, isLiteral), hasDrop(rDrop.getComponent()) && dropOff++, 
            w.ascend();
        } else {
            const child = maybeGetChild(subDoc, key);
            w.descend(key), traverseDrop(ap(key), rDrop, w, child, isLiteral), w.ascend();
        }
        ap.end();
    }(r.clone(), r, w, doc, !1)), w.get();
}

function invertWithDoc(op, doc) {
    return invert(makeInvertible(op, doc));
}

const LEFT = 0, RIGHT = 1, shallowCloneOp = op => {
    if (null == op) return null;
    const result = op.slice();
    for (let i = 0; i < op.length; i++) {
        const c = result[i];
        Array.isArray(c) && (result[i] = shallowCloneOp(c));
    }
    return result;
};

function tryTransform(op1, op2, direction) {
    assert("left" === direction || "right" === direction, "Direction must be left or right");
    const side = "left" === direction ? 0 : 1;
    if (log.quiet = !debugMode, log.prefix = 0, null == op2) return {
        ok: !0,
        result: op1
    };
    checkValidOp(op1), checkValidOp(op2);
    let conflict = null;
    const heldOp1PickByOp1 = [], heldOp1DropByOp1 = [], heldOp2PickByOp2 = [], heldOp2DropByOp2 = [], heldOp1PickByOp2 = [], heldOp2PickByOp1 = [], heldOp2DropByOp1 = [], heldOp2RmForOp1 = [], heldOp1RmForOp2 = [], cancelledOp2 = [], discardedOp2Drop = [], heldPickWrites = [], heldDropWrites = [], op1PickAtOp2Pick = [], op1PicksOp2DropSlots = [];
    let nextSlot = 0;
    const r1 = cursor_js_1.readCursor(op1), r2 = cursor_js_1.readCursor(op2), w = cursor_js_1.writeCursor();
    if (function scanOp2Pick(r2Pick, r1Pick = null, removed1) {
        const c1 = getComponent(r1Pick);
        c1 && (void 0 !== c1.r ? removed1 = r1Pick.clone() : null != c1.p && (removed1 = null, 
        heldOp2PickByOp1[c1.p] = r2Pick.clone()));
        const c2 = r2Pick.getComponent();
        let slot2;
        c2 && null != (slot2 = c2.p) && (heldOp1PickByOp2[slot2] = r1Pick ? r1Pick.clone() : null, 
        heldOp2PickByOp2[slot2] = r2Pick.clone(), removed1 && (cancelledOp2[slot2] = !0, 
        heldOp1RmForOp2[slot2] = removed1), c1 && null != c1.p && (op1PickAtOp2Pick[slot2] = c1.p));
        const ap1 = cursor_js_1.advancer(r1Pick);
        for (const key of r2Pick) scanOp2Pick(r2Pick, ap1(key), removed1);
        ap1.end();
    }(r2, r1, null), function scanOp2Drop(r1Pick, r2Pick, r2Drop, pickSlot1, removed1) {
        const c2d = r2Drop.getComponent();
        let slot2, droppedHere = !1;
        c2d && (null != (slot2 = c2d.d) ? (heldOp2DropByOp2[slot2] = r2Drop.clone(), null != pickSlot1 && (null == op1PicksOp2DropSlots[pickSlot1] && (op1PicksOp2DropSlots[pickSlot1] = []), 
        op1PicksOp2DropSlots[pickSlot1].push(slot2)), cancelledOp2[slot2], r1Pick = heldOp1PickByOp2[slot2] || null, 
        r2Pick = heldOp2PickByOp2[slot2] || null, cancelledOp2[slot2] ? (removed1 && (discardedOp2Drop[slot2] = !0), 
        removed1 = heldOp1RmForOp2[slot2] || null) : !removed1 || 1 !== side && null != op1PickAtOp2Pick[slot2] || null == conflict && (conflict = {
            type: types_js_1.ConflictType.RM_UNEXPECTED_CONTENT,
            op1: exports.removeOp(removed1.getPath()),
            op2: exports.moveOp(r2Pick.getPath(), r2Drop.getPath())
        }), droppedHere = !0) : void 0 !== c2d.i && (r1Pick = r2Pick = null, droppedHere = !0, 
        removed1 && null == conflict && (conflict = {
            type: types_js_1.ConflictType.RM_UNEXPECTED_CONTENT,
            op1: exports.removeOp(removed1.getPath()),
            op2: exports.insertOp(r2Drop.getPath(), c2d.i)
        })));
        const c1p = getComponent(r1Pick);
        c1p && (void 0 !== c1p.r ? removed1 = r1Pick.clone() : null != c1p.p && (c1p.p, 
        pickSlot1 = c1p.p, removed1 = null));
        const t2 = getEditType(c2d);
        t2 && removed1 && null == conflict && (conflict = {
            type: types_js_1.ConflictType.RM_UNEXPECTED_CONTENT,
            op1: exports.removeOp(removed1.getPath()),
            op2: exports.editOp(r2Drop.getPath(), t2, getEdit(c2d), !0)
        });
        let p2PickOff = 0, p2DropOff = 0;
        const ap2 = cursor_js_1.advancer(r2Pick, (k, c) => hasPick(c) ? p2PickOff - k - 1 : k - p2PickOff, (k, c) => {
            hasPick(c) && p2PickOff++;
        }), ap1 = cursor_js_1.advancer(r1Pick);
        for (const key of r2Drop) if ("number" == typeof key) {
            const p2Mid = key - p2DropOff, _p2Pick = ap2(p2Mid);
            p2DropOff += +scanOp2Drop(ap1(p2Mid + p2PickOff), _p2Pick, r2Drop, pickSlot1, removed1);
        } else {
            const _p2Pick = ap2(key);
            scanOp2Drop(ap1(key), _p2Pick, r2Drop, pickSlot1, removed1);
        }
        return ap2.end(), ap1.end(), droppedHere;
    }(r1, r2, r2.clone(), null, null), heldOp2DropByOp2.map(x => x && x.get()), conflict) return {
        ok: !1,
        conflict
    };
    discardedOp2Drop.map(x => !!x);
    const pickComponents = [];
    let cancelledRemoves = null;
    !function writeOp1Pick(r1Pick, r2Pick, r2Drop, w, removed2) {
        let iAmMoved = !1;
        const c2p = getComponent(r2Pick);
        if (hasPick(c2p)) {
            const slot2 = c2p.p;
            null != slot2 ? (r2Drop = heldOp2DropByOp2[slot2], w = heldPickWrites[slot2] = cursor_js_1.writeCursor(), 
            iAmMoved = !0, removed2 = null) : (r2Drop = null, removed2 = r2Pick.clone());
        } else hasDrop(getComponent(r2Drop)) && (r2Drop = null);
        const c1 = r1Pick.getComponent();
        if (c1) {
            const slot1 = c1.p;
            null != slot1 ? (removed2 && (heldOp2RmForOp1[slot1] = removed2), pickComponents[slot1] = removed2 || 1 === side && iAmMoved ? null : w.getComponent(), 
            heldOp1PickByOp1[slot1] = r1Pick.clone(), r2Drop && (heldOp2DropByOp1[slot1] = r2Drop.clone())) : void 0 !== c1.r && (removed2 || w.write("r", !0), 
            (removed2 || iAmMoved) && (null == cancelledRemoves && (cancelledRemoves = new Set), 
            cancelledRemoves.add(c1)));
        }
        let p2PickOff = 0, p2DropOff = 0;
        const ap2Pick = cursor_js_1.advancer(r2Pick, void 0, (k, c) => {
            hasPick(c) && p2PickOff++;
        }), ap2Drop = cursor_js_1.advancer(r2Drop, (k, c) => hasDrop(c) ? ~(k - p2DropOff) : k - p2DropOff, (k, c) => {
            hasDrop(c) && p2DropOff++;
        });
        if (r1Pick) for (const key of r1Pick) if ("string" == typeof key) {
            const p2Pick_ = ap2Pick(key), p2Drop_ = ap2Drop(key);
            w.descend(key), writeOp1Pick(r1Pick, p2Pick_, p2Drop_, w, removed2), w.ascend();
        } else {
            const p2Pick_ = ap2Pick(key), p2Mid = key - p2PickOff, p2Drop_ = hasPick(getComponent(p2Pick_)) ? null : ap2Drop(p2Mid), finalKey = p2Mid + p2DropOff;
            assert(finalKey >= 0), w.descend(finalKey), writeOp1Pick(r1Pick, p2Pick_, p2Drop_, w, removed2), 
            w.ascend();
        }
        ap2Pick.end(), ap2Drop.end();
    }(r1, r2, r2.clone(), w, null), w.reset();
    let outputSlotMap = [];
    if (function writeOp1Drop(p1Pick, p1Drop, p2Pick, p2Drop, w, removed2) {
        assert(p1Drop);
        const c1d = p1Drop.getComponent();
        let c2d = getComponent(p2Drop), droppedHere = !1;
        const insOrMv = (r1, r2, c) => r1 ? exports.moveOp(r1.getPath(), r2.getPath()) : exports.insertOp(r2.getPath(), c.i);
        if (hasDrop(c1d)) {
            const slot1 = c1d.d;
            null != slot1 && (heldOp1DropByOp1[slot1] = p1Drop.clone());
            const pc = null != slot1 ? pickComponents[slot1] : null;
            let identical = !1;
            if (void 0 !== c1d.i || null != slot1 && pc) {
                let slot2;
                c2d && (void 0 !== c2d.i || null != (slot2 = c2d.d) && !cancelledOp2[slot2]) && (identical = null != slot2 ? null != slot1 && slot1 === op1PickAtOp2Pick[slot2] : deepEqual_js_1.default(c2d.i, c1d.i), 
                identical || null != slot2 && 1 !== side && null != op1PickAtOp2Pick[slot2] || null == conflict && (conflict = {
                    type: types_js_1.ConflictType.DROP_COLLISION,
                    op1: insOrMv(null != slot1 ? heldOp1PickByOp1[slot1] : null, p1Drop, c1d),
                    op2: insOrMv(null != slot2 ? heldOp2PickByOp2[slot2] : null, p2Drop, c2d)
                })), identical || (removed2 ? null == conflict && (conflict = {
                    type: types_js_1.ConflictType.RM_UNEXPECTED_CONTENT,
                    op1: insOrMv(null != slot1 ? heldOp1PickByOp1[slot1] : null, p1Drop, c1d),
                    op2: exports.removeOp(removed2.getPath())
                }) : (null != slot1 ? (outputSlotMap[nextSlot] = slot1, w.write("d", pc.p = nextSlot++)) : w.write("i", deepClone_js_1.default(c1d.i)), 
                droppedHere = !0));
            } else if (null != slot1 && !pc) {
                const h = heldOp2RmForOp1[slot1];
                h && (removed2 = h.clone());
            }
            null != slot1 ? (p1Pick = heldOp1PickByOp1[slot1], p2Pick = heldOp2PickByOp1[slot1], 
            p2Drop = heldOp2DropByOp1[slot1]) : void 0 !== c1d.i && (p1Pick = p2Pick = null, 
            identical || (p2Drop = null));
        } else hasPick(getComponent(p1Pick)) && (p1Pick = p2Pick = p2Drop = null);
        const c1p = getComponent(p1Pick), c2p = getComponent(p2Pick);
        if (hasPick(c2p)) {
            const slot2 = c2p.p;
            void 0 !== c2p.r && (!c1p || void 0 === c1p.r) || cancelledOp2[slot2] ? (p2Drop = null, 
            removed2 = p2Pick.clone()) : null != slot2 && (p2Drop = heldOp2DropByOp2[slot2], 
            1 !== side && null != op1PickAtOp2Pick[slot2] || ((w = heldDropWrites[slot2]) || (w = heldDropWrites[slot2] = cursor_js_1.writeCursor()), 
            w.reset(), removed2 = null));
        } else !hasDrop(c1d) && hasDrop(c2d) && (p2Drop = null);
        c2d = null != p2Drop ? p2Drop.getComponent() : null;
        const t1 = getEditType(c1d);
        if (t1) {
            const e1 = getEdit(c1d);
            if (removed2) null == conflict && (conflict = {
                type: types_js_1.ConflictType.RM_UNEXPECTED_CONTENT,
                op1: exports.editOp(p1Drop.getPath(), t1, e1, !0),
                op2: exports.removeOp(removed2.getPath())
            }); else {
                const t2 = getEditType(c2d);
                let e;
                if (t2) {
                    if (t1 !== t2) throw Error("Transforming incompatible types");
                    const e2 = getEdit(c2d);
                    e = t1.transform(e1, e2, direction);
                } else e = deepClone_js_1.default(e1);
                writeEdit(w, t1, e);
            }
        }
        let p1PickOff = 0, p1DropOff = 0, p2PickOff = 0, p2DropOff = 0, outPickOff = 0, outDropOff = 0, p1pValid = null != p1Pick && p1Pick.descendFirst(), p1pDidDescend = p1pValid;
        const ap2p = cursor_js_1.advancer(p2Pick, void 0, (k, c) => {
            hasPick(c) && p2PickOff++;
        });
        let p2dValid = null != p2Drop && p2Drop.descendFirst(), p2dDidDescend = p2dValid;
        for (const key of p1Drop) if ("number" == typeof key) {
            let _p1Pick;
            const hd1 = hasDrop(p1Drop.getComponent()), k1Mid = key - p1DropOff;
            {
                let p1k;
                for (;p1pValid && "number" == typeof (p1k = p1Pick.getKey()); ) {
                    p1k += p1PickOff;
                    const c = p1Pick.getComponent(), hp = hasPick(c);
                    if (p1k > k1Mid || p1k === k1Mid && (!hp || 0 === side && hd1)) break;
                    if (hp) {
                        p1PickOff--;
                        const slot1 = c.p;
                        pickComponents[slot1], op1PickAtOp2Pick.includes(slot1), c.d, getComponent(heldDropWrites[c.d]), 
                        hasPick(getComponent(heldDropWrites[c.d])), (void 0 === c.r || cancelledRemoves && cancelledRemoves.has(c)) && (null == slot1 || !pickComponents[slot1] || 1 !== side && op1PickAtOp2Pick.includes(slot1)) || outPickOff--;
                    }
                    p1pValid = p1Pick.nextSibling();
                }
                _p1Pick = p1pValid && p1k === k1Mid ? p1Pick : null;
            }
            const raw = k1Mid - p1PickOff;
            let _p2Pick = ap2p(raw);
            const k2Mid = raw - p2PickOff;
            let _p2Drop = null;
            {
                let p2dk, op2Mid;
                for (;p2dValid && "number" == typeof (p2dk = p2Drop.getKey()); ) {
                    op2Mid = p2dk - p2DropOff;
                    const c = p2Drop.getComponent(), hd2 = hasDrop(c);
                    if (op2Mid > k2Mid) break;
                    if (op2Mid === k2Mid) {
                        if (!hd2) {
                            _p2Drop = p2Drop;
                            break;
                        }
                        {
                            if (0 === side && hd1) {
                                _p2Drop = p2Drop;
                                break;
                            }
                            const hp2 = _p2Pick && hasPick(_p2Pick.getComponent());
                            if (0 === side && hp2) break;
                        }
                    }
                    if (hd2) {
                        const slot2 = c.d;
                        cancelledOp2[slot2], op1PickAtOp2Pick[slot2], void 0 === c.i && (cancelledOp2[slot2] || null != op1PickAtOp2Pick[slot2] && 1 !== side) ? (cancelledOp2[slot2] || null != op1PickAtOp2Pick[slot2] && 0 === side) && (p2DropOff++, 
                        outDropOff--) : p2DropOff++;
                    }
                    p2dValid = p2Drop.nextSibling();
                }
            }
            const descend = k2Mid + p2DropOff + outPickOff + outDropOff;
            assert(descend >= 0, "trying to descend to a negative index"), w.descend(descend), 
            hd1 && (_p1Pick = _p2Pick = _p2Drop = null, p1DropOff++), writeOp1Drop(_p1Pick, p1Drop, _p2Pick, _p2Drop, w, removed2) && outDropOff++, 
            w.ascend();
        } else {
            let p1k;
            for (;p1pValid && (p1k = p1Pick.getKey(), "string" != typeof p1k || !(p1k > key || p1k === key)); ) p1pValid = p1Pick.nextSibling();
            const _p1Pick = p1pValid && p1k === key ? p1Pick : null, _p2Pick = ap2p(key);
            let p2dk;
            for (;p2dValid && (p2dk = p2Drop.getKey(), "string" != typeof p2dk || !(p2dk > key || p2dk === key)); ) p2dValid = p2Drop.nextSibling();
            const _p2Drop = p2dValid && p2dk === key ? p2Drop : null;
            w.descend(key), writeOp1Drop(_p1Pick, p1Drop, _p2Pick, _p2Drop, w, removed2), w.ascend();
        }
        return ap2p.end(), p1pDidDescend && p1Pick.ascend(), p2dDidDescend && p2Drop.ascend(), 
        droppedHere;
    }(r1, r1.clone(), r2, r2.clone(), w, null), conflict) return {
        ok: !1,
        conflict
    };
    w.reset();
    const eachDrop = (r, w, fn) => r.traverse(w, (c, w) => {
        null != c.d && fn(c.d, r, w);
    });
    (cancelledOp2.length || heldPickWrites.length) && (eachDrop(r2, w, (slot2, r, w) => {
        cancelledOp2[slot2] && !discardedOp2Drop[slot2] && w.write("r", !0), heldPickWrites[slot2] && w.mergeTree(heldPickWrites[slot2].get());
    }), w.reset());
    const heldOutDropRead = [], heldOutDropWrites = [];
    if ((heldDropWrites.length || cancelledOp2.length) && !conflict) {
        const rOut = cursor_js_1.readCursor(shallowCloneOp(w.get()));
        if (eachDrop(rOut, null, (slotOut, r) => {
            heldOutDropRead[slotOut] = r.clone();
        }), heldDropWrites.forEach(hdw => {
            hdw && eachDrop(cursor_js_1.readCursor(hdw.get()), null, (slotOut, r) => {
                heldOutDropRead[slotOut] = r.clone();
            });
        }), function writeHeldOp2Drop(p2Drop, outPick, outDrop, w, parentC, removedOut) {
            log.prefix++;
            const coutp = getComponent(outPick);
            if (coutp && hasPick(coutp)) if (null != coutp.p) {
                parentC = coutp;
                const slot = coutp.p;
                heldOutDropRead[slot].getPath(), outDrop = heldOutDropRead[slot], w = heldOutDropWrites[slot] = cursor_js_1.writeCursor();
            } else void 0 !== coutp.r && (outDrop = null, removedOut = !0); else hasDrop(getComponent(outDrop)) && (outDrop = null);
            const c2 = p2Drop.getComponent();
            if (c2) {
                let slot2;
                if (null != (slot2 = c2.d)) {
                    const _w = heldDropWrites[slot2];
                    _w && (_w.get(), w.mergeTree(_w.get()), outDrop = cursor_js_1.readCursor(_w.get()));
                }
            }
            let outPickOff = 0, outDropOff = 0;
            const oPickAdv = cursor_js_1.advancer(outPick, void 0, (k, c) => {
                hasPick(c) && outPickOff--;
            }), oDropAdv = cursor_js_1.advancer(outDrop, (k, c) => hasDrop(c) ? -(k - outDropOff) - 1 : k - outDropOff, (k, c) => {
                hasDrop(c) && outDropOff++;
            });
            for (const o2dk of p2Drop) if ("number" == typeof o2dk) {
                const _outPick = oPickAdv(o2dk), rmid = o2dk + outPickOff, _outDrop = oDropAdv(rmid), rfinal = rmid + outDropOff;
                w.descend(rfinal), writeHeldOp2Drop(p2Drop, _outPick, _outDrop, w, parentC, removedOut), 
                w.ascend();
            } else w.descend(o2dk), writeHeldOp2Drop(p2Drop, oPickAdv(o2dk), oDropAdv(o2dk), w, parentC, removedOut), 
            w.ascend();
            oPickAdv.end(), oDropAdv.end();
        }(r2, rOut, rOut.clone(), w, null, !1), w.reset(), conflict) return {
            ok: !1,
            conflict
        };
        if (w.get(), heldOutDropWrites.length) {
            const heldOutDropContent = heldOutDropWrites.map(w => w ? w.get() : null), rOut2 = cursor_js_1.readCursor(shallowCloneOp(w.get()));
            if (eachDrop(rOut2, w, (slotOut, r, w) => {
                const data = heldOutDropContent[slotOut];
                data && (w.mergeTree(data), heldOutDropContent[slotOut] = null);
            }), heldOutDropContent.find(x => x)) {
                const w1 = cursor_js_1.writeCursor(), w2 = cursor_js_1.writeCursor();
                let nextSlot1 = 0, nextSlot2 = 0;
                heldOutDropContent.forEach(data => {
                    null != data && eachDrop(cursor_js_1.readCursor(data), null, c => {
                        const slot1 = outputSlotMap[c];
                        w1.writeMove(heldOp1PickByOp1[slot1].getPath(), heldOp1DropByOp1[slot1].getPath(), nextSlot1++);
                        const slot2s = op1PicksOp2DropSlots[slot1];
                        slot2s && slot2s.forEach(slot2 => {
                            cancelledOp2[slot2] || 1 !== side && null != op1PickAtOp2Pick[slot2] || w2.writeMove(heldOp2PickByOp2[slot2].getPath(), heldOp2DropByOp2[slot2].getPath(), nextSlot2++);
                        });
                    });
                }), conflict = {
                    type: types_js_1.ConflictType.BLACKHOLE,
                    op1: w1.get(),
                    op2: w2.get()
                };
            }
        }
    }
    if (conflict) return {
        ok: !1,
        conflict
    };
    return {
        ok: !0,
        result: w.get()
    };
}

const throwConflictErr = conflict => {
    const err = new Error("Transform detected write conflict");
    throw err.conflict = conflict, err.type = err.name = "writeConflict", err;
};

function transform(op1, op2, side) {
    const res = tryTransform(op1, op2, side);
    if (res.ok) return res.result;
    throwConflictErr(res.conflict);
}

const opThatRemovesDE = op => {
    const w = cursor_js_1.writeCursor();
    return cursor_js_1.readCursor(op).traverse(w, (c, w) => {
        (hasDrop(c) || getEditType(c)) && w.write("r", !0);
    }), w.get();
}, resolveConflict = (conflict, side) => {
    const {type, op1, op2} = conflict;
    switch (type) {
      case types_js_1.ConflictType.DROP_COLLISION:
        return "left" === side ? [ null, opThatRemovesDE(op2) ] : [ opThatRemovesDE(op1), null ];

      case types_js_1.ConflictType.RM_UNEXPECTED_CONTENT:
        let op1HasRemove = !1;
        return cursor_js_1.readCursor(op1).traverse(null, c => {
            void 0 !== c.r && (op1HasRemove = !0);
        }), op1HasRemove ? [ null, opThatRemovesDE(op2) ] : [ opThatRemovesDE(op1), null ];

      case types_js_1.ConflictType.BLACKHOLE:
        return [ opThatRemovesDE(op1), opThatRemovesDE(op2) ];

      default:
        throw Error("Unrecognised conflict: " + type);
    }
}, invConflict = ({type, op1, op2}) => ({
    type,
    op1: op2,
    op2: op1
}), normalizeConflict = ({type, op1, op2}) => ({
    type,
    op1: normalize(op1),
    op2: normalize(op2)
});

function transformWithConflictsPred(allowConflict, op1, op2, side) {
    let r2Aggregate = null;
    for (;;) {
        const res = tryTransform(op1, op2, side);
        if (res.ok) return compose(r2Aggregate, res.result);
        {
            const {conflict} = res;
            allowConflict(conflict) || throwConflictErr(conflict);
            const [r1, r2] = resolveConflict(conflict, side);
            op1 = compose(normalize(op1), r1), op2 = compose(normalize(op2), r2), r2Aggregate = compose(r2Aggregate, r2);
        }
    }
}