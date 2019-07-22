export interface User {
    firstName: string;
    lastName: string;
}

export interface Action {
    type: string;
    user: Object;
}