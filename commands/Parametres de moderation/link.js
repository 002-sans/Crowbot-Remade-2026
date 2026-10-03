const { Client, Message } = require("discord.js");

module.exports = {
    name: "antilink",
    description: "Active/désactive la protection contre les liens.",
    category: "Antiraid",
    argument: "<on/off> <invite/all>",
    aliases: [ 'link' ],
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
                if (db.antiraid.antilink.etat === true) return message.channel.send("L'anti link est déjà activé")
                
                db.antiraid.antilink.etat = true;
                db.antiraid.antilink.max  = false;
                client.save(message.guildId);
                message.channel.send("L'anti link a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antilink.etat == false) return message.channel.send("L'anti link est déjà désactivé")
                
                db.antiraid.antilink.etat = false;
                db.antiraid.antilink.max  = false;
                client.save(message.guildId);
                message.channel.send("L'anti link a été désactivé");
                break;

            case 'invite':
                if (db.antiraid.antilink.type == 'invite') return message.channel.send("L'anti link est déjà sur le monde invitation")
                
                db.antiraid.antilink.type = 'invite';
                client.save(message.guildId);
                message.channel.send("L'anti link bloquera que les invitations discord");
                break;

            case 'all':
                if (db.antiraid.antilink.type == 'all') return message.channel.send("L'anti link bloque déjà tous les liens")
                
                db.antiraid.antilink.type = 'all';
                client.save(message.guildId);
                message.channel.send("L'anti link bloquera tous les liens");
                break;
        }
    },
}