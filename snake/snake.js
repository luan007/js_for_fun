var state = {};
var sz;
var block = 10;

function reset() {
  sz = createVector(15, 15)
    state.snake = [createVector(0, 0), createVector(0, 1)];
  state.velocity = createVector(0, -1);
  state.lastTick = millis();
  state.gameSpeed = 100;
  state.dead = false;
  state.food = [];
  state.max_food = 3;
  state.shake = 0;
}

function setup() {
  createCanvas(400, 400);
  rectMode(CENTER);
  reset();
}

function update() {

  if (state.dead) {
    return;
  }
  state.shake = state.shake -= 0.01;
  state.shake = max(0, state.shake);
  if (millis() - state.lastTick > state.gameSpeed) {
    state.lastTick = millis();
    var head = state.snake[0].copy();
    head = head.add(state.velocity);

    if (head.x < -sz.x || head.x > sz.x
      || 
      head.y < -sz.y || head.y > sz.y) {
      state.dead = true;
    }

    for (var i = 0; i < state.snake.length; i++) {
      if (state.snake[i].x == head.x && state.snake[i].y == head.y) {
        state.dead = true;
        return;
      }
    }

    state.snake.unshift(head);
    var ate = false;
    for (var i = 0; i < state.food.length; i++) {
      if (state.food[i].x == head.x && state.food[i].y == head.y) {
        state.food[i] = createVector(
          floor(random(-sz.x, sz.x)), 
          floor(random(-sz.y, sz.y))
          );
        state.gameSpeed -= 2;
        state.gameSpeed = max(state.gameSpeed, 30);
        ate = true;
        state.shake = true;
        break;
      }
    }
    if (!ate) {
      var tail = state.snake.pop();
    }
    while (state.food.length < state.max_food) {
      state.food.push(createVector(
        floor(random(-sz.x, sz.x)), 
        floor(random(-sz.y, sz.y))
        ));
    }
  }
}

function keyPressed() {
  if (key == 'R' && state.dead) {
    reset();
  } else if (key == 'W' && state.velocity.y == 0) {
    state.velocity.y = -1;
    state.velocity.x = 0;
  } else if (key == 'A' && state.velocity.x == 0) {
    state.velocity.x = -1;
    state.velocity.y = 0;
  } else if (key == 'S' && state.velocity.y == 0) {
    state.velocity.y = 1;
    state.velocity.x = 0;
  } else if (key == 'D' && state.velocity.x == 0) {
    state.velocity.x = 1;
    state.velocity.y = 0;
  }
}
function draw() {

  update();
  fill(0, 40);
  noStroke();
  rect(0, 0, 10000, 10000);
  fill(255);
  text(
    (state.dead ? "Press R to Reset - " : "") +
    ("Score :" + (state.snake.length - 2)) 
    , 5, 15);
    
  
  translate(width / 2, height / 2);
  translate(cos(millis() / 10) * state.shake * 2, sin(millis() / 20) * state.shake * 2);
  //draw arena
  for (var x = -sz.x; x <= sz.x; x++) {
    for (var y = -sz.y; y <= sz.y; y++) {
      push();
      stroke(70);
      noFill();
      translate(x * block, y * block);
      rect(0, 0, block, block);
      pop();
    }
  }
  state.snake.forEach(function(p) {
    push();
    fill(255);
    noStroke();
    translate(p.x * block, p.y * block);
    rect(0, 0, block, block);
    pop();
  }
  );
  state.food.forEach(function(p) {
    push();
    fill(100, 0, 0);
    stroke(255, 0, 0, pow(sin(millis() / 1000), 4) * 255);
    translate(p.x * block, p.y * block);
    rect(0, 0, block, block);
    pop();
  }
  );
}
