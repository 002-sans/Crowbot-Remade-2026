const { Client, Message } = require("discord.js");

module.exports = {
    name: "invite",
    description: "Crée un lien d'invitation pour un serveur.",
    category: "Bot Control",
    argument: "<numéro/ID>",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        let guild;
        
        const index = parseInt(args[0], 10) - 1;
        if (index >= 0 && index < client.guilds.cache.size) 
            guild = client.guilds.cache.at(index);
        else 
            guild = client.guilds.cache.get(args[0]);
        
        if (!guild) return message.channel.send('Aucun serveur de trouvé pour ce numéro')
        if (guild.vanityURLCode) return message.channel.send(`Voici le lien pour rejoindre [\`${guild.name}\`](<https://discord.gg/${guild.vanityURLCode}>)`)
    
        const channel = guild.channels.cache.find(ch => ch.isTextBased() && ch.permissionsFor(guild.members.me).has('CreateInstantInvite'));
        if (channel) {
            const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 }).catch(() => null);
            if (invite) await message.channel.send(`Voici le lien pour rejoindre [\`${guild.name}\`](<${invite.url}>)`);
            else message.channel.send("Je n'ai pas pu crée une invitation");
        }
        else message.channel.send("Il n'y a aucun salon où je peux crée une invitation");
    },
}