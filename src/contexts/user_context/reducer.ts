import {
  initialState,
  TasksActionKeys,
  TasksActionTypes,
  UserStateProps,
} from "./actionTypes";

export default function TasksReducer(
  state: UserStateProps = initialState,
  action: TasksActionTypes
): UserStateProps {
  const { loading, user, token, refToken, error, isPersonaVerified } = action;
  switch (action.type) {
    case TasksActionKeys.setLoading:
          return {
            ...state,
            loading: loading,
          };
    case TasksActionKeys.setUser:
      if (user) {
        console.log("reduser", user);
        return {
          ...state,
          user: { ...state.user, ...user, isLoggedIn: true },
          loading:loading
        };
      }
      return state;
    case TasksActionKeys.setUserLoggedIn:
      return {
        ...state,
        user: {
          ...state.user,
          jwtToken: token,
          refreshToken: refToken,
          isLoggedIn: true,
        },
        loading:loading
      };
    default:
      return state;
  }
}
