/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */const AWS = require("aws-sdk");
const { v4: uuid } = require("uuid");
const ddb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const orderId = uuid();
    const now = new Date().toISOString();

    // Determina userId (si viene token)
    let userId = "GUEST";
    if (event.headers.Authorization) {
      const token = event.headers.Authorization.split(" ")[1];
      const decoded = AWS.util.jwt.decode(token);
      userId = decoded.payload.sub;
    }

    // Guarda en DynamoDB
    await ddb.put({
      TableName: process.env.ORDERS_TABLE_NAME,
      Item: {
        orderId,
        userId,
        date: now,
        total: body.total,
        status: "PENDING",
        items: body.items,
        billing: body.billing,
      },
    }).promise();

    // Envía email con SES
    await ses.sendEmail({
      Source: process.env.SES_FROM,
      Destination: { ToAddresses: [body.billing.email] },
      Message: {
        Subject: { Data: `Confirmación de pedido ${orderId}` },
        Body: {
          Html: {
            Data: `
              <p>Hola ${body.billing.firstName},</p>
              <p>Hemos recibido tu pedido <strong>${orderId}</strong>, total €${body.total.toFixed(2)}.</p>
              <p>¡Gracias por comprar en Nopayo!</p>
            `,
          },
        },
      },
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ orderId, message: "Pedido creado y correo enviado." }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
