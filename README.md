# Modmail2Slack

Post all new Reddit modmail to a Slack channel.

## Installation

In the reference (/r/VolunteerLiveTeam) installation, Modmail2Slack is installed as a [webtask](https://webtask.io).

1. Go to [reddit settings](https://www.reddit.com/prefs/apps/) and create an app. Select type "Script". Make a note of the ID and secret. (ID is under "personal use script").
2. Create a reddit user, give it mail permissions on your subreddit, and add it as a user of your app.
3. Add an [incoming webhook](https://my.slack.com/apps/A0F7XDUAZ-incoming-webhooks) to your Slack team.
4. `$ cp setup.example.sh setup.sh`
5. Edit the values with !!EXCLAMATION MARKS!! around them.
6. Install the webtask CLI: `$ npm install -g wt-cli`
7. Log in to Webtask: `$ wt login`
8. Run the bot: `$ ./setup.sh`

And away you go!

## Updating

If we release an update, simply download the latest version of `vlt-modmail.js` and rerun the setup command.

## License

Modmail2Slack is developed by [Marks Polakovs](https://github.com/markspolakovs) for the [Volunteer Live Team](https://reddit.com/r/VolunteerLiveTeam), licensed under the MIT license. © 2017 Marks Polakovs
