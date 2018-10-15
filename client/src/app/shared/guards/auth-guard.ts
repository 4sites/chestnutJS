import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { sharedStateSelectors } from '../state/reducers';
import { map, skip } from 'rxjs/operators';
import { fromFilteredSome } from '@shared/effects-helper';
import { TokenLoginAction } from '@shared/state/actions';
import { getRefreshToken } from '@shared/refresh-token';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private store: Store<any>) { }

    canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.store.dispatch(new TokenLoginAction({ refresh_token: getRefreshToken() }));
        return this.store.select(sharedStateSelectors.isLoggedIn)
            .pipe(
                skip(1),
                fromFilteredSome(),
                map(loggedIn => {
                    if (loggedIn) {
                        return true;
                    }
                    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                    return false;
                }));
    }
}