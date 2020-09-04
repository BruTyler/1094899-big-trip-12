import PointPresenter from './point.js';
import PointNewPresenter from './point-new.js';
import EventSorterView from '../view/event-sorter.js';
import EventDayView from '../view/event-day.js';
import NoPointsView from '../view/no-points.js';
import {getSorterRule, groupEvents, convertToNullableDate, getFilterRule} from '../utils/trip.js';
import {RenderPosition, DefaultValues, UpdateType, UserAction, FilterType, ModelType} from '../const.js';
import {render, remove} from '../utils/render.js';

export default class Trip {
  constructor(tripEventsContainer, modelStore) {
    this._tripEventsContainer = tripEventsContainer;
    this._pointsModel = modelStore.get(ModelType.POINTS);
    this._tripOffers = modelStore.get(ModelType.OFFERS).getItems();
    this._destinations = modelStore.get(ModelType.DESTINATIONS).getItems();
    this._filterModel = modelStore.get(ModelType.FILTER);
    this._pointNewModel = modelStore.get(ModelType.POINT_NEW);

    this._currenSortType = DefaultValues.SORT_TYPE;
    this._dayStorage = Object.create(null);
    this._pointStorage = Object.create(null);

    this._eventSorterComponent = null;
    this._noPointsComponent = null;

    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._createPoint = this._createPoint.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);

    this._pointsModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
    this._pointNewModel.addObserver(this._createPoint);

    this._pointNewPresenter = new PointNewPresenter(this._tripEventsContainer, modelStore, this._handleViewAction);
  }

  init() {
    this._renderTripBoard();
  }

  _createPoint(_event, payload) {
    if (payload === null) {
      return;
    }

    this._currentSortType = DefaultValues.SORT_TYPE;
    this._filterModel.setItem(UpdateType.MAJOR, DefaultValues.FILTER_TYPE);
    this._pointNewPresenter.init(this._destinations, this._tripOffers);
  }

  _getPoints() {
    const filterType = this._filterModel.getItem();

    return this._pointsModel.getItems()
      .filter(getFilterRule(filterType))
      .sort(getSorterRule(this._currenSortType));
  }

  _handleModeChange() {
    this._pointNewPresenter.destroy();
    Object
      .values(this._pointStorage)
      .forEach((presenter) => presenter.resetView());
  }

  _handleViewAction(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this._pointsModel.updateItem(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this._pointsModel.addItem(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this._pointsModel.deleteItem(updateType, update);
        break;
    }
  }

  _handleModelEvent(updateType, payload) {
    switch (updateType) {
      case UpdateType.PATCH:
        break;
      case UpdateType.MINOR:
        this._clearChainPoints();
        this._renderChainPoints(this._getPoints());
        break;
      case UpdateType.MAJOR:
        const resetSortType = Object.values(FilterType).includes(payload);
        this._clearTripBoard({resetSortType});
        this._renderTripBoard();
        break;
    }
  }

  _handleSortTypeChange(sortType) {
    if (this._currenSortType === sortType) {
      return;
    }

    this._clearChainPoints();
    this._currenSortType = sortType;
    this._renderChainPoints(this._getPoints());
  }

  _renderSort() {
    if (this._sortComponent !== null) {
      this._sortComponent = null;
    }

    this._eventSorterComponent = new EventSorterView(this._currenSortType);
    this._eventSorterComponent.setSortTypeChangeHandler(this._handleSortTypeChange);
    render(this._tripEventsContainer, this._eventSorterComponent, RenderPosition.BEFORE_END);
  }

  _renderNoPoints() {
    if (this._noPointsComponent !== null) {
      this._noPointsComponent = null;
    }

    this._noPointsComponent = new NoPointsView();
    render(this._tripEventsContainer, this._noPointsComponent, RenderPosition.AFTER_BEGIN);
  }

  _renderSinglePoint(pointContainer, tripEvent) {
    const point = new PointPresenter(pointContainer, this._handleViewAction, this._handleModeChange);
    point.init(tripEvent, this._destinations, this._tripOffers);
    this._pointStorage[tripEvent.id] = point;
  }

  _renderChainPoints(sortedTripEvents) {
    const groupedEvents = groupEvents(this._currenSortType, sortedTripEvents);

    Object.keys(groupedEvents).forEach((shortDay, groupIndex) => {
      const groupedDate = convertToNullableDate(shortDay);
      const dayId = groupIndex + 1;
      const eventDayComponent = new EventDayView(dayId, groupedDate);
      this._dayStorage[dayId] = eventDayComponent;
      render(this._tripEventsContainer, eventDayComponent, RenderPosition.BEFORE_END);

      groupedEvents[shortDay].forEach((tripEvent) => {
        const pointContainer = eventDayComponent.getPointContainer();
        this._renderSinglePoint(pointContainer, tripEvent);
      });
    });
  }

  _clearChainPoints() {
    this._pointStorage = Object.create(null);

    Object
      .values(this._dayStorage)
      .forEach((day) => remove(day));

    this._dayStorage = Object.create(null);
  }

  _renderTripBoard() {
    if (this._getPoints().length === 0) {
      this._renderNoPoints();
      return;
    }

    this._renderSort();
    this._renderChainPoints(this._getPoints());
  }

  _clearTripBoard({resetSortType} = {}) {
    if (resetSortType) {
      this._currenSortType = DefaultValues.SORT_TYPE;
    }

    this._pointNewPresenter.destroy();
    this._clearChainPoints();
    remove(this._noPointsComponent);
    remove(this._eventSorterComponent);
  }
}
