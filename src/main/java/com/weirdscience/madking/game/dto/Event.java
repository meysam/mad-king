package com.weirdscience.madking.game.dto;

/**
 * Created by meysam on 8/7/17.
 */
public class Event {
    public String msg;
    public String eventName;
    public String value;

    public String getMessage() {
        return msg;
    }

    public void setMessage(String msg) {
        this.msg = msg;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
