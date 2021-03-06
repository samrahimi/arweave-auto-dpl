import { AxiosResponse } from "axios";
export declare const enum ArweaveErrorType {
    TX_PENDING = "TX_PENDING",
    TX_NOT_FOUND = "TX_NOT_FOUND",
    TX_FAILED = "TX_FAILED",
    TX_INVALID = "TX_INVALID"
}
export default class ArweaveError extends Error {
    readonly type: ArweaveErrorType;
    readonly response?: AxiosResponse;
    constructor(type: ArweaveErrorType, optional?: {
        message?: string;
        response?: AxiosResponse;
    });
    getType(): ArweaveErrorType;
}
