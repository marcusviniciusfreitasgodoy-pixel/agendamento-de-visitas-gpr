// netlify/functions/sendEmail.ts
import { Handler } from "@netlify/functions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: "No data received" };
    }

    const data = JSON.parse(event.body);

    const customerEmail = data.email;
    const customerName = data.fullName;
    const imobiliariaEmail = "contato@godoyprime.com.br"; // altere se quiser

    // ----------------------------
    // 1) E-mail para o cliente
    // ----------------------------
    await resend.emails.send({
      from: "Godoy Prime Realty <no-reply@godoyprime.com.br>",
      to: customerEmail,
      subject: "Confirmação de Agendamento — Godoy Prime",
      html: `
        <h2>Olá, ${customerName}!</h2>
        <p>Recebemos seu agendamento para visita. Nossa equipe entrará em contato para confirmar a data e horário.</p>
        <p><strong>Imóvel de interesse:</strong> ${data.propertyIdentifier}</p>
        <p><strong>Forma de pagamento:</strong> ${data.paymentMethod}</p>
        <p><br/>Atenciosamente,<br/>Equipe Godoy Prime Realty</p>
      `
    });

    // ----------------------------
    // 2) E-mail para a imobiliária
    // ----------------------------
    await resend.emails.send({
      from: "Godoy Prime Realty <no-reply@godoyprime.com.br>",
      to: imobiliariaEmail,
      subject: "NOVO AGENDAMENTO DE VISITA",
      html: `
        <h2>Novo Lead Recebido</h2>

        <p><strong>Nome:</strong> ${customerName}</p>
        <p><strong>E-mail:</strong> ${customerEmail}</p>
        <p><strong>Telefone:</strong> ${data.phone}</p>

        <hr/>

        <p><strong>Imóvel:</strong> ${data.propertyIdentifier}</p>
        <p><strong>Interesse:</strong> ${data.propertyOfInterest}</p>
        <p><strong>Forma de Pagamento:</strong> ${data.paymentMethod}</p>
        <p><strong>Renda Familiar:</strong> ${data.familyMonthlyIncome}</p>

        <hr/>
        <p><strong>Data 1:</strong> ${data.visitDate1} às ${data.visitTime1}</p>
        <p><strong>Data 2:</strong> ${data.visitDate2} às ${data.visitTime2}</p>

        <hr/>
        <p>Lead gerado automaticamente pelo sistema de Agendamento de Visitas GPR.</p>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Error sending emails"
    };
  }
};
