module.exports = {
    name: "guildMemberUpdate",
    async execute(client, oldMember, newMember) {
        const lockedNickname = client.get(newMember.guild.id).locknames?.[newMember.id];
        if (!lockedNickname || newMember.nickname === lockedNickname) return;

        await newMember.setNickname(lockedNickname, "Pseudo verrouillé").catch(() => null);
    },
};
