import type { FastifyInstance } from 'fastify';
import { EventEmitter } from 'node:events';

/**
 * Live event stream (SSE) for the future dashboard.
 * The process-local bus forwards every persisted SoroEvent to open streams.
 */
export const eventBus = new EventEmitter();
eventBus.setMaxListeners(200);

export function broadcastEvent(event: unknown): void {
  eventBus.emit('event', event);
}

export function sseRoutes(app: FastifyInstance): void {
  app.get('/api/events/stream', async (req, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    reply.raw.write(': connected\n\n');
    const onEvent = (event: unknown) => {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
    };
    eventBus.on('event', onEvent);
    req.raw.on('close', () => eventBus.off('event', onEvent));
    return reply;
  });
}
