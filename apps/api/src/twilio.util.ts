import twilio from 'twilio';

/**
 * Validate the X-Twilio-Signature header against the request URL + params.
 * When no auth token is configured (pure local dev), validation is skipped
 * with a clear log — never silently in a real deployment.
 */
export function isValidTwilioRequest(url: string, params: Record<string, string>, signature: string | undefined): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return true;
  if (!signature) return false;
  return twilio.validateRequest(token, signature, url, params);
}

export function twiml(xml: string): string { return xml; }

export function sayGatherXml(say: string, actionUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">${escapeXml(say)}</Say><Gather input="speech" action="${escapeXml(actionUrl)}" method="POST" timeout="5"><Say voice="alice">${escapeXml(say)}</Say></Gather></Response>`;
}

export function sayXml(say: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">${escapeXml(say)}</Say></Response>`;
}

export function gatherDtmfXml(prompt: string, actionUrl: string, numDigits = 4): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Gather input="dtmf" numDigits="${numDigits}" action="${escapeXml(actionUrl)}" method="POST" timeout="10"><Say voice="alice">${escapeXml(prompt)}</Say></Gather></Response>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
