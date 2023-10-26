import { useState, useEffect, useRef } from 'react';
import './style.scss';

type PresenceId = string;
type Username = string;

// A presence notification is a message that is displayed when a user joins or leaves a session.
// It has the following properties:
// - `user` is the username of the user who joined or left the session.
// - `join` is a boolean value that indicates whether the user joined or left the session.
//   - `true` means user has joined the session.
//   - `false` means user has left the session.
type PresenceNotification = {
  user: Username;
  join: boolean;
  presenceId: PresenceId;
};

export const PresenceNotifications = ({
  docPresence,
  localPresence,
}: {
  docPresence?: any;
  localPresence?: any;
}) => {
  // Keep track of the presence notifications that are displayed
  const [presenceNotifications, setPresenceNotifications] =
    useState<Array<PresenceNotification>>([]);

  // Previous implementation of presence notifications without usernames:
  // const alreadyJoinedPresenceIds = useRef<Set<PresenceId>>(new Set());

  // Keep track of the presence IDs and its respective username that have already joined the session
  // - Switched from Set to Map to keep track of usernames
  //   - PresenceId is the key
  //   - Username is the value
  //   - Username is stored in each remote presence, so we can't use docPresence.remotePresences[presenceId].username
  //     to get the username for when the user leaves the session because the remote presence would have already been removed
  const alreadyJoined = useRef<Map<PresenceId, Username>>(
    new Map(),
  );

  const extractTimestampFromId = (id) => {
    const [timestampPart] = id.split('-');
    return parseInt(timestampPart, 36);
  };

  useEffect(() => {
    if (docPresence) {
      // See https://share.github.io/sharedb/presence
      docPresence.on('receive', (presenceId, update) => {
        console.log('docPresence', docPresence);

        // `true` means user has joined the session.
        // `false` means user has left the session.
        const join = update !== null;

        // Get the timestamps from the presence IDs to see whether the remote presence
        // joined before or after the local presence.
        const remotePresenceTimestamp =
          extractTimestampFromId(presenceId);
        const localPresenceTimestamp =
          extractTimestampFromId(localPresence.presenceId);

        // If the remote presence joined before the local presence, then we don't need to show a notification.
        if (
          remotePresenceTimestamp <= localPresenceTimestamp
        )
          return;

        if (join) {
          // Figure out if we have ever seen this user before.
          // if (!alreadyJoinedPresenceIds.current.has(presenceId)) {
          //   alreadyJoinedPresenceIds.current.add(presenceId);
          //   setPresenceNotifications((prev) => [
          //     ...prev,
          //     { user, join, presenceId },
          //   ]);
          // }

          // Figure out if we have ever seen this user before.
          const user =
            docPresence.remotePresences[presenceId]
              .username;
          if (!alreadyJoined.current.has(presenceId)) {
            alreadyJoined.current.set(presenceId, user);
            setPresenceNotifications((prev) => [
              ...prev,
              { user, join, presenceId },
            ]);
          } else {
            // Update the username in case it changed
            alreadyJoined.current.set(presenceId, user);
          }
        } else if (!join) {
          // alreadyJoinedPresenceIds.current.delete(presenceId);
          // setPresenceNotifications((prev) => [
          //   ...prev,
          //   { user, join, presenceId },
          // ]);
          // user = alreadyJoined.current.get(presenceId);
          const user =
            alreadyJoined.current.get(presenceId);
          alreadyJoined.current.delete(presenceId);
          setPresenceNotifications((prev) => [
            ...prev,
            { user, join, presenceId },
          ]);
        }

        // Remove the notification after 5 seconds.
        setTimeout(() => {
          setPresenceNotifications((prev) =>
            prev.filter(function (_, i) {
              return i !== 0;
            }),
          );
        }, 5000);
      });
    }
  }, [docPresence]);

  return presenceNotifications.length > 0 ? (
    <div className="vz-notification">
      {presenceNotifications.map((notification, i) => {
        const { user, join } = notification;
        return (
          <div key={i} className="vz-notification-item">
            {join
              ? `${user} has joined the session.`
              : `${user} has left the session.`}
          </div>
        );
      })}
    </div>
  ) : null;
};
