const Interaction = require('../../../../../Structures/Interaction');
const { MessageActionRow, MessageButton, Util } = require('discord.js');

module.exports = class extends Interaction {

	constructor(...args) {
		super(...args, {
			name: 'emoji',
			subCommand: 'rename',
			description: 'Rename a server emoji.',
			memberPermissions: ['MANAGE_EMOJIS_AND_STICKERS'],
			clientPermissions: ['MANAGE_EMOJIS_AND_STICKERS']
		});
	}

	async run(interaction) {
		const emoji = await interaction.options.getString('emoji', true);
		const name = await interaction.options.getString('name', true);

		const parseEmoji = Util.parseEmoji(emoji);

		const emojis = await interaction.guild.emojis.cache.get(parseEmoji.id);
		if (!emojis.guild) return interaction.reply({ content: 'This emoji not from this guild', ephemeral: true });

		const button = new MessageActionRow()
			.addComponents(new MessageButton()
				.setStyle('SECONDARY')
				.setCustomId('cancel')
				.setLabel('Cancel'))
			.addComponents(new MessageButton()
				.setStyle('SUCCESS')
				.setCustomId('confirm')
				.setLabel('Confirm'));

		return interaction.reply({ content: `Are you sure to rename \`:${emojis.name}:\` ${emojis} to \`:${name}:\`?`, components: [button], fetchReply: true }).then(message => {
			const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: 60_000 });

			collector.on('collect', async (i) => {
				if (i.user.id !== interaction.user.id) return i.deferUpdate();
				await i.deferUpdate();

				switch (i.customId) {
					case 'cancel':
						await collector.stop();
						return i.editReply({ content: 'Cancelation of the emoji\'s name change.', components: [] });
					case 'confirm':
						await emojis.edit({ name });
						return i.editReply({ content: `Emoji \`:${emojis.name}:\` ${emojis} was successfully renamed.`, components: [] });
				}
			});

			collector.on('end', (collected, reason) => {
				if ((collected.size === 0 || collected.filter(x => x.user.id === interaction.user.id).size === 0) && reason === 'time') {
					return interaction.deleteReply();
				}
			});
		});
	}

};
