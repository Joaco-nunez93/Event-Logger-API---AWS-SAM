/**
* Versión: v2
*/

export const lambdaHandler = async (event, context) => {
  try {
    let log = {};
    log.LambdaFunction = context.functionName;
    log.LambdaVersion = context.functionVersion;

    console.log("Response:", JSON.stringify(log, null, 2));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    };
  } catch (error) {
    console.error("Error processing request:", error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};