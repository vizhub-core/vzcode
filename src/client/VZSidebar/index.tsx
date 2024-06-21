import { useCallback, useContext, useMemo } from 'react';
import {
  FileId,
  FileTree,
  FileTreeFile,
} from '../../types';
import { Tooltip, OverlayTrigger } from '../bootstrap';
import { getFileTree } from '../getFileTree';
import { sortFileTree } from '../sortFileTree';
import { SplitPaneResizeContext } from '../SplitPaneResizeContext';
import {
  BugSVG,
  GearSVG,
  NewSVG,
  FileSVG,
  QuestionMarkSVG,
} from '../Icons';
import { VZCodeContext } from '../VZCodeContext';
import { Listing } from './Listing';
import { useDragAndDrop } from './useDragAndDrop';
import './styles.scss';
import type {AriaListBoxProps} from 'react-aria';
import {mergeProps, useFocusRing, useGridList, useGridListItem} from 'react-aria';
import {useListState} from 'react-stately';
import {useRef} from 'react';

import {Item} from 'react-stately';

// TODO turn this UI back on when we are actually detecting
// the connection status.
// See https://github.com/vizhub-core/vzcode/issues/456
const enableConnectionStatus = true;

export const VZSidebar = ({
  createFileTooltipText = 'New File',
  createDirTooltipText = 'New Directory',
  openSettingsTooltipText = 'Open Settings',
  openKeyboardShortcuts = 'Keyboard Shortcuts',
  reportBugTooltipText = 'Report Bug',
}: {
  createFileTooltipText?: string;
  createDirTooltipText?: string;
  openSettingsTooltipText?: string;
  reportBugTooltipText?: string;
  openKeyboardShortcuts?: string;
}) => {
  const {
    files,
    openTab,
    setIsSettingsOpen,
    setIsDocOpen,
    handleOpenCreateFileModal,
    handleOpenCreateDirModal,
    connected,
    sidebarRef,
  } = useContext(VZCodeContext);

  const fileTree = useMemo(
    () => (files ? sortFileTree(getFileTree(files)) : null),
    [files],
  );
  const handleQuestionMarkClick = useCallback(() => {
    setIsDocOpen(true);
  }, []);
  const handleSettingsClick = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const { sidebarWidth } = useContext(
    SplitPaneResizeContext,
  );

  // On single-click, open the file in a transient tab.
  const handleFileClick = useCallback(
    (fileId: FileId) => {
      openTab({ fileId, isTransient: true });
    },
    [openTab],
  );

  // On double-click, open the file in a persistent tab.
  const handleFileDoubleClick = useCallback(
    (fileId: FileId) => {
      openTab({ fileId, isTransient: false });
    },
    [openTab],
  );

  // True if files exist.
  const filesExist =
    fileTree &&
    fileTree.children &&
    fileTree.children.length > 0;

  const {
    isDragOver,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop();

  function List(props) {
    let state = useListState(props);
    let ref = useRef();
    let { gridProps } = useGridList(props, state, ref);
  
    return (
      <ul {...gridProps} ref={ref} className="list">
        {[...state.collection].map((item) => (
          <ListItem key={item.key} item={item} state={state} />
        ))}
      </ul>
    );
  }

  function ListItem({ item, state }) {
    let ref = useRef(null);
    let { rowProps, gridCellProps, isPressed } = useGridListItem(
      { node: item },
      state,
      ref
    );
  
    let { isFocusVisible, focusProps } = useFocusRing();
    let showCheckbox = state.selectionManager.selectionMode !== 'none' &&
      state.selectionManager.selectionBehavior === 'toggle';
  
    return (
      <li
        {...mergeProps(rowProps, focusProps)}
        ref={ref}
        className={`${isPressed ? 'pressed' : ''} ${
          isFocusVisible ? 'focus-visible' : ''
        }`}
      >
        <div {...gridCellProps}>
          {showCheckbox && <ListCheckbox item={item} state={state} />}
          {item.rendered}
        </div>
      </li>
    );
  }

  return (
    <div
      className="vz-sidebar"
      style={{ width: sidebarWidth + 'px' }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="files" ref={sidebarRef} tabIndex={-1}>
        <div className="full-box">
          <div className="sidebar-section-hint">Files</div>
          <div className="sidebar-section-buttons">
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="open-keyboard-shortcuts">
                  {openKeyboardShortcuts}
                </Tooltip>
              }
            >
              <i
                onClick={handleQuestionMarkClick}
                className="icon-button icon-button-dark"
              >
                <QuestionMarkSVG />
              </i>
            </OverlayTrigger>

            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="report-bug-tooltip">
                  {reportBugTooltipText}
                </Tooltip>
              }
            >
              <a
                href="https://github.com/vizhub-core/vzcode/issues/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="icon-button icon-button-dark">
                  <BugSVG />
                </i>
              </a>
            </OverlayTrigger>

            <OverlayTrigger
              placement="left"
              overlay={
                <Tooltip id="open-settings-tooltip">
                  {openSettingsTooltipText}
                </Tooltip>
              }
            >
              <i
                onClick={handleSettingsClick}
                className="icon-button icon-button-dark"
              >
                <GearSVG />
              </i>
            </OverlayTrigger>

            <OverlayTrigger
              placement="left"
              overlay={
                <Tooltip id="create-file-tooltip">
                  {createFileTooltipText}
                </Tooltip>
              }
            >
              <i
                onClick={handleOpenCreateFileModal}
                className="icon-button icon-button-dark"
              >
                <NewSVG />
              </i>
            </OverlayTrigger>

            {/*Directory Rename*/}
            <OverlayTrigger
              placement="left"
              overlay={
                <Tooltip id="create-dir-tooltip">
                  {createDirTooltipText}
                </Tooltip>
              }
            >
              <i
                onClick={handleOpenCreateDirModal}
                className="icon-button icon-button-dark"
              >
                <FileSVG />
              </i>
            </OverlayTrigger>
          </div>
        </div>
        {isDragOver ? (
          <div className="empty">
            <div className="empty-text">
              Drop files here!
            </div>
          </div>
        ) : filesExist ? (

          <List
            aria-label="Example List"
            selectionMode="multiple"
            selectionBehavior="replace"
            onAction={(key) => handleFileDoubleClick(key)}
          >
            {fileTree.children.map((entity) => {
                const { fileId } = entity as FileTreeFile;
                const { path } = entity as FileTree;
                const key = fileId ? fileId : path;
                return (
                  <Item key={key}>
                    <Listing
                      key={key}
                      entity={entity}
                      handleFileClick={handleFileClick}
                      handleFileDoubleClick={
                        handleFileDoubleClick
                      }
                    />

                  </Item>
                );
              })}
          </List>

          /*
          <ListBox label="Alignment" selectionMode="single">
              {fileTree.children.map((entity) => {
                const { fileId } = entity as FileTreeFile;
                const { path } = entity as FileTree;
                const key = fileId ? fileId : path;
                return (
                  <Item key={key}>
                    <Listing
                      key={key}
                      entity={entity}
                      handleFileClick={handleFileClick}
                      handleFileDoubleClick={
                        handleFileDoubleClick
                      }
                    />

                  </Item>
                );
              })}
            </ListBox>
            */
            
          /*
          fileTree.children.map((entity) => {
            const { fileId } = entity as FileTreeFile;
            const { path } = entity as FileTree;
            const key = fileId ? fileId : path;
            return (
              
              <Listing
                key={key}
                entity={entity}
                handleFileClick={handleFileClick}
                handleFileDoubleClick={
                  handleFileDoubleClick
                }
              />
              

            );
          })
            */

        ) : (
          <div className="empty">
            <div className="empty-text">
              It looks like you don't have any files yet!
              Click the "Create file" button above to create
              your first file.
            </div>
          </div>
        )}
      </div>

      {enableConnectionStatus && (
        <div className="connection-status">
          {connected ? 'Connected' : 'Connection Lost'}
          <div className="connection">
            <div
              className={`connection-status-indicator ${
                connected ? 'connected' : 'disconnected'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
