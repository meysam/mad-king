/**
 * Created by meysam on 8/6/17.
 */
var webSocket;
var output = document.getElementById("output");
var connectBtn = document.getElementById("connectBtn");
var sendBtn = document.getElementById("sendBtn");

function connect() {
    // oprn the connection if one does not exist
    if (webSocket !== undefined
        && webSocket.readyState !== WebSocket.CLOSED) {
        return;
    }
    // Create a websocket
    webSocket = new WebSocket("ws://localhost:8080/madKingServer");

    webSocket.onopen = function(event) {
        updateOutput("Connected!");
        connectBtn.disabled = true;
        sendBtn.disabled = false;

    };

    webSocket.onmessage = function(event) {
        updateOutput(event.data);
    };

    webSocket.onclose = function(event) {
        updateOutput("Connection Closed");
        connectBtn.disabled = false;
        sendBtn.disabled = true;
    };
}

function send() {
    var text = document.getElementById("input").value;
    webSocket.send(text);
}

function closeSocket() {
    webSocket.close();
}

function updateOutput(text) {
    output.innerHTML += "<br/>" + text;
}