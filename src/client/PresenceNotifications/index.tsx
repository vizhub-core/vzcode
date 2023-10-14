import { useState, useEffect } from 'react';
import './style.scss';

// A presence notification is a message that is displayed when a user joins or leaves a session.
// It has the following properties:
// - `user` is the username of the user who joined or left the session.
// - `join` is a boolean value that indicates whether the user joined or left the session.
//   - `true` means user has joined the session.
//   - `false` means user has left the session.
type PresenceNotification = {
  user: string;
  join: boolean;
  presenceId: string;
};

export const PresenceNotifications = ({
  docPresence,
}: {
  docPresence?: any;
}) => {
  const [presenceNotifications, setPresenceNotifications] =
    useState<Array<PresenceNotification>>([]);
  
  const [presenceIds, setPresenceIds] = useState<Array<String>>([]);

  // // console.log('docPresence:', docPresence);
  // const [visible, setVisible] = useState(true);
  // const [user, setUser] = useState('');

  // // `true` means user has joined the session.
  // // `false` means user has left the session.
  // const [join, setJoin] = useState<boolean>(true);

  useEffect(() => {
    // console.log('useEffect triggered.');
    if (docPresence) {
      // See https://share.github.io/sharedb/presence
      docPresence.on('receive', (presenceId, update) => {
        // TODO figure out how to get username from `presenceId`.
        const user = 'someone';

        // `true` means user has joined the session.
        // `false` means user has left the session.
        const join = update !== null;

        // Check if user already joined (presenceId is in presenceIds array)
        // If user hasn't joined, add notification and presenceId to array.
        // Else if user is leaving, add notification and remove presenceId from array

        if (join && !presenceIds.includes(presenceId)){
          setPresenceNotifications((prev) => [
            ...prev,
            { user, join, presenceId },
          ]);
          setPresenceIds((prev) => [
            ...prev,
            presenceId,
          ]);
        }
        else if (!join){
          setPresenceNotifications((prev) => [
            ...prev,
            { user, join, presenceId },
          ]);
          setPresenceIds((prev) =>
            prev.filter(
              (id) =>
                id !== presenceId,
            ),
          );
        }



        // Remove it after 5 seconds.
        setTimeout(() => {
          setPresenceNotifications((prev) =>
            prev.filter(
              (notification) =>
                notification.presenceId !== presenceId,
            ),
          );
        }, 5000);
      });

      // console.log('inside if of useEffect.');
      // docPresence.on('receive', (presence) => {
      //   console.log('presence', presence);

      // // Add an entry to the presence notifications array.
      // setPresenceNotifications((prev) => [
      //   ...prev,
      //   { user: presence.username, join: presence === null },
      // ]);

      // console.log('receive triggered.');
      // if (presence === null) {
      //   setJoin(false);
      // }
      // const { username } = presence;
      // setUser(username);
      // });

      // const timer = setTimeout(() => {
      //   setVisible(false);
      // }, 10000);
    //   return () => {
    //     // clearTimeout(timer);
    //   };
    // } else {
    //   // setVisible(false);
    }
  }, [docPresence]);

  // console.log(
  //   'presenceNotifications',
  //   presenceNotifications,
  // );

  return presenceNotifications.length > 0 ? (
    <div className="vz-notification">
      {presenceNotifications.map((notification) => {
        const { user, join } = notification;
        return (
          <div
            key={notification.presenceId}
            className="vz-notification-item"
          >
            {join
              ? `${user} has joined the session.`
              : `${user} has left the session.`}
          </div>
        );
      })}
    </div>
  ) : null;
  // return null;

  // return (
  //   <Modal
  //     className="vz-notification"
  //     show={visible}
  //     onHide={() => setVisible(false)}
  //     animation={false}
  //   >
  //     <Modal.Body>
  //       {join
  //         ? `${user} has joined the session.`
  //         : `${user} has left the session.`}
  //     </Modal.Body>
  //   </Modal>
  // );
};
