import type {
  Context,
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
  Handler,
} from 'aws-lambda';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
  UpdateCommand,
  DynamoDBDocumentClient,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';

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

const updateUsers: Handler = async (
  event: APIGatewayProxyEventV2,
  contex: Context
) => {
  let userID = event.pathParameters?.id;
  const { body } = event;

  if (!body) {
    throw new Error('data is required to create a user');
  }

  let userBody = JSON.parse(body);

  const options: UpdateCommandInput = {
    TableName: 'usersTable',
    Key: { pk: userID },
    ExpressionAttributeNames: { '#name': 'name', '#phone': 'phone' }, // Alias to the keys of the schema
    ExpressionAttributeValues: {
      // New values to the referer keys
      ':name': userBody.name,
      ':phone': userBody.phone,
    },
    UpdateExpression: 'SET #name = :name, #phone = :phone',
    ReturnValues: 'ALL_NEW',
  };

  const command = new UpdateCommand(options);

  let res = await docClient.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({ user: res.Attributes }),
  };
};

export = {
  updateUsers,
};
