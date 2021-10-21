export interface MessagePayload {
    type:    string;
    value?:  any;
}

export interface IVsCodeApi {
    postMessage: ( payload: MessagePayload ) => void;
    getState:    () => void;
    setState:    ( newState: any ) => void;
}