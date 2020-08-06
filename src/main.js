import {createTripSummaryTemplate} from './view/trip-summary.js';
import {createTripPathTemplate} from './view/trip-path.js';
import {createTripCostTemplate} from './view/trip-cost.js';
import {createTripTabsTemplate} from './view/trip-tabs.js';
import {createEventFilterTemplate} from './view/event-filter.js';
import {createEventSorterTemplate} from './view/event-sorter.js';
import {createEventEditorTemplate} from './view/event-editor.js';
import {createEventDayTemplate} from './view/event-day.js';
import {createEventPointTemplate} from './view/event-point.js';
import {generateEvent} from '../mocks/event.js';
import {generateDestinations} from '../mocks/destinations.js';
import {generateOffers} from '../mocks/offers.js';

const TRIP_EVENT_COUNT = 20;

const destinations = generateDestinations();
const tripOffers = generateOffers();
const tripEvents = new Array(TRIP_EVENT_COUNT).fill().map(() => generateEvent(destinations, tripOffers));

const render = (container, template, place) => {
  container.insertAdjacentHTML(place, template);
};

const siteHeaderElement = document.querySelector(`.page-header`);
const siteMainElement = document.querySelector(`.page-main`);

const tripMainElement = siteHeaderElement.querySelector(`.trip-main`);
render(tripMainElement, createTripSummaryTemplate(), `afterbegin`);

const tripInfoElement = tripMainElement.querySelector(`.trip-info`);
render(tripInfoElement, createTripPathTemplate(tripEvents), `beforeend`);
render(tripInfoElement, createTripCostTemplate(tripEvents), `beforeend`);

const tripMenuElement = siteHeaderElement.querySelector(`.trip-controls`);
render(tripMenuElement, createTripTabsTemplate(), `beforeend`);
render(tripMenuElement, createEventFilterTemplate(), `beforeend`);

const tripEventsElement = siteMainElement.querySelector(`.trip-events`);
render(tripEventsElement, createEventSorterTemplate(), `beforeend`);

render(tripEventsElement, createEventEditorTemplate(tripEvents[0], destinations, tripOffers), `beforeend`);

render(tripEventsElement, createEventDayTemplate(), `beforeend`);

const tripDayElement = tripEventsElement.querySelector(`.trip-events__list`);

for (let i = 1; i < TRIP_EVENT_COUNT; i++) {
  render(tripDayElement, createEventPointTemplate(tripEvents[i]), `beforeend`);
}
