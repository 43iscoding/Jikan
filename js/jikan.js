(function() {

var objects = [];
var context;

var player;
var season;

window.SEASON = {
    SPRING : 'Spring',
    SUMMER : 'Summer',
    AUTUMN : 'Autumn',
    WINTER : 'Winter'
};

function init() {
    context = document.getElementById('canvas').getContext('2d');
    startLevel();
    tick();
}

window.init = init;

function startLevel() {
    initMap();
}

function initMap() {
    objects = [];
    player = spawnPlayer(50, 50);
    season = SEASON.SUMMER;
    objects.push(player);
    putTile(0,5, "ground", 1);
    putTile(1,5, "ground", 0);
    putTile(2,5, "ground", 2);
    putTile(0,6, "ground", 3);
    putTile(1,6, "ground", 3);
    putTile(2,6, "ground", 3);
    putTile(0,7, "ground", 3);
    putTile(1,7, "ground", 3);
    putTile(2,7, "ground", 3);
    putTile(3,6, "water", 1);
    putTile(4,6, "water", 1);
    putTile(5,6, "water", 1);
    putTile(3,7, "water", 0);
    putTile(4,7, "water", 0);
    putTile(5,7, "water", 0);
    putTile(6,5, "ground", 1);
    putTile(7,5, "ground", 0);
    putTile(8,5, "ground", 0);
    putTile(9,5, "ground", 0);
    putTile(6,6, "ground", 3);
    putTile(7,6, "ground", 3);
    putTile(8,6, "ground", 3);
    putTile(9,6, "ground", 3);
    putTile(6,7, "ground", 3);
    putTile(7,7, "ground", 3);
    putTile(8,7, "ground", 3);
    putTile(9,7, "ground", 3);

}

function putTile(x, y, type, mode) {
    switch (type) {
        case 'ground' : objects.push(spawnGround(x * TILE_SIZE, y * TILE_SIZE, mode)); return;
        case 'water' : objects.push(spawnWater(x * TILE_SIZE, y * TILE_SIZE, mode)); return;
        default : {
            console.log("Unknown tile type - " + type);
            return;
        }
    }
}

function tick() {
    processInput();
    update();
    render();
    setTimeout(tick, 1000 / fps);
}

function processInput() {
    //movement
    if (input.isPressed(input.keys.RIGHT.key)) {
        player.moveRight();
    } else if (input.isPressed(input.keys.LEFT.key)) {
        player.moveLeft();
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
    for (var i = 0; i < objects.length; i++) {
        updateEntity(objects[i]);
    }
}

function updateEntity(entity) {
    entity.updateSprite();
    if (entity.static) {
        return;
    }

    entity.x = Math.round(entity.x + entity.xSpeed);
    processWallCollision(entity);

    entity.y = Math.round(entity.y + entity.ySpeed);
    processGroundCollision(entity);

    if (tileUnder(entity) == 'water') {
        entity.die();
        entity.static = true;
    }

    entity.applyFriction(FRICTION);
    if (grounded(entity)) {
        entity.ySpeed = 0;
    } else {
        entity.applyGravity(GRAVITY);
    }
}

function grounded(entity) {
    return tileUnder(entity) == 'ground';
}

function tileUnder(entity) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].type == entity) continue;
        var tile = objects[i];
        if ((entity.y + entity.height + 1 == tile.y) &&
            (entity.x < tile.x + tile.width) &&
            (entity.x + entity.width > tile.x)) return tile.type;
    }
    return 'none';
}

function processWallCollision(entity) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].type != 'ground') continue;

        while (collision(entity, objects[i])) {
            if (entity.x < objects[i].x) {
                entity.x--;
            } else {
                entity.x++;
            }
        }
        entity.x = Math.round(entity.x);

    }
}

function processGroundCollision(entity) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].type == 'ground' || objects[i].type == 'water') {
            while (collision(entity, objects[i])) {
                entity.y--;
            }
            entity.y = Math.round(entity.y);
        }
    }
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
    for (var i = 0; i < objects.length; i++) {
        objects[i].render(context);
    }
}

function renderBackground() {
    context.drawImage(res.get('background'), 0, 0);
    context.fillStyle = '#fff';
    context.font = '17px Aoyagi bold';
    context.fillText(season, WIDTH / 10 * 9, HEIGHT / 20);
}

}());