const puppeteer = require('puppeteer')
const fetch = require('node-fetch')
const FormData = require('form-data')
const config = require('./config')

// https://gist.github.com/hurjas/2660489
function timeStamp () {
  // Create a date object with the current time
    var now = new Date()
  
  // Create an array with the current month, day and time
    var date = [now.getDate() , now.getMonth() + 1, now.getFullYear() ]
  
  // Create an array with the current hour, minute and second
    var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ]
  
  // Determine AM or PM suffix based on the hour
    var suffix = ( time[0] < 12 ) ? 'AM' : 'PM'
  
  // Convert hour from military time
    time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12
  
  // If hour is 0, set it to 12
    time[0] = time[0] || 12
  
  // If seconds and minutes are less than 10, add a zero
    for ( var i = 1; i < 3; i++ ) {
      if ( time[i] < 10 ) {
        time[i] = '0' + time[i]
      }
    }
  
  // Return the formatted string
    return date.join('/') + ' ' + time.join(':') + ' ' + suffix
  }

async function init () {
  const browser = await puppeteer.launch({args: ['--no-sandbox']})

  const checkStock = async () => {
    const tab = await browser.newPage()

    const checkProduct = async (productUrl, productName) => {
      await tab.goto(productUrl)
      const isInStock = await tab.evaluate(() => {
        return document.querySelector('.btn.buy').innerText !== 'Avísame]'
      })
      if (isInStock) {
        const formData = new FormData()
        formData.append('app_key', config.app_key)
        formData.append('app_secret', config.app_secret)
        formData.append('target_type', 'app')
        formData.append('content', `Hay stock de ${productName}`)
        formData.append('content_type', 'url')
        formData.append('content_extra', productUrl)
        
        await fetch('https://api.pushed.co/1/push', {
          method: 'POST',
          body: formData
        })
        console.log(`[${timeStamp()}] SÍ hay stock de ${productName}`)
      } else {
        console.log(`[${timeStamp()}] No hay stock de ${productName}`)
      }
    }

    await checkProduct('https://www.pccomponentes.com/gigabyte-geforce-rtx-3070-eagle-oc-8gb-gddr6', 'Gigabyte GeForce RTX 3070 EAGLE OC 8GB GDDR6')
    await checkProduct('https://www.pccomponentes.com/msi-geforce-rtx-3070-gaming-x-trio-8gb-gddr6', 'MSI GeForce RTX 3070 GAMING X TRIO 8GB GDDR6')

    await tab.close()
  }
  setInterval(checkStock, 60 * 1000)
  checkStock()
}

init()
