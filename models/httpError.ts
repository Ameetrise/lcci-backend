class HttpError extends Error {
  code: number;
  constructor(message: string | undefined, errorCode: number) {
    super(message);
    this.code = errorCode;
  }
}

export default HttpError;
