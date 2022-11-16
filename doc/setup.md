# SETUP

[TALOS](./readme.md)  
[OVERVIEW](./overview.md)

## Discord

### Server

You probably want to create a Discord user for your project.  
Log in, then create a Discord server with Community features.  

**You can name roles and channels exactly as you wish**, as Talos only relies on their IDs.

#### Recommended Roles 

- *collector*: granted by Talos for verified collectors
- *redeemer*: for the people in charge of redeeming collectors' iterations
- *admin*: gives access the more advanced commands

(the *everyone* role exists by default)

#### Recommended Channels

- `welcome`: mandatory channel, for welcome messages and community guidelines
   - permissions: *everyone*  
   - doc: [Welcome channel](./discord/welcome-channel.md)
- `verify`: automated channel; for the one-time verification process
   - permissions: *everyone* 
   - doc: [Verify channel](./discord/verify-channel.md)
- `redeem`: automated channel; where *collectors* can request to redeem their Fxhash iteration(s)
   - permissions: *collector*, *redeemer*, *admin*   
   - doc: [Redeem channel](./discord/redeem-channel.md)
- `collectors`: community channel; where *redeemers* answer to *collectors* during redeeming sessions 
   - permissions: *collector*, *redeemer*, *admin*   
   - doc: [Collectors channel](./discord/collectors-channel.md)
- `help`: NON-automated channel; where the team can help out *collectors* having troubles with the automated processes
   - permissions: *everyone*    
   - doc: [Help channel](./discord/help-channel.md)
- `office`: backstage channel for *redeemers* and *admins*; only *admins* have access to the more advanced Talos commands 
   - permissions: *redeemer*, *admin*   
   - doc: [Office channel](./discord/office-channel.md)
- `log`: channel dedicated to Talos log messages
   - permissions: *redeemer*, *admin*  
   - doc: [Log channel](./discord/log-channel.md)

#### Dev Mode

You will need the channels and roles IDs for the bot config.  

Open the user settings menu: click on the cog icon next to your username.  
In the *Advanced* tab, enable *Developer mode*.

You can now right-click a role, channel or user name and copy the ID.

### Discord Application

1- Navigate to the [Discord developer dashboard](https://discord.com/developers/applications) and create a new Application.

2- On the left-hand sidebar click *Bot*, then the *Add Bot* button.

3- Click the *Reset Token* button and store the token somewhere **safe**.

> Bot tokens are highly sensitive. Make sure to never share your token or check it into any kind of version control.

4- Click on OAuth2 in the left sidebar, then URL generator.
Add the following scopes: `bot`, `applications.commands`.

5- Copy the generated URL, and paste it into your browser. 

>You’ll be guided through the installation flow. At the end of the process, the bot should have joined your server.


## Google Sheet

You probably want to set up a Google account dedicated to your project. 
Once done:

1- Create a Google service account  

> A service account is like a "robot" account Talos will use to communicate with Google spreadsheet.

- Go to the [Google Cloud Console](https://console.cloud.google.com/) while logged into your Google account.
- Create a new project and give it a name.  
- Click on *Enable APIs and Services*, search for the Google Sheet API and enable it.
- Click on *Credentials* > *Create Credentials* > *Service account key*.
- Give the service account a name and an ID, give it an **Editor** role, and validate.
- On the newly displayed page, you'll see the service account email address (xxxxx@xxxxxx.iam.gserviceaccount.com); click on it.
- Go to the *Keys* tab, then click *Add key* > *Create key*, select JSON then validate.
- As for the Discord bot token, store the generated .json file somewhere **safe**; you will need it later.

2- Duplicate this [Google Spreasheet](https://docs.google.com/spreadsheets/d/1XRK_5kFHC0JHBPwx-ARk2FKONZVkqzuxCHP69ywuKSU/copy)  
**DO NOT EDIT ANYTHING**.   
Do NOT edit tables names, columns names, or formulas, or the bot simply won't work.

3- Share your spreadsheet **with your Google service account email address**, and grant it an **Editor** role.

## Bot

### Install

1- Clone the repo locally  
`gh repo clone I-is-as-I-does/Talos`

2- Open a terminal and navigate to the `bot/` folder

3- Install dependencies  
`npm install`

### Config

Rename the `.env-sample` file to `.env` and **fill in all the required info**.  

```js
// Your Google service account credentials; 
// you'll find them in the .json file you donwloaded from the Google Cloud Console
GOOGLE_CLIENT_EMAIL=xxxxxx@xxxxxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY={"v":"-----BEGIN PRIVATE KEY-----xxxxxxx-----END PRIVATE KEY-----"}
GOOGLE_PROJECT_ID=xxxxxx

// ID of your copy of the Talos Google spreadsheet
// Look at its url; the ID part comes after the d/: https://docs.google.com/spreadsheets/d/xxxxxx/edit
SPREADSHEET_ID=xxxxxx

// The Tezos wallet address used to publish your Generative Token on Fxhash
FXHASH_PROJECT_WALLET=tzxxxxxx

// This will be the first part of the generated profile IDs; 
// It should probably be your project name, but do as you please
// a-zA-Z0-9.-_ characters
PROFILE_ID_PREFIX=xxxxxx

// Discord bot token obtained earlier through the Discord developer dashboard
BOT_TOKEN=xxxxxx

// Discord OAuth2 client ID;
// You can find on the Discord developer portal, OAuth2 > General tab
CLIENT_ID=0000000000000000000

// Discord Server ID
// In Discord, right click on your server icon > copy ID
GUILD_ID=0000000000000000000

// Discord Roles IDs
// In Discord, go to Server settings > Roles tab > right click on a role > copy ID
COLLECTOR_ROLE_ID=0000000000000000000
REDEEMER_ROLE_ID=0000000000000000000
ADMIN_ROLE_ID=0000000000000000000

// Discord Cchannels IDs
// In Discord, right click on a Channel name > copy ID
VERIFY_CHANNEL_ID=0000000000000000000
REDEEM_CHANNEL_ID=0000000000000000000
LOG_CHANNEL_ID=0000000000000000000
OFFICE_CHANNEL_ID=0000000000000000000
HELP_CHANNEL_ID=0000000000000000000
COLLECTORS_CHANNEL_ID=0000000000000000000

// Heroku app name
HEROKU_APP_NAME=

// Set to TRUE (capital letters) if you want Talos to auto ping itself in order to always stay awake 
// Beware, this will use dyno hours!
HEROKU_STAY_AWAKE=FALSE 

// Leave blank to let Heroku set the port
PORT=
```

### Dev

#### Edit / Add Slash Commands

Files: `bot/src/commands/`  
1 file = 1 command
Filename = command prompt in Discord

Look at the `doc/command-sample.js` file for some commented code.  
A lot of operations are abstracted; dive into `bot/src/operations/` and `bot/src/utils/`.

#### Update Slash Commands

Run `npm run add-cmd` to register commands.
You only need to run it once. You should run it again if you add or edit existing commands.

Run `npm run del-cmd` to delete all command.

#### Edit Profile IDs Word Lists

Tweak the word lists used to generate the profile IDs. 

Files:
 `bot/resources/words/` folder.

#### Edit Bot Messages

Edit the bot messages to your liking.  

Files:
- `bot/resources/messages.json`
- `bot/resources/descriptions.json`

#### Edit Bot / Project Web Page

Update the contents of the `public/` folder to your liking.

### Deploy

#### Locally

To run your bot locally: `npm run start`  

If you're still testing things out, remember to run `npm run add-cmd` after any edit to the commands;  
then to restart Talos: `npm run start`.

#### Heroku

1- Commit your own Talos bot to Github.  
2- Create an Heroku account if you don't have one already, and create a new app.  
3- In the *Deploy* tab, connect your app to your Github repo. Enable *Automatic Deploy*.  
4- In the *Settings* tab, click on *Reveal Config Vars*. Add all the key/values pairs from your `.env` file.  
5- Go back to the *Deploy* tab and trigger a manual deployment.

Anytime you'll commit changes to your repo, a new build will get triggered on the Heroku side.
