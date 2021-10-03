class Display {
    colours = {
        white: "#FFFFFF",
        black: "#000000"
    }

    addEventListener(e, f){
        this.canvas.addEventListener(e, f);
    }

    constructor() {
        this.canvas = document.getElementById('canvas');
        this.context = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.top = canvas.getBoundingClientRect().top;
        this.left = canvas.getBoundingClientRect().left;
    }

    hashColour(str) {
        var hash = 0;
        if (str.length === 0) return hash;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        var color = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 255;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }

    fill(c1, c2, c3) {
        if (typeof c1 === "string") {
            this.context.fillStyle = c1;
        } else if (typeof c1 === "number" && typeof c2 === "undefined" && typeof c3 === "undefined") {
            this.context.fillStyle = "rgb(" + c1 + ", " + c1 + ", " + c1 + ")";
        } else if (typeof c1 === "number") {
            this.context.fillStyle = "rgb(" + c1 + ", " + c3 + ", " + c3 + ")";
        } else {
            this.context.fillStyle = "#000000"
        }
    }

    rect(x, y, w, h) {
        this.context.fillRect(x, y, w, h)
    }

    circle(x, y, r) {
        this.context.beginPath()
        this.context.arc(x, y, r, 0, Math.PI * 2)
        this.context.fill()
    }

    background(c) {
        this.fill(c)
        this.context.fillRect(0, 0, canvas.width, canvas.height)
    }
}
