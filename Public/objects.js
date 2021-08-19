class Grid{
    constructor(x, y){
        this.x=x
        this.y=y
        this.inUse=false
        this.letter=''
    }

    drawSquare(){
        push()
        if(gameGenerated==false)
            fill(180)
        else
            fill(230)
        square(this.x * squareSide + 25,this.y * squareSide + 25,squareSide)
        if(this.letter!='' && gameGenerated==true){
            fill(0)
            textAlign(CENTER, CENTER)
            textSize(squareSide)
            stroke(0)
            strokeWeight(0)
            textFont('robotto')
            text(this.letter, (this.x)*squareSide + 25, (this.y)*squareSide + 25, squareSide, squareSide)
        }
        pop()
    }
}


class Word{
    constructor(string, length, index){
        this.string= string
        this.length= length
        this.index=index
        this.direction=round(random(0,1)) // 0-Horizontal; 1-Vertical
        this.x
        this.y
        this.overlapping=false

    }
}