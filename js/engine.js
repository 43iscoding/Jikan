(function() {
window.engine = {
    applyCollision : function(entity, ground, wall) {
        collisionEffect(entity, ground);
        collisionEffect(entity, wall);
        collisionEffect(ground, entity);
        collisionEffect(wall, entity);
    },
    offScreen : function(entity) {
        return entity.x + entity.width < 0 || entity.y + entity.height < 0 || entity.x > WIDTH || entity.y > HEIGHT;
    },
    leavingScreen : function(entity) {
        return entity.x < 0 || entity.y < 0 || entity.x + entity.width > WIDTH || entity.y + entity.height > HEIGHT;
    },
    collision : collision,
    tileUnder : tileUnder,
    move : function(entity, dx, dy) {
        var collisions = new Collision(entity);
        for (var x = 0; x < Math.abs(dx); x++) {
            entity.x = entity.x + (dx > 0 ? 1 : -1);
            collisions = getCollisions(collisions, entity);
            if (!collisions.empty()) {
                if (collisions.hard(true, dx > 0)) {
                    entity.x = entity.x + (dx > 0 ? - 1 : 1);
                    break;
                }
            }
        }
        for (var y = 0; y < Math.abs(dy); y++) {
            entity.y = entity.y + (dy > 0 ? 1 : -1);
            collisions = getCollisions(collisions, entity);
            if (!collisions.empty()) {
                if (collisions.hard(false, dy > 0)) {
                    entity.y = entity.y + (dy > 0 ? - 1 : 1);
                    break;
                }
            }
        }
        return collisions;
    }
};

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
Collision.prototype = {
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
        return (this.top() == this.bottom() == this.left() == this.right() == DUMMY_CELL) && !this.offscreen();
    },
    offScreen : function() {
        return this[DIR.OFF_SCREEN];
    },
    leavingScreen : function() {
        return this[DIR.LEAVING_SCREEN];
    },
    hard : function(x, positive) {
        if (this.leavingScreen() && !this.entity.canLeaveScreen()) return true;

        if (x && positive) {
            return this.right().isPlatform();
        } else if (x) {
            return this.left().isPlatform();
        } else if (positive) {
            return this.bottom().isPlatform();
        } else {
            return this.top().isPlatform();
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
        return '{' +
            (this.left() == DUMMY_CELL ? '' : ' left: ' + this.left().type) +
            (this.right() == DUMMY_CELL ? '' : ' right: ' + this.right().type) +
            (this.top() == DUMMY_CELL ? '' : ' top: ' + this.top().type) +
            (this.bottom() == DUMMY_CELL ? '' : ' bottom: ' + this.bottom().type) +
            (this.offScreen() ? ' offScreen' : '') +
            (this.leavingScreen() ? ' leavingScreen' : '') + ' }';
    }
};



function getCollisions(collisions, entity) {
    getObjects().forEach(function(object) {
        if (object == entity) return;
        var collide = collision(entity, object);
        if (collide) {
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

function collisionEffect(entity, withEntity) {
    if (entity.static) return;
    if (withEntity.isFatal()) {
        entity.die();
        entity.static = true;
    }
}

function intersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !((x1 > x2 + w2 - 1) ||
             (x1 + w1 - 1 < x2) ||
             (y1 > y2 + h2 - 1) ||
             (y1 + h1 - 1 < y2));
}

function collision(entity1, entity2) {
    if (!intersect(entity1.x, entity1.y, entity1.width, entity1.height,
        entity2.x, entity2.y, entity2.width, entity2.height)) return false;
    if (entity1.x + entity1.width - 1 == entity2.x) {
        return DIR.RIGHT;
    } else if (entity2.x + entity2.width - 1 == entity1.x) {
        return DIR.LEFT;
    } else if (entity1.y + entity1.height - 1 == entity2.y) {
        return DIR.BOTTOM;
    } else if (entity2.y + entity2.height - 1 == entity1.y) {
        return DIR.TOP;
    } else {
        return DIR.INSIDE;
    }

}

}());