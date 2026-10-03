const { Client, Message } = require("discord.js");

module.exports = {
    name: "reroll",
    description: "Reroll un giveaway",
    category: "Gestion",
    argument: "<ID>",
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
        return client.giveawaysManager.reroll(args[0], {
            messages: {
              congrat: `🎉 Bien joué {winners}! Après un reroll vous avez gagné **{this.prize}**!`,
              error: 'Il n\'y a pas assez de participants pour faire un reroll'
            }
        }).catch(() => message.channel.send(`Aucun giveaway de trouvé avec comme ID \`${args[0] || "rien"}\``))

    }
}