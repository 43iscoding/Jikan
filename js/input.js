(function() {

    var DEBUG = false;

    var pressed = {};
    var lastPressed = null;
    var onPressedCallback = null;

    function preventDefault(e) {
        if (e.which == input.keys.BACKSPACE.code ||
            e.which == input.keys.TAB.code ||
            e.which == input.keys.F1.code) {
            e.preventDefault();
        }
    }

    document.addEventListener("keydown", function (e) {
        setKey(e.which, true);

        preventDefault(e);
    });
    document.addEventListener("keyup", function (e) {
        setKey(e.which, false);
    });

    function setKey(keyCode, state) {
        var key = fromKeycode(keyCode);

        if (pressed[key] != state && DEBUG) {
            console.log((state ? "Key down: " : "Key up: ") + key);
        }

        if (state) {
            if (!pressed[key] && onPressedCallback != null) {
                onPressedCallback(key);
            }
            lastPressed = key;
        }

        pressed[key] = state;
    }

    function isPressed(key) {
        return pressed[key];
    }

    function clearInput(key) {
        if (key) {
            pressed[key] = false;
        } else {
            pressed = {};
        }
        lastPressed = null;
    }

    function fromKeycode(code) {
        for (var key in input.keys) {
            if (!input.keys.hasOwnProperty(key)) continue;
            if (input.keys[key].code == code) return input.keys[key].key;
        }
        console.log("Unknown key-code: " + code);
        return 'UNKNOWN';
    }

    function toKeycode(name) {
        for (var key in input.keys) {
            if (!input.keys.hasOwnProperty(key)) continue;
            if (input.keys[key].key == name) return input.keys[key].code;
        }
        console.log("Unknown key: " + name);
        return -1;
    }

    window.input = {
        isPressed: isPressed,
        clearInput: clearInput,
        lastPressed: function() {
            return lastPressed;
        },
        onPressed: function(callback) {
            onPressedCallback = callback;
        },
        isAlpha: function(key) {
            var keycode = toKeycode(key);
            return keycode >= 65 && keycode <= 90;
        },
        isNumeric: function(key) {
            var keycode = toKeycode(key);
            return keycode >= 48 && keycode <= 57;
        },
        isAlphaNumeric: function(key) {
            return input.isAlpha(key) || input.isNumeric(key);
        },
        keys: {
            BACKSPACE: {key: 'BACKSPACE', code: 8}, TAB: {key: 'TAB', code: 9}, ENTER: {key: 'ENTER', code: 13}, SHIFT: {key: 'SHIFT', code: 16},
            CTRL: {key: 'CTRL', code: 17}, ALT: {key: 'ALT', code: 18}, HOME: {key: 'HOME', code: 36}, END: {key: 'END', code: 35},
            INSERT: {key: 'INSERT', code: 45}, DELETE: {key: 'DELETE', code: 46}, PAGE_UP: {key: 'PAGE_UP', code: 33}, PAGE_DOWN: {key: 'PAGE_DOWN', code: 34},
            CAPSLOCK: {key: 'CAPSLOCK', code: 20}, SPACE: {key: 'SPACE', code: 32},

            LEFT: {key: 'LEFT', code: 37}, UP: {key: 'UP', code: 38}, RIGHT: {key: 'RIGHT', code: 39}, DOWN: {key: 'DOWN', code: 40},

            A: {key: 'A', code: 65}, H: {key: 'H', code: 72}, O: {key: 'O', code: 79}, V: {key: 'V', code: 86},
            B: {key: 'B', code: 66}, I: {key: 'I', code: 73}, P: {key: 'P', code: 80}, W: {key: 'W', code: 87},
            C: {key: 'C', code: 67}, J: {key: 'J', code: 74}, Q: {key: 'Q', code: 81}, X: {key: 'X', code: 88},
            D: {key: 'D', code: 68}, K: {key: 'K', code: 75}, R: {key: 'R', code: 82}, Y: {key: 'Y', code: 89},
            E: {key: 'E', code: 69}, L: {key: 'L', code: 76}, S: {key: 'S', code: 83}, Z: {key: 'Z', code: 90},
            F: {key: 'F', code: 70}, M: {key: 'M', code: 77}, T: {key: 'T', code: 84},
            G: {key: 'G', code: 71}, N: {key: 'N', code: 78}, U: {key: 'U', code: 85},

            1: {key: '1', code: 49}, 6: {key: '6', code: 54},
            2: {key: '2', code: 50}, 7: {key: '7', code: 55},
            3: {key: '3', code: 51}, 8: {key: '8', code: 56},
            4: {key: '4', code: 52}, 9: {key: '9', code: 57},
            5: {key: '5', code: 53}, 0: {key: '0', code: 48},

            TILDE: {key: '~', code: 192},

            LEFT_BRACKET: {key: '[', code: 219}, RIGHT_BRACKET: {key: ']', code: 221},

            NUM1: {key: 'NUM1', code: 97}, NUM6: {key: 'NUM6', code: 102},
            NUM2: {key: 'NUM2', code: 98}, NUM7: {key: 'NUM7', code: 103},
            NUM3: {key: 'NUM3', code: 99}, NUM8: {key: 'NUM8', code: 104},
            NUM4: {key: 'NUM4', code: 100}, NUM9: {key: 'NUM9', code: 105},
            NUM5: {key: 'NUM5', code: 101}, NUM0: {key: 'NUM0', code: 96},

            PLUS: {key: 'PLUS', code: 107}, MINUS: {key: 'MINUS', code: 109},
            MULTIPLY: {key: 'MULTIPLY', code: 106}, DIVIDE: {key: 'DIVIDE', code: 111},

            F1: {key: 'F1', code: 112}, F2: {key: 'F2', code: 113}, F3: {key: 'F3', code: 114}, F4: {key: 'F4', code: 115},
            F5: {key: 'F5', code: 116}, F6: {key: 'F6', code: 117}, F7: {key: 'F7', code: 118}, F8: {key: 'F8', code: 119},
            F9: {key: 'F9', code: 120}, F10: {key: 'F10', code: 121}, F11: {key: 'F11', code: 122}, F12: {key: 'F12', code: 123}
        }
    };
}());