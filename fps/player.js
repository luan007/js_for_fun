function ease(a, b, t) {
    if (abs(a - b) < 0.0001) {
        return b;
    } else {
        return a + (b - a) * t;
    }
}

class pool {
    constructor(_constructor) {
        this._constructor = _constructor;
        this.objs = [];
    }
    update() {
        for (var i = 0; i < this.objs.length; i++) {
            if (!this.objs[i].dead) {
                this.objs[i].update();
            }
        }
    }
    render() {
        for (var i = 0; i < this.objs.length; i++) {
            if (!this.objs[i].dead) {
                this.objs[i].render();
            }
        }
    }
    allocate(aggressive_constructor) {
        for (var i = 0; i < this.objs.length; i++) {
            if (this.objs[i].dead) {
                if (aggressive_constructor) {
                    var t = new aggressive_constructor();
                    this.objs[i] = t;
                    return t;
                } else {
                    this.objs[i].dead = false;
                    return this.objs[i];
                }
            }
        }
        var d = aggressive_constructor ? new aggressive_constructor() : new this._constructor();
        this.objs.push(d);
        return d;
    }
}

class bullet {
    constructor() {
        this.damage = random(0.1, 0.5);
        this.position = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.momentum = 0.1;
        this.dead = false;
    }

    update() {
        this.position = this.position.add(this.velocity);
        if (this.position.x > width / 2 || this.position.x < -width / 2 ||
            this.position.y > height / 2 || this.position.y < -height / 2) {
            this.dead = true;
            return;
        }
        for (var i = 0; i < enemies.objs.length; i++) {
            if (!enemies.objs[i].dead && enemies.objs[i].testHit(this)) {
                this.dead = true;
                enemies.objs[i].curLife -= this.damage;
                enemies.objs[i].position.add(this.velocity.copy().mult(this.momentum));
                return;
            }
        }
    }

    render() {
        push();
        stroke(255, 0, 0);
        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading());
        line(0, 0, 15, 0);
        pop();
    }
}

class sniperBullet extends bullet {
    constructor() {
        super();
        this.damage = random(1, 5);
        this.position = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.momentum = 1;
        this.life = 1;
        this.dead = false;
    }
    update() {
        this.position = this.position.add(this.velocity);
        if (this.position.x > width / 2 || this.position.x < -width / 2 ||
            this.position.y > height / 2 || this.position.y < -height / 2) {
            this.dead = true;
            return;
        }
        for (var i = 0; i < enemies.objs.length; i++) {
            if (!enemies.objs[i].dead && enemies.objs[i].testHit(this)) {
                this.life -= 0.1;
                enemies.objs[i].curLife -= this.damage;
                enemies.objs[i].position.add(this.velocity.copy().mult(this.momentum));
            }
        }
        if(this.life <= 0) {
            this.dead = true;
        }
    }
}


class enemy {
    constructor() {
        this.position = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.targetVelocity = createVector(0, 0);

        this.fullLife = random(1, 10);
        this.curLife = this.fullLife;
        this.radius = random(10, 30);
        this.isHit = 0;
        this.dead = false;
    }

    testHit(bullet) {
        if (dist(this.position.x, this.position.y, bullet.position.x, bullet.position.y) < this.radius) {
            this.isHit = 1;
            return true;
        }
        return false;
    }

    update() {
        this.targetVelocity.x += random(-0.5, 0.5);
        this.targetVelocity.y += random(-0.5, 0.5);
        var heading_target = createVector((player.instance.position.x - this.position.x),
        (player.instance.position.y - this.position.y));
        heading_target = heading_target.normalize();
        this.targetVelocity.x += heading_target.x;
        this.targetVelocity.y += heading_target.y;
        this.targetVelocity.mult(0.8);

        this.velocity.x = ease(this.velocity.x, this.targetVelocity.x, 0.01);
        this.velocity.y = ease(this.velocity.y, this.targetVelocity.y, 0.01);
        this.position = this.position.add(this.velocity);
        this.curLife = max(this.curLife, 0);
        if (this.curLife == 0) {
            this.dead = true;
        }
    }

    render() {
        push();
        translate(this.position.x, this.position.y);

        push();
        translate(0, -20);
        stroke(0);
        noFill();
        rect(0, 0, 30, 4);
        fill(255, 0, 0);
        rect(0, 0, 30 * (this.curLife / this.fullLife), 4);
        pop();

        stroke(255, 0, 0);
        if (this.isHit) {
            fill(255, 0, 0);
        } else {
            noFill();
        }
        rotate(this.velocity.heading());
        rect(0, 0, this.radius, this.radius);
        pop();
        this.isHit = 0;
    }
}


var kp = '';
var kr = '';
function keyPressed() {
    kp = key;
    if (kr == key) {
        kr = '';
    }
}

function keyReleased() {
    if (kp == key) {
        kp = '';
    }
    kr = key;
}

class shotgun {
    constructor() {
        this.fireRate = 800;
        this.scatter = 1.1;
    }
    fire(player) {
        for (var i = 0; i < 30; i++) {
            var bullet = bullet_pool.allocate();
            bullet.position = player.position.copy();
            bullet.velocity = player.dir.copy().mult(random(-1, 1) + 20).add(createVector(
                random(-this.scatter, this.scatter),
                random(-this.scatter, this.scatter)
            ));
        }
    }
}

class fullyAutomatic {
    constructor() {
        this.fireRate = 30;
        this.scatter = 0.3;
    }
    fire(player) {
        for (var i = 0; i < 3; i++) {
            var bullet = bullet_pool.allocate();
            bullet.position = player.position.copy();
            bullet.damage = 1;
            bullet.velocity = player.dir.copy().mult(random(-1, 1) + 20).add(createVector(
                random(-this.scatter, this.scatter),
                random(-this.scatter, this.scatter)
            ));
        }
    }
}

class sniper {
    constructor() {
        this.fireRate = 1000;
    }
    fire(player) {
        for (var i = 0; i < 1; i++) {
            var bullet = bullet_pool.allocate(sniperBullet);
            bullet.position = player.position.copy();
            bullet.life = 1;
            bullet.velocity = player.dir.copy().mult(20).add(createVector(
                // random(-1.1, 1.1),
                // random(-1.1, 1.1)
            ));
        }
    }
}

var guns = [new sniper(), new shotgun(), new fullyAutomatic()];

class player {
    constructor() {
        player.instance = this;
        this.position = createVector(0, 0);
        this.speed = createVector(0, 0);
        this.real_position = createVector(0, 0);
        this.dir = createVector(0, 0);

        this.lastFire = 0;
        this.weapon = guns[0];
        this.rotation = 0;
    }
    update() {

        if(kr == '1') {
            this.weapon = guns[0];
        }
        if(kr == '2') {
            this.weapon = guns[1];
        }
        if(kr == '3') {
            this.weapon = guns[2];
        }

        if (kr == 'A' || kr == 'D') {
            this.speed.x = 0;
        }
        if (kr == 'W' || kr == 'S') {
            this.speed.y = 0;
        }
        if (kp == 'A') {
            this.speed.x = -3;
        }
        if (kp == 'D') {
            this.speed.x = +3;
        }
        if (kp == 'S') {
            this.speed.y = +3;
        }
        if (kp == 'W') {
            this.speed.y = -3;
        }
        this.real_position.add(this.speed);
        this.dir = createVector(mx - this.position.x, my - this.position.y).normalize();
        this.rotation = this.dir.heading();

        this.position.x = ease(this.position.x, this.real_position.x, 0.1);
        this.position.y = ease(this.position.y, this.real_position.y, 0.1);

        if (isMousePressed && (millis() - this.lastFire > this.weapon.fireRate)) {
            this.lastFire = millis();
            this.weapon.fire(this);
        }
    }
    render() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotation);
        fill(0);
        noStroke();
        rect(0, 0, 10, 10);
        rect(10, 0, 10, 3);
        pop();
    }
}


var bullet_pool = new pool(bullet);
var enemies = new pool(enemy);
