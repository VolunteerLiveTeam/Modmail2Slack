"use strict";
const snoowrap = require("snoowrap@1.14.2");
const truncate = require("truncate@2.0.0");
const request = require("superagent@3.6.0");

function postConversations(context, r, conversations) {
  if (conversations.length === 0) {
    return Promise.resolve();
  }
  return Promise.all(conversations.map(conversation => {
    return r.oauthRequest({
      uri: '/api/mod/conversations/' + conversation.id,
      method: 'get'
    }).then(response => {
      const msgs = Object.keys(response.messages).map(k => response.messages[k]).sort((a, b) => new Date(a.date) - new Date(b.date)).reverse();
      return [conversation, msgs[0]];
    });
  })).then(convMsgs => {
    const payload = {
      text: "New modmail!"
    };
    payload.attachments = convMsgs.map(convMsg => {
      const conv = convMsg[0];
      const msg = convMsg[1];
      let color;
      if (conv.isHighlighted) {
        color = "#ffb000";
      } else {
        switch(conv.state) {
          case 0: // New
            color = "#03A9F4";
            break;
          case 1: // in progress
            color = "#388E3C";
            break;
          case 2: // archived
            color = "#949494";
            break;
        }
      }
      return {
        fallback: `Message from ${msg.author.name.name}: <https://mod.reddit.com/mail/all/${msg.id}>`,
        author_name: msg.author.name.name, // what the fuck?
        author_link: `https://reddit.com/u/${msg.author.name.name}`,
        title: conv.subject,
        title_link: `https://mod.reddit.com/mail/all/${msg.id}`,
        text: msg.bodyMarkdown,
        ts: new Date(msg.date).valueOf() / 1000,
        color
      };
    });
    return request
      .post(context.secrets.SLACK_URL)
      .set('Content-Type', 'application/json')
      .send(payload);
  });
}

module.exports = function(context, cb) {
  context.storage.get((err, data) => {
    if (err) {
      cb(err);
    }
    const storage = data || { last: '2017-08-27T22:05:17.330Z' };
    const r = new snoowrap({
      userAgent: context.secrets.REDDIT_USER_AGENT,
      clientId: context.secrets.REDDIT_ID,
      clientSecret: context.secrets.REDDIT_SECRET,
      username: context.secrets.REDDIT_USERNAME,
      password: context.secrets.REDDIT_PASSWORD
    });
    
    const body = {
      entity: context.secrets.SUBREDDIT,
      limit: 25,
    };
    
    r.oauthRequest({
      uri: '/api/mod/conversations',
      method: 'get',
      qs: body
    }).then(response => {
      const last = new Date(storage.last);
      const ids = response.conversationIds.filter(x => new Date(response.conversations[x].lastUpdated) > last)
      const conversations = ids.map(id => response.conversations[id]);
      postConversations(context, r, conversations).then(
        () => {
          context.storage.set({
            last: new Date().toJSON()
          }, {force: 1}, err => {
            if (err) {
              cb(err);
            }
            cb(null, 'ok');
          })
        }
      ).catch(x => cb(x));
    }).catch(err => cb(err));
  });
};