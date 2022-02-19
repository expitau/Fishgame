let Effects = class{
    constructor() {
        this.spriteEffects = [];
        this.screenShake = [0, 0];
        this.screenShakeTime = 0;
    }

    /* Use this to display effects on frame tick */
    display(){
        for(let i = 0; i < this.spriteEffects.length; i++){
            graphics.displaySlapSprite(this.spriteEffects[i][0], this.spriteEffects[i][1], 4 - floor(this.spriteEffects[i][2]/5));
        }
    }

    /* Use this to add any new effets (spriteEffects should be updated to include effect ID once there are more than one type of effect)*/
    add(newEffects){
        if(newEffects && newEffects.length){
            for(let i = 0; i < newEffects.length; i++){
                this.spriteEffects.push([newEffects[i][0], newEffects[i][1], 19]);
            }
            this.screenShakeTime = 5;
        }
    }

    /* Use this to update effects on game tick */
    update(){
        // screenshake
        if(this.screenShakeTime > 0){
            this.screenShake = [
                ((random(0, 1) > 0.5) ? -1 : 1) * (gameMap.tileSize/8),
                ((random(0, 1) > 0.5) ? -1 : 1) * (gameMap.tileSize/8)
            ];
        }else{
            this.screenShake = [0, 0];
        }
        this.screenShakeTime --;

        // slap effect
        for(let i = 0; i < this.spriteEffects.length; i++){
            this.spriteEffects[i][2] --;
            if(this.spriteEffects[i][2] <= 0){
                this.spriteEffects.pop(i);
                i--;
            }
        }
    }
}