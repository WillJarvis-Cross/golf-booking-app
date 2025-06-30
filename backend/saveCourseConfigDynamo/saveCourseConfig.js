const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient()
const dynamoDb = DynamoDBDocumentClient.from(client)

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event))

  try {
    const method = event?.requestContext?.http?.method
    if (!method) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Method is required' }),
      }
    }
    const body = JSON.parse(event.body)

    if (method === 'POST') {
      const item = body?.item
      const tableName = body?.tableName
      if (!item) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Item data is required for POST' }),
        }
      }
      if (!tableName) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Table name data is required for POST' }),
        }
      }

      const params = new PutCommand({
        TableName: tableName,
        Item: {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })

      await dynamoDb.send(params)

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Item saved successfully' }),
      }
    }

    else if (method === 'GET') {
      const { keyName, keyValue } = event.queryStringParameters || {}

      if (!keyName || !keyValue) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'keyName and keyValue are required for GET' }),
        }
      }

      const params = new GetCommand({
        TableName: tableName,
        Key: {
          [keyName]: keyValue,
        },
      })

      const result = await dynamoDb.send(params)

      if (!result.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Item not found' }),
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      }
    }

    else {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      }
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
    }
  }
}
