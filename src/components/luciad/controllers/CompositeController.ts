/*
 *
 * Copyright (c) 1999-2022 Luciad All Rights Reserved.
 *
 * Luciad grants you ("Licensee") a non-exclusive, royalty free, license to use,
 * modify and redistribute this software in source and binary code form,
 * provided that i) this copyright notice and license appear on all copies of
 * the software; and ii) Licensee does not utilize the software in a manner
 * which is disparaging to Luciad.
 *
 * This software is provided "AS IS," without a warranty of any kind. ALL
 * EXPRESS OR IMPLIED CONDITIONS, REPRESENTATIONS AND WARRANTIES, INCLUDING ANY
 * IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR
 * NON-INFRINGEMENT, ARE HEREBY EXCLUDED. LUCIAD AND ITS LICENSORS SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE AS A RESULT OF USING, MODIFYING
 * OR DISTRIBUTING THE SOFTWARE OR ITS DERIVATIVES. IN NO EVENT WILL LUCIAD OR ITS
 * LICENSORS BE LIABLE FOR ANY LOST REVENUE, PROFIT OR DATA, OR FOR DIRECT,
 * INDIRECT, SPECIAL, CONSEQUENTIAL, INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER
 * CAUSED AND REGARDLESS OF THE THEORY OF LIABILITY, ARISING OUT OF THE USE OF
 * OR INABILITY TO USE SOFTWARE, EVEN IF LUCIAD HAS BEEN ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGES.
 */
import {Handle} from "@luciad/ria/util/Evented";
import {EventedSupport} from "@luciad/ria/util/EventedSupport";
import {Controller} from "@luciad/ria/view/controller/Controller";
import {EVENT_IGNORED, HandleEventResult, isHandled} from "@luciad/ria/view/controller/HandleEventResult";
import {GestureEvent} from "@luciad/ria/view/input/GestureEvent";
import {KeyEvent} from "@luciad/ria/view/input/KeyEvent";
import {Map} from "@luciad/ria/view/Map";
import {GeoCanvas} from "@luciad/ria/view/style/GeoCanvas";
import {LabelCanvas} from "@luciad/ria/view/style/LabelCanvas";

/**
 * Composes a chain of controllers.
 *
 * Chain different controllers together with {@link #appendController}.
 *
 */
export class CompositeController extends Controller {

  private readonly _delegates: Controller[];
  private readonly _eventSupport: EventedSupport;
  private _invalidationListeners: Handle[];

  constructor() {
    super();
    this._delegates = [];
    this._invalidationListeners = [];
    this._eventSupport = new EventedSupport(["Invalidated"])
  }

  get delegates(): Controller[] {
    return this._delegates;
  }

  onActivate(map: Map): void {
    super.onActivate(map);
    for (const delegate of this._delegates) {
      delegate.onActivate(map);
      this._invalidationListeners.push(delegate.on("Invalidated", () => {
        this._eventSupport.emit("Invalidated");
      }));
    }
  };

  onDeactivate(map: Map): Promise<any> {
    const superPromise = super.onDeactivate(map);
    const delegatePromises = [];
    for (const delegate of this._delegates) {
      delegatePromises.push(delegate.onDeactivate(map));
    }
    for (const invalidationListener of this._invalidationListeners) {
      invalidationListener.remove();
    }
    this._invalidationListeners = [];
    return Promise.all([superPromise].concat(delegatePromises));
  };

  onGestureEvent(gestureEvent: GestureEvent): HandleEventResult {
    let result = EVENT_IGNORED;
    for (const delegate of this._delegates) {
      result = delegate.onGestureEvent(gestureEvent);
      if (isHandled(result)) {
        return result;
      }
    }
    return result;
  };

  onKeyEvent(keyEvent: KeyEvent): HandleEventResult {
    let result = EVENT_IGNORED;
    for (const delegate of this._delegates) {
      result = delegate.onKeyEvent(keyEvent);
      if (isHandled(result)) {
        return result;
      }
    }
    return result;
  };

  onDraw(geocanvas: GeoCanvas): void {
    for (const delegate of this._delegates) {
      delegate.onDraw(geocanvas);
    }
  };

  onDrawLabel(labelCanvas: LabelCanvas): void {
    for (const delegate of this._delegates) {
      delegate.onDrawLabel(labelCanvas);
    }
  };

  appendController(controller: Controller): void {
    if (this.map) {
      throw new Error("Cannot append new controller while current controller is active on the map." +
                      "Remove the controller from map before appending a controller to it.");
    }
    this._delegates.push(controller);
  };

  on(event: "Invalidated" | "Activated" | "Deactivated", callback: (...args: any[]) => void, context?: any): Handle {
    if (event === "Invalidated") {
      return this._eventSupport.on(event, callback);
    } else if (event === "Activated") {
      return super.on(event, callback);
    }
    return super.on(event, callback);
  }
}