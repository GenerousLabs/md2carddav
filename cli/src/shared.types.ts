export type ErrorResult = {
  success: false;
  error: string;
  code: string;
};

export type SuccessResult<Returns> = {
  success: true;
  result: Returns;
};

export type Returns<RT> = ErrorResult | SuccessResult<RT>;
