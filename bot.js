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

bot.on('message', async (context, next) => {
  console.log('-----> message');
  console.log('----->session:');
  console.log(context.session);
  if(context.updateSubTypes.includes('forward')) {
    context.session.forward = context.message;
    console.log(`added ${context.session.forward}`)
  }
  else if(context.session.forward) {
    tg.sendMessage(context.session.forward.forward_from_chat_id, context.message.text, { reply_to_message_id : context.session.forward.forward_from_chat_message_id});
    delete previous_messages(context.session.forward);
    return;
  }
  else if(context.session.chat_id) {
    console.log(`sending message ${context.message.text} to ${context.session.chat_id}`);
    console.log(await tg.sendMessage(context.session.chat_id, context.message.text));
    return;
  }
  return next(context);
})

bot.command('message', async (context, next) => {
  console.log(context);
  try {
    let data = extractData(context.message.text);
    context.session.chat_id = data.chat_id || context.session.chat_id;
    if(context.session.chat_id) {
      context.reply(`sending message to ${context.session.chat_id}`);
      tg.sendMessage(data.chat_id, data.text)
    }
    else {
      context.reply(`chat id was not set; chat id passed: ${data.chat_id}`);
    }
  }
  catch(err) {
    context.reply(err);
  }
  next(context);
})

bot.command('set_chat', async(context, next) => {
  console.log('-----> set chat')
  let id;
  try {
    let res = /set_chat (?<id>-?[0-9]*)/.exec(context.message.text); //mb change to extractData call
    id = res.groups.id;
  } 
  catch(e){
    context.reply(e);
  }
  if(id) {
    context.session.chat_id = id;
    let chat = await tg.getChat(context.session.chat_id);
    console.log(chat);
  }
})

bot.command('reset', async(context, next) => {
  context.session = {};
})

bot.command('id', async (context, next) => {
  console.log('-----> id');
  context.reply(context.chat.id);
})

bot.startPolling();