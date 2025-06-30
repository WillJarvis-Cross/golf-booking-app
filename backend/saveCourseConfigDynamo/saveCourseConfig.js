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

    if (method === 'POST') {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Body is required for POST' }),
        }
      }
      const body = JSON.parse(event.body)
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
      const tableName = event.rawPath.split('/')[1]
      const query = event.queryStringParameters || {}

      const queryKeys = Object.keys(query)

      // 🔸 Case 1: No query parameters — scan entire table
      if (queryKeys.length === 0) {
        const scanParams = new ScanCommand({ TableName: tableName })
        const result = await dynamoDb.send(scanParams)

        return {
          statusCode: 200,
          body: JSON.stringify(result.Items || []),
        }
      }

      // 🔸 Case 2: One query param — treat it as PK
      if (queryKeys.length === 1) {
        const keyName = queryKeys[0]
        const keyValue = query[keyName]

        const getParams = new GetCommand({
          TableName: tableName,
          Key: { [keyName]: keyValue },
        })

        const result = await dynamoDb.send(getParams)

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

      // 🔸 Case 3: PK + additional attributes — return partial item
      if (queryKeys.length === 2) {
        const pkName = queryKeys[0]
        const pkValue = query[pkName]

        const fieldName = queryKeys[1]
        const fieldValue = query[fieldName]

        const getParams = new GetCommand({
          TableName: tableName,
          Key: { [pkName]: pkValue },
        })

        const result = await dynamoDb.send(getParams)

        if (!result.Item) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Item not found' }),
          }
        }
        const partialItem = {}
        const fieldsToReturn = fieldValue.split(',')
        fieldsToReturn.forEach(attr => {
          if (result.Item[attr] !== undefined) {
            partialItem[attr] = result.Item[attr]
          }
        });

        return {
          statusCode: 200,
          body: JSON.stringify(partialItem),
        }
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
