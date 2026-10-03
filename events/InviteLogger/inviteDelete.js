const { Client, Invite } = require("discord.js");

module.exports = {
    name: "inviteDelete",
    /**
     * @param {Client} client
     * @param {Invite} invite
    */
    async execute(client, invite) {
        client.guilds.cache.forEach(g => {
            const db = client.get(g.id);
            
            g.invites.fetch().then(guildInvites => {
                guildInvites.forEach(i => db.invites[i.code] = { inviterId: i.inviterId, uses: i.uses, inviter: db.invites[i.code]?.inviter ?? [] })
                client.save(g.id);
            });
        });
    }
}