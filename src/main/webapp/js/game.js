// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};
bgImage.src = "images/background.png";

// Mad King image
var madKingReady = false;
var madKingImage = new Image();
madKingImage.onload = function () {
    madKingReady = true;
};
madKingImage.src = "images/madKing.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
    heroReady = true;
};
heroImage.src = "images/hero.png";

// Game objects
var madKing = {
    speed: 256 // movement in pixels per second
};
var hero = {};
var herosCaught = 0;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a hero
var reset = function () {
    madKing.x = canvas.width / 2;
    madKing.y = canvas.height / 2;

    // Throw the hero somewhere on the screen randomly
    hero.x = 32 + (Math.random() * (canvas.width - 64));
    hero.y = 32 + (Math.random() * (canvas.height - 64));
};

// Update game objects
var update = function (modifier) {
    if (38 in keysDown) { // Player holding up
        madKing.y -= madKing.speed * modifier;
    }
    if (40 in keysDown) { // Player holding down
        madKing.y += madKing.speed * modifier;
    }
    if (37 in keysDown) { // Player holding left
        madKing.x -= madKing.speed * modifier;
    }
    if (39 in keysDown) { // Player holding right
        madKing.x += madKing.speed * modifier;
    }

    // Are they touching?
    if (
        madKing.x <= (hero.x + 32)
        && hero.x <= (madKing.x + 32)
        && madKing.y <= (hero.y + 32)
        && hero.y <= (madKing.y + 32)
    ) {
        ++herosCaught;
        reset();
    }
};

// Draw everything
var render = function () {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }

    if (madKingReady) {
        ctx.drawImage(madKingImage, madKing.x, madKing.y);
    }

    if (heroReady) {
        ctx.drawImage(heroImage, hero.x, hero.y);
    }

    // Score
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Goblins caught: " + herosCaught, 32, 32);
};

// The main game loop
var main = function () {
    var now = Date.now();
    var delta = now - then;

    update(delta / 1000);
    render();

    then = now;

    // Request to do this again ASAP
    requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();
