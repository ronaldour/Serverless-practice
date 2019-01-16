// Load the SDK
const AWS = require('aws-sdk')
const uuidv1 = require('uuid/v1')
const s3 = new AWS.S3();
const polly = new AWS.Polly({
  region: 'us-east-1'
})
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.convert = async (event) => {

  let message = JSON.parse(event.Records[0].Sns.Message)

  console.log(message)

  let params = {
    Text: message.Message,
    OutputFormat: 'mp3',
    VoiceId: 'Miguel'
  }

  let audio = await polly.synthesizeSpeech(params).promise().catch(err => { console.log(err, err.stack); return; })

  let id = uuidv1()
  let bucket = process.env.POLLY_BUCKET
  let key = id + ".mp3"

  params = {
    Body: audio.AudioStream,
    Bucket: bucket,
    Key: key,
    ContentType: 'audio/mpeg',
    ACL: 'public-read'
  }

  await s3.putObject(params).promise().catch(err => { console.log(err, err.stack); return; })

  params = {
    TableName: process.env.DYNAMODB_TABLE,
		Item: {
			id: message.User + '-' + id,
			name: message.User,
      file: id + '.mp3',
			url: `https://${bucket}.s3.amazonaws.com/${encodeURIComponent(key)}`
		}
  }

  await dynamoDb.put(params).promise().catch(err => { console.log(err, err.stack); return; })

  console.log("finished")
}