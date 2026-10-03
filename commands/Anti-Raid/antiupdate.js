const { Client, Message } = require("discord.js");

module.exports = {
    name: "antiupdate",
    description: "Permet de paramétrer l'antiupdate.",
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
                if (db.antiraid.antiupdate.etat === true) return message.channel.send("L'anti update est déjà activé")
                
                db.antiraid.antiupdate.etat = true
                db.antiraid.antiupdate.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti update a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antiupdate.etat == false) return message.channel.send("L'anti update est déjà désactivé")
                
                db.antiraid.antiupdate.etat = false
                db.antiraid.antiupdate.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti update a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antiupdate.max == true) return message.channel.send("L'anti update est déjà au max")
                
                db.antiraid.antiupdate.etat = true
                db.antiraid.antiupdate.max  = true
                client.save(message.guildId);
                message.channel.send("L'anti update est maintenant au maximum");
                break;
        }
    },
}