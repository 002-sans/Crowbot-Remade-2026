const { Client, Message } = require("discord.js");

module.exports = {
    name: "antiwebhook",
    description: "Permet de paramétrer l'antiwebhook.",
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
                if (db.antiraid.antiwebhook.etat === true) return message.channel.send("L'anti webhook est déjà activé")
                
                db.antiraid.antiwebhook.etat = true
                db.antiraid.antiwebhook.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti webhook a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antiwebhook.etat == false) return message.channel.send("L'anti webhook est déjà désactivé")
                
                db.antiraid.antiwebhook.etat = false
                db.antiraid.antiwebhook.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti webhook a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antiwebhook.max == true) return message.channel.send("L'anti webhook est déjà au max")
                
                db.antiraid.antiwebhook.etat = true
                db.antiraid.antiwebhook.max  = true
                client.save(message.guildId);
                message.channel.send("L'anti webhook est maintenant au maximum");
                break;
        }
    },
}