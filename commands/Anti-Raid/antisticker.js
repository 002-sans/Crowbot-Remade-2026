const { Client, Message } = require("discord.js");

module.exports = {
    name: "antisticker",
    description: "Permet de paramétrer l'antisticker.",
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
                if (db.antiraid.antisticker.etat === true) return message.channel.send("L'anti sticker est déjà activé")
                
                db.antiraid.antisticker.etat = true
                db.antiraid.antisticker.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti sticker a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antisticker.etat == false) return message.channel.send("L'anti sticker est déjà désactivé")
                
                db.antiraid.antisticker.etat = false
                db.antiraid.antisticker.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti sticker a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antisticker.max == true) return message.channel.send("L'anti sticker est déjà au max")
                
                db.antiraid.antisticker.etat = true
                db.antiraid.antisticker.max  = true
                client.save(message.guildId);
                message.channel.send("L'anti sticker est maintenant au maximum");
                break;
        }
    },
}