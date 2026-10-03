const { Client, Message } = require("discord.js");

module.exports = {
    name: "antibot",
    description: "Permet de paramétrer l'antibot.",
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
                if (db.antiraid.antibot.etat === true) return message.channel.send("L'anti bot est déjà activé")
                
                db.antiraid.antibot.etat = true
                db.antiraid.antibot.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti bot a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antibot.etat == false) return message.channel.send("L'anti bot est déjà désactivé")
                
                db.antiraid.antibot.etat = false
                db.antiraid.antibot.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti bot a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antibot.max == true) return message.channel.send("L'anti bot est déjà au max")
                
                db.antiraid.antibot.etat = true
                db.antiraid.antibot.max  = true
                client.save(message.guildId);
                message.channel.send("L'anti bot est maintenant au maximum");
                break;
        }
    },
}