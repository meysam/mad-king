package com.weirdscience.madking.game.client;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.concurrent.CountDownLatch;

@WebSocket
public class GameClientSocket {

    private Session session;
    private String uniqueId;

    CountDownLatch latch = new CountDownLatch(1);

    @OnWebSocketMessage
    public void onText(Session session, String message) throws IOException, JSONException {
        JSONObject jsonMessage = new JSONObject(message);
        this.uniqueId = jsonMessage.get("uniqueId").toString();
        System.out.println("Message received from server:" + message);
    }

    @OnWebSocketConnect
    public void onConnect(Session session) {
        System.out.println("Connected to server");
        this.session = session;
        latch.countDown();
    }

    public void sendMessage(String str) {
        String message = String.format("{\"msg\": \"%s\", \"uniqueId\": \"%s\"}",
                str, this.uniqueId);
        try {
            session.getRemote().sendString(message);
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    public CountDownLatch getLatch() {
        return latch;
    }

}
