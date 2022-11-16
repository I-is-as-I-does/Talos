require('dotenv').config()
const { Client, Collection, GatewayIntentBits } = require('discord.js')
const BotLogger = require('./utils/logger.js')
const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const {stayAwake} = require('./utils/ping.js')

// web page
const app = express()
const port = process.env.PORT || 5000 // @doc process.env.PORT lets the port be set by Heroku

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// make express look in the `public` directory for the bot land page
app.use(express.static(path.join(__dirname, './../public')))
app.listen(port, () => {
  console.log('App running on port ' + port)
})

// ping
if(process.env.HEROKU_STAY_AWAKE){
  stayAwake()
}

// Create a new client instance
const client = new Client({
  // allowedMentions: { parse: ['users', 'roles'] },
  intents: [GatewayIntentBits.Guilds],
})

/* error handler */

client.logger = new BotLogger(client)

/* commands handler */
client.commands = new Collection()
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module

  client.commands.set(command.data.name, command)
}

/* events handler */
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file)
  const event = require(filePath)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

// Login to Discord

client.login(process.env.BOT_TOKEN).then(() => {
  console.log(` Successfully logged in as: ${client.user.username}#${client.user.discriminator} `)
})
