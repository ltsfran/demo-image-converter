const fs = require('fs')
const path = require('path')
const axios = require('axios')
const waterfall = require('async/waterfall')
const sharp = require('sharp')

const service = {
  download: async function(url) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' })
      return response.data
    } catch (error) {
      console.log('Image download error: ', url, 'due to an error:', error.message)
    }
  },
  resize: async function(filename, imageBuffer, { width, height }) {
    try {
      const webpImage = sharp(imageBuffer).webp()
      const resizedImage = webpImage.resize(width, height, { fit: 'contain' })
      const resizedImageBuffer = await resizedImage.toFile(filename)
      return resizedImageBuffer
    } catch (error) {
      console.log('Unable to resize image due to an error:', error.message)
    }
  }
}

exports.handler = function (event, context, callback) {
  try {
    const originDirectory = 'origin'
    const outputDirectory = 'output'
    const data = JSON.parse(event.Records[0].Sns.Message)
    const sizesArray = JSON.parse(data.sizes)
    const file = data.filename
    const filename = path.parse(file).name
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
        const regex = /[.](jpg|jpeg|png|gif|JPG|JPEG|GIF|PNG|webp)/
        const filenameOrigin = file.replace(regex, '.jpg')
        console.log('Uploading image to origin directory:', filenameOrigin)
        if (!fs.existsSync(originDirectory)) {
          fs.mkdirSync(originDirectory)
        }
        fs.writeFileSync(`${originDirectory}/${filenameOrigin}`, imageBuffer)
        next(null, imageBuffer)
      },
      async function(imageBuffer) {
        console.log('Applying resize image...')
        if (!fs.existsSync(outputDirectory)) {
          fs.mkdirSync(outputDirectory)
        }
        return sizesArray.forEach(async (item, index) => {
          const width = parseInt(item.width)
          const height = parseInt(item.height)
          await service.resize(
            `${outputDirectory}/${filename}-${width}x${height}.webp`,
            imageBuffer,
            { width, height })
        })
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