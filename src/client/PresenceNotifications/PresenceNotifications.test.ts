import { describe, expect, it } from 'vitest';
import {
  extractTimestampFromId,
  shouldShowNotification,
  handleJoin,
  handleLeave,
} from '.';

describe('extractTimestampFromId', () => {
  it('Extracts a timestamp from a given ID', () => {
    const id = 'abcd-xyz';
    const timestamp = extractTimestampFromId(id);
    expect(timestamp).toBe(parseInt('abcd', 36));
  });
});

describe('shouldShowNotification', () => {
  it('Returns true if remote presence timestamp is greater than local', () => {
    const remoteId = 'abcd-xyz';
    const localId = 'aaa-xyz';
    const result = shouldShowNotification(
      remoteId,
      localId,
    );
    expect(result).toBe(true);
  });

  it('Returns false if remote presence timestamp is not greater than local', () => {
    const remoteId = 'aaa-xyz';
    const localId = 'abcd-xyz';
    const result = shouldShowNotification(
      remoteId,
      localId,
    );
    expect(result).toBe(false);
  });
});

describe('handleJoin', () => {
  it('Adds a new user if not already present', () => {
    const presenceId = 'abcd-xyz';
    const username = 'John';
    const alreadyJoined = { current: new Map() };
    let notifications = [];
    const setNotifications = (updater) => {
      notifications = updater(notifications);
    };

    handleJoin(
      presenceId,
      username,
      alreadyJoined,
      setNotifications,
    );

    expect(notifications.length).toBe(1);
    expect(notifications[0].user).toBe(username);
    expect(notifications[0].join).toBe(true);
    expect(alreadyJoined.current.has(presenceId)).toBe(
      true,
    );
  });

  it('Updates username if user already present', () => {
    const presenceId = 'abcd-xyz';
    const username = 'John';
    const alreadyJoined = {
      current: new Map([[presenceId, 'Doe']]),
    };
    let notifications = [];
    const setNotifications = (updater) => {
      notifications = updater(notifications);
    };

    handleJoin(
      presenceId,
      username,
      alreadyJoined,
      setNotifications,
    );

    expect(notifications.length).toBe(0);
    expect(alreadyJoined.current.get(presenceId)).toBe(
      username,
    );
  });
});

describe('handleLeave', () => {
  it('Removes an existing user', () => {
    const presenceId = 'abcd-xyz';
    const username = 'John';
    const alreadyJoined = {
      current: new Map([[presenceId, username]]),
    };
    let notifications = [];
    const setNotifications = (updater) => {
      notifications = updater(notifications);
    };

    handleLeave(
      presenceId,
      alreadyJoined,
      setNotifications,
    );

    expect(notifications.length).toBe(1);
    expect(notifications[0].user).toBe(username);
    expect(notifications[0].join).toBe(false);
    expect(alreadyJoined.current.has(presenceId)).toBe(
      false,
    );
  });

  it('Does nothing if user not present', () => {
    const presenceId = 'abcd-xyz';
    const alreadyJoined = { current: new Map() };
    let notifications = [];
    const setNotifications = (updater) => {
      notifications = updater(notifications);
    };

    handleLeave(
      presenceId,
      alreadyJoined,
      setNotifications,
    );

    expect(notifications.length).toBe(0);
    expect(alreadyJoined.current.has(presenceId)).toBe(
      false,
    );
  });
});
