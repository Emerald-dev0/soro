import type { FastifyInstance } from 'fastify';

/**
 * TTS proxy — the ElevenLabs key never leaves the server.
 * POST /api/tts/speak { text, speaker: "ayo" | "customer" }
 */
export function ttsRoutes(app: FastifyInstance): void {
  app.post('/api/tts/speak', async (req, reply) => {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) {
      return reply.status(503).send({ success: false, error: { code: 'TTS_UNCONFIGURED', message: 'ElevenLabs key not configured.' } });
    }
    const body = (req.body ?? {}) as { text?: string; speaker?: string };
    const text = (body.text ?? '').slice(0, 500);
    if (!text) return reply.status(400).send({ success: false, error: { code: 'INVALID_INPUT', message: 'text required.' } });
    const voiceId =
      body.speaker === 'customer'
        ? (process.env.CUSTOMER_VOICE_ID ?? 'TyAD2ntJFdDReoa55SLn')
        : (process.env.AYO_VOICE_ID ?? 'qRRCpZ9846Z3NiCRzdQ5');

    let upstream: Response;
    try {
      upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
      });
    } catch {
      return reply.status(502).send({ success: false, error: { code: 'TTS_UNAVAILABLE', message: 'Voice provider unreachable.' } });
    }
    if (!upstream.ok) {
      return reply.status(502).send({ success: false, error: { code: 'TTS_FAILED', message: `Voice provider error (${upstream.status}).` } });
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    reply.header('Content-Type', 'audio/mpeg').send(buf);
  });
}
