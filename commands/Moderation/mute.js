const { PermissionsBitField, Client, Message } = require("discord.js");
const { sendModLog } = require("../../utiles/modlog");
const ms = require("ms");

function parseTime(time) {
    if (!time) return null;
    return ms(time) || null;
}

module.exports = {
    name: "mute",
    description: "Permet de mute l'utilisateur mentionné.",
    category: "Modération",
    argument: "<membre> [temps] [raison]",
    aliases: [],
    perm: 2,
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (!args.length) return message.channel.send(`Aucun membre de trouvé pour \`rien\``);

        const db = client.get(message.guildId);
        const groups = client.resolvers.splitArgumentGroups(args.join(' '), 2);
        const memberInput = groups[0] || args[0];
        const rest = (groups[1] || "").split(/\s+/);

        let time = parseTime(rest[0]);
        let reason = "";
        if (time) {
            reason = rest.slice(1).join(' ');
        } else {
            time = parseTime("28d");
            reason = rest.join(' ');
        }

        const members = await client.resolveMembers(message.guild, memberInput, message.mentions.members);
        if (!members.length) return message.channel.send(`Aucun membre de trouvé pour \`${memberInput || "rien"}\``);

        let successCount = 0;
        let failCount = 0;

        for (const member of members) {
            if (message.member.roles.highest.position <= member.roles.highest.position || member.id === message.guild.ownerId || !member.moderatable) {
                failCount++;
                if (members.length === 1) {
                    if (member.id === message.guild.ownerId) return message.channel.send("T'essayes vraiment de mute le propriétaire du serveur ?");
                    return message.channel.send("Vous ne pouvez pas mute ce membre");
                }
                continue;
            }

            if (db.timeout === false) {
                let role = message.guild.roles.cache.get(db.muterole);
                if (!role) {
                    role = await message.guild.roles.create({
                        name: 'Muted',
                        color: '#000000',
                        reason: `Muterole par ${message.author.tag}`
                    }).catch(() => null);
                    if (role) {
                        db.muterole = role.id;
                        client.save(message.guildId);
                        for (const channel of message.guild.channels.cache.values()) {
                            await channel.permissionOverwrites.edit(role, {
                                SendMessages: false,
                                AddReactions: false,
                                Speak: false,
                                Connect: false
                            }).catch(() => null);
                        }
                    }
                }
                if (role) {
                    try {
                        await member.roles.add(role, `Mute par ${message.author.displayName}`);
                        sendModLog(client, message.guild, "mute", "Mute", `${member} a été mute par ${message.author}`);
                        successCount++;
                        if (members.length === 1) {
                            return message.channel.send(`${member.displayName} a été **mute** ${reason ? `pour \`${reason}\`` : ''}`);
                        }
                    } catch {
                        failCount++;
                        if (members.length === 1) {
                            return message.channel.send(`Je n'ai pas pu mute ${member.displayName}`);
                        }
                    }
                }
            } else {
                try {
                    await member.timeout(time, `Mute par ${message.author.displayName} (${message.author.id}) ${reason}`);
                    sendModLog(client, message.guild, "mute", "Mute", `${member} a été mute par ${message.author}`);
                    successCount++;
                    if (members.length === 1) {
                        return message.channel.send(`${member.displayName} a été **mute** ${reason ? `pour \`${reason}\`` : ''}`);
                    }
                } catch {
                    failCount++;
                    if (members.length === 1) {
                        return message.channel.send(`Je n'ai pas pu mute ${member.displayName}`);
                    }
                }
            }
        }

        return message.channel.send(`\`${successCount}\` membre(s) ont été **mutes** ${reason ? `pour \`${reason}\`` : ''}`);
    },
};
