export interface IAsanaCredentials {
    access_token:  string;
    expires_in:    number;
    token_type:    string;
    refresh_token?: string;
    data:          Data;
}

export interface Data {
    id:    string;
    name:  string;
    email: string;
}

export interface ICredentialsParsed {
    credentials:    IAsanaCredentials;
    iat:            number;
    revokesOn:      number;
    threshold:      number;
}

export interface ICredentialsEncoded {
    credentials:    string;
    iat:            number;
    revokesOn:      number;
    threshold:      number;
    accessToken?:   string;
}