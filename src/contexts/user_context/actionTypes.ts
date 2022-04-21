import { User } from '../../utils/models';

/** **  State and Dispatch Props  *** */
export interface UserStateProps {
    error?: string;
    user: User;
    loading: boolean
}

export const DEFAULT_USER: User = {
    firstName: '',
    lastName: '',
    name: '',
};

/** **  Initial State  *** */
export const initialState: UserStateProps = {
    user: DEFAULT_USER,
    error: undefined,
    loading: false
   
};

/** **  Action Keys  *** */
export enum TasksActionKeys {
    setUser = 'setUser',
    setUserLoggedIn = 'setUserLoggedIn',
    setLoading = 'setLoading',
    setError = 'setError'
}

/** **  Action Types  *** */
export interface TasksActionTypes {
    type: TasksActionKeys;
    user?: User;
    error?: string;
}
