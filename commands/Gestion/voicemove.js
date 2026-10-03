const { Client, Message } = require("discord.js");

module.exports = {
    name: "voicemove",
    description: "Déplace les membres d'un salon vocal vers un autre salon vocal",
    category: "Gestion",
    argument: "<vocal1> <vocal2>",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || await message.guild.channels.fetch(args[0]).catch(() => null)
        const channel2 = message.mentiosn.channels[1] || message.guild.channels.cache.get(args[1]) || await message.guild.channels.fetch(args[1])
        const channelType = [ 2, 13 ]
        
        if (!channel || !args[0] || !channelType.includes(channel.type)) return message.channel.send("Veuillez mentionner un salon vocal valide")
        if (!channel2 || !args[1] || !channelType.includes(channel2.type)) return message.channel.send("Veuillez mentionner un autre salon vocal valide")
                
        if (channel.members.filter(m => !m.user?.bot).size === 0) return message.channel.send("Il n'y aucun membre dans ce salon vocal")

        let i = 0

        for (const member of channel.members.filter(m => !m.user?.bot).map(r => r)){
            try {
                await member.voice.setChannel(channel2)
                i++;
            }
            catch { false }
        }

        message.channel.send(`${i} membres ont été déplacés dans ${channel2}`)
    }
}