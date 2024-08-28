import type {
  Context,
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
  Handler,
} from 'aws-lambda';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import local from '../config.local';

let dynamoDBClientParams: DynamoDBClientConfig = {};

if (process.env.IS_OFFLINE) {
  dynamoDBClientParams = {
    region: 'localhost',
    endpoint: 'http://0.0.0.0:8000',
    credentials: {
      accessKeyId: local.ACCESS_KEY_ID,
      secretAccessKey: local.SECRET_ACCESS_KEY,
    },
  };
}

const client = new DynamoDBClient(dynamoDBClientParams);
const docClient = DynamoDBDocumentClient.from(client);

const getUsers: Handler = async (
  event: APIGatewayProxyEventV2,
  contex: Context
) => {
  let userID = event.pathParameters?.id;

  const command = new QueryCommand({
    ExpressionAttributeValues: { ':pk': userID },
    KeyConditionExpression: 'pk = :pk',
    TableName: 'usersTable',
  });

  let res = await docClient.send(command);
  console.log('res', res.Items);

  return {
    statusCode: 200,
    body: JSON.stringify({
      user: res.Items ? res.Items[0] : {},
      count: res.Count,
    }),
  };
};

export = {
  getUsers,
};
