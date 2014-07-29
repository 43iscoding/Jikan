function Entity(x, y, width, height, type, sprite, args) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.dead = false;
    this.sprite = new Sprite(res.get(sprite['name']), sprite['pos'], [width, height],
            //frames is array of image per state
            sprite['frames'] == undefined ? [] : sprite['frames'],
            sprite['speed'] == undefined ? 0 : sprite['speed'],
            sprite['once'] == undefined ? false : sprite['once']);

    this.static = args == undefined ? false : (args['static'] == undefined ? false : args['static']);
    this.xSpeed = args == undefined ? 0 : (args['xSpeed'] == undefined ? 0 : args['xSpeed']);
    this.ySpeed = args == undefined ? 0 : (args['ySpeed'] == undefined ? 0 : args['ySpeed']);
    this.velocity = args == undefined ? 0 : (args['velocity'] == undefined ? 0 : args['velocity']);
    this.jumpSpeed = args == undefined ? 0 : (args['jump'] == undefined ? 0 : args['jump']);
}

Entity.prototype = {
    updateSprite : function() {
        this.sprite.update(this.getState());
    },
    die : function() {
        this.dead = true;
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
    moveRight : function() {
        this.xSpeed = this.velocity;
    },
    moveLeft : function() {
        this.xSpeed = -this.velocity;
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
    }
};

window.STATE = {
        IDLE : 0,
        WALK_RIGHT : 1,
        WALK_LEFT : 2,
        FALL : 3,
        JUMP : 4,
        JUMP_RIGHT : 5,
        JUMP_LEFT : 6,
        FALL_RIGHT : 7,
        FALL_LEFT : 8,
        DEAD : 9,
        IDLE_RIGHT : 10,
        IDLE_LEFT : 11,
        FROZEN : 12,
        getName : function(index) {
            switch (index) {
                case this.IDLE : return 'IDLE';
                case this.IDLE_RIGHT : return 'IDLE_RIGHT';
                case this.IDLE_LEFT : return 'IDLE_LEFT';
                case this.WALK_RIGHT : return 'WALK_RIGHT';
                case this.WALK_LEFT : return 'WALK_LEFT';
                case this.JUMP : return 'JUMP';
                case this.JUMP_RIGHT : return 'JUMP_RIGHT';
                case this.JUMP_LEFT : return 'JUMP_LEFT';
                case this.FALL : return 'FALL';
                case this.FALL_RIGHT : return 'FALL_RIGHT';
                case this.FALL_LEFT : return 'FALL_LEFT';
                case this.DEAD : return 'DEAD';
                default : {
                    console.log("Unknown entity state: " + index);
                }
            }
        }
};

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
    Entity.call(this, x, y, 22, 22, "player", {name : "player", pos : [0,0], frames: frames, speed: 2}, args);
}
Player.prototype = Object.create(Entity.prototype);

function Block(x, y, type, sprite, mode) {
    var args = { static : true, mode : mode };
    Entity.call(this, x, y, TILE_SIZE, TILE_SIZE, type, sprite, args);
}
Block.prototype = Object.create(Entity.prototype);

window.spawnPlayer = function (x,y) {
    return new Player(x, y);
};

window.spawnGround = function (x, y, mode) {
    if (mode == undefined || mode < 0 || mode > 3) {
        mode = 0;
    }
    var frames = [];
    frames[STATE.IDLE] = 0;
    return new Block(x, y, "ground", { name : "tiles", pos : [TILE_SIZE * mode, 0], frames: frames, speed: 0}, mode);
};

window.spawnWater = function (x, y, mode) {
    if (mode == undefined || mode < 0 || mode > 1) {
        mode = 0;
    }
    var frames = [];
    frames[STATE.FROZEN] = [5];

    if (mode == 0) {
        frames[STATE.IDLE] = [0];
    } else {
        frames[STATE.IDLE] = [1,2,3,4];
    }
    return new Block(x, y, "water", { name : "tiles", pos : [0, TILE_SIZE], frames: frames, speed: 2}, mode);
};
