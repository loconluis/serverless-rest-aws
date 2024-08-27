import type {
  Context,
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
  Handler,
} from 'aws-lambda';
import aws from 'aws-sdk';
import local from './config.local';

const dynamodb = new aws.DynamoDB.DocumentClient({
  region: 'localhost',
  endpoint: 'http://0.0.0.0:8000',
  credentials: {
    accessKeyId: local.ACCESS_KEY_ID,
    secretAccessKey: local.SECRET_ACCESS_KEY,
  },
});

const getUsers: Handler = async (
  event: APIGatewayProxyEventV2,
  contex: Context
) => {
  const params = {
    ExpressionAttributeValues: { ':pk': '1' },
    KeyConditionExpression: 'pk = :pk',
    TableName: 'usersTable',
  };

  let res = await dynamodb.query(params).promise();
  console.log('res', res);

  return {
    statusCode: 200,
    body: JSON.stringify({ user: res }),
  };
};

export = {
  getUsers,
};
