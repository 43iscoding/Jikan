(function() {
    var UPS;
    var timestamp;
    var updates = fps;

    window.debug = {
        calculateUPS : function() {
            if (timestamp && timestamp + 1000 > currentTime()) {
                updates++;
            } else {
                UPS = updates;
                timestamp = currentTime();
                updates = 1;
            }
        },
        getUPS : function() {
            return UPS;
        }
    }

}());