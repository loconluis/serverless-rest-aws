import type {
  Context,
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
  Handler,
} from 'aws-lambda';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

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

const createUsers: Handler = async (
  event: APIGatewayProxyEventV2,
  contex: Context
) => {
  const userID = randomUUID();
  const { body } = event;
  if (!body) {
    throw new Error('data is required to create a user');
  }
  let userBody = JSON.parse(body);
  userBody = {
    ...userBody,
    pk: userID,
  };

  const options = {
    TableName: 'usersTable',
    Item: userBody,
  };

  const command = new PutCommand(options);

  let res = await docClient.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({ user: options }),
  };
};

export = {
  createUsers,
};
