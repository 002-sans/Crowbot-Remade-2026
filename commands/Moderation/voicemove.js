const { ChannelType, Client, Message } = require("discord.js");

const VOICE_TYPES = [ChannelType.GuildVoice, ChannelType.GuildStageVoice];

module.exports = {
    name: "move",
    description: "Permet de déplacer un utilisateur ou tous les utilisateurs dans votre salon vocal.",
    category: "Modération",
    argument: "<membre/channel> [channel]",
    aliases: ["forcemove"],
    permissions: [],
    perm: 2,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const authorChannel = message.member?.voice?.channel;
        if (!authorChannel) return message.channel.send("Vous devez être dans un salon vocal");

        const member = message.mentions.members.first()
            || message.guild.members.cache.get(args[0])
            || await message.guild.members.fetch(args[0]).catch(() => null);

        if (member) {
            return member.voice.setChannel(authorChannel)
                .then(() => message.channel.send(`${member.displayName} a été déplacé dans ${authorChannel}`))
                .catch(() => message.channel.send(`Je n'ai pas pu déplacer ${member.displayName}`));
        }

        const mentionedVoice = [...message.mentions.channels.values()].filter(c => VOICE_TYPES.includes(c.type));
        let sourceChannel = mentionedVoice[0] || null;
        let targetChannel = mentionedVoice[1] || authorChannel;

        if (!sourceChannel && args[0]) {
            sourceChannel = message.guild.channels.cache.get(args[0])
                || await message.guild.channels.fetch(args[0]).catch(() => null);
        }
        if (args[1]) {
            const dest = message.guild.channels.cache.get(args[1])
                || await message.guild.channels.fetch(args[1]).catch(() => null);
            if (dest && VOICE_TYPES.includes(dest.type)) targetChannel = dest;
        }

        if (!sourceChannel || !VOICE_TYPES.includes(sourceChannel.type)) {
            return message.channel.send("Veuillez mentionner un salon vocal source ou un membre");
        }
        if (!targetChannel || !VOICE_TYPES.includes(targetChannel.type)) {
            return message.channel.send("Salon vocal de destination invalide");
        }

        const toMove = sourceChannel.members.filter(m => !m.user.bot);
        if (toMove.size === 0) return message.channel.send("Il n'y a aucun membre dans ce salon vocal");

        let moved = 0;
        for (const m of toMove.values()) {
            try {
                await m.voice.setChannel(targetChannel);
                moved++;
            } catch { /* ignore */ }
        }

        message.channel.send(`${moved} membre(s) ont été déplacés dans ${targetChannel}`);
    },
};
