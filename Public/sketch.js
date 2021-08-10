let origSize
let origWidth
let gridX
let gridY
let squareSide
let grid
let outputGrid
let selecting
let words
let wordInput
let submitBtn
let generateBtn
let gameGenerated
let robotto


function preload(){
    robotto= loadFont('Assets/Fonts/Roboto-Bold.ttf')
}

function setup(){
    createCanvas(windowWidth,windowHeight)

    wordInput= createInput()
    wordInput.position(312.5,550)
    wordInput.size(100,25)

    submitBtn= createButton('Submit')
    submitBtn.position(422.5,556.25)
    submitBtn.mousePressed(submitWord)

    generateBtn= createButton('Generate Puzzle')
    generateBtn.position(675,556.25)
    generateBtn.mousePressed(generatePuzzle)

    words=[]
    grid=[]
    outputGrid=[]

    gameGenerated=false
    selecting=true

    origSize=30
    origWidth=500
    squareSide=origWidth/origSize

    for(let i=0; i<origSize; i++){
        grid[i]=[]
        for(let j=0; j<origSize; j++){
            grid[i][j]= new Grid(i,j)
        }
    }
}

function draw(){
    background(255)

    for(let i=0; i<origSize; i++){ // Draw background grid
        for(let j=0; j<origSize; j++){
            square(grid[i][j].x * squareSide + 25,grid[i][j].y * squareSide + 25,squareSide)
        }
    }

    if(selecting==true){ // If currently choosing the size of the new grid
        if(mouseX>25+squareSide && mouseX<origWidth + 25){
            gridX=Math.ceil((mouseX-25)/squareSide)
        }else{
            if(mouseX<=25+squareSide)
                gridX=1
            else
                gridX=origSize
        }
        if(mouseY>25+squareSide && mouseY<origWidth + 25){
            gridY=Math.ceil((mouseY-25)/squareSide)
        }else{
            if(mouseY<=25+squareSide)
                gridY=1
            else
                gridY=origSize
        }

        push()
        fill(200)
        for(let i=0; i<gridX; i++){
            for(let j=0; j<gridY; j++){
                square(grid[i][j].x * squareSide + 25,grid[i][j].y * squareSide + 25,squareSide)
            }
        }
        pop()
    }else if(outputGrid.length>0){ // If selected the new grid
        for(let i=0; i<gridX; i++){
            for(let j=0; j<gridY; j++){
                outputGrid[i][j].drawSquare()
            }
        }
    }

    push()
    text('X: '+gridX+' Y: '+gridY, 312.5,600)
    pop()

    {push() // Word box
        fill(230)
        strokeWeight(2)
        rect(550,25,450,500)

        fill(220)
        rect(550,25,450,75)

        fill(0)
        textSize(25)
        textAlign(CENTER,CENTER)
        text('Words used: ',550,25,450,75)

        textSize(15)
        if(words.length>0){
            for(let i=0,j=0; i<words.length;i++,j++){
                if(j>2){
                    j=0
                }

                textFont('robotto')
                if(100 + (Math.floor(i/3)*35)<490)
                text(words[i].string, 550 + (j*150), 100 + (Math.floor(i/3)*35), 150, 35)
            }
        }
    pop()}
}

function mousePressed(){
    if((mouseX>squareSide && mouseX<525) && (mouseY>squareSide && mouseY<525) && words.length==0){
        if(selecting==true){

            for(let i=0; i<gridX; i++){
                outputGrid[i]=[]
                for(let j=0; j<gridY; j++){
                    outputGrid[i][j]= new Grid(i,j)
                }
            }
            selecting=false
            
        }else{
            selecting=true
        }
    }else if((mouseX>squareSide && mouseX<525) && (mouseY>squareSide && mouseY<525) && words.length!=0){
        alert('You can\'t change the size of your grid once a word has been submitted')
    }
}

function keyPressed(){
    switch(keyCode){
        case 17:
            if(confirm('Refresh the page?'))
                setup()
            break

        case 13:
            submitWord()
            break
    }
}

function submitWord(){
    let word=wordInput.value()
    if(gameGenerated==false){
        if(word!='' && selecting==false && (word.length<=Math.ceil(gridX - gridX/3) || word.length<=Math.ceil(gridY - gridY/3))){
            words.push(new Word(word, word.length, words.length))
            setTimeout(function(){
                assignCoords(words[words.length-1].index)
            },100)

            wordInput.value(null)
        }else{
            if(selecting==true){
                wordInput.value(null)
                setTimeout(function(){
                    alert('First choose the size of the grid')
                },100)
            }
            if(!(word.length<=Math.ceil(gridX - gridX/3) || word.length<=Math.ceil(gridY - gridY/3))){
                wordInput.value(null)
                setTimeout(function(){
                    alert('Your word does not fit into the grid')
                },100)
            }
        }
    }
}

function generatePuzzle(){
    for(let i=0;i<gridX;i++){
        for(let j=0;j<gridY;j++){
            if(outputGrid[i][j].inUse==false){
                let ranLetter= String.fromCharCode(97+round(random(0,25)))
                
                outputGrid[i][j].letter=ranLetter
                outputGrid[i][j].inUse=true
            }
        }
    }
    gameGenerated=true
}

function assignCoords(index){
    let failed=false
    let direction=words[index].direction
    let word=words[index].string

    let origX=round(random(1, (gridX - word.length)))
    let origY=round(random(1, gridY))

    if(direction==0){
        for(let i=0; i<word.length; i++){
            if(outputGrid[origX-1 + i][origY-1].inUse==true){
                assignCoords(index)
                failed=true
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
        }
    }else{
        for(let i=0; i<word.length; i++){
            if(outputGrid[origX-1 + i][origY-1].inUse==true){
                assignCoords(index)
                failed=true
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
        }
    }
}