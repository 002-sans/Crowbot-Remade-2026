const { isExemptUser, isWhitelisted, getModule } = require("../../utiles/antiraid");

const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)/i;
const anyLinkRegex = /https?:\/\/[^\s]+/i;

module.exports = {
    name: "messageUpdate",
    async execute(client, oldMessage, newMessage) {
        if (!newMessage.guild || !newMessage.member || newMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;
        const db = client.get(newMessage.guildId);
        if (isExemptUser(client, newMessage.guild, newMessage.author.id)) return;

        if (/@everyone|@here/.test(newMessage.content || "")) {
            const conf = getModule(db, "antieveryone");
            if (conf.etat && !(isWhitelisted(db, newMessage.member, "antieveryone") && !conf.max)) {
                client.punish(db, conf.punish, newMessage.member, "ping everyone/here");
                newMessage.delete().catch(() => null);
            }
        }

        const link = getModule(db, "antilink");
        if (link.etat && !(isWhitelisted(db, newMessage.member, "antilink") && !link.max)) {
            const type = link.type || "all";
            const content = newMessage.content || "";
            const hit =
                (type === "all" && anyLinkRegex.test(content)) ||
                (type === "invite" && inviteRegex.test(content)) ||
                (type === "discord" && inviteRegex.test(content)) ||
                (type === "lien" && anyLinkRegex.test(content));
            if (hit) {
                client.punish(db, link.punish, newMessage.member, "envoyé un lien");
                newMessage.delete().catch(() => null);
            }
        }
    },
};
