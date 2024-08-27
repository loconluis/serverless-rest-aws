import type {
  Context,
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
  Handler,
} from 'aws-lambda';
import aws from 'aws-sdk';

const dynamodb = new aws.DynamoDB.DocumentClient();

const getUsers: Handler = async (
  event: APIGatewayProxyEventV2,
  contex: Context
) => {
  const params = {
    ExpressionAttributeValues: { ':pk': '1' },
    KeyConditionExpression: 'pk = :pk',
    TableName: 'crud-serverless-users-table',
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
