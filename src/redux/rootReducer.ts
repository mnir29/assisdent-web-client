import { combineReducers } from '@reduxjs/toolkit';

type actionType = {
    type: string;
    payload: string;
};

const testReducer = (state = '', action: actionType) => {
    switch (action.type) {
        case 'RECEIVED_DATA':
            return action.payload;
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    test: testReducer,
});

export type RootState = '';

export default rootReducer;
