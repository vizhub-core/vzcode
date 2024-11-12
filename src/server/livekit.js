import {
  AccessToken,
  RoomServiceClient,
} from 'livekit-server-sdk';

const { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET } =
  process.env;
const roomService = new RoomServiceClient(
  'wss://testing-idbzy6rb.livekit.cloud',
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
);

export const createToken = async (roomName, username) => {
  // If this room doesn't exist, it'll be automatically created when the first
  // client joins
  // Identifier to be used for participant.
  // It's available as LocalParticipant.identity with livekit-client SDK
  console.log(username);
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

export const createRoom = async () => {
  if (
    (await roomService.listRooms()).find((val) => {
      val.name === 'room';
    })
  ) {
    return false;
  }
  await roomService.createRoom({ name: 'room' });
  return true;
};
