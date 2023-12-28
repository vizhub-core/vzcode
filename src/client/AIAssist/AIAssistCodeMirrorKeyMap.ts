import { EditorView, keymap } from '@codemirror/view';
import { ShareDBDoc, VZCodeContent } from '../../types';
import { TabState } from '../vzReducer';
import { startAIAssist } from './startAIAssist';

export const AIAssistCodeMirrorKeyMap = ({
  shareDBDoc,
  fileId,
  tabList,
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistStateRef,
}: {
  shareDBDoc: ShareDBDoc<VZCodeContent>;
  fileId: string;
  tabList: Array<TabState>;
  aiAssistEndpoint: string;
  aiAssistOptions?: {
    [key: string]: any;
  };
  aiAssistStateRef: React.MutableRefObject<AIAssistState>;
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
        startAIAssist({
          view,
          shareDBDoc,
          fileId,
          tabList,
        });
        // TODO handle stopping it
        // } else {
        //   haltAIAssist(shareDBDoc);
        // }

        return true;
      },
    },
  ]);
