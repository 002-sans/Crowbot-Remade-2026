const { PermissionsBitField, Client, Message } = require("discord.js");
const { sendModLog } = require("../../utiles/modlog");

module.exports = {
    name: "unban",
    description: "Permet de débannir un membre.",
    category: "Modération",
    argument: "<membre/all>",
    aliases: [],
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

        if (args[0] == "all"){
            const bans = await message.guild.bans.fetch();
            if (bans.size == 0) return message.channel.send("Il n'y a aucun utilisateur de banni")
            const msg = await message.channel.send(`Débannissement de ${bans.size} utilisateurs en cours..`)

            let unban = 0
            let still = 0
            for (const ban of bans.map(r => r)){
                try {
                    await message.guild.bans.remove(ban.user, `Unban all par ${message.author.displayName} (${message.author.id})`)
                    db.tempban.filter(c => c.userId !== ban.user.id);
                    unban++
                } catch { still++ }
            }

            client.save(message.guildId);
            msg.edit(`Débannissement des membres **effectué**\n\`${unban}\` membres ont été débannis.\n\`${still}\` n'ont pas pu être débannis.`)
        }
        else {
            const user = message.mentions.users.first() || client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(() => null)
            if (!user || !args[0]) return message.channel.send(`Aucun utilisateur de trouvé pour \`${args[0] ?? "rien"}\``)
            
            db.tempban.filter(c => c.userId !== user.id);
            client.save(message.guildId);

            message.guild.bans.remove(user, `Débanni par ${message.author.displayName} (${message.author.id})`)
                 .then(() => { sendModLog(client, message.guild, "unban", "Unban", `${user} a été débanni par ${message.author}`); return message.channel.send(`${user.displayName} a été **débanni**`); })
                .catch(() => message.channel.send(`Je n'ai pas pu débannir ${user.displayName}`))
        }
    },
}
