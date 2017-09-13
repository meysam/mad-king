class Player {
    constructor(uid, name, playerType) {
        this.uid = uid;
        this.name = name;
        this.playerType = playerType;
    }

    toString() {
        return '(' + this.name + ', ' + this.playerType + ')';
    }

    addToElements() {
        document.getElementById("name").value = this.name;
        document.getElementById("uid").value = this.uid;
        document.getElementById("playerType").value = this.playerType;
    }
}

class PlayerDto extends Player {
    constructor(message, eventName, value, uid, name, playerType) {
        super(uid, name, playerType);
        this.message = message;
        this.eventName = eventName;
        this.value = value;
    }

    toString() {
        return `{   
                    "msg" : "${this.message}" ,
                    "eventName" : "${this.eventName}", 
                    "value" : "${this.value}", 
                    "name" : "${this.name}", 
                    "uid" : "${this.uid}", 
                    "playerType" : "${this.playerType}"
                }`;
    }
}

export{Player, PlayerDto}

