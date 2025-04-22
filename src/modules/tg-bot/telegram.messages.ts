import { Session } from "entity/some.entity";




export const MESSAGES = {
	authSuccess: `🎉 Вы успешно авторизовались и Telegram аккаунт привязан!\n\n`,
	
	invalidToken: '❌ Недействительный или просроченный токен.',
	tokenNotFound: '❌ Токен для авторизации не найден.',
	
	streamStart: (session: Session) =>
		`<b>📡 На канале ${session.sessionName} изменился статус на ${session.status}!</b>\n\n` +
		`Смотрите здесь: <a href="https://server.deeplom.xyz.ru/${session.id}">Перейти к трансляции</a>`,
}
