var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
  console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

const firstQuestion = {
  "いいランチのお店": {
    value: 0
  },
  "飲めるところ": {
    value: 1
  }
};
bot.dialog('/getQuestion', [
  function(session) {
    builder.Prompts.choice(session, "ご質問をどうぞ", firstQuestion, { listStyle: 3 });
  },
  function(session, results) {
    console.log(results.response)
    session.send('%sですね。', results.response.entity);
    session.endDialog();
  }
]);

bot.dialog('/', [
  function(session) {
    session.send("ボットが自動でお答えします。");
    session.beginDialog('/getQuestion');
  },
  //   function(session, results) {
  //     session.beginDialog('/anotherQuestion');
  //   }
]);