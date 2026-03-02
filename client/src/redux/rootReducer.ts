import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
// slices
import appReducer from './slices/app';
// import audioCallReducer from './slices/audioCall';
// import videoCallReducer from './slices/videoCall';
import authReducer from './slices/auth';
import chat from './slices/chat';

// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  //   whitelist: [],
  //   blacklist: [],
};

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  chat: chat,
  // audioCall: audioCallReducer,
  // videoCall: videoCallReducer,
});

export { rootPersistConfig, rootReducer };
