let Effects = class{
    constructor() {
        this.impacts = [];
        this.screenShake = [0, 0];
        this.screenShakeTime = 0;
    }

    display(){
        for(let i = 0; i < this.impacts.length; i++){
            graphics.displaySlapSprite(this.impacts[i][0], this.impacts[i][1], 4 - floor(this.impacts[i][2]/5));
        }
    }

    add(newEffects){
        if(newEffects && newEffects.length){
            for(let i = 0; i < newEffects.length; i++){
                this.impacts.push([newEffects[i][0], newEffects[i][1], 19]);
            }
            this.screenShakeTime = 5;
        }
    }

    update(){
        if(this.screenShakeTime > 0){
            this.screenShake = [
                ((random(0, 1) > 0.5) ? -1 : 1) * (gameMap.tileSize/8),
                ((random(0, 1) > 0.5) ? -1 : 1) * (gameMap.tileSize/8)
            ];
        }else{
            this.screenShake = [0, 0];
        }

        for(let i = 0; i < this.impacts.length; i++){
            this.impacts[i][2] --;
            if(this.impacts[i][2] <= 0){
                this.impacts.pop(i);
                i--;
            }
        }
    
        this.screenShakeTime --;
    }
}