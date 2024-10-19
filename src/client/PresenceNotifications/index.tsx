import { useState, useEffect, useRef } from 'react';
import { PresenceId, Username } from '../../types';
import './style.scss';

type PresenceNotification = {
  user: Username;
  join: boolean;
  presenceId: PresenceId;
};

export const extractTimestampFromId = (
  id: string,
): number => {
  const [timestampPart] = id.split('-');
  return parseInt(timestampPart, 36);
};

export const shouldShowNotification = (
  remotePresenceId: PresenceId,
  localPresenceId: PresenceId,
): boolean => {
  const remotePresenceTimestamp = extractTimestampFromId(
    remotePresenceId,
  );
  const localPresenceTimestamp =
    extractTimestampFromId(localPresenceId);
  return remotePresenceTimestamp > localPresenceTimestamp;
};

export const handleJoin = (
  presenceId: PresenceId,
  username: Username,
  alreadyJoined: React.MutableRefObject<
    Map<PresenceId, Username>
  >,
  setPresenceNotifications: any,
) => {
  if (!alreadyJoined.current.has(presenceId)) {
    alreadyJoined.current.set(presenceId, username);
    setPresenceNotifications(
      (prev: PresenceNotification[]) => [
        ...prev,
        { user: username, join: true, presenceId },
      ],
    );
  } else {
    alreadyJoined.current.set(presenceId, username); // Update in case username changed
  }
};

export const handleLeave = (
  presenceId: PresenceId,
  alreadyJoined: React.MutableRefObject<
    Map<PresenceId, Username>
  >,
  setPresenceNotifications: any,
) => {
  const user = alreadyJoined.current.get(presenceId);
  if (user) {
    alreadyJoined.current.delete(presenceId);
    setPresenceNotifications(
      (prev: PresenceNotification[]) => [
        ...prev,
        { user, join: false, presenceId },
      ],
    );
  }
};

export const PresenceNotifications = ({
  docPresence,
  localPresence,
}: {
  docPresence?: any;
  localPresence?: any;
}) => {
  // `presenceNotifications`:
  // - State variable containing a list of user presence notifications.
  // - Each notification indicates if a user has joined or left a session.
  const [presenceNotifications, setPresenceNotifications] =
    useState<PresenceNotification[]>([]);

  // `alreadyJoined`:
  // - Ref (persistent across re-renders) containing a Map.
  // - Map's key: `PresenceId` (unique identifier for user's presence).
  // - Map's value: `Username` of the associated user.
  // - Tracks users who have joined the session and their possible username changes.
  const alreadyJoined = useRef<Map<PresenceId, Username>>(
    new Map(),
  );

  useEffect(() => {
    if (docPresence) {
      const handleReceive = (
        presenceId: PresenceId,
        update: any,
      ) => {
        const join = update !== null;
        if (
          shouldShowNotification(
            presenceId,
            localPresence.presenceId,
          )
        ) {
          if (join) {
            const username =
              docPresence.remotePresences[presenceId]
                ?.username;
            handleJoin(
              presenceId,
              username,
              alreadyJoined,
              setPresenceNotifications,
            );
          } else {
            handleLeave(
              presenceId,
              alreadyJoined,
              setPresenceNotifications,
            );
          }

          const timeoutId = setTimeout(() => {
            setPresenceNotifications((prev) =>
              prev.slice(1),
            );
          }, 5000);

          return () => {
            clearTimeout(timeoutId);
          };
        }
      };

      docPresence.on('receive', handleReceive);
      return () => {
        docPresence.off('receive', handleReceive);
      };
    }
  }, [docPresence, localPresence]);

  return presenceNotifications.length > 0 ? (
    <div className="vz-notification">
      {presenceNotifications.map(
        ({ user, join, presenceId }) => (
          <div
            key={presenceId}
            className="vz-notification-item"
          >
            {join
              ? `${user} has joined the session.`
              : `${user} has left the session.`}
          </div>
        ),
      )}
    </div>
  ) : null;
};
