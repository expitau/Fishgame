module.exports = class Map {
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.tilesize = 50;
        this.threshold = 0.6 // ∈ [0,1], higher means more tiles, lower means less tiles
        this.tilemap = generateMap(this.width, this.height, this.threshold)
    }
}

function generateMap(w, h, threshold) {
    tilemap = []
    for (let i = 0; i < h; i++) {
        row = []
        for (let j = 0; j < w; j++) {
            row.push(Math.random() < threshold)
        }
        tilemap.push(row)
    }

    function iterate(tilemap) {
        let newtilemap = JSON.parse(JSON.stringify(tilemap));

        function sumNeighbours(x,y){
            let sum = 0;
            for (let a = -1; a <= 1; a++){
                for (let b = -1; b <= 1; b++){
                    try {
                        sum += tilemap[x + a][y + b]
                    } catch (e) {
                        if (e instanceof TypeError){
                            continue;
                        } else {
                            throw e;
                        }
                    }
                }
            }
            return sum;
        }

        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                newtilemap[i][j] = sumNeighbours(i,j) >= 5;
            }
        }

        return newtilemap;
    }

    return iterate(iterate(tilemap))
}