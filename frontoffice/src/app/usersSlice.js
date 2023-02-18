import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { baseApiUrl } from '../index'

// Nomae dello slice
const name = "user"
// Stato iniziale dell'utente
const initialState = {
    user: JSON.parse(localStorage.getItem('user') || "{}"),
    isLogged: localStorage.getItem('user') ? true : false,
    updatingUser: false,
    userSearched: {},
    loadUserByID: false
}

// Thunk per il login di un utente
const login = createAsyncThunk(
    `${name}/login`,
    async ({ email, password }) => {
        const response = await fetch(`${baseApiUrl}/auth/login`, { 
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        return await response.json();
    }
);

// Thunk per la registrazione di un utente
const signup = createAsyncThunk(
    `${name}/signup`,
    async (userInfo) => {
        const response = await fetch(`${baseApiUrl}/auth/register`, { 
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userInfo)
        })
        return await response.json();
    }   
)

// Thunk per aggiornare un utente
const updateUser = createAsyncThunk(
    `${name}/update`,
    async ({ userInfo, petInsert = false }, thunkAPI) => {
        const user = thunkAPI.getState().auth.user;
        const formData = new FormData()
        if (petInsert){
            formData.append("petName", userInfo.animaliPreferiti[0].name)
            formData.append("petBirthYear", userInfo.animaliPreferiti[0].birthYear)
            formData.append("petParticularSigns", userInfo.animaliPreferiti[0].particularSigns)
            if (userInfo.animaliPreferiti[0].imageName){
                formData.append("imgName", userInfo.animaliPreferiti[0].imageName[0])
            }
            formData.append("petImage", true)
        }
        const response = await fetch(`${baseApiUrl}/users/${ user.userInfo._id }`, { 
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
            body: formData
        })
        return await response.json();
    }   
)

const getUserByID = createAsyncThunk(
    `${name}/getUserByID`,
    async ({ id }) => {
        const response = await fetch(`${baseApiUrl}/users/${id}`)
        return await response.json()
    }
)

const userSlice = createSlice({ 
    name, 
    initialState, 
    reducers: {
        logout: (state) => {
            state.user = {};
            state.isLogged = false;
            localStorage.removeItem('user');
        },
        waitingUpdateUser: (state) => {
            state.updatingUser = true
        },
        waitingUserByID: (state) => {
            state.loadUserByID = true
        }

    }, 
    extraReducers: (builder) => {
        // Reducers dei thunks di login e registrazione
        builder.addCase(login.fulfilled, (state, action) => {
            localStorage.setItem('user', JSON.stringify(action.payload))
            state.user = action.payload
            if (!state.user.userInfo)
                state.isLogged = false
            else
                state.isLogged = true
        })
        builder.addCase(login.rejected, (state, action) => {
            state.user = {}
            state.isLogged = false
        })
        builder.addCase(signup.fulfilled, (state, action) => {
            localStorage.setItem('user', JSON.stringify(action.payload))
            state.user = action.payload
            state.isLogged = true
        })
        builder.addCase(signup.rejected, (state, action) => {
            state.user = {}
            state.isLogged = false
        })
        builder.addCase(getUserByID.fulfilled, (state, action) => {
            state.userSearched = action.payload
            state.loadUserByID = false
        })
        builder.addCase(updateUser.fulfilled, (state, action) => {
            state.user.userInfo = action.payload
            const oldUser = JSON.parse(localStorage.getItem('user'))
            localStorage.setItem('user', JSON.stringify({ token: oldUser.token , userInfo: action.payload }))
            state.updatingUser = false
        })
    }
})

export const { logout, loadAnimals, waitingUserByID } = { ...userSlice.actions }
export { login, signup, updateUser, getUserByID }

export const auth = userSlice.reducer