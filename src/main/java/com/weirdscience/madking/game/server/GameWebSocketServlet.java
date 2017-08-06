package com.weirdscience.madking.game.server;

import org.eclipse.jetty.websocket.servlet.WebSocketServlet;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;

import javax.servlet.annotation.WebServlet;

@WebServlet(urlPatterns="/madKing")
public class GameWebSocketServlet extends WebSocketServlet{

	@Override
	public void configure(WebSocketServletFactory factory) {
		
	      factory.register(GameWebSocket.class);
		
	}

}
