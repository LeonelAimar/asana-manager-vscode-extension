import * as asana from 'asana';

export interface ITask extends asana.resources.Tasks.Type {
    permalink_url?:          string;
    followers:               asana.resources.Users.Type[];
    html_notes:              string;
}

export interface IQuickPickTask {
    label:          string;
    detail:         string;
    description:    string | undefined;
    gid:            string;
    custom:         asana.resources.CustomField[];
    task:           ITask;
}