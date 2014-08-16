(function(){

    var fullScreen = false;

    function loadGame() {
        initRenderer(document.getElementById('buffer'),
            document.getElementById('canvas'));
        initScreen(document.getElementById('canvas'), WIDTH * 2, HEIGHT * 2);
        initScreen(document.getElementById('buffer'), WIDTH, HEIGHT);
        res.onReady(loaded);
        res.load(['player', 'tiles', 'bear', 'background', 'particles', 'ui']);
    }

    function initScreen(canvas, width, height) {
        var context = canvas.getContext('2d');
        canvas.width = width * PIXEL_RATIO();
        canvas.height = height * PIXEL_RATIO();
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        context.setTransform(PIXEL_RATIO(), 0, 0, PIXEL_RATIO(), 0, 0);
        context.imageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        canvas.style.marginTop = Math.round((window.innerHeight - height) / 4) + 'px';
    }

    function loaded() {
        drawLoaded();
        setTimeout(proceed, 1000);
    }

    function proceed() {
        init();
    }

    function updateLoading(value) {
        drawLoading(value);
    }

    window.loadGame = loadGame;
    window.loader = {
        update : updateLoading,
        toggleFullscreen : function() {
            var canvas = document.getElementById('canvas');
            if (fullScreen) {
                initScreen(canvas, WIDTH * 2, HEIGHT * 2);
            } else {
                initScreen(canvas, window.innerWidth, window.innerHeight);
            }
            fullScreen = !fullScreen;
        }
    }
}());