import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Notification } from '../Notification';
import { OperatorFunction } from '../types';

/**
 * Converts an Observable of {@link Notification} objects into the emissions
 * that they represent.
 *
 * <span class="informal">Unwraps {@link Notification} objects as actual `next`,
 * `error` and `complete` emissions. The opposite of {@link materialize}.</span>
 *
 * ![](dematerialize.png)
 *
 * `dematerialize` is assumed to operate an Observable that only emits
 * {@link Notification} objects as `next` emissions, and does not emit any
 * `error`. Such Observable is the output of a `materialize` operation. Those
 * notifications are then unwrapped using the metadata they contain, and emitted
 * as `next`, `error`, and `complete` on the output Observable.
 *
 * Use this operator in conjunction with {@link materialize}.
 *
 * ## Example
 * Convert an Observable of Notifications to an actual Observable
 * ```javascript
 * const notifA = new Notification('N', 'A');
 * const notifB = new Notification('N', 'B');
 * const notifE = new Notification('E', undefined,
 *   new TypeError('x.toUpperCase is not a function')
 * );
 * const materialized = of(notifA, notifB, notifE);
 * const upperCase = materialized.pipe(dematerialize());
 * upperCase.subscribe(x => console.log(x), e => console.error(e));
 *
 * // Results in:
 * // A
 * // B
 * // TypeError: x.toUpperCase is not a function
 * ```
 *
 * @see {@link Notification}
 * @see {@link materialize}
 *
 * @return {Observable} An Observable that emits items and notifications
 * embedded in Notification objects emitted by the source Observable.
 * @method dematerialize
 * @owner Observable
 */
export function dematerialize<T>(): OperatorFunction<Notification<T>, T> {
  return function dematerializeOperatorFunction(source: Observable<Notification<T>>) {
    return source.lift(new DeMaterializeOperator());
  };
}

class DeMaterializeOperator<T extends Notification<any>, R> implements Operator<T, R> {
  call(subscriber: Subscriber<any>, source: any): any {
    return source.subscribe(new DeMaterializeSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DeMaterializeSubscriber<T extends Notification<any>> extends Subscriber<T> {
  constructor(destination: Subscriber<any>) {
    super(destination);
  }

  protected _next(value: T) {
    value.observe(this.destination);
  }
}
