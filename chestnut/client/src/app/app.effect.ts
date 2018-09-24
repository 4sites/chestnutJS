import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { map, filter, withLatestFrom, mergeMap, startWith } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { State } from './app.module';
import { AppConfigService } from '@shared/services/app-config.service';
import { HttpClient } from '@angular/common/http';
import { bindRemoteCall } from '@shared/bind-functions';
import { ModelDescription } from '../../../common/metadata';
import { ApplyMetadataLoadedAction, ApplyMetadataLoadingAction } from '@shared/state/actions';

export interface MetadataDto {
    models: ModelDescription[];
}

@Injectable()
export class AppEffects {
    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private store: Store<State>,
        private appConfig: AppConfigService
    ) { }

    onRootInit$ = this.actions$.pipe(
        withLatestFrom(this.store),
        map(([_, store]) => store),
        filter(x => !x.app.loading && !x.app.loaded));

    @Effect()
    onloadCatalog$ = this.onRootInit$.pipe(
        mergeMap(_ =>
            bindRemoteCall(() => loadCatalog(this.http, this.appConfig)).pipe(
                // map(x => bindDecode(MetadataInDtoRT, jsonDecodeString)(x)),
                map(result => new ApplyMetadataLoadedAction(result)),
                startWith(new ApplyMetadataLoadingAction())
            )
        )
    );
}

const loadCatalog = (http: HttpClient, appConfig: AppConfigService) =>
    http.get<MetadataDto>(appConfig.buildApiUrl('/metadata'));

