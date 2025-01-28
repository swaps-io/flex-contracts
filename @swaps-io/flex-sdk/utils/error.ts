export class FlexError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FlexError';
  }
}
