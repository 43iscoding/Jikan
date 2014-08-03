/****************************************************************************
    Every possible state of entities, which defines behaviour and sprite.
 ***************************************************************************/

window.STATE = {
    IDLE : 'IDLE',
    WALK_RIGHT : 'WALK_RIGHT',
    WALK_LEFT : 'WALK_LEFT',
    FALL : 'FALL',
    JUMP : 'JUMP',
    JUMP_RIGHT : 'JUMP_RIGHT',
    JUMP_LEFT : 'JUMP_LEFT',
    FALL_RIGHT : 'FALL_RIGHT',
    FALL_LEFT : 'FALL_LEFT',
    DEAD : 'DEAD',
    IDLE_RIGHT : 'IDLE_RIGHT',
    IDLE_LEFT : 'IDLE_LEFT',
    FROZEN : 'FROZEN',
    WITHERED : 'WITHERED',
    SLEEPING : 'SLEEPING'
};

window.TYPE = {
    DUMMY : 'DUMMY',
    PLAYER : 'PLAYER',
    BLOCK : 'BLOCK',
    WATER : 'WATER',
    ICE : 'ICE',
    GROUND : 'GROUND',
    SUNFLOWER : 'SUNFLOWER',
    BEAR : 'BEAR'
};

/*****************************************
    Entity class. Every object in game.
 ****************************************/

function Entity(x, y, width, height, type, sprite, args) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this._type = type;
    this.dead = false;
    if (sprite != null && sprite != undefined) {
        this.sprite = new Sprite(res.get(sprite['name']), sprite['pos'], [width, height],
        //frames is array of image per state
        sprite['frames'] == undefined ? [] : sprite['frames'],
        sprite['speed'] == undefined ? 0 : sprite['speed'],
        sprite['once'] == undefined ? false : sprite['once']);
    } else if (type != TYPE.DUMMY) {
        console.log('Warning - no sprite info for ' + type);
    }
    //physics
    this.static = args == undefined ? false : (args['static'] == undefined ? false : args['static']);
    this.xSpeed = args == undefined ? 0 : (args['xSpeed'] == undefined ? 0 : args['xSpeed']);
    this.ySpeed = args == undefined ? 0 : (args['ySpeed'] == undefined ? 0 : args['ySpeed']);
    this.velocity = args == undefined ? 0 : (args['velocity'] == undefined ? 0 : args['velocity']);
    this.jumpSpeed = args == undefined ? 0 : (args['jump'] == undefined ? 0 : args['jump']);
    //season interaction
    this.processedSeason = DEFAULT_SEASON;
}

Entity.prototype = {
    get type() {
        return this._type;
    },
    act : function() {},
    updateSprite : function() {
        this.sprite.update(this.getState());
    },
    die : function() {
        this.dead = true;
    },
    isPlatform : function() {
        return false;
    },
    isBouncy : function() {
        return false;
    },
    isFatal : function() {
        return false;
    },
    getState : function() {
        if (this.dead) return STATE.DEAD;

        if (this.xSpeed > 0) {
            if (this.ySpeed < 0) {
                return STATE.JUMP_RIGHT;
            } else if (this.ySpeed > 0) {
                return STATE.FALL_RIGHT;
            } else return STATE.WALK_RIGHT;
        } else if (this.xSpeed < 0) {
            if (this.ySpeed < 0) {
                return STATE.JUMP_LEFT;
            } else if (this.ySpeed > 0) {
                return STATE.FALL_LEFT;
            } else return STATE.WALK_LEFT;
        } else {
            if (this.ySpeed < 0) {
                return STATE.JUMP;
            } else if (this.ySpeed > 0) {
                return STATE.FALL;
            } else return STATE.IDLE;
        }
    },
    render : function(context) {
        context.save();
        context.translate(this.x, this.y);
        this.sprite.render(context);
        context.restore();
    },
    moveRight : function(ratio) {
        this.xSpeed = Math.min(this.xSpeed + this.velocity * ratio, this.velocity);
    },
    moveLeft : function(ratio) {
        this.xSpeed = Math.max(this.xSpeed - this.velocity * ratio, -this.velocity);
    },
    jump : function() {
        this.ySpeed = -this.jumpSpeed;
    },
    applyFriction : function(friction) {
        if (this.xSpeed > 0) {
            this.xSpeed = Math.max(this.xSpeed - friction, 0);
        } else if (this.xSpeed < 0) {
            this.xSpeed = Math.min(this.xSpeed + friction, 0);
        }
    },
    applyGravity : function(gravity) {
        this.ySpeed = Math.min(this.ySpeed + gravity, FREE_FALL);
    },
    processSeason : function(season) {
        if (this.processedSeason == season) return;
        var result = false;
        switch (season) {
            case SEASON.SPRING: result = this.processSpring(); break;
            case SEASON.SUMMER: result = this.processSummer(); break;
            case SEASON.AUTUMN: result = this.processAutumn(); break;
            case SEASON.WINTER: result = this.processWinter(); break;
            default : console.log("Unknown season: " + season);
        }
        if (result) this.processedSeason = season;
    },
    processSpring: function () { return true; },
    processSummer: function () { return true; },
    processAutumn: function () { return true; },
    processWinter: function () { return true; }
};

/****************************************************
                    Dummy cell object.
 ****************************************************/

window.DUMMY_CELL = new Entity(0,0,0,0, TYPE.DUMMY);

/****************************************************
                    Player object.
 ****************************************************/
function Player(x, y) {
    var args = { velocity : 2, jump : 3.5 };
    var frames = [];
    frames[STATE.IDLE] = [0];
    frames[STATE.WALK_RIGHT] = [1];
    frames[STATE.WALK_LEFT] = [2];
    frames[STATE.FALL] = [3];
    frames[STATE.JUMP] = [4];
    frames[STATE.JUMP_RIGHT] = [5];
    frames[STATE.JUMP_LEFT] = [6];
    frames[STATE.FALL_RIGHT] = [7];
    frames[STATE.FALL_LEFT] = [8];
    frames[STATE.DEAD] = [9];
    Entity.call(this, x, y, 22, 22, TYPE.PLAYER, {name : 'player', pos : [0,0], frames: frames, speed: 2}, args);
}
Player.prototype = Object.create(Entity.prototype);

/***************************************************
    Generic block object. Not affected by physics.
 ***************************************************/

function Block(x, y, type, sprite) {
    var args = { static : true };
    Entity.call(this, x, y, TILE_SIZE, TILE_SIZE, type, sprite, args);
}
Block.prototype = Object.create(Entity.prototype);
Block.prototype.isPlatform = function() {
    return true;
};

/****************************************************
                    Ground object.
 ****************************************************/
function Ground(x, y, style) {
    if (style == undefined || style < 0 || style > 3) {
        style = 0;
    }
    var frames = [];
    frames[STATE.IDLE] = 0;
    Block.call(this, x, y, TYPE.GROUND, { name : "tiles", pos : [TILE_SIZE * style, 0], frames: frames, speed: 0});
}
Ground.prototype = Object.create(Block.prototype);

/****************************************************
                    Water/Ice object.
 ****************************************************/

function Water(x, y, style) {
    if (style == undefined || style < 0 || style > 1) {
        style = 0;
    }
    var frames = [];
    frames[STATE.FROZEN] = [5];

    if (style == 0) {
        frames[STATE.IDLE] = [0];
    } else {
        frames[STATE.IDLE] = [1,2,3,4];
    }
    Block.call(this, x, y, TYPE.WATER, { name : "tiles", pos : [0, TILE_SIZE], frames: frames, speed: 2});
}
Water.prototype = Object.create(Block.prototype);
Water.prototype.getState = function() {
    return this.frozen ? STATE.FROZEN : STATE.IDLE;
};
Water.prototype.isFatal = function() {
    return !this.frozen;
};
Water.prototype.__defineGetter__('type', function() {
    return this.frozen ? TYPE.ICE : TYPE.WATER;
});
Water.prototype.processSpring = function() {
    this.frozen = false; return true;
};
Water.prototype.processSummer = function() {
    this.frozen = false; return true;
};
Water.prototype.processWinter = function() {
    this.frozen = true; return true;
};

/****************************************************
                    Sunflower object.
 ****************************************************/

function Sunflower(x,y) {
    var frames = [];
    frames[STATE.IDLE] = [0];
    frames[STATE.WITHERED] = [1];
    Block.call(this, x, y, TYPE.SUNFLOWER, {name : 'tiles', pos: [0, TILE_SIZE * 2], frames: frames, speed : 2});
}
Sunflower.prototype = Object.create(Block.prototype);
Sunflower.prototype.isPlatform = function() {
    return !this.wither;
};
Sunflower.prototype.getState = function() {
    return this.wither ? STATE.WITHERED : STATE.IDLE;
};
Sunflower.prototype.processSpring = function() {
    this.wither = false; return true;
};
Sunflower.prototype.processSummer = function() {
    this.wither = false; return true;
};
Sunflower.prototype.processWinter = function() {
    this.wither = true; return true;
};

/****************************************************
                    Bear object.
 ****************************************************/

function Bear(x, y) {
    var args = { velocity : 1};
    var frames = [];
    frames[STATE.IDLE] = [0];
    frames[STATE.WALK_RIGHT] = [1];
    frames[STATE.WALK_LEFT] = [2];
    frames[STATE.JUMP] = [4];
    frames[STATE.JUMP_RIGHT] = [5];
    frames[STATE.JUMP_LEFT] = [6];
    frames[STATE.FALL] = [3];
    frames[STATE.FALL_RIGHT] = [7];
    frames[STATE.FALL_LEFT] = [8];
    frames[STATE.SLEEPING] = [9];
    this.switchDirection = 70;
    this.actIndex = -1;
    //TODO: Bear spritesheet
    Entity.call(this, x, y, 22, 22, TYPE.BEAR, {name : 'player', pos : [0,0], frames: frames, speed: 2}, args);
}
Bear.prototype = Object.create(Entity.prototype);
Bear.prototype.getState = function() {
    if (this.sleeping) return STATE.SLEEPING;
    if (this.xSpeed > 0) {
        if (this.ySpeed < 0) {
            return STATE.JUMP_RIGHT;
        } else if (this.ySpeed > 0) {
            return STATE.FALL_RIGHT;
        } else return STATE.WALK_RIGHT;
    } else if (this.xSpeed < 0) {
        if (this.ySpeed < 0) {
            return STATE.JUMP_LEFT;
        } else if (this.ySpeed > 0) {
            return STATE.FALL_LEFT;
        } else return STATE.WALK_LEFT;
    } else {
        if (this.ySpeed < 0) {
            return STATE.JUMP;
        } else if (this.ySpeed > 0) {
            return STATE.FALL;
        } else return STATE.IDLE;
    }
};
Bear.prototype.act = function() {
    if (this.sleeping) return;
    this.actIndex++;
    if (this.actIndex < this.switchDirection) {
        this.moveRight(1);
    } else if (this.actIndex < this.switchDirection * 2) {
        //wait
    } else if (this.actIndex < this.switchDirection * 3) {
        this.moveLeft(1);
    } else if (this.actIndex < this.switchDirection * 4) {
        //wait
    } else {
        //reset
        this.actIndex = -1;
    }
};
Bear.prototype.isPlatform = function() {
    return true;
};
Bear.prototype.isBouncy = function() {
    return this.sleeping;
};
Bear.prototype.isFatal = function() {
    return !this.sleeping;
};
Bear.prototype.processSpring = function() {
    this.sleeping = false; return true;
};
Bear.prototype.processSummer = function() {
    this.sleeping = false; return true;
};
Bear.prototype.processWinter = function() {
    this.sleeping = true; return true;
};

/****************************************************
                Spawn interface function
 ****************************************************/

window.spawn = function(type, x, y, style) {
    switch (type) {
        case TYPE.PLAYER : return new Player(x, y);
        case TYPE.GROUND : return new Ground(x, y, style);
        case TYPE.WATER : return new Water(x, y, style);
        case TYPE.SUNFLOWER : return new Sunflower(x, y);
        case TYPE.BEAR : return new Bear(x, y);
        default: {
            console.log("Cannot spawn: unknown type - " + type);
        }
    }
};