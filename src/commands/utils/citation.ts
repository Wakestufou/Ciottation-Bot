import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from '../../types/SlashCommand';
import {
    createData,
    getAllCitationFromUser,
    getRandomCitation,
    getRandomCitationFromUser,
} from '../../utils/bdd';

async function checkAuthorOrCustomExists(interaction: ChatInputCommandInteraction) {
    const author = interaction.options.getUser('author');
    const custom = interaction.options.getString('custom');

    if (!author?.id && !custom) {
        await interaction.reply({
            content:
                '❗ Tu dois soit mentionner un utilisateur (`author`), soit fournir un nom custom (`custom`).',
            ephemeral: true,
        });
        return false;
    }

    return true;
}

async function createSubCommand(interaction: ChatInputCommandInteraction, guild_id: string) {
    const author = interaction.options.getUser('author');
    const custom = interaction.options.getString('custom');
    const content = interaction.options.getString('content', true);

    if (!author?.id && !custom) {
        return interaction.reply({
            content:
                '❗ Tu dois soit mentionner un utilisateur (`author`), soit fournir un nom custom (`custom`).',
            ephemeral: true,
        });
    }

    createData(author, custom, guild_id, content, interaction.user.id);

    await interaction.reply({
        content: `📚 Citation créée avec pour author : ${author ? `<@${author.id}>` : custom}`,
        flags: [MessageFlags.Ephemeral],
    });
}

async function randomSubCommand(interaction: ChatInputCommandInteraction, guild_id: string) {
    const author = interaction.options.getUser('author', false);
    const custom = interaction.options.getString('custom', false);
    let citation = null;

    if (author || custom) {
        citation = getRandomCitationFromUser(author?.id || (custom as string), guild_id);

        if (!citation) {
            await interaction.reply({
                content: 'Aucune citation trouvé pour cette personne sur le serveur !',
            });
            return;
        }
    } else {
        citation = getRandomCitation(guild_id);
    }

    if (!citation) {
        await interaction.reply({
            content: 'Aucune citation trouvé pour cette personne sur le serveur !',
        });
        return;
    }

    const user = citation.user.id ? await interaction.guild?.members.fetch(citation.user.id) : null;

    await interaction.reply({
        content: `${user ? `**${user.nickname} :**` : `${citation.user.name} :`} ${citation.citation}`,
    });
}

async function listSubCommand(interaction: ChatInputCommandInteraction, guild_id: string) {
    const author = interaction.options.getUser('author', false);
    const custom = interaction.options.getString('custom', false);

    const citations = getAllCitationFromUser(author?.id || (custom as string), guild_id);

    if (!citations || citations.quotes.length === 0) {
        await interaction.reply({
            content: "Cet utilisateur n'a pas de citation sur ce serveur !",
            flags: [MessageFlags.Ephemeral],
        });
        return;
    }

    const authorName = citations.user.id
        ? (await interaction.guild?.members.fetch(citations.user.id))?.nickname
        : author
          ? author.displayName
          : custom;

    await interaction.reply({
        content: `**${authorName} :\n**${citations.quotes.join('\n')}`,
    });
}

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('citation')
        .setDescription('Replies with Pong!')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand((subCommand) =>
            subCommand
                .setName('create')
                .setDescription('Créer une citation')
                .addStringOption((input) =>
                    input.setName('content').setDescription('La citation').setRequired(true)
                )
                .addUserOption((input) =>
                    input.setName('author').setDescription("L'auteur de la citation")
                )
                .addStringOption((input) =>
                    input.setName('custom').setDescription("L'auteur custom de la citation")
                )
        )
        .addSubcommand((subCommand) =>
            subCommand
                .setName('random')
                .setDescription('Tire une citation random')
                .addUserOption((input) =>
                    input.setName('author').setDescription("L'auteur de la citation")
                )
                .addStringOption((input) =>
                    input.setName('custom').setDescription("L'auteur custom de la citation")
                )
        )
        .addSubcommand((subCommand) =>
            subCommand
                .setName('list')
                .setDescription("Liste toutes les citations d'une personne")
                .addUserOption((input) =>
                    input.setName('author').setDescription("L'auteur de la citation")
                )
                .addStringOption((input) =>
                    input.setName('custom').setDescription("L'auteur custom de la citation")
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const guild_id = interaction.guildId as string;

        if (!guild_id) {
            await interaction.reply({
                content: `❗ Il faut que tu sois sur un serveur`,
                flags: [MessageFlags.Ephemeral],
            });
            return;
        }

        if (interaction.options.getSubcommand() === 'create') {
            const testAuthorAndCustom = await checkAuthorOrCustomExists(interaction);

            if (!testAuthorAndCustom) {
                return;
            }

            createSubCommand(interaction, guild_id);
            return;
        } else if (interaction.options.getSubcommand() === 'random') {
            randomSubCommand(interaction, guild_id);
            return;
        } else if (interaction.options.getSubcommand() === 'list') {
            const testAuthorAndCustom = await checkAuthorOrCustomExists(interaction);

            if (!testAuthorAndCustom) {
                return;
            }

            listSubCommand(interaction, guild_id);
            return;
        }

        await interaction.reply({
            content: 'Je ne connais pas cette commande',
            flags: [MessageFlags.Ephemeral],
        });
    },
};

export default command;
