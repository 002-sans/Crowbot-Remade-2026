const { Client, Message } = require("discord.js");

module.exports = {
    name: "antiemote",
    description: "Permet de paramétrer l'antiemote.",
    category: "Antiraid",
    argument: "<on/off/max>",
    aliases: [],
    permissions: [],
    perm: 6,
    guildOwnerOnly: false,
    emoteOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        

        switch (args[0]) {
            case 'on':
                if (db.antiraid.antiemote.etat === true) return message.channel.send("L'anti emote est déjà activé")
                
                db.antiraid.antiemote.etat = true
                db.antiraid.antiemote.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti emote a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antiemote.etat == false) return message.channel.send("L'anti emote est déjà désactivé")
                
                db.antiraid.antiemote.etat = false
                db.antiraid.antiemote.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti emote a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antiemote.max == true) return message.channel.send("L'anti emote est déjà au max")
                
                db.antiraid.antiemote.etat = true
                db.antiraid.antiemote.max  = true
                client.save(message.guildId);
                message.channel.send("L'anti emote est maintenant au maximum");
                break;
        }
    },
}