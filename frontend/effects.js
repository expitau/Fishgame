let Effects = class{
    constructor() {
        this.effectList = [];
        this.screenShake = [0, 0];
        this.screenShakeTime = 0;
    }

    /* Use this to display effects on frame tick */
    display(){
        for(let i = 0; i < this.effectList.length; i++){
            switch(this.effectList[i][0]) {
                case "impact": //[world coordinates, time]
                    // display
                    graphics.displaySlapSprite(this.effectList[i][1], this.effectList[i][2], 4 - Math.floor(this.effectList[i][3]/4));
                    // handle update
                    this.effectList[i][3] --;
                    if(this.effectList[i][3] <= 0){
                        this.effectList.pop(i);
                        i--;
                    }
                break;
                case "kill": //[player id, radians, time]
                    graphics.addDeathEffect(this.effectList[i][1], this.effectList[i][2], this.effectList[i][3], this.effectList[i][4]);
                    // handle update
                    this.effectList[i][5] --;
                    if(this.effectList[i][5] <= 0){
                        this.effectList.pop(i);
                        i--;
                    }
                break;
            }
        }
    }

    /* Use this to add any new effets to the list*/
    add(newEffects){
        if(newEffects && newEffects.length){
            for(let i = 0; i < newEffects.length; i++){
                this.effectList.push(newEffects[i]);
            }
            this.screenShakeTime = 3;
        }
    }

    /* Animations not associated with a single effect */
    update(){
        // screenshake
        if(this.screenShakeTime > 0){
            this.screenShake = [
                ((Math.random() > 0.5) ? -1 : 1) * (gameMap.tileSize/8),
                ((Math.random() > 0.5) ? -1 : 1) * (gameMap.tileSize/8)
            ];
        }else{
            this.screenShake = [0, 0];
        }
        this.screenShakeTime --;
    }
}