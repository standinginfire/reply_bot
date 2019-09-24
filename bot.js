const telegraf = require('telegraf')

let bot = new telegraf(process.env.BOT_TOKEN)

bot.use((context, next) => {
  console.log('----> recieved:');
  //console.log(context.tg);
  console.log(context.updateType); // message
  console.log(context.updateSubTypes); // ['text', 'forward']
  console.log(context.message);
  return next(context);
});

bot.help(ctx => ctx.reply("Ho ho ho! You're going to hell!"));

bot.on('message', async (context, next) => {
})

bot.command('reply', async (context, next) => {
})

bot.startPolling();