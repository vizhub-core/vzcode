import { AccessToken } from 'livekit-server-sdk';


export const createToken = async (roomName, username) => {
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;
  // If this room doesn't exist, it'll be automatically created when the first
  // client joins
  // Identifier to be used for participant.
  // It's available as LocalParticipant.identity with livekit-client SDK
  // console.log(LIVEKIT_API_KEY);
  const participantName = `${username}`;

  const at = new AccessToken(
    LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET,
    {
      identity: participantName,
      // Token to expire after 10 minutes
      ttl: '10m',
    },
  );
  at.addGrant({ roomJoin: true, room: roomName });
  return await at.toJwt();
};
