// api/subscribe.js
// Place this file in your /api folder in your Vercel project
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, email, recaptcha_token } = req.body;

  // ⭐ DEBUG LOGS - OPTION 2
  console.log('📥 Received request:', { firstName, email });
  console.log('🔐 reCAPTCHA token received?', recaptcha_token ? 'YES' : 'NO');
  console.log('🔐 Token preview:', recaptcha_token ? recaptcha_token.substring(0, 30) + '...' : 'NONE');
  // ⭐ END DEBUG LOGS

  // Validate input
  if (!firstName || !email) {
    return res.status(400).json({ error: 'First name and email are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // ⭐ NEW: Verify reCAPTCHA token
  if (recaptcha_token) {
    try {
      const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
      
      if (!RECAPTCHA_SECRET_KEY) {
        console.error('⚠️ RECAPTCHA_SECRET_KEY not configured');
        // Continue without blocking - you can make this stricter later
      } else {
        console.log('🔍 Verifying reCAPTCHA...'); // ⭐ ADDED
        const verifyResponse = await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptcha_token}`,
          { method: 'POST' }
        );
        
        const verifyData = await verifyResponse.json();
        
        if (!verifyData.success || verifyData.score < 0.5) {
          console.log('❌ Bot detected:', verifyData); // ⭐ ADDED EMOJI
          return res.status(400).json({ error: 'Verification failed' });
        }
        
        console.log('✅ reCAPTCHA passed! Score:', verifyData.score); // ⭐ ADDED EMOJI
      }
    } catch (error) {
      console.error('⚠️ reCAPTCHA verification error:', error); // ⭐ ADDED EMOJI
      // Continue - don't block legitimate users if reCAPTCHA fails
    }
  } else {
    console.log('⚠️ No reCAPTCHA token provided in request'); // ⭐ ADDED
  }
  // ⭐ END OF NEW CODE

  try {
    // MailerLite API configuration
    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
    const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;
    
    if (!MAILERLITE_API_KEY) {
      console.error('MAILERLITE_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    if (!MAILERLITE_GROUP_ID) {
      console.error('MAILERLITE_GROUP_ID not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const apiUrl = `https://connect.mailerlite.com/api/subscribers`;
    const subscriberData = {
      email: email,
      fields: {
        name: firstName
      },
      groups: [MAILERLITE_GROUP_ID],
      status: 'active'
    };

    console.log('Sending to MailerLite:', { email, firstName, groupId: MAILERLITE_GROUP_ID });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(subscriberData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('MailerLite error:', responseData);
      
      if (response.status === 422 || responseData.message?.includes('already exists')) {
        const updateUrl = `https://connect.mailerlite.com/api/subscribers/${email}`;
        
        const updateResponse = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              name: firstName
            },
            groups: [MAILERLITE_GROUP_ID]
          })
        });

        if (updateResponse.ok) {
          console.log('Subscriber updated successfully');
          return res.status(200).json({ 
            success: true, 
            message: 'Subscription updated successfully' 
          });
        } else {
          const updateError = await updateResponse.json();
          console.error('Update error:', updateError);
          return res.status(500).json({ error: 'Failed to update subscription' });
        }
      }
      
      return res.status(response.status).json({ 
        error: responseData.message || 'Failed to subscribe' 
      });
    }

    console.log('MailerLite success:', responseData);
    return res.status(200).json({ 
      success: true, 
      message: 'Subscription successful',
      data: responseData 
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
