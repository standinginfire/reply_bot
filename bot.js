const telegraf = require('telegraf')
const telegram = require('telegraf/telegram')
const session = require('telegraf/session')

let bot = new telegraf(process.env.BOT_TOKEN)
let tg = new telegram(process.env.BOT_TOKEN);

bot.use(session());

bot.use((context, next) => {
  console.log('----> recieved:');
  //console.log(context.tg);
  //console.log(context.updateType); // message
  //console.log(context.updateSubTypes); // ['text', 'forward']
  console.log(context.message);
  return next(context);
});

bot.help(ctx => ctx.reply("Ho ho ho! You're going to hell!"));

let extractData = (message_text) => {
  let regexp = /\/[a-zA-Z]* (?<n>-?[0-9]*) (?<t>.*)/
  let res = regexp.exec(message_text);
  if(res.groups) {
    return {chat_id: res.groups.n, text: res.groups.t};
  }
  return {};
}

let previous_messages = {};

bot.on('message', async (context, next) => {
  console.log('-----> message');
  if(context.updateSubTypes.includes('forward')) {
    previous_messages[context.from.id] = context.message;
    console.log(`added ${Object.keys(previous_messages)} ${previous_messages[context.from.id]}`)
  }
  else if(Object.keys(previous_messages).includes(context.from.id)) {
    let source_message = previous_messages[context.from.id];
    telegram.sendMessage(source_message.forward_from_chat_id, context.message.text, { reply_to_message_id : source_message.forward_from_chat_message_id});
    delete previous_messages(context.from.id);
  }
  return next(context);
})

bot.command('message', async (context, next) => {
  console.log(context);
  let data = extractData(context.message.text);
  tg.sendMessage(data.chat_id, data.text)
})

bot.command('set_chat', async(context, next) => {
  console.log('-----> set chat')
  let id;
  try {
    
    let res = /set_chat (?<id>-?[0-9]*)/.exec(context.message.text);
    id = res.groups.id;
  } 
  catch(e){
    context.reply(e);
  }
  if(id) {
    context.id = id;
    let chat = await tg.getChat(id);
    console.log(chat);
  }
})
bot.command('id', async (context, next) => {
  console.log('-----> id');
  tg.sendMessage(context.chat.id, context.chat.id);
})

bot.startPolling();