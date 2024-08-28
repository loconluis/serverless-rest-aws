import type {
  Context,
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
  Handler,
} from 'aws-lambda';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  DeleteCommandInput,
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

const deleteUsers: Handler = async (
  event: APIGatewayProxyEventV2,
  contex: Context
) => {
  let userID = event.pathParameters?.id;

  const options: DeleteCommandInput = {
    TableName: 'usersTable',
    Key: { pk: userID },
  };

  const command = new DeleteCommand(options);

  let res = await docClient.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `User: ${userID} was deleted` }),
  };
};

export = {
  deleteUsers,
};
