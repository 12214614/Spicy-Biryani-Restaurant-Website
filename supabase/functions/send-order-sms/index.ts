import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SMSRequest {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  totalAmount: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const smsData: SMSRequest = await req.json();
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Twilio credentials not configured');
      console.log('SMS would have been sent to:', smsData.customerPhone);
      console.log('Message:', `Dear ${smsData.customerName}, your order ${smsData.orderNumber} has been placed successfully at Spicy Biryani! Total: ₹${smsData.totalAmount}. Your delicious biryani will be delivered in 30-45 minutes. Thank you!`);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'SMS service not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in Supabase Edge Function secrets.',
          logged: true,
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

    const smsMessage = `Dear ${smsData.customerName}, your order ${smsData.orderNumber} has been placed successfully at Spicy Biryani! Total: ₹${smsData.totalAmount}. Your delicious biryani will be delivered in 30-45 minutes. Thank you!`;

    const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    const formData = new URLSearchParams();
    formData.append('To', smsData.customerPhone);
    formData.append('From', twilioPhoneNumber);
    formData.append('Body', smsMessage);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Twilio API error:', result);
      return new Response(
        JSON.stringify({
          success: false,
          error: result.message || 'Failed to send SMS',
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

    console.log('SMS sent successfully:', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SMS sent successfully',
        orderNumber: smsData.orderNumber,
        messageSid: result.sid,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing SMS request:', error);
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