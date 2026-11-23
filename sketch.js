let bg, goalK, playerB, defender;
let players = [];

let state = 'menu';          // 'menu' | 'play' | 'over'
let result='';
let goals = 0;
let difficulty = 1;
let timeLeft = 60;
 
let redFlash = 0;
let winSound;
let gameOverSound;

const match_seconds = 60;
const max_goals = 3;
const acceleration = 0.9;
const acceleration_attacker = 0.55;


function preload()
{
    bg = loadImage('assets/images/football-pitch.png');
    goalK = loadImage('assets/images/characterRed (3).png');
    playerB = loadImage('assets/images/characterBlue (3).png');
    winSound = loadSound('assets/sounds/applause.wav');
    gameOverSound = loadSound('assets/sounds/GameOver.wav');
}

function setup()
{
    createCanvas(windowWidth,windowHeight);
    textFont('Trebuchet MS');
}

function createPlayers(){
    players = [];
    defender = new Player(400, 295, goalK, 'red', 'defender')
    players.push(defender);

    // blue team: enemies 
    players.push(new Player(1165, 220, playerB, 'blue', 'runner'));
    players.push(new Player(1165, 380, playerB, 'blue', 'runner'));
    players.push(new Player(1165, 550, playerB, 'blue', 'runner'));
    players.push(new Player(1015, 295, playerB, 'blue', 'runner'));
    players.push(new Player(1015, 465, playerB, 'blue', 'runner'));
}

function startGame(){
    goals = 0;
    result = '';
    difficulty = 1;
    timeLeft = match_seconds;
    state = 'play';
    createPlayers();
    redFlash = 0;
}

function updateGame(){
    if(state === 'play'){
        timeLeft -= deltaTime / 1000;

        if (timeLeft <= 0) {
            timeLeft = 0;
            result = 'won';
            state = 'over';

            if(winSound.isLoaded())
                winSound.play();
            return;
        }

        difficulty = 1 + (1 - timeLeft / match_seconds)*0.6

        for(const p of players){
           p.move();
        }

        for(let i=0; i < players.length; i++){
           for(let j = i+1; j < players.length; j++){
               const a = players[i];
               const b = players[j];
               if( a.team!== b.team && a.collision(b)){
                   a.bounce(b); 
               }
               else if(a.team === b.team && a.collision(b)){
                   a.separate(b);
               }
           }
        

            const staying = [];
            for(const p of players){
                if(p.role !== 'defender' && p.x<=windowWidth * 0.05 && p.y > windowHeight *0.38 && p.y < windowHeight *0.8){
                   goals ++;
                }
                else {
                   staying.push(p);
                }
            

                players = staying;

               if(goals >= max_goals){
                   result = 'lost';
                   state = 'over';

                   if(gameOverSound.isLoaded()){
                    gameOverSound.play();
                   }
               }
            }
        }
    }         
            
}

function draw()
{
    imageMode(CORNER);
    image(bg,0,0, windowWidth,windowHeight);

    if(redFlash > 0){
        rectMode(CORNER);
        noStroke();
        fill(255, 0, 0, redFlash);
        rect(0, 0, windowWidth, windowHeight);

        redFlash = max(0, redFlash - 8);
    }
    imageMode(CENTER);
    for (const p of players) {
        p.display();
    }

    displayInfo();

    if(state === 'play') updateGame();
    if(state === 'menu') displayMenu();
    if(state === 'over') displayGameOver();

}

function displayInfo(){
    rectMode(CENTER);
    noStroke();
    fill(0,150);
    rect(windowWidth/2, 40, 320, 56, 12);

    fill(255);
    textAlign(CENTER);
    textSize(22);
    text("Conceded: " + goals + "/" + max_goals, windowWidth/2, 30);

    const minutes = int (timeLeft / 60);
    const seconds = int (timeLeft % 60);

    text(minutes + ':' + nf(seconds, 2) , windowWidth/2, 54);
}

function drawButton(label){
    const x = windowWidth/2;
    const y = windowHeight/2 + windowHeight/9;

    rectMode(CENTER);
    noStroke();
    fill(232, 155, 5);
    rect(x, y, 220, 60);

    fill(255);
    textAlign(CENTER);
    textSize(30);
    text(label, x, y+10);
}

function displayMenu(){
    if(state === 'menu'){
        rectMode(CORNER);
        fill(0,170);
        noStroke();
        rect(windowWidth/4, windowHeight/4 , windowWidth/2, windowHeight/2);

        fill(255);
        textAlign(CENTER);
        textSize(60);
        text('Push Football', windowWidth/2, windowHeight/2 - windowHeight/7);

        textSize(20);
        text('No ball. 5 attackers run at your goal.', windowWidth/2, windowHeight/2 - windowHeight/14);
        text('Push them away until the time runs out!', windowWidth/2, windowHeight/2 - windowHeight/28);

        drawButton('Start');

        fill(255,180);
        textAlign(CENTER);
        textSize(16);
        text('Use arrow keys to move', windowWidth/2, windowHeight/6);
    }
}

function displayGameOver(){
    rectMode(CORNER);
    fill(0,170);
    noStroke();
    rect(windowWidth/4, windowHeight/4 , windowWidth/2, windowHeight/2);

    textAlign(CENTER);
    textSize(60);

    if(result === 'won'){
        fill(120, 255, 150);
        text('YOU SURVIVED!', windowWidth/2, windowHeight/2 - windowHeight/7);
    }
    else{
        fill(255, 90, 90);
        text('YOU LOST!', windowWidth/2, windowHeight/2 - windowHeight/7);
    }

    fill(255);
    textSize(30);
    text('Goals Conceded: '+ goals, windowWidth/2, windowHeight/2 - windowHeight/14);

    drawButton('Play again');
}

function mousePressed(){
    const x = windowWidth/2;
    const y = windowHeight/2 + windowHeight/9;

    if((state === 'menu' || state === 'over') && mouseX > x-110 && mouseX < x+110 && mouseY > y-30 && mouseY < y+30){
        startGame();
    }
}
 
class Player{
    constructor (x, y, image, team, role){
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.size = 75;
        this.image = image;
        this.team = team;
        this.role = role;

        this.pace = random(0.8, 1.0);
        this.delay = floor(random(30, 180));

        this.goalX = windowWidth * 0.05;
        this.goalY = windowHeight * random(0.4, 0.63);
        //this.reset();
    }

    //reset(){
   // }
    move(){
        this.minX = windowWidth*0.05;
        this.minY = windowHeight*0.09;
        this.maxX = windowWidth*0.95;
        this.maxY = windowHeight*0.92;

        if(this.role === 'defender'){
            if (keyIsDown(RIGHT_ARROW)) this.vx += acceleration;
            if (keyIsDown(LEFT_ARROW)) this.vx -= acceleration;
            if (keyIsDown(UP_ARROW)) this.vy -= acceleration;
            if (keyIsDown(DOWN_ARROW)) this.vy += acceleration;
        }
        else if(this.delay > 0){
            this.delay--;
        }
        else { 
           let tx = this.goalX;
           let ty = this.goalY;

            const d = dist(this.x, this.y, tx, ty);
            if(d > 1){
                const a = acceleration_attacker * this.pace * difficulty;
                this.vx += (tx - this.x) / d * a;
                this.vy += (ty - this.y) / d * a;
            }
        }

        this.vx *= 0.7;
        this.vy *= 0.7;

        this.x += this.vx;
        this.y += this.vy;

        if(this.x < this.minX) {
            this.x = this.minX;
            this.vx *= -0.7;
        }
        if(this.x > this.maxX) {
            this.x = this.maxX;
            this.vx *= -0.7;
        }
        if(this.y < this.minY) {
            this.y = this.minY;
            this.vy *= -0.7;
        }
        if(this.y > this.maxY) {
            this.y = this.maxY;
            this.vy *= -0.7;
        }
    }

    collision(other){
        return dist(this.x, this.y, other.x, other.y) < this.size/2 + other.size/2;
    }

    bounce(other){
        if(this.role !== 'defender') return;
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const d = dist(this.x, this.y, other.x, other.y);

        if(d === 0) return;

        other.vx *= (dx / d) * -15;
        other.vy *= (dy / d) * -15;

        other.x += other.vx;
        other.y += other.vy;

        other.delay = 10;
    }

    separate(other){
        const dx = other.x - this.x;
        const dy = other.y - this.y;

        const d = dist(this.x, this.y, other.x, other.y);

        if(d === 0) return;

        const overlap = (this.size/2 + other.size/2) - d;

        this.x -= (dx / d) * overlap / 2;
        this.y -= (dy / d) * overlap / 2;
        other.x += (dx / d) * overlap / 2;
        other.x += (dy / d) * overlap / 2;
    }

    display(){
        image(this.image, this.x, this.y, this.size, this.size);
         if (this.role=== 'defender') {
            noFill();
            stroke(255, 220, 0);
            strokeWeight(3);
            ellipse(this.x, this.y, this.size + 10, this.size + 10);
        }
    }
}