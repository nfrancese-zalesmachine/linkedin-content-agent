import 'dotenv/config';
import express from 'express';
import { config } from './config.js';
import { generateContent } from './orchestrator.js';
import { validateWebhookPayload } from './skills/output-validator.js';
import { logger } from './lib/logger.js';
import { ZodError } from 'zod';

const app = express();
app.use(express.json({ limit: '1mb' }));

// ─── Auth middleware ──────────────────────────────────────────────────────────

function requireWebhookSecret(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  if (!config.webhookSecret) {
    next();
    return;
  }
  const provided = req.headers['x-webhook-secret'];
  if (provided !== config.webhookSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.post('/generate', requireWebhookSecret, async (req, res) => {
  const requestStart = Date.now();

  try {
    const payload = validateWebhookPayload(req.body);
    logger.info('POST /generate received', { ideas: payload.ideas.length, isLM: payload.isLeadMagnetWeek });

    const results = await generateContent(payload);

    res.json({
      success: true,
      results,
      durationMs: Date.now() - requestStart,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: 'Invalid payload',
        details: err.flatten(),
      });
      return;
    }

    logger.error('POST /generate failed', { error: (err as Error).message });
    res.status(500).json({
      error: (err as Error).message,
      durationMs: Date.now() - requestStart,
    });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(config.port, () => {
  logger.info(`linkedin-content-agent running on port ${config.port}`);
});

export default app;
