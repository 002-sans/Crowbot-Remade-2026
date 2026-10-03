const { Client, Message } = require("discord.js");
const { sendModLog } = require("../../utiles/modlog");

module.exports = {
    name: "tempmute",
    description: "Mute un membre pour une durée déterminée",
    category: "Modération",
    argument: "<membre> <durée> [raison]",
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
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!member || !args[0]) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] ?? "rien"}\``);
        if (message.member.roles.highest.position <= member.roles.highest.position && message.author.id !== message.guild.ownerId) return message.channel.send("Vous ne pouvez pas mute ce membre");
        if (member.id == message.guild.ownerId) return message.channel.send("T'essayes vraiment de mute le propriétaire du serveur ?");
        if (!member.moderatable) return message.channel.send("Je ne peux pas mute ce membre");
        const time = client.ms(args[1]);
        if (!time || time > 1000 * 60 * 60 * 24 * 28 || time < 1000) return message.channel.send("Veuillez entrer un temps entre 1 seconde et 28 jours");
        const reason = args.slice(2).join(' ');
        member.timeout(time, `Tempmute par ${message.author.displayName} (${message.author.id}) ${reason ?? ''}`)
            .then(() => { sendModLog(client, message.guild, "tempmute", "Tempmute", `${member} a été tempmute par ${message.author} pendant ${args[1]}\n${reason || "Aucune raison"}`); return message.channel.send(`${member.displayName} a été **mute** pendant \`${args[1]}\`${reason ? ` pour \`${reason}\`` : ''}`); })
            .catch(() => message.channel.send(`Je n'ai pas pu mute ${member.displayName}`));

    },
};
