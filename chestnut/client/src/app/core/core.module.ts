import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { reducers } from '../reducers';
import { ModelsEffects } from '../models/effects/models.effects';
import { ModelDataEffects } from '../models/effects/model-data.effects';
import { AppComponent } from './containers/app.component';
import { NotFoundPageComponent } from './containers/not-found-page.component';
import { ModelsListComponent } from '../models/components/models-list/models-list.component';
import { ModelCollectionPageComponent } from '../models/containers/models-collection/models-collection-page.component';
import { ModelviewPageComponent } from '../models/containers/model-view/model-view-page.component';
import { ModelDataViewPageComponent } from '../models/containers/model-data-view/model-data-view-page.component';
import { ModelViewComponent } from '../models/components/model-view/model-view.component';
import { ModelDataViewComponent } from '../models/components/model-data-view/model-data-view.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatSidenavModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
} from '@angular/material';
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: ModelCollectionPageComponent }]),
        // StoreModule.forFeature('reducers', reducers),
        EffectsModule.forFeature([ModelsEffects, ModelDataEffects]),
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatToolbarModule,
        MatIconModule,
        MatMenuModule,
        MatListModule,
        MatSidenavModule,
        MatSelectModule,
        MatTableModule,
        MatSortModule,
    ],
    exports: [AppComponent, NotFoundPageComponent],
    declarations: [
        AppComponent,
        NotFoundPageComponent,
        ModelCollectionPageComponent,
        ModelsListComponent,
        ModelviewPageComponent,
        ModelViewComponent,
        ModelDataViewPageComponent,
        ModelDataViewComponent,
    ],
})
export class CoreModule {
    static forRoot() {
        return { ngModule: CoreModule };
    }
}
