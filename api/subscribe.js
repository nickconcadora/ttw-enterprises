export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { firstName, email } = req.body;

    // Validate input
    if (!email || !firstName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Call MailerLite API (API key stored securely in env variables)
        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                fields: {
                    name: firstName
                },
                groups: [process.env.MAILERLITE_GROUP_ID]
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ success: true, message: 'Subscribed successfully' });
        } else {
            return res.status(response.status).json({ error: data.message || 'Subscription failed' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}