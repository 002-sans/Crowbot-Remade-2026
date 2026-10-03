const { Client, Message } = require("discord.js");

module.exports = {
    name: "antirank",
    description: "Permet de paramétrer l'antirank.",
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
                if (db.antiraid.antirank.etat === true) return message.channel.send("L'anti rank est déjà activé")
                
                db.antiraid.antirank.etat = true
                db.antiraid.antirank.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti rank a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antirank.etat == false) return message.channel.send("L'anti rank est déjà désactivé")
                
                db.antiraid.antirank.etat = false
                db.antiraid.antirank.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti rank a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antirank.max == true) return message.channel.send("L'anti rank est déjà au max")
                
                db.antiraid.antirank.etat = true
                db.antiraid.antirank.max  = true
                client.save(message.guildId);
                message.channel.send("L'anti rank est maintenant au maximum");
                break;
        }
    },
}