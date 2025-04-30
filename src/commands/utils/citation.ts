import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from '../../types/SlashCommand';
import {
    createData,
    getAllCitationFromUser,
    getRandomCitation,
    getRandomCitationFromUser,
} from '../../utils/bdd';

async function createSubCommand(interaction: ChatInputCommandInteraction) {
    const auteur = interaction.options.getUser('author', true);
    const content = interaction.options.getString('content', true);

    createData(auteur.id, content);

    await interaction.reply({
        content: `📚 Citation créée avec pour auteur : <@${auteur.id}>`,
        flags: [MessageFlags.Ephemeral],
    });
}

async function randomSubCommand(interaction: ChatInputCommandInteraction) {
    const auteur = interaction.options.getUser('author', false);

    let citation = null;

    if (auteur) {
        citation = getRandomCitationFromUser(auteur.id);

        if (!citation) {
            await interaction.reply({ content: "Cette personne n'a pas de citation !" });
            return;
        }
    }

    citation = getRandomCitation();

    const user = auteur ? auteur : await interaction.client.users.fetch(citation.user);

    await interaction.reply({
        content: `${user ? `**${user.displayName} :**` : `<@!${citation.user}> :`} ${citation.citation}`,
    });
}

async function listSubCommand(interaction: ChatInputCommandInteraction) {
    const auteur = interaction.options.getUser('author', true);

    const citations = getAllCitationFromUser(auteur.id);

    if (citations.length === 0) {
        await interaction.reply({
            content: "Cet utilisateur n'a pas de citation !",
            flags: [MessageFlags.Ephemeral],
        });
        return;
    }

    await interaction.reply({ content: `**${auteur.displayName} :\n**${citations.join('\n')}` });
}

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('citation')
        .setDescription('Replies with Pong!')
        .addSubcommand((subCommand) =>
            subCommand
                .setName('create')
                .setDescription('Créer une citation')
                .addUserOption((input) =>
                    input
                        .setName('author')
                        .setDescription("L'auteur de la citation")
                        .setRequired(true)
                )
                .addStringOption((input) =>
                    input.setName('content').setDescription('La citation').setRequired(true)
                )
        )
        .addSubcommand((subCommand) =>
            subCommand
                .setName('random')
                .setDescription('Tire une citation random')
                .addUserOption((input) =>
                    input.setName('author').setDescription("L'auteur de la citation")
                )
        )
        .addSubcommand((subCommand) =>
            subCommand
                .setName('list')
                .setDescription("Liste toutes les citations d'une personne")
                .addUserOption((input) =>
                    input
                        .setName('author')
                        .setDescription("L'auteur de la citation")
                        .setRequired(true)
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (interaction.options.getSubcommand() === 'create') {
            createSubCommand(interaction);
            return;
        } else if (interaction.options.getSubcommand() === 'random') {
            randomSubCommand(interaction);
            return;
        } else if (interaction.options.getSubcommand() === 'list') {
            listSubCommand(interaction);
            return;
        }

        await interaction.reply({
            content: 'Je ne connais pas cette commande',
            flags: [MessageFlags.Ephemeral],
        });
    },
};

export default command;
