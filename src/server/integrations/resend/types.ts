export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
};

export type SendEmailSuccess = { ok: true; id: string };

export type SendEmailError = { ok: false; code: string; message: string };

export type SendEmailResult = SendEmailSuccess | SendEmailError;

export type EmailAdapter = (input: SendEmailInput) => Promise<SendEmailResult>;
