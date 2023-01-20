import "dotenv/config";
import {
    Client,
    GatewayIntentBits,
    Partials,
    Options,
    TextChannel,
    ActivityType,
    GuildMember,
} from "discord.js";

const intents: GatewayIntentBits[] = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
];
const partials: Partials[] = [Partials.Message];

const client = new Client({
    intents,
    partials,
});

client.on("ready", async () => {
    await Promise.all([
        client.guilds.fetch(),
        client.guilds.cache.get(process.env.guildId).members.fetch(),
        client.guilds.cache.get(process.env.guildId).channels.fetch(),
        // prettier-ignore
        (client.guilds.cache.get(process.env.guildId).channels.cache.get(process.env.channelId) as TextChannel).messages.fetch(),
    ]);

    client.user.setActivity({
        type: ActivityType.Playing,
        name: "Grand Piece Online",
    });

    console.log("Ready!");

    /*

    const testMember = {
        ...client.guilds.cache.get(process.env.guildId).members.cache.get("561079626131177483"),
        user: {
            ...client.users.cache.get("561079626131177483"),
            createdTimestamp: Date.now(),
        },
    } as GuildMember;

    client.emit("guildMemberAdd", testMember);  */
});

client.on("guildMemberAdd", async (member) => {
    if (member.guild.id !== process.env.guildId) return;

    // check if member account is older than 7 days
    if (Date.now() - member.user.createdTimestamp < 1000 * 60 * 60 * 24 * 7) {
        // kick member
        const canJoinInTimestamp =
            1000 * 60 * 60 * 24 * 7 - (Date.now() - member.user.createdTimestamp);

        await (client.channels.cache.get(process.env.logsChannelId) as TextChannel).send({
            content: `**${member.user.tag}** (${
                member.user.id
            }) a rejoint le serveur mais a été kick car son compte est trop récent. Il pourra réessayer <t:${Math.floor(
                Date.now() / 1000 + canJoinInTimestamp / 1000
            )}:R>`,
        });
        await member.user
            .send({
                content: `Bonjour, votre compte est trop récent pour rejoindre le serveur. Vous pourrez réessayer <t:${Math.floor(
                    Date.now() / 1000 + canJoinInTimestamp / 1000
                )}:R>`,
            })
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch(() => {});

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        await member.kick("DOUBLE COMPTE").catch(() => {});
        console.log(`Kicked ${member.user.tag} (${member.user.id})`);
    } else console.log(`Accepted ${member.user.tag} (${member.user.id})`);
});

client.login(process.env.token);
