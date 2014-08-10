(function() {

var context;
var objects;
var particles;

window.render = render;
window.initRenderer = function(_context) {
    context = _context;
};

function render(_objects, _particles) {
    objects = _objects;
    particles = _particles;
    renderBackground();

    objects.forEach(function(object) {
        object.render(context);
    });

    particles.forEach(function(particle) {
        particle.render(context);
    });

    renderUI();
    renderDebug();
}

function renderBackground() {
    context.drawImage(res.get('background'), player.x / 12, HEIGHT * 2, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
    context.drawImage(res.get('background'), player.x / 7, HEIGHT, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
    context.drawImage(res.get('background'), player.x / 4, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
}

function renderUI() {
    //season
    context.textAlign = "center";
    context.font = '19px Aoyagi bold';

    context.fillStyle = "#00005A";
    context.fillText(getSeason(), WIDTH / 9 * 8 + 1, HEIGHT / 17 - 1);
    context.fillStyle = "#DDB500";
    context.fillText(getSeason(), WIDTH / 9 * 8, HEIGHT / 17);

    if (levelComplete()) {
        context.font = "30px Aoyagi bold";
        context.fillStyle = "#00005A";
        context.fillText("LEVEL COMPLETE", WIDTH / 2 + 1, HEIGHT / 2 - 1);
        context.fillStyle = "#DDB500";
        context.fillText("LEVEL COMPLETE", WIDTH / 2, HEIGHT / 2);
    }
}

function renderDebug() {
    if (!DEBUG) return;

    //objects and particles
    context.textAlign = "center";
    context.font = '12px Aoyagi bold';

    context.fillStyle = "#00005A";
    context.fillText('Objects:', WIDTH / 10 + 1, HEIGHT / 17 - 1);
    context.fillText(String(objects.length), WIDTH / 4 + 1, HEIGHT / 17 - 1);
    context.fillStyle = "#DDB500";
    context.fillText('Objects:', WIDTH / 10, HEIGHT / 17);
    context.fillText(String(objects.length), WIDTH / 4, HEIGHT / 17);

    context.fillStyle = "#00005A";
    context.fillText('Particles:', WIDTH / 10 + 1, HEIGHT / 8 - 1);
    context.fillText(String(particles.length), WIDTH / 4 + 1, HEIGHT / 8 - 1);
    context.fillStyle = "#DDB500";
    context.fillText('Particles:', WIDTH / 10, HEIGHT / 8);
    context.fillText(String(particles.length), WIDTH / 4, HEIGHT / 8);

    context.fillStyle = "#00005A";
    context.fillText('FPS: ' + debug.getUPS(), WIDTH / 13 + 1, HEIGHT - 5 - 1);
    context.fillStyle = "#DDB500";
    context.fillText('FPS: ' + debug.getUPS(), WIDTH / 13, HEIGHT - 5);
}
}());