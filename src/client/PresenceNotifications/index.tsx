import { useState, useEffect, useRef } from 'react';
import './style.scss';

type PresenceId = string;

// A presence notification is a message that is displayed when a user joins or leaves a session.
// It has the following properties:
// - `user` is the username of the user who joined or left the session.
// - `join` is a boolean value that indicates whether the user joined or left the session.
//   - `true` means user has joined the session.
//   - `false` means user has left the session.
type PresenceNotification = {
  user: string;
  join: boolean;
  presenceId: PresenceId;
};

export const PresenceNotifications = ({
  docPresence,
}: {
  docPresence?: any;
}) => {
  // Keep track of the presence notifications that are displayed
  const [presenceNotifications, setPresenceNotifications] = useState<Array<PresenceNotification>>([]);

  // Keep track of the presence IDs that have already joined the session
  const alreadyJoinedPresenceIds = useRef<Set<PresenceId>>(new Set());

  useEffect(() => {
    if (docPresence) {
      // See https://share.github.io/sharedb/presence
      docPresence.on('receive', (presenceId, update) => {
        // Reason for notifications appearing on every cursor movement:
        //  code doesn't check if a notification about a user joining was previously sent

        // Attempted solutions:
        //  - create an array called presenceIds that keeps track of the presences that join and leave
        //      - if presenceId is in presenceIds: local user was already alerted that a remote user joined
        //      - if presenceId is not in presenceIds: local user needs to be notified about a new user
        //      - problems:
        //          - the array is always empty inside useEffect (array works outside of useEffect)
        //              - causes check to fail
        //  - check docPresence.remotePresences, which keeps track of all the remote presences on the doc
        //      - see https://share.github.io/sharedb/api/presence
        //      - if presenceId is in docPresence.remotePresences: local user was already alerted that a remote user joined
        //      - if presenceId is not in docPresence.remotePresences: local user needs to be notified about a new user
        //      - problems:
        //          - useEffects is called when docPresence changes (in some cases, it's when the remote presence changes)
        //          - remotePresences already has the remote presence in the array, so check fails
        //      - could add another property to presence (true: already notified, false: need to be notified)
        //          - doesn't seem like an ideal solution

        // TODO figure out how to get username from `presenceId`.
        const user = 'someone';

        // `true` means user has joined the session.
        // `false` means user has left the session.
        const join = update !== null;

        if (join) {
          // Figure out if we have ever seen this user before.
          if (!alreadyJoinedPresenceIds.current.has(presenceId)) {
            alreadyJoinedPresenceIds.current.add(presenceId);
            setPresenceNotifications((prev) => [
              ...prev,
              { user, join, presenceId },
            ]);
          }
        } else if (!join) {
          alreadyJoinedPresenceIds.current.delete(presenceId);
          setPresenceNotifications((prev) => [
            ...prev,
            { user, join, presenceId },
          ]);
        }
        
        // Remove the notification after 5 seconds.
        setTimeout(() => {
          // setPresenceNotifications((prev) =>
          //   prev.filter(
          //     (notification) =>
          //       notification.presenceId !== presenceId &&
          //       notification.join !== join,
          //   ),
          // );
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
