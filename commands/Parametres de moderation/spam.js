const { Client, Message } = require("discord.js");

module.exports = {
    name: "antispam",
    description: "Désactive ou active l'antispam sur un salon spécifique.",
    category: "Paramètres de modération",
    argument: "<on/off/max> <nombre>/<durée>",
    aliases: [ 'spam' ],
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
            default:
                if (!args[0].includes('/')) return message.channel.send("Veuillez réspecter ce format: `nombre/durée`");

                const number = parseInt(args[0].split("/")[0]);
                const time = parseInt(parseTime(args[0].split("/")[1]));

                if (isNaN(number)) return message.channel.send("Veuillez entrer un nombre valide")
                if (isNaN(parseTime(time))) return message.channel.send("Veuillez entrer une durée valide")
        
                db.antiraid.antispam.nombre = number
                db.antiraid.antispam.durée  = time
                client.save(message.guildId);
                message.channel.send("L'anti spam a été mis à jour");
                break;

            case 'on':
                if (db.antiraid.antispam.etat === true) return message.channel.send("L'anti spam est déjà activé")
                
                db.antiraid.antispam.etat = true
                db.antiraid.antispam.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti spam a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antispam.etat == false) return message.channel.send("L'anti spam est déjà désactivé")
                
                db.antiraid.antispam.etat = false
                db.antiraid.antispam.max  = false
                client.save(message.guildId);
                message.channel.send("L'anti spam a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antispam.max == true) return message.channel.send("L'anti spam est déjà au max")
                
                db.antiraid.antispam.etat = true
                db.antiraid.antispam.max  = true
                client.save(message.guildId);
                message.channel.send("L'anti spam est maintenant au maximum");
                break;
        }
    },
}

function parseTime(timeString) {
    const match = timeString.match(/(\d+)([smhdwy])/);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'w': return value * 7 * 24 * 60 * 60 * 1000;
        case 'y': return value * 365 * 24 * 60 * 60 * 1000;
        default: return null;
    }
}