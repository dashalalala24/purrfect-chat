import type { TChat } from '../types/chats';

export const chatsMock: TChat[] = [
  {
    id: '1',
    user: { avatarSrc: '/icons/star.svg', username: 'Beyoncé Giselle Knowles-Carter' },
    unreadMessagesCount: 3,
    messages: [
      { text: 'Heyyyyyyy', dateTime: '14:22', attachments: [], type: 'outgoing' },
      { text: 'Hey! How are you doing?', dateTime: '14:34', attachments: [], type: 'incoming' },
    ],
  },
  {
    id: '2',
    user: { username: 'Ivanov Ivan Ivanovich' },
    messages: [
      {
        text: 'Hey! How are you? I think about going out tonight, are you in? Hey! How are you? I think about going out tonight, are you in? Hey! How are you? I think about going out tonight, are you in? Hey! How are you? I think about going out tonight, are you in? Hey! How are you? I think about going out tonight, are you in? Hey! How are you? I think about going out tonight, are you in? Hey! How are you? I think about going out tonight, are you in?',
        dateTime: 'Monday',
        attachments: [],
        type: 'incoming',
      },
    ],
  },
  {
    id: '3',
    user: { username: 'Gabriel Dolores Garcia Gonzalez' },
    unreadMessagesCount: 22,
    messages: [
      {
        text: 'Hey! How are you? I think about going out tonight, are you in?',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'outgoing',
      },
    ],
  },
  {
    id: '4',
    user: { username: 'Alex' },
    unreadMessagesCount: 1000,
    messages: [
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'incoming',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'outgoing',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'incoming',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'outgoing',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'incoming',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'outgoing',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'incoming',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'outgoing',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'incoming',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'outgoing',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'incoming',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'outgoing',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'incoming',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'outgoing',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'incoming',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'outgoing',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'incoming',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'outgoing',
      },
      {
        text: 'Hey',
        dateTime: '10.05.2025',
        attachments: [],
        type: 'incoming',
      },
    ],
  },
];
