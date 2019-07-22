import { User } from '../types';

export const ADD_USER = 'ADD_USER' // action types

export function addUser(user: User) {
    return {
        type: ADD_USER,
        user     // action payload
    }
}