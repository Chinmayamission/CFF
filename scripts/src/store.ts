import { Reducer, createStore, applyMiddleware } from 'redux';
import { reducers } from './store/index';
import thunkMiddleware from 'redux-thunk';
import { createMiddleware } from 'redux-beacon';
import GoogleAnalyticsGtag, {trackPageView} from '@redux-beacon/google-analytics-gtag';
import { connectRouter, routerMiddleware, LOCATION_CHANGE } from 'connected-react-router';
import history from "./history";

declare const GA_TRACKING_ID: string;

const ga = GoogleAnalyticsGtag(GA_TRACKING_ID);
const eventsMap = {
  [LOCATION_CHANGE]: trackPageView(action => ({

  })),
};
const gaMiddleware = createMiddleware(eventsMap, ga);

const store = createStore(
  connectRouter(history)(reducers),
  applyMiddleware(thunkMiddleware, routerMiddleware(history), gaMiddleware)
);
export default store;