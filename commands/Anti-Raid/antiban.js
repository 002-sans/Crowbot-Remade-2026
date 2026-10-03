const { Client, Message } = require("discord.js");

module.exports = {
    name: "antiban",
    description: "Permet de paramétrer l'antiban.",
    category: "Antiraid",
    argument: "<on/off/max> <nombre>/<durée>",
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
            default:
                if (!args[0] || !args[0].includes('/')) return message.channel.send("Veuillez réspecter ce format: `nombre/durée`");

                const parts = args[0].split("/");
                if (parts.length !== 2) return message.channel.send("Veuillez réspecter ce format: `nombre/durée`");

                const number = parseInt(parts[0]);
                const timeString = parts[1];
                const time = parseTime(timeString);

                if (isNaN(number) || number < 1) return message.channel.send("Veuillez entrer un nombre valide");
                if (time === null || time < 1000) return message.channel.send("Veuillez entrer une durée valide");
        
                db.antiraid.antiban.nombre = number;
                db.antiraid.antiban.durée = time;
                client.save(message.guildId);
                message.channel.send("L'anti ban a été mis à jour");
                break;

            case 'on':
                if (db.antiraid.antiban.etat === true) return message.channel.send("L'anti ban est déjà activé");
                
                db.antiraid.antiban.etat = true;
                db.antiraid.antiban.max = false;
                client.save(message.guildId);
                message.channel.send("L'anti ban a été activé");
                break;
        
            case 'off':
                if (db.antiraid.antiban.etat === false) return message.channel.send("L'anti ban est déjà désactivé");
                
                db.antiraid.antiban.etat = false;
                db.antiraid.antiban.max = false;
                client.save(message.guildId);
                message.channel.send("L'anti ban a été désactivé");
                break;

            case 'max':
                if (db.antiraid.antiban.max === true) return message.channel.send("L'anti ban est déjà au max");
                
                db.antiraid.antiban.etat = true;
                db.antiraid.antiban.max = true;
                client.save(message.guildId);
                message.channel.send("L'anti ban est maintenant au maximum");
                break;
        }
    },
}

function parseTime(timeString) {
    const match = timeString.match(/^(\d+)([smhdwy])$/);
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