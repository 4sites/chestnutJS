import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModelDescription } from '../../../../../../common/metadata';
@Component({
    selector: 'models-list',
    templateUrl: 'models-list.html',
    styleUrls: ['models-list.scss'],
})
export class ModelsListComponent {
    @Input() models: ModelDescription[];
    @Output() modelNameClicked = new EventEmitter();
    clickModelName(model: ModelDescription) {
        this.modelNameClicked.emit(model);
    }
    constructor() {}
}