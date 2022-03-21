import React, { createContext, ReactNode, useContext, useReducer } from "react";
import { initialState, TasksActionKeys, UserStateProps } from "./actionTypes";
import { loginUserApi, loginWithTokenApi, refreshTokenApi } from "./api";
import TasksReducer from "./reducer";

export interface UserDispatchProps {
  loginUser: (email: string, password: string) => void;
  loginWithToken: (token: string) => void;
}

export interface UserContextType {
  userState: UserStateProps;
  userActions: UserDispatchProps;
}

const UserContext = createContext<UserContextType>({
  userState: initialState,
  userActions: {
    loginUser: () => {},
    loginWithToken: () => {},
  },
});

interface UserContextProviderProps {
  children: ReactNode;
}
export const UserContextProvider = (props: UserContextProviderProps) => {
  const [userState, dispatch] = useReducer(TasksReducer, initialState);
  const { children } = props;

  // authenticate user
  const loginUser = (email: string, password: string): void => {
    dispatch({ type: TasksActionKeys.setLoading, loading: true });
    loginUserApi(email, password)
      .then((data) => {
        console.log("iser", data);
        dispatch({ type: TasksActionKeys.setUser, user: data, loading: false });
      })
      .catch((error) => {
        dispatch({
          type: TasksActionKeys.setError,
          error: JSON.stringify(error?.message),
        });
      });
  };

  const loginWithToken = (token: string, refToken: string): void => {
    dispatch({ type: TasksActionKeys.setLoading, loading: true });
    loginWithTokenApi(token)
      .then((data) => {
        console.log("iser", data);
        dispatch({
          type: TasksActionKeys.setUserLoggedIn,
          token,
          refToken,
          loading: false,
        });
      })
      .catch((error) => {
        refreshTokenApi()
          .then((data) => {
            dispatch({
              type: TasksActionKeys.setUserLoggedIn,
              token: data?.jwtToken,
              refToken: data?.refreshToken,
              loading: false,
            });
          })
          .catch((error) => {
            dispatch({ type: TasksActionKeys.setLoading, loading: false });
            dispatch({
              type: TasksActionKeys.setError,
              error: JSON.stringify(error?.message),
            });
          });
      });
  };

  const contextValue = {
    userState,
    userActions: {
      loginUser,
      loginWithToken,
    },
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const withUser = (Payload) => {
  const UserConsumer = (props) => {
    const context = useContext(UserContext);

    return <Payload {...props} {...context} />;
  };

  return UserConsumer;
};
