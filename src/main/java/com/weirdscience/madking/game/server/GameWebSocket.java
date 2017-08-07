package com.weirdscience.madking.game.server;

import com.weirdscience.madking.game.model.Player;
import com.weirdscience.madking.game.model.PlayerType;
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

    private final static HashMap<Player, GameWebSocket> sockets = new HashMap<>();
    private Session session;
    private Player player;

    private String getClientUniqueId() {
        // unique ID from this class' hash code
        return Integer.toHexString(this.hashCode());
    }

    @OnWebSocketConnect
    public void onConnect(Session session) throws IOException {
        // save session so we can send
        this.session = session;

        int size = GameWebSocket.sockets.size();
        this.player = new Player(this.getClientUniqueId(), "Player " + String.valueOf(size + 1), size % 2 == 0 ? PlayerType.HERO : PlayerType.MAD_KING);

        // map this Player to this connection
        GameWebSocket.sockets.put(this.player, this);

        // send its Player to the client (JSON)
        this.sendClient(String.format("{\"msg\": \"connected\",\"player\": {\"name\": \"%s\",\"uid\": \"%s\"}}",
                this.player.name, this.player.uid));

        // broadcast this new connection (with its Player) to all other connected clients
        GameWebSocket.sockets.values().stream().forEach(s->{
            if(s!=this){
                s.sendClient(String.format("{\"msg\": \"newClient\",\"player\": {\"name\": \"%s\",\"uid\": \"%s\"}}",
                        s.player.name, s.player.uid));
            }
        });
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
        if (GameWebSocket.sockets.containsKey(this.player)) {
            // remove connection
            GameWebSocket.sockets.remove(this.player);

            // broadcast this lost connection to all other connected clients
            for (GameWebSocket dstSocket : GameWebSocket.sockets.values()) {
                if (dstSocket == this) {
                    // skip me
                    continue;
                }
                dstSocket.sendClient(String.format("{\"msg\": \"lostClient\", \"lostClientId\": \"%s\"}",
                        this.player.uid));
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
