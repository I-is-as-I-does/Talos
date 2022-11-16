/* bot/src/commands/say-hi.js */


// If you need to interact with the Google sheet:
// const SheetsHandler = require('../utils/sheets.js')

// Command helper
const getCommand = require('../operations/get-command.js')
// Some util
const { getUserName } = require('../utils/butler.js')
// The command and argument(s) descriptions (you would need to add them to the descriptions.json file)
const { dsc_sayHi, dsc_whatAreYou }= require('../../resources/descriptions.json')

// Options passed to the command helper:
const options = {
    name: 'say-hi',
    description: dsc_sayHi,
    hidden: false, //false: every one can see Talos<>user messages; true: only the user interacting with Talos can see the messages; 
    okChannelIds: [process.env.OFFICE_CHANNEL_ID], // Discord channels IDs where this command can be triggered;
    redirectToChannel: null, // 'redeem', 'collectors', 'help', 'verify', 'office' or 'log';
                             // if the command is triggered in a wrong channel, suggest one of those instead;
    okRoleIds: [process.env.ADMIN_ROLE_ID], // restrict the right to trigger this command to specified Discord roles;
    unauthorizedMsg: {key:'noHi', replace: {reason: 'yu no Mogul'}}, // override the default unauthorized message;
    // you would need to add something like this in the resources/messages.json file: 
    // "noHi": "I won't say hi, because {{reason}}."
    arguments: [{ name: "what",description: dsc_whatAreYou, type:"string", required:true}], // prompt the user to give specific info to Talos; 
    shHandler: null, // or SheetsHandler you required above
    teamCommand: true // is this a command a "backstage" one? This only affects how Talos answers in case something fails at some point;
  }

  // Command's logic once all verifications have been handled by the command helper
const next = async function (prc) {
/* Available:
prc.interaction // Discord interaction resources
prc.chan // channel resolver 
prc.txt // texts handler
prc.replier // replies handler
prc.arg // user's answers to prompts if any
prc.shHandler // initiated Google services, if shHandler was set in the options
*/
   const username = getUserName(prc.interaction, prc.interaction.user.id, 'you')
   return await prc.replier.end('sayHiAndMore', {username:username, what: prc.arg.what})
   // resources/messages.json file would need to contain:
   // "sayHiAndMore": "Hi {{username}}, you are {{what}}."
   
}

module.exports = getCommand(options, next)

/* Example interaction:

In the office channel, by an admin:
/say-hi awesome
Talos's answer:
Hi @SuperAdmin, you are awesome.

*/