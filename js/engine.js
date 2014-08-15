(function() {
window.engine = {
    offScreen : function(entity) {
        return entity.x + entity.width < 0 || entity.x > WIDTH || entity.y > HEIGHT;
    },
    leavingScreen : function(entity) {
        return entity.x < 0 || entity.x + entity.width > WIDTH || entity.y + entity.height > HEIGHT;
    },
    tileUnder : tileUnder,
    move : function(entity, dx, dy, args) {
        var force = entity.forceMovement() || (args && args['force']);
        var collisions = new Collision(entity);
        if (!force) collisions = getCollisions(collisions, entity, DIR.INSIDE);
        if (collisions.hard()) return collisions;

        for (var x = 0; x < Math.abs(dx); x++) {
            entity.x = entity.x + (dx > 0 ? 1 : -1);
            collisions = getCollisions(collisions, entity, dx > 0 ? DIR.RIGHT : DIR.LEFT);
            if (!collisions.empty()) {
                if (collisions.hard(true, dx > 0)) {
                    if (force) {
                        collisions.list().forEach(function(object) {
                            push(object, dx > 0 ? 1 : - 1, 0);
                        });
                    } else {
                        entity.x = entity.x + (dx > 0 ? - 1 : 1);
                        break;
                    }
                }
            }
        }
        for (var y = 0; y < Math.abs(dy); y++) {
            entity.y = entity.y + (dy > 0 ? 1 : -1);
            collisions = getCollisions(collisions, entity, dy > 0 ? DIR.BOTTOM : DIR.TOP);
            if (!collisions.empty()) {
                if (collisions.hard(false, dy > 0)) {
                    if (force) {
                        collisions.list().forEach(function(object) {
                            push(object, 0, dy > 0 ? 1 : - 1);
                        });
                    } else {
                        entity.y = entity.y + (dy > 0 ? - 1 : 1);
                        break;
                    }
                }
            }
            if (dy < 0 && y > 0) {
                entity.grounded = false;
            }
        }
        return collisions;
    }
};

function push(object, x, y) {
    if (object.static) return;
    var cls = engine.move(object, x, y, {force : true});
    if (!cls.empty()) {
        object.die();
    }
}

window.DIR = {
    RIGHT : 'RIGHT',
    LEFT : 'LEFT',
    TOP : 'TOP',
    BOTTOM : 'BOTTOM',
    INSIDE : 'INSIDE',
    OFF_SCREEN : 'OFF_SCREEN',
    LEAVING_SCREEN : 'LEAVING_SCREEN'
};

function Collision(entity) {
    this.entity = entity;
    this[DIR.RIGHT] = DUMMY_CELL;
    this[DIR.LEFT] = DUMMY_CELL;
    this[DIR.BOTTOM] = DUMMY_CELL;
    this[DIR.TOP] = DUMMY_CELL;
    this[DIR.INSIDE] = DUMMY_CELL;
    this[DIR.OFF_SCREEN] = false;
    this[DIR.LEAVING_SCREEN] = false;
}
window.Collision = Collision;
Collision.prototype = {
    list : function() {
        var objects = [];
        if (this.right() != DUMMY_CELL) objects.push(this.right());
        if (this.left() != DUMMY_CELL) objects.push(this.left());
        if (this.top() != DUMMY_CELL) objects.push(this.top());
        if (this.bottom() != DUMMY_CELL) objects.push(this.bottom());
        if (this.inside() != DUMMY_CELL) objects.push(this.inside());
        return objects;
    },
    top : function() {
        return this[DIR.TOP];
    },
    bottom : function() {
        return this[DIR.BOTTOM];
    },
    left : function() {
        return this[DIR.LEFT];
    },
    right : function() {
        return this[DIR.RIGHT];
    },
    inside : function() {
        return this[DIR.INSIDE];
    },
    empty : function() {
        return this.left() == DUMMY_CELL && this.right() == DUMMY_CELL &&
               this.top() == DUMMY_CELL && this.bottom() == DUMMY_CELL &&
               this.inside() == DUMMY_CELL && !this.offScreen() && !this.leavingScreen();
    },
    offScreen : function() {
        return this[DIR.OFF_SCREEN];
    },
    leavingScreen : function() {
        return this[DIR.LEAVING_SCREEN];
    },
    applyEffects : function() {
        collisionEffect(this.entity, this.left());
        collisionEffect(this.entity, this.right());
        collisionEffect(this.entity, this.top());
        collisionEffect(this.entity, this.bottom());
        collisionEffect(this.entity, this.inside());
    },
    hard : function(x, positive) {
        if ((x || x == undefined) && this.leavingScreen() && !this.entity.canLeaveScreen()) return true;

        if (x == undefined && positive == undefined) {
            return this.right().isPlatform() || this.left().isPlatform() ||
                   this.top().isPlatform() || this.bottom().isPlatform() ||
                   this.inside().isPlatform();
        }

        if (x && positive) {
            return this.right().isPlatform() || this.inside().isPlatform();
        } else if (x && !positive) {
            return this.left().isPlatform() || this.inside().isPlatform();
        } else if (!x && positive) {
            return this.bottom().isPlatform() || this.inside().isPlatform();
        } else if (!x && !positive) {
            return this.top().isPlatform() || this.inside().isPlatform();
        } else {
            console.log('dafuq!');
            return false;
        }
    },
    hasType : function(type) {
        return (this.right().type == type) ||
               (this.left().type == type) ||
               (this.bottom().type == type) ||
               (this.top().type == type) ||
               (this.inside().type == type);
    },
    toString : function() {
        return this.entity.type[0] + '-collision{' +
            (this.left() == DUMMY_CELL ? '' : ' left: ' + this.left().type) +
            (this.right() == DUMMY_CELL ? '' : ' right: ' + this.right().type) +
            (this.top() == DUMMY_CELL ? '' : ' top: ' + this.top().type) +
            (this.bottom() == DUMMY_CELL ? '' : ' bottom: ' + this.bottom().type) +
            (this.inside() == DUMMY_CELL ? '' : ' inside: ' + this.inside().type) +
            (this.offScreen() ? ' offScreen' : '') +
            (this.leavingScreen() ? ' leavingScreen' : '') + '}';
    }
};



function getCollisions(collisions, entity, dir) {
    getObjects().forEach(function(object) {
        if (object == entity) return;
        var collide = collision(entity, object, dir);
        if (collide && object.type[1] > collisions[collide].type[1]) {
            //entity.type[1] is collision priority
            collisions[collide] = object;
        }
    });
    if (engine.offScreen(entity)) {
        collisions[DIR.OFF_SCREEN] = true;
    } else if (engine.leavingScreen(entity)) {
        collisions[DIR.LEAVING_SCREEN] = true;
    }
    return collisions;
}

function tileUnder(entity) {
    var objects = getObjects();
    for (var i = 0; i < objects.length; i++) {
        if (objects[i] == entity) continue;
        var tile = objects[i];
        if ((entity.y + entity.height + 1 == tile.y) &&
            (entity.x < tile.x + tile.width) &&
            (entity.x + entity.width > tile.x)) return tile;
    }
    return DUMMY_CELL;
}

function collisionEffect(entity1, entity2) {
    effect(entity1, entity2);
    effect(entity2, entity1);
}

function effect(entity, withEntity) {
    if (entity.destroyOnCollision(withEntity)) {
        getObjects().splice(getObjects().indexOf(entity), 1);
    }
    if (entity.static || entity == DUMMY_CELL) return;
    if (withEntity.isFatal()) {
        entity.die();
    }
}

function intersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !((x1 > x2 + w2 - 1) ||
             (x1 + w1 - 1 < x2) ||
             (y1 > y2 + h2 - 1) ||
             (y1 + h1 - 1 < y2));
}

function collision(entity1, entity2, dir) {
    if (!intersect(entity1.x, entity1.y, entity1.width, entity1.height,
        entity2.x, entity2.y, entity2.width, entity2.height)) return false;

    //console.log("collision between " + entity1.type + " and " + entity2.type + " -> " + dir);
    switch (dir) {
        case DIR.RIGHT : return checkCollision(entity1, entity2, [DIR.RIGHT, DIR.LEFT, DIR.TOP, DIR.BOTTOM]);
        case DIR.LEFT : return checkCollision(entity1, entity2, [DIR.LEFT, DIR.RIGHT, DIR.TOP, DIR.BOTTOM]);
        case DIR.TOP : return checkCollision(entity1, entity2, [DIR.TOP, DIR.BOTTOM, DIR.LEFT, DIR.RIGHT]);
        case DIR.BOTTOM : return checkCollision(entity1, entity2, [DIR.BOTTOM, DIR.TOP, DIR.LEFT, DIR.RIGHT]);
        case DIR.INSIDE : return checkCollision(entity1, entity2, [DIR.RIGHT, DIR.LEFT, DIR.TOP, DIR.BOTTOM]);
        default : {
            console.log('collision(): unknown dir: ' + dir);
            return DIR.INSIDE;
        }
    }
}

function checkCollision(entity1, entity2, directions) {
    for (var i = 0; i < directions.length; i++) {
        if (checkCollisionDirection(entity1, entity2, directions[i])) return directions[i];
    }
    return DIR.INSIDE;
}

function checkCollisionDirection(entity1, entity2, direction) {
    switch (direction) {
        case DIR.RIGHT : return entity1.x + entity1.width - 1 == entity2.x;
        case DIR.LEFT : return entity2.x + entity2.width - 1 == entity1.x;
        case DIR.TOP : return entity2.y + entity2.height - 1 == entity1.y;
        case DIR.BOTTOM : return entity1.y + entity1.height - 1 == entity2.y;
        default : {
            console.log('unknown collision checking pattern: ' + direction);
            return false;
        }
    }
}


}());