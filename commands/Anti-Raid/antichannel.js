const { Client, Message } = require("discord.js");

module.exports = {
    name: "antichannel",
    description: "Permet de paramétrer l'antichannel.",
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
                if (db.antiraid.antichannel.etat === true) return message.channel.send("L'anti channel est déjà activé")
                
                db.antiraid.antichannel.etat = true
                db.antiraid.antichannel.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti channel a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antichannel.etat == false) return message.channel.send("L'anti channel est déjà désactivé")
                
                db.antiraid.antichannel.etat = false
                db.antiraid.antichannel.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti channel a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antichannel.max == true) return message.channel.send("L'anti channel est déjà au max")
                
                db.antiraid.antichannel.etat = true
                db.antiraid.antichannel.max  = true
                client.save(message.guildId);
                message.channel.send("L'anti channel est maintenant au maximum");
                break;
        }
    },
}