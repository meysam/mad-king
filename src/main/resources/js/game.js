/**
 * Created by meysam on 8/6/17.
 */
$(document).ready(function () {

    var webSocket;
    var output = document.getElementById("output");
    var connectBtn = document.getElementById("connectBtn");
    var sendBtn = document.getElementById("sendBtn");
    var url = "ws://localhost:8080/madKing";
    var timeleft = 60;
    var endGameInterval;
    var onlineplayer = document.getElementById("onlinePlayer");

// Game objects
    var madKing = {
        speed: 256 // movement in pixels per second
    };
    var hero = {};
    var herosCaught = 0;
// Handle keyboard controls
    var keysDown = {};
//Canvas stuff
    var canvas = $("#canvasArea")[0];
    var ctx = canvas.getContext("2d");
    var w = $("#canvasArea").width();
    var h = $("#canvasArea").height();

// Background image
    var bgReady = false;
    var bgImage = new Image();
// Mad King image
    var madKingReady = false;
    var madKingImage = new Image();
// Hero image
    var heroReady = false;
    var heroImage = new Image();
    var then = Date.now();

    $(".StartButton").click(function () {
        $(".SplashScreen").hide();
        $(".FinishScreen").hide();
        clearInterval(endGameInterval);
        if (isConnected()) {
            $("#canvasArea").show();
            init();
        } else {
            alert('You are not yet connected');
            $(".SplashScreen").show();
        }
    });

    $("#connectBtn").click(function () {
        connect();
    });

    $("#sendBtn").click(function () {
        send();
    });


    function init() {
        herosCaught = 0;
        bgImage.onload = function () {
            bgReady = true;
        };
        bgImage.src = "images/background.png";


        madKingImage.onload = function () {
            madKingReady = true;
        };
        madKingImage.src = "images/madKing.png";


        heroImage.onload = function () {
            heroReady = true;
        };
        heroImage.src = "images/hero.png";


        addEventListener("keydown", function (e) {
            keysDown[e.keyCode] = true;
        }, false);

        addEventListener("keyup", function (e) {
            delete keysDown[e.keyCode];
        }, false);

        // Cross-browser support for requestAnimationFrame
        var w = window;
        requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

        // Let's play this game!
        reset();
        main();
    }

    // Reset the game when the player catches a hero
    var reset = function () {
        endGameInterval = setInterval(function () {
            endGame()
        }, 5000);
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
            clearInterval(endGameInterval);
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
        ctx.fillText("Hero caught: " + herosCaught, 32, 32);
    };

    // The main game loop
    var main = function () {
        var now = Date.now();
        var delta = now - then;

        update(delta / 1000);
        render();

        then = now;
        // endGame();
        requestAnimationFrame(main);
    };

    // End the game when the player is game over(mad king couldn't kill any hero)
    function endGame() {
        $("#canvasArea").hide();
        $("#score").text(herosCaught);
        $(".FinishScreen").show();
    }

    function connect() {
        // open the connection if one does not exist
        if (webSocket !== undefined
            && webSocket.readyState !== WebSocket.CLOSED) {
            return;
        }
        // Create a websocket
        webSocket = new WebSocket(url);

        webSocket.onopen = function (event) {
            updateOutputText("Connected!");
            connectBtn.disabled = true;
            sendBtn.disabled = false;

        };

        webSocket.onmessage = function (event) {
            updateOutput(event.data);
        };

        webSocket.onclose = function (event) {
            updateOutputText("Connection Closed");
            connectBtn.disabled = false;
            sendBtn.disabled = true;
        };
    }

    function isConnected() {
        return !(webSocket == undefined
        || webSocket.readyState == WebSocket.CLOSED);
    }

    function send() {
        var text = document.getElementById("input").value;
        var uid = document.getElementById("uid").value;
        var message = '{'
            + '"msg" : "' + text + '",'
            + '"uniqueId"  : "' + uid + '"'
            + '}';
        webSocket.send(message);
    }

    function closeSocket() {
        webSocket.close();
    }

    function updateOutputText(text) {
        output.value += "\n" + text;
        output.scrollTop = output.scrollHeight;
    }

    function updateOutput(text) {
        var message = JSON.parse(text);
        if (message.msg == "newClient") {
            var option = document.createElement("option");
            option.value = message.player.uid;
            option.text = message.player.name;
            onlineplayer.add(option);
        } else {
            JSON.parse(text, function (key, value) {
                if (key == "player") {
                    document.getElementById("name").value = value.name;
                    document.getElementById("uid").value = value.uid;
                    return value;
                } else {
                    return value;
                }
            });
        }
        output.value += "\n" + text;
        output.scrollTop = output.scrollHeight;
    }
});