import {
    PaneId,
    LeafPane,
    SplitPane,
    Pane,
} from '../../types';

export const splitCurrentPane = ( {
    pane,
    activePaneId,
    orientation,
}: {
    pane: Pane;
    activePaneId: PaneId;
    orientation: 'vertical' | 'horizontal';
}): Pane => {
    if (pane.type === 'leafPane') {
        // convert the leafPane to a splitPane with two leafPane children
        const newPaneId1 = activePaneId + 1;
        const newLeafPane1: Pane = {
            id: newPaneId1,
            type: 'leafPane',
            tabList: pane.tabList,
            activeFileId: pane.activeFileId,
        };
        const newPaneId2 = activePaneId + 2;
        const newLeafPane2: Pane = {
            id: newPaneId2,
            type: 'leafPane',
            tabList: pane.tabList,
            activeFileId: pane.activeFileId,
        };
        const newSplitPane: Pane = {
            id: activePaneId,
            type: 'splitPane',
            orientation: orientation,
            children: [newLeafPane1, newLeafPane2],
        };
        return newSplitPane;
    } 
    else {
        throw new Error('The pane is not a leafPane and cannot be split');
    }

}

