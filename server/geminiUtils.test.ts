import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeChatHistory,
  buildCookingSystemInstruction,
  parseGeminiApiError,
  buildModelConfig,
  shouldTryNextGeminiModel,
  selectCandidateModels,
} from './geminiUtils';

test('sanitizeChatHistory skips leading model welcome messages and error bubbles', () => {
  const turns = sanitizeChatHistory([
    { role: 'model', text: 'Γεια σου! Είμαι ο Βοηθός σου.' },
    { role: 'user', text: 'Πόση ώρα να περιμένω;' },
    { role: 'model', text: 'Περίμενε 9 λεπτά.', isError: true },
    { role: 'user', text: 'Και να ανακατέψω;' },
  ]);

  assert.equal(turns.length, 1);
  assert.equal(turns[0].role, 'user');
  assert.equal(turns[0].parts.length, 2);
  assert.equal(turns[0].parts[0].text, 'Πόση ώρα να περιμένω;');
  assert.equal(turns[0].parts[1].text, 'Και να ανακατέψω;');
});

test('sanitizeChatHistory preserves valid alternating multi-turn conversation', () => {
  const turns = sanitizeChatHistory([
    { role: 'model', text: 'Welcome' },
    { role: 'user', text: 'Ερώτηση 1' },
    { role: 'model', text: 'Απάντηση 1' },
    { role: 'user', text: 'Ερώτηση 2' },
  ]);

  assert.equal(turns.length, 3);
  assert.deepEqual(
    turns.map((t) => t.role),
    ['user', 'model', 'user']
  );
  assert.equal(turns[2].parts[0].text, 'Ερώτηση 2');
});

test('sanitizeChatHistory uses fallback user text when history has no valid user turns', () => {
  const turns = sanitizeChatHistory([{ role: 'model', text: 'Welcome' }], 'Τι κάνω τώρα;');
  assert.equal(turns.length, 1);
  assert.equal(turns[0].role, 'user');
  assert.equal(turns[0].parts[0].text, 'Τι κάνω τώρα;');
});

test('buildCookingSystemInstruction includes recipe and step details without adult references', () => {
  const prompt = buildCookingSystemInstruction({
    recipeTitle: 'Μακαρόνια με Σάλτσα Ντομάτας',
    stepNumber: 6,
    totalSteps: 9,
    stepTitle: 'Βράσιμο για 9 λεπτά',
    stepInstruction: 'Αφήνουμε τα μακαρόνια να βράσουν.',
  });

  assert.ok(prompt.includes('Μακαρόνια με Σάλτσα Ντομάτας'));
  assert.ok(prompt.includes('Βήμα 6 από 9'));
  assert.ok(prompt.includes('Βράσιμο για 9 λεπτά'));
});

test('buildCookingSystemInstruction uses general mode when no recipe is selected', () => {
  const prompt = buildCookingSystemInstruction({});

  assert.ok(prompt.includes('ΔΕΝ έχει ξεκινήσει ακόμα κάποια συγκεκριμένη συνταγή'));
  assert.ok(prompt.includes('Δροσερή Φρουτοσαλάτα'));
  assert.equal(prompt.includes('Βήμα 1 από'), false);
});

test('parseGeminiApiError classifies 429 quota error cleanly without leaking secrets', () => {
  const parsed = parseGeminiApiError({
    status: 429,
    message: 'Quota exceeded for gemini-3.8-flash key=AIzaSyDummySecretValue123456789012345',
  });

  assert.equal(parsed.httpStatus, 429);
  assert.equal(parsed.errorCode, 'GEMINI_QUOTA_EXCEEDED');
  assert.ok(parsed.userMessage.includes('όριο'));
  assert.ok(!parsed.diagnosticMessage.includes('AIzaSyDummySecretValue'));
  assert.ok(parsed.diagnosticMessage.includes('[REDACTED_KEY]'));
  assert.equal(shouldTryNextGeminiModel(parsed), true);
});

test('parseGeminiApiError classifies API key errors as 502 GEMINI_AUTH_ERROR and stops model fallback', () => {
  const parsed = parseGeminiApiError({
    status: 400,
    message: 'API_KEY_INVALID: API key not valid',
  });

  assert.equal(parsed.httpStatus, 502);
  assert.equal(parsed.errorCode, 'GEMINI_AUTH_ERROR');
  assert.equal(shouldTryNextGeminiModel(parsed), false);
});

test('buildModelConfig applies appropriate thinkingLevel per model', () => {
  const flash38 = buildModelConfig('gemini-3.8-flash', 'sys');
  assert.ok('thinkingConfig' in flash38);

  const lite = buildModelConfig('gemini-3.1-flash-lite', 'sys');
  assert.ok('thinkingConfig' in lite);

  const hydrogen = buildModelConfig('gemini-4-hydrogen', 'sys');
  assert.ok('thinkingConfig' in hydrogen);

  const generic = buildModelConfig('custom-model', 'sys');
  assert.equal('thinkingConfig' in generic, false);
});

test('selectCandidateModels deprioritizes models in active cooldown while keeping them as fallback', () => {
  const now = 10000;
  const cooldowns = new Map<string, number>([
    ['gemini-3.8-flash', now + 60000],
    ['gemini-3.1-flash-lite', now - 1000],
  ]);

  const ordered = selectCandidateModels(
    ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-hydrogen'],
    cooldowns,
    now
  );

  assert.deepEqual(ordered, ['gemini-3.1-flash-lite', 'gemini-4-hydrogen', 'gemini-3.8-flash']);
});
