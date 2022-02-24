export interface ContractMethod<Result> {
  call(callback: (error: Error | null, result: Result) => void): void;
}
