(function() {
    //ui settings
    window.fps = 60;
    window.WIDTH = 320;
    window.HEIGHT = 240;

    window.TILE_SIZE = 32;

    window.cookie = {
        MUTED : "muted",
        HIGHSCORE : "highscore"
    };

    window.FRICTION = 0.15;
    window.GRAVITY = 0.12;
    window.FREE_FALL = 5;

    window.PIXEL_RATIO = function () {
        var ctx = document.getElementById("canvas").getContext("2d"),
            dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
    };

}());