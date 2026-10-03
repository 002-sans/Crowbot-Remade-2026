const { Client, Message } = require("discord.js");

module.exports = {
    name: "antirole",
    description: "Permet de paramétrer l'antirole.",
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
                if (db.antiraid.antirole.etat === true) return message.channel.send("L'anti role est déjà activé")
                
                db.antiraid.antirole.etat = true
                db.antiraid.antirole.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti role a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antirole.etat == false) return message.channel.send("L'anti role est déjà désactivé")
                
                db.antiraid.antirole.etat = false
                db.antiraid.antirole.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti role a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antirole.max == true) return message.channel.send("L'anti role est déjà au max")
                
                db.antiraid.antirole.etat = true
                db.antiraid.antirole.max  = true
                client.save(message.guildId);
                message.channel.send("L'anti role est maintenant au maximum");
                break;
        }
    },
}