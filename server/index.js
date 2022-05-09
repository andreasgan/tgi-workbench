const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_API_TOKEN;
const url = process.env.RENDER_EXTERNAL_URL;
const server = express();
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${url}/bot${TOKEN}`);

const port = process.env.PORT || 5000;
const gameName = "dev";

const queries = {};

bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "This bot implements a game. Say /game if you want to play."));

bot.onText(/start|game/, (msg) => bot.sendGame(msg.from.id, gameName));
bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.");
    } else {
        queries[query.id] = query;
        let gameurl = "https://tgi-dev.onrender.com/?id="+query.id;
        bot.answerCallbackQuery(query.id, {
            url: gameurl
        });
    }
});
bot.on("inline_query", function(iq) {
      bot.answerInlineQuery(iq.id, [ { type: "game", id: "0", game_short_name: gameName } ] ); 
});

// make the files in the folder 'public' accessible
server.use(express.static(path.join(__dirname, '../public')));

// add json support
server.use(express.json());

// register the route which receives bot updates from telegram
server.post(`/bot${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// endpoint to set highscore
server.get("/highscore/:score", function(req, res, next) {
    if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
    let query = queries[req.query.id];
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options, 
        function (err, result) {});
});

server.listen(port);