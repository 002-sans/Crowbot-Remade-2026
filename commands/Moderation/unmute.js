const { PermissionsBitField, Client, Message } = require("discord.js");
const { sendModLog } = require("../../utiles/modlog");

module.exports = {
    name: "unmute",
    description: "Permet d'unmute un utilisateur.",
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
        if (!args.length) return message.channel.send(`Aucun membre de trouvé pour \`rien\``);

        if (args[0] === "all") {
            const mutes = message.guild.members.cache.filter(m => m.isCommunicationDisabled() || (db.muterole && m.roles.cache.has(db.muterole)));
            if (mutes.size === 0) return message.channel.send("Il n'y a aucun membre mute sur le serveur");

            const msg = await message.channel.send(`Je vais unmute ${mutes.size} membre${mutes.size > 1 ? "s" : ""}`);
            let unmuteCount = 0;

            for (const member of mutes.values()) {
                try {
                    await member.timeout(null).catch(() => null);
                    if (db.muterole && member.roles.cache.has(db.muterole)) {
                        await member.roles.remove(db.muterole).catch(() => null);
                    }
                    unmuteCount++;
                } catch {
                    // ignore
                }
            }

            return msg.edit(`J'ai unmute ${unmuteCount}/${mutes.size} membre${mutes.size > 1 ? "s" : ""}`);
        }

        const members = await client.resolveMembers(message.guild, args.join(' '), message.mentions.members);
        if (!members.length) return message.channel.send(`Aucun membre de trouvé pour \`${args.join(' ') || "rien"}\``);

        let successCount = 0;
        let failCount = 0;

        for (const member of members) {
            try {
                await member.timeout(null, `Unmute par ${message.author.displayName} (${message.author.id})`);
                if (db.muterole && member.roles.cache.has(db.muterole)) {
                    await member.roles.remove(db.muterole).catch(() => null);
                }
                sendModLog(client, message.guild, "unmute", "Unmute", `${member} a été unmute par ${message.author}`);
                successCount++;
                if (members.length === 1) {
                    return message.channel.send(`${member.displayName} a été **unmute**`);
                }
            } catch {
                failCount++;
                if (members.length === 1) {
                    return message.channel.send(`Je n'ai pas pu unmute ${member.displayName}`);
                }
            }
        }

        return message.channel.send(`\`${successCount}\` membre(s) ont été **unmutes**`);
    },
};
