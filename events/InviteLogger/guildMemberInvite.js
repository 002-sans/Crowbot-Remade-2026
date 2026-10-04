const { Client } = require("discord.js");
const { sendJoinWelcome } = require("../../utiles/joinWelcome");

module.exports = {
    name: "guildMemberInvite",
    /**
     * @param {Client} client
     * @param {object} data
     */
    async execute(client, data) {
        const { guildId, type, inviter, member } = data;

        const db = client.get(guildId);
        db.inviter ??= [];
        db.invites ??= {};
        const invites = await member.guild.invites.fetch().catch(() => null);

        if (inviter && !db.inviter.find(c => c.id == inviter?.id)) {
            db.inviter.push({
                id: inviter.id,
                joiners: [],
                joins: 0,
                leaves: 0
            });
        }

        const userDb = db.inviter.find(c => c.id == inviter?.id);
        if (userDb) {
            userDb.joins++;
            userDb.joiners.push(member.user.id);
        }

        client.save(guildId);

        if (db.joinsettings?.captcha?.enabled) {
            const captcha = db.joinsettings.captcha;
            if (!captcha.roleId) {
                const role = await member.guild.roles.create({
                    name: "Non vérifié",
                    color: "#777777",
                    reason: "Rôle captcha"
                }).catch(() => null);
                if (role) {
                    captcha.roleId = role.id;
                    for (const channel of member.guild.channels.cache.values()) {
                        if (!channel.isTextBased()) continue;
                        await channel.permissionOverwrites.edit(role, {
                            ViewChannel: channel.id === captcha.channelId,
                            SendMessages: false
                        }).catch(() => null);
                    }
                    client.save(guildId);
                }
            }

            const captchaRole = member.guild.roles.cache.get(captcha.roleId);
            if (captchaRole) await member.roles.add(captchaRole, "Captcha").catch(() => null);
            captcha.pending ??= {};
            captcha.pending[member.id] = Date.now();
            client.save(guildId);

            const duration = Number(captcha.duration) || 300000;
            setTimeout(async () => {
                const current = client.get(guildId);
                if (!current.joinsettings?.captcha?.pending?.[member.id]) return;
                const freshMember = await member.guild.members.fetch(member.id).catch(() => null);
                if (freshMember?.kickable) await freshMember.kick("Captcha non complété").catch(() => null);
                delete current.joinsettings.captcha.pending[member.id];
                client.save(guildId);
            }, duration);

            client.captchaInviters ??= new Map();
            client.captchaInviters.set(`${guildId}:${member.id}`, inviter);
        } else {
            await sendJoinWelcome(member, db, inviter);
        }

        const newInvites = await member.guild.invites.fetch().catch(() => []);
        newInvites.forEach(i => {
            let inviteData = db.invites[i.code];
            if (!inviteData) {
                db.invites[i.code] = { id: i.id, uses: i.uses };
            } else {
                if (inviteData.uses !== i.uses) {
                    db.invites[i.code] = {
                        inviterId: i.inviterId,
                        uses: i.uses,
                        inviter: db.invites[i.code]?.inviter ?? []
                    };
                }
            }
        });

        client.save(guildId);
    }
};
