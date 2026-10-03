const { isExemptUser, isWhitelisted, getModule } = require("../../utiles/antiraid");
const userCounters = {};
const interval = {};

module.exports = {
    name: "guildMemberAdd",
    async execute(client, member) {
        const db = client.get(member.guild.id);
        const bl = client.getBlacklist();

        if (bl[member.id]) {
            return member.ban({ reason: bl[member.id].reason ?? "Blacklist" }).catch(() => null);
        }

        if (isExemptUser(client, member.guild, member.id)) return;

        if (db.antiraid.crealimit && Date.now() - member.user.createdAt.getTime() < db.antiraid.crealimit) {
            if (!(isWhitelisted(db, member, "antitoken"))) {
                return member.kick("Creation Limite").catch(() => null);
            }
        }

        const conf = getModule(db, "antitoken");
        if (!conf.etat) return;
        if (isWhitelisted(db, member, "antitoken") && !conf.max) return;

        if (!userCounters[member.guild.id]) userCounters[member.guild.id] = 0;
        userCounters[member.guild.id]++;

        if (userCounters[member.guild.id] > Number(conf.nombre || 5)) {
            member.kick("Anti token").catch(() => null);
        }

        if (!interval[member.guild.id]) {
            interval[member.guild.id] = true;
            setTimeout(() => {
                delete interval[member.guild.id];
                delete userCounters[member.guild.id];
            }, conf.durée || 10000);
        }
    },
};
