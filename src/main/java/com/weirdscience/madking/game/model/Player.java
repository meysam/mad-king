package com.weirdscience.madking.game.model;

/**
 * Created by meysam on 8/6/17.
 */
public class Player {

    public String uid;
    public String name;
    public PlayerType playerType;

    public Player(String uid, String name, PlayerType playerType) {
        this.name = name;
        this.uid = uid;
        this.playerType = playerType;

    }

    @Override
    public String toString() {
        return name + "," + uid + "," + playerType.name();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Player player = (Player) o;

        if (name != null ? !name.equals(player.name) : player.name != null) return false;
        return uid != null ? uid.equals(player.uid) : player.uid == null;
    }

    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + (uid != null ? uid.hashCode() : 0);
        return result;
    }
}
