import { EditorView, keymap } from '@codemirror/view';
import { ShareDBDoc, TabState } from '../../types';
import { VizContent } from '@vizhub/viz-types';

export const AIAssistCodeMirrorKeyMap = ({
  shareDBDoc,
  fileId,
  tabList,
}: {
  shareDBDoc: ShareDBDoc<VizContent>;
  fileId: string;
  tabList: Array<TabState>;
}) =>
  keymap.of([
    {
      key: 'control-m',
      run: (view: EditorView) => {
        // if (
        //   shareDBDoc.data.aiStreams === undefined ||
        //   shareDBDoc.data.aiStreams[mostRecentStreamId] ===
        //     null ||
        //   shareDBDoc.data.aiStreams[mostRecentStreamId]
        //     ?.AIStreamStatus.serverIsRunning !== true
        // ) {

        // TODO handle starting it
        // startAIAssist({
        //   view,
        //   shareDBDoc,
        //   fileId,
        //   tabList,
        // });

        // TODO handle stopping it
        // } else {
        //   haltAIAssist(shareDBDoc);
        // }

        return true;
      },
    },
  ]);
