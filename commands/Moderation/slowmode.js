const { Client, Message } = require("discord.js");

module.exports = {
    name: "slowmode",
    description: "Met un cooldown dans un salon.",
    category: "Modération",
    argument: "<temps> [salon]",
    aliases: [],
    permissions: [],
    perm: 3,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.channel

        if (isNaN(client.ms(args[0])) && args[0] !== 0) return message.channel.send("Veuillez entrer une valeur correcte.")
        if (!channel) return message.channel.send(`Aucun salon de trouvé pour \`${args[1] || "rien"}\``)
        if (client.ms(args[0]) === 0) channel.setRateLimitPerUser(0)
        else channel.setRateLimitPerUser(client.ms(args[0]))

        message.channel.send(`Le mode lent est maintenant de ${args[0]} dans ${channel}`)
    }
}