const { PermissionsBitField, Client, Message } = require("discord.js");

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
        const db = client.get(message.guildId);
        if (!message.member.voice) return message.channel.send("Vous devez être dans un salon vocal")
        
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null);
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || await message.guild.channels.fetch(args[0]);

        if (member){
            member.voice.setChannel(message.member.voice)
                .then( () => message.channel.send(`${member.displayName} a été déplacé dans ${message.member.voice.channel}`))
                .catch(() => message.channel.send(`Je n'ai pas pu déplacé ${member.displayName}`))
        }
        else if (channel) {
            if (![2, 13].includes(channel.type)) return message.channel.send("Veuillez mentionner un salon vocal")
        
            if (message.member.voice.channel.members.filter(m => !m.user?.bot).size === 0) return message.channel.send("Il n'y aucun membre dans ce salon vocal")

            var i = 0

            for (const member of message.member.voice.channel.members.filter(m => !m.user?.bot).map(r => r)){
                try {
                    await member.voice.setChannel(message.member.voice.channel)
                    i = i+1
                }
                catch { false }
            }

            message.channel.send(`${i} membres ont été déplacés dans ${message.member.voice.channel}`)
        }
    },
}