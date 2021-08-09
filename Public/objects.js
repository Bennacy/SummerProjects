class Grid{
    constructor(x, y){
        this.x=x
        this.y=y
        this.inUse=false
        this.letter=''
    }

    drawSquare(){
        push()
        fill(180)
        square(this.x * squareSide + 25,this.y * squareSide + 25,squareSide)
        if(this.letter!=''){
            fill(0)
            textAlign(CENTER, CENTER)
            textSize(squareSide)
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
        this.direction=1
        this.x
        this.y
        this.overlapping=false
        let coords=[]

        // switch(this.direction){
        //     case 1:
        //         coords=assignCoords(this.index)
        //         break
        // }
    }
}

function assignCoords(index){
    let failed=false
    let word=words[index].string

    let origX=round(random(1, (gridX - word.length)))
    let origY=round(random(1, gridY))

    for(let i=0; i<word.length; i++){
        if(outputGrid[origX-1 + i][origY-1].inUse==true){
            assignCoords(index)
            print('overlap')
            return
        }
    }

    if(failed==false){
        print('assigned')
        for(let i=0; i<word.length; i++){
            outputGrid[origX-1 + i][origY-1].inUse=true
            outputGrid[origX-1 + i][origY-1].letter=word.charAt(i)
        }

        words[index].x=origX
        words[index].y=origY

        return
    }else{
        print('overlap')
        return
    }
}