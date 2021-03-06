import TripSummaryView from '../view/trip-summary.js';
import TripPathView from '../view/trip-path.js';
import TripCostView from '../view/trip-cost.js';
import {render, replace, remove} from '../utils/render.js';
import {RenderPosition, ModelType} from '../const.js';

export default class Summary {
  constructor(summaryContainer, modelStore) {
    this._summaryContainer = summaryContainer;
    this._pointsModel = modelStore.get(ModelType.POINTS);

    this._summaryComponent = null;

    this._modelEventHandler = this._modelEventHandler.bind(this);

    this._pointsModel.addObserver(this._modelEventHandler);
  }

  init() {
    const prevSummaryComponent = this._summaryComponent;
    this._summaryComponent = new TripSummaryView();

    const points = this._pointsModel.getItems();
    render(this._summaryComponent, new TripPathView(points), RenderPosition.BEFORE_END);
    render(this._summaryComponent, new TripCostView(points), RenderPosition.BEFORE_END);

    if (prevSummaryComponent === null) {
      render(this._summaryContainer, this._summaryComponent, RenderPosition.AFTER_BEGIN);
      return;
    }

    replace(this._summaryComponent, prevSummaryComponent);
    remove(prevSummaryComponent);
  }

  _modelEventHandler() {
    this.init();
  }
}
