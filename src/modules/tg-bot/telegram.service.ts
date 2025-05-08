import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Action, Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

import { MESSAGES } from './telegram.messages';
import { UserService } from 'modules/user/user.service';
import { Session, Users } from 'entity/some.entity';

@Update()
@Injectable()
export class TelegramService extends Telegraf {
  private readonly _token: string;

  constructor(
   @Inject(UserService) private readonly userService: UserService,
  ) {
    super(process.env.TELEGRAM_BOT_TOKEN || "7750873278:AAEM04c4ag907DxZwIM3mbNHYV-EUlbcltg");
    this._token = process.env.TELEGRAM_BOT_TOKEN || "7750873278:AAEM04c4ag907DxZwIM3mbNHYV-EUlbcltg";
  }

  @Start()
  public async onStart(@Ctx() ctx: any) {	
    const chatId = ctx.chat.id.toString();
    const messageText = ctx.message?.text || '';
    const tokenValue = messageText.split(' ')[1];

    if (!tokenValue) {
      await ctx.replyWithHTML(MESSAGES.tokenNotFound);
      return;
    }

    const user = await this.userService.findByTelegramToken(tokenValue); // здесь падало

    if (!user || !user.telegramAuthTokenExpiresAt || new Date(user.telegramAuthTokenExpiresAt) < new Date()) {
      await ctx.replyWithHTML(MESSAGES.invalidToken);
      return;
    }

    await this.userService.updateUserIdTG(user.id, {
      telegramId: chatId,
      telegramAuthToken: null,	
      telegramAuthTokenExpiresAt: null,
    });

  
	const loginToken = await this.userService.generateTelegramLoginToken(user);

	const loginLink = `http://localhost:8080/auth/telegram?token=${loginToken}`;

	await ctx.replyWithHTML(
		`✅ Авторизация прошла успешно!`
	  );
	  
  }

  @Command('stop')
  public async onStopCommand(@Ctx() ctx: Context) {
	await ctx.reply('Вы уверены, что хотите отписаться от уведомлений?', {
	  reply_markup: {
		inline_keyboard: [
		  [{ text: '❌ Отписаться', callback_data: 'unsubscribe' }]
		]
	  }
	});
  }
  

  @Action('unsubscribe')
  public async handleUnsubscribe(@Ctx() ctx: Context) {
	const chatId = ctx.chat?.id?.toString() ?? ctx.from?.id?.toString();
	if (!chatId) return;
  
	const user = await this.userService.findByChatId(chatId);
  
	if (!user) {
	  await ctx.answerCbQuery('Вы не были подписаны на уведомления.');
	  return;
	}
  
	await this.userService.updateUserIdTG(user.id, {
	  telegramId: null,
	});

	await ctx.editMessageText('❌ Вы успешно отписались от уведомлений. Чтобы снова подписаться — войдите по ссылке заново.');
  }

  public async sendStreamStart(chatId: string, session: Session) {
    await this.telegram.sendMessage(chatId, MESSAGES.streamStart(session), {
      parse_mode: 'HTML',
    });
	
  }
  async sendMessage(chatId: string, text: string) {
    try {
      await this.telegram.sendMessage(chatId, text);
    } catch (error) {
      console.error(`Ошибка при отправке сообщения пользователю ${chatId}:`, error);
    }
  }
  

}
