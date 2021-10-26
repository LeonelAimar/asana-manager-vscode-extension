import * as asana from 'asana';

export interface IQuickPickProject {
    label:           string;
    detail:          string;
    description?:    string;
}

export interface IProject extends asana.resources.Projects.Type {
    permalink_url?:         string;
}