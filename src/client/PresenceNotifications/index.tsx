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
  const [presenceNotifications, setPresenceNotifications] =
    useState<Array<PresenceNotification>>([]);

  // const [presenceIds, setPresenceIds] = useState<
  //   Array<any>
  // >([]);
  const alreadyJoinedPresenceIds = useRef<Set<PresenceId>>(
    new Set(),
  );

  useEffect(() => {
    // console.log('useEffect triggered.');
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

        // console.log('docPresence:', docPresence);
        // console.log('docPresence remotePresences:', docPresence.remotePresences);
        // console.log('check for presence:', docPresence.remotePresences[presenceId]);

        // TODO figure out how to get username from `presenceId`.
        const user = 'someone';

        // `true` means user has joined the session.
        // `false` means user has left the session.
        const join = update !== null;

        // Figure out if we have ever seen this user before.

        // if (join && docPresence.remotePresences[presenceId] === undefined){
        if (join) {
          if (
            !alreadyJoinedPresenceIds.current.has(
              presenceId,
            )
          ) {
            alreadyJoinedPresenceIds.current.add(
              presenceId,
            );
            setPresenceNotifications((prev) => [
              ...prev,
              { user, join, presenceId },
            ]);

            // Remove it after 5 seconds.
            setTimeout(() => {
              setPresenceNotifications((prev) =>
                prev.filter(
                  (notification) =>
                    notification.presenceId !==
                      presenceId &&
                    notification.join !== join,
                ),
              );
            }, 5000);
          }
        } else if (!join) {
          setPresenceNotifications((prev) => [
            ...prev,
            { user, join, presenceId },
          ]);

          // Remove it after 5 seconds.
          // TODO clean up this duplication.
          setTimeout(() => {
            setPresenceNotifications((prev) =>
              prev.filter(
                (notification) =>
                  notification.presenceId !== presenceId &&
                  notification.join !== join,
              ),
            );
          }, 5000);
        }
      });
    }
  }, [docPresence]);

  // console.log(
  //   'presenceNotifications',
  //   presenceNotifications,
  // );
  // console.log(
  //   'presenceIds',
  //   presenceIds,
  // );

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
