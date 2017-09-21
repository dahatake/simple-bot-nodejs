const builder = require('botbuilder');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const confige = require('config');

let insightsClient;
if (process.env.APP_INSIGHTS_KEY) {
    const appInsights = require("applicationinsights");
    appInsights.setup(process.env.APP_INSIGHTS_KEY)
        .setAutoDependencyCorrelation(false)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .start();
    insightsClient = appInsights.getClient();
}

const Util = require('./Util');
const util = new Util();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//=========================================================
// Bot Setup
//=========================================================

const port = process.env.port || process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('bot is listening on port %s', port);
});

// Create chat bot
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector);

// for getting all user input
app.all('/api/messages', (req, res, next) => {
    if (req.body.type === 'message' && req.body.text) {
        util.storeUserInput(req.body);
        console.log('message', req.body);

        if (req.body.channelData) {
            console.log('channelData', req.body.channelData);
            if (insightsClient) {
                insightsClient.trackEvent('channelData', req.body.channelData);
            }
        }
    }
    next();
});

app.post('/api/messages', connector.listen());

app.get('/', (req, res) => {
    res.send(`Bot is running on port ${port}!\n`);
});

//=========================================================
// Bots Dialogs
//=========================================================

// When user joins, it begin Greeting dialog
bot.on('conversationUpdate', message => {
    if (message.membersAdded) {
        message.membersAdded.forEach(identity => {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, 'InitialConversation');
            }
        });
    }
});

const firstChoices = {
    "ランチ": {
        value: 'lunch01',
        title: 'やっぱりチャーハン',
        subtitle: 'カニチャーハン',
        text: '渋谷駅から徒歩5分。カウンター主体なので、1人でも入りやすい!',
        imageURL: 'https://github.com/dahatake/simple-bot-nodejs/images/chahan.jpg',
        button: '予約する',
        url: 'https://tabelog.com/tokyo/A1303/A130301/13005407/'
    },
    "定番パスタ": {
        value: 'lunch02',
        title: 'どのお店も安定した美味さ',
        subtitle: '五右衛門',
        text: '品川駅ハチ公口から徒歩1分くらい。の路地裏にひっそりある。',
        imageURL: 'http://www.yomenya-goemon.com/images/img_170901autumn/reco_menu05_xl.jpg"',
        button: '予約する',
        url: 'https://tabelog.com/tokyo/A1303/A130301/13012503/'
    },
    "画像の簡単な説明": {
        value: 'imageRecognition'
    },
    "何の食べ物か見分ける": {
        value: 'imageClassificationByCustomVision'
    },
    "その他": {
        value: 'others'
    }
};

// default first dialog
bot.dialog('/', [
    session => {
        session.send("こんにちは。\n私はBot初期型です。");
        session.beginDialog('InitialConversation');
    }
]);

bot.dialog('InitialConversation', [
    session => {
        session.send("幾つかのお手伝いができます。\n\n会話を終了させたい場合は[exit]と入力ください。");
        session.beginDialog('AskDialog');
    }
]);

bot.dialog('AskDialog', [
    (session, results, next) => {
        builder.Prompts.choice(session, "何をお探しですか。", firstChoices, { listStyle: 3 });
    },
    (session, results, next) => {
        const choice = firstChoices[results.response.entity];
        console.log(results.response);

        if (choice.value === 'others') {
            session.beginDialog('GetFreeText');
            return;
        } else if (choice.value === 'imageRecognition') {
            session.beginDialog('ImageRecognition');
            return;
        } else if (choice.value === 'imageClassificationByCustomVision') {
            session.beginDialog('ImageClassificationByCustomVision');
            return;
        }

        session.send('%sですね。\n\nこちらはいかがでしょうか。', results.response.entity);

        const card = new builder.HeroCard(session)
            .title(choice.title)
            .subtitle(choice.subtitle)
            .text(choice.text)
            .images([
                builder.CardImage.create(session, choice.imageURL)
            ])
            .buttons([
                builder.CardAction.openUrl(session, choice.url, choice.button)
            ]);

        const msg = new builder.Message(session).addAttachment(card);
        session.send(msg);
        session.beginDialog('EndDialog');
    }
]);

/* bot.dialog('GetFreeText', [
    session => {
        builder.Prompts.text(session, "ご不明点を自由に入力してください。");
    },
    (session, results) => {
        console.log(results.response);
        const res = util.getLuis(results.response).then(res => {
            console.log('res', res);
            // process LUIS response
        });
    }
]);
 */
bot.dialog('ImageRecognition', [
    session => {
        builder.Prompts.attachment(session, '画像をアップロードしてください（複数可）');
    },
    (session, results) => {
        const promises = [];
        results.response.forEach(content => {
            if (content.contentType.match('image')) {
                promises.push(util.getCognitiveResults(content.contentUrl));
            }
        });

        Promise.all(promises).then(imageDescs => {
            imageDescs.forEach(res => {
                util.getTranslatorAuthToken().
                then(auth =>{
                    util.getTranslationResults(auth, res.description.captions[0].text).
                    then( result => {
                        session.send(result);
                    })
                });
            });
        });
    }
]);

bot.dialog('ImageClassificationByCustomVision', [
    session => {
        builder.Prompts.attachment(session, '食べ物の画像をアップロードしてください（複数可）');
    },
    (session, results) => {
        const promises = [];
        results.response.forEach(content => {
            if (content.contentType.match('image')) {
                promises.push(util.getCustomVisionResults(content.contentUrl));
            }
        });

        Promise.all(promises).then(imageDescs => {
            imageDescs.forEach(res => {
                session.send(res.Predictions[0].Tag + " : " + res.Predictions[0].Probability);
            });
        });

    }
]);


bot.dialog('EndDialog', [
    session => {
        builder.Prompts.confirm(session, "疑問は解決しましたか？", { listStyle: 3 });
    },
    (session, results) => {
        console.log(results.response);
        if (results.response) {
            session.send('ありがとうございました。');
            session.endDialog();
            session.beginDialog('AskDialog');
        } else {
            session.send('お役に立てず申し訳ありません。');
            session.beginDialog('AskDialog');
        }
    }
]);

// help command
bot.customAction({
    matches: /^help$/i,
    onSelectAction: (session, args, next) => {
        const helpTexts = [
            'help: このヘルプメニュー。前のdialogは続いています。',
            'exit: dialogを終わらせ、 最初に戻ります。',
        ]
        session.send(helpTexts.join('\n\n'));
    }
});

// exit command
bot.dialog('Exit', [
    session => {
        session.endDialog("スタックを消去して終了します。");
        session.beginDialog('AskDialog');
    },
]).triggerAction({
    matches: /^exit$/i
});

// exit command
bot.dialog('Any', [
    session => {
        session.endDialog("自由入力を受け付けました。");
        session.beginDialog('FirstQuestion');
    },
]).triggerAction({
    matches: /^.*$/i
});