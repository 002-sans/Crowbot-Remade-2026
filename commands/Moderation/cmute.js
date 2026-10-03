const { PermissionsBitField, Client, Message } = require("discord.js");

module.exports = {
    name: "cmute",
    description: "Mute un ou plusieurs membres sur le salon actuel, une raison peut être précisée.",
    category: "Modération",
    argument: "<membre> [raison]",
    aliases: [],
    permissions: [PermissionsBitField.Flags.ManageChannels],
    perm: 2,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null)
        if (!member || !args[0]) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] ?? "rien"}\``)
        
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
        channel.permissionOverwrites.edit(member.id, { SendMessages: false, Connect: false });

        if (isNaN(client.ms(args[1])) || client.ms(args[1]) < 1) return message.channel.send("Durée incorrecte");
        message.channel.send(`${member} a été **mute ${args[1]}** dans ce salon ${args[2] ? `pour \`${args.slice(2).join(' ')}\`` : ''}`);        

        
    },
}