class Frame{
    constructor(width = 800, height = 600, marginRatio = 1/20){
        this.width = width;
        this.height = height;
        this.marginRatio = marginRatio;
        this.aspectRatio = height / width;
        this.calculateDimensions();
    }

    calculateDimensions() {
        if(this.aspectRatio > windowHeight / windowWidth){
            this.margin = windowHeight * this.marginRatio;
            this.screenHeight = windowHeight - this.margin * 2;
            this.screenWidth = this.screenHeight / this.aspectRatio;
        }else{
            this.margin = windowWidth * this.marginRatio;
            this.screenWidth = windowWidth - this.margin * 2;
            this.screenHeight = this.screenWidth * this.aspectRatio;
        }
        this.originX = (windowWidth - this.screenWidth) / 2;
        this.originY = (windowHeight - this.screenHeight) / 2;
    }

    display() {
        background('#222222')
        push();
        translate(frame.originX + effects.screenShake[0] * frame.screenWidth / frame.width, frame.originY + effects.screenShake[1] * frame.screenWidth / frame.width);
        scale(frame.screenWidth / frame.width);
        OnRender();
        pop();    
    }
}