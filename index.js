const lambda = require('lambda-local')
const path = require('path')

const jsonPayload = {
  "url": "https://www.karvi.com.ar/blog/wp-content/uploads/2020/10/208II3-850x567.jpg",
  "directory": "/used_cars",
  "filename": "demo.webp",
  "saveOrigin": 1,
  "sizes": "[{\"width\":\"196\",\"height\":\"165\"},{\"width\":\"360\",\"height\":\"240\"},{\"width\":\"540\",\"height\":\"360\"},{\"width\":\"960\",\"height\":\"584\"}]",
  "watermark": 0,
  "subDirectory": "5",
  "resourceKey": "resizer",
  "background": "black",
  "quality": 0,
  "responsePoint": "scheduled-tasks",
  "ipHost": "UNKNOWN"
}

const records = {
  "Records": [
    {
      "Sns": {
        "Message": JSON.stringify(jsonPayload)
      }
    }
  ]
}

lambda.execute({
  event: records,
  lambdaPath: path.join(__dirname, 'lambda.js'),
  profileName: 'default',
  timeoutMs: 3000
}).then(function(done) {
  console.log(done)
}).catch(function(err) {
  console.log(err)
})