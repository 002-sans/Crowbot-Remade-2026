const { Client, Message } = require("discord.js");

module.exports = {
    name: "cleanup",
    description: "Déconnecte tous les membres d'un salon vocal",
    category: "Gestion",
    argument: "<salon>",
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
        const channelType = [ 2, 13 ]
        
        if (!channel || !args[0] || !channelType.includes(channel.type)) return message.channel.send("Veuillez mentionner un salon vocal valide")
                
        if (channel.members.size === 0) return message.channel.send("Il n'y aucun membre dans ce salon vocal")

        let i = 0;
        for (const member of channel.members.filter(m => !m.user?.bot).map(r => r)){
            try {
                await member.voice.disconnect()
                i++;
            }
            catch { false }
        }

        message.channel.send(`${i} membres ont été déconnecté du salon ${channel}`)
    }
}