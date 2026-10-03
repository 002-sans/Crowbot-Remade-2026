const { Client, Message } = require("discord.js");

module.exports = {
    name: "antikick",
    description: "Permet de paramétrer l'antikick.",
    category: "Antiraid",
    argument: "<on/off/max>",
    aliases: [],
    permissions: [],
    perm: 6,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        

        switch (args[0]) {
            case 'on':
                if (db.antiraid.antikick.etat === true) return message.channel.send("L'anti kick est déjà activé")
                
                db.antiraid.antikick.etat = true
                db.antiraid.antikick.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti kick a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antikick.etat == false) return message.channel.send("L'anti kick est déjà désactivé")
                
                db.antiraid.antikick.etat = false
                db.antiraid.antikick.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti kick a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antikick.max == true) return message.channel.send("L'anti kick est déjà au max")
                
                db.antiraid.antikick.etat = true
                db.antiraid.antikick.max  = true
                client.save(message.guildId);
                message.channel.send("L'anti kick est maintenant au maximum");
                break;
        }
    },
}