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

    const imobiliariaEmail =
      process.env.EMAIL_TO_IMOBILIARIA || "contato@godoyprime.com.br";

    const whatsappNumber = "5521997250515";
    const waUrl = `https://wa.me/${whatsappNumber}?text=Novo%20lead%20recebido`;

    // ---------------------------------------------------------
    // TEMPLATE PREMIUM DO CLIENTE
    // ---------------------------------------------------------
    const htmlCliente = `
<div style="width:100%; background:#ffffff; padding:40px 0; font-family:Arial, sans-serif;">
  <table align="center" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    
    <!-- HEADER -->
    <tr>
      <td style="padding:20px 0; border-bottom:1px solid #eee;">
        <table width="100%" style="border-collapse:collapse;">
          <tr>
            <td align="left">
              <img src="https://i.imgur.com/pZsHBrb.png" width="110" style="display:block;" />
            </td>
            <td align="right" style="font-size:20px; font-weight:600; color:#0C2340; letter-spacing:2px; text-transform:uppercase;">
              Godoy Prime Realty
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:35px 0;">
        
        <h2 style="margin:0 0 20px 0; color:#0C2340; font-size:24px; font-weight:700;">
          Olá, ${customerName}!
        </h2>

        <p style="font-size:16px; color:#333; line-height:1.6; margin:0 0 20px 0;">
          Recebemos seu agendamento para visita. Nossa equipe entrará em contato para confirmar 
          a data e horário.
        </p>

        <p style="font-size:16px; color:#333; line-height:1.6; margin:0 0 20px 0;">
          <strong style="color:#0C2340;">Imóvel de interesse:</strong> ${data.propertyIdentifier}<br/>
          <strong style="color:#0C2340;">Forma de pagamento:</strong> ${data.paymentMethod}
        </p>

        <p style="font-size:16px; color:#333; line-height:1.6;">
          Atenciosamente,
          <br/>
          <strong style="color:#0C2340;">Equipe Godoy Prime Realty</strong>
        </p>

      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding:20px 0; border-top:1px solid #eee; text-align:center;">
        <p style="font-size:12px; color:#999;">
          © 2025 Godoy Prime Realty — Todos os direitos reservados.
        </p>
      </td>
    </tr>

  </table>
</div>
`;

    // ---------------------------------------------------------
    // TEMPLATE PREMIUM IMOBILIÁRIA — COMPLETO
    // ---------------------------------------------------------
    const htmlImobiliaria = `
<div style="background:#ffffff;padding:40px 0;font-family:Arial,sans-serif;">
  <table width="600" align="center" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee;border-radius:12px;overflow:hidden;">

    <!-- HEADER -->
    <tr>
      <td style="padding:22px 28px;border-bottom:1px solid #eee;background:#ffffff;">
        <table width="100%">
          <tr>
            <td align="left">
              <img src="https://i.imgur.com/pZsHBrb.png" width="110" />
            </td>
            <td align="right" style="font-size:20px;font-weight:700;color:#0C2340;text-transform:uppercase;letter-spacing:1px;">
              Novo Lead
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- TITLE -->
    <tr>
      <td style="padding:30px 28px;background:#ffffff;">
        <h2 style="margin:0 0 15px 0;color:#0C2340;font-size:24px;font-weight:700;">Novo Agendamento de Visita</h2>
        <p style="margin:0;color:#444;font-size:15px;line-height:1.6;">
          Um novo cliente solicitou o agendamento de visita através da plataforma Godoy Prime Realty.
        </p>
      </td>
    </tr>

    <!-- CLIENT INFORMATION -->
    <tr>
      <td style="padding:0 28px 25px;">
        <h3 style="margin:25px 0 10px 0;color:#0C2340;font-size:17px;">👤 Informações do Cliente</h3>
        <table width="100%" cellpadding="10" cellspacing="0" style="font-size:14px;color:#333;">
          <tr style="background:#f7f7f7;">
            <td style="font-weight:600;width:180px;">Nome</td>
            <td>${customerName}</td>
          </tr>
          <tr>
            <td style="font-weight:600;">E-mail</td>
            <td>${customerEmail}</td>
          </tr>
          <tr style="background:#f7f7f7;">
            <td style="font-weight:600;">Telefone</td>
            <td>${data.phone}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- PROPERTY -->
    <tr>
      <td style="padding:0 28px 25px;">
        <h3 style="margin:25px 0 10px 0;color:#0C2340;font-size:17px;">🏡 Detalhes do Imóvel</h3>
        <table width="100%" cellpadding="10" cellspacing="0" style="font-size:14px;color:#333;">
          <tr style="background:#f7f7f7;">
            <td style="font-weight:600;width:180px;">Identificador</td>
            <td>${data.propertyIdentifier}</td>
          </tr>
          <tr>
            <td style="font-weight:600;">Tipo</td>
            <td>${data.propertyOfInterest}</td>
          </tr>
          <tr style="background:#f7f7f7;">
            <td style="font-weight:600;">Forma de Pagamento</td>
            <td>${data.paymentMethod}</td>
          </tr>
          <tr>
            <td style="font-weight:600;">Renda Familiar</td>
            <td>${data.familyMonthlyIncome}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- DATES -->
    <tr>
      <td style="padding:0 28px 25px;">
        <h3 style="margin:25px 0 10px 0;color:#0C2340;font-size:17px;">📅 Datas sugeridas pelo cliente</h3>
        <table width="100%" cellpadding="10" cellspacing="0" style="font-size:14px;color:#333;">
          <tr style="background:#f7f7f7;">
            <td style="font-weight:600;width:180px;">Primeira opção</td>
            <td>${data.visitDate1} às ${data.visitTime1}</td>
          </tr>
          <tr>
            <td style="font-weight:600;">Segunda opção</td>
            <td>${data.visitDate2} às ${data.visitTime2}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- LGPD -->
    <tr>
      <td style="padding:20px 28px;">
        <p style="font-size:14px;color:#555;margin:0;">✔️ O cliente aceitou os termos LGPD.</p>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:20px 28px;text-align:center;">
        <a href="${waUrl}"
           style="display:inline-block;margin:10px 0;padding:14px 24px;background:#0C2340;color:#ffffff;text-decoration:none;border-radius:6px;font-size:15px;">
          Abrir WhatsApp do Lead
        </a>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding:20px 0;border-top:1px solid #eee;text-align:center;">
        <p style="font-size:12px;color:#999;">
          © 2025 Godoy Prime Realty — Lead Interno
        </p>
      </td>
    </tr>

  </table>
</div>
`;

    // ---------------------------------------------------------
    // ENVIO — CLIENTE
    // ---------------------------------------------------------
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Godoy Prime Realty <no-reply@godoyprime.com.br>",
      to: customerEmail,
      subject: "Confirmação de Agendamento — Godoy Prime",
      html: htmlCliente,
    });

    // ---------------------------------------------------------
    // ENVIO — IMOBILIÁRIA
    // ---------------------------------------------------------
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Godoy Prime Realty <no-reply@godoyprime.com.br>",
      to: imobiliariaEmail,
      subject: "NOVO AGENDAMENTO DE VISITA",
      html: htmlImobiliaria,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Error sending emails" };
  }
};
