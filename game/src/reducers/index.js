import { theme } from './theme'
import { account } from './account'
import { combineReducers } from 'redux'

/* The combineReducer function allow us to have multiple reducer functions 
 which will be passed as a single "reducer" to the createStore function */
export const reducer = combineReducers({theme, account});