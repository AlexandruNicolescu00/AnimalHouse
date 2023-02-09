import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
// Nomae dello slice
const name = "user"
// Stato iniziale dell'utente
const initialState = {
    user: JSON.parse(localStorage.getItem('user') || "{}"),
    error: null
}
// Url base della API (http://localhost:8000/api/v1 || http://site212222.tw.cs.unibo.it/api/v1)
const baseUrl = process.env.REACT_APP_BASE_API_URL

// Thunk per il login di un utente
const login = createAsyncThunk(
    `${name}/login`,
    async ({ email, password }) => {
        const response = await fetch(`${baseUrl}/auth/login`, { 
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        return response.json();
    }
);

// Thunk per la registrazione di un utente
const signup = createAsyncThunk(
    `${name}/signup`,
    async (userInfo) => {
        const response = await fetch(`${baseUrl}/auth/register`, { 
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userInfo)
        })
        return response.json();
    }   
)

const userSlice = createSlice({ 
    name, 
    initialState, 
    reducers: {
        logout: (state) => {
            state.user = null;
            localStorage.removeItem('user');
        }
    }, 
    extraReducers: (builder) => {
        // Reducers dei thunks di login e registrazione
        builder.addCase(login.fulfilled, (state, action) => {
            localStorage.setItem('user', JSON.stringify(action.payload))
        })
        builder.addCase(login.rejected, (state, action) => {
        })
        builder.addCase(signup.fulfilled, (state, action) => {
            localStorage.setItem('user', JSON.stringify(action.payload))
        })
    }
})

export const { logout } = { ...userSlice.actions }
export { login, signup }
export const userReducer = userSlice.reducer