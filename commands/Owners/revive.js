const { Client, Message } = require("discord.js");

module.exports = {
    name: "revive",
    description: "Unblacklist et débanni un utilisateurs de tous les serveurs",
    category: "Owners",
    aliases: [],
    permissions: [],
    argument: "<user>",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 8,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const bl = client.getBlacklist();
        const user = message.mentions.users.first() || client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(() => null);
            
        if (!user) return message.channel.send(`Aucun utilisateur de trouvé pour \`${args[0] ?? 'rien'}\``)
        if (!bl[user.id]) return message.channel.send(`${user.displayName} n'est pas blacklist`)

        delete bl[user.id]
        
        let ban    = 0;
        let notban = 0;
        const bans = client.guilds.cache.map(async guild => {
            try { await guild.bans.remove(user); ban++ } catch { notban++ }
        })

        await Promise.all(bans)

        client.saveBlacklist()
        message.channel.send(`${user.displayName} n'est plus **blacklist**\nIl a été débanni de **${ban}** serveur${ban < 2 ? "" : "s"}\nIl n'a pas pu être débanni de **${notban}** serveur${notban < 2 ? "" : "s"}`)  
    },
}
