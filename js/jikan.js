(function() {

var objects = [];
var particles = [];

var season;

var levelComplete = false;
var winTimer = null;
var counter = 0;

function init() {
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
window.currentTime = function() {
    return new Date().getTime();
};

function startLevel() {
    levelComplete = false;
    season = DEFAULT_SEASON;
    objects = parseMap(getMap());
    particles = [];
}

function tick() {
    if (DEBUG) debug.calculateUPS();
    var from = currentTime();
    counter++;
    if (player.dead) {
        update();
        render(objects, particles);
        setTimeout(init, 500);
        return;
    }
    processInput();
    update();
    render(objects, particles);
    if (levelComplete) win();
    setTimeout(tick, 1000 / fps - (currentTime() - from));
}

function processInput() {
    if (levelComplete) return;
    //movement
    var movementRatio = player.onIce ? ICE_SLIDING : 1;
    if (input.isPressed(input.keys.RIGHT.key)) {
        player.moveRight(movementRatio);
    } else if (input.isPressed(input.keys.LEFT.key)) {
        player.moveLeft(movementRatio);
    }
    if (input.isPressed(input.keys.UP.key) || input.isPressed(input.keys.SPACE.key)) {
        if (player.grounded) player.jump();
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
        input.clearInput(input.keys.R.key);
        startLevel();
    }
    if (input.isPressed(input.keys.F.key)) {
        input.clearInput(input.keys.F.key);
        loader.toggleFullscreen();
    }
    if (input.isPressed(input.keys.LEFT_BRACKET.key)) {
        input.clearInput(input.keys.LEFT_BRACKET.key);
        previousLevel();
        startLevel();
    }
    if (input.isPressed(input.keys.RIGHT_BRACKET.key)) {
        input.clearInput(input.keys.RIGHT_BRACKET.key);
        nextLevel();
        startLevel();
    }
}

function changeSeason(newSeason) {
    if (newSeason == season) return;
    season = newSeason;
}

var WIND_MOVE = 1;
var WIND_TICK = 1;
var WIND_ANIMATION = 100;

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
    } else if (season == SEASON.AUTUMN) {
        if (counter % WIND_TICK == 0) {
            objects.forEach(function(object) {
                if (!object.static) object.move(WIND_MOVE, 0);
            });
            particles.forEach(function(particle) {
                if (!particle.static) particle.move(WIND_MOVE, 0);
            });
        }
        if (counter % WIND_ANIMATION == 0) {
            //particles.push(spawn(TYPE.PARTICLE.WIND, WIDTH / 2, HEIGHT / 2));
        }

    }
}

function win() {
    if (winTimer != null) return;
    winTimer = setTimeout(function() {
        nextLevel();
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

    var collisions = particle.move(particle.xSpeed, particle.ySpeed);

    if (engine.offScreen(particle)) return true;

    var objects = collisions.list();
    for (var i = 0; i < objects.length; i++) {
        if (particle.destroyOnCollision(objects[i])) return true;
        if (particle.stopOnCollision(objects[i])) {
            particle.xSpeed = 0;
            particle.ySpeed = 0;
            particle.static = true;
        }
    }

    return particle.act();
}

function updateEntity(entity) {
    entity.processSeason(season);
    entity.updateSprite();
    if (entity.static) {
        return;
    }
    entity.act();
    //process physics

    var collisions = entity.move(entity.xSpeed, entity.ySpeed);

    collisions.applyEffects();

    if ((collisions.right().isPlatform() && entity.xSpeed > 0) || (collisions.left().isPlatform() && entity.xSpeed < 0)) {
        entity.xSpeed = 0;
    }

    if (entity.type == TYPE.PLAYER && collisions.hasType(TYPE.FINISH)) {
        levelComplete = true;
    }

    entity.grounded = collisions.bottom().isPlatform();
    entity.onIce = collisions.bottom().type == TYPE.ICE;

    if (collisions.bottom().type != TYPE.ICE) {
        entity.applyFriction(FRICTION);
    }

    if (collisions.bottom().isBouncy()) {
        entity.ySpeed = -entity.ySpeed;
    } else if (entity.grounded || collisions.top().isPlatform()) {
        entity.ySpeed = 0;
    }
    entity.applyGravity(GRAVITY);
}

function addParticle(type, x, y) {
    particles.push(spawn(type, x, y));
}

}());