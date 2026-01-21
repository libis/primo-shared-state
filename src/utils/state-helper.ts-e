import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

/**
 * Helper class for reading and writing to NgRx store
 * Provides type-safe methods for interacting with the shared state
 */
export class StateHelper {
  constructor(private store: Store) {}

  /**
   * Select data from the store using a selector
   * @param selector - NgRx selector function
   * @returns Observable of the selected state
   */
  select$<T>(selector: any): Observable<T> {
    return this.store.select(selector);
  }

  /**
   * Get a snapshot of the current state value (one-time read)
   * @param selector - NgRx selector function
   * @returns Promise resolving to the current state value
   */
  async selectOnce<T>(selector: any): Promise<T> {
    return this.store.select(selector).pipe(take(1)).toPromise() as Promise<T>;
  }

  /**
   * Dispatch an action to update the store
   * @param action - NgRx action to dispatch
   */
  dispatch(action: any): void {
    this.store.dispatch(action);
  }

  /**
   * Dispatch multiple actions in sequence
   * @param actions - Array of NgRx actions to dispatch
   */
  dispatchAll(actions: any[]): void {
    actions.forEach(action => this.store.dispatch(action));
  }
}

/**
 * Create a StateHelper instance
 * @param store - NgRx Store instance
 * @returns StateHelper instance
 */
export function createStateHelper(store: Store): StateHelper {
  return new StateHelper(store);
}
