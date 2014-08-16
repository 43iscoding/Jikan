(function() {

var bufferCanvas;
var bufferContext;
var canvas;
var context;
var objects;
var particles;

window.render = render;
window.drawLoaded = function() {
    bufferContext.clearRect(0, 0, WIDTH, HEIGHT);
    bufferContext.font = "53px Aoyagi bold";
    bufferContext.textAlign = "center";
    bufferContext.fillStyle = "#00005A";
    bufferContext.fillText("じかん", WIDTH / 2, HEIGHT / 2);
    bufferContext.font = "50px Aoyagi bold";
    bufferContext.textAlign = "center";
    bufferContext.fillStyle = "#DDB500";
    bufferContext.fillText("じかん", WIDTH / 2, HEIGHT / 2);
    execute();
};
window.drawLoading = function(value) {
    bufferContext.clearRect(0, 0, WIDTH, HEIGHT);
    bufferContext.font = "25px Aoyagi bold";
    bufferContext.textAlign = "center";
    bufferContext.fillStyle = "#666";
    bufferContext.fillText("Loading: " + value + "%", WIDTH / 2, HEIGHT / 2);
    execute();
};
window.initRenderer = function(_buffer, _canvas) {
    bufferCanvas = _buffer;
    bufferContext = bufferCanvas.getContext('2d');
    canvas = _canvas;
    context = canvas.getContext('2d');
};

function execute() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bufferCanvas, 0, 0, canvas.width, canvas.height);
}

function render(_objects, _particles) {
    objects = _objects;
    particles = _particles;
    renderBackground();

    objects.forEach(function(object) {
        object.render(bufferContext);
    });

    particles.forEach(function(particle) {
        particle.render(bufferContext);
    });

    renderUI();
    renderDebug();

    execute();
}

function renderBackground() {
    bufferContext.drawImage(res.get('background'), player.x / 12, HEIGHT * 2, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
    bufferContext.drawImage(res.get('background'), player.x / 7, HEIGHT, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
    bufferContext.drawImage(res.get('background'), player.x / 4, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
}

var seasonCenter = {x: 20, y : 20};

function getSeasonUIAngle() {
    switch (getSeason()) {
        case SEASON.AUTUMN: return Math.PI     / 4;
        case SEASON.WINTER: return Math.PI * 3 / 4;
        case SEASON.SPRING: return Math.PI * 5 / 4;
        case SEASON.SUMMER: return Math.PI * 7 / 4;
        default: {
            console.log('Unknown season: ' + getSeason());
            return Math.PI / 4;
        }
    }
}

function renderUI() {
    //season
    bufferContext.drawImage(res.get('ui'), 0, 0, TILE_SIZE, TILE_SIZE, seasonCenter.x - 16, seasonCenter.y - 16, TILE_SIZE, TILE_SIZE);

    bufferContext.fillStyle = 'rgba(0,0,0,0.6)';
    bufferContext.beginPath();
    bufferContext.moveTo(seasonCenter.x, seasonCenter.y);
    bufferContext.arc(seasonCenter.x, seasonCenter.y, 16, getSeasonUIAngle(), getSeasonUIAngle() + Math.PI * 3 / 2);
    bufferContext.lineTo(seasonCenter.x, seasonCenter.y);
    bufferContext.closePath();
    bufferContext.fill();

    bufferContext.drawImage(res.get('ui'), TILE_SIZE * 2, 0, 6, 6, seasonCenter.x - 3, seasonCenter.y - 3, 6, 6);

    if (levelComplete()) {
        bufferContext.font = "30px Aoyagi bold";
        bufferContext.fillStyle = "#00005A";
        bufferContext.fillText("LEVEL COMPLETE", WIDTH / 2 + 1, HEIGHT / 2 - 1);
        bufferContext.fillStyle = "#DDB500";
        bufferContext.fillText("LEVEL COMPLETE", WIDTH / 2, HEIGHT / 2);
    }
}

function renderDebug() {
    if (!DEBUG) return;

    //objects and particles
    bufferContext.textAlign = "center";
    bufferContext.font = '12px Aoyagi bold';

    bufferContext.fillStyle = "#00005A";
    bufferContext.fillText('Objects:', WIDTH / 10 + 1, HEIGHT / 17 - 1);
    bufferContext.fillText(String(objects.length), WIDTH / 4 + 1, HEIGHT / 17 - 1);
    bufferContext.fillStyle = "#DDB500";
    bufferContext.fillText('Objects:', WIDTH / 10, HEIGHT / 17);
    bufferContext.fillText(String(objects.length), WIDTH / 4, HEIGHT / 17);

    bufferContext.fillStyle = "#00005A";
    bufferContext.fillText('Particles:', WIDTH / 10 + 1, HEIGHT / 8 - 1);
    bufferContext.fillText(String(particles.length), WIDTH / 4 + 1, HEIGHT / 8 - 1);
    bufferContext.fillStyle = "#DDB500";
    bufferContext.fillText('Particles:', WIDTH / 10, HEIGHT / 8);
    bufferContext.fillText(String(particles.length), WIDTH / 4, HEIGHT / 8);

    bufferContext.fillStyle = "#00005A";
    bufferContext.fillText('FPS: ' + debug.getUPS(), WIDTH / 13 + 1, HEIGHT - 5 - 1);
    bufferContext.fillStyle = "#DDB500";
    bufferContext.fillText('FPS: ' + debug.getUPS(), WIDTH / 13, HEIGHT - 5);
}
}());