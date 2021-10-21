import * as asana from 'asana';

export interface IQuickPickWorkspace {
    label:          string;
    detail:         string;
    workspace:      asana.resources.Workspaces.ShortType;
}