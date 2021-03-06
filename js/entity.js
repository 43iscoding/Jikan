(function() {

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
    //[name, collision-priority]
    DUMMY : ['DUMMY', -1],
    PLAYER : ['PLAYER', 1],
    WATER : ['WATER', 0],
    ICE : ['ICE', 0],
    GROUND : ['GROUND', 2],
    SPIKE : ['SPIKE', 0],
    SUNFLOWER : ['SUNFLOWER', 1],
    COIN : ['COIN', 1],
    FINISH : ['FINISH', 0],
    BEAR : ['BEAR', 1],
    PARTICLE : {
        SLEEP : ['SLEEP', -1],
        SNOW : ['SNOW', -1],
        WIND : ['WIND', -1]
    }
};

/*****************************************
        Entity - Every object in game
 ****************************************/

function Entity(x, y, width, height, type, sprite, args) {
    if (args != undefined && args.overrideCoords) {
        this.x = x;
        this.y = y;
    } else {
        this.x = x + Math.round(TILE_SIZE / 2) - Math.round(width / 2);
        this.y = y + TILE_SIZE - height;
    }
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
    canLeaveScreen : function() {
        return false;
    },
    move : function(dx, dy) {
        return engine.move(this, dx, dy);
    },
    get type() {
        return this._type;
    },
    act : function() {},
    updateSprite : function() {
        if (this.sprite == null || this.sprite == undefined) return;
        return this.sprite.update(this.getState());
    },
    die : function() {
        this.dead = true;
        this.static = true;
        this.updateSprite();
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
            } else if (this.ySpeed > 0 && !this.grounded) {
                return STATE.FALL_RIGHT;
            } else return STATE.WALK_RIGHT;
        } else if (this.xSpeed < 0) {
            if (this.ySpeed < 0) {
                return STATE.JUMP_LEFT;
            } else if (this.ySpeed > 0 && !this.grounded) {
                return STATE.FALL_LEFT;
            } else return STATE.WALK_LEFT;
        } else {
            if (this.ySpeed < 0) {
                return STATE.JUMP;
            } else if (this.ySpeed > 0 && !this.grounded) {
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
        this.xSpeed = Math.min(this.xSpeed + this.velocity / 5 * ratio, this.velocity);
    },
    moveLeft : function(ratio) {
        this.xSpeed = Math.max(this.xSpeed - this.velocity / 5 * ratio, -this.velocity);
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
    forceMovement : function() {
        return false;
    },
    destroyOnCollision : function(entity) {
        return false;
    },
    processSeason : function(season) {
        var already = this.processedSeason == season;
        var result = false;
        switch (season) {
            case SEASON.SPRING: result = this.processSpring(already); break;
            case SEASON.SUMMER: result = this.processSummer(already); break;
            case SEASON.AUTUMN: result = this.processAutumn(already); break;
            case SEASON.WINTER: result = this.processWinter(already); break;
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
                      Dummy cell
 ****************************************************/

window.DUMMY_CELL = new Entity(0,0,0,0, TYPE.DUMMY);

/****************************************************
                        Player
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
Player.prototype.isPlatform = function() {
    return true;
};

/***************************************************
                    Generic block
 ***************************************************/

function Block(x, y, type, sprite, args) {
    var width = TILE_SIZE;
    var height = TILE_SIZE;
    if (args) {
        width = args['width'] == undefined ? TILE_SIZE : args['width'];
        height = args['height'] == undefined ? TILE_SIZE : args['height'];
        args.static = true;
    } else {
        args = {static : true};
    }
    Entity.call(this, x, y, width, height, type, sprite, args);
}
Block.prototype = Object.create(Entity.prototype);
Block.prototype.isPlatform = function() {
    return true;
};

/****************************************************
                        Ground
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
                       Water/Ice
 ****************************************************/

function Water(x, y, style) {
    if (style == undefined || style < 0 || style > 1) {
        style = 0;
    }
    var frames = [];

    if (style == 0) {
        frames[STATE.IDLE] = [0];
        frames[STATE.FROZEN] = [6];
    } else {
        frames[STATE.FROZEN] = [5];
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
                      Sunflower
 ****************************************************/

function Sunflower(x,y) {
    this.baseY = y;
    var frames = [];
    frames[STATE.IDLE] = [0];
    frames[STATE.WITHERED] = [1];
    this.growCounter = 0;
    this.growTick = 2;
    Block.call(this, x, y, TYPE.SUNFLOWER, {name : 'tiles', pos: [0, TILE_SIZE * 2], frames: frames, speed : 2});
}
Sunflower.prototype = Object.create(Block.prototype);
Sunflower.prototype.isPlatform = function() {
    return !this.wither;
};
Sunflower.prototype.getState = function() {
    return this.wither ? STATE.WITHERED : STATE.IDLE;
};
Sunflower.prototype.forceMovement = function() {
    return true;
};
Sunflower.prototype.processSpring = function(already) {
    if (already) return true;

    if (this.height == TILE_SIZE && this.growCounter > 0) {
        return true;
    } else if (this.growCounter == 0) {
        this.y = this.baseY + TILE_SIZE;
        this.height = 0;
        this.wither = false;
    }

    this.growCounter++;

    if (this.growCounter % this.growTick == 0) {
        this.height++;
        this.move(0, -1);
    }

    return false;
};
Sunflower.prototype.processSummer = function(already) {
    return this.processSpring(already);
};
Sunflower.prototype.processWinter = function(already) {
    this.y = this.baseY;
    this.height = TILE_SIZE;
    this.wither = true;
    this.growCounter = 0;
    return true;
};

function Finish(x,y) {
    var frames = [];
    frames[STATE.IDLE] = [0, 1, 2, 3, 4, 5];
    Entity.call(this, x, y, 11, 21, TYPE.FINISH,
        {name : 'tiles', pos: [0, TILE_SIZE * 3], frames: frames, speed : 2},
        {static : true});
}
Finish.prototype = Object.create(Entity.prototype);
Finish.prototype.isPlatform = function() {
    return false;
};

/****************************************************
                         Bear
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
    this.sleepCycle = 130;
    this.actIndex = -1;
    this.sleepIndex = 0;
    Entity.call(this, x, y, 22, 22, TYPE.BEAR, {name : 'bear', pos : [0,0], frames: frames, speed: 2}, args);
}
Bear.prototype = Object.create(Entity.prototype);
Bear.prototype.getState = function() {
    if (this.sleeping) return STATE.SLEEPING;
    if (this.xSpeed > 0) {
        if (this.ySpeed < 0) {
            return STATE.JUMP_RIGHT;
        } else if (this.ySpeed > 0 && !this.grounded) {
            return STATE.FALL_RIGHT;
        } else return STATE.WALK_RIGHT;
    } else if (this.xSpeed < 0) {
        if (this.ySpeed < 0) {
            return STATE.JUMP_LEFT;
        } else if (this.ySpeed > 0 && !this.grounded) {
            return STATE.FALL_LEFT;
        } else return STATE.WALK_LEFT;
    } else {
        if (this.ySpeed < 0) {
            return STATE.JUMP;
        } else if (this.ySpeed > 0 && !this.grounded) {
            return STATE.FALL;
        } else return STATE.IDLE;
    }
};
Bear.prototype.act = function() {
    if (this.sleeping) {
        if (this.sleepIndex == 0) addParticle(TYPE.PARTICLE.SLEEP, this.x - 10, this.y - this.height - 8);
        this.sleepIndex++;
        if (this.sleepIndex == this.sleepCycle) this.sleepIndex = 0;
        return;
    }
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
    return this.wakeUp();
};
Bear.prototype.processSummer = function() {
    return this.wakeUp();
};
Bear.prototype.processWinter = function(already) {
    if (already) return false;

    return this.fallAsleep();
};
Bear.prototype.fallAsleep = function() {
    this.xSpeed = 0;
    this.sleeping = true;
    this.sleepIndex = 0;
    return true;
};
Bear.prototype.wakeUp = function() {
    this.sleeping = false;
    return true;
};

function Spike(x, y) {
    var frames = [];
    frames[STATE.IDLE] = [0];
    var args = {width: TILE_SIZE, height : 10};
    Block.call(this, x, y, TYPE.SPIKE, { name : "tiles", pos : [TILE_SIZE * 2, TILE_SIZE * 2], frames: frames, speed: 0}, args);
}
Spike.prototype = Object.create(Block.prototype);
Spike.prototype.isFatal = function() {
    return true;
};

function Coin(x, y) {
    var frames = [];
    frames[STATE.IDLE] = [0,1,2,3,4,5];
    var args = { static : true };
    Entity.call(this, x, y, 10, 21, TYPE.COIN,
        { name : "tiles", pos: [TILE_SIZE * 3, TILE_SIZE * 2], frames: frames, speed: 2}, args);
}
Coin.prototype = Object.create(Entity.prototype);
Coin.prototype.getState = function() {
    return STATE.IDLE;
};
Coin.prototype.destroyOnCollision = function(entity) {
    return entity.type == TYPE.PLAYER;
};

/****************************************************
                        Particle
 ****************************************************/
function Particle(x, y, width, height, type, validSeasons, sprite, args) {
    if (args == undefined) args = {};
    sprite.once = args == undefined ? true : (args['once'] == undefined ? true : args['once']);
    args.overrideCoords = true;
    this.validSeasons = validSeasons;
    Entity.call(this, x, y, width, height, type, sprite, args);
}
Particle.prototype = Object.create(Entity.prototype);
Particle.prototype.getState = function() {
    return STATE.IDLE;
};
Particle.prototype.canLeaveScreen = function() {
    return true;
};
Particle.prototype.stopOnCollision = function(entity) {
    return false;
};
Particle.prototype.act = function() {
    return false;
};
Particle.prototype.validFor = function(season) {
    for (var i = 0; i < this.validSeasons.length; i++) {
        if (this.validSeasons[i] == season) return true;
    }
    return false;
};

/****************************************************
                      Sleep particle
 ****************************************************/

function ParticleSleep(x, y) {
    var frames = [];
    frames[STATE.IDLE] = [0, 1, 2, 3];
    var seasons = [SEASON.WINTER];
    Particle.call(this, x, y, 32, 32, TYPE.PARTICLE.SLEEP, seasons,
        {name : 'particles', pos: [0, 0], frames: frames, speed : 1});
}
ParticleSleep.prototype = Object.create(Particle.prototype);

/****************************************************
                      Snow particle
 ****************************************************/

function ParticleSnow(x, y) {
    var frames = [];
    var args = {once : false, ySpeed : 0.6};
    frames[STATE.IDLE] = [0];
    var seasons = [SEASON.SPRING, SEASON.SUMMER, SEASON.AUTUMN, SEASON.WINTER];
    this.chanceToMove = 0.05;
    Particle.call(this, x, y, 2, 2, TYPE.PARTICLE.SNOW, seasons,
        {name : 'particles', pos : [0, TILE_SIZE], frames: frames, speed : 1}, args);
}
ParticleSnow.prototype = Object.create(Particle.prototype);
ParticleSnow.prototype.destroyOnCollision = function(entity) {
    return entity.type == TYPE.PLAYER || entity.type == TYPE.BEAR ||
           entity.type == TYPE.WATER || entity.type == TYPE.SPIKE ||
           (entity.type == TYPE.SUNFLOWER && !entity.wither);
};
ParticleSnow.prototype.stopOnCollision = function(entity) {
    return entity.type == TYPE.GROUND || entity.type == TYPE.ICE;
};
ParticleSnow.prototype.act = function() {
    switch (getSeason()) {
        case SEASON.WINTER : {
            if (this.static) return Math.random() < 0.005;
            if (Math.random() < this.chanceToMove) {
                this.x += Math.random() < .5 ? 1 : -1;
            }
            return false;
        }
        case SEASON.AUTUMN : return this.static ? Math.random() < 0.05 : Math.random() < 0.0125;
        case SEASON.SPRING : return this.static ? Math.random() < 0.1 : Math.random() < 0.025;
        case SEASON.SUMMER : return this.static ? Math.random() < 0.2 : Math.random() < 0.05;
    }
};

/****************************************************
                     Wind particle
 ****************************************************/

function ParticleWind(x, y) {
    var frames = [];
    frames[STATE.IDLE] = [0];
    var seasons = [SEASON.AUTUMN];
    var args = {static : true};
    Particle.call(this, x, y, 75, 31, TYPE.PARTICLE.WIND, seasons,
        {name : 'particles', pos: [0, TILE_SIZE * 2], frames: frames, speed : 1}, args);
}
ParticleWind.prototype = Object.create(Particle.prototype);

/****************************************************
                      Spawn function
 ****************************************************/

window.spawn = function(type, x, y, style) {
    switch (type) {
        case TYPE.PLAYER : return new Player(x, y);
        case TYPE.GROUND : return new Ground(x, y, style);
        case TYPE.SPIKE : return new Spike(x, y);
        case TYPE.WATER : return new Water(x, y, style);
        case TYPE.SUNFLOWER : return new Sunflower(x, y);
        case TYPE.BEAR : return new Bear(x, y);
        case TYPE.PARTICLE.SLEEP : return new ParticleSleep(x, y);
        case TYPE.PARTICLE.SNOW: return new ParticleSnow(x, y);
        case TYPE.PARTICLE.WIND: return new ParticleWind(x, y);
        case TYPE.FINISH : return new Finish(x, y);
        case TYPE.COIN : return new Coin(x, y);
        default: {
            console.log("Cannot spawn: unknown type - " + type);
        }
    }
};

}());