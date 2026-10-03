const { PermissionsBitField, Client, Message } = require("discord.js");

module.exports = {
    name: "uncmute",
    description: "Met fin au cmute d'un ou plusieurs membres.",
    category: "Modération",
    argument: "<membre>",
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
        const db = client.get(message.guildId);

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null)
        if (!member || !args[0]) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] ?? "rien"}\``)
        
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
        channel.permissionOverwrites.edit(member.id, { SendMessages: null, Connect: null });

        db.tempcmute = db.tempcmute.filter(c => c.channelId !== channel.id && c.memberId !== member.id);
        client.save(message.guildId);        

        message.channel.send(`${member} a été **mute** dans ce salon`);        
    },
}