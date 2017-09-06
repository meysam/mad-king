/**
 * Created by meysam on 8/6/17.
 */
(function () {

    /*=====D: All variables :D=====*/
    var webSocket;

    // Elements
    var output = document.getElementById("output");
    var connectBtn = document.getElementById("connectBtn");
    var playBtn = document.getElementById("playBtn");
    var sendBtn = document.getElementById("sendBtn");
    var startBtn = document.getElementById("startBtn");
    var playBtn = document.getElementById("playBtn");
    var splash = document.getElementById("splash");
    var finish = document.getElementById("finish");
    var canvas = document.getElementById("canvas");
    var score = document.getElementById("score");
    var onlineplayer = document.getElementById("onlinePlayer");

    var url = "ws://localhost:8080/madKing";
    var timeleft = 60;
    var endGameInterval;
    var playerType;

// Game objects
    var madKing = {
        speed: 256 // movement in pixels per second
    };
    var mKing = {
        speed: 256 // movement in pixels per second
    };
    var hero = {};
    var herosCaught = 0;
// Handle keyboard controls
    var keysDown = {};
//Canvas stuff
    var ctx = canvas.getContext("2d");
    canvas.width=512;
    canvas.height=480;

// Background image
    var bgReady = false;
    var bgImage = new Image();
// Mad King image
    var madKingReady = false;
    var madKingImage = new Image();
    // Monkey King image
    var mKingReady = false;
    var mKingImage = new Image();
// Hero image
    var heroReady = false;
    var heroImage = new Image();
    var then = Date.now();


    startBtn.onclick = function () {
        addClass(splash, 'display-none');
        addClass(finish, 'display-none');
        clearInterval(endGameInterval);
        if (isConnected()) {
            removeClass(canvas, 'display-none');
            init();
        } else {
            alert('You are not yet connected');
            removeClass(splash, 'display-none')
        }
    };

    connectBtn.onclick = function () {
        connect();
    };

    playBtn.onclick = function () {
        sendReqPlay();
    };

    sendBtn.onclick = function () {
        var chatMsg = document.getElementById("chatMsg").value;
        sendEvent("chat", chatMsg);
        updateOutputText(chatMsg);
    };

    /*===== All func for canvas =====*/

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

        mKingImage.onload = function () {
            mKingReady = true;
        };
        mKingImage.src = "images/monkey-king.png";


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
        }, 8000000);
        madKing.x = canvas.width / 2;
        madKing.y = canvas.height / 2;

        mKing.x = canvas.width / 3;
        mKing.y = canvas.height / 3;

        // Throw the hero somewhere on the screen randomly
        hero.x = 32 + (Math.random() * (canvas.width - 64));
        hero.y = 32 + (Math.random() * (canvas.height - 64));
    };

    // Update game objects
    var update = function (modifier, pType) {
        if (38 in keysDown) { // Player holding up
            pType.y -= pType.speed * modifier;
            sendEvent("up", pType.y);
        }
        if (40 in keysDown) { // Player holding down
            pType.y += pType.speed * modifier;
            sendEvent("down", pType.y)
        }
        if (37 in keysDown) { // Player holding left
            pType.x -= pType.speed * modifier;
            sendEvent("left", pType.x)
        }
        if (39 in keysDown) { // Player holding right
            pType.x += pType.speed * modifier;
            sendEvent("right", pType.x)
        }

        // Are they touching?
        if (
            pType.x <= (hero.x + 32)
            && hero.x <= (pType.x + 32)
            && pType.y <= (hero.y + 32)
            && hero.y <= (pType.y + 32)
        ) {
            clearInterval(endGameInterval);
            ++herosCaught;
            reset();
        }
    };

    // Update game objects that receive from server
    var updateFoe = function (eventName, value, pType) {
        var fvalue = parseFloat(value);
        if (eventName == "up") { // Player holding up
            pType.y = fvalue;
        }
        if (eventName == "down") { // Player holding down
            pType.y = fvalue;
        }
        if (eventName == "left") { // Player holding left
            pType.x = fvalue;
        }
        if (eventName == "right") { // Player holding right
            pType.x = fvalue;
        }

        // Are they touching?
        if (
            pType.x <= (hero.x + 32)
            && hero.x <= (pType.x + 32)
            && pType.y <= (hero.y + 32)
            && hero.y <= (pType.y + 32)
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

        if (mKingReady) {
            ctx.drawImage(mKingImage, mKing.x, mKing.y);
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
        playerType = document.getElementById("playerType").value;
        var now = Date.now();
        var delta = now - then;
        if (playerType == "MAD_KING")
            update(delta / 1000, madKing);
        else
            update(delta / 1000, mKing);
        render();

        then = now;
        // endGame();
        requestAnimationFrame(main);
    };

    // End the game when the player is game over(mad king couldn't kill any hero)
    function endGame() {
        addClass(canvas, 'display-none');
        score.innerHTML = herosCaught;
        removeClass(finish, 'display-none');
    }


    /*===== All func for web socket =====*/

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

    function isExistFoe() {
        return !(webSocket == undefined
        || webSocket.readyState == WebSocket.CLOSED);
    }

    function sendReqPlay() {
        var uid = document.getElementById("uid").value;
        var name = document.getElementById("name").value;
        var ptype = document.getElementById("playerType").value;
        var message = '{'
            + '"msg" : "reqPlay",'
            + '"name":"' + name + '",'
            + '"uid":"' + uid + '",'
            + '"playerType":"' + ptype + '"'
            + '}';
        webSocket.send(message);
    }

    function sendEvent(eventName, value) {
        var uid = document.getElementById("uid").value;
        var name = document.getElementById("name").value;
        var ptype = document.getElementById("playerType").value;
        var message = '{'
            + '"msg" : "event",'
            + '"eventName" : "' + eventName + '",'
            + '"value" : "' + value + '",'
            + '"name":"' + name + '",'
            + '"uid":"' + uid + '",'
            + '"playerType":"' + ptype + '"'
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
            onlineplayer.removeAttribute("option");
            var option = document.createElement("option");
            option.value = message.player.uid;
            option.text = message.player.name;
            onlineplayer.add(option);
            playBtn.disabled = false;
        } else if (message.msg == "connected") {
            JSON.parse(text, function (key, value) {
                if (key == "player") {
                    document.getElementById("name").value = value.name;
                    document.getElementById("uid").value = value.uid;
                    document.getElementById("playerType").value = value.ptype;
                    return value;
                } else {
                    return value;
                }
            });
        } else if (message.msg == "event" && message.eventName != "chat") {
            if (message.player.ptype == "MAD_KING")
                updateFoe(message.eventName, message.value, madKing);
            else
                updateFoe(message.eventName, message.value, mKing);
            render();

        } else if (message.msg == "event" && message.eventName == "chat") {

        }
        output.value += "\n" + text;
        output.scrollTop = output.scrollHeight;
    }

    function addClass(el, classNameToAdd) {
        el.className += ' ' + classNameToAdd;
    }

    function removeClass(el, classNameToRemove) {
        var elClass = ' ' + el.className + ' ';
        while (elClass.indexOf(' ' + classNameToRemove + ' ') !== -1) {
            elClass = elClass.replace(' ' + classNameToRemove + ' ', '');
        }
        el.className = elClass;
    }
})();