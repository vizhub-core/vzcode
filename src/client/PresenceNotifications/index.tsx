import { useState, useEffect } from 'react';
import { Modal} from '../bootstrap';
import './style.scss';

export const PresenceNotifications = ({
  docPresence
}: {
  docPresence?: any;
}) => {
    // console.log('docPresence:', docPresence);
    const [visible, setVisible] = useState(true);
    const [user, setUser] = useState('');
    const [join, setJoin] = useState(true);

    useEffect(() => {
      // console.log('useEffect triggered.');
      if (docPresence) {
        // console.log('inside if of useEffect.');
        docPresence.on('receive', (presence) => {
          if (presence === null){
            setJoin(false);
          }
          const {username} = presence;
          setUser(username);
        });

        const timer = setTimeout(() => {
          setVisible(false);
        }, 10000);
        return () => {
          clearTimeout(timer);
        };
      } else {
        setVisible(false);
      }
    }, [docPresence]);
    
    

    return (
        <Modal
          className="vz-notification"
          show={visible}
          onHide={() => setVisible(false)}
          animation={false}
        >
          <Modal.Body>
            {join ? `${user} has joined the session.` : `${user} has left the session.`}
          </Modal.Body>
        </Modal>
    );
};
