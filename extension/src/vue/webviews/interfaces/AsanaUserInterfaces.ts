export interface IAsanaUser {
    gid:           string;
    resource_type: string;
    name:          string;
    email:         string;
    photo:         Photo;
    workspaces:    Workspace[];
}

export interface Photo {
    image_1024x1024: string;
    image_128x128:   string;
    image_21x21:     string;
    image_27x27:     string;
    image_36x36:     string;
    image_60x60:     string;
}

export interface Workspace {
    gid:           string;
    resource_type: string;
    name:          string;
}
