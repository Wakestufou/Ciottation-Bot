import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from '../../types/SlashCommand';
import { mergeUserAndCustom } from '../../utils/bdd';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('creator')
        .setDescription('Commands for creator !')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand((subCommand) =>
            subCommand
                .setName('merge')
                .setDescription('Commands for creator : Merge two users')
                .addUserOption((input) =>
                    input.setName('user').setDescription("L'utilisateur").setRequired(true)
                )
                .addStringOption((input) =>
                    input.setName('custom').setDescription("L'auteur custom").setRequired(true)
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.user;

        if (!process.env.ADMINS?.split(',').find((admin) => admin === user.id)) {
            await interaction.reply({
                content:
                    "Vous n'êtes pas un créateur du bot ! Vous ne pouvez pas exécuter cette commande !",
                flags: [MessageFlags.Ephemeral],
            });

            return;
        }

        const guild_id = interaction.guildId as string;

        if (!guild_id) {
            await interaction.reply({
                content: `❗ Il faut que tu sois sur un serveur`,
                flags: [MessageFlags.Ephemeral],
            });
            return;
        }

        if (interaction.options.getSubcommand() === 'merge') {
            const author = interaction.options.getUser('user', true);
            const custom = interaction.options.getString('custom', true);

            if (mergeUserAndCustom(guild_id, author, custom)) {
                await interaction.reply({
                    content: 'Merge effectué !',
                    flags: [MessageFlags.Ephemeral],
                });
                return;
            }

            await interaction.reply({
                content: 'Merge non effectué (Bon user et bon custom ?) !',
                flags: [MessageFlags.Ephemeral],
            });
            return;
        }

        await interaction.reply({
            content: 'Je ne connais pas cette commande !',
            flags: [MessageFlags.Ephemeral],
        });
    },
};

export default command;
