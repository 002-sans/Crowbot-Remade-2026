const { Client, Message } = require("discord.js");

module.exports = {
    name: "antieveryone",
    description: "Permet de paramétrer l'antieveryone.",
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
                if (db.antiraid.antieveryone.etat === true) return message.channel.send("L'anti everyone est déjà activé")
                
                db.antiraid.antieveryone.etat = true
                db.antiraid.antieveryone.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti everyone a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antieveryone.etat == false) return message.channel.send("L'anti everyone est déjà désactivé")
                
                db.antiraid.antieveryone.etat = false
                db.antiraid.antieveryone.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti everyone a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antieveryone.max == true) return message.channel.send("L'anti everyone est déjà au max")
                
                db.antiraid.antieveryone.etat = true
                db.antiraid.antieveryone.max  = true
                client.save(message.guildId);
                message.channel.send("L'anti everyone est maintenant au maximum");
                break;

            case 'type':
                if (args[1] == 'renew'){
                    db.antiraid.antieveryone.type = 'renew'
                    client.save(message.guildId);
                    message.channel.send("Le salon sera renew lors d'un ping");
                }
                else if (args[1] == 'delete'){
                    db.antiraid.antieveryone.type = 'delete'
                    client.save(message.guildId);
                    message.channel.send("Le message sera supprimé lors d'un ping");
                }
                else return message.channel.send('Paramètre manquant: `renew` ou `delete`')
                break
        }
    },
}