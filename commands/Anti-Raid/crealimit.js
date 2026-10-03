const { Client, Message } = require("discord.js");

module.exports = {
    name: "crealimit",
    description: "Permet de paramétrer la limite de création de compte.",
    category: "Antiraid",
    argument: "<durée>",
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
        
        const time = parseTime(args[0])
        if (isNaN(time)) return message.channel.send('Veuillez me donner un temps valide');

        db.antiraid.crealimit = time
        client.save(message.guildId);
        message.channel.send('La limite de création de compte a été modifié');
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