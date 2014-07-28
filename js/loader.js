(function(){

    function loadGame() {
        initScreen();
        res.onReady(loaded);
        res.load(['player', 'tiles', 'background']);
    }

    function initScreen() {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        canvas.width = WIDTH * PIXEL_RATIO();
        canvas.height = HEIGHT * PIXEL_RATIO();
        canvas.style.width = WIDTH + 'px';
        canvas.style.height = HEIGHT + 'px';
        context.setTransform(PIXEL_RATIO(), 0, 0, PIXEL_RATIO(), 0, 0);
    }

    function loaded() {
        var context = document.getElementById('canvas').getContext('2d');
        context.font = "50px Aoyagi bold";
        context.textAlign = "center";
        context.fillStyle = "black";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        context.fillStyle = "#D33";
        context.fillText("じかん", WIDTH / 2, HEIGHT / 2);
        setTimeout(proceed, 1000);
    }

    function proceed() {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        context.fillStyle = "black";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        //hide canvas
        init();
    }

    function updateLoading(value) {
        var context = document.getElementById('canvas').getContext('2d');
        context.font = "25px Aoyagi bold";
        context.textAlign = "center";
        context.fillStyle = "black";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        context.fillStyle = "#666";
        context.fillText("Loading: " + value + "%", WIDTH / 2, HEIGHT / 2);
    }

    window.loadGame = loadGame;
    window.loader = {
        update : updateLoading
    }
}());