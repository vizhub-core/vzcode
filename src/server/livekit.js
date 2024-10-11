export const createToken = async () => {
  // If this room doesn't exist, it'll be automatically created when the first
  // client joins
  const roomName = 'room';
  // Identifier to be used for participant.
  // It's available as LocalParticipant.identity with livekit-client SDK
  const participantName = 'user';

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: participantName,
      // Token to expire after 10 minutes
      ttl: '10m',
    },
  );
  at.addGrant({ roomJoin: true, room: roomName });

  return await at.toJwt();
};
