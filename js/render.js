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

function renderUI() {
    //season
    bufferContext.textAlign = "center";
    bufferContext.font = '19px Aoyagi bold';

    bufferContext.fillStyle = "#00005A";
    bufferContext.fillText(getSeason(), WIDTH / 9 * 8 + 1, HEIGHT / 17 - 1);
    bufferContext.fillStyle = "#DDB500";
    bufferContext.fillText(getSeason(), WIDTH / 9 * 8, HEIGHT / 17);

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