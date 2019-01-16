const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.list = async (event) => {

	const params = {
		TableName: process.env.DYNAMODB_TABLE,
	};

  	// fetch all from the database
	let results = await dynamoDb.scan(params).promise().catch(err => {
    console.log(err, err.stack)
    let response = {
      statusCode: 500,
      headers: { 
        "Content-Type" : "text/plain",
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
      },
      body: 'Couldn\'t fetch the speeches',
    }

    return response
  })

  let response = {
    statusCode: 200,
    headers: {
      "Content-Type" : "application/json",
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify(results.Items)
  }

  return response
};