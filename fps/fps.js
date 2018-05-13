var state = {};
var mx = 0;
var my = 0;
function reset() {
  state.updates = [
    new player(),
    bullet_pool,
    enemies
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  reset();


  for (var i = 0; i < 30; i++) {
    var e = enemies.allocate(enemy);
    e.position.x = random(-width * 0.4, width * 0.4);
    e.position.y = random(-height * 0.4, height * 0.4);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);
  fill(255, 150);
  noStroke();
  rect(0, 0, 10000, 10000);
  mx = mouseX - width / 2;
  my = mouseY - height / 2;
  translate(width / 2, height / 2);
  for (var i = 0; i < state.updates.length; i++) {
    state.updates[i].update();
  }
  for (var i = 0; i < state.updates.length; i++) {
    state.updates[i].render();
  }
}
