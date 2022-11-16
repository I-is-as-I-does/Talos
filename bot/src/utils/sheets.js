const { google } = require('googleapis')
const { fixBoolean } = require('./general.js')


module.exports = class SheetsHandler {
  constructor(logger) {
    this.emptyRowsTolerance = 3
    this.logger = logger
    this.sheetClient = null
    this.googleSheets = null
    this.green = null

    this.auth = 
    new google.auth.GoogleAuth({
      credentials: { 
        client_email:process.env.GOOGLE_CLIENT_EMAIL,
        private_key: JSON.parse(process.env.GOOGLE_PRIVATE_KEY).v},
        projectId:process.env.GOOGLE_PROJECT_ID,
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    })

  }


  async getAuthorized(){

    if(!this.googleSheets){
    this.sheetClient = await this.auth.getClient()
    if(!this.sheetClient){
      this.logger.report('critical', 'Google Auth Fail', [])
     
    } else {
      this.green = true
      this.googleSheets = google.sheets({ version: 'v4', auth: this.sheetClient })
   
  }
    }
return this.green
}

  async updateRows(updateData){

    if(!this.green){
      return false
    }
    try {

    const response = await this.googleSheets.spreadsheets.values.batchUpdate({
      auth: this.auth,
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: {
        valueInputOption: "USER_ENTERED",
        data: updateData
      }
    });
    if(response.data){
      return true
    }
    this.logger.report('alert', 'Unable to update data', [{name:'updateData', value: updateData }])
    return false
  }catch (err) {
    this.logger.report('critical', 'Unexpected Google Error', [{name: 'error', value: err.message },{name: 'updateData', value: updateData }])
   return false
  }
  }



  async appendRows(range, rows){

    if(!this.green){
      return false
    }
    try {
    const response = await this.googleSheets.spreadsheets.values.append({
      auth: this.auth,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: range,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: 
          rows
        
      }
    });
    if(response.data){
      return true
    }
    this.logger.report('alert', 'Unable to append data', [{name: 'row', value: rows },{name: 'range', value: range }])
    return false
  }catch (err) {
    this.logger.report('critical', 'Unexpected Google Error', [{name: 'error', value: err.message },{name: 'row', value: rows },{name: 'range', value: range }])
   return false
  }

  }

  async getRows(range) {
    if(!this.green){
      return false
    }
    try {

    var rows = await this.googleSheets.spreadsheets.values.get({
      auth: this.auth,
      spreadsheetId:process.env.SPREADSHEET_ID,
      range: range,
    })
    if (rows.data.values.length > 0) {
      return rows.data.values
    }
    this.logger.report('warning', 'No data in requested range',[{name: 'range', value: range }])
    return false
  } catch(e){
    this.logger.report('warning', 'Unexpected Google error',[{name: 'error', value: e.message }])
    return false
  }
  }

  async parseCollc(range) {
    
    if(!this.green){
      return false
    }
    var data = await this.getRows(range)
    if (data === false) {
      return false
    }
    var list = {}
    var entries = []
    var index = []
    var emptyrows = 0
    if (data) {
      var keys = data.shift()
      for (var i = 0; i < data.length; i++) {
        var entry = this.mapEntry(keys, data[i])
        if (entry) {
          index.push(data[i][0])
          entries.push(entry)
        } else {
          emptyrows++
          if(emptyrows > this.emptyRowsTolerance){
            break
          }
        }
      }
    }
    return {
      list: list,
      entries: entries,
      index: index,
    }
  }

  shouldAddToList(list, entry, listkey) {
    return (
      listkey &&
      Object.prototype.hasOwnProperty.call(entry, listkey) &&
      !list[listkey].includes(entry[listkey])
    )
  }

  setList(stock, listkey) {
    stock.list[listkey] = []
    stock.entries.forEach((entry) => {
      if (this.shouldAddToList(stock.list, entry, listkey)) {
        stock.list[listkey].push(entry[listkey])
      }
    })
   
  }

  mapEntry(keys, row) {
    var entry = null
    if (row[0] && row[0].length) {
      entry = {}
      row.forEach((cellData, idx) => {
        cellData = fixBoolean(cellData)

        var key = keys[idx]
        entry[key] = cellData
      })
    }
    return entry
  }
}
