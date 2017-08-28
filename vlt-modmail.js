const snoowrap = require("snoowrap@1.14.2");
const bases = require("bases@0.2.1");

module.exports = function(context, cb) {
  context.storage.get((err, data) => {
    if (err) {
      cb(err);
    }
    const storage = data | { last: '1rxn9' };
    const r = new snoowrap({
      userAgent: context.secrets.REDDIT_USER_AGENT,
      clientId: context.secrets.REDDIT_ID,
      clientSecret: context.secrets.REDDIT_SECRET,
      username: context.secrets.REDDIT_USERNAME,
      password: context.secrets.REDDIT_PASSWORD
    });
    
    const body = {
      entity: 'VolunteerLiveTeam',
      limit: 25,
    };
    
    r.oauthRequest({
      uri: '/api/mod/conversations',
      method: 'get',
      qs: body
    }).then(response => {
      console.log(storage);
      const lastBase = bases.fromBase36(storage.last);
      console.log(response.conversationIds[0]);
      const ids = response.conversationIds.filter(x => bases.fromBase36(x) > lastBase)
      const conversations = ids.map(id => response.conversations[id]);
      cb(null, conversations);
    }).catch(err => cb(err));
  });
};