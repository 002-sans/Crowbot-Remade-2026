const { PermissionsBitField, EmbedBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "uptime",
    description: "Afficher l'activité du bot.",
    category: "Utilitaire",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const jours    = Math.floor(client.uptime / 86400000);
        const heures   = Math.floor(client.uptime / 3600000) % 24;
        const minutes  = Math.floor(client.uptime / 60000) % 60;
        const secondes = Math.floor(client.uptime / 1000) % 60;
        
        const embed = new EmbedBuilder()
            .setColor(db.color)
            .setDescription(`\`🕛\`・**Le bot est allumé depuis**\n> \`${jours} jours\`, \`${heures} heures\`, \`${minutes} minutes\`, \`${secondes} secondes\``)

        message.channel.send({ embeds: [ embed ]  })
    },
}