(function() {
    function Sprite(img, pos, size, frames, speed, once) {
        this.img = img;
        this.pos = pos;
        this.size = size;
        this.frames = frames;
        this.index = 0;
        this.frame = 0;
        this.speed = speed;
        this.once = once == undefined ? false : once;
        this.lastState = STATE.IDLE;
        this.stateFrames = frames[STATE.IDLE];
        this.done = false;
    }

    Sprite.prototype = {
        update: function (state) {
            if (this.speed == 0) return;
            if (state != this.lastState) {
                this.stateFrames = this.frames[state];
                this.index = 0;
            }
            this.index += (fps * this.speed) / 1000;
            this.frame = this.stateFrames[0] + Math.floor(this.index) % this.stateFrames.length;
            if (this.once && Math.floor(this.index) == this.stateFrames.length) {
                this.done = true;
                return true;
            }
            this.lastState = state;
            return false;
        },
        reset: function () {
            this.index = 0;
            this.frame = 0;
        },
        render: function (context) {
            if (this.done) return;
            var x = this.pos[0];
            var y = this.pos[1];
            x += this.frame * this.size[0];
            context.drawImage(this.img,
                x, y, this.size[0], this.size[1],
                0, 0, this.size[0], this.size[1]);
        }
    };

    window.Sprite = Sprite;
}());