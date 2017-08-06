package com.weirdscience.madking.game.server;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;

@WebSocket
public class GameWebSocket {

    private final static HashMap<String, GameWebSocket> sockets = new HashMap<>();
    private Session session;
    private String clientUniqueId;

    private String getClientUniqueId() {
        // unique ID from this class' hash code
        return Integer.toHexString(this.hashCode());
    }

    @OnWebSocketConnect
    public void onConnect(Session session) throws IOException {
        // save session so we can send
        this.session = session;

        // this unique ID
        this.clientUniqueId = this.getClientUniqueId();

        // map this unique ID to this connection
        GameWebSocket.sockets.put(this.clientUniqueId, this);

        // send its unique ID to the client (JSON)
        this.sendClient(String.format("{\"msg\": \"uniqueId\", \"uniqueId\": \"%s\"}",
                this.clientUniqueId));

        // broadcast this new connection (with its unique ID) to all other connected clients
        for (GameWebSocket dstSocket : GameWebSocket.sockets.values()) {
            if (dstSocket == this) {
                // skip me
                continue;
            }
            dstSocket.sendClient(String.format("{\"msg\": \"newClient\", \"newClientId\": \"%s\"}",
                    this.clientUniqueId));
        }
    }

    @OnWebSocketMessage
    public void onText(Session session, String message) throws IOException, JSONException {

        JSONObject jsonMessage = new JSONObject(message);
        String destUniqueId = jsonMessage.get("uniqueId").toString();
        String escapedMessage = "Hi";

        // is the destination client connected?
        if (!GameWebSocket.sockets.containsKey(destUniqueId)) {
            this.sendError(String.format("destination client %s does not exist", destUniqueId));
            return;
        }
        // send message to destination client
        GameWebSocket.sockets.get(destUniqueId).sendClient(String.format("{\"msg\": \"message\", \"destId\": \"%s\", \"message\": \"%s\"}",
                destUniqueId, escapedMessage));
    }

    @OnWebSocketClose
    public void onClose(Session session, int status, String reason) {
        if (GameWebSocket.sockets.containsKey(this.clientUniqueId)) {
            // remove connection
            GameWebSocket.sockets.remove(this.clientUniqueId);

            // broadcast this lost connection to all other connected clients
            for (GameWebSocket dstSocket : GameWebSocket.sockets.values()) {
                if (dstSocket == this) {
                    // skip me
                    continue;
                }
                dstSocket.sendClient(String.format("{\"msg\": \"lostClient\", \"lostClientId\": \"%s\"}",
                        this.clientUniqueId));
            }
        }
    }

    private void sendClient(String str) {
        try {
            this.session.getRemote().sendString(str);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void sendError(String err) {
        this.sendClient(String.format("{\"msg\": \"error\", \"error\": \"%s\"}", err));
    }
}
