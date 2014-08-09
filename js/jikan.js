(function() {

var objects = [];
var particles = [];

var season;

var levelComplete = false;
var winTimer = null;

function init() {
    initRenderer(document.getElementById('canvas').getContext('2d'));
    startLevel();
    tick();
}

window.init = init;
window.addParticle = addParticle;
window.levelComplete = function() {
    return levelComplete;
};
window.getSeason = function() {
    return season;
};
window.getObjects = function() {
    return objects;
};

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
    render(objects, particles);
    if (levelComplete) win();
    setTimeout(tick, 1000 / fps);
}

function processInput() {
    if (levelComplete) return;
    //movement
    var movementRatio = collision.tileUnder(player).type == TYPE.ICE ? ICE_SLIDING : 1;
    if (input.isPressed(input.keys.RIGHT.key)) {
        player.moveRight(movementRatio);
    } else if (input.isPressed(input.keys.LEFT.key)) {
        player.moveLeft(movementRatio);
    }
    if (input.isPressed(input.keys.UP.key) || input.isPressed(input.keys.SPACE.key)) {
        if (collision.grounded(player)) player.jump();
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

    //special
    if (season == SEASON.WINTER) {
        //spawn snow
        particles.push(spawn(TYPE.PARTICLE.SNOW, Math.random() * WIDTH, 0));
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

    if (particle.xSpeed > 0) particle.x += particle.xSpeed;
    if (particle.ySpeed > 0) particle.y += particle.ySpeed;

    if (collision.offScreen(particle)) return true;

    if (particle.destroyOnCollision()) {
        for (var i = 0; i < objects.length; i++) {
            if (!objects[i].isPlatform()) continue;
            if (collision.collision(particle, objects[i])) return true;
        }
    }

    particle.act();

    return false;
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
    var ground = collision.processGroundCollision(entity);

    entity.x = Math.round(entity.x + entity.xSpeed);
    var wall = collision.processWallCollision(entity);

    if (wall.isPlatform()) {
        entity.xSpeed = 0;
    }

    if (wall.type == TYPE.FINISH && entity.type == TYPE.PLAYER && !levelComplete) {
        levelComplete = true;
    }

    collision.applyCollision(entity, ground, wall);

    if (ground.type != TYPE.ICE) {
        entity.applyFriction(FRICTION);
    }

    if (ground.isBouncy()) {
        entity.ySpeed = -entity.ySpeed;
    } else if (collision.grounded(entity)) {
        entity.ySpeed = 0;
    } else {
        entity.applyGravity(GRAVITY);
    }
}

function addParticle(type, x, y) {
    particles.push(spawn(type, x, y));
}

}());