var AWS = require('aws-sdk');  
AWS.config.region = 'us-east-1';

exports.publish = async (event) => { 
  var sns = new AWS.SNS();
  
  let Body = JSON.parse(event.body)
  if(!Body.Message || !Body.User){
    const response = {
      statusCode: 400,
      headers: {
        "Content-Type" : "application/json",
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify('Bad Request')
    }
    return response;
  }

  let result = await sns.publish({
    Message: JSON.stringify({
      Message: Body.Message,
      User: Body.User,
      Date: Date.now()
    }),
    TopicArn: process.env.SNS_ARN
  },).promise().catch(err => console.log(err, err.stack) )

  console.log(result)

  const response = {
    statusCode: result ? 200 : 500,
    headers: {
      "Content-Type" : "application/json",
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify(result ? 'success' : 'error')
  };
  return response
};