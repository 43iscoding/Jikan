(function() {

var objects = [];
var particles = [];
var context;

var season;

var levelComplete = false;
var winTimer = null;

function init() {
    context = document.getElementById('canvas').getContext('2d');
    startLevel();
    tick();
}

window.init = init;
window.addParticle = addParticle;

function startLevel() {
    levelComplete = false;
    season = DEFAULT_SEASON;
    objects = parseMap(getMap());
    particles = [];
}

function tick() {
    if (player.dead) {
        setTimeout(init, 500);
        return;
    }
    processInput();
    update();
    render();
    if (levelComplete) win();
    setTimeout(tick, 1000 / fps);
}

function processInput() {
    if (levelComplete) return;
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
    for (var i = objects.length - 1; i >= 0; i--) {
        updateEntity(objects[i]);
    }
    //process particles
    for (var j = particles.length - 1; j >= 0; j--) {
        if (updateParticle(particles[j])) {
            particles.splice(j, 1);
        }
    }
}

function win() {
    if (winTimer != null) return;
    winTimer = setTimeout(function() {
        advanceLevel();
        startLevel();
        winTimer = null;
    }, 1000);
}

function updateParticle(particle) {
    if (!particle.validFor(season)) {
        return true;
    }

    if (particle.updateSprite()) {
        return true;
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

    if (wall.type == TYPE.FINISH && entity.type == TYPE.PLAYER && !levelComplete) {
        levelComplete = true;
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
            if (entity.y < objects[i].y) {
                entity.y--;
            } else if (entity.y > objects[i].y) {
                entity.y++;
                entity.ySpeed = 0;
            }
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

    renderUI();
}

function renderBackground() {
    context.drawImage(res.get('background'), player.x / 12, HEIGHT * 2, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
    context.drawImage(res.get('background'), player.x / 7, HEIGHT, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
    context.drawImage(res.get('background'), player.x / 4, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
}

function renderUI() {
    //season
    context.textAlign = "center";
    context.fillStyle = "#00005A";
    context.font = '19px Aoyagi bold';
    context.fillText(season, WIDTH / 9 * 8 + 1, HEIGHT / 17 - 1);
    context.fillStyle = "#DDB500";
    context.fillText(season, WIDTH / 9 * 8, HEIGHT / 17);

    if (levelComplete) {
        context.font = "30px Aoyagi bold";
        context.fillStyle = "#00005A";
        context.fillText("LEVEL COMPLETE", WIDTH / 2 + 1, HEIGHT / 2 - 1);
        context.fillStyle = "#DDB500";
        context.fillText("LEVEL COMPLETE", WIDTH / 2, HEIGHT / 2);
    }
}

}());