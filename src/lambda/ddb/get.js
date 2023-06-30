const AWS = require('aws-sdk');
AWS.config.update({
    region: "ap-northeast-2"
});
const { handleHttpRequest } = require('slsberry');
const apiSpec = {
    category: 'Test',
    event: [
        {
            type: 'REST',
            method: 'Get',
        },
    ],
    desc: 'DynamoDB의 값을 조회한다.',
    parameters: {
        hash_key: { req: true, type: 'string', desc: 'hash_key' },
    },
    errors: {
        unexpected_error: { status_code: 500, reason: '알 수 없는 에러' },
    },
    responses: {
        description: '',
        content: 'application/json',
        schema: {
            type: 'object',
            properties: {
                input1: { type: 'String', desc: 'input1' },
                input2: { type: 'String', desc: 'input2' },
            },
        },
    },
};
exports.apiSpec = apiSpec;
async function handler(inputObject, event) {
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: 'demo-lambda-test-ddb',
        KeyConditionExpression: '#HashKey = :hkey',
        ExpressionAttributeNames: { '#HashKey': 'hash_key' },
        ExpressionAttributeValues: {
            ':hkey': inputObject.hash_key
        }
    };
    try {
        const result = await docClient.query(params).promise();
        return {
            status: 200,
            response: JSON.stringify(result.Items)
        };
    }
    catch (e) {
        console.error(e);
        return { predefinedError: apiSpec.errors.unexpected_error };
    }
}
exports.handler = async (event, context) => {
    return await handleHttpRequest(event, context, apiSpec, handler);
};