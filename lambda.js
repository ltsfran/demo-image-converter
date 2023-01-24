const axios = require('axios')
const waterfall = require('async/waterfall')

const service = {
  download: async function(url) {
    try {
      const response = await axios.get(url, { responseType: 'arrayBuffer' })
      const buffer = Buffer.from(response.data, 'base64')
      return buffer
    } catch (error) {
      console.log('Image download error: ', urlImage, 'due to an error:', error.message)
    }
  }
}

exports.handler = function (event, context, callback) {
  try {
    const data = JSON.parse(event.Records[0].Sns.Message)
    let urlImage = data.url
    const characterQueryParamPosition = urlImage.indexOf('?')
    if (characterQueryParamPosition > 0) {
      urlImage = urlImage.substring(0, characterQueryParamPosition)
    }
    console.log('Reading options from event...')
    waterfall([
      async function () {
        console.log('Initializing image download process:', urlImage)
        const imageBuffer = await service.download(urlImage)
        return imageBuffer
      },
      function (imageBuffer, next) {
        console.log('Next image process:', imageBuffer)
        next(null)
      }
    ], function(error) {
      if (error) {
        console.log('Unable to resize:', urlImage, 'due to an error:', error.message)
      } else {
        console.log('Successfully resized:', urlImage)
      }

      callback(null, 'Finished')
    })
  } catch (error) {
    console.log('Unable to resize:', urlImage, 'due to an error:', error.message)
  }
}