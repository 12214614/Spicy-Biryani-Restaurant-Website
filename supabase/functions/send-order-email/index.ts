import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const emailData: EmailRequest = await req.json();
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email service not configured. Please set RESEND_API_KEY in Supabase Edge Function secrets.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const itemsList = emailData.items
      .map(item => `<li>${item.name} x ${item.quantity} = ₹${item.price * item.quantity}</li>`)
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
    .order-details { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .items { list-style: none; padding: 0; }
    .items li { padding: 10px; border-bottom: 1px solid #fee2e2; }
    .total { font-size: 24px; color: #dc2626; font-weight: bold; text-align: right; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 Spicy Biryani</h1>
      <p>Order Confirmation</p>
    </div>
    <div class="content">
      <h2>Dear ${emailData.customerName},</h2>
      <p>Thank you for your order! Your delicious biryani is being prepared with love.</p>
      
      <div class="order-details">
        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${emailData.orderNumber}</p>
        <p><strong>Payment Method:</strong> ${emailData.paymentMethod.toUpperCase()}</p>
        <p><strong>Delivery Address:</strong> ${emailData.deliveryAddress}</p>
        
        <h4>Items Ordered:</h4>
        <ul class="items">
          ${itemsList}
        </ul>
        
        <div class="total">Total: ₹${emailData.totalAmount}</div>
      </div>
      
      <p><strong>Estimated Delivery Time:</strong> 30-45 minutes</p>
      <p>You will receive updates as your order progresses.</p>
      
      <p>Thank you for choosing Spicy Biryani!</p>
      <p>Best regards,<br>Spicy Biryani Team</p>
    </div>
    <div class="footer">
      <p>Need help? Contact us at +91 9390492316</p>
    </div>
  </div>
</body>
</html>
    `;

    const emailPayload = {
      from: 'Spicy Biryani <orders@spicybiryanihousegrb.shop>',
      to: [emailData.customerEmail],
      subject: `Order Confirmation - ${emailData.orderNumber}`,
      html: htmlContent,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return new Response(
        JSON.stringify({
          success: false,
          error: result.message || 'Failed to send email',
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        orderNumber: emailData.orderNumber,
        emailId: result.id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing email request:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});