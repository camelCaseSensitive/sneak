let playerSpeed = 1.25;
let pers = 34;            // Room Perspective
let lightLength = 130;
let stairColor = [100,60,30]
let gate = false;
let lightImg;
let columns = [[175, 130], [175, 230], [100, 100]];

function preload(){
  lightImg = loadImage('light.png')
}

function setup() {
  createCanvas(400, 400);
  enemy = new Enemy({x: 60, 
                     y: 200, 
                     d: 20, 
                     chase: false, 
                     moving: true, 
                     speed: 0.9, 
                     targetX: 100, 
                     targetY: 200});
  player = new Player({x: 350, 
                       y: 350, 
                       d: 20});
  enemy.move(300,100, 1);
  laser = new Laser({active: true, 
                     x: 25, 
                     y: 60, 
                     i: 0});
  blinker = new Blinker({x: 40, 
                         y: 370, 
                         t: 0, 
                         armed: true, 
                         heading: PI/4});
  twinkler = new Twinkler({owner: enemy, 
                           x: enemy.x, 
                           y: enemy.y, 
                           t: 0});
  intro = new Message({message:"get to the stairs", 
                       x: 110, 
                       y: 100, 
                       i: 1});
  needKey = new Message({message:"needs a key", 
                         x: 160, 
                         y: 350, 
                         i: 1});
  needsKey = false;
  lasersDisabled = new Message({message:"system disarmed", 
                                x: 160, 
                                y: 350, 
                                i: 1});
  laserDisable = false;
  levelComplete = false;
  levelDone = new Message({message: "nice work", 
                           x: 150, 
                           y: 100, 
                           i: 1})
  caught = new Message({message: "you were caught", 
                        x: 110, 
                        y: 100, 
                        i: 1})
  gameOver = false;
  blackScreen = new Screen({i:0, speed: 2.5})
}

function draw() {
  room(pers);
  for(let i = 1; i <= ceil(pers/10); i++) {
    // fill(80 - i*10);
    fill(stairColor[0] - i*10, stairColor[1] - i*10, stairColor[2] - i*10)
    rect(175, pers-10*i, 40, 10)
  }
  if(gate) {
    for(let i = 1; i <= ceil(pers/10); i++) {
      stroke(190);
      line(175+10*i-5, 0, 175 + i*10-5, pers)
    }
  }
  
  if(laser.active) {
    
  }
  
  player.update();
  player.draw();
  if(enemy.moving) {
    enemy.move();
  } else if(!enemy.chase){
    enemy.turn();
  } else if(enemy.chase && !gameOver) {
    enemy.move();
  }
  enemy.update();
  
  enemy.draw();
  blinker.blink();
  
  player.draw();
  twinkler.twinkle();
  intro.display()
  laser.draw();
  
  enemy.detect();
  
  if(dist(player.x, player.y, enemy.x, enemy.y) < 30 && twinkler.owner == enemy && !enemy.chase){
    twinkler.owner = player;
  }
  if(dist(player.x, player.y, blinker.x, blinker.y) < 17){
    if(twinkler.owner == player && lasersDisabled.i < 100) {
      laserDisable = true;
      laser.active = false;
      blinker.armed = false;
      twinkler.owner = blinker;
    } else if(twinkler.owner == enemy) {
      if(needKey.i >= 100) needKey.i = 0;
      needsKey = true;
    }
  }
  if(needsKey) {
    needKey.display();
    if(needKey.i >= 100) needsKey = false;
  }
  if(laserDisable) {
    lasersDisabled.display();
    if(lasersDisabled.i >= 100) laserDisable = false;
  }
  
  if(laser.active && abs(player.y - laser.y) < 10){
    gate = true;
  }

  if(dist(player.x, player.y, 195, pers) < 20 && !gate){
    levelComplete = true;
    // gameOver = true;
    enemy.chase = false;
  }
  if(levelComplete){
    if(player.y > -50) {
      player.y -= 1;
    } else {
      blackScreen.fadeOut();
      levelDone.display();
    }
  }
  if(enemy.chase && dist(player.x, player.y, enemy.x, enemy.y) < 20 && !levelComplete){
    gameOver = true;
    enemy.moving = false;
    blackScreen.fadeOut();
    caught.display()
  }
  
}

class Screen {
  constructor(parameters) {
    Object.assign(this, parameters);
  }
  
  fadeOut() {
    background('rgba(0,0,0, ' + (this.i/100) + ')');
    if(this.i < 100) this.i += this.speed;
  }
}


class Player {
  constructor(parameters) {
    Object.assign(this, parameters);
    this.heading = -PI/2;
    this.xprev = this.x;
    this.yprev = this.y
  }
  
  update() {
    this.xprev = this.x;
    this.yprev = this.y;
    if(this.x > pers + 11 && !gameOver)this.x -= (keyIsDown(LEFT_ARROW)) + keyIsDown(LEFT_ARROW)*(1 - sqrt(2))*keyIsDown(UP_ARROW) + keyIsDown(LEFT_ARROW)*(1 - sqrt(2))*keyIsDown(DOWN_ARROW);
    if(this.x < width-pers-11 && !gameOver) this.x += (keyIsDown(RIGHT_ARROW)) + keyIsDown(RIGHT_ARROW)*(1 - sqrt(2))*keyIsDown(UP_ARROW) + keyIsDown(RIGHT_ARROW)*(1 - sqrt(2))*keyIsDown(DOWN_ARROW);
    
    if(this.x != this.xprev) this.x += sign(this.x-this.xprev) * (playerSpeed-1)
    
    if(circRect(this.x, this.y, 10, 175, 130, 30, 30) || circRect(this.x, this.y, 10, 175, 230, 30, 30)){
      this.x = this.xprev;
    }
    if (dist(player.x, player.y, enemy.x, enemy.y) < 20){
      this.x = this.xprev;
    }
    
    if(this.y < height-pers-11 && !gameOver)this.y += keyIsDown(DOWN_ARROW) + keyIsDown(DOWN_ARROW)*(1 - sqrt(2))*keyIsDown(LEFT_ARROW) + keyIsDown(DOWN_ARROW)*(1 - sqrt(2))*keyIsDown(RIGHT_ARROW);
    if(this.y > pers + 11 && !gameOver)this.y -= keyIsDown(UP_ARROW) + keyIsDown(UP_ARROW)*(1 - sqrt(2))*keyIsDown(LEFT_ARROW) + keyIsDown(UP_ARROW)*(1 - sqrt(2))*keyIsDown(RIGHT_ARROW);
    
    if(this.y != this.yprev) this.y += sign(this.y-this.yprev) * (playerSpeed-1)
    
    // if(circRect(this.x, this.y, 10, 175, 130, 30, 30) || circRect(this.x, this.y, 10, 175, 230, 30, 30)){
    //   this.y = this.yprev;
    // }
    
    for(let i = 0; i < columns.length; i++){
      let col = columns[i];
      if(circRect(this.x, this.y, 10, col[0], col[1], 30, 30)) this.y = this.yprev;
    }
    
    if (dist(player.x, player.y, enemy.x, enemy.y) < 20){
      this.y = this.yprev;
    }
    
    if(this.x != this.xprev || this.y != this.yprev){
      this.heading = atan2(this.y-this.yprev, this.x-this.xprev)
    }
  }
  
  draw() {
    fill(90);
    stroke(0);
    strokeWeight(1);
    circle(this.x, this.y, this.d);
  }
}

class Enemy {
  constructor(parameters) {
    Object.assign(this, parameters);
    this.wait = 0;
    this.newTargetX =  0;
    this.newTargetY = 0;
    this.angle = 0
    this.xprev = this.x;
    this.yprev = this.y;
    this.scanDirection = 1;
  }
  
  update() {
    fill(80); 
    circle(this.x, this.y, this.d);
  }
  
  detect() {
    if(get(player.x + 11, player.y)[0] > 120){
      enemy.chase = true;
    }
    if(get(player.x - 11, player.y)[0] > 120){
      enemy.chase = true;
    }
    if(get(player.x, player.y + 11)[0] > 120){
      enemy.chase = true;
    }
    if(get(player.x, player.y - 11)[0] > 120){
      enemy.chase = true;
    }
  }
  
  draw() {
    push();
      translate(this.x, this.y)
      rotate(this.th-PI/2)
      image(lightImg, -width/2, -height/2, width, height)
    pop();
    for(let i = 0; i < columns.length; i++){
      let col = columns[i];
      column(col[0], col[1], 30)
    }
    stroke(0)
    strokeWeight(1);
    fill(80); 
    circle(this.x, this.y, this.d);
  }
  
  move() {
    if(this.chase){
      this.targetX = player.x;
      this.targetY = player.y;
    }
    let dx = this.targetX - this.x;
    let dy = this.targetY - this.y;
    this.th = atan2(dy, dx);
    this.speedX = this.speed * cos(this.th);
    this.speedY = this.speed * sin(this.th);
    
    if (abs(dx) > this.speed || abs(dy) > this.speed) {
      this.x += this.speedX;
      for(let i = 0; i < columns.length; i++){
        let col = columns[i];
        if(circRect(this.x, this.y, 10, col[0], col[1], 30, 30)){
          if(!this.chase) {
            if(this.targetY > pers + 11 && this.targetY < height - pers - 11) { 
              this.targetY += sign(this.x - this.xprev)*this.scanDirection;
            }
            if(this.targetX > pers + 11 && this.targetX < width - pers - 11) this.targetX -= sign(this.y-this.yprev)*this.scanDirection;
            this.x = this.xprev;
            // this.targetX = random(pers+11,width-pers-11);
            // this.targetY = random(pers+11,height-pers-11);
          } else {
            this.x = this.xprev;
          }
        }
      }
      if (dist(player.x, player.y, enemy.x, enemy.y) < 20 && !this.chase){
        this.x = this.xprev;
      }
      this.y += this.speedY;
      for(let i = 0; i < columns.length; i++){
        let col = columns[i];
        if(circRect(this.x, this.y, 10, col[0], col[1], 30, 30)){
          if(!this.chase) {
            if(this.targetX > pers + 11 && this.targetX < width - pers - 11) this.targetX -= sign(this.y-this.yprev)*this.scanDirection;
            if(this.targetY > pers + 11 && this.targetY < width - pers - 11) this.targetY += sign(this.x - this.xprev)*this.scanDirection;
            this.y = this.yprev;
            // this.targeyX = random(pers+11,width-pers-11);
            // this.targetY = random(pers+11,height-pers-11);
          } else {
            this.y = this.yprev;
          }
        }
      }
      if (dist(player.x, player.y, enemy.x, enemy.y) < 20  && !this.chase){
        this.y = this.yprev;
      }
    } else {
      this.moving = false;
    }
    this.xprev = this.x;
    this.yprev = this.y;
  }
  
  turn() {
    if(this.wait == 0){
      this.newTargetX = random(pers+11,175-11);
      this.newTargetY = random(pers+11,height-pers-11);
      this.angle = atan2(this.newTargetY - this.y, this.newTargetX - this.x) - this.th;
    }
    this.th += this.angle/100;

    this.wait += 1;
    
    if(this.wait > 100){
      this.targetX = this.newTargetX;
      this.targetY = this.newTargetY;
      this.wait = 0;
      this.moving = true;
    }
  }
}

class Laser {
  constructor(params){
    Object.assign(this, params);
  }
  
  draw() {
    // this.y += sin(this.i)/2;
    // this.i += 0.01;
    if(this.active){
      stroke('rgba(255,0,0,0.5)');
      fill('rgba(255,0,0,0.5)')
      circle(this.x, this.y, 2)
      line(this.x, this.y, width-this.x, this.y)
      stroke(0)
    } else {
      stroke('rgba(0,255,0,0.5)');
      fill('rgba(0,255,0,0.5)')
      circle(25, 50, 2)
      stroke(0)
    }
    
  }
}

class Blinker {
  constructor(params){
    Object.assign(this, params);
  }
  
  blink() {
    // this.x = enemy.x - 10*cos(enemy.th - 0.5);
    // this.y = enemy.y - 10*sin(enemy.th - 0.5);
    if(this.t > 10){
      this.t = 0;
    } else {
      this.t += 0.1
    }
    noStroke()
    if(this.armed) {
      fill('rgba(255, 0, 0, ' + (1.1 - this.t/10) + ')')
    } else {
      fill('rgba(0, 255, 0, ' + (1.1 - this.t/10) + ')')
    }
    circle(this.x, this.y, this.t)
  }
  
}

class Message {
  constructor(params){
    Object.assign(this, params);
    this.counter = 0;
  }
  
  display() {
    if(this.i != 100){ 
      fill('rgba(240, 240, 240, ' + ((100-this.i)/100) + ')');
      noStroke()
      textFont("monospace", 20);
      if(this.i < this.message.length){
        this.type()
      } else {
        this.show()
      } 
    }
  }
  
  type() {
    text(this.message.substring(0,this.i), this.x, this.y);
    stroke(0)
    if(this.counter > 3){
      this.i += 1;
      this.counter = 0;
    }
    this.counter += 1;
  }
  
  show() {
    text(this.message, this.x, this.y)
    stroke(0)
    if(this.i < 100) this.i += 0.5;
  }
  
}

class Twinkler {
  constructor(params){
    Object.assign(this, params);
  }
  
  twinkle() {
    if(this.owner == enemy){
      this.x = this.owner.x - 10*cos(enemy.th - 0.5);
      this.y = this.owner.y - 10*sin(enemy.th - 0.5);
    } else if(this.owner == player) {
      this.x = this.owner.x + 13*cos(this.owner.heading + 0.5);
      this.y = this.owner.y + 13*sin(this.owner.heading + 0.5);
    } else {
      this.x = this.owner.x + 5*cos(this.owner.heading + 0.5);
      this.y = this.owner.y + 5*sin(this.owner.heading + 0.5);
    }
    
    if(this.t > 10){
      this.t = 0;
    } else {
      this.t += 0.1
    }
    noStroke()
    fill('rgba(255, 215, 0, ' + (1.1 - this.t/10) + ')');
    star(this.x, this.y, this.t/4.5, this.t, 4);
    stroke(0)
  }
  
}

function room(p) {
  background(50);
  line(0,0,p,p)
  line(width, 0, width-p, p);
  line(width,height, width-p, height-p)
  line(0, height, p, height-p)
  fill(40)
  rect(p, p, width -2*p, height-2*p)
}

function column(x, y, s) {
  fill(100)
  rect(x, y, s, s)
  let a = atan2(y + s/2 - enemy.y, x + s/2 - enemy.x);
  let d = dist(enemy.x, enemy.y, x + s/2 - enemy.x, y + s/2 - enemy.y);
  let deltath = enemy.th - a;
  let shad = 40;
  let darkness = 40-5/(abs(deltath)**2) < 20 ? 20 : 40-5/(abs(deltath)**2);
  fill(darkness);
  stroke(darkness);
  strokeWeight(0.1)
  quad(x, y, 
       x + shad*cos(a), y + shad*sin(a), 
       x + shad*cos(a) + s, y + shad*sin(a), 
       x + s, y);
  quad(x + s, y, 
       x + s + shad*cos(a), y + shad*sin(a), 
       x + shad*cos(a) + s, y + shad*sin(a) + s, 
       x + s, y + s);
  quad(x, y, 
       x + shad*cos(a), y + shad*sin(a), 
       x + shad*cos(a), y + shad*sin(a) + s, 
       x, y + s);
  quad(x, y + s, 
       x + s, y + s, 
       x + shad*cos(a) + s, y + shad*sin(a) + s, 
       x + shad*cos(a), y + shad*sin(a) + s);
  fill(100)
  rect(x, y, s, s)
}

function star(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius2;
      let sy = y + sin(a) * radius2;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius1;
      sy = y + sin(a + halfAngle) * radius1;
      vertex(sx, sy);
    }
  endShape(CLOSE);
}

function sign(x) {
  if(x > 0){
    return 1;
  } else if(x == 0){
    return 0;
  } else {
    return -1;
  }
}

function circRect(cx, cy, rad, rx, ry, rw, rh) {
 let testX = cx;
  let testY = cy;
  
  if (cx < rx)         testX = rx;      // test left edge
  else if (cx > rx+rw) testX = rx+rw;   // right edge
  if (cy < ry)         testY = ry;      // top edge
  else if (cy > ry+rh) testY = ry+rh;   // bottom edge
  
  let d = dist(cx, cy, testX, testY);
  
    if (d <= rad) {
    return true;
  }
  return false;

}