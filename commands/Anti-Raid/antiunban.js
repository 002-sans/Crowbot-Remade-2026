const { Client, Message } = require("discord.js");

module.exports = {
    name: "antiunban",
    description: "Permet de paramétrer l'antiunban.",
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
                if (db.antiraid.antiunban.etat === true) return message.channel.send("L'anti unban est déjà activé")
                
                db.antiraid.antiunban.etat = true
                db.antiraid.antiunban.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti unban a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antiunban.etat == false) return message.channel.send("L'anti unban est déjà désactivé")
                
                db.antiraid.antiunban.etat = false
                db.antiraid.antiunban.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti unban a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antiunban.max == true) return message.channel.send("L'anti unban est déjà au max")
                
                db.antiraid.antiunban.etat = true
                db.antiraid.antiunban.max  = true
                client.save(message.guildId);
                message.channel.send("L'anti unban est maintenant au maximum");
                break;
        }
    },
}