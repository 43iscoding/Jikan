(function() {

var objects = [];
var particles = [];
var context;

var season;

function init() {
    context = document.getElementById('canvas').getContext('2d');
    startLevel();
    tick();
}

window.init = init;
window.addParticle = addParticle;

function startLevel() {
    season = DEFAULT_SEASON;
    objects = parseMap(MAPS.TEST_MAP);
}

function tick() {
    if (player.dead) {
        setTimeout(init, 500);
        return;
    }
    processInput();
    update();
    render();
    setTimeout(tick, 1000 / fps);
}

function processInput() {
    //movement
    var movementRatio = tileUnder(player).type == TYPE.ICE ? ICE_SLIDING : 1;
    if (input.isPressed(input.keys.RIGHT.key)) {
        player.moveRight(movementRatio);
    } else if (input.isPressed(input.keys.LEFT.key)) {
        player.moveLeft(movementRatio);
    }
    if (input.isPressed(input.keys.UP.key) || input.isPressed(input.keys.SPACE.key)) {
        if (grounded(player)) player.jump();
    }
    //seasons
    if (input.isPressed(input.keys['1'].key)) {
        changeSeason(SEASON.SPRING);
    } else if (input.isPressed(input.keys['2'].key)) {
        changeSeason(SEASON.SUMMER);
    } else if (input.isPressed(input.keys['3'].key)) {
        changeSeason(SEASON.AUTUMN);
    } else if (input.isPressed(input.keys['4'].key)) {
        changeSeason(SEASON.WINTER);
    }
    //special
    if (input.isPressed(input.keys.R.key)) {
        startLevel();
    }
}

function changeSeason(newSeason) {
    if (newSeason == season) return;
    season = newSeason;
}

function update() {
    objects.forEach(function(object) {
        updateEntity(object);
    });
    //process particles
    for (var i = particles.length - 1; i >= 0; i--) {
        if (particles[i].updateSprite()) {
            particles.splice(i, 1);
        }
    }
}

function updateEntity(entity) {
    entity.updateSprite();
    entity.processSeason(season);
    if (entity.static) {
        return;
    }
    entity.act();
    //process physics

    entity.y = Math.round(entity.y + entity.ySpeed);
    var ground = processGroundCollision(entity);

    entity.x = Math.round(entity.x + entity.xSpeed);
    var wall = processWallCollision(entity);

    if (wall.isPlatform()) {
        entity.xSpeed = 0;
    }

    if (ground.isFatal() || wall.isFatal()) {
        entity.die();
        entity.static = true;
    }

    if (ground.type != TYPE.ICE) {
        entity.applyFriction(FRICTION);
    }

    if (ground.isBouncy()) {
        entity.ySpeed = -entity.ySpeed;
    } else if (grounded(entity)) {
        entity.ySpeed = 0;
    } else {
        entity.applyGravity(GRAVITY);
    }
}

function grounded(entity) {
    return tileUnder(entity).isPlatform();
}

function tileUnder(entity) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i] == entity) continue;
        var tile = objects[i];
        if ((entity.y + entity.height + 1 == tile.y) &&
            (entity.x < tile.x + tile.width) &&
            (entity.x + entity.width > tile.x)) return tile;
    }
    return DUMMY_CELL;
}

function processWallCollision(entity) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i] == entity) continue;
        if (!objects[i].isPlatform()) continue;
        if (!collision(entity, objects[i])) continue;

        while (collision(entity, objects[i])) {
            if (entity.x < objects[i].x) {
                entity.x--;
            } else {
                entity.x++;
            }
        }
        entity.x = Math.round(entity.x);
        return objects[i];
    }
    return DUMMY_CELL;
}

function addParticle(type, x, y) {
    particles.push(spawn(type, x, y));
}

function processGroundCollision(entity) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i] == entity) continue;
        if (!objects[i].isPlatform()) continue;
        if (!collision(entity, objects[i])) continue;

        while (collision(entity, objects[i])) {
            entity.y--;
        }
        entity.y = Math.round(entity.y);
    }
    return tileUnder(entity);
}

function collision(entity1, entity2) {
    return intersect(entity1.x, entity1.y, entity1.width, entity1.height,
        entity2.x, entity2.y, entity2.width, entity2.height);
}

function intersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !((x1 > x2 + w2) ||
        (x1 + w1 < x2) ||
        (y1 > y2 + h2) ||
        (y1 + h1 < y2));
}

function render() {
    renderBackground();

    objects.forEach(function(object) {
        object.render(context);
    });

    particles.forEach(function(particle) {
        particle.render(context);
    });
}

function renderBackground() {
    context.drawImage(res.get('background'), 0, 0);
    context.fillStyle = '#fff';
    context.font = '17px Aoyagi bold';
    context.fillText(season, WIDTH / 10 * 9, HEIGHT / 20);
}

}());