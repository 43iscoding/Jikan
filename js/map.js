(function() {
    window.parseMap = parseMap;
    var TILE = {
        EMPTY : '.',
        PLAYER : 'P',
        GROUND : '-',
        WATER : '#',
        SUNFLOWER : 'T',
        BEAR : 'B',
        FINISH : 'F',
        SPIKE : '^',
        COIN : 'c'
    };

    var LEVEL_0 = "10W8H" +
        ".........." +
        ".........." +
        ".........." +
        ".........." +
        "P........F" +
        "----------" +
        "----------" +
        "----------";

    var LEVEL_1 = "10W8H" +
        ".........." +
        ".........." +
        ".........." +
        "P..B.....F" +
        "----------" +
        "----------" +
        "----------" +
        "----------";

    var LEVEL_2 = "10W8H" +
        ".........." +
        ".........." +
        ".........." +
        "P........F" +
        "----..----" +
        "----^^----" +
        "----------" +
        "----------";

    var LEVEL_3 = "10W8H" +
        ".........." +
        ".........." +
        ".........." +
        "P........F" +
        "--######--" +
        "--######--" +
        "--######--" +
        "--######--";

    var LEVEL_4 = "10W8H" +
        ".........." +
        ".........." +
        ".........." +
        "P........F" +
        "--.....---" +
        "--.....---" +
        "--^^^^^---" +
        "----------";

    var LEVEL_5 = "10W8H" +
        ".........." +
        ".........." +
        ".P........" +
        ".T.....B.F" +
        "---....---" +
        "---####---" +
        "---####---" +
        "---####---";

    var LEVEL_6 = "10W8H" +
        "..c....F.." +
        "..-....-.." +
        "..-....-.." +
        "..-....-.T" +
        "..-..-.-.-" +
        "..-..-.-.-" +
        "P.T.T-TTT-" +
        "----------";

    var END = "10W8H" +
        ".........." +
        "---.-.-..-" +
        "-...-.--.-" +
        "---.-.-.--" +
        "-...-.-..-" +
        "-...-.-..-" +
        ".....P...." +
        "----------";

    var currentLevel = 0;

    window.MAPS = [LEVEL_0, LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6, END];

    window.getCurrentLevel = function() {
        return currentLevel;
    };

    window.nextLevel = function() {
        currentLevel = ++currentLevel % MAPS.length;
    };

    window.previousLevel = function() {
        if (--currentLevel < 0) currentLevel = MAPS.length - 1;
    };

    window.getMap = function() {
        return MAPS[getCurrentLevel()];
    };

    function parseMap(mapInfo) {
        this.get = function(x, y) {
            if (x < 0 || y < 0 || x >= width || y >= height) return '.';

            var index = y * width + x % width + offset;
            if (index < offset || index >= width * height + offset) return '.';

            return mapInfo[index];
        };

        this.putTile = function(x, y, type, mode) {
            var object = spawn(type, x * TILE_SIZE, y * TILE_SIZE, mode);
            map.push(object);
            if (type == TYPE.PLAYER) {
                window.player = object;
            }
        };

        this.parseTile = function(x, y, tile) {
            var type = null;
            var mode = null;
            switch (tile) {
                case TILE.EMPTY: return; //empty tile
                case TILE.PLAYER: type = TYPE.PLAYER; break;
                case TILE.FINISH: type = TYPE.FINISH; break;
                case TILE.SPIKE: type = TYPE.SPIKE; break;
                case TILE.COIN: type = TYPE.COIN; break;
                case TILE.GROUND: {
                    type = TYPE.GROUND;
                    if (this.get(x, y - 1) == TILE.GROUND) {
                        mode = 3;
                    } else {
                        var left = this.get(x - 1, y);
                        var right = this.get(x + 1, y);
                        if (left == TILE.EMPTY && right == TILE.GROUND) {
                            mode = 1;
                        } else if (right == TILE.EMPTY && left == TILE.GROUND) {
                            mode = 2;
                        } else {
                            mode = 0;
                        }
                    }
                    break;
                }
                case TILE.WATER: {
                    type = TYPE.WATER;
                    if (this.get(x, y - 1) == TILE.WATER) {
                        mode = 0;
                    } else {
                        mode = 1;
                    }
                    break;
                }
                case TILE.SUNFLOWER: type = TYPE.SUNFLOWER; break;
                case TILE.BEAR: type = TYPE.BEAR; break;
                default : console.log('Unknown tile: ' + tile);
            }
            this.putTile(x, y, type, mode);
        };

        var map = [];

        var width = mapInfo.substring(0,mapInfo.indexOf('W'));
        var height = mapInfo.substring(mapInfo.indexOf('W') + 1, mapInfo.indexOf('H'));
        var offset = mapInfo.indexOf('H') + 1;
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                this.parseTile(x, y, this.get(x, y));
            }
        }

        return map;


    }
}());