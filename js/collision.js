(function() {
window.collision = {
    applyCollision : function(entity, ground, wall) {
        collisionEffect(entity, ground);
        collisionEffect(entity, wall);
        collisionEffect(ground, entity);
        collisionEffect(wall, entity);
    },
    grounded : function(entity) {
        return tileUnder(entity).isPlatform();
    },
    offScreen : function(entity) {
        return entity.x + entity.width < 0 || entity.y + entity.height < 0 || entity.x > WIDTH || entity.y > HEIGHT;
    },
    processGroundCollision : function(entity) {
        var objects = getObjects();
        for (var i = 0; i < objects.length; i++) {
            if (objects[i] == entity) continue;
            if (!objects[i].isPlatform()) continue;
            if (!collision(entity, objects[i])) continue;

            while (collision(entity, objects[i])) {
                if (entity.y <= objects[i].y) {
                    entity.y--;
                } else if (entity.y > objects[i].y) {
                    entity.y++;
                    entity.ySpeed = 0;
                }
            }
            entity.y = Math.round(entity.y);
        }
        return tileUnder(entity);
    },
    processWallCollision : function(entity) {
        var objects = getObjects();
        if (entity.x < 0) {
            entity.x = 0;
        } else if (entity.x > WIDTH - entity.width) {
            entity.x = WIDTH - entity.width;
        }
        for (var i = 0; i < objects.length; i++) {
            if (objects[i] == entity) continue;
            if (!collision(entity, objects[i])) continue;

            if (objects[i].isPlatform()) {
                while (collision(entity, objects[i])) {
                    if (entity.x < objects[i].x) {
                        entity.x--;
                    } else if (entity.x > objects[i].x) {
                        entity.x++;
                    }
                }
            }
            entity.x = Math.round(entity.x);
            return objects[i];
        }
        return DUMMY_CELL;
    },
    collision : collision,
    tileUnder : tileUnder,
};

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
    return !((x1 > x2 + w2) ||
        (x1 + w1 < x2) ||
        (y1 > y2 + h2) ||
        (y1 + h1 < y2));
}

function collision(entity1, entity2) {
    return intersect(entity1.x, entity1.y, entity1.width, entity1.height,
        entity2.x, entity2.y, entity2.width, entity2.height);
}

}());