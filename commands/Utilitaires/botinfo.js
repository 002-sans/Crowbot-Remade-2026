const { PermissionsBitField, EmbedBuilder, Client, Message, version } = require("discord.js");
const os = require('node:os');

module.exports = {
    name: "botinfo",
    description: "Afficher les informations du bot.",
    category: "Utilitaire",
    aliases: ['bot-info'],
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
        const embed = new EmbedBuilder()
            .setTitle('Informations du bot')
            .setColor(db.color)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields({ name: "`👤`・Statistiques du bot", value: `>>> **Commandes:** \`${client.commands.size}\`\n**Utilisateurs:** \`${client.guilds.cache.map(guild => guild.memberCount).reduce((a, b) => a + b)}\`\n**Serveurs:** \`${client.guilds.cache.size}\`\n**Salons:** \`${client.channels.cache.size}\n\`**Rôles:** \`${client.guilds.cache.map(guild => guild.roles.cache.size).reduce((a, b) => a + b)}\`\n**Boosts:** \`${client.guilds.cache.map(guild => guild.premiumSubscriptionCount).reduce((a, b) => a + b)}\`` })            
            .addFields({ name: "`💎`・Statistiques du VPS", value: `>>> **Uptime:** \`${formatUptime(os.uptime())}\`\n**Mémoire:** \`${format(os.totalmem() - os.freemem())}\`/\`${formatBytes(os.totalmem())}\`\n**CPU Cores:** \`${os.cpus().length}\`\n**NodeJS:** \`${process.version}\`\n**DiscordJS:** \`v${version}\`` })            
        
        message.channel.send({ embeds: [ embed ] })
    },
}

function formatUptime(uptime) {
    const timeUnits = ['jours', 'heures', 'minutes', 'secondes'];
    
    const seconds = Math.floor(uptime % 60);
    const minutes = Math.floor((uptime / 60) % 60);
    const hours = Math.floor((uptime / 3600) % 24);
    const days = Math.floor(uptime / 86400);

    const formattedTime = [];
    
    if (days > 0) formattedTime.push(`${days} ${days > 1 ? timeUnits[0] : timeUnits[0].slice(0, -1)}`);
    if (hours > 0) formattedTime.push(`${hours} ${hours > 1 ? timeUnits[1] : timeUnits[1].slice(0, -1)}`);
    if (minutes > 0) formattedTime.push(`${minutes} ${minutes > 1 ? timeUnits[2] : timeUnits[2].slice(0, -1)}`);
    if (seconds > 0) formattedTime.push(`${seconds} ${seconds > 1 ? timeUnits[3] : timeUnits[3].slice(0, -1)}`);
    
    return formattedTime.join(', ');
}

function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log2(bytes) / 10);
    return `${(bytes / Math.pow(2, 10 * i)).toFixed(2)} ${sizes[i]}`;
}

function format(bytes) {
    const i = Math.floor(Math.log2(bytes) / 10);
    return `${(bytes / Math.pow(2, 10 * i)).toFixed(2)}`;
}
