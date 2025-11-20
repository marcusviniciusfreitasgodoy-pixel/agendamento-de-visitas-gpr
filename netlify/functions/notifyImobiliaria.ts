import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: "No data received" };
    }

    const data = JSON.parse(event.body);

    const message = `
🔔 *Novo Agendamento de Visita - Godoy Prime Realty*

📌 *Nome:* ${data.fullName}
📌 *E-mail:* ${data.email}
📌 *Telefone:* ${data.phone}

🏡 *Imóvel de Interesse:* ${data.propertyIdentifier}
🏷️ *Tipo:* ${data.propertyOfInterest}
💰 *Forma de pagamento:* ${data.paymentMethod}

📆 *Datas sugeridas pelo cliente:*
- ${data.visitDate1} às ${data.visitTime1}
- ${data.visitDate2} às ${data.visitTime2}

📝 O cliente aceitou os termos LGPD.
    `.trim();

    const encoded = encodeURIComponent(message);

    // Número confirmado por você
    const phone = "5521997250515";

    const waUrl = `https://wa.me/${phone}?text=${encoded}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ whatsappUrl: waUrl }),
      headers: { "Content-Type": "application/json" }
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server error" };
  }
};
